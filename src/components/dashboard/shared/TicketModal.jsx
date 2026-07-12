import { useEffect, useRef } from 'react'

// QR-code e-ticket modal. Ticket details are the fan's own; the fixture and
// venue come from the live FIFA World Cup 2026 feed via `useVenue()` — never a
// hardcoded match.
export default function TicketModal({ ticket, venue, onClose }) {
  const dialogRef = useRef(null)

  // Real modal keyboard semantics: focus moves into the dialog on open and
  // Escape dismisses it — parity with the mouse-only backdrop click.
  useEffect(() => {
    if (!ticket) return
    dialogRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ticket, onClose])

  if (!ticket) return null

  return (
    // Backdrop click closes only when the backdrop itself is the target, so
    // clicks inside the dialog never dismiss it — no stopPropagation needed.
    <div
      className="ff-modal-overlay"
      role="presentation"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="ff-modal" role="dialog" aria-modal="true" aria-label="E-Ticket" ref={dialogRef} tabIndex={-1}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 16,
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

          <div style={{ fontSize: 11, color: 'var(--faint)', fontFamily: 'monospace', marginBottom: 20 }}>
            {ticket.ticketId}
          </div>

          <div style={{
            height: 1, background: 'var(--line-strong)', margin: '0 -36px 20px',
            borderTop: '1px dashed var(--line-xstrong)',
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left' }}>
            <Detail label="Match" value={venue?.homeCode && venue?.awayCode ? `${venue.homeCode} vs ${venue.awayCode}` : '—'} />
            <Detail label="Round" value={venue?.round || '—'} />
            <Detail label="Venue" value={venue?.venue || 'Resolving…'} />
            <Detail label="Gate" value={`Gate ${ticket.gate}`} />
            <Detail label="Section" value={`Sec ${ticket.section}`} />
            <Detail label="Seat" value={`Row ${ticket.row} · Seat ${ticket.seat}`} />
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: 24, width: '100%', padding: '13px', borderRadius: 32,
              border: '1px solid var(--line-xstrong)', background: 'transparent',
              color: 'var(--text)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
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
      <div style={{ fontSize: 10, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{value}</div>
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
