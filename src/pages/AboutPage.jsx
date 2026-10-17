import About from "../components/About";
import PageNextNav from "../components/PageNextNav";
import usePageSEO from "../hooks/usePageSEO";

export default function AboutPage() {
  usePageSEO(
    "About — Shoaib Arshad | Full Stack Developer",
    "Who Shoaib Arshad is: a 4.0 CGPA Software Engineering student at Riphah International University building production-grade web apps with React, Node.js and Firebase — plus Java desktop systems for real business use."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">About — Shoaib Arshad</h1>
      <About />
      <PageNextNav current="about" />
    </div>
  );
}
