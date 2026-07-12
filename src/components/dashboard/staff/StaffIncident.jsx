import { useState, useRef } from 'react'
import { HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { askAIJson, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import { toast } from '../shared/Toast.jsx'

const ACCENT = '#915700'
const SEV = [['low', '#0a7d3e'], ['medium', '#915700'], ['high', '#e4002b']]
const SEV_IDS = SEV.map(([s]) => s)
const CATS = ['medical', 'crowd', 'facilities', 'accessibility', 'security', 'other']
// Fallback zone list so staff can always file, even before a live zone feed exists.
const FALLBACK_ZONES = ['A', 'B', 'C', 'D', 'E', 'F'].map(id => ({ id, name: `Zone ${id}` }))

const SYSTEM = `You are the FanFare incident intake assistant for stewards and volunteers at the FIFA World Cup 2026.

A volunteer has just spoken or typed rough, panicked, half-formed notes about something they are looking at right now. Your job is to turn that into a report the control room can act on in seconds.

Rules:
- Write the description in clear, factual, third-person operational English. Strip filler and hesitation. Keep every concrete detail the reporter gave (numbers, locations, people, injuries) and add NOTHING they did not say.
- If the notes are vague, keep the description vague. Never invent a casualty, a cause or a headcount to make the report look complete.
- Severity: "high" = anyone is hurt or in immediate danger, or a crush/fire/violence risk exists. "medium" = escalating and needs attention soon. "low" = a nuisance or a routine fix.
- Anything involving injury, breathing, chest pain, collapse, or a child separated from their guardian is ALWAYS high.
- "action" is the single most useful thing the responding steward should do first. One sentence, imperative. It goes to someone running toward the scene.

Respond with JSON exactly matching:
{
  "title": "under 60 chars, specific, no filler",
  "category": "medical" | "crowd" | "facilities" | "accessibility" | "security" | "other",
  "severity": "low" | "medium" | "high",
  "description": "clear factual account, 1-3 sentences",
  "action": "the first thing the responder should do"
}`

export default function StaffIncident({ zones, onFileIncident }) {
  const zoneOptions = zones.length ? zones : FALLBACK_ZONES
  const ai = useAIStatus()
  const [notes, setNotes] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [category, setCategory] = useState('crowd')
  const [zone, setZone] = useState(zoneOptions[0]?.id || 'C')
  const [action, setAction] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [listening, setListening] = useState(false)
  const recogRef = useRef(null)

  // Dictation feeds the raw notes box, not the report — the model does the
  // structuring. A steward at an incident should not be filling in dropdowns.
  const dictate = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast('Voice not supported in this browser', { icon: 'info', accent: '#e4002b' }); return }
    if (listening) { recogRef.current?.stop(); return }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = false; r.continuous = true
    r.onresult = (e) => setNotes(Array.from(e.results).map(x => x[0].transcript).join(' '))
    r.onend = () => setListening(false); r.onerror = () => setListening(false)
    recogRef.current = r; setListening(true); r.start()
  }

  const draft = async () => {
    const raw = notes.trim()
    if (!raw || drafting) return
    setDrafting(true)
    const z = zoneOptions.find(x => x.id === zone)
    try {
      const res = await askAIJson({
        system: SYSTEM,
        temperature: 0.2,
        prompt: `Location: ${z ? z.name : `Zone ${zone}`}
Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

The volunteer's raw notes:
"${raw}"

Produce the JSON report.`,
      })
      setTitle(String(res.title || '').trim().slice(0, 80))
      setDesc(String(res.description || '').trim())
      setAction(String(res.action || '').trim())
      if (CATS.includes(res.category)) setCategory(res.category)
      if (SEV_IDS.includes(res.severity)) setSeverity(res.severity)
      toast('Report drafted — review before filing', { accent: ACCENT, icon: 'doc' })
    } catch (e) {
      toast(aiErrorMessage(e), { accent: '#e4002b', icon: 'alert' })
    }
    setDrafting(false)
  }

  const submit = () => {
    if (!title.trim()) { toast('Add a short title', { icon: 'info', accent: '#e4002b' }); return }
    const z = zoneOptions.find(x => x.id === zone)
    onFileIncident({
      id: `INC-${Date.now().toString().slice(-5)}`, severity, category, title: title.trim(),
      description: desc.trim() || 'No additional detail provided.',
      recommendedAction: action.trim() || null,
      location: z ? z.name : `Zone ${zone}`, zone, status: 'new', assignedTo: null,
      reportedBy: 'You', reportedAt: new Date().toISOString(),
    })
    toast('Incident filed & routed to Operations', { accent: '#0a7d3e' })
    setNotes(''); setTitle(''); setDesc(''); setAction(''); setSeverity('medium'); setCategory('crowd')
  }

  return (
    <div>
      <PageHead
        eyebrow="Generative AI"
        title="File an incident"
        subtitle="Just say what you see. Gemini turns your rough notes into a structured report, classifies the severity, and tells the responder what to do first."
      />

      <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel className="ff-rise-card ff-st1" accent={ACCENT}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="What's happening? Speak or type — don't worry about wording">
              <div style={{ position: 'relative' }}>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder={listening ? 'Listening… speak now' : "e.g. there's a woman down near the stairs by 214, she's conscious but says her chest hurts, crowd is bunching up around her"} className="ff-dash-input" style={{ resize: 'vertical', paddingRight: 54 }} />
                <button onClick={dictate} className={`ff-icon-btn${listening ? ' recording' : ''}`} aria-label="Dictate"
                  style={{ position: 'absolute', top: 8, right: 8, ...(listening ? { borderColor: '#e4002b', color: '#e4002b' } : {}) }}>
                  <Icon name="mic" size={18} />
                </button>
              </div>
              <button onClick={draft} disabled={drafting || !notes.trim() || !ai.configured} className="ff-btn" style={{ marginTop: 12, width: '100%', padding: '13px', borderRadius: 12, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: drafting || !notes.trim() || !ai.configured ? 'default' : 'pointer', opacity: drafting || !notes.trim() || !ai.configured ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name="cpu" size={16} />
                {drafting ? 'Drafting report…' : 'Draft report with AI'}
              </button>
              {!ai.checking && !ai.configured && (
                <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 8 }}>AI drafting is offline — fill the report in manually below.</p>
              )}
            </Field>

            <div style={{ height: 1, background: 'var(--line)' }} />

            <Field label="Title">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Queue backing into concourse" className="ff-dash-input" />
            </Field>

            <Field label="Description">
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="The drafted account appears here — edit before filing." className="ff-dash-input" style={{ resize: 'vertical' }} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Category">
                <select value={category} onChange={e => setCategory(e.target.value)} className="ff-dash-input" style={{ textTransform: 'capitalize' }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Zone">
                <select value={zone} onChange={e => setZone(e.target.value)} className="ff-dash-input">
                  {zoneOptions.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Severity">
              <div style={{ display: 'flex', gap: 8 }}>
                {SEV.map(([s, c]) => (
                  <button key={s} onClick={() => setSeverity(s)} className="ff-press" style={{ flex: 1, textTransform: 'capitalize', cursor: 'pointer', padding: '12px', borderRadius: 12, fontFamily: HANKEN, fontWeight: 700, fontSize: 13,
                    border: `1px solid ${severity === s ? c : 'var(--line-strong)'}`, background: severity === s ? c : 'var(--panel)', color: severity === s ? '#fff' : 'var(--muted)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <button onClick={submit} className="ff-btn" style={{ padding: '16px', borderRadius: 14, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 14.5, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
              File incident
            </button>
          </div>
        </Panel>

        <Panel title="Live preview" icon="alert" accent={ACCENT} className="ff-rise-card ff-st2">
          <div style={{ padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'var(--elev-2)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <span className={`ff-chip ff-chip-${severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low'}`}>{severity}</span>
              <span className="ff-chip ff-chip-new" style={{ textTransform: 'capitalize' }}>{category}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{title || 'Incident title…'}</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>{desc || 'Speak what you see, then tap Draft report with AI.'}</div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="map" size={13} /> {(zoneOptions.find(z => z.id === zone) || {}).name || `Zone ${zone}`}
            </div>
          </div>

          {action && (
            <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(226,58,69,0.32)', background: 'rgba(226,58,69,0.07)' }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#e4002b', fontWeight: 700, marginBottom: 6 }}>Responder's first action</div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>{action}</div>
            </div>
          )}

          <p style={{ fontSize: 12.5, color: 'var(--faint)', marginTop: 14, display: 'flex', gap: 8 }}>
            <Icon name="info" size={14} /> The draft only ever restates what you reported — it will not invent details. Always review before filing.
          </p>
        </Panel>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700, display: 'block', marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  )
}
