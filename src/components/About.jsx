import { useEffect, useRef, useState } from "react";
import { GraduationCap, Rocket, Building2, Globe2 } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import TechIcon from "./TechIcon";
import Terminal from "./Terminal";

export default function About() {
  const { personal } = usePortfolio();
  const ref = useRef(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const highlights = [
    { Icon: GraduationCap, label: "CGPA 4.0", sub: "Riphah International University" },
    { Icon: Rocket, label: "4 Production Apps", sub: "React · Node.js · Firebase" },
    { Icon: Building2, label: "Internship Certified", sub: "Developer Hub Corporation" },
    { Icon: Globe2, label: "Live Deployment", sub: "farooqagensies.com" },
  ];

  const focusAreas = ["Web Apps", "Desktop Systems", "Databases", "UI Engineering"];

  return (
    <section id="about" ref={ref} className="py-24 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="animate-on-scroll flex items-center gap-4 mb-12">
          <span className="section-label">About</span>
          <div className="grad-line flex-1 max-w-16" />
        </div>

        {/* Full-width heading — no column owns the title, grid stays balanced */}
        <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl leading-tight mb-10 lg:mb-12 max-w-2xl">
          Building software that<br />
          <span className="text-gradient-indigo">actually ships.</span>
        </h2>

        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-16 items-center">
          {/* Left — story */}
          <div>
            <div className="animate-on-scroll space-y-5 font-body text-text-secondary leading-relaxed text-[15px] sm:text-base" style={{ transitionDelay: "0.1s" }}>
              <p>{personal.bio}</p>
              <p>
                My core stack is React and Node.js, extended with Firebase for serverless deployments,
                Microsoft SQL Server for relational data, and Tailwind CSS for design-precise interfaces.
                On the desktop side I build Java + Swing systems with real database backends — the same
                engineering discipline, a different runtime. What ties it all together is an obsession
                with shipping: every project in my portfolio is deployed, in use, or both.
              </p>
              <p>
                I'm actively looking for my next step — <span className="text-text-primary">internships, freelance work, or a junior full-time role</span> —
                where I can grow under industry mentorship and contribute to meaningful, scalable products.
                Perfect CGPA, yes; but what I care about most is the distance between an idea and production.
              </p>
            </div>

            {/* Focus areas */}
            <div className="animate-on-scroll mt-8 flex flex-wrap gap-2.5" style={{ transitionDelay: "0.15s" }}>
              {focusAreas.map((area) => (
                <span key={area} className="skill-chip font-mono text-[11px] px-3.5 py-2 rounded-lg">
                  <TechIcon name={area} className="chip-ico w-3.5 h-3.5" />
                  {area}
                </span>
              ))}
            </div>

            <div className="animate-on-scroll mt-9 flex items-center gap-5" style={{ transitionDelay: "0.2s" }}>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" className="contact-link flex items-center gap-2 text-sm font-body">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
              <span className="text-border-mid">·</span>
              <a href={`https://wa.me/${(personal.phone||"").replace(/\D/g, "")}`} className="contact-link flex items-center gap-2 text-sm font-body" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm4.786 14.193c-.272.763-1.392 1.4-2.155 1.508-.654.098-1.503.185-4.408-.98-3.723-1.492-6.13-5.267-6.315-5.512-.185-.245-1.503-2-1.503-3.816 0-1.815.959-2.709 1.303-3.069.344-.36.758-.45.998-.45.24 0 .48.01.688.02.218.01.512-.08.8-.08.288 0 .584.09.83.676.24.58.83 2.02.9 2.16.07.14.12.3.02.5-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.3.8 1.31 1.71 2.12.91.81 1.67 1.06 1.91 1.19.24.13.38.11.52-.05.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.52.72 1.79.85.27.14.45.2.51.31.06.11.06.66-.21 1.42z"/></svg>
                WhatsApp
              </a>
              <span className="text-border-mid">·</span>
              <a href={personal.github} target="_blank" rel="noreferrer" className="contact-link flex items-center gap-2 text-sm font-body">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Right — circular portrait */}
          <div className="animate-on-scroll" style={{ transitionDelay: "0.12s" }}>
            <div className="avatar-wrap">
              <div className="avatar-glow" aria-hidden="true" />
              <div className="avatar-ring" aria-hidden="true" />
              <div className="avatar-core">
                {!imgError ? (
                  <img
                    src={personal.profilePic}
                    alt={`${personal.name} — portrait`}
                    className="w-full h-full object-cover grayscale-[30%] transition-[filter] duration-500 hover:grayscale-0"
                    loading="lazy"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display font-bold text-6xl text-gradient-indigo">SA</span>
                  </div>
                )}
              </div>
              <div className="avatar-status">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[9px] text-white/85">Open to work</span>
              </div>
            </div>
            <div className="text-center mt-7">
              <div className="font-display font-semibold text-text-primary text-lg leading-tight">{personal.name}</div>
              <div className="font-mono text-[10px] text-text-muted mt-1.5 tracking-[0.14em] uppercase">{personal.location}</div>
            </div>
          </div>
        </div>

        {/* Highlight strip — full width band, kills the old column dead-space */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 lg:mt-14">
          {highlights.map((h, i) => (
            <div key={h.label} className="animate-on-scroll card-border-glow card-glow-border rounded-2xl p-5 bg-bg-card" style={{ transitionDelay: `${0.16 + 0.06 * i}s` }}>
              <h.Icon className="w-5 h-5 text-accent-indigo mb-3" strokeWidth={1.8} aria-hidden="true" />
              <div className="font-display font-semibold text-text-primary text-sm mb-1">{h.label}</div>
              <div className="font-mono text-[10px] text-text-muted leading-relaxed">{h.sub}</div>
            </div>
          ))}
        </div>

        {/* Interactive terminal — query the portfolio like a CLI */}
        <div className="animate-on-scroll mt-14 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] text-accent-cyan/70 uppercase tracking-[0.18em]">Interactive</span>
            <div className="h-px flex-1 max-w-24" style={{ background: "linear-gradient(to right, rgba(34,211,238,0.4), transparent)" }} />
          </div>
          <p className="font-body text-text-secondary text-sm mb-5 max-w-xl">
            Prefer CLIs to contact forms? Query my portfolio like a terminal — try
            <code className="terminal-chip mx-1">skills</code>
            or
            <code className="terminal-chip mx-1">projects</code>
            — or go straight for
            <code className="terminal-chip mx-1">sudo hire shoaib</code>
          </p>
          <Terminal />
        </div>
      </div>
    </section>
  );
}
