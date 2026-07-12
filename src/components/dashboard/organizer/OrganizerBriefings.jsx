import { useState, useCallback, useEffect, useRef } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { askAIJson, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import SimBadge from '../shared/SimBadge.jsx'
import { toast } from '../shared/Toast.jsx'

const ACCENT = '#e4002b'
const FILTERS = [['pending', 'Pending'], ['accepted', 'Accepted'], ['dismissed', 'Dismissed'], ['all', 'All']]
const priClass = p => `ff-chip ff-chip-${p === 'high' ? 'high' : p === 'medium' ? 'medium' : 'low'}`
const PRIORITIES = ['high', 'medium', 'low']

const SYSTEM = `You are the FanFare operations analyst for a FIFA World Cup 2026 match. You read live venue telemetry and produce the organizer's action briefing.

Your job is to spot what needs doing and say it as a concrete, assignable action — not an observation. "North Stand is busy" is useless. "Open Gate D and redirect North Stand arrivals to it" is a briefing.

Rules:
- Ground every recommendation in the actual numbers you were given. Cite the real zone names, gate IDs and figures. Never invent one.
- Crowd-safety thresholds: a zone at or above 85% of capacity needs relief; at or above 95% it is urgent. A gate wait above 20 minutes needs a second gate opened. A closed gate next to a hot zone is an opportunity.
- Only raise what genuinely warrants action. If the venue is running well, return fewer items — or an empty list. Do not manufacture problems to fill space.
- Produce at most 4 recommendations, most urgent first.
- The "impact" is your honest estimate of the single metric the action moves, and where it moves it to. Keep from/to short (e.g. "18 min" -> "9 min", "94%" -> "80%").

Respond with JSON matching exactly this schema:
{
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": "short imperative action, max 60 chars",
      "body": "why, citing the real figures, and what to do. 1-3 sentences.",
      "impact": { "metric": "what improves", "from": "current value", "to": "projected value" }
    }
  ]
}`

const pc = z => Math.round(z.current / z.capacity * 100)

function telemetry(zones, gates) {
  const att = zones.reduce((s, z) => s + z.current, 0)
  const cap = zones.reduce((s, z) => s + z.capacity, 0)
  return `TELEMETRY
Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
Total in venue: ${att.toLocaleString()} of ${cap.toLocaleString()} (${Math.round(att / cap * 100)}%)

ZONES:
${zones.map(z => `  ${z.id} | ${z.name} | ${z.current}/${z.capacity} (${pc(z)}%)`).join('\n')}

GATES:
${gates.map(g => `  Gate ${g.id} | ${g.isClosed ? 'CLOSED' : `${g.waitMin} min wait, ${g.density}% density`}`).join('\n')}
END TELEMETRY`
}

// The model's output is untrusted input. Coerce it into the exact shape the
// card renderer expects, and drop anything malformed rather than crashing a
// control-room screen mid-match.
function normalise(raw) {
  if (!Array.isArray(raw?.recommendations)) return []
  return raw.recommendations.slice(0, 4).flatMap((r, i) => {
    const title = typeof r?.title === 'string' && r.title.trim()
    const body = typeof r?.body === 'string' && r.body.trim()
    if (!title || !body) return []
    return [{
      id: `ai-${Date.now()}-${i}`,
      priority: PRIORITIES.includes(r.priority) ? r.priority : 'medium',
      title,
      body,
      impact: {
        metric: String(r?.impact?.metric ?? 'Impact'),
        from: String(r?.impact?.from ?? '—'),
        to: String(r?.impact?.to ?? '—'),
      },
      status: 'pending',
      generatedAt: Date.now(),
    }]
  })
}

export default function OrganizerBriefings({ recommendations, onUpdateRecs, zones = [], gates = [] }) {
  const ai = useAIStatus()
  const [filter, setFilter] = useState('pending')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [lastRun, setLastRun] = useState(null)

  // Read live state at generate-time without making the callback depend on it —
  // otherwise the auto-run effect would re-fire on every 5s telemetry tick.
  const feed = useRef({ zones, gates })
  feed.current = { zones, gates }

  const shown = recommendations.filter(r => filter === 'all' || r.status === filter)
  const counts = {
    pending: recommendations.filter(r => r.status === 'pending').length,
    accepted: recommendations.filter(r => r.status === 'accepted').length,
    dismissed: recommendations.filter(r => r.status === 'dismissed').length,
  }

  const generate = useCallback(async () => {
    const { zones: z, gates: g } = feed.current
    if (!z.length && !g.length) { setError('The venue feed is not reporting — nothing to brief on.'); return }
    setBusy(true); setError(null)
    try {
      const raw = await askAIJson({
        system: SYSTEM,
        prompt: `${telemetry(z, g)}\n\nProduce the organizer's action briefing for right now.`,
        temperature: 0.35,
      })
      const fresh = normalise(raw)
      // Supersede the previous pending set; anything already actioned is history
      // and must survive a regenerate.
      onUpdateRecs(prev => [...fresh, ...prev.filter(r => r.status !== 'pending')])
      setLastRun(new Date())
      setFilter('pending')
      toast(fresh.length ? `${fresh.length} recommendation${fresh.length > 1 ? 's' : ''} generated` : 'No action needed — venue is nominal', { accent: ACCENT, icon: 'clipboard' })
    } catch (e) {
      setError(aiErrorMessage(e))
    }
    setBusy(false)
  }, [onUpdateRecs])

  // Brief the operator on arrival rather than making them ask for it.
  const ranOnce = useRef(false)
  useEffect(() => {
    if (ranOnce.current || ai.checking || !ai.configured) return
    if (recommendations.length) { ranOnce.current = true; return }
    ranOnce.current = true
    generate()
  }, [ai.checking, ai.configured, recommendations.length, generate])

  const act = (id, status) => {
    onUpdateRecs(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    toast(status === 'accepted' ? 'Action accepted' : 'Recommendation dismissed', { accent: status === 'accepted' ? '#0e9f4f' : ACCENT, icon: status === 'accepted' ? 'check' : 'close' })
  }

  return (
    <div>
      <PageHead
        eyebrow="Generative AI"
        title="Recommended actions"
        subtitle="Gemini reads the live venue feed and writes the briefing. Regenerate at any point in the match and the actions change with the conditions."
        action={(
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <SimBadge />
            <button
              onClick={generate}
              disabled={busy || !ai.configured}
              className="ff-btn"
              style={{ padding: '12px 22px', borderRadius: 28, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: busy || !ai.configured ? 'default' : 'pointer', opacity: busy || !ai.configured ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Icon name="cycle" size={15} />
              {busy ? 'Generating…' : 'Regenerate briefing'}
            </button>
          </div>
        )}
      />

      {!ai.checking && !ai.configured && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--muted)', borderColor: 'rgba(226,58,69,0.3)' }}>
          <Icon name="info" size={16} />
          Briefing generation is offline — no <code>GEMINI_API_KEY</code> is configured on this deployment.
        </div>
      )}

      {error && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--c-red)', borderColor: 'rgba(226,58,69,0.3)' }}>
          <Icon name="alert" size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map(([id, label]) => (
          <button key={id} className={`ff-filter-chip${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>{label}{id !== 'all' ? ` · ${counts[id]}` : ''}</button>
        ))}
        {lastRun && (
          <span style={{ fontSize: 12, color: 'var(--faint)', marginLeft: 'auto' }}>
            Generated {lastRun.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {busy && shown.length === 0 ? (
          <Panel><div className="ff-empty"><span className="ff-empty-icon"><Icon name="cpu" size={26} /></span><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>Reading the venue feed…</div><p className="ff-empty-text">Analysing zone occupancy and gate queues to work out what needs doing.</p></div></Panel>
        ) : shown.length === 0 ? (
          <Panel><div className="ff-empty"><span className="ff-empty-icon"><Icon name="clipboard" size={26} /></span><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{filter === 'pending' ? 'Nothing needs action' : 'Nothing here'}</div><p className="ff-empty-text">{filter === 'pending' ? 'The venue is running within thresholds. Regenerate the briefing as conditions change.' : 'No recommendations with this status yet.'}</p></div></Panel>
        ) : shown.map((r, i) => (
          <div key={r.id} className={`ff-panel ff-rise-card ff-st${Math.min(i + 1, 8)}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <span className={priClass(r.priority)}>{r.priority} priority</span>
              {r.status !== 'pending' && <span className={`ff-chip ff-chip-${r.status === 'accepted' ? 'done' : 'new'}`}>{r.status}</span>}
            </div>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 19, color: 'var(--text)', letterSpacing: '-0.01em' }}>{r.title}</div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8, lineHeight: 1.55, maxWidth: 780 }}>{r.body}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 14, background: 'var(--elev-2)', border: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>{r.impact.metric}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 16, color: 'var(--muted)' }}>{r.impact.from}</span>
                    <span style={{ color: 'var(--faint)' }}><Icon name="arrow" size={16} /></span>
                    <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 16, color: '#0e9f4f' }}>{r.impact.to}</span>
                  </div>
                </div>
              </div>
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                  <button onClick={() => act(r.id, 'accepted')} className="ff-btn" style={{ padding: '12px 24px', borderRadius: 28, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>Accept action</button>
                  <button onClick={() => act(r.id, 'dismissed')} className="ff-filter-chip">Dismiss</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
