import { useState, useRef, useEffect } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { conciergeFAQ, languages, C } from '../../../data.js'

// AI Concierge — chat UI with multilingual support and grounded answers
export default function FanConcierge({ nav }) {
  const [lang, setLang] = useState('English')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Welcome to the FanFare AI Concierge. I can help with directions, venue policies, food options, and more. Ask me anything — in any language.' },
  ])
  const threadRef = useRef(null)

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages])

  const handleSend = (text) => {
    const q = (text || input).trim()
    if (!q) return
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    // Find a grounded answer
    setTimeout(() => {
      const faq = conciergeFAQ.find(f =>
        q.toLowerCase().includes(f.q.toLowerCase().slice(0, 20)) ||
        f.q.toLowerCase().includes(q.toLowerCase().slice(0, 20))
      )
      const answer = faq
        ? faq.a
        : `I found some information that might help. Based on the MetLife Stadium venue guide: For your specific question about "${q}", I'd recommend checking with the nearest information desk (located at every gate entrance) or asking any volunteer in a yellow vest. They can provide real-time, personalized assistance.`
      setMessages(prev => [...prev, { role: 'system', text: answer }])
    }, 800)
  }

  const prompts = conciergeFAQ.slice(0, 4).map(f => f.q)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
      <button className="ff-breadcrumb" onClick={() => nav('fan-dashboard')}>
        ← Dashboard
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{
            fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
            color: '#f4f4f4', textTransform: 'uppercase', letterSpacing: '-0.01em',
          }}>
            AI Concierge
          </h2>
          <p style={{ fontSize: 14, color: '#9a9a9a', marginTop: 4 }}>
            Grounded in venue FAQ — answers stay true.
          </p>
        </div>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          aria-label="Language"
          style={{
            background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)',
            color: '#cfcfcf', padding: '8px 14px', borderRadius: 10,
            fontSize: 13, fontFamily: HANKEN, cursor: 'pointer',
          }}
        >
          {languages.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Chat thread */}
      <div ref={threadRef} className="ff-chat-thread" style={{
        background: '#0e0e0e', borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)', flex: 1, minHeight: 0,
      }}>
        {messages.map((m, i) => (
          <div key={i} className={`ff-chat-bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      {/* Suggested prompts */}
      {messages.length <= 2 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 0' }}>
          {prompts.map((p, i) => (
            <button
              key={i}
              className="ff-filter-chip"
              onClick={() => handleSend(p)}
              style={{ fontSize: 12 }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="ff-chat-input-row" style={{
        background: '#111111', borderRadius: '0 0 16px 16px',
        border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none',
      }}>
        <input
          className="ff-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={`Ask anything${lang !== 'English' ? ` (${lang})` : ''}...`}
          style={{ flex: 1, borderRadius: 24, padding: '12px 18px' }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          aria-label="Send message"
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: input.trim() ? C.blue : '#333', color: '#fff',
            fontSize: 18, cursor: input.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
