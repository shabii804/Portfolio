import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "../hooks/usePortfolio";
import { defaultSkills } from "../data/portfolio";
import HeroParticles from "./HeroParticles";
import { useCountUp, useMagnetic, useScrollParallax } from "../hooks/heroMotion";

// Occasional diagonal light streaks — position/length staggered so roughly
// one star crosses every few seconds, each idle for most of its cycle
const SHOOTING_STARS = [
  { top: "16%", left: "72%", delay: "2.5s", dur: "12s" },
  { top: "6%", left: "48%", delay: "7.5s", dur: "14s" },
  { top: "34%", left: "88%", delay: "12s", dur: "13s" },
];

// Flat list of every skill across categories, for the hero marquee strip
const FLAT_SKILLS = Object.values(defaultSkills).flat();

// Animated stat number — counts up once on mount (reduced motion: instant)
function StatValue({ num, decimals = 0, suffix = "", delay = 0 }) {
  const value = useCountUp(num, { decimals, delay });
  return (
    <>
      {value}
      {suffix}
    </>
  );
}

export default function Hero() {
  const { personal } = usePortfolio();
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [visible, setVisible] = useState(false);
  const tiltRef = useRef(null);
  const glareRef = useRef(null);
  const badgeRefs = useRef([]);
  const magneticPrimary = useMagnetic();
  const magneticCv = useMagnetic();
  const magneticTalk = useMagnetic();
  const parallaxRef = useScrollParallax();
  const reducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  // Mouse-tilt parallax on the photo frame + glare tracking + badge depth
  // (skipped for touch + reduced motion)
  const handleTilt = (e) => {
    if (reducedMotion.current || !tiltRef.current) return;
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
    if (glareRef.current) {
      glareRef.current.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
      glareRef.current.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
    }
    for (const b of badgeRefs.current) {
      if (!b) continue;
      const f = parseFloat(b.dataset.depth || "0") * 26;
      b.style.transform = `translate(${(px * 2 * f).toFixed(1)}px, ${(py * 2 * f).toFixed(1)}px)`;
    }
  };
  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
    for (const b of badgeRefs.current) {
      if (b) b.style.transform = "";
    }
  };

  // Entrance animation
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  // Typewriter
  useEffect(() => {
    const roles = personal.roles;
    const current = roles[roleIdx];
    const speed = isDeleting ? 42 : 82;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(current.slice(0, displayed.length + 1));
        if (displayed.length + 1 === current.length) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        setDisplayed(current.slice(0, displayed.length - 1));
        if (displayed.length === 0) { setIsDeleting(false); setRoleIdx((i) => (i + 1) % roles.length); }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, roleIdx, personal.roles]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion.current ? "auto" : "smooth" });

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 md:pt-24 pb-16">
      {/* Atmosphere: drifting grid + aurora + constellation + streaks + glow blobs */}
      <div className="absolute inset-0 grid-pan-wrap z-0" aria-hidden="true">
        <div className="grid-pan" />
      </div>
      <div className="aurora" aria-hidden="true" />
      <HeroParticles />
      <div className="shooting-stars" aria-hidden="true">
        {SHOOTING_STARS.map((s, i) => (
          <span
            key={i}
            className="shooting-star"
            style={{ top: s.top, left: s.left, "--delay": s.delay, "--dur": s.dur }}
          />
        ))}
      </div>
      <div className="absolute top-1/4 left-[12%] w-[560px] h-[560px] rounded-full opacity-[0.05] blur-[130px] bg-accent-indigo pointer-events-none z-0 bg-blob-indigo" />
      <div className="absolute bottom-[10%] right-[8%] w-[440px] h-[440px] rounded-full opacity-[0.04] blur-[110px] bg-accent-cyan pointer-events-none z-0 bg-blob-cyan" />

      {/* Main content (outer layer takes the scroll-parallax exit) */}
      <div ref={parallaxRef} className="hero-parallax relative">
      <div className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-6 items-center">
          {/* Left — copy */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Availability badge */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/[0.07] border border-emerald-500/20 mb-8"
              style={{ animation: "fadeSlideUp 0.6s ease both" }}
            >
              <div className="relative flex h-2 w-2">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <span className="font-mono text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">
                {personal.available ? "Available for opportunities" : "Currently unavailable"}
              </span>
            </div>

            {/* Greeting */}
            <div
              className="hidden lg:flex items-center gap-2 mb-4"
              style={{ animation: "fadeSlideUp 0.6s ease both", animationDelay: "0.1s" }}
            >
              <span className="font-mono text-accent-indigo/60 text-sm font-semibold">~/</span>
              <span className="font-mono text-accent-indigo text-xs uppercase tracking-[0.2em] font-semibold">Hi there, I'm</span>
            </div>

            {/* Name — mask reveal, line by line */}
            <h1 className="font-display font-bold leading-[0.95] tracking-tight mb-6">
              <span className="name-mask name-mask-a">
                <span className="name-line text-[clamp(44px,7vw,84px)] text-text-primary">{personal.name.split(" ")[0]}</span>
              </span>
              <span className="name-mask name-mask-b">
                <span className="name-line text-[clamp(44px,7vw,84px)] text-shimmer">{personal.name.split(" ").slice(1).join(" ")}.</span>
              </span>
            </h1>

            {/* Typewriter */}
            <div
              className="flex items-center justify-center lg:justify-start gap-2.5 mb-6"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.4s" }}
            >
              <span className="font-mono text-accent-cyan/50 text-base select-none">▶</span>
              <div className="font-display text-lg sm:text-2xl font-medium text-text-secondary min-h-[30px] sm:min-h-[34px]">
                {displayed}
                <span className="inline-block w-[2px] h-[20px] sm:h-[22px] bg-accent-indigo/80 ml-0.5 animate-blink align-middle rounded-full" />
              </div>
            </div>

            {/* Bio */}
            <p
              className="font-body text-text-secondary text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.48s" }}
            >
              {personal.bio}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.56s" }}
            >
              <button ref={magneticPrimary} onClick={() => scrollTo("projects")} className="magnetic btn-primary px-6 py-3.5 rounded-xl font-display font-semibold text-sm flex items-center gap-2.5 group glow-on-hover">
                View My Work
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <a
                ref={magneticCv}
                href={personal.resumePdf}
                download
                className="magnetic btn-ghost px-5 py-3.5 rounded-xl font-display font-semibold text-sm flex items-center gap-2 group glow-on-hover"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-y-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download CV
              </a>
              <button ref={magneticTalk} onClick={() => scrollTo("contact")} className="magnetic btn-ghost px-5 py-3.5 rounded-xl font-display font-semibold text-sm group flex items-center gap-2 glow-on-hover">
                Let's Talk
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>

            {/* Socials */}
            <div
              className="flex flex-wrap justify-center lg:justify-start items-center gap-5"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.64s" }}
            >
              {[
                { label: "GitHub", href: personal.github, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
                { label: "LinkedIn", href: personal.linkedin, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
                { label: "WhatsApp", href: `https://wa.me/${(personal.phone||"").replace(/\D/g, "")}`, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm4.786 14.193c-.272.763-1.392 1.4-2.155 1.508-.654.098-1.503.185-4.408-.98-3.723-1.492-6.13-5.267-6.315-5.512-.185-.245-1.503-2-1.503-3.816 0-1.815.959-2.709 1.303-3.069.344-.36.758-.45.998-.45.24 0 .48.01.688.02.218.01.512-.08.8-.08.288 0 .584.09.83.676.24.58.83 2.02.9 2.16.07.14.12.3.02.5-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.3.8 1.31 1.71 2.12.91.81 1.67 1.06 1.91 1.19.24.13.38.11.52-.05.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.52.72 1.79.85.27.14.45.2.51.31.06.11.06.66-.21 1.42z"/></svg> },
              ].map((s) => (
                <a key={s.label} href={s.href} target={s.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                  className="contact-link flex items-center gap-1.5 text-xs font-mono link-underline-effect">
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right — photo composition with orbit rings (always renders, no WebGL) */}
          <div
            className="relative mx-auto w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[460px] order-1 lg:order-2"
            style={{ animation: "fadeSlideUp 0.9s ease both", animationDelay: "0.24s" }}
            onPointerMove={handleTilt}
            onPointerLeave={resetTilt}
          >
            {/* Rotating conic glow behind everything */}
            <div className="photo-glow-ring" aria-hidden="true" />

            {/* Tilt wrapper — photo frame + rings move together */}
            <div ref={tiltRef} className="relative transition-transform duration-300 ease-out will-change-transform">
              {/* CSS orbit rings */}
              <div className="orbit-ring orbit-tilt-a" aria-hidden="true"><span className="orbit-dot" /></div>
              <div className="orbit-ring orbit-tilt-b" aria-hidden="true"><span className="orbit-dot" /></div>

              {/* Photo frame — gradient hairline border over the portrait */}
              <div className="photo-frame relative aspect-[4/5] max-w-[78%] mx-auto">
                <div className="photo-frame-inner w-full h-full">
                  <img
                    src="/profile.jpeg"
                    alt={`Portrait of ${personal.name}`}
                    width={880}
                    height={1100}
                    loading="eager"
                    decoding="async"
                  />
                  <div ref={glareRef} className="photo-glare" aria-hidden="true" />
                </div>
                {/* Bottom caption chip inside the frame */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-bg-primary/80 border border-border-mid backdrop-blur flex items-center gap-2 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-text-secondary">Open to work</span>
                </div>
              </div>

              {/* Floating badges — inner layer counter-parallaxes with tilt for depth */}
              <div className="absolute top-[6%] -right-1 sm:-right-4 w-16 h-16 rounded-2xl bg-bg-card/90 border border-accent-cyan/30 shadow-lg float-slow backdrop-blur">
                <div ref={(el) => (badgeRefs.current[0] = el)} data-depth="0.5" className="w-full h-full flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-accent-cyan text-lg leading-none">4.0</span>
                  <span className="font-mono text-[8px] text-text-muted mt-1">CGPA</span>
                </div>
              </div>
              <div className="absolute top-[38%] -left-2 sm:-left-8 px-3 py-1.5 rounded-xl bg-bg-card/90 border border-accent-indigo/30 shadow-lg float-slow backdrop-blur" style={{ animationDelay: "3s" }}>
                <div ref={(el) => (badgeRefs.current[1] = el)} data-depth="0.85" className="depth-layer">
                  <span className="font-mono text-[10px] text-accent-indigo">React · Node.js</span>
                </div>
              </div>
              <div className="absolute bottom-[10%] -right-2 sm:-right-6 px-3.5 py-1.5 rounded-full bg-bg-card/90 border border-border-mid shadow-lg backdrop-blur hidden sm:block">
                <div ref={(el) => (badgeRefs.current[2] = el)} data-depth="0.35" className="depth-layer">
                  <span className="font-mono text-[10px] text-text-secondary">4 production apps</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="mt-14 lg:mt-10 pt-8 border-t border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{ animation: "fadeSlideUp 0.8s ease both", animationDelay: "0.7s" }}
        >
          {[
            { num: 4, decimals: 1, label: "CGPA", grad: "text-gradient-indigo" },
            { num: 4, label: "Production Apps", grad: "text-gradient-cyan" },
            { num: 4, suffix: "yrs", label: "Building Software", grad: "text-gradient-indigo" },
            { num: 1, label: "Live Client Site", grad: "text-gradient-cyan" },
          ].map((s, i) => (
            <div key={s.label} className="text-center lg:text-left">
              <div className={`font-display font-bold text-3xl sm:text-4xl ${s.grad}`}>
                <StatValue num={s.num} decimals={s.decimals || 0} suffix={s.suffix || ""} delay={700 + i * 90} />
              </div>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-[0.12em] mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tech marquee */}
        <div className="mt-10 marquee-mask" style={{ animation: "fadeSlideUp 0.8s ease both", animationDelay: "0.8s" }} aria-hidden="true">
          <div className="marquee-track">
            {[...FLAT_SKILLS, ...FLAT_SKILLS].map((skill, i) => (
              <span key={i} className="marquee-item">{skill}</span>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Scroll hint */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-35">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-accent-indigo/60" />
        <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted">SCROLL</span>
      </div>
    </section>
  );
}
