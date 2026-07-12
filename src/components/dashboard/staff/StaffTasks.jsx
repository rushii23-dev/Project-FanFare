import { useEffect, useState } from 'react'
import Icon from '../../landing/Icons.jsx'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import { toast } from '../shared/Toast.jsx'

const ACCENT = '#b26a00'
const STORE = 'ff-staff-tasks'
const FILTERS = [['all', 'All'], ['pending', 'Pending'], ['in-progress', 'In progress'], ['done', 'Done']]
const chipClass = p => `ff-chip ff-chip-${p === 'high' ? 'high' : p === 'medium' ? 'medium' : 'low'}`

export default function StaffTasks({ tasks, onUpdateTasks }) {
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null')
      if (saved) onUpdateTasks(prev => prev.map(t => saved[t.id] ? { ...t, status: saved[t.id] } : t))
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setStatus = (id, status) => {
    onUpdateTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, status } : t)
      try { localStorage.setItem(STORE, JSON.stringify(Object.fromEntries(next.map(t => [t.id, t.status])))) } catch { /* ignore */ }
      return next
    })
    toast(status === 'done' ? 'Task completed' : `Marked ${status.replace('-', ' ')}`, { accent: status === 'done' ? '#0e9f4f' : ACCENT })
  }

  const shown = tasks.filter(t => filter === 'all' || t.status === filter)
  const counts = { pending: tasks.filter(t => t.status === 'pending').length, 'in-progress': tasks.filter(t => t.status === 'in-progress').length, done: tasks.filter(t => t.status === 'done').length }

  return (
    <div>
      <PageHead eyebrow="Tasks" title="Your task board" subtitle={`${counts.pending} pending · ${counts['in-progress']} active · ${counts.done} done`} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map(([id, label]) => (
          <button key={id} className={`ff-filter-chip${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>
            {label}{id !== 'all' && counts[id] != null ? ` · ${counts[id]}` : ''}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {shown.length === 0 ? (
          <Panel><div className="ff-empty"><span className="ff-empty-icon"><Icon name="clipboard" size={26} /></span><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>No tasks assigned</div><p className="ff-empty-text">Tasks show up here as they're assigned to you. You have none right now.</p></div></Panel>
        ) : shown.map((t, i) => (
          <div key={t.id} className={`ff-panel ff-rise-card ff-st${Math.min(i + 1, 8)}`} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', opacity: t.status === 'done' ? 0.66 : 1 }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: t.status === 'done' ? '#0e9f4f' : ACCENT, background: t.status === 'done' ? 'rgba(14,159,79,0.12)' : 'rgba(178,106,0,0.1)', border: `1px solid ${t.status === 'done' ? 'rgba(14,159,79,0.24)' : 'rgba(178,106,0,0.24)'}` }}>
              <Icon name={t.status === 'done' ? 'check' : 'clipboard'} size={19} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</span>
                <span className={chipClass(t.priority)}>{t.priority}</span>
                <span className={`ff-chip ff-chip-${t.status === 'done' ? 'done' : t.status === 'in-progress' ? 'progress' : 'pending'}`}>{t.status.replace('-', ' ')}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>Zone {t.zone} · scheduled {t.time}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {t.status === 'pending' && <button className="ff-filter-chip" onClick={() => setStatus(t.id, 'in-progress')}>Start</button>}
              {t.status !== 'done' && <button className="ff-filter-chip" style={{ borderColor: '#0e9f4f', color: '#0e9f4f' }} onClick={() => setStatus(t.id, 'done')}>Complete</button>}
              {t.status === 'done' && <button className="ff-filter-chip" onClick={() => setStatus(t.id, 'pending')}>Reopen</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
