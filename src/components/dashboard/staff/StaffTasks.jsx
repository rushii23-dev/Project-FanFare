import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'
import StadiumMap from '../shared/StadiumMap.jsx'

// Full task dashboard with zone map and shift schedule
export default function StaffTasks({ nav, tasks, zones, gates, onUpdateTasks }) {
  const taskChip = (status) => {
    const map = { pending: 'ff-chip-pending', 'in-progress': 'ff-chip-progress', done: 'ff-chip-done' }
    const icons = { pending: '○', 'in-progress': '◐', done: '●' }
    return <span className={`ff-chip ${map[status] || ''}`}>{icons[status]} {status.replace('-', ' ')}</span>
  }

  const prioChip = (priority) => {
    const map = { high: 'ff-chip-high', medium: 'ff-chip-medium', low: 'ff-chip-low' }
    return <span className={`ff-chip ${map[priority] || ''}`}>{priority}</span>
  }

  const markTask = (taskId, newStatus) => {
    onUpdateTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('staff-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 24,
      }}>
        Task Dashboard
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Zone map */}
        <div className="ff-dash-card" style={{ padding: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
          }}>
            Zone overview
          </div>
          <StadiumMap zones={zones} gates={gates} accent={C.green} mode="heatmap" />
        </div>

        {/* Full task list */}
        <div className="ff-dash-card" style={{ padding: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
          }}>
            All tasks — today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.map(t => (
              <div key={t.id} style={{
                padding: '16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 500, color: t.status === 'done' ? '#6c6c6c' : '#f4f4f4',
                      textDecoration: t.status === 'done' ? 'line-through' : 'none',
                    }}>
                      {t.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {taskChip(t.status)}
                      {prioChip(t.priority)}
                      <span style={{ fontSize: 11, color: '#4a4a4a', padding: '4px 0' }}>
                        Zone {t.zone} · {t.time}
                      </span>
                    </div>
                  </div>
                  {t.status !== 'done' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {t.status === 'pending' && (
                        <button onClick={() => markTask(t.id, 'in-progress')} style={{
                          padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.green}44`,
                          background: 'transparent', color: C.green, fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                        }}>
                          Accept
                        </button>
                      )}
                      <button onClick={() => markTask(t.id, 'done')} style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                        background: 'transparent', color: '#9a9a9a', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
                      }}>
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
