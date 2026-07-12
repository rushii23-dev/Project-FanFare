import { useState, useRef, useEffect } from 'react'
import { BRICOLAGE } from '../ui.js'
import { BrandMark } from '../Nav.jsx'
import Icon from '../landing/Icons.jsx'
import { roleAccent } from '../../data.js'
import { ToastHost } from './shared/Toast.jsx'
import LiveScoreBar from './shared/LiveScoreBar.jsx'
import './DashboardShell.css'

// Persistent dashboard chrome: top bar, sidebar, notification panel.
// Wraps children (the active subview). Used by all three portals. Bright theme.
export default function DashboardShell({
  role, tabs, screen, nav, notifications, onMarkRead, onLogout, onSwitchRole, userName, children,
}) {
  const accent = roleAccent[role]
  const [showNotifs, setShowNotifs] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const avatarRef = useRef(null)

  const unreadCount = (notifications || []).filter(n => !n.read).length

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
    if (role === 'fan') onLogout()
    else if (window.confirm('Leave your dashboard? Unsaved work may be lost.')) onLogout()
  }

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
  const initials = (userName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="ff-dashboard" style={{ '--ff-accent': accent }}>
      {/* ===== TOP BAR ===== */}
      <header className="ff-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="#" onClick={handleBrandClick} style={{ display: 'flex', alignItems: 'center', gap: 10 }} aria-label="Return to home">
            <BrandMark size={26} animate />
            <span style={{
              fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 20, letterSpacing: '0.02em',
              textTransform: 'uppercase', color: 'var(--text)',
            }}>
              Fan<span className="ff-tricolor" style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fare</span>
            </span>
          </a>
          <span className="ff-role-badge" style={{ borderColor: accent, color: accent, marginLeft: 6 }}>
            {roleLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="ff-icon-btn"
            onClick={() => { setShowNotifs(p => !p); setShowAvatar(false) }}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Icon name="bell" size={20} />
            {unreadCount > 0 && <span className="ff-bell-count" style={{ background: accent }}>{unreadCount}</span>}
          </button>

          <div ref={avatarRef} style={{ position: 'relative' }}>
            <button
              className="ff-avatar-btn"
              onClick={() => { setShowAvatar(p => !p); setShowNotifs(false) }}
              aria-label="Profile menu" aria-expanded={showAvatar}
            >
              {initials}
            </button>
            {showAvatar && (
              <div className="ff-avatar-menu" role="menu">
                <button role="menuitem" onClick={() => { nav(`${role}-profile`); setShowAvatar(false) }}>
                  <Icon name="user" size={17} /> Profile
                </button>
                <button role="menuitem" onClick={() => { nav(`${role}-profile`); setShowAvatar(false) }}>
                  <Icon name="settings" size={17} /> Settings
                </button>
                <div style={{ height: 1, background: 'var(--line)', margin: '5px 6px' }} />
                <button role="menuitem" onClick={() => { setShowAvatar(false); onSwitchRole() }}>
                  <Icon name="swap" size={17} /> Switch role
                </button>
                <button role="menuitem" onClick={() => { setShowAvatar(false); onLogout() }}>
                  <Icon name="logout" size={17} /> Log out
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
          >
            <span className="ff-sidebar-icon" aria-hidden="true"><Icon name={tab.icon} size={20} /></span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main id="ff-main-content" className="ff-main" key={screen}>
        <LiveScoreBar />
        {children}
      </main>

      <ToastHost />

      {/* ===== NOTIFICATION PANEL ===== */}
      {showNotifs && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 44, background: 'transparent' }} onClick={() => setShowNotifs(false)} />
          <NotificationPanel
            notifications={notifications} accent={accent} onMarkRead={onMarkRead}
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
        padding: '20px 20px 14px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--line)',
      }}>
        <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>Notifications</span>
        <button onClick={onClose} className="ff-icon-btn" style={{ width: 32, height: 32, borderRadius: 9 }} aria-label="Close notifications">
          <Icon name="close" size={16} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div className="ff-empty">
            <span className="ff-empty-icon"><Icon name="bell" size={26} /></span>
            <p className="ff-empty-text">You're all caught up. No new notifications.</p>
          </div>
        ) : (
          items.map(n => (
            <div
              key={n.id}
              className={`ff-notif-item${!n.read ? ' unread' : ''}`}
              style={!n.read ? { borderLeftColor: accent } : {}}
              onClick={() => onMarkRead(n.id)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onMarkRead(n.id)}
            >
              <div style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: n.read ? 'var(--muted)' : 'var(--text)' }}>{n.title}</div>
              <div style={{ fontSize: 13, color: 'var(--faint)', marginTop: 4, lineHeight: 1.4 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: 'var(--faint-2)', marginTop: 6 }}>{_timeAgo(n.time)}</div>
            </div>
          ))
        )}
      </div>
      {role === 'fan' && (
        <div style={{ padding: 16, borderTop: '1px solid var(--line)' }}>
          <button
            onClick={onViewAll}
            style={{
              width: '100%', padding: '11px', borderRadius: 12, border: `1px solid ${accent}`,
              background: 'transparent', color: accent, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Hanken Grotesk, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase',
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
