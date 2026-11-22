M507.define({
  number: 200,
  title: "Two speeds from one driving wheel",
  lede: "One slanted shaft ends in a single cone of teeth. One side of the cone drives an upper gear and the opposite side drives a lower gear, both on the same upright line. The gears turn at different speeds and opposite ways.",
  alt: "An upright shaft carries two bevel gears facing each other, a larger one above on a sleeve and a smaller one below. A slanted shaft from a post at the right ends in one cone of teeth between them. The top of the cone meets the upper gear and the bottom meets the lower gear.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "A slanted driving shaft ending in one cone of teeth, called a bevel gear. It does the driving. The dark stripe shows it turning." },
    { key: "driven", color: "#C8873A", name: "Upper driven gear", note: "Sits on a hollow sleeve around the upright shaft. It turns slowly. Watch its red tooth." },
    { key: "out", color: "#4FA58A", name: "Lower driven gear", note: "Fixed to the upright shaft itself, which comes out through the sleeve at the top. It turns faster, and the other way. Watch its red tooth." }
  ],
  readouts: [{ id: "up", label: "Upper" }, { id: "low", label: "Lower" }],
  views: { "3d": [-100, 250, 900], front: [0, 20, 900], side: [900, 20, 100] },
  target: [0, -20, 0],
  how: [
    "The slanted shaft ends in one cone of teeth. Its top edge meets the teeth of the upper gear. Its bottom edge meets the teeth of the lower gear. The cone and both gears all point at the same spot on the upright shaft, so their teeth roll together without slipping.",
    "Each gear has more teeth than the cone, so each turns more slowly than the driving shaft. The upper gear has more teeth than the lower one, so it is the slower of the two. The cone moves up on one edge and down on the other, so the gears turn opposite ways. The upper gear rides on a hollow sleeve, so the upright shaft can turn inside it at its own speed.",
    "Watch the two red teeth. The lower one comes round more often. The two speeds in the corner have opposite signs, one for each way of turning. Use the speed slider and see that both speeds rise together, and the lower stays the faster."
  ],
  note: "This model is rebuilt from Brown's drawing. Which gear is on the sleeve, the sizes, the number of teeth and the stand were made up. The cone and both gears are set so that all three meet at one point on the upright shaft, which is what lets the teeth mesh truly. The shaft's end rests in a post at the right.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, V = T.Vector3, D = 180 / Math.PI;
    var Nu = 40, Nl = 28, n = 20, L = 156, F = .55, AZ = 20 * Math.PI / 180;
    // all three pitch cones share the apex at the origin. Solve for the cone half-angle b from the tooth counts:
    // asin(Nu/n sin b) + asin(Nl/n sin b) + 2 b = 180 degrees; then tu = asin(Nu/n sin b), tl = asin(Nl/n sin b), phi = tu + b
    var lo = 0, hi = Math.asin(Math.min(1, n / Math.max(Nu, Nl))) - 1e-9, b, k;
    function fn(x) { return Math.asin(Nu / n * Math.sin(x)) + Math.asin(Nl / n * Math.sin(x)) + 2 * x - Math.PI; }
    for (k = 0; k < 60; k++) { b = (lo + hi) / 2; if (fn(b) < 0) lo = b; else hi = b; }
    var tu = Math.asin(Nu / n * Math.sin(b)), tl = Math.asin(Nl / n * Math.sin(b)), phi = tu + b;
    var o = this.o = { psi: 0, Nu: Nu, Nl: Nl, n: n, au: 0, al: 0, su: 1, sl: 1 };
    // wheels (axis world Y). Upper faces down: its body is above the apex. Lower is flipped.
    o.spinU = new T.Group(); scene.add(o.spinU);
    var gu = P.bevelGearCone({ radius: L * Math.sin(tu), teeth: Nu, cone: tu * D, face: F, material: c.mat("driven"), markMaterial: c.mat("driven", "mark") });
    o.spinU.add(gu);
    var bu = gu.backY;
    P.at(P.cylY(14, 90, c.mat("driven")), 0, bu - 10 + 45, 0, o.spinU);                  // sleeve y bu-10..bu+80, starts inside the hub
    P.at(P.box(2, 40, 4, c.mat("driven", "dark")), 15.5, bu + 40, 0, o.spinU);           // stripe x 14.5..16.5, off the sleeve surface
    o.spinL = new T.Group(); scene.add(o.spinL);
    var fl = new T.Group(); fl.rotation.x = Math.PI; o.spinL.add(fl);
    var gl = P.bevelGearCone({ radius: L * Math.sin(tl), teeth: Nl, cone: tl * D, face: F, material: c.mat("out"), markMaterial: c.mat("out", "mark") });
    fl.add(gl);
    var bl = gl.backY, yTop = bu + 120, yBot = -180;                                       // shaft from the bearing block top to above the sleeve
    P.at(P.cylY(8, yTop - yBot, c.mat("out")), 0, (yTop + yBot) / 2, 0, o.spinL);
    P.at(P.box(2, 30, 4, c.mat("out", "dark")), 9.5, bu + 105, 0, o.spinL);               // stripe x 8.5..10.5 above the sleeve (sleeve top bu+80)
    // driving cone, apex at the origin, axis d tilted phi from +Y, out to the right and slightly towards the viewer
    var d = new V(Math.sin(phi) * Math.cos(AZ), Math.cos(phi), Math.sin(phi) * Math.sin(AZ));
    var pg = new T.Group(); pg.quaternion.setFromUnitVectors(new V(0, 1, 0), d); scene.add(pg);
    o.spinP = new T.Group(); pg.add(o.spinP);
    var gp = P.bevelGearCone({ radius: L * Math.sin(b), teeth: n, cone: b * D, face: F, material: c.mat("drive") });
    o.spinP.add(gp);
    var s0 = gp.backY, hp = 230, sEnd = hp / (Math.sin(phi));                              // shaft axis meets the post face at distance sEnd
    sEnd = hp / Math.sqrt(d.x * d.x + d.z * d.z);
    P.at(P.cylY(6, sEnd - 2 - (s0 - 10), c.mat("drive")), 0, (sEnd - 2 + s0 - 10) / 2, 0, o.spinP);   // shaft, local y s0-10..sEnd-2 (corner of its end cap is within 2 of the face)
    P.at(P.box(2, 40, 4, c.mat("drive", "dark")), 6.5 + .5, (s0 + sEnd) / 2 + 5, 0, o.spinP);         // stripe, 0.5 off the shaft
    // stand
    P.at(P.box(520, 12, 520, c.fixed), 0, -216, 0, scene);                               // base y -222..-210, x,z -260..260
    P.at(P.box(50, 30, 50, c.fixed), 0, -195, 0, scene);                                 // bearing block y -210..-180; upright shaft ends at y -180
    var ps = new T.Group(); ps.rotation.y = -AZ; scene.add(ps);
    var ys = d.y * sEnd;
    P.at(P.box(16, ys + 40 + 210, 40, c.fixed), hp + 8, (ys + 40 - 210) / 2, 0, ps);   // post x 230..246 along the shaft's azimuth, y -210..ys+40; shaft axis meets x 230 at y ys

    // find the starting angles (and turning senses) at which a tooth of each wheel meets a gap of the cone
    function pts(g, N, rg, ag, f, out) { for (var i = 0; i < N; i++) { var a = 2 * Math.PI * i / N; out.push(g.localToWorld(new V(f * rg * Math.cos(a), f * ag, f * rg * Math.sin(a)))); } }
    function frac(wg, N, lower, cp, t, pl) {
      var A = [], B = [], x = 1e9, y = 1e9;
      scene.updateMatrixWorld(true);
      pts(wg, N, wg.pitchRadius, wg.apexDist, .78, A); pts(gp, n, gp.pitchRadius, gp.apexDist, .78, B);
      A.forEach(function (p) { if (p.distanceTo(cp) < 2 * pl) { var q = p.clone().sub(cp).dot(t); if (Math.abs(q) < Math.abs(x)) x = q; } });
      B.forEach(function (p) { if (p.distanceTo(cp) < 2 * pl) { var q = p.clone().sub(cp).dot(t); if (Math.abs(q) < Math.abs(y)) y = q; } });
      var q = ((x - y) / pl) % 1; return q < 0 ? q + 1 : q;
    }
    function align(spin, wg, N, th, lower) {
      var u = new V(Math.sin(th) * Math.cos(AZ), (lower ? -1 : 1) * Math.cos(th), Math.sin(th) * Math.sin(AZ)).multiplyScalar(.78 * L);
      var t = new V(0, 1, 0).cross(u).normalize(), pl = 2 * Math.PI * .78 * wg.pitchRadius / N, st = 2 * Math.PI / N;
      function err(a, psi, s) { o.spinP.rotation.y = psi; spin.rotation.y = a; var q = frac(wg, N, lower, u, t, pl); return Math.abs(q - .5); }
      var best = 0, e, bestE = 9, i;
      for (i = 0; i < 240; i++) { e = err(st * i / 240, 0); if (e < bestE) { bestE = e; best = st * i / 240; } }
      var dl = .05, r = n / N * dl, e1 = err(best + r, dl), e2 = err(best - r, dl), s = e1 < e2 ? 1 : -1;
      o.spinP.rotation.y = 0; spin.rotation.y = best;
      return { a: best, s: s };
    }
    var ru = align(o.spinU, gu, Nu, tu, false), rl = align(o.spinL, gl, Nl, tl, true);
    o.au = ru.a; o.su = ru.s; o.al = rl.a; o.sl = rl.s;
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.psi += S.w * dt;
    var psi = o.psi, ku = o.n / o.Nu, kl = o.n / o.Nl;
    o.spinP.rotation.y = psi;
    o.spinU.rotation.y = o.au + o.su * ku * psi;
    o.spinL.rotation.y = o.al + o.sl * kl * psi;
    function f(v) { v = Math.round(v * 10) / 10; return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("up", f(o.su * rpm * ku));
    S.set("low", f(o.sl * rpm * kl));
  }
});
