// Shared typography tokens + tiny style helpers reused across screens.
export const BRICOLAGE = "'Bricolage Grotesque', sans-serif"
export const HANKEN = "'Hanken Grotesk', sans-serif"

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
