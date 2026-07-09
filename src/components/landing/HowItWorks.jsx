import { BRICOLAGE, HANKEN, eyebrow, section } from '../ui.js'
import { steps } from '../../data.js'

export default function HowItWorks() {
  return (
    <section id="how" style={section('128px 40px 88px')}>
      <div data-reveal className="ff-reveal" style={{ maxWidth: 760, marginBottom: 72 }}>
        <span style={eyebrow}>How it works</span>
        <h2
          style={{
            fontFamily: BRICOLAGE,
            fontWeight: 700,
            fontSize: 'clamp(40px,5.4vw,66px)',
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            color: '#f4f4f4',
            marginTop: 18,
          }}
        >
          Three roles.<br />One shared source of&nbsp;truth.
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: '#9a9a9a', marginTop: 20, maxWidth: 520 }}>
          Everyone sees exactly what they need — nothing more. The stadium keeps itself honest, second by
          second.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {steps.map((s) => (
          <div
            key={s.num}
            data-reveal
            className={`ff-reveal ff-light ff-card ${s.dly}`}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18,
              padding: '38px 34px 40px',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -40,
                right: 6,
                fontFamily: BRICOLAGE,
                fontWeight: 700,
                fontSize: 190,
                lineHeight: 1,
                color: s.ghost,
                pointerEvents: 'none',
              }}
            >
              {s.num}
            </span>
            <span
              style={{
                position: 'relative',
                fontFamily: HANKEN,
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: s.accent,
              }}
            >
              Step {s.num}
            </span>
            <h3
              style={{
                position: 'relative',
                fontFamily: BRICOLAGE,
                fontWeight: 500,
                fontSize: 28,
                lineHeight: 1.08,
                letterSpacing: '-0.01em',
                color: '#f4f4f4',
                marginTop: 'auto',
              }}
            >
              {s.title}
            </h3>
            <p style={{ position: 'relative', fontSize: 15, lineHeight: 1.55, color: '#9a9a9a', marginTop: 14 }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
