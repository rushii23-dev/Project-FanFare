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

// Role → accent color mapping
export const roleAccent = { fan: C.blue, staff: C.green, organizer: C.red }

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

export const stats = [
  { value: '26', accent: '#2aa5e0', label: 'Languages supported in real time, across chat and live translation' },
  { value: '\u221238%', accent: '#2fa24e', label: 'Reduction in peak gate congestion with AI-guided routing' },
  { value: '100%', accent: '#e23a45', label: 'Of accessibility requests logged, tracked and routed to a volunteer' },
  { value: '61%', accent: '#2aa5e0', label: 'Landfill waste diverted through vision-assisted sorting' },
]

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

// ---- Match data (the event everything revolves around) ----
export const matchData = {
  homeTeam: 'United States',
  homeCode: 'USA',
  homeFlag: '🇺🇸',
  awayTeam: 'Mexico',
  awayCode: 'MEX',
  awayFlag: '🇲🇽',
  round: 'Group A — Matchday 2',
  venue: 'MetLife Stadium',
  city: 'East Rutherford, NJ',
  // Kickoff set ~2.5 hours in the future from "now" so the countdown always works
  get kickoff() {
    const d = new Date()
    d.setHours(d.getHours() + 2, d.getMinutes() + 30, 0, 0)
    return d.toISOString()
  },
}

// ---- Fan profile / ticket ----
export function createFanProfile() {
  return {
    name: 'Jordan Rivera',
    email: 'jordan.r@email.com',
    language: 'English',
    gate: 'C',
    section: '214',
    row: '12',
    seat: '8',
    ticketId: 'FF-2026-MC02-C214-12-08',
    accessibility: {
      wheelchair: false,
      sensory: false,
      largeText: false,
      audioContent: false,
    },
    rewards: {
      points: 320,
      scans: 7,
      level: 'Green Champion',
    },
  }
}

// ---- Zones & gates (shared truth for crowd density) ----
export function createZones() {
  return [
    { id: 'A', name: 'Zone A — North Stand', capacity: 12000, current: 9200, trend: [62, 68, 71, 74, 77] },
    { id: 'B', name: 'Zone B — East Stand', capacity: 14000, current: 8400, trend: [48, 52, 55, 58, 60] },
    { id: 'C', name: 'Zone C — South Stand', capacity: 12000, current: 10800, trend: [72, 78, 82, 86, 90] },
    { id: 'D', name: 'Zone D — West Stand', capacity: 14000, current: 7000, trend: [38, 42, 44, 48, 50] },
    { id: 'E', name: 'Zone E — NW Corner', capacity: 6000, current: 3600, trend: [50, 54, 56, 58, 60] },
    { id: 'F', name: 'Zone F — SE Corner', capacity: 6000, current: 5100, trend: [68, 72, 78, 82, 85] },
  ]
}

export function createGates() {
  return [
    { id: 'A', zone: 'A', waitMin: 4, density: 68, trend: [3, 4, 5, 4, 4] },
    { id: 'B', zone: 'A', waitMin: 7, density: 82, trend: [4, 5, 6, 7, 7] },
    { id: 'C', zone: 'C', waitMin: 12, density: 91, trend: [6, 8, 9, 11, 12] },
    { id: 'C-2', zone: 'C', waitMin: 3, density: 34, trend: [2, 2, 3, 3, 3], isClosed: true },
    { id: 'D', zone: 'D', waitMin: 2, density: 42, trend: [2, 2, 2, 2, 2] },
    { id: 'E', zone: 'B', waitMin: 5, density: 61, trend: [3, 4, 4, 5, 5] },
    { id: 'F', zone: 'E', waitMin: 3, density: 48, trend: [3, 3, 3, 3, 3] },
    { id: 'G', zone: 'F', waitMin: 9, density: 78, trend: [5, 6, 7, 8, 9] },
  ]
}

// ---- Incidents (Staff writes, Organizer reads/triages) ----
export function createIncidents() {
  return [
    {
      id: 'INC-001', severity: 'high', category: 'medical',
      title: 'Fan experiencing heat exhaustion',
      description: 'A fan in Section 214, Row 8 appears to be experiencing heat exhaustion. They are conscious but dizzy. Requesting medical assistance.',
      location: 'Zone C — Section 214', zone: 'C',
      status: 'new', assignedTo: null,
      reportedBy: 'Aiden Park', reportedAt: _ago(12),
    },
    {
      id: 'INC-002', severity: 'medium', category: 'crowd',
      title: 'Gate C queue backing into concourse',
      description: 'The queue at Gate C is backing up into the main concourse, partially blocking the east corridor. Crowd density is increasing.',
      location: 'Gate C — South Concourse', zone: 'C',
      status: 'assigned', assignedTo: 'Maria Santos',
      reportedBy: 'James Liu', reportedAt: _ago(25),
    },
    {
      id: 'INC-003', severity: 'low', category: 'facilities',
      title: 'Restroom 4B out of supplies',
      description: 'Restroom 4B in the east concourse is low on paper towels and soap. Requires resupply.',
      location: 'Zone B — East Concourse', zone: 'B',
      status: 'resolved', assignedTo: 'Carlos Ruiz',
      reportedBy: 'Aiden Park', reportedAt: _ago(45),
    },
    {
      id: 'INC-004', severity: 'medium', category: 'accessibility',
      title: 'Wheelchair ramp blocked by vendor cart',
      description: 'A vendor cart has been parked in front of the wheelchair ramp near Gate E. Needs relocation.',
      location: 'Gate E — North Stand', zone: 'A',
      status: 'new', assignedTo: null,
      reportedBy: 'Maria Santos', reportedAt: _ago(8),
    },
  ]
}

// ---- Staff roster / shifts ----
export function createStaffRoster() {
  return [
    { id: 'S1', name: 'Aiden Park', zone: 'C', role: 'Volunteer', status: 'available', shiftStart: _shiftStart(), shiftEnd: _shiftEnd(), tasksCompleted: 4, incidentsFiled: 2 },
    { id: 'S2', name: 'Maria Santos', zone: 'A', role: 'Security', status: 'available', shiftStart: _shiftStart(), shiftEnd: _shiftEnd(), tasksCompleted: 6, incidentsFiled: 1 },
    { id: 'S3', name: 'James Liu', zone: 'C', role: 'Volunteer', status: 'on-break', shiftStart: _shiftStart(), shiftEnd: _shiftEnd(), tasksCompleted: 3, incidentsFiled: 1 },
    { id: 'S4', name: 'Carlos Ruiz', zone: 'B', role: 'Facilities', status: 'available', shiftStart: _shiftStart(), shiftEnd: _shiftEnd(), tasksCompleted: 8, incidentsFiled: 0 },
    { id: 'S5', name: 'Priya Mehta', zone: 'D', role: 'Medical', status: 'available', shiftStart: _shiftStart(), shiftEnd: _shiftEnd(), tasksCompleted: 2, incidentsFiled: 0 },
    { id: 'S6', name: 'Fatima Al-Hassan', zone: 'E', role: 'Volunteer', status: 'off-duty', shiftStart: _shiftStart(), shiftEnd: _shiftEnd(), tasksCompleted: 5, incidentsFiled: 3 },
  ]
}

// ---- Tasks (for Staff portal) ----
export function createTasks() {
  return [
    { id: 'T1', title: 'Check Gate C queue length', zone: 'C', status: 'done', priority: 'high', time: '14:00' },
    { id: 'T2', title: 'Escort wheelchair user to Section 110', zone: 'A', status: 'in-progress', priority: 'high', time: '14:15' },
    { id: 'T3', title: 'Restock water station — North Concourse', zone: 'A', status: 'pending', priority: 'medium', time: '14:30' },
    { id: 'T4', title: 'Verify accessible restroom signage', zone: 'B', status: 'pending', priority: 'low', time: '14:45' },
    { id: 'T5', title: 'Monitor crowd flow at Gate G entrance', zone: 'F', status: 'pending', priority: 'medium', time: '15:00' },
    { id: 'T6', title: 'Distribute sensory kits — Family Zone', zone: 'D', status: 'pending', priority: 'medium', time: '15:15' },
  ]
}

// ---- Notifications (per-role, shared pool) ----
export function createNotifications() {
  return [
    // Fan notifications
    { id: 'N1', role: 'fan', category: 'gate', title: 'Gate C wait time increasing', body: 'Current wait: 12 min. Gate D is quieter at 2 min.', time: _ago(3), read: false },
    { id: 'N2', role: 'fan', category: 'match', title: 'Teams warming up', body: 'Both teams are on the pitch for warm-ups. Kickoff in 2h 30m.', time: _ago(15), read: false },
    { id: 'N3', role: 'fan', category: 'rewards', title: 'You earned 40 points!', body: 'Your last waste scan earned you 40 Green Champion points.', time: _ago(32), read: true },
    { id: 'N4', role: 'fan', category: 'gate', title: 'Your gate is now open', body: 'Gate C is open for entry. Head to the South Stand.', time: _ago(60), read: true },
    // Staff notifications
    { id: 'N5', role: 'staff', category: 'task', title: 'New task assigned', body: 'Escort wheelchair user to Section 110.', time: _ago(5), read: false },
    { id: 'N6', role: 'staff', category: 'crowd', title: 'Zone C at 90% capacity', body: 'Your assigned zone is nearing capacity. Stay alert.', time: _ago(10), read: false },
    { id: 'N7', role: 'staff', category: 'incident', title: 'Incident INC-002 assigned', body: 'Gate C queue issue has been assigned to Maria Santos.', time: _ago(20), read: true },
    // Organizer notifications
    { id: 'N8', role: 'organizer', category: 'alert', title: 'Gate C trending to capacity', body: 'Gate C projected to reach capacity in ~6 minutes.', time: _ago(2), read: false },
    { id: 'N9', role: 'organizer', category: 'incident', title: 'New high-severity incident', body: 'INC-001: Fan experiencing heat exhaustion in Section 214.', time: _ago(12), read: false },
    { id: 'N10', role: 'organizer', category: 'system', title: 'Briefing generated', body: 'New recommendation: Consider opening Gate C-2.', time: _ago(6), read: false },
  ]
}

// ---- Recommendations / Briefings (Organizer) ----
export function createRecommendations() {
  return [
    {
      id: 'R1', priority: 'high',
      title: 'Open Gate C-2 to relieve south stand congestion',
      body: 'Gate C is trending to capacity in approximately 6 minutes. Opening the adjacent Gate C-2 would redistribute roughly 30% of inbound flow and reduce average wait time from 12 min to an estimated 5 min.',
      status: 'pending', time: _ago(4),
      impact: { metric: 'Wait time at Gate C', from: '12 min', to: '~5 min' },
    },
    {
      id: 'R2', priority: 'medium',
      title: 'Deploy two additional volunteers to Zone F',
      body: 'Zone F (SE Corner) density is at 85% and rising. Current volunteer coverage is below target. Reassigning two volunteers from Zone D (50% density) would improve response capacity.',
      status: 'pending', time: _ago(18),
      impact: { metric: 'Zone F coverage', from: '1 volunteer', to: '3 volunteers' },
    },
    {
      id: 'R3', priority: 'low',
      title: 'Activate overflow parking lot B',
      body: 'Parking lot A is at 94% capacity. Opening lot B early would prevent congestion at the main vehicle entrance. Estimated impact: 15-minute reduction in post-match exit time.',
      status: 'accepted', time: _ago(45),
      impact: { metric: 'Post-match exit time', from: '38 min', to: '~23 min' },
    },
    {
      id: 'R4', priority: 'medium',
      title: 'Increase water station supply at North Stand',
      body: 'Temperature is forecast to remain above 28°C through kickoff. Water consumption at North Stand stations is 40% above baseline. Pre-positioning additional supply is recommended.',
      status: 'dismissed', time: _ago(60),
      impact: { metric: 'Water availability', from: '~45 min remaining', to: '~2h supply' },
    },
  ]
}

// ---- Concierge FAQ (grounded answers for the AI chat) ----
export const conciergeFAQ = [
  { q: "Where's the nearest accessible restroom?", a: "The nearest accessible restroom to your seat (Section 214) is Restroom 4C on the South Concourse, about 40 meters from Gate C. It has full wheelchair access and a lowered sink. Source: MetLife Stadium accessibility guide." },
  { q: "What's the bag policy?", a: "MetLife Stadium enforces a clear-bag policy. Bags must be clear plastic or vinyl, no larger than 12\" × 6\" × 12\". Small clutch purses (4.5\" × 6.5\") are also permitted. No backpacks. Source: MetLife Stadium entry policy." },
  { q: "Where can I get food near my seat?", a: "The closest food options to Section 214 are: (1) Main Concourse Stand — burgers, hot dogs, nachos (30m south), (2) International Bites — tacos, falafel, noodles (45m east), (3) Green Cart — plant-based options (20m west). All accept contactless payment." },
  { q: "How do I get to my seat?", a: "From Gate C, follow the South Concourse east for about 60 meters. Take the ramp or stairs up to Level 2. Section 214 is on your left. Row 12 is roughly midway up. Your seat (8) is eighth from the left aisle." },
  { q: "What time do gates open?", a: "Gates open 3 hours before kickoff. For this match, that means gates opened at the start of the pre-match window. Your assigned gate is Gate C (South Stand)." },
  { q: "Is there a quiet room?", a: "Yes. The Sensory Room is located on Level 1, Section 101 (North Stand). It offers reduced lighting, sound dampening, and a live match feed. It's available on a first-come basis. Source: MetLife Stadium accessibility services." },
]

// ---- Languages supported ----
export const languages = [
  'English', 'Spanish', 'French', 'Portuguese', 'Arabic', 'Mandarin',
  'Japanese', 'Korean', 'German', 'Italian', 'Dutch', 'Russian',
  'Turkish', 'Hindi', 'Swahili', 'Polish', 'Swedish', 'Norwegian',
  'Danish', 'Finnish', 'Greek', 'Czech', 'Romanian', 'Hungarian',
  'Thai', 'Vietnamese',
]

// ---- Transport options ----
export const transportModes = [
  {
    id: 'transit', label: 'Transit', icon: '🚇',
    route: 'NJ Transit — Meadowlands Rail',
    eta: '35 min from Penn Station',
    details: 'Trains run every 10 min pre-match. Departs from Secaucus Junction.',
  },
  {
    id: 'rideshare', label: 'Rideshare', icon: '🚗',
    route: 'Uber/Lyft — Lot K Drop-off',
    eta: '22 min from Manhattan',
    details: 'Designated pickup/drop-off in Lot K. Surge pricing likely post-match.',
  },
  {
    id: 'walk', label: 'Walk', icon: '🚶',
    route: 'Pedestrian Walkway from Lot J',
    eta: '12 min from parking',
    details: 'Follow the lit pedestrian path. Wheelchair-accessible route available.',
  },
]

// ---- Rewards catalog ----
export const rewardsCatalog = [
  { id: 'RW1', name: 'Free matchday drink', points: 100, icon: '🥤' },
  { id: 'RW2', name: '10% merch discount', points: 200, icon: '👕' },
  { id: 'RW3', name: 'Priority exit pass', points: 350, icon: '🎫' },
  { id: 'RW4', name: 'Exclusive digital badge', points: 50, icon: '🏅' },
]

// ---- Dashboard navigation definitions ----
export const fanTabs = [
  { id: 'fan-dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'fan-concierge', label: 'AI Concierge', icon: '💬' },
  { id: 'fan-map', label: 'Live Map', icon: '🗺' },
  { id: 'fan-accessibility', label: 'Accessibility', icon: '♿' },
  { id: 'fan-transport', label: 'Transport', icon: '🚇' },
  { id: 'fan-notifications', label: 'Notifications', icon: '🔔' },
  { id: 'fan-profile', label: 'Profile', icon: '👤' },
]

export const staffTabs = [
  { id: 'staff-dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'staff-tasks', label: 'Tasks', icon: '📋' },
  { id: 'staff-incident', label: 'Report Incident', icon: '🚨' },
  { id: 'staff-translation', label: 'Translation', icon: '🌐' },
  { id: 'staff-zones', label: 'Zone Alerts', icon: '📊' },
  { id: 'staff-profile', label: 'Profile', icon: '👤' },
]

export const organizerTabs = [
  { id: 'organizer-dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'organizer-heatmap', label: 'Heatmap', icon: '🗺' },
  { id: 'organizer-copilot', label: 'Co-pilot', icon: '🤖' },
  { id: 'organizer-incidents', label: 'Incidents', icon: '🚨' },
  { id: 'organizer-briefings', label: 'Briefings', icon: '📋' },
  { id: 'organizer-analytics', label: 'Analytics', icon: '📈' },
  { id: 'organizer-team', label: 'Team', icon: '👥' },
]

// ---- Analytics data (Organizer) ----
export const analyticsStats = [
  { value: '67,420', label: 'Current attendance', accent: C.blue, trend: '+2.1%', sparkline: [52, 56, 58, 61, 64, 67] },
  { value: '−38%', label: 'Congestion vs. baseline', accent: C.green, trend: '−4.2%', sparkline: [62, 55, 48, 44, 40, 38] },
  { value: '47', label: 'Accessibility requests resolved', accent: C.red, trend: '+12', sparkline: [18, 24, 30, 36, 42, 47] },
  { value: '61%', label: 'Waste correctly diverted', accent: C.blue, trend: '+3%', sparkline: [42, 48, 52, 55, 58, 61] },
]


// ---- Helper: minutes-ago timestamp ----
function _ago(min) {
  return new Date(Date.now() - min * 60000).toISOString()
}
function _shiftStart() {
  const d = new Date(); d.setHours(d.getHours() - 2, 0, 0, 0)
  return d.toISOString()
}
function _shiftEnd() {
  const d = new Date(); d.setHours(d.getHours() + 4, 0, 0, 0)
  return d.toISOString()
}
