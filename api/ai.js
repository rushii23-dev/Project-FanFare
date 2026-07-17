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

// Hard ceilings so a runaway client can't burn the free-tier quota or the
// lambda's memory. The system block is ours (venue facts + instructions) and
// is smaller than the user prompt by design.
const MAX_PROMPT_CHARS = 12000
const MAX_SYSTEM_CHARS = 8000
const MAX_BODY_BYTES = 64 * 1024

/** @param {number} ms */
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Belt and braces: an upstream error message should never contain the key, but
// it is never allowed to reach a browser if it somehow does.
/** @param {string} text @param {string | undefined} key */
const scrub = (text, key) => (key ? text.split(key).join('***') : text)

/** @typedef {Error & { code?: string }} CodedError */
/** @param {string} message @param {string} code @returns {CodedError} */
const codedError = (message, code) => Object.assign(new Error(message), { code })

/**
 * Everything in the request is client-controlled and therefore untrusted.
 * Throws BAD_REQUEST on anything out of contract; returns the vetted values.
 * @param {unknown} prompt @param {unknown} system @param {unknown} temperature
 * @returns {{ prompt: string, system: string | null, temp: number }}
 */
function validateRequest(prompt, system, temperature) {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw codedError('prompt is required', 'BAD_REQUEST')
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    throw codedError('prompt too large', 'BAD_REQUEST')
  }
  if (system != null && (typeof system !== 'string' || system.length > MAX_SYSTEM_CHARS)) {
    throw codedError('system block invalid or too large', 'BAD_REQUEST')
  }

  // Client-supplied sampling settings are suggestions, not commands: anything
  // non-numeric or out of Gemini's [0, 2] range is clamped, never forwarded.
  const temp = Number.isFinite(Number(temperature))
    ? Math.min(2, Math.max(0, Number(temperature)))
    : 0.4

  return { prompt, system: system || null, temp }
}

/**
 * The exact request body Gemini gets — one place, so the token budget and
 * thinking policy cannot drift between the primary and fallback attempts.
 * @param {{ prompt: string, system: string | null, temp: number }} vetted
 * @param {unknown} json
 */
function buildBody({ prompt, system, temp }, json) {
  return {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: temp,
      maxOutputTokens: 2048,
      // Gemini 2.5 "thinking" tokens are billed against maxOutputTokens. Left on,
      // they silently eat the budget and the real answer comes back truncated —
      // which corrupts every JSON response. These are short, grounded, latency-
      // sensitive matchday calls; they do not need a reasoning budget.
      thinkingConfig: { thinkingBudget: 0 },
      ...(json === true || json === 'true' ? { responseMimeType: 'application/json' } : {}),
    },
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
  }
}

/**
 * @param {{ system?: unknown, prompt?: unknown, json?: unknown, temperature?: unknown }} req
 */
export async function runAI({ system, prompt, json = false, temperature = 0.4 }) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw codedError('GEMINI_API_KEY is not set on the server', 'NO_KEY')
  const body = buildBody(validateRequest(prompt, system, temperature), json)
  const primary = process.env.GEMINI_MODEL || DEFAULT_MODEL

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
      const text = cand?.content?.parts?.map((/** @type {{ text?: string }} */ p) => p.text).join('') || ''

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

/**
 * Minimal shape of the Vercel/Node request-response pair this handler touches —
 * kept local so the dev middleware and the test harness can pass plain objects.
 * @typedef {AsyncIterable<Buffer> & { method?: string, body?: unknown, headers: Record<string, string | string[] | undefined> }} ApiRequest
 * @typedef {{ status: (code: number) => { json: (body: unknown) => void }, setHeader?: (name: string, value: string) => void }} ApiResponse
 */

/** @param {ApiRequest} req @returns {Promise<Record<string, unknown>>} */
async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return /** @type {Record<string, unknown>} */ (req.body)
  }
  /** @type {Buffer[]} */
  const chunks = []
  let bytes = 0
  for await (const c of req) {
    bytes += c.length
    // Stop reading the moment the body exceeds the cap — buffering an
    // arbitrarily large upload is a memory DoS, prompt limits or not.
    if (bytes > MAX_BODY_BYTES) {
      throw codedError('request body too large', 'BAD_REQUEST')
    }
    chunks.push(c)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    // A malformed body is the caller's error (400), not an upstream 502.
    throw codedError('request body is not valid JSON', 'BAD_REQUEST')
  }
}

// Per-IP sliding-window rate limit. In-memory, so it is per warm lambda
// instance, not global — Vercel KV would make it exact, but even per-instance
// it stops the cheap attack (one client hammering /api/ai to drain the Gemini
// quota), and legitimate matchday usage never comes close to the ceiling.
const RATE_LIMIT = 20        // requests
const RATE_WINDOW_MS = 60000 // per minute, per IP
const MAX_TRACKED_IPS = 5000 // memory bound under a rotating-IP flood
/** @type {Map<string, number[]>} */
const hits = new Map()

/** @param {string} ip */
function rateLimited(ip) {
  const now = Date.now()
  const windowStart = now - RATE_WINDOW_MS
  const times = (hits.get(ip) || []).filter(t => t > windowStart)
  if (times.length >= RATE_LIMIT) { hits.set(ip, times); return true }
  times.push(now)
  hits.set(ip, times)

  // Bound the map without ever unblocking anyone: first drop IPs whose window
  // has fully expired, then — if a flood is still holding the map over the
  // cap — evict the oldest UNDER-limit entries. An IP that is currently rate
  // limited is never evicted, so a rotating-IP flood cannot reset it.
  if (hits.size > MAX_TRACKED_IPS) {
    for (const [k, v] of hits) {
      if (k === ip) continue
      const fresh = v.filter(t => t > windowStart)
      if (fresh.length === 0) hits.delete(k)
      else hits.set(k, fresh)
    }
    for (const [k, v] of hits) {
      if (hits.size <= MAX_TRACKED_IPS) break
      if (k !== ip && v.length < RATE_LIMIT) hits.delete(k)
    }
  }
  return false
}

/** @param {ApiRequest} req @param {ApiResponse} res */
export default async function handler(req, res) {
  // Generated answers are per-request and may embed per-fan context — no
  // intermediary may cache them. (Optional call: the dev middleware and the
  // test harness pass a minimal res.)
  res.setHeader?.('Cache-Control', 'no-store')

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

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMIT' })
    return
  }

  try {
    const { system, prompt, json, temperature } = await readJsonBody(req)
    const text = await runAI({ system, prompt, json, temperature })
    res.status(200).json({ text })
  } catch (e) {
    const err = /** @type {CodedError} */ (e)
    const status = err.code === 'NO_KEY' ? 503
      : err.code === 'BAD_REQUEST' ? 400
        : err.code === 'RATE_LIMIT' ? 429
          : 502
    res.status(status).json({ error: err.message, code: err.code || 'ERROR' })
  }
}
