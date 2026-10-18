import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Rocket } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { useGithubRepos } from "../hooks/useGithubRepos";
import useSiteSettings from "../hooks/useSiteSettings";
import { applyRepoSettings, orderArchive } from "../data/githubRepos";
import TechIcon from "./TechIcon";
import SectionHeader from "./motion/SectionHeader";
import { EASE_OUT } from "./motion/ease";

/* ─────────────────────────────────────────────────────────────────────────────
   Bento project cards — real screenshots where they exist (Farooq Agencies,
   SpendSmart, School Management System), crafted art panels otherwise.
   Subtle pointer tilt on fine pointers only. Case-study modal unchanged.
   ──────────────────────────────────────────────────────────────────────────── */

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

/** Restrained tilt: ±5° max, rAF-throttled, transform only + a light
 *  reflection gradient that follows the cursor (--mx/--my + .tilting). */
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
      el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
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

/* ── Visual header per project — consistent 16:9 (v24) ─────────────────── */
function ProjectVisual({ project }) {
  const shot = project.screenshots?.[0];
  if (shot) {
    const isBrowserApp = project.id !== "sms"; // SMS is a Java desktop app
    const url = project.live ? new URL(project.live).hostname : `${project.id}.app`;
    return (
      <div className="bento-visual aspect-video mb-5">
        {isBrowserApp && (
          <div className="bento-chrome" aria-hidden="true">
            <i /><i /><i />
            <span>{url}</span>
          </div>
        )}
        <img
          src={`/screenshots/${shot}`}
          alt={`${project.title} interface preview`}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }
  // Designed gradient mockup for projects without a public screenshot (v24):
  // accent-tinted wireframe skeleton — no more faint </> placeholder.
  if (project.id === "eshop") {
    return (
      <div className="bento-art aspect-video mb-5 rounded-xl" style={{ "--acc": project.accentHex }} aria-hidden="true">
        <span className="bento-art-tag">{project.badge}</span>
        <div className="eshop-mock">
          <div className="eshop-nav"><i /><i /><i /><span className="eshop-cart" /></div>
          <div className="eshop-hero" />
          <div className="eshop-grid"><i /><i /><i /></div>
        </div>
      </div>
    );
  }
  return (
    <div className="bento-art aspect-video mb-5 rounded-xl" style={{ "--acc": project.accentHex }} aria-hidden="true">
      <span className="bento-art-tag">{project.badge}</span>
      <div className="bento-skel">
        <div className="bento-skel-nav"><i /><i /><i /><span className="bento-skel-dot" /></div>
        <div className="bento-skel-hero" />
        <div className="bento-skel-row"><i /><i /><i /></div>
      </div>
      <span className="bento-art-ico"><TechIcon name={project.stack?.[0]} className="w-12 h-12" /></span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Case-study modal: Problem → Approach → Outcome, with metrics, screenshots,
   features and the full stack. Falls back to the legacy details list when a
   project has no caseStudy object. Exported for reuse (Home featured strip).
   ──────────────────────────────────────────────────────────────────────────── */
export function CaseStudyModal({ project, onClose }) {
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
                  <div className="font-mono text-[10px] text-text-muted uppercase tracking-wide mt-2 leading-relaxed">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* v32 — GitHub repository metadata (synced cards): stars / forks /
              language / last push, straight from the API snapshot */}
          {project.ghMeta && (
            <div>
              <h4 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.18em] mb-3">Repository</h4>
              <div className="rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3.5">
                <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {project.ghMeta.stars} stars
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                    {project.ghMeta.forks} forks
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: project.accentHex }} />
                    {project.ghMeta.language}
                  </span>
                  {project.ghMeta.pushedAt && (
                    <span>updated {new Date(project.ghMeta.pushedAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })}</span>
                  )}
                </div>
                {project.ghMeta.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {project.ghMeta.topics.map((t) => (
                      <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-border-mid text-text-muted">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
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
            /* Legacy fallback — skipped for GitHub-synced cards (their tagline
               block above already carries the repo description verbatim) */
            project.source !== "github" && (
              <p className="font-body text-text-secondary leading-relaxed">{project.description}</p>
            )
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
                  <TechIcon name={t} className="w-4 h-4 shrink-0" />
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
                className={`${project.live ? "btn-ghost" : "btn-primary"} px-5 py-2.5 rounded-xl text-sm font-display font-medium flex items-center gap-2 group glow-on-hover`}>
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

/* ─── Bento card (v24): alternating slide-in, spotlight border, 16:9 ──────
    Exported for reuse — Home's "Selected work" strip renders the same card. */
export function ProjectCard({ project, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const tiltRef = useTilt();
  const reduced = useReducedMotion();
  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      className="min-h-0"
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: fromLeft ? -48 : 48, filter: "blur(6px)" }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: (index % 2) * 0.08 }}
    >
    <article
      ref={tiltRef}
      className="bento-card bento-tilt card-border-glow card-glow-border rounded-2xl p-5 sm:p-6 bg-bg-card flex flex-col gap-4 cursor-pointer group h-full"
      style={{
        "--acc": project.accentHex,
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
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="project-num">{project.num} /</span>
          {/* v34 — admin pin: pinned builds float to the top of the archive */}
          {project.pinned && (
            <span data-pinned="true" className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-amber-300 leading-none" title="Pinned from the admin panel">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1" /></svg>
              Pinned
            </span>
          )}
        </div>
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
        {/* v32: GitHub-synced cards already carry their copy in the tagline —
            a body line would just repeat it verbatim. */}
        {!(project.source === "github") && (
          <p className="font-body text-text-secondary text-sm leading-relaxed line-clamp-2">
            {project.caseStudy?.problem || project.description}
          </p>
        )}
      </div>

      {/* Case-study metrics */}
      {project.caseStudy?.metrics?.length > 0 && (
        <div className="flex gap-2">
          {project.caseStudy.metrics.map((m) => (
            <div key={m.label} className="flex-1 rounded-lg border border-border-subtle bg-bg-secondary px-2 py-2.5 text-center">
              <div className="font-display font-bold text-sm leading-none" style={{ color: project.accentHex }}>{m.value}</div>
              <div className="font-mono text-[10px] text-text-secondary mt-1 leading-tight">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {project.stack.slice(0, 4).map((tech) => (
          <span key={tech} className="skill-chip font-mono text-[10px] px-2.5 py-1 rounded-md">
            <TechIcon name={tech} className="chip-ico w-4 h-4" />
            {tech}
          </span>
        ))}
        {project.stack.length > 4 && (
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-md text-text-muted">+{project.stack.length - 4}</span>
        )}
      </div>

      {/* v32 — clear action buttons on every card: Case Study / Details opens
          the modal, Live and Code are real outbound links. All stop
          propagation so the card's own click handler doesn't double-fire. */}
      <div className="flex items-center gap-2 pt-3 border-t border-border-subtle flex-wrap">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          aria-label={`Open ${project.title} case study`}
          className="font-mono text-[10px] font-semibold px-3.5 py-2.5 min-h-[38px] rounded-lg flex items-center gap-1.5 transition-all duration-300 hover:gap-2.5"
          style={{ color: project.accentHex, border: `1px solid ${project.accentHex}55`, background: `${project.accentHex}12` }}
        >
          {project.caseStudy ? "Case Study" : "Details"}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Visit ${project.title} live site`}
            className="font-mono text-[10px] px-3.5 py-2.5 min-h-[38px] rounded-lg border border-border-mid text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/50 transition-colors duration-300 flex items-center gap-1.5"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Live
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View ${project.title} source on GitHub`}
            className="font-mono text-[10px] px-3.5 py-2.5 min-h-[38px] rounded-lg border border-border-mid text-text-secondary hover:text-accent-indigo hover:border-accent-indigo/50 transition-colors duration-300 flex items-center gap-1.5"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            Code
          </a>
        )}
        <span className="ml-auto font-mono text-[10px] text-text-muted">{project.date}</span>
      </div>
    </article>
    </motion.div>
  );
}

/* ─── Section ──────────────────────────────────────────────────────────────── */
const MAX_FILTERS = 9;

export default function Projects() {
  const { projects } = usePortfolio();
  const { repos: ghRaw, stale } = useGithubRepos(); // v32 — live GitHub archive
  // v34 — the admin's GitHub-archive controls ride in through settings and
  // apply without a rebuild (Supabase) or after one (GitHub driver).
  const settings = useSiteSettings();
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [activeStack, setActiveStack] = useState("All");
  const [showAllFilters, setShowAllFilters] = useState(false);
  const ref = useRef(null);

  // v34 — settings-driven archive controls (stable refs: the runtime
  // snapshot's own arrays, or undefined — both memo-safe).
  const { pinnedRepos, hiddenRepos, repoOverrides } = settings;

  const curatedUrls = useMemo(
    () => new Set(projects.map((p) => (p.github || "").replace(/\/$/, "").toLowerCase()).filter(Boolean)),
    [projects]
  );
  const gh = useMemo(
    () => applyRepoSettings(ghRaw, curatedUrls, { pinnedRepos, hiddenRepos, repoOverrides }),
    [ghRaw, curatedUrls, pinnedRepos, hiddenRepos, repoOverrides]
  );
  const ghCards = gh.cards;

  const all = useMemo(
    () => orderArchive(projects, ghCards, gh.pinnedSet),
    [projects, ghCards, gh.pinnedSet]
  );

  const allStacks = ["All", ...Array.from(
    new Set(all.flatMap((p) => p.stack || []))
  ).sort((a, b) => a.localeCompare(b))];

  const filtered = all.filter((p) => {
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
      <section id="projects" ref={ref} className="section-y relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-cyan/[0.015] to-transparent pointer-events-none" />
        <div className="container-x">
          <SectionHeader
            index="03"
            icon={Rocket}
            tint="#f472b6"
            label="Projects"
            title="Work that ships."
            accent={["ships"]}
            subtitle={`${projects.length} case studies + ${ghCards.length} synced from GitHub — every card opens the full story. Pinned builds float to the top.`}
          />

          {/* Search + Filter */}
          <div className="animate-on-scroll mb-8 space-y-3" style={{ transitionDelay: "0.12s" }}>
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
                  className={`font-mono text-xs min-h-[40px] px-3.5 py-2 rounded-lg border transition-all ${
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
              {filtered.length === all.length
                ? `Showing all ${all.length} builds`
                : `Showing ${filtered.length} of ${all.length} builds`}
              {(query || activeStack !== "All") && (
                <button
                  onClick={() => { setQuery(""); setActiveStack("All"); }}
                  className="ml-3 text-accent-cyan hover:text-accent-indigo transition-colors underline"
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* v32 — GitHub sync status, same honesty contract as the
                GitHubActivity feed (stale data is never passed off as live) */}
            <div className="font-mono text-[10px] text-text-muted flex items-center gap-1.5" data-testid="gh-sync-note">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              {stale
                ? "GitHub archive — showing last synced data (API rate-limited right now)"
                : "GitHub archive — synced live from github.com/shabii804 · cached 30 min"}
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
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
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
