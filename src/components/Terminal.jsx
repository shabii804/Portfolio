import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "../hooks/usePortfolio";
import { scrollToSection } from "../hooks/useLenis";

/**
 * Interactive terminal — type `help`, `skills`, `projects`, `contact`…
 * Fully keyboard-driven with command history. Outputs are plain lines with
 * semantic color classes; screen readers get the same content via aria-live.
 */
export default function Terminal() {
  const { personal, projects, skills, experience, journey } = usePortfolio();
  const [lines, setLines] = useState(() => [
    { t: "out", text: "Last login: " + new Date().toLocaleString() },
    { t: "accent", text: `shoaib@portfolio — v8.0` },
    { t: "dim", text: "Type 'help' to see available commands." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const ranBootRef = useRef(false);

  const education = journey.find((j) => j.tag === "Education");

  const push = (arr) => setLines((prev) => [...prev, ...arr]);

  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push([{ t: "cmd", text: cmd }]);
    setHistory((h) => [cmd, ...h].slice(0, 30));
    setHistIdx(-1);

    const [name, ...args] = cmd.toLowerCase().split(/\s+/);

    switch (name) {
      case "help":
        push([
          { t: "cyan", text: "Available commands:" },
          { t: "out", text: "  whoami        — quick intro" },
          { t: "out", text: "  skills        — tech stack" },
          { t: "out", text: "  projects      — shipped work" },
          { t: "out", text: "  experience    — internship & roles" },
          { t: "out", text: "  education     — degree & CGPA" },
          { t: "out", text: "  contact       — how to reach me" },
          { t: "out", text: "  cv            — open resume.pdf" },
          { t: "out", text: "  theme         — toggle light / dark" },
          { t: "out", text: "  clear         — wipe the screen" },
          { t: "dim", text: "  …and try `sudo hire shoaib`" },
        ]);
        break;

      case "whoami":
        push([
          { t: "out", text: `${personal.name} — ${personal.title}` },
          { t: "out", text: `${personal.location} · open to remote` },
          { t: "dim", text: personal.bio },
        ]);
        break;

      case "skills":
        push(
          Object.entries(skills)
            .filter(([cat]) => cat !== "Soft Skills")
            .map(([cat, items]) => ({
              t: "out",
              text: `  ${cat.padEnd(10)} ${items.slice(0, 5).join(", ")}`,
            }))
        );
        break;

      case "projects":
        push([
          ...projects.map((p) => ({
            t: "out",
            text: `  ${p.num}. ${p.title} — ${p.subtitle}${p.live ? " [live]" : ""}`,
          })),
          { t: "dim", text: "  Scroll to the Projects section for the full case studies." },
        ]);
        break;

      case "experience":
        push(
          experience.flatMap((e) => [
            { t: "cyan", text: `  ${e.role} — ${e.company}` },
            { t: "dim", text: `  ${e.duration} · ${e.type}` },
            ...e.points.slice(0, 3).map((pt) => ({ t: "out", text: `   • ${pt}` })),
          ])
        );
        break;

      case "education":
        push([
          { t: "out", text: `  ${education?.title || "BS Software Engineering"}` },
          { t: "out", text: `  ${education?.place || "Riphah International University, Islamabad"}` },
          { t: "cyan", text: "  CGPA: 4.0 / 4.0 — every semester" },
        ]);
        break;

      case "contact":
        push([
          { t: "out", text: `  email     ${personal.email}` },
          { t: "out", text: `  whatsapp  +92 ${personal.phone}` },
          { t: "out", text: `  github    github.com/shabii804` },
          { t: "out", text: `  linkedin  in/shoaib-arshad` },
        ]);
        break;

      case "socials":
      case "gh":
      case "github":
        push([
          { t: "out", text: `  github    ${personal.github}` },
          { t: "out", text: `  linkedin  ${personal.linkedin}` },
        ]);
        break;

      case "cv":
      case "resume":
        window.open(personal.resumePdf, "_blank", "noreferrer");
        push([{ t: "cyan", text: "  Opening resume.pdf in a new tab…" }]);
        break;

      case "theme":
        window.dispatchEvent(new CustomEvent("sa:toggle-theme"));
        push([{ t: "cyan", text: "  Theme toggled." }]);
        break;

      case "hire":
        if (args[0] === "shoaib" || args.length === 0) {
          push([{ t: "cyan", text: "  Smart move. Scrolling to the contact form…" }]);
          setTimeout(() => scrollToSection("contact"), 500);
        } else {
          push([{ t: "dim", text: `  Usage: hire shoaib` }]);
        }
        break;

      case "sudo":
        if (args[0] === "hire") {
          push([
            { t: "accent", text: "  [sudo] password for recruiter: ********" },
            { t: "cyan", text: "  Permission granted. Best decision you'll make today." },
          ]);
          setTimeout(() => scrollToSection("contact"), 700);
        } else {
          push([{ t: "dim", text: `  shoaib is not in the sudoers file. This incident will be reported. (try: sudo hire shoaib)` }]);
        }
        break;

      case "ls":
        push([{ t: "out", text: "  about/  skills/  projects/  journey/  contact/  resume.pdf" }]);
        break;

      case "clear":
        setLines([]);
        break;

      case "exit":
        push([{ t: "dim", text: "  There is no escape — only shipping. (command disabled)" }]);
        break;

      default:
        push([{ t: "dim", text: `  command not found: ${name} — try 'help'` }]);
    }
  };

  // Auto-run a friendly boot command the first time the terminal scrolls into view
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || ranBootRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !ranBootRef.current) {
          ranBootRef.current = true;
          push([{ t: "cmd", text: "whoami" }, { t: "out", text: `${personal.name} — ${personal.title}` }, { t: "cyan", text: "CGPA 4.0 · Riphah International University · Islamabad" }, { t: "dim", text: "Type 'help' to explore." }]);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [personal.name, personal.title]);

  // Keep the latest line visible
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      if (next >= 0) {
        setHistIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx - 1;
      setHistIdx(next);
      setInput(next >= 0 ? history[next] : "");
    }
  };

  const lineClass = {
    cmd: "terminal-line-cmd",
    out: "terminal-line-out",
    dim: "terminal-line-dim",
    accent: "terminal-line-accent",
    cyan: "terminal-line-cyan",
  };

  return (
    <div
      className="terminal"
      onClick={() => inputRef.current?.focus()}
      role="region"
      aria-label="Interactive portfolio terminal"
    >
      <div className="terminal-head" aria-hidden="true">
        <span className="terminal-dot" style={{ background: "#ff5f57" }} />
        <span className="terminal-dot" style={{ background: "#febc2e" }} />
        <span className="terminal-dot" style={{ background: "#28c840" }} />
        <span className="terminal-title">shoaib@portfolio: ~</span>
      </div>
      <div ref={bodyRef} className="terminal-body">
        {lines.map((l, i) => (
          <div key={i} className={`terminal-line ${lineClass[l.t] || "terminal-line-out"}`}>
            {l.t === "cmd" ? <span className="terminal-prompt">➜ ~ </span> : null}
            {l.text}
          </div>
        ))}
        {/* Input line */}
        <div className="terminal-line flex items-center">
          <span className="terminal-prompt" aria-hidden="true">➜ ~ </span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Terminal command input"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
