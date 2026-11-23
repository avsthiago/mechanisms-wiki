M507.define({
  number: 130,
  title: "Plate shears",
  lede: "A pair of jaws cuts iron plate like giant scissors. A turning cam lifts the long arm to shut the jaws. The heavy arm then falls and opens them again, ready for the next cut.",
  alt: "A pair of long-nosed jaws on a low iron frame. The upper jaw has a very long arm that points left and rests on a round wheel. The wheel turns on a shaft set a little off its centre, so it lifts the arm and the jaws at the right open and close.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Cam wheel", note: "A round wheel that turns on a shaft set off its centre. This makes it a cam. Watch the red stripe to see it turn." },
    { key: "jaw", color: "#C8873A", name: "Upper jaw", note: "A blade at the right and a very long arm at the left, joined at a pin. When the arm goes up, the blade goes down." },
    { key: "frame", color: "#4FA58A", name: "Lower jaw", note: "The fixed blade, held on the pin. The upper jaw shuts against it and cuts what lies between." }
  ],
  controls: [{ id: "throw", label: "Cam off-centre by", value: "big", options: [["big", "A lot"], ["mid", "Some"], ["small", "A little"]] }],
  readouts: [{ id: "gap", label: "Jaw gap" }, { id: "cuts", label: "Cuts" }],
  views: { front: [-40, -30, 620], "3d": [150, 80, 440], side: [560, -30, 0] },
  target: [-40, -30, 0],
  how: [
    "The cam wheel turns. Its shaft is not in the middle of the wheel, so the top of the wheel rises and falls as it turns. The long arm rests on top of the wheel and goes up and down with it.",
    "The arm and the jaws rock on one pin, like a seesaw. When the arm goes up, the blade at the other end goes down and shuts on the plate. When the wheel drops away, the heavy arm falls under its own weight. That opens the jaws. No spring is needed.",
    "Try the three settings of the cam, and watch the jaw gap. With the cam only a little off-centre, the arm does not rise far enough, and the jaws never close."
  ],
  note: "This model is rebuilt from Brown's drawing. The shape of the jaws, the frame, the pin and its side plates, the post that holds the cam's shaft and the size of the wheel were made up. The pin is placed on the cutting edge of the upper jaw, as in a pair of scissors. No plate is shown, so the jaws close fully. The arm falls freely under its own weight. The choice of how far the cam is off-centre was added to compare.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var PHI0 = 0.2415;                                      // opening of the jaws in Brown's drawing, rad
    var o = this.o = { phi: PHI0, v: 0, a: 0, turns: 0, cuts: 0, open: true, k: "big", wheels: {}, R: 36, S: [-171, -42], E: { big: 20, mid: 14, small: 8 }, PHI0: PHI0 };
    function loc(x, y) { var cs = Math.cos(PHI0), sn = Math.sin(PHI0); return [x * cs + y * sn, -x * sn + y * cs]; }   // drawn (open) pose to local
    // upper jaw: traced from the engraving in its open pose, turned back to the closed pose. Cutting edge passes through the pin.
    var tn = Math.tan(PHI0);
    var drawn = [[-216, -25], [12, -28], [24, -18], [39, 39 * tn], [126, 126 * tn], [126, 36], [111, 53], [87, 55], [39, 51], [9, 45], [-12, 36], [-27, 6], [-216, -20]];
    var sh = new T.Shape();
    drawn.forEach(function (p, i) { var q = loc(p[0], p[1]); sh[i ? "lineTo" : "moveTo"](q[0], q[1]); });
    var g = new T.ExtrudeGeometry(sh, { depth: 18, bevelEnabled: false }); g.translate(0, 0, -9);
    o.jaw = new T.Group(); scene.add(o.jaw);
    o.jaw.add(new T.Mesh(g, c.mat("jaw")));                                           // upper jaw z -9..9, pin at the origin
    P.at(P.cylZ(8, 20, c.mat("jaw", "dark")), 0, 0, 0, o.jaw);                         // pin head, z -10..10, ends at the cheek faces
    // underside of the long arm, in local coordinates, for the contact test
    o.under = [];
    var a0 = loc(-216, -25), a1 = loc(12, -28), n = 76, i;
    for (i = 0; i <= n; i++) o.under.push([a0[0] + (a1[0] - a0[0]) * i / n, a0[1] + (a1[1] - a0[1]) * i / n]);
    // lower jaw: fixed blade with its column down to the block
    var ls = new T.Shape(), lp = [[-26, -75], [-26, -36], [30, -36], [46, -14], [46, 0], [126, 0], [126, -6], [75, -10], [52, -28], [44, -52], [48, -75]];
    lp.forEach(function (p, j) { ls[j ? "lineTo" : "moveTo"](p[0], p[1]); });
    var lg = new T.ExtrudeGeometry(ls, { depth: 20, bevelEnabled: false }); lg.translate(0, 0, -10);
    scene.add(new T.Mesh(lg, c.mat("frame")));                                         // lower jaw z -10..10, y -75..0, stands on the block top y -75
    // cam wheels, one for each offset
    ["big", "mid", "small"].forEach(function (k) {
      var e = o.E[k], grp = new T.Group(); grp.position.set(o.S[0], o.S[1], 0); scene.add(grp);
      P.at(P.cylZ(o.R, 18, c.mat("cam")), e, 0, 0, grp);                               // wheel z -9..9
      P.at(P.cylZ(5, 36, c.mat("cam")), 0, 0, -4, grp);                                // shaft z -22..14, from the post face
      P.at(P.cylZ(9, 4, c.mat("cam")), 0, 0, 11, grp);                                 // collar z 9..13, on the wheel face
      var st = P.box(24, 5, 1, c.mat("cam", "mark"));                                  // red stripe along the line through the wheel's centre
      st.position.set(e + o.R - 16, 0, 10); grp.add(st);                               // z 9.5..10.5, lifted off the face
      o.wheels[k] = grp;
    });
    // supports
    P.at(P.box(420, 12, 90, c.fixed), -40, -116, -5, scene);                           // ground x -250..170, y -122..-110, z -50..40
    P.at(P.box(299, 35, 60, c.fixed), 20.5, -92.5, 0, scene);                          // block x -129..170, y -110..-75, z -30..30
    P.at(P.box(30, 77, 10, c.fixed), -171, -71.5, -27, scene);                         // shaft post x -186..-156, y -110..-33, z -32..-22; shaft ends at z -22
    [-13, 13].forEach(function (z) {
      P.at(P.box(52, 89, 6, c.fixed), 0, -30.5, z, scene);                             // pin plates x -26..26, y -75..14, z 10..16 and -16..-10; stand on the block top y -75
    });
    // start as drawn: the cam at its lowest, the arm resting on it
    var best = -1, bestA = 0, q;
    for (q = 0; q < 6.2832; q += 0.01) { var t = this.cam(o, "big", q); if (t > best) { best = t; bestA = q; } }
    o.a = o.a0 = bestA; o.phi = best;
  },

  // Largest opening (rad) that keeps the arm's underside clear of the wheel. Pushing past a closed jaw (0) is not allowed.
  cam: function (o, k, a) {
    var e = o.E[k], cx = o.S[0] + e * Math.cos(-a), cy = o.S[1] + e * Math.sin(-a), R2 = o.R * o.R, u = o.under, m = u.length;
    function hit(phi) {
      var cs = Math.cos(phi), sn = Math.sin(phi), j, x, y, dx, dy;
      for (j = 0; j < m; j++) {
        x = u[j][0] * cs - u[j][1] * sn; y = u[j][0] * sn + u[j][1] * cs; dx = x - cx; dy = y - cy;
        if (dx * dx + dy * dy < R2) return true;
      }
      return false;
    }
    if (hit(0)) return 0;
    var lo = 0, hi = 0.02, mid, it;                                   // the first opening at which the arm meets the wheel
    while (!hit(hi)) { lo = hi; hi += 0.02; if (hi > 0.4) return 0.4; }
    for (it = 0; it < 22; it++) { mid = (lo + hi) / 2; if (hit(mid)) hi = mid; else lo = mid; }
    return lo;
  },

  step: function (c, dt, S) {
    var o = this.o, k = S.controls.throw || "big", h, n, G = 2.5;     // G: fall of the arm under its weight, rad/s²
    if (k !== o.k) { o.k = k; o.turns = 0; o.cuts = 0; o.a = o.a0; o.phi = this.cam(o, k, o.a); o.v = 0; o.open = true; }
    for (h in o.wheels) o.wheels[h].visible = h === k;
    if (S.playing && dt > 0) {
      dt = Math.min(dt, 0.05); n = Math.max(1, Math.ceil(dt / 0.004));
      for (var i = 0; i < n; i++) {
        var e = dt / n, p0 = o.phi, pc;
        o.a += S.w * e; o.turns += S.w * e / (2 * Math.PI);
        pc = this.cam(o, k, o.a);
        o.v += G * e; o.phi += o.v * e;
        if (o.phi >= pc) { o.phi = pc; o.v = (pc - p0) / e; }          // resting on the cam: the arm moves with it
        if (o.phi <= 0) { o.phi = 0; if (o.v < 0) o.v = 0; }
        if (o.phi < 0.01 && o.open) { o.open = false; o.cuts++; }
        if (o.phi > 0.1) o.open = true;
      }
    }
    o.jaw.rotation.z = o.phi;
    o.wheels[k].rotation.z = -o.a;
    S.set("gap", Math.round(126 * Math.sin(o.phi)) + " mm");
    S.set("cuts", String(o.cuts));
  }
});
