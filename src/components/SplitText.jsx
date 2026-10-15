import { motion, useReducedMotion } from "framer-motion";

/**
 * Word-by-word masked slide-up reveal — the premium headline entrance.
 * Each word rises out of its own overflow-hidden mask with a soft stagger
 * and an expo-out curve. Triggered the moment the preloader lifts
 * (ready = html.is-ready) so it choreographs with the rest of the hero.
 *
 * Accessibility: the full sentence lives on aria-label of the container;
 * the visual words are aria-hidden. prefers-reduced-motion renders the
 * plain sentence immediately — no transforms, no stagger.
 */
export default function SplitText({
  text,
  ready = true,
  accent = [],
  delay = 0,
  className = "",
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return (
      <p className={`hero-split ${className}`} aria-label={text}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="hero-split-word" aria-hidden="true">
            {word}
          </span>
        ))}
      </p>
    );
  }

  return (
    <p className={`hero-split ${className}`} aria-label={text}>
      {words.map((word, i) => {
        const bare = word.replace(/[.,!?]/g, "");
        const isAccent = accent.includes(bare) || accent.includes(word);
        return (
          <span key={`${word}-${i}`} className="hero-split-mask" aria-hidden="true">
            <motion.span
              className={`hero-split-word${isAccent ? " hero-split-accent" : ""}`}
              initial={{ y: "112%" }}
              animate={{ y: ready ? "0%" : "112%" }}
              transition={{
                duration: 0.72,
                ease: [0.22, 1, 0.36, 1],
                delay: delay + i * 0.075,
              }}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </p>
  );
}
