import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'
import StadiumMap from '../shared/StadiumMap.jsx'
import Sparkline from '../shared/Sparkline.jsx'

// Organizer Dashboard Home — "Command center"
export default function OrganizerDashboard({ nav, zones, gates, recommendations, onUpdateRecs }) {
  const [drawerGate, setDrawerGate] = useState(null)

  // Sort gates by wait time descending (worst first)
  const sortedGates = [...gates].sort((a, b) => b.waitMin - a.waitMin)

  const handleRecAction = (recId, action) => {
    onUpdateRecs(recommendations.map(r =>
      r.id === recId ? { ...r, status: action } : r
    ))
  }

  const drawerData = drawerGate ? gates.find(g => g.id === drawerGate) : null

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{
          fontFamily: HANKEN, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: C.red,
        }}>
          Command center
        </span>
      </div>

      {/* Heatmap + gate strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Heatmap */}
        <div className="ff-dash-card" style={{ padding: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, boxShadow: `0 0 8px ${C.red}` }} />
            Live crowd heatmap
          </div>
          <StadiumMap
            zones={zones}
            gates={gates}
            mode="heatmap"
            accent={C.red}
            onGateClick={(id) => setDrawerGate(id)}
          />
          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            <Legend color="#2fa24e" label="< 65%" />
            <Legend color="#ffa500" label="65–85%" />
            <Legend color="#e23a45" label="> 85%" />
          </div>
        </div>

        {/* Gate wait-time strip */}
        <div className="ff-dash-card" style={{ padding: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
          }}>
            Gate wait times (worst first)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedGates.map(g => {
              const warn = g.density >= 85
              return (
                <button
                  key={g.id}
                  onClick={() => setDrawerGate(g.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 10, background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${warn ? 'rgba(226,58,69,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: g.isClosed ? '#6c6c6c' : warn ? '#e23a45' : g.density >= 65 ? '#ffa500' : '#2fa24e',
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f4', minWidth: 56 }}>
                    Gate {g.id}
                  </span>
                  <span style={{ flex: 1 }}>
                    <Sparkline data={g.trend} color={warn ? '#e23a45' : '#9a9a9a'} width={60} height={20} />
                  </span>
                  <span style={{
                    fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 18,
                    color: g.isClosed ? '#6c6c6c' : warn ? '#e23a45' : '#f4f4f4',
                  }}>
                    {g.isClosed ? '—' : `${g.waitMin}m`}
                  </span>
                  <span style={{ fontSize: 11, color: '#6c6c6c', minWidth: 40, textAlign: 'right' }}>
                    {g.isClosed ? 'Closed' : `${g.density}%`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Auto-briefing feed */}
      <div className="ff-dash-card" style={{ padding: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>System recommendations</span>
          <button
            onClick={() => nav('organizer-briefings')}
            style={{ border: 'none', background: 'none', color: C.red, fontSize: 12, cursor: 'pointer', fontWeight: 600, fontFamily: HANKEN }}
          >
            View all →
          </button>
        </div>
        {recommendations.filter(r => r.status === 'pending').length === 0 ? (
          <div className="ff-empty">
            <span className="ff-empty-icon">✅</span>
            <p className="ff-empty-text">All recommendations have been addressed.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommendations.filter(r => r.status === 'pending').map(r => (
              <div key={r.id} style={{
                padding: 20, borderRadius: 14,
                background: r.priority === 'high' ? 'rgba(226,58,69,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${r.priority === 'high' ? 'rgba(226,58,69,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span className={`ff-chip ff-chip-${r.priority}`} style={{ marginTop: 2 }}>
                    {r.priority}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#f4f4f4' }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: '#9a9a9a', marginTop: 6, lineHeight: 1.5 }}>{r.body}</div>
                    {r.impact && (
                      <div style={{
                        marginTop: 10, padding: '8px 14px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)', display: 'inline-flex', gap: 12,
                        fontSize: 12, color: '#9a9a9a',
                      }}>
                        <span>{r.impact.metric}:</span>
                        <span style={{ color: '#6c6c6c' }}>{r.impact.from}</span>
                        <span>→</span>
                        <span style={{ color: '#2fa24e', fontWeight: 600 }}>{r.impact.to}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleRecAction(r.id, 'dismissed')}
                    style={{
                      padding: '8px 18px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)',
                      background: 'transparent', color: '#9a9a9a', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                    }}
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleRecAction(r.id, 'accepted')}
                    style={{
                      padding: '8px 18px', borderRadius: 20, border: 'none',
                      background: C.red, color: '#fff', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                    }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gate detail drawer */}
      {drawerData && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 43, background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setDrawerGate(null)}
          />
          <div className="ff-drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 22, color: '#f4f4f4' }}>
                Gate {drawerData.id}
              </h3>
              <button
                onClick={() => setDrawerGate(null)}
                aria-label="Close"
                style={{ border: 'none', background: 'none', color: '#6c6c6c', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 32, color: drawerData.density >= 85 ? '#e23a45' : '#f4f4f4' }}>
                  {drawerData.waitMin}m
                </div>
                <div style={{ fontSize: 12, color: '#6c6c6c' }}>Wait time</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 32, color: '#f4f4f4' }}>
                  {drawerData.density}%
                </div>
                <div style={{ fontSize: 12, color: '#6c6c6c' }}>Density</div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#6c6c6c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Trend (last 30 min)
              </div>
              <Sparkline data={drawerData.trend} color={C.red} width={320} height={60} />
            </div>
            <button
              onClick={() => setDrawerGate(null)}
              style={{
                width: '100%', padding: '13px', borderRadius: 32, border: 'none',
                background: C.red, color: '#fff', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Dispatch staff to gate {drawerData.id}
            </button>
          </div>
        </>
      )}
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
