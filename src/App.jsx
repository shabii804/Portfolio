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

export default function App() {
  return (
    <PortfolioProvider>
      <div className="relative">
        <div className="noise-overlay" />
        <Navbar />
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
        <Footer />
        <ChatButton />
      </div>
    </PortfolioProvider>
  )
}
