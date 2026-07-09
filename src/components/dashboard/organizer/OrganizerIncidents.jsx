import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'

// Incident Queue — AI-triaged severity-sorted list from shared incident data
export default function OrganizerIncidents({ nav, incidents, staffRoster, onUpdateIncidents }) {
  const sorted = [...incidents].sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 }
    return (sev[a.severity] ?? 3) - (sev[b.severity] ?? 3)
  })

  const updateStatus = (incId, newStatus) => {
    onUpdateIncidents(incidents.map(i => i.id === incId ? { ...i, status: newStatus } : i))
  }

  const assignStaff = (incId, staffName) => {
    onUpdateIncidents(incidents.map(i =>
      i.id === incId ? { ...i, assignedTo: staffName, status: 'assigned' } : i
    ))
  }

  const statusIcon = { new: '🔴', assigned: '🟡', resolved: '🟢' }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('organizer-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Incident Queue
      </h2>
      <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>
        AI-triaged by severity. Assign staff and track resolution.
      </p>

      {sorted.length === 0 ? (
        <div className="ff-empty">
          <span className="ff-empty-icon">✅</span>
          <p className="ff-empty-text">No incidents reported — that's a good sign.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(inc => (
            <div key={inc.id} className="ff-dash-card" style={{
              padding: 24,
              borderColor: inc.severity === 'high' && inc.status !== 'resolved'
                ? 'rgba(226,58,69,0.25)' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`ff-chip ff-chip-${inc.severity}`}>{inc.severity}</span>
                  <span className={`ff-chip ff-chip-${inc.status}`}>
                    {statusIcon[inc.status]} {inc.status}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#4a4a4a', marginLeft: 'auto' }}>{inc.id}</span>
              </div>

              <div style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f4', marginBottom: 6 }}>
                {inc.title}
              </div>
              <div style={{ fontSize: 13, color: '#9a9a9a', lineHeight: 1.5, marginBottom: 12 }}>
                {inc.description}
              </div>

              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#6c6c6c', marginBottom: 14, flexWrap: 'wrap' }}>
                <span>📍 {inc.location}</span>
                <span>👤 Reported by: {inc.reportedBy}</span>
                <span>🕐 {_timeAgo(inc.reportedAt)}</span>
                {inc.assignedTo && <span>🎯 Assigned to: {inc.assignedTo}</span>}
              </div>

              {inc.status !== 'resolved' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {inc.status === 'new' && (
                    <select
                      onChange={e => e.target.value && assignStaff(inc.id, e.target.value)}
                      defaultValue=""
                      style={{
                        background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#cfcfcf', padding: '8px 14px', borderRadius: 10,
                        fontSize: 12, fontFamily: HANKEN,
                      }}
                      aria-label={`Assign staff to ${inc.id}`}
                    >
                      <option value="" disabled>Assign to staff...</option>
                      {staffRoster.filter(s => s.status === 'available').map(s => (
                        <option key={s.id} value={s.name}>{s.name} — {s.role} (Zone {s.zone})</option>
                      ))}
                    </select>
                  )}
                  {inc.status === 'assigned' && (
                    <button
                      onClick={() => updateStatus(inc.id, 'resolved')}
                      style={{
                        padding: '8px 18px', borderRadius: 20, border: 'none',
                        background: '#2fa24e', color: '#fff', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                      }}
                    >
                      Mark resolved
                    </button>
                  )}
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
  return `${Math.floor(min / 60)}h ago`
}
