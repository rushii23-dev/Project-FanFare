import { useState } from 'react'
import { BRICOLAGE } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { useVenue } from '../../../lib/venue.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import DataPending from '../shared/DataPending.jsx'
import StadiumMap from '../shared/StadiumMap.jsx'
import VenueMap from '../shared/VenueMap.jsx'
import Sparkline from '../shared/Sparkline.jsx'

const ACCENT = '#0e9f4f'

export default function FanMap({ zones, gates, fanProfile }) {
  const venue = useVenue()
  const [view, setView] = useState('stadium')
  const [sel, setSel] = useState(fanProfile.gate)
  const selGate = gates.find(g => g.id === sel)

  // Only the real stadium goes on the map. The old markers ("Secaucus Junction",
  // "Lot D", "Rideshare drop-off — South Plaza") were invented MetLife
  // coordinates and are gone; we do not know the transport nodes for an
  // arbitrary World Cup ground and will not pretend to.
  const cityMarkers = venue.resolved
    ? [{ lat: venue.lat, lon: venue.lon, label: venue.venue, color: '#0e9f4f' }]
    : []

  return (
    <div>
      <PageHead
        eyebrow="Live Map"
        title="Find your way"
        subtitle="Your seat, gate flow and the fastest way in — updated live."
        action={(
          <div style={{ display: 'inline-flex', gap: 8 }}>
            <button className={`ff-filter-chip${view === 'stadium' ? ' active' : ''}`} onClick={() => setView('stadium')}>Stadium</button>
            <button className={`ff-filter-chip${view === 'city' ? ' active' : ''}`} onClick={() => setView('city')}>City</button>
          </div>
        )}
      />

      <div className="ff-fan-map" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title={view === 'stadium' ? 'Stadium bowl' : 'Getting to the venue'} icon="map" live={view === 'stadium' && zones.length > 0} accent={ACCENT} className="ff-rise-card ff-st1">
          {view === 'stadium' ? (
            zones.length > 0 ? (
              <>
                <StadiumMap zones={zones} gates={gates} accent={ACCENT} highlightGate={sel} onGateClick={setSel} />
                <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  {[['Calm', '#0e9f4f'], ['Busy', '#c8890a'], ['Packed', '#e4002b']].map(([l, c]) => (
                    <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--muted)' }}>
                      <span style={{ width: 11, height: 11, borderRadius: 4, background: c }} /> {l}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <DataPending icon="grid" title="Live bowl heatmap" message="The colour-coded stadium map fills in on matchday, showing how busy each stand and gate is. Switch to City view for the live map to the ground." style={{ padding: '60px 24px' }} />
            )
          ) : (
            venue.resolved ? (
              <VenueMap center={[venue.lat, venue.lon]} zoom={13} markers={cityMarkers} height={380} />
            ) : (
              <DataPending icon="pin" title="Resolving the venue" message="Finding which stadium the live FIFA World Cup 2026 match is at. The map opens on the real ground — we never show a stand-in venue." style={{ padding: '60px 24px' }} />
            )
          )}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel title="Your seat" icon="seat" accent={ACCENT} className="ff-rise-card ff-st2">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 12px' }}>
              {[['Gate', fanProfile.gate], ['Section', fanProfile.section], ['Row', fanProfile.row], ['Seat', fanProfile.seat]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>{v}</div>
                </div>
              ))}
            </div>
          </Panel>

          {selGate && (
            <Panel title={`Gate ${selGate.id}`} icon="route" live accent={ACCENT} className="ff-rise-card ff-st3">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 34, color: selGate.waitMin >= 10 ? 'var(--c-red)' : 'var(--text)' }}>{selGate.waitMin}<span style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 600 }}> min</span></div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{selGate.isClosed ? 'Currently closed' : `${selGate.density}% density`}</div>
                </div>
                <Sparkline data={selGate.trend} color={selGate.density >= 85 ? '#e4002b' : ACCENT} width={90} height={38} />
              </div>
              <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--faint)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="info" size={14} /> Tap any gate pin on the map to compare.
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
