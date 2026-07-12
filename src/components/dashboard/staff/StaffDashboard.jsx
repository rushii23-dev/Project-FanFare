import { BRICOLAGE, HANKEN } from '../../ui.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import StatCard from '../shared/StatCard.jsx'
import ProgressRing from '../shared/ProgressRing.jsx'
import WeatherTile from '../shared/WeatherTile.jsx'
import DataPending from '../shared/DataPending.jsx'
import { toast } from '../shared/Toast.jsx'

const ACCENT = '#b26a00'
const DUTY = [
  { id: 'available', label: 'Available', color: '#0e9f4f' },
  { id: 'on-break', label: 'On break', color: '#b26a00' },
  { id: 'off-duty', label: 'Off duty', color: '#7a9585' },
]

export default function StaffDashboard({ nav, staffRoster, tasks, zones, onUpdateTasks, onUpdateStaff }) {
  const me = staffRoster[0]

  // No staff account is linked yet, so there is no real shift to show.
  if (!me) {
    return (
      <div>
        <PageHead eyebrow="Staff" title="Your shift" subtitle="Your shift, tasks and zone alerts show up here once you're on the team for this match." />
        <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, alignItems: 'start' }}>
          <Panel className="ff-rise-card ff-st1">
            <DataPending icon="clipboard" title="No shift data yet" message="Once you're on the team for this match and your shift starts, your tasks, shift times and zone alerts appear here." style={{ padding: '52px 24px' }} />
          </Panel>
          <div className="ff-rise-card ff-st2"><WeatherTile /></div>
        </div>
      </div>
    )
  }

  const myZone = zones.find(z => z.id === me.zone) || zones[0]
  const zonePct = Math.round((myZone.current / myZone.capacity) * 100)
  const done = tasks.filter(t => t.status === 'done').length
  const inProg = tasks.filter(t => t.status === 'in-progress').length
  const pending = tasks.filter(t => t.status === 'pending').length
  const taskPct = Math.round((done / tasks.length) * 100)
  const upNext = tasks.filter(t => t.status !== 'done').slice(0, 3)

  const fmt = t => { const d = new Date(t); return isNaN(d) ? t : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }
  const setDuty = (v) => { onUpdateStaff(prev => prev.map((s, i) => i === 0 ? { ...s, status: v } : s)); toast(`Status: ${v.replace('-', ' ')}`, { accent: ACCENT }) }
  const complete = (id) => { onUpdateTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t)); toast('Task completed', { accent: '#0e9f4f' }) }

  return (
    <div>
      <PageHead eyebrow={`${me.role} · Zone ${me.zone}`} title={`Hi ${me.name.split(' ')[0]}`} subtitle="Your shift at a glance." />

      <div className="ff-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 18 }}>
        <div className="ff-rise-card ff-st1"><StatCard icon="check" label="Tasks done" value={done} suffix={`/${tasks.length}`} accent="#0e9f4f" /></div>
        <div className="ff-rise-card ff-st2"><StatCard icon="clock" label="In progress" value={inProg} accent={ACCENT} /></div>
        <div className="ff-rise-card ff-st3"><StatCard icon="grid" label={`Zone ${me.zone} density`} value={zonePct} suffix="%" accent={zonePct >= 85 ? '#e4002b' : ACCENT} /></div>
        <div className="ff-rise-card ff-st4"><StatCard icon="alert" label="Incidents filed" value={me.incidentsFiled} accent="#e4002b" /></div>
      </div>

      <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel title="My shift" icon="clock" accent={ACCENT} className="ff-rise-card ff-st5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>{fmt(me.shiftStart)} — {fmt(me.shiftEnd)}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{me.role} · assigned to Zone {me.zone}</div>
              </div>
              <div style={{ display: 'inline-flex', gap: 6, background: 'var(--elev-2)', padding: 5, borderRadius: 30, border: '1px solid var(--line)' }}>
                {DUTY.map(d => (
                  <button key={d.id} onClick={() => setDuty(d.id)} className="ff-press"
                    style={{ border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 24, fontFamily: HANKEN, fontWeight: 700, fontSize: 12,
                      background: me.status === d.id ? d.color : 'transparent', color: me.status === d.id ? '#fff' : 'var(--muted)' }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Up next" icon="clipboard" accent={ACCENT} className="ff-rise-card ff-st6"
            action={<button className="ff-filter-chip" onClick={() => nav('staff-tasks')}>All tasks</button>}>
            {upNext.length === 0 ? (
              <div style={{ fontSize: 14, color: 'var(--muted)', padding: '8px 0' }}>All tasks complete. Great work.</div>
            ) : upNext.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <span className={`ff-chip ff-chip-${t.priority === 'high' ? 'high' : t.priority === 'medium' ? 'medium' : 'low'}`}>{t.priority}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{t.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Zone {t.zone} · {t.time}</div>
                </div>
                <button onClick={() => complete(t.id)} className="ff-filter-chip" style={{ padding: '6px 12px' }}>Complete</button>
              </div>
            ))}
          </Panel>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel title="Task progress" icon="check" accent={ACCENT} className="ff-rise-card ff-st5">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <ProgressRing value={taskPct} size={92} color="#0e9f4f" sub="done" />
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-2)' }}><b>{done}</b> done · <b>{inProg}</b> active · <b>{pending}</b> pending</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>Keep it up — you're {taskPct}% through today's list.</div>
              </div>
            </div>
          </Panel>
          <div className="ff-rise-card ff-st6"><WeatherTile /></div>
        </div>
      </div>
    </div>
  )
}
