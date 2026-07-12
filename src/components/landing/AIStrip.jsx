import { BRICOLAGE, HANKEN, section, FIFA_TRIAD } from '../ui.js'
import { LightMotes } from './Fx.jsx'
import Icon from './Icons.jsx'
import { aiFeatures } from '../../data.js'

const AI_ICONS = ['chat', 'pin', 'cycle', 'doc']

// A stylised glimpse of the real multilingual assistant answering in-language.
function ChatMock() {
  return (
    <div style={{
      position: 'relative', borderRadius: 20, background: '#ffffff',
      border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 30px 70px rgba(4,40,20,0.4)',
      overflow: 'hidden', transform: 'perspective(1300px) rotateY(4deg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: '1px solid rgba(10,60,30,0.08)' }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(150deg,#0e9f4f,#0a7a3c)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chat" size={16} /></span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 12.5, color: '#08210f' }}>FanFare Assistant</div>
          <div style={{ fontSize: 10, color: '#6a8574', letterSpacing: '0.04em' }}>Grounded in your ticket · EN ⇄ ES</div>
        </div>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0e9f4f' }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#0e9f4f' }}>ONLINE</span>
        </span>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: 'linear-gradient(180deg,#f7fdf9,#ffffff)' }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: '#eef4ef', color: '#2f4a3a', padding: '10px 13px', borderRadius: '14px 14px 14px 4px', fontSize: 12.5, lineHeight: 1.45 }}>
          Hi Jordan! I know your ticket — ask me anything, in any language.
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '86%', background: 'linear-gradient(120deg,#0e9f4f,#0a7a3c)', color: '#fff', padding: '10px 13px', borderRadius: '14px 14px 4px 14px', fontSize: 12.5, fontWeight: 600 }}>
          ¿Dónde está mi asiento?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '90%', background: '#eef4ef', color: '#2f4a3a', padding: '10px 13px', borderRadius: '14px 14px 14px 4px', fontSize: 12.5, lineHeight: 1.45 }}>
          Estás en la <b>Sección 214, Fila 12, Asiento 8</b>. Desde la Puerta C, sube al nivel 2 y gira a la derecha.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderTop: '1px solid rgba(10,60,30,0.08)' }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(10,60,30,0.15)', color: '#6a8574', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="mic" size={15} /></span>
        <div style={{ flex: 1, height: 32, borderRadius: 9, background: '#f2f7f3', border: '1px solid rgba(10,60,30,0.1)', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 11.5, color: '#9ab0a2' }}>Type your question…</div>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(120deg,#0e9f4f,#f5b301)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={15} /></span>
      </div>
    </div>
  )
}

export default function AIStrip() {
  return (
    <section style={section('96px 40px')}>
      <div data-reveal className="ff-reveal" style={{
        position: 'relative', overflow: 'hidden', borderRadius: 26, padding: 'clamp(40px,5vw,64px)',
        background: 'linear-gradient(150deg, #0e9f4f 0%, #0a7a3c 60%, #064a25 100%)',
        border: '1px solid rgba(126,217,87,0.4)', boxShadow: '0 40px 90px rgba(6,60,30,0.4)',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(100deg, rgba(255,255,255,0.05) 0 70px, rgba(0,0,0,0.04) 70px 140px)' }} />
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '55%', height: '170%', background: 'radial-gradient(circle, rgba(255,240,190,0.32), transparent 65%)', animation: 'ff-drift 12s ease-in-out infinite', pointerEvents: 'none' }} />
        <LightMotes count={14} zIndex={1} color="rgba(255,248,220,0.9)" />

        <div className="ff-ai-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 0.9fr', gap: 'clamp(32px,4vw,60px)', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: HANKEN, fontWeight: 700, fontSize: 12.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#eaff9e' }}>
              <span style={{ width: 26, height: 3, borderRadius: 3, background: '#f5b301', boxShadow: '0 0 10px #f5b301' }} />
              Quiet intelligence
            </span>
            <h2 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(36px,4.6vw,58px)', lineHeight: 1.0, letterSpacing: '-0.02em', color: '#ffffff', marginTop: 16, textShadow: '0 2px 16px rgba(0,40,18,0.4)' }}>
              Help that arrives<br />before you ask
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#e4f7e8', marginTop: 20, maxWidth: 440 }}>
              FanFare's assistance runs quietly in the background — answering in your language, reading
              the crowd, and turning a few spoken words into a routed report. Nothing to learn. It just works.
            </p>
            <div style={{ display: 'flex', gap: 26, marginTop: 28, flexWrap: 'wrap' }}>
              {[['26', 'Languages'], ['<1s', 'To answer'], ['0', 'Dashboards to learn']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 30, color: '#ffffff', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bfe8c9', marginTop: 5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ animation: 'ff-float 5.5s ease-in-out infinite' }}><ChatMock /></div>
        </div>

        {/* feature cards */}
        <div className="ff-ai-features" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 'clamp(32px,4vw,48px)' }}>
          {aiFeatures.map((a, i) => {
            const t = FIFA_TRIAD[i % 3]
            return (
              <div key={i} className="ff-lift" style={{
                background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 16,
                padding: '20px', boxShadow: '0 14px 30px rgba(4,40,20,0.22)',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: t.soft, border: `1px solid ${t.border}`, color: t.c, marginBottom: 14 }}>
                  <Icon name={AI_ICONS[i % AI_ICONS.length]} size={22} />
                </span>
                <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 16, color: '#08210f' }}>{a.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: '#4a6555', marginTop: 6 }}>{a.body}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
