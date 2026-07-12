import { useCallback, useState } from 'react'
import { useScrollEffects } from './hooks/useScrollEffects.js'
import Nav from './components/Nav.jsx'
import Landing from './components/Landing.jsx'
import About from './components/About.jsx'
import Login from './components/Login.jsx'
import CreateAccount from './components/CreateAccount.jsx'
import ScrollBall from './components/ScrollBall.jsx'

// Shared data factories
import {
  fanTabs, staffTabs, organizerTabs,
  createFanProfile, createZones, createGates,
  createIncidents, createStaffRoster, createTasks,
  createNotifications, createRecommendations,
} from './data.js'

// Simulated venue telemetry (clearly labelled in the UI — see simFeed.js).
import { useVenueSim } from './lib/simFeed.js'

// Dashboard shell
import DashboardShell from './components/dashboard/DashboardShell.jsx'

// Fan portal views
import FanDashboard from './components/dashboard/fan/FanDashboard.jsx'
import FanConcierge from './components/dashboard/fan/FanConcierge.jsx'
import FanMap from './components/dashboard/fan/FanMap.jsx'
import FanAccessibility from './components/dashboard/fan/FanAccessibility.jsx'
import FanTransport from './components/dashboard/fan/FanTransport.jsx'
import FanNotifications from './components/dashboard/fan/FanNotifications.jsx'
import FanProfile from './components/dashboard/fan/FanProfile.jsx'

// Staff portal views
import StaffDashboard from './components/dashboard/staff/StaffDashboard.jsx'
import StaffTasks from './components/dashboard/staff/StaffTasks.jsx'
import StaffIncident from './components/dashboard/staff/StaffIncident.jsx'
import StaffTranslation from './components/dashboard/staff/StaffTranslation.jsx'
import StaffZones from './components/dashboard/staff/StaffZones.jsx'
import StaffProfile from './components/dashboard/staff/StaffProfile.jsx'

// Organizer portal views
import OrganizerDashboard from './components/dashboard/organizer/OrganizerDashboard.jsx'
import OrganizerHeatmap from './components/dashboard/organizer/OrganizerHeatmap.jsx'
import OrganizerCopilot from './components/dashboard/organizer/OrganizerCopilot.jsx'
import OrganizerIncidents from './components/dashboard/organizer/OrganizerIncidents.jsx'
import OrganizerBriefings from './components/dashboard/organizer/OrganizerBriefings.jsx'
import OrganizerAnalytics from './components/dashboard/organizer/OrganizerAnalytics.jsx'
import OrganizerSustainability from './components/dashboard/organizer/OrganizerSustainability.jsx'
import OrganizerTeam from './components/dashboard/organizer/OrganizerTeam.jsx'

export default function App() {
  // ── Screen & role state ──
  const [screen, setScreen] = useState('landing')
  const [role, setRole] = useState('fan')
  const [activePortal, setActivePortal] = useState(0)

  // ── Shared mutable dataset (single source of truth across portals) ──
  // Fan profile is seeded from the sign-up details saved in localStorage
  // (interim persistence; real backend later).
  const [fanProfile, setFanProfile] = useState(() => {
    const base = createFanProfile()
    try {
      const saved = JSON.parse(localStorage.getItem('ff-user') || 'null')
      if (saved) return { ...base, ...saved, accessibility: base.accessibility, rewards: base.rewards }
    } catch { /* ignore */ }
    return base
  })
  const [zones, setZones] = useState(() => createZones())
  const [gates, setGates] = useState(() => createGates())
  const [incidents, setIncidents] = useState(() => createIncidents())
  const [staffRoster, setStaffRoster] = useState(() => createStaffRoster())
  const [tasks, setTasks] = useState(() => createTasks())
  const [notifications, setNotifications] = useState(() => createNotifications())
  const [recommendations, setRecommendations] = useState(() => createRecommendations())

  useScrollEffects(screen)

  // Crowd/gate telemetry is driven by the simulator so the AI decision-support
  // layer has live-shaped signals to reason over. It is labelled SIMULATED FEED
  // wherever it surfaces. Incidents, tasks and rosters remain genuinely empty —
  // those are user-generated and are never fabricated.
  useVenueSim(setZones, setGates)

  // ── Navigation helpers ──
  const top = useCallback(() => {
    try { window.scrollTo({ top: 0, behavior: 'auto' }) }
    catch { window.scrollTo(0, 0) }
  }, [])

  const nav = useCallback((next) => {
    setScreen(next)
    requestAnimationFrame(() => requestAnimationFrame(top))
  }, [top])

  const toSection = useCallback((id) => {
    const go = () => {
      const el = document.getElementById(id)
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 74,
          behavior: 'smooth',
        })
      }
    }
    if (screen !== 'landing') {
      setScreen('landing')
      requestAnimationFrame(() => requestAnimationFrame(go))
    } else {
      go()
    }
  }, [screen])

  // ── Landing / marketing handlers ──
  const handlers = {
    goHome: (e) => { e?.preventDefault?.(); nav('landing') },
    goAbout: (e) => { e?.preventDefault?.(); nav('about') },
    goLogin: (e) => { e?.preventDefault?.(); nav('login') },
    goRegister: (e) => { e?.preventDefault?.(); nav('register') },
    goHow: (e) => { e?.preventDefault?.(); toSection('how') },
    goPortals: (e) => { e?.preventDefault?.(); toSection('portals') },
    enterAs: (r) => (e) => { e?.preventDefault?.(); setRole(r); nav('login') },
    // Login "Continue as {role}" → go to that role's dashboard
    goDashboard: (r) => {
      setRole(r)
      nav(`${r}-dashboard`)
    },
    // Sign-up / sign-in with details → seed the fan profile, persist, enter
    completeAuth: (r, details) => {
      if (details && Object.keys(details).length) {
        const patch = { ...details }
        if (r === 'fan' && details.gate) {
          patch.ticketId = `FF-2026-${details.gate}${details.section || ''}-${details.row || ''}-${details.seat || ''}`.toUpperCase()
        }
        setFanProfile(p => ({ ...p, ...patch }))
        try { localStorage.setItem('ff-user', JSON.stringify(patch)) } catch { /* ignore */ }
      }
      setRole(r)
      nav(`${r}-dashboard`)
    },
  }

  // ── Notification mark-as-read ──
  const markNotifRead = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n))
  }, [])

  // ── File incident (Staff → shared list → Organizer sees it) ──
  const fileIncident = useCallback((inc) => {
    setIncidents(prev => [inc, ...prev])
    // Also add a notification for organizer
    setNotifications(prev => [{
      id: `N-${Date.now()}`, role: 'organizer', category: 'incident',
      title: `New incident: ${inc.title}`,
      body: `${inc.severity} severity — ${inc.location}. Reported by ${inc.reportedBy}.`,
      time: new Date().toISOString(), read: false,
    }, ...prev])
  }, [])

  // ── Determine current portal prefix ──
  const isDashboard = screen.startsWith('fan-') || screen.startsWith('staff-') || screen.startsWith('organizer-')
  const currentRole = screen.startsWith('fan-') ? 'fan'
    : screen.startsWith('staff-') ? 'staff'
    : screen.startsWith('organizer-') ? 'organizer'
    : role

  // Filter notifications for current role
  const roleNotifs = notifications.filter(n => n.role === currentRole)

  // ── Dashboard subview renderer ──
  const renderDashboardContent = () => {
    const dashNav = (s) => nav(s)
    const goLogin = () => nav('login')

    // ── Fan views ──
    if (screen === 'fan-dashboard') return <FanDashboard nav={dashNav} fanProfile={fanProfile} zones={zones} gates={gates} onUpdateProfile={setFanProfile} />
    if (screen === 'fan-concierge') return <FanConcierge nav={dashNav} fanProfile={fanProfile} zones={zones} gates={gates} />
    if (screen === 'fan-map') return <FanMap nav={dashNav} zones={zones} gates={gates} fanProfile={fanProfile} />
    if (screen === 'fan-accessibility') return <FanAccessibility nav={dashNav} fanProfile={fanProfile} onUpdateProfile={setFanProfile} zones={zones} gates={gates} />
    if (screen === 'fan-transport') return <FanTransport nav={dashNav} fanProfile={fanProfile} onUpdateProfile={setFanProfile} gates={gates} />
    if (screen === 'fan-notifications') return <FanNotifications nav={dashNav} notifications={roleNotifs} onMarkRead={markNotifRead} />
    if (screen === 'fan-profile') return <FanProfile nav={dashNav} fanProfile={fanProfile} onUpdateProfile={setFanProfile} onLogout={goLogin} />

    // ── Staff views ──
    if (screen === 'staff-dashboard') return <StaffDashboard nav={dashNav} staffRoster={staffRoster} tasks={tasks} zones={zones} onUpdateTasks={setTasks} onUpdateStaff={setStaffRoster} />
    if (screen === 'staff-tasks') return <StaffTasks nav={dashNav} tasks={tasks} zones={zones} gates={gates} onUpdateTasks={setTasks} />
    if (screen === 'staff-incident') return <StaffIncident nav={dashNav} zones={zones} onFileIncident={fileIncident} />
    if (screen === 'staff-translation') return <StaffTranslation nav={dashNav} />
    if (screen === 'staff-zones') return <StaffZones nav={dashNav} zones={zones} />
    if (screen === 'staff-profile') return <StaffProfile nav={dashNav} staffRoster={staffRoster} tasks={tasks} incidents={incidents} onLogout={goLogin} />

    // ── Organizer views ──
    if (screen === 'organizer-dashboard') return <OrganizerDashboard nav={dashNav} zones={zones} gates={gates} recommendations={recommendations} onUpdateRecs={setRecommendations} />
    if (screen === 'organizer-heatmap') return <OrganizerHeatmap nav={dashNav} zones={zones} gates={gates} />
    if (screen === 'organizer-copilot') return <OrganizerCopilot nav={dashNav} zones={zones} gates={gates} />
    if (screen === 'organizer-incidents') return <OrganizerIncidents nav={dashNav} incidents={incidents} staffRoster={staffRoster} onUpdateIncidents={setIncidents} />
    if (screen === 'organizer-briefings') return <OrganizerBriefings nav={dashNav} recommendations={recommendations} onUpdateRecs={setRecommendations} zones={zones} gates={gates} />
    if (screen === 'organizer-analytics') return <OrganizerAnalytics nav={dashNav} zones={zones} gates={gates} incidents={incidents} />
    if (screen === 'organizer-sustainability') return <OrganizerSustainability nav={dashNav} zones={zones} />
    if (screen === 'organizer-team' || screen === 'organizer-profile') return <OrganizerTeam nav={dashNav} staffRoster={staffRoster} onLogout={goLogin} />

    return null
  }

  // ── Choose correct tab set ──
  const tabsMap = { fan: fanTabs, staff: staffTabs, organizer: organizerTabs }

  return (
    <div style={{ minHeight: '100vh', background: isDashboard ? '#070707' : '#ffffff', overflowX: 'hidden' }}>
      {/* Keyboard and screen-reader users jump straight past the nav */}
      <a href="#ff-main-content" className="ff-skip-link">Skip to main content</a>

      {/* Landing / About / Login get the marketing Nav */}
      {!isDashboard && <Nav handlers={handlers} />}

      {/* Scroll-driven Trionda ball on the long marketing pages */}
      {(screen === 'landing' || screen === 'about') && <ScrollBall />}

      {!isDashboard && (
        <main id="ff-main-content">
          {screen === 'landing' && (
            <Landing
              handlers={handlers}
              activePortal={activePortal}
              setActivePortal={setActivePortal}
            />
          )}

          {screen === 'about' && <About handlers={handlers} />}

          {screen === 'login' && (
            <Login handlers={handlers} role={role} setRole={setRole} />
          )}

          {screen === 'register' && (
            <CreateAccount handlers={handlers} role={role} setRole={setRole} />
          )}
        </main>
      )}

      {/* Dashboard screens get the DashboardShell */}
      {isDashboard && (
        <DashboardShell
          role={currentRole}
          tabs={tabsMap[currentRole] || fanTabs}
          screen={screen}
          nav={(s) => nav(s)}
          notifications={roleNotifs}
          onMarkRead={markNotifRead}
          onLogout={() => nav('login')}
          onSwitchRole={() => nav('login')}
          userName={currentRole === 'fan' ? fanProfile.name : currentRole === 'staff' ? staffRoster[0]?.name : 'Operations Command'}
        >
          {renderDashboardContent()}
        </DashboardShell>
      )}
    </div>
  )
}
