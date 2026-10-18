// v33 recon — nav bar + certificates groundwork diagnosis
// Screenshots: mobile (390x844) home top / scrolled; desktop (1440x900) top.
// Probes: nav pill geometry, contrast vs hero, overlap with hero content.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const OUT = "scripts/shots-v33";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const report = {};

// ── MOBILE ──────────────────────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);

  const nav = await page.evaluate(() => {
    const shell = document.querySelector(".nav-shell");
    const bar = document.querySelector(".nav-bar");
    if (!shell || !bar) return null;
    const sr = shell.getBoundingClientRect();
    const br = bar.getBoundingClientRect();
    const cs = getComputedStyle(bar);
    // find hero text/badge elements the nav could overlap
    const hero = document.querySelector("section, header");
    return {
      shellTop: sr.top, barRect: { t: br.top, h: br.height, w: br.width },
      barBg: cs.backgroundColor, border: cs.borderColor, radius: cs.borderRadius,
      blur: cs.backdropFilter || cs.webkitBackdropFilter,
      zIndex: cs.zIndex, position: cs.position,
      viewportH: window.innerHeight,
    };
  });
  report.mobileNav = nav;

  // what's under the nav pill — sample pixels for contrast check
  const underNav = await page.evaluate(() => {
    const bar = document.querySelector(".nav-bar");
    if (!bar) return [];
    const r = bar.getBoundingClientRect();
    if (![r.left, r.right, r.top, r.bottom].every(Number.isFinite)) return [];
    // list elements intersecting nav band
    const hits = document.elementsFromPoint((r.left + r.right) / 2, r.top + r.height / 2);
    return hits.slice(0, 6).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join(".")}`);
  });
  report.mobileUnderNav = underNav;

  await page.screenshot({ path: `${OUT}/m-top.png` });
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/m-scrolled.png` });
  // mobile menu open
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.click('button[aria-label="Toggle menu"]');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/m-menu.png` });
  report.mobilePageErrors = errors;
  await page.close();
}

// ── DESKTOP ─────────────────────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  const nav = await page.evaluate(() => {
    const bar = document.querySelector(".nav-bar");
    if (!bar) return null;
    const br = bar.getBoundingClientRect();
    return { t: br.top, h: br.height, w: br.width };
  });
  report.desktopNav = nav;
  await page.screenshot({ path: `${OUT}/d-top.png` });
  report.desktopPageErrors = errors;
  await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
