import { useEffect, useRef } from "react";

/**
 * Cinematic video hero background — the "floating code" clip as a full-bleed
 * layer under the hero copy, with gradient scrims for text legibility.
 * (The footage itself features the developer surrounded by floating tech
 * icons, so no overlay chips are needed.)
 *
 * Playback rules:
 *  - muted + loop + playsInline → autoplays on every modern engine (iOS too)
 *  - reduced-motion visitors get a static poster frame (never plays)
 *  - paused when the tab is hidden or the hero is scrolled off-screen,
 *    resumed automatically when either comes back
 */
export default function HeroVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    // Respect reduced-motion: kill autoplay entirely, poster frame stays
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
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
  }, []);

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <video
        ref={videoRef}
        className="hero-video"
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
      {/* Legibility: dark scrim on the copy side + top/bottom melts */}
      <div className="hero-video-scrim" />
      <div className="hero-video-fade-top" />
      <div className="hero-video-fade-bottom" />
    </div>
  );
}
