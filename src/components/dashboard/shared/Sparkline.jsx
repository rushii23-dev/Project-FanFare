// SVG sparkline with animated draw-in + soft area fill. Used across dashboards.
export default function Sparkline({ data = [], color = 'var(--ff-accent)', width = 96, height = 32, fill = true }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 6) - 3
    return [x, y]
  })
  const line = pts.map(p => `${p[0]},${p[1]}`).join(' ')
  const area = `${pts[0][0]},${height} ${line} ${pts[pts.length - 1][0]},${height}`
  const last = pts[pts.length - 1]
  const gid = `spk-${Math.random().toString(36).slice(2, 7)}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <polygon points={area} fill={`url(#${gid})`} />}
      <polyline
        className="ff-spark-path" points={line} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ '--len': width * 2 }}
      />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="3" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="3">
        <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
