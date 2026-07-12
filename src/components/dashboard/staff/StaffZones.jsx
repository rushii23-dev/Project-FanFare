import { BRICOLAGE } from '../../ui.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import DataPending from '../shared/DataPending.jsx'
import StadiumMap from '../shared/StadiumMap.jsx'
import CapacityGauge from '../shared/CapacityGauge.jsx'
import Sparkline from '../shared/Sparkline.jsx'

const ACCENT = '#915700'
function status(pct) { return pct >= 85 ? ['Packed', '#e4002b'] : pct >= 65 ? ['Busy', '#c8890a'] : ['Calm', '#0a7d3e'] }

export default function StaffZones({ zones }) {
  const alerts = zones.filter(z => (z.current / z.capacity) >= 0.85)

  if (zones.length === 0) {
    return (
      <div>
        <PageHead eyebrow="Zone Alerts" title="Crowd density" subtitle="You'll see each zone's live crowd level here on matchday." />
        <Panel className="ff-rise-card ff-st1">
          <DataPending icon="grid" title="No crowd data yet" message="On matchday, each zone's live crowd level and alerts appear here as fans arrive." style={{ padding: '52px 24px' }} />
        </Panel>
      </div>
    )
  }

  return (
    <div>
      <PageHead eyebrow="Zone Alerts" title="Crowd density" subtitle={alerts.length ? `${alerts.length} zone${alerts.length > 1 ? 's' : ''} at or above 85% — stay alert.` : 'All zones within comfortable limits.'} />

      <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title="Live heatmap" icon="map" live accent={ACCENT} className="ff-rise-card ff-st1">
          <StadiumMap zones={zones} mode="heatmap" />
        </Panel>

        <div style={{ display: 'grid', gap: 12 }}>
          {zones.map((z, i) => {
            const pct = Math.round((z.current / z.capacity) * 100)
            const [label, color] = status(pct)
            return (
              <div key={z.id} className={`ff-panel ff-rise-card ff-st${Math.min(i + 1, 8)}`} style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{z.name}</span>
                    <span className="ff-chip" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>{label}</span>
                  </div>
                  <Sparkline data={z.trend} color={color} width={72} height={26} />
                </div>
                <CapacityGauge current={z.current} capacity={z.capacity} color={color} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
