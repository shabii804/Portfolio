import { Link } from "react-router-dom";
import { useState } from "react";
import { Rocket, ArrowRight, Briefcase, Globe, LayoutDashboard, Monitor, Database, Wrench } from "lucide-react";
import Hero from "../components/Hero";
import About from "../components/About";
import Skills from "../components/Skills";
import Journey from "../components/Journey";
import Contact from "../components/Contact";
import GitHubActivity from "../components/GitHubActivity";
import SectionHeader from "../components/motion/SectionHeader";
import Reveal from "../components/motion/Reveal";
import { ProjectCard, CaseStudyModal } from "../components/Projects";
import usePageSEO from "../hooks/usePageSEO";
import useSiteSettings from "../hooks/useSiteSettings";
import { usePortfolio } from "../hooks/usePortfolio";
import { useGithubRepos } from "../hooks/useGithubRepos";
import { mapGithubRepos } from "../data/githubRepos";

/* ─────────────────────────────────────────────────────────────────────────────
   Home (v30) — back to the full one-pager experience, on top of the
   multi-page build.

   The landing page shows ALL the content again, in the original PRD order:
   Hero → About (01) → Skills (02) → Projects (03, the 4 admin-featured
   builds) → Journey (04) → GitHub Activity (05) → Contact (06).

   Each inline section is followed by a slim deep-link pill into the page
   that carries the extended version of that story (operating principles,
   toolkit→product map, search over every case study, the road ahead) —
   so the separate pages add depth instead of replacing the landing page.
   ────────────────────────────────────────────────────────────────────────── */

/* Slim pill between sections: "the landing page shows the story, the page
   holds the whole archive". Sits centered in the natural inter-section
   whitespace (negative top margin lands it inside the section-y gap). */
function DeepLink({ to, extra, label, tint = "#818cf8" }) {
  return (
    <Reveal className="container-x relative z-10 -mt-8 md:-mt-10">
      <div className="flex justify-center">
        <Link
          to={to}
          data-deeplink={to}
          className="group inline-flex max-w-full items-center gap-3 rounded-full border border-border-subtle bg-bg-card/80 px-5 py-2.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-indigo/50 focus-visible:outline-none focus-visible:border-accent-indigo/70"
        >
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {extra}
          </span>
          <span aria-hidden="true" className="hidden sm:block h-3 w-px" style={{ background: `${tint}45` }} />
          <span className="font-display font-semibold text-sm text-text-primary transition-colors group-hover:text-accent-indigo">
            {label}
          </span>
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:translate-x-0.5"
            style={{ borderColor: `${tint}45`, color: tint }}
            aria-hidden="true"
          >
            <ArrowRight size={12} strokeWidth={2.5} />
          </span>
        </Link>
      </div>
    </Reveal>
  );
}

/* ── Projects (03) — the admin-curated landing strip. Reads the `featured`
      flag from /admin → Projects; falls back to the first four.
      v32 — closes with a clear "See More" primary button into the full
      archive (case studies + the live-synced GitHub catalog). */
function FeaturedWork() {
  const { projects } = usePortfolio();
  const { repos: ghRaw } = useGithubRepos();
  const [selected, setSelected] = useState(null);

  const flagged = projects.filter((p) => p.featured);
  const list = (flagged.length ? flagged : projects).slice(0, 4);
  const ghCount = mapGithubRepos(
    ghRaw,
    new Set(projects.map((p) => (p.github || "").replace(/\/$/, "").toLowerCase()).filter(Boolean))
  ).length;
  if (!list.length) return null;

  return (
    <section id="work" className="section-y relative" aria-label="Projects">
      <div className="container-x">
        <SectionHeader
          index="03"
          icon={Rocket}
          tint="#f472b6"
          label="Projects"
          title="The builds I'd show first."
          accent={["first."]}
          subtitle={list.length < projects.length
            ? `Four favourites out of ${projects.length} shipped case studies — open any card for the full problem → approach → outcome story.`
            : `All ${projects.length} shipped case studies — open any card for the full problem → approach → outcome story.`}
        />
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {list.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onClick={() => setSelected(p)} />
          ))}
        </div>
        <Reveal className="mt-10 flex flex-col items-center gap-3">
          <Link
            to="/projects"
            data-testid="see-more-projects"
            className="btn-primary px-8 py-3.5 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2.5 group glow-on-hover"
          >
            See More Projects
            <span className="font-mono text-[10px] opacity-75">
              {projects.length} case studies + {ghCount} on GitHub
            </span>
            <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <span className="font-mono text-[10px] text-text-muted">
            full archive — searchable, filterable, live-synced from GitHub
          </span>
        </Reveal>
      </div>
      {selected && <CaseStudyModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

/* ── Services (06, v32) — the bookable catalog comes to the landing page.
      Six compact tiles (admin-editable via /admin → Services), each one a
      deep link into the booking flow on /services. Same icon keys as the
      /services catalog and the admin ServicesTab. */
const TEASER_ICONS = {
  globe: Globe,
  "layout-dashboard": LayoutDashboard,
  monitor: Monitor,
  database: Database,
  rocket: Rocket,
  wrench: Wrench,
  briefcase: Briefcase,
};

function ServiceTile({ service: s }) {
  const Icon = TEASER_ICONS[s.icon] || Briefcase;
  return (
    <Link
      to="/services"
      className="group card-border-glow rounded-2xl p-5 bg-bg-card border border-border-subtle flex flex-col gap-3 h-full transition-all duration-300 hover:-translate-y-1"
      style={{ "--glow": s.tint }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{ background: `${s.tint}14`, border: `1px solid ${s.tint}35`, color: s.tint }}
        >
          <Icon size={18} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="font-mono text-[9px] px-2 py-1 rounded-full border border-border-mid text-text-muted whitespace-nowrap">
          {s.timeline}
        </span>
      </div>
      <div>
        <h3 className="font-display font-semibold text-[15px] text-text-primary leading-snug mb-1 transition-colors duration-300" style={{ "--hover": s.tint }}>
          {s.title}
        </h3>
        <p className="font-body text-xs text-text-secondary leading-relaxed line-clamp-2">{s.tagline}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-1 border-t border-border-subtle/60">
        <span className="font-mono text-[9px] text-text-muted truncate">{s.proof}</span>
        <span className="font-mono text-[10px] font-semibold flex items-center gap-1 flex-shrink-0 transition-all duration-300 group-hover:gap-2" style={{ color: s.tint }}>
          Book
          <ArrowRight size={11} strokeWidth={2.5} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function ServicesTeaser() {
  const { services } = usePortfolio();
  if (!services?.length) return null;

  return (
    <section id="services" className="section-y relative" aria-label="Services">
      <div className="container-x">
        <SectionHeader
          index="06"
          icon={Briefcase}
          tint="#fbbf24"
          label="Services"
          title="Like the work? Book it."
          accent={["Book"]}
          subtitle="Fixed-scope engagements distilled from these case studies — same stack, same working style, aimed at your project."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
              <ServiceTile service={s} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 flex justify-center">
          <Link
            to="/services"
            className="btn-primary px-7 py-3 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2.5 group glow-on-hover"
          >
            Book a Service
            <span className="font-mono text-[10px] opacity-75">booking form on /services</span>
            <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );}

export default function Home() {
  const settings = useSiteSettings();

  usePageSEO(
    settings.seoTitle || "Shoaib Arshad — Full Stack Developer | React, Node.js, Java, Flutter",
    settings.seoDescription ||
      "Full Stack Developer building production-grade web apps (React, Node.js, Firebase), Java desktop systems and Flutter apps. CGPA 4.0 Software Engineering student at Riphah International University, Islamabad."
  );

  return (
    <>
      <Hero />

      {/* 01 — About, inline as before; the /about page adds the operating principles */}
      <About />
      <DeepLink to="/about" extra="About — extended" label="The full story & how I work" tint="#818cf8" />

      {/* 02 — Skills, inline; the /skills page adds the toolkit → product map */}
      <Skills />
      <DeepLink to="/skills" extra="Skills — extended" label="Every tool, in numbers" tint="#22d3ee" />

      {/* 03 — Projects: the four admin-featured builds */}
      <FeaturedWork />

      {/* 04 — Journey, inline; the /journey page adds the road ahead */}
      <Journey />
      <DeepLink to="/journey" extra="Journey — extended" label="The full timeline & what's next" tint="#34d399" />

      {/* 05 — live GitHub proof */}
      {settings.showGitHubActivity !== false && <GitHubActivity />}

      {/* 06 — Services teaser (v32): the bookable catalog, deep-linking into
          the full /services page with its process + booking form */}
      <ServicesTeaser />

      {/* 07 — Contact, inline as the closing section (the old one-pager ending) */}
      <Contact />
    </>
  );
}
