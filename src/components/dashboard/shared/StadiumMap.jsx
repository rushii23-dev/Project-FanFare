import { useState } from 'react'

// Schematic SVG stadium map. Used by Fan (map + seat finder), Staff (zone view),
// and Organizer (heatmap). Accepts zone data for coloring by density.
export default function StadiumMap({
  zones = [],
  gates = [],
  highlightZone = null,
  highlightGate = null,
  onZoneClick,
  onGateClick,
  accent = '#2aa5e0',
  mode = 'default', // 'default' | 'heatmap'
}) {
  const [hoveredZone, setHoveredZone] = useState(null)

  // Zone positions on the schematic (rough stadium layout: oval with 6 zones)
  const zoneLayout = [
    { id: 'A', label: 'North Stand', path: 'M 120 30 Q 200 10 280 30 L 270 80 Q 200 65 130 80 Z', cx: 200, cy: 50 },
    { id: 'B', path: 'M 280 30 Q 350 60 370 130 L 320 140 Q 305 80 270 55 Z', label: 'East Stand', cx: 330, cy: 85 },
    { id: 'C', label: 'South Stand', path: 'M 370 130 Q 350 210 280 240 L 270 190 Q 305 180 320 130 Z', cx: 330, cy: 185 },
    { id: 'D', label: 'West Stand', path: 'M 120 240 Q 50 210 30 130 L 80 120 Q 95 180 130 200 Z', cx: 70, cy: 185 },
    { id: 'E', label: 'NW Corner', path: 'M 120 30 L 130 80 Q 95 90 80 120 L 30 130 Q 50 60 120 30 Z', cx: 70, cy: 75 },
    { id: 'F', label: 'SE Corner', path: 'M 280 240 Q 350 210 370 130 L 320 140 Q 320 180 280 195 Z', cx: 330, cy: 195 },
  ]

  // Gate pins around the perimeter
  const gatePositions = {
    'A': { x: 145, y: 28 }, 'B': { x: 255, y: 28 },
    'C': { x: 330, y: 190 }, 'C-2': { x: 350, y: 160 },
    'D': { x: 55, y: 190 }, 'E': { x: 310, y: 60 },
    'F': { x: 55, y: 100 }, 'G': { x: 310, y: 220 },
  }

  function zoneFill(zoneId) {
    const z = zones.find(z => z.id === zoneId)
    if (!z) return 'rgba(255,255,255,0.04)'
    const pct = z.current / z.capacity
    if (mode === 'heatmap') {
      if (pct >= 0.85) return 'rgba(226,58,69,0.35)'
      if (pct >= 0.65) return 'rgba(255,165,0,0.25)'
      return 'rgba(47,162,78,0.2)'
    }
    const isHighlighted = highlightZone === zoneId || hoveredZone === zoneId
    return isHighlighted ? `${accent}22` : 'rgba(255,255,255,0.04)'
  }

  function zoneStroke(zoneId) {
    const z = zones.find(z => z.id === zoneId)
    if (!z) return 'rgba(255,255,255,0.12)'
    const pct = z.current / z.capacity
    if (mode === 'heatmap') {
      if (pct >= 0.85) return '#e23a45'
      if (pct >= 0.65) return '#ffa500'
      return '#2fa24e'
    }
    return highlightZone === zoneId || hoveredZone === zoneId
      ? accent : 'rgba(255,255,255,0.15)'
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 400 270" style={{ width: '100%', maxWidth: 500 }}>
        {/* Pitch */}
        <rect x="140" y="90" width="120" height="80" rx="4"
          fill="rgba(47,162,78,0.08)" stroke="rgba(47,162,78,0.25)" strokeWidth="1" />
        <line x1="200" y1="90" x2="200" y2="170" stroke="rgba(47,162,78,0.2)" strokeWidth="0.5" />
        <circle cx="200" cy="130" r="20" fill="none" stroke="rgba(47,162,78,0.2)" strokeWidth="0.5" />

        {/* Zones */}
        {zoneLayout.map(zl => {
          const zoneData = zones.find(z => z.id === zl.id)
          const pct = zoneData ? Math.round((zoneData.current / zoneData.capacity) * 100) : 0
          return (
            <g key={zl.id}
              onMouseEnter={() => setHoveredZone(zl.id)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onZoneClick?.(zl.id)}
              style={{ cursor: onZoneClick ? 'pointer' : 'default' }}
            >
              <path
                d={zl.path}
                fill={zoneFill(zl.id)}
                stroke={zoneStroke(zl.id)}
                strokeWidth="1.5"
                style={{ transition: 'fill 0.3s, stroke 0.3s' }}
              />
              <text x={zl.cx} y={zl.cy - 4} textAnchor="middle" fill="#9a9a9a" fontSize="9"
                fontFamily="Hanken Grotesk, sans-serif" fontWeight="600">
                {zl.id}
              </text>
              {mode === 'heatmap' && (
                <text x={zl.cx} y={zl.cy + 10} textAnchor="middle" fill="#cfcfcf" fontSize="10"
                  fontFamily="Hanken Grotesk, sans-serif" fontWeight="700">
                  {pct}%
                </text>
              )}
            </g>
          )
        })}

        {/* Gate pins */}
        {gates.map(g => {
          const pos = gatePositions[g.id]
          if (!pos) return null
          const isHigh = highlightGate === g.id
          const warn = g.density >= 85
          const pinColor = warn ? '#e23a45' : g.density >= 65 ? '#ffa500' : accent
          return (
            <g key={g.id} onClick={() => onGateClick?.(g.id)}
              style={{ cursor: onGateClick ? 'pointer' : 'default' }}>
              <circle cx={pos.x} cy={pos.y} r={isHigh ? 10 : 7}
                fill={isHigh ? pinColor : `${pinColor}44`}
                stroke={pinColor} strokeWidth="1.5"
                style={{ transition: 'r 0.2s' }} />
              <text x={pos.x} y={pos.y + 3.5} textAnchor="middle"
                fill="#fff" fontSize="7" fontWeight="700"
                fontFamily="Hanken Grotesk, sans-serif">
                {g.id}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
