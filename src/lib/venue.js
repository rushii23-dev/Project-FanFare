import { useEffect, useState } from 'react'
import { useLiveWorldCup, geocodeCity } from './freeApis.js'

// ============================================================
// FanFare — the one true venue.
//
// Every screen (weather, maps, concierge, access plan, transport, heatmap,
// ticket) reads the match and stadium from HERE, and this reads it from the
// real FIFA World Cup 2026 feed (TheSportsDB league 4429).
//
// There is deliberately NO hardcoded fallback stadium. If the feed cannot tell
// us where the match is, we say so — we do not invent a venue. A wrong stadium
// confidently displayed is worse than an honest "resolving…".
// ============================================================

// Open-Meteo's gazetteer only indexes populated places — it cannot find
// "AT&T Stadium" (verified). Nominatim indexes the actual grounds and returns
// the stadium's real coordinates, so we ask it first and keep the city geocoder
// as the fallback. Cached, because Nominatim is a free shared service and its
// usage policy asks us not to hammer it.
const GEO_CACHE = 'ff-venue-geo-v1'

async function geocodeStadium(name) {
  if (!name) return null
  const key = `${GEO_CACHE}:${name}`
  try {
    const hit = JSON.parse(localStorage.getItem(key) || 'null')
    if (hit) return hit
  } catch { /* ignore */ }

  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(name)}`,
    )
    if (!r.ok) return null
    const j = await r.json()
    const hit = j?.[0]
    if (!hit) return null
    const geo = { lat: Number(hit.lat), lon: Number(hit.lon), label: name }
    try { localStorage.setItem(key, JSON.stringify(geo)) } catch { /* quota */ }
    return geo
  } catch {
    return null
  }
}

export function useVenue() {
  const wc = useLiveWorldCup()
  const m = wc.view
  const [geo, setGeo] = useState(null)

  // The feed gives a venue NAME and city, not coordinates. Resolve them so the
  // map, the weather and the distance maths all point at the real ground.
  useEffect(() => {
    let alive = true
    if (!m?.venue && !m?.city) { setGeo(null); return }

    geocodeStadium(m.venue)
      .then(g => g || (m.city ? geocodeCity(m.city) : null))
      .then(g => { if (alive) setGeo(g) })
      .catch(() => { if (alive) setGeo(null) })

    return () => { alive = false }
  }, [m?.venue, m?.city])

  const kickoffIso = m?.ts ? String(m.ts).replace(' ', 'T') : null

  return {
    loading: wc.loading,
    // True only when we actually know where the match is.
    resolved: Boolean(m?.venue && geo),
    isLive: m?.phase === 'LIVE' || m?.phase === 'HT',
    phase: m?.phase || null,

    match: m || null,
    homeTeam: m?.home || null,
    awayTeam: m?.away || null,
    homeCode: m?.homeCode || null,
    awayCode: m?.awayCode || null,
    round: m?.round || null,

    venue: m?.venue || null,
    city: m?.city || null,
    lat: geo?.lat ?? null,
    lon: geo?.lon ?? null,

    kickoff: kickoffIso,
    kickoffLabel: kickoffIso
      ? new Date(kickoffIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null,
  }
}

/**
 * The venue block every AI prompt gets. Says plainly when something is unknown
 * rather than letting the model fill the gap itself.
 */
export function venueForPrompt(v) {
  if (!v?.venue) return 'Match: not yet resolved from the live FIFA World Cup 2026 feed. Do not guess a venue or a fixture.'
  return `Match: ${v.homeTeam} vs ${v.awayTeam}${v.round ? ` (${v.round})` : ''}
Status: ${v.phase === 'LIVE' ? 'in play' : v.phase === 'HT' ? 'half-time' : v.phase === 'FT' ? 'finished' : 'upcoming'}
Venue: ${v.venue}${v.city ? `, ${v.city}` : ''}
Kickoff: ${v.kickoffLabel || 'unknown'} (local)`
}
