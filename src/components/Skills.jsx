import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePortfolio } from "../hooks/usePortfolio";
import TechIcon from "./TechIcon";
import { iconSlugFor } from "./techIconAlias";
import { brandColorFor } from "./brandColors";
import TiltCard from "./motion/TiltCard";
import { EASE_OUT } from "./motion/ease";

/* Restrained two-accent system (PRD: indigo→cyan only) — icons are lucide slugs */
const categoryMeta = {
  Frontend: { icon: "code", color: "#818cf8" },
  Backend: { icon: "server", color: "#22d3ee" },
  Databases: { icon: "database", color: "#a5b4fc" },
  Languages: { icon: "binary", color: "#67e8f9" },
  Tools: { icon: "wrench", color: "#818cf8" },
  "Soft Skills": { icon: "handshake", color: "#22d3ee" },
};

/* Real proficiency numbers — reused from the site's own historical
   "Core proficiencies" data (not invented). Shown in rail tooltips. */
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
                <span className="skill-group-badge" aria-hidden="true">
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
        <div className="animate-on-scroll flex items-center gap-4 mb-4">
          <span className="section-label">Skills</span>
          <div className="grad-line flex-1 max-w-16" />
        </div>
        <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4" style={{ transitionDelay: "0.05s" }}>
          My toolkit.
        </h2>
        <p className="animate-on-scroll font-body text-text-secondary text-lg mb-8 max-w-xl" style={{ transitionDelay: "0.1s" }}>
          Technologies I use to build, ship, and maintain real products — every one of them battle-tested in the projects below.
        </p>

        <SkillRails skills={Object.entries(skills)} />

        {/* v22: ONE visualization — marquee + categorized chips. Equal-height cards. */}
        <SkillGroups skills={skills} />
      </div>
    </section>
  );
}
