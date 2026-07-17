// @vitest-environment jsdom
//
// Behavioral tests for the presentational screens and shell chrome the
// journey tests only pass through: the theme toggle, the About page, the
// landing impact/portals sections, the weather tile's honest no-venue state,
// the sparkline, the fan profile, and the dashboard shell's notification and
// avatar menus. Only the network and missing browser APIs are stubbed —
// every rendered branch below is production code.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, cleanup, within, waitFor, act } from '@testing-library/react'
import ThemeToggle from '../src/components/dashboard/ThemeToggle.jsx'
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider.jsx'
import WorldCupFeed from '../src/components/dashboard/shared/WorldCupFeed.jsx'
import { toast, ToastHost } from '../src/components/dashboard/shared/Toast.jsx'
import About from '../src/components/About.jsx'
import ImpactTeaser from '../src/components/landing/ImpactTeaser.jsx'
import Portals from '../src/components/landing/Portals.jsx'
import Sparkline from '../src/components/dashboard/shared/Sparkline.jsx'
import WeatherTile from '../src/components/dashboard/shared/WeatherTile.jsx'
import FanProfile from '../src/components/dashboard/fan/FanProfile.jsx'
import DashboardShell from '../src/components/dashboard/DashboardShell.jsx'
import { problems, commitments, portals, languages, fanTabs, createFanProfile } from '../src/data.js'

// ---- module mocks ---------------------------------------------------------

// WeatherTile reads live weather + the resolved venue; both are external
// feeds, so they are mocked at the module boundary like the other UI suites.
const weatherMock = vi.hoisted(() => ({
  weather: { loading: false, live: true, temp: 24, feels: 26, wind: 12, humidity: 40, code: 1 },
  geocodeCity: vi.fn(),
}))
vi.mock('../src/lib/freeApis.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useWeather: () => weatherMock.weather,
    geocodeCity: (...a) => weatherMock.geocodeCity(...a),
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

const store = new Map()
const memoryStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(String(k), String(v)) },
  removeItem: k => { store.delete(k) },
  clear: () => { store.clear() },
  key: i => [...store.keys()][i] ?? null,
  get length() { return store.size },
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', NoopObserver)
  vi.stubGlobal('ResizeObserver', NoopObserver)
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  })))
  window.scrollTo = () => {}
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true, status: 200, json: async () => ({}), text: async () => '',
  })))
  vi.stubGlobal('localStorage', memoryStorage)
  store.clear()
  weatherMock.weather = { loading: false, live: true, temp: 24, feels: 26, wind: 12, humidity: 40, code: 1 }
  weatherMock.geocodeCity.mockReset()
  venueMock.value = { resolved: false, lat: null, lon: null, city: null, venue: null }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---- ThemeToggle + ThemeProvider ------------------------------------------

describe('ThemeToggle', () => {
  it('starts dark, flips to light on click, and reflects the theme on <html>', () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    const btn = screen.getByRole('button', { name: 'Switch to light theme' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    fireEvent.click(btn)
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeTruthy()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(store.get('ff-theme')).toBe('light')
  })

  it('honours a previously saved light theme on first render', () => {
    store.set('ff-theme', 'light')
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeTruthy()
  })

  it('honours a previously saved dark theme even when the OS prefers light', () => {
    store.set('ff-theme', 'dark')
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true, addEventListener() {}, removeEventListener() {},
      addListener() {}, removeListener() {},
    })))
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeTruthy()
  })

  it('follows the OS light preference on a genuine first visit', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true, addEventListener() {}, removeEventListener() {},
      addListener() {}, removeListener() {},
    })))
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeTruthy()
  })

  it('exposes setTheme for direct selection alongside the toggle', () => {
    function Consumer() {
      const { theme, setTheme } = useTheme()
      return <button onClick={() => setTheme('light')}>theme-{theme}</button>
    }
    render(<ThemeProvider><Consumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('theme-dark'))
    expect(screen.getByText('theme-light')).toBeTruthy()
    expect(store.get('ff-theme')).toBe('light')
  })
})

// ---- WorldCupFeed ------------------------------------------------------------

const wcMatch = (over = {}) => ({
  id: 'm1', home: 'USA', away: 'Mexico', hs: '2', as: '1',
  ts: '2026-07-13 19:00:00', venue: 'AT&T Stadium', city: 'Arlington',
  status: 'FT', homeBadge: 'usa.png', awayBadge: '',
  ...over,
})

describe('WorldCupFeed', () => {
  it('shows skeletons while the feed loads', () => {
    const { container } = render(<WorldCupFeed data={{ loading: true, live: false, results: [], fixtures: [], leagueBadge: null }} />)
    expect(container.querySelectorAll('.ff-skeleton').length).toBeGreaterThan(0)
  })

  it('admits when fixtures are unavailable instead of showing stale ones', () => {
    render(<WorldCupFeed data={{ loading: false, live: false, results: [], fixtures: [], leagueBadge: null }} />)
    expect(screen.getByText(/momentarily unavailable/)).toBeTruthy()
    expect(screen.getByText('Offline')).toBeTruthy()
  })

  it('renders results with scores, fixtures with kickoff times, and crest fallbacks', () => {
    render(<WorldCupFeed data={{
      loading: false, live: true, leagueBadge: 'wc.png',
      results: [wcMatch()],
      fixtures: [wcMatch({ id: 'm2', home: 'Canada', away: 'Japan', hs: null, as: null, ts: '2026-07-15 19:00:00', venue: 'BMO Field', city: '', status: 'NS', homeBadge: '' })],
    }} />)
    expect(screen.getByText('Latest results')).toBeTruthy()
    expect(screen.getByText('Upcoming')).toBeTruthy()
    expect(screen.getByText('Live')).toBeTruthy()
    expect(screen.getByText('USA')).toBeTruthy()
    // Away team has no crest in the feed — a 3-letter fallback, not a broken image.
    expect(screen.getByText('MEX')).toBeTruthy()
    expect(screen.getByText('CAN')).toBeTruthy()
    expect(screen.getByText(/AT&T Stadium · Arlington/)).toBeTruthy()
    expect(screen.getByText('BMO Field')).toBeTruthy()
  })
})

// ---- Toast --------------------------------------------------------------------

describe('ToastHost', () => {
  it('shows a toast with defaults and removes it after its lifetime', () => {
    vi.useFakeTimers()
    render(<ToastHost />)
    act(() => { toast('Saved') })
    expect(screen.getByText('Saved')).toBeTruthy()
    act(() => { toast('Task completed', { icon: 'check', accent: '#0a7d3e' }) })
    expect(screen.getByText('Task completed')).toBeTruthy()

    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.queryByText('Saved')).toBeNull()
    expect(screen.queryByText('Task completed')).toBeNull()
    vi.useRealTimers()
  })
})

// ---- About page ------------------------------------------------------------

describe('About page', () => {
  it('renders the hero, every problem row and every commitment card', () => {
    render(<About handlers={{ goRegister: vi.fn(), goHome: vi.fn() }} />)
    expect(screen.getByText(/appears overnight/i)).toBeTruthy()
    for (const pr of problems) expect(screen.getByText(pr.text)).toBeTruthy()
    for (const c of commitments) expect(screen.getByText(c.title)).toBeTruthy()
  })

  it('routes its CTAs to register and home', () => {
    const handlers = { goRegister: vi.fn(), goHome: vi.fn() }
    render(<About handlers={handlers} />)
    fireEvent.click(screen.getByText('Enter FanFare'))
    expect(handlers.goRegister).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByText('Back to home'))
    expect(handlers.goHome).toHaveBeenCalledTimes(1)
  })
})

// ---- Landing: ImpactTeaser --------------------------------------------------

describe('ImpactTeaser', () => {
  it('renders the three pillars and routes both CTAs', () => {
    const handlers = { goAbout: vi.fn(), goHow: vi.fn() }
    render(<ImpactTeaser handlers={handlers} />)
    for (const kicker of ['Accessibility', 'Sustainability', 'Safety']) {
      expect(screen.getByText(kicker)).toBeTruthy()
    }
    fireEvent.click(screen.getByText('Explore our impact'))
    expect(handlers.goAbout).toHaveBeenCalledTimes(1)
    const how = screen.getByText('See how it works')
    fireEvent.mouseEnter(how)
    fireEvent.mouseLeave(how)
    fireEvent.click(how)
    expect(handlers.goHow).toHaveBeenCalledTimes(1)
  })

  it('drops the decorative ball image if the asset fails to load', () => {
    const { container } = render(<ImpactTeaser handlers={{ goAbout: vi.fn(), goHow: vi.fn() }} />)
    const ball = container.querySelector('img[src*="fifa-ball"]')
    expect(ball).toBeTruthy()
    fireEvent.error(ball)
    expect(container.querySelector('img[src*="fifa-ball"]')).toBeNull()
  })
})

// ---- Landing: Portals --------------------------------------------------------

describe('Portals', () => {
  it('marks the active role, previews it, and reports rail clicks', () => {
    const setActivePortal = vi.fn()
    render(<Portals activePortal={0} setActivePortal={setActivePortal}
      handlers={{ enterAs: () => vi.fn() }} />)

    const rail = screen.getAllByRole('button', { pressed: true })
    expect(rail).toHaveLength(1)
    // Fan preview shows the mini e-ticket schematic.
    expect(screen.getByText('View e-ticket')).toBeTruthy()

    fireEvent.click(screen.getByText(portals[1].title))
    expect(setActivePortal).toHaveBeenCalledWith(1)
  })

  it('previews the staff and organizer portals when active', () => {
    const noHandlers = { enterAs: () => vi.fn() }
    const { rerender } = render(<Portals activePortal={1} setActivePortal={vi.fn()} handlers={noHandlers} />)
    expect(screen.getByText('Restock water station')).toBeTruthy()
    rerender(<Portals activePortal={2} setActivePortal={vi.fn()} handlers={noHandlers} />)
    expect(screen.getByText('Live heatmap')).toBeTruthy()
  })

  it('defaults to the first portal and wires the CTA to enterAs(role)', () => {
    const enter = vi.fn()
    const enterAs = vi.fn(() => enter)
    render(<Portals activePortal={null} setActivePortal={vi.fn()} handlers={{ enterAs }} />)
    expect(enterAs).toHaveBeenCalledWith(portals[0].role)
    fireEvent.click(screen.getByText(portals[0].cta))
    expect(enter).toHaveBeenCalledTimes(1)
  })
})

// ---- Sparkline ----------------------------------------------------------------

describe('Sparkline', () => {
  it('renders nothing for an empty series — no fabricated flat line', () => {
    const { container } = render(<Sparkline data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('draws the line, the area fill and the live endpoint dot', () => {
    const { container } = render(<Sparkline data={[3, 7, 4, 9]} width={100} height={40} />)
    expect(container.querySelector('polyline.ff-spark-path')).toBeTruthy()
    expect(container.querySelector('polygon')).toBeTruthy()
    expect(container.querySelectorAll('circle').length).toBeGreaterThan(0)
  })

  it('omits the area fill when fill is off', () => {
    const { container } = render(<Sparkline data={[3, 7, 4]} fill={false} />)
    expect(container.querySelector('polygon')).toBeNull()
  })
})

// ---- WeatherTile ----------------------------------------------------------------

describe('WeatherTile', () => {
  it('shows a skeleton — never a stand-in city — while no venue is resolved', () => {
    const { container } = render(<WeatherTile />)
    expect(container.querySelectorAll('.ff-skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText(/°/)).toBeNull()
  })

  it('shows live conditions at the venue the real feed resolves', async () => {
    venueMock.value = { resolved: true, lat: 32.75, lon: -97.08, city: 'Arlington', venue: 'AT&T Stadium' }
    render(<WeatherTile />)
    expect(await screen.findByText('Arlington')).toBeTruthy()
    expect(screen.getByText('24°')).toBeTruthy()
    expect(screen.getByText('Live')).toBeTruthy()
    // Full (non-compact) tile also shows the feels/wind/humidity strip.
    expect(screen.getByText('26°')).toBeTruthy()
    expect(screen.getByText('12 km/h')).toBeTruthy()
    expect(screen.getByText('40%')).toBeTruthy()
  })

  it('geocodes an explicit city and hides the stats strip in compact mode', async () => {
    weatherMock.geocodeCity.mockResolvedValue({ lat: 19.3, lon: -99.15, label: 'Mexico City' })
    render(<WeatherTile city="Mexico City" compact />)
    expect(await screen.findByText('Mexico City')).toBeTruthy()
    expect(weatherMock.geocodeCity).toHaveBeenCalledWith('Mexico City')
    expect(screen.queryByText('Humidity')).toBeNull()
  })

  it('labels a stale feed Offline instead of pretending it is live', async () => {
    weatherMock.weather = { ...weatherMock.weather, live: false }
    venueMock.value = { resolved: true, lat: 32.75, lon: -97.08, city: 'Arlington', venue: 'AT&T Stadium' }
    render(<WeatherTile />)
    expect(await screen.findByText('Offline')).toBeTruthy()
  })
})

// ---- FanProfile -----------------------------------------------------------------

const confirmedProfile = () => ({
  ...createFanProfile(),
  name: 'Riya Sharma',
  email: 'riya@example.com',
  ticketConfirmed: true,
  ticketId: 'WC26-88421',
  gate: 'C',
  section: '214',
  row: '12',
  seat: '8',
  accessibility: { wheelchair: true, sensory: false, largeText: true, audioContent: false },
  rewards: { points: 120, scans: 5, level: 'Green Champion' },
})

describe('FanProfile', () => {
  it('shows the confirmed ticket, active accessibility prefs and rewards', () => {
    render(<FanProfile fanProfile={confirmedProfile()} onUpdateProfile={vi.fn()} onLogout={vi.fn()} />)
    expect(screen.getByText('Riya Sharma')).toBeTruthy()
    expect(screen.getByText('RS')).toBeTruthy()
    expect(screen.getByText('WC26-88421')).toBeTruthy()
    expect(screen.getByText('Gate C')).toBeTruthy()
    expect(screen.getByText('Row 12 · Seat 8')).toBeTruthy()
    expect(screen.getByText('wheelchair')).toBeTruthy()
    expect(screen.getByText('large Text')).toBeTruthy()
    expect(screen.getByText('120')).toBeTruthy()
    expect(screen.getByText(/5 scans/)).toBeTruthy()
  })

  it('shows honest empty states before a ticket, prefs or points exist', () => {
    render(<FanProfile fanProfile={createFanProfile()} onUpdateProfile={vi.fn()} onLogout={vi.fn()} />)
    expect(screen.getByText('Fan')).toBeTruthy()
    expect(screen.getByText(/No ticket added yet/)).toBeTruthy()
    expect(screen.getByText(/No accessibility preferences set/)).toBeTruthy()
    expect(screen.getByText(/No points yet/)).toBeTruthy()
    expect(screen.getByText(/Create an account to save your details/)).toBeTruthy()
  })

  it('updates the language preference end-to-end through the profile updater', () => {
    // Stateful harness: the select is controlled, so the change must round-trip
    // through the updater and back into the prop to stick.
    function Harness() {
      const [profile, setProfile] = useState(confirmedProfile)
      return <FanProfile fanProfile={profile} onUpdateProfile={setProfile} onLogout={vi.fn()} />
    }
    render(<Harness />)
    const select = screen.getByLabelText('Preferred language')
    fireEvent.change(select, { target: { value: languages[1] } })
    expect(select.value).toBe(languages[1])
  })

  it('logs out from the profile page', () => {
    const onLogout = vi.fn()
    render(<FanProfile fanProfile={createFanProfile()} onUpdateProfile={vi.fn()} onLogout={onLogout} />)
    fireEvent.click(screen.getByText(/Log out/))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})

// ---- DashboardShell chrome ---------------------------------------------------------

const MIN = 60_000
const shellNotifications = () => [
  { id: 'n1', title: 'Gate change', body: 'Enter via Gate C tonight.', time: new Date(Date.now() - 30_000).toISOString(), read: false },
  { id: 'n2', title: 'Kickoff soon', body: 'Match starts in 45 minutes.', time: new Date(Date.now() - 5 * MIN).toISOString(), read: true },
  { id: 'n3', title: 'Shuttle running', body: 'Stadium loop every 10 min.', time: new Date(Date.now() - 2 * 60 * MIN).toISOString(), read: true },
  { id: 'n4', title: 'Welcome', body: 'Thanks for joining FanFare.', time: new Date(Date.now() - 3 * 24 * 60 * MIN).toISOString(), read: true },
]

function renderShell(overrides = {}) {
  const props = {
    role: 'fan',
    tabs: fanTabs,
    screen: fanTabs[0].id,
    nav: vi.fn(),
    notifications: shellNotifications(),
    onMarkRead: vi.fn(),
    onLogout: vi.fn(),
    onSwitchRole: vi.fn(),
    userName: 'Riya Sharma',
    ...overrides,
  }
  render(<DashboardShell {...props}><div>Screen body</div></DashboardShell>)
  return props
}

describe('DashboardShell notifications', () => {
  it('opens the panel, lists items with relative times, and marks one read', async () => {
    const props = renderShell()
    const bell = screen.getByRole('button', { name: 'Notifications, 1 unread' })
    fireEvent.click(bell)

    expect(await screen.findByText('Gate change')).toBeTruthy()
    expect(screen.getByText('Just now')).toBeTruthy()
    expect(screen.getByText('5m ago')).toBeTruthy()
    expect(screen.getByText('2h ago')).toBeTruthy()
    expect(screen.getByText('3d ago')).toBeTruthy()

    fireEvent.click(screen.getByText('Gate change'))
    expect(props.onMarkRead).toHaveBeenCalledWith('n1')
    fireEvent.keyDown(screen.getByText('Kickoff soon').closest('[role="button"]'), { key: 'Enter' })
    expect(props.onMarkRead).toHaveBeenCalledWith('n2')
  })

  it('navigates to the full notifications screen from View all (fan only)', async () => {
    const props = renderShell()
    // Both the topbar bell and the sidebar tab are named "Notifications" —
    // scope to the topbar to hit the bell (same trick as the journey tests).
    const topbar = within(document.querySelector('header'))
    fireEvent.click(topbar.getByRole('button', { name: /^Notifications/ }))
    fireEvent.click(await screen.findByText('View all notifications'))
    expect(props.nav).toHaveBeenCalledWith('fan-notifications')
    await waitFor(() => expect(screen.queryByText('View all notifications')).toBeNull())
  })

  it('closes via the click-away scrim', async () => {
    renderShell()
    const topbar = within(document.querySelector('header'))
    fireEvent.click(topbar.getByRole('button', { name: /^Notifications/ }))
    await screen.findByText('Gate change')
    fireEvent.click(document.querySelector('[aria-hidden="true"][style*="fixed"]'))
    await waitFor(() => expect(screen.queryByText('Gate change')).toBeNull())
  })
})

describe('DashboardShell avatar menu', () => {
  it('opens the menu and routes profile, switch role and log out', async () => {
    const props = renderShell()
    const avatar = screen.getByRole('button', { name: 'Profile menu' })
    expect(avatar.textContent).toBe('RS')

    fireEvent.click(avatar)
    fireEvent.click(await screen.findByRole('menuitem', { name: /Profile/ }))
    expect(props.nav).toHaveBeenCalledWith('fan-profile')

    fireEvent.click(avatar)
    fireEvent.click(await screen.findByRole('menuitem', { name: /Switch role/ }))
    expect(props.onSwitchRole).toHaveBeenCalledTimes(1)

    fireEvent.click(avatar)
    fireEvent.click(await screen.findByRole('menuitem', { name: /Log out/ }))
    expect(props.onLogout).toHaveBeenCalledTimes(1)
  })

  it('closes when clicking outside', async () => {
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Profile menu' }))
    await screen.findByRole('menu')
    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })
})

describe('DashboardShell brand button', () => {
  it('leaves immediately for fans', () => {
    const props = renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Return to home' }))
    expect(props.onLogout).toHaveBeenCalledTimes(1)
  })

  it('asks organizers to confirm before abandoning the control room', () => {
    const confirmMock = vi.fn(() => false)
    vi.stubGlobal('confirm', confirmMock)
    const props = renderShell({ role: 'organizer' })
    fireEvent.click(screen.getByRole('button', { name: 'Return to home' }))
    expect(confirmMock).toHaveBeenCalled()
    expect(props.onLogout).not.toHaveBeenCalled()

    confirmMock.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Return to home' }))
    expect(props.onLogout).toHaveBeenCalledTimes(1)
  })
})
