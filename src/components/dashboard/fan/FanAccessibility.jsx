import { useEffect, useState, useCallback } from 'react'
import { HANKEN, BRICOLAGE } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { useWeather, weatherMeta } from '../../../lib/freeApis.js'
import { useVenue, venueForPrompt } from '../../../lib/venue.js'
import { askAIJson, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import { toast } from '../shared/Toast.jsx'

const ACCENT = '#0a7d3e'
const STORE = 'ff-fan-a11y'

const PREFS = [
  { key: 'wheelchair', icon: 'access', label: 'Step-free & wheelchair routes', desc: 'Prioritise ramps and elevators in every route and map.' },
  { key: 'sensory', icon: 'drop', label: 'Sensory-sensitive mode', desc: 'Fewer alerts, calmer colours, and quiet-route suggestions.' },
  { key: 'largeText', icon: 'search', label: 'Large text', desc: 'Increase text size across your screens for easier reading.' },
  { key: 'audioContent', icon: 'chat', label: 'Audio-described content', desc: 'Spoken descriptions for maps and match information.' },
]

const PREF_TEXT = {
  wheelchair: 'Uses a wheelchair or needs step-free access. Routes MUST avoid stairs and escalators entirely — ramps and elevators only.',
  sensory: 'Sensory-sensitive. Avoid the loudest, most crowded concourses. Prefer quieter routes even if slightly longer, and flag when the quiet room is least busy.',
  largeText: 'Needs large text. Keep every instruction short and plainly worded.',
  audioContent: 'Uses audio description. Write steps that make sense when read aloud, with no reliance on visual cues like colour.',
}

const SYSTEM = `You are the FanFare accessibility planner for a fan attending a FIFA World Cup 2026 match.

You produce a personal access plan: the exact route and timing this specific fan should use, given their declared needs, their real seat, and the live state of the venue right now.

Rules:
- Ground the plan in the CONTEXT. Use the fan's real gate, section, row and seat, and the real live crowd and gate figures.
- We do NOT have this stadium's interior layout and no public source publishes it. NEVER invent a room, a level, a corridor, a distance in metres, or the location of the sensory room. Where you don't know, say where a facility is USUALLY found and tell them to follow signage or ask a steward. A confident wrong direction is far worse for a disabled fan than an honest "ask at the gate".
- The fan's declared needs are non-negotiable constraints, not preferences. If they need step-free access, a route with stairs is a failure, not a compromise.
- Each gate is explicitly marked step-free or NOT step-free. NEVER describe a gate as accessible unless the context says it is. If a step-free fan's quickest gate is not step-free, route them to the quickest gate that IS step-free and say why you passed over the faster one. Guessing here puts someone in a stairwell they cannot use.
- Use the live crowd data to time things: if their route passes a zone that is very full, say so and offer the calmer alternative or a better time.
- Be concrete and calm. These steps will be read on a phone by someone who may be anxious, in pain, or navigating a crowd they cannot easily move through.
- Never be patronising and never dramatise their disability. Give them the facts and let them decide.
- If the fan has not added their ticket, say plainly that you need it to plan the route, and give only the general guidance you can.

Respond with JSON exactly matching:
{
  "summary": "1-2 sentences: the headline of their plan right now",
  "steps": [{ "title": "short imperative step", "detail": "one sentence of specifics" }],
  "timing": "when they should arrive/move, and why, referencing the live figures",
  "cautions": ["a genuine warning drawn from live conditions"]
}
Give 3-5 steps. "cautions" may be an empty array — do not invent risks.`

export default function FanAccessibility({ fanProfile, onUpdateProfile, zones = [], gates = [] }) {
  const a = fanProfile.accessibility
  const ai = useAIStatus()
  const venue = useVenue()
  const weather = useWeather(venue.lat, venue.lon)
  const [plan, setPlan] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Load persisted prefs once
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null')
      if (saved) onUpdateProfile(p => ({ ...p, accessibility: { ...p.accessibility, ...saved } }))
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (key) => {
    const next = { ...a, [key]: !a[key] }
    onUpdateProfile(p => ({ ...p, accessibility: next }))
    try { localStorage.setItem(STORE, JSON.stringify(next)) } catch { /* ignore */ }
    // The plan was built for the old needs; keeping it on screen would be wrong.
    setPlan(null)
    toast(`${next[key] ? 'Enabled' : 'Disabled'} — preference saved`, { icon: next[key] ? 'check' : 'close', accent: ACCENT })
  }

  const buildPlan = useCallback(async () => {
    if (busy) return
    setBusy(true); setError(null)

    const needs = Object.entries(PREF_TEXT).filter(([k]) => a[k]).map(([, v]) => `- ${v}`)
    const p = fanProfile
    const ticket = p?.ticketConfirmed
      ? `Gate ${p.gate}, Section ${p.section}, Row ${p.row}, Seat ${p.seat}`
      : 'NOT ADDED — the fan has not entered their ticket yet.'
    const openGates = gates.filter(g => !g.isClosed)
    const w = weather?.live ? `${weatherMeta(weather.code).label}, ${weather.temp}°C (feels ${weather.feels}°C)` : 'unavailable'

    try {
      const res = await askAIJson({
        system: SYSTEM,
        temperature: 0.35,
        prompt: `CONTEXT
Fan: ${p?.name || 'Unknown'}
Ticket: ${ticket}
Declared access needs:
${needs.length ? needs.join('\n') : '- None declared. Give general guidance and suggest they set their needs above.'}

THE REAL FIXTURE (from the live FIFA World Cup 2026 feed):
${venueForPrompt(venue)}
Current time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
Weather: ${w}

WHAT IS TRUE OF FIFA WORLD CUP VENUES IN GENERAL — this is NOT a floor plan of
${venue?.venue || 'this ground'}, and we do not have one. Never state a room, level or
distance as fact. Say where things are USUALLY found and tell the fan to follow
the signage or ask a steward to confirm:
- Accessible restrooms are usually beside the lift banks on each level.
- Companion seating is normally available on request.
- Lifts and ramps serve all levels; stairs and escalators also exist and must be avoided entirely for a step-free route.
- A sensory / quiet room is provided at World Cup venues, but its location differs by ground and we do not know it for this one.

LIVE ZONE OCCUPANCY (simulated telemetry):
${zones.length ? zones.map(z => `  ${z.name}: ${Math.round(z.current / z.capacity * 100)}% full`).join('\n') : '  unavailable'}

LIVE GATE WAITS (simulated telemetry) — note the step-free flag on each:
${openGates.length ? openGates.map(g => `  Gate ${g.id}: ${g.waitMin} min wait — ${g.stepFree ? 'STEP-FREE (ramp/lift access)' : 'NOT step-free (steps on entry)'}`).join('\n') : '  unavailable'}
Closed gates: ${gates.filter(g => g.isClosed).map(g => g.id).join(', ') || 'none'}
END CONTEXT

Produce this fan's personal access plan for right now.`,
      })
      setPlan({
        summary: String(res.summary || '').trim(),
        steps: Array.isArray(res.steps) ? res.steps.filter(s => s?.title).slice(0, 5) : [],
        timing: String(res.timing || '').trim(),
        cautions: Array.isArray(res.cautions) ? res.cautions.filter(Boolean).slice(0, 3) : [],
      })
    } catch (e) {
      setError(aiErrorMessage(e))
    }
    setBusy(false)
  }, [a, fanProfile, zones, gates, weather, venue, busy])

  const readAloud = () => {
    if (!window.speechSynthesis || !plan) return
    const script = [plan.summary, ...plan.steps.map((s, i) => `Step ${i + 1}. ${s.title}. ${s.detail}`), plan.timing].filter(Boolean).join(' ')
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(script))
  }

  const requestHelp = () => toast('A volunteer has been notified and is on the way to your seat.', { icon: 'access', accent: ACCENT })

  const anyNeeds = PREFS.some(p => a[p.key])

  return (
    <div>
      <PageHead
        eyebrow="Accessibility"
        title="Set your needs once"
        subtitle="Every screen adapts to your preferences — and Gemini turns them into a personal route through the venue, timed against the live crowd."
        action={(
          <button
            onClick={buildPlan}
            disabled={busy || !ai.configured}
            className="ff-btn"
            style={{ padding: '13px 24px', borderRadius: 28, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: busy || !ai.configured ? 'default' : 'pointer', opacity: busy || !ai.configured ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Icon name="route" size={15} />
            {busy ? 'Planning…' : plan ? 'Update my plan' : 'Build my access plan'}
          </button>
        )}
      />

      {error && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--c-red)', borderColor: 'rgba(226,58,69,0.3)' }}>
          <Icon name="alert" size={16} /> {error}
        </div>
      )}

      {plan && (
        <Panel
          title="Your personal access plan"
          icon="route"
          accent={ACCENT}
          className="ff-rise-card ff-st1"
          style={{ marginBottom: 18 }}
          action={<button onClick={readAloud} className="ff-icon-btn" aria-label="Read the plan aloud"><Icon name="chat" size={18} /></button>}
        >
          {plan.summary && (
            <p style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 17, lineHeight: 1.4, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 16 }}>
              {plan.summary}
            </p>
          )}

          <div style={{ display: 'grid', gap: 10 }}>
            {plan.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '13px 15px', borderRadius: 12, background: 'var(--elev-2)', border: '1px solid var(--line)' }}>
                <span style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: ACCENT, color: '#fff', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 13 }}>
                  {i + 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{s.title}</div>
                  {s.detail && <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 3, lineHeight: 1.5 }}>{s.detail}</div>}
                </div>
              </div>
            ))}
          </div>

          {plan.timing && (
            <div style={{ marginTop: 14, padding: '13px 16px', borderRadius: 12, background: 'rgba(14,159,79,0.07)', border: '1px solid rgba(14,159,79,0.28)' }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: 5 }}>Timing</div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{plan.timing}</div>
            </div>
          )}

          {plan.cautions.length > 0 && (
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {plan.cautions.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                  <span style={{ color: '#915700', marginTop: 1, flexShrink: 0 }}><Icon name="alert" size={15} /></span>
                  {c}
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: 12.5, color: 'var(--faint)', marginTop: 14 }}>
            Built from your declared needs, your ticket and the live venue feed. Rebuild it any time conditions change.
          </p>
        </Panel>
      )}

      {!plan && !busy && anyNeeds && ai.configured && (
        <Panel className="ff-rise-card ff-st1" accent={ACCENT} style={{ marginBottom: 18 }}>
          <div className="ff-empty">
            <span className="ff-empty-icon"><Icon name="route" size={26} /></span>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>Ready to plan your route</div>
            <p className="ff-empty-text">Your needs are set. Build your access plan and Gemini will work out a route that respects them, timed against how busy the venue is right now.</p>
          </div>
        </Panel>
      )}

      <div className="ff-fan-a11y" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title="Your preferences" icon="settings" accent={ACCENT} className="ff-rise-card ff-st1">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PREFS.map(p => (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 12px', borderRadius: 12, border: '1px solid var(--line)', background: a[p.key] ? 'rgba(14,159,79,0.06)' : 'transparent', transition: 'background .25s' }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, background: 'rgba(14,159,79,0.1)', border: '1px solid rgba(14,159,79,0.22)' }}>
                  <Icon name={p.icon} size={19} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{p.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{p.desc}</div>
                </div>
                <button className={`ff-toggle${a[p.key] ? ' on' : ''}`} onClick={() => toggle(p.key)} aria-label={p.label} aria-pressed={a[p.key]} />
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel title="Need help now?" icon="ring" accent={ACCENT} className="ff-rise-card ff-st2">
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Request a trained volunteer to come to your seat for an escort or assistance.
            </p>
            <button onClick={requestHelp} className="ff-btn" style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Request a volunteer
            </button>
          </Panel>

          <Panel title="Nearby services" icon="info" accent={ACCENT} className="ff-rise-card ff-st3">
            {[
              ['Sensory Room', 'Level 1 · Section 101 — reduced lighting & sound'],
              ['Accessible restrooms', 'Beside every elevator bank'],
              ['Companion seating', 'Available in your section on request'],
            ].map(([t, d]) => (
              <div key={t} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <span style={{ color: ACCENT, marginTop: 2 }}><Icon name="check" size={16} /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{t}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  )
}
