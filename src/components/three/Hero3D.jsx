import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { usePortfolio } from "../../hooks/usePortfolio";
import FloatingIcons from "../FloatingIcons";

const HeroScene = lazy(() => import("./HeroScene"));

function detectMode() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return "fallback";
  // 3D everywhere it can run — including phones; only true low-power or
  // no-WebGL devices get the CSS orb
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
 * Full-bleed 3D hero background: a lazy-loaded React Three Fiber scene
 * (distorted chrome orb + orbiting brand icons + 3D starfield) covering the
 * entire hero section, theme-aware on light/dark toggle. Falls back to a
 * zero-WebGL CSS orb + animated HTML icon chips on low-power, reduced-motion
 * or no-WebGL devices.
 */
export default function Hero3D({ heroRef, onMode, onSceneReady }) {
  const [mode, setMode] = useState("pending");
  const { personal } = usePortfolio();

  useEffect(() => {
    const id = requestIdleCallback
      ? requestIdleCallback(() => {
          const m = detectMode();
          setMode(m);
          onMode?.(m);
        }, { timeout: 600 })
      : setTimeout(() => {
          const m = detectMode();
          setMode(m);
          onMode?.(m);
        }, 120);
    return () => (typeof cancelIdleCallback === "function" ? cancelIdleCallback(id) : clearTimeout(id));
  }, [onMode]);

  const handleSceneReady = useCallback(() => onSceneReady?.(), [onSceneReady]);

  return (
    <>
      {mode === "3d" && (
        <Suspense fallback={null}>
          <HeroScene heroRef={heroRef} onSceneReady={handleSceneReady} />
        </Suspense>
      )}

      {mode === "fallback" && (
        <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
          {/* orb anchor — right-center on desktop, lower-center on mobile */}
          <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[280px] aspect-square lg:left-[71%] lg:top-1/2 lg:w-[430px]">
            <div className="orb-halo" />
            <div className="orb-fallback" />
          </div>
          <FloatingIcons />
        </div>
      )}

      {/* Floating proof badges — sit ABOVE the 3D canvas (z-20) in both modes */}
      {mode !== "pending" && (
        <div className="absolute inset-0 z-20 pointer-events-none hidden md:block" aria-hidden="false">
          <div className="hero-orb-badge float-slow" style={{ top: "15%", right: "8%" }}>
            <span className="font-display font-bold text-accent-cyan text-base leading-none">4.0</span>
            <span className="text-[9px] text-text-muted">CGPA</span>
          </div>
          <div className="hero-orb-badge float-slow" style={{ top: "46%", right: "26%", animationDelay: "2.8s" }}>
            <span className="text-[10px] text-accent-indigoSoft">React · Node.js · Java</span>
          </div>
          <div className="hero-orb-badge float-slow" style={{ bottom: "20%", right: "12%", animationDelay: "1.4s" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-text-secondary">
              {personal.available ? "Open to work" : "Currently unavailable"}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
