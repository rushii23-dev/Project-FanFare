import { useState, useRef, useEffect } from 'react'
import { BRICOLAGE, HANKEN } from '../ui.js'
import { BrandMark } from '../Nav.jsx'
import { roleAccent } from '../../data.js'
import './DashboardShell.css'

// Persistent dashboard chrome: top bar, sidebar, notification panel.
// Wraps children (the active subview). Used by all three portals.
export default function DashboardShell({
  role,           // 'fan' | 'staff' | 'organizer'
  tabs,           // nav tab definitions from data.js
  screen,         // current screen id
  nav,            // (screenId) => void
  notifications,  // notification items for this role
  onMarkRead,     // (notifId) => void
  onLogout,       // () => void
  onSwitchRole,   // () => void
  userName,       // display name
  children,
}) {
  const accent = roleAccent[role]
  const [showNotifs, setShowNotifs] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const avatarRef = useRef(null)

  const unreadCount = (notifications || []).filter(n => !n.read).length

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showAvatar) return
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowAvatar(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAvatar])

  const handleBrandClick = (e) => {
    e.preventDefault()
    if (role === 'fan') {
      onLogout()
    } else {
      if (window.confirm('Leave your dashboard? Unsaved work may be lost.')) {
        onLogout()
      }
    }
  }

  const handleBellClick = () => {
    setShowNotifs(prev => !prev)
    setShowAvatar(false)
  }

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
  const initials = (userName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="ff-dashboard" style={{ '--ff-accent': accent }}>
      {/* ===== TOP BAR ===== */}
      <header className="ff-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a
            href="#"
            onClick={handleBrandClick}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            aria-label="Return to home"
          >
            <BrandMark size={24} dot={8} animate={true} dotColor={accent} />
            <span style={{
              fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 20,
              letterSpacing: '0.02em', textTransform: 'uppercase', color: '#f4f4f4',
            }}>
              FanFare
            </span>
          </a>
          <span
            className="ff-role-badge"
            style={{ borderColor: accent, color: accent, marginLeft: 8 }}
          >
            {roleLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Notification bell */}
          <button
            className="ff-bell"
            onClick={handleBellClick}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            🔔
            {unreadCount > 0 && (
              <span className="ff-bell-count" style={{ background: accent }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Avatar / profile menu */}
          <div ref={avatarRef} style={{ position: 'relative' }}>
            <button
              className="ff-avatar-btn"
              onClick={() => { setShowAvatar(prev => !prev); setShowNotifs(false) }}
              aria-label="Profile menu"
              aria-expanded={showAvatar}
            >
              {initials}
            </button>
            {showAvatar && (
              <div className="ff-avatar-menu" role="menu">
                <button role="menuitem" onClick={() => { nav(`${role}-profile`); setShowAvatar(false) }}>
                  👤 Profile
                </button>
                <button role="menuitem" onClick={() => { nav(`${role}-profile`); setShowAvatar(false) }}>
                  ⚙️ Settings
                </button>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 6px' }} />
                <button role="menuitem" onClick={() => { setShowAvatar(false); onSwitchRole() }}>
                  🔄 Switch role
                </button>
                <button role="menuitem" onClick={() => { setShowAvatar(false); onLogout() }}>
                  🚪 Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== SIDEBAR ===== */}
      <nav className="ff-sidebar" aria-label={`${roleLabel} navigation`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ff-sidebar-tab${screen === tab.id ? ' active' : ''}`}
            onClick={() => nav(tab.id)}
            aria-current={screen === tab.id ? 'page' : undefined}
            style={screen === tab.id ? { borderLeft: `3px solid ${accent}` } : {}}
          >
            <span className="ff-sidebar-icon" aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="ff-main" key={screen}>
        {children}
      </main>

      {/* ===== NOTIFICATION PANEL ===== */}
      {showNotifs && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 44, background: 'transparent' }}
            onClick={() => setShowNotifs(false)}
          />
          <NotificationPanel
            notifications={notifications}
            accent={accent}
            onMarkRead={onMarkRead}
            onClose={() => setShowNotifs(false)}
            onViewAll={() => { nav(`${role}-notifications`); setShowNotifs(false) }}
            role={role}
          />
        </>
      )}
    </div>
  )
}

function NotificationPanel({ notifications, accent, onMarkRead, onClose, onViewAll, role }) {
  const items = notifications || []
  return (
    <div className="ff-notif-panel">
      <div style={{
        padding: '20px 20px 12px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 18, color: '#f4f4f4' }}>
          Notifications
        </span>
        <button
          onClick={onClose}
          style={{
            border: 'none', background: 'none', color: '#6c6c6c', fontSize: 18,
            cursor: 'pointer', padding: 4,
          }}
          aria-label="Close notifications"
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div className="ff-empty">
            <span className="ff-empty-icon">🔔</span>
            <p className="ff-empty-text">You're all caught up. No new notifications.</p>
          </div>
        ) : (
          items.map(n => (
            <div
              key={n.id}
              className={`ff-notif-item${!n.read ? ' unread' : ''}`}
              style={!n.read ? { borderLeftColor: accent } : {}}
              onClick={() => onMarkRead(n.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onMarkRead(n.id)}
            >
              <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, color: n.read ? '#9a9a9a' : '#f4f4f4' }}>
                {n.title}
              </div>
              <div style={{ fontSize: 13, color: '#6c6c6c', marginTop: 4, lineHeight: 1.4 }}>
                {n.body}
              </div>
              <div style={{ fontSize: 11, color: '#4a4a4a', marginTop: 6 }}>
                {_timeAgo(n.time)}
              </div>
            </div>
          ))
        )}
      </div>
      {role === 'fan' && (
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onViewAll}
            style={{
              width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${accent}`,
              background: 'transparent', color: accent, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Hanken Grotesk, sans-serif',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            View all notifications
          </button>
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
