import { BRICOLAGE, HANKEN, section, FIFA_TRIAD } from '../ui.js'
import { Eyebrow, SunWash, PitchGrid } from './Fx.jsx'
import Icon from './Icons.jsx'
import { portals } from '../../data.js'

const ROLE_ICON = { fan: 'ticket', staff: 'shield', organizer: 'compass' }

// A device-framed schematic glimpse of each portal's real UI.
function DeviceFrame({ role, t, children }) {
  return (
    <div style={{
      position: 'relative', borderRadius: 20, background: '#ffffff',
      border: '1px solid rgba(10,60,30,0.12)', boxShadow: '0 30px 70px rgba(10,60,30,0.16)',
      overflow: 'hidden', transform: 'perspective(1200px) rotateY(-4deg)', transition: 'transform .5s',
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${t.c}, ${t.c}55)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderBottom: '1px solid rgba(10,60,30,0.08)' }}>
        <span style={{ display: 'inline-flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
        </span>
        <span style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: 6, color: t.c }}>
          <Icon name={ROLE_ICON[role]} size={13} />
          <span style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 10.5, letterSpacing: '0.06em', color: '#37533f' }}>FanFare · {role[0].toUpperCase() + role.slice(1)}</span>
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e4002b' }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#e4002b' }}>LIVE</span>
        </span>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}

function MiniCard({ children, style }) {
  return <div style={{ borderRadius: 12, border: '1px solid rgba(10,60,30,0.1)', background: '#fbfefc', padding: '11px 13px', ...style }}>{children}</div>
}

function PortalPreview({ role, t }) {
  if (role === 'fan') {
    return (
      <DeviceFrame role={role} t={t}>
        <MiniCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {['USA', 'MEX'].map((c, i) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i === 1 && <span style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 12, color: '#9ab0a2' }}>vs</span>}
                <span style={{ width: 26, height: 26, borderRadius: 8, background: i ? '#0a7a3c' : t.c, color: '#fff', fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{c}</span>
              </div>
            ))}
          </div>
        </MiniCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[['route', 'Gate', '12m'], ['sun', 'Wthr', '24°'], ['seat', 'Seat', '214']].map(([ic, l, v]) => (
            <MiniCard key={l} style={{ padding: '9px 8px', textAlign: 'center' }}>
              <span style={{ color: t.c }}><Icon name={ic} size={14} /></span>
              <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 14, color: '#08210f', marginTop: 3 }}>{v}</div>
              <div style={{ fontSize: 8.5, color: '#9ab0a2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
            </MiniCard>
          ))}
        </div>
        <div style={{ height: 34, borderRadius: 10, background: `linear-gradient(100deg, ${t.c}, #0a7a3c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: HANKEN, fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>View e-ticket</div>
      </DeviceFrame>
    )
  }
  if (role === 'staff') {
    const tasks = [['Escort to Sec 110', false], ['Restock water station', true], ['Check Gate C queue', true]]
    return (
      <DeviceFrame role={role} t={t}>
        <div style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6a8574' }}>Today · 6 tasks</div>
        {tasks.map(([tk, done]) => (
          <MiniCard key={tk} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px' }}>
            <span style={{ width: 18, height: 18, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: done ? '#0e9f4f' : 'transparent', border: `1px solid ${done ? '#0e9f4f' : 'rgba(10,60,30,0.2)'}`, color: '#fff' }}>{done && <Icon name="check" size={12} />}</span>
            <span style={{ fontSize: 12, color: done ? '#9ab0a2' : '#08210f', textDecoration: done ? 'line-through' : 'none', fontWeight: 600 }}>{tk}</span>
          </MiniCard>
        ))}
        <MiniCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}><span style={{ color: '#37533f', fontWeight: 600 }}>Zone C</span><span style={{ color: '#e4002b', fontWeight: 700 }}>90%</span></div>
          <div style={{ height: 7, borderRadius: 4, background: '#eef4ef', overflow: 'hidden' }}><div style={{ width: '90%', height: '100%', background: '#e4002b', borderRadius: 4 }} /></div>
        </MiniCard>
      </DeviceFrame>
    )
  }
  // organizer
  const heat = [90, 61, 77, 50, 85, 60]
  const col = p => p >= 85 ? '#e4002b' : p >= 65 ? '#c8890a' : '#0e9f4f'
  return (
    <DeviceFrame role={role} t={t}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {[['62,140', 'In'], ['90%', 'Occ'], ['3', 'Alerts']].map(([v, l]) => (
          <MiniCard key={l} style={{ padding: '9px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 15, color: '#08210f' }}>{v}</div>
            <div style={{ fontSize: 8.5, color: '#9ab0a2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
          </MiniCard>
        ))}
      </div>
      <MiniCard>
        <div style={{ fontSize: 10, color: '#9ab0a2', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Live heatmap</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 5 }}>
          {heat.map((p, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 5, background: `${col(p)}${p >= 85 ? '' : '55'}`, border: `1px solid ${col(p)}` }} />)}
        </div>
      </MiniCard>
      <MiniCard style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: t.c }}><Icon name="cpu" size={14} /></span>
        <span style={{ fontSize: 11, color: '#37533f' }}>“Which zone is busiest?”</span>
      </MiniCard>
    </DeviceFrame>
  )
}

export default function Portals({ activePortal, setActivePortal, handlers }) {
  const act = activePortal ?? 0
  const active = portals[act] || portals[0]
  const t = FIFA_TRIAD[act % 3]

  return (
    <section id="portals" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg,#eef8f0 0%,#ffffff 60%,#eef8f0 100%)' }}>
      <SunWash opacity={0.8} />
      <PitchGrid opacity={0.35} />
      <div style={{ ...section('104px 40px'), position: 'relative' }}>
        <div data-reveal className="ff-reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', marginBottom: 56 }}>
          <div style={{ maxWidth: 640 }}>
            <Eyebrow>Portals</Eyebrow>
            <h2 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(40px,5.4vw,66px)', lineHeight: 1.0, letterSpacing: '-0.02em', color: '#08210f', marginTop: 18 }}>
              Built for everyone in the&nbsp;ground
            </h2>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: '#37533f', maxWidth: 340 }}>
            Fans navigate and enjoy. Staff respond and coordinate. Organizers see and decide.
          </p>
        </div>

        <div className="ff-portals-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(230px,320px) 1fr', gap: 24, alignItems: 'stretch' }}>
          {/* role rail */}
          <div data-reveal className="ff-reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {portals.map((p, i) => {
              const on = i === act
              const rt = FIFA_TRIAD[i % 3]
              return (
                <div key={p.role} onMouseEnter={() => setActivePortal(i)} onClick={() => setActivePortal(i)}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, padding: '20px 20px', borderRadius: 16, cursor: 'pointer',
                    border: `1px solid ${on ? rt.border : 'rgba(14,159,79,0.12)'}`,
                    background: on ? `linear-gradient(100deg, ${rt.soft}, rgba(255,255,255,0.6))` : '#ffffff',
                    boxShadow: on ? `0 14px 34px ${rt.glow}, inset 3px 0 0 ${rt.c}` : '0 6px 18px rgba(10,60,30,0.05)',
                    transition: 'border-color .4s, background .4s, box-shadow .4s, transform .4s', transform: on ? 'translateX(4px)' : 'none', flex: 1 }}>
                  <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: on ? '#fff' : rt.c,
                    background: on ? `linear-gradient(150deg, ${rt.c}, #0a7a3c)` : `color-mix(in srgb, ${rt.c} 10%, transparent)`, border: `1px solid ${on ? 'transparent' : rt.border}`, transition: 'all .4s' }}>
                    <Icon name={ROLE_ICON[p.role]} size={22} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 22, lineHeight: 1.05, color: on ? '#08210f' : '#6a8574', transition: 'color .4s' }}>{p.title}</div>
                    <div style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: on ? rt.c : '#9ab0a2', marginTop: 4, transition: 'color .4s' }}>{p.tag}</div>
                  </div>
                  <span style={{ color: rt.c, opacity: on ? 1 : 0, transition: 'opacity .4s', display: 'inline-flex' }}><Icon name="arrow" size={18} /></span>
                </div>
              )
            })}
          </div>

          {/* detail panel */}
          <div data-reveal className="ff-reveal ff-d-1 ff-gborder ff-portal-detail"
            style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, minHeight: 'clamp(460px,56vh,540px)',
              background: 'linear-gradient(158deg,#ffffff 0%, #f4fbf6 100%)', border: '1px solid rgba(14,159,79,0.16)',
              padding: 'clamp(30px,3vw,46px)', boxShadow: `0 30px 70px rgba(10,60,30,0.12), inset 0 0 100px ${t.glow}`, transition: 'box-shadow .6s' }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-6%', width: '54%', height: '150%', background: `radial-gradient(circle, ${t.soft}, transparent 62%)`, animation: 'ff-drift 13s ease-in-out infinite', pointerEvents: 'none', transition: 'background .6s' }} />

            <div className="ff-portal-detail-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(24px,3vw,44px)', alignItems: 'center', height: '100%' }}>
              {/* copy */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ width: 60, height: 60, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: `radial-gradient(circle at 40% 35%, ${t.soft}, rgba(255,255,255,0.6))`, border: `1px solid ${t.border}`, boxShadow: `0 8px 24px ${t.glow}`, color: t.c }}>
                  <Icon name={ROLE_ICON[active.role]} size={27} />
                </span>
                <div style={{ fontFamily: HANKEN, fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.c, marginTop: 22 }}>{active.tag}</div>
                <h3 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(30px,3.2vw,46px)', lineHeight: 1.0, letterSpacing: '-0.02em', color: '#08210f', marginTop: 8 }}>{active.title}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.55, color: '#4a6555', marginTop: 12, maxWidth: 440 }}>{active.body}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 22 }}>
                  {active.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: t.c, background: `color-mix(in srgb, ${t.c} 12%, transparent)` }}><Icon name="check" size={13} /></span>
                      <span style={{ fontSize: 14, lineHeight: 1.4, color: '#2f4a3a' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#" onClick={handlers.enterAs(active.role)} className="ff-portalcta"
                  style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: HANKEN, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#08210f' }}>
                  {active.cta}
                  <span className="ff-arrow" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', border: `1px solid ${t.border}`, color: t.c }}><Icon name="arrow" size={16} /></span>
                </a>
              </div>

              {/* live preview */}
              <div className="ff-portal-preview" style={{ animation: 'ff-float 5s ease-in-out infinite' }}>
                <PortalPreview role={active.role} t={t} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
