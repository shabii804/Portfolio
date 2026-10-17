import { useEffect, useState } from "react";
import { GH_USER, SEED_REPOS } from "../data/githubRepos";

/* ─────────────────────────────────────────────────────────────────────────────
   useGithubRepos (v32) — the /projects GitHub archive's data source.

   Layered like the GitHubActivity feed:
     1. fresh localStorage cache (30 min) → instant paint
     2. live fetch from the public GitHub API (no token, 60 req/h per IP)
     3. stale cache → any-age last-known data
     4. baked SEED_REPOS → the archive is NEVER empty (first visit + rate
        limited + offline all still render the full catalog)

   Returns RAW API-shaped repos — consumers map them through
   mapGithubRepos() so the card shape stays in one place.
   ──────────────────────────────────────────────────────────────────────────── */

const CACHE_KEY = "gh-repos-cache-v1";
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export function useGithubRepos() {
  const [state, setState] = useState(() => ({
    status: "seed", // seed | ok
    stale: false,
    repos: SEED_REPOS,
    syncedAt: null,
  }));

  useEffect(() => {
    let dead = false;

    const load = async () => {
      // 1) fresh cache wins — no network at all
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached && Date.now() - cached.ts < CACHE_TTL && Array.isArray(cached.repos)) {
          if (!dead) setState({ status: "ok", stale: false, repos: cached.repos, syncedAt: cached.ts });
          return;
        }
      } catch {
        /* corrupt cache → fall through to the live fetch */
      }

      // 2) background refresh from the public API
      try {
        const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=100`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const raw = await res.json();
        if (!Array.isArray(raw) || raw.length === 0) throw new Error("empty repo list");
        if (dead) return;
        const ts = Date.now();
        setState({ status: "ok", stale: false, repos: raw, syncedAt: ts });
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts, repos: raw }));
        } catch {
          /* quota — cache is best-effort */
        }
      } catch {
        // 3) rate-limited / offline → any-age cache, else keep the seed
        if (dead) return;
        try {
          const stale = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
          if (stale?.repos?.length) {
            setState({ status: "ok", stale: true, repos: stale.repos, syncedAt: stale.ts });
          }
        } catch {
          /* keep the baked seed — already the initial state */
        }
      }
    };

    // Defer to a macrotask so state updates never happen synchronously in
    // the effect body (same recipe as GitHubActivity).
    const t = setTimeout(load, 0);
    return () => {
      dead = true;
      clearTimeout(t);
    };
  }, []);

  return state;
}
