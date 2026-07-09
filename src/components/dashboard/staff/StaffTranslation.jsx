import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { languages, C } from '../../../data.js'

// Live Translation — two-pane two-way translator
export default function StaffTranslation({ nav }) {
  const [staffLang, setStaffLang] = useState('English')
  const [fanLang, setFanLang] = useState('Spanish')
  const [staffInput, setStaffInput] = useState('')
  const [fanInput, setFanInput] = useState('')
  const [history, setHistory] = useState([
    { from: 'staff', staffText: 'Can I help you find your seat?', fanText: '¿Puedo ayudarte a encontrar tu asiento?' },
    { from: 'fan', staffText: "Yes, I can't find section 214.", fanText: 'Sí, no puedo encontrar la sección 214.' },
  ])

  const swap = () => {
    const tmp = staffLang
    setStaffLang(fanLang)
    setFanLang(tmp)
  }

  const mockTranslations = {
    'Where is the restroom': 'Dónde está el baño',
    'Follow me': 'Sígueme',
    'Your seat is this way': 'Tu asiento está por aquí',
    'Do you need help': '¿Necesitas ayuda?',
  }

  const handleStaffSend = () => {
    if (!staffInput.trim()) return
    const translated = mockTranslations[staffInput.trim()] || `[${fanLang}] ${staffInput}`
    setHistory(prev => [...prev, { from: 'staff', staffText: staffInput, fanText: translated }])
    setStaffInput('')
  }

  const handleFanSend = () => {
    if (!fanInput.trim()) return
    const translated = `[${staffLang} translation] ${fanInput}`
    setHistory(prev => [...prev, { from: 'fan', staffText: translated, fanText: fanInput }])
    setFanInput('')
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('staff-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Live Translation
      </h2>
      <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>
        Two-way real-time translation. Speak your language — they hear theirs.
      </p>

      {/* Language bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        justifyContent: 'center',
      }}>
        <select
          value={staffLang}
          onChange={e => setStaffLang(e.target.value)}
          aria-label="Your language"
          style={{
            background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)',
            color: '#cfcfcf', padding: '10px 16px', borderRadius: 10, fontSize: 14,
            fontFamily: HANKEN, flex: 1, maxWidth: 200,
          }}
        >
          {languages.map(l => <option key={l}>{l}</option>)}
        </select>

        <button
          onClick={swap}
          aria-label="Swap languages"
          style={{
            width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: '#cfcfcf', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ⇄
        </button>

        <select
          value={fanLang}
          onChange={e => setFanLang(e.target.value)}
          aria-label="Fan language"
          style={{
            background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)',
            color: '#cfcfcf', padding: '10px 16px', borderRadius: 10, fontSize: 14,
            fontFamily: HANKEN, flex: 1, maxWidth: 200,
          }}
        >
          {languages.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Two-pane conversation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Staff pane */}
        <div className="ff-dash-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 400 }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12, fontWeight: 600, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            You ({staffLang})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((h, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.4,
                background: h.from === 'staff' ? 'rgba(47,162,78,0.1)' : 'rgba(255,255,255,0.03)',
                color: h.from === 'staff' ? '#cfcfcf' : '#9a9a9a',
                alignSelf: h.from === 'staff' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                {h.staffText}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <input
              className="ff-input"
              value={staffInput}
              onChange={e => setStaffInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStaffSend()}
              placeholder={`Type in ${staffLang}...`}
              style={{ flex: 1, borderRadius: 20, padding: '10px 16px', fontSize: 13 }}
            />
            <button
              onClick={handleStaffSend}
              disabled={!staffInput.trim()}
              aria-label="Send"
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: staffInput.trim() ? C.green : '#333', color: '#fff',
                fontSize: 14, cursor: staffInput.trim() ? 'pointer' : 'default',
              }}
            >
              ↑
            </button>
          </div>
        </div>

        {/* Fan pane */}
        <div className="ff-dash-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 400 }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12, fontWeight: 600, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Fan ({fanLang})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((h, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.4,
                background: h.from === 'fan' ? 'rgba(42,165,224,0.1)' : 'rgba(255,255,255,0.03)',
                color: h.from === 'fan' ? '#cfcfcf' : '#9a9a9a',
                alignSelf: h.from === 'fan' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                {h.fanText}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <input
              className="ff-input"
              value={fanInput}
              onChange={e => setFanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFanSend()}
              placeholder={`Type in ${fanLang}...`}
              style={{ flex: 1, borderRadius: 20, padding: '10px 16px', fontSize: 13 }}
            />
            <button
              onClick={handleFanSend}
              disabled={!fanInput.trim()}
              aria-label="Send"
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: fanInput.trim() ? C.blue : '#333', color: '#fff',
                fontSize: 14, cursor: fanInput.trim() ? 'pointer' : 'default',
              }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
