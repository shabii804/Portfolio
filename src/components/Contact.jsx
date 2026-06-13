import { useEffect, useRef } from "react";
import { usePortfolio } from "../context/PortfolioContext";

export default function Contact() {
  const { personal } = usePortfolio();
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Phone digits for WhatsApp link
  const phoneDigits = (personal.phone || "").replace(/\D/g, "");

  return (
    <section id="contact" ref={ref} className="py-16 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-indigo/[0.025] to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="animate-on-scroll flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent-indigo/50" />
          <span className="section-label">Contact</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent-indigo/50" />
        </div>

        <h2 className="animate-on-scroll font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4" style={{ transitionDelay: "0.08s" }}>
          Let's build something<br /><span className="text-gradient-indigo">together.</span>
        </h2>

        <p className="animate-on-scroll font-body text-text-secondary text-lg max-w-xl mx-auto mb-12 leading-relaxed" style={{ transitionDelay: "0.12s" }}>
          I'm actively looking for internships, junior roles, or freelance projects.
          If you have something interesting in mind, I'd love to hear about it.
        </p>

        <div className="animate-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" style={{ transitionDelay: "0.16s" }}>
          <a
            href={`https://wa.me/${phoneDigits}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!%20I%27d%20like%20to%20talk%20about%20a%20project.`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary px-8 py-4 rounded-xl font-display font-medium text-base flex items-center gap-2.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.7 20.3c-.4.4-1 .7-1.6.8-1.4.3-2.8.5-4.3.5C8.1 21.6 3 16.5 3 10.8 3 7 5.1 3.8 8.2 2.6c.6-.2 1.2-.1 1.7.4l1.6 1.6c.4.4.5 1 .3 1.6l-.8 2c-.2.6 0 1.2.5 1.6l2.7 2c.6.4 1.3.5 2 .2l2-.8c.6-.2 1.2-.1 1.6.3l1.6 1.6c.5.6.6 1.3.4 1.9z"/></svg>
            Message on WhatsApp
          </a>
        </div>

        <div className="animate-on-scroll grid sm:grid-cols-3 gap-4 max-w-xl mx-auto" style={{ transitionDelay: "0.2s" }}>
          {[
            { label: "LinkedIn", value: "shoaib-arshad", href: personal.linkedin, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
            { label: "Phone", value: personal.phone, href: `tel:${personal.phone}`, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.26-1.26a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
            { label: "Location", value: personal.location, href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
          ].map((c) =>
            c.href ? (
              <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                className="card-border-glow rounded-xl p-4 bg-bg-card flex flex-col items-center gap-2 text-center group">
                <span className="text-text-muted group-hover:text-accent-indigo transition-colors">{c.icon}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">{c.label}</span>
                <span className="font-body text-xs text-text-secondary group-hover:text-text-primary transition-colors">{c.value}</span>
              </a>
            ) : (
              <div key={c.label} className="card-border-glow rounded-xl p-4 bg-bg-card flex flex-col items-center gap-2 text-center">
                <span className="text-text-muted">{c.icon}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">{c.label}</span>
                <span className="font-body text-xs text-text-secondary">{c.value}</span>
              </div>
            )
          )}
        </div>
        {/* WhatsApp contact card */}
        <div className="animate-on-scroll max-w-md mx-auto mt-8" style={{ transitionDelay: "0.28s" }}>
          <div className="card-border-glow rounded-xl p-4 bg-bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="font-display font-semibold">Prefer a message?</div>
              <div className="font-body text-sm text-text-secondary">Contact me directly on WhatsApp for the fastest reply.</div>
            </div>
            <a href={`https://wa.me/${phoneDigits}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!%20I%27d%20like%20to%20talk.`} target="_blank" rel="noreferrer" className="btn-primary px-4 py-2 rounded-md inline-flex items-center gap-2 justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.7 20.3c-.4.4-1 .7-1.6.8-1.4.3-2.8.5-4.3.5C8.1 21.6 3 16.5 3 10.8 3 7 5.1 3.8 8.2 2.6c.6-.2 1.2-.1 1.7.4l1.6 1.6c.4.4.5 1 .3 1.6l-.8 2c-.2.6 0 1.2.5 1.6l2.7 2c.6.4 1.3.5 2 .2l2-.8c.6-.2 1.2-.1 1.6.3l1.6 1.6c.5.6.6 1.3.4 1.9z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
