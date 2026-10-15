import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";

/**
 * Full-bleed cinematic video hero — the "floating code" clip IS the hero:
 * 100svh, object-fit cover, optically centered on the subject (center 30%).
 *
 * Layers (bottom → top): poster underlay → video → legibility scrims →
 * film grain → vignette. The whole media stack is wrapped in a
 * scroll-driven motion.div: scale 1 → 1.15 + fade while the hero scrolls
 * away (Framer Motion useScroll — transform/opacity only, GPU-composited).
 *
 * Playback rules:
 *  - <source> webm (VP9) first, mp4 fallback; small screens get the lighter
 *    hero-mobile.mp4 cut
 *  - autoPlay + muted + loop + playsInline; an explicit play() kick covers
 *    stubborn engines; paused when the tab hides or the hero leaves the
 *    viewport (IntersectionObserver)
 *  - the poster stays visible until playback actually starts, then the video
 *    fades in over 0.8s (.is-playing)
 *  - Data Saver (navigator.connection.saveData) and reduced-motion visitors
 *    get the static poster only — the video element is never rendered
 *  - scroll-scrubbed "Apple-style" mode behind a build flag:
 *    VITE_VIDEO_SCRUB=1 npm run build  → scroll progress maps to
 *    video.currentTime instead of autoplay/loop
 */
const SCRUB_MODE = import.meta.env.VITE_VIDEO_SCRUB === "1";

const DESKTOP_SRC = "/hero-video.mp4";
const MOBILE_SRC = "/hero-mobile.mp4";

export default function HeroVideo() {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Client-only app: pick the source once, no SSR concerns.
  // Reduced-motion → poster only. Data Saver → poster only (spec step 5).
  const [env] = useState(() => {
    if (typeof window === "undefined") return { mobile: false, posterOnly: false };
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const saveData = navigator.connection?.saveData === true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return { mobile, posterOnly: saveData || reduce };
  });
  const posterOnly = env.posterOnly;

  // Scroll-driven exit choreography: zoom + melt as the hero scrolls away.
  // Hooks stay unconditional; the style is only attached when allowed.
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scale, [1, 1.15], [1, 0.12]);
  const motionStyle =
    posterOnly || reduceMotion ? undefined : { scale, opacity };

  // Scrub mode: scroll progress → currentTime (rAF-paced by framer's
  // motion-value subscription; stepped to avoid seek spam).
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!SCRUB_MODE) return;
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;
    const t = Math.min(video.duration - 0.05, Math.max(0, p * video.duration));
    if (Math.abs(t - video.currentTime) > 0.04) video.currentTime = t;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || posterOnly) return undefined;

    // Reduced motion: kill autoplay entirely (belt + suspenders — the element
    // is already not rendered for these visitors).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
      video.pause();
      return undefined;
    }

    // Scrub mode: playback is owned by scroll, not by the autoplay loop.
    if (SCRUB_MODE) {
      video.pause();
      return undefined;
    }

    // Autoplay-policy safety net: muted+playsInline should be enough, but
    // some engines still need an explicit play() kick once data arrives.
    const kick = () => {
      if (video.paused) video.play().catch(() => {});
    };
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else kick();
    };

    kick();
    video.addEventListener("loadeddata", kick);
    document.addEventListener("visibilitychange", onVisibility);

    // Don't decode frames while the hero is scrolled far away
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? kick() : video.pause()),
      { threshold: 0.05 }
    );
    io.observe(video);

    return () => {
      video.removeEventListener("loadeddata", kick);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, [posterOnly]);

  return (
    <div ref={rootRef} className="hero-video-bg" aria-hidden="true">
      <motion.div className="hero-video-media" style={motionStyle}>
        {!posterOnly && (
          <video
            ref={videoRef}
            className={`hero-video${playing ? " is-playing" : ""}`}
            autoPlay={!SCRUB_MODE}
            muted
            loop={!SCRUB_MODE}
            playsInline
            preload="metadata"
            poster="/hero-poster.jpg"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
          >
            {/* VP9 first (smaller at equal quality), mp4 fallback */}
            {!env.mobile && <source src="/hero.webm" type="video/webm" />}
            <source src={env.mobile ? MOBILE_SRC : DESKTOP_SRC} type="video/mp4" />
          </video>
        )}
        {/* Legibility: dark scrim on the copy side + top/bottom melts */}
        <div className="hero-video-scrim" />
        <div className="hero-video-fade-top" />
        <div className="hero-video-fade-bottom" />
        {/* Filmic texture: animated grain + soft vignette over the footage */}
        <div className="hero-grain" />
        <div className="hero-vignette" />
      </motion.div>
    </div>
  );
}
