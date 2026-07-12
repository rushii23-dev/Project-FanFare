import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ============================================================
// FanFare theme system
// - defaults to dark
// - respects prefers-color-scheme on very first load (no saved choice)
// - persists explicit choice to localStorage
// - reflects the active theme as data-theme="dark|light" on <html>
// Light tokens are scoped to the dashboard subtree in index.css, so the
// marketing pages keep their look regardless of the flag.
// ============================================================

const STORAGE_KEY = 'ff-theme'
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} })

function readInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch { /* storage unavailable */ }
  // First load, no saved choice → honour the OS preference, default dark.
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme)

  // Reflect onto <html> so CSS tokens switch, with a brief cross-fade window.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.add('ff-theming')
    const t = setTimeout(() => root.classList.remove('ff-theming'), 400)
    return () => clearTimeout(t)
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
