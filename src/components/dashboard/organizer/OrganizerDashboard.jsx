import { BRICOLAGE, HANKEN } from '../../ui.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import StatCard from '../shared/StatCard.jsx'
import StadiumMap from '../shared/StadiumMap.jsx'
import WeatherTile from '../shared/WeatherTile.jsx'
import DataPending from '../shared/DataPending.jsx'
import { toast } from '../shared/Toast.jsx'

const ACCENT = '#e4002b'
const FEED_MSG = 'Live crowd, gate and occupancy figures appear here on matchday as fans arrive at the venue.'

export default function OrganizerDashboard({ nav, zones, gates, recommendations, onUpdateRecs }) {
  const hasCrowd = zones.length > 0
  const attendance = zones.reduce((s, z) => s + z.current, 0)
  const capacity = zones.reduce((s, z) => s + z.capacity, 0)
  const occ = capacity ? Math.round((attendance / capacity) * 100) : 0
  const openGates = gates.filter(g => !g.isClosed)
  const avgWait = openGates.length ? Math.round(openGates.reduce((s, g) => s + g.waitMin, 0) / openGates.length) : 0
  const pending = recommendations.filter(r => r.status === 'pending')
  const busiestGates = [...openGates].sort((a, b) => b.waitMin - a.waitMin).slice(0, 4)

  const act = (id, status) => {
    onUpdateRecs(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    toast(status === 'accepted' ? 'Action accepted' : 'Recommendation dismissed', { accent: status === 'accepted' ? '#0a7d3e' : ACCENT, icon: status === 'accepted' ? 'check' : 'close' })
  }

  return (
    <div>
      <PageHead eyebrow="Operations Command" title="Matchday overview" subtitle="One live picture of the whole venue." />

      {hasCrowd ? (
        <div className="ff-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 18 }}>
          <div className="ff-rise-card ff-st1"><StatCard icon="users" label="In attendance" value={attendance} accent={ACCENT} sub={`${occ}% of capacity`} /></div>
          <div className="ff-rise-card ff-st2"><StatCard icon="gauge" label="Occupancy" value={occ} suffix="%" accent={occ >= 85 ? '#e4002b' : '#0a7d3e'} /></div>
          <div className="ff-rise-card ff-st3"><StatCard icon="clock" label="Avg gate wait" value={avgWait} suffix=" min" accent={avgWait >= 8 ? '#c8890a' : '#0a7d3e'} /></div>
          <div className="ff-rise-card ff-st4"><StatCard icon="clipboard" label="Pending actions" value={pending.length} accent={ACCENT} /></div>
        </div>
      ) : (
        <Panel className="ff-rise-card ff-st1" style={{ marginBottom: 18 }}>
          <DataPending icon="gauge" title="No live venue data" message={FEED_MSG} style={{ padding: '32px 24px' }} />
        </Panel>
      )}

      <div className="ff-ops-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title="Live crowd heatmap" icon="map" live={hasCrowd} accent={ACCENT} className="ff-rise-card ff-st5"
          action={hasCrowd ? <button className="ff-filter-chip" onClick={() => nav('organizer-heatmap')}>Open heatmap</button> : null}>
          {hasCrowd
            ? <StadiumMap zones={zones} gates={gates} mode="heatmap" onZoneClick={() => nav('organizer-heatmap')} onGateClick={() => nav('organizer-heatmap')} />
            : <DataPending icon="map" title="Heatmap offline" message="The live crowd heatmap fills in here on matchday as the stands fill." style={{ padding: '48px 24px' }} />}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="ff-rise-card ff-st6"><WeatherTile compact /></div>
          <Panel title="Busiest gates" icon="route" live={gates.length > 0} accent={ACCENT} className="ff-rise-card ff-st7">
            {gates.length > 0 ? busiestGates.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 16, color: 'var(--text)', width: 34 }}>{g.id}</span>
                <div className="ff-gauge-track" style={{ flex: 1, height: 7 }}>
                  <div className="ff-gauge-fill" style={{ width: `${g.density}%`, background: g.density >= 85 ? '#e4002b' : g.density >= 65 ? '#c8890a' : '#0a7d3e' }} />
                </div>
                <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 14, color: g.waitMin >= 10 ? 'var(--c-red)' : 'var(--text)', width: 48, textAlign: 'right' }}>{g.waitMin}m</span>
              </div>
            )) : (
              <DataPending icon="route" title="No gate data" message="Gate wait times appear here on matchday as fans come through the gates." style={{ padding: '28px 20px' }} />
            )}
          </Panel>
        </div>
      </div>

      <Panel title="Recommended actions" icon="cpu" accent={ACCENT} className="ff-rise-card ff-st8" style={{ marginTop: 18 }}
        action={<button className="ff-filter-chip" onClick={() => nav('organizer-briefings')}>All briefings</button>}>
        {pending.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--muted)', padding: '6px 0' }}>Recommended actions appear here on matchday, based on what's actually happening across the venue — never made up.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {pending.slice(0, 2).map(r => (
              <div key={r.id} style={{ display: 'flex', gap: 16, padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'var(--elev-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`ff-chip ff-chip-${r.priority === 'high' ? 'high' : r.priority === 'medium' ? 'medium' : 'low'}`} style={{ flexShrink: 0 }}>{r.priority}</span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{r.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{r.impact.metric}: {r.impact.from} → <b style={{ color: '#0a7d3e' }}>{r.impact.to}</b></div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="ff-btn" onClick={() => act(r.id, 'accepted')} style={{ padding: '9px 18px', borderRadius: 24, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>Accept</button>
                  <button className="ff-filter-chip" onClick={() => act(r.id, 'dismissed')}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
