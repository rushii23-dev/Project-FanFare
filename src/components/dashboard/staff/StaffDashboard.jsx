import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'
import CapacityGauge from '../shared/CapacityGauge.jsx'

// Staff Dashboard Home — "Your shift"
export default function StaffDashboard({ nav, staffRoster, tasks, zones, onUpdateTasks, onUpdateStaff }) {
  // Current staffer (first in roster for demo)
  const me = staffRoster[0]
  const myZone = zones.find(z => z.id === me.zone)
  const myTasks = tasks.filter(t => t.zone === me.zone || t.status !== 'done')
  const doneCount = tasks.filter(t => t.status === 'done').length
  const zonePct = myZone ? Math.round((myZone.current / myZone.capacity) * 100) : 0
  const zoneWarn = zonePct >= 85

  const statusOptions = ['available', 'on-break', 'off-duty']
  const statusLabels = { available: 'Available', 'on-break': 'On break', 'off-duty': 'Off duty' }
  const statusColors = { available: '#2fa24e', 'on-break': '#ffa500', 'off-duty': '#6c6c6c' }

  const cycleStatus = () => {
    const idx = statusOptions.indexOf(me.status)
    const next = statusOptions[(idx + 1) % statusOptions.length]
    onUpdateStaff(staffRoster.map(s => s.id === me.id ? { ...s, status: next } : s))
  }

  const markTask = (taskId, newStatus) => {
    onUpdateTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  const taskChip = (status) => {
    const map = { pending: 'ff-chip-pending', 'in-progress': 'ff-chip-progress', done: 'ff-chip-done' }
    const icons = { pending: '○', 'in-progress': '◐', done: '●' }
    return (
      <span className={`ff-chip ${map[status] || ''}`}>
        {icons[status]} {status.replace('-', ' ')}
      </span>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{
          fontFamily: HANKEN, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: C.green,
        }}>
          Your shift
        </span>
      </div>

      {/* Zone + status header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, marginBottom: 24, alignItems: 'start' }}>
        <div className="ff-dash-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 13, color: '#6c6c6c' }}>Assigned zone</div>
              <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 24, color: '#f4f4f4' }}>
                {myZone?.name || `Zone ${me.zone}`}
              </div>
            </div>
            <div style={{ height: 40, width: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <div style={{ fontSize: 13, color: '#6c6c6c' }}>Shift</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#f4f4f4' }}>
                {new Date(me.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(me.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div style={{ height: 40, width: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <div style={{ fontSize: 13, color: '#6c6c6c', marginBottom: 4 }}>Tasks completed</div>
              <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 24, color: C.green }}>
                {doneCount}/{tasks.length}
              </div>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        <button
          onClick={cycleStatus}
          className="ff-dash-card"
          style={{
            padding: '16px 24px', cursor: 'pointer', textAlign: 'center',
            borderColor: `${statusColors[me.status]}44`,
          }}
        >
          <div style={{ fontSize: 11, color: '#6c6c6c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span className={`ff-status-dot ${me.status}`} />
            <span style={{ fontSize: 14, fontWeight: 600, color: statusColors[me.status] }}>
              {statusLabels[me.status]}
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#4a4a4a', marginTop: 6 }}>Tap to change</div>
        </button>
      </div>

      {/* Crowd alert banner */}
      {zoneWarn && (
        <div style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(226,58,69,0.08)', border: '1px solid rgba(226,58,69,0.2)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e23a45' }}>
              Zone {me.zone} nearing capacity — {zonePct}%
            </div>
            <div style={{ fontSize: 13, color: '#9a9a9a' }}>
              Stay alert. Consider redirecting fans to adjacent zones.
            </div>
          </div>
          <button
            onClick={() => nav('staff-zones')}
            style={{
              padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(226,58,69,0.3)',
              background: 'transparent', color: '#e23a45', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
            }}
          >
            View zones
          </button>
        </div>
      )}

      {/* Task list */}
      <div className="ff-dash-card" style={{ padding: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>Shift tasks</span>
          <button
            onClick={() => nav('staff-tasks')}
            style={{
              border: 'none', background: 'none', color: C.green,
              fontSize: 12, cursor: 'pointer', fontWeight: 600, fontFamily: HANKEN,
            }}
          >
            View all →
          </button>
        </div>

        {myTasks.length === 0 ? (
          <div className="ff-empty">
            <span className="ff-empty-icon">✅</span>
            <p className="ff-empty-text">All tasks completed. Great work!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myTasks.map(t => (
              <div
                key={t.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500, color: t.status === 'done' ? '#6c6c6c' : '#f4f4f4',
                    textDecoration: t.status === 'done' ? 'line-through' : 'none',
                  }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#4a4a4a', marginTop: 2 }}>
                    Zone {t.zone} · {t.time}
                  </div>
                </div>
                {taskChip(t.status)}
                {t.status !== 'done' && (
                  <button
                    onClick={() => markTask(t.id, t.status === 'pending' ? 'in-progress' : 'done')}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.green}44`,
                      background: 'transparent', color: C.green, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                    }}
                  >
                    {t.status === 'pending' ? 'Start' : 'Done'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
