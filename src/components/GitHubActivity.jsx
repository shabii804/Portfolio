import { useEffect, useRef, useState, useCallback } from "react";
import { usePortfolio } from "../hooks/usePortfolio";

/* ─────────────────────────────────────────────────────────────────────────────
   GitHub Activity — live public-API data (no token, no key):
     · profile stats (repos, followers)
     · language distribution across repos
     · recent public events feed
   Cached in localStorage for 30 minutes; graceful static fallback when the
   API is rate-limited or offline.
   ──────────────────────────────────────────────────────────────────────────── */

const GH_USER = "shabii804";
const CACHE_KEY = "gh-activity-cache-v1";
const CACHE_TTL = 30 * 60 * 1000; // 30 min
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Java: "#b07219", "C#": "#178600",
  HTML: "#e34c26", CSS: "#563d7c", Python: "#3572A5", "C++": "#f34b7d", C: "#555555",
  Shell: "#89e051", Dart: "#00B4AB", PHP: "#4F5D95", SQL: "#e38c00",
};
// Restrained palette fallback for unknown languages
const FALLBACK_COLORS = ["#818cf8", "#22d3ee", "#a5b4fc", "#67e8f9", "#6366f1"];

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/* v21: group the raw event stream by repository — “Pushed 3 commits to
   Portfolio · 2d ago” instead of eight identical “PushEvent to Portfolio”. */
function groupEvents(events, max = 6) {
  const byRepo = new Map();
  for (const ev of events || []) {
    const repo = ev.repo?.name?.replace(/^shabii804\//, "") || "a repository";
    const g = byRepo.get(repo) || { repo, commits: 0, starred: false, pr: false, released: false, created: false, latest: ev };
    const p = ev.payload || {};
    if (ev.type === "PushEvent") g.commits += p.size || p.commits?.length || 1;
    if (ev.type === "WatchEvent") g.starred = true;
    if (ev.type === "PullRequestEvent") g.pr = true;
    if (ev.type === "ReleaseEvent") g.released = true;
    if (ev.type === "CreateEvent") g.created = true;
    if (new Date(ev.created_at) > new Date(g.latest.created_at)) g.latest = ev;
    byRepo.set(repo, g);
  }
  return [...byRepo.values()].slice(0, max);
}

function describeGroup(g) {
  if (g.commits > 0) return `Pushed ${g.commits} commit${g.commits === 1 ? "" : "s"} to ${g.repo}`;
  if (g.pr) return `Worked on a pull request in ${g.repo}`;
  if (g.released) return `Shipped a release of ${g.repo}`;
  if (g.created) return `Created ${g.repo}`;
  if (g.starred) return `Starred ${g.repo}`;
  return `Activity in ${g.repo}`;
}

function eventLink(ev) {
  const p = ev.payload || {};
  if (ev.type === "PushEvent" && p.commits?.[0]?.sha && ev.repo?.name) {
    return `https://github.com/${ev.repo.name}/commit/${p.commits[0].sha}`;
  }
  if (ev.type === "PullRequestEvent" && p.pull_request?.html_url) return p.pull_request.html_url;
  if (ev.type === "IssuesEvent" && p.issue?.html_url) return p.issue.html_url;
  if (ev.type === "ReleaseEvent" && p.release?.html_url) return p.release.html_url;
  return ev.repo?.name ? `https://github.com/${ev.repo.name}` : `https://github.com/${GH_USER}`;
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

export default function GitHubActivity() {
  const { personal } = usePortfolio();
  const ref = useRef(null);
  const [state, setState] = useState({ status: "loading", stats: null, languages: null, events: null });

  const load = useCallback(async () => {
    // 1) cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setState({ status: "ok", ...cached.data });
        return;
      }
    } catch { /* ignore corrupt cache */ }

    // 2) live fetch
    try {
      const [profile, repos, events] = await Promise.all([
        fetchJSON(`https://api.github.com/users/${GH_USER}`),
        fetchJSON(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=100`),
        fetchJSON(`https://api.github.com/users/${GH_USER}/events/public?per_page=30`),
      ]);

      const stars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
      const langCount = {};
      repos.forEach((r) => {
        if (r.language && !r.fork) langCount[r.language] = (langCount[r.language] || 0) + 1;
      });
      const totalLangs = Object.values(langCount).reduce((a, b) => a + b, 0) || 1;
      const languages = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count], i) => ({
          name,
          pct: Math.round((count / totalLangs) * 100),
          color: LANG_COLORS[name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        }));

      const data = {
        stats: {
          repos: profile.public_repos ?? repos.length,
          followers: profile.followers ?? 0,
          stars,
        },
        languages,
        events: (events || []).slice(0, 30),
      };
      setState({ status: "ok", ...data });
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /* quota */ }
    } catch {
      // 3) Live fetch failed (offline / rate-limited) → serve last-known data of
      //    ANY age rather than blank tiles; only show the error state if we have
      //    never successfully loaded.
      try {
        const stale = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (stale?.data) {
          setState({ status: "ok", stale: true, ...stale.data });
          return;
        }
      } catch { /* ignore corrupt cache */ }
      setState({ status: "error", stats: null, languages: null, events: null });
    }
  }, []);

  useEffect(() => {
    // Defer to a macrotask so state updates never happen synchronously in the effect body
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="activity" ref={ref} className="section-y relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-indigo/[0.015] to-transparent pointer-events-none" />
      <div className="container-x">
        <div className="animate-on-scroll flex items-center gap-4 mb-4">
          <span className="section-label">GitHub Activity</span>
          <div className="grad-line flex-1 max-w-16" />
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap mb-12">
          <div>
            <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4" style={{ transitionDelay: "0.05s" }}>
              In motion, live.
            </h2>
            <p className="animate-on-scroll font-body text-text-secondary text-lg max-w-xl" style={{ transitionDelay: "0.1s" }}>
              Straight from the GitHub API — what I'm building and shipping right now.
            </p>
          </div>
          <a
            href={personal.github}
            target="_blank"
            rel="noreferrer"
            className="animate-on-scroll btn-ghost px-4 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2"
            style={{ transitionDelay: "0.12s" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            @shabii804
          </a>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Public Repos", key: "repos" },
            { label: "Total Stars", key: "stars" },
            { label: "Followers", key: "followers" },
          ].map((tile, i) => (
            <div key={tile.label} className="animate-on-scroll card-border-glow rounded-2xl p-5 sm:p-6 bg-bg-card text-center" style={{ transitionDelay: `${0.1 + 0.06 * i}s` }}>
              {state.status === "ok" && state.stats ? (
                <div className="font-display font-bold text-3xl sm:text-4xl text-gradient-indigo">{state.stats[tile.key]}</div>
              ) : state.status === "loading" ? (
                <div className="h-9 sm:h-10 w-16 mx-auto rounded-lg bg-bg-hover animate-pulse" />
              ) : (
                <div className="font-display font-bold text-2xl sm:text-3xl text-text-secondary">—</div>
              )}
              <div className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-[0.14em] mt-2">{tile.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          {/* Language distribution */}
          <div className="animate-on-scroll card-border-glow rounded-2xl p-6 bg-bg-card" style={{ transitionDelay: "0.2s" }}>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted mb-5">Languages across repos</h3>
            {state.status === "ok" && state.languages?.length > 0 ? (
              <>
                <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-5" aria-hidden="true">
                  {state.languages.map((l) => (
                    <div key={l.name} style={{ width: `${l.pct}%`, background: l.color, opacity: 0.85 }} />
                  ))}
                </div>
                <ul className="space-y-2.5">
                  {state.languages.map((l) => (
                    <li key={l.name} className="flex items-center gap-2.5 font-body text-sm text-text-secondary">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: l.color }} />
                      <span className="flex-1">{l.name}</span>
                      <span className="font-mono text-[11px] text-text-muted">{l.pct}%</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : state.status === "loading" ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-4 rounded bg-bg-hover animate-pulse" style={{ width: `${80 - i * 12}%` }} />)}
              </div>
            ) : (
              <p className="font-body text-sm text-text-muted">
                Language breakdown unavailable right now — the GitHub API is rate-limiting this browser.
                Everything is on <a href={personal.github} target="_blank" rel="noreferrer" className="text-accent-indigo underline">the profile</a>.
              </p>
            )}
          </div>

          {/* Recent activity feed */}
          <div className="animate-on-scroll card-border-glow rounded-2xl p-6 bg-bg-card" style={{ transitionDelay: "0.26s" }}>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted mb-5">Recent public activity</h3>
            {state.status === "ok" && state.events?.length > 0 ? (
              <ul className="space-y-1">
                {groupEvents(state.events).map((g, i) => (
                  <li key={`${g.repo}-${i}`}>
                    <a
                      href={eventLink(g.latest)}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start gap-3 px-3 py-2.5 -mx-3 rounded-xl hover:bg-bg-hover/60 transition-colors"
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent-cyan/70 flex-shrink-0 group-hover:bg-accent-indigo transition-colors" />
                      <span className="flex-1 min-w-0">
                        <span className="block font-body text-[13px] text-text-secondary group-hover:text-text-primary transition-colors leading-snug">
                          {describeGroup(g)}
                        </span>
                      </span>
                      <span className="font-mono text-[9px] text-text-muted flex-shrink-0 mt-0.5">{timeAgo(g.latest.created_at)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : state.status === "loading" ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-9 rounded-xl bg-bg-hover animate-pulse" style={{ width: `${92 - i * 8}%` }} />)}
              </div>
            ) : (
              <p className="font-body text-sm text-text-muted">
                Live activity feed is temporarily unavailable (GitHub API rate limit from this network).
                Recent work is always visible on <a href={personal.github} target="_blank" rel="noreferrer" className="text-accent-indigo underline">github.com/shabii804</a>.
              </p>
            )}
          </div>
        </div>

        <p className="animate-on-scroll mt-6 font-mono text-[9px] text-text-muted text-center" style={{ transitionDelay: "0.3s" }}>
          {state.status === "ok" && state.stale
            ? "showing last synced data — the GitHub API is rate-limiting this network right now"
            : "sourced live from the public GitHub API · cached for 30 minutes"}
        </p>
      </div>
    </section>
  );
}
