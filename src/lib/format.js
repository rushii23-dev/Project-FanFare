// ============================================================
// FanFare — shared display formatters.
//
// One implementation each. These were previously copy-pasted into
// DashboardShell, OrganizerIncidents, StaffProfile, StaffDashboard and
// FanProfile, which let the "2h ago" / initials logic drift per role.
// ============================================================

/**
 * Human relative time for a feed timestamp.
 * "Just now" under a minute, then "5m ago", "2h ago", "3d ago".
 *
 * @param {string|number|Date} time - anything `new Date()` accepts (usually ISO 8601)
 * @returns {string} relative label, coarsest unit that fits
 */
export function timeAgo(time) {
  const min = Math.floor((Date.now() - new Date(time).getTime()) / 60_000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/**
 * Uppercase initials for an avatar badge: "Ava Torres" → "AT".
 * Blank or missing names fall back to `fallback` rather than rendering
 * an empty badge.
 *
 * @param {string|null|undefined} name - display name
 * @param {{ max?: number, fallback?: string }} [opts]
 *   `max` caps the number of letters (the top-bar avatar uses 2, profile
 *   pages keep every word); `fallback` is used when the name is blank
 *   (default "U" for user).
 * @returns {string}
 */
export function initials(name, { max = Infinity, fallback = 'U' } = {}) {
  const source = (name || '').trim() || fallback
  return source.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, max)
}

/**
 * 24-hour clock label for a shift timestamp: "08:00".
 * Values that are not dates (already-formatted labels like "TBD") pass
 * through unchanged instead of becoming "Invalid Date".
 *
 * @param {string} value - ISO timestamp or a pre-formatted label
 * @returns {string}
 */
export function shortTime(value) {
  const d = new Date(value)
  return isNaN(d.getTime())
    ? value
    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
