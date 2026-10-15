import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], [role='option'], summary, label, select";

/**
 * Custom cursor: a small accent dot that tracks the pointer 1:1 plus a
 * trailing ring that lags on a lerp and expands over interactive elements.
 * Fine pointers only; never rendered for reduced-motion or touch users.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !dotRef.current || !ringRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const root = document.documentElement;
    root.classList.add("custom-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let running = false;
    let active = false;
    let down = false;

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      const target = e.target;
      const overText = target && /input|textarea/i.test(target.tagName || "");
      const overInteractive = !overText && !!(target?.closest?.(INTERACTIVE));
      if (overInteractive !== active) {
        active = overInteractive;
        dot.classList.toggle("is-active", active);
        ring.classList.toggle("is-active", active);
      }
      start();
    };
    const onDown = () => {
      down = true;
      ring.classList.toggle("is-down", down);
    };
    const onUp = () => {
      down = false;
      ring.classList.toggle("is-down", down);
    };
    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "";
      ring.style.opacity = "";
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      root.classList.remove("custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
