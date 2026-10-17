import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Milestone } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import TimelineItem from "./TimelineItem";
import SectionHeader from "./motion/SectionHeader";
import { EASE_OUT } from "./motion/ease";

/* ─────────────────────────────────────────────────────────────────────────────
   Journey — "The road so far" (v22 rebuild).

   DATA: entries with empty titles are dropped; year+title duplicates are
   deduped; order is chronological, oldest → newest (Now last) — consistent.

   LAYOUT: centered spine on desktop, cards alternating left/right at equal
   width (grid-cols-2); mobile = single left spine, all cards right.
   Nodes sit exactly on the line.

   MOTION: the spine draws with scroll (useScroll → useSpring → scaleY) and a
   glowing tip travels along it (useTransform → top %). Each node pops with a
   scale spring + pulses once on arrival. Cards slide in from their own side,
   fade + blur-to-sharp, 600ms, ease [0.22, 1, 0.36, 1], viewport once 0.25.
   prefers-reduced-motion → simple fades, static tip, no pulses (CSS).
   ────────────────────────────────────────────────────────────────────────── */
export default function Journey() {
  const { journey } = usePortfolio();
  const ref = useRef(null);
  const reduced = useReducedMotion();

  // data hygiene — drop empty titles, dedupe repeats (admin-edited content)
  const steps = journey
    .filter((s) => s?.title?.trim())
    .filter((s, i, arr) => arr.findIndex((o) => o?.year === s.year && o?.title === s.title) === i);

  // scroll-drawn spine + traveling tip
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.72", "end 0.55"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 65, damping: 21, mass: 0.4 });
  const tipTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // node pulse-once observer (CSS keyframe) — motion pop is framer's job
  useEffect(() => {
    const nodeObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("pulse-once"); nodeObserver.unobserve(e.target); }
      }),
      { threshold: 0.9 }
    );
    ref.current?.querySelectorAll(".journey-node").forEach((el) => nodeObserver.observe(el));
    return () => nodeObserver.disconnect();
  }, []);

  return (
    <section id="journey" ref={ref} className="section-y relative">
      <div className="container-x">
        <SectionHeader
          index="04"
          icon={Milestone}
          tint="#34d399"
          label="Journey"
          title="My journey so far."
          accent={["journey"]}
          subtitle="From first semester to a live client deployment — every step shipped something real."
        />

        <div className="relative">
          {/* spine — faint track + scroll-drawn bright line + traveling tip
              (plain wrapper owns positioning; motion owns scaleY only) */}
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-1 bottom-1 w-px bg-gradient-to-b from-transparent via-accent-indigo/15 to-transparent" aria-hidden="true" />
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-1 bottom-1 w-px" aria-hidden="true">
            <motion.div
              className="journey-spine h-full w-px origin-top"
              style={{
                scaleY: reduced ? 1 : scaleY,
                background: "linear-gradient(to bottom, #6366f1, #818cf8 40%, #22d3ee)",
                boxShadow: "0 0 10px rgba(129, 140, 248, 0.45)",
              }}
            />
          </div>
          {!reduced && (
            <motion.div className="journey-tip" style={{ top: tipTop }} aria-hidden="true" />
          )}

          <div className="space-y-6 md:space-y-8">
            {steps.map((step, i) => {
              const leftSide = i % 2 === 0;
              const dir = leftSide ? "left" : "right";
              return (
                <div key={`${step.year}-${step.title}-${i}`} className="relative md:grid md:grid-cols-2 md:gap-14 items-center">
                  {/* node on the spine — spring pop + one pulse
                      (outer span positions, inner motion span pops) */}
                  <span className="journey-node absolute left-[19px] md:left-1/2 top-7 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 block" aria-hidden="true">
                    <motion.span
                      className="journey-node-pop block w-3.5 h-3.5 rounded-full bg-bg-primary border-2 border-accent-indigo shadow-[0_0_12px_rgba(129,140,248,0.55)]"
                      initial={reduced ? undefined : { scale: 0 }}
                      whileInView={reduced ? undefined : { scale: 1 }}
                      viewport={{ once: true, amount: 0.9 }}
                      transition={{ type: "spring", stiffness: 320, damping: 15, delay: 0.05 * i }}
                    />
                  </span>

                  {/* connector — draws from the spine toward the card, arrow tip
                      pointing at the card; mobile always points right */}
                  {!reduced && (
                    <motion.span
                      className="j-conn"
                      data-side={dir}
                      aria-hidden="true"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.04 * i }}
                    />
                  )}
                  {reduced && <span className="j-conn" data-side={dir} aria-hidden="true" />}

                  {/* card — slides in from its own side (±60, blur-to-sharp) */}
                  <motion.div
                    className={`pl-12 md:pl-0 ${leftSide ? "md:col-start-1 md:pr-2" : "md:col-start-2 md:pl-2"}`}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir === "left" ? -60 : 60, filter: "blur(7px)" }}
                    whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.65, ease: EASE_OUT, delay: 0.06 * i }}
                  >
                    <TimelineItem step={step} />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
