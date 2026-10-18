import { usePortfolio } from "../hooks/usePortfolio";
import { useLocalMediaSrc } from "../data/localMedia";
import SectionHeader from "../components/motion/SectionHeader";
import TiltCard from "../components/motion/TiltCard";
import Reveal from "../components/motion/Reveal";
import CrossLinkBand from "../components/CrossLinkBand";
import PageNextNav from "../components/PageNextNav";
import usePageSEO from "../hooks/usePageSEO";
import { Award, BadgeCheck, ExternalLink, Fingerprint } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   /certificates (v33) — the credentials room. Fed live from the admin panel:
   /admin → Certificates (title, issuer, date, scan upload, verify URL…).
   Featured entries sort first and carry a highlighted badge; every card is
   tilt-hover glass with a 4:3 image frame (designed placeholder when no scan
   was uploaded yet).
   ────────────────────────────────────────────────────────────────────────── */

const TINT = "#a78bfa"; // certificates identity — violet, distinct from Skills cyan

export default function CertificatesPage() {
  const { certificates = [] } = usePortfolio();

  usePageSEO(
    "Certificates — Shoaib Arshad",
    "Verified credentials: Cisco programming certificates, the Developer Hub frontend internship completion and more — with issuer, date and verification links."
  );

  const sorted = [
    ...certificates.filter((c) => c.featured),
    ...certificates.filter((c) => !c.featured),
  ];
  const issuers = [...new Set(certificates.map((c) => c.issuer).filter(Boolean))];
  const skillsCount = new Set((certificates || []).flatMap((c) => c.skills || [])).size;

  return (
    <div className="pt-20 md:pt-24">
      <h1 className="sr-only">Certificates — Shoaib Arshad</h1>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="section-y !pb-8 md:!pb-10" aria-label="Certificates intro">
        <div className="container-x">
          <SectionHeader
            index="07"
            icon={Award}
            tint={TINT}
            label="CERTIFICATES"
            title="Proof of work, certified."
            accent={["certified."]}
            subtitle="Every certificate below is real — issued, dated and verifiable. Uploads and details are managed from the same admin panel that runs this site, so this page always shows the latest set."
          />

          {/* mini stat strip */}
          <Reveal delay={0.1} className="mt-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] px-3.5 py-2 rounded-full border border-border-subtle bg-bg-card text-text-secondary">
                {certificates.length} certificate{certificates.length === 1 ? "" : "s"}
              </span>
              {issuers.slice(0, 4).map((iss) => (
                <span key={iss} className="font-mono text-[10px] uppercase tracking-[0.22em] px-3.5 py-2 rounded-full border border-border-subtle bg-bg-card text-text-muted">
                  {iss}
                </span>
              ))}
              {skillsCount > 0 && (
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] px-3.5 py-2 rounded-full border border-border-subtle bg-bg-card text-text-muted">
                  {skillsCount} validated skills
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <section className="pb-4" aria-label="Certificate list">
        <div className="container-x">
          {sorted.length === 0 ? (
            <Reveal>
              <div className="rounded-3xl border border-dashed border-border-subtle py-16 text-center">
                <Award size={30} className="mx-auto text-text-muted mb-4" aria-hidden="true" />
                <p className="font-display text-lg text-text-secondary">No certificates published yet.</p>
                <p className="font-mono text-[10px] text-text-muted mt-2 uppercase tracking-widest">
                  added from /admin → Certificates
                </p>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 items-stretch">
              {sorted.map((cert, i) => (
                <Reveal key={cert.id || cert.title} delay={Math.min(i * 0.06, 0.3)} className="h-full">
                  <CertificateCard cert={cert} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <CrossLinkBand
        title="The next certificate could be your project."
        accent="Let's build it."
        text="These credentials back the work on the Projects page — production apps and desktop systems for real businesses. Yours could be the next case study."
        primary={{ to: "/services", label: "Book a service" }}
        ghost={{ to: "/projects", label: "See the work first" }}
        tint={TINT}
      />

      <PageNextNav current="certificates" />
    </div>
  );
}

/* ── One certificate card ──────────────────────────────────────────────────── */
function CertificateCard({ cert }) {
  const image = useLocalMediaSrc(cert.image);
  const issuerInitials = monogram(cert.issuer || cert.title);

  return (
    <TiltCard className="h-full group">
      <article className="h-full flex flex-col rounded-2xl border border-border-subtle bg-bg-card overflow-hidden transition-all duration-300 group-hover:border-[#a78bfa]/45 group-hover:shadow-[0_20px_50px_-24px_rgba(167,139,250,0.45)]">
        {/* 4:3 visual — uploaded scan or designed placeholder */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0b0d18]">
          {image ? (
            <img
              src={image}
              alt={`${cert.title} — ${cert.issuer || "certificate"}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(85% 70% at 22% 18%, ${TINT}1f, transparent 60%), radial-gradient(70% 65% at 82% 88%, rgba(34,211,238,0.10), transparent 55%)`,
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-4 rounded-xl border border-dashed"
                style={{ borderColor: `${TINT}30` }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center gap-3" aria-hidden="true">
                <span
                  className="w-16 h-16 rounded-2xl grid place-items-center border"
                  style={{ borderColor: `${TINT}45`, background: `${TINT}14`, color: TINT }}
                >
                  <Award size={26} strokeWidth={1.75} />
                </span>
                <span className="font-display font-semibold text-lg tracking-wide text-text-primary/80">
                  {issuerInitials}
                </span>
              </div>
              <span className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted" aria-hidden="true">
                scan on the way
              </span>
            </div>
          )}

          {/* featured ribbon */}
          {cert.featured && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-[0.18em] border backdrop-blur-md"
              style={{ borderColor: `${TINT}55`, background: `${TINT}1f`, color: "#ddd6fe" }}
            >
              <BadgeCheck size={11} strokeWidth={2.2} aria-hidden="true" /> Featured
            </span>
          )}
          {cert.date && (
            <span className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-[0.18em] border border-white/12 bg-black/45 text-white/80 backdrop-blur-md">
              {cert.date}
            </span>
          )}
        </div>

        {/* body */}
        <div className="flex-1 flex flex-col p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: TINT }}>
            {cert.issuer || "Certification"}
          </p>
          <h2 className="font-display font-semibold text-text-primary leading-snug mb-2.5">
            {cert.title}
          </h2>
          {cert.description && (
            <p className="font-body text-sm text-text-secondary leading-relaxed mb-4">
              {cert.description}
            </p>
          )}

          {(cert.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4" aria-label="Skills validated by this certificate">
              {cert.skills.filter(Boolean).slice(0, 6).map((sk) => (
                <span key={sk} className="skill-chip font-mono text-[10px] px-2.5 py-1 rounded-md" style={{ borderColor: `${TINT}30` }}>
                  {sk}
                </span>
              ))}
            </div>
          )}

          {/* footer — verify / credential id */}
          <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
            {cert.url ? (
              <a
                href={cert.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-2 rounded-lg border transition-all hover:-translate-y-0.5"
                style={{ borderColor: `${TINT}45`, color: TINT, background: `${TINT}0f` }}
                aria-label={`Verify credential: ${cert.title}`}
              >
                <ExternalLink size={11} strokeWidth={2.2} aria-hidden="true" />
                Verify credential
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                <BadgeCheck size={11} strokeWidth={2.2} aria-hidden="true" /> Issued credential
              </span>
            )}
            {cert.credentialId && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-text-muted truncate" title={`Credential ID: ${cert.credentialId}`}>
                <Fingerprint size={11} aria-hidden="true" />
                <span className="truncate max-w-[90px]">{cert.credentialId}</span>
              </span>
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

function monogram(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
