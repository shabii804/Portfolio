import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { usePortfolio } from "../hooks/usePortfolio";

// ─── EmailJS configuration ────────────────────────────────────────────────
// Replace these with your real EmailJS credentials. Get them from
// https://dashboard.emailjs.com/admin
//
//   SERVICE_ID  →  EmailJS Services → your service ID (e.g. "service_xxx")
//   TEMPLATE_ID →  EmailJS Templates → your template ID (e.g. "template_xxx")
//   PUBLIC_KEY  →  EmailJS Account → API Keys → Public Key
//
// Until these are filled in, the form will gracefully fall back to opening
// the user's email client via a mailto: link.
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "";

const EMAILJS_ENABLED = Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);

if (EMAILJS_ENABLED) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

const INITIAL_FORM = { name: "", email: "", subject: "", message: "", website: "" };

export default function Contact() {
  const { personal } = usePortfolio();
  const ref = useRef(null);
  const formRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error | fallback
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const phoneDigits = (personal.phone || "").replace(/\D/g, "");

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name";
    if (!form.email.trim()) errs.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please enter a valid email";
    if (!form.message.trim()) errs.message = "Please enter a message";
    else if (form.message.trim().length < 10) errs.message = "Message should be at least 10 characters";
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

    // Primary path: persist to the admin inbox (/api/messages → /admin → Messages).
    // The hidden `website` field is a honeypot — bots fill it, humans never see it.
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          website: form.website,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        // Deliver an email copy too when EmailJS is configured (best effort).
        if (EMAILJS_ENABLED) {
          try {
            await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formRef.current, {
              publicKey: EMAILJS_PUBLIC_KEY,
            });
          } catch { /* inbox already has it */ }
        }
        setStatus("success");
        setForm(INITIAL_FORM);
        setTimeout(() => setStatus("idle"), 5000);
        return;
      }
    } catch { /* API unreachable → fall through to fallback paths */ }

    // Fallback path: EmailJS not configured → open mail client
    if (!EMAILJS_ENABLED) {
      const mailto = `mailto:${personal.email}?subject=${encodeURIComponent(
        `[Portfolio Contact] ${form.subject || "New message"}`
      )}&body=${encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
      )}`;
      window.location.href = mailto;
      setStatus("fallback");
      setTimeout(() => setStatus("idle"), 4000);
      return;
    }

    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formRef.current, {
        publicKey: EMAILJS_PUBLIC_KEY,
      });
      setStatus("success");
      setForm(INITIAL_FORM);
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section id="contact" ref={ref} className="section-y relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-indigo/[0.025] to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6">
        <div className="animate-on-scroll flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent-indigo/50" />
          <span className="section-label">Contact</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent-indigo/50" />
        </div>

        <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4 text-center" style={{ transitionDelay: "0.08s" }}>
          Let's build something<br /><span className="text-gradient-indigo">together.</span>
        </h2>

        <p className="animate-on-scroll font-body text-text-secondary text-lg max-w-xl mx-auto mb-12 leading-relaxed text-center" style={{ transitionDelay: "0.12s" }}>
          I'm actively looking for internships, junior roles, or freelance projects.
          If you have something interesting in mind, I'd love to hear about it.
        </p>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* LEFT — Contact Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="animate-on-scroll lg:col-span-3 card-border-glow rounded-2xl p-6 md:p-8 bg-bg-card space-y-4"
            style={{ transitionDelay: "0.16s" }}
          >
            <input type="hidden" name="to_email" value={personal.email} />
            <input type="hidden" name="portfolio_owner" value={personal.name} />
            {/* Honeypot — hidden from humans, catches bots */}
            <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={handleChange}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
                  Your Name <span className="text-accent-indigo">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "err-name" : undefined}
                  className={`w-full bg-bg-primary border rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo/60 transition-colors ${
                    errors.name ? "border-red-500/50" : "border-border-mid"
                  }`}
                />
                {errors.name && (
                  <p id="err-name" className="font-mono text-[10px] text-red-400 mt-1.5">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="contact-email" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
                  Your Email <span className="text-accent-indigo">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "err-email" : undefined}
                  className={`w-full bg-bg-primary border rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo/60 transition-colors ${
                    errors.email ? "border-red-500/50" : "border-border-mid"
                  }`}
                />
                {errors.email && (
                  <p id="err-email" className="font-mono text-[10px] text-red-400 mt-1.5">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="Project inquiry, job opportunity, etc."
                className="w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
                Message <span className="text-accent-indigo">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell me about your project, role, or idea..."
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "err-message" : undefined}
                className={`w-full bg-bg-primary border rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-indigo/60 transition-colors ${
                  errors.message ? "border-red-500/50" : "border-border-mid"
                }`}
              />
              {errors.message && (
                <p id="err-message" className="font-mono text-[10px] text-red-400 mt-1.5">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-medium text-sm flex items-center justify-center gap-2.5 glow-on-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Send Message
                </>
              )}
            </button>

            {/* Status messages */}
            {status === "success" && (
              <div role="status" className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <p className="font-body text-sm text-emerald-400">Thanks! Your message has been sent. I'll get back to you soon.</p>
              </div>
            )}
            {status === "error" && (
              <div role="alert" className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <p className="font-body text-sm text-red-400">Something went wrong. Please try again or email me directly.</p>
              </div>
            )}
            {status === "fallback" && (
              <div role="status" className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <p className="font-body text-sm text-accent-cyan">
                  Your email app should open in a moment. If nothing happens, email me directly at{" "}
                  <a href={`mailto:${personal.email}?subject=${encodeURIComponent("[Portfolio Contact] Hello")}`} className="underline">{personal.email}</a>
                </p>
              </div>
            )}
          </form>

          {/* RIGHT — Direct contact options */}
          <div className="animate-on-scroll lg:col-span-2 space-y-4" style={{ transitionDelay: "0.2s" }}>
            <a
              href={`https://wa.me/${phoneDigits}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!%20I%27d%20like%20to%20talk%20about%20a%20project.`}
              target="_blank"
              rel="noreferrer"
              className="card-border-glow rounded-xl p-5 bg-bg-card flex items-center gap-4 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm4.786 14.193c-.272.763-1.392 1.4-2.155 1.508-.654.098-1.503.185-4.408-.98-3.723-1.492-6.13-5.267-6.315-5.512-.185-.245-1.503-2-1.503-3.816 0-1.815.959-2.709 1.303-3.069.344-.36.758-.45.998-.45.24 0 .48.01.688.02.218.01.512-.08.8-.08.288 0 .584.09.83.676.24.58.83 2.02.9 2.16.07.14.12.3.02.5-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.3.8 1.31 1.71 2.12.91.81 1.67 1.06 1.91 1.19.24.13.38.11.52-.05.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.52.72 1.79.85.27.14.45.2.51.31.06.11.06.66-.21 1.42z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-text-primary text-sm">Message on WhatsApp</div>
                <div className="font-body text-xs text-text-muted">Fastest reply · usually within hours</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-muted group-hover:text-accent-indigo transition-colors"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            <a
              href={`mailto:${personal.email}`}
              className="card-border-glow rounded-xl p-5 bg-bg-card flex items-center gap-4 group"
            >
              <div className="w-11 h-11 rounded-xl bg-accent-indigo/10 border border-accent-indigo/25 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-text-primary text-sm">Email Me</div>
                <div className="font-body text-xs text-text-muted truncate">{personal.email}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-muted group-hover:text-accent-indigo transition-colors"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            <a
              href={personal.linkedin}
              target="_blank"
              rel="noreferrer"
              className="card-border-glow rounded-xl p-5 bg-bg-card flex items-center gap-4 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/25 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-text-primary text-sm">Connect on LinkedIn</div>
                <div className="font-body text-xs text-text-muted">shoaib-arshad</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-muted group-hover:text-accent-indigo transition-colors"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            <div className="card-border-glow rounded-xl p-5 bg-bg-card">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Location</span>
              </div>
              <div className="font-body text-sm text-text-secondary">{personal.location}</div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
                <div className="relative flex h-2 w-2">
                  <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </div>
                <span className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest">
                  {personal.available ? "Available for opportunities" : "Currently unavailable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
