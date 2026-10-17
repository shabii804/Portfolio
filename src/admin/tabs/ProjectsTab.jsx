// ─────────────────────────────────────────────────────────────────────────────
// Projects — full CRUD over the projects array: add, edit, reorder, delete,
// including the deep case-study block (as JSON). One "Save projects" button
// persists the whole array via PUT /api/content { projects }.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Badge, Btn, ConfirmBtn, Field, ListEditor, Panel, TextArea, TextInput } from "../ui.jsx";

// Module-scope helpers (pure-ish + impure-time calls live outside render)
const newId = () => `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const blank = (num) => ({
  id: newId(),
  num,
  title: "New Project",
  subtitle: "",
  tagline: "",
  description: "",
  date: "",
  badge: "",
  live: "",
  github: "",
  accentHex: "#818cf8",
  stack: [],
  features: [],
  details: [],
  impact: [],
  screenshots: [],
  caseStudy: null,
});

export default function ProjectsTab({ content, saveContent }) {
  // Local draft list; parent remounts (key = meta.updatedAt) after each save.
  const [projects, setProjects] = useState(() => (content?.projects || []).map((p) => ({ ...p })));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(projects) !== JSON.stringify(content?.projects || []);

  const save = async () => {
    setSaving(true);
    try {
      await saveContent({ projects }, "Projects");
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const move = (i, dir) => {
    const next = [...projects];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setProjects(next);
  };

  const add = () => {
    const p = blank(String(projects.length + 1).padStart(2, "0"));
    setProjects([...projects, p]);
    setEditingId(p.id);
  };

  const duplicate = (p) => {
    const copy = { ...p, id: newId(), title: `${p.title} (copy)` };
    setProjects([...projects, copy]);
    setEditingId(copy.id);
  };

  const remove = (p) => setProjects(projects.filter((x) => x.id !== p.id));

  return (
    <div className="space-y-4">
      <Panel
        title="Projects"
        desc="Case studies shown in the Projects section — order, links, stack, screenshots and the deep case study."
        actions={
          <>
            <Btn onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save projects"}</Btn>
            <Btn variant="ghost" onClick={add}>+ Add</Btn>
          </>
        }
      >
        {dirty && (
          <p className="font-mono text-[10px] text-amber-400 mb-4">
            Unsaved changes — remember to hit “Save projects”.
          </p>
        )}
        <div className="space-y-3">
          {projects.map((p, i) => (
            <div key={p.id} className="rounded-xl bg-bg-primary border border-border-subtle">
              <div className="flex items-center gap-3 p-4">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.accentHex || "#818cf8" }} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-medium text-sm text-text-primary truncate">{p.title}</div>
                  <div className="font-mono text-[10px] text-text-muted truncate">{p.subtitle || p.tagline || "—"}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {p.live && <Badge tone="green">Live</Badge>}
                  {p.github && <Badge tone="muted">Code</Badge>}
                  {p.badge && <Badge>{p.badge}</Badge>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${p.title} up`} className="font-mono text-xs text-text-muted hover:text-accent-indigo disabled:opacity-30 px-1">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === projects.length - 1} aria-label={`Move ${p.title} down`} className="font-mono text-xs text-text-muted hover:text-accent-indigo disabled:opacity-30 px-1">↓</button>
                  <button type="button" onClick={() => setEditingId(editingId === p.id ? null : p.id)} className="btn-ghost px-3 py-1.5 rounded-lg font-mono text-[10px]">
                    {editingId === p.id ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {editingId === p.id && (
                <ProjectEditor
                  project={p}
                  onChange={(next) => setProjects(projects.map((x) => (x.id === p.id ? next : x)))}
                  onDuplicate={() => duplicate(p)}
                  onDelete={() => remove(p)}
                />
              )}
            </div>
          ))}
          {projects.length === 0 && (
            <p className="font-mono text-[10px] text-text-muted">No projects — add your first one.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}

function ProjectEditor({ project, onChange, onDuplicate, onDelete }) {
  const p = project;
  const set = (key, value) => onChange({ ...p, [key]: value });
  const [csJson, setCsJson] = useState(() => JSON.stringify(p.caseStudy || {}, null, 2));
  const [csError, setCsError] = useState(null);
  const [showCaseStudy, setShowCaseStudy] = useState(false);

  const applyCaseStudy = (text) => {
    setCsJson(text);
    try {
      const parsed = JSON.parse(text);
      onChange({ ...p, caseStudy: parsed });
      setCsError(null);
    } catch (err) {
      setCsError(err.message);
    }
  };

  return (
    <div className="border-t border-border-subtle p-4 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput label="Title" value={p.title || ""} onChange={(e) => set("title", e.target.value)} />
        <TextInput label="Subtitle" value={p.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} />
        <TextInput label="Tagline" value={p.tagline || ""} onChange={(e) => set("tagline", e.target.value)} />
        <TextInput label="Badge label" value={p.badge || ""} onChange={(e) => set("badge", e.target.value)} placeholder="Live · Client Project" />
        <TextInput label="Date" value={p.date || ""} onChange={(e) => set("date", e.target.value)} placeholder="May 2026" />
        <TextInput label="Number label" value={p.num || ""} onChange={(e) => set("num", e.target.value)} placeholder="01" />
        <TextInput label="Live URL" value={p.live || ""} onChange={(e) => set("live", e.target.value)} placeholder="https://…" />
        <TextInput label="GitHub URL" value={p.github || ""} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/…" />
        <TextInput label="Accent color (hex)" value={p.accentHex || ""} onChange={(e) => set("accentHex", e.target.value)} placeholder="#818cf8" />
      </div>

      <TextArea label="Description" rows={3} value={p.description || ""} onChange={(e) => set("description", e.target.value)} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Tech stack">
          <ListEditor value={p.stack || []} onChange={(v) => set("stack", v)} placeholder="React" addLabel="+ Add tech" />
        </Field>
        <Field label="Features">
          <ListEditor value={p.features || []} onChange={(v) => set("features", v)} placeholder="Authentication" addLabel="+ Add feature" />
        </Field>
        <Field label="Screenshots" hint="Files in public/screenshots/ — e.g. farooq-home.webp">
          <ListEditor value={p.screenshots || []} onChange={(v) => set("screenshots", v)} placeholder="screenshot.png" addLabel="+ Add screenshot" />
        </Field>
        <Field label="Impact bullets">
          <ListEditor value={p.impact || []} onChange={(v) => set("impact", v)} placeholder="Digitized …" addLabel="+ Add bullet" />
        </Field>
      </div>

      <Field label="Feature details (long-form)">
        <ListEditor value={p.details || []} onChange={(v) => set("details", v)} placeholder="PROJECT OVERVIEW: …" addLabel="+ Add detail" />
      </Field>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Case study (JSON)</span>
          <button
            type="button"
            onClick={() => setShowCaseStudy(!showCaseStudy)}
            className="font-mono text-[10px] text-accent-indigo hover:text-accent-cyan transition-colors"
          >
            {showCaseStudy ? "Hide" : "Edit JSON"}
          </button>
        </div>
        {showCaseStudy && (
          <>
            <textarea
              value={csJson}
              onChange={(e) => applyCaseStudy(e.target.value)}
              rows={12}
              spellCheck={false}
              aria-label="Case study JSON"
              className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-3 font-mono text-[11px] text-text-primary resize-y focus:outline-none focus:border-accent-indigo/60"
            />
            <p className={`font-mono text-[10px] mt-1.5 ${csError ? "text-red-400" : "text-text-muted"}`}>
              {csError ? `Invalid JSON — ${csError}` : "Shape: { problem, approach[], outcome[], metrics[{value,label}] }"}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Btn variant="ghost" onClick={onDuplicate}>Duplicate</Btn>
        <ConfirmBtn
          onConfirm={onDelete}
          className="font-mono text-[10px] text-red-400 border border-red-400/30 px-3 py-2 rounded-xl hover:bg-red-400/10 transition-all"
          confirmLabel="Delete project?"
        >
          Delete
        </ConfirmBtn>
        <span className="font-mono text-[10px] text-text-muted">Edits apply live — persist with “Save projects” above.</span>
      </div>
    </div>
  );
}
