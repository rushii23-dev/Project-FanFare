import { BRICOLAGE } from '../../ui.js'

// Animated circular progress ring. `value` 0–100. Draws in via stroke-dashoffset.
export default function ProgressRing({ value = 0, size = 96, stroke = 9, color = 'var(--ff-accent)', label, sub, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const offset = c - (pct / 100) * c
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--elev-2)" strokeWidth={stroke} />
        <circle
          className="ff-ring-value"
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 5px color-mix(in srgb, ${color} 45%, transparent))` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {children || (
          <>
            <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: size * 0.26, lineHeight: 1, color: 'var(--text)' }}>
              {label ?? `${Math.round(pct)}%`}
            </span>
            {sub && <span style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{sub}</span>}
          </>
        )}
      </div>
    </div>
  )
}
