import Projects from "../components/Projects";
import PageNextNav from "../components/PageNextNav";
import usePageSEO from "../hooks/usePageSEO";

export default function ProjectsPage() {
  usePageSEO(
    "Projects — Shoaib Arshad",
    "Four production builds with full case studies: Farooq Agencies (live client site), SpendSmart, E-Shop and a School Management System — searchable and filterable by stack."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">Projects — Shoaib Arshad</h1>
      <Projects />
      <PageNextNav current="projects" />
    </div>
  );
}
