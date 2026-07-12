import { useEffect, useState } from 'react'
import { LightMotes, Confetti } from './landing/Fx.jsx'

const HERO_CANDIDATES = [
  '/assets/hero-stadium.jpg', '/assets/hero-stadium.png', '/assets/hero-stadium.jpeg', '/assets/hero-stadium.webp',
  '/assets/hero.jpg', '/assets/hero.png', '/assets/stadium.jpg', '/assets/stadium.png',
]

// Shared scene for the Login / Create-account screens: a dramatic dark,
// blurred stadium backdrop with a bright frosted glass card that animates in.
export default function AuthShell({ children, maxWidth = 468 }) {
  const [bg, setBg] = useState(null)
  useEffect(() => {
    let cancelled = false, i = 0
    const tryNext = () => {
      if (cancelled || i >= HERO_CANDIDATES.length) return
      const src = HERO_CANDIDATES[i++]
      const probe = new Image()
      probe.onload = () => { if (!cancelled) setBg(src) }
      probe.onerror = tryNext
      probe.src = src
    }
    tryNext()
    return () => { cancelled = true }
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 72px', position: 'relative', overflow: 'hidden', background: '#061a0f',
      }}
    >
      {bg && (
        <div style={{
          position: 'absolute', inset: -40, zIndex: 0,
          backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(18px) brightness(0.5) saturate(1.2)', transform: 'scale(1.08)',
          animation: 'ff-kenburns 24s ease-in-out infinite alternate',
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(80% 70% at 50% 0%, rgba(14,159,79,0.34), transparent 60%), linear-gradient(180deg, rgba(4,16,9,0.7), rgba(4,16,9,0.9))',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 1,
        background: 'linear-gradient(90deg,#0e9f4f,#7ed957,#f5b301,#e4002b,#0e9f4f)',
        backgroundSize: '220% 100%', animation: 'ff-grad-pan 8s linear infinite',
      }} />
      <LightMotes count={20} zIndex={1} color="rgba(210,255,225,0.85)" />
      <Confetti count={14} zIndex={1} />

      <div
        className="ff-cardin"
        style={{
          position: 'relative', zIndex: 2, width: '100%', maxWidth,
          background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(255,255,255,0.7)',
          borderRadius: 22, padding: 40, overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg,#0e9f4f,#7ed957,#f5b301,#e4002b)',
          backgroundSize: '220% 100%', animation: 'ff-grad-pan 6s linear infinite',
        }} />
        {children}
      </div>
    </div>
  )
}
