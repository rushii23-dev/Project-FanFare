import { useState } from 'react'

// Schematic stadium bowl. Seating ring is split into sectors coloured by
// crowd density; the pitch sits in the middle with gate pins around the rim.
// Used by Fan (map), Staff (zones) and Organizer (heatmap).
const CX = 210, CY = 150
const R_OUT = [196, 136]   // outer ellipse [rx, ry]
const R_MID = [150, 104]   // tier divider
const R_IN = [98, 68]      // pitch boundary

function pt(rx, ry, a) { return [CX + rx * Math.cos(a), CY + ry * Math.sin(a)] }
function arc(rx, ry, a0, a1, n = 10) {
  const out = []
  for (let i = 0; i <= n; i++) out.push(pt(rx, ry, a0 + (a1 - a0) * (i / n)))
  return out
}
function sectorPath(a0, a1) {
  const outer = arc(R_OUT[0], R_OUT[1], a0, a1)
  const inner = arc(R_IN[0], R_IN[1], a1, a0)
  const d = ['M', ...outer.map((p, i) => `${i ? 'L' : ''}${p[0].toFixed(1)},${p[1].toFixed(1)}`),
    ...inner.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`), 'Z']
  return d.join(' ')
}

function heatColor(pct) {
  if (pct >= 85) return { fill: 'rgba(228,0,43,0.32)', stroke: '#e4002b' }
  if (pct >= 65) return { fill: 'rgba(245,179,1,0.3)', stroke: '#c8890a' }
  return { fill: 'rgba(14,159,79,0.24)', stroke: '#0e9f4f' }
}

export default function StadiumMap({
  zones = [], gates = [], highlightZone = null, highlightGate = null,
  onZoneClick, onGateClick, accent = '#0e9f4f', mode = 'default',
}) {
  const [hover, setHover] = useState(null)
  const list = zones.length ? zones : Array.from({ length: 6 }, (_, i) => ({ id: String.fromCharCode(65 + i), current: 0, capacity: 1 }))
  const N = list.length
  const start = -Math.PI / 2 - Math.PI / N

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox="0 0 420 300" style={{ width: '100%', display: 'block' }}>
        <defs>
          <radialGradient id="ffpitch" cx="50%" cy="50%" r="70%">
            <stop offset="0" stopColor="#1fb85c" />
            <stop offset="100%" stopColor="#0a7a3c" />
          </radialGradient>
        </defs>

        {/* sectors */}
        {list.map((z, i) => {
          const a0 = start + (i / N) * Math.PI * 2
          const a1 = start + ((i + 1) / N) * Math.PI * 2
          const pct = Math.round((z.current / (z.capacity || 1)) * 100)
          const hot = heatColor(pct)
          const on = highlightZone === z.id || hover === z.id
          let fill, stroke
          if (mode === 'heatmap') { fill = hot.fill; stroke = hot.stroke }
          else { fill = on ? `color-mix(in srgb, ${accent} 24%, transparent)` : 'var(--fill-2)'; stroke = on ? accent : 'var(--line-strong)' }
          const mid = pt((R_OUT[0] + R_IN[0]) / 2, (R_OUT[1] + R_IN[1]) / 2, (a0 + a1) / 2)
          return (
            <g key={z.id}
              onMouseEnter={() => setHover(z.id)} onMouseLeave={() => setHover(null)}
              onClick={() => onZoneClick?.(z.id)} style={{ cursor: onZoneClick ? 'pointer' : 'default' }}>
              <path d={sectorPath(a0, a1)} fill={fill} stroke={stroke} strokeWidth="1.5"
                style={{ transition: 'fill .3s, stroke .3s' }}>
                {mode === 'heatmap' && pct >= 85 && (
                  <animate attributeName="opacity" values="1;0.6;1" dur="1.6s" repeatCount="indefinite" />
                )}
              </path>
              <text x={mid[0]} y={mid[1] - 2} textAnchor="middle" fill="var(--text-2)" fontSize="11"
                fontFamily="Bricolage Grotesque, sans-serif" fontWeight="700">{z.id}</text>
              {mode === 'heatmap' && (
                <text x={mid[0]} y={mid[1] + 11} textAnchor="middle" fill={hot.stroke} fontSize="10"
                  fontFamily="Hanken Grotesk, sans-serif" fontWeight="700">{pct}%</text>
              )}
            </g>
          )
        })}

        {/* tier divider */}
        <ellipse cx={CX} cy={CY} rx={R_MID[0]} ry={R_MID[1]} fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />

        {/* pitch */}
        <ellipse cx={CX} cy={CY} rx={R_IN[0]} ry={R_IN[1]} fill="url(#ffpitch)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
        <line x1={CX} y1={CY - R_IN[1]} x2={CX} y2={CY + R_IN[1]} stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r="20" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r="2.5" fill="rgba(255,255,255,0.7)" />

        {/* gate pins around the rim */}
        {gates.map((g, i) => {
          const a = start + ((i + 0.5) / Math.max(gates.length, 1)) * Math.PI * 2
          const [x, y] = pt(R_OUT[0] + 8, R_OUT[1] + 8, a)
          const isHigh = highlightGate === g.id
          const c = g.density >= 85 ? '#e4002b' : g.density >= 65 ? '#c8890a' : accent
          return (
            <g key={g.id} onClick={() => onGateClick?.(g.id)} style={{ cursor: onGateClick ? 'pointer' : 'default' }}>
              <circle cx={x} cy={y} r={isHigh ? 11 : 8} fill={isHigh ? c : '#fff'} stroke={c} strokeWidth="2"
                style={{ transition: 'r .2s' }} />
              <text x={x} y={y + 3.5} textAnchor="middle" fill={isHigh ? '#fff' : c} fontSize="8" fontWeight="700"
                fontFamily="Hanken Grotesk, sans-serif">{g.id}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
