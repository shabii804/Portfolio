import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * GLOBAL CINEMA BACKGROUND (v13)
 *
 * The "floating code" clip lives on a FIXED layer behind the ENTIRE site.
 * At rest (hero in view) it keeps the v12 framed cinema panel — inset,
 * rounded, hairline border, brand glow. As the visitor scrolls, the frame
 * EXPANDS (scroll-driven clip-path) until the footage becomes the full
 * viewport background; every content section then floats above it as a
 * frosted glass panel.
 *
 * Scroll choreography (all spring-damped, transform/clip only):
 *  - clip-path  : inset(rest → 0) + radius(rest → 0)   the frame opening up
 *  - edge       : hairline border + glow fades out      the panel dissolving
 *  - hero scrims: copy-side gradients fade out          legibility handover
 *  - dim        : 0.06 → 0.55 with depth                keeps panels readable
 *  - zoom       : 1 → 1.08 over 3 viewports             slow cinematic push-in
 *
 * Playback rules:
 *  - muted + loop + playsInline → autoplays on every modern engine (iOS too)
 *  - paused when the tab is hidden, resumed automatically
 *  - reduced-motion visitors get a static poster frame, frozen at rest —
 *    no scroll coupling, no playback, dim locked for contrast
 */
const clampNum = (v, min, max) => Math.min(max, Math.max(min, v));

const readVp = () => ({
  w: typeof window === "undefined" ? 1440 : window.innerWidth,
  h: typeof window === "undefined" ? 900 : window.innerHeight,
});

export default function VideoBackground() {
  const videoRef = useRef(null);
  const reduced = useReducedMotion() ?? false;
  const [vp, setVp] = useState(readVp);

  // Viewport metrics drive the rest-state frame geometry (mirrors v12 frame)
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVp(readVp()));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const rest = useMemo(
    () => ({
      top: clampNum(vp.h * 0.11, 76, 96),
      side: clampNum(vp.w * 0.022, 12, 24),
      bottom: clampNum(vp.h * 0.024, 12, 22),
      radius: clampNum(vp.w * 0.024, 18, 28),
    }),
    [vp]
  );

  const { scrollY } = useScroll();

  // Expansion range: the frame is fully open after ~0.9 of a viewport scroll
  const R = Math.max(340, vp.h * 0.9);
  const spring = { stiffness: 110, damping: 26, mass: 0.7 };

  const top = useSpring(useTransform(scrollY, [0, R], [rest.top, 0]), spring);
  const side = useSpring(useTransform(scrollY, [0, R], [rest.side, 0]), spring);
  const bottom = useSpring(useTransform(scrollY, [0, R], [rest.bottom, 0]), spring);
  const radius = useSpring(useTransform(scrollY, [0, R], [rest.radius, 0]), spring);
  const clipPath = useMotionTemplate`inset(${top}px ${side}px ${bottom}px ${side}px round ${radius}px)`;

  const edgeOpacity = useSpring(useTransform(scrollY, [0, R * 0.85], [1, 0]), spring);
  const scrimOpacity = useSpring(useTransform(scrollY, [0, R * 0.95], [1, 0]), spring);
  const dim = useSpring(
    useTransform(scrollY, [0, vp.h * 0.55, vp.h * 2.8], [0.06, 0.32, 0.55]),
    { stiffness: 80, damping: 26 }
  );
  const scale = useSpring(useTransform(scrollY, [0, vp.h * 3], [1, 1.08]), {
    stiffness: 60,
    damping: 24,
  });

  // Static geometry for reduced-motion visitors (frozen at the rest frame)
  const staticClip = `inset(${rest.top}px ${rest.side}px ${rest.bottom}px ${rest.side}px round ${rest.radius}px)`;

  // Playback: muted+playsInline autoplay with a kick safety net; pause when
  // the tab hides. No IntersectionObserver — a fixed layer is always in view.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return undefined;

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

    return () => {
      video.removeEventListener("loadeddata", kick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div className="vbg" aria-hidden="true">
      {reduced ? (
        /* Reduced motion: static poster frozen INSIDE the rest frame — the
           framed-panel design holds, nothing scrolls or plays */
        <>
          <div className="vbg-clip" style={{ clipPath: staticClip }}>
            <div className="vbg-zoom vbg-poster" />
            <div className="hero-video-scrim" />
            <div className="hero-video-fade-top" />
            <div className="hero-video-fade-bottom" />
          </div>
          <div className="vbg-edge" style={{ borderRadius: rest.radius }} />
          <div className="vbg-dim" style={{ opacity: 0.42 }} />
        </>
      ) : (
        <>
          <motion.div className="vbg-clip" style={{ clipPath }}>
            <motion.div className="vbg-zoom" style={{ scale }}>
              <video
                ref={videoRef}
                className="vbg-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/hero-poster.jpg"
                disablePictureInPicture
                disableRemotePlayback
                tabIndex={-1}
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
            </motion.div>
            {/* Hero copy legibility — fades out as the frame opens up */}
            <motion.div className="hero-video-scrim" style={{ opacity: scrimOpacity }} />
            <motion.div className="hero-video-fade-top" style={{ opacity: scrimOpacity }} />
            <motion.div className="hero-video-fade-bottom" style={{ opacity: scrimOpacity }} />
          </motion.div>

          {/* Scroll-linked readability dim above the footage, below content */}
          <motion.div className="vbg-dim" style={{ opacity: dim }} />

          {/* Hairline frame edge + glow — dissolves as the frame expands */}
          <motion.div
            className="vbg-edge"
            style={{ opacity: edgeOpacity, borderRadius: radius }}
          />
        </>
      )}
    </div>
  );
}
