// Hero background config resolution — shared by HeroVideo (renderer),
// Hero (cinema-mode class scope) and the admin MediaTab (defaults).
import { useSyncExternalStore } from "react";
import { content } from "./portfolio.js";
import {
  getRuntimeContent,
  runtimeVersion,
  subscribeRuntime,
} from "./runtimeContent.js";

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

// Bundled defaults → runtime snapshot overlay (Supabase saves / test mode)
// → done. Order matters: the runtime copy is the freshest admin state.
export function heroBackgroundConfig() {
  const runtime = getRuntimeContent()?.media?.heroBackground;
  return { ...HERO_BG_DEFAULTS, ...(content?.media?.heroBackground ?? {}), ...(runtime ?? {}) };
}

// Reactive variant — re-renders whenever a runtime snapshot lands (initial
// /api/content fetch, or a local-test-mode save in the same browser).
export function useHeroBackgroundConfig() {
  useSyncExternalStore(subscribeRuntime, runtimeVersion);
  return heroBackgroundConfig();
}
