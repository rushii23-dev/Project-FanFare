import { useState } from 'react'
import { BRICOLAGE } from '../../ui.js'
import { useVenue } from '../../../lib/venue.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import DataPending from '../shared/DataPending.jsx'
import StadiumMap from '../shared/StadiumMap.jsx'
import VenueMap from '../shared/VenueMap.jsx'
import ProgressRing from '../shared/ProgressRing.jsx'
import Sparkline from '../shared/Sparkline.jsx'

const ACCENT = '#e4002b'
const pcOf = z => Math.round((z.current / z.capacity) * 100)
const colOf = p => p >= 85 ? '#e4002b' : p >= 65 ? '#c8890a' : '#0e9f4f'
export default function OrganizerHeatmap({ zones, gates }) {
  const venue = useVenue()
  // Only the real ground. The old "Lot D" / "Rail shuttle" pins were invented
  // MetLife coordinates and applied to no real fixture.
  const CITY = venue.resolved
    ? [{ lat: venue.lat, lon: venue.lon, label: venue.venue, color: '#e4002b' }]
    : []
  const [view, setView] = useState('stadium')
  const ranked = [...zones].sort((a, b) => pcOf(b) - pcOf(a))
  const [selId, setSelId] = useState(ranked[0]?.id)

  const toggle = (
    <div style={{ display: 'inline-flex', gap: 8 }}>
      <button className={`ff-filter-chip${view === 'stadium' ? ' active' : ''}`} onClick={() => setView('stadium')}>Stadium</button>
      <button className={`ff-filter-chip${view === 'city' ? ' active' : ''}`} onClick={() => setView('city')}>City</button>
    </div>
  )

  // No live crowd feed connected — keep the real city map, placeholder the rest.
  if (zones.length === 0) {
    return (
      <div>
        <PageHead eyebrow="Heatmap" title="Crowd intelligence" subtitle="You'll see live density by zone and gate here on matchday." action={toggle} />
        <Panel title={view === 'stadium' ? 'Density map' : 'Venue & approaches'} icon="map" accent={ACCENT} className="ff-rise-card ff-st1">
          {view === 'stadium'
            ? <DataPending icon="grid" title="No crowd data yet" message="The colour-coded density map fills in here on matchday as the stands fill. Switch to City for the live venue map." style={{ padding: '60px 24px' }} />
            : venue.resolved
              ? <VenueMap center={[venue.lat, venue.lon]} zoom={13} markers={CITY} height={400} />
              : <DataPending icon="pin" title="Resolving the venue" message="Finding which stadium the live FIFA World Cup 2026 match is at." style={{ padding: '60px 24px' }} />}
        </Panel>
      </div>
    )
  }

  const sel = zones.find(z => z.id === selId) || zones[0]
  const selPct = pcOf(sel)
  const zoneGates = gates.filter(g => g.zone === sel.id)

  return (
    <div>
      <PageHead eyebrow="Heatmap" title="Crowd intelligence" subtitle="Live density by zone and gate. Click a sector to drill in."
        action={<div style={{ display: 'inline-flex', gap: 8 }}>
          <button className={`ff-filter-chip${view === 'stadium' ? ' active' : ''}`} onClick={() => setView('stadium')}>Stadium</button>
          <button className={`ff-filter-chip${view === 'city' ? ' active' : ''}`} onClick={() => setView('city')}>City</button>
        </div>} />

      <div className="ff-ops-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title={view === 'stadium' ? 'Density map' : 'Venue & approaches'} icon="map" live accent={ACCENT} className="ff-rise-card ff-st1">
          {view === 'stadium'
            ? <StadiumMap zones={zones} gates={gates} mode="heatmap" highlightZone={selId} onZoneClick={setSelId} />
            : venue.resolved
              ? <VenueMap center={[venue.lat, venue.lon]} zoom={13} markers={CITY} height={400} />
              : <DataPending icon="pin" title="Resolving the venue" message="Finding which stadium the live FIFA World Cup 2026 match is at." style={{ padding: '60px 24px' }} />}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel title={sel.name} icon="grid" accent={colOf(selPct)} className="ff-rise-card ff-st2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <ProgressRing value={selPct} size={96} color={colOf(selPct)} sub="full" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>{sel.current.toLocaleString()} / {sel.capacity.toLocaleString()}</div>
                <div style={{ marginTop: 8 }}><Sparkline data={sel.trend} color={colOf(selPct)} width={140} height={38} /></div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>{zoneGates.length} gate{zoneGates.length !== 1 ? 's' : ''} serving this zone</div>
              </div>
            </div>
          </Panel>

          <Panel title="Zone ranking" icon="chart" accent={ACCENT} className="ff-rise-card ff-st3">
            {ranked.map(z => {
              const p = pcOf(z)
              return (
                <button key={z.id} onClick={() => setSelId(z.id)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: z.id === selId ? 'var(--fill-2)' : 'transparent', border: 'none', borderRadius: 10, padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 14, color: 'var(--text)', width: 20 }}>{z.id}</span>
                  <div className="ff-gauge-track" style={{ flex: 1, height: 7 }}><div className="ff-gauge-fill" style={{ width: `${p}%`, background: colOf(p) }} /></div>
                  <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 13.5, color: colOf(p), width: 42, textAlign: 'right' }}>{p}%</span>
                </button>
              )
            })}
          </Panel>
        </div>
      </div>
    </div>
  )
}
