M507.define({
  number: 120,
  title: "Toothed jaws",
  lede: "Two curved jaws swing on one pin, like tongs. Each jaw is moved by a toothed arm, and one small shaft turns both arms. Turning the shaft a little closes the jaws on whatever is between them, and they grip very hard.",
  alt: "Two curved jaws open upward like a C, joined at a round pin. Below the pin, a small toothed arm and a curved toothed rim face each other. A shaft with two small gears sits between them, one gear touching each. Red marks show the jaw tips.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Shaft and pinions", note: "One shaft carries two small gears, called pinions. One pinion touches each toothed arm, so one turn of the shaft moves both." },
    { key: "driven", color: "#C8873A", name: "Jaw with outside teeth", note: "The left jaw. Its arm has teeth on the outer edge, and the upper pinion pushes them. Watch the red tip." },
    { key: "out", color: "#4FA58A", name: "Jaw with inside teeth", note: "The right jaw. Its arm is a curved rim with teeth on the inner edge, and the lower pinion pushes them." },
    { key: "crank", color: "#D9B13B", name: "Handle", note: "Turns the shaft. In a real machine a hand lever or an engine would do this." }
  ],
  controls: [{ id: "work", label: "Between the jaws", value: "none", options: [["none", "Nothing"], ["rod", "Thin rod"], ["bar", "Thick bar"]] }],
  readouts: [{ id: "turns", label: "Shaft" }, { id: "gap", label: "Jaw gap" }],
  views: { "3d": [380, 130, 740], front: [0, -20, 760], side: [760, -20, 0] },
  target: [0, -30, 0],
  how: [
    "Turn the handle and the shaft turns both pinions. The upper pinion pushes the arm with outside teeth one way. The lower pinion pushes the rim with inside teeth the other way. So the two jaws swing towards each other.",
    "The pinions are small and the arms are big, so the shaft turns about four times for each turn of a jaw. Each jaw moves slowly but pushes with about four times the force of the handle. That is why the jaws grip so hard.",
    "Try Nothing, then Thin rod, then Thick bar. The jaws stop when they touch it, and the handle stops with them. Watch the gap and the shaft turns."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the two jaws, the two toothed arms and the shaft. The pin, the plate, the handle, the sizes and the number of teeth were made up. The two arms sit one behind the other so they do not touch. The shaft swings back and forth, because the arms only have a short run of teeth. The rod and the bar were added to show the jaws gripping.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, D = 135, RJ = 72, TH = 5, PSI = 130 * Math.PI / 180;
    var o = this.o = { phase: 0, a: 0, PSI: PSI, RJ: RJ, TH: TH };
    function band(sg, p0, p1, ri, ro, z0, z1, mat) {
      var sh = new T.Shape(), k, n = 24, ps, x, y;
      function pt(p, r) { return [-sg * r * Math.sin(p), RJ - r * Math.cos(p)]; }
      for (k = 0; k <= n; k++) { ps = p0 + (p1 - p0) * k / n; x = pt(ps, ro); if (k) sh.lineTo(x[0], x[1]); else sh.moveTo(x[0], x[1]); }
      for (k = n; k >= 0; k--) { ps = p0 + (p1 - p0) * k / n; x = pt(ps, ri); sh.lineTo(x[0], x[1]); }
      sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false });
      g.translate(0, 0, z0);
      return new T.Mesh(g, mat);
    }
    // left jaw and outside-toothed arm, layer z 4..20
    o.j1 = new T.Group(); scene.add(o.j1);
    o.j1.add(band(1, 0, PSI, RJ - TH, RJ + TH, 6, 18, c.mat("driven")));                    // jaw z 6..18
    o.j1.add(band(1, PSI - .35, PSI, RJ - TH + 1.5, RJ + TH - 1.5, 18.5, 19.5, c.mat("driven", "mark")));   // red tip z 18.5..19.5
    P.at(P.cylZ(15, 14, c.mat("driven")), 0, 0, 12, o.j1);                                   // boss z 5..19
    var sec = P.gearSector({ teeth: 36, module: MD, width: 16, fromDeg: -105, toDeg: -40, material: c.mat("driven") });
    sec.position.z = 12; o.j1.add(sec);                                                      // arm z 4..20
    // right jaw and inside-toothed rim, layer z -20..-4
    o.j2 = new T.Group(); scene.add(o.j2);
    o.j2.add(band(-1, 0, PSI, RJ - TH, RJ + TH, -18, -6, c.mat("out")));                      // jaw z -18..-6
    o.j2.add(band(-1, PSI - .35, PSI, RJ - TH + 1.5, RJ + TH - 1.5, -5.5, -4.5, c.mat("out", "mark")));    // red tip z -5.5..-4.5
    P.at(P.cylZ(15, 14, c.mat("out")), 0, 0, -12, o.j2);                                     // boss z -19..-5
    var ring = P.internalSector({ teeth: 60, module: MD, width: 16, rim: 8, fromDeg: -150, toDeg: -50, material: c.mat("out") });
    ring.position.z = -12; o.j2.add(ring);                                                   // rim z -20..-4
    [ring.startAngle, ring.endAngle].forEach(function (a) {
      var L = ring.outerRadius - 2 - 12, sp = P.box(L, 10, 10, c.mat("out"));                // spoke z -17..-7, r 12..outer-2
      sp.position.set((ring.outerRadius - 2 + 12) / 2 * Math.cos(a), (ring.outerRadius - 2 + 12) / 2 * Math.sin(a), -12);
      sp.rotation.z = a; o.j2.add(sp);
    });
    // pin through both jaws
    P.at(P.cylZ(6, 58, c.mat("drive")), 0, 0, -1, scene);                                    // z -30..28, starts at the plate face
    P.at(P.cylZ(10, 4, c.mat("drive")), 0, 0, 24, scene);                                    // head z 22..26 on the boss side
    // shaft with two pinions at y = -135
    o.sh = new T.Group(); o.sh.position.set(0, -D, 0); scene.add(o.sh);
    P.at(P.cylZ(7, 59.5, c.mat("drive")), 0, 0, -.25, o.sh);                                  // shaft z -30..29.5, short of the arm face
    P.at(P.cylZ(11, 8, c.mat("drive")), 0, 0, 0, o.sh);                                      // collar z -4..4, between the pinions
    o.p1 = P.spurGear({ teeth: 9, module: MD, width: 16, material: c.mat("drive") }); o.p1.position.z = 12; o.sh.add(o.p1);    // z 4..20
    o.p2 = P.spurGear({ teeth: 15, module: MD, width: 16, material: c.mat("drive") }); o.p2.position.z = -12; o.sh.add(o.p2);  // z -20..-4
    o.pp1 = o.p1.pitch; o.pp2 = o.p2.pitch;
    o.hg = new T.Group(); o.hg.position.set(0, -D, 0); scene.add(o.hg);
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 22, o.hg);                                     // hub z 20..24 on the pinion face
    P.at(P.box(52, 12, 6, c.mat("crank")), 22, 0, 27, o.hg);                                 // arm x -4..48, z 24..30, on the hub
    P.at(P.cylZ(5, 24, c.mat("crank")), 44, 0, 42, o.hg);                                    // handle z 30..54, on the arm face
    // work piece held by the jaws
    o.work = {};
    [["rod", 6], ["bar", 16]].forEach(function (w) {
      var m = P.cylZ(w[1], 40, c.mat("driven", "light")); m.position.set(0, 112, 0); m.visible = false; scene.add(m); o.work[w[0]] = { m: m, r: w[1] };   // z -20..20
    });
    // supports
    P.at(P.box(400, 375, 10, c.fixed), 0, -32.5, -35, scene);                                // plate x -200..200, y -220..155, z -40..-30
    P.at(P.box(440, 12, 100, c.fixed), 0, -226, -30, scene);                                 // base x -220..220, y -232..-220, z -80..20; plate stands on y -220

    // kinematics: jaws swing by s = a / 4 (pinion radius / arm pitch radius = 1/4), the same for both
    o.tip = function (s) {                                       // x of the left jaw tip after it swings closed by s
      return -RJ * Math.sin(PSI) * Math.cos(s) + (RJ - RJ * Math.cos(PSI)) * Math.sin(s);
    };
    o.hit = function (s, yc, r) {                                // does the work piece touch either jaw's inner edge?
      var k, ps, x, y, ri = RJ - TH, cs = Math.cos(s), sn = Math.sin(s);
      for (k = 0; k <= 60; k++) {
        ps = PSI * k / 60; x = -ri * Math.sin(ps); y = RJ - ri * Math.cos(ps);
        var X = x * cs + y * sn, Y = -x * sn + y * cs;
        if (Math.hypot(X, Y - yc) < r) return true;
      }
      return false;
    };
    function search(f) { var d; for (d = 0; d < 45; d += .05) if (f(d * Math.PI / 180)) return (d - .05) * Math.PI / 180; return 45 * Math.PI / 180; }
    o.stops = { none: search(function (s) { return -2 * o.tip(s) < 8; }) };
    ["rod", "bar"].forEach(function (k) { o.stops[k] = Math.min(o.stops.none, search(function (s) { return o.hit(s, 112, o.work[k].r); })); });
    o.stopLog = o.stops;
  },

  step: function (c, dt, S) {
    var o = this.o, k, sMax, s, a;
    o.phase += S.w * dt;
    var wk = S.controls.work || "none";
    for (k in o.work) o.work[k].m.visible = k === wk;
    sMax = o.stops[wk];
    // shaft swings from open to its limit and back; it stops where the jaws meet the work
    a = Math.min(4 * sMax, 4 * o.stops.none * (1 - Math.cos(o.phase)) / 2);
    s = a / 4;
    o.j1.rotation.z = -s; o.j2.rotation.z = s;
    // phase: tooth on the line of centres meets a gap on the pinion
    o.p1.rotation.z = Math.PI / 2 + o.pp1 / 2 + a;
    o.p2.rotation.z = -Math.PI / 2 + o.pp2 / 2 + a;
    o.hg.rotation.z = a;
    S.set("turns", (Math.round(a / (2 * Math.PI) * 100) / 100).toFixed(2) + " turns");
    S.set("gap", Math.max(0, Math.round(-2 * o.tip(s))) + " mm");
  }
});
