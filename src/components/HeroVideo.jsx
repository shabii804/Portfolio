import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";
import { useHeroBackgroundConfig } from "../data/heroMedia";
import { useLocalMediaSrc } from "../data/localMedia";

/**
 * Full-bleed cinematic hero background — ADMIN-DRIVEN via
 * content.media.heroBackground (manage it in /admin → Hero & Media):
 *
 *   enabled          false → render nothing (hero falls back to theme tokens)
 *   type             "video" | "image"
 *   desktop/webm/mobile/poster   video sources + poster underlay
 *   image            static background when type === "image"
 *   objectPosition   e.g. "center 30%" — applied to video, image and underlay
 *   scrim            multiplier on the legibility scrims (0 = raw footage)
 *   grain / vignette filmic texture toggles
 *
 * Layers (bottom → top): poster underlay → video/image → legibility scrims →
 * film grain → vignette. The whole media stack is wrapped in a scroll-driven
 * motion.div: scale 1 → 1.15 + fade while the hero scrolls away.
 *
 * Playback rules (video mode):
 *  - <source> webm (VP9) first, mp4 fallback; small screens get the lighter
 *    mobile cut
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

// Wrapper — decides whether the background mounts at all (admin toggle).
// Keeps the early-return OUT of the hookful component below so the Rules of
// Hooks hold no matter how the admin flips the switches.
export default function HeroVideo() {
  // Reactive: re-renders when a runtime snapshot lands (Supabase save, or a
  // local-test-mode save in this browser) — no rebuild needed.
  const hb = useHeroBackgroundConfig();
  const desktop = useLocalMediaSrc(hb.desktop);
  const webm = useLocalMediaSrc(hb.webm);
  const mobile = useLocalMediaSrc(hb.mobile);
  const poster = useLocalMediaSrc(hb.poster);
  const image = useLocalMediaSrc(hb.image);
  const resolved = { ...hb, desktop, webm, mobile, poster, image };
  if (hb.enabled === false) return null;
  return <HeroVideoMedia key={`${webm}|${desktop}|${mobile}|${poster}|${image}`} hb={resolved} />;
}

function HeroVideoMedia({ hb }) {
  const isVideo = hb.type !== "image"; // unknown types fall back to video
  const isImage = hb.type === "image";

  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Client-only app: pick the source once, no SSR concerns.
  // Reduced-motion → poster only. Data Saver → poster only (spec step 5).
  // Static images ignore both — there is nothing moving to protect.
  const [env] = useState(() => {
    if (typeof window === "undefined") return { mobile: false, posterOnly: false };
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const saveData = navigator.connection?.saveData === true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return { mobile, posterOnly: saveData || reduce };
  });
  // Video: suppress the element for save-data / reduced-motion visitors.
  // Image: always render (it is static).
  const posterOnly = isVideo && env.posterOnly;

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

  const scrim = Number.isFinite(Number(hb.scrim)) ? Math.max(0, Math.min(1.5, Number(hb.scrim))) : 1;
  const scrimStyle = scrim === 1 ? undefined : { opacity: scrim };
  const objectPos = hb.objectPosition || "center 30%";
  // Poster / image URL for the underlay (CLS guard + static fallback)
  const underlay = isImage ? hb.image || hb.poster : hb.poster;

  return (
    <div ref={rootRef} className="hero-video-bg" aria-hidden="true">
      <motion.div
        className="hero-video-media"
        style={{
          ...motionStyle,
          backgroundImage: underlay ? `url("${underlay}")` : undefined,
          backgroundPosition: objectPos,
        }}
      >
        {isVideo && !posterOnly && (
          <video
            ref={videoRef}
            className={`hero-video${playing ? " is-playing" : ""}`}
            style={{ objectPosition: objectPos }}
            autoPlay={!SCRUB_MODE}
            muted
            loop={!SCRUB_MODE}
            playsInline
            preload="metadata"
            poster={hb.poster || undefined}
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
          >
            {/* VP9 first (smaller at equal quality), mp4 fallback */}
            {!env.mobile && hb.webm ? <source src={hb.webm} type="video/webm" /> : null}
            <source src={env.mobile ? hb.mobile || hb.desktop : hb.desktop} type="video/mp4" />
          </video>
        )}
        {isImage && (
          <img
            src={hb.image || hb.poster}
            alt=""
            className="hero-video is-playing hero-video-img"
            style={{ objectPosition: objectPos }}
            draggable={false}
            loading="eager"
            decoding="async"
          />
        )}
        {/* Legibility: dark scrim on the copy side + top/bottom melts */}
        <div className="hero-video-scrim" style={scrimStyle} />
        <div className="hero-video-fade-top" style={scrimStyle} />
        <div className="hero-video-fade-bottom" style={scrimStyle} />
        {/* Filmic texture: animated grain + soft vignette over the footage */}
        {hb.grain !== false && <div className="hero-grain" />}
        {hb.vignette !== false && <div className="hero-vignette" />}
      </motion.div>
    </div>
  );
}
