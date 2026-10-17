import Skills from "../components/Skills";
import PageNextNav from "../components/PageNextNav";
import usePageSEO from "../hooks/usePageSEO";

export default function SkillsPage() {
  usePageSEO(
    "Skills & Toolkit — Shoaib Arshad",
    "The full toolkit: React, JavaScript, Tailwind, Node.js, Express, Firebase, Supabase, SQL Server, Oracle, Java, Flutter and more — six groups, 34 tools, with animated proficiency rails."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">Skills & Toolkit — Shoaib Arshad</h1>
      <Skills />
      <PageNextNav current="skills" />
    </div>
  );
}
