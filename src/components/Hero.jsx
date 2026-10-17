import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePortfolio } from "../hooks/usePortfolio";
import { defaultSkills } from "../data/portfolio";
import HeroVideo from "./HeroVideo";
import TechIcon from "./TechIcon";
import { heroBackgroundConfig } from "../data/heroMedia";
import SplitText from "./SplitText";
import { useCountUp, useMagnetic, useScrollParallax } from "../hooks/heroMotion";

// Flat list of every skill across categories, for the hero marquee strip
const FLAT_SKILLS = Object.values(defaultSkills).flat();

// Animated stat number — counts up once visible (reduced motion: instant)
function StatValue({ num, decimals = 0, suffix = "", delay = 0 }) {
  const value = useCountUp(num, { decimals, delay });
  return (
    <>
      {value}
      {suffix}
    </>
  );
}

/** True once the preloader has lifted (html.is-ready / "sa:ready" event). */
function useReady() {
  const [ready, setReady] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("is-ready")
  );
  useEffect(() => {
    const onReady = () => setReady(true);
    window.addEventListener("sa:ready", onReady);
    return () => window.removeEventListener("sa:ready", onReady);
  }, []);
  return ready;
}

export default function Hero() {
  const { personal } = usePortfolio();
  const navigate = useNavigate();
  const ready = useReady();
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const magneticPrimary = useMagnetic();
  const magneticCv = useMagnetic();
  const magneticTalk = useMagnetic();
  // Exit choreography: copy drifts up with the scroll and fades while the
  // video behind it scales 1→1.15 in HeroVideo. NO blur — a filter blur on
  // the copy container smeared the text/buttons during (and after) scrolls.
  const parallaxRef = useScrollParallax({ rate: 0.08, fade: 0.55, blur: 0 });
  // Admin toggle (content.media.heroBackground.enabled) — when the background
  // is off the section drops the cinema-dark scope and shows theme tokens.
  const heroMediaOn = heroBackgroundConfig().enabled !== false;

  // Typewriter — starts only after the preloader lifts so the reveal is clean
  useEffect(() => {
    if (!ready) return;
    const roles = personal.roles;
    const current = roles[roleIdx];
    const speed = isDeleting ? 42 : 82;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(current.slice(0, displayed.length + 1));
        if (displayed.length + 1 === current.length) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        setDisplayed(current.slice(0, displayed.length - 1));
        if (displayed.length === 0) {
          setIsDeleting(false);
          setRoleIdx((i) => (i + 1) % roles.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [ready, displayed, isDeleting, roleIdx, personal.roles]);

  return (
    <section
      id="home"
      className={`${heroMediaOn ? "hero-video-active " : ""}relative min-h-[92svh] flex items-center justify-center overflow-hidden pt-24 md:pt-20 pb-10`}
    >
      {/* Cinematic video background — "floating code" clip + scrims +
          animated motion icons. Replaces the previous 3D/particle layers:
          one hero, one animation, zero loop contention. */}
      <HeroVideo />

      {/* Copy-side legibility veil — keeps text/CTAs/stats readable over any
          footage (dark radial behind the copy column + bottom melt) */}
      {heroMediaOn && <div className="hero-copy-veil" aria-hidden="true" />}

      {/* Main content (outer layer takes the scroll-parallax exit).
          z-10: the parallax transform creates a stacking context, so without
          an explicit z this whole column would paint BELOW the bottom-melt
          gradient sibling — washing the stats panel out in light theme. */}
      <div ref={parallaxRef} className="hero-parallax relative z-10 w-full">
        <div className="relative z-10 container-x w-full">
          <div className={`text-center lg:text-left hero-gate ${ready ? "is-ready" : ""} lg:max-w-[54%]`}>
            {/* Availability badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/[0.12] border border-emerald-500/30 backdrop-blur-md mb-5" style={{ "--d": "0s" }}>
                <div className="relative flex h-2 w-2">
                  <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </div>
                <span className="font-mono text-[10px] font-semibold text-emerald-300 uppercase tracking-widest">
                  {personal.available ? "Available for opportunities" : "Currently unavailable"}
                </span>
              </div>

              {/* Greeting */}
              <div className="hidden lg:flex items-center gap-2 mb-4" style={{ "--d": "0.1s" }}>
                <span className="font-mono text-accent-indigo/60 text-sm font-semibold">~/</span>
                <span className="font-mono text-accent-indigo text-xs uppercase tracking-[0.2em] font-semibold">
                  Hi there, I'm
                </span>
              </div>

              {/* Name — mask reveal, word by word */}
              <h1 className="font-display font-bold leading-[0.95] tracking-tight mb-4" style={{ "--d": "0.18s" }}>
                <span className="name-mask name-mask-a">
                  <span className="name-line text-[clamp(38px,5.2vw,60px)] text-text-primary">{personal.name.split(" ")[0]}</span>
                </span>
                <span className="name-mask name-mask-b">
                  <span className="name-line text-[clamp(38px,5.2vw,60px)] text-shimmer">
                    {personal.name.split(" ").slice(1).join(" ")}.
                  </span>
                </span>
              </h1>

              {/* Typewriter role line */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-3.5" style={{ "--d": "0.4s" }}>
                <span className="font-mono text-accent-cyan/50 text-sm select-none">▶</span>
                <div className="font-display text-base sm:text-xl font-medium text-text-secondary min-h-[24px] sm:min-h-[28px]">
                  {displayed}
                  <span className="inline-block w-[2px] h-[16px] sm:h-[19px] bg-accent-indigo/80 ml-0.5 animate-blink align-middle rounded-full" />
                </div>
              </div>

              {/* Split-text statement — word-by-word masked slide-up */}
              <SplitText
                text="I build things that live on screens."
                accent={["build", "screens."]}
                ready={ready}
                delay={0.35}
                className="font-display text-lg sm:text-xl font-semibold text-text-secondary mb-4 justify-center lg:justify-start"
              />

              {/* Bio */}
              <p
                className="font-body text-text-secondary text-[15px] sm:text-base leading-relaxed mb-7 max-w-lg mx-auto lg:mx-0"
                style={{ "--d": "0.48s" }}
              >
                {personal.bio}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-7" style={{ "--d": "0.56s" }}>
                <button
                  ref={magneticPrimary}
                  onClick={() => navigate("/projects")}
                  className="magnetic btn-primary px-5 py-3 rounded-xl font-display font-semibold text-sm flex items-center gap-2.5 group glow-on-hover"
                >
                  View My Work
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
                <a
                  ref={magneticCv}
                  href={personal.resumePdf}
                  download
                  className="magnetic btn-ghost px-5 py-3 rounded-xl font-display font-semibold text-sm flex items-center gap-2 group glow-on-hover"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-y-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download CV
                </a>
                <button
                  ref={magneticTalk}
                  onClick={() => navigate("/contact")}
                  className="magnetic btn-ghost px-5 py-3 rounded-xl font-display font-semibold text-sm group flex items-center gap-2 glow-on-hover"
                >
                  Let's Talk
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Socials */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-5" style={{ "--d": "0.64s" }}>
                {[
                  { label: "GitHub", href: personal.github, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg> },
                  { label: "LinkedIn", href: personal.linkedin, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg> },
                  { label: "WhatsApp", href: `https://wa.me/${(personal.phone || "").replace(/\D/g, "")}`, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm4.786 14.193c-.272.763-1.392 1.4-2.155 1.508-.654.098-1.503.185-4.408-.98-3.723-1.492-6.13-5.267-6.315-5.512-.185-.245-1.503-2-1.503-3.816 0-1.815.959-2.709 1.303-3.069.344-.36.758-.45.998-.45.24 0 .48.01.688.02.218.01.512-.08.8-.08.288 0 .584.09.83.676.24.58.83 2.02.9 2.16.07.14.12.3.02.5-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.3.8 1.31 1.71 2.12.91.81 1.67 1.06 1.91 1.19.24.13.38.11.52-.05.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.52.72 1.79.85.27.14.45.2.51.31.06.11.06.66-.21 1.42z" /></svg> },
                ].map((s) => (
                  <a key={s.label} href={s.href} target={s.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                    className="contact-link flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-text-primary link-underline-effect">
                    {s.icon} {s.label}
                  </a>
                ))}
              </div>
            </div>

          {/* Stats strip — glass panel so numbers stay clearly visible over any footage */}
          <div className={`hero-gate mt-9 lg:mt-7 ${ready ? "is-ready" : ""}`} style={{ "--d": "0.7s" }}>
            <div className="stats-panel relative z-10 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 rounded-2xl px-6 py-5 sm:px-8 sm:py-6">
              {[
                { num: 4, decimals: 1, label: "CGPA", grad: "text-gradient-indigo" },
                { num: 4, suffix: "+", label: "Production Apps", grad: "text-gradient-cyan" },
                { num: 2, label: "Live Deployments", grad: "text-gradient-indigo" },
                { num: 4, suffix: "yrs", label: "Building Software", grad: "text-gradient-cyan" },
              ].map((s, i) => (
                <div key={s.label} className="text-center lg:text-left">
                  <div className={`stat-value font-display font-bold text-3xl sm:text-[34px] ${s.grad}`}>
                    <StatValue num={s.num} decimals={s.decimals || 0} suffix={s.suffix || ""} delay={700 + i * 90} />
                  </div>
                  <div className="font-mono text-[11px] font-medium text-text-secondary uppercase tracking-[0.14em] mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech marquee */}
          <div
            className={`hero-gate mt-7 marquee-mask ${ready ? "is-ready" : ""}`}
            style={{ "--d": "0.8s" }}
            aria-hidden="true"
          >
            <div className="marquee-track">
              {[...FLAT_SKILLS, ...FLAT_SKILLS].map((skill, i) => (
                <span key={i} className="marquee-item has-ico">
                  <TechIcon name={skill} className="w-4 h-4 shrink-0" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero-scroll-hint hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-35">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-accent-indigo/60" />
        <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted">SCROLL</span>
      </div>

      {/* v21: bottom seam blend — hero media melts into the page background in
          BOTH themes (dark: invisible; light: smooth dark→light transition) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 md:h-32"
        style={{ background: "linear-gradient(to bottom, transparent, rgb(var(--bg-primary)))" }}
      />
    </section>
  );
}
