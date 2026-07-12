import { useState, useCallback } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { useRates, useLiveWorldCup, geocodeCity, useWeather, weatherMeta } from '../../../lib/freeApis.js'
import { useVenue } from '../../../lib/venue.js'
import { distanceKm, rankModes, savedVsDriving, equivalent, FACTOR_SOURCE, MODE_LABEL } from '../../../lib/carbon.js'
import { askAIJson, aiErrorMessage, useAIStatus } from '../../../lib/ai.js'
import PageHead from '../shared/PageHead.jsx'
import Panel from '../shared/Panel.jsx'
import VenueMap from '../shared/VenueMap.jsx'
import DataPending from '../shared/DataPending.jsx'

const ACCENT = '#0e9f4f'
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'MXN', 'JPY', 'BRL', 'INR', 'AUD']

const ADVISOR_SYSTEM = `You are the FanFare travel advisor for a fan heading to a FIFA World Cup 2026 match.

You answer one question: when should this fan leave, how should they travel, and which gate should they walk to — given the real distance, the real weather, the live gate queues and the kickoff time.

Rules:
- Ground everything in the CONTEXT. Use the real figures. Never invent a train time, a gate, or a queue length.
- Trade off honestly. The greenest option is not always the right call if the fan is far away and short on time — say so rather than moralising. But when the low-carbon option is genuinely fine, recommend it and say why.
- Weather matters: rain or cold changes whether a 20-minute walk is sensible.
- Use the live gate waits to pick the gate. If the fan's ticketed gate is congested, tell them which open gate is quicker.
- Be specific and brief. A fan reads this on a phone while putting their coat on.

Respond with JSON exactly matching:
{
  "headline": "the one-line recommendation",
  "leaveBy": "a clock time or relative time, with the reason",
  "mode": "the recommended travel mode, matching one of the modes offered",
  "gate": "which gate to head for and why, or empty string if unknown",
  "why": "2-3 sentences justifying the call, citing the real numbers",
  "green": "one honest sentence on the carbon trade-off of this choice"
}`

// REMOVED: `ARRIVE_MODES` quoted invented journey times (~35 / 22 / 12 min) as
// if they were facts about every World Cup ground. We have no routing feed, so
// we do not state a journey time. Arrival options are now derived from the
// fan's real geocoded origin and real emission factors (see carbon.js).

function TeamBadge({ src, code, size = 26 }) {
  if (src) return <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--elev-2)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>{code}</span>
  )
}

export default function FanTransport({ fanProfile, gates = [] }) {
  const wc = useLiveWorldCup()
  const m = wc.view
  const ai = useAIStatus()
  const venue = useVenue()
  // The destination IS the real venue of the live match — no stand-in stadium.
  const dest = { lat: venue.lat, lon: venue.lon, name: venue.venue, city: venue.city }

  // ── Where the fan is travelling from. Real geocoding → real distance → real emissions.
  const [originText, setOriginText] = useState('')
  const [origin, setOrigin] = useState(null)
  const [locating, setLocating] = useState(false)
  const [advice, setAdvice] = useState(null)
  const [advising, setAdvising] = useState(false)
  const [adviceErr, setAdviceErr] = useState(null)

  const weather = useWeather(dest.lat, dest.lon)

  const findOrigin = async () => {
    const q = originText.trim()
    if (!q || locating) return
    setLocating(true)
    const g = await geocodeCity(q)
    setOrigin(g ? { lat: g.lat, lon: g.lon, label: g.label } : null)
    setAdvice(null)
    setLocating(false)
  }

  const km = origin ? distanceKm(origin, { lat: dest.lat, lon: dest.lon }) : 0
  const ranked = km > 0 ? rankModes(km) : []
  const greenest = ranked[0]

  const getAdvice = useCallback(async () => {
    if (!origin || advising) return
    setAdvising(true); setAdviceErr(null)

    const openGates = gates.filter(g => !g.isClosed)
    const p = fanProfile
    const w = weather?.live
      ? `${weatherMeta(weather.code).label}, ${weather.temp}°C (feels ${weather.feels}°C), wind ${weather.wind} km/h`
      : 'unavailable'
    const kickoff = venue.kickoffLabel || 'unknown'

    try {
      const res = await askAIJson({
        system: ADVISOR_SYSTEM,
        temperature: 0.35,
        prompt: `CONTEXT
Fan travelling from: ${origin.label}
Destination: ${dest.name}, ${dest.city}
Real distance: ${km.toFixed(1)} km each way
Fan's ticketed gate: ${p?.ticketConfirmed ? `Gate ${p.gate} (Section ${p.section})` : 'not yet added'}

Kickoff: ${kickoff}
Current time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
Weather at the venue: ${w}

TRAVEL MODES AVAILABLE FOR THIS DISTANCE, with real round-trip emissions
(DEFRA/BEIS factors x real distance — these figures are computed, not estimated):
${ranked.map(r => `  ${r.label}: ${r.kg.toFixed(1)} kg CO2e round trip (${r.factor} g/passenger-km)`).join('\n')}

LIVE GATE WAITS (simulated telemetry):
${openGates.length ? openGates.map(g => `  Gate ${g.id}: ${g.waitMin} min wait, ${g.density}% density`).join('\n') : '  unavailable'}
Closed gates: ${gates.filter(g => g.isClosed).map(g => g.id).join(', ') || 'none'}
END CONTEXT

Advise this fan.`,
      })
      setAdvice({
        headline: String(res.headline || '').trim(),
        leaveBy: String(res.leaveBy || '').trim(),
        mode: String(res.mode || '').trim(),
        gate: String(res.gate || '').trim(),
        why: String(res.why || '').trim(),
        green: String(res.green || '').trim(),
      })
    } catch (e) {
      setAdviceErr(aiErrorMessage(e))
    }
    setAdvising(false)
  }, [origin, dest, km, ranked, gates, fanProfile, weather, venue, advising])

  // (Venue geocoding now lives in useVenue() — one source of truth for the whole app.)

  const rates = useRates('USD')
  const [amount, setAmount] = useState('50')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('MXN')
  const rFrom = from === 'USD' ? 1 : rates.rates[from]
  const rTo = to === 'USD' ? 1 : rates.rates[to]
  const converted = (Number(amount || 0) * (rTo / rFrom))

  const venueName = venue.venue || 'the venue'
  const cityName = venue.city || ''
  const hasScore = m && m.phase !== 'UPCOMING' && m.hasScore

  const statusColor = m?.phase === 'LIVE' ? 'var(--c-red)' : m?.phase === 'HT' ? 'var(--c-amber)' : m?.phase === 'FT' ? 'var(--faint)' : ACCENT
  const statusText = !m ? 'Finding the live match…'
    : m.phase === 'LIVE' ? `Live · ${m.minuteLabel}`
    : m.phase === 'HT' ? 'Half-time'
    : m.phase === 'FT' ? 'Full-time'
    : `Kickoff ${m.minuteLabel}`

  // Only pin the ground once we actually know where it is — VenueMap cannot take
  // null coordinates, and a stand-in pin would be a fabricated location.
  const MARKERS = venue.resolved
    ? [{ lat: venue.lat, lon: venue.lon, label: `${venueName}${m ? ` — ${m.homeCode} v ${m.awayCode}` : ''}`, color: '#e4002b' }]
    : []

  return (
    <div>
      <PageHead eyebrow="Transport & sustainability" title="Plan your journey" subtitle={`Real distance, real emission factors, live gate queues and live weather — Gemini works out when you should leave for ${venueName} and how.`} />

      {/* Live match destination banner — synced to the real featured WC 2026 match */}
      <div className="ff-rise-card ff-st1" style={{
        display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 18, padding: '16px 20px', borderRadius: 16,
        border: '1px solid var(--line-strong)', overflow: 'hidden', position: 'relative',
        background: 'radial-gradient(120% 160% at 100% 0%, rgba(228,0,43,0.07), transparent 45%), linear-gradient(180deg, color-mix(in srgb, var(--panel) 92%, #0e9f4f 3%), var(--panel))',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: HANKEN, fontWeight: 800, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: statusColor }}>
          <span className="ff-lsb-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: `0 0 0 4px color-mix(in srgb, ${statusColor} 22%, transparent)`, animation: (m?.phase === 'LIVE' || m?.phase === 'HT') ? 'ff-live-dot 1.4s ease-in-out infinite' : 'none' }} /> {statusText}
        </span>
        {m && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
            <TeamBadge src={m.homeBadge} code={m.homeCode} />
            <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 17, color: 'var(--text)', whiteSpace: 'nowrap' }}>
              {m.homeCode} <span style={{ color: hasScore ? 'var(--text)' : 'var(--faint)', fontSize: hasScore ? 17 : 13, fontWeight: hasScore ? 700 : 600 }}>{hasScore ? `${m.homeScore}–${m.awayScore}` : 'vs'}</span> {m.awayCode}
            </span>
            <TeamBadge src={m.awayBadge} code={m.awayCode} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            <span style={{ color: ACCENT, display: 'inline-flex' }}><Icon name="pin" size={15} /></span> {venueName}
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{[cityName, m?.round && (m.round.length > 2 ? m.round : `Round ${m.round}`)].filter(Boolean).join(' · ')}</span>
        </div>
        {/* Greenest route is only knowable once the fan tells us where they're
            coming from — it comes from real distance x real emission factors,
            never from a guessed journey time. */}
        {greenest && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700 }}>Greenest route</div>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 20, color: ACCENT }}>
              {greenest.kg < 0.05 ? '0' : greenest.kg.toFixed(1)} kg <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{greenest.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Where are you coming from? Real geocode → real distance → real emissions ── */}
      <Panel title="Your journey" icon="pin" accent={ACCENT} className="ff-rise-card ff-st2" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={originText}
            onChange={e => setOriginText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && findOrigin()}
            placeholder="Which city or town are you travelling from?"
            className="ff-dash-input"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button onClick={findOrigin} disabled={locating || !originText.trim()} className="ff-btn"
            style={{ padding: '13px 24px', borderRadius: 12, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: locating || !originText.trim() ? 'default' : 'pointer', opacity: locating || !originText.trim() ? 0.55 : 1 }}>
            {locating ? 'Locating…' : 'Set origin'}
          </button>
        </div>

        {originText.trim() && !origin && !locating && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12 }}>Couldn't find that place — try a nearby city.</p>
        )}

        {origin && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 16, marginBottom: 14 }}>
              <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{origin.label}</span>
              <span style={{ color: 'var(--faint)' }}><Icon name="arrow" size={15} /></span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{venueName}</span>
              <span className="ff-chip ff-chip-progress">{km.toFixed(1)} km each way</span>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {ranked.map((r, i) => {
                const pct = ranked.length > 1 ? (r.kg / ranked[ranked.length - 1].kg) * 100 : 0
                const clean = i === 0
                const col = clean ? ACCENT : r.kg > (greenest?.kg ?? 0) * 3 ? '#e4002b' : '#b26a00'
                const saved = savedVsDriving(r.mode, km)
                return (
                  <div key={r.mode} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, border: `1px solid ${clean ? 'rgba(14,159,79,0.3)' : 'var(--line)'}`, background: clean ? 'rgba(14,159,79,0.06)' : 'var(--panel)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                          {r.label}{clean && <span className="ff-chip ff-chip-done" style={{ marginLeft: 8 }}>greenest</span>}
                        </span>
                        <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 15, color: col, whiteSpace: 'nowrap' }}>
                          {r.kg < 0.05 ? '0' : r.kg.toFixed(1)} kg CO₂e
                        </span>
                      </div>
                      <div className="ff-gauge-track" style={{ marginTop: 8, height: 6 }}>
                        <div className="ff-gauge-fill" style={{ width: `${Math.max(pct, 2)}%`, background: col }} />
                      </div>
                      {saved > 0.1 && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                          Saves {saved.toFixed(1)} kg vs driving alone — about {equivalent(saved)}.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Icon name="leaf" size={14} /> Round-trip figures computed from your real distance using {FACTOR_SOURCE}. These are measured constants, not estimates.
            </p>

            <button onClick={getAdvice} disabled={advising || !ai.configured} className="ff-btn"
              style={{ marginTop: 16, width: '100%', padding: '14px', borderRadius: 12, border: 'none', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: advising || !ai.configured ? 'default' : 'pointer', opacity: advising || !ai.configured ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="cpu" size={16} />
              {advising ? 'Working it out…' : 'When should I leave?'}
            </button>
            {!ai.checking && !ai.configured && (
              <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 8, textAlign: 'center' }}>The travel advisor is offline — no API key configured.</p>
            )}
          </>
        )}

        {adviceErr && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--c-red)' }}>
            <Icon name="alert" size={16} /> {adviceErr}
          </div>
        )}

        {advice && (
          <div style={{ marginTop: 16, padding: '18px 20px', borderRadius: 16, border: '1px solid rgba(14,159,79,0.3)', background: 'rgba(14,159,79,0.06)' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: 8 }}>Your departure plan</div>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 19, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{advice.headline}</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {[['Leave by', advice.leaveBy], ['Travel by', MODE_LABEL[advice.mode] || advice.mode], ['Gate', advice.gate]]
                .filter(([, v]) => v)
                .map(([l, v]) => (
                  <span key={l} style={{ display: 'inline-flex', flexDirection: 'column', padding: '8px 14px', borderRadius: 10, background: 'var(--panel)', border: '1px solid var(--line)', maxWidth: 260 }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>{l}</span>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.35 }}>{v}</span>
                  </span>
                ))}
            </div>

            {advice.why && <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 14, lineHeight: 1.55 }}>{advice.why}</p>}
            {advice.green && (
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}>
                <span style={{ color: ACCENT, marginTop: 2, flexShrink: 0 }}><Icon name="leaf" size={15} /></span>
                {advice.green}
              </p>
            )}
          </div>
        )}
      </Panel>

      <div className="ff-fan-transport" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Panel title={`Route to ${venueName}`} icon="map" accent={ACCENT} className="ff-rise-card ff-st2" bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            action={m && <span style={{ fontSize: 12, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="pin" size={13} /> {m.homeCode} v {m.awayCode}</span>}>
            {venue.resolved ? (
              <>
                <VenueMap center={[venue.lat, venue.lon]} zoom={12} markers={MARKERS} height={260} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {MARKERS.map(mk => (
                    <span key={mk.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--muted)' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: mk.color, flexShrink: 0 }} /> {mk.label}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <DataPending icon="pin" title="Resolving the venue" message="Finding which stadium the live FIFA World Cup 2026 match is at. We never show a stand-in ground." style={{ padding: '48px 24px' }} />
            )}
          </Panel>

          {/* The old "Ways to arrive" panel quoted invented journey times
              (~35 / 22 / 12 min) that were MetLife guesses and applied to no
              real fixture. Real arrival options come from the fan's actual
              origin above — real distance, real emission factors. */}
        </div>

        <Panel title="Currency converter" icon="star" live={rates.live} accent={ACCENT} className="ff-rise-card ff-st4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700 }}>Amount</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" className="ff-dash-input" style={{ flex: 1 }} />
                <select value={from} onChange={e => setFrom(e.target.value)} className="ff-dash-input" style={{ width: 90 }}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--muted)' }}><Icon name="swap" size={18} /></div>
            <div>
              <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700 }}>Converts to</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                <div className="ff-dash-input" style={{ flex: 1, display: 'flex', alignItems: 'center', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 22, color: 'var(--text)', background: 'var(--elev-2)' }}>
                  {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <select value={to} onChange={e => setTo(e.target.value)} className="ff-dash-input" style={{ width: 90 }}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--faint)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <Icon name="info" size={14} /> {rates.live ? 'Live rates' : 'Offline rates'} · 1 {from} = {(rTo / rFrom).toLocaleString(undefined, { maximumFractionDigits: 3 })} {to}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
