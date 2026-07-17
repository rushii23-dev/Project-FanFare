// @vitest-environment jsdom
//
// Unit tests for the landing-page scroll effects hook: reveal-on-scroll and
// the scoreboard count-up. Both honour prefers-reduced-motion by snapping to
// the final state, and both go through IntersectionObserver otherwise — each
// path is exercised here with a capturing observer stub.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollEffects } from '../src/hooks/useScrollEffects.js'

let observers

class CapturingObserver {
  constructor(cb, opts) {
    this.cb = cb
    this.opts = opts
    this.observed = []
    this.disconnected = false
    observers.push(this)
  }
  observe(el) { this.observed.push(el) }
  unobserve(el) { this.observed = this.observed.filter(x => x !== el) }
  disconnect() { this.disconnected = true }
  takeRecords() { return [] }
}

const setDom = () => {
  document.body.innerHTML = `
    <div data-reveal id="r1"></div>
    <div data-reveal id="r2"></div>
    <div id="ff-scorewrap">
      <span class="ff-score-num" data-to="104" data-suffix="+"></span>
      <span class="ff-score-num" data-to="16"></span>
    </div>`
}

const stubReducedMotion = (matches) => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  })))
}

beforeEach(() => {
  observers = []
  vi.useFakeTimers()
  vi.stubGlobal('IntersectionObserver', CapturingObserver)
  setDom()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('useScrollEffects — reduced motion', () => {
  it('reveals everything and snaps the scoreboard to final values instantly', () => {
    stubReducedMotion(true)
    renderHook(() => useScrollEffects('home'))
    act(() => { vi.advanceTimersByTime(80) })

    expect(document.getElementById('r1').classList.contains('ff-in')).toBe(true)
    expect(document.getElementById('r2').classList.contains('ff-in')).toBe(true)
    const nums = document.querySelectorAll('.ff-score-num')
    expect(nums[0].textContent).toBe('104+')
    expect(nums[1].textContent).toBe('16')
    expect(observers).toHaveLength(0)
  })
})

describe('useScrollEffects — full motion', () => {
  it('reveals elements only as they intersect, then stops watching them', () => {
    stubReducedMotion(false)
    renderHook(() => useScrollEffects('home'))
    act(() => { vi.advanceTimersByTime(80) })

    // One observer for reveals, one for the scoreboard.
    expect(observers.length).toBe(2)
    const revealIO = observers[0]
    expect(revealIO.observed).toHaveLength(2)

    const r1 = document.getElementById('r1')
    const r2 = document.getElementById('r2')
    act(() => {
      revealIO.cb([
        { isIntersecting: true, target: r1 },
        { isIntersecting: false, target: r2 },
      ])
    })
    expect(r1.classList.contains('ff-in')).toBe(true)
    expect(r2.classList.contains('ff-in')).toBe(false)
    expect(revealIO.observed).toEqual([r2]) // r1 unobserved once revealed
  })

  it('counts the scoreboard up once when it scrolls into view, and only once', () => {
    stubReducedMotion(false)
    // Deliver a timestamp far past the animation window so the easing
    // completes in a single frame — the final value is what matters.
    vi.stubGlobal('requestAnimationFrame', (cb) => { cb(performance.now() + 60_000); return 1 })

    renderHook(() => useScrollEffects('home'))
    act(() => { vi.advanceTimersByTime(80) })

    const scoreIO = observers[1]
    act(() => { scoreIO.cb([{ isIntersecting: true }]) })
    const nums = document.querySelectorAll('.ff-score-num')
    expect(nums[0].textContent).toBe('104+')
    expect(nums[1].textContent).toBe('16')
    expect(scoreIO.disconnected).toBe(true)

    // A second intersection must not re-run the count-up.
    nums[0].textContent = 'sentinel'
    act(() => { scoreIO.cb([{ isIntersecting: true }]) })
    expect(nums[0].textContent).toBe('sentinel')
  })

  it('re-arms for freshly mounted nodes when the screen changes, skipping revealed ones', () => {
    stubReducedMotion(true)
    const { rerender } = renderHook(({ s }) => useScrollEffects(s), { initialProps: { s: 'home' } })
    act(() => { vi.advanceTimersByTime(80) })
    expect(document.getElementById('r1').classList.contains('ff-in')).toBe(true)

    // Screen swap mounts a new reveal target; the old ones are already in.
    const fresh = document.createElement('div')
    fresh.setAttribute('data-reveal', '')
    fresh.id = 'r3'
    document.body.appendChild(fresh)

    rerender({ s: 'about' })
    act(() => { vi.advanceTimersByTime(80) })
    expect(fresh.classList.contains('ff-in')).toBe(true)
  })
})
