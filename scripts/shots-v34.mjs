import { chromium } from "playwright";
const BASE = "https://shoaibarshad-seven.vercel.app";
const browser = await chromium.launch();
const shots = [
  { url: "/projects", w: 1440, h: 1000, out: "scripts/shots-v34/prod-projects-pin.png", full: false },
  { url: "/projects", w: 390, h: 900, out: "scripts/shots-v34/prod-projects-mobile.png", full: false },
];
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await page.goto(`${BASE}${s.url}`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: s.out, fullPage: s.full });
  console.log("shot:", s.out);
  await page.close();
}
await browser.close();
