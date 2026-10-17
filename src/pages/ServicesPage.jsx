import { useRef, useState } from "react";
import {
  Briefcase, Globe, LayoutDashboard, Monitor, Database, Rocket, Wrench,
  Code2, Route, CalendarCheck, HelpCircle, Check, ArrowRight, MessageCircle,
} from "lucide-react";
import SectionHeader from "../components/motion/SectionHeader";
import Reveal from "../components/motion/Reveal";
import PageNextNav from "../components/PageNextNav";
import usePageSEO from "../hooks/usePageSEO";
import { usePortfolio } from "../hooks/usePortfolio";

/* ─────────────────────────────────────────────────────────────────────────────
   Services (v29) — the newest room of the site.

   01 Catalog (admin-editable via /admin → Services) → 02 Process →
   03 Booking form (lands in the same admin inbox as the contact form,
   subject-prefixed "Service booking — …") → 04 FAQ.

   "Book this service" buttons pre-select the service in the form and scroll
   to it — zero-JS-lib smoothness via the existing Lenis instance / scrollIntoView.
   ────────────────────────────────────────────────────────────────────────── */

const ICONS = {
  globe: Globe,
  "layout-dashboard": LayoutDashboard,
  monitor: Monitor,
  database: Database,
  rocket: Rocket,
  wrench: Wrench,
  briefcase: Briefcase,
  code: Code2,
};

const PROCESS = [
  { n: "01", title: "Tell me the goal", desc: "Book below or ping WhatsApp with the problem you want solved — a paragraph is enough to start." },
  { n: "02", title: "Scope & quote", desc: "We turn the goal into a short written scope: features, timeline and a fixed price before anything starts." },
  { n: "03", title: "Build with check-ins", desc: "You see progress as it happens — staging links at every milestone, feedback folded in as we go." },
  { n: "04", title: "Launch & handover", desc: "Deployed to your domain with credentials handed over, plus a walkthrough and a support window." },
];

const FAQ = [
  {
    q: "What does a project cost?",
    a: "Every build is scoped individually — a landing page and a full admin dashboard are different jobs. After the first short conversation you get a fixed written quote, so there are no surprises halfway through. The booking form's \"project size\" field is enough for a first estimate.",
  },
  {
    q: "How do we start?",
    a: "Pick the closest service above and hit \"Book this service\" — the form below pre-fills it. Or message me directly on WhatsApp with two lines about the project. Either way, the next step is a short call or chat to pin down the scope.",
  },
  {
    q: "Do you work with small businesses and students?",
    a: "Yes — most of my production work started exactly there. Farooq Agencies is a traditional medical supply business I digitized end-to-end, and it has run with zero downtime since launch. If the project is real, it counts.",
  },
];

const SIZES = ["Not sure yet", "Small — a few days", "Medium — 1–3 weeks", "Large — 1–3 months"];
const TIMELINES = ["Flexible", "Within a month", "As soon as possible"];

const INITIAL_FORM = { name: "", email: "", service: "", size: SIZES[0], timeline: TIMELINES[0], details: "", website: "" };

export default function ServicesPage() {
  const { services, personal } = usePortfolio();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error | fallback
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  usePageSEO(
    "Services & Booking — Shoaib Arshad",
    "Hire Shoaib Arshad: full-stack web apps (React, Node.js, Firebase), admin dashboards, Java desktop systems, database design, landing pages and maintenance — book a service directly."
  );

  const list = (services || []).length ? services : [];

  const bookService = (title) => {
    setForm((prev) => ({ ...prev, service: title }));
    const el = document.getElementById("book");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name";
    if (!form.email.trim()) errs.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please enter a valid email";
    if (!form.service) errs.service = "Pick a service";
    if (!form.details.trim()) errs.details = "Tell me a little about the project";
    else if (form.details.trim().length < 10) errs.details = "A sentence or two is enough (10+ characters)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");

    const composed = [
      `Service: ${form.service}`,
      `Project size: ${form.size}`,
      `Timeline: ${form.timeline}`,
      "",
      form.details.trim(),
    ].join("\n");

    // Primary path: the admin inbox (same pipeline as the contact form).
    // Hidden `website` field is the honeypot — bots fill it, humans never see it.
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Service booking — ${form.service}`,
          message: composed,
          website: form.website,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setStatus("success");
        setForm(INITIAL_FORM);
        setTimeout(() => setStatus("idle"), 6000);
        return;
      }
    } catch { /* fall through */ }

    // Fallback: open the email client with everything pre-composed.
    const mailto = `mailto:${personal.email}?subject=${encodeURIComponent(
      `[Service booking] ${form.service}`
    )}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${composed}`)}`;
    window.location.href = mailto;
    setStatus("fallback");
    setTimeout(() => setStatus("idle"), 5000);
  };

  const waText = encodeURIComponent(
    `Hi ${personal.name?.split(" ")[0] || "Shoaib"}! I'd like to book a service${form.service ? `: ${form.service}` : ""}.`
  );

  const inputCls = (err) =>
    `w-full bg-bg-card border rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
      err ? "border-red-400/60" : "border-border-subtle focus:border-accent-indigo/50"
    }`;

  return (
    <div className="pt-20 md:pt-24">
      <h1 className="sr-only">Services &amp; Booking — Shoaib Arshad</h1>

      {/* ── 01 · Catalog ─────────────────────────────────────────────────── */}
      <section className="section-y relative" aria-label="Service catalog">
        <div className="container-x">
          <SectionHeader
            index="01"
            icon={Briefcase}
            tint="#fbbf24"
            label="Services"
            title="What I can build for you."
            accent={["build"]}
            subtitle="Six focused services, each backed by production proof — pick one and book it in under a minute."
          />

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mt-12">
            {list.map((s, i) => {
              const Icon = ICONS[s.icon] || Briefcase;
              const tint = s.tint || "#fbbf24";
              return (
                <Reveal key={s.id || i} delay={0.05 * i} className="h-full">
                  <article
                    className="group relative flex h-full flex-col rounded-2xl border border-border-subtle bg-bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-indigo/40"
                    style={{ "--svc-tint": tint }}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110"
                        style={{ color: tint, borderColor: `${tint}38`, background: `${tint}12` }}
                        aria-hidden="true"
                      >
                        <Icon size={19} strokeWidth={2} />
                      </span>
                      {s.timeline && (
                        <span
                          className="font-mono text-[10px] px-2.5 py-1 rounded-full border"
                          style={{ color: `${tint}cc`, borderColor: `${tint}30`, background: `${tint}08` }}
                        >
                          {s.timeline}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-lg text-text-primary mb-1.5">{s.title}</h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed mb-5">{s.tagline}</p>

                    <ul className="space-y-2 mb-5 flex-1" aria-label={`${s.title} deliverables`}>
                      {(s.deliverables || []).map((d) => (
                        <li key={d} className="flex items-start gap-2.5 font-body text-[13px] text-text-secondary">
                          <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: `${tint}14` }} aria-hidden="true">
                            <Check size={10} strokeWidth={3} style={{ color: tint }} />
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>

                    {s.proof && (
                      <p className="font-mono text-[10px] text-text-muted mb-4 leading-relaxed">
                        <span className="text-text-secondary">Proof:</span> {s.proof}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => bookService(s.title)}
                      className="mt-auto w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-xl border font-display font-semibold text-sm transition-all duration-300 group-hover:-translate-y-0.5"
                      style={{ color: tint, borderColor: `${tint}45`, background: `${tint}0d` }}
                      aria-label={`Book ${s.title} — jump to the booking form`}
                    >
                      Book this service
                      <ArrowRight size={15} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </button>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 02 · Process ─────────────────────────────────────────────────── */}
      <section className="section-y relative" aria-label="How working together looks">
        <div className="container-x">
          <SectionHeader
            index="02"
            icon={Route}
            tint="#22d3ee"
            label="Process"
            title="From brief to launch."
            accent={["launch."]}
            subtitle="The same four-step loop behind every build in the Projects archive — no black boxes."
          />
          <ol className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mt-12">
            {PROCESS.map((step, i) => (
              <Reveal key={step.n} delay={0.06 * i} className="h-full">
                <li className="relative h-full rounded-2xl border border-border-subtle bg-bg-card p-6 overflow-hidden">
                  <span className="font-display font-bold text-5xl text-gradient-indigo opacity-40" aria-hidden="true">{step.n}</span>
                  <h3 className="font-display font-semibold text-text-primary text-base mt-3 mb-2">{step.title}</h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                  {i < PROCESS.length - 1 && (
                    <ArrowRight size={16} strokeWidth={2} className="hidden xl:block absolute top-8 -right-3 text-text-muted/50" aria-hidden="true" />
                  )}
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 03 · Booking ─────────────────────────────────────────────────── */}
      <section id="book" className="section-y relative" aria-label="Book a service">
        <div className="container-x">
          <SectionHeader
            index="03"
            icon={CalendarCheck}
            tint="#818cf8"
            label="Booking"
            title="Book a service."
            accent={["Book"]}
            subtitle="Lands in my admin inbox the moment you hit send — I reply from Islamabad, usually the same day."
          />

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mt-12 items-start">
            <Reveal>
              <form ref={formRef} onSubmit={handleSubmit} noValidate className="rounded-2xl border border-border-subtle bg-bg-card p-6 md:p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="svc-name" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">Name *</label>
                    <input id="svc-name" name="name" type="text" value={form.name} onChange={handleChange} autoComplete="name"
                      placeholder="Your name" className={inputCls(errors.name)} aria-invalid={!!errors.name} />
                    {errors.name && <p className="font-body text-xs text-red-400 mt-1.5">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="svc-email" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">Email *</label>
                    <input id="svc-email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email"
                      placeholder="you@example.com" className={inputCls(errors.email)} aria-invalid={!!errors.email} />
                    {errors.email && <p className="font-body text-xs text-red-400 mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="svc-service" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">Service *</label>
                  <select id="svc-service" name="service" value={form.service} onChange={handleChange}
                    className={inputCls(errors.service)} aria-invalid={!!errors.service}>
                    <option value="" disabled>Choose a service…</option>
                    {list.map((s) => <option key={s.id || s.title} value={s.title}>{s.title}</option>)}
                  </select>
                  {errors.service && <p className="font-body text-xs text-red-400 mt-1.5">{errors.service}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="svc-size" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">Project size</label>
                    <select id="svc-size" name="size" value={form.size} onChange={handleChange} className={inputCls()}>
                      {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="svc-timeline" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">Timeline</label>
                    <select id="svc-timeline" name="timeline" value={form.timeline} onChange={handleChange} className={inputCls()}>
                      {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="svc-details" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">What are we building? *</label>
                  <textarea id="svc-details" name="details" rows={5} value={form.details} onChange={handleChange}
                    placeholder="Two or three sentences about the goal — e.g. “A dashboard for my shop to track inventory and orders on mobile.”"
                    className={`${inputCls(errors.details)} resize-y`} aria-invalid={!!errors.details} />
                  {errors.details && <p className="font-body text-xs text-red-400 mt-1.5">{errors.details}</p>}
                </div>

                {/* Honeypot — invisible to humans */}
                <input type="text" name="website" value={form.website} onChange={handleChange}
                  className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button type="submit" disabled={status === "sending"}
                    className="btn-primary px-6 py-3.5 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2.5 disabled:opacity-60 glow-on-hover">
                    {status === "sending" ? "Sending…" : "Send booking request"}
                    {status !== "sending" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                  <p aria-live="polite" className="font-body text-sm">
                    {status === "success" && <span className="text-emerald-400">Booking received — it's in my inbox. I'll reply to {form.email || "your email"} soon.</span>}
                    {status === "fallback" && <span className="text-amber-400">Inbox unreachable — your email client just opened with everything pre-filled.</span>}
                    {status === "error" && <span className="text-red-400">Something went wrong — try WhatsApp instead.</span>}
                  </p>
                </div>
              </form>
            </Reveal>

            {/* Side panel — what happens next + direct channels */}
            <Reveal delay={0.1} className="space-y-4">
              <div className="rounded-2xl border border-border-subtle bg-bg-card p-6">
                <h3 className="font-display font-semibold text-text-primary mb-4">What happens next</h3>
                <ol className="space-y-3.5">
                  {[
                    "Your request lands in my admin inbox instantly.",
                    "I reply from Islamabad — usually the same day.",
                    "We pin down scope and you get a fixed written quote.",
                    "Build starts only when you say go.",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-md bg-accent-indigo/10 border border-accent-indigo/25 font-mono text-[9px] text-accent-indigo flex items-center justify-center shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-body text-sm text-text-secondary leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <a
                href={`https://wa.me/${(personal.phone || "").replace(/\D/g, "")}?text=${waText}`}
                target="_blank" rel="noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] px-5 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50"
              >
                <span className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0" aria-hidden="true">
                  <MessageCircle size={18} strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display font-semibold text-text-primary text-sm">Prefer WhatsApp?</span>
                  <span className="block font-mono text-[10px] text-text-muted mt-0.5 truncate">Direct line — {personal.phone}</span>
                </span>
                <ArrowRight size={15} strokeWidth={2.5} className="ml-auto text-emerald-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 04 · FAQ ─────────────────────────────────────────────────────── */}
      <section className="section-y relative" aria-label="Frequently asked questions">
        <div className="container-x">
          <SectionHeader
            index="04"
            icon={HelpCircle}
            tint="#34d399"
            label="FAQ"
            title="Before you ask."
            accent={["ask."]}
            subtitle="The three questions almost every booking starts with."
          />
          <div className="max-w-3xl space-y-3 mt-12">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={0.05 * i}>
                <details className="group rounded-2xl border border-border-subtle bg-bg-card px-6 py-5 open:border-accent-indigo/30 transition-colors">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-display font-semibold text-text-primary text-[15px] marker:content-none">
                    {f.q}
                    <span className="w-7 h-7 rounded-full border border-border-mid flex items-center justify-center text-text-muted shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                    </span>
                  </summary>
                  <p className="font-body text-sm text-text-secondary leading-relaxed mt-4">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PageNextNav current="services" />
    </div>
  );
}
