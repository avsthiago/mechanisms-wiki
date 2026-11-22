M507.define({
  number: 89,
  title: "Eccentric",
  lede: "A round disc is fixed on a shaft, but set off its centre. This is called an eccentric. As the shaft turns, the disc wobbles round and pushes a rod to and fro. Steam engines used this to open and close their valves.",
  alt: "A round disc on a shaft, set off-centre, turns inside a ring clamped round it in two halves bolted together. A rod bolted to the ring runs to the right, to a small block that slides between two rails.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Eccentric disc", note: "A round disc fixed on the shaft away from its centre. The red peg marks the centre of the disc. Watch it circle round the shaft." },
    { key: "strap", color: "#C8873A", name: "Strap", note: "A ring in two halves, bolted together round the disc. The disc turns inside it, so the strap only shifts and tilts." },
    { key: "rod", color: "#D9B13B", name: "Eccentric rod", note: "Bolted to the strap, so the two move as one piece. It tilts a little as the disc goes round." },
    { key: "valve", color: "#4FA58A", name: "Slide and valve rod", note: "A block that slides between two fixed rails, with a straight rod on the far side. In an engine this rod would work the valve." }
  ],
  controls: [{ id: "e", label: "Offset of the disc", value: "37.5", options: [["18", "Small"], ["28", "Middle"], ["37.5", "As drawn"]] }],
  readouts: [{ id: "x", label: "Rod travel" }, { id: "a", label: "Rod tilt" }],
  views: { "3d": [250, 160, 620], front: [0, 0, 880], side: [880, 0, 0] },
  target: [30, -10, 0],
  how: [
    "The shaft turns, and the disc turns with it. The disc is not centred on the shaft, so its centre swings round in a small circle. Watch the red peg.",
    "The strap fits round the disc like a loose collar. It cannot turn, because the rod holds it, so it just follows the centre of the disc. When the peg is on the right, the rod is pushed out. When it is on the left, the rod is pulled back. It works like a crank, but the shaft can pass straight through.",
    "The rod travels twice as far as the disc's centre sits from the shaft. Try Small, then As drawn, and watch the travel and the tilt grow."
  ],
  note: "This model is rebuilt from Brown's drawing. The rails and the sliding block at the end of the rod, the bearing behind the shaft, the base and the sizes were made up. Brown's rod runs off the edge of the drawing. The smaller offsets were added for comparison.",

  K: { X0: -125, L: 190, R: 60, TH0: 22.7 * Math.PI / 180 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, XM = K.X0 + K.L;
    var o = this.o = { a: 0, discs: {} };
    function hex(r, len, m) { var g = new T.CylinderGeometry(r, r, len, 6); g.rotateZ(Math.PI / 2); return P.mesh(g, m); }   // nut, axis X
    // shaft (z -60 bearing face .. 20) and one disc for each offset; disc front at z 13, hub front at 16
    o.rot = new T.Group(); o.rot.position.set(K.X0, 0, 0); scene.add(o.rot);
    P.at(P.cylZ(12.5, 80, c.mat("disc")), 0, 0, -20, o.rot);                                 // shaft z -60..20
    P.at(P.box(3, 20, 1, c.mat("disc", "dark")), 0, 0, 20.5, o.rot);                         // key mark on the shaft end, z 20..21
    P.at(P.cylZ(22.5, 32, c.mat("disc")), 0, 0, 0, o.rot);                                   // hub z -16..16, its edge meets the disc rim as drawn
    ["18", "28", "37.5"].forEach(function (k) {
      var e = +k, g = new T.Group();
      P.at(P.cylZ(K.R - .4, 20, c.mat("disc")), e, 0, 0, g);                                 // core z -10..10, inside the strap
      P.at(P.cylZ(64, 3, c.mat("disc")), e, 0, 11.5, g);                                     // lips z 10..13 and -13..-10 hold the strap on
      P.at(P.cylZ(64, 3, c.mat("disc")), e, 0, -11.5, g);
      P.at(P.cylZ(3.5, 5, c.mat("disc", "mark")), e, 0, 15.5, g);                            // red peg at the disc's centre, z 13..18
      o.rot.add(g); o.discs[k] = g;
    });
    // strap: two half rings split at local x = 0 (0.5 gap each side), lugs top and bottom with bolts along X
    o.strap = new T.Group(); scene.add(o.strap);
    [1, -1].forEach(function (s) {
      var sh = new T.Shape();
      sh.absarc(s * .5, 0, 72.5, -Math.PI / 2, Math.PI / 2, s < 0); sh.absarc(s * .5, 0, 60, Math.PI / 2, -Math.PI / 2, s > 0);
      var geo = new T.ExtrudeGeometry(sh, { depth: 20, bevelEnabled: false, curveSegments: 40 }); geo.translate(0, 0, -10);
      o.strap.add(P.mesh(geo, c.mat("strap")));                                              // half ring r 60..72.5, z -10..10
      [1, -1].forEach(function (u) {
        P.at(P.box(28.5, 13, 20, c.mat("strap")), s * 15.25, u * 68.5, 0, o.strap);          // lug x 1..29.5, y 62..75 (above the bore)
        P.at(hex(6, 6, c.mat("strap", "dark")), s * 32.5, u * 68.5, 0, o.strap);             // nut x 29.5..35.5 on the lug face
      });
    });
    [1, -1].forEach(function (u) { P.at(P.cylX(3.2, 76, c.mat("strap", "dark")), 0, u * 68.5, 0, o.strap); });   // bolts x -38..38
    // eccentric rod, bolted to the strap with a flange; local +X points at the pin
    P.at(P.cylX(8, 26, c.mat("rod")), 82, 0, 0, o.strap);                                    // neck x 69..95, from inside the ring to the flange
    P.at(P.box(6, 70, 24, c.mat("strap")), 98, 0, 0, o.strap);                               // strap's flange x 95..101
    P.at(P.box(6, 70, 24, c.mat("rod")), 104.5, 0, 0, o.strap);                              // rod's flange x 101.5..107.5
    [1, -1].forEach(function (u) {
      P.at(P.cylX(3, 26, c.mat("rod", "dark")), 101, u * 26, 0, o.strap);                     // bolt x 88..114
      P.at(hex(5.5, 5, c.mat("rod", "dark")), 92.5, u * 26, 0, o.strap);                      // nuts x 90..95 and 107.5..112.5
      P.at(hex(5.5, 5, c.mat("rod", "dark")), 110, u * 26, 0, o.strap);
    });
    P.at(P.cylX(7, K.L - 10 - 107.5, c.mat("rod")), (107.5 + K.L - 10) / 2, 0, 0, o.strap);  // rod x 107.5..L-10
    P.at(P.cylZ(10, 14, c.mat("rod")), K.L, 0, 0, o.strap);                                  // eye z -7..7 round the pin
    // slide block, pin and valve rod
    o.slide = new T.Group(); scene.add(o.slide);
    P.at(P.box(30, 20, 11.5, c.mat("valve")), 0, 0, -13.75, o.slide);                        // block x -15..15, y -10..10, z -19.5..-8
    P.at(P.cylZ(3, 18, c.mat("valve")), 0, 0, 1, o.slide);                                   // pin z -8..10, through the eye
    P.at(P.cylX(5, 125, c.mat("valve")), 77.5, 0, -13.75, o.slide);                          // valve rod x 15..140
    // supports
    P.at(P.box(120, 6.5, 12, c.fixed), XM, 13.75, -14, scene);                               // top rail y 10.5..17, z -20..-8, x XM-60..XM+60
    P.at(P.box(120, 6.5, 12, c.fixed), XM, -13.75, -14, scene);                              // bottom rail y -17..-10.5
    P.at(P.box(120, 80, 10, c.fixed), XM, 0, -25, scene);                                    // rail plate y -40..40, z -30..-20, rails on its face
    P.at(P.box(20, 90, 10, c.fixed), XM, -85, -25, scene);                                   // post y -130..-40 under the plate
    var bush = P.guideBlock({ w: 24, h: 20, d: 24, hole: 5.5, material: c.fixed }); bush.rotation.z = Math.PI / 2;
    P.at(bush, 150, 0, -13.75, scene);                                                       // guide x 140..160, y -12..12, z -25.75..-1.75
    P.at(P.box(20, 118, 24, c.fixed), 150, -71, -13.75, scene);                              // post y -130..-12 under the guide
    P.at(P.box(60, 160, 20, c.fixed), K.X0, -50, -70, scene);                                // bearing x -155..-95, y -130..30, z -80..-60; shaft ends on its face
    P.at(P.box(450, 12, 130, c.fixed), -30, -136, -25, scene);                               // base x -255..195, y -142..-130, z -90..40
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, k = S.controls.e || "37.5", e = +k, kk;
    for (kk in o.discs) o.discs[kk].visible = kk === k;
    o.a += S.w * dt;
    var th = K.TH0 + o.a, ex = K.X0 + e * Math.cos(th), ey = e * Math.sin(th);
    var px = ex + Math.sqrt(K.L * K.L - ey * ey), psi = Math.atan2(-ey, px - ex);   // pin runs on the line through the shaft
    o.rot.rotation.z = th;
    o.strap.position.set(ex, ey, 0); o.strap.rotation.z = psi;
    o.slide.position.x = px;
    function sg(v, u) { return (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v).toFixed(u === "°" ? 1 : 0) + (u === "°" ? "°" : " mm"); }
    var tr = Math.round(px - K.X0 - K.L), tl = Math.round(psi * 1800 / Math.PI) / 10;
    S.set("x", sg(tr, "mm")); S.set("a", sg(tl, "°"));
  }
});
