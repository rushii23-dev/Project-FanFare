import { BRICOLAGE, HANKEN, eyebrow, section } from '../ui.js'
import { portals, triad, triadSoft, triadBorder, triadGhost } from '../../data.js'

// Interactive role rail + detail panel. Hovering/clicking a rail item
// sets the active portal; the panel reflects it. Ported from the PORTALS block.
export default function Portals({ activePortal, setActivePortal, handlers }) {
  const act = activePortal ?? 0
  const active = portals[act] || portals[0]
  const accent = triad[act % 3]
  const accentBorder = triadBorder[act % 3]
  const ghostBig = triadGhost[act % 3]

  return (
    <section id="portals" style={section('88px 40px')}>
      <div
        data-reveal
        className="ff-reveal"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
          marginBottom: 56,
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <span style={eyebrow}>Portals</span>
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
            Built for everyone in the&nbsp;ground
          </h2>
        </div>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: '#9a9a9a', maxWidth: 340 }}>
          Fans navigate and enjoy. Staff respond and coordinate. Organizers see and decide.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px,340px) 1fr',
          gap: 28,
          alignItems: 'stretch',
        }}
      >
        {/* role rail */}
        <div data-reveal className="ff-reveal" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {portals.map((p, i) => {
            const on = i === act
            const a = triad[i % 3]
            return (
              <div
                key={p.role}
                onMouseEnter={() => setActivePortal(i)}
                onClick={() => setActivePortal(i)}
                className="ff-light"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '22px 22px',
                  borderRadius: 16,
                  cursor: 'pointer',
                  border: `1px solid ${on ? triadBorder[i % 3] : 'rgba(255,255,255,0.08)'}`,
                  background: on
                    ? `linear-gradient(100deg, ${triadSoft[i % 3]}, rgba(255,255,255,0.01))`
                    : 'transparent',
                  transition: 'border-color .4s, background .4s',
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: BRICOLAGE,
                    fontWeight: 700,
                    fontSize: 40,
                    lineHeight: 1,
                    color: on ? a : 'rgba(255,255,255,0.18)',
                    transition: 'color .4s',
                    minWidth: 44,
                  }}
                >
                  {p.idx}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: BRICOLAGE,
                      fontWeight: 500,
                      fontSize: 25,
                      lineHeight: 1.05,
                      color: on ? '#ffffff' : '#6c6c6c',
                      transition: 'color .4s',
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontFamily: HANKEN,
                      fontWeight: 600,
                      fontSize: 10.5,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: on ? a : '#6c6c6c',
                      marginTop: 5,
                      transition: 'color .4s',
                    }}
                  >
                    {p.tag}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: a, opacity: on ? 1 : 0, transition: 'opacity .4s' }}>→</span>
              </div>
            )
          })}
        </div>

        {/* detail panel */}
        <div
          data-reveal
          className="ff-reveal ff-d-1"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            minHeight: 'clamp(440px,56vh,540px)',
            background: 'linear-gradient(158deg,#161616 0%,#0e0e0e 70%)',
            border: '1px solid rgba(255,255,255,0.14)',
            padding: 'clamp(32px,3.6vw,52px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-6%',
              width: '64%',
              height: '150%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.12), rgba(255,255,255,0) 62%)',
              opacity: 'var(--ff-glow,0.7)',
              animation: 'ff-drift 13s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: 24,
              right: 36,
              fontFamily: BRICOLAGE,
              fontWeight: 700,
              fontSize: 'clamp(96px,11vw,168px)',
              lineHeight: 0.8,
              color: ghostBig,
              pointerEvents: 'none',
            }}
          >
            {active.idx}
          </span>

          <div style={{ position: 'relative' }}>
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.16), rgba(255,255,255,0.03))',
                border: `1px solid ${accentBorder}`,
              }}
            >
              {active.glyph}
            </span>
            <div
              style={{
                fontFamily: HANKEN,
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: accent,
                marginTop: 26,
              }}
            >
              {active.tag}
            </div>
            <h3
              style={{
                fontFamily: BRICOLAGE,
                fontWeight: 700,
                fontSize: 'clamp(34px,3.6vw,52px)',
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
                color: '#f4f4f4',
                marginTop: 8,
              }}
            >
              {active.title}
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#9a9a9a', marginTop: 14, maxWidth: 480 }}>
              {active.body}
            </p>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '28px 0' }} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px 32px',
                maxWidth: 600,
              }}
            >
              {active.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: accent,
                      boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                      marginTop: 8,
                      flex: 'none',
                    }}
                  />
                  <span style={{ fontSize: 14.5, lineHeight: 1.45, color: '#cfcfcf' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="#"
            onClick={handlers.enterAs(active.role)}
            className="ff-portalcta"
            style={{
              position: 'relative',
              alignSelf: 'flex-start',
              marginTop: 'auto',
              paddingTop: 32,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              fontFamily: HANKEN,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#f4f4f4',
            }}
          >
            {active.cta}{' '}
            <span
              className="ff-arrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.35)',
              }}
            >
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
