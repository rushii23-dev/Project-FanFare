import { BRICOLAGE, HANKEN, eyebrow, section } from '../ui.js'
import { aiFeatures } from '../../data.js'

export default function AIStrip() {
  return (
    <section style={section('88px 40px')}>
      <div
        data-reveal
        className="ff-reveal"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 22,
          padding: '64px 56px',
          background: 'linear-gradient(150deg, #151515 0%, #0b0b0b 62%)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '60%',
            height: '160%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0) 65%)',
            opacity: 'var(--ff-glow,0.7)',
            animation: 'ff-drift 12s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 56,
            alignItems: 'center',
          }}
        >
          <div>
            <span style={eyebrow}>Quiet intelligence</span>
            <h2
              style={{
                fontFamily: BRICOLAGE,
                fontWeight: 700,
                fontSize: 'clamp(36px,4.6vw,58px)',
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
                color: '#f4f4f4',
                marginTop: 16,
              }}
            >
              Help that arrives before you ask
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#9a9a9a', marginTop: 20, maxWidth: 440 }}>
              FanFare's assistance runs in the background — answering in your language, reading the crowd,
              sorting waste from a photo, drafting a report from a few spoken words. No dashboards to learn. It
              just works.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {aiFeatures.map((a, i) => (
              <div
                key={i}
                className="ff-light ff-airow"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: '16px 20px',
                }}
              >
                <span style={{ fontSize: 22, flex: 'none' }}>{a.glyph}</span>
                <div>
                  <div
                    style={{
                      fontFamily: HANKEN,
                      fontWeight: 600,
                      fontSize: 15,
                      letterSpacing: '0.02em',
                      color: '#f4f4f4',
                    }}
                  >
                    {a.title}
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.4, color: '#9a9a9a', marginTop: 2 }}>{a.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
