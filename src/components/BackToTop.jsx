import { useEffect, useState } from "react";

/**
 * Floating "scroll to top" button. Appears after the user has scrolled
 * past 400px and smoothly scrolls back to the top when clicked.
 */
const SHOW_AFTER = 400;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setVisible(window.scrollY > SHOW_AFTER);
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll back to top"
      title="Back to top"
      className={`fixed left-4 bottom-4 sm:left-6 sm:bottom-6 z-40 w-10 h-10 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-accent-indigo hover:border-accent-indigo/40 transition-all duration-300 flex items-center justify-center shadow-lg ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-y-0.5">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
