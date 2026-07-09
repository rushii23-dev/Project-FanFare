// Tiny SVG sparkline for trend data. Used in analytics, zone alerts, gate details.
export default function Sparkline({ data = [], color = '#2aa5e0', width = 80, height = 28 }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Glow dot on last point */}
      {data.length > 0 && (() => {
        const lastX = width
        const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2
        return <circle cx={lastX} cy={lastY} r="3" fill={color} opacity="0.8" />
      })()}
    </svg>
  )
}
