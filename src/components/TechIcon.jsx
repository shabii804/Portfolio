import { FILLED, FILLED_128, STROKED } from "./techIconPaths";
import { iconSlugFor } from "./techIconAlias";

/* ─────────────────────────────────────────────────────────────────────────────
   TechIcon — self-hosted brand/tech glyph for a skill or stack name.
   • Filled brand marks: simple-icons@13 (+ devicon for VS Code, Java, C#,
     Visual Studio, MSSQL — the ones simple-icons dropped).
   • Stroke glyphs (soft skills, generics): lucide-static 0.462.0.
   • Everything renders in `currentColor` so chips/themes stay in control.
   • Unknown names fall back to a neutral ring-dot glyph (admin-added skills).
   Name→slug resolution lives in ./techIconAlias (react-refresh constraint).
   ────────────────────────────────────────────────────────────────────────── */

/* Neutral fallback for admin-added skills without a known mark. */
function Fallback({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function TechIcon({ name, className = "w-3.5 h-3.5", strokeWidth = 2 }) {
  const slug = iconSlugFor(name);
  if (!slug) return <Fallback className={className} />;

  if (STROKED[slug]) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {STROKED[slug].map((d, i) => <path key={i} d={d} />)}
      </svg>
    );
  }

  const d128 = FILLED_128[slug];
  return (
    <svg viewBox={d128 ? "0 0 128 128" : "0 0 24 24"} className={className} fill="currentColor" aria-hidden="true">
      <path d={d128 || FILLED[slug]} />
    </svg>
  );
}
