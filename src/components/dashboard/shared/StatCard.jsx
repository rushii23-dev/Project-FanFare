import { useEffect, useRef, useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'

// Animated count-up number. Eases 0 → value once on mount / when value changes.
export function CountUp({ value = 0, decimals = 0, prefix = '', suffix = '', dur = 1200, format = true }) {
  const [n, setN] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    const a = from.current
    const b = value
    if (reduce) { setN(b); from.current = b; return }
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      setN(a + (b - a) * e)
      if (p < 1) raf = requestAnimationFrame(tick)
      else from.current = b
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, dur])
  const rounded = decimals > 0 ? n.toFixed(decimals) : Math.round(n)
  const text = format ? Number(rounded).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : rounded
  return <>{prefix}{text}{suffix}</>
}

// KPI stat card: icon chip, big animated number, label, optional trend delta.
export default function StatCard({
  icon, label, value, decimals = 0, prefix = '', suffix = '',
  accent = 'var(--ff-accent)', trend, trendDir, sub, className = '', style,
}) {
  return (
    <div className={`ff-panel ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          width: 42, height: 42, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
        }}>
          <Icon name={icon} size={21} />
        </span>
        {trend != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: HANKEN, fontWeight: 700, fontSize: 12,
            padding: '4px 9px', borderRadius: 20,
            color: trendDir === 'down' ? '#c30026' : '#0a7a3c',
            background: trendDir === 'down' ? 'rgba(228,0,43,0.1)' : 'rgba(14,159,79,0.12)',
          }}>
            {trendDir === 'down' ? '▼' : '▲'} {trend}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 34, lineHeight: 1, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          <CountUp value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
        </div>
        <div style={{ fontFamily: HANKEN, fontWeight: 600, fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 8 }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 13, color: 'var(--faint)', marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  )
}
