M507.define({
  number: 122,
  title: "Two cranked gears and a bar",
  lede: "Two gears of different sizes turn together. A short pin on each gear pushes a rod, and both rods push one upright link. A bar joined to the middle of that link slides to and fro. Its strokes are not all the same length, because the two pins pull together at some moments and against each other at others.",
  alt: "A big toothed wheel above a smaller one, meshed together. Each has a pin near its edge. A rod runs from each pin to the ends of an upright link on the right. A bar fixed to the middle of the link sticks out to the right.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "The bigger gear, at the top. It turns the driven gear, and it has a pin near its edge that pushes a rod." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "The smaller gear. It turns faster and the other way. Its pin pushes the second rod. Watch the red stripe." },
    { key: "link", color: "#D9B13B", name: "Crank pins, connecting rods and link", note: "A crank pin on each gear drives a connecting rod. The two rods hold the ends of an upright link, which swings as they push." },
    { key: "bar", color: "#4FA58A", name: "Sliding bar", note: "It is joined to the middle of the link and can only slide sideways between two guides. The red band shows how far it has moved." }
  ],
  controls: [{ id: "wr", label: "Pin on the driven gear", value: "18", options: [["12", "Near the centre"], ["18", "Middle"], ["24", "Near the edge"]] }],
  readouts: [{ id: "up", label: "Driving gear" }, { id: "lo", label: "Driven gear" }, { id: "bar", label: "Bar" }],
  views: { "3d": [420, 130, 760], front: [100, -60, 840], side: [820, -60, 0] },
  target: [100, -60, 0],
  how: [
    "Turn the gears and the two pins go round in circles. Each pin pushes its rod, and the two rods swing the upright link. The bar joined to the link's middle cannot swing, so it slides to and fro.",
    "The gears are different sizes, so they do not turn together once for once. The pin on the driven gear gets a little ahead of the other pin each turn. The pins therefore meet in a new way each time, and the bar's strokes change in length. It takes several turns before the pattern repeats.",
    "Try the three places for the pin on the driven gear. Watch how the bar's strokes grow longer or shorter."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate behind the gears, the base, the guides for the bar, the tooth counts, the lengths of the rods and the link, and the thickness of every piece were made up. The pins were set closer to the centres than drawn, so that the rods never jam during a full turn. The choice of pin place was added to show what it changes.",

  K: { N1: 24, N2: 20, MD: 6, D: 137, L1: 140, L2: 108, RW1: 30 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, o = this.o = { a: 0, Mx: 128, psi: Math.PI / 2, rw: 18 };
    var g1 = P.spurGear({ teeth: K.N1, module: K.MD, material: c.mat("drive") });
    var g2 = P.spurGear({ teeth: K.N2, module: K.MD, material: c.mat("driven") });
    o.d = g1.pitchRadius + g2.pitchRadius;                                   // 132
    o.G2 = [34, -Math.sqrt(o.d * o.d - 34 * 34)];
    o.gam = Math.atan2(o.G2[1], o.G2[0]);
    o.b1 = 106 * Math.PI / 180;
    var r20 = o.gam + Math.PI - Math.PI / K.N2 + K.N1 * o.gam / K.N2;
    o.b2 = 101 * Math.PI / 180 - r20;
    // gears: z -8..8, shafts z -30..8 from the plate face, hubs z 8..12
    o.g1 = new T.Group(); scene.add(o.g1); o.g1.add(g1);
    o.g2 = new T.Group(); o.g2.position.set(o.G2[0], o.G2[1], 0); scene.add(o.g2); o.g2.add(g2);
    function gearBits(g, mk, hubR, rf, ang, key) {
      P.at(P.cylZ(6, 38, c.mat(key)), 0, 0, -11, g);                         // shaft z -30..8
      P.at(P.cylZ(hubR, 4, c.mat(key)), 0, 0, 10, g);                        // hub z 8..12
      var s = new T.Group(); s.rotation.z = ang; g.add(s);
      P.at(P.box(rf - hubR - 4, 5, 1, c.mat(key, mk)), hubR + 2 + (rf - hubR - 4) / 2, 0, 9, s);   // stripe z 8.5..9.5, lifted off the face
    }
    gearBits(o.g1, "dark", 12, g1.pitchRadius - 1.25 * K.MD, o.b1 + Math.PI, "drive");
    gearBits(o.g2, "mark", 10, g2.pitchRadius - 1.25 * K.MD, o.b2 + Math.PI, "driven");
    // wrist pins: collar z 8..14 on the gear face, pin up to z 34
    function wrist(g) {
      var w = new T.Group(); g.add(w);
      P.at(P.cylZ(8, 6, c.mat("link")), 0, 0, 11, w);                        // collar z 8..14
      P.at(P.cylZ(4.5, 20, c.mat("link")), 0, 0, 24, w);                     // pin z 14..34
      P.at(P.cylZ(7, 2, c.mat("link")), 0, 0, 33, w);                        // cap z 32..34
      return w;
    }
    o.w1 = wrist(o.g1); o.w2 = wrist(o.g2);
    // rods: z 26..32, pivot at the wrist, local +X points at the link end
    function rod(L) {
      var r = new T.Group(); scene.add(r);
      P.at(P.box(L, 12, 6, c.mat("link")), L / 2, 0, 29, r);                 // z 26..32
      P.at(P.cylZ(8, 6, c.mat("link")), 0, 0, 29, r);
      P.at(P.cylZ(8, 6, c.mat("link")), L, 0, 29, r);
      return r;
    }
    o.r1 = rod(K.L1); o.r2 = rod(K.L2);
    // link: z 20..26, centre at the bar pivot, local +Y points up to the upper end
    o.link = new T.Group(); scene.add(o.link);
    P.at(P.box(14, K.D, 6, c.mat("link")), 0, 0, 23, o.link);                // x +-7, y +-68.5, z 20..26
    P.at(P.cylZ(9, 6, c.mat("link")), 0, K.D / 2, 23, o.link);
    P.at(P.cylZ(9, 6, c.mat("link")), 0, -K.D / 2, 23, o.link);
    // pins through link end, rod end: z 20..34
    [K.D / 2, -K.D / 2].forEach(function (y) {
      P.at(P.cylZ(4.5, 14, c.mat("link")), 0, y, 27, o.link);                // z 20..34
      P.at(P.cylZ(7, 2, c.mat("link")), 0, y, 33, o.link);                   // cap z 32..34
    });
    P.at(P.cylZ(4.5, 13, c.mat("link")), 0, 0, 26.5, o.link);                // centre pin z 20..33, ends inside the bar cap (32..34)
    // bar: z 26..32, y +-6, starts at the centre pin
    o.bar = new T.Group(); scene.add(o.bar);
    P.at(P.box(140, 12, 6, c.mat("bar")), 70, 0, 29, o.bar);                 // x 0..140
    P.at(P.cylZ(8, 6, c.mat("bar")), 0, 0, 29, o.bar);
    P.at(P.cylZ(7, 2, c.mat("bar")), 0, 0, 33, o.bar);                       // cap z 32..34
    P.at(P.box(10, 13, 7, c.mat("bar", "mark")), 70, 0, 29, o.bar);          // band y +-6.5, z 25.5..32.5, lifted off every face
    // guides for the bar, between which it slides: bars y 6..20 and -20..-6, z 24..34 (face to face with the bar at y +-6)
    P.at(P.box(80, 14, 10, c.fixed), 222, 13, 29, scene);                    // x 182..262, y 6..20
    P.at(P.box(80, 14, 10, c.fixed), 222, -13, 29, scene);                   // y -20..-6
    P.at(P.box(20, 210, 10, c.fixed), 252, -125, 29, scene);                 // post x 242..262, y -230..-20, under the lower guide
    // plate behind the gears; shafts end at its face z -30
    P.at(P.box(300, 330, 10, c.fixed), 30, -65, -35, scene);                 // x -120..180, y -230..100, z -40..-30
    P.at(P.box(420, 12, 100, c.fixed), 80, -236, -10, scene);                // base x -130..290, y -242..-230, z -60..40
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, i;
    o.a += S.w * dt;
    var rw2 = +(S.controls.wr || 18);
    var r1 = o.a, r2 = o.gam + Math.PI - Math.PI / K.N2 + K.N1 * (o.gam - r1) / K.N2;
    o.g1.rotation.z = r1; o.g2.rotation.z = r2;
    var a1 = o.b1, a2 = o.b2;
    o.w1.position.set(K.RW1 * Math.cos(a1), K.RW1 * Math.sin(a1), 0);
    o.w2.position.set(rw2 * Math.cos(a2), rw2 * Math.sin(a2), 0);
    var W1 = [K.RW1 * Math.cos(r1 + a1), K.RW1 * Math.sin(r1 + a1)];
    var W2 = [o.G2[0] + rw2 * Math.cos(r2 + a2), o.G2[1] + rw2 * Math.sin(r2 + a2)];
    // link: centre (Mx, 0) on the bar's line, tilt psi; its ends A (up) and B (down) must sit at rod length from the wrist pins
    var D = K.D, h = D / 2;
    function F(x, p) {
      var cs = Math.cos(p), sn = Math.sin(p);
      return [Math.hypot(x + h * cs - W1[0], h * sn - W1[1]) - K.L1, Math.hypot(x - h * cs - W2[0], -h * sn - W2[1]) - K.L2];
    }
    var x = o.Mx, p = o.psi, ok = false;
    for (i = 0; i < 40; i++) {
      var f = F(x, p), e = 1e-5, fx = F(x + e, p), fp = F(x, p + e);
      var a11 = (fx[0] - f[0]) / e, a12 = (fp[0] - f[0]) / e, a21 = (fx[1] - f[1]) / e, a22 = (fp[1] - f[1]) / e, det = a11 * a22 - a12 * a21;
      if (Math.abs(det) < 1e-9) break;
      var dx = (f[0] * a22 - f[1] * a12) / det, dp = (a11 * f[1] - a21 * f[0]) / det;
      x -= dx; p -= dp;
      if (Math.abs(dx) + Math.abs(dp) < 1e-9) { ok = true; break; }
    }
    if (ok) { o.Mx = x; o.psi = p; } else { x = o.Mx; p = o.psi; }
    var cs = Math.cos(p), sn = Math.sin(p);
    var A = [x + h * cs, h * sn], B = [x - h * cs, -h * sn];
    o.link.position.set(x, 0, 0); o.link.rotation.z = p - Math.PI / 2;
    o.bar.position.set(x, 0, 0);
    o.r1.position.set(W1[0], W1[1], 0); o.r1.rotation.z = Math.atan2(A[1] - W1[1], A[0] - W1[0]);
    o.r2.position.set(W2[0], W2[1], 0); o.r2.rotation.z = Math.atan2(B[1] - W2[1], B[0] - W2[0]);
    function f1(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("up", f1(rpm));
    S.set("lo", f1(rpm === 0 ? 0 : -rpm * K.N1 / K.N2));
    var m = Math.round(x - 122);
    S.set("bar", (m < 0 ? "−" + -m : m > 0 ? "+" + m : "0") + " mm");
  }
});
