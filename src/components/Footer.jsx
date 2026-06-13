import { usePortfolio } from "../context/PortfolioContext";

export default function Footer() {
  const { personal } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border-subtle relative overflow-hidden bg-bg-primary py-12 md:py-20 z-10">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-accent-indigo/50 to-transparent" />

      {/* Cosmic background glow blobs */}
      <div className="absolute top-1/2 left-1/4 w-[250px] h-[250px] rounded-full opacity-[0.02] blur-[80px] bg-accent-indigo pointer-events-none z-0 bg-blob-indigo" />
      <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] rounded-full opacity-[0.015] blur-[80px] bg-accent-cyan pointer-events-none z-0 bg-blob-cyan" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent-indigo/10 border border-accent-indigo/25 flex items-center justify-center shadow-inner">
                <span className="font-mono font-bold text-sm text-accent-indigo">SA</span>
              </div>
              <div>
                <div className="font-display font-semibold text-text-primary text-sm">{personal.name}</div>
                <div className="font-mono text-[10px] text-text-muted">{personal.title}</div>
              </div>
            </div>
            <p className="hidden sm:block font-body text-text-secondary text-sm leading-relaxed max-w-xs">
              Building production-grade web apps with React, Node.js & Firebase. Based in {personal.location}.
            </p>
            {/* Availability */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${personal.available ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-text-muted"}`} />
              <span className="font-mono text-[11px] text-text-muted">
                {personal.available ? "Available for opportunities" : "Currently unavailable"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-5">Navigation</h4>
            <div className="space-y-2.5">
              {["about", "experience", "projects", "skills", "contact"].map((id) => (
                <button
                  key={id}
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                  className="block font-body text-sm text-text-secondary hover:text-accent-indigo transition-colors capitalize text-left link-underline-effect"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Resume */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-5">Get in touch</h4>
            <div className="space-y-3 mb-6">
              <a href={`https://wa.me/${(personal.phone||"").replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 font-body text-sm text-text-secondary hover:text-accent-indigo transition-colors group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-text-muted group-hover:text-accent-indigo transition-colors"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm4.786 14.193c-.272.763-1.392 1.4-2.155 1.508-.654.098-1.503.185-4.408-.98-3.723-1.492-6.13-5.267-6.315-5.512-.185-.245-1.503-2-1.503-3.816 0-1.815.959-2.709 1.303-3.069.344-.36.758-.45.998-.45.24 0 .48.01.688.02.218.01.512-.08.8-.08.288 0 .584.09.83.676.24.58.83 2.02.9 2.16.07.14.12.3.02.5-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.3.8 1.31 1.71 2.12.91.81 1.67 1.06 1.91 1.19.24.13.38.11.52-.05.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.52.72 1.79.85.27.14.45.2.51.31.06.11.06.66-.21 1.42z"/></svg>
                  <span className="link-underline-effect">WhatsApp: {personal.phone}</span>
                </a>
              <a href={`tel:${personal.phone}`}
                className="flex items-center gap-2.5 font-body text-sm text-text-secondary hover:text-accent-indigo transition-colors group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted group-hover:text-accent-indigo transition-colors"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.26-1.26a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span className="link-underline-effect">{personal.phone}</span>
              </a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 font-body text-sm text-text-secondary hover:text-accent-indigo transition-colors group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-text-muted group-hover:text-accent-indigo transition-colors"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                <span className="link-underline-effect">LinkedIn Profile</span>
              </a>
              {personal.github && (
                <a href={personal.github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 font-body text-sm text-text-secondary hover:text-accent-indigo transition-colors group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-text-muted group-hover:text-accent-indigo transition-colors"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  <span className="link-underline-effect">GitHub Profile</span>
                </a>
              )}
            </div>

            {/* Resume actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={personal.resumePdf}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold text-xs btn-ghost justify-center group glow-on-hover"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:scale-105"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                View Resume
              </a>
              <a
                href={personal.resumePdf}
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold text-xs btn-primary justify-center group glow-on-hover"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-y-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Resume
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] text-text-muted text-center sm:text-left">
            © 2025 {personal.name} · Built with React, Vite & Tailwind CSS
          </span>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <a href={personal.github} target="_blank" rel="noreferrer" className="contact-link transition-transform hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" className="contact-link transition-transform hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href={`https://wa.me/${(personal.phone||"").replace(/\D/g, "")}`} className="contact-link transition-transform hover:scale-110" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm4.786 14.193c-.272.763-1.392 1.4-2.155 1.508-.654.098-1.503.185-4.408-.98-3.723-1.492-6.13-5.267-6.315-5.512-.185-.245-1.503-2-1.503-3.816 0-1.815.959-2.709 1.303-3.069.344-.36.758-.45.998-.45.24 0 .48.01.688.02.218.01.512-.08.8-.08.288 0 .584.09.83.676.24.58.83 2.02.9 2.16.07.14.12.3.02.5-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.3.8 1.31 1.71 2.12.91.81 1.67 1.06 1.91 1.19.24.13.38.11.52-.05.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.52.72 1.79.85.27.14.45.2.51.31.06.11.06.66-.21 1.42z"/></svg>
              </a>
            </div>
            
            {/* Smooth back to top */}
            <button 
              onClick={scrollToTop} 
              className="w-9 h-9 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary hover:text-accent-indigo hover:border-accent-indigo/30 transition-all shadow-sm flex items-center justify-center group hover:-translate-y-1"
              title="Scroll to top"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-y-0.5"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

