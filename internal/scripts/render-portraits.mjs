#!/usr/bin/env node
/* Render PNG portraits (256px) for bylines, Teams cards and other systems that cannot inline SVG.
 *   public/icons/agents/<id>.png
 * Needs Playwright with Chromium: npx playwright install chromium, then node scripts/render-portraits.mjs */
import { mkdirSync } from "node:fs";
import { AGENTS, avatarSvg } from "../public/agents.js";

// PLAYWRIGHT_MODULE lets a globally installed Playwright be used (ESM ignores NODE_PATH).
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const outDir = new URL("../public/icons/agents/", import.meta.url);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 1 });
for (const agent of AGENTS) {
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${avatarSvg(agent, { size: 256 })}</body></html>`
  );
  await page.screenshot({
    path: new URL(`${agent.id}.png`, outDir).pathname,
    omitBackground: true,
    clip: { x: 0, y: 0, width: 256, height: 256 },
  });
  console.log(`rendered ${agent.id}.png`);
}
await browser.close();
