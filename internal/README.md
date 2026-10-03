# 3HUE Enterprise Hub (internal portal)

An Okta-style launcher for every 3HUE system, solution and secure data repository, plus the
Document & Artifact Inventory fed from SharePoint. Plain HTML/CSS/JS, no build step, published with
the rest of the site at **https://3hue.net/internal/**.

> **Internal use only.** The page is `noindex`, blocked in `robots.txt`, absent from `sitemap.xml`
> and not linked from the public navigation — but that is hygiene, not security. Read
> [Access control](#access-control) before sharing the URL widely.

## What is in it

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

Cross-cutting features: global search (`/`), a **View as** role filter, favorites, recent
launches, per-tile **Request access / Copy link / Report a problem**, SSO chips, "Verify URL"
flags, dark mode (shares the site's toggle), CSV export of the inventory, keyboard-navigable tabs.

## Files

```
internal/
  index.html                 shell (header, hero, tabs, panel, footer) — static, validated
  portal.css                 portal styles on top of ../assets/css/styles.css tokens
  portal.js                  rendering, search, favorites, documents table, SharePoint adapter
  catalog.js                 THE CONTENT: tabs, groups, audiences, tiles, announcements
  config.js                  runtime config: SharePoint site/list, Entra app ids, field map
  data/inventory.sample.json preview records shown until the SharePoint list is connected
  lib/msal-browser.min.js    Microsoft Authentication Library 2.39.0 (MIT) — vendored so the CSP
                             can stay script-src 'self'
  README.md                  this file (excluded from the published site via _config.yml)
```

No analytics run on this page on purpose: internal usage should not pollute GTM / HubSpot /
Apollo marketing data, and the CSP only allows Microsoft hosts for the inventory feed.

## Editing the catalog

Everything visible is data in `catalog.js`. Save, commit, push — GitHub Pages redeploys.

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
  icon: "../assets/img/x.avif",    // … or an image path instead
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

Run `npm run lint:html` and `npx prettier --check internal/` before pushing.

## Document & Artifact Inventory

The Documents tab reads a SharePoint **list** on the Internal Assets team site
(`https://3hue.sharepoint.com/sites/InternalAssets`). Until `config.sharepoint.clientId` is set the
portal stays in **preview mode** and shows `data/inventory.sample.json` (seeded from documents that
already live in this repository).

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

Alternative: instead of a separate list, add the same columns to the **Shared Documents**
library itself and set `listName: "Documents"` — a library is a list, and each row then links to
the file automatically.

### Connecting SharePoint (one-time, ~10 minutes, Entra admin)

1. **Entra admin center → App registrations → New registration**
   - Name: `3HUE Enterprise Hub`
   - Supported account types: _Accounts in this organizational directory only_
   - Redirect URI: platform **Single-page application**, value `https://3hue.net/internal/`
     (add `http://localhost:8000/internal/` for local testing).
2. **API permissions → Add → Microsoft Graph → Delegated → `Sites.Read.All`** → _Grant admin
   consent_. (Tighter option: `Sites.Selected` plus a one-time grant on the Internal Assets site.)
3. Copy the **Application (client) ID** and **Directory (tenant) ID** into `config.js`:
   ```js
   tenantId: "<directory id>",
   clientId: "<application id>",
   ```
4. Optionally paste the list GUID into `listId` (List settings → the `List=` value in the URL);
   otherwise the list is resolved by `listName`.
5. Commit and push. The header shows **Sign in with Microsoft**; after sign-in the Documents tab
   shows `Live · n records`. Tokens live in sessionStorage; results are cached for
   `cacheMinutes` (10) with a Refresh button.

How it works: `portal.js` loads the vendored MSAL, signs the user in with their own 3HUE account,
calls `GET /sites/3hue.sharepoint.com:/sites/InternalAssets` then
`GET /sites/{id}/lists/{list}/items?$expand=fields(...)`, pages through `@odata.nextLink` and
maps columns through `fieldMap`. Every user only sees the rows **their** SharePoint permissions
allow — the portal adds no permissions of its own and holds no secrets.

## Access control

GitHub Pages serves everything in this repository publicly, so the catalog (app names, URLs,
owners) is readable by anyone who guesses the URL. The inventory data is safe (it requires a 3HUE
Microsoft sign-in), but the shell is not hidden. Recommended steps, in order:

1. **Cloudflare Access (Zero Trust) in front of the portal.** 3hue.net already uses Cloudflare.
   Create an Access application for `3hue.net/internal/*` (or a dedicated `hub.3hue.net`), add
   **Microsoft Entra ID** as the identity provider, and allow the `@3hue.net` domain (or a group).
   Users then authenticate once with their 3HUE account before the page even loads. Free up to 50
   users.
2. Keep `noindex`, `robots.txt` and the missing sitemap entry (already done).
3. Do **not** put secrets, client lists, pricing or credentials into `catalog.js` — link to the
   system that holds them instead.

Alternatives if Cloudflare Access is not wanted: Azure Static Web Apps with built-in Entra auth, or
a Cloudflare Worker that validates an Entra token before serving `/internal/`.

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

- **Announcements from SharePoint** — a second list (`Title`, `Body`, `Date`, `Link`) read by the
  same adapter so leadership can post without a commit.
- **Policy acknowledgements** — a Microsoft Form or list that records "I have read the InfoSec
  Policy / CIRP" per employee; surface the user's outstanding items on Overview.
- **Service health strip** — poll the public status feeds (Microsoft 365, Cloudflare, GitHub,
  HubSpot) and show a green/amber dot on the Infrastructure tab.
- **Owner directory** — a small "Who owns what" table (system → owner → backup → vendor contract
  renewal date) for leadership and audits.
- **Access review export** — the CSV export already exists for documents; add one for tiles
  (system, owner, auth type, audience) as the SOC 2 "system inventory" evidence.
- **Password manager tile** (1Password / Bitwarden) and **MFA enrollment** guide under Security.
- **Per-user tiles via Entra groups** — once Cloudflare Access or MSAL sign-in is on, the user's
  groups can select the default "View as" role automatically.
- **Edge-hosted catalog** — move `catalog.js` into Cloudflare KV with a tiny admin form if
  non-engineers should edit tiles without Git.

## Local development

```bash
python3 -m http.server 8000           # from the repo root
# open http://localhost:8000/internal/
npm run lint:html
npx prettier --check internal/
```

To update MSAL: `npm pack @azure/msal-browser@<version>`, copy `lib/msal-browser.min.js` and the
`LICENSE` over the files in `internal/lib/`, and smoke-test sign-in.
