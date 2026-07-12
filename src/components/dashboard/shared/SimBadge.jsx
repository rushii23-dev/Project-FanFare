import { HANKEN } from '../../ui.js'

// Every screen that reads from the simulator wears this. Crowd numbers on
// this build are modelled, not measured — saying so plainly is the whole point.
export default function SimBadge({ label = 'Simulated feed' }) {
  return (
    <span
      title="Venue telemetry on this build is simulated. Real sensor data is not fabricated anywhere in FanFare."
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: HANKEN, fontWeight: 700, fontSize: 11,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '5px 10px', borderRadius: 999,
        color: '#b26a00',
        background: 'rgba(178,106,0,0.10)',
        border: '1px solid rgba(178,106,0,0.30)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: '#b26a00', flexShrink: 0 }} />
      {label}
    </span>
  )
}
