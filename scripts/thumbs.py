#!/usr/bin/env python3
"""Make the contents-page thumbnails: thumbs/NNN.webp, the opening view on a see-through background.
  python3 scripts/thumbs.py            # every folder in movements/
  python3 scripts/thumbs.py 53 54      # only these
Run it for a movement after its model is finished or its opening view changes.
Needs: playwright (see shot.py) and Pillow."""
import io, pathlib, sys
from PIL import Image
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
W, H = 480, 360
nums = [int(x) for x in sys.argv[1:]] or sorted(int(d.name) for d in (root / "movements").iterdir() if d.name.isdigit())
CSS = """*{background:transparent!important;border-color:transparent!important}
body *{visibility:hidden!important} #view,#view canvas{visibility:visible!important}
.stage{position:fixed!important;inset:0!important;height:auto!important;z-index:999}"""
def fit(im):
    """Crop to the model with a small margin, keeping 4:3, so every card is filled the same way."""
    box = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box: return im.resize((W, H), Image.LANCZOS)
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    w = max(box[2] - box[0], (box[3] - box[1]) * W / H) * 1.1; h = w * H / W
    return im.crop((round(cx - w / 2), round(cy - h / 2), round(cx + w / 2), round(cy + h / 2))).resize((W, H), Image.LANCZOS)
(root / "thumbs").mkdir(exist_ok=True); bad = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for n in nums:
        pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=2); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        try:
            pg.goto((root / "index.html").as_uri() + "?thumb#m" + str(n)); pg.wait_for_selector("#view canvas", timeout=8000)
            pg.add_style_tag(content=CSS); pg.wait_for_timeout(900)
            im = fit(Image.open(io.BytesIO(pg.screenshot(omit_background=True))).convert("RGBA"))
            im.save(root / "thumbs" / f"{n:03d}.webp", quality=82, method=6); print("saved", f"thumbs/{n:03d}.webp")
        except Exception as e: errs.append(str(e))
        if errs: bad.append((n, errs))
        pg.close()
for n, e in bad: print("ERROR", n, *e, sep="\n  ")
sys.exit(1 if bad else 0)
