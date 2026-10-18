// ─────────────────────────────────────────────────────────────────────────────
// Certificates — CRUD over the certificates array shown on /certificates.
// Each entry: title, issuer, date, credentialId, verification URL, image
// (upload or URL), description, skills and a featured flag. "Save
// certificates" persists via PUT /api/content { certificates } — same
// pipeline as Projects & Services.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { useLocalMediaSrc } from "../../data/localMedia";
import { maxUploadMb, uploadMedia } from "../media.js";
import { Badge, Btn, ConfirmBtn, Field, ListEditor, Panel, Spinner, TextInput, Toggle, inputCls } from "../ui.jsx";

const newId = () => `cert-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const blank = () => ({
  id: newId(),
  title: "New certificate",
  issuer: "",
  date: "",
  credentialId: "",
  url: "",
  image: "",
  description: "",
  skills: [],
  featured: false,
});

export default function CertificatesTab({ content, saveContent, notify }) {
  const [certs, setCerts] = useState(() => (content?.certificates || []).map((c) => ({ ...c })));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(certs) !== JSON.stringify(content?.certificates || []);

  const save = async () => {
    setSaving(true);
    try {
      await saveContent({ certificates: certs }, "Certificates");
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const move = (i, dir) => {
    const next = [...certs];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setCerts(next);
  };

  const add = () => {
    const c = blank();
    setCerts([...certs, c]);
    setEditingId(c.id);
  };

  const remove = (c) => setCerts(certs.filter((x) => x.id !== c.id));

  return (
    <div className="space-y-4">
      <Panel
        title="Certificates"
        desc="Everything on the /certificates page — certifications, courses and official completions. Upload the certificate image and visitors see it right on the card."
        actions={
          <>
            <Btn onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save certificates"}</Btn>
            <Btn variant="ghost" onClick={add}>+ Add</Btn>
          </>
        }
      >
        {dirty && (
          <p className="font-mono text-[10px] text-amber-400 mb-4">
            Unsaved changes — remember to hit “Save certificates”.
          </p>
        )}
        <div className="space-y-3">
          {certs.map((c, i) => (
            <div key={c.id} className="rounded-xl bg-bg-primary border border-border-subtle">
              <div className="flex items-center gap-3 p-4">
                <CertThumb src={c.image} title={c.title} small />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-medium text-sm text-text-primary truncate">{c.title}</div>
                  <div className="font-mono text-[10px] text-text-muted truncate">
                    {[c.issuer, c.date].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {c.featured && <Badge tone="indigo">featured</Badge>}
                  {c.image ? <Badge tone="green">image</Badge> : <Badge tone="muted">no image</Badge>}
                  {c.url && <Badge tone="cyan">verify link</Badge>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${c.title} up`} className="font-mono text-xs text-text-muted hover:text-accent-indigo disabled:opacity-30 px-1">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === certs.length - 1} aria-label={`Move ${c.title} down`} className="font-mono text-xs text-text-muted hover:text-accent-indigo disabled:opacity-30 px-1">↓</button>
                  <button type="button" onClick={() => setEditingId(editingId === c.id ? null : c.id)} className="btn-ghost px-3 py-1.5 rounded-lg font-mono text-[10px]">
                    {editingId === c.id ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {editingId === c.id && (
                <CertEditor cert={c} onChange={(next) => setCerts(certs.map((x) => (x.id === c.id ? next : x)))} onDelete={() => remove(c)} notify={notify} />
              )}
            </div>
          ))}
          {certs.length === 0 && (
            <p className="font-mono text-[10px] text-text-muted">No certificates — add your first one.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}

// Tiny thumbnail used in the collapsed list rows (uploads/idb resolve).
function CertThumb({ src, title, small = false }) {
  const resolved = useLocalMediaSrc(src);
  const box = small ? "w-11 h-8" : "w-full aspect-[4/3]";
  if (!resolved) {
    return (
      <span
        className={`${box} shrink-0 rounded-lg border border-border-subtle bg-bg-card grid place-items-center font-mono text-[9px] text-text-muted`}
        aria-hidden="true"
      >
        {small ? "—" : "no image"}
      </span>
    );
  }
  return (
    <img
      src={resolved}
      alt={`${title} certificate`}
      className={`${box} shrink-0 rounded-lg border border-border-subtle object-cover`}
      loading="lazy"
    />
  );
}

function CertEditor({ cert, onChange, onDelete, notify }) {
  const c = cert;
  const set = (key, value) => onChange({ ...c, [key]: value });
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const resolved = useLocalMediaSrc(c.image);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy) return;
    const cap = maxUploadMb();
    if (file.size > cap * 1024 * 1024) {
      notify?.(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${cap} MB.`, "err");
      return;
    }
    setBusy(true);
    try {
      const res = await uploadMedia(file);
      set("image", res.path);
      notify?.(res.message || `Uploaded ${file.name}`, "info");
    } catch (err) {
      notify?.(err.message || "Upload failed", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-border-subtle p-4 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput label="Title" value={c.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="C++ Programming Certificate" />
        <TextInput label="Issuer" value={c.issuer || ""} onChange={(e) => set("issuer", e.target.value)} placeholder="Cisco Networking Academy" />
        <TextInput label="Date" value={c.date || ""} onChange={(e) => set("date", e.target.value)} placeholder="Mar 2024" hint="Shown on the card — any format you like" />
        <TextInput label="Credential ID" value={c.credentialId || ""} onChange={(e) => set("credentialId", e.target.value)} placeholder="e.g. 9f3k2-XXXX" hint="Optional — hidden if left empty" />
        <TextInput label="Verification URL" value={c.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://credly.com/…" hint="Optional — adds a “Verify credential” button" />
        <Field label="Featured" hint="Featured certificates show a highlighted badge and sort first on the page.">
          <div className="pt-1.5">
            <Toggle checked={!!c.featured} onChange={(v) => set("featured", v)} label="Featured on /certificates" />
          </div>
        </Field>
      </div>

      <Field label="Certificate image" hint="Upload the scan/screenshot, or paste an /uploads/… or https://… URL. Cards look best with a landscape image.">
        <div className="flex gap-2">
          <input
            value={c.image || ""}
            onChange={(e) => set("image", e.target.value)}
            placeholder="/uploads/certificate.jpg or https://…"
            spellCheck={false}
            className={`${inputCls} flex-1 !py-2 font-mono text-xs`}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="shrink-0 px-3.5 rounded-xl border border-accent-indigo/30 bg-accent-indigo/10 text-accent-indigo font-mono text-xs hover:bg-accent-indigo/20 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            {busy ? <Spinner className="!w-3 !h-3" /> : "↑"} Upload
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} aria-hidden="true" tabIndex={-1} />
        </div>
        <div className="mt-3 grid grid-cols-[128px_1fr] gap-3 items-start">
          <CertThumb src={c.image} title={c.title} />
          {resolved && (
            <p className="font-mono text-[10px] text-text-muted leading-relaxed">
              Preview above — the public card shows this image in a 4:3 frame with a zoom-on-hover.
              Remove the URL to fall back to the designed placeholder.
            </p>
          )}
        </div>
      </Field>

      <Field label="Description">
        <textarea
          value={c.description || ""}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="What this certificate validates…"
          className={`${inputCls} resize-y leading-relaxed`}
        />
      </Field>

      <Field label="Skills — one per row, shown as chips">
        <ListEditor value={c.skills || []} onChange={(v) => set("skills", v)} placeholder="C++" addLabel="+ Add skill" />
      </Field>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <ConfirmBtn
          onConfirm={onDelete}
          className="font-mono text-[10px] text-red-400 border border-red-400/30 px-3 py-2 rounded-xl hover:bg-red-400/10 transition-all"
          confirmLabel="Delete certificate?"
        >
          Delete
        </ConfirmBtn>
        <span className="font-mono text-[10px] text-text-muted">Edits apply live — persist with “Save certificates” above.</span>
      </div>
    </div>
  );
}
