// Monoline icon set — mature, single-stroke, inherits `color` via currentColor.
// Replaces emoji across the marketing pages.
const P = {
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.2a2 2 0 0 0 0 3.6V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.2a2 2 0 0 0 0-3.6V8Z" />
      <path d="M14 6.5v11" strokeDasharray="1.6 2.4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4.2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z" />
    </>
  ),
  chat: <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3.5V16H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  cycle: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
      <path d="M20 3.6V8h-4.4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
      <path d="M4 20.4V16h4.4" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 16.5h4" />
    </>
  ),
  access: (
    <>
      <circle cx="12" cy="4.8" r="1.9" />
      <path d="M5 9h14" />
      <path d="M12 9v6" />
      <path d="M12 15l-3 5M12 15l3 5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" />
      <path d="M9 15c2.6-2.6 5.4-3.8 8-5" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M4.6 4.6l4.3 4.3M19.4 4.6l-4.3 4.3M4.6 19.4l4.3-4.3M19.4 19.4l-4.3-4.3" />
    </>
  ),
  // ---- dashboard glyphs ----
  home: (
    <>
      <path d="M4 11.4 12 4l8 7.4" />
      <path d="M6 10.4V20h12v-9.6" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3.6 6.2v13.4L9 17.4l6 2.4 5.4-2.2V4.2L15 6.4 9 4Z" />
      <path d="M9 4v13.4M15 6.4v13.4" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="4" width="16" height="13" rx="2.6" />
      <path d="M4 12h16" />
      <path d="M7 17v2.4M17 17v2.4" />
      <path d="M8 14.6h.01M16 14.6h.01" />
    </>
  ),
  bell: (
    <>
      <path d="M6.2 9.5a5.8 5.8 0 0 1 11.6 0c0 4.6 1.9 5.7 1.9 5.7H4.3s1.9-1.1 1.9-5.7Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c0-3.7 3.1-6 7-6s7 2.3 7 6" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2.4" />
      <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M8.5 11.5h7M8.5 15.5h5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 21 19.5H3L12 4Z" />
      <path d="M12 10.5v4" />
      <path d="M12 17.3h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M3.6 12h16.8" />
      <path d="M12 3.6c2.4 2.3 3.7 5.3 3.7 8.4S14.4 18.1 12 20.4C9.6 18.1 8.3 15.1 8.3 12S9.6 5.9 12 3.6Z" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 16.5V12M12 16.5V8M16 16.5v-3" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2.2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 6V3.6M15 6V3.6M9 20.4V18M15 20.4V18M6 9H3.6M6 15H3.6M20.4 9H18M20.4 15H18" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.6 19c0-3 2.5-5 5.4-5s5.4 2 5.4 5" />
      <path d="M16 6.3a3 3 0 0 1 0 5.4" />
      <path d="M17 14.3c2.2.5 3.9 2.3 3.9 4.7" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.6M12 17.9v2.6M4.6 8.2l2.2 1.3M17.2 14.5l2.2 1.3M19.4 8.2l-2.2 1.3M6.8 14.5l-2.2 1.3" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
      <path d="M17 8.2 20.8 12 17 15.8" />
      <path d="M20.5 12H10" />
    </>
  ),
  swap: (
    <>
      <path d="M4 9h12" />
      <path d="M13 6l3 3-3 3" />
      <path d="M20 15H8" />
      <path d="M11 18l-3-3 3-3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.4" />
      <path d="m20 20-3.7-3.7" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v3.4" />
    </>
  ),
  send: (
    <>
      <path d="M20.5 3.5 3.8 10.8l6.6 2.3 2.3 6.6 7.8-16.2Z" />
      <path d="M20.5 3.5 10.4 13.1" />
    </>
  ),
  check: <path d="M5 12.5 10 17.5 19.5 7" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2.4M12 18.6V21M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M3 12h2.4M18.6 12H21M4.4 19.6 6.1 17.9M17.9 6.1 19.6 4.4" />
    </>
  ),
  cloud: <path d="M7 18h9.6a3.5 3.5 0 0 0 .4-6.98 5 5 0 0 0-9.6-1.2A3.9 3.9 0 0 0 7 18Z" />,
  wind: (
    <>
      <path d="M4 9h9a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M4 13h13a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M4 17h6" />
    </>
  ),
  drop: <path d="M12 4c3 4 5 6.6 5 9a5 5 0 0 1-10 0c0-2.4 2-5 5-9Z" />,
  gauge: (
    <>
      <path d="M4 15.5a8 8 0 0 1 16 0" />
      <path d="M12 15.5 16 11.8" />
      <path d="M12 15.5h.01" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.2" />
      <path d="M4 9.5h16M8.5 3v4M15.5 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4V12l3 2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 11v5" />
      <path d="M12 7.9h.01" />
    </>
  ),
  star: <path d="M12 4l2.3 4.9 5.2.5-4 3.5 1.2 5.1L12 20.5 7.3 18.5l1.2-5.1-4-3.5 5.2-.5Z" />,
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h6.5a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" />
    </>
  ),
  zap: <path d="M13 3 5 13.2h6l-1 7.8 8-10.2h-6L13 3Z" />,
  food: (
    <>
      <path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11" />
      <path d="M16 3c-1.4 0-2.4 2-2.4 4.4S15 12 16 12v9" />
    </>
  ),
  seat: (
    <>
      <path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
      <path d="M5 10h14a1 1 0 0 1 1 1v4H4v-4a1 1 0 0 1 1-1Z" />
      <path d="M7 15v3M17 15v3" />
    </>
  ),
  pause: (
    <>
      <rect x="7" y="5" width="3.4" height="14" rx="1" />
      <rect x="13.6" y="5" width="3.4" height="14" rx="1" />
    </>
  ),
}

export default function Icon({ name, size = 24, stroke = 1.6, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden
    >
      {P[name] || null}
    </svg>
  )
}
