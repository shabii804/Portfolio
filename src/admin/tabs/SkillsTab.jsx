// ─────────────────────────────────────────────────────────────────────────────
// Skills & Journey — three structured editors:
//   • Skills        (object: category → string[])
//   • Experience    (array: role/company/duration/type/points[])
//   • Journey       (array: year/period/title/place/tag/description)
// Each panel saves its own section via PUT /api/content.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Btn, Field, ListEditor, Panel, TextInput } from "../ui.jsx";

const inputCls =
  "w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo/60 transition-colors";

export default function SkillsTab({ content, saveContent }) {
  return (
    <div className="space-y-6">
      <SkillsEditor content={content} saveContent={saveContent} />
      <ExperienceEditor content={content} saveContent={saveContent} />
      <JourneyEditor content={content} saveContent={saveContent} />
    </div>
  );
}

// ── Skills ───────────────────────────────────────────────────────────────────
function SkillsEditor({ content, saveContent }) {
  // Draft state; parent remounts (key = meta.updatedAt) after each save.
  const [rows, setRows] = useState(() =>
    Object.entries(content?.skills || {}).map(([cat, items]) => ({ cat, items: [...items] }))
  );
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(rows) !== JSON.stringify(Object.entries(content?.skills || {}).map(([cat, items]) => ({ cat, items: [...items] })));

  const save = async () => {
    setSaving(true);
    const skills = {};
    rows.forEach(({ cat, items }) => {
      const key = cat.trim();
      if (key) skills[key] = items.map((s) => s.trim()).filter(Boolean);
    });
    try {
      await saveContent({ skills }, "Skills");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Skills"
      desc="Skill groups rendered in the Skills section and quoted by the chatbot."
      actions={<Btn onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save skills"}</Btn>}
    >
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-3">
            <div className="flex gap-2">
              <input
                value={row.cat}
                onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, cat: e.target.value } : r)))}
                placeholder="Category name"
                aria-label={`Category ${i + 1} name`}
                className={`${inputCls} font-mono text-xs !py-2 flex-1`}
              />
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, j) => j !== i))}
                className="font-mono text-[10px] px-3 rounded-lg border border-border-mid text-text-muted hover:text-red-400 hover:border-red-400/40 transition-colors"
              >
                Remove
              </button>
            </div>
            <ListEditor
              value={row.items}
              onChange={(items) => setRows(rows.map((r, j) => (j === i ? { ...r, items } : r)))}
              placeholder="React.js"
              addLabel="+ Add skill"
            />
          </div>
        ))}
        <Btn variant="ghost" onClick={() => setRows([...rows, { cat: "", items: [] }])}>+ Add category</Btn>
      </div>
    </Panel>
  );
}

// ── Experience ───────────────────────────────────────────────────────────────
function ExperienceEditor({ content, saveContent }) {
  const [rows, setRows] = useState(() =>
    (content?.experience || []).map((e) => ({ ...e, points: [...(e.points || [])] }))
  );
  const [saving, setSaving] = useState(false);

  const dirty =
    JSON.stringify(rows) !==
    JSON.stringify((content?.experience || []).map((e) => ({ ...e, points: [...(e.points || [])] })));

  const set = (i, key, value) => setRows(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  const save = async () => {
    setSaving(true);
    try {
      await saveContent({ experience: rows }, "Experience");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Experience"
      desc="Roles rendered in the About/experience blocks and grounded into the chatbot."
      actions={<Btn onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save experience"}</Btn>}
    >
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Role {i + 1}</span>
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, j) => j !== i))}
                className="font-mono text-[10px] text-text-muted hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <TextInput label="Role" value={row.role || ""} onChange={(e) => set(i, "role", e.target.value)} />
              <TextInput label="Company" value={row.company || ""} onChange={(e) => set(i, "company", e.target.value)} />
              <TextInput label="Duration" value={row.duration || ""} onChange={(e) => set(i, "duration", e.target.value)} placeholder="Mar 2023 – Apr 2026" />
              <TextInput label="Type" value={row.type || ""} onChange={(e) => set(i, "type", e.target.value)} placeholder="Remote · Certified" />
            </div>
            <Field label="Highlights">
              <ListEditor value={row.points || []} onChange={(v) => set(i, "points", v)} placeholder="Built …" addLabel="+ Add point" />
            </Field>
          </div>
        ))}
        <Btn variant="ghost" onClick={() => setRows([...rows, { role: "", company: "", duration: "", type: "", points: [] }])}>
          + Add role
        </Btn>
      </div>
    </Panel>
  );
}

// ── Journey ──────────────────────────────────────────────────────────────────
function JourneyEditor({ content, saveContent }) {
  const [rows, setRows] = useState(() => (content?.journey || []).map((j) => ({ ...j })));
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(rows) !== JSON.stringify(content?.journey || []);

  const set = (i, key, value) => setRows(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  const move = (i, dir) => {
    const next = [...rows];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveContent({ journey: rows }, "Journey");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Journey timeline"
      desc="Milestones rendered in the Journey section, in order."
      actions={<Btn onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save journey"}</Btn>}
    >
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Milestone {i + 1}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="font-mono text-xs text-text-muted hover:text-accent-indigo disabled:opacity-30 px-1">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" className="font-mono text-xs text-text-muted hover:text-accent-indigo disabled:opacity-30 px-1">↓</button>
                <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="font-mono text-[10px] text-text-muted hover:text-red-400 transition-colors ml-1">Remove</button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <TextInput label="Year" value={row.year || ""} onChange={(e) => set(i, "year", e.target.value)} placeholder="2026" />
              <TextInput label="Period" value={row.period || ""} onChange={(e) => set(i, "period", e.target.value)} placeholder="May 2026" />
              <TextInput label="Tag" value={row.tag || ""} onChange={(e) => set(i, "tag", e.target.value)} placeholder="Client Work" />
              <TextInput label="Place" value={row.place || ""} onChange={(e) => set(i, "place", e.target.value)} placeholder="farooqagensies.com" />
            </div>
            <TextInput label="Title" value={row.title || ""} onChange={(e) => set(i, "title", e.target.value)} />
            <TextInput label="Description" value={row.description || ""} onChange={(e) => set(i, "description", e.target.value)} />
          </div>
        ))}
        <Btn
          variant="ghost"
          onClick={() => setRows([...rows, { year: "", period: "", title: "", place: "", tag: "", description: "" }])}
        >
          + Add milestone
        </Btn>
      </div>
    </Panel>
  );
}
