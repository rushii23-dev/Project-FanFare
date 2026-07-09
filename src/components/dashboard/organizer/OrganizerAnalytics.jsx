import { BRICOLAGE } from '../../ui.js'
import { analyticsStats } from '../../../data.js'
import Sparkline from '../shared/Sparkline.jsx'

// Analytics — Impact-style stat cards with sparklines, reusing the About.jsx pattern
export default function OrganizerAnalytics({ nav }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('organizer-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 24,
      }}>
        Analytics
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {analyticsStats.map((st, i) => (
          <div
            key={i}
            className="ff-dash-card ff-light"
            style={{ padding: 28 }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <div style={{
                fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 40,
                lineHeight: 0.95, color: st.accent, letterSpacing: '-0.01em',
              }}>
                {st.value}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: st.trend.startsWith('+') || st.trend.startsWith('−') ? '#2fa24e' : '#9a9a9a',
              }}>
                {st.trend}
              </span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.4, color: '#9a9a9a', marginBottom: 14 }}>
              {st.label}
            </div>
            <Sparkline data={st.sparkline} color={st.accent} width={140} height={32} />
          </div>
        ))}
      </div>
    </div>
  )
}
