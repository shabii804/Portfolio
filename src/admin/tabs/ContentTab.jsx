// ─────────────────────────────────────────────────────────────────────────────
// Content — personal info editor (identity, hero roles, bio, links, files).
// Saving runs through AdminApp.saveContent → PUT /api/content { personal }.
// The AI chatbot's fact sheet re-derives from this data automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Btn, Field, Panel, TextArea, TextInput, Toggle, ListEditor } from "../ui.jsx";

export default function ContentTab({ content, saveContent }) {
  // Local draft state; the parent remounts this editor (key = meta.updatedAt)
  // after every save, which re-syncs the form without an effect.
  const [form, setForm] = useState(() => ({ ...(content?.personal || {}) }));
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(content?.personal || {});

  const save = async () => {
    setSaving(true);
    try {
      await saveContent({ personal: form }, "Personal info");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Panel
        title="Personal info"
        desc="Shown in the hero, navbar, footer, contact section and the AI chatbot's answers."
        actions={
          <Btn onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save personal info" : "✓ Saved"}
          </Btn>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <TextInput label="Full name" value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Shoaib Arshad" />
          <TextInput label="Job title" value={form.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Full Stack Developer" />
          <TextInput label="Email" type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
          <TextInput label="Phone / WhatsApp" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="03001234567" />
          <TextInput label="Location" value={form.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="Islamabad, Pakistan" />
          <TextInput
            label="LinkedIn URL"
            value={form.linkedin || ""}
            onChange={(e) => set("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
          <TextInput
            label="GitHub URL"
            value={form.github || ""}
            onChange={(e) => set("github", e.target.value)}
            placeholder="https://github.com/…"
          />
          <TextInput label="Slack URL" value={form.slack || ""} onChange={(e) => set("slack", e.target.value)} placeholder="https://slack.com/…" />
        </div>

        <div className="mt-4">
          <TextArea
            label="Bio"
            rows={4}
            value={form.bio || ""}
            onChange={(e) => set("bio", e.target.value)}
            hint="Short paragraph shown in the About section and quoted by the chatbot."
          />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4 items-start">
          <div>
            <Field label="Typewriter roles (hero)">
              <ListEditor
                value={form.roles || []}
                onChange={(v) => set("roles", v.filter(Boolean))}
                placeholder="Full Stack Developer"
                addLabel="+ Add role"
              />
            </Field>
          </div>
          <div className="space-y-4">
            <TextInput label="Profile picture path" value={form.profilePic || ""} onChange={(e) => set("profilePic", e.target.value)} hint="Place the image in public/ then reference it like /profile.jpeg" />
            <TextInput label="Resume PDF path" value={form.resumePdf || ""} onChange={(e) => set("resumePdf", e.target.value)} hint="Place the file in public/ then reference it like /resume.pdf" />
            <Toggle checked={Boolean(form.available)} onChange={(v) => set("available", v)} label="Available for work" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Btn onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save personal info"}</Btn>
          {dirty && <span className="font-mono text-[10px] text-amber-400">Unsaved changes</span>}
        </div>
      </Panel>
    </div>
  );
}
