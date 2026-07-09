// QR-code e-ticket modal. Shows a generated SVG QR pattern + ticket details.
export default function TicketModal({ ticket, matchData, onClose }) {
  if (!ticket || !matchData) return null

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div className="ff-modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="E-Ticket">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#6c6c6c', marginBottom: 16,
          }}>
            E-Ticket
          </div>

          {/* QR Code (decorative SVG pattern) */}
          <div style={{
            width: 180, height: 180, margin: '0 auto 20px',
            background: '#ffffff', borderRadius: 12, padding: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <QRPattern />
          </div>

          <div style={{ fontSize: 11, color: '#6c6c6c', fontFamily: 'monospace', marginBottom: 20 }}>
            {ticket.ticketId}
          </div>

          <div style={{
            height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 -36px 20px',
            borderTop: '1px dashed rgba(255,255,255,0.15)',
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left' }}>
            <Detail label="Match" value={`${matchData.homeCode} vs ${matchData.awayCode}`} />
            <Detail label="Round" value={matchData.round} />
            <Detail label="Venue" value={matchData.venue} />
            <Detail label="Gate" value={`Gate ${ticket.gate}`} />
            <Detail label="Section" value={`Sec ${ticket.section}`} />
            <Detail label="Seat" value={`Row ${ticket.row} · Seat ${ticket.seat}`} />
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: 24, width: '100%', padding: '13px', borderRadius: 32,
              border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
              color: '#f4f4f4', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#6c6c6c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#f4f4f4', fontWeight: 500 }}>{value}</div>
    </div>
  )
}

// Decorative QR-like pattern (not a real QR code, but visually reads as one)
function QRPattern() {
  const size = 148
  const cells = 21
  const cellSize = size / cells
  // Deterministic pseudo-random pattern seeded from a fixed string
  const seed = 'FANFARE2026TICKET'
  const rects = []
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Corner finder patterns (3 corners)
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6 ||
          (r < 7 && c >= cells - 7 && (c === cells - 7 || c === cells - 1)) ||
          (r >= cells - 7 && c < 7 && (r === cells - 7 || r === cells - 1))
        const isInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3) ||
          (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4)
        if (isOuter || isInner) {
          rects.push(
            <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize}
              width={cellSize} height={cellSize} fill="#000" />
          )
        }
        continue
      }
      // Data area: pseudo-random fill
      const hash = (seed.charCodeAt((r * cells + c) % seed.length) * 31 + r * 7 + c * 13) % 100
      if (hash < 42) {
        rects.push(
          <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize}
            width={cellSize} height={cellSize} fill="#000" />
        )
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rects}
    </svg>
  )
}
