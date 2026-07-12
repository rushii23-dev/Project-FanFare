import { BRICOLAGE, HANKEN } from './ui.js'
import { BrandMark } from './Nav.jsx'

const colHead = {
  fontFamily: HANKEN, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: '#6f9a82', marginBottom: 18,
}

const HOSTS = [
  { code: 'USA', name: 'United States', c: '#2aa5e0' },
  { code: 'CAN', name: 'Canada', c: '#e4002b' },
  { code: 'MEX', name: 'Mexico', c: '#0e9f4f' },
]

function FootLink({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="ff-linkbtn ff-foot-link">{children}</button>
  )
}

// Full landing-page footer — dark, premium, with a signature tricolor wordmark.
export default function SiteFooter({ handlers }) {
  const h = handlers || {}
  const noop = (e) => e?.preventDefault?.()

  return (
    <footer
      style={{
        position: 'relative', overflow: 'hidden', color: '#c5ded1',
        background: 'radial-gradient(130% 120% at 50% -10%, #0d3320 0%, #071c10 52%, #040e08 100%)',
      }}
    >
      {/* tri-nation top hairline */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg,#0e9f4f,#7ed957,#f5b301,#e4002b,#0e9f4f)',
        backgroundSize: '220% 100%', animation: 'ff-grad-pan 8s linear infinite',
      }} />
      {/* soft floodlight bloom */}
      <div style={{
        position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
        width: '70%', height: '90%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(126,217,87,0.1), transparent 66%)',
      }} />

      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: 'clamp(64px,8vw,92px) 40px 0' }}>
        {/* ── top: brand + link columns ── */}
        <div className="ff-foot-top" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, alignItems: 'start' }}>
          {/* brand block */}
          <div style={{ maxWidth: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BrandMark size={30} animate={false} />
              <span style={{
                fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 24, letterSpacing: '0.02em',
                textTransform: 'uppercase', color: '#ffffff',
              }}>
                Fan<span className="ff-tricolor" style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fare</span>
              </span>
            </div>
            <p style={{ fontFamily: HANKEN, fontSize: 15, lineHeight: 1.6, color: '#a9c9b8', marginTop: 20 }}>
              One platform for every matchday moment — for the fans in the stands, the people who
              serve them, and the teams who keep it all running.
            </p>

            {/* host nations */}
            <div style={{ marginTop: 26 }}>
              <div style={{ ...colHead, marginBottom: 12 }}>Host nations · 2026</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {HOSTS.map(host => (
                  <span key={host.code} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 30,
                    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
                    fontFamily: HANKEN, fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', color: '#e7f4ec',
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: host.c, boxShadow: `0 0 8px ${host.c}` }} />
                    {host.code}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* columns */}
          <div>
            <div style={colHead}>Portals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <FootLink onClick={h.enterAs ? h.enterAs('fan') : noop}>Fan Portal</FootLink>
              <FootLink onClick={h.enterAs ? h.enterAs('staff') : noop}>Staff Portal</FootLink>
              <FootLink onClick={h.enterAs ? h.enterAs('organizer') : noop}>Organizer Portal</FootLink>
            </div>
          </div>

          <div>
            <div style={colHead}>Explore</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <FootLink onClick={h.goHow || noop}>How it works</FootLink>
              <FootLink onClick={h.goPortals || noop}>Portals</FootLink>
              <FootLink onClick={h.goAbout || noop}>About &amp; Impact</FootLink>
            </div>
          </div>

          <div>
            <div style={colHead}>Account</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <FootLink onClick={h.goLogin || noop}>Log in</FootLink>
              <FootLink onClick={h.goRegister || noop}>Create account</FootLink>
              <FootLink onClick={h.goHome || noop}>Home</FootLink>
            </div>
          </div>
        </div>

        {/* ── giant signature wordmark ── */}
        <div style={{
          position: 'relative', marginTop: 'clamp(40px,6vw,72px)', textAlign: 'center',
          overflow: 'hidden', pointerEvents: 'none',
        }}>
          <span aria-hidden="true" style={{
            display: 'block', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(64px,18vw,250px)',
            lineHeight: 0.86, letterSpacing: '-0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap',
            backgroundImage: 'linear-gradient(100deg,#0e9f4f 0%,#7ed957 26%,#f5b301 55%,#e4002b 80%,#0e9f4f 100%)',
            backgroundSize: '220% 100%',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: 0.9, animation: 'ff-grad-pan 8s linear infinite',
            filter: 'drop-shadow(0 6px 30px rgba(14,159,79,0.25))',
          }}>
            FanFare
          </span>
        </div>

        {/* ── bottom bar ── */}
        <div style={{
          position: 'relative', borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '22px 0 34px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 12, lineHeight: 1.5, color: '#7fa791', maxWidth: 560 }}>
            FanFare is an independent concept platform. Not affiliated with any official tournament,
            federation or governing body.
          </span>
          <span style={{ fontSize: 12, color: '#7fa791', fontWeight: 600 }}>© 2026 FanFare</span>
        </div>
      </div>
    </footer>
  )
}
