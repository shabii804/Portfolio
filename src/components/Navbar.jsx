import { useState, useEffect } from "react";
import { usePortfolio } from "../hooks/usePortfolio";
import { scrollToSection } from "../hooks/useLenis";
import { content } from "../data/portfolio";

// "Activity" disappears with the section when the admin turns GitHub
// Activity off (content.settings.showGitHubActivity).
const navLinks = ["About", "Skills", "Projects", "Journey", "Activity", "Contact"].filter(
  (l) => l !== "Activity" || content?.settings?.showGitHubActivity !== false
);

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Navbar({ theme = "dark", onToggleTheme }) {
  const { personal } = usePortfolio();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");
  const [isApple] = useState(() =>
    /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  );

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 50);
        // Hide when scrolling down past the hero, reveal on any upward move
        if (y > 180 && y > last + 4) setHidden(true);
        else if (y < last - 4 || y <= 180) setHidden(false);
        last = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    scrollToSection(id.toLowerCase());
    setMobileOpen(false);
    setActive(id);
  };

  const openPalette = () => {
    setMobileOpen(false);
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <nav
      className={`nav-shell fixed left-0 right-0 z-50 ${hidden ? "nav-hidden" : ""} transition-all duration-500 ${
        scrolled ? "top-3 md:top-4 px-4 sm:px-6" : "nav-top top-0 px-0"
      }`}
    >
      <div className={`mx-auto max-w-5xl transition-all duration-500 ${
        scrolled
          ? "bg-bg-card/85 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]"
          : "bg-transparent border-b border-transparent"
      }`}>
        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => scrollToSection("home")}
            className="group flex items-center gap-3"
            aria-label="Back to top"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-accent-indigo/35 shadow-md shadow-accent-indigo/10 transition-all duration-300 group-hover:border-accent-indigo group-hover:scale-105 flex-shrink-0">
              <img
                src={personal.profilePic}
                alt={personal.name}
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
                loading="eager"
              />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-text-primary group-hover:text-accent-indigo transition-colors duration-300 hidden sm:inline-block">
              {personal.name}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className={`nav-link font-body text-[13px] lg:text-sm font-medium ${active === link ? "active" : ""}`}
              >
                {link}
              </button>
            ))}
            <a
              href={`https://wa.me/${(personal.phone||"").replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!%20I%27d%20like%20to%20talk.`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-medium font-display transition-all hover:scale-[1.03] ml-1.5 glow-on-hover"
            >
              Hire Me
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme toggle */}
            <button
              onClick={(e) => onToggleTheme({ x: e.clientX, y: e.clientY })}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-bg-secondary border border-border-subtle text-text-secondary hover:text-accent-indigo hover:border-accent-indigo/40 transition-all"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Command palette trigger */}
            <button
              onClick={openPalette}
              aria-label="Open command palette"
              className="hidden sm:flex items-center gap-2 h-9 pl-3 pr-2 rounded-full bg-bg-secondary border border-border-subtle text-text-muted hover:text-accent-indigo hover:border-accent-indigo/40 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="font-mono text-[10px] tracking-wide">{isApple ? "⌘" : "Ctrl+"}K</span>
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={`block w-5 h-px bg-text-secondary transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-px bg-text-secondary transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-px bg-text-secondary transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating card mobile menu */}
      {mobileOpen && (
        <div className="md:hidden max-w-5xl mx-auto mt-2 mx-4 bg-bg-card/95 backdrop-blur-xl border border-border-subtle rounded-2xl p-5 flex flex-col gap-2.5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] animate-fade-in">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className="text-left text-text-secondary hover:text-accent-indigo hover:bg-bg-hover/50 transition-all font-body text-sm py-2 px-3 rounded-xl"
            >
              {link}
            </button>
          ))}
          <a
            href={`https://wa.me/${(personal.phone||"").replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!%20I%27d%20like%20to%20talk.`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-2 py-2.5 rounded-xl text-sm font-medium text-center block glow-on-hover"
          >
            Hire Me
          </a>
        </div>
      )}
    </nav>
  );
}
