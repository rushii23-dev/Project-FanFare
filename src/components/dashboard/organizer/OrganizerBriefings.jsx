import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'

// Briefings & Recommendations — full history with accept/dismiss/outcome log
export default function OrganizerBriefings({ nav, recommendations, onUpdateRecs }) {
  const handleAction = (recId, action) => {
    onUpdateRecs(recommendations.map(r =>
      r.id === recId ? { ...r, status: action } : r
    ))
  }

  const statusIcon = { pending: '⏳', accepted: '✅', dismissed: '✕' }
  const statusColor = { pending: '#ffa500', accepted: '#2fa24e', dismissed: '#6c6c6c' }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('organizer-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Briefings & Recommendations
      </h2>
      <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>
        Full history of system-generated recommendations with outcomes.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recommendations.map(r => (
          <div key={r.id} className="ff-dash-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span className={`ff-chip ff-chip-${r.priority}`}>{r.priority}</span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: statusColor[r.status],
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {statusIcon[r.status]} {r.status}
              </span>
              <span style={{ fontSize: 11, color: '#4a4a4a', marginLeft: 'auto' }}>
                {_timeAgo(r.time)}
              </span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 600, color: r.status === 'dismissed' ? '#6c6c6c' : '#f4f4f4', marginBottom: 8 }}>
              {r.title}
            </div>
            <div style={{ fontSize: 13, color: '#9a9a9a', lineHeight: 1.5, marginBottom: 14 }}>
              {r.body}
            </div>

            {r.impact && (
              <div style={{
                padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)', marginBottom: 14,
                display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap',
              }}>
                <span style={{ color: '#6c6c6c' }}>{r.impact.metric}:</span>
                <span style={{ color: '#6c6c6c' }}>{r.impact.from} → </span>
                <span style={{ color: '#2fa24e', fontWeight: 600 }}>{r.impact.to}</span>
              </div>
            )}

            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleAction(r.id, 'dismissed')}
                  style={{
                    padding: '8px 18px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent', color: '#9a9a9a', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                  }}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleAction(r.id, 'accepted')}
                  style={{
                    padding: '8px 18px', borderRadius: 20, border: 'none',
                    background: C.red, color: '#fff', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                  }}
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
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
