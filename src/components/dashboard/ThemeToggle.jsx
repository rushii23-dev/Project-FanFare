import { useTheme } from '../../theme/ThemeProvider.jsx'

// Animated sun/moon theme toggle for the dashboard top bar.
// Icon+label are announced for screen readers; state is never colour-only.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      className={`ff-theme-toggle${isDark ? '' : ' light'}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      type="button"
    >
      <span className="ff-theme-toggle-track" aria-hidden="true">
        <span className="ff-theme-toggle-knob">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isDark ? (
              // moon
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            ) : (
              // sun
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </>
            )}
          </svg>
        </span>
      </span>
    </button>
  )
}
