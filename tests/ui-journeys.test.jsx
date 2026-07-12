// @vitest-environment jsdom
//
// Deep journey tests: beyond the smoke tests (which stop at each dashboard's
// landing screen), these walk EVERY tab of every role's portal, plus the
// shell chrome (notifications, profile menu, e-ticket modal). The real <App/>
// is mounted; only the network and missing browser APIs are stubbed, so a
// crash inside any lazy-loaded screen fails here.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react'
import App from '../src/App.jsx'
import TicketModal from '../src/components/dashboard/shared/TicketModal.jsx'
import { fanTabs, staffTabs, organizerTabs } from '../src/data.js'

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

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', NoopObserver)
  vi.stubGlobal('ResizeObserver', NoopObserver)
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  })))
  window.scrollTo = () => {}
  // jsdom elements lack scrollTo; the chat threads auto-scroll with it.
  Element.prototype.scrollTo = Element.prototype.scrollTo || (() => {})
  // Leaflet probes for these during map construction.
  if (!window.requestAnimationFrame) window.requestAnimationFrame = cb => setTimeout(cb, 0)
  // All external feeds answer empty, forcing the honest offline states.
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

const goLoginScreen = () => fireEvent.click(screen.getAllByText('Log in')[0])
const fillCredentials = () => {
  fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'fan@example.com' } })
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pw-123456' } })
}

const signInAs = async (roleButton, continueLabel) => {
  render(<App />)
  goLoginScreen()
  if (roleButton) fireEvent.click(screen.getByText(roleButton))
  fillCredentials()
  fireEvent.click(screen.getByText(continueLabel))
  return await screen.findByRole('navigation', { name: /navigation/i }, { timeout: 5000 })
}

// Click through every sidebar tab; each lazy screen must mount, mark itself
// current, and render real content into <main> without crashing.
async function walkEveryTab(sidebar, tabs) {
  for (const tab of tabs) {
    fireEvent.click(within(sidebar).getByText(tab.label))
    await waitFor(() => {
      const btn = within(sidebar).getByText(tab.label).closest('button')
      expect(btn.getAttribute('aria-current')).toBe('page')
    }, { timeout: 5000 })
    const main = document.getElementById('ff-main-content')
    expect(main).toBeTruthy()
    await waitFor(() => expect(main.textContent.trim().length).toBeGreaterThan(0), { timeout: 5000 })
  }
}

describe('fan portal — every tab renders', () => {
  it('walks all fan screens without a crash', async () => {
    const sidebar = await signInAs(null, 'Continue as a Fan', fanTabs)
    await walkEveryTab(sidebar, fanTabs)
  }, 30000)
})

describe('staff portal — every tab renders', () => {
  it('walks all staff screens without a crash', async () => {
    const sidebar = await signInAs('Staff', 'Continue as Staff', staffTabs)
    await walkEveryTab(sidebar, staffTabs)
  }, 30000)
})

describe('organizer portal — every tab renders', () => {
  it('walks all organizer screens without a crash', async () => {
    const sidebar = await signInAs('Organizer', 'Continue as an Organizer', organizerTabs)
    await walkEveryTab(sidebar, organizerTabs)
  }, 30000)
})

describe('dashboard shell chrome', () => {
  it('opens the notification panel, shows the honest empty state, and closes on Escape', async () => {
    await signInAs(null, 'Continue as a Fan', fanTabs)

    // Both the topbar bell and the sidebar tab are named "Notifications" —
    // scope to the topbar to hit the bell.
    const topbar = within(document.querySelector('header'))
    fireEvent.click(topbar.getByRole('button', { name: /^Notifications/ }))
    expect(await screen.findByText(/all caught up/i)).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByText(/all caught up/i)).toBeNull())
  }, 30000)

  it('profile menu opens, and Log out returns to the login screen', async () => {
    await signInAs(null, 'Continue as a Fan', fanTabs)

    fireEvent.click(screen.getByRole('button', { name: /profile menu/i }))
    const menu = await screen.findByRole('menu')
    fireEvent.click(within(menu).getByText('Log out'))

    expect(await screen.findByText("Choose how you're joining the tournament.")).toBeTruthy()
  }, 30000)
})

describe('e-ticket modal', () => {
  const ticket = { ticketId: 'FF-2026-B214-12-8', gate: 'B', section: '214', row: '12', seat: '8' }
  const venue = { homeCode: 'USA', awayCode: 'MEX', round: 'Final', venue: 'AT&T Stadium' }

  it('renders nothing at all without a ticket', () => {
    const { container } = render(<TicketModal ticket={null} venue={venue} onClose={() => {}} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows the fan\'s real seat details and the live fixture', () => {
    render(<TicketModal ticket={ticket} venue={venue} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: /e-ticket/i })
    expect(within(dialog).getByText('USA vs MEX')).toBeTruthy()
    expect(within(dialog).getByText('Gate B')).toBeTruthy()
    expect(within(dialog).getByText('Row 12 · Seat 8')).toBeTruthy()
  })

  it('closes on Escape — keyboard parity with the backdrop click', () => {
    const onClose = vi.fn()
    render(<TicketModal ticket={ticket} venue={venue} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when the backdrop is clicked, but NOT when the dialog itself is', () => {
    const onClose = vi.fn()
    render(<TicketModal ticket={ticket} venue={venue} onClose={onClose} />)

    fireEvent.click(screen.getByRole('dialog', { name: /e-ticket/i }))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
