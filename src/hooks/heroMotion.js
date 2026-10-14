import { useEffect, useRef, useState } from "react";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const finePointer = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

/**
 * Ease-out-expo count-up for hero stat numbers.
 * Marketing surface (rare tier) — the delight budget lives here.
 * Reduced motion: renders the final value immediately.
 */
export function useCountUp(target, { decimals = 0, duration = 1300, delay = 0 } = {}) {
  // Captured once — reduced motion: initial state IS the final value, no motion
  const [reduced] = useState(prefersReduced);
  const [value, setValue] = useState(() => (reduced ? target : 0));

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay, reduced]);

  return value.toFixed(decimals);
}

/**
 * Magnetic hover for the CTAs — decorative pointer tracking, near-imperceptible
 * by design (tens-of-times/day tier): 7px max pull, trailing via transition,
 * physical scale on press. Fine pointers only, disabled for reduced motion.
 */
export function useMagnetic({ strength = 0.16, max = 7 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || !finePointer()) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = (scale = 1) => {
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale})`;
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      x = Math.max(-max, Math.min(max, dx * strength));
      y = Math.max(-max, Math.min(max, dy * strength));
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          apply();
        });
      }
    };
    const onLeave = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      x = 0;
      y = 0;
      apply();
    };
    const onDown = () => apply(0.97);
    const onUp = () => apply();

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.style.transform = "";
    };
  }, [strength, max]);

  return ref;
}

/**
 * Spatial exit: hero content drifts down + fades as the visitor scrolls away.
 * transform/opacity only, rAF-throttled, listener only attached while the
 * hero is in view, cleared at the top. Disabled for reduced motion.
 */
export function useScrollParallax({ rate = 0.16, fade = 0.5 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY || 0);
      if (y <= 4) {
        el.style.transform = "";
        el.style.opacity = "";
        return;
      }
      const p = Math.min(1, y / (el.offsetHeight || 1));
      el.style.transform = `translate3d(0, ${(y * rate).toFixed(1)}px, 0)`;
      el.style.opacity = (1 - p * fade).toFixed(3);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", onScroll, { passive: true });
          update();
        } else {
          window.removeEventListener("scroll", onScroll);
        }
      },
      { threshold: 0 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      el.style.transform = "";
      el.style.opacity = "";
    };
  }, [rate, fade]);

  return ref;
}
