import { useRef } from "react";
import { GraduationCap, MonitorSmartphone, Layers, Briefcase, Rocket, Sparkles } from "lucide-react";
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
  Education: { Icon: GraduationCap, c1: "#6366f1", c2: "#8b5cf6" },
  Desktop: { Icon: MonitorSmartphone, c1: "#0ea5e9", c2: "#22d3ee" },
  "Full-Stack": { Icon: Layers, c1: "#6366f1", c2: "#22d3ee" },
  Internship: { Icon: Briefcase, c1: "#f59e0b", c2: "#f97316" },
  "Client Work": { Icon: Rocket, c1: "#22d3ee", c2: "#10b981" },
  Next: { Icon: Sparkles, c1: "#8b5cf6", c2: "#ec4899" },
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
    <div className={`tl-card ${isNow ? "tl-now" : ""}`}>
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
            <span className="font-display font-bold text-2xl leading-none text-gradient-indigo">{step.year}</span>
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
