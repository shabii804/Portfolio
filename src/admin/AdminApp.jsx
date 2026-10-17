// ─────────────────────────────────────────────────────────────────────────────
// AdminApp — the portfolio control panel at /admin.
//
//   Login gate   → POST /api/auth (HMAC bearer token in localStorage, 7 days)
//   Layout       → sticky header, sidebar (desktop) / pill tabs (mobile)
//   Tabs         → Overview · Content · Projects · Skills & Journey ·
//                  Messages · Settings · Tools
//   Persistence  → PUT /api/content → GitHub commit (prod) / file write (dev)
//
// Uses the same design language as the site: bg-card panels, hairline borders,
// Space Grotesk display, JetBrains Mono micro-labels, indigo/cyan accents.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { api, clearToken, getToken, login, timeAgo } from "./api.js";
import { bridgeSaveContent, ghConnected } from "./ghBridge.js";
import { clearAllLocalData, loadLocalContent, localModeOn, localSaveContent, seedLocalContent, setLocalMode } from "./localStore.js";
import { Badge, Btn, Spinner } from "./ui.jsx";
import OverviewTab from "./tabs/OverviewTab.jsx";
import ContentTab from "./tabs/ContentTab.jsx";
import MediaTab from "./tabs/MediaTab.jsx";
import ProjectsTab from "./tabs/ProjectsTab.jsx";
import ServicesTab from "./tabs/ServicesTab.jsx";
import SkillsTab from "./tabs/SkillsTab.jsx";
import MessagesTab from "./tabs/MessagesTab.jsx";
import SettingsTab from "./tabs/SettingsTab.jsx";
import ToolsTab from "./tabs/ToolsTab.jsx";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "content", label: "Content" },
  { id: "media", label: "Hero & Media" },
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
  { id: "skills", label: "Skills & Journey" },
  { id: "messages", label: "Messages" },
  { id: "settings", label: "Settings" },
  { id: "tools", label: "Tools" },
];

export default function AdminApp() {
  const [booting, setBooting] = useState(Boolean(getToken()));
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState(null);
  const [content, setContent] = useState(null);
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState(null); // { id, msg, kind }
  // Bumped when the browser-GitHub connection changes so the header badge
  // (and anything reading ghConnected() at render time) refreshes.
  const [ghVersion, setGhVersion] = useState(0);
  const bumpGh = () => setGhVersion((v) => v + 1);
  // Bumped when local test mode flips — header badge + save routing refresh.
  const [modeVersion, setModeVersion] = useState(0);
  const bumpMode = () => setModeVersion((v) => v + 1);

  const notify = (msg, kind = "ok") => setToast({ id: Date.now(), msg, kind });

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Boot: validate the stored token and load dashboard data. (The no-token
  // path needs no setState — booting already starts false in that case.)
  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    (async () => {
      try {
        const s = await api("/api/status");
        if (!alive) return;
        setStatus(s);
        const c = await api("/api/content");
        if (!alive) return;
        setContent(c.content);
        setAuthed(true);
      } catch {
        clearToken();
      } finally {
        if (alive) setBooting(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleLogin = async (password) => {
    await login(password); // throws ApiError on failure
    const s = await api("/api/status");
    setStatus(s);
    const c = await api("/api/content");
    setContent(c.content);
    setAuthed(true);
    notify("Welcome back, Shoaib.");
  };

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
    setStatus(null);
    setContent(null);
  };

  // Central save — every tab persists through here. Transport:
  //   test mode      → localStorage in this browser (instant, no backend)
  //   server API     → Supabase / GitHub / dev disk (503 → bridge fallback)
  const saveContent = async (patch, label) => {
    try {
      let res;
      if (localModeOn()) {
        const next = localSaveContent(content, patch);
        setContent(next);
        notify(`${label} saved — test mode, live in this browser instantly`, "ok");
        return { content: next, storage: "local" };
      }
      try {
        res = await api("/api/content", { method: "PUT", body: { content: patch } });
      } catch (err) {
        if (!(err.status === 503 && ghConnected())) throw err;
        const next = await bridgeSaveContent(content, patch); // commits from the browser
        res = { content: next, storage: "github-browser" };
      }
      setContent(res.content);
      const instant = res.storage === "supabase";
      notify(
        instant
          ? `${label} saved — live instantly`
          : res.storage === "github" || res.storage === "github-browser"
            ? `${label} saved — committing… live in ~1 min`
            : `${label} saved`,
        instant || res.storage === "file" ? "ok" : "info"
      );
      setStatus((s) => (s ? { ...s, counts: { ...s.counts } } : s));
      return res;
    } catch (err) {
      if (err.status === 401) {
        setAuthed(false);
        notify("Session expired — please log in again.", "err");
      } else {
        notify(err.message, "err");
      }
      throw err;
    }
  };

  // Local test mode switch (Settings tab). Toggling ON seeds the snapshot
  // from the currently loaded content so the test starts from reality.
  const toggleLocalMode = async (on) => {
    if (on) {
      setLocalMode(true);
      if (!loadLocalContent() && content) seedLocalContent(content);
      notify("Test mode ON — saves & uploads stay in this browser", "info");
    } else {
      await clearAllLocalData().catch(() => {});
      setLocalMode(false);
      notify("Test mode OFF — test data cleared", "info");
    }
    bumpMode();
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary font-body flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="w-6 h-6" />
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Opening admin…</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const unread = status?.counts?.unread || 0;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
      <div className="noise-overlay" aria-hidden="true" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent-indigo/15 border border-accent-indigo/30 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="font-display font-semibold text-sm text-text-primary">Portfolio Admin</span>
              <span className="font-mono text-[10px] text-text-muted ml-2 hidden sm:inline">
                · updated {timeAgo(status?.contentUpdatedAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3" data-gh-version={ghVersion} data-mode-version={modeVersion}>
            {localModeOn() && <Badge tone="indigo">◍ Test mode · this browser</Badge>}
            <Badge
              tone={status?.storage === "github" || ghConnected() ? "green" : "amber"}
              className="hidden md:inline-flex"
            >
              {status?.storage === "supabase"
                ? "Supabase CMS"
                : status?.storage === "github"
                  ? "GitHub CMS"
                  : ghConnected()
                    ? "GitHub CMS · browser"
                    : "Local driver"}
            </Badge>
            {unread > 0 && <Badge tone="cyan">{unread} new</Badge>}
            <a href="/" target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 rounded-lg font-mono text-xs">
              View site ↗
            </a>
            <Btn variant="ghost" onClick={handleLogout} className="!px-3 !py-1.5">Logout</Btn>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex gap-8 items-start">
        {/* Sidebar (desktop) */}
        <nav aria-label="Admin sections" className="hidden lg:block w-52 shrink-0 sticky top-24 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-mono text-xs transition-all flex items-center justify-between ${
                tab === t.id
                  ? "bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/25"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-card border border-transparent"
              }`}
            >
              {t.label}
              {t.id === "messages" && unread > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" aria-hidden="true" />
              )}
            </button>
          ))}
          <div className="pt-4">
            <p className="font-mono text-[10px] text-text-muted leading-relaxed px-4">
              Saves commit to GitHub and Vercel redeploys automatically.
            </p>
          </div>
        </nav>

        {/* Content column */}
        <main className="flex-1 min-w-0">
          {/* Pill tabs (mobile) */}
          <div className="lg:hidden -mx-4 px-4 mb-6 overflow-x-auto">
            <div className="flex gap-1 bg-bg-card border border-border-subtle rounded-xl p-1 w-max">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={`px-4 py-2 rounded-lg font-mono text-xs whitespace-nowrap transition-all ${
                    tab === t.id
                      ? "bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/25"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl text-text-primary mb-1">
            {tab === "overview" && "Dashboard"}
            {tab === "content" && "Site content"}
            {tab === "media" && "Hero & media"}
            {tab === "projects" && "Projects"}
            {tab === "services" && "Services"}
            {tab === "skills" && "Skills, experience & journey"}
            {tab === "messages" && "Inbox"}
            {tab === "settings" && "Settings & API"}
            {tab === "tools" && "Tools"}
          </h1>
          <p className="font-body text-text-secondary text-sm mb-6">
            {tab === "overview" && "Everything at a glance — storage health, stats and the latest activity."}
            {tab === "content" && "Identity, hero roles, bio and links — powers the hero, contact section and chatbot."}
            {tab === "media" && "The hero background — video/image uploads, framing, film look. What visitors see behind everything."}
            {tab === "projects" && "Case studies with full CRUD, reordering and deep case-study JSON."}
            {tab === "services" && "The Services page catalog — what you offer, deliverables, timelines. Booking form reads from here."}
            {tab === "skills" && "Structured editors for skills, experience roles and the journey timeline."}
            {tab === "messages" && "Messages submitted through the site's contact form."}
            {tab === "settings" && "Site-wide switches, deployment health, environment setup and the full API reference."}
            {tab === "tools" && "Utilities that run fully client-side."}
          </p>

          <div className="animate-fade-in">
            {tab === "overview" && <OverviewTab status={status} content={content} onNavigate={setTab} />}
            {/* key = last update → editors remount with fresh server state after each save */}
            {tab === "content" && <ContentTab key={content?.meta?.updatedAt || "init"} content={content} saveContent={saveContent} />}
            {tab === "media" && <MediaTab key={content?.meta?.updatedAt || "init"} content={content} saveContent={saveContent} notify={notify} />}
            {tab === "projects" && <ProjectsTab key={content?.meta?.updatedAt || "init"} content={content} saveContent={saveContent} />}
            {tab === "services" && <ServicesTab key={content?.meta?.updatedAt || "init"} content={content} saveContent={saveContent} />}
            {tab === "skills" && <SkillsTab key={content?.meta?.updatedAt || "init"} content={content} saveContent={saveContent} />}
            {tab === "messages" && <MessagesTab notify={notify} />}
            {tab === "settings" && <SettingsTab key={content?.meta?.updatedAt || "init"} status={status} content={content} saveContent={saveContent} onGhChanged={bumpGh} onModeChanged={toggleLocalMode} />}
            {tab === "tools" && <ToolsTab content={content} />}
          </div>
        </main>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl border backdrop-blur-xl shadow-glow-indigo font-mono text-xs animate-fade-up ${
            toast.kind === "err"
              ? "border-red-400/40 bg-red-500/10 text-red-300"
              : toast.kind === "info"
                ? "border-accent-indigo/40 bg-accent-indigo/10 text-accent-indigoSoft"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onLogin(password);
    } catch (err) {
      setError(err.message || "Login failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body flex items-center justify-center px-4 relative">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-accent-indigo/[0.04] via-transparent to-accent-cyan/[0.03] pointer-events-none" aria-hidden="true" />

      <form onSubmit={submit} className="relative w-full max-w-sm" noValidate>
        <div className="rounded-2xl bg-bg-card border border-border-subtle p-8 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-accent-indigo/15 border border-accent-indigo/30 flex items-center justify-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="font-display font-bold text-xl text-center text-text-primary">Portfolio Admin</h1>
          <p className="font-mono text-[10px] text-text-muted text-center mt-2 mb-7 uppercase tracking-widest">
            Sign in to manage site content
          </p>

          <label htmlFor="admin-password" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
            Admin password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              autoFocus
              autoComplete="current-password"
              aria-invalid={!!error}
              aria-describedby={error ? "admin-error" : undefined}
              className={`w-full bg-bg-primary border rounded-xl pl-4 pr-12 py-3 font-body text-sm text-text-primary focus:outline-none focus:border-accent-indigo/60 transition-colors ${
                error ? "border-red-500/50" : "border-border-mid"
              }`}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted hover:text-text-secondary px-1"
            >
              {show ? "HIDE" : "SHOW"}
            </button>
          </div>

          {error && (
            <p id="admin-error" role="alert" className="font-mono text-[10px] text-red-400 mt-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !password.trim()}
            className="btn-primary w-full py-3 rounded-xl font-mono text-xs mt-6 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {busy ? <><Spinner className="!w-3.5 !h-3.5 !border-accent-indigoSoft/30 !border-t-accent-indigoSoft" /> Signing in…</> : "Sign in"}
          </button>

          <p className="font-mono text-[10px] text-text-muted text-center mt-6 leading-relaxed">
            First run? The default password is{" "}
            <code className="text-accent-cyan">shoaib-admin-2026</code> — set{" "}
            <code className="text-accent-cyan">ADMIN_PASSWORD</code> on Vercel to change it.
          </p>
        </div>

        <a
          href="/"
          className="block text-center font-mono text-[10px] text-text-muted hover:text-accent-indigo transition-colors mt-5"
        >
          ← Back to site
        </a>
      </form>
    </div>
  );
}
