M507.define({
  number: 330,
  title: "Forked connecting rod",
  lede: "The piston rod is made longer, and its top end slides in a fixed guide above the cross-head. The guide keeps the rod straight. The connecting rod splits into a fork at its lower end, so the piston rod can pass between its two legs.",
  alt: "An upright piston rod rises from a cylinder through a fixed guide. A connecting rod from a small crank on a side shaft ends in a fork whose two legs go either side of the piston rod.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank", note: "A plate on the end of the shaft with a pin near its edge. The pin goes round in a circle." },
    { key: "rod", color: "#D9B13B", name: "Forked rod", note: "One bar at the top. At the bottom it splits into two legs that go either side of the piston rod." },
    { key: "head", color: "#8E7AA8", name: "Cross-head", note: "A small block on the piston rod. A pin through it holds the two legs of the fork." },
    { key: "pistonrod", color: "#C8873A", name: "Piston rod", note: "Runs from the piston up through the guide. Watch it stay upright while the forked rod above it swings." },
    { key: "piston", color: "#4FA58A", name: "Piston", note: "A disc inside the cylinder. Steam pushes it up and down." }
  ],
  controls: [{ type: "range", id: "r", label: "Crank throw", min: 14, max: 36, step: 1, value: 26, unit: " mm",
    presets: [[14, "Short"], [26, "Medium"], [36, "Long"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "p", label: "Piston rod" }, { id: "t", label: "Fork leans" }, { id: "s", label: "Stroke" }],
  views: { "3d": [420, 160, 720], front: [30, 20, 820], side: [760, 20, 0] },
  target: [30, 20, 0],
  how: [
    "The crank pin goes round and pulls the forked rod up and down. The rod also swings to and fro, towards you and away from you. Left alone, that swing would push the piston rod sideways.",
    "The piston rod runs through a guide fixed to the frame, above the fork. The guide holds the top of the rod in line with the cylinder, so the rod can only go up and down. The two legs of the fork pass either side of the guide, so nothing touches.",
    "Try a short throw, then a long one. With the long throw the fork swings further, but the piston rod stays upright. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank turns across the picture, so the rod swings towards and away from you. Brown also shows a cylinder hanging on the right; it does nothing here and is left out. The cylinder, its cover, the base, the arm that holds the guide and all the sizes were made up. The arm runs behind the fork so the legs can swing past it. The cylinder is see-through so the piston can be seen.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { ph: 3.0, YS: 190, L: 190, LF: 130, XC: 24 };
    var YS = o.YS, L = o.L, LF = o.LF;
    // base slab x -50..100, y -190..-180, z -50..40. Pillar stands on it, cylinder tube on it.
    P.at(P.box(150, 10, 90, c.fixed), 25, -185, -5, scene);
    // pillar x 55..80, y -180..177, z -40..25; shaft block on top y 177..203, same x and z
    P.at(P.box(25, 357, 65, c.fixed), 67.5, -1.5, -7.5, scene);
    var sb = P.guideBlock({ w: 26, h: 25, d: 65, hole: 7, hz: 7.5, material: c.fixed }); sb.rotation.z = Math.PI / 2;
    P.at(sb, 67.5, YS, -7.5, scene);
    // cylinder: tube y -180..-80, radius 36; cover y -80..-70, x -40..40, z -40..40, rod hole
    c.shell(P.at(P.mesh(new T.CylinderGeometry(36, 36, 100, 40, 1, true), c.fixed), 0, -130, 0, scene));
    c.shell(P.at(P.guideBlock({ w: 80, h: 10, d: 80, hole: 6, material: c.fixed }), 0, -75, 0, scene));
    // guide: x -12..12, y 60..80, z -14..14. Strut behind it z -36..-14. Arm x 12..55 meets the pillar face x 55, z -36..-28.
    P.at(P.guideBlock({ w: 24, h: 20, d: 28, hole: 6, material: c.fixed }), 0, 70, 0, scene);
    P.at(P.box(24, 20, 22, c.fixed), 0, 70, -25, scene);
    P.at(P.box(43, 20, 8, c.fixed), 33.5, 70, -32, scene);

    // crank at x 24: plate x 21.5..26.5, hub x 20.5..27.5, shaft x 24..95
    var mc = c.mat("crank"), cr = o.crank = new T.Group(); cr.position.set(o.XC, YS, 0); scene.add(cr);
    P.at(P.cylX(6, 71, mc), 35.5, 0, 0, cr);
    P.at(P.cylX(12, 7, mc), 0, 0, 0, cr);
    o.arm = P.at(P.box(5, 1, 14, mc), 0, 0, 0, cr);
    o.cpin = P.at(P.cylX(4, 30, mc), -15, 0, 0, cr);                              // x -6..24

    // forked rod, hung from the crank pin; local -Y runs along the rod
    var mr = c.mat("rod"), g = o.fork = new T.Group(); scene.add(g);
    P.at(P.cylX(7, 8, mr), 0, 0, 0, g);                                           // eye x -4..4
    P.at(P.cylY(3.5, L - LF, mr), 0, -(L - LF) / 2, 0, g);                        // stem
    P.at(P.cylX(2.5, 39, mr), 0, -(L - LF), 0, g);                                // top of the loop x -19.5..19.5
    [-1, 1].forEach(function (s) { P.at(P.cylY(2.5, LF, mr), s * 17, -(L - LF) - LF / 2, 0, g); });   // legs x +-17, inner faces +-14.5
    P.at(P.cylX(3.5, 44, mr), 0, -L, 0, g);                                       // cross pin x -22..22

    // piston rod, prolonged upward: y -122..106 from the cross-head
    var pr = o.pist = new T.Group(); scene.add(pr);
    P.at(P.cylY(5, 228, c.mat("pistonrod", "mark")), 0, -8, 0, pr);
    P.at(P.box(16, 16, 16, c.mat("head")), 0, 0, 0, pr);                          // block x -8..8
    P.at(P.cylY(34, 8, c.mat("piston")), 0, -122, 0, pr);
  },

  step: function (c, dt, S) {
    var o = this.o, r = +S.controls.r;
    o.ph += S.w * dt;
    var py = o.YS + r * Math.cos(o.ph), pz = r * Math.sin(o.ph);
    var yc = py - Math.sqrt(o.L * o.L - pz * pz);
    o.crank.rotation.x = o.ph;
    o.arm.position.y = r / 2; o.arm.scale.y = r; o.cpin.position.y = r;
    o.pist.position.y = yc;
    var dy = yc - py, dz = -pz;
    o.fork.position.set(0, py, pz);
    o.fork.rotation.x = Math.atan2(-dz, -dy);
    function sg(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " mm"; }
    S.set("p", sg(yc - (o.YS - o.L)));
    S.set("t", Math.round(Math.asin(pz / o.L) * 180 / Math.PI) + "°");
    S.set("s", Math.round(2 * r) + " mm");
  }
});
