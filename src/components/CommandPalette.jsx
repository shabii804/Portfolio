import { useState, useEffect, useRef, useCallback } from "react";
import { usePortfolio } from "../hooks/usePortfolio";
import { scrollToSection } from "../hooks/useLenis";

/* ─────────────────────────────────────────────────────────────────────────────
   CommandPalette — Cmd/Ctrl+K launcher (PRD requirement).
   Sections · actions · contact shortcuts, fully keyboard-driven.
   ──────────────────────────────────────────────────────────────────────────── */

export default function CommandPalette() {
  const { personal } = usePortfolio();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIdx(0);
  }, []);

  // Open via ⌘K / Ctrl+K, or the custom event from Navbar
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setActiveIdx(0);
      }
      if (e.key === "Escape") close();
    };
    const onOpenEvent = () => { setOpen(true); setActiveIdx(0); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, [close]);

  // Focus input + lock scroll while open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const runAction = useCallback((cmd) => {
    if (!cmd) return;
    if (cmd.copy) {
      navigator.clipboard?.writeText(personal.email).then(() => {
        setCopied(true);
        setTimeout(() => { setCopied(false); close(); }, 700);
      }).catch(() => {});
      return;
    }
    if (cmd.event) window.dispatchEvent(new CustomEvent(cmd.event));
    if (cmd.href) window.open(cmd.href, "_blank", "noreferrer");
    if (cmd.scroll) {
      scrollToSection(cmd.scroll);
    }
    if (cmd.top) scrollToSection("home");
    close();
  }, [personal.email, close]);

  const commands = [
    { group: "Navigate", label: "Home", hint: "Back to the top", icon: "⌂", top: true },
    { group: "Navigate", label: "About", hint: "Who Shoaib is", icon: "◉", scroll: "about" },
    { group: "Navigate", label: "Skills", hint: "Toolkit & proficiencies", icon: "⚡", scroll: "skills" },
    { group: "Navigate", label: "Projects", hint: "4 case studies", icon: "▤", scroll: "projects" },
    { group: "Navigate", label: "Journey", hint: "Timeline 2021 → now", icon: "⏱", scroll: "journey" },
    { group: "Navigate", label: "GitHub Activity", hint: "Live commits & stats", icon: "◈", scroll: "activity" },
    { group: "Navigate", label: "Contact", hint: "Start a conversation", icon: "✉", scroll: "contact" },
    { group: "Actions", label: "Ask the AI assistant", hint: "GLM-powered, fact-grounded", icon: "✦", event: "toggle-chatbot" },
    { group: "Actions", label: "Toggle light / dark theme", hint: "Smooth cross-fade", icon: "◐", event: "sa:toggle-theme" },
    { group: "Actions", label: "Open the terminal", hint: "whoami · skills · projects", icon: "▸", scroll: "about" },
    { group: "Actions", label: "Download CV", hint: "resume.pdf", icon: "↓", href: personal.resumePdf },
    { group: "Actions", label: "Copy email address", hint: copied ? "Copied ✓" : personal.email, icon: "⧉", copy: true },
    { group: "Links", label: "Open GitHub", hint: "github.com/shabii804", icon: "↗", href: personal.github },
    { group: "Links", label: "Open LinkedIn", hint: "in/shoaib-arshad", icon: "↗", href: personal.linkedin },
    { group: "Links", label: "WhatsApp", hint: personal.phone, icon: "↗", href: `https://wa.me/${(personal.phone || "").replace(/\D/g, "")}` },
  ];

  const filtered = commands.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q) || c.group.toLowerCase().includes(q);
  });

  // Reset selection whenever the query changes (event handlers, not effects)
  const onQueryChange = (e) => {
    setQuery(e.target.value);
    setActiveIdx(0);
  };

  // Keep the active row visible
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); runAction(filtered[activeIdx]); }
  };

  if (!open) return null;

  let lastGroup = null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-xl rounded-2xl border border-border-mid bg-bg-card/95 backdrop-blur-xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={onQueryChange}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            aria-label="Search commands"
            className="flex-1 bg-transparent font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <span className="kbd">ESC</span>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[46vh] overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-display text-sm text-text-secondary">No commands match “{query}”</p>
              <p className="font-mono text-[10px] text-text-muted mt-1">Try “projects”, “cv”, or “github”</p>
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const showGroup = cmd.group !== lastGroup;
              lastGroup = cmd.group;
              const active = idx === activeIdx;
              return (
                <div key={cmd.label}>
                  {showGroup && (
                    <div className="px-5 pt-3 pb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                      {cmd.group}
                    </div>
                  )}
                  <button
                    data-idx={idx}
                    role="option"
                    aria-selected={active}
                    onClick={() => runAction(cmd)}
                    onMouseMove={() => setActiveIdx(idx)}
                    className={`w-full flex items-center gap-3.5 px-5 py-2.5 text-left transition-colors ${
                      active ? "bg-accent-indigo/[0.09]" : ""
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[13px] flex-shrink-0 transition-colors ${
                      active
                        ? "border-accent-indigo/40 text-accent-indigo bg-accent-indigo/10"
                        : "border-border-mid text-text-muted bg-bg-secondary"
                    }`}>
                      {cmd.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block font-body text-sm truncate ${active ? "text-text-primary" : "text-text-secondary"}`}>
                        {cmd.label}
                      </span>
                      <span className="block font-mono text-[10px] text-text-muted truncate">{cmd.hint}</span>
                    </span>
                    {active && <span className="kbd">↵</span>}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-border-subtle bg-bg-secondary/60">
          <span className="flex items-center gap-1.5 font-mono text-[9px] text-text-muted">
            <span className="kbd">↑</span><span className="kbd">↓</span> navigate
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[9px] text-text-muted">
            <span className="kbd">↵</span> select
          </span>
          <span className="ml-auto font-mono text-[9px] text-text-muted">{filtered.length} commands</span>
        </div>
      </div>
    </div>
  );
}
