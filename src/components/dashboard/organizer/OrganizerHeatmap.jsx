import { useState } from 'react'
import { BRICOLAGE } from '../../ui.js'
import { C } from '../../../data.js'
import StadiumMap from '../shared/StadiumMap.jsx'
import CapacityGauge from '../shared/CapacityGauge.jsx'

// Full heatmap view — expanded, filterable by zone
export default function OrganizerHeatmap({ nav, zones, gates }) {
  const [selectedZone, setSelectedZone] = useState(null)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('organizer-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 24,
      }}>
        Heatmap & Gates
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="ff-dash-card" style={{ padding: 28 }}>
          <StadiumMap
            zones={zones}
            gates={gates}
            mode="heatmap"
            accent={C.red}
            highlightZone={selectedZone}
            onZoneClick={(id) => setSelectedZone(selectedZone === id ? null : id)}
            onGateClick={() => {}}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 4 }}>
            Zone breakdown
          </div>
          {zones.map(z => {
            const pct = Math.round((z.current / z.capacity) * 100)
            const isSelected = selectedZone === z.id
            return (
              <button
                key={z.id}
                onClick={() => setSelectedZone(isSelected ? null : z.id)}
                className="ff-dash-card"
                style={{
                  padding: 16, cursor: 'pointer', width: '100%', textAlign: 'left',
                  borderColor: isSelected ? `${C.red}55` : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f4' }}>{z.name}</span>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: pct >= 85 ? '#e23a45' : pct >= 65 ? '#ffa500' : '#2fa24e',
                  }}>{pct}%</span>
                </div>
                <CapacityGauge current={z.current} capacity={z.capacity} color={C.red} showLabel={false} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
