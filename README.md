# mechanisms.wiki

Mechanical movements as 3D models you can turn, take apart and operate. The collection starts with
all 507 movements in Henry T. Brown's *Five Hundred and Seven Mechanical Movements* (1868). Each one
moves by its real kinematics, has a control that teaches something, and is explained in plain words
for a student of about 12.

## Run it
No build step and no server code. Serve the folder with any static server and open it:

    python3 -m http.server 8000      # then open http://localhost:8000

`index.html` is the contents page, `index.html#m53` shows No. 53, `#index` is Brown's index and
`#about` the About page. Opening `index.html` straight from disk also works in most browsers.

## How it is organised
- `index.html`, `engine/`: the page, the 3D runtime and the shared parts library (`engine/parts.js`).
- `movements/NNN/movement.js`: one file per movement. `movements/_template/` is a working starting point.
- `data/movements.js`: the list of movements, their families and Brown's own text. `data/index.js`: Brown's index.
- `ref/NNN.png`: Brown's engravings, cleaned from a scan of the book. `thumbs/NNN.webp`: the card pictures.
- `scripts/`: `shot.py` (screenshot and error check), `thumbs.py` (card pictures), `cut_figures.py` (cut engravings from page scans).
- `vendor/`: three.js r128 and OrbitControls.

`CLAUDE.md` holds the full movement contract, the modelling rules and the writing style. Read it before
adding or changing a movement; it applies to people as much as to Claude Code.

## Add or fix a movement
1. Copy `movements/_template/` to `movements/NNN/` and edit `movement.js`.
2. Add or update the entry in `data/movements.js` (`built: true` and a `family`).
3. Check it and make its card picture:

       pip install playwright && playwright install chromium
       python3 scripts/shot.py 53 --view front
       python3 scripts/thumbs.py 53

## Credits
Text and engravings: Henry T. Brown, 1868, public domain. 3D rendering: three.js (MIT, see
`vendor/THREE-LICENSE`).
