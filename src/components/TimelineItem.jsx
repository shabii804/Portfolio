import { useRef } from "react";
import { GraduationCap, MonitorSmartphone, Layers, Briefcase, Rocket, Sparkles } from "lucide-react";
import { TAG_GRADIENTS } from "./tagColors";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   <TimelineItem /> — one card of "The road so far" (v22).

   · duotone gradient icon badge per milestone type (graduation cap, monitor,
     layers, briefcase, rocket, sparkles) — high-contrast in both themes
   · date pill · title · location line · description · tech tags
   · the "Now" entry gets a pulsing live dot + accent gradient border
   · tech tags are DERIVED from the entry's own text (place/description) —
     no invented content
   ────────────────────────────────────────────────────────────────────────── */

const BADGES = {
  Education: { Icon: GraduationCap, c1: TAG_GRADIENTS.Education[0], c2: TAG_GRADIENTS.Education[1] },
  Desktop: { Icon: MonitorSmartphone, c1: TAG_GRADIENTS.Desktop[0], c2: TAG_GRADIENTS.Desktop[1] },
  "Full-Stack": { Icon: Layers, c1: TAG_GRADIENTS["Full-Stack"][0], c2: TAG_GRADIENTS["Full-Stack"][1] },
  Internship: { Icon: Briefcase, c1: TAG_GRADIENTS.Internship[0], c2: TAG_GRADIENTS.Internship[1] },
  "Client Work": { Icon: Rocket, c1: TAG_GRADIENTS["Client Work"][0], c2: TAG_GRADIENTS["Client Work"][1] },
  Next: { Icon: Sparkles, c1: TAG_GRADIENTS.Next[0], c2: TAG_GRADIENTS.Next[1] },
};

const KNOWN_TECH = new Set([
  "react", "node.js", "mssql", "java swing", "firebase", "whatsapp",
  "mysql", "mongodb", "flutter", "dart", "typescript", "postgresql",
  "oracle", "supabase", "express.js", "tailwind css",
]);

/* Tags kept for entries whose place line is pure tech (no location left) */
const TAG_FALLBACK = {
  Education: ["OOP", "Databases", "Algorithms"],
  Internship: ["E-Commerce UI", "Video Calling"],
};

function splitPlace(place = "") {
  const parts = String(place).split(/\s*[·+]\s*/).map((s) => s.trim()).filter(Boolean);
  const loc = [];
  const tags = [];
  for (const p of parts) {
    if (KNOWN_TECH.has(p.toLowerCase())) tags.push(p);
    else loc.push(p);
  }
  return { location: loc.join(" · "), tags };
}

export default function TimelineItem({ step }) {
  const badge = BADGES[step.tag] || BADGES.FullStack || BADGES["Full-Stack"];
  const { Icon, c1, c2 } = badge;
  const isNow = step.tag === "Next" || /^now$/i.test(step.year || "");

  /* v24 — scroll-linked parallax on the badge icon (±4px = 8px travel,
     transform-only; static under prefers-reduced-motion) */
  const badgeRef = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: badgeRef,
    offset: ["start end", "end start"],
  });
  const badgeY = useTransform(scrollYProgress, [0, 1], [4, -4]);

  const { location, tags: derived } = splitPlace(step.place);
  const tags = derived.length ? derived : (TAG_FALLBACK[step.tag] || []);

  return (
    <div
      className={`tl-card ${isNow ? "tl-now" : ""}`}
      style={{ "--nc": c1, "--nc-1": c1, "--nc-2": c2 }}
    >
      {/* header: badge · year + pill */}
      <div className="flex items-start gap-3.5 mb-3">
        <motion.span
          ref={badgeRef}
          className="tl-badge"
          style={{
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            "--badge-c1": c1,
            y: reduced ? 0 : badgeY,
          }}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" strokeWidth={2.1} />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="tl-year font-display font-bold text-2xl leading-none">{step.year}</span>
            <span className={`tl-period ${isNow ? "tl-live" : ""}`}>
              {isNow && <i aria-hidden="true" />}
              {step.period}
            </span>
          </div>
          <h3 className="font-display font-semibold text-text-primary text-base sm:text-lg mt-2 leading-snug">
            {step.title}
          </h3>
          {location && (
            <p className="font-mono text-[10px] text-text-muted mt-1 tracking-[0.06em] uppercase">
              {location}
            </p>
          )}
        </div>
      </div>

      <p className="font-body text-sm text-text-secondary leading-relaxed">{step.description}</p>

      {tags.length > 0 && (
        <div className="tl-tags" aria-label="Technologies involved">
          {tags.map((t) => (
            <span key={t} className="tl-tag">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
