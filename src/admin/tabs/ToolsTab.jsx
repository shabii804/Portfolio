// ─────────────────────────────────────────────────────────────────────────────
// Tools — the original Copy Polisher (kept from the previous admin page).
// Runs entirely client-side: strips filler words, smartens punctuation,
// fixes capitalisation. No API key, no network.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Panel } from "../ui.jsx";

const FILLER_WORDS = [
  "very", "really", "just", "actually", "basically", "literally",
  "simply", "in order to", "a lot of", "kind of", "sort of",
  "essentially", "virtually", "practically", "i think that",
  "i believe that", "you can see that", "it is important to note that",
];

function polishCopy(text) {
  if (!text || !text.trim()) return "(nothing to polish yet — type or paste some text above)";

  let out = text.trim();
  out = out.replace(/[ \t]{2,}/g, " ");
  out = out.replace(/\n{3,}/g, "\n\n");

  FILLER_WORDS.forEach((w) => {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b\\s*`, "gi");
    out = out.replace(re, "");
  });

  out = out
    .replace(/\b-\b/g, "\u2014")
    .replace(/--/g, "\u2014")
    .replace(/\s\u2014\s/g, " \u2014 ")
    .replace(/"([^"]+)"/g, "\u201C$1\u201D")
    .replace(/'([^']+)'/g, "\u2018$1\u2019");

  out = out.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  out = out.replace(/\s+([,.;:!?])/g, "$1");
  out = out.replace(/([,;:])(?=[^\s])/g, "$1 ");
  out = out
    .split("\n")
    .map((l) => l.trim())
    .join("\n");
  out = out.replace(/\s+$/g, "").trim();

  if (out === text.trim()) {
    return out + "\n\n\u2014 Looks clean already. Try a longer draft if you want more suggestions.";
  }
  return out;
}

export default function ToolsTab({ content }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [copied, setCopied] = useState(false);

  const ask = () => {
    if (!prompt.trim()) return;
    setResponse(polishCopy(prompt));
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const sampleTexts = [
    { label: "Polish my bio", value: content?.personal?.bio || "" },
    {
      label: "Sample project description",
      value:
        "a really good project i built basically just to learn react, it has a lot of features like authentication and stuff and i think that it is important to note that it works really well",
    },
  ];

  return (
    <Panel
      title="Copy Polisher"
      desc="Local · no API key needed · runs in your browser"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Quick fills:</p>
          <div className="flex flex-wrap gap-2">
            {sampleTexts.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => { setPrompt(s.value); setResponse(""); }}
                className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border-mid hover:border-accent-indigo/40 hover:text-accent-indigo text-text-muted transition-all"
              >
                {s.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setPrompt(""); setResponse(""); }}
              className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border-mid hover:border-accent-indigo/40 hover:text-accent-indigo text-text-muted transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ask(); } }}
            placeholder="Paste your bio, project description, or any copy you want tightened..."
            rows={4}
            aria-label="Text to polish"
            className="flex-1 bg-bg-primary border border-border-mid rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-indigo/50"
          />
          <button
            type="button"
            onClick={ask}
            disabled={!prompt.trim()}
            className="btn-primary px-4 rounded-xl font-mono text-xs disabled:opacity-40 flex items-center gap-1 sm:self-end justify-center"
            title="Polish (Cmd/Ctrl + Enter)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            Polish
          </button>
        </div>

        {response && (
          <div className="rounded-xl bg-bg-primary border border-border-subtle p-4">
            <p className="font-body text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{response}</p>
            <button
              type="button"
              onClick={copy}
              className="mt-3 font-mono text-[10px] text-accent-cyan hover:text-accent-indigo transition-colors"
            >
              {copied ? "✓ Copied to clipboard" : "Copy to clipboard ↗"}
            </button>
          </div>
        )}

        <p className="font-mono text-[10px] text-text-muted leading-relaxed">
          Strips filler words, smartens quotes &amp; dashes, fixes sentence capitalisation and
          punctuation spacing. Want a real LLM? The chatbot already uses one — see{" "}
          <code className="text-accent-cyan">/api/chat</code>.
        </p>
      </div>
    </Panel>
  );
}
