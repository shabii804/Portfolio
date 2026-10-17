import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "../hooks/usePortfolio";
import TechIcon from "./TechIcon";

/* ─────────────────────────────────────────────────────────────────────────────
   Bento project cards — real screenshots where they exist (Farooq Agencies,
   SpendSmart, School Management System), crafted art panels otherwise.
   Subtle pointer tilt on fine pointers only. Case-study modal unchanged.
   ──────────────────────────────────────────────────────────────────────────── */

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

/** Restrained tilt: ±2.5° max, rAF-throttled, transform only. */
function useTilt() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || !finePointer()) return;
    let raf = 0;
    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.transform = `perspective(900px) rotateY(${(px * 5).toFixed(2)}deg) rotateX(${(-py * 5).toFixed(2)}deg)`;
        });
      }
    };
    const onLeave = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, []);
  return ref;
}

/* ── Visual header per project ─────────────────────────────────────────────── */
function ProjectVisual({ project }) {
  const shot = project.screenshots?.[0];
  if (shot) {
    const isBrowserApp = project.id !== "sms"; // SMS is a Java desktop app
    const url = project.live ? new URL(project.live).hostname : `${project.id}.app`;
    return (
      <div className="bento-visual h-44 sm:h-52 mb-5">
        {isBrowserApp && (
          <div className="bento-chrome" aria-hidden="true">
            <i /><i /><i />
            <span>{url}</span>
          </div>
        )}
        <img
          src={`/screenshots/${shot}`}
          alt={`${project.title} interface preview`}
          decoding="async"
        />
      </div>
    );
  }
  // Crafted art panel for projects without a public screenshot
  return (
    <div className="bento-art h-44 sm:h-52 mb-5 rounded-xl" style={{ "--acc": project.accentHex }} aria-hidden="true">
      <span className="bento-art-tag">{project.badge}</span>
      <span className="bento-art-glyph">&lt;/&gt;</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Case-study modal: Problem → Approach → Outcome, with metrics, screenshots,
   features and the full stack. Falls back to the legacy details list when a
   project has no caseStudy object.
   ──────────────────────────────────────────────────────────────────────────── */
function CaseStudyModal({ project, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Focus the dialog for keyboard users
    setTimeout(() => dialogRef.current?.focus(), 30);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const screenshots = project.screenshots || [];
  const cs = project.caseStudy;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-bg-card border border-border-mid shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85)] focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-card/95 backdrop-blur-md border-b border-border-subtle px-5 sm:px-7 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="project-num flex-shrink-0">{project.num} /</span>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg sm:text-xl text-text-primary leading-tight truncate">{project.title}</h2>
              <p className="font-mono text-[11px] text-text-muted mt-0.5 truncate">{project.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close case study" className="w-9 h-9 flex-shrink-0 rounded-lg bg-bg-hover flex items-center justify-center text-text-muted hover:text-text-primary hover:border hover:border-border-bright transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-5 sm:px-7 py-6 space-y-9">
          {/* Screenshot gallery */}
          {screenshots.length > 0 && (
            <div>
              <div className="rounded-xl overflow-hidden border border-border-subtle bg-bg-primary aspect-video">
                <img
                  src={`/screenshots/${screenshots[imgIdx]}`}
                  alt={`${project.title} screenshot ${imgIdx + 1}`}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              {screenshots.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap" role="group" aria-label="Screenshots">
                  {screenshots.map((ss, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      aria-label={`View screenshot ${i + 1}`}
                      aria-pressed={i === imgIdx}
                      className={`w-14 h-9 rounded-lg overflow-hidden border transition-all ${i === imgIdx ? "border-accent-indigo" : "border-border-subtle opacity-60 hover:opacity-100"}`}
                    >
                      <img src={`/screenshots/${ss}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-11 rounded-full flex-shrink-0" style={{ background: `linear-gradient(180deg, ${project.accentHex}, transparent)` }} />
            <p className="font-display text-lg text-text-primary font-medium leading-snug">{project.tagline}</p>
          </div>

          {/* Metrics strip */}
          {cs?.metrics?.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {cs.metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-border-subtle bg-bg-secondary px-3 py-4 text-center">
                  <div className="font-display font-bold text-xl sm:text-2xl text-gradient-indigo leading-none">{m.value}</div>
                  <div className="font-mono text-[9px] text-text-muted uppercase tracking-wide mt-2 leading-relaxed">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Problem → Approach → Outcome */}
          {cs ? (
            <>
              <div>
                <h4 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo" /> The Problem
                </h4>
                <p className="font-body text-text-secondary text-sm leading-relaxed">{cs.problem}</p>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" /> The Approach
                </h4>
                <ul className="space-y-2.5">
                  {cs.approach.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-sm text-text-secondary leading-relaxed">
                      <span className="mt-0.5 w-5 h-5 rounded-md bg-accent-cyan/10 border border-accent-cyan/25 font-mono text-[9px] text-accent-cyan flex items-center justify-center flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo" /> The Outcome
                </h4>
                <ul className="space-y-2.5">
                  {cs.outcome.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-sm text-text-secondary leading-relaxed">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={project.accentHex} strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            /* Legacy fallback */
            <p className="font-body text-text-secondary leading-relaxed">{project.description}</p>
          )}

          {/* Key features */}
          {project.features?.length > 0 && (
            <div>
              <h4 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.18em] mb-3.5">Key Features</h4>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {project.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 font-body text-[13px] text-text-secondary">
                    <span className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0" style={{ background: project.accentHex }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stack */}
          <div>
            <h4 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.18em] mb-3">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border" style={{ color: project.accentHex + "cc", borderColor: project.accentHex + "30", background: project.accentHex + "08" }}>
                  <TechIcon name={t} className="w-3.5 h-3.5 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-1 pb-1">
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer"
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-display font-medium flex items-center gap-2 group glow-on-hover">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:scale-110"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Visit Live Site
              </a>
            )}
            {project.github && (
              <a href={project.github} target="_blank" rel="noreferrer"
                className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-display font-medium flex items-center gap-2 group glow-on-hover">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="transition-transform group-hover:scale-110"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                View Source
              </a>
            )}
            {!project.live && !project.github && (
              <span className="font-mono text-xs text-text-muted self-center">Source & demo not publicly available (client deployment)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Bento card ─────────────────────────────────────────────────────────── */
// Wide slots: the live client site and the storefront lead the grid
const SPAN_MAP = {
  farooq: "md:col-span-2 lg:col-span-2",
  eshop: "md:col-span-2 lg:col-span-2",
};

function ProjectCard({ project, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const tiltRef = useTilt();
  const featured = Boolean(SPAN_MAP[project.id]);

  return (
    <article
      ref={tiltRef}
      className={`bento-card bento-tilt animate-on-scroll card-border-glow card-glow-border rounded-2xl p-5 sm:p-6 bg-bg-card flex flex-col gap-4 cursor-pointer group ${SPAN_MAP[project.id] || ""}`}
      style={{
        transitionDelay: `${0.06 * index}s`,
        borderColor: hovered ? `${project.accentHex}40` : "rgb(var(--border-subtle))",
        boxShadow: hovered ? `0 20px 48px -16px ${project.accentHex}22` : "",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      aria-label={`Open ${project.title} case study`}
    >
      <ProjectVisual project={project} />

      <div className="flex items-start justify-between gap-3">
        <span className="project-num">{project.num} /</span>
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

      <div className="flex-1">
        <h3
          className="font-display font-bold text-xl text-text-primary mb-1.5 transition-colors duration-300"
          style={{ color: hovered ? project.accentHex : "" }}
        >
          {project.title}
        </h3>
        <p className="font-body text-text-secondary/70 text-xs italic mb-3">{project.tagline}</p>
        <p className={`font-body text-text-secondary text-sm leading-relaxed ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
          {project.caseStudy?.problem || project.description}
        </p>
      </div>

      {/* Case-study metrics */}
      {project.caseStudy?.metrics?.length > 0 && (
        <div className="flex gap-2">
          {project.caseStudy.metrics.map((m) => (
            <div key={m.label} className="flex-1 rounded-lg border border-border-subtle bg-bg-secondary px-2 py-2.5 text-center">
              <div className="font-display font-bold text-sm leading-none" style={{ color: project.accentHex }}>{m.value}</div>
              <div className="font-mono text-[8px] text-text-muted mt-1 leading-tight">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {project.stack.slice(0, featured ? 5 : 4).map((tech) => (
          <span key={tech} className="skill-chip font-mono text-[10px] px-2.5 py-1 rounded-md">
            <TechIcon name={tech} className="chip-ico w-3 h-3" />
            {tech}
          </span>
        ))}
        {project.stack.length > (featured ? 5 : 4) && (
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-md text-text-muted">+{project.stack.length - (featured ? 5 : 4)}</span>
        )}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-border-subtle">
        <span className="font-mono text-[10px] text-text-muted">{project.date}</span>
        <div className="flex-1" />
        {project.live && (
          <span className="font-mono text-[10px] flex items-center gap-1.5" style={{ color: project.accentHex }}>
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
          Case study
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </article>
  );
}

/* ─── Section ──────────────────────────────────────────────────────────────── */
const MAX_FILTERS = 9;

export default function Projects() {
  const { projects } = usePortfolio();
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [activeStack, setActiveStack] = useState("All");
  const [showAllFilters, setShowAllFilters] = useState(false);
  const ref = useRef(null);

  const allStacks = ["All", ...Array.from(
    new Set(projects.flatMap((p) => p.stack || []))
  ).sort((a, b) => a.localeCompare(b))];

  const filtered = projects.filter((p) => {
    const matchesStack = activeStack === "All" || (p.stack || []).includes(activeStack);
    if (!matchesStack) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.subtitle?.toLowerCase().includes(q) ||
      p.tagline?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.stack || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  const visibleFilters = showAllFilters ? allStacks : allStacks.slice(0, MAX_FILTERS);

  return (
    <>
      <section id="projects" ref={ref} className="py-24 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-cyan/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="animate-on-scroll flex items-center gap-4 mb-4">
            <span className="section-label">Projects</span>
            <div className="grad-line flex-1 max-w-16" />
          </div>
          <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4" style={{ transitionDelay: "0.05s" }}>
            Case studies.
          </h2>
          <p className="animate-on-scroll font-body text-text-secondary text-lg mb-10 max-w-2xl" style={{ transitionDelay: "0.1s" }}>
            Four production builds — every card opens the full story: the problem, the approach, the outcome.
          </p>

          {/* Search + Filter */}
          <div className="animate-on-scroll mb-10 space-y-4" style={{ transitionDelay: "0.12s" }}>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects by name, tech, or keyword..."
                aria-label="Search projects"
                className="w-full bg-bg-card border border-border-subtle rounded-xl pl-11 pr-10 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo/50 transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tech stack">
              {visibleFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveStack(s)}
                  aria-pressed={activeStack === s}
                  className={`font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all ${
                    activeStack === s
                      ? "bg-accent-indigo/15 text-accent-indigo border-accent-indigo/30"
                      : "text-text-muted border-border-mid hover:border-accent-indigo/40 hover:text-accent-indigo"
                  }`}
                >
                  {s}
                </button>
              ))}
              {allStacks.length > MAX_FILTERS && (
                <button
                  onClick={() => setShowAllFilters((v) => !v)}
                  className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-dashed border-border-mid text-text-muted hover:text-accent-indigo hover:border-accent-indigo/40 transition-all"
                  aria-expanded={showAllFilters}
                >
                  {showAllFilters ? "− less" : `+${allStacks.length - MAX_FILTERS} more`}
                </button>
              )}
            </div>

            <div className="font-mono text-[10px] text-text-muted">
              {filtered.length === projects.length
                ? `Showing all ${projects.length} case studies`
                : `Showing ${filtered.length} of ${projects.length} case studies`}
              {(query || activeStack !== "All") && (
                <button
                  onClick={() => { setQuery(""); setActiveStack("All"); }}
                  className="ml-3 text-accent-cyan hover:text-accent-indigo transition-colors underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Bento grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-50" aria-hidden="true">🔍</div>
              <h3 className="font-display font-semibold text-text-primary mb-2">No projects match your search</h3>
              <p className="font-body text-sm text-text-muted mb-6">Try a different keyword or clear your filters.</p>
              <button
                onClick={() => { setQuery(""); setActiveStack("All"); }}
                className="btn-ghost px-5 py-2.5 rounded-xl font-mono text-xs"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onClick={() => setSelected(p)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && <CaseStudyModal project={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
