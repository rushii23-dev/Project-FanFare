// Unit tests for the shared display formatters (src/lib/format.js).
// These helpers render user-facing text in every dashboard's chrome, so each
// branch (unit boundaries, fallbacks, non-date passthrough) is pinned here.

import { describe, it, expect, afterEach, vi } from 'vitest'
import { timeAgo, initials, shortTime } from '../src/lib/format.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('timeAgo', () => {
  const NOW = new Date('2026-07-14T12:00:00Z')
  const at = (msBefore) => new Date(NOW.getTime() - msBefore).toISOString()

  it('reports "Just now" under one minute', () => {
    vi.useFakeTimers({ now: NOW })
    expect(timeAgo(at(0))).toBe('Just now')
    expect(timeAgo(at(59_000))).toBe('Just now')
  })

  it('reports minutes under an hour', () => {
    vi.useFakeTimers({ now: NOW })
    expect(timeAgo(at(60_000))).toBe('1m ago')
    expect(timeAgo(at(59 * 60_000))).toBe('59m ago')
  })

  it('reports hours under a day', () => {
    vi.useFakeTimers({ now: NOW })
    expect(timeAgo(at(60 * 60_000))).toBe('1h ago')
    expect(timeAgo(at(23 * 60 * 60_000))).toBe('23h ago')
  })

  it('reports days from 24h onward', () => {
    vi.useFakeTimers({ now: NOW })
    expect(timeAgo(at(24 * 60 * 60_000))).toBe('1d ago')
    expect(timeAgo(at(3 * 24 * 60 * 60_000))).toBe('3d ago')
  })
})

describe('initials', () => {
  it('takes the first letter of each word, uppercased', () => {
    expect(initials('Ava Torres')).toBe('AT')
    expect(initials('ava maria torres')).toBe('AMT')
  })

  it('caps the letter count when max is given (avatar badge uses 2)', () => {
    expect(initials('Ava Maria Torres', { max: 2 })).toBe('AM')
  })

  it('collapses repeated whitespace instead of producing empty initials', () => {
    expect(initials('Ava   Torres')).toBe('AT')
  })

  it('falls back for blank and missing names', () => {
    expect(initials('')).toBe('U')
    expect(initials('   ')).toBe('U')
    expect(initials(null)).toBe('U')
    expect(initials(undefined, { fallback: 'F' })).toBe('F')
  })
})

describe('shortTime', () => {
  it('formats an ISO timestamp as a 24-hour clock label', () => {
    // Construct via local time so the assertion holds in any test timezone.
    const localEight = new Date(2026, 6, 14, 8, 5).toISOString()
    expect(shortTime(localEight)).toBe('08:05')
  })

  it('passes non-date labels through unchanged rather than "Invalid Date"', () => {
    expect(shortTime('TBD')).toBe('TBD')
  })
})
