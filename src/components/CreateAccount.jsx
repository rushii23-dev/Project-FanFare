


import { useState } from 'react'
import { BRICOLAGE, HANKEN, FIFA_TRIAD } from './ui.js'
import { BrandMark } from './Nav.jsx'
import AuthShell from './AuthShell.jsx'
import { roleDefs, roleMeta, roleAccent } from '../data.js'

export default function CreateAccount({ handlers, role, setRole }) {
  const roleIdx = roleDefs.findIndex((r) => r.id === role)
  const activeT = FIFA_TRIAD[(roleIdx < 0 ? 0 : roleIdx) % 3]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setErr('Please enter your name to continue.'); return }
    if (!/\S+@\S+\.\S+/.test(email.trim())) { setErr('Please enter a valid email address.'); return }
    if (!password) { setErr('Please create a password.'); return }
    // Ticket details are collected later, inside the fan dashboard — not at
    // sign-up. The password gates entry only; it is never stored anywhere.
    handlers.completeAuth(role, { name: name.trim(), email: email.trim() })
  }

  return (
    <AuthShell maxWidth={468}>
      <form onSubmit={submit}>
        <div className="ff-fieldin ff-fi1" style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ display: 'inline-flex', marginBottom: 14 }}><BrandMark size={40} /></span>
          <h2 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 30, lineHeight: 1.02, letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#08210f' }}>
            Join Fan<span className="ff-tricolor" style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fare</span>
          </h2>
          <p style={{ fontSize: 15, color: '#4a6555', marginTop: 12 }}>Create your account for the 2026 tournament.</p>
        </div>

        {/* role segmented control */}
        <div className="ff-fieldin ff-fi2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, background: '#eef8f0', padding: 6, borderRadius: 32, marginBottom: 20, border: '1px solid rgba(14,159,79,0.14)' }}>
          {roleDefs.map((rd, i) => {
            const active = role === rd.id
            const t = FIFA_TRIAD[i % 3]
            return (
              <button type="button" key={rd.id} className="ff-press" onClick={() => setRole(rd.id)}
                style={{ border: 'none', cursor: 'pointer', fontFamily: HANKEN, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '11px 0', borderRadius: 28, background: active ? roleAccent[rd.id] : 'transparent', color: active ? '#ffffff' : '#5a7565', boxShadow: active ? `0 6px 18px ${t.glow}` : 'none' }}>
                {rd.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <input className="ff-login-input ff-fieldin ff-fi3" placeholder="Full name" value={name} onChange={e => { setName(e.target.value); setErr('') }} />
          <input className="ff-login-input ff-fieldin ff-fi4" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="ff-login-input ff-fieldin ff-fi5" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />

          {role === 'fan' && (
            <p className="ff-fieldin ff-fi5" style={{ fontSize: 12.5, color: '#6a8574', lineHeight: 1.45, display: 'flex', alignItems: 'center', gap: 8, margin: '2px 2px 0' }}>
              <span style={{ color: '#0a7a3c', fontWeight: 700 }}>·</span> You'll add your ticket details on your dashboard — your assistant uses them to guide you to your seat.
            </p>
          )}

          {err && <div style={{ fontSize: 13, color: '#c30026', fontWeight: 600 }}>{err}</div>}

          <button type="submit" className="ff-btn ff-fieldin ff-fi6" style={{ textAlign: 'center', fontFamily: HANKEN, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff', padding: '16px 22px', borderRadius: 32, marginTop: 6, textShadow: '0 1px 6px rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer' }}>
            Create {roleMeta[role] || 'a Fan'} account
          </button>
        </div>

        <p className="ff-fieldin ff-fi6" style={{ textAlign: 'center', fontSize: 14, color: '#4a6555', marginTop: 16 }}>
          Already have an account?{' '}
          <a href="#" onClick={handlers.goLogin} style={{ color: activeT.c, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Log in</a>
        </p>
        <div className="ff-fieldin ff-fi6" style={{ textAlign: 'center', marginTop: 12 }}>
          <a href="#" onClick={handlers.goHome} style={{ fontSize: 14, color: '#6a8574' }}>← Back to home</a>
        </div>
      </form>
    </AuthShell>
  )
}
