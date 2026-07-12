import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import handler, { runAI } from '../api/ai.js'

// ---- helpers ----------------------------------------------------------

const FAKE_KEY = 'AQ.test-key-abc123'

function geminiOk(text, finishReason = 'STOP') {
  return {
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] }, finishReason }] }),
  }
}

function geminiFail(status, message = 'boom') {
  return { ok: false, status, json: async () => ({ error: { message } }) }
}

function makeRes() {
  const res = { statusCode: null, body: null }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (payload) => { res.body = payload; return res }
  return res
}

const post = (ip, body = { prompt: 'hi' }) => ({
  method: 'POST',
  headers: { 'x-forwarded-for': ip },
  body,
})

beforeEach(() => {
  process.env.GEMINI_API_KEY = FAKE_KEY
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  delete process.env.GEMINI_API_KEY
  vi.unstubAllGlobals()
})

// ---- runAI ------------------------------------------------------------

describe('runAI — input contract', () => {
  it('fails fast with NO_KEY when the server has no key', async () => {
    delete process.env.GEMINI_API_KEY
    await expect(runAI({ prompt: 'hi' })).rejects.toMatchObject({ code: 'NO_KEY' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects an empty prompt without calling Gemini', async () => {
    await expect(runAI({ prompt: '   ' })).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects an oversized prompt so a runaway client cannot burn quota', async () => {
    await expect(runAI({ prompt: 'x'.repeat(12001) })).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('runAI — happy path', () => {
  it('returns the generated text', async () => {
    fetch.mockResolvedValueOnce(geminiOk('hello fan'))
    await expect(runAI({ prompt: 'hi' })).resolves.toBe('hello fan')
  })

  it('sends the key in a header, never in the URL', async () => {
    fetch.mockResolvedValueOnce(geminiOk('ok'))
    await runAI({ prompt: 'hi' })
    const [url, opts] = fetch.mock.calls[0]
    expect(url).not.toContain(FAKE_KEY)
    expect(opts.headers['x-goog-api-key']).toBe(FAKE_KEY)
  })

  it('disables the Gemini thinking budget so JSON is never silently truncated', async () => {
    fetch.mockResolvedValueOnce(geminiOk('{}'))
    await runAI({ prompt: 'hi', json: true })
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.generationConfig.thinkingConfig.thinkingBudget).toBe(0)
    expect(body.generationConfig.responseMimeType).toBe('application/json')
  })
})

describe('runAI — failure ladder', () => {
  it('retries a transient 503 and then succeeds', async () => {
    fetch
      .mockResolvedValueOnce(geminiFail(503, 'high demand'))
      .mockResolvedValueOnce(geminiOk('recovered'))
    await expect(runAI({ prompt: 'hi' })).resolves.toBe('recovered')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('steps down to the fallback model after the primary fails twice', async () => {
    fetch
      .mockResolvedValueOnce(geminiFail(503))
      .mockResolvedValueOnce(geminiFail(503))
      .mockResolvedValueOnce(geminiOk('from-lite'))
    await expect(runAI({ prompt: 'hi' })).resolves.toBe('from-lite')
    expect(fetch.mock.calls[2][0]).toContain('gemini-2.5-flash-lite')
  })

  it('treats a truncated (MAX_TOKENS) response as a failure, not an answer', async () => {
    fetch
      .mockResolvedValueOnce(geminiOk('half a JSON obj', 'MAX_TOKENS'))
      .mockResolvedValueOnce(geminiOk('whole answer'))
    await expect(runAI({ prompt: 'hi' })).resolves.toBe('whole answer')
  })

  it('maps an invalid-key 400 to AUTH immediately, with no retry', async () => {
    fetch.mockResolvedValueOnce(geminiFail(400, 'API key not valid. Please pass a valid API key.'))
    await expect(runAI({ prompt: 'hi' })).rejects.toMatchObject({ code: 'AUTH' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('NEVER echoes the API key back in an error message', async () => {
    fetch.mockResolvedValueOnce(geminiFail(400, `key ${FAKE_KEY} rejected, check your api key`))
    await expect(runAI({ prompt: 'hi' })).rejects.toSatisfy(
      e => !e.message.includes(FAKE_KEY) && e.message.includes('***'),
    )
  })

  it('surfaces a 429 as RATE_LIMIT', async () => {
    fetch.mockResolvedValue(geminiFail(429, 'quota'))
    await expect(runAI({ prompt: 'hi' })).rejects.toMatchObject({ code: 'RATE_LIMIT' })
  }, 10000)
})

// ---- HTTP handler -----------------------------------------------------

describe('handler — HTTP contract', () => {
  it('GET is an honest health probe', async () => {
    const res = makeRes()
    await handler({ method: 'GET', headers: {} }, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ configured: true })
  })

  it('GET reports unconfigured when the key is missing', async () => {
    delete process.env.GEMINI_API_KEY
    const res = makeRes()
    await handler({ method: 'GET', headers: {} }, res)
    expect(res.body).toEqual({ configured: false })
  })

  it('rejects non-POST methods', async () => {
    const res = makeRes()
    await handler({ method: 'DELETE', headers: {} }, res)
    expect(res.statusCode).toBe(405)
  })

  it('maps NO_KEY to 503 and BAD_REQUEST to 400', async () => {
    delete process.env.GEMINI_API_KEY
    let res = makeRes()
    await handler(post('10.0.0.1'), res)
    expect(res.statusCode).toBe(503)

    process.env.GEMINI_API_KEY = FAKE_KEY
    res = makeRes()
    await handler(post('10.0.0.2', { prompt: '' }), res)
    expect(res.statusCode).toBe(400)
  })

  it('rate-limits the 21st request in a minute from one IP with a 429', async () => {
    fetch.mockResolvedValue(geminiOk('ok'))
    const ip = '10.9.9.9'
    for (let i = 0; i < 20; i++) {
      const res = makeRes()
      await handler(post(ip), res)
      expect(res.statusCode).toBe(200)
    }
    const res = makeRes()
    await handler(post(ip), res)
    expect(res.statusCode).toBe(429)
    expect(res.body.code).toBe('RATE_LIMIT')
  })

  it('does not rate-limit a different IP', async () => {
    fetch.mockResolvedValue(geminiOk('ok'))
    const res = makeRes()
    await handler(post('10.8.8.8'), res)
    expect(res.statusCode).toBe(200)
  })
})
