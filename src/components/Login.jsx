import { BRICOLAGE, HANKEN } from './ui.js'
import { roleDefs, roleMeta } from '../data.js'

export default function Login({ handlers, role, setRole }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 72px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(70% 62% at 50% 0%, #181818 0%, #070707 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(40% 42% at 50% 10%, rgba(255,255,255,0.10), rgba(255,255,255,0) 70%)',
          opacity: 'var(--ff-glow,0.7)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14,
          padding: 40,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg,#2aa5e0 0%,#2fa24e 50%,#e23a45 100%)',
          }}
        />
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 700,
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: '#f4f4f4',
            }}
          >
            Welcome to FanFare
          </h2>
          <p style={{ fontSize: 15, color: '#9a9a9a', marginTop: 12 }}>
            Choose how you're joining the tournament.
          </p>
        </div>

        {/* role segmented control */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 8,
            background: '#1c1c1c',
            padding: 6,
            borderRadius: 32,
            marginBottom: 28,
          }}
        >
          {roleDefs.map((rd) => {
            const active = role === rd.id
            return (
              <button
                key={rd.id}
                onClick={(e) => {
                  e.preventDefault()
                  setRole(rd.id)
                }}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: HANKEN,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '11px 0',
                  borderRadius: 32,
                  transition: 'all .18s',
                  background: active ? '#2aa5e0' : 'transparent',
                  color: active ? '#ffffff' : '#9a9a9a',
                  boxShadow: active ? '0 4px 16px rgba(42,165,224,0.35)' : 'none',
                }}
              >
                {rd.label}
              </button>
            )
          })}
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Email address" className="ff-input" />
          <input type="password" placeholder="Password" className="ff-input" />
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handlers.goDashboard(role) }}
            className="ff-cta"
            style={{
              textAlign: 'center',
              fontFamily: HANKEN,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#ffffff',
              background: '#2aa5e0',
              padding: '16px 22px',
              borderRadius: 32,
              marginTop: 6,
            }}
          >
            Continue as {roleMeta[role] || 'a Fan'}
          </a>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#9a9a9a', marginTop: 22 }}>
          New here?{' '}
          <a href="#" onClick={handlers.goHome} style={{ color: '#2aa5e0', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Create an account
          </a>
        </p>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="#" onClick={handlers.goHome} style={{ fontSize: 14, color: '#6c6c6c' }}>
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
