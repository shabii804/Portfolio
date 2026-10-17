import Skills from "../components/Skills";
import PageNextNav from "../components/PageNextNav";
import CrossLinkBand from "../components/CrossLinkBand";
import Reveal from "../components/motion/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import usePageSEO from "../hooks/usePageSEO";

/* ── v29 enrichment: toolkit → product. Maps the three biggest skill clusters
      to what they actually produce, each linking to its proof + booking. ── */
const CLUSTERS = [
  {
    n: "01",
    tint: "#818cf8",
    title: "Web platforms",
    builds: "React · Tailwind · Node · Firebase · Supabase",
    out: "Complete products: storefronts, customer portals and dashboards with auth, real-time data and hosting — deployed, not demoed.",
    link: { to: "/projects", label: "Farooq Agencies & SpendSmart" },
  },
  {
    n: "02",
    tint: "#34d399",
    title: "Desktop systems",
    builds: "Java · SQL Server · Oracle",
    out: "Offline-capable software for schools, labs and shops where the cloud isn't an option — installers, local databases, full CRUD.",
    link: { to: "/projects", label: "School Management System" },
  },
  {
    n: "03",
    tint: "#fbbf24",
    title: "Data layer",
    builds: "Schema design · Queries · Firestore",
    out: "The invisible half of every build: normalized schemas, fast queries and sync rules that keep stock counts honest at 2am.",
    link: { to: "/journey", label: "Where this was learned" },
  },
];

export default function SkillsPage() {
  usePageSEO(
    "Skills & Toolkit — Shoaib Arshad",
    "The full toolkit: React, JavaScript, Tailwind, Node.js, Express, Firebase, Supabase, SQL Server, Oracle, Java, Flutter and more — six groups, 34 tools, with animated proficiency rails."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">Skills &amp; Toolkit — Shoaib Arshad</h1>
      <Skills />

      {/* v29 — toolkit → product: what each skill cluster builds */}
      <section className="section-y relative" aria-label="What the toolkit builds">
        <div className="container-x">
          <header className="mb-10 max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent-cyan mb-3">02 — Toolkit → product</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary leading-tight">
              What these numbers <span className="text-gradient-indigo">turn into.</span>
            </h2>
            <p className="font-body text-text-secondary text-lg mt-4">
              The proficiency rails above aren't a leaderboard — they map to shipped output in three clusters.
            </p>
          </header>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {CLUSTERS.map((c, i) => (
              <Reveal key={c.n} delay={0.06 * i} className="h-full">
                <article className="h-full rounded-2xl border border-border-subtle bg-bg-card p-6 flex flex-col transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-[11px]"
                      style={{ color: c.tint, borderColor: `${c.tint}38`, background: `${c.tint}12` }}
                      aria-hidden="true"
                    >
                      {c.n}
                    </span>
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider text-right">{c.builds}</span>
                  </div>
                  <h3 className="font-display font-semibold text-text-primary text-lg mb-2">{c.title}</h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed mb-5 flex-1">{c.out}</p>
                  <Link
                    to={c.link.to}
                    className="inline-flex items-center gap-2 font-mono text-[11px] transition-colors group"
                    style={{ color: c.tint }}
                    aria-label={`${c.link.label} — see the proof`}
                  >
                    {c.link.label}
                    <ArrowRight size={12} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CrossLinkBand
        title="Hire the whole toolkit at once."
        accent="One booking form."
        text="The Services page bundles these clusters into six bookable services — each with deliverables, timelines and production proof attached."
        primary={{ to: "/services", label: "Book a service" }}
        ghost={{ to: "/projects", label: "See the projects" }}
        tint="#fbbf24"
      />

      <PageNextNav current="skills" />
    </div>
  );
}
