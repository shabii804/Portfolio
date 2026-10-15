// ─────────────────────────────────────────────────────────────────────────────
// Messages — the contact-form inbox. Reads/writes through /api/messages:
// list, filter unread, mark read/unread, reply via mailto, delete.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { api, timeAgo } from "../api.js";
import { Badge, Btn, ConfirmBtn, EmptyState, Spinner } from "../ui.jsx";
export default function MessagesTab({ notify }) {
  const [messages, setMessages] = useState(null);
  const [filter, setFilter] = useState("all"); // all | unread
  const [busyId, setBusyId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const data = await api("/api/messages");
      setMessages(data.messages || []);
    } catch (err) {
      notify?.(err.message, "err");
      if (!messages) setMessages([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial load — async, so no synchronous setState in the effect body.
    let alive = true;
    api("/api/messages")
      .then((d) => {
        if (alive) setMessages(d.messages || []);
      })
      .catch((err) => {
        notify?.(err.message, "err");
        if (alive) setMessages([]);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = async (msg, read) => {
    setBusyId(msg.id);
    try {
      const data = await api(`/api/messages?id=${encodeURIComponent(msg.id)}`, {
        method: "PATCH",
        body: { read },
      });
      setMessages(data.messages || []);
      notify?.(read ? "Marked as read" : "Marked as unread");
    } catch (err) {
      notify?.(err.message, "err");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (msg) => {
    setBusyId(msg.id);
    try {
      const data = await api(`/api/messages?id=${encodeURIComponent(msg.id)}`, { method: "DELETE" });
      setMessages(data.messages || []);
      notify?.("Message deleted");
    } catch (err) {
      notify?.(err.message, "err");
    } finally {
      setBusyId(null);
    }
  };

  const unread = (messages || []).filter((m) => !m.read).length;
  const visible = (messages || []).filter((m) => (filter === "unread" ? !m.read : true));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl font-mono text-xs transition-all ${filter === "all" ? "bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/25" : "text-text-muted hover:text-text-secondary border border-transparent"}`}
          >
            All {messages ? `(${messages.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl font-mono text-xs transition-all ${filter === "unread" ? "bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/25" : "text-text-muted hover:text-text-secondary border border-transparent"}`}
          >
            Unread {unread ? `(${unread})` : ""}
          </button>
          {unread > 0 && <Badge tone="cyan">{unread} new</Badge>}
        </div>
        <Btn variant="ghost" onClick={() => load()} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "↻ Refresh"}
        </Btn>
      </div>

      {messages === null ? (
        <div className="py-16 text-center"><Spinner /></div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="✉"
          title={filter === "unread" ? "No unread messages" : "Inbox zero"}
          desc="Contact-form submissions appear here (stored in data/messages.json)."
        />
      ) : (
        <div className="space-y-3">
          {visible.map((m) => (
            <article
              key={m.id}
              className={`rounded-2xl border p-4 md:p-5 transition-colors ${
                m.read ? "bg-bg-card border-border-subtle" : "bg-bg-card border-accent-indigo/25"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {!m.read && <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" aria-label="Unread" />}
                  <span className={`font-display text-sm truncate ${m.read ? "text-text-secondary" : "text-text-primary"}`}>
                    {m.name}
                  </span>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`}
                    className="font-mono text-[10px] text-accent-indigo hover:text-accent-cyan truncate"
                  >
                    {m.email}
                  </a>
                </div>
                <span className="font-mono text-[10px] text-text-muted shrink-0">{timeAgo(m.createdAt)}</span>
              </div>

              <p className="font-mono text-[10px] text-text-muted mb-2">{m.subject}</p>
              <p className="font-body text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{m.message}</p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Btn variant="ghost" onClick={() => markRead(m, !m.read)} disabled={busyId === m.id}>
                  {m.read ? "Mark unread" : "Mark read"}
                </Btn>
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`}
                  className="btn-ghost px-4 py-2.5 rounded-xl font-mono text-xs"
                >
                  Reply ↗
                </a>
                <ConfirmBtn
                  onConfirm={() => remove(m)}
                  className="font-mono text-[10px] text-red-400 border border-red-400/30 px-3 py-2 rounded-xl hover:bg-red-400/10 transition-all"
                  confirmLabel="Delete message?"
                >
                  Delete
                </ConfirmBtn>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
