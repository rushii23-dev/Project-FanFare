// ============================================================
// FanFare — server-side Gemini proxy.
//
// The API key lives ONLY here, in process.env on the server. It is never
// prefixed with VITE_, so Vite cannot inline it into the client bundle and
// it can never be extracted from the deployed site.
//
// Runs as a Vercel serverless function in production (default export) and
// is called directly by a Vite middleware in dev (runAI export) so that
// `npm run dev` behaves identically to production.
// ============================================================

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-2.5-flash'

// The free tier returns transient "model is experiencing high demand" 503s.
// Mid-match that would read as a broken product, so we retry, then step down
// to a lighter model that is far less likely to be saturated.
const FALLBACK_MODEL = 'gemini-2.5-flash-lite'
const RETRYABLE = new Set([429, 500, 502, 503, 504])

// Hard ceiling so a runaway client can't burn the free-tier quota.
const MAX_PROMPT_CHARS = 12000

const sleep = ms => new Promise(r => setTimeout(r, ms))

// Belt and braces: an upstream error message should never contain the key, but
// it is never allowed to reach a browser if it somehow does.
const scrub = (text, key) => (key ? text.split(key).join('***') : text)

export async function runAI({ system, prompt, json = false, temperature = 0.4 }) {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    const err = new Error('GEMINI_API_KEY is not set on the server')
    err.code = 'NO_KEY'
    throw err
  }
  if (typeof prompt !== 'string' || !prompt.trim()) {
    const err = new Error('prompt is required')
    err.code = 'BAD_REQUEST'
    throw err
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    const err = new Error('prompt too large')
    err.code = 'BAD_REQUEST'
    throw err
  }

  const primary = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
      // Gemini 2.5 "thinking" tokens are billed against maxOutputTokens. Left on,
      // they silently eat the budget and the real answer comes back truncated —
      // which corrupts every JSON response. These are short, grounded, latency-
      // sensitive matchday calls; they do not need a reasoning budget.
      thinkingConfig: { thinkingBudget: 0 },
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  }
  if (system) body.systemInstruction = { parts: [{ text: system }] }

  // Try the primary model twice, then step down once. Only transient statuses
  // are retried — a bad key fails immediately rather than stalling the UI.
  const attempts = [
    { model: primary, backoff: 0 },
    { model: primary, backoff: 700 },
    { model: FALLBACK_MODEL, backoff: 300 },
  ]

  let last
  for (const { model, backoff } of attempts) {
    if (backoff) await sleep(backoff)

    const r = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    })

    if (r.ok) {
      const data = await r.json()
      const cand = data?.candidates?.[0]
      const text = cand?.content?.parts?.map(p => p.text).join('') || ''

      // A truncated response is worse than no response: half a JSON object parses
      // as garbage or throws deep in a component. Fail it here and let the retry
      // handle it.
      if (cand?.finishReason === 'MAX_TOKENS') {
        last = Object.assign(new Error('Gemini response was truncated'), { code: 'TRUNCATED' })
        continue
      }
      if (text) return text
      last = Object.assign(new Error('Gemini returned an empty response'), { code: 'EMPTY' })
      continue
    }

    // Surface WHY it failed, but never echo the key back. Gemini reports an
    // invalid key as 400 INVALID_ARGUMENT — not 401 — so without the upstream
    // reason a bad key is indistinguishable from a malformed request, which
    // makes a misconfigured deployment almost impossible to diagnose.
    const detail = await r.json().catch(() => null)
    const reason = detail?.error?.message || ''
    const badKey = r.status === 401 || r.status === 403 || /api key/i.test(reason)

    last = Object.assign(new Error(`Gemini request failed (${r.status})${reason ? `: ${scrub(reason, key)}` : ''}`), {
      code: r.status === 429 ? 'RATE_LIMIT' : badKey ? 'AUTH' : 'UPSTREAM',
    })
    if (!RETRYABLE.has(r.status)) throw last
  }
  throw last
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

// Per-IP sliding-window rate limit. In-memory, so it is per warm lambda
// instance, not global — Vercel KV would make it exact, but even per-instance
// it stops the cheap attack (one client hammering /api/ai to drain the Gemini
// quota), and legitimate matchday usage never comes close to the ceiling.
const RATE_LIMIT = 20        // requests
const RATE_WINDOW_MS = 60000 // per minute, per IP
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const windowStart = now - RATE_WINDOW_MS
  const times = (hits.get(ip) || []).filter(t => t > windowStart)
  if (times.length >= RATE_LIMIT) { hits.set(ip, times); return true }
  times.push(now)
  hits.set(ip, times)
  // Cap the map so a rotating-IP flood can't grow memory unbounded.
  if (hits.size > 5000) hits.clear()
  return false
}

export default async function handler(req, res) {
  // GET is a health probe so the UI can show an honest "AI offline" state
  // instead of pretending the assistant works.
  if (req.method === 'GET') {
    res.status(200).json({ configured: Boolean(process.env.GEMINI_API_KEY) })
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMIT' })
    return
  }

  try {
    const { system, prompt, json, temperature } = await readJsonBody(req)
    const text = await runAI({ system, prompt, json, temperature })
    res.status(200).json({ text })
  } catch (e) {
    const status = e.code === 'NO_KEY' ? 503
      : e.code === 'BAD_REQUEST' ? 400
        : e.code === 'RATE_LIMIT' ? 429
          : 502
    res.status(status).json({ error: e.message, code: e.code || 'ERROR' })
  }
}
