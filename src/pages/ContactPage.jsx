import Contact from "../components/Contact";
import PageNextNav from "../components/PageNextNav";
import CrossLinkBand from "../components/CrossLinkBand";
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

      {/* v29 — if the visitor already knows what they need, skip the small talk */}
      <CrossLinkBand
        title="Already know what you need?"
        accent="Skip the small talk."
        text="The Services page lists six bookable engagements with deliverables and timelines — the booking form lands straight in the same inbox this form feeds."
        primary={{ to: "/services", label: "Book a service directly" }}
        ghost={{ to: "/projects", label: "Review the work first" }}
        tint="#fbbf24"
      />

      <PageNextNav current="contact" />
    </div>
  );
}
