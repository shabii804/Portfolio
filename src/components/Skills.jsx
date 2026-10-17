import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Code2 } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import TechIcon from "./TechIcon";
import { iconSlugFor } from "./techIconAlias";
import { brandColorFor } from "./brandColors";
import TiltCard from "./motion/TiltCard";
import SectionHeader from "./motion/SectionHeader";
import { EASE_OUT } from "./motion/ease";

/* Restrained two-accent system (PRD: indigo→cyan only) — icons are lucide slugs */
/* v23 — six-hue category coding: each group owns a color (badge tint,
   header text, divider wash) instead of the old indigo/cyan monocolor */
const categoryMeta = {
  Frontend: { icon: "code", color: "#22d3ee" },
  Backend: { icon: "server", color: "#34d399" },
  Databases: { icon: "database", color: "#fbbf24" },
  Languages: { icon: "binary", color: "#a78bfa" },
  Tools: { icon: "wrench", color: "#f472b6" },
  "Soft Skills": { icon: "handshake", color: "#60a5fa" },
};

/* Real proficiency numbers — the site's own historical "Core proficiencies"
   data (not invented). v24: rendered as shimmer-fill + count-up bars. */
const LEVELS = {
  "React.js": 90,
  "JavaScript (ES6+)": 88,
  "JavaScript": 88,
  "Tailwind CSS": 92,
  "Node.js": 80,
  "Express.js": 80,
  "SQL": 85,
  "Microsoft SQL Server": 85,
  "Firebase": 84,
  "Supabase": 84,
};

/* v24 — the six core bars (real percentages, one proficiency visualization) */
const CORE_PROFICIENCIES = [
  { name: "React.js", pct: 90 },
  { name: "Tailwind CSS", pct: 92 },
  { name: "JavaScript", pct: 88 },
  { name: "Node.js", pct: 80 },
  { name: "SQL", pct: 85 },
  { name: "Firebase", pct: 84 },
];

function ProfBar({ name, pct, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const label = useTransform(mv, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(mv, pct, { duration: reduced ? 0 : 1.15, ease: EASE_OUT, delay: reduced ? 0 : 0.2 + delay });
    return () => controls.stop();
  }, [inView, pct, reduced, delay, mv]);

  return (
    <div ref={ref} className={`prof-bar${inView ? " visible" : ""}`} role="img" aria-label={`${name} proficiency ${pct} percent`}>
      <div className="prof-row">
        <span className="prof-ico" aria-hidden="true"><TechIcon name={name} className="w-4 h-4" /></span>
        <span className="prof-name">{name}</span>
        <motion.span className="prof-pct" aria-hidden="true">{label}</motion.span>
      </div>
      <div className="prof-track" aria-hidden="true">
        <motion.div
          className="prof-fill"
          initial={reduced ? false : { width: 0 }}
          animate={inView ? { width: `${pct}%` } : undefined}
          style={reduced ? { width: `${pct}%` } : undefined}
          transition={{ duration: reduced ? 0 : 1.15, ease: EASE_OUT, delay: reduced ? 0 : 0.2 + delay }}
        />
      </div>
    </div>
  );
}

function ProficiencyBars() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="prof-block"
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      <div className="prof-head">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo" aria-hidden="true" />
        Core proficiency
        <span className="grad-line flex-1 max-w-24" aria-hidden="true" />
      </div>
      <div className="prof-grid">
        {CORE_PROFICIENCIES.map((s, i) => (
          <ProfBar key={s.name} name={s.name} pct={s.pct} delay={i * 0.08} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkillRails — infinite two-row marquee, opposite directions, edge fade mask,
   pauses on hover (all pre-existing). v22 upgrade: spring hover on the mark
   itself (lift −6px · scale 1.15 · glow in the brand's own color) + a tooltip
   with the skill name and level/category.
   ────────────────────────────────────────────────────────────────────────── */
function SkillRails({ skills }) {
  const reduced = useReducedMotion();
  const catOf = new Map(skills.flatMap(([cat, items]) => items.map((s) => [s, cat])));
  const unique = [...new Set(skills.flatMap(([, items]) => items))];
  const iconed = unique.filter((s) => iconSlugFor(s));
  if (iconed.length < 8) return null;

  const rows = [
    { items: iconed.filter((_, i) => i % 2 === 0), d: "44s" },
    { items: iconed.filter((_, i) => i % 2 === 1), d: "56s" },
  ];

  const spring = { type: "spring", stiffness: 300, damping: 18 };

  return (
    <div className="skill-rails animate-on-scroll" style={{ transitionDelay: "0.15s" }} aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="skill-rail">
          <div className={`skill-rail-track ${r === 1 ? "rail-rev" : ""}`} style={{ "--rail-d": row.d }}>
            {[...row.items, ...row.items].map((skill, i) => {
              const slug = iconSlugFor(skill);
              const brand = brandColorFor(slug);
              const lvl = LEVELS[skill];
              const tip = lvl != null ? `${lvl}%` : (catOf.get(skill) || "Skill");
              return (
                <span key={`${skill}-${i}`} className="skill-tile">
                  <motion.span
                    className="tile-ico"
                    style={{ color: i % 2 ? "#22d3ee" : "#818cf8" }}
                    whileHover={reduced ? undefined : { y: -6, scale: 1.15, filter: `drop-shadow(0 6px 14px ${brand}66)` }}
                    transition={spring}
                  >
                    <TechIcon name={skill} className="w-5 h-5" />
                  </motion.span>
                  <span className="tile-label">{skill}</span>
                  <span className="rail-tip" role="tooltip">
                    <b>{skill}</b> · {tip}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Category groups — equal-height premium cards (CSS grid + items-stretch),
   44px icon badges, 20px chip marks, cursor spotlight + ≤6° tilt (desktop),
   staggered entry 40ms / fade + rise 12px / once per page load.
   ONE visualization rule: these chips + the marquee above. No bars card.
   ────────────────────────────────────────────────────────────────────────── */
const groupVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

function SkillGroups({ skills }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
      variants={groupVariants}
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true, amount: 0.2 }}
    >
      {Object.entries(skills).map(([cat, items]) => {
        const meta = categoryMeta[cat] || { icon: "boxes", color: "#818cf8" };
        return (
          <motion.div key={cat} variants={reduced ? undefined : cardVariants} className="min-h-0">
            <TiltCard className="skill-group h-full" tabIndex={0} aria-label={`${cat} skills`}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="skill-group-badge"
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(135deg, ${meta.color}26, ${meta.color}0d)`,
                    borderColor: `${meta.color}55`,
                    color: meta.color,
                  }}
                >
                  <TechIcon name={meta.icon} className="w-6 h-6" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[11px] tracking-[0.15em] uppercase truncate" style={{ color: meta.color }}>
                    {cat}
                  </div>
                  <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase">
                    {items.length} skills
                  </div>
                </div>
                <div className="h-px flex-1 min-w-4" style={{ background: `linear-gradient(to right, ${meta.color}40, transparent)` }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span key={skill} className="skill-chip font-mono text-xs px-3 py-1.5 rounded-lg cursor-default">
                    <TechIcon name={skill} className="chip-ico w-5 h-5" />
                    {skill}
                  </span>
                ))}
              </div>
            </TiltCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function Skills() {
  const { skills } = usePortfolio();
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" ref={ref} className="section-y relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-indigo/[0.015] to-transparent pointer-events-none" />
      <div className="container-x">
        <SectionHeader
          index="02"
          icon={Code2}
          tint="#22d3ee"
          label="Skills"
          title="Technologies I build with."
          accent={["build", "with"]}
          subtitle="Technologies I use to build, ship, and maintain real products — every one of them battle-tested in the projects below."
        />

        <SkillRails skills={Object.entries(skills)} />

        <ProficiencyBars />

        {/* v24: marquee + core bars + categorized chips — the spec'd trio */}
        <div className="mt-9">
          <SkillGroups skills={skills} />
        </div>
      </div>
    </section>
  );
}
