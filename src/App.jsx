import { useEffect } from "react"
import "./index.css"
import { content } from "./data/portfolio"
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

  // SEO title/description from admin settings (client-side — the static
  // index.html defaults still apply for crawlers and before hydration).
  useEffect(() => {
    if (SETTINGS.seoTitle) document.title = SETTINGS.seoTitle
    if (SETTINGS.seoDescription) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", SETTINGS.seoDescription)
    }
  }, [])

  return (
    <PortfolioProvider>
      <div className="relative">
        <a href="#home" className="skip-link">Skip to content</a>
        <div className="noise-overlay" />
        {SETTINGS.showPreloader === false ? <ReadyBroadcast /> : <Preloader />}
        {SETTINGS.showCursor !== false && <Cursor />}
        {SETTINGS.showScrollProgress !== false && <ScrollProgress />}
        <Navbar theme={theme} onToggleTheme={toggle} />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Journey />
          {SETTINGS.showGitHubActivity !== false && <GitHubActivity />}
          <Contact />
        </main>
        <Footer />
        {SETTINGS.showChatbot !== false && <ChatButton />}
        <CommandPalette />
        {SETTINGS.showBackToTop !== false && <BackToTop />}
      </div>
    </PortfolioProvider>
  )
}
