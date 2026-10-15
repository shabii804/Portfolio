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
import { Badge, Btn, Panel, Spinner, TextArea, TextInput, Toggle } from "../ui.jsx";

const API_REFERENCE = [
  ["POST", "/api/auth", "public", "Login with the admin password → bearer token (7 days)."],
  ["GET", "/api/content", "public", "Full portfolio content (same data the site is built from)."],
  ["PUT", "/api/content", "admin", "Merge sections: personal / media / settings / skills / projects / experience / journey."],
  ["POST", "/api/upload", "admin", "Upload media (base64, ≤3 MB) → /uploads/<file> — plugs into the hero background or any URL field."],
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

// ── 2. Infrastructure / env / API reference ───────────────────────────────────
export default function SettingsTab({ status, content, saveContent }) {
  const env = status?.env || {};
  const envRows = [
    ["ADMIN_PASSWORD", env.ADMIN_PASSWORD, "Custom admin password set (default disabled)."],
    ["GITHUB_TOKEN", env.GITHUB_TOKEN, "GitHub CMS driver active — saves commit & deploy."],
    ["GITHUB_REPO", env.GITHUB_REPO, "Custom target repo (defaults to shabii804/Portfolio)."],
    ["GITHUB_BRANCH", env.GITHUB_BRANCH, "Custom target branch (defaults to main)."],
    ["CHATBOT_KEY (GLM/Z.AI)", env.CHATBOT_KEY, "Chatbot uses GLM; without it Pollinations fallback is used."],
  ];

  return (
    <div className="space-y-6">
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

      <Panel title="Production setup (Vercel)" desc="One-time — makes admin saves persist for real.">
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
          Without GITHUB_TOKEN the panel still works (login, stats, inbox reading) but saves fall back to the
          read-only filesystem and fail with a clear 503 — this is the safe default.
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
