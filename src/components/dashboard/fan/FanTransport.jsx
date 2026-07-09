import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { transportModes, rewardsCatalog, C } from '../../../data.js'

// Transport Planner + Waste-Sorting Rewards
export default function FanTransport({ nav, fanProfile, onUpdateProfile }) {
  const [mode, setMode] = useState('transit')
  const active = transportModes.find(t => t.id === mode) || transportModes[0]
  const [scanAnim, setScanAnim] = useState(false)

  const handleScan = () => {
    setScanAnim(true)
    setTimeout(() => {
      setScanAnim(false)
      onUpdateProfile({
        ...fanProfile,
        rewards: {
          ...fanProfile.rewards,
          points: fanProfile.rewards.points + 40,
          scans: fanProfile.rewards.scans + 1,
        },
      })
    }, 1500)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('fan-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 24,
      }}>
        Transport & Rewards
      </h2>

      {/* Transport section */}
      <div className="ff-dash-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
        }}>
          Getting here
        </div>

        {/* Mode picker */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {transportModes.map(t => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className="ff-filter-chip"
              style={mode === t.id ? {
                background: `${C.blue}18`, borderColor: C.blue, color: C.blue,
              } : {}}
            >
              <span style={{ marginRight: 6 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Route card */}
        <div style={{
          padding: 20, borderRadius: 12, background: 'rgba(42,165,224,0.06)',
          border: '1px solid rgba(42,165,224,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>{active.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f4' }}>{active.route}</div>
              <div style={{ fontSize: 13, color: '#9a9a9a' }}>{active.details}</div>
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'rgba(42,165,224,0.12)', borderRadius: 8,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.blue }}>ETA: {active.eta}</span>
          </div>
        </div>
      </div>

      {/* Rewards section */}
      <div className="ff-dash-card" style={{ padding: 28 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
        }}>
          Green Champion Rewards
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{
            padding: 16, borderRadius: 12, background: 'rgba(47,162,78,0.06)',
            border: '1px solid rgba(47,162,78,0.15)', textAlign: 'center',
          }}>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 32, color: '#2fa24e' }}>
              {fanProfile.rewards.points}
            </div>
            <div style={{ fontSize: 12, color: '#9a9a9a' }}>Points</div>
          </div>
          <div style={{
            padding: 16, borderRadius: 12, background: 'rgba(42,165,224,0.06)',
            border: '1px solid rgba(42,165,224,0.15)', textAlign: 'center',
          }}>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 32, color: C.blue }}>
              {fanProfile.rewards.scans}
            </div>
            <div style={{ fontSize: 12, color: '#9a9a9a' }}>Scans</div>
          </div>
          <div style={{
            padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f4', marginTop: 4 }}>
              {fanProfile.rewards.level}
            </div>
            <div style={{ fontSize: 12, color: '#9a9a9a', marginTop: 4 }}>Level</div>
          </div>
        </div>

        {/* Scan CTA */}
        <button
          onClick={handleScan}
          disabled={scanAnim}
          style={{
            width: '100%', padding: '18px', borderRadius: 14, border: '2px dashed rgba(47,162,78,0.3)',
            background: scanAnim ? 'rgba(47,162,78,0.12)' : 'rgba(47,162,78,0.04)',
            color: '#2fa24e', fontSize: 16, fontWeight: 600, cursor: scanAnim ? 'wait' : 'pointer',
            fontFamily: HANKEN, textAlign: 'center', transition: 'background 0.3s',
            marginBottom: 24,
          }}
        >
          {scanAnim ? '📸 Scanning...' : '📷 Scan to sort waste (+40 pts)'}
        </button>

        {/* Rewards catalog */}
        <div style={{ fontSize: 13, fontWeight: 600, color: '#9a9a9a', marginBottom: 12 }}>
          Redeem rewards
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rewardsCatalog.map(r => {
            const canAfford = fanProfile.rewards.points >= r.points
            return (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: 22 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#f4f4f4' }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#6c6c6c' }}>{r.points} points</div>
                </div>
                <button
                  disabled={!canAfford}
                  style={{
                    padding: '7px 16px', borderRadius: 20, border: 'none', fontSize: 12,
                    fontWeight: 600, cursor: canAfford ? 'pointer' : 'default',
                    background: canAfford ? '#2fa24e' : '#333', color: canAfford ? '#fff' : '#6c6c6c',
                    fontFamily: HANKEN, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  {canAfford ? 'Redeem' : 'Locked'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
