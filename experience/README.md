# Inside 3HUE — Governance Acceleration & Enterprise Maturity

A walkable building that tells the 3HUE Information Security Group (ISG) story: six managed GRC programs in the
wings (ISP, CIRP, vCISO on the left; RMP, SCS, VCP on the right), Secure Engineering & Architecture on top, the
AiVRIC Risk Intelligence Fabric in the glass chamber feeding Client Vision, the boardroom where executives set
priorities and approve action, and the Enterprise Maturity Pathway along the base.

Built on the same engine as the AiVRIC operations-floor experience (plain HTML, CSS, ES modules; no build step).

Lives at `experience/` inside the 3HUE website repo, so it ships with the site at `https://3hue.net/experience/`.
Everything it needs is self-contained under this folder (no dependency on the site's assets).

## Run locally

```bash
# from the website root
python -m http.server 8000
# open http://localhost:8000/experience/
```

Opening film: `media/film/inside-3hue.mp4` (11.8 s, built from the room renders with `tools/build-film.py`) plays once per session; `?skipintro=1` or any deep link skips it, and the play button in the HUD replays it.

Deep links: `#/room/<id>` and `#/station/<id>` — for example `#/room/boardroom`, `#/station/for-cfo`,
`#/station/get-started`. Room ids: vciso, isp, cirp, rmp, scs, vcp, sea, vision, boardroom, pathway.

## Folder layout

```
index.html                 shell (stage, HUD, panel, lightbox)
css/experience.css         styles and 3HUE brand tokens
js/                        engine (stage pan/zoom, hotspots, streams, router, HUD, panel, lightbox)
content/experience.json    THE manifest: rooms, stations, copy, media, hotspots, streams
media/scene/master.jpg     the building (2304×1536): the concept render with the annotation layer removed
media/scene/rooms/         drop per-room renders here as <room-id>.jpg (2048×1152), then run tools/wire-renders.py
tools/render-prompts/      master + per-room prompts (p_<id>.txt as written; p_<id>-notext.txt without baked titles)
tools/render-style-block.txt  shared style paragraph for every render
media/programs/            program and audience icons (+ branded tiles used in galleries)
media/systems/             portal, runbook, operating-plan, and options graphics from the ISG deck/PDF
media/photos/              photography from the ISG packet and boardroom deck
media/brand/               3HUE shield, favicon
tools/hotspot-tool.html    click-to-get-coordinates helper (serve it; not file://)
tools/reference-inside-3hue.png  the original concept image
```

## How the building works

All rooms currently use `"render": null`, which zooms into the master image instead of cross-fading to a separate
close-up, so the whole experience runs off one image. To add dedicated room renders: generate each room from
`tools/render-prompts/p_<room-id>-notext.txt` (prefixed with `tools/render-style-block.txt`) at 2048×1152, save it as
`media/scene/rooms/<room-id>.jpg`, and run `python tools/wire-renders.py` from this folder. It sets `render` for every
room that has a file and leaves the others zooming into the master. Adjust `focus` (0–1 in the render) if the
point of interest should sit somewhere other than the center.

Prefer the `-notext` prompt variants: the interface draws the room title, tagline, and pins in HTML, so a title
baked into the render would appear twice. The master used here is the concept render with its numbered badges,
side captions, header, and footer removed; `tools/render-prompts/p_master.txt` describes a from-scratch master
without annotations if you want to regenerate it at full resolution.

`hotspot` places the pin (normalized 0–1 on the master). `zoomTo` and `zoom` control where the camera goes when a
room is entered. `streams` are SVG paths in master pixels (2304×1536): blue = program signal into the fabric,
gold = executive decisions. Use `tools/hotspot-tool.html` to read coordinates and trace paths.

## Editing content

Everything is in `content/experience.json`. Each room has `stations` (the tabs in the panel); each station has
`status` (`service` shows as "Managed program", `platform` as "Powered by AiVRIC"), `suite` (small muted line),
`headline`, `summary`, `capabilities`, `media` (`image` or `video` with optional `poster`), and `links`
(`"primary": true` fills the button; `#/...` links navigate inside the experience, external links open a new tab).

Effort ranges, program descriptions, audience justification points, engagement steps, and the get-started
scenarios come from the ISG Framework Justification packet (v2025.1) and the Spring 2025 boardroom deck.

## Credits

Concept image and story: 3HUE Executive Consulting. Engine: adapted from the AiVRIC "Inside the operations
floor" experience (3HUE / Nate Butler). Fonts: Roboto and Inter via Google Fonts.
