import './index.css'
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
import VideoBackground from './components/VideoBackground'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import useLenis from './hooks/useLenis'
import useTheme from './hooks/useTheme'

/* PRD fixed section order:
   Nav → Hero → About → Skills → Projects → Journey → GitHub Activity → Contact → Footer */
export default function App() {
  useLenis()
  const { theme, toggle } = useTheme()

  return (
    <PortfolioProvider>
      {/* global-video-on scopes the frosted-glass section panels that float
          over the fixed footage (see index.css v13 block) */}
      <div className="relative global-video-on">
        <VideoBackground />
        <a href="#home" className="skip-link">Skip to content</a>
        <div className="noise-overlay" />
        <Preloader />
        <Cursor />
        <ScrollProgress />
        <Navbar theme={theme} onToggleTheme={toggle} />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Journey />
          <GitHubActivity />
          <Contact />
        </main>
        <Footer />
        <ChatButton />
        <CommandPalette />
        <BackToTop />
      </div>
    </PortfolioProvider>
  )
}
