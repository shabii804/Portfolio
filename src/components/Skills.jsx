import { useEffect, useRef } from "react";
import { usePortfolio } from "../context/PortfolioContext";

const categoryMeta = {
  Frontend: { icon: "⚡", color: "#818cf8" },
  Backend: { icon: "🔧", color: "#22d3ee" },
  Databases: { icon: "🗄️", color: "#a78bfa" },
  Languages: { icon: "💬", color: "#34d399" },
  Tools: { icon: "🛠️", color: "#f59e0b" },
  "Soft Skills": { icon: "🤝", color: "#ec4899" },
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
    <section id="skills" ref={ref} className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="animate-on-scroll flex items-center gap-4 mb-4">
          <span className="section-label">Skills</span>
          <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-accent-indigo/50 to-transparent" />
        </div>
        <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4" style={{ transitionDelay: "0.05s" }}>
          My toolkit.
        </h2>
        <p className="animate-on-scroll font-body text-text-secondary text-lg mb-14 max-w-xl" style={{ transitionDelay: "0.1s" }}>
          Technologies I use to build, ship, and maintain real products.
        </p>

        <div className="space-y-8">
          {Object.entries(skills).map(([cat, items], i) => {
            const meta = categoryMeta[cat] || { icon: "●", color: "#818cf8" };
            return (
              <div key={cat} className="animate-on-scroll" style={{ transitionDelay: `${0.07 * i}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">{meta.icon}</span>
                  <span className="font-mono text-xs tracking-widest uppercase" style={{ color: meta.color + "cc" }}>{cat}</span>
                  <div className="h-px flex-1 max-w-32" style={{ background: `linear-gradient(to right, ${meta.color}30, transparent)` }} />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {items.map((skill) => (
                    <span key={skill} className="skill-chip font-mono text-xs px-3 py-1.5 rounded-lg cursor-default">{skill}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="animate-on-scroll mt-16 card-border-glow rounded-2xl p-8 bg-bg-card" style={{ transitionDelay: "0.4s" }}>
          <h3 className="font-display font-semibold text-text-primary mb-6">Core proficiencies</h3>
          <div className="space-y-5">
            {[
              { label: "React.js", pct: 90, color: "#818cf8" },
              { label: "Tailwind CSS", pct: 92, color: "#a78bfa" },
              { label: "JavaScript", pct: 88, color: "#f59e0b" },
              { label: "Supabase / Firebase", pct: 84, color: "#34d399" },
              { label: "Node.js / Express", pct: 80, color: "#22d3ee" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-body text-sm text-text-secondary">{item.label}</span>
                  <span className="font-mono text-xs text-text-muted">{item.pct}%</span>
                </div>
                <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: `linear-gradient(90deg, ${item.color}90, ${item.color})`, transition: "width 1.2s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
