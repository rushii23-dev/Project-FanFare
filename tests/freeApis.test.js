// @vitest-environment jsdom
//
// Unit tests for the free-API layer (src/lib/freeApis.js) and the venue
// resolver (src/lib/venue.js). The contract under test: every helper degrades
// to an honest fallback — never a fabricated value — when the network fails.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  weatherMeta, translate, geocodeCity, useRates, useWeather, useCountdown,
  useTeam, useWorldCup,
} from '../src/lib/freeApis.js'

// In-memory localStorage: this Node/jsdom pairing ships a non-functional one
// (same workaround as tests/ui-smoke.test.jsx).
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

describe('weatherMeta', () => {
  it('maps known WMO codes to label + icon', () => {
    expect(weatherMeta(0)).toEqual({ label: 'Clear sky', icon: 'sun' })
    expect(weatherMeta(63)).toEqual({ label: 'Rain', icon: 'drop' })
    expect(weatherMeta(95)).toEqual({ label: 'Thunderstorm', icon: 'drop' })
  })

  it('falls back to Clear for unknown codes', () => {
    expect(weatherMeta(999)).toEqual({ label: 'Clear', icon: 'sun' })
    expect(weatherMeta(undefined)).toEqual({ label: 'Clear', icon: 'sun' })
  })
})

describe('translate', () => {
  it('returns the translation from MyMemory', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      jsonResponse({ responseData: { translatedText: 'Hola' } })))
    await expect(translate('Hello', 'en', 'es')).resolves.toBe('Hola')
  })

  it('short-circuits when source and target language match', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(translate('Hello', 'en', 'en')).resolves.toBe('Hello')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns empty input unchanged without a network call', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(translate('   ', 'en', 'es')).resolves.toBe('')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls back to the original text when the API answers with a quota warning', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      jsonResponse({ responseData: { translatedText: 'MYMEMORY WARNING: quota exceeded' } })))
    await expect(translate('Hello', 'en', 'es')).resolves.toBe('Hello')
  })

  it('falls back to the original text when offline', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    await expect(translate('Hello', 'en', 'es')).resolves.toBe('Hello')
  })
})

describe('geocodeCity', () => {
  it('resolves a city to coordinates with a readable label', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      jsonResponse({ results: [{ latitude: 40.81, longitude: -74.07, name: 'East Rutherford', admin1: 'New Jersey' }] })))
    await expect(geocodeCity('East Rutherford, NJ')).resolves.toEqual(
      { lat: 40.81, lon: -74.07, label: 'East Rutherford, New Jersey' })
  })

  it('returns null — not a guess — when the gazetteer has no match', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ results: [] })))
    await expect(geocodeCity('Nowhereville')).resolves.toBeNull()
  })

  it('returns null when offline and for empty input', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    await expect(geocodeCity('Dallas')).resolves.toBeNull()
    await expect(geocodeCity('')).resolves.toBeNull()
  })
})

describe('useRates', () => {
  it('serves live rates when the FX API responds', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      jsonResponse({ rates: { EUR: 0.9, MXN: 18.2 } })))
    const { result } = renderHook(() => useRates('USD'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(true)
    expect(result.current.rates.MXN).toBe(18.2)
  })

  it('keeps the offline fallback table (marked not-live) when the API is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    const { result } = renderHook(() => useRates('USD'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(false)
    expect(result.current.rates.EUR).toBeGreaterThan(0)
  })
})

describe('useWeather', () => {
  it('reports no weather at all when the venue is unknown — never someone else\'s weather', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather(null, null))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(false)
    expect(result.current.temp).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rounds and exposes current conditions for real coordinates', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      current: {
        temperature_2m: 27.6, apparent_temperature: 29.2,
        relative_humidity_2m: 61.4, wind_speed_10m: 11.8, weather_code: 2,
      },
    })))
    const { result } = renderHook(() => useWeather(40.81, -74.07))
    await waitFor(() => expect(result.current.live).toBe(true))
    expect(result.current).toMatchObject({ temp: 28, feels: 29, humidity: 61, wind: 12, code: 2 })
  })

  it('degrades to a not-live state when the weather API fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    const { result } = renderHook(() => useWeather(40.81, -74.07))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(false)
  })
})

describe('useTeam', () => {
  it('resolves a crest from the sports database', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      jsonResponse({ teams: [{ strBadge: 'https://img/crest.png' }] })))
    const { result } = renderHook(() => useTeam('Mexico'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.crest).toBe('https://img/crest.png')
  })

  it('reports no crest — not a placeholder image — when the lookup fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    const { result } = renderHook(() => useTeam('Mexico'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.crest).toBeNull()
  })
})

// ---- Live FIFA World Cup 2026 feed ------------------------------------------

// A realistic TheSportsDB event, WC-2026 by default.
const sportsDbEvent = (over = {}) => ({
  idEvent: 'e1', strEvent: 'USA vs Mexico', strHomeTeam: 'USA', strAwayTeam: 'Mexico',
  intHomeScore: '2', intAwayScore: '1', strTimestamp: '2026-07-13 19:00:00',
  strVenue: 'AT&T Stadium', strCity: 'Arlington', strStatus: 'FT', strProgress: '',
  strHomeTeamBadge: 'usa.png', strAwayTeamBadge: 'mex.png', strRound: 'Group A',
  strThumb: '', strSeason: '2026', strLeague: 'FIFA World Cup', idLeague: '4429',
  strLeagueBadge: 'wc.png',
  ...over,
})

const stubWorldCupFeed = ({ past = [], next = [], day = [] } = {}) => {
  vi.stubGlobal('fetch', vi.fn(async (url) => jsonResponse(
    String(url).includes('eventspastleague') ? { events: past }
      : String(url).includes('eventsnextleague') ? { events: next }
        : String(url).includes('eventsday') ? { events: day }
          : {},
  )))
}

// The hook memoises the feed in a module-level cache so dashboards paint
// instantly on tab switches. Tests need a cold cache, so each one imports a
// fresh copy of the module.
async function freshLiveWorldCup() {
  vi.resetModules()
  const mod = await import('../src/lib/freeApis.js')
  return mod.useLiveWorldCup
}

describe('useWorldCup', () => {
  it('splits the feed into ordered results and fixtures with the league badge', async () => {
    stubWorldCupFeed({
      past: [sportsDbEvent(), sportsDbEvent({ idEvent: 'e0', strTimestamp: '2026-07-12 19:00:00' })],
      next: [sportsDbEvent({ idEvent: 'e2', strStatus: 'NS', strTimestamp: '2026-07-15 19:00:00' })],
    })
    const { result } = renderHook(() => useWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(true)
    expect(result.current.results.map(r => r.id)).toEqual(['e1', 'e0']) // newest first
    expect(result.current.fixtures).toHaveLength(1)
    expect(result.current.leagueBadge).toBe('wc.png')
  })

  it('reports an empty, not-live feed when the source has nothing', async () => {
    stubWorldCupFeed({})
    const { result } = renderHook(() => useWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(false)
    expect(result.current.results).toEqual([])
  })
})

describe('useLiveWorldCup', () => {
  it('features an in-play match with the real minute, score and lead', async () => {
    stubWorldCupFeed({
      day: [sportsDbEvent({ strStatus: "23'", strProgress: '23', intHomeScore: '1', intAwayScore: '0' })],
    })
    const useLiveWorldCup = await freshLiveWorldCup()
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.live).toBe(true)
    expect(result.current.view).toMatchObject({
      phase: 'LIVE', minuteLabel: "23'", hasScore: true,
      homeLead: true, awayLead: false,
      homeCode: 'USA', awayCode: 'MEX',
    })
    expect(result.current.view.progress).toBeCloseTo(23 / 90)
  })

  it('features the deepest in-play match when several run at once', async () => {
    stubWorldCupFeed({
      day: [
        sportsDbEvent({ idEvent: 'early', strStatus: '12', strProgress: '12' }),
        sportsDbEvent({ idEvent: 'late', strStatus: '88', strProgress: '88' }),
      ],
    })
    const useLiveWorldCup = await freshLiveWorldCup()
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.featured.id).toBe('late')
    expect(result.current.view.minuteLabel).toBe("88'")
  })

  it('labels half time and extra time statuses like a broadcaster', async () => {
    stubWorldCupFeed({ day: [sportsDbEvent({ strStatus: 'HT', strProgress: '' })] })
    let useLiveWorldCup = await freshLiveWorldCup()
    const ht = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(ht.result.current.loading).toBe(false))
    expect(ht.result.current.view.phase).toBe('HT')
    expect(ht.result.current.view.minuteLabel).toBe('HT')

    stubWorldCupFeed({ day: [sportsDbEvent({ strStatus: 'Extra Time', strProgress: '' })] })
    useLiveWorldCup = await freshLiveWorldCup()
    const et = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(et.result.current.loading).toBe(false))
    expect(et.result.current.view.minuteLabel).toBe('Extra time')

    stubWorldCupFeed({ day: [sportsDbEvent({ strStatus: 'Penalty', strProgress: '' })] })
    useLiveWorldCup = await freshLiveWorldCup()
    const pens = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(pens.result.current.loading).toBe(false))
    expect(pens.result.current.view.minuteLabel).toBe('Live')
  })

  it('falls back to the next kickoff when nothing is in play', async () => {
    stubWorldCupFeed({
      next: [sportsDbEvent({ strStatus: 'NS', intHomeScore: null, intAwayScore: null, strTimestamp: '2026-07-15 19:00:00' })],
    })
    const useLiveWorldCup = await freshLiveWorldCup()
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(false)
    expect(result.current.view.phase).toBe('UPCOMING')
    expect(result.current.view.hasScore).toBe(false)
    expect(result.current.view.progress).toBe(0)
    expect(result.current.view.minuteLabel).toMatch(/\d/) // a kickoff clock time
  })

  it('falls back to the latest result after the final whistle', async () => {
    stubWorldCupFeed({ past: [sportsDbEvent()] })
    const useLiveWorldCup = await freshLiveWorldCup()
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.view.phase).toBe('FT')
    expect(result.current.view.minuteLabel).toBe('FT')
    expect(result.current.view.progress).toBe(1)
  })

  it('refuses events from other leagues or seasons — WC 2026 only', async () => {
    stubWorldCupFeed({
      day: [sportsDbEvent({ strLeague: 'Friendly', idLeague: '999', strStatus: '10', strProgress: '10' })],
      past: [sportsDbEvent({ strSeason: '2022' })],
    })
    const useLiveWorldCup = await freshLiveWorldCup()
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.featured).toBeNull()
    expect(result.current.view).toBeFalsy()
  })
})

describe('useCountdown', () => {
  it('counts down to a future kickoff', () => {
    const inTwoHours = new Date(Date.now() + 2 * 3.6e6 + 5000).toISOString()
    const { result } = renderHook(() => useCountdown(inTwoHours))
    expect(result.current.done).toBe(false)
    expect(result.current.h).toBe(2)
    expect(result.current.pad(7)).toBe('07')
  })

  it('clamps to zero once kickoff has passed', () => {
    const past = new Date(Date.now() - 60_000).toISOString()
    const { result } = renderHook(() => useCountdown(past))
    expect(result.current.done).toBe(true)
    expect(result.current.h).toBe(0)
    expect(result.current.m).toBe(0)
    expect(result.current.s).toBe(0)
  })
})
