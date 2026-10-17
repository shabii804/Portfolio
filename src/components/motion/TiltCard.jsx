import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   <TiltCard /> — reusable premium card surface (v22).

   · 3D tilt, max 6°, spring-smoothed (stiffness 300 / damping 18) — desktop
     pointers only (fine pointer, no reduced-motion). Touch devices skip it.
   · cursor-following spotlight: writes --mx / --my CSS vars, the radial
     highlight itself lives in CSS (.tilt-card::after) — paint-only, cheap.
   · transform-only animation (composite) → 60fps.
   ────────────────────────────────────────────────────────────────────────── */
const MAX_TILT = 6;

export default function TiltCard({ children, className = "", spotlight = true, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 300, damping: 18, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 300, damping: 18, mass: 0.6 });

  const fine = typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches;
  const enabled = fine && !reduced;

  const onMove = (e) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 2 * MAX_TILT);
    rx.set(-(py - 0.5) * 2 * MAX_TILT);
    if (spotlight) {
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    }
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={enabled ? { rotateX: srx, rotateY: sry, transformPerspective: 900 } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
