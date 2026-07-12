// @vitest-environment jsdom
//
// Full-app smoke tests: mount the REAL <App/> in jsdom and walk the journeys
// a judge would walk — landing → login → each role's dashboard → sign-up.
// No component is mocked; only the network and browser APIs jsdom lacks are
// stubbed. A crash anywhere in a default screen fails one of these.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import App from '../src/App.jsx'
import ErrorBoundary from '../src/components/ErrorBoundary.jsx'
import { fanTabs, staffTabs, organizerTabs } from '../src/data.js'

// ---- browser APIs jsdom does not implement -----------------------------

class NoopObserver {
  observe() {} unobserve() {} disconnect() {} takeRecords() { return [] }
}

// This Node/jsdom combination ships a non-functional localStorage (Node's own
// experimental global shadows jsdom's), so the tests provide a real in-memory
// one. `store` is inspected directly by the password-persistence test.
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
  // Every external feed (fixtures, weather, FX, /api/ai health) answers with
  // an empty body, so the UI must fall back to its honest offline states.
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true, status: 200, json: async () => ({}), text: async () => '',
  })))
  vi.stubGlobal('localStorage', memoryStorage)
  store.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// "Enter FanFare" appears in both the nav and the page CTAs — any of them
// works. It leads to sign-up; the "Log in" link leads to the login screen.
const goRegisterScreen = () => fireEvent.click(screen.getAllByText('Enter FanFare')[0])
const goLoginScreen = () => fireEvent.click(screen.getAllByText('Log in')[0])

const fillCredentials = () => {
  fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'fan@example.com' } })
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pw-123456' } })
}

// Every dashboard chunk is lazy-loaded behind Suspense, so entering a portal
// must be awaited via findBy*.
async function expectDashboard(tabs) {
  const sidebar = await screen.findByRole('navigation', { name: /navigation/i }, { timeout: 5000 })
  for (const tab of tabs) {
    expect(within(sidebar).getAllByText(tab.label).length).toBeGreaterThan(0)
  }
}

// ---- landing ------------------------------------------------------------

describe('landing page', () => {
  it('renders the marketing nav and a skip link as the first focusable element', () => {
    render(<App />)
    expect(screen.getByText('Skip to main content')).toBeTruthy()
    expect(screen.getAllByText('How it works').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Enter FanFare').length).toBeGreaterThan(0)
  })

  it('"Enter FanFare" leads to account creation', () => {
    render(<App />)
    goRegisterScreen()
    expect(screen.getByText('Create your account for the 2026 tournament.')).toBeTruthy()
  })

  it('"Log in" leads to the login screen', () => {
    render(<App />)
    goLoginScreen()
    expect(screen.getByText("Choose how you're joining the tournament.")).toBeTruthy()
  })
})

// ---- login → each role's dashboard ---------------------------------------

describe('role portals', () => {
  it('login WITHOUT credentials is refused', () => {
    render(<App />)
    goLoginScreen()
    fireEvent.click(screen.getByText('Continue as a Fan'))
    expect(screen.getByText('Please enter a valid email address.')).toBeTruthy()
    // Still on the login screen — no dashboard was entered.
    expect(screen.getByText("Choose how you're joining the tournament.")).toBeTruthy()
  })

  it('login with an email but NO password is refused', () => {
    render(<App />)
    goLoginScreen()
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'fan@example.com' } })
    fireEvent.click(screen.getByText('Continue as a Fan'))
    expect(screen.getByText('Please enter your password.')).toBeTruthy()
  })

  it('fan login lands on the fan dashboard with every fan tab present', async () => {
    render(<App />)
    goLoginScreen()
    fillCredentials()
    fireEvent.click(screen.getByText('Continue as a Fan'))
    await expectDashboard(fanTabs)
  })

  it('staff login lands on the staff dashboard with every staff tab present', async () => {
    render(<App />)
    goLoginScreen()
    fireEvent.click(screen.getByText('Staff'))
    fillCredentials()
    fireEvent.click(screen.getByText('Continue as Staff'))
    await expectDashboard(staffTabs)
  })

  it('organizer login lands on the organizer dashboard with every organizer tab present', async () => {
    render(<App />)
    goLoginScreen()
    fireEvent.click(screen.getByText('Organizer'))
    fillCredentials()
    fireEvent.click(screen.getByText('Continue as an Organizer'))
    await expectDashboard(organizerTabs)
  })
})

// ---- sign-up -------------------------------------------------------------

describe('sign-up', () => {
  const goRegister = () => {
    render(<App />)
    goRegisterScreen()
    expect(screen.getByText('Create your account for the 2026 tournament.')).toBeTruthy()
  }

  it('refuses to continue without a name', () => {
    goRegister()
    fireEvent.click(screen.getByText('Create a Fan account'))
    expect(screen.getByText('Please enter your name to continue.')).toBeTruthy()
  })

  it('refuses to continue without a valid email or password', () => {
    goRegister()
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Ada Lovelace' } })
    fireEvent.click(screen.getByText('Create a Fan account'))
    expect(screen.getByText('Please enter a valid email address.')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'ada@example.com' } })
    fireEvent.click(screen.getByText('Create a Fan account'))
    expect(screen.getByText('Please create a password.')).toBeTruthy()
  })

  it('persists name and email — and NEVER the password — then enters the dashboard', async () => {
    goRegister()
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Ada Lovelace' } })
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'hunter2-secret' } })
    fireEvent.click(screen.getByText('Create a Fan account'))

    await expectDashboard(fanTabs)

    const saved = store.get('ff-user') || ''
    expect(saved).toContain('Ada Lovelace')
    expect(saved).toContain('ada@example.com')
    // The password must never touch persistent storage anywhere, under any key.
    const allStorage = [...store.values()].join(' ')
    expect(allStorage).not.toContain('hunter2-secret')
  })
})

// ---- error boundary --------------------------------------------------------

describe('error boundary', () => {
  it('catches a render crash, shows the recovery screen, and can reset', () => {
    // The crash itself is expected noise — keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    let shouldThrow = true
    function Bomb() {
      if (shouldThrow) throw new Error('boom')
      return <p>recovered content</p>
    }
    render(<ErrorBoundary><Bomb /></ErrorBoundary>)

    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Something went wrong on this screen')).toBeTruthy()

    shouldThrow = false
    fireEvent.click(screen.getByText('Reload screen'))
    expect(screen.getByText('recovered content')).toBeTruthy()
  })
})
