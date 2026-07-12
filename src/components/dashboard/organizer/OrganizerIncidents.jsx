import { useState } from 'react'
import Icon from '../../landing/Icons.jsx'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import { toast } from '../shared/Toast.jsx'

const FILTERS = [['all', 'All'], ['new', 'New'], ['assigned', 'Assigned'], ['resolved', 'Resolved']]
const sevClass = s => `ff-chip ff-chip-${s === 'high' ? 'high' : s === 'medium' ? 'medium' : 'low'}`
const statusClass = s => `ff-chip ff-chip-${s === 'resolved' ? 'resolved' : s === 'assigned' ? 'assigned' : 'new'}`
function timeAgo(iso) { const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000); if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago` }

export default function OrganizerIncidents({ incidents, staffRoster, onUpdateIncidents }) {
  const [filter, setFilter] = useState('all')
  const shown = incidents.filter(i => filter === 'all' || i.status === filter)
  const counts = { new: incidents.filter(i => i.status === 'new').length, assigned: incidents.filter(i => i.status === 'assigned').length, resolved: incidents.filter(i => i.status === 'resolved').length }

  const assign = (id, name) => { onUpdateIncidents(prev => prev.map(i => i.id === id ? { ...i, assignedTo: name, status: 'assigned' } : i)); toast(`Assigned to ${name}`, { accent: '#1673a8' }) }
  const resolve = (id) => { onUpdateIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' } : i)); toast('Incident resolved', { accent: '#0a7d3e' }) }

  return (
    <div>
      <PageHead eyebrow="Incidents" title="Triage queue" subtitle={`${counts.new} new · ${counts.assigned} in progress · ${counts.resolved} resolved`} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map(([id, label]) => (
          <button key={id} className={`ff-filter-chip${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>{label}{id !== 'all' ? ` · ${counts[id]}` : ''}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {shown.length === 0 ? (
          <Panel><div className="ff-empty"><span className="ff-empty-icon"><Icon name="alert" size={26} /></span><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>No incidents reported</div><p className="ff-empty-text">Incidents appear here in real time as staff file them from the Report Incident screen. There are none right now.</p></div></Panel>
        ) : shown.map((inc, i) => (
          <div key={inc.id} className={`ff-panel ff-rise-card ff-st${Math.min(i + 1, 8)}`} style={{ opacity: inc.status === 'resolved' ? 0.7 : 1, borderLeft: `3px solid ${inc.severity === 'high' ? '#e4002b' : inc.severity === 'medium' ? '#c8890a' : '#0a7d3e'}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className={sevClass(inc.severity)}>{inc.severity}</span>
                  <span className="ff-chip" style={{ background: 'var(--fill-2)', color: 'var(--muted)', textTransform: 'capitalize' }}>{inc.category}</span>
                  <span className={statusClass(inc.status)}>{inc.status}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--faint)', fontFamily: 'monospace' }}>{inc.id}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{inc.title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 5, lineHeight: 1.5, maxWidth: 620 }}>{inc.description}</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10, fontSize: 12.5, color: 'var(--faint)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="map" size={13} /> {inc.location}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="user" size={13} /> {inc.reportedBy}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={13} /> {timeAgo(inc.reportedAt)}</span>
                  {inc.assignedTo && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1673a8' }}><Icon name="check" size={13} /> {inc.assignedTo}</span>}
                </div>
              </div>
              {inc.status !== 'resolved' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, minWidth: 160 }}>
                  <select defaultValue="" onChange={e => e.target.value && assign(inc.id, e.target.value)} aria-label={`Assign incident ${inc.id} to staff member`} className="ff-dash-input" style={{ padding: '9px 12px', fontSize: 13 }}>
                    <option value="" disabled>Assign to…</option>
                    {staffRoster.filter(s => s.status !== 'off-duty').map(s => <option key={s.id} value={s.name}>{s.name} · {s.role}</option>)}
                  </select>
                  <button onClick={() => resolve(inc.id)} className="ff-btn" style={{ padding: '10px', borderRadius: 12, border: 'none', color: '#fff', fontWeight: 700, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>Resolve</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
