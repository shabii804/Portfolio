// ─────────────────────────────────────────────────────────────────────────────
// Services — CRUD over the services array shown on /services. Each entry:
// icon (from the site's icon map), tint, title, tagline, deliverables,
// timeline and social proof. "Save services" persists via PUT /api/content
// { services } — same pipeline as Projects.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Badge, Btn, ConfirmBtn, Field, ListEditor, Panel, TextInput } from "../ui.jsx";

const newId = () => `s-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const ICONS = ["globe", "layout-dashboard", "monitor", "database", "rocket", "wrench", "briefcase", "code"];

const blank = () => ({
  id: newId(),
  icon: "briefcase",
  tint: "#fbbf24",
  title: "New service",
  tagline: "",
  deliverables: [],
  timeline: "",
  proof: "",
});

export default function ServicesTab({ content, saveContent }) {
  const [services, setServices] = useState(() => (content?.services || []).map((s) => ({ ...s })));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(services) !== JSON.stringify(content?.services || []);

  const save = async () => {
    setSaving(true);
    try {
      await saveContent({ services }, "Services");
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const move = (i, dir) => {
    const next = [...services];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setServices(next);
  };

  const add = () => {
    const s = blank();
    setServices([...services, s]);
    setEditingId(s.id);
  };

  const remove = (s) => setServices(services.filter((x) => x.id !== s.id));

  return (
    <div className="space-y-4">
      <Panel
        title="Services"
        desc="The catalog on the Services page — what you offer, what's included and how long it takes. The booking form pre-fills from these titles."
        actions={
          <>
            <Btn onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save services"}</Btn>
            <Btn variant="ghost" onClick={add}>+ Add</Btn>
          </>
        }
      >
        {dirty && (
          <p className="font-mono text-[10px] text-amber-400 mb-4">
            Unsaved changes — remember to hit “Save services”.
          </p>
        )}
        <div className="space-y-3">
          {services.map((s, i) => (
            <div key={s.id} className="rounded-xl bg-bg-primary border border-border-subtle">
              <div className="flex items-center gap-3 p-4">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.tint || "#fbbf24" }} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-medium text-sm text-text-primary truncate">{s.title}</div>
                  <div className="font-mono text-[10px] text-text-muted truncate">{s.tagline || "—"}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {s.timeline && <Badge tone="muted">{s.timeline}</Badge>}
                  <Badge>{(s.deliverables || []).length} items</Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${s.title} up`} className="font-mono text-xs text-text-muted hover:text-accent-indigo disabled:opacity-30 px-1">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === services.length - 1} aria-label={`Move ${s.title} down`} className="font-mono text-xs text-text-muted hover:text-accent-indigo disabled:opacity-30 px-1">↓</button>
                  <button type="button" onClick={() => setEditingId(editingId === s.id ? null : s.id)} className="btn-ghost px-3 py-1.5 rounded-lg font-mono text-[10px]">
                    {editingId === s.id ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {editingId === s.id && (
                <ServiceEditor service={s} onChange={(next) => setServices(services.map((x) => (x.id === s.id ? next : x)))} onDelete={() => remove(s)} />
              )}
            </div>
          ))}
          {services.length === 0 && (
            <p className="font-mono text-[10px] text-text-muted">No services — add your first one.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}

function ServiceEditor({ service, onChange, onDelete }) {
  const s = service;
  const set = (key, value) => onChange({ ...s, [key]: value });

  return (
    <div className="border-t border-border-subtle p-4 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput label="Title" value={s.title || ""} onChange={(e) => set("title", e.target.value)} />
        <TextInput label="Timeline" value={s.timeline || ""} onChange={(e) => set("timeline", e.target.value)} placeholder="2–6 weeks" />
        <TextInput label="Tagline" value={s.tagline || ""} onChange={(e) => set("tagline", e.target.value)} />
        <TextInput label="Proof line" value={s.proof || ""} onChange={(e) => set("proof", e.target.value)} placeholder="Farooq Agencies admin" />
        <Field label="Icon">
          <select
            value={s.icon || "briefcase"}
            onChange={(e) => set("icon", e.target.value)}
            aria-label="Service icon"
            className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:border-accent-indigo/60"
          >
            {ICONS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
        <TextInput label="Accent color (hex)" value={s.tint || ""} onChange={(e) => set("tint", e.target.value)} placeholder="#fbbf24" />
      </div>

      <Field label="Deliverables — what the client gets">
        <ListEditor value={s.deliverables || []} onChange={(v) => set("deliverables", v)} placeholder="Responsive React UI" addLabel="+ Add deliverable" />
      </Field>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <ConfirmBtn
          onConfirm={onDelete}
          className="font-mono text-[10px] text-red-400 border border-red-400/30 px-3 py-2 rounded-xl hover:bg-red-400/10 transition-all"
          confirmLabel="Delete service?"
        >
          Delete
        </ConfirmBtn>
        <span className="font-mono text-[10px] text-text-muted">Edits apply live — persist with “Save services” above.</span>
      </div>
    </div>
  );
}
