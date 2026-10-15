// ─────────────────────────────────────────────────────────────────────────────
// Local test mode ("local memory") — media + flag half.
//
// Test mode lets the admin panel work with ZERO backends: content is overlaid
// from localStorage and uploaded media is stored as Blobs in IndexedDB in the
// CURRENT BROWSER only. The hero (and anything else) updates instantly — no
// GitHub commit, no Supabase, no Vercel rebuild. Perfect for trying changes;
// flip it off to go back to the real persistence chain.
//
// This module is import-safe for site components (no admin imports):
//   • localModeOn()/setLocalMode() — the browser-only flag (localStorage)
//   • IndexedDB blob store + `idb://<name>` path scheme
//   • useLocalMediaSrc(path) — resolves `idb://` paths to playable object URLs
// ─────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";

const MODE_KEY = "sa-local-mode";

// ── mode flag ────────────────────────────────────────────────────────────────
export function localModeOn() {
  try {
    return localStorage.getItem(MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setLocalMode(on) {
  try {
    if (on) localStorage.setItem(MODE_KEY, "1");
    else localStorage.removeItem(MODE_KEY);
  } catch {
    /* private mode */
  }
}

// ── local content snapshot (full content.json shape, ~25 KB — localStorage) ──
const CONTENT_KEY = "sa-local-content";

export function loadLocalContent() {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLocalContent(content) {
  try {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
    return true;
  } catch {
    return false; // quota exceeded — test mode content stays read-only
  }
}

export function clearLocalContent() {
  try {
    localStorage.removeItem(CONTENT_KEY);
  } catch {
    /* noop */
  }
}

// ── IndexedDB blob store ─────────────────────────────────────────────────────
const DB_NAME = "sa-local-media";
const STORE = "files";
let dbPromise = null;

function openDb() {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("No IndexedDB"));
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("IndexedDB open failed"));
    });
  }
  return dbPromise;
}

async function idbPut(name, blob) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, name);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error("IndexedDB write failed"));
  });
}

async function idbGet(name) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get(name);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error("IndexedDB read failed"));
  });
}

export async function idbClear() {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error("IndexedDB clear failed"));
  });
  for (const url of urlCache.values()) URL.revokeObjectURL(url);
  urlCache.clear();
  bump();
}

// ── idb:// path scheme + reactive resolver ───────────────────────────────────
export const IDB_PREFIX = "idb://";

export function isIdbPath(path) {
  return typeof path === "string" && path.startsWith(IDB_PREFIX);
}

export function idbName(path) {
  return isIdbPath(path) ? path.slice(IDB_PREFIX.length) : "";
}

const urlCache = new Map(); // name → objectURL
let version = 0;
const listeners = new Set();
const pending = new Set();

function bump() {
  version += 1;
  for (const l of listeners) l();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Fetch + revoke-on-demand: create the object URL the first time a path is
// asked for, then cache it for synchronous renders.
function hydrate(name) {
  if (urlCache.has(name) || pending.has(name)) return;
  pending.add(name);
  idbGet(name)
    .then((blob) => {
      if (blob) {
        urlCache.set(name, URL.createObjectURL(blob));
        bump();
      }
    })
    .catch(() => {})
    .finally(() => pending.delete(name));
}

export function resolveLocalMediaSync(path) {
  if (!isIdbPath(path)) return path || "";
  const name = idbName(path);
  hydrate(name);
  return urlCache.get(name) || "";
}

// Hook: returns the given path untouched, or a playable object URL for
// `idb://` paths (re-rendering once the blob hydrates from IndexedDB).
export function useLocalMediaSrc(path) {
  useSyncExternalStore(subscribe, () => version); // re-render once blobs hydrate
  return isIdbPath(path) ? resolveLocalMediaSync(path) : path || "";
}

// Admin-side write path (used by src/admin/localStore.js).
export async function putLocalMedia(name, blob) {
  await idbPut(name, blob);
  const old = urlCache.get(name);
  if (old) URL.revokeObjectURL(old);
  urlCache.set(name, URL.createObjectURL(blob));
  bump();
  return `${IDB_PREFIX}${name}`;
}
