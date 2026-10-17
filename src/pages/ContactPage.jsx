import Contact from "../components/Contact";
import PageNextNav from "../components/PageNextNav";
import usePageSEO from "../hooks/usePageSEO";

export default function ContactPage() {
  usePageSEO(
    "Contact — Shoaib Arshad",
    "Start a conversation: internships, junior full-stack roles, freelance projects. Email, WhatsApp, LinkedIn and a direct form — all answered fast."
  );

  return (
    <div className="pt-20 md:pt-24">
      {/* One h1 per page (SEO/a11y) - visually hidden; the SectionHeader h2 below stays the visible heading */}
      <h1 className="sr-only">Contact — Shoaib Arshad</h1>
      <Contact />
      <PageNextNav current="contact" />
    </div>
  );
}
