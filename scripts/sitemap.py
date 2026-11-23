#!/usr/bin/env python3
"""Write sitemap.xml: the contents page, Brown's index, About and every built movement, so search engines find them all.
  python3 scripts/sitemap.py
Run it after adding movements (the list comes from data/movements.js)."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://mechanisms.wiki"
src = (root / "data" / "movements.js").read_text()
nums = sorted(int(n) for n, rest in re.findall(r"\{ n: (\d+),([^\n]*)", src) if "built: true" in rest)
paths = ["/", "/brown/index", "/about"] + [f"/brown/{n}" for n in nums]
xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
xml += "".join(f"  <url><loc>{SITE}{p}</loc></url>\n" for p in paths) + "</urlset>\n"
(root / "sitemap.xml").write_text(xml)
print(f"sitemap.xml: {len(paths)} addresses")
