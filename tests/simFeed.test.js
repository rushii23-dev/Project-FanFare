import { describe, it, expect } from 'vitest'
import {
  createSimZones,
  createSimGates,
  stepZones,
  stepGates,
  createSimModeShare,
  stepModeShare,
} from '../src/lib/simFeed.js'

// The GenAI layer reasons over this feed, so its invariants are contracts:
// a value outside these bounds would make the AI's advice nonsense.

describe('createSimZones / createSimGates — seed shape', () => {
  it('every zone starts within its capacity', () => {
    for (const z of createSimZones()) {
      expect(z.current).toBeGreaterThan(0)
      expect(z.current).toBeLessThanOrEqual(z.capacity)
      expect(z.trend).toBe(0)
    }
  })

  it('gate density is derived from wait so the two never contradict', () => {
    for (const g of createSimGates()) {
      if (g.isClosed) expect(g.density).toBe(0)
      else expect(g.density).toBe(Math.min(100, Math.max(0, Math.round(g.waitMin * 5))))
    }
  })

  it('stepFree is an explicit boolean on every gate — the accessibility planner must never infer it from silence', () => {
    for (const g of createSimGates()) expect(typeof g.stepFree).toBe('boolean')
  })
})

describe('stepZones — bounded random walk', () => {
  it('never exceeds capacity or drops below 15% floor, even after 500 ticks', () => {
    let zones = createSimZones()
    for (let i = 0; i < 500; i++) zones = stepZones(zones)
    for (const z of zones) {
      expect(z.current).toBeLessThanOrEqual(z.capacity)
      expect(z.current).toBeGreaterThanOrEqual(Math.round(z.capacity * 0.15))
    }
  })

  it('reports the trend as exactly the change it made', () => {
    const before = createSimZones()
    const after = stepZones(before)
    after.forEach((z, i) => expect(z.trend).toBe(z.current - before[i].current))
  })
})

describe('stepGates — bounded walk with a closed-gate contract', () => {
  it('a closed gate always reads 0 wait and 0 density', () => {
    let gates = createSimGates()
    for (let i = 0; i < 200; i++) gates = stepGates(gates)
    for (const g of gates.filter(g => g.isClosed)) {
      expect(g.waitMin).toBe(0)
      expect(g.density).toBe(0)
    }
  })

  it('open gates stay within human-plausible bounds after 500 ticks', () => {
    let gates = createSimGates()
    for (let i = 0; i < 500; i++) gates = stepGates(gates)
    for (const g of gates.filter(g => !g.isClosed)) {
      expect(g.waitMin).toBeGreaterThanOrEqual(0)
      expect(g.waitMin).toBeLessThanOrEqual(45)
      expect(g.density).toBeGreaterThanOrEqual(0)
      expect(g.density).toBeLessThanOrEqual(100)
    }
  })
})

describe('stepModeShare — a probability distribution stays one', () => {
  it('shares always sum to 1 and stay positive, even after 500 ticks', () => {
    let split = createSimModeShare()
    for (let i = 0; i < 500; i++) split = stepModeShare(split)
    const total = split.reduce((s, m) => s + m.share, 0)
    expect(total).toBeCloseTo(1, 9)
    for (const m of split) expect(m.share).toBeGreaterThan(0)
  })
})
