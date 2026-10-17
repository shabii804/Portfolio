import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "./ease";

/* ─────────────────────────────────────────────────────────────────────────────
   <Reveal /> — the one scroll-reveal primitive (v22).

   fade + rise 12px + blur-to-sharp · 600ms · ease [0.22, 1, 0.36, 1]
   viewport={{ once: true, amount: 0.25 }} — plays once per page load.
   `from="left|right"` slides in from that side (timeline cards).
   prefers-reduced-motion → simple opacity fade only (no rise, no blur).
   Fallback: if IntersectionObserver never fires, framer-motion's whileInView
   degrades to visible; the App-level RevealFallback also sweeps .animate-on-scroll.
   ────────────────────────────────────────────────────────────────────────── */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  from = "up", // "up" | "left" | "right" | "none"
  as = "div",
  blur = true,
  ...rest
}) {
  const reduced = useReducedMotion();

  const hidden = { opacity: 0 };
  if (!reduced) {
    if (from === "left") hidden.x = -36;
    else if (from === "right") hidden.x = 36;
    else if (from === "up") hidden.y = 12;
    if (blur && from !== "none") hidden.filter = "blur(6px)";
  }

  const shown = { opacity: 1 };
  if (!reduced) {
    if (from === "left" || from === "right") shown.x = 0;
    else if (from === "up") shown.y = 0;
    if (blur && from !== "none") shown.filter = "blur(0px)";
  }

  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduced ? 0.25 : 0.6, ease: EASE_OUT, delay: reduced ? 0 : delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
