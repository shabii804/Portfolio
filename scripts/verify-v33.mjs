// ═════════════════════════════════════════════════════════════════════════════
// verify-v33 — Certificates page + CMS tab + unified always-visible nav.
// Runs against the PRODUCTION build via `vite preview` (no /api — bundled
// defaults). Admin CRUD + API contract covered on dev by check-v33-admin.mjs.
//   node scripts/verify-v33.mjs   (BASE_URL env, default http://localhost:4173)
// ═════════════════════════════════════════════════════════════════════════════
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:4173";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${extra}`); }
};

const browser = await chromium.launch();
const pageErrors = [];

// ── A. MOBILE nav (390) — compact, always visible, footage-proof ───────────
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", (e) => pageErrors.push("m:" + e));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const m = await page.evaluate(() => {
    const bar = document.querySelector(".nav-bar");
    const cs = getComputedStyle(bar);
    const b = bar.getBoundingClientRect();
    const probe = (el) => {
      const s = getComputedStyle(el);
      return s.backdropFilter !== "none" ? s.backdropFilter
        : s.webkitBackdropFilter !== "none" ? s.webkitBackdropFilter : "none";
    };
    return {
      h: b.height, top: b.top, bg: cs.backgroundColor, radius: cs.borderRadius,
      border: cs.borderColor, blur: probe(bar), z: getComputedStyle(bar.closest(".nav-shell")).zIndex,
    };
  });
  console.log("A. mobile nav");
  ok("compact height ≤ 62px (was 70)", m.h > 40 && m.h <= 62, `h=${m.h}`);
  ok("near-opaque footage-proof glass rgba(9,9,16,0.94)", m.bg === "rgba(9, 9, 16, 0.94)", m.bg);
  ok("indigo rim border", m.border.includes("129, 140, 248"), m.border);
  ok("pill radius", parseFloat(m.radius) >= 12, m.radius);
  ok("backdrop blur survives build", m.blur !== "none", m.blur);

  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(900);
  const mScrolled = await page.evaluate(() => {
    const bar = document.querySelector(".nav-bar");
    const b = bar.getBoundingClientRect();
    return { visible: b.top >= 0 && b.top < 50, bg: getComputedStyle(bar).backgroundColor };
  });
  ok("still visible after scroll (no hide-on-scroll-down)", mScrolled.visible);
  ok("same pill when scrolled (no morph)", mScrolled.bg === m.bg, mScrolled.bg);
  await page.screenshot({ path: "scripts/shots-v33/verify-m-scrolled.png" });

  // menu overlay lists Certificates
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.click('button[aria-label="Toggle menu"]');
  await page.waitForTimeout(800);
  const mMenu = await page.evaluate(() => {
    const labels = [...document.querySelectorAll(".nm-label")].map((n) => n.textContent);
    return { hasCerts: labels.includes("Certificates"), count: labels.length };
  });
  ok("mobile menu has Certificates (8 items)", mMenu.hasCerts && mMenu.count === 8, JSON.stringify(mMenu));
  await page.close();
}

// ── B. DESKTOP nav (1440) — glass pill at top, legible links, 8 items ──────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => pageErrors.push("d:" + e));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const d = await page.evaluate(() => {
    const bar = document.querySelector(".nav-bar");
    const cs = getComputedStyle(bar);
    const b = bar.getBoundingClientRect();
    const link = [...document.querySelectorAll(".nav-link")].find((n) => n.textContent === "About");
    const parts = cs.backgroundColor.replace(/rgba?\(/, "").replace(")", "").split(",");
    return {
      h: b.height, w: b.width, bg: cs.backgroundColor, alpha: parts[3] ? parts[3].trim() : "1",
      blur: (getComputedStyle(bar).backdropFilter || "none") !== "none",
      links: [...document.querySelectorAll(".nav-link")].map((n) => n.textContent),
      linkColor: link ? getComputedStyle(link).color : null,
      hireMe: !!document.querySelector(".nav-bar .btn-primary"),
    };
  });
  console.log("B. desktop nav");
  ok("compact height ≤ 62px", d.h <= 62, `h=${d.h}`);
  ok("glass pill at top (no transparent state)", d.alpha && parseFloat(d.alpha) >= 0.8, d.bg);
  ok("backdrop blur active", d.blur);
  ok("all 8 links incl. Certificates", d.links.length === 8 && d.links.includes("Certificates"), d.links.join(","));
  ok("links legible (light text)", d.linkColor && !d.linkColor.startsWith("rgb(10"), d.linkColor);
  ok("Hire Me CTA present", d.hireMe);
  await page.screenshot({ path: "scripts/shots-v33/verify-d-top.png" });

  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(900);
  const dS = await page.evaluate(() => {
    const b = document.querySelector(".nav-bar").getBoundingClientRect();
    return b.top >= 0 && b.top < 50;
  });
  ok("desktop nav visible after scroll", dS);
  await page.close();
}

// ── C. /certificates page — cards, wiring, SEO, overflow matrix ─────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => pageErrors.push("c:" + e));
  await page.goto(BASE + "/certificates", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  const c = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent || "",
    cards: document.querySelectorAll("article").length,
    featured: [...document.querySelectorAll("article")].filter((a) => a.textContent.includes("Featured")).length,
    chips: document.querySelectorAll("article .skill-chip").length,
    verify: [...document.querySelectorAll("article")].filter((a) => a.textContent.includes("Issued credential")).length,
    eyebrow: document.body.textContent.includes("CERTIFICATES"),
    statChips: document.body.textContent.includes("3 certificates"),
  }));
  console.log("C. certificates page");
  ok("SEO title", c.title.includes("Certificates"), c.title);
  ok("sr-only h1", c.h1.toLowerCase().includes("certificates"));
  ok("3 seeded cards render", c.cards === 3, `cards=${c.cards}`);
  ok("featured badge present", c.featured >= 2);
  ok("skill chips render", c.chips >= 8, `chips=${c.chips}`);
  ok("issued-credential footers", c.verify === 3);
  ok("eyebrow + stat strip", c.eyebrow && c.statChips);

  // nav active state + footer link + PageNextNav position
  const wiring = await page.evaluate(() => ({
    navActive: document.querySelector(".nav-link.active")?.textContent,
    footer: [...document.querySelectorAll("footer a")].some((a) => a.textContent.trim() === "Certificates"),
    pnPos: document.body.textContent.includes("06 / 07"),
  }));
  ok("nav active = Certificates", wiring.navActive === "Certificates", String(wiring.navActive));
  ok("footer link present", wiring.footer);
  ok("PageNextNav position 06 / 07", wiring.pnPos);

  // placeholder visual (no scan uploaded): monogram + "scan on the way"
  const ph = await page.evaluate(() => ({
    monograms: document.body.textContent.includes("CN"),
    scanNote: document.body.textContent.includes("scan on the way"),
  }));
  ok("designed placeholder (monogram + note)", ph.monograms && ph.scanNote);

  // overflow matrix
  const widths = [320, 375, 768, 1024, 1440];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(450);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`no overflow @${w}`, over === 0, `+${over}px`);
  }
  await page.screenshot({ path: "scripts/shots-v33/verify-certs.png" });

  // journey → certificates handoff
  await page.goto(BASE + "/journey", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const jn = await page.evaluate(() => {
    const next = [...document.querySelectorAll("a")].find((a) => a.getAttribute("href") === "/certificates");
    return !!next;
  });
  ok("journey PageNextNav → Certificates", jn);
  await page.close();
}

// ── D. Home regression — hero untouched, one-pager intact ───────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => pageErrors.push("h:" + e));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const home = await page.evaluate(() => ({
    video: !!document.querySelector(".hero-video-media"),
    stats: !!document.querySelector(".stats-panel"),
    sections: ["About", "Skills", "Projects"].filter((t) => document.body.textContent.includes(t)).length,
  }));
  console.log("D. home regression");
  ok("hero video intact", home.video);
  ok("stats panel intact", home.stats);
  ok("one-pager sections intact", home.sections === 3);

  // light theme: frosted light pill in both states
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    window.scrollTo(0, 900);
  });
  await page.waitForTimeout(700);
  const lt = await page.evaluate(() => getComputedStyle(document.querySelector(".nav-bar")).backgroundColor);
  ok("light theme frosted pill", lt.includes("243, 243, 248"), lt);
  await page.close();
}

ok("zero page errors", pageErrors.length === 0, pageErrors.join(" | ").slice(0, 200));

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
