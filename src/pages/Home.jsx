import { Link } from "react-router-dom";
import { useState } from "react";
import { User, Zap, Rocket, Milestone, Briefcase, Mail, ArrowUpRight, ArrowRight } from "lucide-react";
import Hero from "../components/Hero";
import GitHubActivity from "../components/GitHubActivity";
import SectionHeader from "../components/motion/SectionHeader";
import Reveal from "../components/motion/Reveal";
import { ProjectCard, CaseStudyModal } from "../components/Projects";
import usePageSEO from "../hooks/usePageSEO";
import useSiteSettings from "../hooks/useSiteSettings";
import { usePortfolio } from "../hooks/usePortfolio";
import { content } from "../data/portfolio";

/* ─────────────────────────────────────────────────────────────────────────────
   Home (v29) — the landing page of the multi-site build.

   Hero (unchanged, full cinematic treatment) → Explore grid (six door-cards
   into the sub-pages) → Selected work (the admin-featured projects, same
   bento cards + case-study modals as the Projects page) → GitHub Activity
   (live proof) → contact CTA band.
   ────────────────────────────────────────────────────────────────────────── */

const EXPLORE = [
  {
    to: "/about",
    index: "01",
    Icon: User,
    tint: "#818cf8",
    title: "About",
    desc: "The person behind the code — story, focus areas, and a terminal you can actually type into.",
    stat: "4.0 CGPA · Riphah University",
  },
  {
    to: "/skills",
    index: "02",
    Icon: Zap,
    tint: "#22d3ee",
    title: "Skills",
    desc: "Six groups, 34 tools, animated proficiency rails and the real numbers behind each one.",
    stat: "6 groups · 34 tools",
  },
  {
    to: "/projects",
    index: "03",
    Icon: Rocket,
    tint: "#f472b6",
    title: "Projects",
    desc: "Every production build with full case studies — search, filter, and open the whole story.",
    stat: "4 shipped · 2 live in production",
  },
  {
    to: "/services",
    index: "04",
    Icon: Briefcase,
    tint: "#fbbf24",
    title: "Services",
    desc: "Six ways to hire me — full-stack apps, dashboards, Java desktop tools — with a booking form built in.",
    stat: "6 services · book directly",
  },
  {
    to: "/journey",
    index: "05",
    Icon: Milestone,
    tint: "#34d399",
    title: "Journey",
    desc: "From first semester to certified intern — a scroll-driven timeline, milestone by milestone.",
    stat: "2021 → now",
  },
  {
    to: "/contact",
    index: "06",
    Icon: Mail,
    tint: "#818cf8",
    title: "Contact",
    desc: "Every channel that reaches me — form, WhatsApp, email — answered from Islamabad.",
    stat: "Form · WhatsApp · email",
  },
];

function ExploreCard({ to, index, Icon, tint, title, desc, stat, delay }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        to={to}
        className="exp-card group relative flex h-full flex-col rounded-2xl border border-border-subtle bg-bg-card p-6 md:p-7 transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:border-accent-indigo/60"
        style={{ "--exp-tint": tint }}
        aria-label={`${title} — open page`}
      >
        <div className="flex items-start justify-between mb-6">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110"
            style={{ color: tint, borderColor: `${tint}38`, background: `${tint}12` }}
            aria-hidden="true"
          >
            <Icon size={19} strokeWidth={2} />
          </span>
          <span className="font-mono text-[11px] tracking-[0.2em]" style={{ color: `${tint}b0` }}>
            {index}
          </span>
        </div>

        <h3 className="font-display font-bold text-xl text-text-primary mb-2 group-hover:text-accent-indigo transition-colors">
          {title}
        </h3>
        <p className="font-body text-sm text-text-secondary leading-relaxed mb-5 flex-1">
          {desc}
        </p>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border-subtle">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {stat}
          </span>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-hover:rotate-45"
            style={{ borderColor: `${tint}45`, color: tint }}
            aria-hidden="true"
          >
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

/* ── Selected work — the admin-curated landing strip (v29). Reads the
      `featured` flag from /admin → Projects; falls back to the first four. */
function SelectedWork() {
  const { projects } = usePortfolio();
  const [selected, setSelected] = useState(null);

  const flagged = projects.filter((p) => p.featured);
  const list = (flagged.length ? flagged : projects).slice(0, 4);
  if (!list.length) return null;

  return (
    <section id="work" className="section-y relative" aria-label="Selected work">
      <div className="container-x">
        <SectionHeader
          index="02"
          icon={Rocket}
          tint="#f472b6"
          label="Selected Work"
          title="The builds I'd show first."
          accent={["first."]}
          subtitle="Hand-picked case studies — open any card for the full problem → approach → outcome story."
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

  const firstName = content?.personal?.name?.split(" ")[0] || "Shoaib";

  return (
    <>
      <Hero />

      {/* Explore — the six rooms of the site */}
      <section id="explore" className="section-y relative" aria-label="Explore the site">
        <div className="container-x">
          <SectionHeader
            index="01"
            icon={Milestone}
            tint="#818cf8"
            label="Explore"
            title={`Six rooms, one ${firstName}.`}
            accent={["rooms,"]}
            subtitle="The portfolio now lives on its own pages — pick a door and walk in."
          />
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {EXPLORE.map((card, i) => (
              <ExploreCard key={card.to} {...card} delay={0.06 * i} />
            ))}
          </div>
        </div>
      </section>

      <SelectedWork />

      {settings.showGitHubActivity !== false && <GitHubActivity index="03" />}

      {/* CTA band — the last door */}
      <section className="section-y relative" aria-label="Contact call to action">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-accent-indigo/25 bg-gradient-to-br from-accent-indigo/[0.13] via-bg-card to-accent-cyan/[0.07] px-6 py-12 md:px-14 md:py-16 text-center">
              <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-accent-indigo/15 blur-[100px] pointer-events-none" aria-hidden="true" />
              <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-accent-cyan/10 blur-[100px] pointer-events-none" aria-hidden="true" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-secondary/70 border border-border-subtle mb-6">
                  <span className={`w-1.5 h-1.5 rounded-full ${content?.personal?.available ? "bg-emerald-400 animate-pulse" : "bg-text-muted"}`} aria-hidden="true" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                    {content?.personal?.available ? "Available for opportunities" : "Currently unavailable"}
                  </span>
                </div>

                <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-[42px] leading-tight text-text-primary mb-4">
                  Have an idea <span className="text-gradient-indigo">worth building?</span>
                </h2>
                <p className="font-body text-text-secondary text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
                  Internships, junior roles, freelance builds — if it ships to real users,
                  I want to hear about it. Tell me what you're making.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/contact"
                    className="btn-primary px-6 py-3.5 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2.5 group glow-on-hover"
                  >
                    Start a conversation
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/projects"
                    className="btn-ghost px-6 py-3.5 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2 glow-on-hover"
                  >
                    See the work first
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
