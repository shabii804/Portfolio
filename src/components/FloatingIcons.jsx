import { motion, useReducedMotion } from "framer-motion";

/**
 * Animated motion icons — glass tiles with real brand marks that float, tilt
 * and glow over the cinematic hero video. Desktop: a loose band across the
 * right half of the footage (copy owns the left). Mobile: four quiet corner
 * chips, the two heaviest hidden to keep the clip the star.
 * Pure HTML + framer-motion, transform/opacity only.
 */

const ICONS = [
  {
    key: "react",
    label: "React",
    pos: "left-[5%] top-[15%] lg:left-auto lg:right-[24%] lg:top-[19%]",
    dur: 5.2,
    svg: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#61dafb" strokeWidth="1.4">
        <circle cx="12" cy="12" r="1.9" fill="#61dafb" stroke="none" />
        <ellipse cx="12" cy="12" rx="9.2" ry="3.7" />
        <ellipse cx="12" cy="12" rx="9.2" ry="3.7" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9.2" ry="3.7" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    key: "node",
    label: "Node.js",
    pos: "hidden lg:flex lg:right-[8%] lg:top-[14%]",
    dur: 6.1,
    svg: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#7fe39a" strokeWidth="1.6">
        <path d="M12 2.6 20.2 7.3v9.4L12 21.4 3.8 16.7V7.3L12 2.6Z" strokeLinejoin="round" />
        <text x="12" y="15.4" textAnchor="middle" fontSize="7.2" fontWeight="700" fill="#7fe39a" stroke="none" fontFamily="monospace">JS</text>
      </svg>
    ),
  },
  {
    key: "java",
    label: "Java",
    pos: "right-[5%] bottom-[30%] lg:right-[10%] lg:bottom-[24%]",
    dur: 5.7,
    svg: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ffb36b" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8 11v4.2c0 .9.8 1.6 1.8 1.6h3.4c1 0 1.8-.7 1.8-1.6V11H8Z" fill="#ffb36b" fillOpacity="0.25" />
        <path d="M15 12.4c1.3-.2 2.2-.7 2.2-1.4s-.9-1.1-1.9-1" />
        <path d="M10.3 8.6c-.4-.7.4-1.1.3-1.9M12.9 8.6c-.4-.7.4-1.1.3-1.9" />
        <path d="M7 19.6h10" />
      </svg>
    ),
  },
  {
    key: "flutter",
    label: "Flutter",
    pos: "left-[6%] bottom-[26%] lg:left-auto lg:right-[26%] lg:bottom-[15%]",
    dur: 6.6,
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M14.5 2 4.6 11.9l3.1 3.1L20.7 2h-6.2Z" fill="#47c5fb" />
        <path d="M14.6 11.2 9.1 16.7l5.5 5.5h6.2l-5.6-5.5 5.6-5.5h-6.2Z" fill="#02569b" />
        <path d="M14.5 2 8.9 7.6l3.1 3.1L20.7 2h-6.2Z" fill="#ffffff" fillOpacity="0.55" />
      </svg>
    ),
  },
  {
    key: "firebase",
    label: "Firebase",
    pos: "hidden lg:flex lg:right-[16%] lg:top-[42%]",
    dur: 4.9,
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M6.7 15.4 9.6 3.9c.15-.6.95-.68 1.2-.12l1.5 2.8-5.6 8.8Z" fill="#ffca28" />
        <path d="M6.7 15.4l9.4-10.1c.4-.45 1.15-.15 1.15.45l-.5 8.1-6.4 3.8-3.65-2.25Z" fill="#ffa000" />
        <path d="M17.3 13.85l-.45-7.3 2.5 5.75c.25.55-.3 1.15-.85.95l-1.2.6Z" fill="#ff8f00" />
      </svg>
    ),
  },
  {
    key: "sql",
    label: "SQL",
    pos: "right-[5%] top-[12%] lg:right-[30%] lg:top-[37%]",
    dur: 5.4,
    svg: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#a5b0ff" strokeWidth="1.5">
        <ellipse cx="12" cy="5.6" rx="7.2" ry="2.7" />
        <path d="M4.8 5.6v12.8c0 1.5 3.2 2.7 7.2 2.7s7.2-1.2 7.2-2.7V5.6" />
        <path d="M4.8 12c0 1.5 3.2 2.7 7.2 2.7s7.2-1.2 7.2-2.7" />
      </svg>
    ),
  },
];

export default function FloatingIcons() {
  const reduced = useReducedMotion();

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {ICONS.map((icon, i) => (
        <motion.div
          key={icon.key}
          className={`hero-float-chip absolute ${icon.pos}`}
          initial={{ opacity: 0, scale: 0.5, y: 14 }}
          animate={
            reduced
              ? { opacity: 0.9, scale: 1, y: 0 }
              : {
                  opacity: [0, 0.95, 0.95, 0.95],
                  scale: [0.5, 1, 1, 1],
                  y: [14, 0, -10, 0],
                  rotate: [0, i % 2 ? 2.5 : -2.5, 0],
                }
          }
          transition={
            reduced
              ? { duration: 0.4, delay: i * 0.06 }
              : {
                  duration: icon.dur,
                  times: [0, 0.14, 0.5, 1],
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: i * 0.45,
                }
          }
        >
          <span className="hero-float-chip-inner">{icon.svg}</span>
          <span className="sr-only">{icon.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
