# Roadmap

All 507 movements are built, and every one has a family. This file says what a finished movement needs and what could come next.

## 1. Definition of done for one movement
- Renders with no page errors in `scripts/shot.py`.
- Motion is kinematically right: gears mesh, linkages stay connected through a full cycle.
- Three to six parts, each with a note. One teaching control. Up to three readouts.
- `lede`, `how` and `note` written; `note` lists what was invented.
- `data/movements.js` entry has `built: true`.

## 2. Later, not now
- **STL export.** A "Download STL" button from the engine, labelled as a display model, not print-tested.
- **Print-tested kits.** Hand-finished versions of popular movements: real clearances, involute teeth, a frame.
- **Movements beyond Brown's 507.** Number them from 1001 so they never collide with the book's numbers.
- **Real links** in `SITE.menu` (GitHub is empty for now) and final About text.

## 3. Deploying
Any static host works: copy the folder as it is. The site needs no server code and no build.
