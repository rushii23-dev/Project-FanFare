import { BRICOLAGE, HANKEN, section, FIFA_TRIAD } from './ui.js'
import { BrandMark } from './Nav.jsx'
import { Eyebrow, SunWash, LightMotes, Confetti } from './landing/Fx.jsx'
import Icon from './landing/Icons.jsx'
import { problems, commitments } from '../data.js'

const COMMIT_ICONS = ['access', 'leaf', 'ring']

export default function About({ handlers }) {
  return (
    <div style={{ background: '#ffffff' }}>
      {/* ── hero: dramatic stadium-night band ── */}
      <section
        style={{
          position: 'relative', overflow: 'hidden', padding: '190px 40px 108px',
          background: 'radial-gradient(120% 130% at 50% -10%, #0b2a18 0%, #061a0f 46%, #05100a 100%)',
        }}
      >
        {/* tri-nation top hairline */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg,#0e9f4f,#7ed957,#f5b301,#e4002b,#0e9f4f)',
          backgroundSize: '220% 100%', animation: 'ff-grad-pan 8s linear infinite',
        }} />
        {/* colour pooling */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(50% 60% at 24% 0%, rgba(14,159,79,0.4), transparent 60%), radial-gradient(46% 56% at 82% 6%, rgba(245,179,1,0.32), transparent 62%)',
        }} />
        {/* floodlight bloom */}
        <div style={{
          position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: '120%',
          background: 'radial-gradient(circle, rgba(220,255,230,0.16), transparent 62%)',
          animation: 'ff-drift 14s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <LightMotes count={22} zIndex={1} color="rgba(210,255,225,0.9)" />
        <Confetti count={16} zIndex={1} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex' }}>
            <Eyebrow>Why FanFare</Eyebrow>
          </span>
          <h1
            style={{
              fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(44px,6.4vw,84px)',
              lineHeight: 0.96, letterSpacing: '-0.02em', textTransform: 'uppercase',
              color: '#ffffff', marginTop: 20, textShadow: '0 6px 34px rgba(0,0,0,0.5)',
            }}
          >
            A World Cup is a city that{' '}
            <span
              className="ff-tricolor"
              style={{
                backgroundImage: 'linear-gradient(100deg,#7dffb0,#eaff9e,#ffd76a,#ff9db0)',
                backgroundSize: '220% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              appears overnight
            </span>
          </h1>
          <p
            style={{
              fontFamily: HANKEN, fontWeight: 400, fontSize: 19, lineHeight: 1.55,
              color: '#c7e7d2', marginTop: 26, maxWidth: 720, margin: '26px auto 0',
            }}
          >
            Three million visitors. Dozens of languages. Twelve stadiums moving hundreds of thousands
            of people an hour. The magic is real — and so is the friction. FanFare exists to remove
            the friction so the magic can breathe.
          </p>
        </div>
      </section>

      {/* ── the problem (bright) ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <SunWash opacity={0.8} />
        <div style={{ ...section('96px 40px 72px'), position: 'relative' }}>
          <div className="ff-about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2
                style={{
                  fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(30px,3.8vw,46px)',
                  lineHeight: 1.04, letterSpacing: '-0.01em', color: '#08210f', marginTop: 16,
                }}
              >
                Big events break at the seams no one sees
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {problems.map((pr, i) => {
                const t = FIFA_TRIAD[i % 3]
                return (
                  <div key={i} className="ff-frow" style={{
                    display: 'flex', gap: 16, alignItems: 'flex-start', padding: '18px 20px',
                    background: '#ffffff', border: '1px solid rgba(14,159,79,0.14)', borderRadius: 14,
                    boxShadow: '0 8px 22px rgba(10,60,30,0.05)', '--acc': t.c,
                  }}>
                    <span style={{ color: t.c, fontSize: 15, lineHeight: 1.6, flex: 'none' }}>◆</span>
                    <p style={{ fontSize: 16.5, lineHeight: 1.55, color: '#37533f' }}>{pr.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── commitments (bright cards) ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <SunWash opacity={0.7} />
        <div style={{ ...section('72px 40px'), position: 'relative' }}>
          <div className="ff-commit-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {commitments.map((c, i) => {
              const t = FIFA_TRIAD[i % 3]
              return (
                <div
                  key={i}
                  className="ff-fcard ff-gborder"
                  style={{
                    position: 'relative', overflow: 'hidden', background: '#ffffff',
                    border: '1px solid rgba(14,159,79,0.14)', borderRadius: 20, padding: 36,
                    display: 'flex', flexDirection: 'column', boxShadow: '0 14px 40px rgba(10,60,30,0.06)',
                    '--acc': t.border, '--acc-glow': t.glow,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '-40%', right: '-20%', width: '70%', height: '80%',
                    background: `radial-gradient(circle, ${t.soft}, transparent 66%)`, pointerEvents: 'none',
                  }} />
                  <span style={{ position: 'relative', display: 'block', width: 40, height: 4, borderRadius: 3, background: t.c, boxShadow: `0 0 12px ${t.c}`, marginBottom: 22 }} />
                  <span style={{
                    position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 56, height: 56, borderRadius: 14, color: t.c,
                    background: t.soft, border: `1px solid ${t.border}`,
                  }}><Icon name={COMMIT_ICONS[i % COMMIT_ICONS.length]} size={26} /></span>
                  <h3
                    style={{
                      position: 'relative', fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 24,
                      lineHeight: 1.1, color: '#08210f', marginTop: 22,
                    }}
                  >
                    {c.title}
                  </h3>
                  <p style={{ position: 'relative', fontSize: 15.5, lineHeight: 1.55, color: '#4a6555', marginTop: 14 }}>{c.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── closing CTA: green pitch panel ── */}
      <section style={section('56px 40px 112px')}>
        <div
          style={{
            position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '84px 48px', textAlign: 'center',
            background: 'radial-gradient(120% 120% at 50% 0%, #1fb85c 0%, #0e9f4f 44%, #0a7a3c 100%)',
            border: '1px solid rgba(126,217,87,0.4)', boxShadow: '0 30px 80px rgba(10,90,45,0.3)',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 80px, rgba(0,0,0,0.03) 80px 160px)',
          }} />
          <LightMotes count={12} zIndex={1} color="rgba(255,248,220,0.95)" />
          <h2
            style={{
              position: 'relative', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(32px,4vw,52px)',
              lineHeight: 1.02, letterSpacing: '-0.01em', color: '#ffffff', maxWidth: 680, margin: '0 auto',
              textShadow: '0 3px 20px rgba(0,40,18,0.4)',
            }}
          >
            Ready to walk into the ground?
          </h2>
          <div style={{ position: 'relative', marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#" onClick={handlers.goRegister} className="ff-btn" style={{
              padding: '17px 34px', borderRadius: 40, fontFamily: HANKEN, fontWeight: 700, fontSize: 15,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,0.3)',
            }}>
              Enter FanFare
            </a>
            <a href="#" onClick={handlers.goHome} className="ff-ghost" style={{
              fontFamily: HANKEN, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#ffffff', border: '1px solid rgba(255,255,255,0.6)', padding: '16px 30px', borderRadius: 40,
              background: 'rgba(255,255,255,0.12)',
            }}>
              Back to home
            </a>
          </div>
        </div>
      </section>

      {/* slim footer */}
      <footer style={{ position: 'relative', background: 'linear-gradient(180deg,#eef8f0,#e3f2e6)', borderTop: '1px solid rgba(14,159,79,0.16)' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '56px 40px 40px',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrandMark size={24} animate={false} />
            <span style={{
              fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 20, letterSpacing: '0.02em',
              textTransform: 'uppercase', color: '#08210f',
            }}>
              Fan<span className="ff-tricolor" style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fare</span>
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#6a8574' }}>© 2026 FanFare · Independent concept platform.</span>
        </div>
      </footer>
    </div>
  )
}
