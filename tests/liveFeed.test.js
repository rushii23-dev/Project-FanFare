// @vitest-environment jsdom
//
// Tests for the live World Cup feed engine (useLiveWorldCup) — the logic that
// decides which match the score bar features, parses in-play status strings,
// derives 3-letter team codes, and NEVER fabricates a score — plus the
// reveal/count-up scroll effects.
//
// The hook keeps a module-level 25s cache so remounts don't hammer the API.
// Tests advance a faked Date (real timers stay real) so each test starts with
// a stale cache and forces a fresh load.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLiveWorldCup, useWorldCup } from '../src/lib/freeApis.js'
import { useScrollEffects } from '../src/hooks/useScrollEffects.js'

let clock = Date.now()

beforeEach(() => {
  // Only Date is faked: Date.now() controls the feed cache, while timers,
  // fetch microtasks and waitFor keep running for real.
  clock += 60_000
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(clock)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// TheSportsDB-shaped event. Defaults are a valid WC-2026 fixture.
const event = (over = {}) => ({
  idEvent: over.idEvent || `E${Math.random().toString(36).slice(2, 8)}`,
  strEvent: 'Mexico vs Canada', strHomeTeam: 'Mexico', strAwayTeam: 'Canada',
  intHomeScore: null, intAwayScore: null,
  strTimestamp: '2026-07-19 20:00:00', strVenue: 'Estadio Azteca', strCity: 'Mexico City',
  strStatus: 'NS', strProgress: '', strLeague: 'FIFA World Cup', idLeague: '4429',
  strSeason: '2026', strRound: 'Group A', ...over,
})

// Routes the three feed endpoints (past / next / day) to the given payloads.
function stubFeed({ past = [], next = [], day = [] } = {}) {
  vi.stubGlobal('fetch', vi.fn(async (url) => ({
    ok: true,
    status: 200,
    json: async () => {
      if (url.includes('eventspastleague')) return { events: past }
      if (url.includes('eventsnextleague')) return { events: next }
      if (url.includes('eventsday')) return { events: day }
      return {}
    },
  })))
}

describe('useLiveWorldCup — featured match selection', () => {
  it('features an in-play match with live minute, scores and lead flags', async () => {
    stubFeed({
      day: [event({ strStatus: '63', strProgress: '63', intHomeScore: '2', intAwayScore: '1' })],
      next: [event({ idEvent: 'later' })],
    })
    const { result } = renderHook(() => useLiveWorldCup())
    // Wait for the expected state, not just !loading — the module-level cache
    // repaints the previous test's data first.
    await waitFor(() => expect(result.current.view?.phase).toBe('LIVE'))

    const v = result.current.view
    expect(result.current.live).toBe(true)
    expect(v.minuteLabel).toBe("63'")
    expect(v.hasScore).toBe(true)
    expect(v.homeLead).toBe(true)
    expect(v.awayLead).toBe(false)
    expect(v.homeCode).toBe('MEX')
    expect(v.awayCode).toBe('CAN')
    expect(v.progress).toBeCloseTo(63 / 90)
  })

  it('shows HT as half-time, not a fabricated minute', async () => {
    stubFeed({ day: [event({ strStatus: 'HT', intHomeScore: '0', intAwayScore: '0' })] })
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.view?.phase).toBe('HT'))
    expect(result.current.view.minuteLabel).toBe('HT')
  })

  it('falls back to the next kickoff when nothing is in play', async () => {
    stubFeed({ next: [event()] })
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.view?.phase).toBe('UPCOMING'))

    const v = result.current.view
    expect(result.current.live).toBe(false)
    expect(v.hasScore).toBe(false)     // no score is ever invented pre-kickoff
    expect(v.progress).toBe(0)
    expect(v.minuteLabel).toMatch(/\d/) // a kickoff time, not a match minute
  })

  it('falls back to the latest result, marked FT with full progress', async () => {
    stubFeed({ past: [event({ strStatus: 'FT', intHomeScore: '3', intAwayScore: '2' })] })
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.view?.phase).toBe('FT'))
    expect(result.current.view.minuteLabel).toBe('FT')
    expect(result.current.view.progress).toBe(1)
  })

  it('a finished match in the day feed is NOT treated as live', async () => {
    stubFeed({
      day: [event({ strStatus: 'FT', intHomeScore: '1', intAwayScore: '0' })],
      next: [event({ idEvent: 'next-up' })],
    })
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.view?.phase).toBe('UPCOMING'))
    expect(result.current.live).toBe(false)
  })

  it('ignores events from other leagues and other seasons', async () => {
    stubFeed({
      day: [
        event({ strStatus: '30', strLeague: 'Friendly Cup', idLeague: '9999' }),
        event({ strStatus: '30', strSeason: '2022' }),
      ],
    })
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.featured).toBeNull())
    expect(result.current.live).toBe(false)
    expect(result.current.view).toBeFalsy()
  })

  it('reports an honest empty state when the feed is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    const { result } = renderHook(() => useLiveWorldCup())
    await waitFor(() => expect(result.current.featured).toBeNull())
    expect(result.current.live).toBe(false)
  })
})

describe('useWorldCup — results & fixtures lists', () => {
  it('sorts results newest-first and fixtures soonest-first', async () => {
    stubFeed({
      past: [
        event({ idEvent: 'old', strTimestamp: '2026-06-12 18:00:00' }),
        event({ idEvent: 'recent', strTimestamp: '2026-07-10 20:00:00' }),
      ],
      next: [
        event({ idEvent: 'far', strTimestamp: '2026-07-25 18:00:00' }),
        event({ idEvent: 'soon', strTimestamp: '2026-07-13 20:00:00' }),
      ],
    })
    const { result } = renderHook(() => useWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(true)
    expect(result.current.results.map(r => r.id)).toEqual(['recent', 'old'])
    expect(result.current.fixtures.map(f => f.id)).toEqual(['soon', 'far'])
  })

  it('is not-live with empty lists when the feed has nothing', async () => {
    stubFeed()
    const { result } = renderHook(() => useWorldCup())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.live).toBe(false)
    expect(result.current.results).toEqual([])
  })
})

describe('useScrollEffects — reduced motion', () => {
  it('reveals everything immediately and completes count-ups without animation', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true, addEventListener() {}, removeEventListener() {},
      addListener() {}, removeListener() {},
    })))
    document.body.innerHTML = `
      <div data-reveal></div>
      <div data-reveal class="ff-in"></div>
      <div id="ff-scorewrap">
        <span class="ff-score-num" data-to="104"></span>
        <span class="ff-score-num" data-to="48" data-suffix="+"></span>
      </div>`

    renderHook(() => useScrollEffects('landing'))

    await waitFor(() => {
      expect(document.querySelectorAll('[data-reveal].ff-in').length).toBe(2)
      expect(document.querySelectorAll('.ff-score-num')[0].textContent).toBe('104')
      expect(document.querySelectorAll('.ff-score-num')[1].textContent).toBe('48+')
    })
    document.body.innerHTML = ''
  })
})
