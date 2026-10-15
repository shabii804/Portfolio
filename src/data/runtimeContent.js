// ─────────────────────────────────────────────────────────────────────────────
// Runtime content overlay — the bridge between admin saves and the live site.
//
// The site is built from src/data/portfolio.js (bundled), but with the
// Supabase driver saves go live WITHOUT a rebuild — so the app needs to pick
// up fresh /api/content at runtime. This tiny external store holds the latest
// runtime snapshot (Supabase fetch, or the local-test-mode overlay) and lets
// any component re-render when it changes.
//
// Priority: runtime snapshot (if loaded) → bundled portfolio.js defaults.
// ─────────────────────────────────────────────────────────────────────────────

let current = null;
let version = 0;
const listeners = new Set();

export function setRuntimeContent(content) {
  current = content && typeof content === "object" ? content : null;
  version += 1;
  for (const l of listeners) l();
}

export function getRuntimeContent() {
  return current;
}

export function subscribeRuntime(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function runtimeVersion() {
  return version;
}

// Settings overlay helper — bundled defaults first, runtime snapshot wins.
export function runtimeSettings(fallback) {
  return { ...(fallback || {}), ...(getRuntimeContent()?.settings || {}) };
}
