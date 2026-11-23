"""Clean one plate page of the scan and cut it into figures.
usage: python3 -I cut.py PAGE.png OUTDIR '{"69":[l,t,r,b], ...}'
The boxes are the printed grid cells, read off the page (the grid differs from page to page, and
finding it automatically proved unreliable: straight strokes inside figures look like dividers)."""
import sys, json, numpy as np
from PIL import Image, ImageFilter
src, outdir, boxes = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
im = Image.open(src).convert("L")
g = np.asarray(im, dtype=np.float32)
bg = np.asarray(im.filter(ImageFilter.GaussianBlur(28)), dtype=np.float32)      # the yellowed paper
flat = g / np.maximum(bg, 1)
clean = np.clip((flat - 0.62) / (0.93 - 0.62), 0, 1)     # paper to white, ink to black; show-through from the back of the page drops out
out = Image.fromarray((clean * 255).astype(np.uint8))
for n, (l, t, r, b) in boxes.items():
    c = out.crop((l + 8, t + 8, r - 8, b - 8)); m = np.asarray(c) < 128
    m &= np.asarray(c.filter(ImageFilter.MinFilter(3))) < 128                   # ignore single-pixel specks when finding the edges
    yy, xx = np.where(m); pad = 12
    if len(xx): c = c.crop((max(0, xx.min() - pad), max(0, yy.min() - pad), min(c.width, xx.max() + pad), min(c.height, yy.max() + pad)))
    c.save(f"{outdir}/{int(n):03d}.png"); print(n, c.size)
