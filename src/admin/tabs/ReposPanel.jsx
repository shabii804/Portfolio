// ─────────────────────────────────────────────────────────────────────────────
// ReposPanel (v34) — admin controls for the GitHub-synced section of /projects.
//
//   · Pin    → repo floats to the top of the archive (settings.pinnedRepos)
//   · Hide   → repo is removed from the public site (settings.hiddenRepos)
//   · Display→ override the auto-generated title / description
//              (settings.repoOverrides, keyed by repo name)
//
// Persisted through saveContent({ settings }) — the API merges settings
// per-field, so sending these three keys never touches the site toggles.
// Repos that are already curated case studies are listed but locked: the
// synced section skips them, so pin/hide would be a silent no-op.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { useGithubRepos } from "../../hooks/useGithubRepos";
import { LANG_HEX } from "../../data/githubRepos";
import { Badge, Btn, Field, Panel, TextInput } from "../ui.jsx";

const PinIcon = ({ active }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 17v5" />
    <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1" />
  </svg>
);

export default function ReposPanel({ content, saveContent }) {
  const { repos: ghRaw, stale } = useGithubRepos();

  // Drafts — the parent remounts this panel (key = meta.updatedAt) after each
  // save, so state here always starts from the canonical content. The snapshot
  // captured by the one-shot initializer is also the dirty-comparison baseline.
  const [initial] = useState(() => {
    const s = content?.settings || {};
    return {
      pinnedRepos: Array.isArray(s.pinnedRepos) ? [...s.pinnedRepos] : [],
      hiddenRepos: Array.isArray(s.hiddenRepos) ? [...s.hiddenRepos] : [],
      repoOverrides: s.repoOverrides && typeof s.repoOverrides === "object" ? { ...s.repoOverrides } : {},
    };
  });
  const [pinned, setPinned] = useState(initial.pinnedRepos);
  const [hidden, setHidden] = useState(initial.hiddenRepos);
  const [overrides, setOverrides] = useState(initial.repoOverrides);
  const [editing, setEditing] = useState(null); // repo name with the display editor open
  const [saving, setSaving] = useState(false);

  const dirty =
    JSON.stringify({ pinnedRepos: pinned, hiddenRepos: hidden, repoOverrides: overrides }) !==
    JSON.stringify(initial);

  // Repos already presented as curated case studies (matched by GitHub URL).
  const curatedNames = useMemo(() => {
    const set = new Set();
    for (const p of content?.projects || []) {
      const name = (p.github || "").replace(/\/$/, "").split("/").pop();
      if (name) set.add(name.toLowerCase());
    }
    return set;
  }, [content?.projects]);

  const toggleIn = (list, setList, name) =>
    setList(list.includes(name) ? list.filter((n) => n !== name) : [...list, name]);

  const setOverride = (name, key, value) => {
    const prev = overrides[name] || {};
    const next = { ...prev, [key]: value };
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v && String(v).trim()));
    setOverrides({ ...overrides, [name]: cleaned });
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveContent(
        { settings: { pinnedRepos: pinned, hiddenRepos: hidden, repoOverrides: overrides } },
        "GitHub archive"
      );
    } finally {
      setSaving(false);
    }
  };

  // Orphaned settings — repo names saved earlier that are no longer in the
  // live list (renamed / deleted on GitHub). Surfaced so they never rot silently.
  const liveNames = useMemo(() => new Set(ghRaw.map((r) => r?.name).filter(Boolean)), [ghRaw]);
  const orphans = useMemo(() => {
    const keys = new Set([
      ...initial.pinnedRepos,
      ...initial.hiddenRepos,
      ...Object.keys(initial.repoOverrides),
    ]);
    return [...keys].filter((n) => !liveNames.has(n));
  }, [initial, liveNames]);

  const overrideCount = Object.values(initial.repoOverrides).filter(
    (o) => o && (o.title || o.description)
  ).length;

  return (
    <Panel
      title="GitHub archive"
      desc="The synced repo cards on /projects. Pin a repo to float it to the top, hide one you don't want public, or fix its auto-generated title."
      actions={
        <>
          <Btn onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save archive"}</Btn>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge tone={pinned.length ? "amber" : "muted"}>{pinned.length} pinned</Badge>
        <Badge tone={hidden.length ? "red" : "muted"}>{hidden.length} hidden</Badge>
        <Badge tone={overrideCount ? "indigo" : "muted"}>{overrideCount} retitled</Badge>
        {dirty && <span className="font-mono text-[10px] text-amber-400">Unsaved changes — hit “Save archive”.</span>}
      </div>

      {stale && (
        <p className="font-mono text-[10px] text-text-muted mb-3">
          Showing the last synced repo list (GitHub API rate-limited right now) — saves still work by name.
        </p>
      )}

      {orphans.length > 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 mb-4">
          <p className="font-mono text-[10px] text-amber-400 mb-1.5">
            Saved for repos no longer on GitHub — harmless, but you can clean them up:
          </p>
          <div className="flex flex-wrap gap-2">
            {orphans.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setPinned(pinned.filter((x) => x !== n));
                  setHidden(hidden.filter((x) => x !== n));
                  const rest = { ...overrides };
                  delete rest[n];
                  setOverrides(rest);
                }}
                className="font-mono text-[10px] text-text-muted border border-border-mid rounded-lg px-2 py-1 hover:text-red-400 hover:border-red-400/40 transition-colors"
                title="Remove this stale setting"
              >
                {n} ✕
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {ghRaw.map((r) => {
          const name = r?.name;
          if (!name) return null;
          const isCurated = curatedNames.has(name.toLowerCase());
          const isPinned = pinned.includes(name);
          const isHidden = hidden.includes(name);
          const ov = overrides[name] || {};
          const lang = r.language || "Code";
          return (
            <div key={name} className={`rounded-xl bg-bg-primary border p-3 ${isHidden ? "border-red-500/20 opacity-70" : "border-border-subtle"}`}>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LANG_HEX[lang] || "#818cf8" }} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-medium text-sm text-text-primary truncate">
                    {ov.title?.trim() || name}
                    {ov.title?.trim() && <span className="ml-2 font-mono text-[10px] text-text-muted">{name}</span>}
                  </div>
                  <div className="font-mono text-[10px] text-text-muted truncate">
                    {lang} · ★ {r.stargazers_count ?? 0}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isCurated ? (
                    <Badge tone="muted">Case study</Badge>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleIn(pinned, setPinned, name)}
                        aria-pressed={isPinned}
                        aria-label={`${isPinned ? "Unpin" : "Pin"} ${name}`}
                        title={isPinned ? "Pinned — click to unpin" : "Pin to the top of /projects"}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[10px] transition-all ${
                          isPinned
                            ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
                            : "text-text-muted border-border-mid hover:text-amber-400 hover:border-amber-500/40"
                        }`}
                      >
                        <PinIcon active={isPinned} /> Pin
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleIn(hidden, setHidden, name)}
                        aria-pressed={isHidden}
                        aria-label={`${isHidden ? "Unhide" : "Hide"} ${name}`}
                        title={isHidden ? "Hidden from the site — click to restore" : "Hide from the public site"}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-lg border font-mono text-[10px] transition-all ${
                          isHidden
                            ? "text-red-400 border-red-500/40 bg-red-500/10"
                            : "text-text-muted border-border-mid hover:text-red-400 hover:border-red-500/40"
                        }`}
                      >
                        {isHidden ? "Hidden" : "Hide"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(editing === name ? null : name)}
                        aria-expanded={editing === name}
                        aria-label={`Display settings for ${name}`}
                        className="btn-ghost px-2.5 py-1.5 rounded-lg font-mono text-[10px]"
                      >
                        {editing === name ? "Close" : ov.title || ov.description ? "Display ✓" : "Display"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editing === name && !isCurated && (
                <div className="border-t border-border-subtle mt-3 pt-3 space-y-3">
                  <TextInput
                    label={`Display title (default: auto from “${name}”)`}
                    value={ov.title || ""}
                    onChange={(e) => setOverride(name, "title", e.target.value)}
                    placeholder="Leave empty to keep the auto title"
                    aria-label={`Display title for ${name}`}
                  />
                  <Field label="Display description" hint="Overrides the repo's GitHub description on the card.">
                    <TextInput
                      value={ov.description || ""}
                      onChange={(e) => setOverride(name, "description", e.target.value)}
                      placeholder="Leave empty to keep the GitHub description"
                      aria-label={`Display description for ${name}`}
                    />
                  </Field>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="font-mono text-[10px] text-text-muted mt-4">
        Saves go live instantly with Supabase, or in ~1 minute via the GitHub rebuild. Pinned curated
        projects (managed above) always lead the archive, pinned repos follow.
      </p>
    </Panel>
  );
}
