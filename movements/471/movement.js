M507.define({
  number: 471,
  title: "Hotchkiss's air hammer",
  lede: "A crank moves a cylinder up and down. The hammer hangs from a piston inside it, held by nothing but trapped air. The air acts like a spring, so the hammer is flung down harder than the crank alone could push it.",
  alt: "A tall narrow frame with a rounded top. Inside, a short cylinder slides up and down between the sides, moved by a rod from a crank behind. A rod from a piston in the cylinder carries a hammer head down over an anvil on the base.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank and shaft", note: "Turned by the engine. It drives everything else." },
    { key: "cyl", color: "#4FA58A", name: "Cylinder", note: "Slides up and down between the sides of the frame. It is cut open at the front so you can see the piston and the air." },
    { key: "ham", color: "#C8873A", name: "Piston and hammer", note: "Nothing ties it to the cylinder. It is held only by the air above and below the piston. The hammer head is on the end of its rod." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "Joins the crank to the back of the cylinder." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "Watch it go round. It sets where the cylinder is, but not where the hammer is." }
  ],
  speed: { min: 5, max: 40, value: 30, label: "Crank speed", unit: " rpm" },
  controls: [],
  readouts: [{ id: "lo", label: "Air below" }, { id: "hi", label: "Air above" }, { id: "bl", label: "Last blow" }],
  closed: { label: "Cylinder" },
  views: { "3d": [361, 217, 775], front: [0, 20, 880], side: [880, 20, 0] },
  target: [0, 20, 0],
  how: [
    "The crank lifts and lowers the cylinder. The hammer is not tied to it. A small hole in the middle of the cylinder wall lets air in, and the piston shuts it off as it slides past.",
    "When the cylinder goes up, the air under the piston is squeezed and lifts the hammer like a spring. When the cylinder comes down fast, the hammer lags behind, so the air above the piston is squeezed hard. Just after the crank passes the bottom, that air springs back and throws the hammer onto the anvil.",
    "Try a slow crank: the hammer just rides along and lands softly. Then try a fast one, and watch the air above the piston and the speed of the blow. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The cylinder is cut open at the front. The bearing behind for the crank shaft, the base, the anvil and all sizes were made up. The motion is worked out from the weight of the hammer and the push of the air on each side of the piston, squeezed as air is in a pump. It is slowed down and the air spring is set to suit the slow speed. The blue dots show the air: denser where it is squeezed.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed;
    var o = this.o = { th: Math.PI / 2, yc: 142, yp: 142, vp: 0, mu: 20, ml: 20, pu: 1, pl: 1, blow: 0, tb: 9, YA: -115, D: 210 };
    // frame: arch y 181..241, cheeks x 40..60 down to y -10, then flaring to the base top y -170; all z -30..30
    P.at(P.annulus({ rIn: 40, rOut: 60, depth: 60, z0: -30, from: 0, to: Math.PI, material: fx }), 0, 181, 0, scene);
    var ch = [[-60, 181], [-40, 181], [-40, -17], [-75, -170], [-130, -170], [-60, -10]];
    scene.add(P.prism(ch, -30, 30, fx));
    scene.add(P.prism(ch.map(function (p) { return [-p[0], p[1]]; }).reverse(), -30, 30, fx));
    P.at(P.box(290, 30, 150, fx), 0, -185, -35, scene);                         // base x -145..145, y -200..-170, z -110..40
    P.at(P.box(66, 55, 60, fx), 0, -142.5, 0, scene);                            // anvil y -170..-115
    var br = P.bearingBlock({ bore: 6.5, outer: 14, drop: 180, width: 14, material: fx }); P.at(br, 0, 10, -93, scene);   // foot at y -170, z -100..-86
    // crank behind, in the plane z -55..-40
    o.crank = P.at(new T.Group(), 0, 10, 0, scene);
    P.at(P.cylZ(6, 45, c.mat("crank")), 0, 0, -77.5, o.crank);                   // shaft z -100..-55
    P.at(P.cylZ(40, 5, c.mat("crank")), 0, 0, -52.5, o.crank);                   // disc z -55..-50
    P.at(P.box(26, 4, 1, c.mat("crank", "dark")), -20, 0, -49.5, o.crank);      // stripe on the disc face
    P.at(P.cylZ(4, 10, c.mat("pin")), 30, 0, -45, o.crank);                      // pin z -50..-40
    o.rod = P.at(P.rod(4, c.mat("rod")), 0, 0, 0, scene);
    // cylinder, cut open at the front: outer r 38, bore 33, inside y -27..27 about its centre
    o.cyl = P.at(new T.Group(), 0, 0, 0, scene);
    o.cyl.add(c.shell(P.halfSection({ poly: [[5.5, -32], [38, -32], [38, 32], [0, 32], [0, 27], [33, 27], [33, -27], [5.5, -27]], material: c.mat("cyl") }), "open"));
    o.cyl.add(c.shell(P.wholeSection({ poly: [[5.5, -32], [38, -32], [38, 32], [0, 32], [0, 27], [33, 27], [33, -27], [5.5, -27]], material: c.mat("cyl") }), "closed"));   // closed view: the whole cylinder
    P.at(P.box(12, 12, 13, c.mat("cyl")), 0, -30, -43.5, o.cyl);                 // lug for the rod, z -50..-37
    var hole = P.cylX(3, 1.5, c.mat("cyl", "dark")); hole.rotation.y = -.32; P.at(hole, -38.3 * Math.cos(.32), 0, -38.3 * Math.sin(.32), o.cyl);   // the air hole, on the wall
    // piston and hammer, origin at the piston's centre
    o.ham = P.at(new T.Group(), 0, 0, 0, scene);
    o.ham.add(P.halfSection({ poly: [[0, -7], [32.5, -7], [32.5, 7], [0, 7]], material: c.mat("ham") }));
    P.at(P.cylY(5, 169, c.mat("ham")), 0, -91.5, 0, o.ham);                      // rod y -176..-7
    P.at(P.box(50, 34, 44, c.mat("ham")), 0, -193, 0, o.ham);                    // head y -210..-176
    P.at(P.box(51, 2, 45, c.mat("ham", "dark")), 0, -184, 0, o.ham);
    // air
    o.flow = P.steamFlow({ color: c.spot, light: true, count: 160, size: 2.2, z0: -12, z1: -2 }); scene.add(o.flow);
    var f = function (y, out) { out[0] = -31; out[1] = y; out[2] = 31; out[3] = y; };
    o.dLo = o.flow.domain({ density: .03, pad: 1.5, f: f }); o.dHi = o.flow.domain({ density: .03, pad: 1.5, f: f });
    o.bars = [0, 0]; o.kinds = [1]; o.ports = [0];
  },

  cy: function (t) { var x = 30 * Math.cos(t); return 10 + 30 * Math.sin(t) + Math.sqrt(72 * 72 - x * x) + 30; },

  step: function (c, dt, S) {
    var o = this.o, K = 570, g = 400, i, n, h;
    if (S.playing && dt > 0) {
      n = Math.ceil(dt * 600); h = dt / n;
      for (i = 0; i < n; i++) {
        o.tb += h; o.th += S.w * h; o.yc = this.cy(o.th);
        var hu = o.yc + 27 - (o.yp + 7), hl = (o.yp - 7) - (o.yc - 27);
        if (o.yp - o.yc >= 7) o.ml = hl;                                         // hole opens into the room below
        if (o.yp - o.yc <= -7) o.mu = hu;                                        // hole opens into the room above
        hu = Math.max(hu, .5); hl = Math.max(hl, .5);
        o.pu = Math.pow(o.mu / hu, 1.4); o.pl = Math.pow(o.ml / hl, 1.4);
        o.vp += (K * (o.pl - o.pu) - g) * h; o.yp += o.vp * h;
        if (o.yp < o.yc - 19) { o.yp = o.yc - 19; o.vp = Math.max(o.vp, 0); }
        if (o.yp > o.yc + 19) { o.yp = o.yc + 19; o.vp = Math.min(o.vp, 0); }
        if (o.yp - o.D < o.YA) {                                                 // on the anvil
          if (o.vp < -20 && o.tb * S.w > 2) o.blow = -o.vp;
          if (o.vp < -20) o.tb = 0;
          o.yp = o.YA + o.D; if (o.vp < 0) o.vp = -.15 * o.vp;
        }
      }
    }
    var yc = o.yc, yp = o.yp, px = 30 * Math.cos(o.th), py = 10 + 30 * Math.sin(o.th);
    o.crank.rotation.z = o.th;
    o.cyl.position.y = yc; o.ham.position.y = yp;
    o.rod.span(px, py, -45, 0, yc - 30, -45);
    var lowOpen = yp - yc >= 7, upOpen = yp - yc <= -7;
    o.bars[0] = yc - 27; o.bars[1] = yp - 7; o.kinds[0] = lowOpen ? 1 : 2; o.ports[0] = yc - 27; o.dLo.set(o.bars, o.kinds, o.ports, 1);
    o.bars[0] = yp + 7; o.bars[1] = yc + 27; o.kinds[0] = upOpen ? 1 : 2; o.ports[0] = yc + 27; o.dHi.set(o.bars, o.kinds, o.ports, 1);
    o.flow.update(Math.abs(S.w) * dt);
    S.set("lo", o.pl.toFixed(1) + " atm");
    S.set("hi", o.pu.toFixed(1) + " atm");
    S.set("bl", o.blow ? (o.blow / 100).toFixed(1) + " m/s" : "None yet");
  }
});
