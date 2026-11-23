#!/usr/bin/env python3
"""Screenshot one movement and report page errors.
  python3 scripts/shot.py 53                      # opening view
  python3 scripts/shot.py 53 --view front --click clutch-right --click part-clutch --wait 4
  --click takes element ids: choice buttons are CONTROLID-VALUE, parts are part-KEY, also play, reset, tab-parts, tab-ctl.
  python3 scripts/shot.py _template               # the template folder
Writes out/NNN-VIEW.png (model only) and prints the readouts. Exit code 1 if the page threw an error.
Needs: pip install playwright && playwright install chromium"""
import argparse, pathlib, shutil, sys, tempfile
from playwright.sync_api import sync_playwright
from serve import serve
root = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("n"); ap.add_argument("--view"); ap.add_argument("--click", action="append", default=[])
ap.add_argument("--wait", type=float, default=2.0); ap.add_argument("--size", type=int, default=700)
ap.add_argument("--page", action="store_true", help="capture the whole page at phone width instead of the model")
a = ap.parse_args()
n = a.n
if n == "_template":   # serve the template as movement 999
    url = "/brown/999"; tmp = root / "movements" / "999"; shutil.copytree(root / "movements" / "_template", tmp, dirs_exist_ok=True)
else:
    tmp = None; url = "/brown/" + str(int(n))
errs = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = b.new_page(viewport={"width": 400, "height": 760} if a.page else {"width": a.size + 60, "height": a.size + 400})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "fonts.g" not in m.text and "ERR_" not in m.text else None)
        pg.goto(serve() + url); pg.wait_for_selector("#view canvas", timeout=8000)
        if a.view: pg.click("#v-" + a.view)
        for c in a.click: pg.evaluate("id => document.getElementById(id).click()", c)   # works on controls inside closed drawers
        pg.wait_for_timeout(int(a.wait * 1000))
        out = root / "out" / f"{n}-{a.view or 'open'}{'-page' if a.page else ''}.png"; out.parent.mkdir(exist_ok=True)
        (pg if a.page else pg.locator(".stage")).screenshot(path=str(out))
        print("saved", out.relative_to(root))
        for dd in pg.locator(".hud dd").all(): print(" ", dd.get_attribute("id"), "=", dd.inner_text())
finally:
    if tmp: shutil.rmtree(tmp, ignore_errors=True)
if errs: print("ERRORS:", *errs, sep="\n  "); sys.exit(1)
