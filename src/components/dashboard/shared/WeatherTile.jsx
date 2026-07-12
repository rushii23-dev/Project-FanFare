import { useEffect, useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { useWeather, weatherMeta, geocodeCity } from '../../../lib/freeApis.js'
import { useVenue } from '../../../lib/venue.js'

// Live weather (Open-Meteo) at the REAL match venue. If a `city` is passed we
// geocode that; otherwise we fall back to whichever stadium the live FIFA World
// Cup 2026 feed says the match is at. There is no hardcoded venue — if we don't
// know where the match is, we show nothing rather than another city's weather.
export default function WeatherTile({ compact = false, city, label }) {
  const venue = useVenue()
  const [coords, setCoords] = useState(null)
  const [place, setPlace] = useState(label || null)

  useEffect(() => {
    if (!city) {
      if (venue.lat != null && venue.lon != null) {
        setCoords([venue.lat, venue.lon])
        setPlace(label || venue.city || venue.venue)
      }
      return
    }
    let alive = true
    geocodeCity(city).then(r => { if (alive && r) { setCoords([r.lat, r.lon]); setPlace(r.label) } })
    return () => { alive = false }
  }, [city, label, venue.lat, venue.lon, venue.city, venue.venue])

  const w = useWeather(coords?.[0], coords?.[1])
  const meta = weatherMeta(w.code)

  // No venue resolved yet → say so. Never show a stand-in city's weather.
  if (!coords || w.loading) {
    return (
      <div className="ff-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="ff-skeleton" style={{ height: 18, width: '55%' }} />
        <div className="ff-skeleton" style={{ height: 40, width: '40%' }} />
        <div className="ff-skeleton" style={{ height: 14, width: '70%' }} />
      </div>
    )
  }

  const stats = [
    { icon: 'sun', label: 'Feels', value: `${w.feels}°` },
    { icon: 'wind', label: 'Wind', value: `${w.wind} km/h` },
    { icon: 'drop', label: 'Humidity', value: `${w.humidity}%` },
  ]

  return (
    <div className="ff-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Weather</span>
          <div style={{ fontSize: 12.5, color: 'var(--faint)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place}</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span className="ff-live-dot" style={{ background: w.live ? 'var(--c-green)' : 'var(--faint-2)', boxShadow: w.live ? '0 0 0 4px rgba(14,159,79,.14)' : 'none' }} />
          <span style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: w.live ? 'var(--c-green)' : 'var(--faint)' }}>{w.live ? 'Live' : 'Offline'}</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: 'var(--c-amber)', display: 'inline-flex' }}><Icon name={meta.icon} size={44} stroke={1.5} /></span>
        <div>
          <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 40, lineHeight: 1, color: 'var(--text)' }}>{w.temp}°<span style={{ fontSize: 20, color: 'var(--muted)' }}>C</span></div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{meta.label}</div>
        </div>
      </div>
      {!compact && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
          {stats.map(s => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Icon name={s.icon} size={14} /> {s.label}
              </span>
              <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
