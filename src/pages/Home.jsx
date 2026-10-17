import { Link } from "react-router-dom";
import { useState } from "react";
import { Rocket, ArrowRight } from "lucide-react";
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
      flag from /admin → Projects; falls back to the first four. */
function FeaturedWork() {
  const { projects } = usePortfolio();
  const [selected, setSelected] = useState(null);

  const flagged = projects.filter((p) => p.featured);
  const list = (flagged.length ? flagged : projects).slice(0, 4);
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
        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/projects"
            className="btn-ghost px-6 py-3 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2.5 group glow-on-hover"
          >
            Browse the full archive
            <span className="font-mono text-[10px] text-text-muted">{projects.length} case studies</span>
            <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
      {selected && <CaseStudyModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

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

      {/* 06 — Contact, inline as the closing section (the old one-pager ending) */}
      <Contact />
    </>
  );
}
