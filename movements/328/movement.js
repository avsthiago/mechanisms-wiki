M507.define({
  number: 328,
  title: "Cartwright's parallel motion",
  lede: "Two equal toothed wheels turn opposite ways, each with a crank. Two rods hang from the cranks and hold the ends of a cross bar. The cross bar, and the piston rod under it, can only go straight up and down.",
  alt: "Two equal toothed wheels side by side on a cross beam, their teeth locked together. A short crank on each wheel points inwards. A rod hangs from each crank pin and the two rods spread out to the ends of a cross bar. A piston rod goes down from the middle of the bar into a cylinder. A large flywheel stands behind, turned by a small gear under the right wheel.",
  parts: [
    { key: "wheels", color: "#5E7387", name: "Gears and cranks", note: "Two gears of the same size, with the same number of teeth. Each has a crank, and the two cranks always point opposite ways, like mirror images." },
    { key: "fly", color: "#C8873A", name: "Flywheel", note: "A heavy wheel behind, on the shaft of the small gear. It keeps the wheels turning smoothly past the top and bottom of the stroke." },
    { key: "rods", color: "#D9B13B", name: "Connecting rods", note: "Two bars, one from each crank pin to one end of the cross bar. They always lean by the same amount, in opposite directions." },
    { key: "cross", color: "#8E7AA8", name: "Cross bar", note: "The bar at the top of the piston rod. Watch it stay level and slide straight up and down." },
    { key: "piston", color: "#4FA58A", name: "Piston rod and piston", note: "Goes down from the middle of the cross bar into the cylinder. Steam pushes the piston up and down." }
  ],
  closed: { label: "Cylinder" },
  readouts: [{ id: "p", label: "Piston" }, { id: "l", label: "Rods lean" }],
  views: { "3d": [360, 190, 960], front: [20, 0, 1000], side: [1000, 0, -20] },
  target: [20, 0, 0],
  how: [
    "The two toothed wheels are locked together, so they turn at the same speed but opposite ways. Their cranks start as mirror images, one pointing left and one pointing right. So they stay mirror images all the way round.",
    "Each crank pulls a rod, and the rods hold the two ends of the cross bar. Because everything on the left copies everything on the right, the two rods always lean by the same amount, in opposite directions. Their sideways pulls cancel out. So the middle of the cross bar can only go straight up and down, and the piston rod is never bent.",
    "Watch the two rod readings. They are always the same number with opposite signs. Then pick the cross bar and watch it slide straight, while the crank pins go round in circles. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the cylinder only as its top cover; here it is drawn see-through so the piston shows. The posts under the cross beam, the bearings, the shaft and stand of the flywheel, the base, the tooth counts and all the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var MD = 5, N = 24, NP = 10, R = 50, L = 150, H = 55, YG = 130, XG = 60;
    var o = this.o = { th: -40 * Math.PI / 180, R: R, L: L, H: H, YG: YG, XG: XG, N: N, NP: NP, LP: 168 };
    var mw = c.mat("wheels");
    function windows(rIn, rOut, n, spoke) {          // spoke openings cut through a gear face
      var hs = [];
      for (var k = 0; k < n; k++) {
        var a1 = k * 2 * Math.PI / n + spoke / rIn / 2, a2 = (k + 1) * 2 * Math.PI / n - spoke / rIn / 2;
        var b1 = k * 2 * Math.PI / n + spoke / rOut / 2, b2 = (k + 1) * 2 * Math.PI / n - spoke / rOut / 2;
        var p = new T.Path(); p.absarc(0, 0, rOut, b2, b1, true); p.lineTo(rIn * Math.cos(a1), rIn * Math.sin(a1)); p.absarc(0, 0, rIn, a1, a2, false); p.closePath();
        hs.push(p);
      }
      return hs;
    }
    // the two wheels: gear z -28..-16, hub z -16..-12, shaft z -28..9 (ends at the crank's back face), crank arm and boss z 9..15,
    // crank pin z 15..27, cap z 27..29. Bearing on the beam z -8..8, so the shaft runs through it between the gear and the crank.
    function wheel(sx) {
      var g = new T.Group(); g.position.set(sx * XG, YG, 0); scene.add(g);
      var gear = P.spurGear({ teeth: N, module: MD, width: 12, holes: windows(14, 44, 4, 10), material: mw });
      var gg = new T.Group(); gg.add(gear); gg.position.z = -22; g.add(gg);
      P.at(P.cylZ(10, 4, mw), 0, 0, -14, g);                                   // hub z -16..-12
      P.at(P.cylZ(6, 37, mw), 0, 0, -9.5, g);                                  // shaft z -28..9
      P.at(P.cylZ(11, 6, mw), 0, 0, 12, g);                                    // crank boss z 9..15
      P.at(P.box(R, 12, 6, mw), R / 2, 0, 12, g);                              // crank arm x 0..R, z 9..15
      P.at(P.cylZ(8, 6, mw), R, 0, 12, g);                                     // crank end z 9..15
      P.at(P.cylZ(4, 12, mw), R, 0, 21, g);                                    // crank pin z 15..27
      P.at(P.cylZ(6, 2, c.mat("wheels", "dark")), R, 0, 28, g);                // cap z 27..29
      P.at(P.box(30, 4, 1, c.mat("wheels", "dark")), 27, 0, -15.5, gg);       // dark stripe on the gear's front face, z -16..-15
      return { g: g, gear: gg, pitch: gear.pitch };
    }
    o.left = wheel(-1); o.right = wheel(1);
    // small gear and flywheel on one shaft: centre 85 from the right wheel's centre, at -96 degrees, so the gears mesh
    o.alpha = -96 * Math.PI / 180;
    var cd = (N + NP) * MD / 2, FX = XG + cd * Math.cos(o.alpha), FY = YG + cd * Math.sin(o.alpha), mf = c.mat("fly");
    o.fly = new T.Group(); o.fly.position.set(FX, FY, 0); scene.add(o.fly);
    var pin = P.spurGear({ teeth: NP, module: MD, width: 12, material: mf }); o.pitchP = pin.pitch;
    P.at(pin, 0, 0, -22, o.fly);                                               // small gear z -28..-16
    P.at(P.cylZ(6, 64, mf), 0, 0, -48, o.fly);                                 // shaft z -80..-16, ends at the bearing face
    var fw = P.pulley({ radius: 165, width: 12, rim: 11, spokes: 6, hub: 16, material: mf });
    fw.spokes[0].material = c.mat("fly", "dark");
    P.at(fw, 0, 0, -50, o.fly);                                                // flywheel z -56..-44
    // rods, cross bar, piston
    var my = c.mat("rods");
    o.rodL = P.rod(3, my); o.rodR = P.rod(3, my); scene.add(o.rodL); scene.add(o.rodR);
    o.eyes = [];
    for (i = 0; i < 4; i++) o.eyes.push(P.at(P.cylZ(7, 6, my), 0, 0, 21, scene)); // rod eyes z 18..24
    var mx = c.mat("cross");
    o.cross = new T.Group(); scene.add(o.cross);
    P.at(P.box(2 * H, 8, 6, mx), 0, 0, 14, o.cross);                           // bar x -55..55, y -4..4, z 11..17
    [-H, H].forEach(function (x) {
      P.at(P.cylZ(7, 6, mx), x, 0, 14, o.cross);                               // bar ends z 11..17
      P.at(P.cylZ(4, 16, mx), x, 0, 19, o.cross);                              // pins z 11..27
      P.at(P.cylZ(6, 2, mx), x, 0, 28, o.cross);                               // caps z 27..29
    });
    P.at(P.box(16, 12, 6, mx), 0, -6, 14, o.cross);                            // boss under the middle y -12..0
    var mp = c.mat("piston");
    P.at(P.cylY(5, o.LP - 12, mp), 0, -12 - (o.LP - 12) / 2, 14, o.cross);   // piston rod y -LP..-12
    P.at(P.cylY(29, 10, mp), 0, -o.LP, 14, o.cross);                           // piston, 10 thick, inside the bore of 32

    // supports. Base y -258..-246, x -200..230, z -100..60
    P.at(P.box(430, 12, 160, c.fixed), 15, -252, -20, scene);
    // cross beam x -190..190, y 70..100, z -8..8; posts x -190..-170 and 170..190, y -246..70, stand on the base and carry the beam
    P.at(P.box(380, 30, 16, c.fixed), 0, 85, 0, scene);
    P.at(P.box(20, 316, 16, c.fixed), -180, -88, 0, scene);
    P.at(P.box(20, 316, 16, c.fixed), 180, -88, 0, scene);
    // wheel bearings on the beam top: foot y 100, shaft axis y 130, z -8..8
    [-XG, XG].forEach(function (x) { P.at(P.bearingBlock({ bore: 6.5, outer: 14, width: 16, drop: 30, material: c.fixed }), x, YG, 0, scene); });
    // flywheel bearing: z -94..-80 (shaft ends at its front face z -80), foot on the base top y -246
    P.at(P.bearingBlock({ bore: 6.5, outer: 14, width: 14, drop: FY + 246, material: c.fixed }), FX, FY, -87, scene);
    // cylinder: open tube y -246..-131 on the base, radius 32, axis x 0, z 14; cover y -131..-125 with a hole; gland y -125..-111
    c.shell(P.at(P.mesh(new T.CylinderGeometry(32, 32, 115, 40, 1, true), c.fixed), 0, -188.5, 14, scene));
    c.shell(P.at(P.guideBlock({ w: 76, h: 6, d: 76, hole: 6, material: c.fixed }), 0, -128, 14, scene));
    c.shell(P.at(P.guideBlock({ w: 20, h: 14, d: 20, hole: 6, material: c.fixed }), 0, -118, 14, scene));
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.th += S.w * dt;
    var th = o.th, cs = Math.cos(th), sn = Math.sin(th);
    o.left.g.rotation.z = th;                                                  // a tooth of the left gear points at the mesh when th = 0
    o.right.g.rotation.z = Math.PI - th;                                       // mirror image: opposite way, same speed
    o.right.gear.rotation.z = o.right.pitch / 2;                               // half a tooth, so a gap faces the left wheel's tooth
    var a1 = Math.PI - th + o.right.pitch / 2;
    o.fly.rotation.z = -(o.N / o.NP) * (a1 - o.alpha) + o.alpha + Math.PI - o.pitchP / 2;
    var px = -o.XG + o.R * cs, py = o.YG + o.R * sn;                           // left crank pin; the right one is its mirror image
    var dx = -o.H - px, yc = py - Math.sqrt(o.L * o.L - dx * dx);
    o.cross.position.set(0, yc, 0);
    o.rodL.span(px, py, 21, -o.H, yc, 21); o.rodR.span(-px, py, 21, o.H, yc, 21);
    o.eyes[0].position.set(px, py, 21); o.eyes[1].position.set(-px, py, 21);
    o.eyes[2].position.set(-o.H, yc, 21); o.eyes[3].position.set(o.H, yc, 21);
    var lean = Math.round(Math.asin(dx / o.L) * 180 / Math.PI);
    function sg(v, u) { return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + u; }
    S.set("p", sg(Math.round(yc + 20), " mm"));
    S.set("l", Math.abs(Math.round(lean)) + "°");
  }
});
