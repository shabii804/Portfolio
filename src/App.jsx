import { useEffect, useSyncExternalStore } from "react"
import "./index.css"
import { content } from "./data/portfolio"
import { subscribeRuntime, runtimeVersion, runtimeSettings } from "./data/runtimeContent"
import { PortfolioProvider } from './context/PortfolioContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Journey from './components/Journey'
import GitHubActivity from './components/GitHubActivity'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ChatButton from './components/ChatButton'
import CommandPalette from './components/CommandPalette'
import ScrollProgress from './components/ScrollProgress'
import BackToTop from './components/BackToTop'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import useLenis from './hooks/useLenis'
import useTheme from './hooks/useTheme'

// Site-wide switches — editable in /admin → Settings ("Site settings" panel).
// `!== false` keeps everything ON when the settings section is missing.
const SETTINGS = content?.settings ?? {}

// Runtime-reactive settings: bundled defaults overlaid by the latest runtime
// snapshot (Supabase saves / local test mode apply without a rebuild).
function useSettings() {
  useSyncExternalStore(subscribeRuntime, runtimeVersion)
  return runtimeSettings(SETTINGS)
}

// When the preloader is disabled via settings, something still has to lift
// the hero entrance choreography (html.is-ready + "sa:ready" event) — the
// Preloader normally owns that handoff.
function ReadyBroadcast() {
  useEffect(() => {
    document.documentElement.classList.add("is-ready")
    window.dispatchEvent(new CustomEvent("sa:ready"))
  }, [])
  return null
}

/* PRD fixed section order:
   Nav → Hero → About → Skills → Projects → Journey → GitHub Activity → Contact → Footer
   (individual layers can be toggled from the admin panel's Settings tab) */
export default function App() {
  useLenis()
  const { theme, toggle } = useTheme()
  const settings = useSettings()

  // SEO title/description from admin settings (client-side — the static
  // index.html defaults still apply for crawlers and before hydration).
  useEffect(() => {
    if (settings.seoTitle) document.title = settings.seoTitle
    if (settings.seoDescription) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", settings.seoDescription)
    }
  }, [settings])

  return (
    <PortfolioProvider>
      <div className="relative">
        <a href="#home" className="skip-link">Skip to content</a>
        <div className="noise-overlay" />
        {settings.showPreloader === false ? <ReadyBroadcast /> : <Preloader />}
        {settings.showCursor !== false && <Cursor />}
        {settings.showScrollProgress !== false && <ScrollProgress />}
        <Navbar theme={theme} onToggleTheme={toggle} />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Journey />
          {settings.showGitHubActivity !== false && <GitHubActivity />}
          <Contact />
        </main>
        <Footer />
        {settings.showChatbot !== false && <ChatButton />}
        <CommandPalette />
        {settings.showBackToTop !== false && <BackToTop />}
      </div>
    </PortfolioProvider>
  )
}
