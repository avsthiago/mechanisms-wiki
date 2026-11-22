M507.define({
  number: 334,
  title: "Rack and segment parallel motion",
  lede: "A straight row of teeth, called a rack, is fixed to the piston rod. It meshes with a curved row of teeth on the rocking beam. As the beam rocks, it rolls the rack straight up and down, with no sideways swing at all.",
  alt: "A slanting beam on a pin at the right, with a large curved row of teeth at its left end. The teeth mesh with an upright rack that has a roller pressing on its back. A chain on a curved arch in the middle of the beam holds up a pump rod. The rack's lower end goes into a see-through cylinder.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam", note: "Rocks on a pin near its right end. It carries the toothed segment and the curved arch." },
    { key: "segment", color: "#8E7AA8", name: "Toothed segment", note: "A curved row of teeth, part of a big gear centred on the beam's pin. It rolls the rack up and down." },
    { key: "rack", color: "#C8873A", name: "Rack and piston rod", note: "A straight row of teeth on top of the piston rod. Watch its red trace: a straight line." },
    { key: "roller", color: "#4FA58A", name: "Roller", note: "Turns on a fixed pin behind the rack. It holds the rack against the teeth of the segment." },
    { key: "chain", color: "#D9B13B", name: "Chain and pump rod", note: "A chain lies on the curved arch and holds up the pump rod. It winds off the arch as the beam rocks, so the rod hangs straight." }
  ],
  controls: [{ type: "range", id: "swing", label: "Beam swing", min: 10, max: 25, step: 1, value: 20, unit: "°",
    presets: [[10, "Short"], [20, "Usual"], [25, "Long"]] }],
  readouts: [{ id: "beam", label: "Beam" }, { id: "rack", label: "Rack" }, { id: "pump", label: "Pump rod" }],
  closed: { label: "Cylinder" },
  views: { "3d": [300, 90, 600], front: [0, -55, 790], side: [790, -55, 0] },
  target: [0, -55, 0],
  how: [
    "Watch the curved row of teeth on the beam. It rolls along the straight rack like a wheel rolling along a track. The rack, and the piston rod below it, move straight up and down. Their red trace is a perfect line.",
    "The teeth push sideways on the rack as well as along it. A roller presses on the back of the rack and takes that push, so the rack stays in mesh. The curved arch in the middle of the beam does the same job for the pump rod with a chain that winds on and off it.",
    "The pump rod hangs closer to the beam's pin than the rack, so it moves a shorter way. Try a short swing and a long one, and compare how far each rod moves. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown marks the arch but does not say what hangs from it; here it holds a pump rod on a chain. The cylinder, the floor, the legs under the cross beam, the post under the beam's pin and the bracket for the roller were added. The tooth size was chosen to suit the drawing. The drawing shows the beam at the top of its swing. It is rocked steadily, as the engine would rock it.",

  // Units: cm (the engraving at 0.42 per pixel). F is the beam's pin. The segment has pitch radius R (80 teeth of
  // module 4), so the rack's pitch line is at x = F.x - R and the rack moves down R * th when the beam turns th.
  // The arch has radius RD; its chain hangs on the tangent at x = F.x - RD and the pump rod moves down RD * th.
  F: [81.06, -32.76], R: 160, RD: 68.5, Y0: -57.89, S0: 20, A0: 125,

  build: function (c) {
    var T = c.THREE, P = c.P, self = this, F = this.F, R = this.R, RD = this.RD, fx = c.fixed, o = this.o = { ph: 0, amp: -1 }, i;
    function annulus(rIn, rOut, y0, y1, m) { return P.mesh(new T.LatheGeometry([new T.Vector2(rIn, y0), new T.Vector2(rOut, y0), new T.Vector2(rOut, y1), new T.Vector2(rIn, y1), new T.Vector2(rIn, y0)], 64), m); }
    var XP = F[0] - R, XR = XP - 9.5;                     // rack pitch line, middle of the rack body (root -5, back -14 from the pitch line)

    // frame: cross beam x -126..121, y -69.3..-50.4, z -30..-8 (behind the rack); legs x -126..-120 and 115..121 down to the floor
    var FLOOR = -233, BT = -50.4;
    P.at(P.box(330, 12, 90, fx), -5, FLOOR - 6, -5, c.scene);                   // floor y -245..-233
    P.at(P.box(247, 18.9, 22, fx), -2.5, -59.85, -19, c.scene);
    P.at(P.box(6, -69.3 - FLOOR, 22, fx), -123, (FLOOR - 69.3) / 2, -19, c.scene);
    P.at(P.box(6, -69.3 - FLOOR, 22, fx), 118, (FLOOR - 69.3) / 2, -19, c.scene);
    // post under the beam's pin on the cross beam top: z -20..-8; pin z -20..7
    P.at(P.bearingBlock({ bore: 4.4, outer: 9, post: 15, width: 12, drop: F[1] - BT, material: fx }), F[0], F[1], -14, c.scene);
    // cylinder on the floor, axis x = XR: bottom cover -233..-229, wall r 28..30 from -232.5 up to -137.5, top cover -143..-137 (r 4.6..29, set into the wall), gland -137..-131
    c.shell(P.at(P.cylY(30, 4, fx), XR, -231, 0, c.scene));
    c.shell(P.at(annulus(28, 30, -232.5, -137.5, fx), XR, 0, 0, c.scene));
    c.shell(P.at(annulus(4.6, 29, -143, -137, fx), XR, 0, 0, c.scene));
    c.shell(P.at(annulus(4.6, 9, -137, -131, fx), XR, 0, 0, c.scene));
    // roller behind the rack: centre x = rack back (XP - 14) - r, bracket on the cross beam z -14..-8, pin z -14..7
    var RR = 14.7, RX = XP - 14 - RR, RY = -35.2;
    P.at(P.bearingBlock({ bore: 3.4, outer: 6, post: 10, width: 6, drop: RY - BT, material: fx }), RX, RY, -11, c.scene);
    o.roller = new T.Group(); P.at(o.roller, RX, RY, 0, c.scene);
    P.at(P.cylZ(RR, 12, c.mat("roller")), 0, 0, 0, o.roller);                   // z -6..6
    P.at(P.cylZ(3, 21, c.mat("roller", "dark")), 0, 0, -3.5, o.roller);
    P.at(P.box(2, RR - 5, 1, c.mat("roller", "dark")), 0, (RR + 3) / 2, 6.5, o.roller);   // stripe z 6..7, lifted off the face

    // beam group about the pin F; drawn pose at angle 0. Beam plate z -5.5..5.5, braces and strap z -4..4
    o.beam = new T.Group(); P.at(o.beam, F[0], F[1], 0, c.scene);
    var bm = c.mat("beam");
    o.beam.add(P.outlinePlate({ points: [[-120.96, 51.66], [44.94, -5.04], [44.94, 22.26], [-120.96, 76.86]], depth: 11, z0: -5.5, material: bm }));
    function bar(p, q, w, m) { var dx = q[0] - p[0], dy = q[1] - p[1], b = P.box(Math.hypot(dx, dy), w, 8, m); b.position.set((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0); b.rotation.z = Math.atan2(dy, dx); o.beam.add(b); }
    function pol(r, deg) { var a = deg * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; }
    bar(pol(150, 183), [-120.96, 72], 7, bm);              // braces from the segment's lower end to the beam
    bar(pol(150, 183), [-68.5, 32], 7, bm);
    bar(pol(150, 133), [-110.5, 72], 7, bm);               // from the segment's upper end down to the beam
    bar([0, 0], [13.44, 36.96], 10, bm);                   // strap from the pin up into the beam
    P.at(P.cylZ(9, 10, bm), 0, 0, 0, o.beam);              // boss z -5..5
    P.at(P.cylZ(4, 27, c.mat("beam", "dark")), 0, 0, -6.5, o.beam);   // pin z -20..7, ends at the post's back face

    // toothed segment: teeth of module 4 on pitch radius R from 133 to 183 degrees, band down to radius 145; z -6..6
    var md = 4, st = 2 * Math.PI / 80, rf = R - 1.25 * md, ra = R + md, pts = [];
    for (i = Math.ceil(133 * Math.PI / 180 / st); i <= Math.floor(183 * Math.PI / 180 / st); i++) {
      var a = i * st; [[rf, -.27], [ra, -.11], [ra, .11], [rf, .27]].forEach(function (q) { pts.push([q[0] * Math.cos(a + q[1] * st), q[0] * Math.sin(a + q[1] * st)]); });
    }
    for (i = 0; i <= 24; i++) pts.push(pol(145, 185 - i * 54 / 24));
    o.beam.add(P.outlinePlate({ points: pts, depth: 12, z0: -6, material: c.mat("segment") }));

    // arch head: band from radius 56 to 67 between 122 and 194 degrees, z 5.5..11.5 against the beam's front face
    var ap = [];
    for (i = 0; i <= 24; i++) ap.push(pol(67, 122 + i * 3));
    for (i = 24; i >= 0; i--) ap.push(pol(56, 122 + i * 3));
    o.beam.add(P.outlinePlate({ points: ap, depth: 6, z0: 5.5, material: bm }));

    // rack: 14 teeth from Y0, then a round piston rod down to the piston
    o.rack = new T.Group(); c.scene.add(o.rack);
    var rk = P.rack({ teeth: 14, module: md, side: 1, body: 9, thick: 12, material: c.mat("rack") });
    P.at(rk, XP, 0, 0, o.rack);
    P.at(P.cylY(4, 92, c.mat("rack")), XR, -46, 0, o.rack);                     // y -92..0 below the rack's lower end
    P.at(P.cylY(27, 8, c.mat("rack")), XR, -96, 0, o.rack);                     // piston y -100..-92

    // chain on the arch (centre radius RD, z 6..11) and the pump rod below it
    this.LT = RD * (180 - this.A0) * Math.PI / 180 + this.S0;
    o.chain = P.linkChain({ count: Math.floor(this.LT / 5), length: 4.6, height: 4, thick: 2, material: c.mat("chain"), alt: c.mat("chain", "dark") });
    c.scene.add(o.chain);
    o.pump = new T.Group(); c.scene.add(o.pump);
    P.at(P.cylY(3, 70, c.mat("chain")), 0, -35, 8.5, o.pump);
    P.at(P.box(8, 4, 5, c.mat("chain")), 0, -2, 8.5, o.pump);

    o.tEnd = P.trail({ color: 0x8A94A0, max: 300 }); c.scene.add(o.tEnd);
    o.tRod = P.trail({ color: 0xC2503F, max: 300 }); c.scene.add(o.tRod);
  },

  // beam angle th (radians, positive lowers the segment end): rack down by R th, pump rod down by RD th
  kin: function (th) {
    return { rackY: this.Y0 - this.R * th, wrap: this.RD * ((180 - this.A0) * Math.PI / 180 - th), hang: this.S0 + this.RD * th };
  },

  step: function (c, dt, S) {
    var o = this.o, amp = +S.controls.swing, F = this.F, RD = this.RD;
    if (amp !== o.amp) { o.amp = amp; o.tEnd.clear(); o.tRod.clear(); }
    o.ph += S.w * dt;
    var th = amp * Math.PI / 180 * (1 - Math.cos(o.ph)) / 2, k = this.kin(th);
    o.beam.rotation.z = th;
    o.rack.position.y = k.rackY;
    o.roller.rotation.z = (k.rackY - this.Y0) / 14.7;
    // chain links: along the arch from its fixed end, then straight down the tangent
    var a0 = (this.A0 * Math.PI / 180) + th;
    for (var i = 0; i < o.chain.links.length; i++) {
      var s = (i + .5) * 5;
      if (s < k.wrap) { var a = a0 + s / RD, ca = Math.cos(a), sa = Math.sin(a); o.chain.put(i, F[0] + RD * ca, F[1] + RD * sa, 8.5, -sa, ca, 0, ca, sa, 0); }
      else o.chain.put(i, F[0] - RD, F[1] - (s - k.wrap), 8.5, 0, -1, 0, -1, 0, 0);
    }
    o.pump.position.set(F[0] - RD, F[1] - k.hang, 0);
    var tip = [F[0] + 150 * Math.cos(133 * Math.PI / 180 + th), F[1] + 150 * Math.sin(133 * Math.PI / 180 + th)];
    o.tEnd.push(tip[0], tip[1], 14); o.tRod.push(this.F[0] - this.R - 9.5, k.rackY - 20, 14);
    S.set("beam", (th * 180 / Math.PI).toFixed(0) + "°");
    S.set("rack", Math.round((this.Y0 - k.rackY) * 10) + " mm");
    S.set("pump", Math.round((k.hang - this.S0) * 10) + " mm");
  }
});
