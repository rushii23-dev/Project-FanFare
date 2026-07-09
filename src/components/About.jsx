import { BRICOLAGE, HANKEN, eyebrow, ctaWhite, section } from './ui.js'
import { BrandMark } from './Nav.jsx'
import { problems, stats, commitments } from '../data.js'

export default function About({ handlers }) {
  return (
    <div>
      {/* hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '180px 40px 88px',
          background: 'radial-gradient(100% 130% at 50% -10%, #181818 0%, #070707 62%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(46% 52% at 50% 0%, rgba(255,255,255,0.12), rgba(255,255,255,0) 70%)',
            opacity: 'var(--ff-glow,0.7)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <span style={eyebrow}>Why FanFare</span>
          <h1
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 700,
              fontSize: 'clamp(44px,6.4vw,84px)',
              lineHeight: 0.96,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: '#f4f4f4',
              marginTop: 18,
            }}
          >
            A World Cup is a city that appears overnight
          </h1>
          <p
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 400,
              fontSize: 19,
              lineHeight: 1.5,
              color: '#cfcfcf',
              marginTop: 26,
              letterSpacing: '0.005em',
            }}
          >
            Three million visitors. Dozens of languages. Twelve stadiums moving hundreds of thousands of people
            an hour. The magic is real — and so is the friction. FanFare exists to remove the friction so the
            magic can breathe.
          </p>
        </div>
      </section>

      {/* the problem */}
      <section style={section('72px 40px')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          <div>
            <span style={eyebrow}>The problem</span>
            <h2
              style={{
                fontFamily: HANKEN,
                fontWeight: 600,
                fontSize: 'clamp(30px,3.6vw,42px)',
                lineHeight: 1.06,
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                color: '#f4f4f4',
                marginTop: 16,
              }}
            >
              Big events break at the seams no one sees
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {problems.map((pr, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ color: pr.accent, fontSize: 17, lineHeight: 1.5 }}>◆</span>
                <p style={{ fontSize: 17, lineHeight: 1.55, color: '#cfcfcf' }}>{pr.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* stats */}
      <section style={section('56px 40px')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {stats.map((st, i) => (
            <div
              key={i}
              className="ff-light ff-lift"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: 32,
              }}
            >
              <div
                style={{
                  fontFamily: BRICOLAGE,
                  fontWeight: 700,
                  fontSize: 52,
                  lineHeight: 0.95,
                  color: st.accent,
                  letterSpacing: '-0.01em',
                }}
              >
                {st.value}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.4, color: '#9a9a9a', marginTop: 14 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* commitments */}
      <section style={section('72px 40px')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {commitments.map((c, i) => (
            <div
              key={i}
              className="ff-light ff-lift"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: 36,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{ display: 'block', width: 36, height: 3, borderRadius: 2, background: c.accent, marginBottom: 20 }}
              />
              <span style={{ fontSize: 30 }}>{c.glyph}</span>
              <h3
                style={{
                  fontFamily: HANKEN,
                  fontWeight: 600,
                  fontSize: 23,
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em',
                  color: '#f4f4f4',
                  marginTop: 22,
                }}
              >
                {c.title}
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: '#9a9a9a', marginTop: 14 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* closing CTA */}
      <section style={section('56px 40px 112px')}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 72, textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: HANKEN,
              fontWeight: 600,
              fontSize: 'clamp(30px,3.8vw,46px)',
              lineHeight: 1.04,
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              color: '#f4f4f4',
              maxWidth: 680,
              margin: '0 auto',
            }}
          >
            Ready to walk into the ground?
          </h2>
          <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#" onClick={handlers.goLogin} className="ff-cta" style={{ ...ctaWhite, padding: '17px 34px' }}>
              Enter FanFare
            </a>
            <a
              href="#"
              onClick={handlers.goHome}
              className="ff-light ff-outline"
              style={{
                fontFamily: HANKEN,
                fontWeight: 500,
                fontSize: 15,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#f4f4f4',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '16px 30px',
                borderRadius: 32,
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </section>

      {/* slim footer */}
      <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '56px 40px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrandMark size={24} dot={8} animate={false} />
            <span
              style={{
                fontFamily: BRICOLAGE,
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: '#f4f4f4',
              }}
            >
              FanFare
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#6c6c6c' }}>© 2026 FanFare · Independent concept platform.</span>
        </div>
      </footer>
    </div>
  )
}
