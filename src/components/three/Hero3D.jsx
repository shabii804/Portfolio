import { lazy, Suspense, useEffect, useState } from "react";
import { usePortfolio } from "../../hooks/usePortfolio";

const HeroScene = lazy(() => import("./HeroScene"));

function detectMode() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return "fallback";
  // Small screens / low-memory devices get the lightweight static orb
  if (window.matchMedia("(max-width: 820px)").matches) return "fallback";
  if ((navigator.deviceMemory || 8) <= 2) return "fallback";
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "fallback";
  } catch {
    return "fallback";
  }
  return "3d";
}

/**
 * Hero centerpiece: a lazy-loaded React Three Fiber scene (distorted chrome
 * orb + orbiting tech glyphs) on capable desktops, and a zero-WebGL CSS orb
 * fallback on mobile, low-memory and reduced-motion devices.
 */
export default function Hero3D({ heroRef }) {
  const [mode, setMode] = useState("pending");
  const { personal } = usePortfolio();

  useEffect(() => {
    const id = requestIdleCallback
      ? requestIdleCallback(() => setMode(detectMode()), { timeout: 600 })
      : setTimeout(() => setMode(detectMode()), 120);
    return () => (typeof cancelIdleCallback === "function" ? cancelIdleCallback(id) : clearTimeout(id));
  }, []);

  return (
    <div className="hero-orb-zone relative h-[340px] sm:h-[420px] lg:h-[540px] w-full max-w-[520px] mx-auto lg:mx-0">
      {/* halo glow behind everything */}
      <div className="orb-halo" aria-hidden="true" />

      {mode === "3d" && (
        <Suspense fallback={null}>
          <HeroScene heroRef={heroRef} />
        </Suspense>
      )}
      {mode === "fallback" && <div className="orb-fallback" aria-hidden="true" />}

      {/* Floating proof badges (kept for both modes — identity anchors) */}
      <div className="hero-orb-badge float-slow" style={{ top: "7%", right: "0%" }}>
        <span className="font-display font-bold text-accent-cyan text-base leading-none">4.0</span>
        <span className="text-[9px] text-text-muted">CGPA</span>
      </div>
      <div className="hero-orb-badge float-slow" style={{ top: "44%", left: "-4%", animationDelay: "2.8s" }}>
        <span className="text-[10px] text-accent-indigoSoft">React · Node.js · Java</span>
      </div>
      <div className="hero-orb-badge" style={{ bottom: "9%", right: "8%", animationDelay: "1.4s" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] text-text-secondary">
          {personal.available ? "Open to work" : "Currently unavailable"}
        </span>
      </div>
    </div>
  );
}
