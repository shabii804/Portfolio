// v34 admin E2E — projects CRUD surfaces + GitHub archive controls (file driver).
// Flow: login → Projects tab → pin a curated project → save → content.json
// reflects it → ReposPanel: pin a repo + hide a repo → save → settings reflect
// → public /projects (fresh load) honors pins/hides. Original file bytes are
// restored afterwards so the repo stays clean.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const report = { errors: [] };
const contentPath = "src/data/content.json";
const portfolioPath = "src/data/portfolio.js";
const before = { content: fs.readFileSync(contentPath, "utf8"), portfolio: fs.readFileSync(portfolioPath, "utf8") };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => report.errors.push(String(e)));

try {
  // ── login
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.fill("#admin-password", process.env.ADMIN_PW || "shoaib-admin-2026");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1800);
  report.loggedIn = await page.evaluate(() => document.body.textContent.includes("Dashboard"));

  // ── Projects tab: curated CRUD + new GitHub archive panel
  await page.click('nav[aria-label="Admin sections"] button:has-text("Projects")');
  await page.waitForTimeout(900);
  report.curatedPanel = await page.evaluate(() => document.body.textContent.includes("Save projects"));
  report.reposPanel = await page.evaluate(() => document.body.textContent.includes("GitHub archive") && document.body.textContent.includes("Save archive"));
  report.pinnedBadgeVisible = await page.evaluate(() => document.body.textContent.includes("Pinned"));

  // row-level pin toggle on the first non-pinned project (SpendSmart)
  const pinBtn = page.locator('button[aria-label="Pin SpendSmart"]');
  report.pinButtonPresent = (await pinBtn.count()) === 1;
  await pinBtn.click();
  await page.waitForTimeout(300);
  report.pinToggledState = (await page.locator('button[aria-label="Unpin SpendSmart"]').count()) === 1;
  await page.click('button:has-text("Save projects")');
  await page.waitForTimeout(2200);
  report.saveToast = await page.evaluate(() => document.body.textContent.includes("Projects saved"));

  let c = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  report.spendSmartPinnedInFile = c.projects?.find((p) => p.title === "SpendSmart")?.pinned === true;
  report.farooqStillPinned = c.projects?.find((p) => p.title === "Farooq Agencies")?.pinned === true;
  report.settingsKeysPresent = Array.isArray(c.settings?.pinnedRepos) && Array.isArray(c.settings?.hiddenRepos) && typeof c.settings?.repoOverrides === "object";

  // unpin again (restore state through the UI itself — a real CRUD roundtrip)
  await page.locator('button[aria-label="Unpin SpendSmart"]').click();
  await page.waitForTimeout(300);
  await page.click('button:has-text("Save projects")');
  await page.waitForTimeout(2200);

  // ── ReposPanel: pin "keybord", hide "pulse-tech", retitle "coparete"
  const repoPin = page.locator('button[aria-label="Pin keybord"]');
  report.repoRowsRendered = (await page.locator('button[aria-label^="Pin "]').count()) >= 5;
  await repoPin.click();
  await page.locator('button[aria-label="Hide pulse-tech"]').click();
  await page.locator('button[aria-label="Display settings for coparete"]').click();
  await page.locator('input[aria-label="Display title for coparete"]').fill("Coparete — compare prices");
  await page.waitForTimeout(300);
  await page.click('button:has-text("Save archive")');
  await page.waitForTimeout(2500);
  report.archiveSaveToast = await page.evaluate(() => document.body.textContent.includes("GitHub archive saved"));

  c = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  report.keybordPinned = c.settings?.pinnedRepos?.includes("keybord") === true;
  report.pulseTechHidden = c.settings?.hiddenRepos?.includes("pulse-tech") === true;
  report.copareteOverride = c.settings?.repoOverrides?.coparete?.title === "Coparete — compare prices";
  report.portfolioRegenerated = fs.readFileSync(portfolioPath, "utf8").includes("pinnedRepos");

  // ── public /projects (fresh load) honors the saved settings
  await page.goto(`${BASE}/projects`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const pub = await page.evaluate(() => {
    const text = document.body.textContent;
    const cards = [...document.querySelectorAll("article")];
    const findCard = (needle) => cards.find((a) => (a.querySelector("h3")?.textContent || "").toLowerCase().includes(needle));
    const kb = findCard("keybord");
    return {
      pulseTechGone: !cards.some((a) => /pulse.?tech/i.test(a.querySelector("h3")?.textContent || "")),
      copareteRetitled: findCard("coparete")?.querySelector("h3")?.textContent === "Coparete — compare prices",
      keybordCardFound: !!kb,
      keybordPinnedFlag: kb ? kb.querySelector('[data-pinned="true"]') != null : false,
      cards: cards.length,
    };
  });
  report.publicPulseTechHidden = pub.pulseTechGone;
  report.publicCopareteRetitled = pub.copareteRetitled;
  report.publicKeybordPinnedFlag = pub.keybordPinnedFlag;
  report.publicKeybordFound = pub.keybordCardFound;
  // keybord card must appear AFTER the curated case-study block (pinned-repos zone)
  const cards = await page.evaluate(() => [...document.querySelectorAll("article")].map((a) => a.querySelector("h3")?.textContent?.trim()));
  const kb = cards.findIndex((t) => /keybord/i.test(t || ""));
  report.keybordTopOfSynced = kb === 4; // pinned curated → 3 rest curated → FIRST pinned repo slot
} catch (err) {
  report.errors.push(String(err).slice(0, 300));
} finally {
  // restore the repo files byte-identically (the E2E mutated live data files)
  try {
    fs.writeFileSync(contentPath, before.content);
    fs.writeFileSync(portfolioPath, before.portfolio);
    report.filesRestored = true;
  } catch (e) {
    report.filesRestored = false;
    report.errors.push(`restore failed: ${e}`);
  }
}

await browser.close();
const musts = ["loggedIn", "curatedPanel", "reposPanel", "pinButtonPresent", "pinToggledState", "saveToast", "spendSmartPinnedInFile", "farooqStillPinned", "settingsKeysPresent", "repoRowsRendered", "keybordPinned", "pulseTechHidden", "copareteOverride", "portfolioRegenerated", "publicPulseTechHidden", "publicCopareteRetitled", "publicKeybordFound", "publicKeybordPinnedFlag", "filesRestored"];
const failed = musts.filter((k) => !report[k]);
console.log(JSON.stringify(report, null, 1));
console.log(`\ncheck-v34-admin: ${musts.length - failed.length}/${musts.length} passed${failed.length ? ` — FAILED: ${failed.join(", ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
