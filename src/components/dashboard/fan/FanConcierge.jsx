import { useState, useRef, useEffect } from 'react'
import Icon from '../../landing/Icons.jsx'
import { generalGuidance } from '../../../data.js'
import { LANGS, useWeather, weatherMeta } from '../../../lib/freeApis.js'
import { useVenue, venueForPrompt } from '../../../lib/venue.js'
import { askAI, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'

const SUGGESTIONS = ['Where is my seat?', 'Which gate is quickest right now?', 'Where can I get food?', "What's the bag policy?", 'Is there a quiet room?']

const LANG_NAME = Object.fromEntries(LANGS.map(l => [l.code, l.label]))
const SPEECH_LANG = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR', de: 'de-DE', ar: 'ar-SA', ja: 'ja-JP', hi: 'hi-IN' }

const SYSTEM = `You are the FanFare matchday concierge for fans at the FIFA World Cup 2026.

Rules you must follow:
- Answer ONLY from the CONTEXT block. Never invent a gate number, seat, policy, time, or facility location.
- CRITICAL — we do NOT have this stadium's interior layout. No public source publishes it. The GENERAL GUIDANCE in the context is true of stadiums in general; it is NOT a floor plan of this ground. So you must never say "the restroom is 40m to your right" or name a room, corridor or concourse that isn't in the context. Offer the general guidance AS general guidance ("accessible restrooms are usually beside the lift banks — follow the wheelchair signs, or ask a steward"), and send the fan to signage or a steward for anything specific to this venue. Being honestly unsure beats confidently misdirecting someone in a crowd.
- The fan's ticket, the live gate waits, the live crowd figures, the real fixture and the real weather ARE reliable. Use those precisely and quote the actual numbers.
- When the fan asks about entering, queues or getting in, use the real gate waits and recommend the genuinely fastest open gate.
- You are talking to someone in a loud stadium on a phone. Be direct: 2-4 sentences, no preamble.
- Reply in the language named in REPLY_LANGUAGE, whatever language the question was asked in. Don't mention that you are translating.`

// Everything the model is allowed to know. Built fresh on every turn so live
// figures (gate waits, weather) are never stale by the time it answers.
function buildContext({ fanProfile: p, zones, gates, weather, venue }) {
  const ticket = p?.ticketConfirmed
    ? `Gate ${p.gate}, Section ${p.section}, Row ${p.row}, Seat ${p.seat} (ticket ${p.ticketId || 'confirmed'})`
    : 'NOT YET ADDED — the fan has not entered their ticket. Ask them to add it on the Matchday dashboard before giving seat-specific directions.'

  const openGates = (gates || []).filter(g => !g.isClosed)
  const gateLines = openGates.length
    ? openGates.map(g => `  Gate ${g.id}: ${g.waitMin} min wait, ${g.density}% density`).join('\n')
    : '  No live gate data available.'
  const closed = (gates || []).filter(g => g.isClosed).map(g => g.id)

  const zoneLines = (zones || []).length
    ? zones.map(z => `  ${z.name}: ${Math.round(z.current / z.capacity * 100)}% full`).join('\n')
    : '  No live crowd data available.'

  const w = weather?.live
    ? `${weatherMeta(weather.code).label}, ${weather.temp}°C (feels ${weather.feels}°C), wind ${weather.wind} km/h, humidity ${weather.humidity}%`
    : 'Live weather unavailable.'

  return `CONTEXT
Fan name: ${p?.name || 'Unknown'}
Fan's ticket: ${ticket}
Accessibility needs: ${describeAccess(p)}

THE REAL FIXTURE (from the live FIFA World Cup 2026 feed):
${venueForPrompt(venue)}
Current time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

Weather at the venue: ${w}

LIVE GATE WAITS (simulated telemetry):
${gateLines}
Closed gates: ${closed.length ? closed.join(', ') : 'none'}

LIVE ZONE OCCUPANCY (simulated telemetry):
${zoneLines}

GENERAL GUIDANCE — true of stadiums in general, NOT a floor plan of ${venue?.venue || 'this ground'}.
Offer it as general advice; never state it as a fact about this specific venue:
${generalGuidance.map(g => `  - ${g}`).join('\n')}
END CONTEXT`
}

function describeAccess(p) {
  const a = p?.accessibility || {}
  const on = Object.entries({
    wheelchair: 'wheelchair access', sensory: 'sensory / quiet spaces',
    largeText: 'large text', audioContent: 'audio description',
  }).filter(([k]) => a[k]).map(([, v]) => v)
  return on.length ? on.join(', ') : 'none declared'
}

export default function FanConcierge({ fanProfile, zones = [], gates = [] }) {
  const venue = useVenue()
  const weather = useWeather(venue.lat, venue.lon)
  const ai = useAIStatus()
  const [lang, setLang] = useState('en')
  const [messages, setMessages] = useState([{
    role: 'system',
    text: `Hi${fanProfile?.name ? ` ${  fanProfile.name.split(' ')[0]}` : ''}! I'm your matchday assistant. ${fanProfile?.ticketConfirmed
      ? 'I know your ticket and I can see live gate waits, so ask me anything — where your seat is, which gate to use, what the weather will do.'
      : "Add your ticket on your Matchday dashboard and I'll guide you to your exact seat — meanwhile, ask me anything about the venue."} Ask in any language.`,
  }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const threadRef = useRef(null)
  const recogRef = useRef(null)

  useEffect(() => { threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, busy])

  const send = async (raw) => {
    const text = (raw ?? input).trim()
    if (!text || busy) return
    setInput('')
    const history = [...messages, { role: 'user', text }]
    setMessages(history)
    setBusy(true)

    // Last few turns only — enough for "and where do I eat near there?" to
    // resolve, without paying for the whole thread on every question.
    const transcript = history
      .slice(-7)
      .map(m => `${m.role === 'user' ? 'Fan' : 'Assistant'}: ${m.text}`)
      .join('\n')

    const prompt = `${buildContext({ fanProfile, zones, gates, weather })}

REPLY_LANGUAGE: ${LANG_NAME[lang] || 'English'}

CONVERSATION SO FAR:
${transcript}

Write the assistant's next reply.`

    try {
      const answer = await askAI({ system: SYSTEM, prompt, temperature: 0.3 })
      setMessages(m => [...m, { role: 'system', text: answer.trim() }])
    } catch (e) {
      setMessages(m => [...m, { role: 'system', text: aiErrorMessage(e), error: true }])
    }
    setBusy(false)
  }

  const speak = (text) => {
    if (!window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = SPEECH_LANG[lang] || 'en-US'
    window.speechSynthesis.speak(u)
  }

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setMessages(m => [...m, { role: 'system', text: "Voice input isn't supported in this browser — please type your question." }]); return }
    if (listening) { recogRef.current?.stop(); return }
    const r = new SR()
    r.lang = SPEECH_LANG[lang] || 'en-US'
    r.interimResults = false
    r.onresult = (e) => send(e.results[0][0].transcript)
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    recogRef.current = r
    setListening(true)
    r.start()
  }

  return (
    <div>
      <PageHead
        eyebrow="Generative AI"
        title="Multilingual venue assistant"
        subtitle="Powered by Gemini, grounded in your ticket, live gate waits and venue weather. Ask in any language — it answers in yours."
        action={(
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--muted)', display: 'inline-flex' }}><Icon name="globe" size={18} /></span>
            <select value={lang} onChange={e => setLang(e.target.value)} aria-label="Answer language" className="ff-dash-input" style={{ width: 'auto', padding: '9px 12px' }}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        )}
      />

      {!ai.checking && !ai.configured && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--muted)', borderColor: 'rgba(226,58,69,0.3)' }}>
          <Icon name="info" size={16} />
          The assistant is offline — no <code>GEMINI_API_KEY</code> is configured on this deployment.
        </div>
      )}

      <div className="ff-panel ff-rise-card ff-st1" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'min(62vh, 560px)' }}>
        <div ref={threadRef} className="ff-chat-thread">
          {messages.map((m, i) => (
            <div key={i} className={`ff-chat-bubble ${m.role}`} style={m.error ? { color: 'var(--c-red)' } : {}}>
              <div>{m.text}</div>
              {m.role === 'system' && !m.error && i > 0 && (
                <button
                  onClick={() => speak(m.text)}
                  aria-label="Read this answer aloud"
                  style={{ marginTop: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--muted)', fontSize: 12, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  Read aloud
                </button>
              )}
            </div>
          ))}
          {busy && (
            <div className="ff-chat-bubble system" style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(d => <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted)', animation: `ff-live-dot 1s ${d * 0.2}s infinite` }} />)}
            </div>
          )}
        </div>

        <div style={{ padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--line)' }}>
          {SUGGESTIONS.map(s => <button key={s} onClick={() => send(s)} className="ff-filter-chip" style={{ fontSize: 12.5, padding: '6px 12px' }}>{s}</button>)}
        </div>

        <div className="ff-chat-input-row">
          <button onClick={toggleVoice} className={`ff-icon-btn${listening ? ' recording' : ''}`} style={listening ? { borderColor: 'var(--c-red)', color: 'var(--c-red)' } : {}} aria-label="Voice input">
            <Icon name="mic" size={19} />
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={listening ? 'Listening…' : 'Ask anything, in any language…'} className="ff-dash-input" style={{ flex: 1 }} />
          <button onClick={() => send()} disabled={busy || !input.trim()} className="ff-btn" style={{ width: 46, height: 46, borderRadius: 12, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: busy || !input.trim() ? 0.55 : 1 }} aria-label="Send">
            <Icon name="send" size={19} />
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--faint)', marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Icon name="info" size={14} /> The assistant is grounded: it may only answer from your ticket, the live venue feed and the official venue guide, and it will tell you when it doesn't know rather than guess.
      </p>
    </div>
  )
}
