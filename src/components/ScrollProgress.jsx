import { useEffect, useState } from "react";

/**
 * Thin gradient bar fixed to the top of the viewport that fills as the
 * user scrolls down the page. Hides itself when at the very top.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update(); // initial paint
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none"
      style={{
        opacity: progress > 0.5 ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-accent-indigo via-accent-purple to-accent-cyan"
        style={{
          width: `${progress}%`,
          transition: "width 0.1s linear",
          boxShadow: "0 0 12px rgba(129, 140, 248, 0.6)",
        }}
      />
    </div>
  );
}
