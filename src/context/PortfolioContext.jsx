import { createContext, useContext, useState } from "react";
import { defaultProjects, defaultSkills, defaultPersonal, defaultExperience } from "../data/portfolio";

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [projects, setProjects] = useState(defaultProjects);
  const [skills, setSkills] = useState(defaultSkills);
  const [personal, setPersonal] = useState(defaultPersonal);
  const [experience, setExperience] = useState(defaultExperience);

  const updateProjects = setProjects;
  const updateSkills = setSkills;
  const updatePersonal = setPersonal;
  const updateExperience = setExperience;

  const resetAll = () => {
    setProjects(defaultProjects);
    setSkills(defaultSkills);
    setPersonal(defaultPersonal);
    setExperience(defaultExperience);
  };

  return (
    <PortfolioContext.Provider value={{ projects, skills, personal, experience, updateProjects, updateSkills, updatePersonal, updateExperience, resetAll }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);
