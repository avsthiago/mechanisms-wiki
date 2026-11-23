#!/usr/bin/env python3
"""Look for parts that pass through each other while a movement runs.
  python3 scripts/clash.py 149 150            # some movements
  python3 scripts/clash.py --family cams      # every movement in a family
Runs each movement fast through several turns, for every choice of every control (and the ends of each slider).
At each sample it takes points on every moving mesh and asks whether they sit inside a mesh of another part
(ray parity), and how deep. Pairs deeper than --depth are printed. Pins in eyes and shafts in hubs touch by
design and stay shallow; a lever through a cam goes deep.
Needs: pip install playwright && playwright install chromium"""
import argparse, json, pathlib, re, sys
from playwright.sync_api import sync_playwright
from serve import serve
base = serve()
root = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("n", nargs="*"); ap.add_argument("--family"); ap.add_argument("--depth", type=float, default=4.0)
ap.add_argument("--samples", type=int, default=24); ap.add_argument("--fixed", action="store_true", help="also test against supports (c.fixed)")
a = ap.parse_args()
nums = [int(x) for x in a.n]
if a.family:
    src = (root / "data" / "movements.js").read_text()
    nums += [int(m) for m in re.findall(r'\{ n: (\d+), family: "' + a.family + '"', src)]

# Tag every material with its part key, keep the scene, and speed up time, before the movement is defined.
HOOK = """
(function () {
  var real;
  Object.defineProperty(window, "M507", { configurable: true, get: function () { return real; }, set: function (v) {
    real = v; var d;
    Object.defineProperty(v, "define", { configurable: true, get: function () { return function (def) {
      var b = def.build, s = def.step;
      def.build = function (c) {
        var om = c.mat; c.mat = function (k, va) { var m = om.call(c, k, va); m.userData.key = k; return m; };
        c.fixed.userData.key = "fixed"; window.__scene = c.scene; window.__c = c; return b.call(this, c);
      };
      def.step = function (c, dt, S) { window.__S = S; return s.call(this, c, Math.min(dt, .05) * (window.__k || 1), S); };
      return d.call(this, def);
    }; }, set: function (f) { d = f; } });
  } });
})();
"""

PROBE = """
(depthMin) => {
  var T = window.THREE, sc = window.__scene, withFixed = WITHFIXED, meshes = [], ray = new T.Raycaster(), hits = [];
  sc.updateMatrixWorld(true);
  sc.traverse(function (o) {
    if (!o.isMesh || !o.visible || !o.geometry || !o.geometry.attributes.position) return;
    var p = o; while (p) { if (p.visible === false) return; p = p.parent; }
    var k = o.material && o.material.userData && o.material.userData.key;
    if (!k || (k === "fixed" && !withFixed)) return;
    o.geometry.computeBoundingBox();
    var bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
    meshes.push({ o: o, k: k, bb: bb, side: o.material.side });
  });
  meshes.forEach(function (m) { m.o.material.side = T.DoubleSide; });
  var dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(function (d) { return new T.Vector3(d[0], d[1], d[2]); });
  var v = new T.Vector3(), best = {};
  // points spread over every triangle, about 5 apart, so a long bar is tested along its length and not only at its ends
  function samples(o) {   // in world space, so stretched bars are sampled along their real length
    var g = o.geometry, pos = g.attributes.position, idx = g.index, nt = idx ? idx.count / 3 : pos.count / 3, out = [], a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), t, i, j;
    var stride = Math.max(1, Math.floor(nt / 3000));
    for (t = 0; t < nt; t += stride) {
      var ia = idx ? idx.getX(3 * t) : 3 * t, ib = idx ? idx.getX(3 * t + 1) : 3 * t + 1, ic = idx ? idx.getX(3 * t + 2) : 3 * t + 2;
      a.fromBufferAttribute(pos, ia).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(pos, ib).applyMatrix4(o.matrixWorld); c.fromBufferAttribute(pos, ic).applyMatrix4(o.matrixWorld);
      var m = Math.min(16, Math.ceil(Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) / 5));
      for (i = 0; i <= m; i++) for (j = 0; j <= m - i; j++) {
        var u = i / m || 0, w = j / m || 0, z = 1 - u - w;
        out.push(a.x * u + b.x * w + c.x * z, a.y * u + b.y * w + c.y * z, a.z * u + b.z * w + c.z * z);
      }
    }
    return out;
  }
  meshes.forEach(function (A) {
    if (A.k === "fixed") return;
    var pts = samples(A.o);
    meshes.forEach(function (B) {
      if (B === A || B.k === A.k || !A.bb.intersectsBox(B.bb)) return;
      for (var i = 0; i < pts.length; i += 3) {
        v.set(pts[i], pts[i + 1], pts[i + 2]);
        if (!B.bb.containsPoint(v)) continue;
        var inside = true, depth = 1e9;
        for (var j = 0; j < 6 && inside; j++) {
          ray.set(v, dirs[j]); var h = ray.intersectObject(B.o, false);
          if (h.length % 2 === 0) inside = false; else depth = Math.min(depth, h[0].distance);
        }
        if (inside && depth > depthMin) {
          var key = A.k + " in " + B.k;
          if (!best[key] || best[key][0] < depth) best[key] = [depth, Math.round(v.x), Math.round(v.y), Math.round(v.z)];
        }
      }
    });
  });
  meshes.forEach(function (m) { m.o.material.side = m.side; });
  return best;
}
"""

bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for n in sorted(set(nums)):
        pg = b.new_page(viewport={"width": 700, "height": 900}); pg.add_init_script(HOOK)
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(base + "/brown/" + str(n))
        try: pg.wait_for_function("window.__S", timeout=8000)
        except Exception: print(f"{n:3d}  did not start", errs); bad += 1; pg.close(); continue
        # every choice button and the ends of every slider except speed
        states = pg.evaluate("""() => {
          var out = [[]];
          document.querySelectorAll('.panel button[id], .row input[type=range]').forEach(function (e) {
            if (e.tagName === 'INPUT') { if (e.id !== 'speed') out.push([['r', e.id, e.min]], [['r', e.id, e.max]]); }
            else if (/^[a-z0-9]+-/i.test(e.id) && !/^(tab|part|v|case)-/.test(e.id) && e.closest('.opts, .chips')) out.push([['b', e.id]]);
          });
          return out; }""")
        found = {}
        for st in states:
            for s in st:
                if s[0] == "b": pg.evaluate("id => document.getElementById(id).click()", s[1])
                else: pg.evaluate("([id, v]) => { var e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); }", [s[1], s[2]])
            pg.evaluate("window.__k = 12"); pg.wait_for_timeout(400)
            lab = (st[0][1] + ("=" + st[0][2] if st[0][0] == "r" else "")) if st else "default"
            seen, top = {}, {}                            # pair -> depth at each sample (0 when apart); deepest sample
            for t in range(a.samples):
                pg.wait_for_timeout(90)
                r = pg.evaluate(PROBE.replace("WITHFIXED", "true" if a.fixed else "false"), 0.5)
                for k in set(seen) | set(r):
                    seen.setdefault(k, [0.0] * t).append(r[k][0] if k in r else 0.0)
                    if k in r and (k not in top or top[k][0] < r[k][0]): top[k] = (r[k][0], tuple(r[k][1:]))
            # keep a pair only if it is deep and its depth changes as the movement runs: a pin in its hole stays the same
            for k, ds in seen.items():
                if max(ds) > a.depth and max(ds) - min(ds) >= 2.5 and (k not in found or found[k][0] < max(ds)):
                    found[k] = (top[k][0], lab, top[k][1], None)
        if found or errs:
            bad += 1
            print(f"{n:3d}  " + "; ".join(f"{k} {d:.0f} deep at {at} ({lab})" for k, (d, lab, at, _) in sorted(found.items(), key=lambda x: -x[1][0])) + (("  ERRORS " + " | ".join(errs)) if errs else ""))
        else: print(f"{n:3d}  ok")
        sys.stdout.flush(); pg.close()
    b.close()
sys.exit(1 if bad else 0)
