import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { languages, C } from '../../../data.js'

// Fan Profile & Settings — editable profile, accessibility sync, language, logout
export default function FanProfile({ nav, fanProfile, onUpdateProfile, onLogout }) {
  const [name, setName] = useState(fanProfile.name)
  const [email, setEmail] = useState(fanProfile.email)
  const [lang, setLang] = useState(fanProfile.language)
  const [saved, setSaved] = useState(false)
  const acc = fanProfile.accessibility

  const handleSave = () => {
    onUpdateProfile({ ...fanProfile, name, email, language: lang })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const togglePref = (key) => {
    onUpdateProfile({
      ...fanProfile,
      accessibility: { ...acc, [key]: !acc[key] },
    })
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('fan-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 24,
      }}>
        Profile & Settings
      </h2>

      {/* Personal info */}
      <div className="ff-dash-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 20,
        }}>
          Personal information
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6c6c6c', display: 'block', marginBottom: 6 }}>
              Full name
            </label>
            <input
              className="ff-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6c6c6c', display: 'block', marginBottom: 6 }}>
              Email address
            </label>
            <input
              className="ff-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6c6c6c', display: 'block', marginBottom: 6 }}>
              Language preference
            </label>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={{
                width: '100%', background: '#0e0e0e', border: '1px solid #333',
                color: '#f4f4f4', padding: '14px 18px', borderRadius: 32,
                fontSize: 15, fontFamily: HANKEN,
              }}
            >
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="ff-cta"
          style={{
            marginTop: 20, padding: '13px 28px', borderRadius: 32, border: 'none',
            background: saved ? '#2fa24e' : C.blue, color: '#fff', fontFamily: HANKEN,
            fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.3s',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          {saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>

      {/* Accessibility profile (same data as FanAccessibility — single source of truth) */}
      <div className="ff-dash-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
        }}>
          Accessibility preferences
        </div>
        {Object.entries(acc).map(([key, val]) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: 14, color: '#cfcfcf', textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </span>
            <button
              className={`ff-toggle${val ? ' on' : ''}`}
              onClick={() => togglePref(key)}
              aria-label={`${key}: ${val ? 'on' : 'off'}`}
              role="switch"
              aria-checked={val}
            />
          </div>
        ))}
        <div style={{ fontSize: 12, color: '#4a4a4a', marginTop: 12 }}>
          Changes here sync to your Accessibility Hub automatically.
        </div>
      </div>

      {/* Log out */}
      <button
        onClick={onLogout}
        style={{
          width: '100%', padding: '14px', borderRadius: 12,
          border: '1px solid rgba(226,58,69,0.25)', background: 'rgba(226,58,69,0.04)',
          color: '#e23a45', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          fontFamily: HANKEN,
        }}
      >
        Log out
      </button>
    </div>
  )
}
