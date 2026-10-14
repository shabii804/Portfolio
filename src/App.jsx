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

/* PRD fixed section order:
   Nav → Hero → About → Skills → Projects → Journey → GitHub Activity → Contact → Footer */
export default function App() {
  return (
    <PortfolioProvider>
      <div className="relative">
        <a href="#home" className="skip-link">Skip to content</a>
        <div className="noise-overlay" />
        <ScrollProgress />
        <Navbar />
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
