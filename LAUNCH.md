# Launching the redesigned 3hue.net on Cloudflare Pages

The redesign lives at the repository root (this commit). It replaces the old home, pricing, services, about, contact, trust,
customers and insights pages, and keeps everything it does not replace: `experience/` (Inside the ISG Building), `privacy.html`,
`terms.html`, `partner-portal/`, `frameworks/`, `isg/platform-operating-model.html`, `web3-dmf/`, the four long-form insights
(`ciso-gap-assessment`, `cloud-risk-assessment-template`, `mra-remediation-support`, `soc-2-evidence-help`) and all of `assets/`.

## 1. Push

```
git add -A
git commit -m "Launch the 2026 redesign: new site at the repo root, Cloudflare Pages build, functions, redirects"
git push origin main
```

GitHub Pages will publish the new pages within a few minutes (the forms and the redirect map only work on Cloudflare Pages,
so finish the next steps the same day).

## 2. Create the Cloudflare Pages project (dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git)

| Setting | Value |
| --- | --- |
| Repository | `3HUE/3HUE-Website` |
| Production branch | `main` |
| Framework preset | None |
| Build command | `node scripts/pages-build.mjs` |
| Build output directory | `_site` |
| Root directory | `/` (leave empty) |

`scripts/pages-build.mjs` copies the publishable site into `_site/` and leaves `internal/` (the Enterprise Hub Worker source),
`scripts/`, `_archive/`, `3hue-new/`, `node_modules/`, the Python/PowerShell maintenance files and the original brand films out of
the public deployment. Functions are picked up automatically from `functions/`.

Environment variables (Settings → Variables and secrets, **Production**; encrypt the key):

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | the Resend API key for the verified 3hue.net sending domain |
| `NOTIFY_TO` | the inbox that receives inquiries and tool results, e.g. `aramirez@3hue.net` |
| `FROM_ADDRESS` | e.g. `3HUE <hello@3hue.net>` (must be on the verified domain) |

Deploy. Check the `*.pages.dev` preview: home, `/pricing.html`, `/product/client-vision.html`, `/contact.html` (send a test
inquiry; it should arrive at `NOTIFY_TO`), `/services/cmmc.html` ("Email me my results"), `/isg/pricing.html` (should redirect
to `/pricing/rate-card.html`), `/industries/saas.html` (should redirect to Customers), `/experience/`.

## 3. Point 3hue.net at Pages (the go-live moment)

Pages project → Custom domains → Set up a custom domain → `3hue.net`, then `www.3hue.net`. Because the zone is on
Cloudflare, it offers to update DNS: accept. It replaces the GitHub Pages `A`/`CNAME` records with a `CNAME` to the
`*.pages.dev` host (and redirects `www` to the apex). Propagation is usually under a minute on Cloudflare DNS.

Then, so the old host stops serving: GitHub repo → Settings → Pages → Source: **None**, and remove the custom domain there.
`CNAME` in the repo can stay; the Pages build script does not publish it.

## 4. After it's live

- Google Search Console: submit `https://3hue.net/sitemap.xml` (regenerated at launch; 47 URLs).
- The three plan buttons on Pricing open the contact form pre-selected (`/contact.html?plan=…`). When the Stripe Payment
  Links exist, rebuild with `--checkout_free`, `--checkout_assurance`, `--checkout_multi` (or edit the three hrefs) and push.
- The Calendly link is one token (`CALENDLY`) in the build; the founder headshot replaces the monogram on `about.html`.
- `assets/vids/*.mp4` (the original brand films) are git-ignored from this commit; the web encodes in `assets/vids/web/` are what
  the site plays.
