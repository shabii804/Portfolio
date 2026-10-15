import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Boot preloader v2 — name-forward, brand-colored:
 *   glowing "SA" tile with rotating conic ring
 *   → "SHOAIB / ARSHAD." per-letter mask reveal with an indigo→cyan ramp
 *   → growing gradient rule + role line + mono boot log
 *   → glowing progress head + split-curtain exit
 * Always cinema-dark (it hands off to the video hero). Skips instantly under
 * prefers-reduced-motion. Broadcasts "sa:ready" and sets html.is-ready so the
 * hero entrance choreography starts as the curtain lifts.
 */

const LINES = ["SHOAIB".split(""), "ARSHAD.".split("")];
const BOOT = [
  { at: 6, color: "#34d399", text: "initializing experience" },
  { at: 40, color: "#818cf8", text: "loading projects + visuals" },
  { at: 76, color: "#22d3ee", text: "rendering interface" },
];

// Interpolate the letter color ramp: indigo-300 → violet-300 → cyan-300
function rampColor(t) {
  const stops = [
    [165, 180, 252],
    [196, 181, 253],
    [103, 232, 249],
  ];
  const seg = Math.min(0.9999, t) * (stops.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const [a, b] = [stops[i], stops[i + 1]];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return { color: `rgb(${c[0]} ${c[1]} ${c[2]})`, glow: `rgb(${c[0]} ${c[1]} ${c[2]} / 0.4)` };
}

const EXIT_EASE = [0.77, 0, 0.175, 1];

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
      setTimeout(() => setDone(true), 380); // beat at 100% before the split
    };
    const interval = setInterval(() => {
      value = Math.min(100, value + 2.2 + Math.random() * 4.2);
      setPct(Math.floor(value));
      if (value >= 100) finish();
    }, 70);
    const failsafe = setTimeout(finish, 3200); // never trap the visitor

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

  let letterIdx = 0;
  const totalLetters = LINES[0].length + LINES[1].length;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1, transition: { duration: 1.05 } }}
          aria-hidden="true"
        >
          {/* Split curtain — two opaque halves that part on exit */}
          <motion.div
            className="preloader-panel preloader-panel-top"
            exit={{ y: "-100%", transition: { duration: 0.78, ease: EXIT_EASE, delay: 0.24 } }}
          >
            <div className="pre-glow pre-glow-a" />
          </motion.div>
          <motion.div
            className="preloader-panel preloader-panel-bot"
            exit={{ y: "100%", transition: { duration: 0.78, ease: EXIT_EASE, delay: 0.24 } }}
          >
            <div className="pre-glow pre-glow-b" />
          </motion.div>

          {/* Centered identity stack */}
          <motion.div
            className="preloader-center"
            exit={{ opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeIn" } }}
          >
            <motion.div
              className="pre-badge"
              initial={{ opacity: 0, scale: 0.4, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              <span>SA</span>
            </motion.div>

            <div className="pre-name">
              {LINES.map((line, l) => (
                <div className="pre-line" key={l}>
                  {line.map((ch, i) => {
                    const t = letterIdx++ / (totalLetters - 1);
                    const { color, glow } = rampColor(t);
                    return (
                      <span
                        key={i}
                        className="pre-letter"
                        style={{
                          color,
                          textShadow: `0 0 44px ${glow}`,
                          "--d": `${0.16 + (l === 1 ? 0.34 : 0) + i * 0.045}s`,
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pre-rule" />

            <motion.span
              className="pre-role"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
            >
              Full Stack Developer
            </motion.span>
          </motion.div>

          {/* Top tag */}
          <motion.span
            className="preloader-tag"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <i /> Portfolio · 2026 <i />
          </motion.span>

          {/* Boot log — bottom-left */}
          <motion.div
            className="pre-boot"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {BOOT.filter((b) => pct >= b.at).map((b) => (
              <span key={b.text} className="pre-boot-line">
                <i style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                {b.text}
              </span>
            ))}
          </motion.div>

          {/* Counter — bottom-right */}
          <motion.div
            className={`preloader-count ${pct >= 100 ? "is-done" : ""}`}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {pct}
            <small>%</small>
          </motion.div>

          {/* Progress bar with glowing head */}
          <motion.div
            className="preloader-bar-wrap"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div className="preloader-bar" style={{ width: `${pct}%` }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
