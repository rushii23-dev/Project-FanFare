// Capacity gauge bar. Used in Staff zone alerts and Organizer heatmap.
export default function CapacityGauge({ current, capacity, color = '#2aa5e0', showLabel = true }) {
  const pct = capacity > 0 ? Math.round((current / capacity) * 100) : 0
  const warn = pct >= 85
  const fill = warn ? '#e23a45' : pct >= 65 ? '#ffa500' : color

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#9a9a9a' }}>
            {current.toLocaleString()} / {capacity.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: fill }}>{pct}%</span>
        </div>
      )}
      <div className="ff-gauge-track">
        <div
          className="ff-gauge-fill"
          style={{ width: `${Math.min(pct, 100)}%`, background: fill }}
        />
      </div>
    </div>
  )
}
