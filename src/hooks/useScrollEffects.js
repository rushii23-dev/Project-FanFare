import { useEffect } from 'react'

// Reveal-on-scroll + scoreboard count-up.
// Ported from _reveal() / _countScore() in FanFare.dc.html.
// Re-runs whenever `screen` changes, since the DOM is swapped out per screen.
/** @param {string} screen */
export function useScrollEffects(screen) {
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // small delay so freshly-mounted nodes exist
    const t = setTimeout(() => {
      revealOnScroll(reduce)
      countScoreboard(reduce)
    }, 60)

    return () => clearTimeout(t)
  }, [screen])
}

/** @param {boolean} reduce */
function revealOnScroll(reduce) {
  const els = document.querySelectorAll('[data-reveal]:not(.ff-in)')
  if (!els.length) return
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('ff-in'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('ff-in')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
  )
  els.forEach((el) => io.observe(el))
}

/** @param {boolean} reduce */
function countScoreboard(reduce) {
  // _ffCounted is our own once-only marker stashed on the DOM node.
  const wrap = /** @type {(HTMLElement & { _ffCounted?: boolean }) | null} */ (
    document.getElementById('ff-scorewrap')
  )
  if (!wrap || wrap._ffCounted) return

  const run = () => {
    if (wrap._ffCounted) return
    wrap._ffCounted = true
    const nums = wrap.querySelectorAll('.ff-score-num')
    nums.forEach((el, i) => {
      const to = parseFloat(el.getAttribute('data-to') || '') || 0
      const suffix = el.getAttribute('data-suffix') || ''
      if (reduce) {
        el.textContent = to + suffix
        return
      }
      const dur = 1500
      const start = performance.now() + i * 130
      const step = (/** @type {number} */ now) => {
        const t = Math.min(1, Math.max(0, (now - start) / dur))
        const e = 1 - Math.pow(1 - t, 3)
        el.textContent = Math.round(to * e) + suffix
        if (t < 1) requestAnimationFrame(step)
        else el.textContent = to + suffix
      }
      requestAnimationFrame(step)
    })
  }

  if (reduce || !('IntersectionObserver' in window)) {
    run()
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run()
          io.disconnect()
        }
      })
    },
    { threshold: 0.35 },
  )
  io.observe(wrap)
}
