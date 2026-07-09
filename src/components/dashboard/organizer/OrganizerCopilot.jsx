import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'

// Co-pilot — natural-language query box with structured what-if answers
export default function OrganizerCopilot({ nav, zones, gates }) {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState([])

  const mockAnswers = {
    'gate d': {
      answer: 'Opening Gate D early would redistribute approximately 18% of current inbound flow from Gates C and G. Based on current density trends, this would reduce Gate C wait time from 12 min to ~7 min within 10 minutes of opening.',
      metrics: [
        { label: 'Gate C wait time', from: '12 min', to: '~7 min' },
        { label: 'Gate D projected flow', from: '0', to: '~1,200/hr' },
        { label: 'Overall south stand density', from: '90%', to: '~74%' },
      ],
    },
    'staff': {
      answer: 'Reallocating 2 volunteers from Zone D (currently at 50% capacity) to Zone C (at 90%) would improve response coverage in the congested area without significantly impacting Zone D operations.',
      metrics: [
        { label: 'Zone C volunteer coverage', from: '2 staff', to: '4 staff' },
        { label: 'Zone D volunteer coverage', from: '3 staff', to: '1 staff' },
        { label: 'Average response time (Zone C)', from: '~8 min', to: '~4 min' },
      ],
    },
  }

  const handleQuery = () => {
    if (!query.trim()) return
    const key = Object.keys(mockAnswers).find(k => query.toLowerCase().includes(k))
    const response = key ? mockAnswers[key] : {
      answer: `Based on current venue data, here's my analysis: The overall stadium is at 73% capacity. The south stand (Zone C) is the primary concern at 90% density. I'd recommend focusing crowd management efforts there. Gate C is the bottleneck at 12-minute wait times.`,
      metrics: [
        { label: 'Overall capacity', from: '—', to: '73%' },
        { label: 'Hottest zone', from: '—', to: 'Zone C (90%)' },
        { label: 'Longest gate wait', from: '—', to: 'Gate C (12 min)' },
      ],
    }
    setHistory(prev => [...prev, { query: query, response }])
    setQuery('')
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('organizer-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Co-pilot
      </h2>
      <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>
        Ask natural-language questions. Get structured what-if analysis backed by live venue data.
      </p>

      {/* Query input */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          className="ff-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuery()}
          placeholder="What happens if we open Gate D early?"
          style={{ flex: 1 }}
        />
        <button
          onClick={handleQuery}
          disabled={!query.trim()}
          style={{
            padding: '12px 24px', borderRadius: 32, border: 'none',
            background: query.trim() ? C.red : '#333', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: query.trim() ? 'pointer' : 'default',
            fontFamily: HANKEN, textTransform: 'uppercase',
          }}
        >
          Ask
        </button>
      </div>

      {/* Query history */}
      {history.length === 0 ? (
        <div className="ff-empty">
          <span className="ff-empty-icon">🤖</span>
          <p className="ff-empty-text">Ask a question to see structured analysis. Try: "What happens if we open Gate D early?" or "Should we reallocate staff?"</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...history].reverse().map((h, i) => (
            <div key={i} className="ff-dash-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 14, color: C.red, fontWeight: 600, marginBottom: 12 }}>
                Q: {h.query}
              </div>
              <div style={{ fontSize: 14, color: '#cfcfcf', lineHeight: 1.6, marginBottom: 16 }}>
                {h.response.answer}
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
              }}>
                {h.response.metrics.map((m, j) => (
                  <div key={j} style={{
                    padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ fontSize: 11, color: '#6c6c6c', marginBottom: 6 }}>{m.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#6c6c6c' }}>{m.from}</span>
                      <span style={{ color: '#4a4a4a' }}>→</span>
                      <span style={{ fontSize: 13, color: '#2fa24e', fontWeight: 600 }}>{m.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
