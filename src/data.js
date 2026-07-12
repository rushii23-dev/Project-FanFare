// ============================================================
// FanFare — content & design tokens + shared portal dataset
// Ported verbatim from the renderVals() model in FanFare.dc.html
// Extended with the shared mock dataset for all three dashboards
// ============================================================

// TRIONDA host-nation palette (2026 World Cup — 3 host nations)
export const C = { blue: '#2aa5e0', green: '#2fa24e', red: '#e23a45' }

export const triad = [C.blue, C.green, C.red]
export const triadSoft = ['rgba(42,165,224,0.16)', 'rgba(47,162,78,0.16)', 'rgba(226,58,69,0.16)']
export const triadBorder = ['rgba(42,165,224,0.34)', 'rgba(47,162,78,0.34)', 'rgba(226,58,69,0.34)']
export const triadGhost = ['rgba(42,165,224,0.09)', 'rgba(47,162,78,0.09)', 'rgba(226,58,69,0.09)']

// Role → accent color mapping. WCAG-AA as text on white (fan 5.2:1,
// staff 5.9:1, organizer 4.9:1), verified with axe — don't brighten
// these without re-checking contrast.
export const roleAccent = { fan: '#0a7d3e', staff: '#915700', organizer: '#e4002b' }

// The venue is NOT hardcoded. It is resolved at runtime from the real FIFA
// World Cup 2026 feed via `useVenue()` in src/lib/venue.js — whichever stadium
// the live/next match is actually at. There is deliberately no fallback
// stadium: a confidently-displayed wrong venue is worse than "resolving…".
//
// Kept only as a map centring hint for the brief moment before the real venue
// geocodes — never shown as a venue name, never fed to the AI.
export const US_MAP_CENTER = { lat: 39.5, lon: -98.35 }

// ---- Scoreboard trust strip (animated count-up) ----
export const scoreboard = [
  { num: 104, suffix: '', label: 'Matches' },
  { num: 48, suffix: '', label: 'Teams' },
  { num: 16, suffix: '', label: 'Host cities' },
  { num: 3, suffix: '', label: 'Host nations' },
  { num: 39, suffix: '', label: 'Days' },
]

// ---- How it works ----
export const steps = [
  {
    num: '01', dly: 'ff-d-1', title: 'Everyone signs in as themselves',
    body: 'Fans, volunteers, staff and organizers each get a portal shaped around what they actually need to do that day.',
  },
  {
    num: '02', dly: 'ff-d-2', title: 'The stadium reports itself',
    body: 'Gate flow, crowd density, transport and incidents stream into one shared picture — updated by the second, not by the hour.',
  },
  {
    num: '03', dly: 'ff-d-3', title: 'Intelligence closes the loop',
    body: 'Fans get nudged around congestion, volunteers get the right task, organizers get a recommendation before the queue forms.',
  },
].map((s, i) => ({ ...s, accent: triad[i % 3], ghost: triadGhost[i % 3] }))

// ---- Portals (role selector). role derived from title. ----
export const portals = [
  {
    role: 'fan', glyph: '🎟️', idx: '01', tag: 'For fans', title: 'Fan Portal', cta: 'Enter as a fan',
    body: 'Everything for the perfect matchday — from your seat to the final whistle.',
    features: [
      'Multilingual AI concierge for gates, food & policies',
      'Live map, seat finder & calmer-route suggestions',
      'Accessibility hub with one-tap volunteer help',
      'Transport planner & waste-sorting rewards',
    ],
  },
  {
    role: 'staff', glyph: '🦺', idx: '02', tag: 'For volunteers & staff', title: 'Staff Portal', cta: 'Enter as staff',
    body: 'Coordinate, respond and communicate — even across a language barrier.',
    features: [
      'Task dashboard with zone & shift schedule',
      'Voice-to-report incident logging & routing',
      'Real-time two-way live translation',
      'Crowd alerts as your zone nears capacity',
    ],
  },
  {
    role: 'organizer', glyph: '🧭', idx: '03', tag: 'For organizers', title: 'Organizer Portal', cta: 'Enter as organizer',
    body: 'A living command center for the whole venue, and the calls that shape the night.',
    features: [
      'Live crowd heatmap & gate wait-times',
      'Natural-language co-pilot & what-if sims',
      'Auto-briefings turned into recommended actions',
      'AI-triaged incident queue & assignment',
    ],
  },
]

// ---- Quiet-intelligence strip ----
export const aiFeatures = [
  { glyph: '💬', title: 'Ask in any language', body: 'Grounded in venue FAQ, so answers stay true.' },
  { glyph: '🗺️', title: 'Reads the crowd', body: 'Suggests the calmer gate before it clogs.' },
  { glyph: '♻️', title: 'Sees your waste', body: 'Point your camera; it sorts the bin for you.' },
  { glyph: '📝', title: 'Drafts the report', body: 'A few spoken words become a routed incident.' },
]

// ---- Kinetic marquee (doubled for seamless loop) ----
const mWords = ['Every goal', 'Every gate', 'Every fan', 'Every language', 'Every city', 'Every second']
const marqueeSeq = mWords.map((word, i) => ({ word, cls: i % 2 === 0 ? 'ff-mq' : 'ff-mq-out' }))
export const marqueeLoop = marqueeSeq.concat(marqueeSeq)

// ---- About / Impact ----
export const problems = [
  { text: 'Fans arrive in a country they don\u2019t speak, facing signage and policies they can\u2019t read.', accent: '#2aa5e0' },
  { text: 'Gates and concourses surge unpredictably \u2014 congestion becomes a safety risk before anyone reacts.', accent: '#2fa24e' },
  { text: 'Accessibility needs are handled ad-hoc, so the people who need the most support often get the least.', accent: '#e23a45' },
  { text: 'A stadium of this size generates enormous waste, and organizers fly blind until it\u2019s too late to act.', accent: '#2aa5e0' },
]

// Fabricated impact metrics removed \u2014 no unverified numbers on the site.
export const stats = []

export const commitments = [
  { glyph: '♿', accent: '#2aa5e0', title: 'Accessibility, by default', body: 'Set your needs once \u2014 wheelchair access, sensory-sensitive routes, large-text and audio content \u2014 and every screen adapts. Help is one tap away.' },
  { glyph: '🌱', accent: '#2fa24e', title: 'A lighter footprint', body: 'Photo-based waste sorting, smarter transport nudges and personal carbon tracking turn three million fans into a force for less waste.' },
  { glyph: '🛟', accent: '#e23a45', title: 'Safety without friction', body: 'Crowd intelligence and instant incident triage mean the right people move first \u2014 quietly, before a moment becomes an emergency.' },
]

// ---- Login role picker ----
export const roleDefs = [
  { id: 'fan', label: 'Fan' },
  { id: 'staff', label: 'Staff' },
  { id: 'organizer', label: 'Organizer' },
]
export const roleMeta = { fan: 'a Fan', staff: 'Staff', organizer: 'an Organizer' }


// ============================================================
// SHARED PORTAL DATASET
// All three dashboards read from this. Staff can write incidents,
// toggle duty status, update tasks. Organizer can triage incidents,
// accept/dismiss recommendations. Fan reads crowd/gate data.
// ============================================================

// ---- Match data ----
// REMOVED (2026-07-12). This used to hardcode "USA vs Mexico at MetLife" with a
// synthetic kickoff 2.5h in the future. All of it was fabricated.
//
// The real fixture — teams, venue, city, kickoff, score, round — now comes from
// the live FIFA World Cup 2026 feed. Use `useVenue()` from src/lib/venue.js.
// Do not reintroduce a hardcoded match.

// ---- Fan profile / ticket ----
export function createFanProfile() {
  return {
    name: 'Jordan Rivera',
    email: 'jordan.r@email.com',
    language: 'English',
    // Ticket details are entered by the fan in their dashboard (not at sign-up).
    // Until confirmed, screens fall back to sensible defaults.
    gate: '',
    section: '',
    row: '',
    seat: '',
    ticketId: '',
    ticketConfirmed: false,
    accessibility: {
      wheelchair: false,
      sensory: false,
      largeText: false,
      audioContent: false,
    },
    rewards: {
      points: 0,
      scans: 0,
      level: null,
    },
  }
}

// ---- Zones & gates (crowd density) ----
// Empty until a real venue sensor feed is connected. No fabricated data.
export function createZones() {
  return []
}

export function createGates() {
  return []
}

// ---- Incidents (Staff files them → Organizer triages). Starts empty; real
// incidents are created by staff via the Report Incident screen. ----
export function createIncidents() {
  return []
}

// ---- Staff roster / shifts (populated when staff accounts are linked) ----
export function createStaffRoster() {
  return []
}

// ---- Tasks (assigned by Operations; none until a real backend exists) ----
export function createTasks() {
  return []
}

// ---- Notifications (raised by real events; none until data is flowing) ----
export function createNotifications() {
  return []
}

// ---- Recommendations / Briefings (generated from live signals) ----
export function createRecommendations() {
  return []
}

// ---- Concierge knowledge ----
// REMOVED (2026-07-12): the old `conciergeFAQ` and `venueFaq` asserted invented
// facts as truth — "Restroom 4C on the South Concourse", "Sensory Room, Level 1
// Section 101", "trains from Secaucus Junction". Those were made up, and they
// were made up about MetLife, which isn't even the venue for most fixtures.
//
// No free API publishes stadium interior layouts (Overpass/OSM has essentially
// nothing for these grounds — verified). So we do not claim to know them.
//
// What replaces it: guidance that is TRUE OF STADIUMS IN GENERAL, explicitly
// framed as general. The AI is instructed to offer it as general advice and to
// tell the fan to check signage or ask a steward for anything venue-specific —
// never to assert it as a fact about the ground they are standing in.
export const generalGuidance = [
  'Accessible restrooms are normally located beside elevator banks on each level; look for the wheelchair pictogram on the wayfinding signs.',
  'Most stadiums operate a clear-bag policy at FIFA tournaments, and prohibit glass, outside food and large umbrellas. Check the official listing for this specific ground before you travel.',
  'Concessions run along every concourse. Free water refill points are usually near the restroom blocks.',
  'Gates typically open two to three hours before kickoff. Arriving 60–90 minutes early is the usual advice.',
  'Sensory or quiet rooms are provided at FIFA World Cup venues, but the location differs by ground — ask a steward or check the venue accessibility page.',
  'For medical help, approach any steward in a hi-vis vest, or go to a First Aid point on the concourse.',
  'Your seat is found from your gate: enter, take the lift or ramp to your level, then follow the section numbers around the concourse.',
]

// ---- Languages supported ----
export const languages = [
  'English', 'Spanish', 'French', 'Portuguese', 'Arabic', 'Mandarin',
  'Japanese', 'Korean', 'German', 'Italian', 'Dutch', 'Russian',
  'Turkish', 'Hindi', 'Swahili', 'Polish', 'Swedish', 'Norwegian',
  'Danish', 'Finnish', 'Greek', 'Czech', 'Romanian', 'Hungarian',
  'Thai', 'Vietnamese',
]

// REMOVED (2026-07-12): `transportModes` hardcoded MetLife/New-Jersey specifics
// (NJ Transit Meadowlands Rail, Secaucus Junction, Lot K, Penn Station) as if
// they applied to every fixture. It was already unused. Transport is now driven
// by the fan's real geocoded origin and the real venue — see FanTransport and
// src/lib/carbon.js.

// ---- Rewards catalog (empty until a real rewards program is connected) ----
export const rewardsCatalog = []

// ---- Dashboard navigation definitions ----
export const fanTabs = [
  { id: 'fan-dashboard', label: 'Matchday', icon: 'home' },
  { id: 'fan-concierge', label: 'Assistant', icon: 'chat' },
  { id: 'fan-map', label: 'Live Map', icon: 'map' },
  { id: 'fan-accessibility', label: 'Accessibility', icon: 'access' },
  { id: 'fan-transport', label: 'Transport', icon: 'bus' },
  { id: 'fan-notifications', label: 'Notifications', icon: 'bell' },
  { id: 'fan-profile', label: 'Profile', icon: 'user' },
]

export const staffTabs = [
  { id: 'staff-dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'staff-tasks', label: 'Tasks', icon: 'clipboard' },
  { id: 'staff-incident', label: 'Report Incident', icon: 'alert' },
  { id: 'staff-translation', label: 'Translation', icon: 'globe' },
  { id: 'staff-zones', label: 'Zone Alerts', icon: 'grid' },
  { id: 'staff-profile', label: 'Profile', icon: 'user' },
]

export const organizerTabs = [
  { id: 'organizer-dashboard', label: 'Command', icon: 'home' },
  { id: 'organizer-heatmap', label: 'Heatmap', icon: 'map' },
  { id: 'organizer-copilot', label: 'Ops Query', icon: 'cpu' },
  { id: 'organizer-incidents', label: 'Incidents', icon: 'alert' },
  { id: 'organizer-briefings', label: 'Briefings', icon: 'clipboard' },
  { id: 'organizer-analytics', label: 'Analytics', icon: 'chart' },
  { id: 'organizer-sustainability', label: 'Footprint', icon: 'leaf' },
  { id: 'organizer-team', label: 'Team', icon: 'users' },
]

// REMOVED (2026-07-12): `venueFaq` hardcoded a fictional seat (Section 214,
// Row 12, Seat 8), a fictional Gate C, and MetLife-specific transport
// ("Secaucus Junction") — asserted as fact to every fan regardless of their
// real ticket or the real stadium. See `generalGuidance` above, which is the
// honest replacement: true of stadiums in general, and labelled as such.

// ---- Analytics data (Organizer) — empty until real telemetry is flowing ----
export const analyticsStats = []
