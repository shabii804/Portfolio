// ─────────────────────────────────────────────────────────────────────────────
// Settings — two halves:
//   1. "Site settings" — REAL editable switches persisted into
//      content.settings via PUT /api/content (SEO title/description, feature
//      toggles: preloader, cursor, scroll progress, back-to-top, chatbot,
//      GitHub activity).
//   2. Deployment health, environment checklist, production setup guide and
//      the full REST API reference (unchanged infrastructure tooling).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Badge, Btn, Field, Panel, Spinner, TextArea, TextInput, Toggle, inputCls } from "../ui.jsx";
import {
  clearGhConfig,
  getGhConfig,
  ghConnected,
  ghValidate,
  setGhConfig,
} from "../ghBridge.js";
import { clearAllLocalData, localModeOn, setLocalMode } from "../localStore.js";

const API_REFERENCE = [
  ["POST", "/api/auth", "public", "Login with the admin password → bearer token (7 days)."],
  ["GET", "/api/content", "public", "Full portfolio content (same data the site is built from)."],
  ["PUT", "/api/content", "admin", "Merge sections: personal / media / settings / skills / projects / experience / journey."],
  ["POST", "/api/upload", "admin", "Upload media (base64, ≤3 MB) → /uploads/<file> or Supabase CDN (instant)."],
  ["POST", "/api/upload-url", "admin", "Mint a signed upload URL — the browser PUTs big files (≤48 MB) straight to Supabase."],
  ["GET", "/api/messages", "admin", "List contact-form messages (newest first)."],
  ["POST", "/api/messages", "public", "Submit a message (honeypot + rate limited 5/10min)."],
  ["PATCH", "/api/messages?id=", "admin", "Mark a message read/unread."],
  ["DELETE", "/api/messages?id=", "admin", "Delete a message."],
  ["GET", "/api/projects", "public", "List projects."],
  ["POST", "/api/projects", "admin", "Add a project (id auto-generated)."],
  ["PUT", "/api/projects?id=", "admin", "Replace a project by id."],
  ["DELETE", "/api/projects?id=", "admin", "Remove a project."],
  ["GET", "/api/status", "admin", "Dashboard stats + environment readiness (no secrets)."],
  ["POST", "/api/chat", "public", "AI chatbot (grounded in the fact sheet derived from content)."],
];

// ── 1. Real site settings editor ──────────────────────────────────────────────
function SiteSettingsPanel({ content, saveContent }) {
  const server = content?.settings ?? {};
  const [draft, setDraft] = useState({ ...server });
  const [busy, setBusy] = useState(false);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(server);

  const save = async () => {
    setBusy(true);
    try {
      await saveContent({ settings: draft }, "Site settings");
    } catch {
      /* toast already shown by saveContent */
    } finally {
      setBusy(false);
    }
  };

  const toggles = [
    ["showPreloader", "Loading intro", "The cinematic name/photo intro on first visit."],
    ["showCursor", "Custom cursor", "Glow cursor + comet trail (desktop pointers only)."],
    ["showScrollProgress", "Scroll progress bar", "Thin gradient bar under the nav."],
    ["showBackToTop", "Back-to-top button", "Floating button after scrolling down."],
    ["showChatbot", "AI chatbot", "The floating GLM assistant + its command palette action."],
    ["showGitHubActivity", "GitHub activity", "Live commits section + its nav & palette links."],
  ];

  return (
    <Panel
      title="Site settings"
      desc="Saved with the rest of the content — every switch applies site-wide after the automatic redeploy."
      actions={dirty ? <Badge tone="amber">unsaved changes</Badge> : <Badge tone="muted">in sync</Badge>}
    >
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <TextInput
          label="Browser tab title (SEO)"
          value={draft.seoTitle || ""}
          onChange={(e) => set("seoTitle", e.target.value)}
          placeholder="Shoaib Arshad — Full Stack Developer"
        />
        <TextArea
          label="Meta description (SEO)"
          rows={3}
          value={draft.seoDescription || ""}
          onChange={(e) => set("seoDescription", e.target.value)}
          placeholder="Short pitch shown in search results…"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 py-4 border-t border-border-subtle">
        {toggles.map(([key, label, desc]) => (
          <div key={key} className="flex items-start justify-between gap-3 py-1.5">
            <div className="min-w-0">
              <div className="font-body text-xs text-text-primary">{label}</div>
              <div className="font-body text-[11px] text-text-muted leading-snug">{desc}</div>
            </div>
            <Toggle
              checked={draft[key] !== false}
              onChange={(v) => set(key, v)}
              label={draft[key] !== false ? "on" : "off"}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
        <Btn onClick={save} disabled={busy || !dirty}>
          {busy ? <><Spinner className="!w-3.5 !h-3.5" /> Saving…</> : "Save settings"}
        </Btn>
        <span className="font-mono text-[10px] text-text-muted">
          {dirty ? "You have unsaved changes." : "Everything saved."}
        </span>
      </div>
    </Panel>
  );
}

// ── 1a. Local test mode — the zero-backend playground ────────────────────
// Saves/uploads live in THIS browser only (localStorage + IndexedDB) and the
// site picks them up instantly — perfect for trying hero changes without any
// deploy. Turn off → everything test-related is wiped.
export function LocalTestModePanel({ onModeChanged }) {
  const [on, setOn] = useState(localModeOn());
  const [busy, setBusy] = useState(false);

  const toggle = async (v) => {
    setBusy(true);
    try {
      if (!v) await clearAllLocalData().catch(() => {});
      setLocalMode(v);
      setOn(v);
      onModeChanged?.(v);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="Local test mode — this browser only"
      desc="Try changes with zero setup: saves and uploads live in this browser's memory and show up on the site INSTANTLY. Nothing is published."
      actions={<Badge tone={on ? "indigo" : "muted"}>{on ? "◍ on" : "off"}</Badge>}
    >
      <div className="flex items-start justify-between gap-4 py-1">
        <div className="min-w-0">
          <div className="font-body text-xs text-text-primary">Enable test mode</div>
          <div className="font-body text-[11px] text-text-muted leading-snug mt-0.5">
            {on
              ? "Active — every save & upload now stays in this browser. Open the site in another tab to see changes live."
              : "Off — saves go through the real persistence chain (Supabase / GitHub)."}
          </div>
          {on && (
            <div className="font-mono text-[10px] text-amber-400 mt-2 leading-relaxed">
              Visitors do NOT see test data — it exists only here. Turning it off wipes it.
            </div>
          )}
        </div>
        <Toggle checked={on} onChange={toggle} disabled={busy} label="local test mode" />
      </div>
    </Panel>
  );
}

// ── 1b. Supabase — the instant CMS backend (recommended) ──────────────────
export function SupabasePanel({ status }) {
  const env = status?.env || {};
  const configured = env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY;
  return (
    <Panel
      title="Supabase — instant CMS (recommended)"
      desc="Stores content + media in your Supabase project. Saves and uploads go LIVE INSTANTLY — no rebuild, no redeploy."
      actions={<Badge tone={configured ? "green" : "amber"}>{configured ? `● connected${status?.supabaseBucket ? ` · ${status.supabaseBucket}` : ""}` : "not configured"}</Badge>}
    >
      <ol className="space-y-3 list-none">
        {["1", "2", "3", "4"].map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-lg bg-accent-indigo/15 border border-accent-indigo/30 text-accent-indigo font-mono text-[11px] flex items-center justify-center">
              {i + 1}
            </span>
            <div className="font-body text-xs text-text-secondary leading-relaxed pt-0.5">
              {i === 0 && (
                <>
                  Create a free project at <strong className="text-text-primary">supabase.com</strong> (no card needed).
                </>
              )}
              {i === 1 && (
                <>
                  In Supabase → <strong className="text-text-primary">Project Settings → API</strong> copy the
                  <em> Project URL</em> and the <em>service_role</em> secret key.
                </>
              )}
              {i === 2 && (
                <>
                  Vercel → your project → Settings → Environment Variables → add:
                  <div className="mt-2 font-mono text-[10px] text-text-secondary bg-bg-primary border border-border-subtle rounded-xl p-3 space-y-1">
                    <div><span className="text-accent-cyan">SUPABASE_URL</span> = https://xxxx.supabase.co</div>
                    <div><span className="text-accent-cyan">SUPABASE_SERVICE_KEY</span> = eyJ… <span className="text-text-muted">(service_role — server only)</span></div>
                  </div>
                </>
              )}
              {i === 3 && (
                <>
                  Redeploy (Deployments → ⋯ → Redeploy). Done — the bucket is created automatically and this panel
                  turns <Badge tone="green">● connected</Badge>. Hero video uploads stream straight to Supabase
                  (up to 48 MB) and appear the moment the upload finishes.
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="font-mono text-[10px] text-text-muted mt-4 leading-relaxed">
        Priority: Supabase → GitHub → local disk. With both Supabase and GitHub tokens set, content is also
        mirrored to the repo so rebuilds bundle fresh data. Keep the service key OUT of the browser — it is a
        server-side secret.
      </p>
    </Panel>
  );
}

// ── 1c. Browser GitHub bridge — the zero-setup persistence fix ─────────────────
// Vercel's serverless filesystem is read-only (EROFS on /var/task/**), so
// without persistence every save/upload fails on production. This panel
// connects the bridge: a GitHub token stored ONLY in this browser commits
// content/uploads straight from the page → Vercel rebuilds → live in ~1 min.
export function GitHubBridgePanel({ onGhChanged }) {
  const [connected, setConnected] = useState(ghConnected());
  const [account, setAccount] = useState(null); // { login, repo, branch }
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState(getGhConfig().repo);
  const [branch, setBranch] = useState(getGhConfig().branch);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const connect = async (e) => {
    e?.preventDefault?.();
    if (!token.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const info = await ghValidate({ token: token.trim(), repo: repo.trim(), branch: branch.trim() });
      setGhConfig({ token: token.trim(), repo: repo.trim(), branch: branch.trim() });
      setAccount(info);
      setConnected(true);
      setToken("");
      onGhChanged?.();
    } catch (err) {
      setError(err.message || "Could not connect.");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => {
    clearGhConfig();
    setConnected(false);
    setAccount(null);
    onGhChanged?.();
  };

  if (connected) {
    return (
      <Panel
        title="GitHub connection — browser mode"
        desc="Saves and uploads commit straight from this browser. Token never leaves your machine."
        actions={<Badge tone="green">● connected{account?.login ? ` as ${account.login}` : ""}</Badge>}
      >
        <div className="rounded-xl bg-bg-primary border border-border-subtle p-4 font-mono text-[11px] text-text-secondary space-y-1">
          <div>repo <span className="text-accent-cyan">{getGhConfig().repo}</span> @ branch <span className="text-accent-cyan">{getGhConfig().branch}</span></div>
          <div className="text-text-muted">content saves · media uploads (up to 25 MB) · auto-redeploy on commit</div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Btn variant="ghost" onClick={disconnect}>Disconnect</Btn>
          <span className="font-mono text-[10px] text-text-muted">Everything in Hero &amp; Media, Content, Projects… now persists on production.</span>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Connect GitHub — browser mode"
      desc="One paste, zero Vercel setup: makes every save and upload on this production panel persist for real."
      actions={<Badge tone="amber">not connected</Badge>}
    >
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 mb-5">
        <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-1.5">Why you saw “EROFS: read-only file system”</p>
        <p className="font-body text-xs text-text-secondary leading-relaxed">
          The production server runs on a read-only filesystem, so uploads/saves bounced until persistence is connected.
          Connect GitHub below and every save commits from your browser — no Vercel settings needed.
        </p>
      </div>

      <form onSubmit={connect} className="space-y-4">
        <Field label="GitHub token" hint="Fine-grained PAT with “Contents: Read and write” on the repo (GitHub → Settings → Developer settings). Stored only in this browser.">
          <input
            type="password"
            value={token}
            onChange={(e) => { setToken(e.target.value); setError(null); }}
            placeholder="github_pat_…"
            autoComplete="off"
            spellCheck={false}
            className={`${inputCls} font-mono text-xs`}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Repository" hint="owner/name with your portfolio code.">
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="shabii804/Portfolio"
              spellCheck={false}
              className={`${inputCls} font-mono text-xs`}
            />
          </Field>
          <Field label="Branch" hint="The branch Vercel deploys from.">
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              spellCheck={false}
              className={`${inputCls} font-mono text-xs`}
            />
          </Field>
        </div>

        {error && (
          <p role="alert" className="font-mono text-[10px] text-red-400">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!token.trim() || busy}
            className="btn-primary px-4 py-2.5 rounded-xl font-mono text-xs disabled:opacity-40 flex items-center gap-2"
          >
            {busy ? <><Spinner className="!w-3.5 !h-3.5" /> Validating…</> : "Connect & validate"}
          </button>
          <span className="font-mono text-[10px] text-text-muted">Checks token identity + push access + branch before saving anything.</span>
        </div>
      </form>
    </Panel>
  );
}

// ── 2. Infrastructure / env / API reference ───────────────────────────────────
export default function SettingsTab({ status, content, saveContent, onGhChanged, onModeChanged }) {
  const env = status?.env || {};
  const envRows = [
    ["ADMIN_PASSWORD", env.ADMIN_PASSWORD, "Custom admin password set (default disabled)."],
    ["SUPABASE_URL", env.SUPABASE_URL, "Supabase project URL — instant CMS backend."],
    ["SUPABASE_SERVICE_KEY", env.SUPABASE_SERVICE_KEY, "Supabase service key — unlocks instant saves + 48 MB uploads."],
    ["GITHUB_TOKEN", env.GITHUB_TOKEN, "GitHub CMS driver — saves commit & deploy."],
    ["GITHUB_REPO", env.GITHUB_REPO, "Custom target repo (defaults to shabii804/Portfolio)."],
    ["GITHUB_BRANCH", env.GITHUB_BRANCH, "Custom target branch (defaults to main)."],
    ["CHATBOT_KEY (GLM/Z.AI)", env.CHATBOT_KEY, "Chatbot uses GLM; without it Pollinations fallback is used."],
  ];

  return (
    <div className="space-y-6">
      <LocalTestModePanel onModeChanged={onModeChanged} />
      <SupabasePanel status={status} />
      <GitHubBridgePanel onGhChanged={onGhChanged} />
      {content !== undefined && <SiteSettingsPanel content={content} saveContent={saveContent} />}

      <Panel
        title="Environment & health"
        desc="What this deployment can do right now. Booleans only — the API never returns secret values."
      >
        <div className="space-y-2">
          {envRows.map(([name, ok, desc]) => (
            <div key={name} className="flex items-start gap-3 p-3 rounded-xl bg-bg-primary border border-border-subtle">
              <Badge tone={ok ? "green" : "muted"}>{ok ? "✓ set" : "✗ not set"}</Badge>
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-text-primary">{name}</div>
                <div className="font-body text-xs text-text-muted">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        {status?.usingDefaultPassword && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
            <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-1.5">⚠ Security</p>
            <p className="font-body text-xs text-text-secondary leading-relaxed">
              You are using the default admin password (<code className="font-mono text-[10px]">shoaib-admin-2026</code>),
              which is public in the repo source. Set <code className="font-mono text-[10px] text-amber-300">ADMIN_PASSWORD</code>{" "}
              in your hosting dashboard to secure the panel.
            </p>
          </div>
        )}
      </Panel>

      <Panel title="Production setup (Vercel env) — optional alternative" desc="The browser connection above is instant; this server-side route makes EVERY request (including contact-form inbox writes) persist without the browser.">
        <ol className="space-y-3 list-none">
          {[
            <>
              Create a GitHub <strong className="text-text-primary">fine-grained PAT</strong> with{" "}
              <em>Contents: Read and write</em> on <code className="font-mono text-[10px] text-accent-cyan">shabii804/Portfolio</code>{" "}
              (GitHub → Settings → Developer settings → Fine-grained tokens).
            </>,
            <>
              Open <strong className="text-text-primary">Vercel → your project → Settings → Environment Variables</strong> and add:
              <div className="mt-2 font-mono text-[10px] text-text-secondary bg-bg-primary border border-border-subtle rounded-xl p-3 space-y-1">
                <div><span className="text-accent-cyan">ADMIN_PASSWORD</span> = your secret password</div>
                <div><span className="text-accent-cyan">SUPABASE_URL</span> = https://xxxx.supabase.co <span className="text-text-muted">(instant CMS — recommended)</span></div>
                <div><span className="text-accent-cyan">SUPABASE_SERVICE_KEY</span> = eyJ…</div>
                <div><span className="text-accent-cyan">GITHUB_TOKEN</span> = github_pat_…</div>
                <div><span className="text-accent-cyan">GITHUB_REPO</span> = shabii804/Portfolio <span className="text-text-muted">(optional)</span></div>
                <div><span className="text-accent-cyan">GITHUB_BRANCH</span> = main <span className="text-text-muted">(optional)</span></div>
              </div>
            </>,
            <>
              Redeploy (Vercel → Deployments → ⋯ → Redeploy) — or just push any commit.
            </>,
            <>
              Back here: the badge above should read <Badge tone="green">● GitHub CMS</Badge> and saves will
              commit → Vercel rebuilds → live in ~1 minute.
            </>,
          ].map((node, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-lg bg-accent-indigo/15 border border-accent-indigo/30 text-accent-indigo font-mono text-[11px] flex items-center justify-center">
                {i + 1}
              </span>
              <div className="font-body text-xs text-text-secondary leading-relaxed pt-0.5">{node}</div>
            </li>
          ))}
        </ol>
        <p className="font-mono text-[10px] text-text-muted mt-4 leading-relaxed">
          Without either option the panel still works (login, stats, inbox reading) but saves fall back to the
          read-only filesystem and fail with a clear 503 — this is the safe default. The browser connection above
          covers all admin saves &amp; uploads; the Vercel env route additionally persists public contact-form messages.
        </p>
      </Panel>

      <Panel title="REST API reference" desc="Everything the admin panel does is available as plain JSON endpoints.">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left border-separate border-spacing-y-1.5 px-1">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                <th className="py-1 pr-3 font-medium">Method</th>
                <th className="py-1 pr-3 font-medium">Path</th>
                <th className="py-1 pr-3 font-medium">Auth</th>
                <th className="py-1 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {API_REFERENCE.map(([method, path, auth, desc]) => (
                <tr key={`${method}${path}${desc}`} className="bg-bg-primary">
                  <td className="rounded-l-xl px-3 py-2.5 font-mono text-[10px]">
                    <span className={method === "GET" ? "text-accent-cyan" : method === "DELETE" ? "text-red-400" : "text-accent-indigo"}>
                      {method}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-text-primary whitespace-nowrap">{path}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px]">
                    <Badge tone={auth === "admin" ? "indigo" : "muted"}>{auth}</Badge>
                  </td>
                  <td className="rounded-r-xl px-3 py-2.5 font-body text-xs text-text-secondary">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-[10px] text-text-muted mt-4">
          Auth header: <span className="text-accent-cyan">Authorization: Bearer &lt;token from /api/auth&gt;</span>
        </p>
      </Panel>
    </div>
  );
}
