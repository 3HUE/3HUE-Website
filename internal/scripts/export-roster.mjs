#!/usr/bin/env node
/* Export the digital-workforce roster for other 3HUE systems (ECARM, Deal Builder…):
 *   public/data/roster.json   identity fields + tint colors + inline SVG portrait
 * Run: node scripts/export-roster.mjs   (no dependencies) */
import { writeFileSync, mkdirSync } from "node:fs";
import { AGENTS, TINTS, STATUS, avatarSvg } from "../public/agents.js";

const roster = AGENTS.map((agent) => ({
  id: agent.id,
  name: agent.name,
  pronouns: agent.pronouns,
  role: agent.role,
  team: agent.team,
  reportsTo: agent.reportsTo,
  since: agent.since,
  status: agent.status,
  statusLabel: (STATUS[agent.status] || {}).label || agent.status,
  tint: { name: agent.tint, ...TINTS[agent.tint] },
  tagline: agent.tagline,
  bio: agent.bio,
  personality: agent.personality,
  capabilities: agent.capabilities,
  systems: agent.systems,
  voice: agent.voice,
  look: agent.look,
  signature: agent.signature,
  intro: agent.intro,
  portrait: {
    svg: avatarSvg(agent, { size: 96 }),
    fullSvg: avatarSvg(agent, { size: 240, full: true }),
    png: `icons/agents/${agent.id}.png`,
    fullPng: `icons/agents/${agent.id}-full.png`,
  },
}));

mkdirSync(new URL("../public/data/", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../public/data/roster.json", import.meta.url),
  `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), source: "internal/public/agents.js", agents: roster }, null, 2)}\n`
);
console.log(`roster.json: ${roster.length} agents`);
