import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'

// Staff Profile — end-of-shift summary, handoff notes, logout
export default function StaffProfile({ nav, staffRoster, tasks, incidents, onLogout }) {
  const me = staffRoster[0]
  const [handoffNote, setHandoffNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const doneCount = tasks.filter(t => t.status === 'done').length
  const myIncidents = incidents.filter(i => i.reportedBy === me.name).length

  const handleSaveNote = () => {
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('staff-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 24,
      }}>
        Profile & Shift
      </h2>

      {/* Staff info */}
      <div className="ff-dash-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: 'rgba(47,162,78,0.15)',
            border: '1px solid rgba(47,162,78,0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20, fontWeight: 700, color: C.green,
          }}>
            {me.name.split(' ').map(w => w[0]).join('')}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f4' }}>{me.name}</div>
            <div style={{ fontSize: 13, color: '#9a9a9a' }}>{me.role} · Zone {me.zone}</div>
          </div>
        </div>
      </div>

      {/* Shift summary */}
      <div className="ff-dash-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 20,
        }}>
          Shift summary
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'rgba(47,162,78,0.06)', border: '1px solid rgba(47,162,78,0.15)' }}>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28, color: C.green }}>{doneCount}</div>
            <div style={{ fontSize: 12, color: '#9a9a9a' }}>Tasks done</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'rgba(42,165,224,0.06)', border: '1px solid rgba(42,165,224,0.15)' }}>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28, color: C.blue }}>{myIncidents}</div>
            <div style={{ fontSize: 12, color: '#9a9a9a' }}>Incidents filed</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28, color: '#f4f4f4' }}>
              {new Date(me.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: 12, color: '#9a9a9a' }}>Shift ends</div>
          </div>
        </div>
      </div>

      {/* Handoff notes */}
      <div className="ff-dash-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 12,
        }}>
          Hand off to next shift
        </div>
        <textarea
          value={handoffNote}
          onChange={e => setHandoffNote(e.target.value)}
          placeholder="Leave notes for the next shift — ongoing situations, things to watch for..."
          rows={4}
          style={{
            width: '100%', background: '#0e0e0e', border: '1px solid #333',
            color: '#f4f4f4', padding: '14px 18px', borderRadius: 12,
            fontSize: 14, fontFamily: HANKEN, resize: 'vertical', outline: 'none',
          }}
        />
        <button
          onClick={handleSaveNote}
          style={{
            marginTop: 12, padding: '10px 24px', borderRadius: 24,
            border: 'none', background: noteSaved ? '#2fa24e' : C.green,
            color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            fontFamily: HANKEN, textTransform: 'uppercase', transition: 'background 0.3s',
          }}
        >
          {noteSaved ? '✓ Note saved' : 'Save handoff note'}
        </button>
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
