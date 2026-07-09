import { useState } from 'react'
import { BRICOLAGE } from '../../ui.js'
import { C } from '../../../data.js'

// Full notification list with category filters and mark-as-read
export default function FanNotifications({ nav, notifications, onMarkRead }) {
  const [filter, setFilter] = useState('all')

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'gate', label: 'Gate alerts' },
    { id: 'match', label: 'Match' },
    { id: 'rewards', label: 'Rewards' },
  ]

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.category === filter)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('fan-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 20,
      }}>
        Notifications
      </h2>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`ff-filter-chip${filter === cat.id ? ' active' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="ff-empty">
          <span className="ff-empty-icon">🔔</span>
          <p className="ff-empty-text">No notifications in this category. You're all caught up.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(n => (
            <div
              key={n.id}
              className="ff-dash-card"
              onClick={() => onMarkRead(n.id)}
              style={{
                padding: '18px 20px', cursor: 'pointer',
                borderLeft: !n.read ? `3px solid ${C.blue}` : undefined,
                background: !n.read ? 'rgba(42,165,224,0.03)' : '#111111',
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onMarkRead(n.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: n.read ? 400 : 600, color: n.read ? '#9a9a9a' : '#f4f4f4' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#6c6c6c', marginTop: 4, lineHeight: 1.4 }}>
                    {n.body}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span className={`ff-chip ff-chip-${n.category === 'gate' ? 'new' : n.category === 'match' ? 'progress' : 'done'}`}>
                    {n.category}
                  </span>
                  <span style={{ fontSize: 11, color: '#4a4a4a' }}>{_timeAgo(n.time)}</span>
                </div>
              </div>
              {!n.read && (
                <div style={{ fontSize: 11, color: C.blue, marginTop: 8, fontWeight: 500 }}>
                  Tap to mark as read
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function _timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
