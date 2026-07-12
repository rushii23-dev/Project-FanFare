// @vitest-environment jsdom
//
// Unit tests for the browser-side AI client (src/lib/ai.js): the contract is
// that NOTHING here throws raw into the UI — every failure mode surfaces as a
// typed AIError a dashboard can fall back from.

import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { askAI, askAIJson, AIError, aiErrorMessage, useAIStatus } from '../src/lib/ai.js'

const jsonResponse = (payload, ok = true, status = 200) => ({
  ok, status, json: async () => payload,
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('askAI', () => {
  it('POSTs to /api/ai and returns the generated text', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ text: 'Gate B is calmer.' }))
    vi.stubGlobal('fetch', fetchMock)

    const out = await askAI({ system: 'sys', prompt: 'which gate?' })
    expect(out).toBe('Gate B is calmer.')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/ai')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toMatchObject({ system: 'sys', prompt: 'which gate?' })
  })

  it('returns an empty string when the server sends no text', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({})))
    await expect(askAI({ prompt: 'x' })).resolves.toBe('')
  })

  it('maps a network failure to AIError(OFFLINE)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down') }))
    const err = await askAI({ prompt: 'x' }).catch(e => e)
    expect(err).toBeInstanceOf(AIError)
    expect(err.code).toBe('OFFLINE')
  })

  it('propagates the server error code on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      jsonResponse({ error: 'rate limited', code: 'RATE_LIMIT' }, false, 429)))
    const err = await askAI({ prompt: 'x' }).catch(e => e)
    expect(err).toBeInstanceOf(AIError)
    expect(err.code).toBe('RATE_LIMIT')
    expect(err.message).toBe('rate limited')
  })

  it('degrades to a generic AIError when the error body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false, status: 502, json: async () => { throw new SyntaxError('bad json') },
    })))
    const err = await askAI({ prompt: 'x' }).catch(e => e)
    expect(err).toBeInstanceOf(AIError)
    expect(err.code).toBe('ERROR')
  })
})

describe('askAIJson', () => {
  it('parses well-formed JSON from the model', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ text: '{"gate":"B","wait":4}' })))
    await expect(askAIJson({ prompt: 'x' })).resolves.toEqual({ gate: 'B', wait: 4 })
  })

  it('maps malformed JSON to AIError(PARSE) instead of throwing SyntaxError', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ text: 'not json {' })))
    const err = await askAIJson({ prompt: 'x' }).catch(e => e)
    expect(err).toBeInstanceOf(AIError)
    expect(err.code).toBe('PARSE')
  })
})

describe('aiErrorMessage', () => {
  it.each([
    ['NO_KEY', /not configured/i],
    ['AUTH', /key was rejected/i],
    ['RATE_LIMIT', /rate-limited/i],
    ['OFFLINE', /connection/i],
    ['PARSE', /unreadable/i],
  ])('explains %s in plain language', (code, pattern) => {
    expect(aiErrorMessage(new AIError('x', code))).toMatch(pattern)
  })

  it('falls back to a generic message for unknown codes and non-errors', () => {
    expect(aiErrorMessage(new Error('?'))).toMatch(/temporarily unavailable/i)
    expect(aiErrorMessage(null)).toMatch(/temporarily unavailable/i)
    expect(aiErrorMessage(undefined)).toMatch(/temporarily unavailable/i)
  })
})

describe('useAIStatus', () => {
  it('reports configured=true when the health endpoint confirms a key', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ configured: true })))
    const { result } = renderHook(() => useAIStatus())
    expect(result.current.checking).toBe(true)
    await waitFor(() => expect(result.current.checking).toBe(false))
    expect(result.current.configured).toBe(true)
  })

  it('reports configured=false when the health check cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    const { result } = renderHook(() => useAIStatus())
    await waitFor(() => expect(result.current.checking).toBe(false))
    expect(result.current.configured).toBe(false)
  })
})
