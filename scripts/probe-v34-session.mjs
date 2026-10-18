// probe-v34-session — proves the v34 same-session integration:
//   1. load /admin (boot)
//   2. pin "keybord" repo + save (IN-SESSION mutation)
//   3. client-side navigate to /projects (pushState + popstate — NO reload)
//   4. the public page must ALREADY show the pin (runtime → context subscription)
// File state is backed up and restored.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const before = {
  content: fs.readFileSync("src/data/content.json", "utf8"),
  portfolio: fs.readFileSync("src/data/portfolio.js", "utf8"),
};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const report = {};

await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.fill("#admin-password", process.env.ADMIN_PW || "shoaib-admin-2026");
await page.click('button[type="submit"]');
await page.waitForTimeout(1800);
await page.click('nav[aria-label="Admin sections"] button:has-text("Projects")');
await page.waitForTimeout(1000);

// in-session save: pin keybord
await page.locator('button[aria-label="Pin keybord"]').click();
await page.waitForTimeout(300);
await page.click('button:has-text("Save archive")');
await page.waitForTimeout(2500);
report.savedInSession = await page.evaluate(() => document.body.textContent.includes("GitHub archive saved"));

// CLIENT-SIDE navigation — no reload (popstate-driven SPA route change)
await page.evaluate(() => {
  window.history.pushState({}, "", "/projects");
  window.dispatchEvent(new PopStateEvent("popstate"));
});
await page.waitForTimeout(1800);
report.urlChanged = page.url().endsWith("/projects");
report.noReload = await page.evaluate(() => performance.getEntriesByType("navigation").length === 1);

const pub = await page.evaluate(() => {
  const cards = [...document.querySelectorAll("article")];
  const kb = cards.find((a) => (a.querySelector("h3")?.textContent || "").toLowerCase().includes("keybord"));
  return {
    keybordPinned: kb ? kb.querySelector('[data-pinned="true"]') != null : false,
    keybordIndex: cards.findIndex((a) => (a.querySelector("h3")?.textContent || "").toLowerCase().includes("keybord")),
  };
});
report.sameSessionPinVisible = pub.keybordPinned; // ← the whole point
report.keybordIndex = pub.keybordIndex;

await browser.close();
try {
  fs.writeFileSync("src/data/content.json", before.content);
  fs.writeFileSync("src/data/portfolio.js", before.portfolio);
  report.restored = true;
} catch { report.restored = false; }

const musts = ["savedInSession", "urlChanged", "noReload", "sameSessionPinVisible", "restored"];
const failed = musts.filter((k) => !report[k]);
console.log(JSON.stringify(report, null, 1));
console.log(`\nprobe-v34-session: ${musts.length - failed.length}/${musts.length} passed${failed.length ? ` — FAILED: ${failed.join(", ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
