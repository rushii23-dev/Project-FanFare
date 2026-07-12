import { useState } from 'react'
import { BRICOLAGE, HANKEN, section } from '../ui.js'
import Icon from './Icons.jsx'
import { LightMotes } from './Fx.jsx'

// The three things FanFare exists for — presented as substance, not decoration.
const PILLARS = [
  {
    icon: 'access', accent: '#37d67f', soft: 'rgba(55,214,127,0.12)', bd: 'rgba(55,214,127,0.34)',
    kicker: 'Accessibility', title: 'Welcomes everyone',
    body: 'Set your needs once and every screen adapts — step-free routes, calmer maps, large text, and a volunteer one tap away.',
  },
  {
    icon: 'leaf', accent: '#f5c451', soft: 'rgba(245,196,81,0.12)', bd: 'rgba(245,196,81,0.34)',
    kicker: 'Sustainability', title: 'Wastes nothing',
    body: 'Photo-based waste sorting, smarter transport nudges and personal carbon tracking turn millions of fans into a lighter footprint.',
  },
  {
    icon: 'shield', accent: '#ff6b7a', soft: 'rgba(255,107,122,0.12)', bd: 'rgba(255,107,122,0.34)',
    kicker: 'Safety', title: 'Protects quietly',
    body: 'Crowd intelligence and instant incident triage move the right people first — before a moment ever becomes an emergency.',
  },
]

export default function ImpactTeaser({ handlers }) {
  const [ballOk, setBallOk] = useState(true)

  return (
    <section style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {/* Animated Background Image */}
      <div style={{
        position: 'absolute', inset: -40,
        backgroundImage:
          'linear-gradient(178deg, rgba(4,13,8,0.82) 0%, rgba(5,17,10,0.78) 42%, rgba(5,20,12,0.94) 100%),' +
          'radial-gradient(120% 100% at 50% -12%, rgba(20,140,80,0.4), transparent 56%),' +
          "url('/assets/hero-stadium.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        animation: 'ff-kenburns 24s alternate infinite ease-in-out',
        pointerEvents: 'none',
      }} />

      <div
        data-reveal
        className="ff-reveal ff-impact"
        style={{
          position: 'relative', width: '100%', padding: 'clamp(56px,7vw,120px) 24px'
        }}
      >
        {/* tri-nation top hairline */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg,#0e9f4f,#7ed957,#f5b301,#e4002b,#0e9f4f)',
          backgroundSize: '220% 100%', animation: 'ff-grad-pan 8s linear infinite',
        }} />
        {/* soft floodlight bloom */}
        <div style={{
          position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
          width: '72%', height: '120%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(210,255,225,0.12), transparent 62%)',
          animation: 'ff-drift 16s ease-in-out infinite',
        }} />
        {/* fine vignette for depth */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          boxShadow: 'inset 0 0 160px 40px rgba(2,10,6,0.6)',
        }} />
        <LightMotes count={12} zIndex={1} color="rgba(210,255,225,0.85)" />

        <div style={{ position: 'relative', maxWidth: 1120, margin: '0 auto' }}>
          {/* ── header ── */}
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22,
              fontFamily: HANKEN, fontWeight: 700, fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase',
              color: '#8fe6b4',
            }}>
              <span style={{ width: 26, height: 2, borderRadius: 2, background: 'linear-gradient(90deg,#0e9f4f,#f5b301,#e4002b)' }} />
              The FanFare promise
            </span>

            <h2 style={{
              fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(34px,5vw,64px)',
              lineHeight: 1.03, letterSpacing: '-0.02em', color: '#ffffff',
              textShadow: '0 4px 30px rgba(0,20,10,0.55)',
            }}>
              A World Cup for everyone,{' '}
              <span style={{
                backgroundImage: 'linear-gradient(100deg,#7dffb0,#eaff9e,#ffd76a)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                that wastes nothing
              </span>
            </h2>

            <p style={{
              fontFamily: HANKEN, fontWeight: 400, fontSize: 'clamp(15px,1.5vw,18px)', lineHeight: 1.6,
              color: '#cfe6d6', maxWidth: 600, margin: '22px auto 0',
            }}>
              Accessibility, sustainability and safety aren&rsquo;t features bolted on afterwards —
              they&rsquo;re the reason FanFare exists.
            </p>
          </div>

          {/* ── three pillars ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 268px), 1fr))',
            gap: 18, marginTop: 'clamp(40px,5vw,60px)',
          }}>
            {PILLARS.map((p) => (
              <div
                key={p.kicker}
                className="ff-impact-pillar"
                style={{
                  position: 'relative', overflow: 'hidden', borderRadius: 20, padding: '30px 26px',
                  background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                  '--pc': p.bd,
                }}
              >
                <span style={{
                  position: 'absolute', top: 0, left: 26, right: 26, height: 2, borderRadius: 2,
                  background: `linear-gradient(90deg, ${p.accent}, transparent)`,
                }} />
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 48, height: 48, borderRadius: 14, color: p.accent,
                  background: p.soft, border: `1px solid ${p.bd}`,
                }}>
                  <Icon name={p.icon} size={23} />
                </span>
                <div style={{
                  fontFamily: HANKEN, fontWeight: 700, fontSize: 11, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: p.accent, marginTop: 20,
                }}>
                  {p.kicker}
                </div>
                <h3 style={{
                  fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 21, lineHeight: 1.12,
                  letterSpacing: '-0.01em', color: '#ffffff', marginTop: 6,
                }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#b6d2c2', marginTop: 12 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          {/* ── CTA row ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
            flexWrap: 'wrap', marginTop: 'clamp(40px,5vw,58px)',
          }}>
            {ballOk ? (
              <img
                src="/assets/fifa-ball-2026.png"
                alt=""
                onError={() => setBallOk(false)}
                style={{ width: 46, height: 46, objectFit: 'contain', animation: 'ff-float 4.2s ease-in-out infinite', filter: 'drop-shadow(0 10px 16px rgba(0,30,14,0.5))' }}
              />
            ) : null}
            <a
              href="#"
              onClick={handlers.goAbout}
              className="ff-btn"
              style={{
                padding: '16px 34px', borderRadius: 40, fontFamily: HANKEN, fontWeight: 700, fontSize: 14.5,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,0.3)',
              }}
            >
              Explore our impact
            </a>
            <a
              href="#"
              onClick={handlers.goHow}
              style={{
                fontFamily: HANKEN, fontWeight: 700, fontSize: 14.5, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#eafff0', border: '1px solid rgba(255,255,255,0.34)', padding: '15px 30px', borderRadius: 40,
                background: 'rgba(255,255,255,0.06)', transition: 'background .25s, border-color .25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.34)' }}
            >
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
