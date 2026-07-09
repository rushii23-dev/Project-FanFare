import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'

// Accessibility Hub — fan's saved profile, toggles, volunteer help request
export default function FanAccessibility({ nav, fanProfile, onUpdateProfile }) {
  const [helpRequested, setHelpRequested] = useState(false)
  const acc = fanProfile.accessibility

  const togglePref = (key) => {
    onUpdateProfile({
      ...fanProfile,
      accessibility: { ...acc, [key]: !acc[key] },
    })
  }

  const prefs = [
    { key: 'wheelchair', label: 'Wheelchair access', desc: 'Accessible routes, ramps, and seating areas', icon: '♿' },
    { key: 'sensory', label: 'Sensory-sensitive routing', desc: 'Quieter paths, sensory room directions, reduced stimuli', icon: '🧩' },
    { key: 'largeText', label: 'Large text', desc: 'Increase text size across all screens', icon: '🔤' },
    { key: 'audioContent', label: 'Audio content', desc: 'Audio descriptions and voice navigation', icon: '🔊' },
  ]

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('fan-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Accessibility Hub
      </h2>
      <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 28 }}>
        Set your needs once — every screen adapts. Help is one tap away.
      </p>

      {/* Accessibility toggles */}
      <div className="ff-dash-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 20,
        }}>
          Your accessibility profile
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {prefs.map((p, i) => (
            <div key={p.key} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <span style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f4f4f4' }}>{p.label}</div>
                <div style={{ fontSize: 13, color: '#6c6c6c', marginTop: 2 }}>{p.desc}</div>
              </div>
              <button
                className={`ff-toggle${acc[p.key] ? ' on' : ''}`}
                onClick={() => togglePref(p.key)}
                aria-label={`${p.label}: ${acc[p.key] ? 'on' : 'off'}`}
                role="switch"
                aria-checked={acc[p.key]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Request volunteer help */}
      <div className="ff-dash-card" style={{
        padding: 28, textAlign: 'center',
        background: helpRequested ? 'rgba(47,162,78,0.06)' : '#111111',
        borderColor: helpRequested ? 'rgba(47,162,78,0.25)' : undefined,
        transition: 'all 0.3s',
      }}>
        {!helpRequested ? (
          <>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>🙋</span>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f4', marginBottom: 8 }}>
              Need help right now?
            </div>
            <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
              Request a volunteer to come to your location. They'll arrive within minutes.
            </p>
            <button
              onClick={() => setHelpRequested(true)}
              className="ff-cta"
              style={{
                padding: '14px 32px', borderRadius: 32, border: 'none',
                background: C.blue, color: '#fff', fontFamily: HANKEN,
                fontWeight: 600, fontSize: 14, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Request volunteer help
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>✅</span>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#2fa24e', marginBottom: 8 }}>
              Help is on the way
            </div>
            <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 12 }}>
              A volunteer has been notified and is heading to your location.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: 'rgba(47,162,78,0.1)', borderRadius: 10,
              border: '1px solid rgba(47,162,78,0.2)',
            }}>
              <span style={{ fontSize: 14, color: '#2fa24e', fontWeight: 600 }}>
                Estimated arrival: 3–5 minutes
              </span>
            </div>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => setHelpRequested(false)}
                style={{
                  padding: '10px 20px', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                  color: '#9a9a9a', fontSize: 13, cursor: 'pointer',
                }}
              >
                Cancel request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
