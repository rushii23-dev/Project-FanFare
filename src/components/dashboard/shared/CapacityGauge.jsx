// Capacity gauge bar. Used in Staff zone alerts and Organizer heatmap.
export default function CapacityGauge({ current, capacity, color = 'var(--ff-accent)', showLabel = true }) {
  const pct = capacity > 0 ? Math.round((current / capacity) * 100) : 0
  const warn = pct >= 85
  // --c-amber (#915700) not #c8890a: the % label is 12px text and the bright
  // amber is only 3.0:1 on white (axe-verified failure).
  const fill = warn ? 'var(--c-red)' : pct >= 65 ? 'var(--c-amber)' : color

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
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
