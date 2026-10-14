import { useEffect, useRef } from "react";
import { usePortfolio } from "../hooks/usePortfolio";

/* ─────────────────────────────────────────────────────────────────────────────
   Journey — the PRD's career timeline: 2021 → now, one hairline spine,
   alternating cards on desktop, stacked on mobile.
   ──────────────────────────────────────────────────────────────────────────── */
export default function Journey() {
  const { journey } = usePortfolio();
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="journey" ref={ref} className="py-24 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="animate-on-scroll flex items-center gap-4 mb-4">
          <span className="section-label">Journey</span>
          <div className="grad-line flex-1 max-w-16" />
        </div>
        <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4" style={{ transitionDelay: "0.05s" }}>
          The road so far.
        </h2>
        <p className="animate-on-scroll font-body text-text-secondary text-lg mb-16 max-w-xl" style={{ transitionDelay: "0.1s" }}>
          From first semester to a live client deployment — every step shipped something real.
        </p>

        <div className="relative">
          {/* Spine */}
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-1 bottom-1 w-px bg-gradient-to-b from-transparent via-accent-indigo/35 to-transparent" aria-hidden="true" />

          <div className="space-y-10 md:space-y-14">
            {journey.map((step, i) => {
              const leftSide = i % 2 === 0;
              return (
                <div key={`${step.year}-${step.title}`} className={`relative md:grid md:grid-cols-2 md:gap-16 items-center`}>
                  {/* Node on the spine */}
                  <div
                    className="absolute left-[19px] md:left-1/2 top-7 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10"
                    aria-hidden="true"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-bg-primary border-2 border-accent-indigo shadow-[0_0_12px_rgba(129,140,248,0.55)]" />
                  </div>

                  {/* Card */}
                  <div
                    className={`animate-on-scroll pl-12 md:pl-0 ${
                      leftSide ? "md:col-start-1 md:pr-2" : "md:col-start-2 md:pl-2"
                    }`}
                    style={{ transitionDelay: `${0.08 * i}s` }}
                  >
                    <div className="card-border-glow rounded-2xl p-6 bg-bg-card">
                      <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
                        <span className="font-display font-bold text-2xl text-gradient-indigo">{step.year}</span>
                        <span className="font-mono text-[9px] px-2.5 py-1 rounded-full border border-accent-cyan/30 text-accent-cyan bg-accent-cyan/[0.06] uppercase tracking-widest">
                          {step.tag}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-text-primary text-base sm:text-lg mb-1">{step.title}</h3>
                      <p className="font-mono text-[10px] text-text-muted mb-3.5">{step.period} · {step.place}</p>
                      <p className="font-body text-sm text-text-secondary leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
