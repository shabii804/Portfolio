// ─────────────────────────────────────────────────────────────────────────────
// Overview — dashboard landing: stats, storage/health, recent messages.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { api, timeAgo } from "../api.js";
import { Badge, Panel, Stat } from "../ui.jsx";

export default function OverviewTab({ status, onNavigate }) {
  const counts = status?.counts || {};
  const recent = status?.storage === "github" ? "commits to GitHub → Vercel redeploys (~1 min)" : "writes the local files → visible instantly in dev";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Stat value={counts.projects ?? "—"} label="Projects" onClick={() => onNavigate("projects")} />
        <Stat value={counts.skills ?? "—"} label="Skill Groups" tone="cyan" onClick={() => onNavigate("skills")} />
        <Stat value={counts.experience ?? "—"} label="Experience" onClick={() => onNavigate("skills")} />
        <Stat value={counts.journey ?? "—"} label="Journey" onClick={() => onNavigate("skills")} />
        <Stat value={counts.messages ?? "—"} label="Messages" tone="cyan" onClick={() => onNavigate("messages")} />
        <Stat value={counts.unread ?? "—"} label="Unread" tone={(counts.unread ?? 0) > 0 ? "amber" : "green"} onClick={() => onNavigate("messages")} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Deployment & storage" desc="Where your edits are saved and how they reach production.">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge tone={status?.storage === "github" ? "green" : "amber"}>
                {status?.storage === "github" ? "● GitHub CMS" : "● Local file driver"}
              </Badge>
              <span className="font-mono text-[10px] text-text-muted">{recent}</span>
            </div>
            <div className="font-mono text-[11px] text-text-secondary space-y-1.5 bg-bg-primary border border-border-subtle rounded-xl p-4">
              <div>repo <span className="text-accent-cyan">{status?.repo || "—"}</span></div>
              <div>branch <span className="text-accent-cyan">{status?.branch || "—"}</span></div>
              <div>last content update <span className="text-accent-cyan">{timeAgo(status?.contentUpdatedAt)}</span></div>
            </div>
            {status?.usingDefaultPassword && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
                <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-1.5">⚠ Default password active</p>
                <p className="font-body text-xs text-text-secondary leading-relaxed">
                  Anyone who reads the public source knows the default password. Set{" "}
                  <code className="font-mono text-[10px] text-amber-300">ADMIN_PASSWORD</code> in Vercel → Settings →
                  Environment Variables and redeploy (see Settings → Production setup).
                </p>
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title="Latest message"
          desc="The most recent contact-form submission."
          actions={
            <button
              onClick={() => onNavigate("messages")}
              className="font-mono text-[10px] text-accent-indigo hover:text-accent-cyan transition-colors"
            >
              Open inbox →
            </button>
          }
        >
          <RecentMessage onNavigate={onNavigate} />
        </Panel>
      </div>

      <Panel title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate("content")} className="btn-primary px-5 py-2.5 rounded-xl font-mono text-xs">
            Edit personal info
          </button>
          <button onClick={() => onNavigate("projects")} className="btn-ghost px-5 py-2.5 rounded-xl font-mono text-xs">
            Manage projects
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="btn-ghost px-5 py-2.5 rounded-xl font-mono text-xs">
            View live site ↗
          </a>
        </div>
      </Panel>
    </div>
  );
}

function RecentMessage({ onNavigate }) {
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api("/api/messages")
      .then((data) => { if (alive) setMsg(data.messages?.[0] || null); })
      .catch(() => { /* handled by empty state */ })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <p className="font-mono text-[10px] text-text-muted">Loading…</p>;
  if (!msg) {
    return (
      <div className="font-body text-xs text-text-secondary leading-relaxed">
        No messages yet — submissions from the contact form land here.
        <button onClick={() => onNavigate("messages")} className="block mt-2 font-mono text-[10px] text-accent-indigo hover:text-accent-cyan">
          Go to inbox →
        </button>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-bg-primary border border-border-subtle p-4">
      <div className="flex items-center gap-2 mb-2">
        {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" aria-hidden="true" />}
        <span className="font-display text-sm text-text-primary">{msg.name}</span>
        <span className="font-mono text-[10px] text-text-muted">· {timeAgo(msg.createdAt)}</span>
      </div>
      <p className="font-mono text-[10px] text-text-muted mb-2">{msg.subject}</p>
      <p className="font-body text-xs text-text-secondary leading-relaxed">{msg.message.length > 180 ? `${msg.message.slice(0, 180)}…` : msg.message}</p>
    </div>
  );
}
