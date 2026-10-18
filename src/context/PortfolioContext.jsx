import { useEffect, useSyncExternalStore } from "react";
import { defaultProjects, defaultSkills, defaultPersonal, defaultExperience, defaultJourney, defaultServices, defaultCertificates } from "../data/portfolio";
import { PortfolioContext } from "./portfolioContextObject";
import { getRuntimeContent, setRuntimeContent, subscribeRuntime } from "../data/runtimeContent";
import { loadLocalContent, localModeOn } from "../data/localMedia";

// Provider component only — context object lives in portfolioContextObject.js
// so Fast Refresh keeps working in dev.
//
// v34 — the runtime overlay IS the source of truth. The provider derives every
// section straight from the external store (useSyncExternalStore), so:
//   · boot: bundled defaults paint instantly, then /api/content lands and
//     every section swaps atomically;
//   · admin saves: AdminApp pushes the saved snapshot into the store — public
//     pages in the SAME session update immediately (no reload, no rebuild wait);
//   · local test mode: the browser snapshot wins, network skipped entirely.
// Bundled defaults back every field that a snapshot may omit.
export function PortfolioProvider({ children }) {
  const runtime = useSyncExternalStore(subscribeRuntime, getRuntimeContent, getRuntimeContent);

  const value = {
    projects: runtime?.projects ?? defaultProjects,
    skills: runtime?.skills ?? defaultSkills,
    personal: runtime?.personal ?? defaultPersonal,
    experience: runtime?.experience ?? defaultExperience,
    journey: runtime?.journey ?? defaultJourney,
    services: runtime?.services ?? defaultServices,
    certificates: runtime?.certificates ?? defaultCertificates,
    // Direct mutation setters are retired — content changes flow through the
    // admin panel (saveContent → setRuntimeContent) or the boot fetch. Kept as
    // no-ops for context-shape compatibility.
    updateProjects: () => {},
    updateSkills: () => {},
    updatePersonal: () => {},
    updateExperience: () => {},
    updateCertificates: () => {},
    resetAll: () => setRuntimeContent(null),
  };

  // Boot: local test mode snapshot wins instantly; otherwise fetch the live
  // content (Supabase serves it with no rebuild; GitHub/file drivers return
  // the same data the bundle was built from). Failures keep bundled defaults.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (localModeOn()) {
        const local = loadLocalContent();
        if (local && alive) setRuntimeContent(local);
        return; // test mode: skip the network entirely
      }
      try {
        const res = await fetch("/api/content", { headers: { Accept: "application/json" } });
        if (!res.ok || !alive) return;
        const data = await res.json();
        if (data?.content) setRuntimeContent(data.content);
      } catch {
        /* bundled defaults remain */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}
