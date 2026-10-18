// v33 visual check — new nav + certificates page + admin tab
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const OUT = "scripts/shots-v33";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const report = { errors: [] };

// MOBILE
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", (e) => report.errors.push("m: " + e));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${OUT}/v33-m-top.png` });
  const navH = await page.evaluate(() => {
    const b = document.querySelector(".nav-bar").getBoundingClientRect();
    return { h: b.height, w: b.width, top: b.top };
  });
  report.mobileNav = navH;
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(900);
  const still = await page.evaluate(() => {
    const el = document.elementFromPoint(195, 30);
    const b = document.querySelector(".nav-bar").getBoundingClientRect();
    return { navVisible: b.top >= 0 && b.top < 40, underNav: el?.textContent?.slice(0, 24) || null };
  });
  report.mobileScrolled = still;
  await page.screenshot({ path: `${OUT}/v33-m-scrolled.png` });
  // menu overlay
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.click('button[aria-label="Toggle menu"]');
  await page.waitForTimeout(900);
  report.mobileMenuHasCerts = await page.evaluate(() =>
    [...document.querySelectorAll(".nm-label")].some((n) => n.textContent === "Certificates")
  );
  await page.screenshot({ path: `${OUT}/v33-m-menu.png` });
  await page.close();
}

// DESKTOP — home nav + certificates page
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => report.errors.push("d: " + e));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${OUT}/v33-d-top.png` });
  const navH = await page.evaluate(() => {
    const b = document.querySelector(".nav-bar").getBoundingClientRect();
    return { h: b.height, w: b.width, top: b.top };
  });
  report.desktopNav = navH;
  // scrolled: nav still visible + link legible
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(900);
  report.desktopScrolledNav = await page.evaluate(() => {
    const b = document.querySelector(".nav-bar").getBoundingClientRect();
    const link = [...document.querySelectorAll(".nav-link")].find((n) => n.textContent === "About");
    const cs = link ? getComputedStyle(link) : null;
    return { navVisible: b.top >= 0 && b.top < 40, linkColor: cs?.color };
  });
  await page.screenshot({ path: `${OUT}/v33-d-scrolled.png` });
  // certificates page
  await page.goto(`${BASE}/certificates`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  report.certsCount = await page.evaluate(() => document.querySelectorAll("article").length);
  report.certsLinksInNav = await page.evaluate(() =>
    [...document.querySelectorAll(".nav-link")].some((n) => n.textContent === "Certificates")
  );
  await page.screenshot({ path: `${OUT}/v33-d-certs.png`, fullPage: false });
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/v33-d-certs-cards.png` });
  // overflow check
  report.certsOverflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
