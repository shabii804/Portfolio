import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Boot preloader — "SA" monogram mask-reveal + progress counter.
 * Skips instantly under prefers-reduced-motion. Broadcasts "sa:ready" and
 * sets html.is-ready so the hero entrance choreography starts on the reveal.
 */
export default function Preloader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (done) return;
    document.body.style.overflow = "hidden";

    let value = 0;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(interval);
      setPct(100);
      setTimeout(() => setDone(true), 240);
    };
    const interval = setInterval(() => {
      value = Math.min(100, value + 4 + Math.random() * 9);
      setPct(Math.floor(value));
      if (value >= 100) finish();
    }, 52);
    const failsafe = setTimeout(finish, 2400); // never trap the visitor

    return () => {
      clearInterval(interval);
      clearTimeout(failsafe);
      document.body.style.overflow = "";
    };
  }, [done]);

  useEffect(() => {
    if (!done) return;
    document.body.style.overflow = "";
    document.documentElement.classList.add("is-ready");
    window.dispatchEvent(new CustomEvent("sa:ready"));
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.72, ease: [0.77, 0, 0.175, 1] }}
          aria-hidden="true"
        >
          <div className="preloader-glow" />
          <span className="preloader-tag">Shoaib Arshad — Portfolio</span>
          <div className="preloader-mono" aria-hidden="true">
            <span>
              <i>S</i>
            </span>
            <span>
              <i>A</i>
            </span>
          </div>
          <div className="preloader-count">
            {pct}
            <small>%</small>
          </div>
          <div className="preloader-bar" style={{ width: `${pct}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
