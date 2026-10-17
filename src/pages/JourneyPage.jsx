import Journey from "../components/Journey";
import PageNextNav from "../components/PageNextNav";
import CrossLinkBand from "../components/CrossLinkBand";
import Reveal from "../components/motion/Reveal";
import { Compass, GraduationCap, Briefcase, GitBranch } from "lucide-react";
import usePageSEO from "../hooks/usePageSEO";

/* ── v29 enrichment: the forward half of the timeline — honest goals,
      not invented achievements. ── */
const NEXT = [
  {
    Icon: GraduationCap,
    tint: "#818cf8",
    title: "Finish the degree strong",
    desc: "Final years of the BS in Software Engineering at Riphah International University — keeping the 4.0 CGPA while shipping client work on the side.",
  },
  {
    Icon: Briefcase,
    tint: "#34d399",
    title: "More live clients",
    desc: "Growing the portfolio of deployed, revenue-affecting systems — the Farooq Agencies model: real businesses, production uptime, measurable impact.",
  },
  {
    Icon: GitBranch,
    tint: "#22d3ee",
    title: "Contribute & document",
    desc: "More open-source contributions and written breakdowns of these builds — the same notes that power this site's case studies and the AI assistant.",
  },
];

export default function JourneyPage() {
  usePageSEO(
    "Journey — Shoaib Arshad",
    "The timeline, 2021 to now: BS Software Engineering at Riphah International University (CGPA 4.0), certified frontend internship at Developer Hub Corporation, and live client deployments."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">Journey — Shoaib Arshad</h1>
      <Journey />

      {/* v29 — what's next: the road ahead, phrased as goals */}
      <section className="section-y relative" aria-label="What's next">
        <div className="container-x">
          <header className="mb-10 max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent-cyan mb-3 flex items-center gap-2">
              <Compass size={13} strokeWidth={2} aria-hidden="true" /> 02 — The road ahead
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary leading-tight">
              The timeline is still <span className="text-gradient-indigo">being written.</span>
            </h2>
            <p className="font-body text-text-secondary text-lg mt-4">
              Where the next milestones are pointed — the honest version, not the pitch version.
            </p>
          </header>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {NEXT.map(({ Icon, tint, title, desc }, i) => (
              <Reveal key={title} delay={0.06 * i} className="h-full">
                <article className="h-full rounded-2xl border border-border-subtle bg-bg-card p-6 transition-all duration-300 hover:-translate-y-1">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl border mb-4"
                    style={{ color: tint, borderColor: `${tint}38`, background: `${tint}12` }}
                    aria-hidden="true"
                  >
                    <Icon size={19} strokeWidth={2} />
                  </span>
                  <h3 className="font-display font-semibold text-text-primary text-[15px] mb-2">{title}</h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">{desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CrossLinkBand
        title="The next milestone could be yours."
        accent="Claim it."
        text="Every past milestone ended in something shipped. Book a service and your project becomes the next entry on this timeline."
        primary={{ to: "/services", label: "Book a service" }}
        ghost={{ to: "/contact", label: "Just talk first" }}
        tint="#fbbf24"
      />

      <PageNextNav current="journey" />
    </div>
  );
}
