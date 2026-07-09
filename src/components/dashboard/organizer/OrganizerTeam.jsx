import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'

// Organizer Team — account settings + staff roster by zone
export default function OrganizerTeam({ nav, staffRoster, onLogout }) {
  const statusLabels = { available: 'Available', 'on-break': 'On break', 'off-duty': 'Off duty' }

  // Group staff by zone
  const byZone = {}
  staffRoster.forEach(s => {
    if (!byZone[s.zone]) byZone[s.zone] = []
    byZone[s.zone].push(s)
  })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('organizer-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 24,
      }}>
        Profile & Team
      </h2>

      {/* Organizer account */}
      <div className="ff-dash-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: 'rgba(226,58,69,0.15)',
            border: '1px solid rgba(226,58,69,0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20, fontWeight: 700, color: C.red,
          }}>
            OC
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f4' }}>Operations Command</div>
            <div style={{ fontSize: 13, color: '#9a9a9a' }}>Organizer · MetLife Stadium</div>
          </div>
        </div>
      </div>

      {/* Team roster by zone */}
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 12,
      }}>
        Staff on duty by zone
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {Object.entries(byZone).sort(([a], [b]) => a.localeCompare(b)).map(([zone, staff]) => (
          <div key={zone} className="ff-dash-card" style={{ padding: 20 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#f4f4f4', marginBottom: 12,
              fontFamily: BRICOLAGE,
            }}>
              Zone {zone}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {staff.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderRadius: 10, background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span className={`ff-status-dot ${s.status}`} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#f4f4f4' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#6c6c6c' }}>{s.role}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    color: s.status === 'available' ? '#2fa24e' : s.status === 'on-break' ? '#ffa500' : '#6c6c6c',
                  }}>
                    {statusLabels[s.status]}
                  </span>
                  <div style={{ fontSize: 11, color: '#4a4a4a', minWidth: 60, textAlign: 'right' }}>
                    {s.tasksCompleted} tasks
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Log out */}
      <button
        onClick={onLogout}
        style={{
          width: '100%', padding: '14px', borderRadius: 12,
          border: '1px solid rgba(226,58,69,0.25)', background: 'rgba(226,58,69,0.04)',
          color: '#e23a45', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: HANKEN,
        }}
      >
        Log out
      </button>
    </div>
  )
}
