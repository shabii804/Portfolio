import { useSyncExternalStore } from "react";
import { content } from "../data/portfolio";
import { subscribeRuntime, runtimeVersion, runtimeSettings } from "../data/runtimeContent";

// Site-wide switches — editable in /admin → Settings ("Site settings" panel).
// `!== false` keeps everything ON when the settings section is missing.
const SETTINGS = content?.settings ?? {};

// Runtime-reactive settings: bundled defaults overlaid by the latest runtime
// snapshot (Supabase saves / local test mode apply without a rebuild).
// Shared by SiteLayout (chrome toggles) and Home (section gating).
export default function useSiteSettings() {
  useSyncExternalStore(subscribeRuntime, runtimeVersion);
  return runtimeSettings(SETTINGS);
}
