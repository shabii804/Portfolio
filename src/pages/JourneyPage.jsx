import Journey from "../components/Journey";
import PageNextNav from "../components/PageNextNav";
import usePageSEO from "../hooks/usePageSEO";

export default function JourneyPage() {
  usePageSEO(
    "Journey — Shoaib Arshad",
    "The timeline, 2021 to now: BS Software Engineering at Riphah International University (CGPA 4.0), certified frontend internship at Developer Hub Corporation, and live client deployments."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">Journey — Shoaib Arshad</h1>
      <Journey />
      <PageNextNav current="journey" />
    </div>
  );
}
