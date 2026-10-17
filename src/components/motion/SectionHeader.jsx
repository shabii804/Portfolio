import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "./ease";

/* ─────────────────────────────────────────────────────────────────────────────
   <SectionHeader /> — the one header pattern for every in-scope section (v24).

   · eyebrow: glowing tinted dot + colored icon + "01 — ABOUT" + hairline
   · H2: word-by-word blur-to-sharp rise (staggered, once per page load)
   · one-line muted subtitle, then an accent underline that draws in
   · semantic <h2> with aria-label; visual words are aria-hidden
   · prefers-reduced-motion → everything renders static, no transforms
   ────────────────────────────────────────────────────────────────────────── */

const wordV = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE_OUT } },
};

const titleV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};

export default function SectionHeader({
  index,
  icon: Icon,
  tint = "#818cf8",
  label,
  title,
  accent = [],
  subtitle,
  className = "",
}) {
  const reduced = useReducedMotion();
  const words = String(title).split(" ");
  const acc = new Set(accent);
  const isAccent = (w) => acc.has(w) || acc.has(w.replace(/[.,!?]/g, ""));

  return (
    <header className={`sh-wrap ${className}`}>
      {/* eyebrow */}
      <motion.div
        className="sh-eyebrow"
        initial={reduced ? undefined : { opacity: 0, y: 8 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
      >
        <span className="sh-dot" style={{ "--sh-tint": tint }} aria-hidden="true" />
        {Icon && <Icon className="sh-ico" strokeWidth={2} style={{ color: tint }} aria-hidden="true" />}
        <span className="sh-num" style={{ color: tint }}>{index}</span>
        <span className="sh-sep" aria-hidden="true">—</span>
        <span className="sh-label">{label}</span>
        <span className="grad-line sh-line" aria-hidden="true" />
      </motion.div>

      {/* H2 — word-by-word blur-to-sharp */}
      <motion.h2
        className="sh-title font-display font-bold text-4xl sm:text-5xl text-text-primary"
        aria-label={String(title)}
        variants={reduced ? undefined : titleV}
        initial={reduced ? undefined : "hidden"}
        whileInView={reduced ? undefined : "show"}
        viewport={{ once: true, amount: 0.3 }}
      >
        {words.map((w, i) => {
          /* v24.1 fix: the gradient class MUST sit on the element that owns
             the glyphs. A wrapper span around the filter-animated motion.span
             breaks background-clip:text (accent words rendered invisible). */
          const word = (
            <motion.span
              className={`sh-word${isAccent(w) ? " text-gradient-indigo" : ""}`}
              variants={reduced ? undefined : wordV}
            >
              {w}
            </motion.span>
          );
          return (
            <span key={`${w}-${i}`} className="sh-word-wrap" aria-hidden="true">
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </motion.h2>

      {/* subtitle */}
      {subtitle && (
        <motion.p
          className="sh-sub font-body text-text-secondary text-lg max-w-2xl"
          initial={reduced ? undefined : { opacity: 0, y: 10 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.28 }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* accent underline — draws in last */}
      <motion.span
        className="sh-underline"
        style={{ "--sh-tint": tint }}
        aria-hidden="true"
        initial={reduced ? undefined : { scaleX: 0 }}
        whileInView={reduced ? undefined : { scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.4 }}
      />
    </header>
  );
}
