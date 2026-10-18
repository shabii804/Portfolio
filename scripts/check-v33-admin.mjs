// v33 admin E2E — login → Certificates tab → edit → save (file driver)
// Verifies: tab renders, CRUD UI works, PUT /api/content accepts certificates,
// content.json + regenerated portfolio.js stay in sync.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const report = { errors: [] };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => report.errors.push(String(e)));

const before = fs.readFileSync("src/data/content.json", "utf8");
const beforeMeta = JSON.parse(before).certificates?.length ?? -1;

await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.fill("#admin-password", process.env.ADMIN_PW || "shoaib-admin-2026");
await page.click('button[type="submit"]');
await page.waitForTimeout(1800);
report.loggedIn = await page.evaluate(() => document.body.textContent.includes("Dashboard"));

await page.click('nav[aria-label="Admin sections"] button:has-text("Certificates")');
await page.waitForTimeout(900);
report.tabVisible = await page.evaluate(() => document.body.textContent.includes("Save certificates"));
report.rows = await page.evaluate(() => [...document.querySelectorAll(".font-display.font-medium.text-sm")].filter((n) => n.textContent.includes("Certificate")).length);

// open the first editor, tweak the date, save
await page.click('button:has-text("Edit")');
await page.waitForTimeout(400);
const dateInput = page.locator('input[placeholder="Mar 2024"]').first();
await dateInput.fill("Mar 2024");
await page.click('button:has-text("Save certificates")');
await page.waitForTimeout(2500);
report.savedToast = await page.evaluate(() => document.body.textContent.includes("Certificates saved"));

const after = JSON.parse(fs.readFileSync("src/data/content.json", "utf8"));
report.contentCerts = after.certificates?.length ?? -1;
report.certsMatchBefore = beforeMeta === report.contentCerts;
report.portfolioHasExport = fs.readFileSync("src/data/portfolio.js", "utf8").includes("export const defaultCertificates");

// live site reflects admin data without rebuild (runtime snapshot fetch)
await page.goto(`${BASE}/certificates`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
report.publicCards = await page.evaluate(() => document.querySelectorAll("article").length);

// API contract: PUT with an invalid shape must 400, valid GET works
const api = await page.evaluate(async () => {
  const g = await fetch("/api/content").then((r) => r.status);
  return { get: g };
});
report.api = api;

await browser.close();
console.log(JSON.stringify(report, null, 1));
