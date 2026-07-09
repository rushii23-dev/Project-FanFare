import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'
import StadiumMap from '../shared/StadiumMap.jsx'

// Live Map & Seat Finder — stadium map with gate/seat search
export default function FanMap({ nav, zones, gates, fanProfile }) {
  const [search, setSearch] = useState('')
  const [found, setFound] = useState(null)
  const [highlightGate, setHighlightGate] = useState(fanProfile.gate)

  const handleSearch = (e) => {
    e.preventDefault()
    const q = search.trim().toUpperCase()
    if (!q) return
    // Try to match a section/row/seat pattern
    const secMatch = q.match(/(\d+)/)
    if (secMatch) {
      setFound({
        section: secMatch[1],
        message: `Section ${secMatch[1]} is in the ${parseInt(secMatch[1]) > 200 ? 'upper' : 'lower'} bowl, ${parseInt(secMatch[1]) > 200 ? 'South Stand (Zone C)' : 'North Stand (Zone A)'}.`,
      })
    } else {
      setFound({ section: null, message: `No results found for "${search}". Try a section number.` })
    }
  }

  // Find the calmer gate
  const openGates = gates.filter(g => !g.isClosed)
  const calmerGate = [...openGates].sort((a, b) => a.waitMin - b.waitMin)[0]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('fan-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Live Map & Seat Finder
      </h2>
      <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>
        Find your seat, check gate status, and discover calmer routes.
      </p>

      {/* Calmer route banner */}
      {calmerGate && calmerGate.waitMin < 5 && (
        <div style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(47,162,78,0.08)', border: '1px solid rgba(47,162,78,0.2)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>🟢</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#2fa24e' }}>Calmer route available</div>
            <div style={{ fontSize: 13, color: '#9a9a9a' }}>
              Gate {calmerGate.id} has a {calmerGate.waitMin}-minute wait — much shorter than your assigned Gate {fanProfile.gate}.
            </div>
          </div>
          <button
            onClick={() => setHighlightGate(calmerGate.id)}
            style={{
              marginLeft: 'auto', padding: '8px 16px', borderRadius: 20,
              border: '1px solid rgba(47,162,78,0.3)', background: 'transparent',
              color: '#2fa24e', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: HANKEN, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            Show on map
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Map */}
        <div className="ff-dash-card" style={{ padding: 24 }}>
          <StadiumMap
            zones={zones}
            gates={gates}
            highlightGate={highlightGate}
            accent={C.blue}
            onGateClick={(id) => setHighlightGate(id)}
          />
          <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Legend color="#2fa24e" label="< 5 min wait" />
            <Legend color="#ffa500" label="5–10 min" />
            <Legend color="#e23a45" label="> 10 min" />
          </div>
        </div>

        {/* Search & gate list */}
        <div>
          <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="ff-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by section (e.g. 214)"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 20px', borderRadius: 32, border: 'none',
                  background: C.blue, color: '#fff', fontWeight: 600,
                  fontSize: 13, cursor: 'pointer', fontFamily: HANKEN,
                }}
              >
                Find
              </button>
            </div>
          </form>

          {found && (
            <div className="ff-dash-card" style={{ marginBottom: 16, padding: 18 }}>
              <div style={{ fontSize: 14, color: found.section ? '#cfcfcf' : '#9a9a9a' }}>
                {found.section && <span style={{ marginRight: 8 }}>📍</span>}
                {found.message}
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 12 }}>
            Gate Status
          </div>
          {gates.map(g => (
            <button
              key={g.id}
              onClick={() => setHighlightGate(g.id)}
              className="ff-dash-card"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', marginBottom: 8, cursor: 'pointer',
                textAlign: 'left', borderColor: highlightGate === g.id ? `${C.blue}55` : undefined,
              }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: g.isClosed ? '#6c6c6c' : g.density >= 85 ? '#e23a45' : g.density >= 65 ? '#ffa500' : '#2fa24e',
                boxShadow: g.isClosed ? 'none' : `0 0 6px ${g.density >= 85 ? 'rgba(226,58,69,0.5)' : g.density >= 65 ? 'rgba(255,165,0,0.5)' : 'rgba(47,162,78,0.5)'}`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f4' }}>
                  Gate {g.id} {g.isClosed ? '(Closed)' : ''}
                  {g.id === fanProfile.gate && <span style={{ color: C.blue, fontSize: 11, marginLeft: 8 }}>YOUR GATE</span>}
                </div>
                <div style={{ fontSize: 12, color: '#9a9a9a' }}>Zone {g.zone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: g.isClosed ? '#6c6c6c' : '#f4f4f4' }}>
                  {g.isClosed ? '—' : `${g.waitMin}m`}
                </div>
                <div style={{ fontSize: 11, color: '#6c6c6c' }}>
                  {g.isClosed ? 'Closed' : `${g.density}% full`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 11, color: '#9a9a9a' }}>{label}</span>
    </div>
  )
}
