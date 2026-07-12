import { BRICOLAGE, HANKEN } from '../../ui.js'

// Consistent view header across all dashboards.
export default function PageHead({ eyebrow, title, subtitle, action }) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
      <div>
        {eyebrow && (
          <div style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ff-accent)', marginBottom: 8 }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(28px,3.4vw,40px)', lineHeight: 1.02, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8, maxWidth: 560, lineHeight: 1.5 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </header>
  )
}
