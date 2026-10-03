# 3HUE Prism — design language for internal interfaces

Prism is how 3HUE's own tools should look, move and speak: the Enterprise Hub, Deal Builder,
Engagement Playbooks, the Assessments Platform, ECARM and whatever comes next. One system so a new
hire or contractor feels the same quality everywhere, and so each product team spends its time on
the product, not on re-deciding buttons.

`public/prism.css` is the implementation of the tokens and primitives below; copy it into any
3HUE app (or load it from the hub repo) and build product layout on top. `public/portal.css` shows
the hub's layer on top of it.

## Principles

1. **Calm confidence.** Generous whitespace, one accent at a time, no decoration that does not
   carry information. Premium reads as restraint.
2. **Desktop is the flagship, phone is a first-class citizen.** The full experience (sidebar,
   command palette, hover detail, slide-over panels) is designed for a large screen; phones get a
   dedicated layer (bottom bar, sheets, full-width touch targets) rather than a squeezed desktop.
3. **Keyboard-first, mouse-friendly.** Every primary action has a key: `⌘K` opens the palette,
   `/` searches, `Esc` closes, arrow keys walk lists.
4. **Agents are colleagues.** AI shows up with a name, a face, a role and a human manager, and it
   never claims what it cannot do today.
5. **Honest state.** Preview data, unverified links, planned capabilities and loading states are
   labelled as such. Nothing pretends.

## Three hues

| Hue      | Role                                    | Token             | Light     | Use                                 |
| -------- | --------------------------------------- | ----------------- | --------- | ----------------------------------- |
| **Cyan** | Brand, primary actions, links, focus    | `--brand`         | `#44a8d9` | Buttons, active nav, selection, Ava |
| **Teal** | Operations, "on duty", success-adjacent | `--accent-ops`    | `#1fbf8f` | Agent status, Huey, live indicators |
| **Gold** | Signal, attention, pinned               | `--accent-signal` | `#f0b429` | Stars, highlights, Rio              |

Status colors (`--ok`, `--info`, `--warn`, `--danger`) are reserved for meaning; never use them as
decoration. Classification chips map Public → ok, Internal → info, Confidential → warn,
Restricted → danger, everywhere in every product.

## Two modes

**Daylight** (default) and **Midnight** (`<html data-theme="dark">`). Both are first-class: every
token has a Midnight value; surfaces step up in lightness in Midnight rather than just inverting.
The preference is stored under the shared key `3hue-theme` so the choice follows a person across
3HUE sites. Respect `prefers-reduced-motion`.

## Type

- Display: **Sora** 600 (headings, tile names, numbers). Tight tracking (`-0.015em`), line-height 1.15.
- Text: **IBM Plex Sans** 400/500/600. 14px base, 1.55 line-height.
- Data: **IBM Plex Mono** 500 for keys, IDs, versions, kbd hints.
- Scale: 11 / 12.5 / 14 / 15 / 17 / 20 / 24 / 28–36 / 32–44 (clamped for display sizes).
- Eyebrows: 11px, 700, uppercase, `0.14em` tracking.

## Shape, depth, motion

- Radii: 6 / 10 / 14 / 18 / 24 and pill. Cards 18, tiles 18, panels 24, buttons pill.
- Elevation: `--shadow-1` resting, `--shadow-2` hover/raised, `--shadow-3` floating (menus,
  panels, palette). Glass (`.glass`) for sticky chrome only.
- Backdrop: the **aurora** — three very-low-alpha radial gradients (one per hue) behind the canvas.
- Motion: 120 / 200 / 320 / 520 ms with `--ease-out` for entrances, `--ease-spring` for toggles.
  Lists stagger in (`--i` index × 28 ms). Hover lifts 2–3 px. Nothing bounces for attention.

## Components (primitives in prism.css)

`.btn` (+ `-primary`, `-soft`, `-ghost`, `-sm`, `-lg`), `.icon-btn`, `.chip` (+ tones, `-caps`),
`.dot` (+ `-ok`, `-warn`, `-live`), `.field`, `.card` (+ `-raised`), `.glass`, `.skeleton`,
`.eyebrow`, `kbd`, `.sr-only`.

Hub-level patterns worth reusing in other products (portal.css):

- **Sidebar + rail** — 268 px, collapsible to a 76 px icon rail, glass, grouped nav with counts.
- **Command palette** — `⌘K`, grouped results (Apps, Documents, Teammates, Sections, Actions),
  prefix > word-start > substring > tag scoring, keyboard navigation.
- **Tile** — 52 px gradient icon, name, two-line description, chips, hover-revealed actions and a
  contextual menu (Request access, Copy link, Ask the agent, Report a problem).
- **Slide-over panel** — 460 px on desktop, full-screen on phones; profiles and chat.
- **Bottom bar** — five actions on phones: Home, Browse (sheet), Search, Team, Ask.
- **Field quick actions** — one-tap row for people away from a desk.

## Mobile layer

Below 1025 px the sidebar becomes a drawer and the bottom bar appears; below 721 px tiles go
full-width, descriptions clamp to one line, tile actions are always visible, the command trigger
collapses to an icon, panels are full-screen, tables become cards, and `env(safe-area-inset-bottom)`
pads the bottom bar and composer. The manifest makes the hub installable (standalone, themed).

## The digital workforce — identity system

Every AI agent 3HUE operates is designed as a colleague. `public/agents.js` is the single source.

| Field                           | Meaning                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `name`, `pronouns`              | A real first name, no acronyms, no "bot". Pronouns like any colleague.                |
| `role`, `team`, `reportsTo`     | A job title, a 3HUE team, and the human owner accountable for it.                     |
| `since`, `status`               | Start date and honest status: **On duty**, **In onboarding**, **Planned**.            |
| `tagline`, `bio`, `personality` | One line in their voice, a short bio, four traits that shape their copy.              |
| `capabilities`                  | Each marked `live: true`, `live: "ai"` (needs the AI key) or `live: false` (planned). |
| `systems`, `reach`              | The catalog tiles they work in, and how to reach them.                                |
| `voice`                         | Greeting variants, thinking/found/not-found lines, a hand-off line, sign-offs.        |
| `avatar`, `tint`                | Portrait features (eyes, brows, mouth, hair, accessory, blush) and a Prism tint.      |

**Portraits** are generated vectors (`avatarSvg`) in one visual family: rounded-square frame in
the agent's tint, ivory face plate, expressive geometric eyes and brows, one accessory that says
something about the job (Huey's headset, Sage's glasses, Vesper's hood, Quinn's visor, Rio's
earpiece, Ava's halo from the tour). They blink idly, bob while thinking, and the mouth animates
while speaking, so an agent feels present without ever pretending to be human.

**Voice & tone.** Warm, direct, brief. Dry humor in small doses, never at the user's expense. No
exclamation marks in a row, no emoji, no "As an AI". Agents say "I don't have that" and hand off to
a named human team. They never speculate about owners, URLs or policies.

**Honesty rules.** A capability is shown as live only when the code path exists. Planned agents
appear on the roster so the team can get to know them, but their cards and profiles say "In
onboarding" and list what they _will_ do. When AI answers are off (no key), Huey's status reads
"catalog answers" and the local engine responds.

**Current roster.** Huey (concierge, on duty), Ava (client experience guide, on duty), Sage
(knowledge librarian), Vesper (security operations), Quinn (engagement coordinator), Rio
(revenue operations) — the last four in onboarding.

## Adding Prism to another 3HUE product

1. Copy `prism.css` (or import it) and load Sora / IBM Plex Sans / IBM Plex Mono.
2. Use the tokens, never raw hex. Start from the primitives; add product components in your own
   stylesheet with a product prefix.
3. Give the product a Midnight pass before shipping.
4. If the product has an agent, add it to `agents.js` first — identity before implementation — and
   reuse `avatarSvg` so portraits match across products.
5. Check at 1440, 1024 and 390 px, with keyboard only, and with reduced motion.
