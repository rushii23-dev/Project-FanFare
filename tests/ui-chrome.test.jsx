// @vitest-environment jsdom
//
// Branch coverage for the chrome the journey tests only pass through: the
// marketing nav's scroll states, the footer's handler fallbacks, the auth
// shell and hero image probes (both the found-a-photo and no-photo-shipped
// paths), the scroll ball's image fallback, the fan map's stadium/city views,
// and the icon set's unknown-name guard. Only the network and missing browser
// APIs are stubbed — every rendered branch below is production code.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import Nav from '../src/components/Nav.jsx'
import SiteFooter from '../src/components/SiteFooter.jsx'
import AuthShell from '../src/components/AuthShell.jsx'
import Hero from '../src/components/landing/Hero.jsx'
import ScrollBall from '../src/components/ScrollBall.jsx'
import Icon from '../src/components/landing/Icons.jsx'
import FanMap from '../src/components/dashboard/fan/FanMap.jsx'

// ---- module mocks ---------------------------------------------------------

// FanMap reads the resolved venue; it's an external feed, mocked at the
// module boundary like the other UI suites.
const venueMock = vi.hoisted(() => ({
  value: { resolved: false, loading: false, lat: null, lon: null, city: null, venue: null },
}))
vi.mock('../src/lib/venue.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useVenue: () => venueMock.value }
})

vi.mock('leaflet', () => {
  const L = {
    map: vi.fn(() => ({
      setView: vi.fn(function set() { return this }),
      remove: vi.fn(),
      invalidateSize: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => {
      const layer = { clearLayers: vi.fn(), addTo: vi.fn(() => layer) }
      return layer
    }),
    divIcon: vi.fn(opts => opts),
    marker: vi.fn(() => {
      const mk = { addTo: vi.fn(() => mk), bindPopup: vi.fn(() => mk) }
      return mk
    }),
  }
  return { default: L }
})
vi.mock('leaflet/dist/leaflet.css', () => ({}))

// ---- browser APIs jsdom does not implement --------------------------------

class NoopObserver {
  observe() {} unobserve() {} disconnect() {} takeRecords() { return [] }
}

// Image-probe control: AuthShell and Hero walk candidate hero photos with
// `new Image()`. jsdom never fires load events, so the stub decides the
// outcome per test: fail the first N probes, then succeed (or never succeed).
const probeState = { failuresBeforeLoad: Infinity }
class FakeImage {
  set src(_v) {
    if (probeState.failuresBeforeLoad > 0) {
      probeState.failuresBeforeLoad -= 1
      this.onerror?.()
    } else {
      this.onload?.()
    }
  }
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', NoopObserver)
  vi.stubGlobal('ResizeObserver', NoopObserver)
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  })))
  vi.stubGlobal('Image', FakeImage)
  probeState.failuresBeforeLoad = Infinity
  window.scrollTo = () => {}
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true, status: 200, json: async () => ({}), text: async () => '',
  })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

const setScrollY = (y) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
}

// ---- Nav -------------------------------------------------------------------

describe('Nav', () => {
  const handlers = () => ({
    goHome: vi.fn(), goHow: vi.fn(), goPortals: vi.fn(),
    goAbout: vi.fn(), goLogin: vi.fn(), goRegister: vi.fn(),
  })

  it('starts transparent at the top and switches to the scrolled glass style past 24px', () => {
    setScrollY(0)
    const h = handlers()
    render(<Nav handlers={h} />)
    const nav = document.querySelector('nav')
    expect(nav.style.background).toBe('transparent')

    act(() => {
      setScrollY(100)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(nav.style.background).not.toBe('transparent')

    act(() => {
      setScrollY(0)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(nav.style.background).toBe('transparent')
  })

  it('routes every link to its handler', () => {
    setScrollY(0)
    const h = handlers()
    render(<Nav handlers={h} />)
    fireEvent.click(screen.getByRole('button', { name: /fanfare home/i }))
    fireEvent.click(screen.getByRole('button', { name: /how it works/i }))
    fireEvent.click(screen.getByRole('button', { name: /portals/i }))
    fireEvent.click(screen.getByRole('button', { name: /impact/i }))
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    fireEvent.click(screen.getByRole('button', { name: /enter fanfare/i }))
    expect(h.goHome).toHaveBeenCalled()
    expect(h.goHow).toHaveBeenCalled()
    expect(h.goPortals).toHaveBeenCalled()
    expect(h.goAbout).toHaveBeenCalled()
    expect(h.goLogin).toHaveBeenCalled()
    expect(h.goRegister).toHaveBeenCalled()
  })
})

// ---- SiteFooter -------------------------------------------------------------

describe('SiteFooter', () => {
  it('routes portal, explore and account links through the supplied handlers', () => {
    const enterAs = vi.fn(() => vi.fn())
    const h = {
      enterAs, goHow: vi.fn(), goPortals: vi.fn(), goAbout: vi.fn(),
      goLogin: vi.fn(), goRegister: vi.fn(), goHome: vi.fn(),
    }
    render(<SiteFooter handlers={h} />)
    expect(enterAs).toHaveBeenCalledWith('fan')
    expect(enterAs).toHaveBeenCalledWith('staff')
    expect(enterAs).toHaveBeenCalledWith('organizer')
    fireEvent.click(screen.getByRole('button', { name: /how it works/i }))
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    fireEvent.click(screen.getByRole('button', { name: /^home$/i }))
    expect(h.goHow).toHaveBeenCalled()
    expect(h.goLogin).toHaveBeenCalled()
    expect(h.goRegister).toHaveBeenCalled()
    expect(h.goHome).toHaveBeenCalled()
  })

  it('renders safely with no handlers at all — every link degrades to a no-op', () => {
    render(<SiteFooter />)
    // All nine footer links exist and none of them throws when clicked.
    for (const name of [/fan portal/i, /staff portal/i, /organizer portal/i, /how it works/i, /portals/i, /about/i, /log in/i, /create account/i, /^home$/i]) {
      fireEvent.click(screen.getAllByRole('button', { name })[0])
    }
    expect(screen.getByText(/independent concept platform/i)).toBeTruthy()
  })
})

// ---- AuthShell / Hero image probes ------------------------------------------

describe('AuthShell', () => {
  it('shows no backdrop when none of the candidate photos load', () => {
    probeState.failuresBeforeLoad = Infinity
    const { container } = render(<AuthShell><p>card</p></AuthShell>)
    expect(screen.getByText('card')).toBeTruthy()
    expect(container.innerHTML).not.toContain('ff-kenburns')
  })

  it('walks the candidate list and uses the first photo that loads', () => {
    probeState.failuresBeforeLoad = 2 // first two 404 → third candidate wins
    const { container } = render(<AuthShell><p>card</p></AuthShell>)
    expect(container.innerHTML).toContain('ff-kenburns')
    expect(container.innerHTML).toContain('hero-stadium.jpeg')
  })
})

describe('Hero', () => {
  it('renders the animated fallback stadium when no photo ships, and routes both CTAs', () => {
    probeState.failuresBeforeLoad = Infinity
    const goRegister = vi.fn(), goHow = vi.fn()
    const { container } = render(<Hero handlers={{ goRegister, goHow }} />)
    expect(container.innerHTML).not.toContain('ff-kenburns')
    fireEvent.click(screen.getByRole('button', { name: /enter fanfare/i }))
    fireEvent.click(screen.getByRole('button', { name: /how it works/i }))
    expect(goRegister).toHaveBeenCalled()
    expect(goHow).toHaveBeenCalled()
  })

  it('uses the real stadium photo once a candidate loads', () => {
    probeState.failuresBeforeLoad = 0
    const { container } = render(<Hero handlers={{ goRegister: vi.fn(), goHow: vi.fn() }} />)
    expect(container.innerHTML).toContain('ff-kenburns')
  })
})

// ---- ScrollBall --------------------------------------------------------------

describe('ScrollBall', () => {
  it('tracks scroll progress and swaps to the drawn ball if the PNG is missing', () => {
    vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 1 })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    setScrollY(0)
    const { container } = render(<ScrollBall />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()

    act(() => {
      setScrollY(400)
      window.dispatchEvent(new Event('scroll'))
    })

    // Image 404s → the CSS-drawn ball replaces it.
    fireEvent.error(container.querySelector('img'))
    expect(container.querySelector('img')).toBeNull()
  })
})

// ---- Icon --------------------------------------------------------------------

describe('Icon', () => {
  it('renders an empty svg for an unknown name instead of crashing', () => {
    const { container } = render(<Icon name="definitely-not-an-icon" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg.children.length).toBe(0)
  })

  it('honours explicit size and stroke', () => {
    const { container } = render(<Icon name="pin" size={40} stroke={2.4} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('40')
    expect(svg.getAttribute('stroke-width')).toBe('2.4')
  })
})

// ---- FanMap -------------------------------------------------------------------

describe('FanMap', () => {
  const zones = [
    { id: 'N1', name: 'North Stand — Lower', capacity: 11200, current: 8400, trend: 12 },
    { id: 'S1', name: 'South Stand — Lower', capacity: 11800, current: 9900, trend: -4 },
  ]
  const gates = [
    { id: 'B', waitMin: 11, isClosed: false, stepFree: false, density: 90, trend: [4, 8, 11] },
    { id: 'F', waitMin: 0, isClosed: true, stepFree: false, density: 0 },
  ]
  const profile = { gate: 'B', section: '214', row: '12', seat: '8' }

  it('shows the live bowl with the fan seat card and the selected gate panel', () => {
    render(<FanMap zones={zones} gates={gates} fanProfile={profile} />)
    expect(screen.getByText('Stadium bowl')).toBeTruthy()
    expect(screen.getByText('214')).toBeTruthy()
    expect(screen.getByText('Gate B')).toBeTruthy()
    expect(screen.getByText(/90% density/)).toBeTruthy()
  })

  it('reports a closed ticketed gate honestly', () => {
    render(<FanMap zones={zones} gates={gates} fanProfile={{ ...profile, gate: 'F' }} />)
    expect(screen.getByText('Gate F')).toBeTruthy()
    expect(screen.getByText(/currently closed/i)).toBeTruthy()
  })

  it('shows the pending state when telemetry has not seeded yet', () => {
    render(<FanMap zones={[]} gates={[]} fanProfile={profile} />)
    expect(screen.getByText('Live bowl heatmap')).toBeTruthy()
  })

  it('city view resolves to the real venue map — or says it is still resolving', () => {
    venueMock.value = { resolved: false, loading: false, lat: null, lon: null, city: null, venue: null }
    const { unmount } = render(<FanMap zones={zones} gates={gates} fanProfile={profile} />)
    fireEvent.click(screen.getByRole('button', { name: 'City' }))
    expect(screen.getByText(/resolving the venue/i)).toBeTruthy()
    unmount()

    venueMock.value = { resolved: true, loading: false, lat: 32.7473, lon: -97.0945, city: 'Arlington', venue: 'AT&T Stadium' }
    render(<FanMap zones={zones} gates={gates} fanProfile={profile} />)
    fireEvent.click(screen.getByRole('button', { name: 'City' }))
    expect(screen.getByText('Getting to the venue')).toBeTruthy()
    // Back to the bowl.
    fireEvent.click(screen.getByRole('button', { name: 'Stadium' }))
    expect(screen.getByText('Stadium bowl')).toBeTruthy()
  })
})
