M507.define({
  number: 286,
  title: "Toe and lifter",
  lede: "A shaft rocks to and fro. A curved arm on it, called the toe, pushes up on a flat lifter fixed to an upright rod. The rod lifts a valve in a steam engine, then lets it drop as the toe swings back.",
  alt: "A curved arm on a round shaft reaches left under a long flat lifter. The lifter is fixed to an upright rod at the right, with a small valve on its lower end.",
  parts: [
    { key: "toe", color: "#5E7387", name: "Toe and rocking shaft", note: "A curved arm on a shaft that rocks to and fro. It does the driving. Its tip pushes the lifter up." },
    { key: "lifter", color: "#C8873A", name: "Lifter", note: "A long arm with a flat underside, fixed to the rod. The toe pushes on it." },
    { key: "rod", color: "#4FA58A", name: "Lifting rod", note: "An upright rod held by a guide, so it can only go up and down." },
    { key: "valve", color: "#D9B13B", name: "Valve", note: "A disc on the lower end of the rod. It closes the opening below it. Watch it lift clear." }
  ],
  controls: [{ type: "range", id: "a", label: "Rocking shaft swing", min: 6, max: 18, step: 1, value: 18, unit: " degrees",
    presets: [[8, "Small"], [13, "Medium"], [18, "Big"]] }],
  speed: { min: 1, max: 30, value: 8, label: "Rocking speed", unit: " swings/min" },
  readouts: [{ id: "a", label: "Rocking shaft" }, { id: "l", label: "Valve lifted" }, { id: "s", label: "Toe slides" }],
  views: { "3d": [325, 200, 600], front: [-40, 25, 600], side: [520, 40, 30] },
  target: [-45, 25, 0],
  how: [
    "The shaft turns a little way, and the curved toe turns with it. The tip of the toe rises and pushes on the flat underside of the lifter. The lifter, the rod and the valve all go up together.",
    "The tip of the toe moves along a curve, but the lifter can only go straight up. So the tip also slides sideways along the lifter as it lifts, a short way. The guide keeps the rod upright. When the shaft swings back, the weight of the valve brings the lifter down onto the toe again.",
    "Try a small swing of the rocking shaft, then a big one. Watch the valve lift off its seat. Compare how high it goes and how far the toe slides."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the toe, the lifter and the rod. The valve and its seat, the guide, the bearing, the base and all the sizes were made up. The weight of the valve is assumed to keep the lifter resting on the toe.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { th: 0, YL0: 58.5, RX: 38, NX: -172, NY: 53.5, NR: 5 };     // rest height of the lifter underside; rod axis x; nose circle of the toe
    // outline of the toe, hub at the origin (the nose circle is added as arc points)
    var up = [[-172, 58.5], [-120, 51], [-60, 41], [-20, 33], [0, 28]];            // upper edge, droops towards the hub
    var lo = [[-55, 7], [-105, 17], [-150, 33], [-170, 45]];                       // lower edge
    var nose = [];
    for (i = 0; i <= 12; i++) { var a = Math.PI / 2 + Math.PI * i / 12; nose.push([o.NX + o.NR * Math.cos(a), o.NY + o.NR * Math.sin(a)]); }   // from the top round the left to the bottom
    nose.shift();                                                                  // top point already in `up`
    o.outline = up.concat([[10, -10], [-10, -10]], lo, nose);
    o.upper = up;

    // supports. Base y -134..-126, z -36..20. Bearing for the rock-shaft stands on it. Back plate and guide carry the rod.
    P.at(P.box(120, 8, 56, c.fixed), 20, -130, -8, scene);                         // x -40..80
    P.at(P.bearingBlock({ bore: 16, outer: 26, width: 14, drop: 126, material: c.fixed }), 0, 0, -25, scene);   // z -32..-18, foot y -126
    P.at(P.box(44, 93, 6, c.fixed), 46, -79.5, -27, scene);                        // back plate x 24..68, y -126..-33, z -30..-24
    var gd = P.guideBlock({ w: 44, h: 25, d: 39, hole: 8.8, hx: -8, hz: 4.5, material: c.fixed });
    P.at(gd, 46, -45.5, -4.5, scene);                                              // x 24..68, y -58..-33, z -24..15; bore at x 38, z 0. Clear of the hub (lowest y -27.5 at x 0)
    var seat = P.guideBlock({ w: 44, h: 8, d: 39, hole: 10, hx: -8, hz: 4.5, material: c.fixed });
    P.at(seat, 46, -122, -4.5, scene);                                             // x 24..68, y -126..-118: a seat the valve closes on

    // rock-shaft and toe
    o.toe = new T.Group(); scene.add(o.toe);
    var mt = c.mat("toe"), sh = new T.Shape();
    o.outline.forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); }); sh.closePath();
    var gt = new T.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); gt.translate(0, 0, -7);   // toe plate z -7..7
    o.toe.add(P.mesh(gt, mt));
    P.at(P.cylZ(27.5, 24, mt), 0, 0, 0, o.toe);                                    // hub z -12..12
    P.at(P.cylZ(15, 47, mt), 0, 0, -9.5, o.toe);                                   // shaft z -33..14, through the bearing bore (radius 16)
    P.at(P.cylZ(10, .8, c.mat("toe", "light")), 0, 0, 14.4, o.toe);                // pale end of the shaft, z 14..14.8

    // lifter, rod and valve go up together
    o.lift = new T.Group(); o.lift.position.y = 0; scene.add(o.lift);
    var ml = c.mat("lifter"), ls = new T.Shape(), Y0 = o.YL0;
    [[-184, Y0], [19, Y0], [19, Y0 + 50], [-184, Y0 + 8]].forEach(function (p, k) { if (k) ls.lineTo(p[0], p[1]); else ls.moveTo(p[0], p[1]); });
    ls.closePath();
    var gl = new T.ExtrudeGeometry(ls, { depth: 18, bevelEnabled: false }); gl.translate(0, 0, -9);   // arm z -9..9
    o.lift.add(P.mesh(gl, ml));
    P.at(P.box(38, 52, 24, ml), o.RX, Y0 + 26, 0, o.lift);                         // boss x 19..57, y Y0..Y0+52, z -12..12
    P.at(P.cylY(8, 251, c.mat("rod")), o.RX, 14.5, 0, o.lift);                     // rod y -111..140
    P.at(P.cylY(16, 7, c.mat("valve", "mark")), o.RX, -114.5, 0, o.lift);          // valve disc y -118..-111, sits on the seat top
  },

  step: function (c, dt, S) {
    var o = this.o, amax = +S.controls.a * Math.PI / 180;
    o.th += S.w * dt;
    var al = amax * (1 - Math.cos(o.th)) / 2;                                      // rock-shaft turns clockwise by al
    var ca = Math.cos(al), sa = Math.sin(al);
    o.toe.rotation.z = -al;
    // the lifter underside rests on the highest point of the toe: nose circle, or any upper-edge point
    var best = o.NX * -sa + o.NY * ca + o.NR, bx = o.NX * ca + o.NY * sa;
    o.upper.forEach(function (p) { var y = -p[0] * sa + p[1] * ca; if (y > best + 1e-9) { best = y; bx = p[0] * ca + p[1] * sa; } });
    o.contactX = bx;
    var lift = Math.max(0, best - o.YL0);
    o.lift.position.y = lift;
    o.lastLift = lift;
    S.set("a", al * 180 / Math.PI < .05 ? "0°" : (al * 180 / Math.PI).toFixed(1) + "°");
    S.set("l", Math.round(lift) + " mm");
    S.set("s", Math.round(Math.abs(bx - o.NX)) + " mm");
  }
});
