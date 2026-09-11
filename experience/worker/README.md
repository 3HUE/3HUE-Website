# Inside 3HUE tour — backend (Cloudflare Worker)

Gives the tour real answers (Claude, grounded on `content/kb.md`) and real email (Resend). Free tier is plenty.

## Deploy (once, ~10 minutes)
1. `cd experience/worker && npm install`
2. `npx wrangler login`
3. Put the two secrets: `npx wrangler secret put ANTHROPIC_API_KEY` and `npx wrangler secret put RESEND_API_KEY`
   - Anthropic key: console.anthropic.com → API keys.
   - Resend key: resend.com → API keys; also verify the sending domain (3hue.net) under Domains so `FROM_EMAIL` in `wrangler.toml` can send.
4. Check `wrangler.toml` vars (`FROM_EMAIL`, `NOTIFY_EMAIL`, `ALLOWED_ORIGINS`).
5. `npx wrangler deploy` → prints a URL like `https://inside-3hue-tour.<account>.workers.dev`
6. Put that URL in `experience/content/config.json` as `apiBase` and commit.

Without `apiBase` the tour still works in demo mode: answers come from `content/faq.json` and "email me" opens a mail draft to Client Success.

## Endpoints
- `POST /ask` `{question, history, context}` → `{answer}`
- `POST /email` `{name, email, company, consent, subject, text, kind, tour}` → sends to the visitor and a lead copy to `NOTIFY_EMAIL`
- `POST /lead` `{name, email, company, note}`

## Updating the knowledge base
Edit `experience/content/kb.md` and redeploy the worker (`npx wrangler deploy`); it's bundled at deploy time.
