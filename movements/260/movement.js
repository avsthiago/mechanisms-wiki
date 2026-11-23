M507.define({
  number: 260,
  title: "Differential screw drive",
  lede: "A screw and its nut are both turned, each by its own gear, in the same direction. If they turn equally fast the screw stays put. When one turns a little faster, the screw creeps along very slowly and with great force.",
  alt: "A long thin pinion on a top shaft drives a big gear on a lower shaft. A smaller pinion on the same top shaft drives a second big gear. A screw runs from the first gear through the hub of the second gear and through a short stand.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving shaft", note: "The top shaft with two small gears, called pinions. The long pinion turns the screw gear and the short one turns the nut gear." },
    { key: "dw", color: "#C8873A", name: "Screw gear", note: "Fixed to the screw, so the two turn together. It slides along the long pinion as the screw moves." },
    { key: "screw", color: "#8E7AA8", name: "Screw", note: "Turns with the screw gear and runs through the nut. Watch it creep in or out of the short stand." },
    { key: "ew", color: "#4FA58A", name: "Nut gear", note: "Its hub is the nut. It turns in the short stand but cannot move sideways." }
  ],
  controls: [{ id: "set", label: "Gear speeds", value: "far", options: [["same", "Equal"], ["near", "Nearly equal"], ["far", "Far apart"]] }],
  speed: { min: 10, max: 120, value: 60, label: "Driving shaft" },
  readouts: [{ id: "d", label: "Screw gear" }, { id: "e", label: "Nut gear" }, { id: "x", label: "Screw" }],
  views: { "3d": [360, 250, 640], front: [10, 10, 600], side: [620, 20, 0] },
  target: [10, 10, 0],
  how: [
    "The top shaft turns both big gears the same way. One gear holds the screw. The other gear holds the nut, so the nut spins round the screw.",
    "A screw only moves through its nut when one turns faster than the other. If both turn equally fast, they turn together like one piece and the screw stays where it is. If the nut gains a little each turn, the screw moves by that little bit. So the screw moves by the difference in speed, not by the speed itself.",
    "Try Equal and the screw stays still while everything spins. Then try Nearly equal and Far apart, and compare how fast the screw creeps."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, tooth counts and thread spacing were made up. The base and the bracket at the back that holds the right end of the top shaft were added; Brown leaves that end loose. A screw can only go so far, so the model turns the driving shaft the other way at each end of its travel.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 4, YA = 120, LEAD = 6;
    var o = this.o = { th: 0, dir: 1, xs: 0, LEAD: LEAD, sets: {} };
    function gear(key, n, w, parent, x, stripe) {     // gear on a shaft along X; turns with its parent group's rotation.x
      var h = new T.Group(); h.rotation.y = Math.PI / 2; h.position.x = x; parent.add(h);   // local Z is world X
      var g = P.spurGear({ teeth: n, module: MD, width: w, material: c.mat(key) }); h.add(g);
      if (stripe) { var rf = g.pitchRadius - 1.25 * MD; P.at(P.box(rf - 19, 4, 1, c.mat(key, "dark")), 16 + (rf - 19) / 2, 0, -w / 2 - .5, h); }   // r 16..rf-3, 0.5 off the left face
      h.N = n; h.pitch = g.pitch; return h;
    }
    // driving shaft: x -164..114, y 120
    o.A = new T.Group(); o.A.position.y = YA; scene.add(o.A);
    P.at(P.cylX(4, 278, c.mat("drive")), -25, 0, 0, o.A);                      // x -164..114, ends on the bracket's right face
    o.B = gear("drive", 12, 20, o.A, 56);                                      // short pinion x 46..66, r 24
    [["same", 12, 48], ["near", 11, 49], ["far", 8, 52]].forEach(function (s) {
      var F = gear("drive", s[1], 130, o.A, -59);                              // long pinion x -124..6
      o.sets[s[0]] = { F: F, nF: s[1], nD: s[2] };                             // pinion + wheel = 60 teeth, centres 120 apart
    });
    // screw wheel, plain shaft and screw: slide by xs and turn together (screw x -22..180 at the start)
    o.low = new T.Group(); scene.add(o.low);
    o.lowSpin = new T.Group(); o.low.add(o.lowSpin);
    P.at(P.cylX(10, 122, c.mat("dw")), -103, 0, 0, o.lowSpin);                 // plain shaft x -164..-42, on the wheel face
    for (var k in o.sets) o.sets[k].D = gear("dw", o.sets[k].nD, 20, o.lowSpin, -32, true);   // wheel x -42..-22
    o.screw = new T.Group(); o.low.add(o.screw);
    P.at(P.worm({ radius: 9, pitch: LEAD, length: 202, addendum: 2, dedendum: 2, material: c.mat("screw") }), 79, 0, 0, o.screw);   // x -22..180, tip r 11, root r 7
    // nut wheel: x 46..66, hub (the nut) x 66..95.5 turning in the short stand, collar x 91.5..95.5
    o.E = new T.Group(); scene.add(o.E);
    o.Eg = gear("ew", 48, 20, o.E, 56, true);
    P.at(P.cylX(16, 29.5, c.mat("ew")), 80.75, 0, 0, o.E);                     // hub r 16, x 66..95.5, in a hole of r 16.5
    P.at(P.cylX(20, 4, c.mat("ew")), 93.5, 0, 0, o.E);                         // collar x 91.5..95.5, 0.5 clear of the stand face

    // supports (all c.fixed); base top is y -115
    P.at(P.box(300, 10, 80, c.fixed), -20, -120, -10, scene);                  // base x -170..130, y -125..-115, z -50..30
    function bore(x, y, len, hgt, dep, hole) {                                  // block bored along X: x x-len/2..x+len/2, y y-hgt/2..y+hgt/2
      var b = P.guideBlock({ w: hgt, h: len, d: dep, hole: hole, material: c.fixed }); b.rotation.z = Math.PI / 2; return P.at(b, x, y, 0, scene);
    }
    // left upright x -150..-130, z -12..12, y -115..145, bored for both shafts
    P.at(P.box(20, 103, 24, c.fixed), -140, -63.5, 0, scene);                  // y -115..-12
    bore(-140, 0, 20, 24, 24, 10.5);                                            // y -12..12, plain shaft r 10 slides in it
    P.at(P.box(20, 96, 24, c.fixed), -140, 60, 0, scene);                      // y 12..108
    bore(-140, YA, 20, 24, 24, 4.5);                                            // y 108..132
    P.at(P.box(20, 13, 24, c.fixed), -140, 138.5, 0, scene);                   // y 132..145
    // short stand x 71..91, z -17..17: bored block y -20..20 on a post y -115..-20, web on the right
    bore(81, 0, 20, 40, 34, 16.5);
    P.at(P.box(20, 95, 34, c.fixed), 81, -67.5, 0, scene);                     // y -115..-20
    var sh = new T.Shape(); sh.moveTo(91, -40); sh.lineTo(91, -115); sh.lineTo(125, -115); sh.quadraticCurveTo(95, -100, 91, -40);
    var web = P.mesh(new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false }), c.fixed); web.position.z = -4; scene.add(web);   // x 91..125, z -4..4, below the screw (tip r 11)
    // bracket for the right end of the top shaft, set back behind the screw: post z -46..-34, arm z -34..-10, bearing z -10..10
    P.at(P.box(14, 245, 12, c.fixed), 107, 7.5, -40, scene);                   // post x 100..114, y -115..130
    P.at(P.box(14, 20, 24, c.fixed), 107, YA, -22, scene);                     // arm y 110..130, z -34..-10
    var bb = P.guideBlock({ w: 20, h: 14, d: 20, hole: 4.5, material: c.fixed }); bb.rotation.z = Math.PI / 2; P.at(bb, 107, YA, 0, scene);   // x 100..114, y 110..130, z -10..10
  },

  step: function (c, dt, S) {
    var o = this.o, cur = o.sets[S.controls.set] || o.sets.far, k, TAU = 2 * Math.PI;
    function mesh(th, n1, n2) { return Math.PI / 2 + (-Math.PI / 2 - th) * n1 / n2 - Math.PI / n2; }   // wheel below a pinion, teeth in mesh
    var d = o.dir * S.w * dt, th = o.th + d;
    var dD = -d * cur.nF / cur.nD, dE = -d * 12 / 48;                          // both wheels turn against the shaft
    var xs = o.xs + o.LEAD * (dD - dE) / TAU;                                  // right-hand screw: it moves by the difference of turning
    if (xs > 20 || xs < -70) o.dir = -o.dir; else { o.th = th; o.xs = xs; }
    for (k in o.sets) { var s = o.sets[k]; s.F.visible = s.D.visible = s === cur; }
    var thD = mesh(o.th, cur.nF, cur.nD), thE = mesh(o.th, 12, 48);
    o.A.rotation.x = o.th;
    o.lowSpin.rotation.x = thD;
    o.E.rotation.x = thE;
    o.low.position.x = o.xs;
    o.screw.rotation.x = thE + TAU * o.xs / o.LEAD;                            // thread stays in step with the nut
    var rpm = S.playing ? S.rpm * o.dir : 0;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("d", f(-rpm * cur.nF / cur.nD));
    S.set("e", f(-rpm / 4));
    var v = Math.round(o.LEAD * rpm * (1 / 4 - cur.nF / cur.nD));            // mm per minute
    S.set("x", (v < 0 ? "−" + -v : (v > 0 ? "+" : "") + v) + " mm/min");
  }
});
