import About from "../components/About";
import PageNextNav from "../components/PageNextNav";
import CrossLinkBand from "../components/CrossLinkBand";
import Reveal from "../components/motion/Reveal";
import usePageSEO from "../hooks/usePageSEO";

/* ── v29 enrichment: how I work — principles lifted from the shipped case
      studies (Farooq Agencies, SpendSmart, SMS), not invented maxims. ── */
const PRINCIPLES = [
  {
    n: "01",
    title: "Workflow first, code second",
    desc: "Before a single component exists, I map how the business actually runs — catalog, inquiry, order, restock. Farooq Agencies was drawn on paper before it was built in React.",
    tint: "#818cf8",
  },
  {
    n: "02",
    title: "Real users, early",
    desc: "Staging links and live deploys from week one, not a big reveal at the end. The medical platform ran in production while I was still iterating on it.",
    tint: "#22d3ee",
  },
  {
    n: "03",
    title: "Own the whole stack",
    desc: "UI, API, database, auth, hosting — one person accountable end to end. When something breaks at 11pm there is exactly one number to call, and it answers.",
    tint: "#34d399",
  },
  {
    n: "04",
    title: "Software adapts to people",
    desc: "The shop owner lived on WhatsApp, so orders route through WhatsApp instead of forcing him onto a new inbox. Adoption is a feature; habit is the spec.",
    tint: "#fbbf24",
  },
];

export default function AboutPage() {
  usePageSEO(
    "About — Shoaib Arshad | Full Stack Developer",
    "Who Shoaib Arshad is: a 4.0 CGPA Software Engineering student at Riphah International University building production-grade web apps with React, Node.js and Firebase — plus Java desktop systems for real business use."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">About — Shoaib Arshad</h1>
      <About />

      {/* v29 — how I work: the operating principles behind the case studies */}
      <section className="section-y relative" aria-label="How I work">
        <div className="container-x">
          <header className="mb-10 max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent-cyan mb-3">02 — Operating principles</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary leading-tight">
              How the work <span className="text-gradient-indigo">actually happens.</span>
            </h2>
            <p className="font-body text-text-secondary text-lg mt-4">
              Four rules distilled from shipped builds — the same ones that will shape your project.
            </p>
          </header>
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.n} delay={0.06 * i} className="h-full">
                <article className="h-full rounded-2xl border border-border-subtle bg-bg-card p-6 transition-all duration-300 hover:-translate-y-1" style={{ "--p-tint": p.tint }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-[11px]"
                      style={{ color: p.tint, borderColor: `${p.tint}38`, background: `${p.tint}12` }}
                      aria-hidden="true"
                    >
                      {p.n}
                    </span>
                    <h3 className="font-display font-semibold text-text-primary text-[15px]">{p.title}</h3>
                  </div>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">{p.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CrossLinkBand
        title="Want this working style on your project?"
        accent="It's bookable."
        text="Every service on the Services page runs on these same principles — scoped in writing, built with check-ins, handed over running."
        primary={{ to: "/services", label: "Browse services & book" }}
        ghost={{ to: "/projects", label: "See the proof first" }}
        tint="#fbbf24"
      />

      <PageNextNav current="about" />
    </div>
  );
}
