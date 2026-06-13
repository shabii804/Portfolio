import { useState, useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";

const navLinks = ["About", "Experience", "Projects", "Skills", "Contact"];

export default function Navbar() {
  const { personal } = usePortfolio();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
    setActive(id);
  };

  return (
    <nav className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "top-3 md:top-4 px-4 sm:px-6"
        : "top-0 px-0"
    }`}>
      <div className={`mx-auto max-w-5xl transition-all duration-500 ${
        scrolled
          ? "bg-bg-card/80 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-lg shadow-black/[0.04] dark:shadow-indigo-950/[0.08]"
          : "bg-transparent border-b border-transparent"
      }`}>
        <div className="px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-accent-indigo/35 shadow-md shadow-accent-indigo/10 transition-all duration-300 group-hover:border-accent-indigo group-hover:scale-105 group-hover:shadow-indigo-500/25 flex-shrink-0">
              <img
                src={personal.profilePic}
                alt={personal.name}
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-text-primary group-hover:text-accent-indigo transition-colors duration-300 hidden sm:inline-block">
              {personal.name}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className={`nav-link font-body text-xs lg:text-sm font-medium ${active === link ? "active" : ""}`}
              >
                {link}
              </button>
            ))}
            <a
              href={`https://wa.me/${(personal.phone||"").replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!%20I%27d%20like%20to%20talk.`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-5 py-2 rounded-full text-xs lg:text-sm font-medium font-display transition-all hover:scale-105 ml-2 shadow-sm glow-on-hover"
            >
              Hire Me
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-bg-secondary border border-border-subtle text-text-secondary hover:text-accent-indigo hover:border-accent-indigo/30 transition-all shadow-sm group"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:rotate-12"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:rotate-45"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-px bg-text-secondary transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-px bg-text-secondary transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-px bg-text-secondary transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Card Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden max-w-5xl mx-auto mt-2 bg-bg-card/90 backdrop-blur-xl border border-border-subtle rounded-2xl p-5 flex flex-col gap-2.5 shadow-xl animate-fade-in">
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
            className="btn-primary mt-2 py-2.5 rounded-xl text-sm font-medium text-center block shadow-md glow-on-hover"
          >
            Hire Me
          </a>
        </div>
      )}
    </nav>
  );
}
