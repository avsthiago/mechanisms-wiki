M507.define({
  number: 423,
  title: "Root's double-quadrant engine",
  lede: "A steam engine with two swinging pistons in one case. Each piston is a flat blade on a pivot, and steam pushes on one side of it only. Both blades are joined to the same crank, and their pushes overlap, so the crank never sticks.",
  alt: "A steam engine case cut open at the front. Two swinging blades, one at the top left and one at the bottom right, are joined by two rods to one crank in the middle. A round valve sits at the top right.",
  parts: [
    { key: "case", color: "#4FA58A", name: "Case", note: "Cut open at the front. It holds two chambers shaped like quarter circles, with channels that carry steam from the valve to each one." },
    { key: "vanes", color: "#C8873A", name: "Pistons", note: "Two flat blades, each swinging on its own pivot. Steam pushes on the outer side of each, away from its end wall." },
    { key: "valve", color: "#8E7AA8", name: "Valve", note: "A round plug that turns in its seat and lets steam into the two channels in turn." },
    { key: "rods", color: "#D9B13B", name: "Connecting rods", note: "One rod from each piston. Both are pinned to the same crank pin." },
    { key: "crank", color: "#5E7387", name: "Crank", note: "An arm on the shaft in the middle of the case. Both pistons turn it." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "Where the two rods meet the crank. Watch it go round in a circle." }
  ],
  closed: { label: "Case" },
  readouts: [{ id: "st", label: "Steam on" }],
  views: { "3d": [150, 120, 600], front: [6, 4, 650], side: [650, 4, 6] },
  target: [6, 4, 0],
  how: [
    "Watch the two blades. The top one swings down and up, and the bottom one swings up and down. Each pulls its rod, and both rods turn the one crank in the middle.",
    "Steam fills the space behind a blade and pushes it away from its end wall. Steam can only push, never pull, so each blade drives the crank only while it moves away from its wall. That lasts a little more than half a turn of the crank. On the way back, the used steam is pushed out into the middle of the case.",
    "Watch the blue dots of steam and the readout. Most of the time one blade is pushing. For a short while in each turn both push together, and there is never a moment when neither pushes. So the crank has no dead points. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front of the case is cut away so the blades show, and the rods and crank are drawn in front of it. The legs and base, the exact shape of the case and channels, and all the sizes were made up. The valve is shown turning with the crank, but how it is driven and timed was made up. The blue dots show the steam. Dark dots are fresh steam pushing, and pale dots are used steam leaving.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = Math.PI / 180, k;
    var o = this.o = { th: -55 * D, P: 90, d: 113, L: 92, r: 30, V: [104, 78], T: T, prev: null };
    var Px = o.P, V = o.V, cm = c.mat("case");
    function pol(cx, cy, r, f) { return [cx + r * Math.cos(f), cy + r * Math.sin(f)]; }
    function arc(cx, cy, r, f0, f1, n) { var p = [], k; for (k = 0; k <= n; k++) p.push(pol(cx, cy, r, f0 + (f1 - f0) * k / n)); return p; }
    function ring(cx, cy, r0, r1, f0, f1) { return arc(cx, cy, r1, f0, f1, 16).concat(arc(cx, cy, r0, f1, f0, 16)); }
    function plate(pts, mat) { var m = P.outlinePlate({ points: pts, depth: 40, z0: -40, material: mat || cm }); scene.add(m); return m; }
    function rot(pts) { return pts.map(function (p) { return [-p[0], -p[1]]; }); }   // half a turn about the crank shaft
    function half(pts, w, side) { var s = P.strokeOutline(pts, w), n = pts.length; return side ? s.slice(n).reverse() : s.slice(0, n); }
    // upper channel: centre line along an arc round the upper pivot, then straight into the valve. Walls 6 thick each side of an 8 wide channel.
    var ch = arc(-Px, 0, 147, 95.4 * D, 38 * D, 20).concat([[V[0] - 15, V[1]]]);
    var inL = half(ch, 14, 1), outL = half(ch, 14, 0);
    if (Math.hypot(inL[0][0] + Px, inL[0][1]) > 147) { var tt = inL; inL = outL; outL = tt; }
    plate(P.strokeOutline(inL.slice(2), 6));                                  // inner wall r 137 .. 143, starts at 89 degrees: the gap by the end wall lets steam in
    plate(P.strokeOutline([[outL[0][0] - 3, outL[0][1]]].concat(outL.slice(1)), 6));   // outer wall r 151 .. 157
    // lower channel: straight down the right side, x 107 .. 115
    plate([[101, -124], [107, -124], [107, V[1] - 16], [101, V[1] - 18]]);   // end wall of the lower chamber, x 101 .. 107; open below y -124
    plate([[115, -136], [121, -136], [121, V[1]], [115, V[1] - 12]]);        // outer wall, x 115 .. 121
    plate(ring(Px, 0, 137, 143, 200 * D, 284 * D));                          // lower curved wall, closes the bottom of the channel too
    // end wall of the upper chamber, x -107 .. -101, and the bottom wall, y -53 .. -47
    plate([[-107, -53], [-101, -53], [-101, 155], [-107, 157]]);
    plate([[-107, -53], [-41, -53], [-41, -47], [-107, -47]]);
    // seats round the two pivots (the second is the first turned half a turn), and the wall under the valve, y 47 .. 53
    var seat = arc(-Px, 0, 10.5, 100 * D, 300 * D, 20).concat([[-Px + 10.5 * Math.cos(300 * D), -47], [-101, -47], [-101, 10.5 * Math.sin(100 * D)]]);
    plate(seat); plate(rot(seat));
    plate([[41, 47], [101, 47], [101, 53], [41, 53]]);
    // valve seat: a ring r 14.5 .. 21 with three openings: inlet on top, upper channel on the left, lower channel below on the right
    [[-60, 76], [104, 166], [193, 275]].forEach(function (a) { plate(ring(V[0], V[1], 14.5, 21, a[0] * D, a[1] * D)); });
    P.at(P.box(5, 18, 40, cm), V[0] - 10.5, V[1] + 27, -20, scene); P.at(P.box(5, 18, 40, cm), V[0] + 10.5, V[1] + 27, -20, scene);   // inlet pipe walls, y V+18 .. V+36
    P.at(P.box(10, 5, 40, cm), V[0] - 13, V[1] + 38.5, -20, scene); P.at(P.box(10, 5, 40, cm), V[0] + 13, V[1] + 38.5, -20, scene);   // flange, y V+36 .. V+41
    c.shell(P.at(P.box(16, 18, 4, cm), V[0], V[1] + 27, -2, scene), "closed"); c.shell(P.at(P.box(16, 18, 4, cm), V[0], V[1] + 27, -38, scene), "closed");   // closed view: front and back of the inlet pipe, x V-8 .. V+8 between its walls, y V+18 .. V+36, z -4 .. 0 and -40 .. -36
    // back plate z -46 .. -40
    var bp = [[-107, 157]].concat(outL.slice(1).map(function (p) { return [p[0], p[1] + 3]; }), arc(V[0], V[1], 21, 160 * D, 0, 8), [[121, -136]], arc(Px, 0, 143, 284 * D, 200 * D, 16), [[-107, -53]]);
    scene.add(P.outlinePlate({ points: bp, depth: 6, z0: -46, material: cm }));
    scene.add(c.shell(P.outlinePlate({ points: bp, depth: 20, z0: 0, material: cm }), "closed"));   // closed view: front cover z 0..20, deep enough to hold the crank, rods and pins (all below z 19.5)
    // legs and base
    P.at(P.box(46, 90, 46, c.fixed), -84, -98, -23, scene);                  // leg under the left side, x -107 .. -61, y -143 .. -53, z -46 .. 0
    P.at(P.box(270, 10, 90, c.fixed), 0, -148, -15, scene);                  // base, y -153 .. -143, z -60 .. 30; the curved wall touches its top at x 90
    // steam: channels (static shapes) and the chambers (rebuilt each frame)
    o.sm = [0, 1].map(function () { return new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .1, depthWrite: false }); });
    scene.add(c.fluid(P.outlinePlate({ points: P.strokeOutline(ch.slice(0, -1).concat([[V[0] - 18, V[1]]]), 7.4), depth: 39, z0: -39.5, material: o.sm[0] })));
    scene.add(c.fluid(P.outlinePlate({ points: [[107.3, -134.5], [114.7, -134.5], [114.7, V[1] - 12.5], [107.3, V[1] - 15.5]], depth: 39, z0: -39.5, material: o.sm[1] })));
    scene.add(c.fluid(P.outlinePlate({ points: [[101.3, -134.5], [107.3, -134.5], [107.3, -124.3], [101.3, -124.3]], depth: 39, z0: -39.5, material: o.sm[1] })));
    o.ch = [0, 1].map(function (i) { var m = P.mesh(new T.BufferGeometry(), o.sm[i]); m.userData.live = true; scene.add(c.fluid(m)); return m; });
    // steam as moving balls: each chamber is the space from its blade round to its end wall (angle about the blade's pivot);
    // each channel is a stream from the valve to the gap by the end wall
    o.flow = P.steamFlow({ color: c.spot, light: true, count: 280, z0: -35, z1: -5 }); scene.add(o.flow);
    o.dom = [0, 1].map(function (i) { var px = i ? Px : -Px; return o.flow.domain({ density: .012, pad: .04, f: function (f, out) { var cf = Math.cos(f), sf = Math.sin(f); out[0] = px + 14 * cf; out[1] = 14 * sf; out[2] = px + 134 * cf; out[3] = 134 * sf; } }); });
    o.bars = [0, 0]; o.kinds = [0]; o.ports = [0];
    o.fp = [o.flow.pipe({ points: ch.slice().reverse().concat([pol(-Px, 0, 139, 93.6 * D)]), width: 6, n: 16 }), o.flow.pipe({ points: [[111, V[1] - 16], [111, -129.5], [102, -129.5]], width: 6, n: 16 })];
    // valve plug: solid on one side, hollowed on the other; z -39 .. -1
    var plug = arc(0, 0, 14, 90 * D, 270 * D, 16).concat(arc(0, 0, 5, 270 * D, 450 * D, 12).slice(1, -1));
    o.valve = P.at(new T.Group(), V[0], V[1], 0, scene);
    o.valve.add(P.outlinePlate({ points: plug, depth: 38, z0: -39, material: c.mat("valve") }));
    // pistons: hub r 10, blade 7 wide out to r 135, z -39 .. -1; a pin at 113 from the pivot reaches out to the rods
    o.v = [0, 1].map(function (i) {
      var g = P.at(new T.Group(), i ? Px : -Px, 0, 0, scene);
      P.at(P.cylZ(10, 38, c.mat("vanes")), 0, 0, -20, g);
      P.at(P.box(125, 7, 38, c.mat("vanes")), 72.5, 0, -20, g);              // x 10 .. 135
      P.at(P.cylZ(6, 1, c.mat("vanes")), o.d, 0, -0.5, g);                   // boss, z -1 .. 0
      P.at(P.cylZ(3.5, i ? 19 : 13, c.mat("vanes")), o.d, 0, i ? 8.5 : 5.5, g);   // pin, z -1 .. 18 (lower) or 12 (upper)
      return g;
    });
    // crank on the main shaft at the middle, arm z 1 .. 6
    P.at(P.cylZ(6, 42, c.mat("crank")), 0, 0, -19, scene);                   // shaft, z -40 .. 2, from the back plate into the arm (back face z 1)
    o.crank = P.at(new T.Group(), 0, 0, 3.5, scene);
    o.crank.add(P.armPlate({ length: o.r, r0: 11, r1: 8, thick: 5, material: c.mat("crank") }));
    P.at(P.cylZ(3.5, 19, c.mat("pin")), o.r, 0, 6.5, o.crank);              // crank pin, z 0.5 .. 19.5 (arm back face is z 1)
    // rods: upper at z 7 .. 11, lower at z 13 .. 17
    o.rods = [9, 15].map(function (z) {
      return { z: z, bar: P.at(P.rod(3, c.mat("rods")), 0, 0, 0, scene), a: P.at(P.cylZ(7, 4, c.mat("rods")), 0, 0, z, scene), b: P.at(P.cylZ(7, 4, c.mat("rods")), 0, 0, z, scene) };
    });
  },

  // angle of the upper blade (from its pivot, radians) for crank angle th: the pin lies on two circles
  upper: function (th) {
    var o = this.o, kx = o.r * Math.cos(th) + o.P, ky = o.r * Math.sin(th), D = Math.hypot(kx, ky);
    var ca = (o.d * o.d + D * D - o.L * o.L) / (2 * o.d * D);
    return Math.atan2(ky, kx) + Math.acos(Math.max(-1, Math.min(1, ca)));
  },

  step: function (c, dt, S) {
    var o = this.o, T = o.T, i, k;
    o.th -= S.w * dt;                                                        // the crank turns clockwise
    var th = o.th, a = [this.upper(th), this.upper(th + Math.PI) + Math.PI];   // the lower blade is the upper one turned half a turn
    var push = [this.upper(th - .01) < a[0], this.upper(th + Math.PI - .01) + Math.PI < a[1]];   // moving away from its end wall as the crank goes on
    var kx = o.r * Math.cos(th), ky = o.r * Math.sin(th);
    o.crank.rotation.z = th;
    o.valve.rotation.z = th + 2.4;
    for (i = 0; i < 2; i++) {
      var g = o.v[i], px = i ? o.P : -o.P, ux = px + o.d * Math.cos(a[i]), uy = o.d * Math.sin(a[i]), rd = o.rods[i];
      g.rotation.z = a[i];
      rd.bar.span(ux, uy, rd.z, kx, ky, rd.z);
      rd.a.position.set(ux, uy, rd.z); rd.b.position.set(kx, ky, rd.z);
      o.sm[i].opacity = push[i] ? .14 : .03;
      // the space between the blade and the end wall
      var b = a[i], hw = 3.8, pts = [];
      function B(r) { return [px + r * Math.cos(b) - hw * Math.sin(b), r * Math.sin(b) + hw * Math.cos(b)]; }   // on the blade's outer face
      pts.push(B(11), B(136.5));
      var fb = Math.atan2(B(136.5)[1], B(136.5)[0] - px), fw = (i ? 274.6 : 94.6) * Math.PI / 180;
      if (i && fb < 0) fb += 2 * Math.PI;
      for (k = 1; k <= 12; k++) { var f = fb + (fw - fb) * k / 12; pts.push([px + 136.5 * Math.cos(f), 136.5 * Math.sin(f)]); }
      pts.push(i ? [100.7, -10.6] : [-100.7, 10.6]);                         // down the end wall to the pivot seat
      var sh = new T.Shape(); pts.forEach(function (p, j) { if (j) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
      var geo = new T.ExtrudeGeometry(sh, { depth: 39, bevelEnabled: false }); geo.translate(0, 0, -39.5);
      o.ch[i].geometry.dispose(); o.ch[i].geometry = geo;
      o.bars[0] = Math.min(fw - .02, fb); o.bars[1] = fw; o.kinds[0] = push[i] ? 1 : 3; o.ports[0] = fw - .02;
      o.dom[i].set(o.bars, o.kinds, o.ports, 1); o.fp[i].out = !push[i];
    }
    o.flow.update(Math.abs(S.w) * dt);
    S.set("st", push[0] && push[1] ? "Both" : push[0] ? "Upper" : "Lower");
  }
});
