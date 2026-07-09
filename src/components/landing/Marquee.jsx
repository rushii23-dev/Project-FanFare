import { BRICOLAGE } from '../ui.js'
import { marqueeLoop } from '../../data.js'

export default function Marquee() {
  return (
    <section
      style={{
        padding: '52px 0',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        overflow: 'hidden',
        background: '#0b0b0b',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'ff-marquee 34s linear infinite',
          whiteSpace: 'nowrap',
        }}
      >
        {marqueeLoop.map((m, i) => (
          <span
            key={i}
            className={m.cls}
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 700,
              fontSize: 'clamp(44px,7vw,92px)',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              padding: '0 28px',
            }}
          >
            {m.word}
          </span>
        ))}
      </div>
    </section>
  )
}
