// @vitest-environment jsdom
//
// Unit tests for the free-API layer (src/lib/freeApis.js) and the venue
// resolver (src/lib/venue.js). The contract under test: every helper degrades
// to an honest fallback — never a fabricated value — when the network fails.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  weatherMeta, translate, geocodeCity, useRates, useWeather, useCountdown,
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
