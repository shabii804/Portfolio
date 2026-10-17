import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { usePortfolio } from "../hooks/usePortfolio";

/* ─────────────────────────────────────────────────────────────────────────────
   Journey — the PRD's career timeline: 2021 → now, one hairline spine,
   alternating cards on desktop, stacked on mobile.
   ──────────────────────────────────────────────────────────────────────────── */
export default function Journey() {
  const { journey } = usePortfolio();
  const ref = useRef(null);
  const reduced = useReducedMotion();

  // v21: data hygiene — drop entries with no title, de-duplicate repeats
  // (same year + title can sneak in via admin-edited content)
  const steps = journey.filter(
    (s, i) => s?.title?.trim() &&
      journey.findIndex((o) => o?.year === s.year && o?.title === s.title) === i
  );

  // Scroll-drawn spine — the hairline fills as the visitor travels the timeline
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.72", "end 0.55"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 65, damping: 21, mass: 0.4 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    // v21: each node pulses exactly once when the timeline reaches it
    const nodeObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("pulse-once"); nodeObserver.unobserve(e.target); }
      }),
      { threshold: 0.9 }
    );
    ref.current?.querySelectorAll(".journey-node").forEach((el) => nodeObserver.observe(el));
    return () => { observer.disconnect(); nodeObserver.disconnect(); };
  }, []);

  return (
    <section id="journey" ref={ref} className="section-y relative">
      <div className="container-x">
        <div className="animate-on-scroll flex items-center gap-4 mb-4">
          <span className="section-label">Journey</span>
          <div className="grad-line flex-1 max-w-16" />
        </div>
        <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4" style={{ transitionDelay: "0.05s" }}>
          The road so far.
        </h2>
        <p className="animate-on-scroll font-body text-text-secondary text-lg mb-10 max-w-xl" style={{ transitionDelay: "0.1s" }}>
          From first semester to a live client deployment — every step shipped something real.
        </p>

        <div className="relative">
          {/* Spine — static faint track + scroll-drawn bright line on top */}
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-1 bottom-1 w-px bg-gradient-to-b from-transparent via-accent-indigo/15 to-transparent" aria-hidden="true" />
          {!reduced && (
            <motion.div
              className="journey-spine absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-1 bottom-1 w-px"
              style={{
                scaleY,
                background: "linear-gradient(to bottom, #6366f1, #818cf8 40%, #22d3ee)",
                boxShadow: "0 0 10px rgba(129, 140, 248, 0.45)",
              }}
              aria-hidden="true"
            />
          )}

          <div className="space-y-6 md:space-y-8">
            {steps.map((step, i) => {
              const leftSide = i % 2 === 0;
              return (
                <div key={`${step.year}-${step.title}-${i}`} className={`relative md:grid md:grid-cols-2 md:gap-16 items-center`}>
                  {/* Node on the spine */}
                  <div
                    className="journey-node absolute left-[19px] md:left-1/2 top-7 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10"
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
