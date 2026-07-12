import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { createSimModeShare, AVG_TRIP_KM } from '../../../lib/simFeed.js'
import { EMISSION_FACTORS, MODE_LABEL, emissionsKg, equivalent, FACTOR_SOURCE } from '../../../lib/carbon.js'
import { askAIJson, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import SimBadge from '../shared/SimBadge.jsx'
import { toast } from '../shared/Toast.jsx'

const ACCENT = '#0e9f4f'

const SYSTEM = `You are the FanFare sustainability analyst for a FIFA World Cup 2026 match organizer.

You are given how the crowd actually travelled to the stadium and the resulting travel emissions, computed from published DEFRA emission factors. Your job is to tell the organizer what to DO about it — before and during the next match.

Rules:
- Ground every number in the DATA block. The emissions figures are computed, not estimated: quote them as given. Never invent a figure.
- Recommend interventions the organizer can actually run: shuttle capacity, transit partnerships and ticketing, park-and-ride, carpool incentives, gate-side messaging, kickoff-time nudges. Be concrete about which mode you are trying to shift and to what.
- Quantify the prize honestly. If shifting 10% of single-occupancy drivers to rail saves X tonnes, say X — and derive it from the factors you were given rather than guessing.
- Do not moralise, and do not greenwash. If the biggest lever is unglamorous, say that. If a mode's share is already good, say so and move on.
- 3 recommendations maximum, highest-impact first.

Respond with JSON exactly matching:
{
  "headline": "one sentence: the state of this match's travel footprint",
  "insight": "2-3 sentences on where the emissions actually come from and why",
  "actions": [
    { "title": "short imperative action", "detail": "how, and what it targets", "saving": "quantified prize, e.g. '3.1 t CO2e per match'" }
  ]
}`

export default function OrganizerSustainability({ zones = [] }) {
  const ai = useAIStatus()
  const [split] = useState(() => createSimModeShare())
  const [brief, setBrief] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Attendance drives the totals; fall back to a full house if the feed is quiet.
  const attendance = useMemo(
    () => (zones.length ? zones.reduce((s, z) => s + z.current, 0) : 60000),
    [zones],
  )

  // Real factors x real distance x crowd size. The only simulated input is the
  // mode split — everything downstream of it is arithmetic on published constants.
  const rows = useMemo(() => split.map(m => {
    const fans = Math.round(attendance * m.share)
    const kg = emissionsKg(m.mode, AVG_TRIP_KM) * fans
    return { ...m, fans, kg, tonnes: kg / 1000, factor: EMISSION_FACTORS[m.mode], label: MODE_LABEL[m.mode] }
  }).sort((a, b) => b.kg - a.kg), [split, attendance])

  const totalT = rows.reduce((s, r) => s + r.tonnes, 0)
  const perFanKg = attendance ? (totalT * 1000) / attendance : 0
  const maxKg = Math.max(...rows.map(r => r.kg), 1)

  // If every fan drove alone, versus what actually happened.
  const worstCaseT = (emissionsKg('rideshare', AVG_TRIP_KM) * attendance) / 1000
  const avoidedT = Math.max(0, worstCaseT - totalT)

  const feed = useRef({ rows, totalT, attendance, perFanKg, avoidedT })
  feed.current = { rows, totalT, attendance, perFanKg, avoidedT }

  const generate = useCallback(async () => {
    const f = feed.current
    setBusy(true); setError(null)
    try {
      const res = await askAIJson({
        system: SYSTEM,
        temperature: 0.35,
        prompt: `DATA — travel footprint for this match
Attendance: ${f.attendance.toLocaleString()} fans
Average one-way trip: ${AVG_TRIP_KM} km
Emission factors used (${FACTOR_SOURCE}):
${Object.entries(EMISSION_FACTORS).map(([m, v]) => `  ${MODE_LABEL[m]}: ${v} g/passenger-km`).join('\n')}

HOW THE CROWD TRAVELLED (mode split is simulated; emissions are computed from it):
${f.rows.map(r => `  ${r.label}: ${(r.share * 100).toFixed(0)}% of fans (${r.fans.toLocaleString()}) → ${r.tonnes.toFixed(1)} t CO2e round trip`).join('\n')}

TOTALS:
  Total travel footprint: ${f.totalT.toFixed(1)} tonnes CO2e
  Per fan: ${f.perFanKg.toFixed(1)} kg CO2e
  Avoided vs everyone driving alone: ${f.avoidedT.toFixed(1)} tonnes CO2e
END DATA

Write the organizer's sustainability briefing.`,
      })
      setBrief({
        headline: String(res.headline || '').trim(),
        insight: String(res.insight || '').trim(),
        actions: Array.isArray(res.actions) ? res.actions.filter(a => a?.title).slice(0, 3) : [],
      })
      toast('Sustainability briefing generated', { accent: ACCENT, icon: 'leaf' })
    } catch (e) {
      setError(aiErrorMessage(e))
    }
    setBusy(false)
  }, [])

  const ranOnce = useRef(false)
  useEffect(() => {
    if (ranOnce.current || ai.checking || !ai.configured) return
    ranOnce.current = true
    generate()
  }, [ai.checking, ai.configured, generate])

  return (
    <div>
      <PageHead
        eyebrow="Generative AI"
        title="Travel footprint"
        subtitle="Real DEFRA emission factors applied to how this crowd actually arrived. Gemini reads the result and recommends what to change."
        action={(
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <SimBadge label="Simulated mode split" />
            <button onClick={generate} disabled={busy || !ai.configured} className="ff-btn"
              style={{ padding: '12px 22px', borderRadius: 28, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: busy || !ai.configured ? 'default' : 'pointer', opacity: busy || !ai.configured ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="cycle" size={15} />
              {busy ? 'Analysing…' : 'Regenerate'}
            </button>
          </div>
        )}
      />

      {error && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--c-red)', borderColor: 'rgba(226,58,69,0.3)' }}>
          <Icon name="alert" size={16} /> {error}
        </div>
      )}

      {/* ── Headline figures ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 18 }}>
        {[
          ['Travel footprint', `${totalT.toFixed(1)} t`, 'CO₂e, round trip', '#e4002b'],
          ['Per fan', `${perFanKg.toFixed(1)} kg`, 'CO₂e each', '#b26a00'],
          ['Avoided', `${avoidedT.toFixed(1)} t`, 'vs everyone driving alone', ACCENT],
          ['Attendance', attendance.toLocaleString(), 'fans travelling', '#2aa5e0'],
        ].map(([label, value, sub, col], i) => (
          <div key={label} className={`ff-panel ff-rise-card ff-st${i + 1}`} style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700 }}>{label}</div>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 30, color: col, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title="Where the emissions come from" icon="leaf" accent={ACCENT} className="ff-rise-card ff-st5">
          <div style={{ display: 'grid', gap: 10 }}>
            {rows.map(r => (
              <div key={r.mode}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                    {r.label} <span style={{ color: 'var(--faint)', fontWeight: 600 }}>· {(r.share * 100).toFixed(0)}% of fans</span>
                  </span>
                  <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 14.5, color: r.factor === 0 ? ACCENT : r.factor > 100 ? '#e4002b' : '#b26a00', whiteSpace: 'nowrap' }}>
                    {r.tonnes < 0.05 ? '0' : r.tonnes.toFixed(1)} t
                  </span>
                </div>
                <div className="ff-gauge-track" style={{ height: 7 }}>
                  <div className="ff-gauge-fill" style={{ width: `${Math.max((r.kg / maxKg) * 100, 1.5)}%`, background: r.factor === 0 ? ACCENT : r.factor > 100 ? '#e4002b' : '#b26a00' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 4 }}>
                  {r.fans.toLocaleString()} fans × {AVG_TRIP_KM} km × {r.factor} g/passenger-km × 2
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Icon name="info" size={14} />
            Emissions are computed, not modelled: {FACTOR_SOURCE}. Only the mode split is simulated.
          </p>
        </Panel>

        <Panel title="What to do about it" icon="cpu" accent={ACCENT} className="ff-rise-card ff-st6">
          {busy && !brief ? (
            <div className="ff-empty">
              <span className="ff-empty-icon"><Icon name="cpu" size={26} /></span>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>Analysing the footprint…</div>
              <p className="ff-empty-text">Working out which mode shift buys the most carbon back.</p>
            </div>
          ) : !brief ? (
            <div className="ff-empty">
              <span className="ff-empty-icon"><Icon name="leaf" size={26} /></span>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>No briefing yet</div>
              <p className="ff-empty-text">{ai.configured ? 'Generate a briefing to see the highest-impact interventions.' : 'The analyst is offline — no API key configured.'}</p>
            </div>
          ) : (
            <>
              {brief.headline && (
                <p style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 17, lineHeight: 1.4, color: 'var(--text)', letterSpacing: '-0.01em' }}>{brief.headline}</p>
              )}
              {brief.insight && (
                <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10, lineHeight: 1.55 }}>{brief.insight}</p>
              )}

              <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                {brief.actions.map((a, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--elev-2)', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{a.title}</span>
                      {a.saving && <span className="ff-chip ff-chip-done" style={{ whiteSpace: 'nowrap' }}>{a.saving}</span>}
                    </div>
                    {a.detail && <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>{a.detail}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      {avoidedT > 0 && (
        <Panel title="Put in perspective" icon="leaf" accent={ACCENT} className="ff-rise-card ff-st7" style={{ marginTop: 18 }}>
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>
            Because {((rows.filter(r => r.factor < 100).reduce((s, r) => s + r.share, 0)) * 100).toFixed(0)}% of this crowd arrived by low-carbon transport rather than driving alone, this match avoided{' '}
            <strong style={{ color: ACCENT }}>{avoidedT.toFixed(1)} tonnes of CO₂e</strong> — roughly {equivalent(avoidedT * 1000 / 1000)}.
          </p>
        </Panel>
      )}
    </div>
  )
}
