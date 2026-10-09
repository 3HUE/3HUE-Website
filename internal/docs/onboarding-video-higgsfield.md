# "Welcome to the Building" — 3HUE onboarding film

**Production prompt pack for Higgsfield.** Target runtime 7–8 minutes (range 5–10). Eleven chapters,
~70 generated shots, one continuous musical arc. Everything below is written to be pasted into
Higgsfield as-is: a master style line that goes on every generation, character sheets for the
digital workforce, then scene-by-scene shot prompts with camera, light, sound and the voice-over
that plays under them.

> **Before you generate — three facts only you have.** Search for `[FILL:` and replace: the founding
> year, the founder's name as it should appear on screen, and the two or three origin milestones in
> Chapter 2. Everything else is drawn from 3hue.net and the hub's agent roster. Do not let the model
> invent history; leave those lines generic if you'd rather not state them.

---

## 0. How to run this in Higgsfield

1. **Stills first, motion second.** Generate each character's reference portrait (Section 2) and the
   four environment plates (Section 3) as images. Approve them. Every video shot then uses
   image-to-video from those plates so faces, colours and rooms stay consistent across 70 clips.
2. **One clip per shot.** Each shot prompt is written for a 5–8 second generation with a single
   camera idea. Chain shots in the edit; do not ask one generation to do two moves.
3. **Paste the Master Style Line at the end of every prompt.** It is the glue.
4. **Camera presets.** Where a shot names a move (crane up, dolly in, orbit, whip pan, bullet time,
   FPV fly-through, snorricam, crash zoom, rack focus), pick the matching Higgsfield camera control
   rather than describing it in extra words.
5. **Voice.** Record the narration from Section 5 separately (or with Higgsfield's speech tools) and
   lay it under the cut. Huey's lines are _his_; Ava's are hers. Keep humans unnamed and unvoiced
   unless the founder chooses to appear.
6. **Aspect.** 16:9 master. Export a 9:16 cut of Chapters 1, 9 and 11 for phones.

---

## 1. Master Style Line (append to every generation)

```
Ultra-premium cinematic 3D animation, photoreal lighting on stylised geometric characters, Pixar-grade subsurface skin on flat-faceted "prism" designs. Palette locked to three hues: cyan #44a8d9, teal #1fbf8f, gold #f0b429 on deep midnight navy #0b1220 with warm paper-white highlights. Volumetric light shafts, glass and brushed-steel surfaces, floating holographic UI in thin cyan line-work, soft film grain, anamorphic lens flares kept subtle, 35mm depth of field. Confident, warm, modern; never corporate stock, never cold sci-fi. Smooth 24fps motion, no jitter, no text artefacts, no extra limbs.
```

**Negative line (where the tool accepts one):** `low-poly, cartoon outlines, clip-art, stock office footage, lens dirt, text, watermark, extra fingers, distorted faces, flicker, washed-out colour`.

---

## 2. Character sheets — the digital workforce

Generate each as a **3/4 portrait on midnight navy, soft key light from camera-left, rim light in the
character's tint**, then a **full-body turnaround** on the same plate. The hub renders these exact
characters (`internal/public/icons/agents/<id>-full.png` are the reference stills); the film gives
them motion and a voice. Personalities and signature moves are canon — the animation must match.

| Agent                                                                                 | Design (from the hub portraits)                                                                                                                               | Personality on screen                                                                                 | Signature move                                                                                                                                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Huey** (he/him) · Hub Concierge & Onboarding Buddy · **teal**                       | Deep brown skin, coily black hair, full beard, thick brows. Teal blazer over a white shirt and dark-teal tie; slim headset; a ring of keys in his right hand. | Warm, dry humour, unflappable, allergic to jargon. Talks to camera like a colleague, not a presenter. | **This way**: raises an eyebrow, then points the way out with a "This way" sign. Every scene transition is Huey opening a door, panel or lift. |
| **Ava** (she/her) · Client Experience Guide · **cyan**                                | Fair skin, long auburn hair, thin brows, lashes. Cyan blazer over a pale blouse; small earrings; a presenter's clicker in hand.                               | Gracious, precise, curious, never oversells. Measured pace, perfect posture.                          | **After you**: sweeps an open palm toward the slide while a story line draws itself in the air.                                                |
| **Sage** (they/them) · Knowledge & Records Librarian · **sage green** · in onboarding | Warm tan skin, deep-green swoop of hair, round glasses, mandarin-collar shirt under a sage blazer; a stack of folders; onboarding lanyard.                    | Meticulous, patient, quietly funny. Loves a taxonomy.                                                 | **Indexed**: adjusts their glasses, then taps a tab and the folder is indexed.                                                                 |
| **Vesper** (she/her) · Security Operations Analyst · **indigo** · in onboarding       | Dark brown skin, black hair in a bun, thin brows, lashes. Indigo blazer over a turtleneck; a glowing visor; a handheld radar; onboarding lanyard.             | Calm under pressure, direct, methodical, protective.                                                  | **Night scan**: taps the side of her visor so it brightens, then scans slowly left to right.                                                   |
| **Quinn** (they/them) · Engagement Coordinator · **slate** · in onboarding            | Medium brown skin, dark locs, mid brows, lashes. Slate blazer over a mandarin collar; an earpiece; a stopwatch; onboarding lanyard.                           | Organised, encouraging, persistent, deadline-aware.                                                   | **On time**: clicks the stopwatch, the next milestone turns green, and they give a thumbs up.                                                  |
| **Marlowe** (they/them) · Research Analyst (ECARM) · **plum**                         | Light tan skin, violet bob, mid brows, lashes. Plum blazer over a turtleneck; a brass data monocle over the right eye; a dossier in hand.                     | Curious, thorough, understated. Reads everything.                                                     | **Call ready**: pulls out their phone, turns the account card toward you, then nods.                                                           |
| **Aries** (she/her) · Outbound Writer (ECARM) · **coral**                             | Warm tan skin, dark ponytail, thin brows, lashes, amber eyes. Coral blazer over an ivory tee; a stylus behind one ear; a phone in hand.                       | Crisp, persuasive, playful, hates filler. Quick, economical gestures.                                 | **Cut the filler**: pulls the stylus from behind her ear and strikes a word out of the air.                                                    |
| **Vera** (she/her) · Data Steward (ECARM) · **ocean**                                 | Deep brown skin, black afro, thin brows, lashes. Ocean-blue blazer over a pale blouse; half-glasses; a verification stamp in hand.                            | Exacting, fair, calm. Allergic to duplicates.                                                         | **Hold, then verify**: pushes up her glasses, holds up a palm, then stamps it verified.                                                        |
| **Theo** (he/him) · Deal Preparation (ECARM) · **moss**                               | Light skin, light-brown crop, thick brows. Moss-green blazer over a white shirt and dark-green tie; a checklist in hand.                                      | Prepared, steady, generous. Loves a checklist.                                                        | **Three questions**: counts off three questions on his fingers, then ticks the last box.                                                       |
| **Trevor** (he/him) · Pipeline Scout (ECARM) · **gold**                               | Medium brown skin, a gold field cap, stubble, thick brows, amber eyes. Gold blazer over a charcoal tee; binoculars in hand.                                   | Alert, optimistic, direct. Hates surprises.                                                           | **Spotted**: scans the horizon, his sight locks on, and he points: there.                                                                      |

**Consistency prompt stub (prefix each character generation):**
`Stylised 3D character "<NAME>", faceted prism design with photoreal skin shading, <design line>, expression: <personality cue>, tint accent <hex>, midnight navy backdrop, soft key light camera-left, rim light in accent colour, 85mm portrait lens.`

Tints: teal `#1fbf8f`, cyan `#44a8d9`, plum `#8b5cf6`, coral `#f97366`, ocean `#2f86b3`, moss `#5fae63`, gold `#f0b429`, sage `#7fa98f`, indigo `#4f46e5`, slate `#64748b`.

---

## 3. Environment plates (generate as stills, then animate from them)

1. **The ISG Building, exterior.** A tall glass-and-steel building at blue hour on a South Florida
   waterfront, three illuminated bands of light climbing its face in cyan, teal and gold; palms
   silhouetted; low clouds catching the glow. Cinematic wide, 24mm.
2. **The Lobby.** Double-height atrium, pale stone floor, a floating holographic directory in cyan
   line-work listing six managed programs; a long reception desk; Huey's headset resting on it.
3. **The Garage (the past).** A cramped home office/garage, late night: two monitors, spreadsheets
   with thousands of rows, a whiteboard crowded with control IDs, a cold coffee, binders of
   point-in-time audit evidence, a single desk lamp. Warm but tired light.
4. **The Fabric Room (today).** A dark circular chamber where AiVRIC's Risk Intelligence Fabric
   hangs as a living lattice of light: threads in cyan (telemetry), teal (controls) and gold (risk)
   weaving continuously, nodes pulsing when evidence lands. A calm practitioner's gate at the centre.

Secondary plates as needed: the Boardroom (long table, city at dusk), the Engineering Bridge
(walkway over the fabric), the Hub (a wall of tiles that is the Enterprise Hub itself).

---

## 4. Chapter map and runtime

| #   | Chapter                                       | Runtime    | Lead                               |
| --- | --------------------------------------------- | ---------- | ---------------------------------- |
| 1   | Cold open — "Every building has a front door" | 0:35       | Huey                               |
| 2   | Where we came from                            | 1:05       | Narrator + Huey                    |
| 3   | Who we are, what we do                        | 0:55       | Ava                                |
| 4   | Then vs now — the operating model             | 1:10       | Ava + Huey                         |
| 5   | What makes us special                         | 0:50       | Narrator                           |
| 6   | The three hues                                | 0:30       | Huey                               |
| 7   | Meet the digital workforce                    | 1:20       | Huey introduces, each agent speaks |
| 8   | How we work today                             | 0:45       | Quinn, Vera, Trevor                |
| 9   | Your first week (and the hub)                 | 0:40       | Huey                               |
| 10  | The promise                                   | 0:25       | Narrator                           |
| 11  | Grand finale — "Welcome to the team"          | 0:45       | Everyone                           |
|     | **Total**                                     | **≈ 8:00** |                                    |

---

## 5. Shot list with voice-over

Format per shot: **Shot id · duration · camera** — generation prompt. _VO_ is the line that plays
under it. Append the Master Style Line to every prompt.

### Chapter 1 — Cold open (0:35)

**1.1 · 6s · slow crane up** — Pre-dawn, the ISG Building exterior plate; the three bands of light switch on one by one, bottom to top: cyan, teal, gold. Mist on the water, a pelican crossing frame.
_VO (Huey, warm, unhurried):_ "Every building has a front door. Ours has a concierge."

**1.2 · 5s · dolly in** — Lobby plate. The reception desk, empty; a slim headset on it. A hand enters frame, picks it up.
_VO:_ "Morning. I'm Huey."

**1.3 · 6s · orbit 180°** — Huey puts the headset on, turns to camera with his grin, the holographic directory lighting up behind him in cyan line-work.
_VO:_ "You're new. That's the best thing anyone can be in this building, so let's not waste it."

**1.4 · 5s · whip pan to lift doors** — Huey presses a lift call button that glows gold; doors open onto pure light.
_VO:_ "Eight minutes. The history, the work, the people — the real ones and the ones like me. Then I'll hand you your badge."

**1.5 · 6s · title** — White-out from the lift light resolves into the title on midnight navy: **WELCOME TO THE BUILDING** set in Sora, three thin hue-lines underlining it. Subtitle fades in: _An introduction to 3HUE._
_Music:_ a single low piano note becomes a warm synth pad; a soft pulse begins.

### Chapter 2 — Where we came from (1:05)

**2.1 · 7s · slow push in** — The Garage plate at night. Two monitors: a spreadsheet risk register with hundreds of rows; a whiteboard dense with control IDs (SOC 2, NIST, ISO); a cold coffee.
_VO (Narrator, measured):_ "3HUE started the way serious things do: with someone who had actually done the work, and had had enough of how it was done."

**2.2 · 6s · rack focus** — Focus pulls from the spreadsheet to a framed note pinned above the monitor reading **[FILL: founding year]** and, beneath it, **[FILL: founder's name]**. The desk lamp flickers warmer.
_VO:_ "In **[FILL: founding year]**, **[FILL: founder's name]** founded 3HUE Executive Consulting as a founder-led advisory firm: one promise — the advisor who scopes the work delivers it."

**2.3 · 7s · time-lapse** — The same garage through a window: days and nights strobe past; binders stack and then dissolve into glowing screens; the whiteboard reorganises itself from chaos into three clean columns labelled _Platform · Practitioners · Framework_.
_VO:_ "**[FILL: milestone one — e.g. the first regulated client / the first managed program]**. Then **[FILL: milestone two — e.g. the Information Security Group forms / the first SOC 2 Type II readiness program]**."

**2.4 · 6s · match cut** — The garage door rises; beyond it, impossibly, stands the lobby of the ISG Building. Huey is holding the door.
_VO (Huey):_ "Same promise. Bigger building."

**2.5 · 8s · FPV fly-through** — Flying from the lobby up through six glowing floors, each labelled as it passes: _Audit-Ready Security Program · SOC 2 Type II Readiness · Managed Security Operations · AI-Enabled Expertise · Technology Governance for Scale · Cyber Incident Response_.
_VO (Narrator):_ "Today that firm runs six managed programs under one roof, the Information Security Group, and a front door for AI: advisory, governance and readiness for organisations where getting AI wrong has consequences."

### Chapter 3 — Who we are, what we do (0:55)

**3.1 · 6s · dolly in** — Ava on the Engineering Bridge, hands clasped, halo softly lit; the fabric glows beneath her.
_VO (Ava, gracious, precise):_ "Let me be exact about what we do, because precision is rather the point."

**3.2 · 7s · hologram assembly** — Ava raises a hand; three glass panels assemble in the air: **AI Consulting**, **AI Governance**, **AI Readiness**, each with one line of cyan text beneath.
_VO:_ "We help regulated and operationally complex organisations decide where AI fits, what governance it needs, and what must change before rollout accelerates."

**3.3 · 6s · dolly left** — A fourth panel slides in: **The AI Risk & Readiness Snapshot — 10 business days.** Behind it a calendar burns through ten days and lands on an executive readout and a 90-day plan.
_VO:_ "It starts with the Snapshot. Ten business days. An executive readout. A ninety-day plan you can act on the morning after."

**3.4 · 7s · push through glass** — Camera passes through the panel into the boardroom; three industry emblems hover over the table: a bank vault (**Financial Services**), a cloud of app tiles (**SaaS**), a container ship and truck (**Transportation & Logistics**).
_VO:_ "Financial services. SaaS. Transportation and logistics. Industries where an AI mistake is not a slow rollout; it is an audit, a fine, a headline."

**3.5 · 5s · close-up** — Ava, a small confident smile; the halo brightens one notch.
_VO:_ "Security and GRC are not bolted on at the end. Here they are native. That is the whole firm in a sentence."

### Chapter 4 — Then vs now, the operating model (1:10)

**4.1 · 6s · split screen wipe** — Left: the Garage (past) in warm tired amber. Right: the Fabric Room (today) in cool living light. A vertical seam of gold divides them.
_VO (Narrator):_ "How we operated then, and how we operate now."

**4.2 · 7s · left side, handheld** — A practitioner's hands drag evidence screenshots into folders; a spreadsheet risk register scrolls endlessly; a calendar reads _Annual audit_; a stamp slams **POINT IN TIME**.
_VO:_ "Then: manual assessments. Spreadsheet risk registers. Control testing that depended on whoever was in the room. Fixes that were true the day of the audit and nobody checked again."

**4.3 · 7s · right side, slow orbit** — The AiVRIC lattice: cyan telemetry threads stream in from cloud icons (AWS, Azure, GCP, Microsoft 365); teal control nodes light as evidence lands, each stamped with a timestamp; gold risk nodes resize as probability and impact shift.
_VO:_ "Now: a platform-based model. AiVRIC, the Risk Intelligence Fabric, watches continuously and gathers evidence automatically, timestamped, across every cloud we govern."

**4.4 · 6s · crane down to centre** — At the lattice's heart, a practitioner's gate: a simple brushed-steel lectern where a human hand rests. Threads pause there before continuing.
_VO:_ "The platform does the heavy lifting. People provide the judgment. Nothing leaves without passing the practitioner gate."

**4.5 · 7s · hologram** — Ava steps in and draws two framework seals into the air: **UCB — Unified Control Baseline** (the platform's baseline, architected by 3HUE as AiVRIC's GRC build partner) and **USR™ — Unified Security & Risk Framework** (3HUE's own). Lines connect them: _define once, satisfy many_: ISO 27001, SOC 2, HIPAA, PCI DSS, NIST, CMMC, SCF.
_VO (Ava):_ "Two frameworks, one language. UCB is the control baseline the platform runs on; 3HUE architected it. USR is how we deliver your program on top of it. Map an obligation once, satisfy many frameworks, continuously, not one audit at a time."

**4.6 · 6s · two doors** — Huey in the lobby gestures at two lift doors: one marked **CloudSignals+ RiskOps — AI-accelerated, practitioner-gated**, the other **M365 GRC Platform — human-driven, on your own tenant**.
_VO (Huey):_ "Two ways to run it. Same method, same gate. Clients pick the lift; we make sure it arrives."

**4.7 · 6s · seam closes** — The gold seam from 4.1 sweeps across; the garage fades into the fabric room entirely. The old desk lamp is the last thing to go, becoming a gold node in the lattice.
_VO (Narrator):_ "We kept the discipline. We retired the spreadsheets."

### Chapter 5 — What makes us special (0:50)

**5.1 · 5s · dolly in** — Boardroom. A single chair at the head of the table; on its back, etched: **Founder-involved on every engagement**.
_VO (Narrator):_ "Not a staffing firm. Not a Big Four engagement handed to a junior team."

**5.2 · 6s · push in** — Hands on the table: one pair sketches an architecture, the same pair later signs the readout. Overlay text: _The advisor who scoped it delivers it._
_VO:_ "The same practitioner who scoped the work is in the room when it is delivered."

**5.3 · 6s · slow pan** — A long shelf: binders titled SOC 2, NIST, ISO, CMMC, SR 11-7, DORA, EU AI Act; each binder has a cyan thread running into the fabric behind the shelf.
_VO:_ "We built these programs from scratch in enterprise security, risk and AI. So our governance stands on real foundations, not a checklist on top of one."

**5.4 · 6s · continuous move** — A single unbroken dolly from the Snapshot panel (Chapter 3) along the bridge into a managed program floor; no cut, no handoff.
_VO:_ "And one operating model from the ten-day Snapshot to a managed program. No vendor handoffs. No ramp-up lost."

**5.5 · 5s · hero** — The Trust Center door: frosted glass, a gold seal, the words _Trust Center_ in Sora.
_VO:_ "We publish how we work in our own Trust Center, because we ask clients to do the same."

### Chapter 6 — The three hues (0:30)

**6.1 · 6s · macro** — Huey holds a glass prism to the lobby light; it splits into exactly three beams: cyan, teal, gold, which land on three plinths.
_VO (Huey):_ "People ask about the name. Three hues."

**6.2 · 8s · three plinths, slow dolly** — Over the cyan plinth: _Advisory — clarity_. Teal: _Operations — discipline_. Gold: _Signal — the risk that matters_. The three beams braid together into a single white line that runs up the building.
_VO:_ "Clarity, discipline, signal. Keep them separate and you get a consultancy, an ops shop and a dashboard. Braid them and you get 3HUE. It's also why nothing in this building is beige."

### Chapter 7 — Meet the digital workforce (1:20)

**7.1 · 6s · doors** — Huey opens a wide door marked **ECARM — Revenue Operations**; warm light spills out; five silhouettes at work.
_VO (Huey):_ "Now, the colleagues who never need a parking space. We are AI, we have names, and we have jobs. Nobody here is a chatbot bolted onto a page."

**7.2 · 7s · Marlowe, orbit** — Marlowe at a tall desk, monocle catching light; articles, filings and signals orbit them and snap into a single one-page brief that slides across the desk toward camera.
_VO (Marlowe, understated):_ "Marlowe. Research. I read everything so the deal team never walks into a first call cold."

**7.3 · 7s · Aries, dolly in** — Aries flicks the pen from behind her ear; a bloated paragraph floats before her and she strikes words out until one clean sentence remains, glowing coral.
_VO (Aries, crisp):_ "Aries. Outbound. One clear sentence beats three clever ones. I write the one."

**7.4 · 7s · Vera, macro** — Vera, badge gleaming; two duplicate contact records slide together and merge with a satisfying click; a stage field fills; a consent flag turns teal.
_VO (Vera, calm):_ "Vera. Data. A pipeline is only as honest as its records. Mine are honest."

**7.5 · 7s · Theo, top-down** — Theo sets a deal room table from above: case studies, data sheets, a question list and a Deal Builder scope card land in perfect order; he straightens one card.
_VO (Theo, steady):_ "Theo. Deal prep. The right case study, in the room, before the question is asked."

**7.6 · 7s · Trevor, low angle** — Trevor pulls goggles down; a horizon of deals renders in gold line-work; one deal flickers amber and he taps it before the forecast on the wall changes.
_VO (Trevor, alert):_ "Trevor. Pipeline. I see the stall before the forecast does, and I say so."

**7.7 · 6s · Ava, bridge** — Ava on the Engineering Bridge welcoming a visitor silhouette; the building's rooms light up along the route she describes.
_VO (Ava):_ "You've met me. I lead the public tour of this building and answer what prospects ask, from our own materials, never a step beyond them."

**7.8 · 8s · the newcomers, three doors ajar** — Three doors with _Onboarding_ tags. Through the first, Sage shelving glowing files that label themselves. Through the second, Vesper in a dim room, a wall of alerts dimming to three. Through the third, Quinn tapping a wall calendar until every timeline straightens.
_VO (Huey):_ "Sage, Vesper and Quinn are in onboarding, same as you. Records, security operations, engagement coordination. You'll see them come on duty."

**7.9 · 5s · Huey, close** — Huey taps his headset.
_VO (Huey):_ "And me. I know every room in this building, I know who owns what, and I will get you access without making you fill in a form twice."

### Chapter 8 — How we work today (0:45)

**8.1 · 6s · the Hub wall** — A wall of glowing tiles, the Enterprise Hub: Core Systems, Business Systems, Infrastructure, Customer Acquisition, Security, People, Documents. Huey walks along it, tiles lighting as he passes.
_VO (Narrator):_ "Today the firm runs from one hub. Every system, document and teammate, one door, one sign-in."

**8.2 · 6s · Quinn** — Quinn in Teamwork: overdue tasks nudge themselves forward; time entries fill before an invoice seals itself.
_VO:_ "Engagements run in Teamwork, with Quinn keeping every cadence honest."

**8.3 · 6s · Vera + Trevor** — Split: Vera reconciling HubSpot, Apollo and BigQuery into one clean line; Trevor posting the weekly pipeline pulse to a wall screen.
_VO:_ "Revenue runs through ECARM, where the data is clean and the pipeline cannot hide."

**8.4 · 6s · Vesper** — Vesper at the night desk; a threshold crosses; the CIRP runbook opens and a phone in a human's hand lights up.
_VO:_ "Security runs around the clock, and when a line is crossed, a human is paged by name."

**8.5 · 6s · documents** — Sage files a document; its tile gains an owner, a classification and a review date; a gold ring counts down to the next review.
_VO:_ "And nothing is 'done' until it is classified, versioned and findable."

### Chapter 9 — Your first week (0:40)

**9.1 · 6s · over-shoulder** — Huey beside the new hire's silhouette at a laptop; the hub's Home page glows; a journey card reads _Welcome aboard · 0 of 8_.
_VO (Huey):_ "Your first week, I'm with you. I'll give you the tour, hand you your role's toolkit, and park the deep dives for later."

**9.2 · 6s · KnowBe4 tile** — The Security floor; a tile marked **KnowBe4** glows orange; Huey points, the tile opens.
_VO:_ "Then security awareness training. We sell security; we'd look a bit silly getting phished."

**9.3 · 6s · profile** — A Microsoft 365 profile card assembles: a photo slides in, a title, a phone number, an Authenticator shield.
_VO:_ "Then your profile, so people can put a face to the name in the meeting."

**9.4 · 6s · phone** — The hub on a phone in the field, bottom bar glowing; a thumb taps _Ask Huey_; a Teams message to a manager reads _Ready for day one_.
_VO:_ "And when you're set, I'll write the note to your manager. Phone or laptop, your place is always saved."

### Chapter 10 — The promise (0:25)

**10.1 · 7s · slow crane from fabric to boardroom** — The lattice resolves upward into the boardroom window; the city at dusk; the building's three bands glowing.
_VO (Narrator):_ "We promise clients the same three things we'll promise you: clarity about what matters, the discipline to do it every day, and the honesty to say what the signal shows."

**10.2 · 5s · hands** — A practitioner's hand and Huey's hand on the same lectern at the gate.
_VO:_ "People make the calls. We make sure they have what they need to make them."

### Chapter 11 — Grand finale: Welcome to the team (0:45)

**11.1 · 6s · lobby, all agents** — The whole digital workforce assembles in the lobby in their tints: Huey centre, Ava, Marlowe, Aries, Vera, Theo, Trevor, Sage, Vesper, Quinn. Human silhouettes fill the mezzanine above. Confetti of tiny prisms begins to fall.
_VO (Huey):_ "Right. That's the building."

**11.2 · 7s · bullet-time orbit** — Time slows; the camera orbits the group as each agent turns to the lens with their signature: Trevor's goggles down, Aries's pen flick, Vera's click, Theo straightening a card, Marlowe's monocle glint, Ava's halo flaring, Sage's file landing, Vesper's hood back, Quinn's visor tap.
_Music:_ the pulse opens into full orchestra and synth; the three hue-lines sweep the frame.

**11.3 · 6s · badge** — A badge extrudes from the gold plinth: **3HUE · [FIRST NAME]** with a small three-hue prism; Huey hands it to camera.
_VO (Huey):_ "Your badge. It opens every door I've shown you, and a few I haven't."

**11.4 · 6s · each agent, one word** — Rapid cuts, each agent to camera: Ava "Welcome." Marlowe "Welcome." Aries "Welcome." Vera "Welcome." Theo "Welcome." Trevor "Welcome!" Sage "Welcome." Vesper "Welcome." Quinn "Welcome!"

**11.5 · 8s · crane out through the roof** — Pull back and up through the atrium, out the roof, the building below with all three bands blazing; the city; dawn breaking over the water.
_VO (Huey):_ "Welcome to 3HUE. Welcome to the team. Now — let's go find your desk."

**11.6 · 6s · end card** — Midnight navy. The 3HUE mark. Beneath it, in Sora: **Founder-led. Security native. Built for the work that matters.** Then, smaller: _hub.3hue.net · Ask Huey._ The three hue-lines settle into a single steady line.
_Music:_ resolves on the opening piano note.

---

## 6. Music and sound design brief

- **Arc.** One theme. Solo piano (Chapter 1) → warm analogue pad and soft pulse (2–3) → the pulse gains a
  subtle industrial edge in the "then" half of Chapter 4 and clears to glassy mallets in the "now" half
  → strings enter at Chapter 5 → playful, rhythmic variations per agent in Chapter 7 (each agent gets a
  two-bar motif in their tint's character: Marlowe woodwind, Aries pizzicato, Vera clean sine, Theo
  warm cello, Trevor bright brass stab) → full orchestra and synth at 11.2 → resolve to the single
  piano note.
- **Sound.** Doors are the signature: every transition has a satisfying, soft, mechanical door or lift
  sound. Holograms: thin glass chimes. Vera's merge: a single soft click. Trevor's amber flag: one low
  marimba note. Confetti prisms: faint crystalline shimmer, never cute.
- **Voices.** Huey warm baritone, conversational, slight smile in the voice. Ava poised alto, precise
  consonants. Narrator neutral, calm, slightly lower than Huey. Agents each one line; cast to
  personality (Trevor the brightest, Vesper the quietest, Aries the quickest).

## 7. On-screen text

Sora for titles, IBM Plex Sans for captions, IBM Plex Mono for timestamps and control IDs. Text only
in the title (1.5), chapter labels (small, lower-left, two seconds), the frameworks in 4.5, the badge
(11.3) and the end card (11.6). Everything else is spoken. Never let the model render text; add it in
the edit.

## 8. Facts to keep straight (so nothing drifts in generation)

- 3HUE Executive Consulting LLC. Founder-led; founder-involved on every engagement.
- ISG = the Information Security Group; six managed programs; "Inside the ISG Building" is the public
  tour led by Ava (Huey co-leads).
- AI front door: AI Consulting, AI Governance, AI Readiness; the AI Risk & Readiness Snapshot is 10
  business days with an executive readout and a 90-day plan.
- Industries: financial services, SaaS, transportation & logistics (plus private equity and family
  offices on the site).
- Platform model: AiVRIC (Risk Intelligence Fabric); UCB (Unified Control Baseline) is AiVRIC's control
  methodology, architected by 3HUE as its GRC build partner; USR™ is 3HUE's own delivery framework.
  Two delivery paths: CloudSignals+ RiskOps (AI-accelerated, practitioner-gated) and the 3HUE M365 GRC
  Platform (human-driven, on the client's tenant).
- Then vs now: manual assessments, spreadsheet risk registers, human-dependent control testing and
  point-in-time remediation → continuous, orchestrated, evidence timestamped, practitioner gate.
- Digital workforce roster and personalities exactly as in Section 2 (ECARM = Enterprise Customer
  Acquisitions & Revenue Management, formerly EMM).
- Office: (954) 738-4454, South Florida.
