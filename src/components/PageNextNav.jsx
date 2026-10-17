import { Link } from "react-router-dom";
import Reveal from "./motion/Reveal";

/* ─────────────────────────────────────────────────────────────────────────────
   PageNextNav (v28) — the multi-page footer strip on every subpage.

   A hairline, then "← Previous room" on the left and a large tinted
   "Next room →" card on the right. Gives each page a destination and makes
   the six-page loop walkable without ever touching the navbar.

   <PageNextNav current="about" /> — current is the page's key below.
   ────────────────────────────────────────────────────────────────────────── */

const ORDER = [
  { key: "about", path: "/about", label: "About", hint: "Who I am & how I work", tint: "#818cf8" },
  { key: "skills", path: "/skills", label: "Skills", hint: "The full toolkit, in numbers", tint: "#22d3ee" },
  { key: "projects", path: "/projects", label: "Projects", hint: "Every production build", tint: "#f472b6" },
  { key: "services", path: "/services", label: "Services", hint: "Hire me — book a service", tint: "#fbbf24" },
  { key: "journey", path: "/journey", label: "Journey", hint: "2021 → now, milestone by milestone", tint: "#34d399" },
  { key: "contact", path: "/contact", label: "Contact", hint: "Start a conversation", tint: "#818cf8" },
];

export default function PageNextNav({ current }) {
  const idx = ORDER.findIndex((p) => p.key === current);
  const prev = idx > 0 ? ORDER[idx - 1] : null;
  const next = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
  const pos = `${String(idx + 1).padStart(2, "0")} / ${String(ORDER.length).padStart(2, "0")}`;

  return (
    <nav aria-label="Page navigation" className="container-x pb-6 pt-2">
      <Reveal className="border-t border-border-subtle pt-8 md:pt-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
            Page {pos}
          </span>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted hover:text-accent-indigo transition-colors link-underline-effect"
          >
            Home
          </Link>
        </div>

        <div className={`grid gap-4 ${prev ? "sm:grid-cols-2" : ""}`}>
          {prev && (
            <Link
              to={prev.path}
              className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-card px-5 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-indigo/40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-muted transition-all duration-300 group-hover:-translate-x-1 group-hover:text-accent-indigo">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">Previous</span>
                <span className="block font-display font-semibold text-text-primary group-hover:text-accent-indigo transition-colors truncate">
                  {prev.label}
                </span>
              </span>
            </Link>
          )}

          {next && (
            <Link
              to={next.path}
              className={`group relative overflow-hidden rounded-2xl border px-6 py-5 transition-all duration-300 hover:-translate-y-1 ${prev ? "sm:col-start-2" : ""}`}
              style={{
                "--pn-tint": next.tint,
                borderColor: `${next.tint}40`,
                background: `linear-gradient(120deg, ${next.tint}14, transparent 55%)`,
              }}
            >
              <span className="flex items-center justify-between gap-4">
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: next.tint }}>
                    Next — {next.hint}
                  </span>
                  <span className="block font-display font-bold text-lg text-text-primary transition-colors truncate">
                    {next.label}
                  </span>
                </span>
                <span
                  className="shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:rotate-45"
                  style={{ borderColor: `${next.tint}55`, color: next.tint, background: `${next.tint}12` }}
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </span>
            </Link>
          )}
        </div>
      </Reveal>
    </nav>
  );
}
