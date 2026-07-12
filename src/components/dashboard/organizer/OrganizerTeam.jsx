import { useState } from 'react'
import { BRICOLAGE } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import StatCard from '../shared/StatCard.jsx'
import DataPending from '../shared/DataPending.jsx'

const ACCENT = '#e4002b'
const FILTERS = [['all', 'All'], ['available', 'Available'], ['on-break', 'On break'], ['off-duty', 'Off duty']]

export default function OrganizerTeam({ staffRoster, onLogout }) {
  const [filter, setFilter] = useState('all')

  if (staffRoster.length === 0) {
    return (
      <div>
        <PageHead eyebrow="Team" title="Staff & volunteers" subtitle="Your team appears here once volunteers and staff join this match."
          action={<button onClick={onLogout} className="ff-filter-chip" style={{ borderColor: 'rgba(228,0,43,0.3)', color: 'var(--c-red)' }}><Icon name="logout" size={15} /> Log out</button>} />
        <Panel className="ff-rise-card ff-st1">
          <DataPending icon="users" title="No team yet" message="As volunteers and staff join this match, their live status, zone and activity appear here across the whole venue." style={{ padding: '52px 24px' }} />
        </Panel>
      </div>
    )
  }

  const shown = staffRoster.filter(s => filter === 'all' || s.status === filter)
  const counts = {
    available: staffRoster.filter(s => s.status === 'available').length,
    'on-break': staffRoster.filter(s => s.status === 'on-break').length,
    'off-duty': staffRoster.filter(s => s.status === 'off-duty').length,
  }

  return (
    <div>
      <PageHead eyebrow="Team" title="Staff & volunteers" subtitle="Live roster across all zones."
        action={<button onClick={onLogout} className="ff-filter-chip" style={{ borderColor: 'rgba(228,0,43,0.3)', color: 'var(--c-red)' }}><Icon name="logout" size={15} /> Log out</button>} />

      <div className="ff-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 18 }}>
        <div className="ff-rise-card ff-st1"><StatCard icon="users" label="Total staff" value={staffRoster.length} accent={ACCENT} /></div>
        <div className="ff-rise-card ff-st2"><StatCard icon="check" label="Available" value={counts.available} accent="#0a7d3e" /></div>
        <div className="ff-rise-card ff-st3"><StatCard icon="pause" label="On break" value={counts['on-break']} accent="#915700" /></div>
        <div className="ff-rise-card ff-st4"><StatCard icon="clock" label="Off duty" value={counts['off-duty']} accent="#5d7566" /></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map(([id, label]) => <button key={id} className={`ff-filter-chip${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>{label}</button>)}
      </div>

      <div className="ff-team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {shown.map((s, i) => {
          const initials = s.name.split(' ').map(w => w[0]).join('').toUpperCase()
          return (
            <div key={s.id} className={`ff-panel ff-rise-card ff-st${Math.min(i + 1, 8)}`} style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 17, background: 'linear-gradient(150deg,#e4002b,#a30020)', flexShrink: 0 }}>{initials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{s.role} · Zone {s.zone}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className={`ff-status-dot ${s.status}`} />
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div><div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>{s.tasksCompleted}</div><div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tasks</div></div>
                <div><div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>{s.incidentsFiled}</div><div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Incidents</div></div>
                <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                  <span className="ff-chip" style={{ textTransform: 'capitalize', background: 'var(--fill-2)', color: 'var(--muted)' }}>{s.status.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
