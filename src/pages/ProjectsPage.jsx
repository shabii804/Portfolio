import Projects from "../components/Projects";
import PageNextNav from "../components/PageNextNav";
import CrossLinkBand from "../components/CrossLinkBand";
import Reveal from "../components/motion/Reveal";
import usePageSEO from "../hooks/usePageSEO";
import { usePortfolio } from "../hooks/usePortfolio";

/* v29 — a compact stats band computed from the live data (no hardcoded
   counts to go stale when the admin adds or removes a project). */
function ProjectStats() {
  const { projects } = usePortfolio();
  if (!projects?.length) return null;

  const live = projects.filter((p) => p.live).length;
  const techs = new Set(projects.flatMap((p) => p.stack || [])).size;
  const stats = [
    { v: String(projects.length).padStart(2, "0"), l: "shipped builds" },
    { v: String(live).padStart(2, "0"), l: "live in production" },
    { v: `${techs}+`, l: "technologies across builds" },
  ];

  return (
    <Reveal className="mt-10">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border border-border-subtle bg-bg-card px-4 py-6 text-center">
            <div className="font-display font-bold text-2xl sm:text-3xl text-gradient-indigo leading-none">{s.v}</div>
            <div className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-widest mt-2.5 leading-relaxed">{s.l}</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export default function ProjectsPage() {
  usePageSEO(
    "Projects — Shoaib Arshad",
    "Every build in one archive: full case studies (Farooq Agencies, SpendSmart, E-Shop, School Management System) plus every public repo synced live from GitHub — searchable and filterable by stack."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">Projects — Shoaib Arshad</h1>
      <Projects />
      <ProjectStats />
      <CrossLinkBand
        title="Results like these are bookable."
        accent="Literally."
        text="The Services page turns these case studies into six bookable engagements — same stack, same working style, aimed at your project."
        primary={{ to: "/services", label: "Book a service" }}
        ghost={{ to: "/journey", label: "How I got here" }}
        tint="#fbbf24"
      />
      <PageNextNav current="projects" />
    </div>
  );
}
