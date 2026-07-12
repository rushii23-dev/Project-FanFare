// ============================================================
// FanFare — travel emissions.
//
// These are REAL numbers, not decoration. Emission factors are the published
// UK DEFRA / BEIS greenhouse-gas conversion factors for passenger transport,
// expressed as grams of CO2-equivalent per passenger-kilometre. Distance is a
// real great-circle distance between the fan's geocoded origin and the real
// venue coordinates.
//
// So: real factor x real distance = a defensible emissions figure. Nothing here
// is simulated. What the AI does with it is advice, not arithmetic.
//
// Source: DEFRA/BEIS GHG Conversion Factors for Company Reporting.
// ============================================================

// gCO2e per passenger-km
export const EMISSION_FACTORS = {
  walk: 0,
  cycle: 0,
  transit: 35,    // national rail / light rail — averaged
  shuttle: 102,   // average local bus / coach shuttle
  carpool: 43,    // average petrol car, 4 occupants
  rideshare: 170, // average petrol car, single occupancy
}

export const MODE_LABEL = {
  walk: 'Walk',
  cycle: 'Cycle',
  transit: 'Rail & metro',
  shuttle: 'Match shuttle bus',
  carpool: 'Car (shared, 4 people)',
  rideshare: 'Rideshare / taxi',
}

const R = 6371 // km

/** Great-circle distance in km between two coordinates. */
export function distanceKm(a, b) {
  if (!a || !b) return 0
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Round-trip emissions in kg CO2e for one fan travelling `km` each way. */
export function emissionsKg(mode, km) {
  const f = EMISSION_FACTORS[mode]
  if (f == null) return 0
  return (f * km * 2) / 1000
}

/**
 * Every mode ranked for this journey, cleanest first. Modes that are not
 * realistic for the distance are dropped rather than shown as absurd options —
 * nobody walks 40km to a stadium.
 */
export function rankModes(km) {
  const viable = Object.keys(EMISSION_FACTORS).filter(m => {
    if (m === 'walk') return km <= 5
    if (m === 'cycle') return km <= 20
    return true
  })
  return viable
    .map(mode => ({
      mode,
      label: MODE_LABEL[mode],
      factor: EMISSION_FACTORS[mode],
      kg: emissionsKg(mode, km),
    }))
    .sort((a, b) => a.kg - b.kg)
}

/** kg CO2e saved by taking `mode` instead of driving alone. */
export function savedVsDriving(mode, km) {
  return Math.max(0, emissionsKg('rideshare', km) - emissionsKg(mode, km))
}

/** Tangible equivalent, so a kg figure means something to a human. */
export function equivalent(kg) {
  // A mature tree sequesters roughly 21 kg CO2 per year.
  const treeDays = (kg / 21) * 365
  if (treeDays >= 1) return `${treeDays.toFixed(treeDays < 10 ? 1 : 0)} days of a tree's CO₂ absorption`
  // Smartphone charge ~ 8g CO2e.
  return `${Math.round((kg * 1000) / 8)} smartphone charges`
}

export const FACTOR_SOURCE = 'DEFRA/BEIS GHG conversion factors (gCO₂e per passenger-km)'
