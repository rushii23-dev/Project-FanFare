import Icon from '../../landing/Icons.jsx'

// Honest placeholder shown wherever real, not-yet-connected data belongs.
// `message` should describe what real data appears here and what triggers it.
export default function DataPending({ icon = 'info', title = 'Nothing here yet', message, style }) {
  return (
    <div className="ff-empty" style={style}>
      <span className="ff-empty-icon"><Icon name={icon} size={24} /></span>
      {title && <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{title}</div>}
      <p className="ff-empty-text">{message}</p>
    </div>
  )
}
