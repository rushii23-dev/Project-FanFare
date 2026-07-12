import { useState, useRef } from 'react'
import { BRICOLAGE } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { translate, LANGS } from '../../../lib/freeApis.js'
import { askAIJson, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'

const ACCENT = '#915700'
const speechLang = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR', de: 'de-DE', ar: 'ar-SA', ja: 'ja-JP', hi: 'hi-IN' }
const LANG_NAME = Object.fromEntries(LANGS.map(l => [l.code, l.label]))

// A literal translation of "you can't come in here" is correct and useless.
// The situation changes the register, the urgency and the vocabulary — which is
// exactly the part a phrase-matching translation API cannot do.
const SITUATIONS = [
  { id: 'general', label: 'General', hint: 'Neutral, friendly tone.' },
  { id: 'medical', label: 'Medical', hint: 'Calm and urgent. Prioritise clarity over politeness.' },
  { id: 'lostchild', label: 'Lost child', hint: 'Reassuring, simple, non-alarming. The listener may be panicking.' },
  { id: 'entry', label: 'Ticketing & entry', hint: 'Precise about gates, bags and documents. Firm but courteous.' },
  { id: 'directions', label: 'Directions', hint: 'Step-by-step and concrete. Use landmarks.' },
  { id: 'security', label: 'Security', hint: 'Authoritative, unambiguous, de-escalating. No idioms.' },
]

const SYSTEM = `You are the FanFare live interpreter for stadium staff and volunteers at the FIFA World Cup 2026.

You are not a dictionary. A staff member is standing in front of a fan who does not share their language, and they need to be UNDERSTOOD, not translated word-for-word.

Rules:
- Translate for meaning and register, not literally. Idioms must become natural equivalents in the target language.
- Match the tone the SITUATION calls for. A medical emergency is not phrased like a ticket check.
- Use the correct stadium vocabulary in the target language (gate, concourse, turnstile, stand, tier, kick-off, steward).
- Keep it short and speakable. Staff will read this aloud in a loud stadium.
- "back" must be a literal, honest back-translation into the SOURCE language, so the staff member can verify what they are about to say. Do not flatter the translation — if it drifted, show that.
- "note" is optional (empty string if unneeded): flag only a genuine cultural or safety pitfall, e.g. a gesture or phrasing that would offend or confuse. Never pad it.
- "replies" are 3 short phrases the FAN is likely to say back, in the TARGET language, each with its source-language meaning — so the staff member can recognise the answer when they hear it.

Respond with JSON exactly matching:
{
  "translation": "the phrase to say, in the target language",
  "back": "literal back-translation into the source language",
  "note": "cultural/safety caution, or empty string",
  "replies": [{ "target": "likely reply in target language", "source": "what it means in source language" }]
}`

export default function StaffTranslation() {
  const ai = useAIStatus()
  const [from, setFrom] = useState('en')
  const [to, setTo] = useState('es')
  const [situation, setSituation] = useState('general')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [listening, setListening] = useState(false)
  const [history, setHistory] = useState([])
  const recogRef = useRef(null)

  const langLabel = c => LANG_NAME[c] || c

  const run = async (text = input, f = from, t = to) => {
    const clean = text.trim()
    if (!clean || busy) return
    setBusy(true); setError(null); setResult(null)

    const sit = SITUATIONS.find(s => s.id === situation) || SITUATIONS[0]

    try {
      const res = await askAIJson({
        system: SYSTEM,
        temperature: 0.3,
        prompt: `SOURCE LANGUAGE: ${langLabel(f)}
TARGET LANGUAGE: ${langLabel(t)}
SITUATION: ${sit.label} — ${sit.hint}

The staff member wants to say:
"${clean}"

Produce the JSON.`,
      })
      const out = {
        translation: String(res.translation || '').trim(),
        back: String(res.back || '').trim(),
        note: String(res.note || '').trim(),
        replies: Array.isArray(res.replies)
          ? res.replies.filter(r => r?.target).slice(0, 3).map(r => ({ target: String(r.target), source: String(r.source || '') }))
          : [],
      }
      if (!out.translation) throw new Error('empty')
      setResult(out)
      setHistory(h => [{ id: Date.now(), from: f, to: t, src: clean, dst: out.translation }, ...h].slice(0, 6))
    } catch (e) {
      // The interpreter must never leave a volunteer stranded mid-conversation.
      // If the model is down, fall back to plain machine translation and say so.
      const fallback = await translate(clean, f, t)
      if (fallback && fallback !== clean) {
        setResult({ translation: fallback, back: '', note: '', replies: [], degraded: true })
        setHistory(h => [{ id: Date.now(), from: f, to: t, src: clean, dst: fallback }, ...h].slice(0, 6))
      } else {
        setError(aiErrorMessage(e))
      }
    }
    setBusy(false)
  }

  const swap = () => { setFrom(to); setTo(from); setInput(result?.translation || ''); setResult(null) }

  const dictate = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    if (listening) { recogRef.current?.stop(); return }
    const r = new SR(); r.lang = speechLang[from] || 'en-US'; r.interimResults = false
    r.onresult = e => { const txt = e.results[0][0].transcript; setInput(txt); run(txt) }
    r.onend = () => setListening(false); r.onerror = () => setListening(false)
    recogRef.current = r; setListening(true); r.start()
  }

  const speak = (text, code) => {
    if (!window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = speechLang[code] || 'en-US'
    window.speechSynthesis.speak(u)
  }

  const LangSelect = ({ value, onChange, label }) => (
    <select value={value} onChange={e => onChange(e.target.value)} aria-label={label} className="ff-dash-input" style={{ width: 'auto', fontWeight: 700, padding: '10px 14px' }}>
      {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  )

  return (
    <div>
      <PageHead
        eyebrow="Generative AI"
        title="Live two-way interpreter"
        subtitle="Gemini translates for meaning and situation, not word-for-word — and shows you a back-translation so you can trust what you're about to say."
      />

      {!ai.checking && !ai.configured && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--muted)' }}>
          <Icon name="info" size={16} />
          The interpreter is offline — falling back to basic machine translation.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {SITUATIONS.map(s => (
          <button key={s.id} onClick={() => setSituation(s.id)} className={`ff-filter-chip${situation === s.id ? ' active' : ''}`} title={s.hint}>{s.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
        <LangSelect value={from} onChange={setFrom} label="Translate from" />
        <button onClick={swap} className="ff-icon-btn" aria-label="Swap languages"><Icon name="swap" size={20} /></button>
        <LangSelect value={to} onChange={setTo} label="Translate to" />
      </div>

      {error && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--c-red)', borderColor: 'rgba(226,58,69,0.3)' }}>
          <Icon name="alert" size={16} /> {error}
        </div>
      )}

      <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'stretch' }}>
        <Panel title={langLabel(from)} icon="user" accent={ACCENT} className="ff-rise-card ff-st1"
          action={<button onClick={dictate} className={`ff-icon-btn${listening ? ' recording' : ''}`} style={listening ? { borderColor: '#e4002b', color: '#e4002b' } : {}} aria-label="Dictate"><Icon name="mic" size={18} /></button>}>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={5} placeholder={listening ? 'Listening…' : 'Say what you need to communicate…'} className="ff-dash-input" style={{ resize: 'vertical', minHeight: 120 }} />
          <button onClick={() => run()} disabled={busy || !input.trim()} className="ff-btn" style={{ marginTop: 14, width: '100%', padding: '13px', borderRadius: 12, border: 'none', color: '#fff', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', opacity: busy || !input.trim() ? 0.55 : 1 }}>
            {busy ? 'Interpreting…' : 'Interpret'}
          </button>
        </Panel>

        <Panel title={langLabel(to)} icon="globe" accent={ACCENT} className="ff-rise-card ff-st2"
          action={result?.translation && <button onClick={() => speak(result.translation, to)} className="ff-icon-btn" aria-label="Read aloud"><Icon name="chat" size={18} /></button>}>
          <div className="ff-dash-input" style={{ minHeight: 120, background: 'var(--elev-2)', display: 'flex', alignItems: 'flex-start', fontSize: 16, lineHeight: 1.5, color: result ? 'var(--text)' : 'var(--faint)' }}>
            {busy ? 'Interpreting…' : (result?.translation || 'Translation appears here.')}
          </div>

          {result?.back && (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--panel)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 4 }}>Back-translation — check this says what you meant</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', fontStyle: 'italic' }}>{result.back}</div>
            </div>
          )}

          {result?.degraded && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--faint)' }}>Basic machine translation — the interpreter was unavailable.</div>
          )}
        </Panel>
      </div>

      {result?.note && (
        <Panel title="Watch out" icon="alert" accent={ACCENT} className="ff-rise-card ff-st3" style={{ marginTop: 18 }}>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55 }}>{result.note}</p>
        </Panel>
      )}

      {result?.replies?.length > 0 && (
        <Panel title="What they might say back" icon="chat" accent={ACCENT} className="ff-rise-card ff-st4" style={{ marginTop: 18 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            {result.replies.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: 'var(--elev-2)', border: '1px solid var(--line)' }}>
                <button onClick={() => speak(r.target, to)} className="ff-icon-btn" style={{ flexShrink: 0 }} aria-label="Play"><Icon name="chat" size={16} /></button>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>{r.target}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{r.source}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {history.length > 0 && (
        <Panel title="Recent" icon="clock" accent={ACCENT} className="ff-rise-card ff-st5" style={{ marginTop: 18 }}>
          {history.map(h => (
            <div key={h.id} style={{ display: 'flex', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <span className="ff-chip ff-chip-progress" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>{h.from} → {h.to}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>{h.src}</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, marginTop: 2 }}>{h.dst}</div>
              </div>
            </div>
          ))}
        </Panel>
      )}
    </div>
  )
}
