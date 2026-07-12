import { useMemo } from 'react'
import { HANKEN, FIFA, TRIONDA_TEXT } from '../ui.js'

// ============================================================
// Shared FIFA World Cup 26 "Trionda" — BRIGHT daylight effects.
// Purely decorative, pointer-events:none, cheap to render.
// ============================================================

// Soft daylight colour washes — gentle green/gold/red light pooling in from
// the edges, like sun through a stadium roof. Reads on white (normal blend).
export function SunWash({ opacity = 1, zIndex = 0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex, overflow: 'hidden', pointerEvents: 'none', opacity }}>
      <div
        style={{
          position: 'absolute', top: '-22%', left: '-10%', width: '60%', height: '85%',
          background: 'radial-gradient(circle, rgba(14,159,79,0.16), transparent 64%)',
          filter: 'blur(50px)', animation: 'ff-aurora-a 22s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute', top: '-14%', right: '-12%', width: '54%', height: '90%',
          background: 'radial-gradient(circle, rgba(245,179,1,0.18), transparent 64%)',
          filter: 'blur(60px)', animation: 'ff-aurora-b 26s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '-26%', left: '34%', width: '46%', height: '80%',
          background: 'radial-gradient(circle, rgba(126,217,87,0.16), transparent 64%)',
          filter: 'blur(55px)', animation: 'ff-aurora-c 24s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Floating sunlit motes — dust catching the light. Bright specks that drift up.
export function LightMotes({ count = 22, zIndex = 1, color = '#ffffff' }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: 40 + Math.random() * 60,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 10,
        dur: 8 + Math.random() * 10,
        mx: (Math.random() - 0.5) * 60,
        my: 80 + Math.random() * 160,
      })),
    [count],
  )
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex, pointerEvents: 'none' }}>
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: 'absolute', left: `${m.left}%`, top: `${m.top}%`,
            width: m.size, height: m.size, borderRadius: '50%',
            background: color, boxShadow: `0 0 8px ${color}`,
            '--mx': `${m.mx}px`, '--my': `${m.my}px`,
            animation: `ff-mote ${m.dur}s linear ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// Confetti fall in host-nation colours (bright).
export function Confetti({ count = 22, zIndex = 2 }) {
  const colors = [FIFA.pitch, FIFA.lime, FIFA.gold, FIFA.red, FIFA.blue, '#ffffff']
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        w: 5 + Math.random() * 5,
        h: 9 + Math.random() * 9,
        color: colors[i % colors.length],
        delay: Math.random() * 8,
        dur: 6 + Math.random() * 6,
        round: Math.random() > 0.6,
      })),
    [count],
  )
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex, overflow: 'hidden', pointerEvents: 'none' }}>
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: 'absolute', top: 0, left: `${b.left}%`,
            width: b.w, height: b.h, background: b.color,
            borderRadius: b.round ? '50%' : 2, opacity: 0.9,
            animation: `ff-confetti ${b.dur}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// Sweeping stadium sunbeam — a soft diagonal shaft of light.
export function SunBeam({ zIndex = 2, tint = 'rgba(255,240,200,0.5)' }) {
  return (
    <div
      style={{
        position: 'absolute', top: '-30%', left: 0, width: '30%', height: '160%', zIndex,
        background: `linear-gradient(90deg, transparent, ${tint}, transparent)`,
        filter: 'blur(10px)', animation: 'ff-sunsweep 9s ease-in-out infinite', pointerEvents: 'none',
      }}
    />
  )
}

// Perspective pitch grid fading toward the horizon — green stadium floor.
export function PitchGrid({ zIndex = 0, opacity = 0.5, dark = false }) {
  const line = dark ? 'rgba(255,255,255,0.16)' : 'rgba(14,159,79,0.16)'
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex, pointerEvents: 'none', opacity, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute', left: '-25%', right: '-25%', bottom: '-40%', height: '90%',
          background:
            `repeating-linear-gradient(90deg, ${line} 0 2px, transparent 2px 76px), repeating-linear-gradient(0deg, ${line} 0 2px, transparent 2px 60px)`,
          transform: 'perspective(520px) rotateX(64deg)', transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, #000 0%, transparent 78%)',
          WebkitMaskImage: 'linear-gradient(to top, #000 0%, transparent 78%)',
        }}
      />
    </div>
  )
}

// Small uppercase eyebrow with a leading pitch tick + animated gradient text.
export function Eyebrow({ children, style }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontFamily: HANKEN, fontWeight: 700, fontSize: 12.5,
        letterSpacing: '0.24em', textTransform: 'uppercase', ...style,
      }}
    >
      <span
        style={{
          width: 26, height: 3, borderRadius: 3,
          background: 'linear-gradient(90deg,#0e9f4f,#f5b301,#e4002b)',
          boxShadow: '0 0 10px rgba(14,159,79,0.4)',
        }}
      />
      <span
        className="ff-tricolor"
        style={{
          backgroundImage: TRIONDA_TEXT, backgroundSize: '220% 100%',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}
      >
        {children}
      </span>
    </span>
  )
}
