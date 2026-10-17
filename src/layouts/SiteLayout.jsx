import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PortfolioProvider } from "../context/PortfolioContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatButton from "../components/ChatButton";
import CommandPalette from "../components/CommandPalette";
import ScrollProgress from "../components/ScrollProgress";
import BackToTop from "../components/BackToTop";
import Preloader from "../components/Preloader";
import Cursor from "../components/Cursor";
import useLenis, { getLenis } from "../hooks/useLenis";
import useTheme from "../hooks/useTheme";
import useSiteSettings from "../hooks/useSiteSettings";

/* ─────────────────────────────────────────────────────────────────────────────
   SiteLayout (v28) — the shared chrome for every public page.

   Route tree (main.jsx):
     <SiteLayout>  → / (Home) · /about · /skills · /projects · /journey · /contact
     standalone    → /admin (own dashboard shell) · * (NotFound)

   Everything that used to live in App.jsx mounts here ONCE and survives
   route changes: Lenis smooth scroll, theme, preloader handoff, cursor,
   scroll progress, navbar, footer, chatbot, command palette, back-to-top.
   Only <main> content re-mounts per route (keyed fade-in).
   ────────────────────────────────────────────────────────────────────────── */

// When the preloader is disabled via settings, something still has to lift
// the hero entrance choreography (html.is-ready + "sa:ready" event) — the
// Preloader normally owns that handoff.
function ReadyBroadcast() {
  useEffect(() => {
    document.documentElement.classList.add("is-ready");
    window.dispatchEvent(new CustomEvent("sa:ready"));
  }, []);
  return null;
}

// v21: reveal fallback — if IntersectionObserver never fires (old engines,
// restore-from-bfcache, print), no card may stay at opacity 0. After 3.5s
// force-reveal anything still hidden; below-fold items simply appear without
// their scroll animation instead of being invisible forever.
function RevealFallback() {
  useEffect(() => {
    const sweep = () => {
      document.querySelectorAll(".animate-on-scroll:not(.visible)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.96 && r.bottom > 0) el.classList.add("visible");
      });
    };
    const t = setTimeout(sweep, 3500);
    // v24 — continuous scroll-linked failsafe: fast scrolls, anchor jumps and
    // IO edge cases must NEVER leave content at opacity 0 (brief requirement).
    let raf = 0;
    let last = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const now = performance.now();
        if (now - last < 250) return;
        last = now;
        sweep();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}

// Multi-page: every route change starts at the top of the new page —
// instantly for Lenis users, native otherwise. Runs on first mount too
// (harmless no-op at scrollY 0).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function SiteLayout() {
  useLenis();
  const { theme, toggle } = useTheme();
  const settings = useSiteSettings();
  const { pathname } = useLocation();

  return (
    <PortfolioProvider>
      <div className="relative">
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="noise-overlay" />
        {settings.showPreloader === false ? <ReadyBroadcast /> : <Preloader />}
        <RevealFallback />
        <ScrollToTop />
        {settings.showCursor !== false && <Cursor />}
        {settings.showScrollProgress !== false && <ScrollProgress />}
        <Navbar theme={theme} onToggleTheme={toggle} />
        {/* Keyed by pathname: each page fades in as a fresh mount; footer
            joins the fade so the whole "room" settles together. Opacity-only
            — no transform, so fixed overlays inside pages (project modal)
            keep their viewport positioning. */}
        <div key={pathname} className="page-fade">
          <main id="main">
            <Outlet />
          </main>
          <Footer />
        </div>
        {settings.showChatbot !== false && <ChatButton />}
        <CommandPalette />
        {settings.showBackToTop !== false && <BackToTop />}
      </div>
    </PortfolioProvider>
  );
}
