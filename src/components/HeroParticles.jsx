import { useEffect, useRef } from "react";

/**
 * Canvas "constellation" background for the hero.
 * — Floating particles (indigo → cyan palette) linked by hairline connections
 * — Softly repelled by the cursor, which also lights up nearby links
 * — Zero dependencies; pauses off-screen / on hidden tab; static frame for
 *   prefers-reduced-motion; DPR capped at 2 and count scales with viewport.
 */
const PALETTE = ["129,140,248", "165,180,252", "34,211,238"]; // indigo-400, indigo-300, cyan-400
const LINK_DIST = 130;
const MOUSE_RADIUS = 120;
const MOUSE_LINK_DIST = 150;

export default function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let raf = 0;
    let inView = true;
    let particles = [];
    let W = 0;
    let H = 0;
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const host = canvas.parentElement;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(84, Math.max(30, Math.round((W * H) / 24000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.5 + 0.7,
        c: PALETTE[(Math.random() * PALETTE.length) | 0],
        tw: Math.random() * Math.PI * 2,
        ts: 0.008 + Math.random() * 0.018,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Hairline constellation links
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.13;
            ctx.strokeStyle = `rgba(${a.c},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Cursor constellation — brighter links near the pointer
      if (mouse.x > -999) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_LINK_DIST * MOUSE_LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / MOUSE_LINK_DIST) * 0.28;
            ctx.strokeStyle = `rgba(${p.c},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Particles with a gentle twinkle
      for (const p of particles) {
        const glow = 0.32 + Math.sin(p.tw) * 0.26;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${glow.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      if (!inView || document.hidden) {
        raf = 0;
        return;
      }
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += p.ts;

        // Soft repulsion around the cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = (1 - d / MOUSE_RADIUS) * 1.1;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }

        // Wrap around edges
        if (p.x < -24) p.x = W + 24;
        else if (p.x > W + 24) p.x = -24;
        if (p.y < -24) p.y = H + 24;
        else if (p.y > H + 24) p.y = -24;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const wake = () => {
      if (reduced || raf || !inView || document.hidden) return;
      raf = requestAnimationFrame(step);
    };

    build();
    if (reduced) {
      draw(); // single static frame, no loop, no listeners
      return;
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        if (!raf) draw();
      }, 180);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) wake();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );

    const onVis = () => {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else wake();
    };

    io.observe(canvas);
    canvas.parentElement?.addEventListener("pointermove", onMove);
    canvas.parentElement?.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    wake();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      canvas.parentElement?.removeEventListener("pointermove", onMove);
      canvas.parentElement?.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="hero-particles absolute inset-0 z-[1] pointer-events-none"
    />
  );
}
