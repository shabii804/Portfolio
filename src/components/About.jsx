import { useEffect, useRef } from "react";
import { usePortfolio } from "../context/PortfolioContext";

export default function About() {
  const { personal } = usePortfolio();
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const highlights = [
    { icon: "🎓", label: "CGPA 4.0", sub: "Riphah International University" },
    { icon: "🚀", label: "4 Production Apps", sub: "React · Node.js · Firebase" },
    { icon: "🏢", label: "Internship Certified", sub: "Developer Hub Corporation" },
    { icon: "🌍", label: "Live Deployment", sub: "farooqagensies.web.app" },
  ];

  return (
    <section id="about" ref={ref} className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="animate-on-scroll flex items-center gap-4 mb-16">
          <span className="section-label">About</span>
          <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-accent-indigo/50 to-transparent" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl leading-tight mb-6">
              Building software that<br />
              <span className="text-gradient-indigo">actually ships.</span>
            </h2>

            <div className="animate-on-scroll space-y-4 font-body text-text-secondary leading-relaxed" style={{ transitionDelay: "0.1s" }}>
              <p>{personal.bio}</p>
              <p>
                My stack is React and Node.js at its core, extended with Firebase for serverless deployments,
                Microsoft SQL Server for relational data, and Tailwind CSS for design-precise interfaces.
                I also build Java desktop applications with Swing and MSSQL, delivering real-world production systems.
              </p>
              <p>
                I'm actively looking for my next opportunity — a place where I can grow under industry
                mentorship and contribute to meaningful, scalable products across web and desktop.
              </p>
            </div>

            <div className="animate-on-scroll mt-8 flex items-center gap-5" style={{ transitionDelay: "0.2s" }}>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" className="contact-link flex items-center gap-2 text-sm font-body">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
              <span className="text-border-mid">·</span>
              <a href={`https://wa.me/${(personal.phone||"\\").replace(/\\D/g, "")}`} className="contact-link flex items-center gap-2 text-sm font-body" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5c-2.1-2.1-5.5-2.1-7.6 0L11 5.4C9.8 6.6 9.2 8.3 9.4 10.1c.2 1.8 1.1 3.6 2.5 4.9l.5.5c.4.4.5 1 .3 1.5l-.8 2.1c-.2.5-.1 1.1.3 1.5l1.6 1.6c.6.6 1.6.6 2.2 0 3.2-3.2 3.2-8.4 0-11.6l-.6-.6c-.3-.3-.5-.7-.5-1.1 0-.4.2-.8.5-1.1l2-2C20.5 4.8 20.5 3.9 20.5 3.5z"/></svg>
                WhatsApp
              </a>
              {personal.github && (
                <>
                  <span className="text-border-mid">·</span>
                  <a href={personal.github} target="_blank" rel="noreferrer" className="contact-link flex items-center gap-2 text-sm font-body">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    GitHub
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {highlights.map((h, i) => (
              <div key={h.label} className="animate-on-scroll card-border-glow rounded-2xl p-5 bg-bg-card" style={{ transitionDelay: `${0.1 * i}s` }}>
                <div className="text-2xl mb-3">{h.icon}</div>
                <div className="font-display font-semibold text-text-primary text-sm mb-1">{h.label}</div>
                <div className="font-mono text-[10px] text-text-muted">{h.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
