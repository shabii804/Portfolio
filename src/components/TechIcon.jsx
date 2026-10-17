import { FILLED, FILLED_128, STROKED } from "./techIconPaths";
import { COLOR } from "./techIconColor";
import { iconSlugFor } from "./techIconAlias";

/* ─────────────────────────────────────────────────────────────────────────────
   TechIcon — self-hosted vector marks for a skill or stack name.
   Resolution order (v21):
     1. COLOR — official full-color brand marks (@iconify-json/logos +
        skill-icons bodies, bundled). Crisp at any DPI, both themes.
     2. STROKED — lucide glyphs (soft skills, generic UI marks), currentColor.
     3. FILLED — simple-icons/devicon monochrome paths, currentColor — used by
        monochrome-only brands (GitHub, MSSQL) so they adapt to the theme.
     4. Fallback — neutral ring-dot for admin-added skills.
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

  /* 1 — full-color official brand mark */
  const color = COLOR[slug];
  if (color) {
    return (
      <svg
        viewBox={color.viewBox}
        className={className}
        role="img"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: color.body }}
      />
    );
  }

  /* 2 — lucide stroke glyph (currentColor) */
  if (STROKED[slug]) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {STROKED[slug].map((d, i) => <path key={i} d={d} />)}
      </svg>
    );
  }

  /* 3 — monochrome brand path (currentColor → theme-adaptive) */
  const d128 = FILLED_128[slug];
  return (
    <svg viewBox={d128 ? "0 0 128 128" : "0 0 24 24"} className={className} fill="currentColor" aria-hidden="true">
      <path d={d128 || FILLED[slug]} />
    </svg>
  );
}
