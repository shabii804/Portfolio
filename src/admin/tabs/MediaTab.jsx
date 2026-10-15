// ─────────────────────────────────────────────────────────────────────────────
// Hero & Media — manage the hero section background from the admin panel:
//
//   • switch between video / static image / off
//   • upload new clips, posters and images (≤3 MB, lands in /uploads/ on the
//     repo → Vercel rebuild serves them from the CDN)
//   • or paste any external URL
//   • tune the frame: object position, dark overlay strength, grain, vignette
//   • live preview of the composition before saving
//
// Saves via the central PUT /api/content ("media" section, deep-merged).
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { api } from "../api.js";
import { Badge, Btn, Field, Panel, Spinner, Toggle, inputCls } from "../ui.jsx";

const MAX_MB = 3;

const DEFAULTS = {
  enabled: true,
  type: "video",
  desktop: "/hero-video.mp4",
  webm: "/hero.webm",
  mobile: "/hero-mobile.mp4",
  poster: "/hero-poster.jpg",
  image: "",
  objectPosition: "center 30%",
  scrim: 1,
  grain: true,
  vignette: true,
};

const PRESET_POSITIONS = ["center 30%", "center center", "center 50%", "center 70%", "left center", "right center"];

export default function MediaTab({ content, saveContent, notify }) {
  const [draft, setDraft] = useState({ ...DEFAULTS, ...(content?.media?.heroBackground ?? {}) });
  const [busy, setBusy] = useState(false);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const onNotify = (msg, kind) => notify?.(msg, kind);

  const save = async () => {
    setBusy(true);
    try {
      await saveContent({ media: { heroBackground: draft } }, "Hero background");
    } catch {
      /* toast already shown by saveContent */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Live preview ─────────────────────────────────────────────────── */}
      <Panel
        title="Live preview"
        desc="Roughly what visitors see behind the hero copy — the real page applies the scroll exit choreography."
        actions={<Badge tone={draft.enabled ? "green" : "amber"}>{draft.enabled ? "background on" : "background off"}</Badge>}
      >
        <HeroPreview draft={draft} />
      </Panel>

      {/* ── Source ───────────────────────────────────────────────────────── */}
      <Panel title="Background source" desc="Video for the cinematic clip, image for a still frame — or turn the whole layer off.">
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <Toggle checked={draft.enabled} onChange={(v) => set("enabled", v)} label="Background enabled" />
          <div className="flex gap-1 bg-bg-primary border border-border-subtle rounded-xl p-1">
            {[
              ["video", "▶ Video"],
              ["image", "▣ Image"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => set("type", val)}
                aria-pressed={draft.type === val}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  (draft.type || "video") === val
                    ? "bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/25"
                    : "text-text-muted hover:text-text-secondary border border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!draft.enabled ? (
          <p className="font-body text-xs text-text-muted leading-relaxed">
            The hero falls back to the plain themed background — copy, stats and marquee stay exactly where they are.
          </p>
        ) : draft.type === "video" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <MediaField
              label="Desktop video (MP4)"
              hint="Main clip shown on laptops/desktops."
              accept="video/mp4"
              value={draft.desktop}
              onChange={(v) => set("desktop", v)}
              onNotify={onNotify}
            />
            <MediaField
              label="Desktop video (WebM, optional)"
              hint="VP9 cut — smaller at equal quality, served first on desktop."
              accept="video/webm"
              value={draft.webm}
              onChange={(v) => set("webm", v)}
              onNotify={onNotify}
            />
            <MediaField
              label="Mobile video (MP4)"
              hint="Lighter cut for phones — keeps mobile data sane."
              accept="video/mp4"
              value={draft.mobile}
              onChange={(v) => set("mobile", v)}
              onNotify={onNotify}
            />
            <MediaField
              label="Poster image"
              hint="Shown until the video plays (and to reduced-motion / Data-Saver visitors)."
              accept="image/jpeg,image/png,image/webp,image/avif"
              value={draft.poster}
              onChange={(v) => set("poster", v)}
              onNotify={onNotify}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <MediaField
              label="Background image"
              hint="Static frame — gets the same crop, grade and drift as the video."
              accept="image/jpeg,image/png,image/webp,image/avif"
              value={draft.image}
              onChange={(v) => set("image", v)}
              onNotify={onNotify}
            />
            <MediaField
              label="Fallback poster"
              hint="Used if the image field above is left empty."
              accept="image/jpeg,image/png,image/webp,image/avif"
              value={draft.poster}
              onChange={(v) => set("poster", v)}
              onNotify={onNotify}
            />
          </div>
        )}
        <p className="font-mono text-[10px] text-text-muted mt-4 leading-relaxed">
          Uploads: up to {MAX_MB} MB per file (Vercel request limit) — they commit to <code>public/uploads/</code> and go
          live after the automatic redeploy (~1 min). Larger clips: compress to H.264/VP9 first, or paste a URL.
        </p>
      </Panel>

      {/* ── Framing ──────────────────────────────────────────────────────── */}
      <Panel title="Framing & film look" desc="Crop focus and the cinematic layers pressed over the footage.">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Object position" hint="Where the subject sits in the crop — e.g. “center 30%” keeps a face on the upper third.">
            <input
              value={draft.objectPosition}
              onChange={(e) => set("objectPosition", e.target.value)}
              placeholder="center 30%"
              className={`${inputCls} !py-2 font-mono text-xs`}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set("objectPosition", p)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] border transition-all ${
                    draft.objectPosition === p
                      ? "border-accent-indigo/40 text-accent-indigo bg-accent-indigo/10"
                      : "border-border-mid text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Dark overlay strength — ${Math.round((Number(draft.scrim) || 0) * 100)}%`} hint="Legibility scrims over the footage. 100% = tuned default, 0% = raw footage, 150% = very dark.">
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={Number(draft.scrim) || 0}
              onChange={(e) => set("scrim", Number(e.target.value))}
              className="w-full accent-[#818cf8] mt-2"
              aria-label="Dark overlay strength"
            />
            <div className="flex flex-wrap gap-6 mt-4">
              <Toggle checked={draft.grain !== false} onChange={(v) => set("grain", v)} label="Film grain" />
              <Toggle checked={draft.vignette !== false} onChange={(v) => set("vignette", v)} label="Vignette" />
            </div>
          </Field>
        </div>
      </Panel>

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Btn onClick={save} disabled={busy}>
          {busy ? <><Spinner className="!w-3.5 !h-3.5" /> Saving…</> : "Save hero background"}
        </Btn>
        <span className="font-mono text-[10px] text-text-muted">
          Saves commit → Vercel redeploys → live in ~1 min.
        </span>
      </div>
    </div>
  );
}

// ── URL field with upload button ───────────────────────────────────────────────
function MediaField({ label, hint, value, onChange, accept, onNotify }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file || busy) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      onNotify(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_MB} MB. Compress it first.`, "err");
      return;
    }
    setBusy(true);
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",").pop() || "");
        reader.onerror = () => reject(new Error("Could not read the file"));
        reader.readAsDataURL(file);
      });
      const res = await api("/api/upload", { method: "POST", body: { name: file.name, data } });
      onChange(res.path);
      onNotify(res.message || `Uploaded ${file.name}`, "info");
    } catch (err) {
      onNotify(err.message || "Upload failed", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/… or https://…"
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
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={pick} aria-hidden="true" tabIndex={-1} />
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${value.startsWith("/uploads/") ? "bg-emerald-400" : "bg-accent-cyan"}`} aria-hidden="true" />
          <span className="font-mono text-[10px] text-text-muted">
            {value.startsWith("/uploads/") ? "uploaded file" : value.startsWith("http") ? "external URL" : "bundled file"}
          </span>
        </div>
      )}
    </Field>
  );
}

// ── Mini hero composition preview ──────────────────────────────────────────────
function HeroPreview({ draft }) {
  const scrim = Math.max(0, Math.min(1.5, Number(draft.scrim) || 0));
  const pos = draft.objectPosition || "center 30%";
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-border-subtle bg-[#05060f]">
      {draft.enabled ? (
        <>
          {draft.type === "video" ? (
            <video
              key={draft.desktop || "none"}
              src={draft.desktop || undefined}
              poster={draft.poster || undefined}
              muted
              loop
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: pos }}
            />
          ) : (
            <img
              key={draft.image || draft.poster || "none"}
              src={draft.image || draft.poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: pos }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,6,15,0.86) 0%, rgba(5,6,15,0.62) 32%, rgba(5,6,15,0.12) 64%, rgba(5,6,15,0.32) 100%), radial-gradient(ellipse 120% 85% at 50% 118%, rgba(5,6,15,0.55) 0%, transparent 58%)",
              opacity: scrim,
            }}
          />
          {draft.grain !== false && <div className="hero-grain" aria-hidden="true" />}
          {draft.vignette !== false && <div className="hero-vignette" aria-hidden="true" />}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">background off</span>
        </div>
      )}

      {/* Fake hero copy so the crop/legibility balance reads correctly */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 max-w-[60%] pointer-events-none">
        <div className="h-1.5 w-16 rounded-full bg-accent-indigo/50 mb-2.5" />
        <div className="font-display font-bold text-white text-lg leading-tight drop-shadow">Shoaib Arshad.</div>
        <div className="font-mono text-[9px] text-white/60 mt-1.5">Full Stack Web Developer ▊</div>
      </div>
      {draft.enabled && (
        <div className="absolute bottom-2.5 right-3 font-mono text-[9px] text-white/40 pointer-events-none">
          {draft.type === "video" ? "video · preview loops muted" : "image"}
        </div>
      )}
    </div>
  );
}
