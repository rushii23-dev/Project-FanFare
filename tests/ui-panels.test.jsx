// @vitest-environment jsdom
//
// Behavioral tests for the stateful dashboard panels: the accessibility
// planner (preferences persist, the plan is grounded in step-free gate flags),
// the organizer briefings queue (auto-brief on arrival, untrusted model output
// normalised, accept/dismiss lifecycle), the transport planner (real geocode →
// real distance → real emission ranking), notifications, the staff task board
// and the team roster. AI and geocoding are mocked at the module boundary;
// the state machines under them are the production code.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { AIError } from '../src/lib/ai.js'
import FanAccessibility from '../src/components/dashboard/fan/FanAccessibility.jsx'
import FanTransport from '../src/components/dashboard/fan/FanTransport.jsx'
import FanNotifications from '../src/components/dashboard/fan/FanNotifications.jsx'
import OrganizerBriefings from '../src/components/dashboard/organizer/OrganizerBriefings.jsx'
import OrganizerTeam from '../src/components/dashboard/organizer/OrganizerTeam.jsx'
import StaffTasks from '../src/components/dashboard/staff/StaffTasks.jsx'

// ---- module mocks ---------------------------------------------------------

const aiMock = vi.hoisted(() => ({
  askAIJson: vi.fn(),
  status: { checking: false, configured: true },
}))
vi.mock('../src/lib/ai.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    askAIJson: (...a) => aiMock.askAIJson(...a),
    useAIStatus: () => aiMock.status,
  }
})

const feedMock = vi.hoisted(() => ({
  geocodeCity: vi.fn(),
  wc: { view: null, loading: false, results: [], fixtures: [], leagueBadge: '', live: false },
  rates: { live: true, rates: { EUR: 0.9, GBP: 0.78, CAD: 1.36, MXN: 18.5, JPY: 155, BRL: 5.4, INR: 84, AUD: 1.5 } },
}))
vi.mock('../src/lib/freeApis.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    geocodeCity: (...a) => feedMock.geocodeCity(...a),
    useLiveWorldCup: () => feedMock.wc,
    useWeather: () => ({ live: true, code: 61, temp: 17, feels: 15, wind: 20, humidity: 70 }),
    useRates: () => feedMock.rates,
  }
})

const venueMock = vi.hoisted(() => ({ value: null }))
vi.mock('../src/lib/venue.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useVenue: () => venueMock.value }
})

vi.mock('leaflet', () => {
  const layer = { clearLayers: vi.fn(), addTo: vi.fn(() => layer) }
  const map = { setView: vi.fn(function set() { return this }), remove: vi.fn(), invalidateSize: vi.fn() }
  const mk = { addTo: vi.fn(() => mk), bindPopup: vi.fn(() => mk) }
  return {
    default: {
      map: vi.fn(() => map), tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      layerGroup: vi.fn(() => layer), divIcon: vi.fn(o => o), marker: vi.fn(() => mk),
    },
  }
})
vi.mock('leaflet/dist/leaflet.css', () => ({}))

// ---- jsdom shims ----------------------------------------------------------

const store = new Map()
const memoryStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(String(k), String(v)) },
  removeItem: k => { store.delete(k) },
  clear: () => { store.clear() },
  key: i => [...store.keys()][i] ?? null,
  get length() { return store.size },
}

const resolvedVenue = {
  loading: false, resolved: true, isLive: true, phase: 'LIVE',
  match: { id: 'm1' }, homeTeam: 'Mexico', awayTeam: 'Canada', homeCode: 'MEX', awayCode: 'CAN',
  round: 'Group A', venue: 'Estadio Azteca', city: 'Mexico City',
  lat: 19.3029, lon: -99.1505, kickoff: '2026-07-12T20:00:00', kickoffLabel: '20:00',
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  })))
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' })))
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(text) { this.text = text } })
  vi.stubGlobal('speechSynthesis', { speak: vi.fn() })
  vi.stubGlobal('localStorage', memoryStorage)
  window.scrollTo = () => {}

  store.clear()
  aiMock.askAIJson.mockReset()
  aiMock.status = { checking: false, configured: true }
  feedMock.geocodeCity.mockReset()
  feedMock.wc = { view: null, loading: false, results: [], fixtures: [], leagueBadge: '', live: false }
  venueMock.value = { ...resolvedVenue }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---- fan accessibility planner ---------------------------------------------

const gatesWithSteps = [
  { id: 'A', waitMin: 6, density: 40, isClosed: false, stepFree: false },
  { id: 'B', waitMin: 14, density: 65, isClosed: false, stepFree: true },
  { id: 'C', waitMin: 0, density: 0, isClosed: true, stepFree: true },
]

function A11yHarness({ initial }) {
  const [profile, setProfile] = useState(initial)
  return (
    <FanAccessibility
      fanProfile={profile}
      onUpdateProfile={setProfile}
      zones={[{ id: 'Z1', name: 'South Stand', current: 900, capacity: 1000 }]}
      gates={gatesWithSteps}
    />
  )
}

const fanWithNeeds = {
  name: 'Maya Lopez', ticketConfirmed: true, gate: 'B', section: '214', row: '12', seat: '8',
  accessibility: { wheelchair: true, sensory: false, largeText: false, audioContent: false },
}

describe('FanAccessibility', () => {
  it('builds a plan grounded in step-free gate flags and the declared needs', async () => {
    aiMock.askAIJson.mockResolvedValue({
      summary: 'Head for Gate B — it is step-free and 14 minutes.',
      steps: [
        { title: 'Go to Gate B', detail: 'Ramp access, avoid Gate A which has steps.' },
        { title: 'Ask a steward for the lift', detail: 'Lifts serve every level.' },
      ],
      timing: 'Leave now: South Stand is already 90% full.',
      cautions: ['South Stand concourse is very busy.'],
    })
    render(<A11yHarness initial={fanWithNeeds} />)

    fireEvent.click(screen.getByText('Build my access plan'))
    expect(await screen.findByText(/Head for Gate B — it is step-free/)).toBeTruthy()

    const { system, prompt } = aiMock.askAIJson.mock.calls[0][0]
    expect(system).toMatch(/NEVER describe a gate as accessible unless the context says it is/)
    expect(prompt).toContain('Gate B: 14 min wait — STEP-FREE (ramp/lift access)')
    expect(prompt).toContain('Gate A: 6 min wait — NOT step-free (steps on entry)')
    expect(prompt).toContain('Closed gates: C')
    expect(prompt).toContain('ramps and elevators only')
    expect(prompt).toContain('Gate B, Section 214, Row 12, Seat 8')

    expect(screen.getByText('Go to Gate B')).toBeTruthy()
    expect(screen.getByText(/Leave now: South Stand is already 90% full/)).toBeTruthy()
    expect(screen.getByText('South Stand concourse is very busy.')).toBeTruthy()

    fireEvent.click(screen.getByLabelText('Read the plan aloud'))
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
    expect(window.speechSynthesis.speak.mock.calls[0][0].text).toContain('Step 1. Go to Gate B.')
  })

  it('persists a toggled preference and discards the now-stale plan', async () => {
    aiMock.askAIJson.mockResolvedValue({ summary: 'Plan built.', steps: [], timing: '', cautions: [] })
    render(<A11yHarness initial={fanWithNeeds} />)

    fireEvent.click(screen.getByText('Build my access plan'))
    await screen.findByText('Plan built.')

    fireEvent.click(screen.getByLabelText('Sensory-sensitive mode'))
    expect(JSON.parse(store.get('ff-fan-a11y')).sensory).toBe(true)
    // The plan was built for the old needs — it must not survive the change.
    expect(screen.queryByText('Plan built.')).toBeNull()
  })

  it('restores saved preferences on arrival', async () => {
    store.set('ff-fan-a11y', JSON.stringify({ largeText: true }))
    render(<A11yHarness initial={{ ...fanWithNeeds, accessibility: { wheelchair: false } }} />)
    await waitFor(() => expect(screen.getByLabelText('Large text').getAttribute('aria-pressed')).toBe('true'))
  })

  it('shows the failure honestly and disables planning without an AI key', async () => {
    aiMock.askAIJson.mockRejectedValue(new AIError('down', 'OFFLINE'))
    const { unmount } = render(<A11yHarness initial={fanWithNeeds} />)
    fireEvent.click(screen.getByText('Build my access plan'))
    expect(await screen.findByText(/Can't reach the assistant/)).toBeTruthy()
    unmount()

    aiMock.status = { checking: false, configured: false }
    render(<A11yHarness initial={fanWithNeeds} />)
    expect(screen.getByText('Build my access plan').closest('button').disabled).toBe(true)
  })
})

// ---- organizer briefings ----------------------------------------------------

const busyZones = [{ id: 'Z1', name: 'South Stand', current: 950, capacity: 1000 }]
const busyGates = [{ id: 'A', waitMin: 24, density: 80, isClosed: false }, { id: 'D', isClosed: true }]

function BriefingsHarness({ zones = busyZones, gates = busyGates, initial = [] }) {
  const [recs, setRecs] = useState(initial)
  return <OrganizerBriefings recommendations={recs} onUpdateRecs={setRecs} zones={zones} gates={gates} />
}

describe('OrganizerBriefings', () => {
  it('briefs the operator on arrival, drops malformed output, and runs the accept/dismiss lifecycle', async () => {
    aiMock.askAIJson.mockResolvedValue({
      recommendations: [
        { priority: 'high', title: 'Open Gate D now', body: 'Gate A is at 24 min; Gate D sits closed beside the hot South Stand.', impact: { metric: 'Gate A wait', from: '24 min', to: '11 min' } },
        { priority: 'not-a-priority', title: 'Watch South Stand', body: 'At 95% it is urgent.', impact: {} },
        { title: 'No body — must be dropped' },
      ],
    })
    render(<BriefingsHarness />)

    // Auto-generated on arrival — no click needed.
    expect(await screen.findByText('Open Gate D now')).toBeTruthy()
    const { prompt } = aiMock.askAIJson.mock.calls[0][0]
    expect(prompt).toContain('Z1 | South Stand | 950/1000 (95%)')
    expect(prompt).toContain('Gate D | CLOSED')

    expect(screen.getByText('high priority')).toBeTruthy()
    expect(screen.getByText('24 min')).toBeTruthy()
    expect(screen.getByText('11 min')).toBeTruthy()
    // Bad priority is coerced to medium; the title-only item is dropped.
    expect(screen.getByText('medium priority')).toBeTruthy()
    expect(screen.queryByText('No body — must be dropped')).toBeNull()
    expect(screen.getByText('Pending · 2')).toBeTruthy()

    fireEvent.click(screen.getAllByText('Accept action')[0])
    await screen.findByText('Pending · 1')
    fireEvent.click(screen.getByText('Dismiss'))
    await screen.findByText('Pending · 0')
    expect(screen.getByText('Nothing needs action')).toBeTruthy()

    // The actioned items are history, reachable through the filters.
    fireEvent.click(screen.getByText('Accepted · 1'))
    expect(screen.getByText('Open Gate D now')).toBeTruthy()
    fireEvent.click(screen.getByText('Dismissed · 1'))
    expect(screen.getByText('Watch South Stand')).toBeTruthy()
  })

  it('refuses to brief on a dead feed rather than inventing telemetry', async () => {
    render(<BriefingsHarness zones={[]} gates={[]} />)
    expect(await screen.findByText(/The venue feed is not reporting/)).toBeTruthy()
    expect(aiMock.askAIJson).not.toHaveBeenCalled()
  })

  it('stays quiet and says why when no AI key is configured', () => {
    aiMock.status = { checking: false, configured: false }
    render(<BriefingsHarness />)
    expect(screen.getByText(/Briefing generation is offline/)).toBeTruthy()
    expect(aiMock.askAIJson).not.toHaveBeenCalled()
    expect(screen.getByText('Regenerate briefing').closest('button').disabled).toBe(true)
  })
})

// ---- fan transport planner --------------------------------------------------

const ticketedFan = { name: 'Maya', ticketConfirmed: true, gate: 'B', section: '214' }

describe('FanTransport', () => {
  it('turns a real geocoded origin into ranked emissions and grounded departure advice', async () => {
    feedMock.geocodeCity.mockResolvedValue({ lat: 19.36, lon: -99.17, label: 'Coyoacán, Mexico City' })
    feedMock.wc = {
      ...feedMock.wc, live: true,
      view: { phase: 'LIVE', minuteLabel: "63'", hasScore: true, homeScore: 2, awayScore: 1, homeCode: 'MEX', awayCode: 'CAN', homeBadge: '', awayBadge: '', round: 'Group A' },
    }
    aiMock.askAIJson.mockResolvedValue({
      headline: 'Take the metro and leave in the next 20 minutes.',
      leaveBy: '18:40 — rain is forecast for 19:30', mode: 'transit',
      gate: 'Gate B — your ticketed gate, 14 min', why: 'It is 6.6 km and raining.', green: 'Rail emits a fraction of a taxi here.',
    })
    render(<FanTransport fanProfile={ticketedFan} gates={gatesWithSteps} />)

    // The banner tracks the real live match, not a stand-in.
    expect(screen.getByText(/Live · 63'/)).toBeTruthy()
    expect(screen.getByText('Estadio Azteca')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('Which city or town are you travelling from?'), { target: { value: 'Coyoacán' } })
    fireEvent.click(screen.getByText('Set origin'))

    expect(await screen.findByText('Coyoacán, Mexico City')).toBeTruthy()
    expect(screen.getByText(/km each way/)).toBeTruthy()
    // Real distance (~6.7 km): walking is out of range, cycling is the greenest.
    expect(screen.queryByText('Walk')).toBeNull()
    // 'Cycle' shows twice by design: the greenest-route banner and its mode row.
    expect(screen.getAllByText('Cycle')).toHaveLength(2)
    expect(screen.getByText('greenest')).toBeTruthy()
    expect(screen.getAllByText(/Saves .* kg vs driving alone/).length).toBeGreaterThan(1)

    fireEvent.click(screen.getByText('When should I leave?'))
    expect(await screen.findByText('Take the metro and leave in the next 20 minutes.')).toBeTruthy()

    const { prompt } = aiMock.askAIJson.mock.calls[0][0]
    expect(prompt).toContain('Fan travelling from: Coyoacán, Mexico City')
    expect(prompt).toContain('Destination: Estadio Azteca, Mexico City')
    expect(prompt).toContain('Gate B (Section 214)')
    expect(prompt).toMatch(/Cycle: 0\.0 kg CO2e round trip/)

    // The advice card resolves the mode id into its human label (which also
    // appears as a ranked mode row above).
    expect(screen.getAllByText('Rail & metro').length).toBeGreaterThan(1)
    expect(screen.getByText(/rain is forecast/)).toBeTruthy()
  })

  it("admits when it can't find the origin instead of guessing", async () => {
    feedMock.geocodeCity.mockResolvedValue(null)
    render(<FanTransport fanProfile={ticketedFan} gates={[]} />)

    fireEvent.change(screen.getByPlaceholderText('Which city or town are you travelling from?'), { target: { value: 'Xyzzy' } })
    fireEvent.click(screen.getByText('Set origin'))
    expect(await screen.findByText(/Couldn't find that place/)).toBeTruthy()
  })

  it('converts currency with live rates and shows a pending state for an unresolved venue', () => {
    venueMock.value = { ...resolvedVenue, resolved: false, venue: null, city: null, lat: null, lon: null }
    render(<FanTransport fanProfile={ticketedFan} gates={[]} />)

    // No stand-in stadium is ever pinned.
    expect(screen.getByText('Resolving the venue')).toBeTruthy()

    // 50 USD → MXN at the mocked 18.5 rate.
    expect(screen.getByText('925')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } })
    expect(screen.getByText('1,850')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Currency to convert to'), { target: { value: 'EUR' } })
    expect(screen.getByText('90')).toBeTruthy()
  })
})

// ---- fan notifications --------------------------------------------------------

function NotificationsHarness({ initial }) {
  const [items, setItems] = useState(initial)
  const markRead = id => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  return <FanNotifications notifications={items} onMarkRead={markRead} />
}

const minsAgo = m => new Date(Date.now() - m * 60000).toISOString()

describe('FanNotifications', () => {
  const initial = [
    { id: 'n1', title: 'Gate change', body: 'Enter via Gate B.', category: 'gate', read: false, time: minsAgo(0) },
    { id: 'n2', title: 'Kickoff soon', body: '30 minutes to go.', category: 'match', read: false, time: minsAgo(35) },
    { id: 'n3', title: 'Welcome', body: 'Enjoy the match.', category: 'system', read: true, time: minsAgo(60 * 26) },
  ]

  it('counts unread, filters them, and marks them read one by one or all at once', () => {
    render(<NotificationsHarness initial={initial} />)

    expect(screen.getByText('2 unread updates')).toBeTruthy()
    expect(screen.getByText('Just now')).toBeTruthy()
    expect(screen.getByText('35m ago')).toBeTruthy()
    expect(screen.getByText('1d ago')).toBeTruthy()

    fireEvent.click(screen.getByText('unread'))
    expect(screen.queryByText('Welcome')).toBeNull()

    fireEvent.click(screen.getByText('Gate change'))
    expect(screen.getByText('1 unread update')).toBeTruthy()

    fireEvent.click(screen.getByText('Mark all read'))
    expect(screen.getByText("You're all caught up.")).toBeTruthy()
    expect(screen.getByText('No notifications yet')).toBeTruthy() // unread filter now empty
  })

  it('shows the empty state when there is nothing at all', () => {
    render(<NotificationsHarness initial={[]} />)
    expect(screen.getByText('No notifications yet')).toBeTruthy()
  })
})

// ---- staff task board -----------------------------------------------------------

function TasksHarness({ initial }) {
  const [tasks, setTasks] = useState(initial)
  return <StaffTasks tasks={tasks} onUpdateTasks={setTasks} />
}

const taskSet = [
  { id: 't1', title: 'Check Gate B queue', priority: 'high', status: 'pending', zone: 'B', time: '14:00' },
  { id: 't2', title: 'Restock water point', priority: 'medium', status: 'in-progress', zone: 'C', time: '14:30' },
  { id: 't3', title: 'Sweep concourse 2', priority: 'low', status: 'done', zone: 'A', time: '13:00' },
]

describe('StaffTasks', () => {
  it('walks a task through start → complete → reopen and persists each move', async () => {
    render(<TasksHarness initial={taskSet} />)
    expect(screen.getByText('1 pending · 1 active · 1 done')).toBeTruthy()

    fireEvent.click(screen.getByText('Start'))
    await screen.findByText('0 pending · 2 active · 1 done')
    expect(JSON.parse(store.get('ff-staff-tasks')).t1).toBe('in-progress')

    fireEvent.click(screen.getAllByText('Complete')[0])
    await screen.findByText('0 pending · 1 active · 2 done')

    fireEvent.click(screen.getAllByText('Reopen')[0])
    await screen.findByText('1 pending · 1 active · 1 done')

    fireEvent.click(screen.getByText(/^Done/))
    expect(screen.getByText('Sweep concourse 2')).toBeTruthy()
    expect(screen.queryByText('Restock water point')).toBeNull()
  })

  it('restores yesterday’s saved statuses when the board mounts', async () => {
    store.set('ff-staff-tasks', JSON.stringify({ t1: 'done', t2: 'done', t3: 'done' }))
    render(<TasksHarness initial={taskSet} />)
    await screen.findByText('0 pending · 0 active · 3 done')
  })

  it('shows the empty state when nothing is assigned', () => {
    render(<TasksHarness initial={[]} />)
    expect(screen.getByText('No tasks assigned')).toBeTruthy()
  })
})

// ---- organizer team roster --------------------------------------------------------

describe('OrganizerTeam', () => {
  const roster = [
    { id: 's1', name: 'Ana Silva', role: 'Steward', zone: 'B', status: 'available', tasksCompleted: 7, incidentsFiled: 1 },
    { id: 's2', name: 'Ben Okafor', role: 'Medic', zone: 'C', status: 'on-break', tasksCompleted: 3, incidentsFiled: 0 },
    { id: 's3', name: 'Chen Wei', role: 'Volunteer', zone: 'A', status: 'off-duty', tasksCompleted: 5, incidentsFiled: 2 },
  ]

  it('summarises the roster, filters by status, and renders initials avatars', () => {
    const onLogout = vi.fn()
    render(<OrganizerTeam staffRoster={roster} onLogout={onLogout} />)

    expect(screen.getByText('Total staff')).toBeTruthy()
    expect(screen.getByText('AS')).toBeTruthy() // Ana Silva → initials
    expect(screen.getByText('Steward · Zone B')).toBeTruthy()

    fireEvent.click(screen.getAllByText('On break')[1]) // the filter chip, not the stat card
    expect(screen.getByText('Ben Okafor')).toBeTruthy()
    expect(screen.queryByText('Ana Silva')).toBeNull()

    fireEvent.click(screen.getByText('Log out'))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('shows an honest empty state before anyone joins', () => {
    render(<OrganizerTeam staffRoster={[]} onLogout={vi.fn()} />)
    expect(screen.getByText('No team yet')).toBeTruthy()
  })
})
