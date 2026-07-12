import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import StatCard from '../shared/StatCard.jsx'
import DataPending from '../shared/DataPending.jsx'

const ACCENT = '#b26a00'

export default function StaffProfile({ staffRoster, tasks, incidents, onLogout }) {
  const me = staffRoster[0]

  if (!me) {
    return (
      <div>
        <PageHead eyebrow="Profile" title="Your account" subtitle="Your shift summary and reporting history appear here once you're on the team for this match." />
        <Panel className="ff-rise-card ff-st1">
          <DataPending icon="user" title="No shift yet" message="Your role, shift and the incidents you file will appear here once you join the team for this match." style={{ padding: '48px 24px' }} />
        </Panel>
        <button onClick={onLogout} className="ff-dash-card interactive" style={{ marginTop: 18, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', color: 'var(--c-red)', fontFamily: HANKEN, fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderColor: 'rgba(228,0,43,0.25)' }}>
          <Icon name="logout" size={18} /> Log out
        </button>
      </div>
    )
  }
  const mine = (incidents || []).filter(i => i.reportedBy === me.name)
  const initials = me.name.split(' ').map(w => w[0]).join('').toUpperCase()
  const doneToday = tasks.filter(t => t.status === 'done').length
  const fmt = t => { const d = new Date(t); return isNaN(d) ? t : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }

  return (
    <div>
      <PageHead eyebrow="Profile" title="Your account" subtitle="Shift summary and reporting history." />

      <div className="ff-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
        <div className="ff-rise-card ff-st1"><StatCard icon="check" label="Tasks completed" value={me.tasksCompleted + doneToday} accent="#0e9f4f" /></div>
        <div className="ff-rise-card ff-st2"><StatCard icon="alert" label="Incidents filed" value={me.incidentsFiled} accent="#e4002b" /></div>
        <div className="ff-rise-card ff-st3"><StatCard icon="clock" label="On shift" value={1} suffix=" active" accent={ACCENT} /></div>
      </div>

      <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 18, alignItems: 'start' }}>
        <Panel className="ff-rise-card ff-st4" accent={ACCENT}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <span style={{ width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 24, background: 'linear-gradient(150deg,#c8890a,#8a5200)' }}>{initials}</span>
            <div>
              <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>{me.name}</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 3 }}>{me.role} · Zone {me.zone}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
                <span className={`ff-status-dot ${me.status}`} /><span style={{ fontSize: 12.5, color: 'var(--muted)', textTransform: 'capitalize' }}>{me.status.replace('-', ' ')}</span>
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 12px' }}>
            {[['Shift start', fmt(me.shiftStart)], ['Shift end', fmt(me.shiftEnd)], ['Role', me.role], ['Zone', `Zone ${me.zone}`]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={onLogout} className="ff-dash-card interactive" style={{ marginTop: 22, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', color: 'var(--c-red)', fontFamily: HANKEN, fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderColor: 'rgba(228,0,43,0.25)' }}>
            <Icon name="logout" size={18} /> Log out
          </button>
        </Panel>

        <Panel title="Incidents you filed" icon="alert" accent={ACCENT} className="ff-rise-card ff-st5">
          {mine.length === 0 ? (
            <div className="ff-empty"><span className="ff-empty-icon"><Icon name="alert" size={26} /></span><p className="ff-empty-text">No incidents filed yet this shift.</p></div>
          ) : mine.map((i, idx) => (
            <div key={i.id} style={{ display: 'flex', gap: 12, padding: '13px 0', borderBottom: idx < mine.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
              <span className={`ff-chip ff-chip-${i.severity === 'high' ? 'high' : i.severity === 'medium' ? 'medium' : 'low'}`} style={{ flexShrink: 0, alignSelf: 'flex-start' }}>{i.severity}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{i.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{i.location} · <span className={`ff-chip ff-chip-${i.status === 'resolved' ? 'resolved' : i.status === 'assigned' ? 'assigned' : 'new'}`} style={{ padding: '2px 8px', fontSize: 10 }}>{i.status}</span></div>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}
