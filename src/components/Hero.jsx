import { useState, useEffect, useRef, useCallback } from "react";
import { usePortfolio } from "../context/PortfolioContext";

export default function Hero() {
  const { personal } = usePortfolio();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // 3D Tilt State for Profile Card
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleTilt = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 15, y: -y * 15 });
  };

  const handleTiltReset = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Subtle interactive particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = window.innerWidth < 420 ? 18 : window.innerWidth < 768 ? 36 : 60;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw glow dot
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, `rgba(129,140,248,${p.opacity})`);
        grad.addColorStop(1, "rgba(129,140,248,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw connecting lines between nearby particles and mouse
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        
        // Push particles slightly away from mouse for a premium interactive feel
        if (mouse.x !== null) {
          const dx = pi.x - mouse.x;
          const dy = pi.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            const angle = Math.atan2(dy, dx);
            pi.x += Math.cos(angle) * force * 1.5;
            pi.y += Math.sin(angle) * force * 1.5;
            
            // Draw interactive connection to mouse pointer
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.12 * force})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(129,140,248,${0.06 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

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

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-20">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg z-0" />

      {/* Big glow blobs */}
      <div className="absolute top-1/3 left-1/5 w-[600px] h-[600px] rounded-full opacity-[0.055] blur-[120px] bg-accent-indigo pointer-events-none z-0 bg-blob-indigo" />
      <div className="absolute bottom-1/4 right-1/5 w-[450px] h-[450px] rounded-full opacity-[0.04] blur-[100px] bg-accent-cyan pointer-events-none z-0 bg-blob-cyan" />

      {/* Main content */}
      <div className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-0 w-full transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            {/* Status */}
            <div 
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
              style={{ animation: "fadeSlideUp 0.6s ease both" }}
            >
              <div className="relative flex h-2 w-2">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <span className="font-mono text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">{personal.available ? "Available for opportunities" : "Currently unavailable"}</span>
            </div>

            {/* Greeting line */}
            <div
              className="flex items-center gap-2 mb-4"
              style={{ animation: "fadeSlideUp 0.6s ease both", animationDelay: "0.1s" }}
            >
              <span className="font-mono text-accent-indigo/60 text-sm font-semibold">~/</span>
              <span className="font-mono text-accent-indigo text-xs uppercase tracking-[0.2em] font-semibold">Hi there, I'm</span>
            </div>

            {/* Name */}
            <h1
              className="font-display font-bold leading-[0.95] tracking-tight mb-6"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.2s" }}
            >
              <span className="block text-[clamp(52px,8vw,96px)] text-text-primary">{personal.name.split(" ")[0]}</span>
              <span className="block text-[clamp(52px,8vw,96px)] text-gradient-indigo">{personal.name.split(" ").slice(1).join(" ")}.</span>
            </h1>

            {/* Typewriter */}
            <div
              className="flex items-center gap-2.5 mb-6"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.35s" }}
            >
              <span className="font-mono text-accent-cyan/50 text-base select-none">▶</span>
              <div className="font-display text-xl sm:text-2xl font-medium text-text-secondary min-h-[34px]">
                {displayed}
                <span className="inline-block w-[2px] h-[22px] bg-accent-indigo/80 ml-0.5 animate-blink align-middle rounded-full" />
              </div>
            </div>

            {/* Bio */}
            <p
              className="font-body text-text-secondary text-base sm:text-lg leading-relaxed mb-10 max-w-lg"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.45s" }}
            >
              {personal.bio}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-3 mb-10"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.55s" }}
            >
              <button onClick={() => scrollTo("projects")} className="btn-primary px-6 py-3.5 rounded-xl font-display font-semibold text-sm flex items-center gap-2.5 group glow-on-hover">
                View My Work
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <a
                href={personal.resumePdf}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost px-5 py-3.5 rounded-xl font-display font-semibold text-sm flex items-center gap-2 group glow-on-hover"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:scale-105"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                View Resume
              </a>
              <a
                href={personal.resumePdf}
                download
                className="btn-ghost px-5 py-3.5 rounded-xl font-display font-semibold text-sm flex items-center gap-2 group glow-on-hover"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-y-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Resume
              </a>
              <a href={`https://wa.me/${(personal.phone||"").replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!%20I%27d%20like%20to%20talk.`} target="_blank" rel="noreferrer" className="btn-ghost px-5 py-3.5 rounded-xl font-display font-semibold text-sm group flex items-center gap-2 glow-on-hover">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm4.786 14.193c-.272.763-1.392 1.4-2.155 1.508-.654.098-1.503.185-4.408-.98-3.723-1.492-6.13-5.267-6.315-5.512-.185-.245-1.503-2-1.503-3.816 0-1.815.959-2.709 1.303-3.069.344-.36.758-.45.998-.45.24 0 .48.01.688.02.218.01.512-.08.8-.08.288 0 .584.09.83.676.24.58.83 2.02.9 2.16.07.14.12.3.02.5-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.3.8 1.31 1.71 2.12.91.81 1.67 1.06 1.91 1.19.24.13.38.11.52-.05.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.52.72 1.79.85.27.14.45.2.51.31.06.11.06.66-.21 1.42z"/></svg>
                Contact Me
              </a>
            </div>

            <div
              className="flex flex-wrap items-center gap-5"
              style={{ animation: "fadeSlideUp 0.7s ease both", animationDelay: "0.65s" }}
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

          {/* Right — profile pic with 3D tilt hover */}
          <div className="flex justify-center lg:justify-end" style={{ animation: "fadeSlideUp 0.9s ease both", animationDelay: "0.3s" }}>
            <div 
              className="relative cursor-pointer transition-all duration-300 ease-out"
              onMouseMove={handleTilt}
              onMouseLeave={handleTiltReset}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.02, 1.02, 1.02)`
              }}
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-accent-indigo/20 to-accent-cyan/10 blur-2xl" />
              {/* Rotating dashed border */}
              <div className="absolute -inset-2 rounded-full border border-dashed border-accent-indigo/20 spin-slow" />
              {/* Main picture frame */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-2 border-accent-indigo/20 bg-bg-card shadow-2xl shadow-accent-indigo/10">
                {!imgError ? (
                  <img
                    src={personal.profilePic}
                    alt={personal.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  // Placeholder when no image
                  <div className="w-full h-full flex flex-col items-center justify-center bg-bg-card gap-3">
                    <div className="text-5xl font-display font-bold text-gradient-indigo">
                      {personal.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <p className="font-mono text-[10px] text-text-muted text-center px-4">
                      Place profile.jpg<br />in /public/
                    </p>
                  </div>
                )}
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg-primary/30 to-transparent" />
              </div>
              {/* Floating badge (hidden on very small screens) */}
              <div className="hidden sm:flex absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-bg-card border border-accent-indigo/25 shadow-lg flex items-center gap-2 whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] text-text-secondary">Open to work</span>
              </div>
              {/* Top-right: CGPA badge */}
              <div className="hidden md:flex absolute -top-3 -right-3 w-14 h-14 rounded-2xl bg-bg-card border border-accent-cyan/25 shadow-lg flex flex-col items-center justify-center float-slow">
                <span className="font-display font-bold text-accent-cyan text-base leading-none">4.0</span>
                <span className="font-mono text-[8px] text-text-muted">CGPA</span>
              </div>
              {/* Bottom-left: stack badge */}
              <div className="hidden md:flex absolute -bottom-3 -left-3 px-3 py-1.5 rounded-xl bg-bg-card border border-accent-purple/25 shadow-lg float-slow" style={{ animationDelay: "3s" }}>
                <span className="font-mono text-[10px] text-accent-purple">React · Node.js</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="mt-20 pt-8 border-t border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{ animation: "fadeSlideUp 0.8s ease both", animationDelay: "0.7s" }}
        >
          {[
            { val: "4.0", label: "CGPA", grad: "text-gradient-indigo" },
            { val: "4+", label: "Production Apps", grad: "text-gradient-cyan" },
            { val: "1yr", label: "Coding Experience", grad: "text-gradient-indigo" },
            { val: "1", label: "Live Client Site", grad: "text-gradient-cyan" },
          ].map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className={`font-display font-bold text-3xl sm:text-4xl ${s.grad}`}>{s.val}</div>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-[0.12em] mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-35">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-accent-indigo/60" />
        <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted">SCROLL</span>
      </div>
    </section>
  );
}
