// Cloudflare Pages build: copy the publishable site into _site/, leaving repo tooling and the
// internal hub (deployed separately as a Worker) out of the public deployment.
// Pages settings: build command `node scripts/pages-build.mjs`, build output directory `_site`.
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { basename } from "node:path";
const SKIP_DIRS = new Set([".git", ".github", "node_modules", "internal", "engagements", "scripts", "_archive", "3hue-new", "builder", "new-site", "_site", "__pycache__"]);
const SKIP_FILES = new Set(["package.json", "package-lock.json", "_config.yml", ".gitignore", ".prettierrc", "CNAME"]);
const skip = (src) => {
  const name = basename(src);
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
