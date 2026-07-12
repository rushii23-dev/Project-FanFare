import { useState, useRef, useEffect } from 'react'
import { BRICOLAGE } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { askAIJson, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'
import SimBadge from '../shared/SimBadge.jsx'

const SUGGEST = ['Which zone is busiest?', 'Longest gate queue?', 'What should I do right now?', 'Are we heading for a crush?', 'Where can I redeploy volunteers from?']

const SCREENS = ['organizer-heatmap', 'organizer-incidents', 'organizer-briefings', 'organizer-analytics', 'organizer-team']

const SYSTEM = `You are the FanFare operations copilot for the organizer running a FIFA World Cup 2026 match.

You reason over live venue telemetry to support real-time decisions. You are talking to a control-room operator during a live match: they need a judgement and an action, not a summary.

Rules:
- Use ONLY the numbers in the TELEMETRY block. Never invent a zone, gate, figure or incident. If the telemetry is empty, say the feed is down and stop.
- Lead with the answer. Then, when it matters, say what to DO about it — which gate to open, where to pull volunteers from, what to watch.
- Crowd-safety thresholds you should apply: a zone at or above 85% of capacity is a concern; at or above 95% it is urgent and needs immediate relief. A gate wait above 20 minutes is a concern.
- Be concise: 2-4 sentences. No preamble, no restating the question.

Respond with JSON matching exactly this schema:
{
  "text": "your answer, 2-4 sentences",
  "metrics": [["Short label", "Value"], ...],   // 0-3 key figures backing the answer, drawn from the telemetry
  "to": "organizer-heatmap" | "organizer-incidents" | "organizer-briefings" | "organizer-analytics" | "organizer-team" | null   // a screen worth opening next, or null
}`

const pc = z => Math.round(z.current / z.capacity * 100)

function telemetry(zones, gates) {
  if (!zones.length && !gates.length) return 'TELEMETRY\n(The venue feed is not reporting. No zone or gate data available.)\nEND TELEMETRY'

  const att = zones.reduce((s, z) => s + z.current, 0)
  const cap = zones.reduce((s, z) => s + z.capacity, 0)
  const zoneLines = zones
    .map(z => `  ${z.id} | ${z.name} | ${z.current}/${z.capacity} (${pc(z)}%) | trend ${z.trend > 0 ? '+' : ''}${z.trend || 0} in last tick`)
    .join('\n')
  const gateLines = gates
    .map(g => `  Gate ${g.id} | ${g.isClosed ? 'CLOSED' : `${g.waitMin} min wait, ${g.density}% density`}`)
    .join('\n')

  return `TELEMETRY (live, updates every 5s)
Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
Total in venue: ${att.toLocaleString()} of ${cap.toLocaleString()} capacity (${Math.round(att / cap * 100)}%)

ZONES:
${zoneLines}

GATES:
${gateLines}
END TELEMETRY`
}

export default function OrganizerCopilot({ nav, zones = [], gates = [] }) {
  const ai = useAIStatus()
  const [messages, setMessages] = useState([{
    role: 'system',
    text: 'Operations copilot. I read the live venue feed every time you ask, so my answers reflect the venue as it is right now. Ask about crowd density, gate queues, or what to do next.',
  }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const threadRef = useRef(null)
  useEffect(() => { threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, busy])

  const ask = async (raw) => {
    const text = (raw ?? input).trim()
    if (!text || busy) return
    setInput('')
    const history = [...messages, { role: 'user', text }]
    setMessages(history)
    setBusy(true)

    const transcript = history.slice(-7).map(m => `${m.role === 'user' ? 'Operator' : 'Copilot'}: ${m.text}`).join('\n')
    // Telemetry is rebuilt at ask-time, not at mount — a 40-second-old snapshot
    // is worse than useless in a control room.
    const prompt = `${telemetry(zones, gates)}

CONVERSATION SO FAR:
${transcript}

Answer the operator's latest question as JSON.`

    try {
      const res = await askAIJson({ system: SYSTEM, prompt, temperature: 0.2 })
      setMessages(m => [...m, {
        role: 'system',
        text: String(res.text || '').trim() || 'No answer returned.',
        metrics: Array.isArray(res.metrics) ? res.metrics.filter(x => Array.isArray(x) && x.length === 2).slice(0, 3) : [],
        // Never trust a model-supplied route into nav() — allowlist it.
        to: SCREENS.includes(res.to) ? res.to : null,
      }])
    } catch (e) {
      setMessages(m => [...m, { role: 'system', text: aiErrorMessage(e), error: true }])
    }
    setBusy(false)
  }

  return (
    <div>
      <PageHead
        eyebrow="Generative AI"
        title="Operations copilot"
        subtitle="Gemini reasoning over the live venue feed. Every answer is computed from the telemetry below — it will not invent a number."
        action={<SimBadge />}
      />

      {!ai.checking && !ai.configured && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--muted)', borderColor: 'rgba(226,58,69,0.3)' }}>
          <Icon name="info" size={16} />
          The copilot is offline — no <code>GEMINI_API_KEY</code> is configured on this deployment.
        </div>
      )}

      <div className="ff-panel ff-rise-card ff-st1" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'min(62vh, 560px)' }}>
        <div ref={threadRef} className="ff-chat-thread">
          {messages.map((m, i) => (
            <div key={i} className={`ff-chat-bubble ${m.role}`} style={{ ...(m.role === 'system' ? { maxWidth: '92%' } : {}), ...(m.error ? { color: 'var(--c-red)' } : {}) }}>
              <div>{m.text}</div>
              {m.metrics?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {m.metrics.map(([l, v]) => (
                    <span key={l} style={{ display: 'inline-flex', flexDirection: 'column', padding: '6px 12px', borderRadius: 10, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>{l}</span>
                      <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{v}</span>
                    </span>
                  ))}
                </div>
              )}
              {m.to && <button onClick={() => nav(m.to)} className="ff-filter-chip" style={{ marginTop: 10 }}>Open {m.to.split('-')[1]} <Icon name="arrow" size={13} /></button>}
            </div>
          ))}
          {busy && (
            <div className="ff-chat-bubble system" style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(d => <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted)', animation: `ff-live-dot 1s ${d * 0.2}s infinite` }} />)}
            </div>
          )}
        </div>
        <div style={{ padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--line)' }}>
          {SUGGEST.map(s => <button key={s} onClick={() => ask(s)} className="ff-filter-chip" style={{ fontSize: 12.5, padding: '6px 12px' }}>{s}</button>)}
        </div>
        <div className="ff-chat-input-row">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="Ask about the live operation…" className="ff-dash-input" style={{ flex: 1 }} />
          <button onClick={() => ask()} disabled={busy || !input.trim()} className="ff-btn" style={{ width: 46, height: 46, borderRadius: 12, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: busy || !input.trim() ? 0.55 : 1 }} aria-label="Send"><Icon name="send" size={19} /></button>
        </div>
      </div>
    </div>
  )
}
