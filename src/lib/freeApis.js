import { useEffect, useState } from 'react'

// ============================================================
// FanFare — free public-API layer (no paid keys).
// Every hook degrades gracefully to a sensible fallback so the
// dashboards never break offline. Storage/backend comes later.
// ============================================================

// ---- WMO weather code → label + icon name (our monoline set) ----
const WMO = {
  0: ['Clear sky', 'sun'], 1: ['Mainly clear', 'sun'], 2: ['Partly cloudy', 'cloud'],
  3: ['Overcast', 'cloud'], 45: ['Fog', 'cloud'], 48: ['Rime fog', 'cloud'],
  51: ['Light drizzle', 'drop'], 53: ['Drizzle', 'drop'], 55: ['Heavy drizzle', 'drop'],
  61: ['Light rain', 'drop'], 63: ['Rain', 'drop'], 65: ['Heavy rain', 'drop'],
  71: ['Light snow', 'drop'], 73: ['Snow', 'drop'], 75: ['Heavy snow', 'drop'],
  80: ['Rain showers', 'drop'], 81: ['Showers', 'drop'], 82: ['Violent showers', 'drop'],
  95: ['Thunderstorm', 'drop'], 96: ['Storm + hail', 'drop'], 99: ['Storm + hail', 'drop'],
}
export function weatherMeta(code) {
  const [label, icon] = WMO[code] || ['Clear', 'sun']
  return { label, icon }
}

// ---- Live weather at the venue (Open-Meteo, no key) ----
// No default coordinates: the venue comes from the real match feed. If we don't
// know where the match is, we report no weather rather than the weather
// somewhere else.
export function useWeather(lat, lon) {
  const [state, setState] = useState(
    /** @type {{ loading: boolean, live: boolean, temp: number|null, feels: number|null, humidity: number|null, wind: number|null, code: number|null }} */
    ({ loading: true, live: false, temp: null, feels: null, humidity: null, wind: null, code: null }),
  )
  useEffect(() => {
    let alive = true
    if (lat == null || lon == null) { setState(s => ({ ...s, loading: false, live: false })); return }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
    fetch(url)
      .then(r => r.json())
      .then(j => {
        if (!alive || !j.current) return
        const c = j.current
        setState({
          loading: false, live: true,
          temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature),
          humidity: Math.round(c.relative_humidity_2m), wind: Math.round(c.wind_speed_10m),
          code: c.weather_code,
        })
      })
      .catch(() => { if (alive) setState(s => ({ ...s, loading: false, live: false })) })
    return () => { alive = false }
  }, [lat, lon])
  return state
}

// ---- Translation (MyMemory, free, no key) ----
// translate('Hello', 'en', 'es') -> 'Hola'
export async function translate(text, from, to) {
  const clean = (text || '').trim()
  if (!clean || from === to) return clean
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${from}|${to}`
    const r = await fetch(url)
    const j = await r.json()
    const out = j?.responseData?.translatedText
    if (out && !/MYMEMORY WARNING|INVALID/i.test(out)) return out
    return clean
  } catch {
    return clean
  }
}

export const LANGS = [
  { code: 'en', label: 'English' }, { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' }, { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' }, { code: 'ar', label: 'العربية' },
  { code: 'ja', label: '日本語' }, { code: 'hi', label: 'हिन्दी' },
]

// ---- FX rates (open.er-api.com, free, no key) ----
const FX_FALLBACK = { EUR: 0.92, GBP: 0.79, CAD: 1.36, MXN: 17.1, JPY: 150, BRL: 5.0, INR: 83, AUD: 1.5 }
export function useRates(base = 'USD') {
  const [state, setState] = useState({ loading: true, live: false, rates: FX_FALLBACK })
  useEffect(() => {
    let alive = true
    fetch(`https://open.er-api.com/v6/latest/${base}`)
      .then(r => r.json())
      .then(j => {
        if (!alive) return
        if (j?.rates) setState({ loading: false, live: true, rates: j.rates })
        else setState(s => ({ ...s, loading: false }))
      })
      .catch(() => { if (alive) setState(s => ({ ...s, loading: false })) })
    return () => { alive = false }
  }, [base])
  return state
}

// ---- Team crest (TheSportsDB, free test key) ----
const CREST_FALLBACK = {}
export function useTeam(name) {
  const [state, setState] = useState({ loading: true, crest: null })
  useEffect(() => {
    if (!name) return
    let alive = true
    fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(j => {
        if (!alive) return
        const t = j?.teams?.[0]
        const crest = t?.strBadge || t?.strTeamBadge || CREST_FALLBACK[name] || null
        setState({ loading: false, crest })
      })
      .catch(() => { if (alive) setState({ loading: false, crest: null }) })
    return () => { alive = false }
  }, [name])
  return state
}

// ---- Live FIFA World Cup 26 feed (TheSportsDB, free key) ----
export const WC_LEAGUE = '4429'
function normEvent(e) {
  return {
    id: e.idEvent, event: e.strEvent, home: e.strHomeTeam, away: e.strAwayTeam,
    hs: e.intHomeScore, as: e.intAwayScore, ts: e.strTimestamp, venue: e.strVenue, city: e.strCity,
    status: e.strStatus, progress: e.strProgress, homeBadge: e.strHomeTeamBadge, awayBadge: e.strAwayTeamBadge,
    round: e.strRound, thumb: e.strThumb, season: e.strSeason, league: e.strLeague,
  }
}
export function useWorldCup() {
  const [state, setState] = useState({ loading: true, live: false, results: [], fixtures: [], leagueBadge: null })
  useEffect(() => {
    let alive = true
    const base = 'https://www.thesportsdb.com/api/v1/json/3'
    Promise.all([
      fetch(`${base}/eventspastleague.php?id=${WC_LEAGUE}`).then(r => r.json()).catch(() => ({})),
      fetch(`${base}/eventsnextleague.php?id=${WC_LEAGUE}`).then(r => r.json()).catch(() => ({})),
    ]).then(([past, next]) => {
      if (!alive) return
      const results = (past.events || []).map(normEvent).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      const fixtures = (next.events || []).map(normEvent).sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
      const leagueBadge = past.events?.[0]?.strLeagueBadge || next.events?.[0]?.strLeagueBadge || null
      setState({ loading: false, live: results.length > 0 || fixtures.length > 0, results, fixtures, leagueBadge })
    }).catch(() => { if (alive) setState(s => ({ ...s, loading: false })) })
    return () => { alive = false }
  }, [])
  return state
}

// ---- Geocode a city → coords (Open-Meteo geocoding, no key) ----
export async function geocodeCity(name) {
  if (!name) return null
  try {
    const q = name.split(',')[0].trim()
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1`)
    const j = await r.json()
    const g = j?.results?.[0]
    if (!g) return null
    return { lat: g.latitude, lon: g.longitude, label: `${g.name}${g.admin1 ? `, ${  g.admin1}` : ''}` }
  } catch { return null }
}

// ============================================================
// LIVE FIFA World Cup 2026 match — drives the score bar pinned to
// every dashboard page (all roles). REAL data only, restricted to
// the FIFA World Cup league (id 4429), season 2026, via TheSportsDB.
// The free tier has no true in-play (second-by-second) endpoint —
// that needs a paid key — so the feed reflects per-match status and
// official scores: it shows a genuinely LIVE match when the source
// marks one in-play, otherwise the next kickoff or the latest
// result. Never fabricates a score. Polls so it stays current.
// ============================================================
const WC_SEASON = '2026'
const LIVE_STATUS_RE = /^(\d{1,3}'?\+?\d*|1H|2H|HT|ET|BT|P|PEN Live|Live|1st Half|2nd Half|Half Time|Extra Time|Break Time|Penalty)$/i
const DONE_STATUS_RE = /^(FT|AET|PEN|AP|Match Finished|FT_PEN|After ET|After Pen|Awarded|Cancelled|Canc|Postponed|Abandoned|WO)$/i

function isLiveStatus(s) {
  const t = (s || '').trim()
  if (!t || DONE_STATUS_RE.test(t) || /^(NS|TBD|Not Started)$/i.test(t)) return false
  return LIVE_STATUS_RE.test(t) || /^\d/.test(t)
}

// Short 3-letter code from a team name (no code in the free feed).
function teamCode(name) {
  if (!name) return '???'
  const words = name.trim().split(/\s+/)
  const base = words.length > 1 ? words.map(w => w[0]).join('') : words[0]
  return base.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, base.slice(1, 3).toUpperCase())
}

function liveMinuteLabel(status, progress) {
  const t = (status || '').trim()
  if (/^HT|Half Time$/i.test(t)) return 'HT'
  if (/^\d/.test(progress || '')) return `${String(progress).replace(/'$/, '')}'`
  if (/^\d/.test(t)) return `${t.replace(/'$/, '')}'`
  if (/1H|1st/i.test(t)) return '1st half'
  if (/2H|2nd/i.test(t)) return '2nd half'
  if (/ET|Extra/i.test(t)) return 'Extra time'
  return 'Live'
}

// Choose the one match the bar should feature, WC-2026 only.
function pickFeatured(live, fixtures, results) {
  if (live.length) {
    // Prefer a real in-play minute (furthest into the game) for a "most live" feel.
    return { ...live[0], phase: /HT|Half Time/i.test(live[0].status || '') ? 'HT' : 'LIVE' }
  }
  if (fixtures.length) return { ...fixtures[0], phase: 'UPCOMING' }
  if (results.length) return { ...results[0], phase: 'FT' }
  return null
}

/** @type {{ at: number, data: Record<string, any> } | null} */
let _wcLiveCache = null

/** @returns {Record<string, any>} feed state plus the derived display `view` */
export function useLiveWorldCup() {
  const [state, setState] = useState(() => /** @type {Record<string, any>} */ (
    _wcLiveCache?.data || { loading: true, featured: null, fixtures: [], results: [], live: false, leagueBadge: null }
  ))

  useEffect(() => {
    let alive = true
    const base = 'https://www.thesportsdb.com/api/v1/json/3'
    const today = new Date().toISOString().slice(0, 10)

    const load = () => {
      Promise.all([
        fetch(`${base}/eventspastleague.php?id=${WC_LEAGUE}`).then(r => r.json()).catch(() => ({})),
        fetch(`${base}/eventsnextleague.php?id=${WC_LEAGUE}`).then(r => r.json()).catch(() => ({})),
        fetch(`${base}/eventsday.php?d=${today}&l=${WC_LEAGUE}`).then(r => r.json()).catch(() => ({})),
      ]).then(([past, next, day]) => {
        if (!alive) return
        const keep = e => (e.strLeague === 'FIFA World Cup' || String(e.idLeague) === WC_LEAGUE) &&
          (!e.strSeason || e.strSeason === WC_SEASON)
        const norm = arr => (arr || []).filter(keep).map(normEvent)

        const results = norm(past.events).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
        const fixtures = norm(next.events).sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
        const dayEvents = norm(day.events)
        const live = dayEvents
          .filter(e => isLiveStatus(e.status))
          .sort((a, b) => (parseInt(b.progress || b.status) || 0) - (parseInt(a.progress || a.status) || 0))

        const featured = pickFeatured(live, fixtures, results)
        const leagueBadge = past.events?.[0]?.strLeagueBadge || next.events?.[0]?.strLeagueBadge || null
        const data = { loading: false, featured, fixtures, results, live: live.length > 0, leagueBadge }
        _wcLiveCache = { at: Date.now(), data }
        setState(data)
      }).catch(() => { if (alive) setState(s => ({ ...s, loading: false })) })
    }

    // Fresh cache → paint instantly; otherwise load now. Poll to stay current.
    if (!_wcLiveCache || Date.now() - _wcLiveCache.at > 25000) load()
    else setState(_wcLiveCache.data)
    const id = setInterval(load, 30000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  // Derive display fields for whichever match is featured.
  const f = state.featured
  const view = f && {
    home: f.home, away: f.away,
    homeCode: teamCode(f.home), awayCode: teamCode(f.away),
    homeBadge: f.homeBadge, awayBadge: f.awayBadge,
    homeScore: f.hs, awayScore: f.as,
    hasScore: f.hs != null && f.as != null,
    homeLead: Number(f.hs) > Number(f.as), awayLead: Number(f.as) > Number(f.hs),
    venue: f.venue, city: f.city, round: f.round, ts: f.ts,
    phase: f.phase,
    minuteLabel: f.phase === 'HT' ? 'HT'
      : f.phase === 'FT' ? 'FT'
      : f.phase === 'UPCOMING' ? new Date((f.ts || '').replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : liveMinuteLabel(f.status, f.progress),
    progress: /^\d/.test(f.progress || f.status || '') ? Math.min(1, (parseInt(f.progress || f.status) || 0) / 90) : (f.phase === 'FT' ? 1 : 0),
  }

  return { ...state, view }
}

// ---- Kickoff countdown ----
export function useCountdown(iso) {
  const [ms, setMs] = useState(() => new Date(iso).getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setMs(new Date(iso).getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [iso])
  const clamped = Math.max(0, ms)
  const h = Math.floor(clamped / 3.6e6)
  const m = Math.floor((clamped % 3.6e6) / 6e4)
  const s = Math.floor((clamped % 6e4) / 1000)
  return { h, m, s, done: ms <= 0, pad: (n) => String(n).padStart(2, '0') }
}
