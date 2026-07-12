import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { askAIJson, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import DataPending from '../shared/DataPending.jsx'
import SimBadge from '../shared/SimBadge.jsx'
import Sparkline from '../shared/Sparkline.jsx'

const ACCENT = '#e4002b'

const SYSTEM = `You are the FanFare matchday analyst for a FIFA World Cup 2026 organizer.

You are given the venue's telemetry and its recent trend. Write the read of the match that a control-room lead would want at a glance — what is actually happening, and what is off-pattern.

Rules:
- Ground every claim in the DATA. Quote the real figures. Never invent one.
- An anomaly is something genuinely out of pattern: a zone filling far faster than the rest, a gate whose wait is climbing while others fall, a zone near capacity, a closed gate beside a hot zone. Do not dress up normal variation as an anomaly.
- If nothing is anomalous, return an empty anomalies array and say so in the narrative. A quiet match is a good match; do not manufacture drama.
- "severity" reflects operational risk, not how interesting it is.

Respond with JSON exactly matching:
{
  "narrative": "3-4 sentences: the state of the venue right now and the direction of travel",
  "anomalies": [
    { "severity": "high" | "medium" | "low", "what": "the off-pattern observation, with figures", "why": "what it likely means operationally" }
  ]
}`

const pc = z => Math.round(z.current / z.capacity * 100)

export default function OrganizerAnalytics({ zones = [], gates = [], incidents = [] }) {
  const ai = useAIStatus()
  const [read, setRead] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Rolling attendance history, so we can show a trend and give the model a
  // direction of travel rather than a single frozen frame.
  const [history, setHistory] = useState([])
  const attendance = useMemo(() => zones.reduce((s, z) => s + z.current, 0), [zones])
  const capacity = useMemo(() => zones.reduce((s, z) => s + z.capacity, 0), [zones])

  useEffect(() => {
    if (!attendance) return
    setHistory(h => [...h, attendance].slice(-40))
  }, [attendance])

  const openGates = gates.filter(g => !g.isClosed)
  const avgWait = openGates.length ? Math.round(openGates.reduce((s, g) => s + g.waitMin, 0) / openGates.length) : 0
  const occupancy = capacity ? Math.round((attendance / capacity) * 100) : 0
  const hotZones = zones.filter(z => pc(z) >= 85)
  const trend = history.length > 3 ? attendance - history[Math.max(0, history.length - 4)] : 0

  const feed = useRef({})
  feed.current = { zones, gates, incidents, attendance, capacity, occupancy, avgWait, trend, history }

  const analyse = useCallback(async () => {
    const f = feed.current
    if (!f.zones.length && !f.gates.length) { setError('The venue feed is not reporting — nothing to analyse.'); return }
    setBusy(true); setError(null)
    try {
      const res = await askAIJson({
        system: SYSTEM,
        temperature: 0.3,
        prompt: `DATA — ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

Attendance: ${f.attendance.toLocaleString()} of ${f.capacity.toLocaleString()} (${f.occupancy}%)
Direction of travel: ${f.trend > 0 ? `rising, +${f.trend.toLocaleString()} over the last few ticks` : f.trend < 0 ? `falling, ${f.trend.toLocaleString()} over the last few ticks` : 'flat'}
Average gate wait: ${f.avgWait} min across ${f.gates.filter(g => !g.isClosed).length} open gates

ZONES:
${f.zones.map(z => `  ${z.id} | ${z.name} | ${z.current}/${z.capacity} (${pc(z)}%) | last tick ${z.trend > 0 ? '+' : ''}${z.trend || 0}`).join('\n')}

GATES:
${f.gates.map(g => `  Gate ${g.id} | ${g.isClosed ? 'CLOSED' : `${g.waitMin} min wait, ${g.density}% density`}`).join('\n')}

INCIDENTS FILED THIS MATCH: ${f.incidents.length}
${f.incidents.slice(0, 6).map(i => `  ${i.severity} | ${i.category} | ${i.title} | ${i.location} | ${i.status}`).join('\n') || '  none'}
END DATA

Write the analyst's read.`,
      })
      setRead({
        narrative: String(res.narrative || '').trim(),
        anomalies: Array.isArray(res.anomalies) ? res.anomalies.filter(a => a?.what).slice(0, 4) : [],
      })
    } catch (e) {
      setError(aiErrorMessage(e))
    }
    setBusy(false)
  }, [])

  const ranOnce = useRef(false)
  useEffect(() => {
    if (ranOnce.current || ai.checking || !ai.configured || !zones.length) return
    ranOnce.current = true
    analyse()
  }, [ai.checking, ai.configured, zones.length, analyse])

  if (!zones.length && !gates.length) {
    return (
      <div>
        <PageHead eyebrow="Analytics" title="Matchday analytics" subtitle="Attendance, throughput and incident trends appear here on matchday." />
        <Panel className="ff-rise-card ff-st1">
          <DataPending icon="chart" title="No analytics yet" message="The venue feed is not reporting. Analytics build themselves from live telemetry — figures are never estimated or filled in." style={{ padding: '60px 24px' }} />
        </Panel>
      </div>
    )
  }

  const KPIS = [
    ['Attendance', attendance.toLocaleString(), `${occupancy}% of capacity`, '#2aa5e0'],
    ['Avg gate wait', `${avgWait} min`, `${openGates.length} gates open`, avgWait > 20 ? '#e4002b' : avgWait > 12 ? '#b26a00' : '#0e9f4f'],
    ['Zones at 85%+', String(hotZones.length), hotZones.length ? hotZones.map(z => z.id).join(', ') : 'all within threshold', hotZones.length ? '#e4002b' : '#0e9f4f'],
    ['Incidents', String(incidents.length), incidents.filter(i => i.status === 'new').length ? `${incidents.filter(i => i.status === 'new').length} unassigned` : 'none open', incidents.length ? '#b26a00' : '#0e9f4f'],
  ]

  const sevChip = s => `ff-chip ff-chip-${s === 'high' ? 'high' : s === 'medium' ? 'medium' : 'low'}`

  return (
    <div>
      <PageHead
        eyebrow="Generative AI"
        title="Matchday analytics"
        subtitle="Live throughput and crowd trends, read by Gemini — which calls out what's off-pattern rather than leaving you to spot it."
        action={(
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <SimBadge />
            <button onClick={analyse} disabled={busy || !ai.configured} className="ff-btn"
              style={{ padding: '12px 22px', borderRadius: 28, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: busy || !ai.configured ? 'default' : 'pointer', opacity: busy || !ai.configured ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="cycle" size={15} />
              {busy ? 'Reading…' : 'Re-read the venue'}
            </button>
          </div>
        )}
      />

      {error && (
        <div className="ff-panel" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--c-red)', borderColor: 'rgba(226,58,69,0.3)' }}>
          <Icon name="alert" size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 18 }}>
        {KPIS.map(([label, value, sub, col], i) => (
          <div key={label} className={`ff-panel ff-rise-card ff-st${i + 1}`} style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700 }}>{label}</div>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 30, color: col, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title="The read" icon="cpu" accent={ACCENT} className="ff-rise-card ff-st5">
          {busy && !read ? (
            <div className="ff-empty">
              <span className="ff-empty-icon"><Icon name="cpu" size={26} /></span>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>Reading the venue…</div>
              <p className="ff-empty-text">Looking for what's off-pattern across zones, gates and incidents.</p>
            </div>
          ) : !read ? (
            <div className="ff-empty">
              <span className="ff-empty-icon"><Icon name="chart" size={26} /></span>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>No read yet</div>
              <p className="ff-empty-text">{ai.configured ? 'Generate a read of the venue.' : 'The analyst is offline — no API key configured.'}</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>{read.narrative}</p>

              {read.anomalies.length > 0 ? (
                <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700 }}>Off-pattern</div>
                  {read.anomalies.map((a, i) => (
                    <div key={i} style={{ padding: '13px 15px', borderRadius: 12, background: 'var(--elev-2)', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
                        <span className={sevChip(a.severity)}>{a.severity || 'low'}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1.45 }}>{a.what}</div>
                      {a.why && <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 5, lineHeight: 1.5 }}>{a.why}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#0e9f4f', display: 'inline-flex' }}><Icon name="check" size={16} /></span>
                  Nothing off-pattern. The venue is behaving normally.
                </p>
              )}
            </>
          )}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel title="Attendance build-up" icon="chart" accent={ACCENT} className="ff-rise-card ff-st6">
            {history.length > 2 ? (
              <>
                <Sparkline data={history} color="#2aa5e0" width={320} height={70} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12.5, color: 'var(--muted)' }}>
                  <span>{Math.min(...history).toLocaleString()}</span>
                  <span style={{ color: trend > 0 ? '#0e9f4f' : trend < 0 ? '#e4002b' : 'var(--faint)', fontWeight: 700 }}>
                    {trend > 0 ? '▲' : trend < 0 ? '▼' : '■'} {Math.abs(trend).toLocaleString()}
                  </span>
                  <span>{Math.max(...history).toLocaleString()}</span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>Collecting the first few ticks of the feed…</p>
            )}
          </Panel>

          <Panel title="Gate throughput" icon="route" accent={ACCENT} className="ff-rise-card ff-st7">
            <div style={{ display: 'grid', gap: 9 }}>
              {gates.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', width: 54, flexShrink: 0 }}>Gate {g.id}</span>
                  {g.isClosed ? (
                    <span className="ff-chip ff-chip-new">closed</span>
                  ) : (
                    <>
                      <div className="ff-gauge-track" style={{ flex: 1, height: 7 }}>
                        <div className="ff-gauge-fill" style={{ width: `${Math.min(g.density, 100)}%`, background: g.waitMin > 20 ? '#e4002b' : g.waitMin > 12 ? '#b26a00' : '#0e9f4f' }} />
                      </div>
                      <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 13.5, color: g.waitMin > 20 ? '#e4002b' : 'var(--muted)', width: 52, textAlign: 'right', flexShrink: 0 }}>{g.waitMin} min</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
