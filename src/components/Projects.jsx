import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";

function ProjectModal({ project, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const screenshots = project.screenshots || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-card border border-border-mid shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-bg-card/95 backdrop-blur-sm border-b border-border-subtle px-7 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <span className="project-num">{project.num} /</span>
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary leading-none">{project.title}</h2>
              <p className="font-mono text-xs text-text-muted mt-0.5">{project.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-7 py-6 space-y-7">
          {/* Screenshot gallery */}
          {screenshots.length > 0 && (
            <div>
              <div className="rounded-xl overflow-hidden border border-border-subtle bg-bg-primary aspect-video">
                <img
                  src={`/screenshots/${screenshots[imgIdx]}`}
                  alt={`${project.title} screenshot ${imgIdx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {screenshots.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {screenshots.map((ss, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-14 h-9 rounded-lg overflow-hidden border transition-all ${i === imgIdx ? "border-accent-indigo" : "border-border-subtle opacity-60 hover:opacity-100"}`}
                    >
                      <img src={`/screenshots/${ss}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-full" style={{ background: project.accentHex }} />
            <p className="font-display text-lg text-text-primary font-medium">{project.tagline}</p>
          </div>

          {/* Description */}
          <p className="font-body text-text-secondary leading-relaxed">{project.description}</p>

          {/* Feature bullets */}
          <div>
            <h4 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">Key Features</h4>
            <ul className="space-y-2.5">
              {(project.details || []).map((d, i) => (
                <li key={i} className="flex items-start gap-3 font-body text-sm text-text-secondary">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project.accentHex + "99" }} />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Stack */}
          <div>
            <h4 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((t) => (
                <span key={t} className="font-mono text-xs px-3 py-1.5 rounded-lg border" style={{ color: project.accentHex + "cc", borderColor: project.accentHex + "30", background: project.accentHex + "08" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-3 pt-2">
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer"
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-display font-medium flex items-center gap-2 group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:scale-110"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                View Demo
              </a>
            )}
            {project.github && (
              <a href={project.github} target="_blank" rel="noreferrer"
                className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-display font-medium flex items-center gap-2 group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="transition-transform group-hover:scale-110"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                View GitHub Code
              </a>
            )}
            {!project.live && !project.github && (
              <span className="font-mono text-xs text-text-muted self-center">Source & demo not publicly available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onClick, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="animate-on-scroll card-border-glow rounded-2xl p-7 bg-bg-card flex flex-col gap-4 cursor-pointer group"
      style={{
        transitionDelay: `${0.07 * index}s`,
        borderColor: hovered ? `${project.accentHex}40` : "rgb(var(--border-subtle))",
        boxShadow: hovered ? `0 16px 40px -12px ${project.accentHex}18` : "",
        transform: hovered ? "translateY(-4px)" : ""
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <span className="project-num">{project.num} /</span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] px-2.5 py-1 rounded-full border transition-all duration-300"
            style={{
              color: hovered ? project.accentHex : "rgb(var(--text-secondary))",
              borderColor: hovered ? project.accentHex + "40" : "rgb(var(--border-mid))",
              background: hovered ? project.accentHex + "08" : "transparent",
            }}
          >
            {project.badge}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <h3
          className="font-display font-bold text-xl text-text-primary mb-1.5 transition-colors duration-300"
          style={{ color: hovered ? project.accentHex : "" }}
        >
          {project.title}
        </h3>
        <p className="font-body text-text-secondary/70 text-xs italic mb-3">{project.tagline}</p>
        <p className="font-body text-text-secondary text-sm leading-relaxed line-clamp-3">{project.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.stack.slice(0, 4).map((tech) => (
          <span key={tech} className="skill-chip font-mono text-[10px] px-2.5 py-1 rounded-md">{tech}</span>
        ))}
        {project.stack.length > 4 && (
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-md text-text-muted">+{project.stack.length - 4}</span>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
        <span className="font-mono text-[10px] text-text-muted">{project.date}</span>
        <div className="flex-1" />
        {project.live && (
          <span className="font-mono text-[10px] flex items-center gap-1" style={{ color: project.accentHex }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />Live
          </span>
        )}
        {project.github && !project.live && (
          <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub
          </span>
        )}
        <span className="font-mono text-[10px] text-text-muted flex items-center gap-1 group-hover:text-accent-indigo transition-colors">
          View details
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects } = usePortfolio();
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section id="projects" ref={ref} className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-cyan/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="animate-on-scroll flex items-center gap-4 mb-4">
            <span className="section-label">Projects</span>
            <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-accent-indigo/50 to-transparent" />
          </div>
          <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-3" style={{ transitionDelay: "0.05s" }}>
            Things I've built.
          </h2>
          <p className="animate-on-scroll font-body text-text-secondary text-lg mb-14 max-w-xl" style={{ transitionDelay: "0.1s" }}>
            Click any card to see the full breakdown — features, stack, and screenshots.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} onClick={() => setSelected(p)} />
            ))}
          </div>
        </div>
      </section>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
