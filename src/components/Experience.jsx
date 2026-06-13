import { useEffect, useRef } from "react";
import { usePortfolio } from "../context/PortfolioContext";

export default function Experience() {
  const { experience } = usePortfolio();
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const education = [
    { degree: "BS Software Engineering", school: "Riphah International University", location: "Islamabad, Pakistan", period: "Sep 2021 – Present", grade: "CGPA 4.0 / 4.0" },
  ];

  return (
    <section id="experience" ref={ref} className="py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-indigo/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="animate-on-scroll flex items-center gap-4 mb-16">
          <span className="section-label">Experience & Education</span>
          <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-accent-indigo/50 to-transparent" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="animate-on-scroll font-display font-semibold text-xl text-text-primary mb-8">Work Experience</h3>
            {experience.map((exp, i) => (
              <div key={i} className="animate-on-scroll relative pl-6" style={{ transitionDelay: `${0.1 * i}s` }}>
                <div className="timeline-line" />
                <div className="absolute left-[-3px] top-1 w-[7px] h-[7px] rounded-full bg-accent-indigo border border-bg-primary shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                <div className="card-border-glow rounded-2xl p-6 bg-bg-card mb-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-base">{exp.role}</h4>
                      <p className="font-body text-accent-indigo text-sm mt-0.5">{exp.company}</p>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted whitespace-nowrap mt-1">{exp.duration}</span>
                  </div>
                  <p className="font-mono text-[10px] text-text-muted mb-4">{exp.type}</p>
                  <ul className="space-y-2">
                    {exp.points.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 font-body text-sm text-text-secondary">
                        <span className="mt-[5px] w-1 h-1 rounded-full bg-accent-indigo/50 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="animate-on-scroll font-display font-semibold text-xl text-text-primary mb-8" style={{ transitionDelay: "0.05s" }}>Education</h3>
            {education.map((edu, i) => (
              <div key={i} className="animate-on-scroll relative pl-6" style={{ transitionDelay: `${0.15 + 0.1 * i}s` }}>
                <div className="timeline-line" />
                <div className="absolute left-[-3px] top-1 w-[7px] h-[7px] rounded-full bg-accent-cyan border border-bg-primary shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <div className="card-border-glow rounded-2xl p-6 bg-bg-card mb-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-base">{edu.degree}</h4>
                      <p className="font-body text-accent-cyan text-sm mt-0.5">{edu.school}</p>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted whitespace-nowrap mt-1">{edu.period}</span>
                  </div>
                  <p className="font-mono text-[10px] text-text-muted mb-4">{edu.location}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/25">
                    <span className="text-accent-cyan text-xs font-mono font-semibold">{edu.grade}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="animate-on-scroll mt-8 space-y-3" style={{ transitionDelay: "0.25s" }}>
              {[
                { icon: "🏆", text: "Perfect CGPA · All semesters" },
                { icon: "📜", text: "Certified Intern · Developer Hub Corp" },
                { icon: "🌐", text: "Live client deployment shipped" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-card border border-border-subtle">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-body text-sm text-text-secondary">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
