import { BRICOLAGE, HANKEN } from '../ui.js'
import { scoreboard } from '../../data.js'

// Trust strip with count-up numbers. The animation is driven by
// useScrollEffects() which reads data-to / data-suffix off .ff-score-num.
export default function Scoreboard() {
  return (
    <div style={{ background: '#070707', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
      <div
        id="ff-scorewrap"
        style={{
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5,1fr)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '24%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            filter: 'blur(2px)',
            animation: 'ff-scan 6s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        {scoreboard.map((sb, i) => (
          <div
            key={i}
            className="ff-scorecell"
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '36px 20px',
              textAlign: 'center',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              transition: 'background .4s',
            }}
          >
            <div
              className="ff-score-num"
              data-to={sb.num}
              data-suffix={sb.suffix}
              style={{
                fontFamily: BRICOLAGE,
                fontWeight: 700,
                fontSize: 44,
                letterSpacing: '0.01em',
                color: '#f4f4f4',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              0{sb.suffix}
            </div>
            <div
              style={{
                fontFamily: HANKEN,
                fontWeight: 400,
                fontSize: 12,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#6c6c6c',
                marginTop: 12,
              }}
            >
              {sb.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
