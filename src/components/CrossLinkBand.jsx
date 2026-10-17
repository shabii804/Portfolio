import { Link } from "react-router-dom";
import Reveal from "./motion/Reveal";

/* ─────────────────────────────────────────────────────────────────────────────
   CrossLinkBand (v29) — the compact "next step" panel that closes a subpage.

   Same visual language as Home's CTA band but smaller; gives every page a
   bridge to the Services page (or wherever the reader should go next).
   ────────────────────────────────────────────────────────────────────────── */

export default function CrossLinkBand({
  title,
  accent,
  text,
  primary,
  ghost,
  tint = "#fbbf24",
}) {
  return (
    <section className="section-y relative" aria-label="Next step">
      <div className="container-x">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl border px-6 py-10 md:px-12 md:py-12"
            style={{ borderColor: `${tint}30`, background: `linear-gradient(120deg, ${tint}12, transparent 60%)` }}
          >
            <div
              className="absolute -top-20 right-1/4 w-64 h-64 rounded-full blur-[100px] pointer-events-none"
              style={{ background: `${tint}14` }}
              aria-hidden="true"
            />
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary mb-3">
                {title}{" "}
                {accent && <span className="text-gradient-indigo">{accent}</span>}
              </h2>
              <p className="font-body text-text-secondary text-sm sm:text-base leading-relaxed mb-7">
                {text}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {primary && (
                  <Link
                    to={primary.to}
                    className="btn-primary px-5 py-3 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2 group glow-on-hover"
                  >
                    {primary.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                {ghost && (
                  <Link
                    to={ghost.to}
                    className="btn-ghost px-5 py-3 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2 glow-on-hover"
                  >
                    {ghost.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
