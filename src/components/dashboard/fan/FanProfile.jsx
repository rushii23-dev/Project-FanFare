import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { languages } from '../../../data.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import DataPending from '../shared/DataPending.jsx'
import { toast } from '../shared/Toast.jsx'

const ACCENT = '#0a7d3e'

export default function FanProfile({ fanProfile, onUpdateProfile, onLogout }) {
  const a = fanProfile.accessibility
  const activeA11y = Object.entries(a).filter(([, v]) => v).map(([k]) => k)
  const initials = fanProfile.name.split(' ').map(w => w[0]).join('').toUpperCase()

  return (
    <div>
      <PageHead eyebrow="Profile" title="Your account" subtitle="Manage your details, language and preferences." />

      <div className="ff-fan-profile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel className="ff-rise-card ff-st1" accent={ACCENT}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
            <span style={{ width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 24, background: 'linear-gradient(150deg,#0a7d3e,#0a7a3c)', boxShadow: '0 8px 20px rgba(14,159,79,0.3)' }}>{initials}</span>
            <div>
              <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>{fanProfile.name}</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 3 }}>{fanProfile.email}</div>
              {fanProfile.rewards.level && <span className="ff-chip ff-chip-done" style={{ marginTop: 8 }}>{fanProfile.rewards.level}</span>}
            </div>
          </div>
          {fanProfile.ticketConfirmed ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px' }}>
              {[['Ticket ID', fanProfile.ticketId], ['Gate', `Gate ${fanProfile.gate}`], ['Section', fanProfile.section], ['Seat', `Row ${fanProfile.row} · Seat ${fanProfile.seat}`]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>
          ) : (
            <DataPending icon="seat" title="No ticket added yet" message="Add your ticket details on the Matchday tab to see your gate, section and seat here." style={{ padding: '24px 12px' }} />
          )}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel title="Language" icon="globe" accent={ACCENT} className="ff-rise-card ff-st2">
            <select
              value={fanProfile.language}
              onChange={e => { onUpdateProfile(p => ({ ...p, language: e.target.value })); toast('Language updated', { accent: ACCENT }) }}
              className="ff-dash-input"
            >
              {languages.map(l => <option key={l}>{l}</option>)}
            </select>
          </Panel>

          <Panel title="Accessibility" icon="access" accent={ACCENT} className="ff-rise-card ff-st3">
            {activeA11y.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activeA11y.map(k => <span key={k} className="ff-chip ff-chip-progress">{k.replace(/([A-Z])/g, ' $1')}</span>)}
              </div>
            ) : (
              <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>No accessibility preferences set. Configure them in the Accessibility tab.</div>
            )}
          </Panel>

          <Panel title="Rewards" icon="star" accent={ACCENT} className="ff-rise-card ff-st4">
            {fanProfile.rewards.points > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 30, color: '#c8890a' }}>{fanProfile.rewards.points}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Green Champion points · {fanProfile.rewards.scans} scans</div>
                </div>
                <span style={{ color: '#c8890a' }}><Icon name="star" size={30} /></span>
              </div>
            ) : (
              <DataPending icon="star" title="No points yet" message="Scan your first item at a venue recycling station and your Green Champion points will start showing up here." style={{ padding: '24px 12px' }} />
            )}
          </Panel>

          <button onClick={onLogout} className="ff-dash-card interactive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', color: 'var(--c-red)', fontFamily: HANKEN, fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderColor: 'rgba(228,0,43,0.25)' }}>
            <Icon name="logout" size={18} /> Log out
          </button>
        </div>
      </div>
    </div>
  )
}
