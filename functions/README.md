# Pages Functions

| Route | What it does |
| --- | --- |
| `POST /api/contact` | the contact form; one notification email through Resend |
| `POST /api/results` | "Email me my results" from the free tools |
| `POST /api/quote/start` | pricing builder, step one: a six-digit code to a work email (free and disposable mailboxes refused, domain must receive mail) |
| `POST /api/quote/verify` | step two: checks the code, prices the answers, stores the page in KV for 90 days, emails the visitor and `NOTIFY_TO`, sets the verified cookie |
| `GET /api/quote/answers?id=` | the answers behind a page (no personal data) so "Change my answers" can prefill the builder |
| `GET /pricing/for/<id>` | a visitor's personal pricing page, rendered from KV; expired pages answer 404 |
| `GET /pricing/quotes?key=` | the private list of live pricing pages; `key` must equal `QUOTES_ADMIN_KEY` |
| `GET /pricing/rate-card` | the full rate card, only with the verified cookie; everyone else is sent to the builder |

All of them validate input, drop honeypot hits and rate-limit per IP. The generated modules `_engine.js`, `_quote_page.js` and `_shell.js`
are written by the build from `data/catalog.json` (every price on the site) and the page templates; edit the catalog, not the modules.

## Settings in the Cloudflare Pages project

**Variables and Secrets** (Settings → Variables and Secrets, Production):

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Secret. API key from resend.com; the 3hue.net sending domain must be verified there |
| `NOTIFY_TO` | inbox that receives inquiries, tool results and new pricing pages, e.g. aramirez@3hue.net |
| `FROM_ADDRESS` | e.g. `3HUE <no-reply@3hue.net>` |
| `QUOTE_SECRET` | Secret. Any long random string (30+ characters); signs the verified-email cookie |
| `QUOTES_ADMIN_KEY` | Secret. Any long random string; the key for `/pricing/quotes?key=…` |
| `ANTHROPIC_API_KEY` | Secret. For Huey (Update 2b); not needed until Huey ships |

**KV binding** (Settings → Bindings → Add → KV namespace): variable name `QUOTES`, bound to a namespace named `3hue-quotes`
(create it under Storage & Databases → KV). Pricing pages are written with a 90-day expiry and verification codes with a
10-minute expiry, so the namespace cleans itself.

Without `QUOTES` or the Resend variables the builder's last step answers 503 and the page shows the fallback (book a call); the
rest of the site is unaffected. Until the key and the binding are set, the functions still return 202 for the forms and log the
submission in the Pages Functions log.
