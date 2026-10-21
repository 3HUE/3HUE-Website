// Cloudflare Pages build: copy the publishable site into _site/, leaving repo tooling and the
// internal hub (deployed separately as a Worker) out of the public deployment.
// Pages settings: build command `node scripts/pages-build.mjs`, build output directory `_site`.
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { basename } from "node:path";
const SKIP_DIRS = new Set([".git", ".github", ".claude", "node_modules", "internal", "engagements", "scripts", "_archive", "3hue-new", "builder", "new-site", "_site", "__pycache__", "assessments", "assessor-playbook", "industries", "ai-advisory", "offers"]);
// retired pages of the previous site (their URLs are in _redirects); duplicates and templates that were never meant to be public
const SKIP_PATHS = new Set(["services/cloudsignals-riskops.html", "services/continuous-risk-management.html", "services/cyber-incident-response-program.html", "services/cyber-incident-response-program2.html", "services/index.html", "services/index2.html", "services/isg-managed-programs.html", "services/itg-managed-services.html", "services/risk-posture-assessment.html", "services/security-compliance-services.html", "isg/pricing.html", "frameworks/index (1).html", "frameworks/usr-framework1.html", "insights/insights-article.html", "LAUNCH.md", "partner-portal/partner-program.html", "partner-portal/partner-program-main.tmp"]);
const SKIP_FILES = new Set(["package.json", "package-lock.json", "_config.yml", ".gitignore", ".prettierrc", "CNAME"]);
const skip = (src) => {
  const name = basename(src);
  const rel = src.replace(/^\.[\/\\]/, "").replace(/\\/g, "/");
  if (SKIP_PATHS.has(rel)) return true;
  if (SKIP_DIRS.has(name)) return true;
  if (SKIP_FILES.has(name)) return true;
  if (/\.(py|ps1|tmp)$/.test(name)) return true;
  if (/^assets[\/\\]vids[\/\\][^\/\\]+\.mp4$/.test(src)) return true; // original brand films (web encodes live in assets/vids/web)
  return false;
};
rmSync("_site", { recursive: true, force: true });
mkdirSync("_site");
cpSync(".", "_site", { recursive: true, filter: (src) => !skip(src) });
console.log("site copied to _site/");
