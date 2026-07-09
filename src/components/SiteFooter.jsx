import { BRICOLAGE, HANKEN } from './ui.js'
import { BrandMark } from './Nav.jsx'

const colHead = {
  fontFamily: HANKEN,
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#6c6c6c',
  marginBottom: 18,
}
const link = { fontSize: 15, color: '#9a9a9a' }

// Full landing-page footer (product/company columns).
export default function SiteFooter({ handlers }) {
  return (
    <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 40px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BrandMark size={24} dot={8} animate={false} />
              <span
                style={{
                  fontFamily: BRICOLAGE,
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: '#f4f4f4',
                }}
              >
                FanFare
              </span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: '#9a9a9a', marginTop: 18 }}>
              One platform for every matchday moment — for the fans in the stands, the people who serve them,
              and the teams who keep it all running.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 72, flexWrap: 'wrap' }}>
            <div>
              <div style={colHead}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={link}>Fan Portal</span>
                <span style={link}>Staff Portal</span>
                <span style={link}>Organizer Portal</span>
                <span style={link}>AI Concierge</span>
              </div>
            </div>
            <div>
              <div style={colHead}>Company</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="#" onClick={handlers.goAbout} style={link}>
                  About &amp; Impact
                </a>
                <span style={link}>Accessibility</span>
                <span style={link}>Sustainability</span>
                <span style={link}>Contact</span>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.10)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, letterSpacing: '0.01em', color: '#6c6c6c' }}>
            FanFare is an independent concept platform. Not affiliated with any official tournament, federation
            or governing body.
          </span>
          <span style={{ fontSize: 12, color: '#6c6c6c' }}>© 2026 FanFare</span>
        </div>
      </div>
    </footer>
  )
}
