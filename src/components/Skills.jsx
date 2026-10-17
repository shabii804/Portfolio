import { useEffect, useRef } from "react";
import { usePortfolio } from "../hooks/usePortfolio";
import TechIcon from "./TechIcon";
import { iconSlugFor } from "./techIconAlias";

/* Restrained two-accent system (PRD: indigo→cyan only) — icons are lucide slugs now */
const categoryMeta = {
  Frontend: { icon: "code", color: "#818cf8" },
  Backend: { icon: "server", color: "#22d3ee" },
  Databases: { icon: "database", color: "#a5b4fc" },
  Languages: { icon: "binary", color: "#67e8f9" },
  Tools: { icon: "wrench", color: "#818cf8" },
  "Soft Skills": { icon: "handshake", color: "#22d3ee" },
};

/* Infinite moving rails: every skill that has a mark, deduped, split in two
   opposite-direction rows. Pure transform animation (GPU-friendly, mirrors the
   hero marquee pattern) and hidden from a11y trees — the grid below lists all. */
function SkillRails({ skills }) {
  const unique = [...new Set(skills.flatMap(([, items]) => items))];
  const iconed = unique.filter((s) => iconSlugFor(s));
  if (iconed.length < 8) return null;

  const rows = [
    { items: iconed.filter((_, i) => i % 2 === 0), d: "44s" },
    { items: iconed.filter((_, i) => i % 2 === 1), d: "56s" },
  ];

  return (
    <div className="skill-rails animate-on-scroll" style={{ transitionDelay: "0.15s" }} aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="skill-rail">
          <div className={`skill-rail-track ${r === 1 ? "rail-rev" : ""}`} style={{ "--rail-d": row.d }}>
            {[...row.items, ...row.items].map((skill, i) => (
              <span key={`${skill}-${i}`} className="skill-tile">
                <span className="tile-ico" style={{ color: i % 2 ? "#22d3ee" : "#818cf8" }}>
                  <TechIcon name={skill} className="w-5 h-5" />
                </span>
                <span className="tile-label">{skill}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
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
        <p className="animate-on-scroll font-body text-text-secondary text-lg mb-12 max-w-xl" style={{ transitionDelay: "0.1s" }}>
          Technologies I use to build, ship, and maintain real products — every one of them battle-tested in the projects below.
        </p>

        <SkillRails skills={Object.entries(skills)} />

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-9">
          {Object.entries(skills).map(([cat, items], i) => {
            const meta = categoryMeta[cat] || { icon: "boxes", color: "#818cf8" };
            return (
              <div key={cat} className="animate-on-scroll" style={{ transitionDelay: `${0.06 * i}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center" aria-hidden="true">
                    <TechIcon name={meta.icon} className="w-5 h-5" strokeWidth={1.8} />
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.15em] uppercase" style={{ color: meta.color }}>{cat}</span>
                  <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(to right, ${meta.color}40, transparent)` }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span key={skill} className="skill-chip font-mono text-xs px-3 py-1.5 rounded-lg cursor-default">
                      <TechIcon name={skill} className="chip-ico w-4 h-4" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* v21: ONE visualization rule — moving icon rails (above) + categorized
            chips (here) are the toolkit. The old self-assessed %-bars card was
            the third repetition of the same skills and is gone. */}
      </div>
    </section>
  );
}
