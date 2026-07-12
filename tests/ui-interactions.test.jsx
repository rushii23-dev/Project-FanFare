// @vitest-environment jsdom
//
// Behavioral tests: where the journey tests prove every screen renders, these
// prove the screens actually WORK — the fan's ticket drives the gate panels,
// a staff incident really reaches the organizer's triage queue and their
// notification bell, and triage actions change state. The real <App/> is
// mounted; state flows through App's shared dataset exactly as in production.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within, waitFor, renderHook, act } from '@testing-library/react'
import App from '../src/App.jsx'
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider.jsx'

// ---- browser APIs jsdom does not implement -----------------------------

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

let matchMediaMatches
beforeEach(() => {
  matchMediaMatches = () => false
  vi.stubGlobal('IntersectionObserver', NoopObserver)
  vi.stubGlobal('ResizeObserver', NoopObserver)
  vi.stubGlobal('matchMedia', vi.fn(q => ({
    matches: matchMediaMatches(q), addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  })))
  window.scrollTo = () => {}
  Element.prototype.scrollTo = Element.prototype.scrollTo || (() => {})
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

const login = async (roleButton, continueLabel) => {
  fireEvent.click(screen.getAllByText('Log in')[0])
  if (roleButton) fireEvent.click(screen.getByText(roleButton))
  fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'user@example.com' } })
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pw-123456' } })
  fireEvent.click(screen.getByText(continueLabel))
  return await screen.findByRole('navigation', { name: /navigation/i }, { timeout: 5000 })
}

const openTab = async (sidebar, label) => {
  fireEvent.click(within(sidebar).getByText(label))
  await waitFor(() => {
    expect(within(sidebar).getByText(label).closest('button').getAttribute('aria-current')).toBe('page')
  }, { timeout: 5000 })
}

// ---- fan: the ticket drives everything ----------------------------------

describe('fan ticket flow', () => {
  it('saving a real ticket populates the gate/zone panels and the e-ticket modal', async () => {
    render(<App />)
    await login(null, 'Continue as a Fan')

    // Fill the four ticket fields exactly as printed.
    fireEvent.change(await screen.findByPlaceholderText('C'), { target: { value: 'b' } })
    fireEvent.change(screen.getByPlaceholderText('214'), { target: { value: '214' } })
    fireEvent.change(screen.getByPlaceholderText('12'), { target: { value: '12' } })
    fireEvent.change(screen.getByPlaceholderText('8'), { target: { value: '8' } })
    fireEvent.click(screen.getByText('Save ticket'))

    // The gate panel now shows the fan's REAL gate (input was normalised to B)…
    expect(await screen.findByText(/wait at Gate B/i)).toBeTruthy()

    // …and the e-ticket modal shows the derived ticket id and seat.
    fireEvent.click(screen.getByText('View'))
    const dialog = await screen.findByRole('dialog', { name: /e-ticket/i })
    expect(within(dialog).getByText('FF-2026-B214-12-8')).toBeTruthy()
    expect(within(dialog).getByText('Row 12 · Seat 8')).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /e-ticket/i })).toBeNull())
  }, 30000)

  it('a half-filled ticket is refused and no gate data is invented', async () => {
    render(<App />)
    await login(null, 'Continue as a Fan')

    fireEvent.change(await screen.findByPlaceholderText('C'), { target: { value: 'B' } })
    fireEvent.click(screen.getByText('Save ticket'))

    expect(screen.getByRole('alert').textContent).toMatch(/all four fields/i)
    expect(screen.queryByText(/wait at Gate/i)).toBeNull()
  }, 30000)
})

// ---- staff → organizer: an incident crosses portals ----------------------

describe('incident lifecycle across portals', () => {
  it('a staff-filed incident reaches the organizer queue, rings their bell, and can be resolved', async () => {
    render(<App />)

    // Staff files an incident (manually — the AI drafter is offline in tests).
    let sidebar = await login('Staff', 'Continue as Staff')
    await openTab(sidebar, 'Report Incident')
    fireEvent.change(
      await screen.findByPlaceholderText('e.g. Queue backing into concourse'),
      { target: { value: 'Spill blocking stair 4' } },
    )
    fireEvent.click(screen.getByText('File incident'))

    // Switch role through the shell's own menu (no page reload — state must survive).
    fireEvent.click(screen.getByRole('button', { name: /profile menu/i }))
    fireEvent.click(within(await screen.findByRole('menu')).getByText('Switch role'))

    sidebar = await login('Organizer', 'Continue as an Organizer')

    // The bell already reports the unread incident notification.
    const topbar = within(document.querySelector('header'))
    expect(topbar.getByRole('button', { name: /Notifications, 1 unread/i })).toBeTruthy()

    // The triage queue holds the incident, live from staff.
    await openTab(sidebar, 'Incidents')
    expect(await screen.findByText('Spill blocking stair 4')).toBeTruthy()
    expect(screen.getByText(/1 new · 0 in progress · 0 resolved/)).toBeTruthy()

    // Resolving it updates the queue counts.
    fireEvent.click(screen.getByText('Resolve'))
    await screen.findByText(/0 new · 0 in progress · 1 resolved/)
  }, 40000)

  it('an incident with no title is refused', async () => {
    render(<App />)
    const sidebar = await login('Staff', 'Continue as Staff')
    await openTab(sidebar, 'Report Incident')

    fireEvent.click(await screen.findByText('File incident'))
    // Refusal toast, and the live preview still shows the empty placeholder.
    expect(await screen.findByText('Add a short title')).toBeTruthy()
    expect(screen.getByText('Incident title…')).toBeTruthy()
  }, 30000)
})

// ---- theme system ---------------------------------------------------------

describe('ThemeProvider', () => {
  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>

  it('defaults to dark and reflects the theme onto <html>', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('honours a saved choice over the OS preference', () => {
    store.set('ff-theme', 'light')
    matchMediaMatches = () => false // OS says dark; saved choice must win
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
  })

  it('honours prefers-color-scheme: light on first load with no saved choice', () => {
    matchMediaMatches = q => q.includes('light')
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
  })

  it('toggle flips the theme, persists it, and updates <html>', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
    expect(store.get('ff-theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    act(() => result.current.setTheme('dark'))
    expect(result.current.theme).toBe('dark')
    expect(store.get('ff-theme')).toBe('dark')
  })
})
