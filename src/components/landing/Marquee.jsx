import { BRICOLAGE } from '../ui.js'
import { marqueeLoop } from '../../data.js'

export default function Marquee() {
  return (
    <section
      style={{
        padding: '52px 0',
        borderTop: '1px solid rgba(14,159,79,0.14)',
        borderBottom: '1px solid rgba(14,159,79,0.14)',
        overflow: 'hidden',
        background: 'linear-gradient(180deg,#ffffff 0%,#eef8f0 100%)',
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
