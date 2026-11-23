M507.define({
  number: 137,
  title: "Expansion eccentric",
  lede: "A lumpy cam turns on a shaft between two small rollers. The rollers sit on a forked arm, so the arm is lifted and dropped as the cam goes round. A rod on the arm works the slide valve of a steam engine.",
  alt: "A lumpy disc on a shaft sits between two small wheels at the tips of a C-shaped arm. A long arm runs from the C to the right and ends in a ring, with a rod hanging down. A second rod hangs down from the lower wheel.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Cam on the shaft", note: "A lumpy disc fixed on the shaft. It is wider in some directions than others. The red peg marks one side. Watch it go round." },
    { key: "arm", color: "#C8873A", name: "Forked arm", note: "A C-shaped arm with a long arm out to the right. It can only move up and down, because the rods below it slide in guides." },
    { key: "rollers", color: "#D9B13B", name: "Rollers", note: "Two small wheels on the tips of the C. One rolls on top of the cam and one under it. They never let go of it." },
    { key: "rod", color: "#4FA58A", name: "Valve rod", note: "Hangs from the ring at the end of the long arm. In an engine it would move the slide valve up and down." }
  ],
  controls: [{ id: "a", label: "Cam shape", value: "5.5", options: [["1.5", "Gentle"], ["2.67", "Flat top"], ["5.5", "Bumpy"]] }],
  readouts: [{ id: "y", label: "Arm height" }, { id: "v", label: "Arm speed" }],
  views: { "3d": [420, 110, 760], front: [130, -70, 820], side: [900, -60, 0] },
  target: [130, -70, 0],
  how: [
    "The shaft turns the cam. The cam is not round, so it pushes on the two rollers as it goes by. Watch the red peg.",
    "One roller sits above the cam and one below. The gap between them is just as wide as the cam, so both rollers touch it all the way round. When the wide part swings up, it lifts the arm. When it swings down, the arm drops. The rods below slide in guides, so the arm goes straight up and down and never sideways.",
    "The lumps make the arm speed up and slow down as it goes. Try Gentle, Flat top and Bumpy, and watch the arm speed."
  ],
  note: "This model is rebuilt from Brown's drawing. The guides, the stand behind the shaft, the second rod under the lower roller, the base and the sizes were made up. Brown's valve rod runs off the edge of the drawing. The cam is shaped so that its width never changes, which keeps both rollers touching. The three cam shapes were added for comparison.",

  K: {
    R0: 55, E: 24, RR: 20,
    // roller-centre path in the cam's frame, in polar form; its radii at opposite angles add to a constant, so the rollers keep a fixed gap
    rho: function (f, a) { return 75 + 24 * Math.cos(f) - a * Math.cos(3 * f); },
    drho: function (f, a) { return -24 * Math.sin(f) + 3 * a * Math.sin(3 * f); },
    outline: function (f, a) {
      var r = this.rho(f, a), d = this.drho(f, a), c = Math.cos(f), s = Math.sin(f);
      var x = r * c, y = r * s, tx = d * c - r * s, ty = d * s + r * c, l = Math.hypot(tx, ty);
      return [x - this.RR * ty / l, y + this.RR * tx / l];                                   // centre minus roller radius along the outward normal
    }
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, R0 = K.R0, E = K.E, RR = K.RR, H = R0 + RR;
    var o = this.o = { a: 0, cams: {} };
    // shaft along z at the origin, cam z -8..8, hub z 8..12, shaft z -50..14
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(10, 64, c.mat("cam")), 0, 0, -18, o.rot);                                    // shaft z -50..14, ends on the bearing face at -50
    P.at(P.box(3, 16, 1, c.mat("cam", "dark")), 0, 0, 14.5, o.rot);                          // key mark on the shaft end, z 14..15
    P.at(P.cylZ(18, 4, c.mat("cam")), 0, 0, 10, o.rot);                                      // hub z 8..12
    ["1.5", "2.67", "5.5"].forEach(function (k) {
      var a = +k, g = new T.Group(), sh = new T.Shape(), i, n = 240;
      for (i = 0; i < n; i++) {                                                              // cam outline: the roller's path pulled in by the roller radius
        var q = K.outline(2 * Math.PI * i / n, a);
        if (i === 0) sh.moveTo(q[0], q[1]); else sh.lineTo(q[0], q[1]);
      }
      var geo = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false }); geo.translate(0, 0, -8);
      g.add(P.mesh(geo, c.mat("cam")));                                                      // cam z -8..8
      P.at(P.cylZ(3.5, 5, c.mat("cam", "mark")), 40, 0, 10.5, g);                            // red peg z 8..13
      o.rot.add(g); o.cams[k] = g;
    });
    // forked arm: plate z -22..-10, C opens to the left, long arm out to an eye at x 265
    o.arm = new T.Group(); scene.add(o.arm);
    var PI = Math.PI, sh2 = new T.Shape(), hole = new T.Path(), XE = 265;
    sh2.moveTo(0, 90); sh2.lineTo(70, 90); sh2.absarc(70, 30, 60, PI / 2, 0, true);
    sh2.lineTo(130, 14); sh2.lineTo(XE - 24.2, 14); sh2.absarc(XE, 0, 28, 5 * PI / 6, -5 * PI / 6, true); sh2.lineTo(130, -14);
    sh2.lineTo(130, -30); sh2.absarc(70, -30, 60, 0, -PI / 2, true); sh2.lineTo(0, -90);
    sh2.absarc(0, -75, 15, -PI / 2, -3 * PI / 2, true); sh2.lineTo(70, -60);
    sh2.absarc(70, -30, 30, -PI / 2, 0, false); sh2.lineTo(100, 30); sh2.absarc(70, 30, 30, 0, PI / 2, false);
    sh2.lineTo(0, 60); sh2.absarc(0, 75, 15, -PI / 2, -3 * PI / 2, true);
    hole.absarc(XE, 0, 11, 0, 2 * PI, false); sh2.holes.push(hole);
    var ag = new T.ExtrudeGeometry(sh2, { depth: 12, bevelEnabled: false, curveSegments: 32 }); ag.translate(0, 0, -22);
    o.arm.add(P.mesh(ag, c.mat("arm")));                                                     // plate z -22..-10, arms y 60..90 and -90..-60, wall x 100..130
    P.at(P.cylY(5.5, 105, c.mat("arm")), 0, -137.5, -16, o.arm);                             // tail y -190..-85, starts inside the lower tip
    // rollers: z -10..10, back face on the plate
    o.roll = [];
    [1, -1].forEach(function (s) {
      var g = new T.Group(); g.position.set(0, s * H, 0); o.arm.add(g);
      P.at(P.cylZ(RR, 20, c.mat("rollers")), 0, 0, 0, g);                                    // roller z -10..10
      P.at(P.box(3, 30, 1, c.mat("rollers", "dark")), 0, 0, 10.5, g);                        // spoke mark z 10..11
      P.at(P.cylZ(5, 2.5, c.mat("rollers", "dark")), 0, 0, 12.25, g);                        // pin head z 11..13.5
      o.roll.push(g);
    });
    // valve rod: pin through the eye, rod hanging down
    P.at(P.cylZ(10.5, 22, c.mat("rod")), XE, 0, -16, o.arm);                                 // pin z -27..-5
    P.at(P.cylZ(14, 3, c.mat("rod")), XE, 0, -3.5, o.arm);                                   // front head z -5..-2
    P.at(P.cylZ(14, 3, c.mat("rod")), XE, 0, -28.5, o.arm);                                  // back head z -30..-27
    P.at(P.cylY(5.5, 170, c.mat("rod")), XE, -105, -16, o.arm);                              // rod y -190..-20, starts inside the eye ring
    // supports: guides on a beam behind, posts, bearing, base
    [0, XE].forEach(function (x) {
      var b = P.guideBlock({ w: 24, h: 20, d: 24, hole: 6, material: c.fixed });
      P.at(b, x, -140, -16, scene);                                                          // guide y -150..-130, z -28..-4
      P.at(P.box(20, 71, 10, c.fixed), x, -189.5, -33, scene);                               // post y -225..-154, z -38..-28
    });
    P.at(P.box(325, 28, 10, c.fixed), 132.5, -140, -33, scene);                              // beam x -30..295, y -154..-126, z -38..-28, guides touch its front
    P.at(P.box(40, 250, 10, c.fixed), 0, -100, -55, scene);                                  // bearing x -20..20, y -225..25, z -60..-50; shaft ends on its face
    P.at(P.box(390, 12, 90, c.fixed), 135, -231, -25, scene);                                // base x -60..330, y -237..-225, z -70..20
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, R0 = K.R0, E = K.E, k = S.controls.a || "5.5", a = +k, kk;
    for (kk in o.cams) o.cams[kk].visible = kk === k;
    o.a += S.w * dt;
    var th = o.a;
    o.rot.rotation.z = th;
    var y = E * Math.sin(th) + a * Math.sin(3 * th);                                         // arm height from the cam's width in the upward direction
    var v = S.w * (E * Math.cos(th) + 3 * a * Math.cos(3 * th));
    o.arm.position.y = y;
    function wy(f) {                                                                         // world height of the contact point for roller angle f (cam frame)
      var q = K.outline(f, a);
      return q[0] * Math.sin(th) + q[1] * Math.cos(th);
    }
    var ru = -S.w * wy(Math.PI / 2 - th) / K.RR, rl = S.w * wy(-Math.PI / 2 - th) / K.RR;   // rolling without slipping
    o.roll[0].rotation.z += ru * dt; o.roll[1].rotation.z += rl * dt;
    var yy = Math.round(y), vv = Math.round(v);
    S.set("y", (yy < 0 ? "−" : yy > 0 ? "+" : "") + Math.abs(yy) + " mm");
    S.set("v", (vv < 0 ? "−" : vv > 0 ? "+" : "") + Math.abs(vv) + " mm/s");
  }
});
