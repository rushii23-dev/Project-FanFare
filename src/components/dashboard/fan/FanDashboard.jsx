import { useState, useEffect } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { matchData, C } from '../../../data.js'
import TicketModal from '../shared/TicketModal.jsx'

// Fan Dashboard Home — "Your matchday at a glance"
export default function FanDashboard({ nav, fanProfile, zones, gates }) {
  const [showTicket, setShowTicket] = useState(false)
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 })

  // Live countdown to kickoff
  useEffect(() => {
    const kick = new Date(matchData.kickoff).getTime()
    const tick = () => {
      const diff = Math.max(0, kick - Date.now())
      setCountdown({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const myGate = gates.find(g => g.id === fanProfile.gate) || gates[0]
  const myZone = zones.find(z => z.id === myGate?.zone)

  const quickActions = [
    { id: 'fan-concierge', icon: '💬', label: 'AI Concierge' },
    { id: 'fan-map', icon: '🗺', label: 'Live Map' },
    { id: 'fan-accessibility', icon: '♿', label: 'Accessibility' },
    { id: 'fan-transport', icon: '🚇', label: 'Transport' },
    { id: 'fan-notifications', icon: '🔔', label: 'Notifications' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{
          fontFamily: HANKEN, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: C.blue,
        }}>
          Your matchday at a glance
        </span>
      </div>

      {/* ===== COUNTDOWN HERO ===== */}
      <div className="ff-dash-card" style={{
        position: 'relative', overflow: 'hidden', padding: 32, marginBottom: 24,
        background: 'linear-gradient(135deg, #111111 0%, #0e1a24 100%)',
        border: '1px solid rgba(42,165,224,0.2)',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '-40%', right: '-10%', width: '50%', height: '150%',
          background: 'radial-gradient(circle, rgba(42,165,224,0.12), transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{matchData.homeFlag}</span>
              <span style={{
                fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
                color: '#f4f4f4', letterSpacing: '-0.01em',
              }}>
                {matchData.homeCode}
              </span>
              <span style={{ fontSize: 14, color: '#6c6c6c', fontWeight: 500 }}>vs</span>
              <span style={{
                fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
                color: '#f4f4f4', letterSpacing: '-0.01em',
              }}>
                {matchData.awayCode}
              </span>
              <span style={{ fontSize: 32 }}>{matchData.awayFlag}</span>
            </div>
            <div style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 6 }}>{matchData.round}</div>
            <div style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 16 }}>
              {matchData.venue} · {matchData.city}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px',
              background: 'rgba(42,165,224,0.1)', borderRadius: 10,
              border: '1px solid rgba(42,165,224,0.2)', fontSize: 13, color: '#cfcfcf',
            }}>
              🎟️ Gate {fanProfile.gate} · Sec {fanProfile.section} · Row {fanProfile.row} · Seat {fanProfile.seat}
            </div>
          </div>

          <div style={{ textAlign: 'center', minWidth: 180 }}>
            <div style={{ fontSize: 11, color: '#6c6c6c', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
              Kickoff in
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[
                { v: countdown.h, l: 'h' },
                { v: countdown.m, l: 'm' },
                { v: countdown.s, l: 's' },
              ].map(u => (
                <div key={u.l} style={{
                  background: 'rgba(42,165,224,0.1)', border: '1px solid rgba(42,165,224,0.2)',
                  borderRadius: 10, padding: '10px 14px', minWidth: 52, textAlign: 'center',
                }}>
                  <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28, color: C.blue }}>
                    {String(u.v).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 10, color: '#6c6c6c', textTransform: 'uppercase' }}>{u.l}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowTicket(true)}
              className="ff-cta"
              style={{
                marginTop: 16, padding: '11px 28px', borderRadius: 32, border: 'none',
                background: C.blue, color: '#fff', fontFamily: HANKEN, fontWeight: 600,
                fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              View e-ticket
            </button>
          </div>
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {quickActions.map(qa => (
          <button
            key={qa.id}
            className="ff-dash-card interactive"
            onClick={() => nav(qa.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, padding: 20, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)',
              background: '#111111', borderRadius: 14, textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 26 }}>{qa.icon}</span>
            <span style={{ fontSize: 13, color: '#cfcfcf', fontWeight: 500 }}>{qa.label}</span>
          </button>
        ))}
      </div>

      {/* ===== LIVE NOW ===== */}
      <div className="ff-dash-card" style={{ padding: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: C.blue, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: C.blue,
            boxShadow: `0 0 8px ${C.blue}`,
          }} />
          Live now
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: '#6c6c6c', marginBottom: 6 }}>Your gate wait time</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 36, color: myGate.waitMin > 8 ? '#e23a45' : '#f4f4f4' }}>
                {myGate.waitMin}
              </span>
              <span style={{ fontSize: 14, color: '#9a9a9a' }}>min at Gate {myGate.id}</span>
            </div>
            {myGate.waitMin > 8 && (
              <div style={{
                marginTop: 10, padding: '8px 14px', borderRadius: 8,
                background: 'rgba(47,162,78,0.1)', border: '1px solid rgba(47,162,78,0.2)',
                fontSize: 13, color: '#2fa24e',
              }}>
                💡 Gate D is quieter — 2 min wait
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#6c6c6c', marginBottom: 6 }}>Crowd status</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 36, color: '#f4f4f4' }}>
                {myZone ? Math.round((myZone.current / myZone.capacity) * 100) : '--'}%
              </span>
              <span style={{ fontSize: 14, color: '#9a9a9a' }}>
                {myZone?.name || 'Your zone'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket modal */}
      {showTicket && (
        <TicketModal
          ticket={fanProfile}
          matchData={matchData}
          onClose={() => setShowTicket(false)}
        />
      )}
    </div>
  )
}
