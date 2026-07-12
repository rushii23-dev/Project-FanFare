import { useEffect, useState } from 'react'
import { BRICOLAGE, HANKEN } from '../ui.js'
import { Confetti, LightMotes, SunBeam } from './Fx.jsx'

// Hero — the FIFA World Cup 26 stadium photo, brought to life with a slow
// Ken-Burns push-in, a sweeping stadium sunbeam, rising sunlit motes and a
// drift of host-nation confetti. Save your photo into /public/assets/ as any of
// the candidate names below and it is picked up automatically; a bright animated
// stadium fallback shows until then.
const HERO_CANDIDATES = [
  '/assets/hero-stadium.jpg', '/assets/hero-stadium.png', '/assets/hero-stadium.jpeg', '/assets/hero-stadium.webp',
  '/assets/hero.jpg', '/assets/hero.png', '/assets/stadium.jpg', '/assets/stadium.png',
]

export default function Hero({ handlers }) {
  const { goRegister, goHow } = handlers
  // Probe the candidate filenames; use the first that actually loads.
  const [heroImg, setHeroImg] = useState(null)
  useEffect(() => {
    let cancelled = false
    let i = 0
    const tryNext = () => {
      if (cancelled || i >= HERO_CANDIDATES.length) return
      const src = HERO_CANDIDATES[i++]
      const probe = new Image()
      probe.onload = () => { if (!cancelled) setHeroImg(src) }
      probe.onerror = tryNext
      probe.src = src
    }
    tryNext()
    return () => { cancelled = true }
  }, [])
  const imgOk = !!heroImg

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: 680,
        width: '100%',
        overflow: 'hidden',
        background: '#bfe6f5',
      }}
    >
      {/* the stadium photo, slowly pushing in (Ken Burns) */}
      {imgOk && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover', backgroundPosition: 'center 42%',
            transformOrigin: 'center 60%',
            animation: 'ff-kenburns 18s ease-in-out infinite alternate',
            filter: 'saturate(1.12) contrast(1.03)',
          }}
        />
      )}
      {!imgOk && <FallbackStadium />}

      {/* warm sun bloom top-right, echoing the floodlights */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background:
            'radial-gradient(60% 50% at 78% 12%, rgba(255,240,200,0.5), transparent 60%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* legibility grade — soft green-ink pooling at the bottom-left, keeps
          the copy readable without darkening the whole bright frame */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(6,40,20,0.12) 0%, rgba(6,40,20,0) 30%, rgba(4,32,16,0.34) 72%, rgba(3,26,13,0.78) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background:
            'radial-gradient(120% 110% at 4% 100%, rgba(4,30,15,0.7) 0%, rgba(4,30,15,0.28) 32%, rgba(4,30,15,0) 58%)',
        }}
      />

      <SunBeam zIndex={2} />
      <LightMotes count={26} zIndex={2} color="rgba(255,246,214,0.95)" />
      <Confetti count={16} zIndex={2} />

      {/* content: bottom-left over the pitch */}
      <div
        style={{
          position: 'absolute', left: 0, bottom: 0, zIndex: 3,
          padding: '0 clamp(28px,5vw,64px) 8vh', maxWidth: 700,
        }}
      >
        <h1
          style={{
            margin: 0, fontFamily: BRICOLAGE, fontWeight: 700,
            textTransform: 'uppercase', lineHeight: 0.82, letterSpacing: '-0.02em',
          }}
        >
          <span
            className="ff-rise ff-d2"
            style={{
              display: 'block', fontFamily: HANKEN, fontWeight: 600,
              fontSize: 'clamp(11px,1.2vw,15px)', letterSpacing: '0.34em',
              color: '#eafff2', textShadow: '0 2px 16px rgba(0,0,0,0.6)', marginBottom: 12,
            }}
          >
            The 2026 World Cup, in your pocket
          </span>
          <span
            className="ff-rise ff-d2"
            style={{
              display: 'block',
              fontSize: 'clamp(40px,5.4vw,76px)',
              color: '#ffffff',
              textShadow: '0 6px 30px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.45)',
              animation: 'ff-impact 1.1s cubic-bezier(.2,.9,.25,1.15) .3s both',
            }}
          >
            Feel the{' '}
            <span
              className="ff-tricolor"
              style={{
                backgroundImage: 'linear-gradient(100deg,#7dffb0 0%,#eaff9e 40%,#ffd76a 66%,#ff9db0 100%)',
                backgroundSize: '220% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.35))',
              }}
            >
              roar.
            </span>
          </span>
        </h1>

        <p
          className="ff-rise ff-d3"
          style={{
            fontFamily: HANKEN, fontSize: 'clamp(15px,1.5vw,18px)', lineHeight: 1.5,
            color: '#eafff3', maxWidth: 420, marginTop: 20, textShadow: '0 2px 14px rgba(0,0,0,0.55)',
          }}
        >
          One platform for every matchday moment — fans, staff and organizers, in sync.
        </p>

        <div
          className="ff-rise ff-d4"
          style={{ marginTop: 34, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
        >
          <a
            href="#"
            onClick={goRegister}
            className="ff-btn"
            style={{
              fontFamily: HANKEN, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#ffffff', padding: '17px 34px',
              borderRadius: 40, whiteSpace: 'nowrap', textShadow: '0 1px 8px rgba(0,0,0,0.35)',
            }}
          >
            Enter FanFare
          </a>
          <a
            href="#"
            onClick={goHow}
            className="ff-ghost"
            style={{
              fontFamily: HANKEN, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.6)', padding: '16px 30px',
              borderRadius: 40, whiteSpace: 'nowrap',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            How it works
          </a>
        </div>
      </div>

      {/* scroll cue */}
      <div
        style={{
          position: 'absolute', bottom: 26, right: 40, zIndex: 3,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}
      >
        <span
          style={{
            width: 22, height: 36, border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: 20, position: 'relative', display: 'inline-block',
          }}
        >
          <span
            style={{
              position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)',
              width: 4, height: 8, borderRadius: 2, background: '#ffffff',
              boxShadow: '0 0 8px rgba(255,255,255,0.9)', animation: 'ff-scroll 1.8s ease-in-out infinite',
            }}
          />
        </span>
      </div>
    </section>
  )
}

// Bright animated stadium fallback (grass + sky + floodlights) shown until
// hero-stadium.jpg is placed in /public/assets.
function FallbackStadium() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {/* sky */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#8fd4ef 0%,#bfe6f5 34%,#e8f6ef 52%)' }} />
      {/* pitch */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '52%',
          background: 'linear-gradient(180deg,#1fb85c 0%,#0e9f4f 46%,#0a7a3c 100%)',
        }}
      />
      {/* mowed stripes */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '52%',
          background: 'repeating-linear-gradient(96deg, rgba(255,255,255,0.06) 0 70px, rgba(0,0,0,0.04) 70px 140px)',
        }}
      />
      {/* floodlight bloom */}
      <div
        style={{
          position: 'absolute', top: '-20%', left: '30%', width: '60%', height: '90%',
          background: 'radial-gradient(circle, rgba(255,245,210,0.6), transparent 60%)',
          animation: 'ff-drift 12s ease-in-out infinite',
        }}
      />
    </div>
  )
}
