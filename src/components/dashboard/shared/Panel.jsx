import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'

// Titled content panel with optional icon, live badge, and header action.
export default function Panel({ title, icon, live, action, children, className = '', style, bodyStyle, accent = 'var(--ff-accent)' }) {
  return (
    <section className={`ff-panel ${className}`} style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {(title || action) && (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {icon && (
              <span style={{ color: accent, display: 'inline-flex', flexShrink: 0 }}><Icon name={icon} size={19} /></span>
            )}
            <h3 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title}
            </h3>
            {live && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                <span className="ff-live-dot" />
                <span style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--c-red)' }}>Live</span>
              </span>
            )}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </header>
      )}
      <div style={{ flex: 1, ...bodyStyle }}>{children}</div>
    </section>
  )
}
