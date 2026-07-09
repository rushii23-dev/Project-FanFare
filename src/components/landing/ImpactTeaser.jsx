import { useState } from 'react'
import { BRICOLAGE, HANKEN, ctaWhite, section } from '../ui.js'

// Football-pitch impact teaser with the floating FIFA 2026 ball.
// Falls back to a CSS-drawn ball if fifa-ball-2026.png is missing.
export default function ImpactTeaser({ handlers }) {
  const [ballOk, setBallOk] = useState(true)

  return (
    <section style={section('88px 40px 120px')}>
      <div
        data-reveal
        className="ff-reveal"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 22,
          padding: '118px 56px',
          textAlign: 'center',
          background: '#0b0b0b',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        {/* mowed pitch stripes */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.022) 0 90px, rgba(255,255,255,0) 90px 180px)',
            pointerEvents: 'none',
          }}
        />
        {/* pitch markings */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.55, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.14)' }} />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 'min(360px,60%)',
              aspectRatio: '1',
              transform: 'translate(-50%,-50%)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 9,
              height: 9,
              transform: 'translate(-50%,-50%)',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '50%',
            }}
          />
          {[
            { left: -24, top: -24 },
            { right: -24, top: -24 },
            { left: -24, bottom: -24 },
            { right: -24, bottom: -24 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                ...pos,
                width: 70,
                height: 70,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '50%',
              }}
            />
          ))}
        </div>
        {/* slow rotating ring */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 'min(460px,74%)',
            aspectRatio: '1',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'ff-spin 46s linear infinite',
            pointerEvents: 'none',
          }}
        />
        {/* soft glow */}
        <div
          style={{
            position: 'absolute',
            top: '-24%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: '130%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.14), rgba(255,255,255,0) 62%)',
            opacity: 'var(--ff-glow,0.7)',
            animation: 'ff-drift 14s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 96,
              height: 96,
              marginBottom: 26,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 12px 34px rgba(0,0,0,0.55), 0 0 40px rgba(255,255,255,0.18)',
              animation: 'ff-float 4.2s ease-in-out infinite',
              background: ballOk
                ? 'transparent'
                : 'radial-gradient(circle at 38% 32%, #ffffff 0%, #e9e9e9 45%, #b8b8b8 100%)',
            }}
          >
            {ballOk ? (
              <img
                src="/assets/fifa-ball-2026.png"
                alt="FIFA 2026 match ball"
                onError={() => setBallOk(false)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: 46, lineHeight: 1 }}>⚽</span>
            )}
          </div>
          <h2
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 700,
              fontSize: 'clamp(38px,5.2vw,68px)',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: '#f4f4f4',
              maxWidth: 820,
              margin: '0 auto',
            }}
          >
            A tournament that welcomes everyone, wastes&nbsp;nothing
          </h2>
          <p
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 400,
              fontSize: 20,
              lineHeight: 1.5,
              color: '#cfcfcf',
              maxWidth: 600,
              margin: '24px auto 0',
              letterSpacing: '0.005em',
            }}
          >
            Accessibility, sustainability and safety aren't features bolted on — they're the reason FanFare
            exists.
          </p>
          <a
            href="#"
            onClick={handlers.goAbout}
            className="ff-cta"
            style={{ ...ctaWhite, display: 'inline-block', marginTop: 40, padding: '17px 36px' }}
          >
            Explore our impact
          </a>
        </div>
      </div>
    </section>
  )
}
