import { useEffect, useState } from 'react'

const BRICOLAGE = "'Bricolage Grotesque', sans-serif"
const HANKEN = "'Hanken Grotesk', sans-serif"

const navLink = {
  fontFamily: HANKEN,
  fontWeight: 500,
  fontSize: 14,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#9a9a9a',
  padding: '8px 16px',
  borderRadius: 40,
}

export default function Nav({ handlers }) {
  const { goHome, goHow, goPortals, goAbout, goLogin } = handlers

  // Transparent over the hero; gains a blurred backdrop once you scroll.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 74,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        // at top: fully transparent so the video is unobstructed (no bar, no line);
        // the hero's own top gradient keeps the links legible
        background: scrolled ? 'rgba(9,9,9,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0)'}`,
        boxShadow: scrolled ? '0 10px 34px rgba(0,0,0,0.40)' : 'none',
        transition: 'background .45s ease, box-shadow .45s ease, border-color .45s ease, backdrop-filter .45s ease',
      }}
    >
      <a href="#" onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BrandMark size={26} dot={9} />
        <span
          style={{
            fontFamily: BRICOLAGE,
            fontWeight: 700,
            fontSize: 23,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: '#f4f4f4',
          }}
        >
          FanFare
        </span>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <a href="#" onClick={goHow} className="ff-nav" style={navLink}>
          How it works
        </a>
        <a href="#" onClick={goPortals} className="ff-nav" style={navLink}>
          Portals
        </a>
        <a href="#" onClick={goAbout} className="ff-nav" style={navLink}>
          Impact
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a
          href="#"
          onClick={goLogin}
          className="ff-nav"
          style={{ ...navLink, color: '#f4f4f4', padding: '8px 8px' }}
        >
          Log in
        </a>
        <a
          href="#"
          onClick={goLogin}
          className="ff-cta"
          style={{
            fontFamily: HANKEN,
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#000000',
            background: '#ffffff',
            padding: '12px 22px',
            borderRadius: 32,
          }}
        >
          Enter FanFare
        </a>
      </div>
    </nav>
  )
}

// Shared radar-blip brand mark, reused in the footers.
export function BrandMark({ size = 26, dot = 9, animate = true, dotColor }) {
  const color = dotColor || (animate ? '#2aa5e0' : '#ffffff')
  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid #f4f4f4' }} />
      <span
        style={{
          position: 'absolute',
          width: dot,
          height: dot,
          borderRadius: '50%',
          background: color,
          boxShadow: animate ? `0 0 12px 2px ${color}99` : '0 0 10px rgba(255,255,255,0.6)',
          animation: animate ? 'ff-blink 2.4s ease-in-out infinite' : 'none',
        }}
      />
    </span>
  )
}
