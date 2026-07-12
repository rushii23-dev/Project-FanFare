import { useEffect, useState } from 'react'

// ============================================================
// FanFare — Generative AI client.
//
// The browser never holds the API key. Every call goes to our own /api/ai
// endpoint, which is a serverless function that talks to Gemini server-side.
//
// Same contract as freeApis.js: nothing here throws into the UI. Callers get
// a clear failure they can fall back from, so the dashboards keep working
// offline or without a key.
// ============================================================

export class AIError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

async function post(payload) {
  let r
  try {
    r = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new AIError('Cannot reach the assistant', 'OFFLINE')
  }
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new AIError(data.error || 'Assistant unavailable', data.code || 'ERROR')
  return data.text || ''
}

/** Free-text generation. Returns a string. */
export function askAI({ system, prompt, temperature = 0.4 }) {
  return post({ system, prompt, temperature })
}

/**
 * Structured generation. Gemini is put in JSON mode, so the response parses
 * cleanly — but we still guard, because a malformed parse must not white-screen
 * a dashboard mid-match.
 */
export async function askAIJson({ system, prompt, temperature = 0.3 }) {
  const raw = await post({ system, prompt, json: true, temperature })
  try {
    return JSON.parse(raw)
  } catch {
    throw new AIError('Assistant returned malformed data', 'PARSE')
  }
}

/**
 * Is a key actually configured on the server? Lets the UI say "AI offline"
 * honestly rather than silently degrading to canned text and passing it off
 * as generated.
 */
export function useAIStatus() {
  const [status, setStatus] = useState({ checking: true, configured: false })
  useEffect(() => {
    let alive = true
    fetch('/api/ai')
      .then(r => r.json())
      .then(j => { if (alive) setStatus({ checking: false, configured: Boolean(j.configured) }) })
      .catch(() => { if (alive) setStatus({ checking: false, configured: false }) })
    return () => { alive = false }
  }, [])
  return status
}

/** Human-readable reason, for the small "assistant unavailable" note in chat UIs. */
export function aiErrorMessage(e) {
  switch (e?.code) {
    case 'NO_KEY': return 'The assistant is not configured on this deployment (no API key).'
    case 'AUTH': return 'The assistant key was rejected. Check GEMINI_API_KEY.'
    case 'RATE_LIMIT': return 'The assistant is rate-limited right now. Try again in a moment.'
    case 'OFFLINE': return "Can't reach the assistant — check your connection."
    case 'PARSE': return 'The assistant returned something unreadable. Try again.'
    default: return 'The assistant is temporarily unavailable.'
  }
}
