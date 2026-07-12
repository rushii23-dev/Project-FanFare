// Shared typography tokens + tiny style helpers reused across screens.
export const BRICOLAGE = "'Bricolage Grotesque', sans-serif"
export const HANKEN = "'Hanken Grotesk', sans-serif"

// ===== FIFA World Cup 26 "Trionda" — BRIGHT daylight palette (mirrors index.css) =====
export const FIFA = {
  paper: '#ffffff',
  mist: '#eef8f0',
  mist2: '#e3f2e6',
  ink: '#08210f',
  ink2: '#37533f',
  ink3: '#6a8574',
  pitch: '#0e9f4f',      // primary grass green
  pitchDeep: '#0a7a3c',
  lime: '#7ed957',
  gold: '#f5b301',       // stadium-light gold
  amber: '#ff8a1e',
  red: '#e4002b',        // host red accent
  blue: '#1aa5e0',       // host blue (used sparingly)
}
// Signature gradients.
export const TRIONDA = 'linear-gradient(100deg, #0e9f4f 0%, #f5b301 52%, #e4002b 100%)'
export const PITCHGRAD = 'linear-gradient(100deg, #0a7a3c 0%, #0e9f4f 34%, #7ed957 66%, #f5b301 100%)'
export const TRIONDA_TEXT = 'linear-gradient(100deg,#0a7a3c 0%,#0e9f4f 26%,#f5b301 55%,#e4002b 80%,#0a7a3c 100%)'

// Per-role accent triad {color, soft, border, glow} — green / gold / red.
export const FIFA_TRIAD = [
  { c: FIFA.pitch, soft: 'rgba(14,159,79,0.12)', border: 'rgba(14,159,79,0.4)', glow: 'rgba(14,159,79,0.22)' },
  { c: FIFA.gold, soft: 'rgba(245,179,1,0.14)', border: 'rgba(245,179,1,0.45)', glow: 'rgba(245,179,1,0.28)' },
  { c: FIFA.red, soft: 'rgba(228,0,43,0.1)', border: 'rgba(228,0,43,0.4)', glow: 'rgba(228,0,43,0.2)' },
]

// Section container (max-width + horizontal padding).
export const section = (padding) => ({
  maxWidth: 1200,
  margin: '0 auto',
  padding,
})

// Small uppercase eyebrow label.
export const eyebrow = {
  fontFamily: HANKEN,
  fontWeight: 600,
  fontSize: 13,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#ffffff',
}

// Primary white pill CTA.
export const ctaWhite = {
  fontFamily: HANKEN,
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#000000',
  background: '#ffffff',
  borderRadius: 32,
}

// Outlined pill button.
export const ctaOutline = {
  fontFamily: HANKEN,
  fontWeight: 500,
  fontSize: 15,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#f4f4f4',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: 32,
}
