import { describe, it, expect } from 'vitest'
import {
  EMISSION_FACTORS,
  distanceKm,
  emissionsKg,
  rankModes,
  savedVsDriving,
  equivalent,
} from '../src/lib/carbon.js'

describe('distanceKm — great-circle distance', () => {
  it('is zero for the same point', () => {
    const p = { lat: 32.7473, lon: -97.0945 } // AT&T Stadium
    expect(distanceKm(p, p)).toBe(0)
  })

  it('is zero when either point is missing (no invented distance)', () => {
    expect(distanceKm(null, { lat: 0, lon: 0 })).toBe(0)
    expect(distanceKm({ lat: 0, lon: 0 }, undefined)).toBe(0)
  })

  it('matches the known Dallas → Arlington distance within 1 km', () => {
    const dallas = { lat: 32.7767, lon: -96.797 }
    const attStadium = { lat: 32.7473, lon: -97.0945 }
    const km = distanceKm(dallas, attStadium)
    expect(km).toBeGreaterThan(27)
    expect(km).toBeLessThan(29)
  })

  it('one degree of latitude is ~111.2 km', () => {
    const km = distanceKm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })
    expect(km).toBeCloseTo(111.19, 0)
  })

  it('is symmetric', () => {
    const a = { lat: 40.81, lon: -74.07 }
    const b = { lat: 32.75, lon: -97.09 }
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 9)
  })
})

describe('emissionsKg — DEFRA factors, round trip', () => {
  it('applies factor × distance × 2 (round trip) ÷ 1000', () => {
    // transit = 35 g/km → 42 km each way → 35 * 42 * 2 / 1000 = 2.94 kg
    expect(emissionsKg('transit', 42)).toBeCloseTo(2.94, 10)
  })

  it('walking and cycling are zero-emission', () => {
    expect(emissionsKg('walk', 10)).toBe(0)
    expect(emissionsKg('cycle', 10)).toBe(0)
  })

  it('an unknown mode contributes nothing rather than NaN', () => {
    expect(emissionsKg('teleport', 42)).toBe(0)
  })

  it('rideshare (single occupancy) emits more than carpool (4 people)', () => {
    expect(emissionsKg('rideshare', 30)).toBeGreaterThan(emissionsKg('carpool', 30))
  })
})

describe('rankModes — realistic options only, cleanest first', () => {
  it('drops walking beyond 5 km and cycling beyond 20 km', () => {
    const modes = rankModes(25).map(m => m.mode)
    expect(modes).not.toContain('walk')
    expect(modes).not.toContain('cycle')
  })

  it('keeps walking for a short trip', () => {
    expect(rankModes(3).map(m => m.mode)).toContain('walk')
  })

  it('is sorted cleanest first', () => {
    const kgs = rankModes(42).map(m => m.kg)
    expect(kgs).toEqual([...kgs].sort((a, b) => a - b))
  })

  it('every entry carries a human label and its real factor', () => {
    for (const m of rankModes(10)) {
      expect(m.label).toBeTruthy()
      expect(m.factor).toBe(EMISSION_FACTORS[m.mode])
    }
  })
})

describe('savedVsDriving', () => {
  it('taking transit saves exactly the rideshare-minus-transit difference', () => {
    const km = 42
    expect(savedVsDriving('transit', km)).toBeCloseTo(
      emissionsKg('rideshare', km) - emissionsKg('transit', km), 10,
    )
  })

  it('never reports negative savings', () => {
    expect(savedVsDriving('rideshare', 42)).toBe(0)
  })
})

describe('equivalent — tangible framing', () => {
  it('large savings are framed as tree-days', () => {
    expect(equivalent(21)).toMatch(/tree/)
  })

  it('small savings are framed as phone charges', () => {
    expect(equivalent(0.01)).toMatch(/smartphone/)
  })
})
