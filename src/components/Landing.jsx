import Hero from './landing/Hero.jsx'
import Scoreboard from './landing/Scoreboard.jsx'
import HowItWorks from './landing/HowItWorks.jsx'
import Portals from './landing/Portals.jsx'
import AIStrip from './landing/AIStrip.jsx'
import Marquee from './landing/Marquee.jsx'
import ImpactTeaser from './landing/ImpactTeaser.jsx'
import SiteFooter from './SiteFooter.jsx'

export default function Landing({ handlers, activePortal, setActivePortal }) {
  return (
    <div>
      <Hero handlers={handlers} />
      <Scoreboard />
      <HowItWorks />
      <Portals handlers={handlers} activePortal={activePortal} setActivePortal={setActivePortal} />
      <AIStrip />
      <Marquee />
      <ImpactTeaser handlers={handlers} />
      <SiteFooter handlers={handlers} />
    </div>
  )
}
