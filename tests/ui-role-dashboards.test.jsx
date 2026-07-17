// @vitest-environment jsdom
//
// Behavioral tests for the role dashboards the journey suite only mounts:
// the staff shift board (duty status, task completion), the staff incident
// intake (dictation, AI drafting, honest manual fallback, filing), the staff
// profile, the organizer command overview (accept/dismiss recommendations),
// the crowd heatmap (zone drill-in, city map), the incident triage queue
// (filter/assign/resolve), and the two Gemini analyst surfaces. The AI client
// and external feeds are mocked at the module boundary; the state machines,
// arithmetic and rendering under them are the production code.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within, waitFor, act } from '@testing-library/react'
import { AIError } from '../src/lib/ai.js'
import { createSimZones, createSimGates } from '../src/lib/simFeed.js'
import StaffDashboard from '../src/components/dashboard/staff/StaffDashboard.jsx'
import StaffProfile from '../src/components/dashboard/staff/StaffProfile.jsx'
import StaffIncident from '../src/components/dashboard/staff/StaffIncident.jsx'
import OrganizerDashboard from '../src/components/dashboard/organizer/OrganizerDashboard.jsx'
import OrganizerHeatmap from '../src/components/dashboard/organizer/OrganizerHeatmap.jsx'
import OrganizerIncidents from '../src/components/dashboard/organizer/OrganizerIncidents.jsx'
import OrganizerAnalytics from '../src/components/dashboard/organizer/OrganizerAnalytics.jsx'
import OrganizerSustainability from '../src/components/dashboard/organizer/OrganizerSustainability.jsx'
import StaffTranslation from '../src/components/dashboard/staff/StaffTranslation.jsx'
import StatCard from '../src/components/dashboard/shared/StatCard.jsx'

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

vi.mock('../src/lib/freeApis.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useWeather: () => ({ loading: false, live: true, temp: 24, feels: 26, wind: 12, humidity: 40, code: 1 }),
    useLiveWorldCup: () => ({ view: null, loading: false, results: [], fixtures: [], leagueBadge: '', live: false }),
  }
})

const venueMock = vi.hoisted(() => ({
  value: { resolved: false, lat: null, lon: null, city: null, venue: null },
}))
vi.mock('../src/lib/venue.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useVenue: () => venueMock.value }
})

// ---- browser APIs jsdom does not implement --------------------------------

class NoopObserver {
  observe() {} unobserve() {} disconnect() {} takeRecords() { return [] }
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', NoopObserver)
  vi.stubGlobal('ResizeObserver', NoopObserver)
  // Reduced motion: StatCard's CountUp then renders its final value
  // synchronously, so KPI assertions are deterministic.
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: true, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  })))
  window.scrollTo = () => {}
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true, status: 200, json: async () => ({}), text: async () => '',
  })))
  aiMock.askAIJson.mockReset()
  aiMock.status = { checking: false, configured: true }
  venueMock.value = { resolved: false, lat: null, lon: null, city: null, venue: null }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---- fixtures ---------------------------------------------------------------

const roster = () => [{
  id: 's1', name: 'Ava Torres', role: 'Steward', zone: 'C', status: 'available',
  shiftStart: '2026-07-14T08:00:00', shiftEnd: '2026-07-14T16:00:00',
  incidentsFiled: 2, tasksCompleted: 5,
}]

const taskList = () => [
  { id: 't1', title: 'Check Gate C queue', status: 'pending', priority: 'high', zone: 'C', time: '14:00' },
  { id: 't2', title: 'Restock water station', status: 'in-progress', priority: 'medium', zone: 'B', time: '14:30' },
  { id: 't3', title: 'Sweep concourse', status: 'done', priority: 'low', zone: 'C', time: '13:00' },
]

const staffZones = () => [{ id: 'C', name: 'East Concourse', capacity: 100, current: 90, trend: 1 }]

const MIN = 60_000
const incidentList = () => [
  { id: 'INC-1', severity: 'high', category: 'medical', title: 'Fan collapsed at stairs', description: 'Conscious, chest pain reported.', location: 'Gate C', zone: 'C', status: 'new', assignedTo: null, reportedBy: 'Ava Torres', reportedAt: new Date(Date.now() - 5 * MIN).toISOString() },
  { id: 'INC-2', severity: 'medium', category: 'crowd', title: 'Queue backing into concourse', description: 'Slow flow at gate.', location: 'Gate B', zone: 'B', status: 'assigned', assignedTo: 'Ben Osei', reportedBy: 'Ben Osei', reportedAt: new Date(Date.now() - 2 * 60 * MIN).toISOString() },
  { id: 'INC-3', severity: 'low', category: 'facilities', title: 'Water spill near kiosk', description: 'Cleaned.', location: 'Zone W1', zone: 'W1', status: 'resolved', assignedTo: 'Ava Torres', reportedBy: 'Mia Chen', reportedAt: new Date(Date.now() - 3 * 24 * 60 * MIN).toISOString() },
]

const recList = () => [
  { id: 'r1', status: 'pending', priority: 'high', title: 'Open Gate D to relieve C', impact: { metric: 'Gate C wait', from: '18 min', to: '9 min' } },
  { id: 'r2', status: 'pending', priority: 'low', title: 'Add wayfinding signage', impact: { metric: 'Concourse flow', from: 'slow', to: 'steady' } },
]

// ---- StaffDashboard -----------------------------------------------------------

describe('StaffDashboard', () => {
  it('shows the honest no-shift state before a staff account is linked', () => {
    render(<StaffDashboard nav={vi.fn()} staffRoster={[]} tasks={[]} zones={[]}
      onUpdateTasks={vi.fn()} onUpdateStaff={vi.fn()} />)
    expect(screen.getByText(/No shift data yet/)).toBeTruthy()
  })

  it('summarises the shift: greeting, task KPIs, zone density and shift window', () => {
    render(<StaffDashboard nav={vi.fn()} staffRoster={roster()} tasks={taskList()} zones={staffZones()}
      onUpdateTasks={vi.fn()} onUpdateStaff={vi.fn()} />)
    expect(screen.getByText('Hi Ava')).toBeTruthy()
    expect(screen.getByText('1/3')).toBeTruthy()          // tasks done
    expect(screen.getAllByText('90%').length).toBeGreaterThan(0) // zone density
    expect(screen.getByText('08:00 — 16:00')).toBeTruthy()
    expect(screen.getByText('Check Gate C queue')).toBeTruthy()
  })

  it('changes duty status through the roster updater', () => {
    const onUpdateStaff = vi.fn()
    render(<StaffDashboard nav={vi.fn()} staffRoster={roster()} tasks={taskList()} zones={staffZones()}
      onUpdateTasks={vi.fn()} onUpdateStaff={onUpdateStaff} />)
    fireEvent.click(screen.getByText('On break'))
    const updater = onUpdateStaff.mock.calls[0][0]
    expect(updater(roster())[0].status).toBe('on-break')
  })

  it('completes a task from Up next and links to the full task board', () => {
    const onUpdateTasks = vi.fn()
    const nav = vi.fn()
    render(<StaffDashboard nav={nav} staffRoster={roster()} tasks={taskList()} zones={staffZones()}
      onUpdateTasks={onUpdateTasks} onUpdateStaff={vi.fn()} />)

    fireEvent.click(screen.getAllByText('Complete')[0])
    const updater = onUpdateTasks.mock.calls[0][0]
    expect(updater(taskList()).find(t => t.id === 't1').status).toBe('done')

    fireEvent.click(screen.getByText('All tasks'))
    expect(nav).toHaveBeenCalledWith('staff-tasks')
  })

  it('celebrates when every task is done', () => {
    const allDone = taskList().map(t => ({ ...t, status: 'done' }))
    render(<StaffDashboard nav={vi.fn()} staffRoster={roster()} tasks={allDone} zones={staffZones()}
      onUpdateTasks={vi.fn()} onUpdateStaff={vi.fn()} />)
    expect(screen.getByText(/All tasks complete/)).toBeTruthy()
  })

  it('falls back to the first zone when the steward\'s zone is not in the feed', () => {
    const zones = [{ id: 'X', name: 'North Stand', capacity: 100, current: 40, trend: 0 }]
    const lowTasks = taskList().map(t => t.id === 't3' ? { ...t, status: 'pending' } : t)
    render(<StaffDashboard nav={vi.fn()} staffRoster={roster()} tasks={lowTasks} zones={zones}
      onUpdateTasks={vi.fn()} onUpdateStaff={vi.fn()} />)
    expect(screen.getByText('40%')).toBeTruthy() // calm zone, calm accent
    expect(screen.getByText('Sweep concourse')).toBeTruthy() // low-priority chip row
  })
})

// ---- StaffProfile ---------------------------------------------------------------

describe('StaffProfile', () => {
  it('shows the honest no-shift state with a working log out', () => {
    const onLogout = vi.fn()
    render(<StaffProfile staffRoster={[]} tasks={[]} incidents={[]} onLogout={onLogout} />)
    expect(screen.getByText(/No shift yet/)).toBeTruthy()
    fireEvent.click(screen.getByText(/Log out/))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('shows shift details and only the incidents this steward filed', () => {
    render(<StaffProfile staffRoster={roster()} tasks={taskList()} incidents={incidentList()} onLogout={vi.fn()} />)
    expect(screen.getByText('Ava Torres')).toBeTruthy()
    expect(screen.getByText('AT')).toBeTruthy()
    expect(screen.getByText('08:00')).toBeTruthy()
    expect(screen.getByText('16:00')).toBeTruthy()
    // Filed by Ava — shown. Filed by others — not her history.
    expect(screen.getByText('Fan collapsed at stairs')).toBeTruthy()
    expect(screen.queryByText('Queue backing into concourse')).toBeNull()
  })

  it('shows an empty reporting history honestly', () => {
    render(<StaffProfile staffRoster={roster()} tasks={[]} incidents={[]} onLogout={vi.fn()} />)
    expect(screen.getByText(/No incidents filed yet this shift/)).toBeTruthy()
  })

  it('renders every severity and status chip in the reporting history', () => {
    const mine = [
      { ...incidentList()[0], reportedBy: 'Ava Torres', severity: 'high', status: 'new' },
      { ...incidentList()[1], id: 'INC-4', reportedBy: 'Ava Torres', severity: 'medium', status: 'assigned' },
      { ...incidentList()[2], id: 'INC-5', reportedBy: 'Ava Torres', severity: 'low', status: 'resolved' },
    ]
    render(<StaffProfile staffRoster={roster()} tasks={[]} incidents={mine} onLogout={vi.fn()} />)
    for (const chip of ['high', 'medium', 'low', 'new', 'assigned', 'resolved']) {
      expect(screen.getAllByText(chip).length).toBeGreaterThan(0)
    }
  })

  it('tolerates a missing incidents feed entirely', () => {
    render(<StaffProfile staffRoster={roster()} tasks={[]} incidents={undefined} onLogout={vi.fn()} />)
    expect(screen.getByText(/No incidents filed yet this shift/)).toBeTruthy()
  })
})

// ---- StaffIncident (AI intake) -----------------------------------------------------

const draftResponse = {
  title: 'Fan collapsed near Section 214 stairs',
  category: 'medical',
  severity: 'high',
  description: 'A woman has collapsed by the Section 214 stairs. She is conscious and reports chest pain. The crowd is bunching around her.',
  action: 'Send the nearest medic to the Section 214 stairs and clear a space around the casualty.',
}

describe('StaffIncident', () => {
  const zones = [{ id: 'C', name: 'East Concourse' }, { id: 'W1', name: 'West Concourse' }]

  it('drafts a structured report from rough notes and files it', async () => {
    aiMock.askAIJson.mockResolvedValue(draftResponse)
    const onFileIncident = vi.fn()
    render(<StaffIncident zones={zones} onFileIncident={onFileIncident} />)

    fireEvent.change(screen.getByPlaceholderText(/woman down near the stairs/), {
      target: { value: 'woman down by 214, chest hurts, crowd bunching' },
    })
    fireEvent.click(screen.getByText('Draft report with AI'))

    const title = await screen.findByDisplayValue(draftResponse.title)
    expect(title).toBeTruthy()
    expect(screen.getByDisplayValue(draftResponse.description)).toBeTruthy()
    expect(screen.getByText(/Responder's first action/)).toBeTruthy()
    expect(screen.getByText(draftResponse.action)).toBeTruthy()

    fireEvent.click(screen.getByText('File incident'))
    expect(onFileIncident).toHaveBeenCalledTimes(1)
    const filed = onFileIncident.mock.calls[0][0]
    expect(filed).toMatchObject({
      title: draftResponse.title,
      severity: 'high',
      category: 'medical',
      location: 'East Concourse',
      status: 'new',
      reportedBy: 'You',
      recommendedAction: draftResponse.action,
    })
    // The form resets for the next report.
    expect(screen.queryByDisplayValue(draftResponse.title)).toBeNull()
  })

  it('refuses to file without a title', () => {
    const onFileIncident = vi.fn()
    render(<StaffIncident zones={zones} onFileIncident={onFileIncident} />)
    fireEvent.click(screen.getByText('File incident'))
    expect(onFileIncident).not.toHaveBeenCalled()
  })

  it('falls back to zones A–F when no live zone feed exists', () => {
    render(<StaffIncident zones={[]} onFileIncident={vi.fn()} />)
    const zoneSelect = screen.getByLabelText('Incident zone')
    expect(within(zoneSelect).getByText('Zone A')).toBeTruthy()
    expect(within(zoneSelect).getByText('Zone F')).toBeTruthy()
  })

  it('supports manual severity selection and reflects it in the live preview', () => {
    render(<StaffIncident zones={zones} onFileIncident={vi.fn()} />)
    fireEvent.click(screen.getAllByText('high')[0])
    // Severity button + preview chip both read "high" once selected.
    expect(screen.getAllByText('high').length).toBeGreaterThanOrEqual(2)
  })

  it('says so when AI drafting is offline instead of pretending', () => {
    aiMock.status = { checking: false, configured: false }
    render(<StaffIncident zones={zones} onFileIncident={vi.fn()} />)
    expect(screen.getByText(/AI drafting is offline/)).toBeTruthy()
  })

  it('recovers when the assistant fails mid-draft', async () => {
    aiMock.askAIJson.mockRejectedValue(new AIError('rate limited', 'RATE_LIMIT'))
    render(<StaffIncident zones={zones} onFileIncident={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/woman down near the stairs/), {
      target: { value: 'spill near kiosk' },
    })
    fireEvent.click(screen.getByText('Draft report with AI'))
    await waitFor(() => expect(screen.getByText('Draft report with AI')).toBeTruthy())
    expect(screen.queryByText('Drafting report…')).toBeNull()
  })

  it('dictates into the raw notes box via the SpeechRecognition API', async () => {
    let instance
    class FakeRecognition {
      constructor() { instance = this; this.start = vi.fn(); this.stop = vi.fn() }
    }
    vi.stubGlobal('SpeechRecognition', FakeRecognition)

    render(<StaffIncident zones={zones} onFileIncident={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Dictate'))
    expect(instance.start).toHaveBeenCalledTimes(1)

    act(() => { instance.onresult({ results: [[{ transcript: 'help needed at gate' }]] }) })
    expect(screen.getByDisplayValue('help needed at gate')).toBeTruthy()

    // Second tap while listening stops the recogniser.
    fireEvent.click(screen.getByLabelText('Dictate'))
    expect(instance.stop).toHaveBeenCalledTimes(1)
    act(() => { instance.onend() })
  })

  it('degrades gracefully when the browser has no speech support', () => {
    render(<StaffIncident zones={zones} onFileIncident={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Dictate'))
    // No crash, no phantom listening state.
    expect(screen.getByPlaceholderText(/woman down near the stairs/)).toBeTruthy()
  })
})

// ---- OrganizerDashboard --------------------------------------------------------------

describe('OrganizerDashboard', () => {
  it('shows honest placeholders before any live venue data exists', () => {
    render(<OrganizerDashboard nav={vi.fn()} zones={[]} gates={[]} recommendations={[]} onUpdateRecs={vi.fn()} />)
    expect(screen.getByText(/No live venue data/)).toBeTruthy()
    expect(screen.getByText(/Heatmap offline/)).toBeTruthy()
    expect(screen.getByText(/No gate data/)).toBeTruthy()
    expect(screen.getByText(/Recommended actions appear here on matchday/)).toBeTruthy()
  })

  it('computes attendance, occupancy and average wait from the live feed', () => {
    render(<OrganizerDashboard nav={vi.fn()} zones={createSimZones()} gates={createSimGates()}
      recommendations={recList()} onUpdateRecs={vi.fn()} />)
    expect(screen.getByText('48,300')).toBeTruthy()   // Σ zone.current
    expect(screen.getByText('71%')).toBeTruthy()      // 48,300 / 68,000
    expect(screen.getByText('10 min')).toBeTruthy()   // mean wait, open gates only
    // Busiest gate first: Gate C at 18 minutes.
    expect(screen.getByText('18m')).toBeTruthy()
  })

  it('accepts and dismisses recommended actions through the updater', () => {
    const onUpdateRecs = vi.fn()
    render(<OrganizerDashboard nav={vi.fn()} zones={createSimZones()} gates={createSimGates()}
      recommendations={recList()} onUpdateRecs={onUpdateRecs} />)

    fireEvent.click(screen.getAllByText('Accept')[0])
    const accept = onUpdateRecs.mock.calls[0][0]
    expect(accept(recList()).find(r => r.id === 'r1').status).toBe('accepted')

    fireEvent.click(screen.getAllByText('Dismiss')[0])
    const dismiss = onUpdateRecs.mock.calls[1][0]
    expect(dismiss(recList()).find(r => r.id === 'r1').status).toBe('dismissed')
  })

  it('links into the heatmap and briefings screens', () => {
    const nav = vi.fn()
    render(<OrganizerDashboard nav={nav} zones={createSimZones()} gates={createSimGates()}
      recommendations={[]} onUpdateRecs={vi.fn()} />)
    fireEvent.click(screen.getByText('Open heatmap'))
    expect(nav).toHaveBeenCalledWith('organizer-heatmap')
    fireEvent.click(screen.getByText('All briefings'))
    expect(nav).toHaveBeenCalledWith('organizer-briefings')
  })
})

// ---- OrganizerHeatmap ------------------------------------------------------------------

describe('OrganizerHeatmap', () => {
  it('shows the no-crowd placeholder, and the real city map when the venue resolves', () => {
    venueMock.value = { resolved: true, lat: 32.75, lon: -97.08, city: 'Arlington', venue: 'AT&T Stadium' }
    const { container } = render(<OrganizerHeatmap zones={[]} gates={[]} />)
    expect(screen.getByText(/No crowd data yet/)).toBeTruthy()
    fireEvent.click(screen.getByText('City'))
    expect(container.querySelector('.leaflet-container')).toBeTruthy()
  })

  it('says it is still resolving the venue rather than showing a stand-in map', () => {
    render(<OrganizerHeatmap zones={[]} gates={[]} />)
    fireEvent.click(screen.getByText('City'))
    expect(screen.getByText(/Resolving the venue/)).toBeTruthy()
  })

  it('ranks zones by density and drills into a selected zone', () => {
    render(<OrganizerHeatmap zones={createSimZones()} gates={createSimGates()} />)
    // Busiest zone (West Fan Zone, 90%) is selected by default.
    expect(screen.getByText('West Fan Zone')).toBeTruthy()

    // Drill into E1 from the ranking list.
    const rankButton = screen.getAllByText('E1').map(el => el.closest('button')).find(Boolean)
    fireEvent.click(rankButton)
    expect(screen.getByText('East Concourse')).toBeTruthy()
    expect(screen.getByText(/gates? serving this zone/)).toBeTruthy()
  })

  it('switches between the stadium density map and the live city map', () => {
    venueMock.value = { resolved: true, lat: 32.75, lon: -97.08, city: 'Arlington', venue: 'AT&T Stadium' }
    const { container } = render(<OrganizerHeatmap zones={createSimZones()} gates={createSimGates()} />)
    fireEvent.click(screen.getByText('City'))
    expect(container.querySelector('.leaflet-container')).toBeTruthy()
    fireEvent.click(screen.getByText('Stadium'))
    expect(container.querySelector('.leaflet-container')).toBeNull()
  })

  it('lets the empty state flip back to the stadium placeholder too', () => {
    render(<OrganizerHeatmap zones={[]} gates={[]} />)
    fireEvent.click(screen.getByText('City'))
    fireEvent.click(screen.getByText('Stadium'))
    expect(screen.getByText(/No crowd data yet/)).toBeTruthy()
  })
})

// ---- OrganizerIncidents --------------------------------------------------------------------

describe('OrganizerIncidents', () => {
  it('shows the honest empty queue', () => {
    render(<OrganizerIncidents incidents={[]} staffRoster={roster()} onUpdateIncidents={vi.fn()} />)
    expect(screen.getByText(/No incidents reported/)).toBeTruthy()
  })

  it('counts and filters the queue by status', () => {
    render(<OrganizerIncidents incidents={incidentList()} staffRoster={roster()} onUpdateIncidents={vi.fn()} />)
    expect(screen.getByText('1 new · 1 in progress · 1 resolved')).toBeTruthy()

    fireEvent.click(screen.getByText('New · 1'))
    expect(screen.getByText('Fan collapsed at stairs')).toBeTruthy()
    expect(screen.queryByText('Water spill near kiosk')).toBeNull()

    fireEvent.click(screen.getByText('Resolved · 1'))
    expect(screen.getByText('Water spill near kiosk')).toBeTruthy()
    expect(screen.queryByText('Fan collapsed at stairs')).toBeNull()
  })

  it('assigns an incident to on-duty staff only, and resolves it', () => {
    const onUpdateIncidents = vi.fn()
    const staff = [...roster(), { id: 's2', name: 'Off Duty Dan', role: 'Steward', status: 'off-duty' }]
    render(<OrganizerIncidents incidents={incidentList()} staffRoster={staff} onUpdateIncidents={onUpdateIncidents} />)

    const assignSelect = screen.getByLabelText('Assign incident INC-1 to staff member')
    expect(within(assignSelect).queryByText(/Off Duty Dan/)).toBeNull()
    fireEvent.change(assignSelect, { target: { value: 'Ava Torres' } })
    const assign = onUpdateIncidents.mock.calls[0][0]
    const assigned = assign(incidentList()).find(i => i.id === 'INC-1')
    expect(assigned).toMatchObject({ assignedTo: 'Ava Torres', status: 'assigned' })

    fireEvent.click(screen.getAllByText('Resolve')[0])
    const resolve = onUpdateIncidents.mock.calls[1][0]
    expect(resolve(incidentList()).find(i => i.id === 'INC-1').status).toBe('resolved')
  })
})

// ---- OrganizerAnalytics -----------------------------------------------------------------------

describe('OrganizerAnalytics', () => {
  it('shows the honest no-telemetry state when the feed is silent', () => {
    render(<OrganizerAnalytics zones={[]} gates={[]} incidents={[]} />)
    expect(screen.getByText(/No analytics yet/)).toBeTruthy()
    expect(aiMock.askAIJson).not.toHaveBeenCalled()
  })

  it('auto-reads the venue on arrival, grounding the prompt in real telemetry', async () => {
    aiMock.askAIJson.mockResolvedValue({
      narrative: 'The venue is at 71% and filling steadily.',
      anomalies: [{ severity: 'high', what: 'Gate C wait is 18 min and climbing', why: 'Queue may back into the concourse' }],
    })
    render(<OrganizerAnalytics zones={createSimZones()} gates={createSimGates()} incidents={incidentList()} />)

    expect(await screen.findByText(/71% and filling steadily/)).toBeTruthy()
    expect(screen.getByText(/Gate C wait is 18 min/)).toBeTruthy()
    expect(screen.getByText(/back into the concourse/)).toBeTruthy()

    // The prompt quotes the actual feed — closed gates included, nothing invented.
    const { prompt } = aiMock.askAIJson.mock.calls[0][0]
    expect(prompt).toContain('48,300')
    expect(prompt).toContain('Gate F | CLOSED')
    expect(prompt).toContain('INCIDENTS FILED THIS MATCH: 3')
  })

  it('reports a quiet venue as quiet — no manufactured drama', async () => {
    aiMock.askAIJson.mockResolvedValue({ narrative: 'All quiet.', anomalies: [] })
    render(<OrganizerAnalytics zones={createSimZones()} gates={createSimGates()} incidents={[]} />)
    expect(await screen.findByText(/Nothing off-pattern/)).toBeTruthy()
  })

  it('surfaces assistant failures instead of stale or invented reads', async () => {
    aiMock.askAIJson.mockRejectedValue(new AIError('rate limited', 'RATE_LIMIT'))
    render(<OrganizerAnalytics zones={createSimZones()} gates={createSimGates()} incidents={[]} />)
    expect(await screen.findByText(/rate-limited right now/)).toBeTruthy()
  })

  it('builds the attendance trend from successive feed ticks', async () => {
    aiMock.askAIJson.mockResolvedValue({ narrative: 'ok', anomalies: [] })
    const tick = (bump) => createSimZones().map(z => ({ ...z, current: z.current + bump }))
    const { rerender, container } = render(
      <OrganizerAnalytics zones={tick(0)} gates={createSimGates()} incidents={[]} />)
    expect(screen.getByText(/Collecting the first few ticks/)).toBeTruthy()

    for (const bump of [80, 160, 240, 320]) {
      rerender(<OrganizerAnalytics zones={tick(bump)} gates={createSimGates()} incidents={[]} />)
    }
    await waitFor(() => expect(container.querySelector('.ff-spark-path')).toBeTruthy())
    expect(screen.getByText(/▲/)).toBeTruthy()
  })

  it('shows a falling trend and flags a gate whose wait has gone critical', async () => {
    aiMock.askAIJson.mockResolvedValue({ narrative: 'ok', anomalies: [] })
    const hotGates = [...createSimGates(), { id: 'X', waitMin: 25, isClosed: false, density: 96, stepFree: false }]
    const tick = (bump) => createSimZones().map(z => ({ ...z, current: z.current + bump }))
    const { rerender } = render(<OrganizerAnalytics zones={tick(0)} gates={hotGates} incidents={[]} />)
    for (const bump of [-80, -160, -240, -320]) {
      rerender(<OrganizerAnalytics zones={tick(bump)} gates={hotGates} incidents={[]} />)
    }
    await waitFor(() => expect(screen.getByText(/▼/)).toBeTruthy())
    expect(screen.getByText('25 min')).toBeTruthy()
  })
})

// ---- StaffTranslation (voice + speech synthesis) ---------------------------------------------

describe('StaffTranslation voice loop', () => {
  it('dictates a phrase, translates it, and reads results aloud', async () => {
    aiMock.askAIJson.mockResolvedValue({
      translation: '¿Dónde está la puerta C?', back: 'Where is gate C?', note: '',
      replies: [{ target: 'Por allí', source: 'Over there' }],
    })
    let instance
    class FakeRecognition {
      constructor() { instance = this; this.start = vi.fn(); this.stop = vi.fn() }
    }
    vi.stubGlobal('SpeechRecognition', FakeRecognition)
    const speak = vi.fn()
    vi.stubGlobal('speechSynthesis', { speak })
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(text) { this.text = text } })

    render(<StaffTranslation />)
    fireEvent.click(screen.getByLabelText('Dictate'))
    expect(instance.start).toHaveBeenCalledTimes(1)

    await act(async () => { instance.onresult({ results: [[{ transcript: 'Where is gate C' }]] }) })
    // Appears in the result box and in the session history.
    expect((await screen.findAllByText('¿Dónde está la puerta C?')).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByLabelText('Read aloud'))
    expect(speak).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getAllByLabelText('Play')[0])
    expect(speak).toHaveBeenCalledTimes(2)

    act(() => { instance.onend() })
  })

  it('stops the recogniser on a second tap while listening', () => {
    let instance
    class FakeRecognition {
      constructor() { instance = this; this.start = vi.fn(); this.stop = vi.fn() }
    }
    vi.stubGlobal('SpeechRecognition', FakeRecognition)
    render(<StaffTranslation />)
    fireEvent.click(screen.getByLabelText('Dictate'))
    fireEvent.click(screen.getByLabelText('Dictate'))
    expect(instance.stop).toHaveBeenCalledTimes(1)
  })

  it('does nothing — and does not crash — without browser speech support', () => {
    render(<StaffTranslation />)
    fireEvent.click(screen.getByLabelText('Dictate'))
    expect(screen.getByLabelText('Dictate')).toBeTruthy()
  })
})

// ---- StatCard -----------------------------------------------------------------------------------

describe('StatCard', () => {
  it('renders value, label, sub and an upward trend chip', () => {
    render(<StatCard icon="users" label="In attendance" value={48300} sub="71% of capacity" trend="+1,200" />)
    expect(screen.getByText('48,300')).toBeTruthy()
    expect(screen.getByText('In attendance')).toBeTruthy()
    expect(screen.getByText('71% of capacity')).toBeTruthy()
    expect(screen.getByText(/▲ \+1,200/)).toBeTruthy()
  })

  it('renders a downward trend and decimal formatting with prefix/suffix', () => {
    render(<StatCard icon="leaf" label="Per fan" value={3.5} decimals={1} prefix="~" suffix=" kg" trend="0.4" trendDir="down" />)
    expect(screen.getByText('~3.5 kg')).toBeTruthy()
    expect(screen.getByText(/▼ 0.4/)).toBeTruthy()
  })
})

// ---- OrganizerSustainability --------------------------------------------------------------------

describe('OrganizerSustainability', () => {
  it('computes the footprint from real factors and shows the generated briefing', async () => {
    aiMock.askAIJson.mockResolvedValue({
      headline: 'Transit already carries a third of this crowd.',
      insight: 'Single-occupancy rideshare dominates the footprint.',
      actions: [{ title: 'Boost shuttle frequency', detail: 'Target the rideshare share.', saving: '3.1 t CO2e per match' }],
    })
    render(<OrganizerSustainability zones={[]} />)

    // Feed quiet → attendance falls back to a full house of 60,000.
    expect(screen.getByText('60,000')).toBeTruthy()
    expect(await screen.findByText(/Transit already carries/)).toBeTruthy()
    expect(screen.getByText('Boost shuttle frequency')).toBeTruthy()
    expect(screen.getByText('3.1 t CO2e per match')).toBeTruthy()
    // The factor provenance is shown to the organizer, not hidden.
    expect(screen.getAllByText(/DEFRA/).length).toBeGreaterThan(0)
    // Perspective panel: avoided tonnage vs everyone driving alone.
    expect(screen.getByText(/tonnes of CO₂e/)).toBeTruthy()
  })

  it('derives attendance from the live zones when the feed is reporting', () => {
    aiMock.askAIJson.mockResolvedValue({ headline: '', insight: '', actions: [] })
    render(<OrganizerSustainability zones={createSimZones()} />)
    expect(screen.getByText('48,300')).toBeTruthy()
  })

  it('surfaces assistant failures honestly', async () => {
    aiMock.askAIJson.mockRejectedValue(new AIError('offline', 'OFFLINE'))
    render(<OrganizerSustainability zones={[]} />)
    expect(await screen.findByText(/Can't reach the assistant/)).toBeTruthy()
  })
})
