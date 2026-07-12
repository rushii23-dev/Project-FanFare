import { useState } from 'react'
import { BRICOLAGE } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'
import { useLiveWorldCup } from '../../../lib/freeApis.js'

// ============================================================
// LiveScoreBar — persistent FIFA World Cup 2026 score strip pinned
// to the top of every dashboard page, for all three roles. REAL
// data only (WC league 4429, season 2026). Expands to a live
// WC 2026 leaderboard: latest results + upcoming kickoffs.
// ============================================================

function Badge({ src, name, size = 30 }) {
  if (src) return <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--elev-2)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>
      {(name || '?').slice(0, 3).toUpperCase()}
    </span>
  )
}

const PHASE_META = {
  LIVE: { text: 'Live', color: 'var(--c-red)', pulse: true },
  HT: { text: 'Half-time', color: 'var(--c-amber)', pulse: true },
  FT: { text: 'Full-time', color: 'var(--faint)', pulse: false },
  UPCOMING: { text: 'Next up', color: 'var(--c-green)', pulse: false },
}

function TeamSide({ badge, name, code, score, align, lead, showScore }) {
  return (
    <div className={`ff-lsb-team ${align}`}>
      <div className="ff-lsb-team-id">
        <Badge src={badge} name={code} />
        <div className="ff-lsb-team-text">
          <span className="ff-lsb-code">{code}</span>
          <span className="ff-lsb-name">{name}</span>
        </div>
      </div>
      <span className={`ff-lsb-score${lead ? ' lead' : ''}`}>{showScore ? score : ''}</span>
    </div>
  )
}

export default function LiveScoreBar() {
  const { view, loading, results, fixtures, leagueBadge, live } = useLiveWorldCup()
  const [open, setOpen] = useState(false)

  if (loading && !view) {
    return (
      <div className="ff-lsb">
        <div className="ff-lsb-bar" style={{ cursor: 'default' }} aria-hidden>
          <div className="ff-skeleton" style={{ height: 34, width: 120 }} />
          <div className="ff-skeleton" style={{ height: 34 }} />
          <div className="ff-skeleton" style={{ height: 34, width: 140 }} />
          <span className="ff-lsb-progress"><span className="ff-lsb-progress-fill" style={{ width: '0%' }} /></span>
        </div>
      </div>
    )
  }

  if (!view) {
    return (
      <div className="ff-lsb">
        <div className="ff-lsb-bar" style={{ cursor: 'default', gridTemplateColumns: '1fr' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="ff-lsb-dot" style={{ background: 'var(--faint-2)' }} />
            <span className="ff-lsb-comp">FIFA World Cup 26</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Live scores momentarily unavailable</span>
          </div>
        </div>
      </div>
    )
  }

  const meta = PHASE_META[view.phase] || PHASE_META.UPCOMING
  const showScore = view.phase !== 'UPCOMING' && view.hasScore

  return (
    <div className={`ff-lsb${open ? ' open' : ''}`}>
      <button
        className="ff-lsb-bar"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`${view.home} versus ${view.away}, ${meta.text}${showScore ? `, ${view.homeScore}–${view.awayScore}` : ''}. Tap for the World Cup 2026 leaderboard.`}
      >
        {/* status */}
        <div className="ff-lsb-status">
          <span className="ff-lsb-live" style={{ color: meta.color }}>
            <span className="ff-lsb-dot" style={{ background: meta.color, boxShadow: `0 0 0 4px color-mix(in srgb, ${meta.color} 22%, transparent)`, animation: meta.pulse ? 'ff-live-dot 1.4s ease-in-out infinite' : 'none' }} />
            {meta.text}
          </span>
          <span className="ff-lsb-clock" style={{ fontFamily: BRICOLAGE }}>{view.minuteLabel}</span>
        </div>

        {/* scoreline */}
        <div className="ff-lsb-scoreline">
          <TeamSide badge={view.homeBadge} name={view.home} code={view.homeCode} score={view.homeScore} align="home" lead={showScore && view.homeLead} showScore={showScore} />
          <span className="ff-lsb-dash">{showScore ? '–' : 'vs'}</span>
          <TeamSide badge={view.awayBadge} name={view.away} code={view.awayCode} score={view.awayScore} align="away" lead={showScore && view.awayLead} showScore={showScore} />
        </div>

        {/* meta */}
        <div className="ff-lsb-meta">
          <span className="ff-lsb-comp" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {leagueBadge && <img src={leagueBadge} alt="" style={{ width: 15, height: 15, objectFit: 'contain' }} />}
            FIFA World Cup 26
          </span>
          {view.venue && <span className="ff-lsb-venue"><Icon name="pin" size={12} /> {view.venue}</span>}
          {view.round && <span className="ff-lsb-venue"><Icon name="star" size={12} /> {view.round.startsWith('Round') || view.round.length > 2 ? view.round : `Round ${view.round}`}</span>}
        </div>

        <span className="ff-lsb-chevron" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <Icon name="arrow" size={16} />
        </span>

        <span className="ff-lsb-progress" aria-hidden>
          <span className="ff-lsb-progress-fill" style={{ width: `${(view.progress || 0) * 100}%`, opacity: view.phase === 'UPCOMING' ? 0 : 1 }} />
        </span>
      </button>

      {open && <Leaderboard results={results} fixtures={fixtures} live={live} />}
    </div>
  )
}

function fmtDate(ts) {
  const d = new Date((ts || '').replace(' ', 'T'))
  if (isNaN(d)) return ts
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function fmtTime(ts) {
  const d = new Date((ts || '').replace(' ', 'T'))
  if (isNaN(d)) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function LbRow({ m, result }) {
  return (
    <div className="ff-lsb-lb-row">
      <span className="ff-lsb-lb-team home">
        <span className="ff-lsb-lb-name">{m.home}</span>
        <Badge src={m.homeBadge} name={m.home} size={22} />
      </span>
      <span className="ff-lsb-lb-mid">
        {result
          ? <span className="ff-lsb-lb-score">{m.hs}<span>–</span>{m.as}</span>
          : <span className="ff-lsb-lb-time">{fmtTime(m.ts)}</span>}
      </span>
      <span className="ff-lsb-lb-team away">
        <Badge src={m.awayBadge} name={m.away} size={22} />
        <span className="ff-lsb-lb-name">{m.away}</span>
      </span>
    </div>
  )
}

function Leaderboard({ results, fixtures }) {
  return (
    <div className="ff-lsb-details">
      <div className="ff-lsb-details-grid">
        <div>
          <div className="ff-lsb-sec-title">Latest results</div>
          {(results || []).length === 0
            ? <div className="ff-lsb-empty">No results yet.</div>
            : results.slice(0, 5).map(m => (
                <div key={m.id}>
                  <LbRow m={m} result />
                  <div className="ff-lsb-lb-sub">{m.status || 'FT'} · {fmtDate(m.ts)}{m.city ? ` · ${m.city}` : ''}</div>
                </div>
              ))}
        </div>
        <div>
          <div className="ff-lsb-sec-title">Upcoming kickoffs</div>
          {(fixtures || []).length === 0
            ? <div className="ff-lsb-empty">No fixtures scheduled.</div>
            : fixtures.slice(0, 5).map(m => (
                <div key={m.id}>
                  <LbRow m={m} />
                  <div className="ff-lsb-lb-sub">{fmtDate(m.ts)}{m.venue ? ` · ${m.venue}` : ''}</div>
                </div>
              ))}
        </div>
      </div>
      <div className="ff-lsb-footnote">
        <Icon name="info" size={13} /> FIFA World Cup 2026 · live status &amp; scores via TheSportsDB
      </div>
    </div>
  )
}
