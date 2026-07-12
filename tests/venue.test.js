// @vitest-environment jsdom
//
// Unit tests for the venue resolver (src/lib/venue.js). Its contract: the
// venue comes from the REAL World Cup feed or it is honestly unresolved —
// there is deliberately no fallback stadium. The feed hook and the city
// geocoder are mocked (in their own module) so only the resolver is on trial.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../src/lib/freeApis.js', () => ({
  useLiveWorldCup: vi.fn(),
  geocodeCity: vi.fn(),
}))

import { useLiveWorldCup, geocodeCity } from '../src/lib/freeApis.js'
import { useVenue, venueForPrompt } from '../src/lib/venue.js'

// In-memory localStorage (jsdom's is non-functional on this Node pairing).
const store = new Map()
const memoryStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(String(k), String(v)) },
  removeItem: k => { store.delete(k) },
  clear: () => { store.clear() },
  key: i => [...store.keys()][i] ?? null,
  get length() { return store.size },
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage)
  store.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const jsonResponse = payload => ({ ok: true, status: 200, json: async () => payload })

describe('useVenue', () => {
  it('is unresolved (no invented stadium) while the feed has no match', () => {
    useLiveWorldCup.mockReturnValue({ loading: false, view: null })
    const { result } = renderHook(() => useVenue())
    expect(result.current.resolved).toBe(false)
    expect(result.current.venue).toBeNull()
    expect(result.current.lat).toBeNull()
    expect(result.current.kickoff).toBeNull()
  })

  it('resolves the real stadium via Nominatim and exposes match facts', async () => {
    useLiveWorldCup.mockReturnValue({
      loading: false,
      view: {
        home: 'United States', away: 'Mexico', homeCode: 'USA', awayCode: 'MEX',
        venue: 'AT&T Stadium', city: 'Arlington', round: 'Final',
        phase: 'LIVE', ts: '2026-07-19 20:00:00',
      },
    })
    vi.stubGlobal('fetch', vi.fn(async () =>
      jsonResponse([{ lat: '32.7473', lon: '-97.0945' }])))

    const { result } = renderHook(() => useVenue())
    await waitFor(() => expect(result.current.resolved).toBe(true))
    expect(result.current.lat).toBeCloseTo(32.7473)
    expect(result.current.lon).toBeCloseTo(-97.0945)
    expect(result.current.isLive).toBe(true)
    expect(result.current.homeTeam).toBe('United States')
    expect(result.current.kickoff).toBe('2026-07-19T20:00:00')
  })

  it('falls back to the city geocoder when the stadium lookup fails', async () => {
    useLiveWorldCup.mockReturnValue({
      loading: false,
      view: { home: 'A', away: 'B', venue: 'Unknown Ground', city: 'Toronto', phase: 'UPCOMING', ts: null },
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })))
    geocodeCity.mockResolvedValue({ lat: 43.65, lon: -79.38, label: 'Toronto' })

    const { result } = renderHook(() => useVenue())
    await waitFor(() => expect(result.current.resolved).toBe(true))
    expect(result.current.lat).toBeCloseTo(43.65)
    expect(geocodeCity).toHaveBeenCalledWith('Toronto')
  })

  it('caches a stadium geocode so Nominatim is not hammered on re-mount', async () => {
    useLiveWorldCup.mockReturnValue({
      loading: false,
      view: { home: 'A', away: 'B', venue: 'AT&T Stadium', city: 'Arlington', phase: 'UPCOMING', ts: null },
    })
    const fetchMock = vi.fn(async () => jsonResponse([{ lat: '32.7', lon: '-97.1' }]))
    vi.stubGlobal('fetch', fetchMock)

    const first = renderHook(() => useVenue())
    await waitFor(() => expect(first.result.current.resolved).toBe(true))
    first.unmount()

    const second = renderHook(() => useVenue())
    await waitFor(() => expect(second.result.current.resolved).toBe(true))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('venueForPrompt', () => {
  it('tells the model NOT to guess when the venue is unresolved', () => {
    const block = venueForPrompt({ venue: null })
    expect(block).toMatch(/not yet resolved/i)
    expect(block).toMatch(/do not guess/i)
  })

  it('states match, status, venue and kickoff when resolved', () => {
    const block = venueForPrompt({
      venue: 'AT&T Stadium', city: 'Arlington', homeTeam: 'USA', awayTeam: 'Mexico',
      round: 'Final', phase: 'HT', kickoffLabel: '20:00',
    })
    expect(block).toContain('USA vs Mexico (Final)')
    expect(block).toContain('half-time')
    expect(block).toContain('AT&T Stadium, Arlington')
    expect(block).toContain('20:00')
  })
})
