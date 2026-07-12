import { BRICOLAGE, HANKEN } from '../ui.js'
import { scoreboard } from '../../data.js'

// Refined host-nation accents that read on a dark board.
const CYCLE = ['#3ce07f', '#ffcf4a', '#ff5c78', '#3ce07f', '#ffcf4a']

// A premium stadium-board band. Big luminous numerals count up (driven by
// useScrollEffects reading data-to / data-suffix off .ff-score-num).
export default function Scoreboard() {
  return (
    <div
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(120% 140% at 50% -20%, #0d2a1a 0%, #08190f 55%, #050d09 100%)',
      }}
    >
      {/* tri-nation top hairline */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg,#0e9f4f,#7ed957,#f5b301,#e4002b,#0e9f4f)',
        backgroundSize: '220% 100%', animation: 'ff-grad-pan 8s linear infinite',
      }} />
      {/* faint scanning sheen */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: '26%',
        background: 'linear-gradient(90deg, transparent, rgba(120,220,160,0.06), transparent)',
        animation: 'ff-scan 7s ease-in-out infinite', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '56px 40px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            fontFamily: HANKEN, fontWeight: 700, fontSize: 12, letterSpacing: '0.32em',
            textTransform: 'uppercase', color: '#7fae94',
          }}>
            By the numbers
          </span>
        </div>

        <div
          id="ff-scorewrap"
          className="ff-score-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}
        >
          {scoreboard.map((sb, i) => {
            const c = CYCLE[i % CYCLE.length]
            return (
              <div
                key={i}
                style={{
                  position: 'relative', textAlign: 'center', padding: '8px 22px',
                  borderRight: i < scoreboard.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                <div
                  className="ff-score-num"
                  data-to={sb.num}
                  data-suffix={sb.suffix}
                  style={{
                    fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(46px,4.4vw,60px)',
                    letterSpacing: '-0.01em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                    backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${c} 128%)`,
                    WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: `drop-shadow(0 0 22px ${c}55)`,
                  }}
                >
                  0{sb.suffix}
                </div>
                <span style={{
                  display: 'block', width: 26, height: 2, borderRadius: 2, margin: '16px auto 14px',
                  background: c, boxShadow: `0 0 12px ${c}`,
                }} />
                <div style={{
                  fontFamily: HANKEN, fontWeight: 600, fontSize: 11.5, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: '#8fae9c',
                }}>
                  {sb.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
