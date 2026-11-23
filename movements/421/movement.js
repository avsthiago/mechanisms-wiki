M507.define({
  number: 421,
  title: "Trunk engine",
  lede: "A ship's engine that fits in a low space. A wide tube, called a trunk, is fixed to the piston and slides out through the cylinder top. The rod to the crank goes down inside the trunk and is pinned straight to the piston, so no long piston rod is needed.",
  alt: "A steam cylinder cut open down the middle. A piston carries a wide tube that sticks up through the cylinder top. A rod runs from a pin on the piston, up inside the tube, to a crank above.",
  parts: [
    { key: "cyl", color: "#4FA58A", name: "Cylinder", note: "Cut open at the front so you can see inside. The trunk slides through a tight ring in the top, called a stuffing box, that keeps the steam in." },
    { key: "piston", color: "#C8873A", name: "Piston and trunk", note: "The piston and the wide tube on top of it are one piece. They slide up and down together." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "Pinned to the piston at the bottom of the trunk. It leans inside the trunk as the crank turns." },
    { key: "crank", color: "#5E7387", name: "Crank and shaft", note: "An arm on the turning shaft above. It turns the up and down push of the piston into a spin." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "Where the rod joins the crank. Watch it go round in a circle." }
  ],
  controls: [{ type: "range", id: "tw", label: "Trunk width", min: 30, max: 46, step: 1, value: 35, unit: " mm",
    presets: [[30, "Narrow"], [35, "As drawn"], [46, "Wide"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "st", label: "Steam on" }, { id: "ar", label: "Top area" }],
  views: { "3d": [180, 160, 540], front: [0, 68, 520], side: [520, 68, 0] },
  target: [0, 90, 0],
  how: [
    "Watch the piston. It slides up and down, and the trunk slides with it through the top of the cylinder. The rod inside the trunk leans one way, then the other, and turns the crank above.",
    "The steam pushes on both sides of the piston in turn. Underneath, it pushes on the whole piston. On top, the trunk covers the middle, so the steam only pushes on the ring around it. To even this out, fresh strong steam goes on top first. Then it flows to the bigger space below, where it spreads out and pushes again.",
    "Try a narrow trunk, then a wide one. Watch how much of the top of the piston is left for the steam to push on. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the cylinder, piston and trunk is cut away so the inside shows. The base, the post that holds the crank shaft, the shape of the crank and all the sizes were made up. The steam pipes and valves are left out; the blue dots show the steam. Dark dots are fresh steam pushing, and pale dots are used steam leaving.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: 0, Yc: 163, r: 36, L: 165, rb: 57.5, tw: 0, p0: null };
    // cylinder: bottom cover y -70 .. -64, bore radius 57.5, head y 30 .. 36, stuffing box up to y 46
    o.cyl = c.shell(P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: c.mat("cyl") }), 0, 0, 0, scene), "open");
    o.P = P; o.cylW = c.shell(P.at(P.wholeSection({ poly: [[0, 0], [1, 0], [1, 1]], material: c.mat("cyl") }), 0, 0, 0, scene), "closed");   // closed view: the whole cylinder, outline set in shape()
    o.cylW.userData.live = true;
    // piston and trunk, built about the piston pin: piston y -24 .. -10, trunk y -10 .. 90
    o.pis = P.at(new T.Group(), 0, 0, 0, scene);
    o.pt = c.shell(P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: c.mat("piston") }), 0, 0, 0, o.pis), "open");
    o.ptW = c.shell(P.at(P.wholeSection({ poly: [[0, 0], [1, 0], [1, 1]], material: c.mat("piston") }), 0, 0, 0, o.pis), "closed");   // closed view: the whole trunk, which shows above the cylinder top
    o.ptW.userData.live = true;
    o.lug = P.at(P.box(18, 10, 1, c.mat("piston")), 0, -5, 0, o.pis);       // lug under the pin, y -10 .. 0, back of the trunk
    o.ppin = P.at(P.cylZ(4, 1, c.mat("piston")), 0, 0, 0, o.pis);            // piston pin, from the trunk's back wall to z 6
    // steam: a ring above the piston, a disc below it (unit height, scaled each frame)
    o.mTop = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .2, depthWrite: false });
    o.mBot = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .2, depthWrite: false });
    o.sTop = c.fluid(P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: o.mTop }), 0, 0, 0, scene));
    o.sBot = c.fluid(P.at(P.halfSection({ poly: [[0, 0], [57, 0], [57, 1], [0, 1]], material: o.mBot }), 0, -63.5, 0, scene));
    // base and the post for the crank shaft
    P.at(P.box(200, 10, 210, c.fixed), 0, -74.5, -15, scene);               // base, y -79.5 .. -69.5, z -120 .. 90; the cylinder's foot (y -70) sinks 0.5 into it
    P.at(P.box(24, 250, 14, c.fixed), 0, 55, -105, scene);                  // post, y -70 .. 180, z -112 .. -98
    P.at(P.cylZ(6, 88, c.mat("crank")), 0, o.Yc, -54, scene);               // shaft, z -98 .. -10, ends on the post's front face
    o.crank = P.at(new T.Group(), 0, o.Yc, 0, scene);
    P.at(P.cylZ(14, 6, c.mat("crank")), 0, 0, -7, o.crank);                 // hub, z -10 .. -4
    var arm = P.at(P.box(o.r, 14, 5.6, c.mat("crank")), o.r / 2, 0, -7, o.crank);  // arm, z -9.8 .. -4.2
    P.at(P.cylZ(10, 6.2, c.mat("crank")), o.r, 0, -7, o.crank);             // boss round the pin, z -10.1 .. -3.9
    P.at(P.cylZ(4, 15, c.mat("pin")), o.r, 0, -2.5, o.crank);               // crank pin, z -10 .. 5
    // connecting rod, in the plane z = 0
    o.rod = P.at(P.rod(3.5, c.mat("rod")), 0, 0, 0, scene);
    o.e1 = P.at(P.cylZ(8, 6, c.mat("rod")), 0, 0, 0, scene);                // eye on the piston pin, z -3 .. 3
    o.e2 = P.at(P.cylZ(8, 6, c.mat("rod")), 0, 0, 0, scene);                // eye on the crank pin
    [o.sTop, o.sBot].forEach(function (s) { s.children.forEach(function (m) { m.userData.live = true; }); });
    // steam as moving balls in the cut face's back half: below the piston, and each side of the trunk above it
    o.flow = P.steamFlow({ color: c.spot, light: true, count: 260, z0: -13, z1: -2 }); scene.add(o.flow);
    o.dBot = o.flow.domain({ density: .012, pad: 3, f: function (y, out) { out[0] = -53; out[1] = y; out[2] = 53; out[3] = y; } });
    o.dTop = [-1, 1].map(function (s) { return o.flow.domain({ density: .012, pad: 3, f: function (y, out) { out[0] = s * (o.tw + 2.5); out[1] = y; out[2] = s * 53; out[3] = y; } }); });
    o.bars = [0, 0]; o.kinds = [0]; o.ports = [0];
  },

  shape: function (rt) {
    var o = this.o, g1 = rt + .6, g2 = rt + 8, ri = rt - 4;
    var cp = [[0, -70], [78, -70], [78, -64], [62, -64], [62, 30], [78, 30], [78, 36], [g2, 36], [g2, 46], [g1, 46], [g1, 30], [57.5, 30], [57.5, -64], [0, -64]];
    var pp = [[0, -24], [57, -24], [57, -10], [rt, -10], [rt, 90], [ri, 90], [ri, -10], [0, -10]];
    o.cyl.set(cp); o.pt.set(pp);
    [[o.cylW, cp], [o.ptW, pp]].forEach(function (w) { w[0].geometry.dispose(); w[0].geometry = o.P.wholeSection({ poly: w[1], material: w[0].material }).geometry; });
    var zb = -Math.sqrt(ri * ri - 81);                                       // the trunk's back wall at x = +-9
    o.lug.scale.z = -5 - zb; o.lug.position.z = (zb - 5) / 2;                // lug, z zb .. -5
    o.ppin.scale.y = 6 + ri; o.ppin.position.z = (6 - ri) / 2;               // pin, z -ri .. 6
    o.sTop.set([[rt + .5, 0], [57, 0], [57, 1], [rt + .5, 1]]);
    o.tw = rt;
  },

  step: function (c, dt, S) {
    var o = this.o, rt = +S.controls.tw, r = o.r, L = o.L;
    if (rt !== o.tw) this.shape(rt);
    o.th += S.w * dt;
    var px = r * Math.cos(o.th), py = o.Yc + r * Math.sin(o.th);
    var p = py - Math.sqrt(L * L - px * px);                                // piston pin height: rod length fixed, piston only moves up and down
    var v = Math.cos(o.th);                                                  // the piston goes up while the pin is on the right half (crank turns anticlockwise)
    o.pis.position.y = p;
    o.crank.rotation.z = o.th;
    o.e1.position.set(0, p, 0); o.e2.position.set(px, py, 0);
    o.rod.span(0, p, 0, px, py, 0);
    var hT = 29.5 - (p - 9.5), hB = (p - 24.5) + 63.5;
    o.sTop.position.y = p - 9.5; o.sTop.scale.y = hT;
    o.sBot.scale.y = hB;
    var down = S.w >= 0 ? v < 0 : v > 0;
    o.mTop.opacity = down ? .12 : .04; o.mBot.opacity = down ? .03 : .1;
    // rooms run along the cylinder: the steam comes and goes at the covers (y -63.5 and 29.5), the piston is the moving end
    o.bars[0] = -63.5; o.bars[1] = Math.max(-63.4, p - 24.5); o.kinds[0] = down ? 3 : 1; o.ports[0] = -63.5; o.dBot.set(o.bars, o.kinds, o.ports, 1);
    o.bars[0] = Math.min(29.4, p - 9.5); o.bars[1] = 29.5; o.kinds[0] = down ? 1 : 3; o.ports[0] = 29.5; o.dTop[0].set(o.bars, o.kinds, o.ports, 1); o.dTop[1].set(o.bars, o.kinds, o.ports, 1);
    o.flow.update(Math.abs(S.w) * dt);
    S.set("st", down ? "Top" : "Bottom");
    S.set("ar", Math.round(100 * (1 - (rt / o.rb) * (rt / o.rb))) + "%");
  }
});
