// v34 verifier — "admin ↔ website: full projects control"
//   PART A (unit): the pure archive pipeline in src/data/githubRepos.js
//   PART B (dist): built bundles carry the new admin panel + public markers
//   PART C (preview runtime): /projects pin-first rendering, badges, integrity
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { applyRepoSettings, orderArchive, mapGithubRepos } from "../src/data/githubRepos.js";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const results = [];
const check = (name, ok, extra = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
};

/* ─── PART A — unit tests on the pure pipeline ────────────────────────────── */
const raw = [
  { name: "alpha-app", description: "First", language: "JavaScript", stargazers_count: 2, forks_count: 0, homepage: "", html_url: "https://github.com/u/alpha-app", topics: [], pushed_at: "", created_at: "2026-01-01" },
  { name: "beta-tool", description: "", language: "TypeScript", stargazers_count: 0, forks_count: 0, homepage: "", html_url: "https://github.com/u/beta-tool", topics: [], pushed_at: "", created_at: "2026-02-01" },
  { name: "gamma-lab", description: "Third", language: "HTML", stargazers_count: 1, forks_count: 0, homepage: "", html_url: "https://github.com/u/gamma-lab", topics: [], pushed_at: "", created_at: "2026-03-01" },
];
const curated = [{ id: "c1", title: "Curated One", pinned: false, github: "" }, { id: "c2", title: "Curated Two", pinned: true, github: "" }];

// 1 — no settings → v32 order preserved + numbering sequential
{
  const { cards, pinnedSet } = applyRepoSettings(raw, new Set(), {});
  const all = orderArchive(curated, cards, pinnedSet);
  check("A1 no-pins order = curated then repos", all.map((p) => p.repoName || p.title).join("|") === "Curated Two|Curated One|alpha-app|beta-tool|gamma-lab", all.map((p) => p.repoName || p.title).join("|"));
  check("A2 display numbering sequential", all.every((p, i) => p.num === String(i + 1).padStart(2, "0")));
}

// 2 — hidden repos are dropped
{
  const { cards } = applyRepoSettings(raw, new Set(), { hiddenRepos: ["beta-tool"] });
  check("A3 hiddenRepos filtered before mapping", cards.length === 2 && !cards.some((c) => c.repoName === "beta-tool"));
}

// 3 — title/description overrides apply (case-insensitive key)
{
  const { cards } = applyRepoSettings(raw, new Set(), { repoOverrides: { "GAMMA-LAB": { title: "Gamma Lab (fixed)", description: "Better copy" } } });
  const g = cards.find((c) => c.repoName === "gamma-lab");
  check("A4 repoOverrides retitle + redescribe", g?.title === "Gamma Lab (fixed)" && g?.tagline === "Better copy");
}

// 4 — pinned repo floats above the other repos but below curated
{
  const { cards, pinnedSet } = applyRepoSettings(raw, new Set(), { pinnedRepos: ["gamma-lab"] });
  const all = orderArchive(curated, cards, pinnedSet);
  const order = all.map((p) => p.repoName || p.title);
  check("A5 pinned repo floats to top of synced section", order.join("|") === "Curated Two|Curated One|gamma-lab|alpha-app|beta-tool", order.join("|"));
  check("A6 pinned repo card flagged", all.find((p) => p.repoName === "gamma-lab")?.pinned === true);
}

// 5 — dedupe still enforced + repoName exposed
{
  const curatedUrls = new Set(["https://github.com/u/alpha-app"]);
  const { cards } = applyRepoSettings(raw, curatedUrls, {});
  check("A7 curated-URL dedupe intact", !cards.some((c) => c.repoName === "alpha-app"));
  check("A8 mapGithubRepos exposes repoName", mapGithubRepos(raw, new Set())[0].repoName === "alpha-app");
}

/* ─── PART B — dist markers ───────────────────────────────────────────────── */
const distAssets = path.join(process.cwd(), "dist/assets");
const files = fs.readdirSync(distAssets);
const adminJs = files.find((f) => f.startsWith("Admin-") && f.endsWith(".js"));
const indexJs = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const adminSrc = fs.readFileSync(path.join(distAssets, adminJs), "utf8");
const indexSrc = fs.readFileSync(path.join(distAssets, indexJs), "utf8");

check("B1 admin bundle ships the GitHub-archive panel", adminSrc.includes("GitHub archive") && adminSrc.includes("Save archive"));
check("B2 admin bundle has pin/hide controls", adminSrc.includes("Pinned — click to unpin") && adminSrc.includes("Hidden from the site"));
check("B3 admin bundle has stale-setting cleanup", adminSrc.includes("no longer on GitHub"));
check("B4 public bundle mentions pinning", indexSrc.includes("Pinned builds float to the top") || indexSrc.includes("Pinned from the admin panel"));
check("B5 public bundle pins render badge", indexSrc.includes("data-pinned"));
check("B6 bundled defaults carry pinned seed", indexSrc.includes("pinned:true") || indexSrc.includes("pinned:!0"));

/* ─── PART C — preview runtime ────────────────────────────────────────────── */
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => errors.push(String(e)));

try {
  await page.goto(`${BASE}/projects`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const state = await page.evaluate(() => {
    const badges = [...document.querySelectorAll('[data-pinned="true"]')];
    const cards = [...document.querySelectorAll("article")];
    const first = cards[0];
    const firstTitle = first?.querySelector("h3")?.textContent?.trim();
    const syncNote = !!document.querySelector('[data-testid="gh-sync-note"]');
    const nums = cards.map((c) => c.querySelector(".project-num")?.textContent?.trim());
    return {
      pinnedBadges: badges.length,
      firstTitle,
      badgeInFirst: !!first?.querySelector('[data-pinned="true"]'),
      cards: cards.length,
      syncNote,
      nums,
      h1ok: !!document.body.textContent.match(/Work that ships/),
      subtitlePinned: document.body.textContent.includes("Pinned builds float to the top"),
    };
  });

  check("C1 pin badge rendered on seeded project", state.pinnedBadges >= 1, `count=${state.pinnedBadges}`);
  check("C2 first archive card is the pinned build", state.firstTitle === "Farooq Agencies" && state.badgeInFirst, state.firstTitle);
  check("C3 archive renders cards + synced section", state.cards >= 10 && state.syncNote, `cards=${state.cards}`);
  check("C4 section subtitle documents pinning", state.subtitlePinned);
  check("C5 display numbers sequential", state.nums.every((n, i) => n === `${String(i + 1).padStart(2, "0")} /`), state.nums?.slice(0, 4).join(","));

  // Mobile spot-check — no horizontal overflow
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  const overflowM = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("C6 /projects mobile 390px no overflow", overflowM <= 0, `+${overflowM}px`);
  await page.setViewportSize({ width: 1440, height: 900 });

  // Home regression — featured strip still renders with cards
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const home = await page.evaluate(() => ({
    strip: !!document.body.textContent.match(/The builds I'd show first/i),
  }));
  check("C7 home featured strip renders", home.strip);

  check("C8 zero pageerrors", errors.length === 0, errors.join(" | ").slice(0, 200));
} catch (err) {
  check("C-runtime", false, String(err).slice(0, 200));
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\nverify-v34: ${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
