// Hero background config resolution — shared by HeroVideo (renderer),
// Hero (cinema-mode class scope) and the admin MediaTab (defaults).
import { content } from "./portfolio.js";

// Defaults keep the site identical even if content.json predates the media
// section (or the admin blanked a field by accident).
export const HERO_BG_DEFAULTS = {
  enabled: true,
  type: "video",
  desktop: "/hero-video.mp4",
  webm: "/hero.webm",
  mobile: "/hero-mobile.mp4",
  poster: "/hero-poster.jpg",
  image: "",
  objectPosition: "center 30%",
  scrim: 1,
  grain: true,
  vignette: true,
};

export function heroBackgroundConfig() {
  return { ...HERO_BG_DEFAULTS, ...(content?.media?.heroBackground ?? {}) };
}
