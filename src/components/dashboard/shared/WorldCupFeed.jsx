import { BRICOLAGE, HANKEN } from '../../ui.js'
import Icon from '../../landing/Icons.jsx'

function Badge({ src, name }) {
  return src
    ? <img src={src} alt={name} style={{ width: 30, height: 30, objectFit: 'contain' }} />
    : <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--elev-2)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{(name || '?').slice(0, 3).toUpperCase()}</span>
}

function fmt(ts) {
  const d = new Date(ts.replace(' ', 'T'))
  if (isNaN(d)) return ts
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MatchRow({ m, result }) {
  return (
    <div style={{ padding: '13px 0', borderBottom: '1px solid var(--line-soft)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Badge src={m.homeBadge} name={m.home} />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.home}</span>
        </div>
        {result ? (
          <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 20, color: 'var(--text)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{m.hs}<span style={{ color: 'var(--faint)', margin: '0 4px' }}>–</span>{m.as}</span>
        ) : (
          <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 13, color: 'var(--ff-accent)', whiteSpace: 'nowrap' }}>{new Date(m.ts.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, justifyContent: 'flex-end' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>{m.away}</span>
          <Badge src={m.awayBadge} name={m.away} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 7 }}>
        <span style={{ fontSize: 11.5, color: 'var(--faint)', display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          <Icon name="map" size={12} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.venue}{m.city ? ` · ${m.city}` : ''}</span>
        </span>
        <span className={`ff-chip ${result ? 'ff-chip-done' : 'ff-chip-pending'}`} style={{ flexShrink: 0 }}>{result ? (m.status || 'FT') : fmt(m.ts)}</span>
      </div>
    </div>
  )
}

// Live FIFA World Cup 26 feed. Pass the useWorldCup() result as `data`.
export default function WorldCupFeed({ data, resultsLimit = 3, fixturesLimit = 2 }) {
  const { loading, live, results, fixtures, leagueBadge } = data

  return (
    <div className="ff-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {leagueBadge
            ? <img src={leagueBadge} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            : <span style={{ color: 'var(--ff-accent)' }}><Icon name="star" size={22} /></span>}
          <h3 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.01em' }}>FIFA World Cup 26</h3>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span className="ff-live-dot" style={{ background: live ? 'var(--c-red)' : 'var(--faint-2)' }} />
          <span style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: live ? 'var(--c-red)' : 'var(--faint)' }}>{live ? 'Live' : 'Offline'}</span>
        </span>
      </header>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0, 1, 2].map(i => <div key={i} className="ff-skeleton" style={{ height: 44 }} />)}
        </div>
      ) : (!results.length && !fixtures.length) ? (
        <div className="ff-empty"><span className="ff-empty-icon"><Icon name="star" size={24} /></span><p className="ff-empty-text">Live fixtures are momentarily unavailable.</p></div>
      ) : (
        <div>
          {results.length > 0 && (
            <>
              <div style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>Latest results</div>
              {results.slice(0, resultsLimit).map(m => <MatchRow key={m.id} m={m} result />)}
            </>
          )}
          {fixtures.length > 0 && (
            <>
              <div style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', margin: '16px 0 2px' }}>Upcoming</div>
              {fixtures.slice(0, fixturesLimit).map(m => <MatchRow key={m.id} m={m} />)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
