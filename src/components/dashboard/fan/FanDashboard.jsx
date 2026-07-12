import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { useVenue } from '../../../lib/venue.js'
import { useWorldCup } from '../../../lib/freeApis.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import DataPending from '../shared/DataPending.jsx'
import ProgressRing from '../shared/ProgressRing.jsx'
import Sparkline from '../shared/Sparkline.jsx'
import WeatherTile from '../shared/WeatherTile.jsx'
import WorldCupFeed from '../shared/WorldCupFeed.jsx'
import TicketModal from '../shared/TicketModal.jsx'

const ACCENT = '#0e9f4f'

export default function FanDashboard({ nav, fanProfile, zones, gates, onUpdateProfile }) {
  const venue = useVenue()
  const [showTicket, setShowTicket] = useState(false)
  const confirmed = !!fanProfile.ticketConfirmed
  const [editTicket, setEditTicket] = useState(!confirmed)
  const [tForm, setTForm] = useState({ gate: fanProfile.gate, section: fanProfile.section, row: fanProfile.row, seat: fanProfile.seat })
  const saveTicket = () => {
    const gate = (tForm.gate || '').trim() || 'C'
    const section = (tForm.section || '').trim() || '214'
    const row = (tForm.row || '').trim() || '12'
    const seat = (tForm.seat || '').trim() || '8'
    const ticketId = `FF-2026-${gate}${section}-${row}-${seat}`.toUpperCase()
    onUpdateProfile?.(p => ({ ...p, gate, section, row, seat, ticketId, ticketConfirmed: true }))
    setEditTicket(false)
  }
  const wc = useWorldCup()
  const featuredCity = wc.fixtures?.[0]?.city || wc.results?.[0]?.city || null

  const myGate = gates.find(g => g.id === fanProfile.gate) || gates[0] || null
  const calmer = myGate ? gates.filter(g => !g.isClosed && g.id !== myGate.id).sort((a, b) => a.waitMin - b.waitMin)[0] : null
  const myZone = zones.find(z => z.id === fanProfile.gate) || zones[0] || null
  const zonePct = myZone ? Math.round((myZone.current / myZone.capacity) * 100) : 0

  const quick = [
    { icon: 'chat', label: 'Ask the assistant', to: 'fan-concierge' },
    { icon: 'map', label: 'Open live map', to: 'fan-map' },
    { icon: 'access', label: 'Accessibility', to: 'fan-accessibility' },
    { icon: 'bus', label: 'Plan transport', to: 'fan-transport' },
  ]

  return (
    <div>
      <PageHead eyebrow="Matchday" title={`Good to see you, ${(fanProfile.name || 'Fan').split(' ')[0]}`} subtitle="Your live World Cup 26 hub." />

      <div className="ff-fan-top" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, alignItems: 'start' }}>
        <div className="ff-rise-card ff-st1"><WorldCupFeed data={wc} /></div>
        <div className="ff-rise-card ff-st2"><WeatherTile city={featuredCity} /></div>
      </div>

      <div className="ff-fan-mid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginTop: 18 }}>
        <Panel title="Your ticket" icon="seat" accent={ACCENT} className="ff-rise-card ff-st3"
          action={confirmed && !editTicket ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setTForm({ gate: fanProfile.gate, section: fanProfile.section, row: fanProfile.row, seat: fanProfile.seat }); setEditTicket(true) }} className="ff-filter-chip">Edit</button>
              <button onClick={() => setShowTicket(true)} className="ff-filter-chip">View</button>
            </div>
          ) : null}>
          {editTicket ? (
            <div>
              {!confirmed && (
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.45 }}>
                  Add your ticket so your assistant can guarantee accurate gate, seat and route guidance.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[['Gate', 'gate', 'C'], ['Section', 'section', '214'], ['Row', 'row', '12'], ['Seat', 'seat', '8']].map(([label, key, ph]) => (
                  <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700 }}>{label}</span>
                    <input value={tForm[key] || ''} onChange={e => setTForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} className="ff-dash-input" style={{ padding: '10px 8px', textAlign: 'center', fontFamily: BRICOLAGE, fontWeight: 700 }} />
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={saveTicket} className="ff-btn" style={{ flex: 1, border: 'none', color: '#fff', padding: '11px', borderRadius: 10, fontFamily: HANKEN, fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', cursor: 'pointer' }}>Save ticket</button>
                {confirmed && <button onClick={() => setEditTicket(false)} className="ff-filter-chip">Cancel</button>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 12px' }}>
              {[['Gate', fanProfile.gate], ['Section', fanProfile.section], ['Row', fanProfile.row], ['Seat', fanProfile.seat]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Your gate" icon="route" live={!!myGate} accent={ACCENT} className="ff-rise-card ff-st4">
          {myGate ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 40, lineHeight: 1, color: myGate.waitMin >= 10 ? 'var(--c-red)' : 'var(--text)' }}>{myGate.waitMin}<span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 600 }}> min</span></div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>wait at Gate {myGate.id}</div>
                </div>
                <Sparkline data={myGate.trend} color={ACCENT} width={90} height={40} />
              </div>
              {calmer && (
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(14,159,79,0.08)', border: '1px solid rgba(14,159,79,0.2)' }}>
                  <span style={{ color: ACCENT, display: 'inline-flex' }}><Icon name="info" size={16} /></span>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Gate {calmer.id} is calmer — {calmer.waitMin} min</span>
                </div>
              )}
            </>
          ) : (
            <DataPending icon="route" title="Gate wait times" message="Add your ticket on the Matchday tab, and your gate's live wait time will show here on matchday." />
          )}
        </Panel>

        <Panel title="Your zone" icon="grid" live={!!myZone} accent={ACCENT} className="ff-rise-card ff-st5">
          {myZone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <ProgressRing value={zonePct} size={92} color={zonePct >= 85 ? '#e4002b' : zonePct >= 65 ? '#c8890a' : ACCENT} sub="full" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{myZone.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{myZone.current.toLocaleString()} / {myZone.capacity.toLocaleString()}</div>
                <div style={{ fontSize: 12.5, color: zonePct >= 85 ? 'var(--c-red)' : 'var(--muted)', marginTop: 8 }}>{zonePct >= 85 ? 'Busy — allow extra time' : 'Comfortable flow'}</div>
              </div>
            </div>
          ) : (
            <DataPending icon="grid" title="Crowd density" message="Add your ticket, and you'll see how busy your stand is here on matchday." />
          )}
        </Panel>
      </div>

      <div className="ff-fan-quick" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 18 }}>
        {quick.map((q, i) => (
          <button key={q.to} onClick={() => nav(q.to)} className={`ff-dash-card interactive ff-rise-card ff-st${6 + i}`} style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, background: 'rgba(14,159,79,0.1)', border: '1px solid rgba(14,159,79,0.24)', flexShrink: 0 }}>
              <Icon name={q.icon} size={21} />
            </span>
            <span style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{q.label}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--faint)', display: 'inline-flex' }}><Icon name="arrow" size={18} /></span>
          </button>
        ))}
      </div>

      {showTicket && <TicketModal ticket={fanProfile} venue={venue} onClose={() => setShowTicket(false)} />}
    </div>
  )
}
