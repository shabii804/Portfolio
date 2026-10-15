// ─────────────────────────────────────────────────────────────────────────────
// Local test mode ("local memory") — admin-side driver.
//
// Lets the whole panel work with ZERO backends: saves merge into a content
// snapshot in localStorage and uploads become Blobs in IndexedDB — all inside
// the CURRENT BROWSER. The public site (same browser) picks both up instantly
// through the runtime content overlay, so you can test hero changes live with
// no GitHub commit, no Supabase, no Vercel rebuild.
//
// Merge rules are imported from ghBridge.js so local mode behaves EXACTLY
// like the real drivers (personal/settings per-field, media one-level into
// heroBackground, arrays replace).
// ─────────────────────────────────────────────────────────────────────────────

import { mergeContent } from "./ghBridge.js";
import {
  IDB_PREFIX,
  clearLocalContent,
  idbClear,
  loadLocalContent,
  localModeOn,
  putLocalMedia,
  saveLocalContent,
  setLocalMode,
} from "../data/localMedia.js";

export { localModeOn, setLocalMode, loadLocalContent, saveLocalContent, clearLocalContent, idbClear, IDB_PREFIX };

const EXT_OK = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif", "svg", "ico",
  "mp4", "webm", "mov", "m4v", "ogv",
  "mp3", "wav", "pdf",
]);

function makeUploadName(original) {
  const ext = (original.split(".").pop() || "").toLowerCase();
  const base = original
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "file";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}.${EXT_OK.has(ext) ? ext : "bin"}`;
}

// Upload in test mode: blob → IndexedDB → `idb://<name>` path. The idb:// URL
// resolves in the site renderer and the admin preview via useLocalMediaSrc.
export async function localUpload(file) {
  const name = makeUploadName(file.name);
  await putLocalMedia(name, file);
  return {
    ok: true,
    path: `${IDB_PREFIX}${name}`,
    size: file.size,
    storage: "local",
    message: "Saved to this browser (test mode) — live instantly",
  };
}

// Save in test mode: same merge semantics as the server, then persist the
// full snapshot. Returns the merged content (caller updates its state).
export function localSaveContent(current, patch) {
  const base = current || loadLocalContent() || {};
  const { next, touched } = mergeContent(base, patch);
  if (!touched.length) throw new Error("Nothing to update.");
  if (!saveLocalContent(next)) {
    throw new Error("Browser storage is full — clear test data in Settings → Local test mode.");
  }
  return next;
}

// Seed the snapshot wholesale when test mode is switched ON (no merge, no
// "touched section" requirement — just capture current reality).
export function seedLocalContent(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return false;
  return saveLocalContent(snapshot);
}

// Wipe everything the test mode stored in this browser.
export async function clearAllLocalData() {
  clearLocalContent();
  await idbClear().catch(() => {});
}
