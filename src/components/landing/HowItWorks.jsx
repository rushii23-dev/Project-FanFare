import { BRICOLAGE, HANKEN, section, FIFA_TRIAD } from '../ui.js'
import { Eyebrow, SunWash, PitchGrid } from './Fx.jsx'
import { steps } from '../../data.js'

export default function HowItWorks() {
  return (
    <section
      id="how"
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg,#ffffff 0%,#e9f6ee 46%,#ffffff 100%)',
      }}
    >
      <SunWash opacity={0.9} />
      <PitchGrid opacity={0.4} />
      {/* soft central glow for depth */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: '80%', height: '70%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(126,217,87,0.12), transparent 62%)',
      }} />

      <div style={{ ...section('128px 40px 104px'), position: 'relative' }}>
        <div data-reveal className="ff-reveal" style={{ maxWidth: 780, marginBottom: 80 }}>
          <Eyebrow>How it works</Eyebrow>
          <h2
            style={{
              fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 'clamp(40px,5.4vw,66px)',
              lineHeight: 1.0, letterSpacing: '-0.02em', color: '#08210f', marginTop: 18,
            }}
          >
            Three roles.<br />One shared source of&nbsp;truth.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: '#37533f', marginTop: 20, maxWidth: 520 }}>
            Everyone sees exactly what they need — nothing more. The stadium keeps itself honest,
            second by second.
          </p>
        </div>

        {/* timeline: connector line behind numbered nodes */}
        <div style={{ position: 'relative' }}>
          <div className="ff-how-line" style={{
            position: 'absolute', top: 30, left: '16.6%', right: '16.6%', height: 3, borderRadius: 3,
            background: 'linear-gradient(90deg,#0e9f4f,#7ed957,#f5b301,#e4002b)',
            backgroundSize: '220% 100%', animation: 'ff-grad-pan 7s linear infinite', opacity: 0.75,
          }} />

          <div className="ff-how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {steps.map((s, i) => {
              const t = FIFA_TRIAD[i % 3]
              return (
                <div
                  key={s.num}
                  data-reveal
                  className={`ff-reveal ${s.dly}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {/* numbered node sitting on the line */}
                  <span style={{
                    position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center',
                    justifyContent: 'center', width: 62, height: 62, borderRadius: '50%',
                    fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 24, color: '#ffffff',
                    background: `linear-gradient(150deg, ${t.c}, #0a7a3c)`,
                    border: '3px solid #ffffff',
                    boxShadow: `0 8px 22px ${t.glow}, 0 0 0 3px ${t.soft}`,
                    marginBottom: 26, animation: 'ff-float 4.4s ease-in-out infinite',
                  }}>
                    {s.num}
                    <span style={{
                      position: 'absolute', inset: -3, borderRadius: '50%',
                      border: `2px solid ${t.border}`, opacity: 0.6,
                    }} />
                  </span>

                  <div
                    className="ff-fcard ff-gborder"
                    style={{
                      position: 'relative', overflow: 'hidden', width: '100%', borderRadius: 20,
                      background: '#ffffff', border: '1px solid rgba(14,159,79,0.14)',
                      padding: '34px 30px 36px', minHeight: 240,
                      boxShadow: '0 18px 46px rgba(10,60,30,0.08)',
                      '--acc': t.border, '--acc-glow': t.glow,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '-40%', right: '-20%', width: '80%', height: '90%',
                      background: `radial-gradient(circle, ${t.soft}, transparent 66%)`, pointerEvents: 'none',
                    }} />
                    <span style={{
                      position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontFamily: HANKEN, fontWeight: 700, fontSize: 12, letterSpacing: '0.18em',
                      textTransform: 'uppercase', color: t.c,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.c, boxShadow: `0 0 10px ${t.c}` }} />
                      Step {s.num}
                    </span>
                    <h3 style={{
                      position: 'relative', fontFamily: BRICOLAGE, fontWeight: 500, fontSize: 26,
                      lineHeight: 1.1, letterSpacing: '-0.01em', color: '#08210f', marginTop: 16,
                    }}>
                      {s.title}
                    </h3>
                    <p style={{ position: 'relative', fontSize: 15, lineHeight: 1.55, color: '#4a6555', marginTop: 12 }}>
                      {s.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
