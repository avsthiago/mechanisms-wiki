# Contributing to mechanisms.wiki

Thank you for helping. All 507 of Brown's movements are built, so most of the work now is making them
better: more faithful to the engraving, more correct in their motion, clearer to read.

## Ways to help

- **Report a problem.** A part that floats or passes through another, gears that do not mesh, a linkage
  that comes apart, a model that does not match Brown's engraving, a sentence that is hard to follow.
  [Open an issue](../../issues/new/choose) with the movement number and, if you can, a screenshot.
- **Fix a movement.** Each one is a single file, `movements/NNN/movement.js`. Small, focused pull
  requests are easiest to review: one movement, or one kind of fix across several.
- **Proofread Brown.** The text in `data/movements.js` and the index in `data/index.js` should match the
  book exactly, including part letters (A, B, C). Doubts about the index are listed at the top of its file.
- **Add a movement beyond Brown's 507.** Number it from 1001 so it never collides with the book.

## Getting set up

No build, no dependencies to run the site:

```sh
python3 -m http.server 8000     # open http://localhost:8000/index.html#m24
```

To check a movement and remake its card picture you need Playwright:

```sh
pip install playwright && playwright install chromium
python3 scripts/shot.py 24 --view front     # writes out/24-open.png and reports page errors
python3 scripts/thumbs.py 24                # writes thumbs/024.webp
```

`shot.py` also takes `--view 3d|front|top|side`, `--click <button-id>` and `--wait <seconds>`.

## The rules, briefly

The full rules are in [`CLAUDE.md`](CLAUDE.md). It is written for Claude Code, but it is the project's
style guide for everyone. The ones that come up most:

**Modelling**
- Compute motion from the mechanism (angles, constraints), never from keyframes.
- Gears must really mesh: centre distance equals the sum of the pitch radii, speeds in inverse ratio of teeth.
- Parts that touch share a face exactly. Nothing passes through a support. Write box edges in a comment.
- No two visible surfaces in the same plane; lift marks and stripes 0.5 to 1 off the surface, or they flicker.
- The opening view must look like Brown's engraving. Compare it with `ref/NNN.png`.
- A part another movement could reuse (rack, cam, ratchet, pulley, spring) belongs in `engine/parts.js`.
- Do not change `engine/engine.js` or the page design for one movement. If the contract falls short,
  propose the change for everyone in an issue first.

**Controls**
- Exactly one control that teaches something, with two to four presets. If no honest control exists, have none.
- No readout that never changes, no control whose effect you cannot see.

**Writing**
- The reader is about 12 and has never seen the mechanism. Short sentences, everyday words, real numbers.
- Each movement stands alone; do not refer to other movements by number.
- The `note` says plainly what was made up (supports, sizes, tooth counts).
- No letter labels (A, B, C) in the model or part names. Metric units, sentence case, no exclamation marks.
- Never edit Brown's own `text` except to match the book more exactly.

Read `movements/014/movement.js` for the tone and `movements/_template/movement.js` for the structure.

## Before you open a pull request

- [ ] `node --check movements/NNN/movement.js` passes.
- [ ] `python3 scripts/shot.py NNN` reports no page errors, and you looked at the picture from two views.
- [ ] The opening view matches Brown's engraving.
- [ ] The motion stays connected through a full cycle and at every preset.
- [ ] If the opening view changed, `thumbs/NNN.webp` is remade.
- [ ] New or changed text follows the writing rules above.
- [ ] The entry in `data/movements.js` has `built: true` and a `family`.

## Using Claude Code

The repository is set up for [Claude Code](https://claude.com/claude-code): `CLAUDE.md` is read automatically.
Keep sessions to one movement or one family, and review its screenshots yourself before opening a PR.

## Conduct

Be kind and assume good faith. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

By contributing you agree that your work is released under the project's [MIT license](LICENSE).
