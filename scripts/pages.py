#!/usr/bin/env python3
"""Write one HTML file per page for search engines and link previews:
  python3 scripts/pages.py          # index.html, about.html and brown/NNN.html for every built movement
  python3 scripts/pages.py --og     # also remake the preview pictures og/NNN.jpg (needs Pillow; slow)
Run it after adding a movement or changing its title or wording. Needs node, to read the movement files.

Every page is index.html with its own title, description, canonical address, preview tags and structured data,
and the page's words (name, summary, how it works, Brown's text, links) inside #app. The engine clears #app and
draws the real page, so readers never see them; a `js` class on <html> hides them until then. The host serves
brown/53.html at /brown/53. Brown's index (/brown/index) gets no file: a file there would be taken for the
folder's index page, so that address falls through to index.html and the engine sets its title.
The titles and descriptions here must match seo() in engine/engine.js."""
import html, json, pathlib, re, subprocess, sys
root = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://mechanisms.wiki"
HOME_TITLE = "mechanisms.wiki: Brown's 507 mechanical movements in 3D"
HOME_DESC = "See how machines move: every mechanism from Henry T. Brown's 1868 book, rebuilt as a working 3D model you can spin round, run and change."
BOOK = {"@type": "Book", "name": "Five Hundred and Seven Mechanical Movements", "author": {"@type": "Person", "name": "Henry T. Brown"}, "datePublished": "1868"}

READ = r"""
const fs = require("fs"), vm = require("vm"), path = require("path"), root = process.argv[process.argv.length - 1], out = {};
const ctx = { console, Math, JSON };
ctx.window = ctx;
ctx.M507 = { define: d => { out[d.number] = { title: d.title, lede: d.lede, how: d.how, note: d.note }; } };
function run(f) { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); }
ctx.document = { createElement: () => ({}), head: {}, body: {} };   // a movement that loads a helper first appends a script
ctx.document.body.appendChild = ctx.document.head.appendChild = s => { run(s.src.replace(/^\//, "")); if (s.onload) s.onload(); };
vm.createContext(ctx);
run("data/movements.js");
for (const m of ctx.MOVEMENTS) if (m.built && !out[m.n]) run(`movements/${String(m.n).padStart(3, "0")}/movement.js`);
process.stdout.write(JSON.stringify({ site: ctx.SITE, movements: ctx.MOVEMENTS, defs: out }));
"""

def esc(t): return html.escape(t or "", quote=True)

def lead(t):
    """The first sentences of t, up to 160 characters (as lead() in engine.js)."""
    o = ""
    for x in (t or "").replace(". ", ".\n").split("\n"):
        if o and len(o + " " + x) > 160: break
        o = o + " " + x if o else x
    return o

def para(t):
    """An About paragraph: text, or a list of text and {text, href} links."""
    if isinstance(t, str): return esc(t)
    return "".join(esc(x) if isinstance(x, str) else f'<a href="{esc(x["href"])}">{esc(x["text"])}</a>' for x in t)

def plain(t): return t if isinstance(t, str) else "".join(x if isinstance(x, str) else x["text"] for x in t)

def head(title, desc, path, image, ld):
    url, data = SITE + path, json.dumps(ld, ensure_ascii=False).replace("</", "<\\/")
    tags = [f"<title>{esc(title)}</title>",
            f'<meta name="description" content="{esc(desc)}">',
            f'<link rel="canonical" href="{url}">',
            '<meta property="og:site_name" content="mechanisms.wiki">',
            f'<meta property="og:type" content="{"website" if path == "/" else "article"}">',
            f'<meta property="og:title" content="{esc(title.replace(" | mechanisms.wiki", ""))}">',
            f'<meta property="og:description" content="{esc(desc)}">',
            f'<meta property="og:url" content="{url}">',
            f'<meta property="og:image" content="{SITE}{image}">',
            '<meta name="twitter:card" content="summary_large_image">',
            f'<script type="application/ld+json">{data}</script>']
    return "\n".join(tags)

def page(tpl, title, desc, path, image, ld, body):
    s = re.sub(r"<!--page-->.*?<!--/page-->", lambda m: "<!--page-->\n" + head(title, desc, path, image, ld) + "\n<!--/page-->", tpl, flags=re.S)
    return re.sub(r"<!--body-->.*?<!--/body-->", lambda m: '<!--body--><article class="pre">\n' + body + "\n</article><!--/body-->", s, flags=re.S)

def og_image(n):
    return f"/og/{n:03d}.jpg" if (root / f"og/{n:03d}.jpg").exists() else f"/ref/{n:03d}.png" if (root / f"ref/{n:03d}.png").exists() else "/og/home.jpg"

def make_og(nums):
    """1200 x 630 picture for link previews: Brown's engraving on the left, the model on the right, on white."""
    from PIL import Image
    (root / "og").mkdir(exist_ok=True)
    def fit(im, w, h):
        im.thumbnail((w, h), Image.LANCZOS); return im
    def flat(im):
        bg = Image.new("RGB", im.size, "white"); bg.paste(im, mask=im.convert("RGBA").split()[3]); return bg
    b = Image.open(root / "docs/img/banner.webp").convert("RGBA")
    c = Image.new("RGB", (1200, 630), "white"); b = fit(flat(b), 1160, 590); c.paste(b, ((1200 - b.width) // 2, (630 - b.height) // 2))
    c.save(root / "og/home.jpg", quality=82)
    from PIL import ImageDraw, ImageFont
    big, small = ImageFont.truetype(str(root / "vendor/fonts/atkinson-700.woff2"), 64), ImageFont.truetype(str(root / "vendor/fonts/atkinson-400.woff2"), 30)
    # WhatsApp and others crop the picture to a square from its middle, so the model fills the middle square (x 285..915)
    # and Brown's engraving and the number sit in the side strips, seen only in the wide preview.
    for n in nums:
        c = Image.new("RGB", (1200, 630), "white"); d = ImageDraw.Draw(c)
        ref, th = root / f"ref/{n:03d}.png", root / f"thumbs/{n:03d}.webp"
        if th.exists():
            t = Image.open(th).convert("RGBA"); t = t.crop(t.split()[3].getbbox() or (0, 0, t.width, t.height))
            k = min(580 / t.width, 580 / t.height); t = t.resize((max(1, round(t.width * k)), max(1, round(t.height * k))), Image.LANCZOS)
            c.paste(t, (600 - t.width // 2, 315 - t.height // 2), t)
        if ref.exists():
            r = fit(flat(Image.open(ref)), 255, 450); c.paste(r, (20 + (255 - r.width) // 2, 315 - r.height // 2))
        d.text((1055, 290), f"No. {n}", font=big, fill="#222222", anchor="ms")
        d.text((1055, 345), "mechanisms.wiki", font=small, fill="#777777", anchor="ms")
        c.save(root / f"og/{n:03d}.jpg", quality=80)
    print(f"og/: {len(nums) + 1} pictures")

def main():
    d = json.loads(subprocess.run(["node", "-e", READ, str(root)], check=True, capture_output=True, text=True).stdout)
    site, mov, defs = d["site"], d["movements"], d["defs"]
    built = [m for m in mov if m.get("built") and str(m["n"]) in defs]
    if "--og" in sys.argv: make_og([m["n"] for m in built])
    tpl = (root / "index.html").read_text()
    website = {"@context": "https://schema.org", "@type": "WebSite", "name": "mechanisms.wiki", "url": SITE + "/", "description": HOME_DESC}
    ln = lambda m: f'<li><a href="/brown/{m["n"]}">No. {m["n"]}: {esc(defs[str(m["n"])]["title"])}</a></li>'
    body = (f'<h1>See how machines move</h1>\n<p>{esc(HOME_DESC)}</p>\n<p><a href="/brown/index">Brown\'s index, A to Z</a> · <a href="/about">About</a></p>\n'
            f'<h2>The {len(built)} movements</h2>\n<ul>\n' + "\n".join(ln(m) for m in built) + "\n</ul>")
    (root / "index.html").write_text(page(tpl, HOME_TITLE, HOME_DESC, "/", "/og/home.jpg", website, body))
    about = site.get("about") or [""]
    (root / "about.html").write_text(page(tpl, "About | mechanisms.wiki", lead(plain(about[0])), "/about", "/og/home.jpg",
        {"@context": "https://schema.org", "@type": "AboutPage", "name": "About mechanisms.wiki", "url": SITE + "/about", "isPartOf": website},
        '<h1>About</h1>\n' + "\n".join(f"<p>{para(t)}</p>" for t in about) + '\n<p><a href="/">All movements</a></p>'))
    (root / "brown").mkdir(exist_ok=True)
    keep = set()
    for i, m in enumerate(built):
        n, df = m["n"], defs[str(m["n"])]
        title, desc, path, img = df["title"] + ": how it works in 3D | mechanisms.wiki", lead(df.get("lede")), f"/brown/{n}", og_image(n)
        ld = [{"@context": "https://schema.org", "@type": "LearningResource", "name": df["title"], "description": df.get("lede") or "",
               "url": SITE + path, "image": SITE + img, "learningResourceType": "Interactive 3D model", "inLanguage": "en",
               "isBasedOn": BOOK, "isPartOf": {"@type": "WebSite", "name": "mechanisms.wiki", "url": SITE + "/"}},
              {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                  {"@type": "ListItem", "position": 1, "name": "mechanisms.wiki", "item": SITE + "/"},
                  {"@type": "ListItem", "position": 2, "name": df["title"], "item": SITE + path}]}]
        prev, nxt = built[i - 1], built[(i + 1) % len(built)]
        b = [f'<p><a href="/">mechanisms.wiki</a></p>', f'<h1>No. {n}: {esc(df["title"])}</h1>', f'<p>{esc(df.get("lede"))}</p>']
        if (root / f"ref/{n:03d}.png").exists():
            b.append(f'<img src="/ref/{n:03d}.png" alt="Brown\'s engraving of No. {n}, {esc(df["title"])}" loading="lazy">')
        if df.get("how"): b += ["<h2>How it works</h2>"] + [f"<p>{esc(t)}</p>" for t in df["how"]]
        if m.get("text"): b += ["<h2>In Brown's words</h2>", f"<blockquote>{esc(m['text'])}</blockquote>"]
        if df.get("note"): b.append(f"<p>{esc(df['note'])}</p>")
        b.append(f'<p><a href="/brown/{prev["n"]}">Previous: {esc(defs[str(prev["n"])]["title"])}</a> · <a href="/brown/{nxt["n"]}">Next: {esc(defs[str(nxt["n"])]["title"])}</a></p>')
        f = root / f"brown/{n}.html"; keep.add(f.name)
        f.write_text(page(tpl, title, desc, path, img, ld, "\n".join(b)))
    for f in (root / "brown").glob("*.html"):
        if f.name not in keep: f.unlink()   # a movement that is no longer built
    print(f"pages: index.html, about.html and {len(built)} in brown/")

main()
