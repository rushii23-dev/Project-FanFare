import { useEffect, useRef, useState } from 'react'

// A small FIFA 2026 Trionda ball that free-falls down the right side of the
// viewport as you scroll — no track, no line. Its vertical position follows
// scroll progress and it spins as it drops, with a soft motion shadow.
// Marketing pages only.
export default function ScrollBall() {
  const [frac, setFrac] = useState(0)
  const rot = useRef(0)
  const lastY = useRef(0)
  const [ballOk, setBallOk] = useState(true)
  const raf = useRef(0)
  const [, force] = useState(0)

  useEffect(() => {
    const update = () => {
      raf.current = 0
      const doc = document.documentElement
      const max = (doc.scrollHeight - window.innerHeight) || 1
      const y = window.scrollY || doc.scrollTop || 0
      const f = Math.min(1, Math.max(0, y / max))
      rot.current += (y - lastY.current) * 0.9 // rolling/tumbling spin
      lastY.current = y
      setFrac(f)
      force((n) => n + 1)
    }
    const onScroll = () => { if (!raf.current) raf.current = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  const SIZE = 52
  // ease so it accelerates a touch toward the bottom, like a falling object
  const eased = frac * frac * (3 - 2 * frac)

  return (
    <div
      className="ff-scrollball"
      aria-hidden
      style={{
        position: 'fixed', top: 0, bottom: 0, right: 26, width: 60, zIndex: 45,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute', left: '50%',
          top: `calc(90px + ${eased} * (100vh - 180px))`,
          transform: 'translate(-50%,-50%)',
          width: SIZE, height: SIZE, borderRadius: '50%',
          filter: 'drop-shadow(0 10px 16px rgba(6,50,25,0.4))',
        }}
      >
        {/* soft warm halo */}
        <span style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,179,1,0.4), transparent 68%)',
        }} />
        <div style={{ position: 'absolute', inset: 0, transform: `rotate(${rot.current}deg)`, borderRadius: '50%' }}>
          {ballOk ? (
            <img
              src="/assets/fifa-ball-2026.png"
              alt=""
              onError={() => setBallOk(false)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span style={{
              display: 'block', width: '100%', height: '100%', borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 32%, #fff 0%, #e9e9e9 45%, #b8b8b8 100%)',
            }} />
          )}
        </div>
      </div>
    </div>
  )
}
