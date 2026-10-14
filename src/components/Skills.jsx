import { useEffect, useRef } from "react";
import { usePortfolio } from "../hooks/usePortfolio";

// Restrained two-accent system (PRD: indigo→cyan only)
const categoryMeta = {
  Frontend: { icon: "⚡", color: "#818cf8" },
  Backend: { icon: "🔧", color: "#22d3ee" },
  Databases: { icon: "🗄️", color: "#a5b4fc" },
  Languages: { icon: "⌨️", color: "#67e8f9" },
  Tools: { icon: "🛠️", color: "#818cf8" },
  "Soft Skills": { icon: "🤝", color: "#22d3ee" },
};

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
    <section id="skills" ref={ref} className="py-24 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-indigo/[0.015] to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="animate-on-scroll flex items-center gap-4 mb-4">
          <span className="section-label">Skills</span>
          <div className="grad-line flex-1 max-w-16" />
        </div>
        <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4" style={{ transitionDelay: "0.05s" }}>
          My toolkit.
        </h2>
        <p className="animate-on-scroll font-body text-text-secondary text-lg mb-14 max-w-xl" style={{ transitionDelay: "0.1s" }}>
          Technologies I use to build, ship, and maintain real products — every one of them battle-tested in the projects below.
        </p>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-9">
          {Object.entries(skills).map(([cat, items], i) => {
            const meta = categoryMeta[cat] || { icon: "●", color: "#818cf8" };
            return (
              <div key={cat} className="animate-on-scroll" style={{ transitionDelay: `${0.06 * i}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center text-sm" aria-hidden="true">{meta.icon}</span>
                  <span className="font-mono text-[11px] tracking-[0.15em] uppercase" style={{ color: meta.color }}>{cat}</span>
                  <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(to right, ${meta.color}40, transparent)` }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span key={skill} className="skill-chip font-mono text-xs px-3 py-1.5 rounded-lg cursor-default">{skill}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Core proficiencies */}
        <div className="animate-on-scroll card-border-glow card-glow-border mt-16 rounded-2xl p-6 md:p-8 bg-bg-card" style={{ transitionDelay: "0.35s" }}>
          <div className="flex items-center justify-between mb-7 flex-wrap gap-2">
            <h3 className="font-display font-semibold text-text-primary">Core proficiencies</h3>
            <span className="font-mono text-[10px] text-text-muted">self-assessed · honest numbers</span>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-5">
            {[
              { label: "React.js", pct: 90 },
              { label: "JavaScript (ES6+)", pct: 88 },
              { label: "Tailwind CSS", pct: 92 },
              { label: "Node.js / Express", pct: 80 },
              { label: "SQL / MSSQL", pct: 85 },
              { label: "Firebase / Supabase", pct: 84 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-body text-sm text-text-secondary">{item.label}</span>
                  <span className="font-mono text-xs text-text-muted">{item.pct}%</span>
                </div>
                <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.pct}%`,
                      background: "linear-gradient(90deg, #6366f1, #818cf8 55%, #22d3ee)",
                      transition: "width 1.2s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
