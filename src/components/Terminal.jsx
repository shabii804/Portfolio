import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "../hooks/usePortfolio";
import { useNavigate } from "react-router-dom";
import { scrollToSection } from "../hooks/useLenis";

/* ─────────────────────────────────────────────────────────────────────────────
   Terminal v22 — a real CLI window, not a text box.

   · macOS traffic lights with hover glyphs, tab bar, glass dark body with
     scanlines, gradient border glow, soft drop shadow. Dark in BOTH themes.
   · Boot sequence auto-types `whoami` (typewriter) the first time the card
     scrolls into view — then it's fully interactive.
   · Case-insensitive commands · Tab autocomplete · ↑/↓ history · clickable
     chips row for touch · friendly unknown-command suggestions.
   · Styled output blocks: skill progress bars, a mini project table,
     clickable contact links, neofetch panel, animated `sudo hire-me` egg.
   · A11y: labelled input, aria-live log, keyboard-only operable, no page-
     scroll trap (no wheel handlers — browser handles inner-then-page).
   · prefers-reduced-motion: boot prints instantly, caret stops blinking,
     bar sweeps disabled (CSS).
   ────────────────────────────────────────────────────────────────────────── */

const COMMANDS = [
  { name: "help", desc: "list every command" },
  { name: "about", desc: "who I am" },
  { name: "skills", desc: "stack + proficiency bars" },
  { name: "projects", desc: "shipped work (mini table)" },
  { name: "experience", desc: "internship & roles" },
  { name: "education", desc: "degree & CGPA" },
  { name: "contact", desc: "how to reach me" },
  { name: "resume", desc: "download CV" },
  { name: "github", desc: "open GitHub profile" },
  { name: "theme", desc: "toggle light / dark" },
  { name: "neofetch", desc: "system info, portfolio edition" },
  { name: "clear", desc: "wipe the screen" },
];

/* Real proficiency numbers — the site's own historical "Core proficiencies"
   data (React 90 · JS 88 · Tailwind 92 · Node/Express 80 · SQL 85 · FB/Supa 84). */
const BARS = [
  { label: "React.js", pct: 90, c1: "#61dafb", c2: "#38bdf8" },
  { label: "JavaScript (ES6+)", pct: 88, c1: "#f7df1e", c2: "#facc15" },
  { label: "Tailwind CSS", pct: 92, c1: "#38bdf8", c2: "#22d3ee" },
  { label: "Node.js / Express", pct: 80, c1: "#68a063", c2: "#3ecf8e" },
  { label: "SQL / MSSQL", pct: 85, c1: "#818cf8", c2: "#a5b4fc" },
  { label: "Firebase / Supabase", pct: 84, c1: "#ffca28", c2: "#fbbf24" },
];

const NEOFETCH_ART = [
  "  ███████╗ █████╗ ",
  "  ██╔════╝██╔══██╗",
  "  ███████╗███████║",
  "  ╚════██║██╔══██║",
  "  ███████║██║  ██║",
  "  ╚══════╝╚═╝  ╚═╝",
];

function suggest(input) {
  const x = input.toLowerCase();
  let best = null, bestScore = 0;
  for (const c of COMMANDS) {
    const n = c.name;
    let s = 0;
    if (n.startsWith(x)) s = 3 - (n.length - x.length) * 0.05;
    else if (n.includes(x) && x.length >= 3) s = 2;
    else if (n[0] === x[0]) s = 1;
    if (s > bestScore) { bestScore = s; best = n; }
  }
  return bestScore > 0.5 ? best : null;
}

/* Animated `sudo hire-me` easter egg block */
function HireBlock({ onDone }) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [pct, setPct] = useState(() => (reduce ? 100 : 0));
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (reduce) { onDone?.(); return; }
    let v = 0;
    const t = setInterval(() => {
      v = Math.min(100, v + 4 + Math.random() * 7);
      setPct(Math.round(v));
      if (v >= 100) {
        clearInterval(t);
        setDone(true);
        onDone?.();
      }
    }, 70);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="terminal-hire">
      <div className="terminal-line terminal-line-cyan">[sudo] password for recruiter: ••••••••</div>
      <div className="terminal-line terminal-line-out">Deploying career opportunity<span className="terminal-dots-anim">…</span> {pct}%</div>
      <div className="hire-track"><div className="hire-fill" style={{ width: `${pct}%`, transition: "width 90ms linear" }} /></div>
      {done && (
        <div className="terminal-line terminal-line-ok hire-msg">
          ✔ Access granted — excellent choice. Scrolling you to the contact form…
        </div>
      )}
    </div>
  );
}

export default function Terminal() {
  const { personal, projects, experience, journey } = usePortfolio();
  const navigate = useNavigate();
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [booting, setBooting] = useState(true);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const ranBootRef = useRef(false);
  const bootCancelRef = useRef(null);
  // Ref mirror so the command runner (a plain closure, not a hook callback)
  // can always reach the latest navigate without dependency churn.
  const navigateRef = useRef(null);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const education = journey.find((j) => j.tag === "Education");
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const push = (arr) => setLines((prev) => [...prev, ...arr]);

  /* ── command runner ──────────────────────────────────────────────────── */
  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push([{ k: "cmd", text: cmd }]);
    setHistory((h) => [cmd, ...h].slice(0, 30));
    setHistIdx(-1);

    const [name0, ...args] = cmd.toLowerCase().split(/\s+/);
    const name = name0 === "sudo" ? "sudo" : name0;

    if (name === "sudo") {
      const target = args.join(" ").replace(/\s+/g, " ").trim();
      if (target === "hire-me" || target === "hire me" || target === "hire shoaib" || target === "hire") {
        push([{ k: "hire" }]);
        // v28 — multi-page: glide to the on-page contact section when it
        // exists; otherwise walk to the Contact page itself.
        setTimeout(() => {
          if (document.getElementById("contact")) scrollToSection("contact");
          else navigateRef.current?.("/contact");
        }, 2400);
      } else {
        push([
          { k: "err", text: `sudo: ${target || "?"}: command not found` },
          { k: "dim", text: "shoaib is not in the sudoers file. This incident will be reported. (try: sudo hire-me)" },
        ]);
      }
      return;
    }

    switch (name) {
      case "help":
        push([
          { k: "accent", text: "Available commands:" },
          ...COMMANDS.map((c) => ({ k: "out", text: `  ${c.name.padEnd(12)} — ${c.desc}` })),
          { k: "dim", text: "  …and try `sudo hire-me` — recruiters report 100% success." },
          { k: "dim", text: "  Tab autocompletes · ↑/↓ walks history." },
        ]);
        break;

      case "about":
      case "whoami":
        push([
          { k: "cyan", text: `${personal.name} — ${personal.title}` },
          { k: "out", text: `${personal.location} · open to internships, freelance & junior roles` },
          { k: "dim", text: personal.bio },
          { k: "accent", text: "Focus: " },
          { k: "out", text: "  Web Apps · Desktop Systems · Databases · UI Engineering" },
        ]);
        break;

      case "skills":
        push([
          { k: "cyan", text: "Core proficiencies" },
          { k: "bars", items: BARS },
          { k: "dim", text: "Full categorized toolkit lives in the section above ↑" },
        ]);
        break;

      case "projects":
        push([
          {
            k: "table",
            head: ["project", "stack", "status"],
            rows: projects.map((p) => [
              p.live ? p.title : p.title,
              (p.stack || []).slice(0, 3).join(", "),
              p.live ? "● live" : "shipped",
            ]),
            links: projects.map((p) => p.live).filter(Boolean),
          },
          { k: "dim", text: "Full case studies live in the Projects section ↑" },
        ]);
        break;

      case "experience":
        push(
          experience.length
            ? experience.flatMap((e) => [
                { k: "cyan", text: `${e.role} — ${e.company}` },
                { k: "dim", text: `${e.duration} · ${e.type}` },
                ...e.points.slice(0, 3).map((pt) => ({ k: "out", text: `• ${pt}` })),
                { k: "gap" },
              ])
            : [{ k: "out", text: "  Frontend Developer Intern — Developer Hub Corporation (see education card timeline)" }]
        );
        break;

      case "education":
        push([
          { k: "out", text: `  ${education?.title || "BS Software Engineering"}` },
          { k: "out", text: `  ${education?.place || "Riphah International University, Islamabad"}` },
          { k: "cyan", text: "  CGPA: 4.0 / 4.0 — every semester so far" },
          { k: "dim", text: "  Focus: OOP, databases, algorithms, systems analysis" },
        ]);
        break;

      case "contact":
        push([
          { k: "cyan", text: "Reach me — fastest first:" },
          {
            k: "links",
            items: [
              { label: "WhatsApp", href: `https://wa.me/${(personal.phone || "").replace(/\D/g, "")}` },
              { label: "Email", href: `mailto:${personal.email}` },
              { label: "LinkedIn", href: personal.linkedin },
              { label: "GitHub", href: personal.github },
              { label: "Resume.pdf", href: personal.resumePdf },
            ],
          },
          { k: "dim", text: "Usually replies within hours." },
        ]);
        break;

      case "resume":
      case "cv":
        window.open(personal.resumePdf, "_blank", "noreferrer");
        push([{ k: "ok", text: "Opening resume.pdf in a new tab… (download triggers from the viewer)" }]);
        break;

      case "github":
      case "gh":
        window.open(personal.github, "_blank", "noreferrer");
        push([{ k: "ok", text: "Opening github.com/shabii804 — stars, follows and PRs welcome." }]);
        break;

      case "theme": {
        window.dispatchEvent(new CustomEvent("sa:toggle-theme"));
        push([{ k: "ok", text: "Theme toggled. (Same trick works from the navbar switch.)" }]);
        break;
      }

      case "neofetch": {
        const info = [
          ["OS", "Portfolio OS 8.0 (shoaib-amd64)"],
          ["Host", "Vercel edge · React 19 + Vite"],
          ["Role", personal.title],
          ["Stack", "React · Node.js · Firebase · Java · MSSQL"],
          ["CGPA", "4.0 / 4.0 — Software Engineering"],
          ["Uptime", "2 live deployments, zero downtime"],
          ["Shell", "shoaib-sh (interactive)"],
          ["Location", personal.location],
        ];
        push([{ k: "neofetch", art: NEOFETCH_ART, info, palette: ["#6366f1", "#818cf8", "#22d3ee", "#67e8f9", "#4ade80", "#fbbf24"] }]);
        break;
      }

      case "clear":
        setLines([]);
        break;

      case "ls":
        push([{ k: "out", text: "  about/  skills/  projects/  journey/  contact/  resume.pdf" }]);
        break;

      case "exit":
        push([{ k: "dim", text: "There is no escape — only shipping. (command disabled)" }]);
        break;

      case "hire":
        push([{ k: "dim", text: "Usage: sudo hire-me  — everything worth doing needs elevated privileges." }]);
        break;

      default: {
        const s = suggest(name);
        push([
          { k: "err", text: `zsh: command not found: ${name}` },
          s
            ? { k: "warn", text: `Did you mean \`${s}\`? Press Tab or tap it:` }
            : { k: "dim", text: "Type `help` to see what I respond to." },
          { k: "chips", items: s ? [s, "help"] : ["help", "about", "projects"] },
        ]);
      }
    }
  };

  /* ── boot sequence — typewriter whoami, once, on first scroll-into-view ── */
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || ranBootRef.current) return;
    let cancelled = false;
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const bootCmd = "whoami";

    const instantBoot = () => {
      push([
        { k: "cmd", text: bootCmd },
        { k: "cyan", text: `${personal.name} — ${personal.title}` },
        { k: "out", text: "CGPA 4.0 · Riphah International University · Islamabad" },
        { k: "dim", text: "Type `help` to explore — Tab completes, ↑/↓ recalls." },
      ]);
      setInput("");
      setBooting(false);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || ranBootRef.current) return;
      ranBootRef.current = true;
      io.disconnect();

      if (reduce) { instantBoot(); return; }

      /* typewriter: fill the real input line char by char, then run */
      let i = 0;
      const type = () => {
        if (cancelled) return;
        i += 1;
        setInput(bootCmd.slice(0, i));
        if (i < bootCmd.length) {
          later(type, 55 + Math.random() * 60);
        } else {
          later(() => {
            if (cancelled) return;
            setBooting(false);
            run(bootCmd);
            setInput("");
          }, 260);
        }
      };
      later(type, 350);
    }, { threshold: 0.35 });

    io.observe(el);
    bootCancelRef.current = () => {
      if (cancelled || !ranBootRef.current) return;
      cancelled = true;
      timers.forEach(clearTimeout);
      setBooting(false);
    };
    return () => { cancelled = true; timers.forEach(clearTimeout); io.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* any interaction during the boot typewriter → finish instantly */
  const interruptBoot = () => {
    if (booting && ranBootRef.current) {
      bootCancelRef.current?.();
      setInput("");
      setBooting(false);
      push([
        { k: "cmd", text: "whoami" },
        { k: "cyan", text: `${personal.name} — ${personal.title}` },
        { k: "out", text: "CGPA 4.0 · Riphah International University · Islamabad" },
        { k: "dim", text: "Type `help` to explore — Tab completes, ↑/↓ recalls." },
      ]);
    }
  };

  /* auto-scroll to latest line */
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, input, booting]);

  const onKeyDown = (e) => {
    interruptBoot();
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const x = input.trim().toLowerCase();
      if (!x) return;
      const matches = COMMANDS.filter((c) => c.name.startsWith(x));
      if (matches.length === 1) {
        setInput(matches[0].name + " ");
      } else if (matches.length > 1) {
        push([{ k: "dim", text: matches.map((m) => m.name).join("   ") }]);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      if (next >= 0) { setHistIdx(next); setInput(history[next]); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx - 1;
      setHistIdx(next);
      setInput(next >= 0 ? history[next] : "");
    }
  };

  const focusInput = () => { interruptBoot(); inputRef.current?.focus(); };
  const runChip = (c) => { focusInput(); run(c); };

  const lineClass = {
    cmd: "terminal-line-cmd", out: "terminal-line-out", dim: "terminal-line-dim",
    accent: "terminal-line-accent", cyan: "terminal-line-cyan", ok: "terminal-line-ok",
    warn: "terminal-line-warn", err: "terminal-line-err",
  };

  return (
    <div
      className="terminal"
      onMouseDown={focusInput}
      role="region"
      aria-label="Interactive portfolio terminal — type help for commands"
    >
      {/* window chrome */}
      <div className="terminal-head" aria-hidden="true">
        <span className="terminal-dots">
          <span className="terminal-dot" style={{ background: "#ff5f57" }}><span>×</span></span>
          <span className="terminal-dot" style={{ background: "#febc2e" }}><span>−</span></span>
          <span className="terminal-dot" style={{ background: "#28c840" }}><span>+</span></span>
        </span>
        <span className="terminal-tabbar">
          <span className="terminal-tab">shoaib@portfolio: ~</span>
        </span>
        <span className="terminal-shell-tag">zsh · bash - 80×24</span>
      </div>

      {/* output log */}
      <div ref={bodyRef} className="terminal-body" role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l, i) => {
          if (l.k === "gap") return <div key={i} className="h-2" />;
          if (l.k === "cmd") {
            return (
              <div key={i} className="terminal-line terminal-line-cmd">
                <span className="terminal-prompt">➜ <span className="path">~</span> </span>
                <span className="terminal-typed">{l.text}</span>
              </div>
            );
          }
          if (l.k === "bars") {
            return (
              <div key={i} className="terminal-bars">
                {l.items.map((b) => (
                  <div key={b.label} className="terminal-bar">
                    <span className="tb-label">{b.label}</span>
                    <span className="tb-track">
                      <span
                        className="tb-fill"
                        style={{ width: `${b.pct}%`, "--bar-c1": b.c1, "--bar-c2": b.c2 }}
                      />
                    </span>
                    <span className="tb-pct">{b.pct}%</span>
                  </div>
                ))}
              </div>
            );
          }
          if (l.k === "table") {
            return (
              <table key={i} className="terminal-table">
                <thead>
                  <tr>{l.head.map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {l.rows.map((r, ri) => (
                    <tr key={ri}>
                      {r.map((cell, ci) => (
                        <td key={ci}>
                          {ci === 2 && cell.startsWith("●") ? <span className="terminal-line-ok">{cell}</span> : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }
          if (l.k === "links") {
            return (
              <div key={i} className="terminal-links flex flex-wrap gap-x-4 gap-y-1 my-1">
                {l.items.map((x) => (
                  <a key={x.label} className="terminal-link" href={x.href} target="_blank" rel="noreferrer">
                    {x.label} ↗
                  </a>
                ))}
              </div>
            );
          }
          if (l.k === "chips") {
            return (
              <div key={i} className="flex flex-wrap gap-2 my-1.5">
                {l.items.map((c) => (
                  <button key={c} type="button" className="terminal-cmd-chip" onClick={() => runChip(c)}>
                    {c}
                  </button>
                ))}
              </div>
            );
          }
          if (l.k === "neofetch") {
            return (
              <div key={i} className="terminal-neofetch">
                <pre aria-hidden="true">{l.art.join("\n")}</pre>
                <div className="nf-info">
                  <div><b>{personal.name}</b></div>
                  {l.info.map(([k, v]) => (
                    <div key={k}><b>{k}</b>: {v}</div>
                  ))}
                  <span className="nf-palette" aria-hidden="true">
                    {l.palette.map((c) => <i key={c} style={{ background: c }} />)}
                  </span>
                </div>
              </div>
            );
          }
          if (l.k === "hire") {
            return <HireBlock key={i} onDone={() => {}} />;
          }
          return (
            <div key={i} className={`terminal-line ${lineClass[l.k] || "terminal-line-out"}`}>
              {l.text}
            </div>
          );
        })}

        {/* input line — mirrored text + block caret over a real input */}
        <div className="terminal-line flex items-center relative" aria-hidden={booting}>
          <label htmlFor="term-input" className="sr-only">Terminal command input</label>
          <span className="terminal-prompt" aria-hidden="true">➜ <span className="path">~</span> </span>
          <span className="terminal-mirror">{input}</span>
          <span className={`terminal-caret ${booting || reduce ? "" : "blink"}`} aria-hidden="true" />
          <input
            id="term-input"
            ref={inputRef}
            className="terminal-input terminal-input-ghost"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Terminal command input — type help for commands"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* clickable command chips — touch-friendly */}
      <div className="terminal-chips-row" role="toolbar" aria-label="Command shortcuts">
        {["help", "about", "skills", "projects", "experience", "education", "contact", "resume", "github", "theme", "neofetch", "clear", "sudo hire-me"].map((c) => (
          <button key={c} type="button" className="terminal-cmd-chip" onClick={() => runChip(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
