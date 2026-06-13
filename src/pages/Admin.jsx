import { useState } from "react";
import { PortfolioProvider, usePortfolio } from "../context/PortfolioContext";
import "../index.css";

// ── Claude AI Assistant ────────────────────────────────────────────────────────
function AIAssistant({ context, onApply }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are a portfolio writing assistant for ${context.name}, a Software Engineering student with CGPA 4.0. 
You help improve project descriptions, bio text, and portfolio copy. 
Keep tone professional yet personable. Be concise and impactful.
Current portfolio data: ${JSON.stringify(context)}
If the user asks you to rewrite something, provide ONLY the improved text — no explanations, no markdown formatting, no quotes. Plain text only.`,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("") || "No response.";
      setResponse(text);
    } catch (e) {
      setResponse("Error connecting to AI. Check your API key setup.");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-accent-indigo/20 bg-bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-indigo/15 border border-accent-indigo/25 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
        </div>
        <div>
          <h3 className="font-display font-semibold text-text-primary text-sm">AI Writing Assistant</h3>
          <p className="font-mono text-[10px] text-text-muted">Powered by Claude claude-sonnet-4-6</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Improve my bio",
            "Make SpendSmart description more impactful",
            "Write a stronger tagline for Farooq Agency",
            "Suggest better skill categories",
          ].map((s) => (
            <button key={s} onClick={() => setPrompt(s)}
              className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border-mid hover:border-accent-indigo/40 hover:text-accent-indigo text-text-muted transition-all">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
          placeholder="Ask AI to improve your portfolio copy..."
          rows={2}
          className="flex-1 bg-bg-primary border border-border-mid rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-indigo/50"
        />
        <button
          onClick={ask}
          disabled={loading || !prompt.trim()}
          className="btn-primary px-4 rounded-xl font-mono text-xs disabled:opacity-40 flex items-center gap-1"
        >
          {loading ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          )}
        </button>
      </div>

      {response && (
        <div className="rounded-xl bg-bg-primary border border-border-subtle p-4">
          <p className="font-body text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{response}</p>
          <button
            onClick={() => onApply(response)}
            className="mt-3 font-mono text-[10px] text-accent-cyan hover:text-accent-indigo transition-colors"
          >
            Copy to clipboard ↗
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tab components ──────────────────────────────────────────────────────────────
function PersonalTab() {
  const { personal, updatePersonal } = usePortfolio();
  const [form, setForm] = useState(personal);
  const [saved, setSaved] = useState(false);

  const save = () => { updatePersonal(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const field = (key, label, type = "text", placeholder = "") => (
    <div key={key}>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">{label}</label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo/50"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {field("name", "Full Name", "text", "Shoaib Arshad")}
        {field("title", "Job Title", "text", "Front End Developer")}
        {field("email", "Email")}
        {field("phone", "Phone")}
        {field("linkedin", "LinkedIn URL")}
        {field("github", "GitHub URL")}
        {field("location", "Location")}
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">Bio</label>
        <textarea
          value={form.bio || ""}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
          className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary resize-none focus:outline-none focus:border-accent-indigo/50"
        />
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">Typewriter Roles (comma-separated)</label>
        <input
          type="text"
          value={(form.roles || []).join(", ")}
          onChange={(e) => setForm({ ...form, roles: e.target.value.split(",").map(r => r.trim()).filter(Boolean) })}
          className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary focus:outline-none focus:border-accent-indigo/50"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Available for work?</label>
        <button
          onClick={() => setForm({ ...form, available: !form.available })}
          className={`w-10 h-5 rounded-full transition-colors relative ${form.available ? "bg-emerald-500" : "bg-border-mid"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.available ? "left-5" : "left-0.5"}`} />
        </button>
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">Profile Picture</label>
        <p className="font-mono text-[10px] text-text-muted mb-2">Place your photo as <code className="text-accent-cyan">profile.jpg</code> in the <code className="text-accent-cyan">public/</code> folder</p>
        {field("profilePic", "Profile Pic Path", "text", "/profile.jpg")}
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">Resume PDF</label>
        <p className="font-mono text-[10px] text-text-muted mb-2">Place your resume as <code className="text-accent-cyan">resume.pdf</code> in the <code className="text-accent-cyan">public/</code> folder</p>
        {field("resumePdf", "Resume PDF Path", "text", "/resume.pdf")}
      </div>
      <button onClick={save} className={`btn-primary px-6 py-2.5 rounded-xl font-mono text-xs ${saved ? "!border-emerald-500/50 !text-emerald-400" : ""}`}>
        {saved ? "✓ Saved" : "Save Changes"}
      </button>
    </div>
  );
}

function ProjectsTab() {
  const { projects, updateProjects } = usePortfolio();
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(false);

  const saveProject = (updated) => {
    updateProjects(projects.map(p => p.id === updated.id ? updated : p));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (editing) {
    const p = editing;
    const set = (key, val) => setEditing({ ...p, [key]: val });
    return (
      <div className="space-y-4">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 font-mono text-xs text-text-muted hover:text-accent-indigo transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to projects
        </button>
        <h3 className="font-display font-semibold text-text-primary">{p.title}</h3>

        {[["title","Title"],["subtitle","Subtitle"],["tagline","Tagline"],["badge","Badge Label"],["date","Date"],["live","Live URL"],["github","GitHub URL"],["accentHex","Accent Color (hex)"]].map(([key, label]) => (
          <div key={key}>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1.5">{label}</label>
            <input type="text" value={p[key] || ""} onChange={e => set(key, e.target.value)}
              className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary focus:outline-none focus:border-accent-indigo/50" />
          </div>
        ))}

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Description</label>
          <textarea value={p.description || ""} onChange={e => set("description", e.target.value)} rows={3}
            className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary resize-none focus:outline-none focus:border-accent-indigo/50" />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Tech Stack (comma-separated)</label>
          <input type="text" value={(p.stack || []).join(", ")} onChange={e => set("stack", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary focus:outline-none focus:border-accent-indigo/50" />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Feature Details (one per line)</label>
          <textarea value={(p.details || []).join("\n")} onChange={e => set("details", e.target.value.split("\n").filter(Boolean))} rows={4}
            className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary resize-none focus:outline-none focus:border-accent-indigo/50" />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">Screenshots</label>
          <p className="font-mono text-[10px] text-text-muted mb-2">Place screenshots in <code className="text-accent-cyan">public/screenshots/</code> then list filenames (one per line)</p>
          <textarea value={(p.screenshots || []).join("\n")} onChange={e => set("screenshots", e.target.value.split("\n").map(s=>s.trim()).filter(Boolean))} rows={3}
            placeholder={"farooq-1.png\nfarooq-2.png"}
            className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-mono text-xs text-text-primary resize-none focus:outline-none focus:border-accent-indigo/50" />
        </div>

        <button onClick={() => { saveProject(p); setEditing(null); }}
          className={`btn-primary px-6 py-2.5 rounded-xl font-mono text-xs ${saved ? "!border-emerald-500/50 !text-emerald-400" : ""}`}>
          {saved ? "✓ Saved" : "Save Project"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border-subtle hover:border-border-mid transition-colors">
          <div className="w-2 h-2 rounded-full" style={{ background: p.accentHex }} />
          <div className="flex-1 min-w-0">
            <div className="font-display font-medium text-sm text-text-primary">{p.title}</div>
            <div className="font-mono text-[10px] text-text-muted">{p.subtitle}</div>
          </div>
          <div className="flex items-center gap-2">
            {p.live && <span className="font-mono text-[9px] text-emerald-400">● Live</span>}
            {p.github && <span className="font-mono text-[9px] text-text-muted">GitHub</span>}
          </div>
          <button onClick={() => setEditing(p)} className="btn-ghost px-3 py-1.5 rounded-lg font-mono text-[10px]">Edit</button>
        </div>
      ))}
    </div>
  );
}

function SkillsTab() {
  const { skills, updateSkills } = usePortfolio();
  const [form, setForm] = useState(
    Object.entries(skills).map(([cat, items]) => ({ cat, items: items.join(", ") }))
  );
  const [saved, setSaved] = useState(false);

  const save = () => {
    const obj = {};
    form.forEach(({ cat, items }) => { if (cat.trim()) obj[cat.trim()] = items.split(",").map(s => s.trim()).filter(Boolean); });
    updateSkills(obj);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {form.map((row, i) => (
        <div key={i} className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
          <input
            type="text" value={row.cat}
            onChange={e => { const f = [...form]; f[i] = { ...f[i], cat: e.target.value }; setForm(f); }}
            placeholder="Category name"
            className="w-full bg-bg-primary border border-border-mid rounded-lg px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-accent-indigo/50"
          />
          <input
            type="text" value={row.items}
            onChange={e => { const f = [...form]; f[i] = { ...f[i], items: e.target.value }; setForm(f); }}
            placeholder="Skill 1, Skill 2, Skill 3"
            className="w-full bg-bg-primary border border-border-mid rounded-lg px-3 py-2 font-body text-xs text-text-primary focus:outline-none focus:border-accent-indigo/50"
          />
          <button onClick={() => setForm(form.filter((_, j) => j !== i))} className="font-mono text-[10px] text-red-400/60 hover:text-red-400 transition-colors">
            Remove category
          </button>
        </div>
      ))}
      <div className="flex gap-3">
        <button onClick={() => setForm([...form, { cat: "", items: "" }])} className="btn-ghost px-4 py-2 rounded-xl font-mono text-xs">
          + Add Category
        </button>
        <button onClick={save} className={`btn-primary px-6 py-2 rounded-xl font-mono text-xs ${saved ? "!border-emerald-500/50 !text-emerald-400" : ""}`}>
          {saved ? "✓ Saved" : "Save Skills"}
        </button>
      </div>
    </div>
  );
}

// ── Main Admin Page ─────────────────────────────────────────────────────────────
function AdminInner() {
  const { personal, resetAll } = usePortfolio();
  const [tab, setTab] = useState("personal");
  const [resetConfirm, setResetConfirm] = useState(false);

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "ai", label: "✦ AI Assistant" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
      <div className="noise-overlay" />

      {/* Admin header */}
      <div className="border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-indigo/15 border border-accent-indigo/30 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <span className="font-display font-semibold text-sm text-text-primary">Portfolio Admin</span>
              <span className="font-mono text-[10px] text-text-muted ml-2">· {personal.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="btn-ghost px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              View Site
            </a>
            {resetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-red-400">Reset all data?</span>
                <button onClick={() => { resetAll(); setResetConfirm(false); }} className="font-mono text-[10px] text-red-400 border border-red-400/30 px-2 py-1 rounded-lg hover:bg-red-400/10">Yes</button>
                <button onClick={() => setResetConfirm(false)} className="font-mono text-[10px] text-text-muted">No</button>
              </div>
            ) : (
              <button onClick={() => setResetConfirm(true)} className="font-mono text-[10px] text-text-muted hover:text-red-400 transition-colors">Reset</button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-text-primary mb-1">Customize Portfolio</h1>
          <p className="font-body text-text-secondary text-sm">Changes are saved to your browser and persist across reloads.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-bg-card border border-border-subtle rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg font-mono text-xs transition-all ${tab === t.id ? "bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/25" : "text-text-muted hover:text-text-secondary"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="relative">
          {tab === "personal" && <PersonalTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "skills" && <SkillsTab />}
          {tab === "ai" && (
            <AIAssistant
              context={{ name: personal.name, bio: personal.bio }}
              onApply={(text) => navigator.clipboard.writeText(text)}
            />
          )}
        </div>

        {/* Info box */}
        <div className="mt-12 p-5 rounded-xl bg-bg-card border border-border-subtle">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">How to add your files</h4>
          <div className="space-y-2 font-mono text-[11px] text-text-secondary">
            <div><span className="text-accent-cyan">public/profile.jpg</span> — Your profile photo (shows in Hero)</div>
            <div><span className="text-accent-cyan">public/resume.pdf</span> — Your resume (downloadable from footer & hero)</div>
            <div><span className="text-accent-cyan">public/screenshots/</span> — Project screenshots (e.g. farooq-1.png)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <PortfolioProvider>
      <AdminInner />
    </PortfolioProvider>
  );
}
