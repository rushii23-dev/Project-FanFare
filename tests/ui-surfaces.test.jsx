// @vitest-environment jsdom
//
// Behavioral tests for the interactive surfaces the journey tests only glance
// at: the two AI chat surfaces (fan concierge, organizer copilot), the staff
// interpreter with its degraded-translation fallback, the live score bar, the
// World Cup feed card, and the Leaflet venue map. The AI client and the live
// fixture hook are mocked at the module boundary; everything below them —
// prompt building, grounding rules, allowlisting, fallbacks, rendering — is
// the real production code.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { LANGS } from '../src/lib/freeApis.js'
import { AIError } from '../src/lib/ai.js'
import FanConcierge from '../src/components/dashboard/fan/FanConcierge.jsx'
import OrganizerCopilot from '../src/components/dashboard/organizer/OrganizerCopilot.jsx'
import StaffTranslation from '../src/components/dashboard/staff/StaffTranslation.jsx'
import LiveScoreBar from '../src/components/dashboard/shared/LiveScoreBar.jsx'
import WorldCupFeed from '../src/components/dashboard/shared/WorldCupFeed.jsx'
import VenueMap from '../src/components/dashboard/shared/VenueMap.jsx'

// ---- module mocks ---------------------------------------------------------

const aiMock = vi.hoisted(() => ({
  askAI: vi.fn(),
  askAIJson: vi.fn(),
  status: { checking: false, configured: true },
}))
vi.mock('../src/lib/ai.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    askAI: (...a) => aiMock.askAI(...a),
    askAIJson: (...a) => aiMock.askAIJson(...a),
    useAIStatus: () => aiMock.status,
  }
})

const feedMock = vi.hoisted(() => ({
  translate: vi.fn(),
  wc: { view: null, loading: false, results: [], fixtures: [], leagueBadge: '', live: false },
}))
vi.mock('../src/lib/freeApis.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    translate: (...a) => feedMock.translate(...a),
    useLiveWorldCup: () => feedMock.wc,
    useWeather: () => ({ live: true, code: 1, temp: 24, feels: 26, wind: 12, humidity: 40 }),
  }
})

const leaflet = vi.hoisted(() => ({ maps: [], markers: [], popups: [], cleared: 0 }))
vi.mock('leaflet', () => {
  const L = {
    map: vi.fn(() => {
      const m = {
        setView: vi.fn(function set() { return this }),
        remove: vi.fn(),
        invalidateSize: vi.fn(),
      }
      leaflet.maps.push(m)
      return m
    }),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => {
      const layer = { clearLayers: vi.fn(() => { leaflet.cleared += 1 }), addTo: vi.fn(() => layer) }
      return layer
    }),
    divIcon: vi.fn(opts => opts),
    marker: vi.fn((pos) => {
      const mk = { addTo: vi.fn(() => mk), bindPopup: vi.fn(html => { leaflet.popups.push(html); return mk }) }
      leaflet.markers.push(pos)
      return mk
    }),
  }
  return { default: L }
})
vi.mock('leaflet/dist/leaflet.css', () => ({}))

// ---- jsdom shims ----------------------------------------------------------

class NoopObserver {
  observe() {} unobserve() {} disconnect() {} takeRecords() { return [] }
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', NoopObserver)
  vi.stubGlobal('ResizeObserver', NoopObserver)
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  })))
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' })))
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(text) { this.text = text } })
  vi.stubGlobal('speechSynthesis', { speak: vi.fn() })
  window.scrollTo = () => {}
  Element.prototype.scrollTo = Element.prototype.scrollTo || (() => {})

  aiMock.askAI.mockReset()
  aiMock.askAIJson.mockReset()
  aiMock.status = { checking: false, configured: true }
  feedMock.translate.mockReset().mockResolvedValue('')
  feedMock.wc = { view: null, loading: false, results: [], fixtures: [], leagueBadge: '', live: false }
  leaflet.maps.length = 0
  leaflet.markers.length = 0
  leaflet.popups.length = 0
  leaflet.cleared = 0
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---- fan concierge --------------------------------------------------------

const fanProfile = {
  name: 'Maya Lopez', ticketConfirmed: true,
  gate: 'B', section: '214', row: '12', seat: '8', ticketId: 'FF-2026-B214-12-8',
  accessibility: { wheelchair: true },
}
const zones = [{ id: 'Z1', name: 'South Stand', current: 950, capacity: 1000, trend: 12 }]
const gates = [
  { id: 'A', waitMin: 18, density: 64, isClosed: false },
  { id: 'C', waitMin: 0, density: 0, isClosed: true },
]

describe('FanConcierge', () => {
  it('grounds every question in the ticket, live gates and accessibility needs', async () => {
    aiMock.askAI.mockResolvedValue('Gate A is your fastest open gate — 18 minutes.')
    render(<FanConcierge fanProfile={fanProfile} zones={zones} gates={gates} />)

    fireEvent.click(screen.getByText('Which gate is quickest right now?'))
    expect(await screen.findByText('Gate A is your fastest open gate — 18 minutes.')).toBeTruthy()

    const { system, prompt } = aiMock.askAI.mock.calls[0][0]
    expect(system).toMatch(/Never invent a gate number/)
    expect(prompt).toContain('Gate B, Section 214, Row 12, Seat 8 (ticket FF-2026-B214-12-8)')
    expect(prompt).toContain('Gate A: 18 min wait, 64% density')
    expect(prompt).toContain('Closed gates: C')
    expect(prompt).toContain('South Stand: 95% full')
    expect(prompt).toContain('wheelchair access')
    expect(prompt).toContain('REPLY_LANGUAGE: English')
    expect(prompt).toMatch(/Do not guess a venue/) // no live fixture resolved in tests
  })

  it('tells the model when no ticket is on file instead of inventing one', async () => {
    aiMock.askAI.mockResolvedValue('Please add your ticket first.')
    render(<FanConcierge fanProfile={{ name: 'Sam' }} zones={[]} gates={[]} />)

    expect(screen.getByText(/Add your ticket on your Matchday dashboard/)).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('Ask anything, in any language…'), { target: { value: 'Where is my seat?' } })
    fireEvent.keyDown(screen.getByPlaceholderText('Ask anything, in any language…'), { key: 'Enter' })

    await waitFor(() => expect(aiMock.askAI).toHaveBeenCalled())
    const { prompt } = aiMock.askAI.mock.calls[0][0]
    expect(prompt).toContain('NOT YET ADDED')
    expect(prompt).toContain('No live gate data available.')
  })

  it('answers in the selected language and reads answers aloud', async () => {
    aiMock.askAI.mockResolvedValue('La Puerta A es la más rápida.')
    render(<FanConcierge fanProfile={fanProfile} zones={zones} gates={gates} />)

    fireEvent.change(screen.getByLabelText('Answer language'), { target: { value: 'es' } })
    fireEvent.click(screen.getByText('Where can I get food?'))

    expect(await screen.findByText('La Puerta A es la más rápida.')).toBeTruthy()
    const esLabel = LANGS.find(l => l.code === 'es').label
    expect(aiMock.askAI.mock.calls[0][0].prompt).toContain(`REPLY_LANGUAGE: ${esLabel}`)

    fireEvent.click(screen.getByLabelText('Read this answer aloud'))
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
    expect(window.speechSynthesis.speak.mock.calls[0][0].lang).toBe('es-ES')
  })

  it('shows the honest error message when the assistant fails', async () => {
    aiMock.askAI.mockRejectedValue(new AIError('limited', 'RATE_LIMIT'))
    render(<FanConcierge fanProfile={fanProfile} zones={zones} gates={gates} />)

    fireEvent.click(screen.getByText("What's the bag policy?"))
    expect(await screen.findByText(/rate-limited right now/)).toBeTruthy()
  })

  it('announces when the deployment has no AI key, and refuses empty sends', () => {
    aiMock.status = { checking: false, configured: false }
    render(<FanConcierge fanProfile={fanProfile} zones={zones} gates={gates} />)

    expect(screen.getByText(/The assistant is offline/)).toBeTruthy()
    expect(screen.getByLabelText('Send').disabled).toBe(true)
    fireEvent.keyDown(screen.getByPlaceholderText('Ask anything, in any language…'), { key: 'Enter' })
    expect(aiMock.askAI).not.toHaveBeenCalled()
  })

  it('degrades gracefully when the browser has no speech recognition', () => {
    render(<FanConcierge fanProfile={fanProfile} zones={zones} gates={gates} />)
    fireEvent.click(screen.getByLabelText('Voice input'))
    expect(screen.getByText(/Voice input isn't supported in this browser/)).toBeTruthy()
  })
})

// ---- organizer copilot ----------------------------------------------------

describe('OrganizerCopilot', () => {
  it('feeds live telemetry to the model and renders its metrics and route', async () => {
    aiMock.askAIJson.mockResolvedValue({
      text: 'South Stand is at 95% — urgent. Open Gate A relief now.',
      metrics: [['South Stand', '95%'], ['not-a-pair'], ['Gate A wait', '18 min']],
      to: 'organizer-heatmap',
    })
    const nav = vi.fn()
    render(<OrganizerCopilot nav={nav} zones={zones} gates={gates} />)

    fireEvent.click(screen.getByText('Which zone is busiest?'))
    expect(await screen.findByText(/South Stand is at 95% — urgent/)).toBeTruthy()

    const { system, prompt } = aiMock.askAIJson.mock.calls[0][0]
    expect(system).toMatch(/Never invent a zone, gate, figure or incident/)
    expect(prompt).toContain('Z1 | South Stand | 950/1000 (95%)')
    expect(prompt).toContain('trend +12')
    expect(prompt).toContain('Gate A | 18 min wait, 64% density')
    expect(prompt).toContain('Gate C | CLOSED')

    // Malformed metric pairs are dropped; well-formed ones render.
    expect(screen.getByText('95%')).toBeTruthy()
    expect(screen.getByText('18 min')).toBeTruthy()
    expect(screen.queryByText('not-a-pair')).toBeNull()

    // The model's suggested screen is allowlisted, then routed through nav().
    fireEvent.click(screen.getByText(/Open heatmap/))
    expect(nav).toHaveBeenCalledWith('organizer-heatmap')
  })

  it('never navigates to a screen outside the allowlist', async () => {
    aiMock.askAIJson.mockResolvedValue({ text: 'Done.', metrics: [], to: 'javascript:alert(1)' })
    render(<OrganizerCopilot nav={vi.fn()} zones={zones} gates={gates} />)

    fireEvent.click(screen.getByText('Longest gate queue?'))
    expect(await screen.findByText('Done.')).toBeTruthy()
    expect(screen.queryByText(/^Open /)).toBeNull()
  })

  it('tells the model plainly when the venue feed is down', async () => {
    aiMock.askAIJson.mockResolvedValue({ text: 'The feed is down.', metrics: [], to: null })
    render(<OrganizerCopilot nav={vi.fn()} zones={[]} gates={[]} />)

    fireEvent.change(screen.getByPlaceholderText('Ask about the live operation…'), { target: { value: 'Status?' } })
    fireEvent.keyDown(screen.getByPlaceholderText('Ask about the live operation…'), { key: 'Enter' })

    await screen.findByText('The feed is down.')
    expect(aiMock.askAIJson.mock.calls[0][0].prompt).toContain('The venue feed is not reporting')
  })

  it('surfaces assistant failures instead of inventing an answer', async () => {
    aiMock.askAIJson.mockRejectedValue(new AIError('parse', 'PARSE'))
    render(<OrganizerCopilot nav={vi.fn()} zones={zones} gates={gates} />)

    fireEvent.click(screen.getByText('Are we heading for a crush?'))
    expect(await screen.findByText(/returned something unreadable/)).toBeTruthy()
  })
})

// ---- staff interpreter ----------------------------------------------------

describe('StaffTranslation', () => {
  const interpret = (text = 'The medical bay is through Gate B.') => {
    fireEvent.change(screen.getByPlaceholderText('Say what you need to communicate…'), { target: { value: text } })
    fireEvent.click(screen.getByText('Interpret'))
  }

  it('renders translation, back-translation, caution, likely replies and history', async () => {
    aiMock.askAIJson.mockResolvedValue({
      translation: 'La enfermería está pasando la Puerta B.',
      back: 'The infirmary is past Gate B.',
      note: 'Speak slowly; "bay" has no direct equivalent.',
      replies: [
        { target: '¿Está lejos?', source: 'Is it far?' },
        { target: 'Gracias', source: 'Thank you' },
      ],
    })
    render(<StaffTranslation />)

    fireEvent.click(screen.getByText('Medical'))
    interpret()

    // Appears twice by design: the result panel and the history row.
    expect(await screen.findAllByText('La enfermería está pasando la Puerta B.')).toHaveLength(2)
    const { prompt } = aiMock.askAIJson.mock.calls[0][0]
    expect(prompt).toContain('SITUATION: Medical')
    expect(prompt).toContain('"The medical bay is through Gate B."')

    expect(screen.getByText('The infirmary is past Gate B.')).toBeTruthy()
    expect(screen.getByText(/Speak slowly/)).toBeTruthy()
    expect(screen.getByText('¿Está lejos?')).toBeTruthy()
    expect(screen.getByText('Is it far?')).toBeTruthy()
    expect(screen.getByText('en → es')).toBeTruthy() // history row

    fireEvent.click(screen.getByLabelText('Read aloud'))
    expect(window.speechSynthesis.speak.mock.calls[0][0].lang).toBe('es-ES')
  })

  it('falls back to plain machine translation when the model is down — and says so', async () => {
    aiMock.askAIJson.mockRejectedValue(new AIError('down', 'OFFLINE'))
    feedMock.translate.mockResolvedValue('¿Dónde está la Puerta B?')
    render(<StaffTranslation />)

    interpret('Where is Gate B?')
    expect((await screen.findAllByText('¿Dónde está la Puerta B?')).length).toBeGreaterThan(0)
    expect(screen.getByText(/Basic machine translation — the interpreter was unavailable/)).toBeTruthy()
  })

  it('shows an honest error when both the model and the fallback fail', async () => {
    aiMock.askAIJson.mockRejectedValue(new AIError('down', 'OFFLINE'))
    feedMock.translate.mockResolvedValue('') // fallback also has nothing
    render(<StaffTranslation />)

    interpret('Where is Gate B?')
    expect(await screen.findByText(/Can't reach the assistant/)).toBeTruthy()
  })

  it('swap reverses the language pair and seeds the input with the translation', async () => {
    aiMock.askAIJson.mockResolvedValue({ translation: 'La salida está a la izquierda.', back: '', note: '', replies: [] })
    render(<StaffTranslation />)

    interpret('The exit is on the left.')
    await screen.findAllByText('La salida está a la izquierda.')

    fireEvent.click(screen.getByLabelText('Swap languages'))
    expect(screen.getByLabelText('Translate from').value).toBe('es')
    expect(screen.getByLabelText('Translate to').value).toBe('en')
    expect(screen.getByPlaceholderText('Say what you need to communicate…').value).toBe('La salida está a la izquierda.')
  })

  it('notes the degraded mode in the header when no AI key is configured', () => {
    aiMock.status = { checking: false, configured: false }
    render(<StaffTranslation />)
    expect(screen.getByText(/falling back to basic machine translation/)).toBeTruthy()
  })
})

// ---- live score bar -------------------------------------------------------

const liveView = {
  phase: 'LIVE', hasScore: true,
  home: 'Mexico', away: 'Canada', homeCode: 'MEX', awayCode: 'CAN',
  homeScore: 2, awayScore: 1, homeLead: true, awayLead: false,
  homeBadge: '', awayBadge: '', minuteLabel: "63'",
  venue: 'Estadio Azteca', city: 'Mexico City', round: 'Group A', progress: 0.7,
}

describe('LiveScoreBar', () => {
  it('shows a skeleton while the feed loads, and says so when it never arrives', () => {
    feedMock.wc = { ...feedMock.wc, loading: true, view: null }
    const { unmount } = render(<LiveScoreBar />)
    expect(screen.queryByRole('button')).toBeNull() // skeleton is not interactive
    unmount()

    feedMock.wc = { ...feedMock.wc, loading: false, view: null }
    render(<LiveScoreBar />)
    expect(screen.getByText('Live scores momentarily unavailable')).toBeTruthy()
  })

  it('announces the live scoreline and expands into the leaderboard', async () => {
    feedMock.wc = {
      loading: false, live: true, leagueBadge: '',
      view: liveView,
      results: [{ id: 'r1', home: 'Spain', away: 'France', hs: 2, as: 0, ts: '2026-07-10 18:00:00', status: 'FT', city: 'Boston', homeBadge: '', awayBadge: '' }],
      fixtures: [{ id: 'f1', home: 'Brazil', away: 'Germany', ts: '2026-07-14 20:00:00', venue: 'MetLife Stadium', homeBadge: '', awayBadge: '' }],
    }
    render(<LiveScoreBar />)

    const bar = screen.getByRole('button', { name: /Mexico versus Canada, Live, 2–1/ })
    expect(bar.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getAllByText('MEX').length).toBeGreaterThan(0) // badge falls back to initials
    expect(screen.getByText("63'")).toBeTruthy()

    fireEvent.click(bar)
    expect(bar.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Latest results')).toBeTruthy()
    expect(screen.getByText('Spain')).toBeTruthy()
    expect(screen.getByText('Upcoming kickoffs')).toBeTruthy()
    expect(screen.getByText('Brazil')).toBeTruthy()
    expect(screen.getByText(/TheSportsDB/)).toBeTruthy()

    fireEvent.click(bar)
    expect(screen.queryByText('Latest results')).toBeNull()
  })

  it('never shows a score for an upcoming fixture', () => {
    feedMock.wc = {
      loading: false, live: false, leagueBadge: '', results: [], fixtures: [],
      view: { ...liveView, phase: 'UPCOMING', minuteLabel: 'Sat 20:00' },
    }
    render(<LiveScoreBar />)

    expect(screen.getByText('vs')).toBeTruthy()
    expect(screen.queryByText('2')).toBeNull()
    expect(screen.getByRole('button').getAttribute('aria-label')).not.toMatch(/2–1/)

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('No results yet.')).toBeTruthy()
    expect(screen.getByText('No fixtures scheduled.')).toBeTruthy()
  })
})

// ---- world cup feed card ---------------------------------------------------

describe('WorldCupFeed', () => {
  const base = { loading: false, live: false, results: [], fixtures: [], leagueBadge: '' }

  it('shows skeletons while loading and an honest empty state when offline', () => {
    const { unmount } = render(<WorldCupFeed data={{ ...base, loading: true }} />)
    expect(screen.queryByText('Latest results')).toBeNull()
    unmount()

    render(<WorldCupFeed data={base} />)
    expect(screen.getByText('Live fixtures are momentarily unavailable.')).toBeTruthy()
    expect(screen.getByText('Offline')).toBeTruthy()
  })

  it('renders real results and upcoming fixtures with the live indicator', () => {
    render(<WorldCupFeed data={{
      ...base, live: true,
      results: [{ id: 'r1', home: 'Spain', away: 'France', hs: 2, as: 0, ts: '2026-07-10 18:00:00', status: 'FT', venue: 'Gillette Stadium', city: 'Boston', homeBadge: '', awayBadge: '' }],
      fixtures: [{ id: 'f1', home: 'Brazil', away: 'Germany', ts: '2026-07-14 20:00:00', venue: 'MetLife Stadium', city: 'New York', homeBadge: '', awayBadge: '' }],
    }} />)

    expect(screen.getByText('Live')).toBeTruthy()
    expect(screen.getByText('Latest results')).toBeTruthy()
    expect(screen.getByText('Spain')).toBeTruthy()
    expect(screen.getByText('FT')).toBeTruthy()
    expect(screen.getByText('Upcoming')).toBeTruthy()
    expect(screen.getByText(/MetLife Stadium/)).toBeTruthy()
  })
})

// ---- leaflet venue map ------------------------------------------------------

describe('VenueMap', () => {
  it('mounts one map, pins every marker with its label, and cleans up on unmount', () => {
    const markers = [
      { lat: 40.81, lon: -74.07, label: 'MetLife Stadium', color: '#e4002b' },
      { lat: 40.75, lon: -73.99, label: 'Fan Fest' },
    ]
    const { unmount } = render(<VenueMap center={[40.8, -74]} zoom={13} markers={markers} />)

    expect(leaflet.maps).toHaveLength(1)
    expect(leaflet.markers).toEqual([[40.81, -74.07], [40.75, -73.99]])
    expect(leaflet.popups).toEqual(['<b>MetLife Stadium</b>', '<b>Fan Fest</b>'])

    unmount()
    expect(leaflet.maps[0].remove).toHaveBeenCalledTimes(1)
  })

  it('re-pins markers when they change instead of stacking layers', () => {
    const { rerender } = render(<VenueMap markers={[{ lat: 1, lon: 2, label: 'A' }]} />)
    const before = leaflet.cleared

    rerender(<VenueMap markers={[{ lat: 3, lon: 4 }]} />) // no label → no popup bound
    expect(leaflet.cleared).toBeGreaterThan(before)
    expect(leaflet.markers.at(-1)).toEqual([3, 4])
    expect(leaflet.popups).toEqual(['<b>A</b>'])
    expect(leaflet.maps).toHaveLength(1) // same map instance, not a second one
  })
})
