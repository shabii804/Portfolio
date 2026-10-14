import './index.css'
import { PortfolioProvider } from './context/PortfolioContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ChatButton from './components/ChatButton'
import ScrollProgress from './components/ScrollProgress'
import BackToTop from './components/BackToTop'

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
          <Experience />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <Footer />
        <ChatButton />
        <BackToTop />
      </div>
    </PortfolioProvider>
  )
}
