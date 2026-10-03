# 3HUE Enterprise Hub (internal portal)

An Okta-style launcher for every 3HUE system, solution and secure data repository, plus the
Document & Artifact Inventory fed from SharePoint. Plain HTML/CSS/JS served by a **Cloudflare
Worker** at **https://hub.3hue.net**, reachable only by `@3hue.net` accounts through
**Cloudflare Access**.

> The portal is **not** published through GitHub Pages: `internal/` is excluded in `_config.yml`.
> The source does live in this public repository, so never put secrets, client names, pricing or
> credentials into the catalog — link to the system that holds them.

## How access control works

```
browser ──▶ hub.3hue.net ──▶ Cloudflare Access ──▶ Worker (worker/index.js) ──▶ static portal (public/)
                               policy: email ends     re-verifies the Access JWT on EVERY request,
                               with @3hue.net          adds CSP / no-index / no-store headers
```

1. **Cloudflare Access** (Zero Trust) sits in front of `hub.3hue.net`. Anyone who is not signed
   in is redirected to the 3HUE login page; the policy only allows identities whose email ends in
   `@3hue.net`.
2. **The Worker re-verifies** the signed JWT Access attaches to each request
   (`Cf-Access-Jwt-Assertion`) against the team's published keys: issuer, audience (AUD tag),
   expiry and the email domain. `run_worker_first = true` means this happens for static assets
   too. If Access is misconfigured the Worker **fails closed** (503), and without a valid token it
   returns 403 — nothing is ever served anonymously. `npm test` covers these paths.
3. **No public URL exists**: `workers_dev = false` and `preview_urls = false`, so the only route to
   the Worker is the Access-protected custom domain.
4. Inside the page, the user's identity (`/cdn-cgi/access/get-identity`) drives the greeting, the
   account chip and sign-out, and is passed to Microsoft sign-in as a login hint so the SharePoint
   inventory can connect silently when Entra ID is the Access identity provider.

### Create the Access application (one time, ~10 minutes)

Zero Trust dashboard → **Access → Applications → Add an application → Self-hosted**:

| Setting                 | Value                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Application name        | `Enterprise Hub`                                                                            |
| Session duration        | `24 hours` (or your standard)                                                               |
| Application domain      | `hub.3hue.net` (path empty)                                                                 |
| Identity providers      | **Microsoft Entra ID** (recommended — MFA/Conditional Access apply) and/or **One-time PIN** |
| Policy name / action    | `3HUE staff` / **Allow**                                                                    |
| Policy rule — Include   | **Emails ending in** `@3hue.net`                                                            |
| Optional — Require      | Entra ID group, country, or device posture                                                  |
| App Launcher visibility | On (staff see the hub in the Access app launcher)                                           |

One-time PIN works immediately with no identity-provider setup (a code is emailed to the
`@3hue.net` address); add Entra ID under **Settings → Authentication → Login methods** when ready.

After saving, open the application's **Overview** tab, copy the **Application Audience (AUD) Tag**
into `wrangler.toml` → `ACCESS_AUD` (already set for the current application). `ACCESS_TEAM_DOMAIN`
is the `3hue` team: `3hue.cloudflareaccess.com`. Redeploy after any change.

## Deploying

```bash
cd internal
npm install
npm test                 # Access JWT verification + Worker behaviour tests
npx wrangler login       # once per machine
npx wrangler deploy      # creates the Worker and the hub.3hue.net custom domain + DNS record
```

Or let CI do it: `.github/workflows/deploy-hub.yml` runs the tests and deploys on every push to
`main` that touches `internal/`. It needs two repository secrets: `CLOUDFLARE_API_TOKEN` (Workers
Scripts: Edit, Workers Routes: Edit) and `CLOUDFLARE_ACCOUNT_ID`.

`wrangler.toml` declares the custom domain, so the DNS record for `hub.3hue.net` is created
automatically in the 3hue.net zone on first deploy.

### Local development

```bash
cd internal
echo 'ALLOW_UNAUTHENTICATED_LOCAL=true' > .dev.vars   # git-ignored; bypasses Access on localhost only
npm run dev                                           # http://localhost:8787
```

The bypass needs two things at once: that variable (only ever in the git-ignored `.dev.vars`) and a
loopback client address, which wrangler dev provides and Cloudflare's edge never does (it overwrites
`cf-connecting-ip` with the real client IP). It therefore cannot apply in production.

## What is in the portal

| Tab                       | Contents                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Overview**              | Pinned tiles (per browser), recently launched, featured systems, announcements, quick actions              |
| **Core Systems**          | Microsoft 365 (Office, Outlook, Teams, SharePoint, OneDrive), Teamwork suite, QuickBooks, Claude, Lucid…   |
| **Business Systems**      | Deal Builder, Engagement Playbooks, Assessments Platform, **ECARM** (formerly EMM), tour, DMF, website     |
| **Infrastructure**        | AWS, Azure, Google Cloud/BigQuery, Cloudflare, Entra, M365 admin, GitHub, status pages                     |
| **Customer Acquisition**  | HubSpot, Apollo.io, GA4, Tag Manager, Search Console, Google Business Profile, Semrush, social channels    |
| **Security & Compliance** | _Suggested._ Defender, Purview, Conditional Access, InfoSec policy, CIRP, incident reporting, Trust Center |
| **People & Support**      | _Suggested._ Help desk, directory, calendar, pay & expenses, onboarding, brand kit                         |
| **Documents & Artifacts** | Secure data repositories (with classification ceiling) + the SharePoint-fed inventory table                |

Cross-cutting: global search (`/`), a **View as** role filter, favorites, recent launches, per-tile
**Request access / Copy link / Report a problem**, SSO chips, "Verify URL" flags, dark mode (shares
the public site's toggle), CSV export of the inventory, keyboard-navigable tabs. No analytics run
on this page on purpose.

## Files

```
internal/
  wrangler.toml              Worker config: assets, custom domain, Access vars (no secrets)
  worker/index.js            edge entry: Access JWT check on every request, headers, /api/me
  worker/access.js           JWT verification (WebCrypto, dependency-free)
  worker/test/               node:test suites for the verifier and the Worker
  public/index.html          shell (header, hero, tabs, panel, footer)
  public/portal.css          portal styles on top of https://3hue.net/assets/css/styles.css tokens
  public/portal.js           rendering, search, favorites, documents table, SharePoint adapter
  public/catalog.js          THE CONTENT: tabs, groups, audiences, tiles, announcements
  public/config.js           runtime config: SharePoint site/list, Entra app ids, field map
  public/data/inventory.sample.json  preview records shown until the SharePoint list is connected
  public/lib/msal-browser.min.js     Microsoft Authentication Library 2.39.0 (MIT), vendored
  public/404.html            not-found page
  package.json               wrangler + test scripts
```

Brand CSS and logos are loaded from the public site (`https://3hue.net/assets/...`) so there is
one source of truth for design tokens; the CSP allows exactly that host.

## Editing the catalog

Everything visible is data in `public/catalog.js`. Save, commit, push to `main` — CI redeploys.

### Catalog schema

```js
{
  id: "deal-builder",              // unique, stable (favorites/recent are stored by id)
  name: "3HUE Deal Builder",
  subtitle: "optional second line",
  tab: "business",                 // one of catalog.tabs[].id
  group: "platforms",              // one of catalog.groups[].id (group.tab must equal tab)
  url: "https://builder.3hue.net",
  description: "One or two lines.",
  monogram: "DB",                  // 1–3 characters on the icon …
  icon: "https://…/logo.avif",     // … or an image URL instead (host must be allowed by the CSP)
  color: "#44a8d9",                // icon tint
  auth: "sso",                     // microsoft | google | sso | separate | public → SSO chip
  owner: "Sales Operations",       // shown as a chip and in the tile menu
  ownerEmail: "someone@3hue.net",  // optional; "Request access" mails here, else config.requestAccessEmail
  tags: ["proposals", "sow"],      // searched
  audience: ["sales", "delivery"], // which "View as" roles see it; omit or ["all"] for everyone
  featured: true,                  // surfaces on Overview
  verify: true,                    // shows "Verify URL" until the instance address is confirmed
  classification: "Confidential",  // repositories only: Public | Internal | Confidential | Restricted
}
```

- **Add a tab**: push to `catalog.tabs` (id, label, description, optional `suggested: true`).
- **Add a group**: push to `catalog.groups` with `tab`, `label`, optional `description` and
  `layout: "list"` for compact rows (used for status pages and social channels).
- **Add a role**: push to `catalog.audiences`; reference its id in tiles' `audience`.
- **Announcements**: `catalog.announcements` (`date`, `title`, `body`, optional `href`).

Before pushing: `npm run lint:html` (repo root) and `npx prettier --check internal/`.

## Document & Artifact Inventory

The Documents tab reads a SharePoint **list** on the Internal Assets team site
(`https://3hue.sharepoint.com/sites/InternalAssets`). Until `config.sharepoint.clientId` is set the
portal stays in **preview mode** and shows `public/data/inventory.sample.json`.

### List specification (for Teriah)

Create a list named **Document & Artifact Inventory** on the Internal Assets site.
Create each column with the **internal name** below first (no spaces), then rename the display
name freely — Graph reads internal names. If a different internal name is used, change
`config.sharepoint.fieldMap`.

| Internal name    | Type                   | Choices / notes                                                                                                                                                                                                                          |
| ---------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Title`          | Single line (built in) | Document or artifact name                                                                                                                                                                                                                |
| `Category`       | Choice                 | Policy · Procedure / SOP · Template · Playbook · Framework · Contract / Legal · Data Sheet · Sales Enablement · Case Study · Executive Brief · Service Overview · Proposal / Vision · Architecture / Diagram · Report · Training · Other |
| `System`         | Choice (allow fill-in) | Corporate / ISG · ISG · OPS · ITG · AI Advisory · Pro Services · Deal Builder · Engagement Playbooks · Assessments · ECARM · Partner Program · Marketing · Insights · Finance · HR                                                       |
| `Owner`          | Person or Single line  | Accountable owner (person column returns the display name)                                                                                                                                                                               |
| `Classification` | Choice                 | Public · Internal · Confidential · Restricted — drives the colored chip                                                                                                                                                                  |
| `Status`         | Choice                 | Draft · In Review · Approved · Archived                                                                                                                                                                                                  |
| `Version`        | Single line            | e.g. `2026.1`                                                                                                                                                                                                                            |
| `Link`           | Hyperlink              | Where the file lives (SharePoint, Teams, GitHub, platform URL). Leave empty for library items — `webUrl` is used instead                                                                                                                 |
| `Location`       | Choice                 | SharePoint · Teams · OneDrive · GitHub · Teamwork · Engagement Playbooks · HubSpot · Website · Other                                                                                                                                     |
| `LastReviewed`   | Date                   |                                                                                                                                                                                                                                          |
| `NextReview`     | Date                   | Rows past this date show **review overdue**                                                                                                                                                                                              |
| `Audience`       | Choice (multi)         | Everyone · Leadership · Sales & Marketing · Delivery & Consulting · Finance & Admin · IT & Engineering — matches "View as"                                                                                                               |
| `Tags`           | Single line or multi   | Comma/semicolon separated, searched                                                                                                                                                                                                      |
| `Description`    | Multiple lines (plain) | One or two sentences                                                                                                                                                                                                                     |

Alternative: add the same columns to the **Shared Documents** library itself and set
`listName: "Documents"` — a library is a list, and each row then links to the file automatically.

### Connecting SharePoint (one time, ~10 minutes, Entra admin)

1. **Entra admin center → App registrations → New registration**
   - Name: `3HUE Enterprise Hub`
   - Supported account types: _Accounts in this organizational directory only_
   - Redirect URI: platform **Single-page application**, value `https://hub.3hue.net/`
     (add `http://localhost:8787/` for local testing).
2. **API permissions → Add → Microsoft Graph → Delegated → `Sites.Read.All`** → _Grant admin
   consent_. (Tighter option: `Sites.Selected` plus a one-time grant on the Internal Assets site.)
3. Copy the **Application (client) ID** and **Directory (tenant) ID** into `public/config.js`:
   ```js
   tenantId: "<directory id>",
   clientId: "<application id>",
   ```
4. Optionally paste the list GUID into `listId` (List settings → the `List=` value in the URL);
   otherwise the list is resolved by `listName`.
5. Commit and push. When Entra ID is also the Access identity provider the Graph sign-in is
   silent (login hint from the Access identity); otherwise a **Connect SharePoint** button appears
   in the header. The Documents tab then shows `Live · n records`; results are cached for
   `cacheMinutes` (10) with a Refresh button.

Every user only sees the rows **their** SharePoint permissions allow — the portal adds no
permissions of its own and holds no secrets.

## Open items to confirm (tiles flagged `verify: true`)

| Tile                                        | What to confirm                                                     |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Teamwork Projects / Desk / Spaces / Chat    | Instance subdomain (assumed `3hue.teamwork.com`)                    |
| ECARM                                       | Application URL (assumed `go.3hue.net`, which hosts the beacon)     |
| AWS Console                                 | Use the IAM Identity Center start URL if one exists                 |
| Okta                                        | Whether 3HUE runs Okta and its org URL                              |
| Microsoft Intune                            | Whether Intune is licensed/used                                     |
| InfoSec Policy, CIRP, Onboarding, Brand Kit | Point at the actual files once filed in the Internal Assets library |
| Report a security incident                  | Dedicated security inbox instead of `info@3hue.net`                 |
| `config.requestAccessEmail`                 | IT/admin inbox for access requests                                  |

## Suggestions for the next iteration

- **Default role from Entra groups** — Access can forward group claims; map them to the "View as"
  role so sales staff land on their view automatically.
- **Announcements from SharePoint** — a second list (`Title`, `Body`, `Date`, `Link`) read by the
  same adapter so leadership can post without a commit.
- **Policy acknowledgements** — a Microsoft Form or list recording "I have read the InfoSec
  Policy / CIRP" per employee; surface the user's outstanding items on Overview.
- **Service health strip** — poll the public status feeds and show a green/amber dot on the
  Infrastructure tab.
- **Owner directory** — system → owner → backup → vendor contract renewal date, for leadership
  and audits.
- **Access review export** — a CSV of tiles (system, owner, auth type, audience) as SOC 2 system
  inventory evidence, alongside the existing document export.
- **Password manager tile** (1Password / Bitwarden) and **MFA enrollment** guide under Security.
- **Private repository** — move `internal/` to a private repo once it carries anything beyond
  app names and URLs.

## Maintenance

To update MSAL: `npm pack @azure/msal-browser@<version>`, copy `lib/msal-browser.min.js` and the
`LICENSE` over the files in `public/lib/`, and smoke-test the Graph sign-in. To update wrangler:
`npm install -D wrangler@latest` in `internal/`.
