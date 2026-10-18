import { createContext } from "react";
import {
  defaultProjects,
  defaultSkills,
  defaultPersonal,
  defaultExperience,
  defaultJourney,
  defaultServices,
  defaultCertificates,
} from "../data/portfolio";

// Context object — kept separate from the Provider component so that
// Fast Refresh works correctly during development.
//
// v28: the default value is the bundled content, not null. Standalone routes
// that render outside the PortfolioProvider (NotFound) call usePortfolio()
// and used to crash with "Cannot destructure property 'personal' of null" —
// a latent bug no earlier test suite ever hit because the 404 page was never
// probed. Defaults keep those pages self-sufficient.
export const PortfolioContext = createContext({
  projects: defaultProjects,
  skills: defaultSkills,
  personal: defaultPersonal,
  experience: defaultExperience,
  journey: defaultJourney,
  services: defaultServices,
  certificates: defaultCertificates,
});
