import { useState } from 'react'
import Icon from '../../landing/Icons.jsx'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'

const ACCENT = '#0a7d3e'
const CAT_ICON = { gate: 'route', match: 'star', rewards: 'star', incident: 'alert', system: 'info', task: 'clipboard', crowd: 'grid', alert: 'alert' }

function timeAgo(iso) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function FanNotifications({ notifications, onMarkRead }) {
  const [filter, setFilter] = useState('all')
  const items = (notifications || []).filter(n => filter === 'all' || !n.read)
  const unread = (notifications || []).filter(n => !n.read)

  return (
    <div>
      <PageHead
        eyebrow="Notifications"
        title="Stay in the loop"
        subtitle={unread.length ? `${unread.length} unread update${unread.length > 1 ? 's' : ''}` : "You're all caught up."}
        action={unread.length > 0 && (
          <button className="ff-filter-chip" onClick={() => unread.forEach(n => onMarkRead(n.id))}>Mark all read</button>
        )}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'unread'].map(f => (
          <button key={f} className={`ff-filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      <Panel className="ff-rise-card ff-st1" style={{ padding: 0 }}>
        {items.length === 0 ? (
          <div className="ff-empty">
            <span className="ff-empty-icon"><Icon name="bell" size={26} /></span>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>No notifications yet</div>
            <p className="ff-empty-text">You'll see updates here on matchday — gate changes, kickoff reminders and messages about your match.</p>
          </div>
        ) : items.map((n, i) => (
          <div key={n.id} onClick={() => onMarkRead(n.id)} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onMarkRead(n.id)}
            style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: i < items.length - 1 ? '1px solid var(--line-soft)' : 'none', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(14,159,79,0.04)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, background: 'rgba(14,159,79,0.1)', border: '1px solid rgba(14,159,79,0.2)' }}>
              <Icon name={CAT_ICON[n.category] || 'bell'} size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontWeight: n.read ? 600 : 700, fontSize: 14.5, color: 'var(--text)' }}>{n.title}</span>
                {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, flexShrink: 0, marginTop: 5 }} />}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 3, lineHeight: 1.45 }}>{n.body}</div>
              <div style={{ fontSize: 11.5, color: 'var(--faint-2)', marginTop: 6 }}>{timeAgo(n.time)}</div>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  )
}
