import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  useMotionTemplate,
  useMotionValueEvent,
} from "framer-motion";
import { Milestone } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { getLenis } from "../hooks/useLenis";
import TimelineItem from "./TimelineItem";
import { TAG_COLORS } from "./tagColors";
import SectionHeader from "./motion/SectionHeader";

/* ─────────────────────────────────────────────────────────────────────────────
   Journey — "The road so far" (v27 modernization).

   DATA: entries with empty titles are dropped; year+title duplicates are
   deduped; order is chronological, oldest → newest (Now last) — consistent.

   LAYOUT: centered spine on desktop, cards alternating left/right at equal
   width (grid-cols-2); mobile = single left spine, all cards right.
   Nodes sit exactly on the line. A milestone rail (≥1440px) mirrors the
   timeline and click-scrolls to each row.

   MOTION (v27 — fully scroll-driven, both directions):
   · Every row is a living scrubber — card position/opacity/scale/blur are
     bound to that row's own scroll progress through a spring, so scrolling
     UP reverses the reveal instead of freezing it (one-shot reveals are gone).
   · The traveling tip rides the spine and its color interpolates through the
     v24.1 chromatic stops (indigo → violet → cyan → emerald) as you scroll;
     its glow + the drawn spine's glow follow the same color.
   · Nodes ignite in sync with the tip: faint ring first, then a color fill
     + halo swell as the tip passes (per-row progress).
   · Connectors draw toward their card during the first half of the reveal.
   · Milestone rail: the active row (highest reveal progress) lights its year.
   · prefers-reduced-motion → static rows, full spine, no tip, rail still
     works as plain navigation.
   ────────────────────────────────────────────────────────────────────────── */

const SPINE_STOPS = [0, 0.34, 0.67, 1];
const SPINE_RGB = ["rgb(99,102,241)", "rgb(168,85,247)", "rgb(34,211,238)", "rgb(52,211,153)"];
const SPINE_HALO = ["rgba(99,102,241,0.4)", "rgba(168,85,247,0.4)", "rgba(34,211,238,0.4)", "rgba(52,211,153,0.4)"];

/* One timeline row: node + connector + card, all scrubbed by scroll. */
function JourneyRow({ step, index, reduced, onActive, registerRow }) {
  const localRef = useRef(null);
  const setRefs = useCallback(
    (el) => {
      localRef.current = el;
      registerRow?.(index, el);
    },
    [registerRow, index]
  );

  // reveal band: row top travels from 95% → 58% of the viewport height
  const { scrollYProgress } = useScroll({
    target: localRef,
    offset: ["start 0.95", "start 0.58"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.5 });

  // report progress upward → milestone rail active state
  useMotionValueEvent(smooth, "change", (v) => onActive(index, v));

  const dir = index % 2 === 0 ? "left" : "right";
  const nc = TAG_COLORS[step.tag] || "#818cf8";

  // card materialization — two-way scrubbed
  const x = useTransform(smooth, [0, 1], [reduced ? 0 : dir === "left" ? -52 : 52, 0]);
  const opacity = useTransform(smooth, [0, 0.75], [0, 1]);
  const scale = useTransform(smooth, [0, 1], [0.965, 1]);
  const blur = useTransform(smooth, [0, 0.7], [reduced ? 0 : 6, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  // node: ring fades in fast, then the milestone color fills it as the tip arrives
  const ringOpacity = useTransform(smooth, [0, 0.22], [0, 1]);
  const fillScale = useTransform(smooth, [0.08, 0.55], [0.3, 1]);
  const haloOpacity = useTransform(smooth, [0.1, 0.55, 0.85], [0, 0.55, 0.3]);

  // connector draws toward the card during the first half of the reveal
  const connScale = useTransform(smooth, [0.06, 0.5], [0, 1]);

  return (
    <div
      ref={setRefs}
      className="relative md:grid md:grid-cols-2 md:gap-14 items-center"
      style={{ "--nc": nc }}
    >
      {/* node on the spine — ring → chromatic ignition (fills as the tip passes) */}
      <span
        className="journey-node absolute left-[19px] md:left-1/2 top-7 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 block"
        aria-hidden="true"
      >
        {!reduced && (
          <motion.span
            className="absolute -inset-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${nc}55 0%, transparent 70%)`,
              opacity: haloOpacity,
              scale: 1.35,
            }}
          />
        )}
        <motion.span
          className="journey-node-pop relative block w-3.5 h-3.5 rounded-full bg-bg-primary border-2"
          style={{
            borderColor: nc,
            "--pulse-c": `${nc}99`,
            "--pulse-e": `${nc}8c`,
            opacity: reduced ? 1 : ringOpacity,
          }}
        >
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: nc, scale: reduced ? 1 : fillScale }}
          />
        </motion.span>
      </span>

      {/* connector — draws from the spine toward the card, arrow tip pointing
          at the card; mobile always points right */}
      {!reduced ? (
        <motion.span
          className="j-conn"
          data-side={dir}
          aria-hidden="true"
          style={{ scaleX: connScale }}
        />
      ) : (
        <span className="j-conn" data-side={dir} aria-hidden="true" />
      )}

      {/* card — materializes from its own side (scrubbed, not one-shot) */}
      <motion.div
        className={`pl-12 md:pl-0 ${dir === "left" ? "md:col-start-1 md:pr-2" : "md:col-start-2 md:pl-2"}`}
        style={reduced ? undefined : { x, opacity, scale, filter }}
      >
        <TimelineItem step={step} />
      </motion.div>
    </div>
  );
}

export default function Journey() {
  const { journey } = usePortfolio();
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const rowRefs = useRef([]);
  const progressArr = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);

  // data hygiene — drop empty titles, dedupe repeats (admin-edited content)
  const steps = journey
    .filter((s) => s?.title?.trim())
    .filter((s, i, arr) => arr.findIndex((o) => o?.year === s.year && o?.title === s.title) === i);

  // scroll-drawn spine + chromatic traveling tip
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.72", "end 0.55"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.45 });
  const tipTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const tipColor = useTransform(scrollYProgress, SPINE_STOPS, SPINE_RGB);
  const tipHalo = useTransform(scrollYProgress, SPINE_STOPS, SPINE_HALO);
  const tipShadow = useMotionTemplate`0 0 12px 2px ${tipHalo}, 0 0 30px 7px ${tipHalo}`;
  const spineGlow = useMotionTemplate`0 0 12px ${tipHalo}`;

  // node pulse-once observer (CSS keyframe shockwave on arrival)
  useEffect(() => {
    const nodeObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("pulse-once");
            nodeObserver.unobserve(e.target);
          }
        }),
      { threshold: 0.9 }
    );
    ref.current?.querySelectorAll(".journey-node").forEach((el) => nodeObserver.observe(el));
    return () => nodeObserver.disconnect();
  }, [steps.length]);

  // milestone rail — the row with the highest reveal progress is "active"
  const handleActive = useCallback((i, v) => {
    const arr = progressArr.current;
    arr[i] = v;
    let best = -1;
    let bestV = 0.12;
    for (let k = 0; k < arr.length; k++) {
      if (arr[k] > bestV) {
        bestV = arr[k];
        best = k;
      }
    }
    if (best >= 0) setActiveIdx((prev) => (prev === best ? prev : best));
  }, []);

  const scrollToRow = useCallback((i) => {
    const el = rowRefs.current[i];
    if (!el) return;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, {
        offset: -120,
        duration: 1.05,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const registerRow = useCallback((i, el) => {
    rowRefs.current[i] = el;
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
          <div
            className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-1 bottom-1 w-px bg-gradient-to-b from-transparent via-accent-indigo/15 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-1 bottom-1 w-px" aria-hidden="true">
            <motion.div
              className="journey-spine h-full w-px origin-top"
              style={{
                scaleY: reduced ? 1 : scaleY,
                /* v24.1 chromatic spine — indigo → violet → cyan → emerald;
                   v27 — the glow tint follows the traveling tip */
                background: "linear-gradient(to bottom, #6366f1, #a855f7 32%, #22d3ee 66%, #34d399)",
                boxShadow: reduced ? "0 0 12px rgba(129, 140, 248, 0.5)" : spineGlow,
              }}
            />
          </div>
          {!reduced && (
            <motion.div
              className="journey-tip"
              style={{ top: tipTop, backgroundColor: tipColor, color: tipColor, boxShadow: tipShadow }}
              aria-hidden="true"
            />
          )}

          <div className="space-y-6 md:space-y-8">
            {steps.map((step, i) => (
              <JourneyRow
                key={`${step.year}-${step.title}-${i}`}
                step={step}
                index={i}
                reduced={reduced}
                onActive={handleActive}
                registerRow={registerRow}
              />
            ))}
          </div>
        </div>
      </div>

      {/* milestone rail (≥1440px) — live scrub index; click jumps to a row */}
      {steps.length > 1 && (
        <nav className="jy-rail" aria-label="Journey milestones">
          {steps.map((s, i) => {
            const rc = TAG_COLORS[s.tag] || "#818cf8";
            return (
              <button
                key={`${s.year}-${i}`}
                type="button"
                className={`jy-rail-item ${i === activeIdx ? "is-active" : ""}`}
                style={{ "--rc": rc }}
                onClick={() => scrollToRow(i)}
                aria-label={`Jump to ${s.year} — ${s.title}`}
                aria-current={i === activeIdx ? "true" : undefined}
              >
                <span className="jy-rail-dot" aria-hidden="true" />
                <span className="jy-rail-year">{s.year}</span>
              </button>
            );
          })}
        </nav>
      )}
    </section>
  );
}
