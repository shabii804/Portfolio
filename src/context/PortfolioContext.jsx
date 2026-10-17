import { useEffect, useState } from "react";
import { defaultProjects, defaultSkills, defaultPersonal, defaultExperience, defaultJourney, defaultServices } from "../data/portfolio";
import { PortfolioContext } from "./portfolioContextObject";
import { setRuntimeContent } from "../data/runtimeContent";
import { loadLocalContent, localModeOn } from "../data/localMedia";

// Provider component only — context object lives in portfolioContextObject.js
// so Fast Refresh keeps working in dev.
//
// Boot overlay: with the Supabase driver the canonical content lives in
// Storage and is served by /api/content WITHOUT a rebuild, so the site fetches
// it once on mount and swaps every section when it lands. Bundled defaults
// stay as the instant first paint and the offline fallback. Local test mode
// ("local memory") wins over the network when enabled in this browser.
export function PortfolioProvider({ children }) {
  const [projects, setProjects] = useState(defaultProjects);
  const [skills, setSkills] = useState(defaultSkills);
  const [personal, setPersonal] = useState(defaultPersonal);
  const [experience, setExperience] = useState(defaultExperience);
  const [journey, setJourney] = useState(defaultJourney);
  const [services, setServices] = useState(defaultServices);

  const updateProjects = setProjects;
  const updateSkills = setSkills;
  const updatePersonal = setPersonal;
  const updateExperience = setExperience;

  const resetAll = () => {
    setProjects(defaultProjects);
    setSkills(defaultSkills);
    setPersonal(defaultPersonal);
    setExperience(defaultExperience);
    setServices(defaultServices);
  };

  useEffect(() => {
    let alive = true;

    // Runtime snapshot → external store (hero config + settings react to it)
    // + context fields (projects, personal, skills…).
    const applyContent = (c) => {
      if (!alive || !c || typeof c !== "object") return;
      setRuntimeContent(c);
      if (Array.isArray(c.projects)) setProjects(c.projects);
      if (c.skills && typeof c.skills === "object") setSkills(c.skills);
      if (c.personal && typeof c.personal === "object") setPersonal(c.personal);
      if (Array.isArray(c.experience)) setExperience(c.experience);
      if (Array.isArray(c.journey)) setJourney(c.journey);
      if (Array.isArray(c.services)) setServices(c.services);
    };

    (async () => {
      // 1) Local test mode — this browser's saved snapshot wins instantly.
      if (localModeOn()) {
        const local = loadLocalContent();
        if (local) {
          applyContent(local);
          return; // test mode: skip the network entirely
        }
      }
      // 2) Live content (Supabase driver serves it with no rebuild; GitHub /
      //    file drivers simply return the same data the bundle was built from).
      try {
        const res = await fetch("/api/content", { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const data = await res.json();
        applyContent(data?.content);
      } catch {
        /* bundled defaults remain */
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <PortfolioContext.Provider value={{ projects, skills, personal, experience, journey, services, updateProjects, updateSkills, updatePersonal, updateExperience, resetAll }}>
      {children}
    </PortfolioContext.Provider>
  );
}
