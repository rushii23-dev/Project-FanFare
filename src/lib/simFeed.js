import { useEffect } from 'react'

// ============================================================
// FanFare — SIMULATED venue telemetry.
//
// Real stadium sensor feeds don't exist for us, and data.js deliberately
// refuses to fabricate any. This module is the honest alternative: a clearly
// separated, clearly labelled simulator that stands in for the feed so the
// AI decision-support layer has something real-shaped to reason over.
//
// Everything it produces is surfaced in the UI behind a SIMULATED FEED badge.
// Nothing in here is presented to the user as real measurement. When a genuine
// feed is connected, delete this file and point App.jsx at the feed instead —
// no other component changes, because they all read the same zone/gate shape.
// ============================================================

export const SIM_ACTIVE = true

const ZONE_SEED = [
  { id: 'N1', name: 'North Stand — Lower', capacity: 11200, current: 8400 },
  { id: 'N2', name: 'North Stand — Upper', capacity: 9600, current: 6100 },
  { id: 'E1', name: 'East Concourse', capacity: 7400, current: 6600 },
  { id: 'S1', name: 'South Stand — Lower', capacity: 11800, current: 9900 },
  { id: 'S2', name: 'South Stand — Upper', capacity: 9200, current: 5200 },
  { id: 'W1', name: 'West Concourse', capacity: 7600, current: 4300 },
  { id: 'W2', name: 'West Fan Zone', capacity: 5200, current: 4700 },
  { id: 'C1', name: 'Central Plaza', capacity: 6000, current: 3100 },
]

// stepFree is a real attribute of the gate, not a guess. Without it in the data,
// the accessibility planner will infer step-free access from silence — which is
// precisely the invention we cannot allow on this feature.
const GATE_SEED = [
  { id: 'A', waitMin: 6, isClosed: false, stepFree: true },
  { id: 'B', waitMin: 11, isClosed: false, stepFree: false },
  { id: 'C', waitMin: 18, isClosed: false, stepFree: true },
  { id: 'D', waitMin: 4, isClosed: false, stepFree: false },
  { id: 'E', waitMin: 9, isClosed: false, stepFree: true },
  { id: 'F', waitMin: 0, isClosed: true, stepFree: false },
]

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
const jitter = (spread) => (Math.random() - 0.5) * 2 * spread

export function createSimZones() {
  return ZONE_SEED.map(z => ({ ...z, trend: 0 }))
}

export function createSimGates() {
  // Density is derived from wait, so the two never contradict each other.
  return GATE_SEED.map(g => ({ ...g, density: g.isClosed ? 0 : clamp(Math.round(g.waitMin * 5), 0, 100) }))
}

/** One tick of the simulation: a bounded random walk, so numbers drift the way
 *  a real crowd does rather than teleporting. */
export function stepZones(zones) {
  return zones.map(z => {
    const delta = Math.round(jitter(z.capacity * 0.012))
    const current = clamp(z.current + delta, Math.round(z.capacity * 0.15), z.capacity)
    return { ...z, current, trend: current - z.current }
  })
}

export function stepGates(gates) {
  return gates.map(g => {
    if (g.isClosed) return { ...g, waitMin: 0, density: 0 }
    const waitMin = clamp(Math.round(g.waitMin + jitter(2)), 0, 45)
    return { ...g, waitMin, density: clamp(Math.round(waitMin * 5 + jitter(8)), 0, 100) }
  })
}

// ---- How arriving fans actually travelled ----
// The mode SPLIT is simulated (no turnstile survey feed exists). The emissions
// computed from it are not: they use real DEFRA factors and a real average
// travel distance. See carbon.js.
const MODE_SEED = [
  { mode: 'transit', share: 0.34 },
  { mode: 'rideshare', share: 0.28 },
  { mode: 'carpool', share: 0.19 },
  { mode: 'shuttle', share: 0.11 },
  { mode: 'walk', share: 0.05 },
  { mode: 'cycle', share: 0.03 },
]

// Typical distance a fan travels to a World Cup group match, one way.
export const AVG_TRIP_KM = 42

export function createSimModeShare() {
  return MODE_SEED.map(m => ({ ...m }))
}

export function stepModeShare(split) {
  const drifted = split.map(m => ({ ...m, share: Math.max(0.01, m.share + jitter(0.012)) }))
  const total = drifted.reduce((s, m) => s + m.share, 0)
  return drifted.map(m => ({ ...m, share: m.share / total }))
}

/**
 * Drives the simulated feed into App state. Seeds immediately on mount so the
 * dashboards are never briefly empty, then ticks every `ms`.
 */
export function useVenueSim(setZones, setGates, { active = SIM_ACTIVE, ms = 5000 } = {}) {
  useEffect(() => {
    if (!active) return
    setZones(createSimZones())
    setGates(createSimGates())
    const t = setInterval(() => {
      setZones(stepZones)
      setGates(stepGates)
    }, ms)
    return () => clearInterval(t)
  }, [active, ms, setZones, setGates])
}
