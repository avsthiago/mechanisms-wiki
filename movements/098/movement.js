M507.define({
  number: 98,
  title: "Crank pin in a closed groove",
  lede: "A pin on a turning disc runs round inside a closed groove cut in an arm. The pin pushes the arm up and down, so the arm rocks about its own shaft. The disc turns steadily, but the arm rocks faster in some places than in others.",
  alt: "A big round disc turning on a shaft. An arm lies over it, pivoted on a shaft at the right. A closed, rounded groove is cut right through the broad end of the arm, and a red pin on the disc runs round inside it.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "Turns at a steady speed. The dark line shows which way it is turned." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "A peg fixed in the disc, away from its centre. It goes round in a circle and pushes the groove walls. Watch it." },
    { key: "arm", color: "#C8873A", name: "Arm", note: "Swings about its shaft on the right. The groove goes right through its broad end. A small strap holds the middle piece to the rest." }
  ],
  readouts: [{ id: "a", label: "Arm angle" }],
  views: { "3d": [330, 170, 520], front: [40, -20, 640], side: [680, 40, -40] },
  target: [40, -20, 0],
  how: [
    "The disc turns at a steady speed. The red pin is fixed in the disc, away from its centre, so it goes round in a circle. It stands inside a groove that goes right round the middle of the arm.",
    "The groove is a closed loop, so the pin cannot slip out. It runs along both long sides and round both ends, once for every turn of the disc. It pushes on the groove walls, and the arm swings up and down about its shaft on the right. The pin has to slide along the groove as it goes round. That makes the arm speed up and slow down, even though the disc is steady. Brown calls this irregular vibrating motion.",
    "Watch the red pin and the arm together. Notice where the pin is when the arm swings fastest, and where it is when the arm stops for a moment before turning back."
  ],
  note: "This model is rebuilt from Brown's drawing. The shape of the groove was worked out so that the pin can run round all of it while the arm rocks smoothly. It is a little different from the drawn one. The drawing also shows no way to hold the middle piece, so a small strap was added over the groove. The pin passes under it. The thickness of the arm, the shaft supports, the base and all the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { a: 0, phi: null }, i, N = 240;
    var D = 145, RC = 60, W = 26, B = 0.35, HW = 7.5, RING = 12;                          // shaft distance, pin radius, groove shape, half width, ring width
    var g = o.g = { d: D, rc: RC, w: W, b: B, n: N, pts: [] };
    // The groove's middle line is the path of the pin in the arm's own frame, for an arm angle that keeps the pin
    // a set sideways distance from the line through both shafts. The run-time solver finds the arm angle again from the pin and this line alone.
    for (i = 0; i < N; i++) g.pts.push(this.design(2 * Math.PI * i / N).q);
    var area = 0, j; for (i = 0; i < N; i++) { j = (i + 1) % N; area += g.pts[i][0] * g.pts[j][1] - g.pts[j][0] * g.pts[i][1]; }
    var sg = area > 0 ? 1 : -1;
    function offset(dd) {                                                               // the middle line moved sideways by dd (positive outward)
      var out = [], k, a, b, nx, ny, l;
      for (k = 0; k < N; k++) { a = g.pts[(k + N - 1) % N]; b = g.pts[(k + 1) % N]; nx = (b[1] - a[1]) * sg; ny = -(b[0] - a[0]) * sg; l = Math.hypot(nx, ny); out.push(new T.Vector2(g.pts[k][0] + dd * nx / l, g.pts[k][1] + dd * ny / l)); }
      return out;
    }
    function slab(shape, z0, depth, material) {
      var m = P.mesh(new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false }), material); m.position.z = z0; return m;
    }
    // disc, shaft and pin (disc z -12..-2, shaft z -40..-6)
    o.disc = new T.Group(); scene.add(o.disc);
    P.at(P.cylZ(100, 10, c.mat("disc")), 0, 0, -7, o.disc);                             // disc z -12..-2
    P.at(P.cylZ(10, 34, c.mat("disc")), 0, 0, -23, o.disc);                             // shaft z -40..-6, ends on the bearing face at -40
    P.at(P.box(90, 6, 1.6, c.mat("disc", "dark")), 45, 0, -1.2, o.disc);                // stripe x 0..90, z -2..-0.4
    o.pin = P.at(P.cylZ(6, 12, c.mat("pin", "mark")), RC, 0, 3, o.disc);                // pin z -3..9: starts inside the disc, tip below the arm's front face at 12
    // arm: plate z 0..12 with the groove cut right through, the middle piece, a strap over the groove, neck and hub
    o.arm = new T.Group(); o.arm.position.set(D, 0, 0); scene.add(o.arm);
    var mA = c.mat("arm"), ring = new T.Shape(offset(HW + RING)), hole = new T.Path(offset(HW));
    ring.holes.push(hole);
    o.arm.add(slab(ring, 0, 12, mA));                                                    // ring z 0..12, groove wall 7.5 from the middle line, outer edge 19.5
    o.arm.add(slab(new T.Shape(offset(-HW)), 0, 12, mA));                                // middle piece z 0..12
    var neck = new T.Shape(); neck.moveTo(-70, -10); neck.lineTo(0, -9); neck.lineTo(0, 9); neck.lineTo(-70, 10);
    o.arm.add(slab(neck, 2, 8, mA));                                                     // neck z 2..10, inside the ring thickness so no faces meet
    P.at(P.box(30, 14, 4, mA), -85, 0, 14, o.arm);                                       // strap x -100..-70, z 12..16, over the groove where the pin comes closest to the shaft
    P.at(P.cylZ(16, 16, mA), 0, 0, 7, o.arm);                                            // hub z -1..15
    P.at(P.cylZ(7, 43, mA), 0, 0, -18.5, o.arm);                                         // arm shaft z -40..3, ends on the bearing face at -40
    // supports
    P.at(P.box(60, 174, 10, c.fixed), 0, -63, -45, scene);                               // disc bearing x -30..30, y -150..24, z -50..-40
    P.at(P.box(60, 174, 10, c.fixed), D, -63, -45, scene);                               // arm bearing x 115..175, y -150..24, z -50..-40
    P.at(P.box(320, 12, 100, c.fixed), 30, -156, -20, scene);                            // base x -130..190, y -162..-150, z -70..30
  },

  // Sideways distance of the pin from the line through both shafts, as the arm sees it, for a disc angle th.
  // Chosen to be a little squarer than a sine so that the groove has two long sides and two round ends.
  design: function (th) {
    var g = this.o.g, px = g.rc * Math.cos(th) - g.d, py = g.rc * Math.sin(th), Dd = Math.hypot(px, py);
    var t = g.w * Math.sin(th) * (1 + g.b * Math.cos(th) * Math.cos(th));
    var phi = Math.atan2(-g.rc * Math.sin(th), g.d - g.rc * Math.cos(th)) + Math.asin(t / Dd), c = Math.cos(-phi), s = Math.sin(-phi);
    return { phi: phi, q: [px * c - py * s, px * s + py * c] };
  },
  // signed distance from a point (arm frame) to the groove's middle line: negative inside the loop, zero on it
  sdist: function (x, y) {
    var pts = this.o.g.pts, n = pts.length, best = 1e9, inside = false, i, a, b, ex, ey, t, dx, dy, dd;
    for (i = 0; i < n; i++) {
      a = pts[i]; b = pts[(i + 1) % n]; ex = b[0] - a[0]; ey = b[1] - a[1];
      t = ((x - a[0]) * ex + (y - a[1]) * ey) / (ex * ex + ey * ey); t = t < 0 ? 0 : t > 1 ? 1 : t;
      dx = x - a[0] - t * ex; dy = y - a[1] - t * ey; dd = dx * dx + dy * dy; if (dd < best) best = dd;
      if ((a[1] > y) !== (b[1] > y) && x < a[0] + (y - a[1]) * ex / ey) inside = !inside;
    }
    return (inside ? -1 : 1) * Math.sqrt(best);
  },
  F: function (phi, th) {
    var g = this.o.g, px = g.rc * Math.cos(th) - g.d, py = g.rc * Math.sin(th), c = Math.cos(-phi), s = Math.sin(-phi);
    return this.sdist(px * c - py * s, px * s + py * c);
  },
  // arm angle that puts the pin on the groove's middle line, the root nearest `guess` (so the motion stays continuous)
  solve: function (th, g) {
    var n = 30, h = 0.008, p0 = g - n / 2 * h, f0 = this.F(p0, th), best = null, bm = 1e9, bp = g, i, p, f1, A, B, fa, k, m, fm, r, lo, hi, m1, m2;
    for (i = 1; i <= n; i++) {
      p = p0 + i * h; f1 = this.F(p, th);
      if (f0 * f1 <= 0) {
        A = p - h; B = p; fa = f0;
        for (k = 0; k < 24; k++) { m = (A + B) / 2; fm = this.F(m, th); if (fa * fm <= 0) B = m; else { A = m; fa = fm; } }
        r = (A + B) / 2; if (best === null || Math.abs(r - g) < Math.abs(best - g)) best = r;
      }
      if (Math.abs(f1) < bm) { bm = Math.abs(f1); bp = p; }
      f0 = f1;
    }
    if (best !== null) return best;
    lo = bp - h; hi = bp + h;                                                            // where the pin only just touches the line, take the closest approach
    for (k = 0; k < 24; k++) { m1 = lo + (hi - lo) / 3; m2 = hi - (hi - lo) / 3; if (Math.abs(this.F(m1, th)) < Math.abs(this.F(m2, th))) hi = m2; else lo = m1; }
    return (lo + hi) / 2;
  },

  step: function (c, dt, S) {
    var o = this.o, th0 = 0.3;
    o.a += S.w * dt;
    o.disc.rotation.z = th0 + o.a;
    if (o.phi === null) o.phi = this.design(th0).phi;
    o.phi = this.solve(th0 + o.a, o.phi);
    o.arm.rotation.z = o.phi;
    var v = Math.round(o.phi * 180 / Math.PI);
    S.set("a", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + "°");
  }
});
