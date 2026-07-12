import { useState } from 'react'
import { BRICOLAGE, HANKEN, FIFA_TRIAD } from './ui.js'
import { BrandMark } from './Nav.jsx'
import AuthShell from './AuthShell.jsx'
import { roleDefs, roleMeta, roleAccent } from '../data.js'

export default function Login({ handlers, role, setRole }) {
  const roleIdx = roleDefs.findIndex((r) => r.id === role)
  const activeT = FIFA_TRIAD[(roleIdx < 0 ? 0 : roleIdx) % 3]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  // Demo auth: there is no backend to verify against, but the door still
  // requires credentials — you cannot enter a portal with empty fields.
  // The password is used only for this check and is never stored anywhere.
  const submit = (e) => {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setErr('Please enter a valid email address.')
      return
    }
    if (!password) {
      setErr('Please enter your password.')
      return
    }
    handlers.goDashboard(role)
  }

  return (
    <AuthShell>
      <div className="ff-fieldin ff-fi1" style={{ textAlign: 'center', marginBottom: 30 }}>
        <span style={{ display: 'inline-flex', marginBottom: 14 }}><BrandMark size={40} /></span>
        <h2 style={{
          fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 32, lineHeight: 1,
          letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#08210f',
        }}>
          Welcome to Fan<span className="ff-tricolor" style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fare</span>
        </h2>
        <p style={{ fontSize: 15, color: '#4a6555', marginTop: 12 }}>
          Choose how you're joining the tournament.
        </p>
      </div>

      {/* role segmented control */}
      <div className="ff-fieldin ff-fi2" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
        background: '#eef8f0', padding: 6, borderRadius: 32, marginBottom: 26,
        border: '1px solid rgba(14,159,79,0.14)',
      }}>
        {roleDefs.map((rd, i) => {
          const active = role === rd.id
          const t = FIFA_TRIAD[i % 3]
          return (
            <button
              key={rd.id}
              className="ff-press"
              onClick={(e) => { e.preventDefault(); setRole(rd.id) }}
              style={{
                border: 'none', cursor: 'pointer', fontFamily: HANKEN, fontSize: 13, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', padding: '11px 0', borderRadius: 28,
                background: active ? roleAccent[rd.id] : 'transparent',
                color: active ? '#ffffff' : '#5a7565',
                boxShadow: active ? `0 6px 18px ${t.glow}` : 'none',
              }}
            >
              {rd.label}
            </button>
          )
        })}
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={submit}>
        <input
          type="email" placeholder="Email address" className="ff-login-input ff-fieldin ff-fi3"
          value={email} onChange={(e) => { setEmail(e.target.value); setErr('') }}
        />
        <input
          type="password" placeholder="Password" className="ff-login-input ff-fieldin ff-fi4"
          value={password} onChange={(e) => { setPassword(e.target.value); setErr('') }}
        />
        {err && <div role="alert" style={{ fontSize: 13, color: '#c30026', fontWeight: 600 }}>{err}</div>}
        <button
          type="submit"
          className="ff-btn ff-fieldin ff-fi5"
          style={{
            textAlign: 'center', fontFamily: HANKEN, fontWeight: 700, fontSize: 15,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff',
            padding: '16px 22px', borderRadius: 32, marginTop: 6, textShadow: '0 1px 6px rgba(0,0,0,0.3)',
            border: 'none', cursor: 'pointer',
          }}
        >
          Continue as {roleMeta[role] || 'a Fan'}
        </button>
      </form>

      <p className="ff-fieldin ff-fi6" style={{ textAlign: 'center', fontSize: 14, color: '#4a6555', marginTop: 22 }}>
        New here?{' '}
        <a href="#" onClick={handlers.goRegister} style={{ color: activeT.c, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Create an account
        </a>
      </p>
      <div className="ff-fieldin ff-fi6" style={{ textAlign: 'center', marginTop: 18 }}>
        <a href="#" onClick={handlers.goHome} style={{ fontSize: 14, color: '#6a8574' }}>
          ← Back to home
        </a>
      </div>
    </AuthShell>
  )
}
