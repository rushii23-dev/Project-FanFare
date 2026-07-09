import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'
import CapacityGauge from '../shared/CapacityGauge.jsx'
import Sparkline from '../shared/Sparkline.jsx'

// Zone & Crowd Alerts — live capacity gauges with mini-trends
export default function StaffZones({ nav, zones }) {
  const [acknowledged, setAcknowledged] = useState(new Set())

  const ack = (zoneId) => {
    setAcknowledged(prev => new Set([...prev, zoneId]))
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('staff-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Zone & Crowd Alerts
      </h2>
      <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>
        Live capacity for your coverage zones. Acknowledge alerts to confirm awareness.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {zones.map(z => {
          const pct = Math.round((z.current / z.capacity) * 100)
          const isAlert = pct >= 85
          const isWarn = pct >= 65
          const isAcked = acknowledged.has(z.id)

          return (
            <div
              key={z.id}
              className="ff-dash-card"
              style={{
                padding: 24,
                borderColor: isAlert && !isAcked ? 'rgba(226,58,69,0.3)' : undefined,
                background: isAlert && !isAcked ? 'rgba(226,58,69,0.03)' : '#111111',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: isAlert ? '#e23a45' : isWarn ? '#ffa500' : '#2fa24e',
                      boxShadow: isAlert ? '0 0 8px rgba(226,58,69,0.5)' : undefined,
                    }} />
                    <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 18, color: '#f4f4f4' }}>
                      {z.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6c6c6c', marginTop: 4 }}>
                    {z.current.toLocaleString()} / {z.capacity.toLocaleString()} capacity
                  </div>
                </div>
                <div style={{ width: 100 }}>
                  <Sparkline data={z.trend} color={isAlert ? '#e23a45' : isWarn ? '#ffa500' : C.green} />
                  <div style={{ fontSize: 10, color: '#4a4a4a', marginTop: 4 }}>Last 30 min</div>
                </div>
                <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 32, color: isAlert ? '#e23a45' : '#f4f4f4', minWidth: 60, textAlign: 'right' }}>
                  {pct}%
                </div>
              </div>

              <CapacityGauge current={z.current} capacity={z.capacity} color={C.green} showLabel={false} />

              {isAlert && !isAcked && (
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#e23a45', fontWeight: 500 }}>
                    ⚠️ Alert: Zone approaching capacity
                  </span>
                  <button
                    onClick={() => ack(z.id)}
                    style={{
                      padding: '7px 18px', borderRadius: 20, border: '1px solid rgba(226,58,69,0.3)',
                      background: 'transparent', color: '#e23a45', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                    }}
                  >
                    Acknowledge
                  </button>
                </div>
              )}
              {isAlert && isAcked && (
                <div style={{ marginTop: 12, fontSize: 12, color: '#6c6c6c' }}>
                  ✓ Alert acknowledged
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
