import { useEffect, useState } from 'react'
const BRICOLAGE = "'Bricolage Grotesque', sans-serif"
const HANKEN = "'Hanken Grotesk', sans-serif"

export default function Nav({ handlers }) {
  const { goHome, goHow, goPortals, goAbout, goLogin } = handlers

  // Transparent (white text) over the hero photo; light glass with ink text
  // once you scroll onto the bright sections below.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkColor = scrolled ? '#37533f' : '#eafff2'
  const navLink = {
    fontFamily: HANKEN, fontWeight: 600, fontSize: 13.5, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: linkColor, padding: '8px 16px', borderRadius: 40,
    textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.35)', transition: 'color .4s',
  }

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 74,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px,4vw,40px)',
        background: scrolled ? 'rgba(255,255,255,0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.3)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.3)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(14,159,79,0.14)' : 'rgba(255,255,255,0)'}`,
        boxShadow: scrolled ? '0 10px 30px rgba(10,60,30,0.08)' : 'none',
        transition: 'background .45s ease, box-shadow .45s ease, border-color .45s ease, backdrop-filter .45s ease',
      }}
    >
      {/* animated tri-nation hairline that appears on scroll */}
      <span
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 2,
          background: 'linear-gradient(90deg,#0e9f4f,#7ed957,#f5b301,#e4002b,#0e9f4f)',
          backgroundSize: '220% 100%', animation: 'ff-grad-pan 6s linear infinite',
          opacity: scrolled ? 0.9 : 0, transition: 'opacity .45s',
        }}
      />

      <a href="#" onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BrandMark size={28} />
        <span
          style={{
            fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 23, letterSpacing: '0.02em',
            textTransform: 'uppercase', color: scrolled ? '#08210f' : '#ffffff',
            textShadow: scrolled ? 'none' : '0 1px 10px rgba(0,0,0,0.35)', transition: 'color .4s',
          }}
        >
          Fan<span
            className="ff-tricolor"
            style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >Fare</span>
        </span>
      </a>

      <div className="ff-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <a href="#" onClick={goHow} className="ff-fnav" style={navLink}>How it works</a>
        <a href="#" onClick={goPortals} className="ff-fnav" style={navLink}>Portals</a>
        <a href="#" onClick={goAbout} className="ff-fnav" style={navLink}>Impact</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a href="#" onClick={goLogin} className="ff-fnav" style={{ ...navLink, padding: '8px 8px' }}>
          Log in
        </a>
        <a
          href="#"
          onClick={goLogin}
          className="ff-btn"
          style={{
            fontFamily: HANKEN, fontWeight: 700, fontSize: 13.5, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#ffffff', padding: '12px 22px',
            borderRadius: 32, textShadow: '0 1px 6px rgba(0,0,0,0.3)',
          }}
        >
          Enter FanFare
        </a>
      </div>
    </nav>
  )
}

// Brand mark — the official FIFA World Cup trophy (gold cup on the green
// "FIFA WORLD CUP" malachite base), cropped to a transparent PNG and floated
// with a soft warm halo.
export function BrandMark({ size = 28, animate = true }) {
  const h = Math.round(size * 1.34) // trophy is tall; scale by height
  return (
    <span
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: h,
      }}
    >
      {/* warm halo */}
      <span
        style={{
          position: 'absolute', inset: '8% -18%', borderRadius: '50%',
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(245,179,1,0.5), transparent 68%)',
          animation: animate ? 'ff-blink 2.8s ease-in-out infinite' : 'none', pointerEvents: 'none',
        }}
      />
      <img
        src="/assets/fifa-trophy.png"
        alt="FIFA World Cup trophy"
        style={{
          position: 'relative', height: h, width: 'auto', display: 'block',
          filter: 'drop-shadow(0 3px 7px rgba(70,45,0,0.4))',
          animation: animate ? 'ff-float 4.6s ease-in-out infinite' : 'none',
        }}
      />
    </span>
  )
}
