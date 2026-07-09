import { useEffect, useRef, useState } from 'react'
import { BRICOLAGE, HANKEN, ctaWhite } from '../ui.js'

// Hero section — full-viewport looping clip with a "ball hits the net" shake
// synced to the strike moment (~1.1s), plus a graceful animated fallback
// when goal.mp4 is missing. Ported from the HERO block in FanFare.dc.html.
export default function Hero({ handlers }) {
  const { goLogin, goHow } = handlers
  const videoRef = useRef(null)
  const roarRef = useRef(null)
  const ringRef = useRef(null)
  const netRef = useRef(null)
  const [videoOk, setVideoOk] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.muted = true
    v.playsInline = true
    v.loop = true

    const triggerHit = () => {
      const fire = (el, anim) => {
        if (!el) return
        el.style.animation = 'none'
        // force reflow so the animation restarts
        void el.offsetWidth
        el.style.animation = anim
      }
      fire(roarRef.current, 'ff-hit-text .72s cubic-bezier(.2,.8,.3,1) both')
      fire(ringRef.current, 'ff-hit-ring .72s ease-out both')
      fire(netRef.current, 'ff-hit-net .8s ease-out both')
    }

    // fire in sync with the video's net-strike
    const STRIKE = 1.1
    let armed = true
    const onTime = () => {
      const t = v.currentTime
      if (t < STRIKE - 0.05) armed = true
      if (armed && t >= STRIKE) {
        armed = false
        triggerHit()
      }
    }
    const onError = () => setVideoOk(false)

    v.addEventListener('timeupdate', onTime)
    v.addEventListener('error', onError, true)

    const p = v.play()
    if (p && p.catch) p.catch(() => {})

    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('error', onError, true)
    }
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: 660,
        width: '100%',
        overflow: 'hidden',
        background: '#050505',
      }}
    >
      {/* looping clip (place your goal.mp4 in /public/assets) */}
      <video
        ref={videoRef}
        src="/assets/goal.mp4"
        muted
        playsInline
        preload="auto"
        onError={() => setVideoOk(false)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: videoOk ? 1 : 0,
          transition: 'opacity .6s',
        }}
      />
      {/* animated fallback pitch when the video is absent */}
      {!videoOk && <FallbackPitch />}

      {/* cinematic grade + legibility overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.10) 34%, rgba(5,5,5,0.48) 66%, rgba(5,5,5,0.97) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'radial-gradient(135% 115% at 10% 98%, rgba(2,2,2,0.97) 0%, rgba(2,2,2,0.78) 26%, rgba(3,3,3,0.36) 50%, rgba(3,3,3,0) 68%)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, boxShadow: 'inset 0 0 220px rgba(0,0,0,0.75)' }} />

      {/* sweeping light beam */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: 0,
          zIndex: 2,
          width: '22%',
          height: '140%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
          filter: 'blur(6px)',
          animation: 'ff-beam 7s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* goal-net mesh that ripples on the strike */}
      <div
        ref={netRef}
        style={{
          position: 'absolute',
          left: -30,
          bottom: 0,
          zIndex: 2,
          opacity: 0.12,
          width: 'min(700px,64%)',
          height: 'min(480px,62vh)',
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 26px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 26px)',
          WebkitMaskImage: 'radial-gradient(78% 78% at 24% 84%, #000 0%, transparent 72%)',
          maskImage: 'radial-gradient(78% 78% at 24% 84%, #000 0%, transparent 72%)',
        }}
      />

      {/* content: bottom-left, punchy, in the dark */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          zIndex: 3,
          padding: '0 clamp(28px,5vw,60px) 7vh',
          maxWidth: 560,
        }}
      >
        <span
          className="ff-rise ff-d1"
          style={{
            display: 'block',
            width: 50,
            height: 3,
            marginBottom: 18,
            background: 'linear-gradient(90deg,#2aa5e0 0%,#2fa24e 50%,#e23a45 100%)',
            boxShadow: '0 0 18px rgba(42,165,224,0.6)',
          }}
        />
        <h1
          style={{
            margin: 0,
            fontFamily: BRICOLAGE,
            fontWeight: 700,
            textTransform: 'uppercase',
            lineHeight: 0.82,
            letterSpacing: '-0.02em',
          }}
        >
          <span
            className="ff-rise ff-d2"
            style={{
              display: 'block',
              fontFamily: HANKEN,
              fontWeight: 600,
              fontSize: 'clamp(11px,1.2vw,15px)',
              letterSpacing: '0.34em',
              color: '#cfcfcf',
              textShadow: '0 2px 20px rgba(0,0,0,0.8)',
              marginBottom: 12,
            }}
          >
            The 2026 World Cup
          </span>
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span
              ref={roarRef}
              style={{
                display: 'block',
                fontSize: 'clamp(52px,7vw,104px)',
                background:
                  'linear-gradient(100deg,#9a9a9a 0%,#d8d8d8 30%,#ffffff 50%,#d8d8d8 70%,#9a9a9a 100%)',
                backgroundSize: '260% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation:
                  'ff-impact 1.1s cubic-bezier(.2,.9,.25,1.15) .3s both, ff-shimmer 5s linear infinite 1.5s, ff-textglow 3.8s ease-in-out infinite 1.5s',
              }}
            >
              Feel the
              <br />
              roar
            </span>
            <span
              ref={ringRef}
              style={{
                position: 'absolute',
                left: '82%',
                top: '76%',
                zIndex: -1,
                opacity: 0,
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.55)',
                pointerEvents: 'none',
                transform: 'translate(-50%,-50%) scale(0.2)',
              }}
            />
          </span>
        </h1>

        <div
          className="ff-rise ff-d4"
          style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
        >
          <a
            href="#"
            onClick={goLogin}
            className="ff-cta"
            style={{ ...ctaWhite, padding: '16px 32px', whiteSpace: 'nowrap' }}
          >
            Enter FanFare
          </a>
          <a
            href="#"
            onClick={goHow}
            className="ff-light ff-outline"
            style={{
              fontFamily: HANKEN,
              fontWeight: 500,
              fontSize: 15,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#f4f4f4',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '15px 28px',
              borderRadius: 32,
              whiteSpace: 'nowrap',
            }}
          >
            How it works
          </a>
        </div>
      </div>

      {/* scroll cue */}
      <div
        style={{
          position: 'absolute',
          bottom: 26,
          right: 40,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 22,
            height: 36,
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: 20,
            position: 'relative',
            display: 'inline-block',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 7,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 8,
              borderRadius: 2,
              background: '#ffffff',
              boxShadow: '0 0 8px rgba(255,255,255,0.7)',
              animation: 'ff-scroll 1.8s ease-in-out infinite',
            }}
          />
        </span>
      </div>
    </section>
  )
}

// Animated stadium-pitch backdrop shown when goal.mp4 is unavailable.
function FallbackPitch() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: '#060a07' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 90% at 50% 12%, #12341f 0%, #0a1c11 45%, #050505 80%)',
        }}
      />
      {/* mowed stripes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(96deg, rgba(255,255,255,0.03) 0 78px, rgba(255,255,255,0) 78px 156px)',
        }}
      />
      {/* drifting floodlight glow */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '30%',
          width: '60%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(120,220,160,0.16), rgba(255,255,255,0) 60%)',
          animation: 'ff-drift 12s ease-in-out infinite',
        }}
      />
    </div>
  )
}
