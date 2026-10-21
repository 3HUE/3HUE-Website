# Pages Functions

`functions/api/contact.js` receives the contact form; `functions/api/results.js` receives "Email me my results" from the free tools.
Both validate input, drop honeypot hits, rate-limit per IP, and send one notification email through Resend.

Set these in the Cloudflare Pages project (Settings → Environment variables, Production and Preview):

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | API key from resend.com; verify the 3hue.net sending domain there first |
| `NOTIFY_TO` | inbox that receives notifications, e.g. aramirez@3hue.net |
| `FROM_ADDRESS` | e.g. `3HUE <no-reply@3hue.net>` |

Until the key is set, the functions still return 202 and log the submission in the Pages Functions log, so the site keeps working.
At launch this `functions/` folder sits at the repository root (next to `index.html`).
