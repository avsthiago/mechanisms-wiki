# mechanisms.wiki

Interactive 3D models of mechanical movements, starting with the 507 in Henry T. Brown's
*Five Hundred and Seven Mechanical Movements* (1868, public domain). More will be added later, so nothing
in the code should assume the collection stops at 507.

Static site, no build step, one page routed by path: `/` is the contents page, `/brown/53` shows No. 53,
`/brown/index` Brown's index, `/about` the About page. Brown's movements sit under `/brown/` so another book can
get its own prefix later. The host must answer every path that is not a file with `index.html` (on Cloudflare,
`wrangler.jsonc` sets `not_found_handling: single-page-application`; list anything that is not the site in `.assetsignore`); locally run `python3 scripts/serve.py`, since opening
the file directly no longer works. Asset paths in the page are absolute (`/engine/...`, `/movements/...`).
Old `#m53` addresses are moved to the new path. Links inside the site start with `/` and are handled without a reload.
For speed, `index.html` loads only the data and `engine.js`. three.js, OrbitControls and `parts.js` are fetched
when a movement opens (or when the reader first touches a card). On the contents page each card loads only its model
picture, lazily; Brown's engraving is fetched on first hover. `_headers` sets cache times for `vendor/`, `ref/` and `thumbs/`.

The page design was settled with the owner over many rounds. Do not redesign it. New work is new movements.

## Layout
- `engine/engine.js`: page shell, controls, camera, theme, render loop. Shared by every movement. Rarely edited.
- `engine/parts.js`: reusable geometry (`box`, `cylX/Y/Z`, `rod`, `arc`, `hoop`, `sphere`, `spurGear`, `gearSector`, `bevelGear`, `jawRing`, `label`, `at`). Read its doc comments before modelling.
- `engine/engine.css`: all styling. Movements never add CSS.
- `movements/NNN/movement.js`: one file per movement, three-digit folder. The only file a new movement needs.
- `movements/_template/movement.js`: starting point, a working pair of spur gears.
- `data/movements.js`: `window.SITE` (menu links, families, About text) and `window.MOVEMENTS` (one entry per movement). Set `built: true` when a model exists. `family` is one id from `SITE.families` and puts the movement under that button on the contents page. `text` holds Brown's wording only when checked against the book; it is shown on the page as "In Brown's words".
- `ref/NNN.png` (optional): the original engraving. Look at it before modelling when present.
- `data/index.js`: `window.INDEX`, Brown's own index (term, movement numbers). Shown at `/brown/index` and searched by the contents page. Not yet proofread against the scan; doubts are listed at the top of the file.
- `thumbs/NNN.webp`: the card picture on the contents page, made by `scripts/thumbs.py`.
- `scripts/serve.py`: local server that behaves like the host (any path that is not a file gets `index.html`). The other scripts start it themselves.
- `scripts/shot.py`: screenshot and error check.
- `scripts/clash.py`: runs a movement fast through every control setting and lists moving parts that pass through each other (`--family cams` for a whole family, `--fixed` to include supports).
- `scripts/thumbs.py`: makes `thumbs/NNN.webp` from the opening view on a see-through background (the engine draws that way when the address has `?thumb`).
- `docs/ROADMAP.md`: what to build next and in what order.
- `vendor/`: three.js r128 and OrbitControls. Do not upgrade casually; the `examples/js` globals were removed in later versions.

## Adding a movement
1. Read the entry in `data/movements.js` and `ref/NNN.png` if it exists. Do not search the web for the description unless both are missing; if they are, ask the owner for the engraving or the text.
2. Copy `movements/_template/` to `movements/NNN/` and edit `movement.js`.
3. Add or update the entry in `data/movements.js` with `built: true` and a `family`.
4. Run `python3 scripts/shot.py NNN --view front` once and look at the image. Fix what is wrong, then run it once more at most. Make the second shot the `3d` or `side` view, because gaps and parts buried in supports do not show from the front. If Playwright is not installed, run `uv run --with playwright==1.48.0 python scripts/shot.py ...`; pin a Playwright version that matches the Chromium you have installed.
5. When the model is right, run `python3 scripts/thumbs.py NNN` to make its card picture. This does not count as a screenshot; do not look at it unless the opening view is unusual.
6. Say what was invented (supports, proportions, tooth counts) in the movement's `note`.

## The movement contract
`M507.define({ number, title, lede, alt, parts, controls, speed, readouts, views, viewLabels, target, distance, how, note, build, step, opacity })`
- `parts`: 3 to 6 entries `{key, color, name, note}`. Colours come from the palette below. The note shows when the part is picked.
- `build(c)`: create meshes once. `c.P` is the parts library, `c.mat(key)` the material for a part, `c.mat(key, "mark")` red for the one element to follow, `"dark"` and `"light"` for ink and pale details, `c.fixed` the grey translucent material for supports and scenery that are not part of the movement (it does not write depth, so it never hides parts inside it; part materials draw as solid unless faded), `c.scene` the scene, `c.ink` and `c.spot` CSS colours for labels and water-like effects. Keep handles on `this.o`.
- `step(c, dt, S)`: advance by `dt` seconds. `S.w` is input speed in rad/s (0 when paused), `S.rpm`, `S.playing`, `S.controls[id]` the chosen value, `S.set(id, text)` writes a readout, `S.setControl(id, v)` moves a slider from code.
- `controls`: choices `{id, label, value, options: [[value, label], ...]}` (button ids are `id-value`) or sliders `{type: "range", id, label, min, max, step, value, unit, presets: [[value, label], ...], pauseOnInput}`.
- `speed`: omit for the standard 1 to 30 rpm slider; `{min, max, value, label, unit}` to rename or rescale it (its value arrives as `S.rpm`); `false` to hide it when the input is not a rotation.
- `readouts`: `[{id, label}]`, three at most. They sit over the top-left of the model.
- `opacity(key, S)`: optional, return 0..1 to fade a part in some state.
- `views`: camera positions for `3d`, `front`, `top`, `side`. The page always opens on `3d` and always shows all four as cube-icon buttons; any view left out is made from `target` at the 3D view's distance, so give the ones that matter.
- `closed`: `true` or `{label}` when the real machine is closed up (a cylinder, pump barrel, valve chest, clock case) and the model shows it cut away or see-through. The engine adds a last control, `label` (default "Casing") with Open and Closed (ids `case-open`, `case-closed`); Open is the default. In `build`, register casing pieces with `c.shell(obj, mode)`: mode `"both"` (default) for a `c.fixed` casing that turns solid when closed; `"closed"` for pieces shown only when closed (the half a cut-away leaves out, made with `P.wholeSection` or a full box, in the part's own material); `"open"` for pieces shown only when open (the cut-away half, marks on the cut face). Picking a part opens the casing. `S.controls.case` is available in `step`. Never hide water, steam or air when closed: the casing hides it inside, and it must still be seen coming out of the pipe ends and openings.
- Meshes whose geometry changes every frame: set `mesh.userData.live = true`.

## Conventions
- Units are arbitrary; keep the model within about 250 of the origin. Y is up, the main view looks down -Z.
- Part colours, in order of use: `#5E7387` driver or frame (steel blue), `#C8873A` driven (orange), `#C2503F` the key moving element (red), `#4FA58A` output or stationary element (green), `#D9B13B` linkage (yellow), `#E8E2D0` dials and cloth (the engine draws parts in this colour as a deeper sand `#B8975A` so they show on the white page), `#8E7AA8` a sixth part when one is needed (violet). Supports use `c.fixed`.
- Every movement has one control that teaches something (the Open / Closed casing choice from `closed` does not count): a comparison, a shift, a parameter. Give sliders two to four `presets` for the values worth seeing. Play, speed, reset, views and part picking come free from the engine. No redundancy: no readout that never changes, no control whose effect you cannot see in the motion, no option that turns the movement into another one (a "remove the movable pulley" choice that just recreates the single pulley). If no honest control exists, have none.
- A follower (lever, arm, rod, foot) resting on a cam or any turning profile must keep its whole body clear of it, not only its wheel or tip: solve for the lowest pose where the bar stays its half-thickness away from every edge point. A bulge rising beside the wheel will otherwise cut through the bar. Run `python3 scripts/clash.py NNN` before reporting; it runs every control setting and lists parts that pass through each other.
- Compute motion from kinematics (angles, constraints), not keyframes. Gears must visibly mesh: centre distance equals the sum of pitch radii, speeds in inverse ratio of teeth, driven gear offset half a pitch.
- Supports must look solid when orbited. `c.fixed` is see-through, so nothing may pass through it: end a shaft at the face of its bearing or frame, not inside it. Pieces that touch must share a face exactly. Work out each box's edges (centre ± half size) and check that an upright's bottom equals the base's top. Write those edge values in a comment beside the line.
- No two visible surfaces may lie in the same plane, or they flicker. Lift marks, stripes and painted bands about 0.5 to 1 off the surface along its normal, including across flat step faces and pulley sides, not just outward from the axis.
- If a movement needs a part another will reuse (rack, cam, ratchet, pulley, belt, spring), add it to `engine/parts.js` with a doc comment instead of building it inline.
- Do not edit `engine/engine.js` for one movement's needs. If the contract falls short, extend it for everyone and list the change here.
- All wording follows "Writing for students" below.

## Writing for students
The owner approved this tone on No. 14 and wants every movement written the same way. The reader is a student of about 12 who has never seen the mechanism. This applies to `lede`, every part `note`, `how`, `note`, control labels and presets.

- Short sentences, one idea each. Aim for under 20 words.
- Everyday words. Say "ropes" not "strands", "tied" not "made fast", "rub" not "friction", "upright" not "vertical", "made up" not "illustrative". If a technical name is needed, give it once and say what it is: "a lever with gear teeth on its end, called a sector".
- Real numbers, not general rules. "4 pulleys give 8 ropes" beats "twice as many strands as lower pulleys".
- Say what you can see first, then why it happens.
- One familiar comparison at most, and only if it is exact: "like a seat on a Ferris wheel that always hangs level".
- `lede`: two or three sentences on what it does and why that is useful.
- `how`: three short paragraphs. The last one gives the reader something to try with the control: "Try 1 pulley, then 4, and compare."
- Part `note`: one or two sentences on what the part is and what it does. If there is a red marked element, say to watch it.
- `note`: starts "This model is rebuilt from Brown's drawing" (or "description"), then says plainly what was made up or left out.
- Each movement stands alone. Do not write "This is No. 1 with..." or point to other movements; describe the mechanism as if the reader sees it first. Brown's own `text` may still say "Resembles 1".
- Metric units. Sentence case. No em dashes, no all-caps labels, no exclamation marks.
- Never simplify Brown's own `text`; it is a quotation.

Before: "It is one rope, so the tension is the same in every strand. Each strand therefore carries an equal share, and the hauling end only has to match one share."
After: "It is really one long rope, so every part of it pulls equally hard. With 8 parts sharing 100 kg, each part carries 12.5 kg. The winch only has to hold one part."

Read `movements/014/movement.js` as the model for tone before writing a new one.

## Page design (settled; for reference)
- Top strip: home icon left (left empty on the contents page), "mechanisms.wiki" centred, menu right. The menu holds `SITE.menu` links; on wide screens it is expanded inline. The light/dark switch is an icon button (moon or sun) beside the menu, always in view. Light is the default and the choice is remembered.
- The 3D view is pinned under the strip and the text scrolls beneath it. Over the model: readouts top left, camera views top right, reset and play/pause bottom right. Reset is greyed until something has changed.
- Text block: "No. N", the name, a grey one-paragraph summary, then "How it works", "In Brown's words" when `text` exists (with Brown's engraving `ref/NNN.png` above his text on a paper backing; tapping it opens it full size), and the note.
- Phone: one row above the bottom bar holds two drawers, Parts and Controls. An open drawer fills exactly the text area and never covers the model. Part buttons are one sideways-scrolling row, each with a dot in the part's colour; picking one fades the others.
- Bottom bar: Previous, a round Random button, Next. Arrow keys also move between movements.
- Wide screens (940px and up): the model fills the left, with readouts, views, reset and play over it as on a phone. Previous, Random and Next sit together, centred under the model, and show the neighbour's name from 1200px. The right column (`--side`, 440px to 680px) opens with a large "No. N" numeral, the name and the grey summary, then "How it works", "In Brown's words" and the note; this text scrolls on its own. Parts and Controls are two collapsible sections docked at the bottom of the column, under the text, so they stay in reach while reading. Each opens on its own (`aria-expanded` buttons `tab-parts`, `tab-ctl`); Controls starts open and Parts closed, and the choice is remembered (`mw-open` in localStorage). A closed section shows a summary: the picked part or the current control values. The page itself does not scroll.
- Contents page: headline "See how machines move" with a one-paragraph lede, and beside it (below on a phone) the movement of the day: Brown's engraving and the model side by side, picked by date from a short list in `home()`. Then the search box with a "Surprise me" button (shuffle icon; icon only on a phone) that opens a random movement from those shown, one row of family buttons, then a grid of cards in number order (two across on a phone). A card shows the model picture with its bare number in the top-right corner, and the name below; on hover it shows Brown's engraving. Movements not built yet show the engraving, faded, or just the number. Search looks through number, name, descriptions, family and Brown's index terms. The search and family sit in the address (`/?q=clutch&f=gears`) and Back returns to the same scroll position. No numbered pages.
- Index page: Brown's index, A to Z, with letter buttons. Reached from the link in the contents page lede, not from the menu. Each number is a link; grey when not built.
- One typeface, Atkinson Hyperlegible. White or dark page; colour belongs to the machine.

## Keeping sessions cheap
- One movement per session, or one family per session (gear trains, cams, ratchets, escapements).
- Edit files in place; do not rewrite `movement.js` to change a few lines.
- At most two screenshots per movement.
- A cheaper model is fine for movements that only reuse existing parts. Use the larger model for new helpers in `parts.js` and for tricky kinematics.
