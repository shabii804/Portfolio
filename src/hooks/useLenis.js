import { useEffect } from "react";
import Lenis from "lenis";

// Module-level singleton so any component can request a smooth scroll
let lenis = null;

export function getLenis() {
  return lenis;
}

/** Smooth-scroll to a section id, respecting the Lenis instance when active. */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, {
      offset: -84,
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Lenis smooth scrolling — mounted once at the App root.
 * Disabled entirely for prefers-reduced-motion users.
 * Modal scroll-locks (body overflow:hidden) automatically stop/start Lenis.
 */
export default function useLenis() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      lerp: 0.105,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenis = instance;
    // Lenis owns scrolling now — neutralize the CSS smooth-scroll conflict
    document.documentElement.style.scrollBehavior = "auto";

    let raf = 0;
    const loop = (time) => {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Existing modals lock scroll via body overflow — mirror that onto Lenis
    const syncLock = () => {
      if (document.body.style.overflow === "hidden") instance.stop();
      else instance.start();
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      instance.destroy();
      lenis = null;
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);
}
