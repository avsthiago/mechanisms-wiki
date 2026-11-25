(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // clockwise. The anchor rocks on a pin up and to the left of the wheel. A lever fixed to the anchor reaches further up
  // and to the left and ends in a curved bar with gear teeth on both edges. The teeth on the inner edge turn the pinion
  // of the upper balance, the teeth on the outer edge turn the pinion of the lower one, so the two balances always
  // turn opposite ways. Anchor, lever and both balances are geared together and swing as one body.
  var RAD = Math.PI / 180, N = 15, R = 70, RR = 44, PITCH = 2 * Math.PI / N;
  var GA = 147 * RAD, HA = 54 * RAD, D = R / Math.cos(HA), RL = R * Math.tan(HA);     // anchor pin where the tangents at HA either side meet; catch faces lie on a circle of radius RL about the pin
  var A = [D * Math.cos(GA), D * Math.sin(GA)], E0 = GA + HA + Math.PI / 2, X0 = GA - HA - Math.PI / 2, T0 = GA + HA;   // pin; directions from the pin to the two resting points; a tooth tip rests at T0
  var TP = 11, HALF = 2.5 * RAD, LOCK = 1 * RAD;                                      // pallet thickness; the tooth drops off a pallet when the anchor is HALF past the middle; overlap when it lands
  var MD = 2.5, ZI = 130, ZE = 140, Z1 = 13, Z2 = 14, RI = ZI * MD / 2, RE = ZE * MD / 2, RATIO = ZI / Z1;   // toothed bar: inner and outer pitch radius about the pin; both pinions turn 10 times as far as the lever
  var BE1 = 112.8 * RAD, BE2 = 167.4 * RAD, LD = GA;                                  // directions from the pin to the two balances and along the lever
  var B1 = pol(A, RI - Z1 * MD / 2, BE1), B2 = pol(A, RE + Z2 * MD / 2, BE2);         // balance axes: pitch circles touch
  var IA = 1000, IW = .02, TAU = 70, CA = 100, CW = 4, H = .0002, START = 5.8 * RAD;    // IA: anchor, lever and both balances taken as one body at the pin
  var KS = { s: 20000, m: 39500, h: 80000 };       // the two balance springs together, felt at the pin: soft, medium, stiff
  function pol(c, r, a) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
  function wheelOutline() {
    var p = [], O = [0, 0];
    for (var k = 0; k < N; k++) { var a = T0 + k * PITCH; p.push(pol(O, RR, a + 2 * RAD), pol(O, R, a), pol(O, R, a + 1.2 * RAD), pol(O, R - 4, a + 4.5 * RAD), pol(O, RR, a + 19 * RAD)); }   // a solid wedge with a small flat tip
    return p;
  }
  // The two pallets, drawn with the anchor in the middle of its swing, about the pin at c. Each is a curved block. Its
  // catch face follows a circle about the pin, so a tooth resting on it hardly pushes the anchor either way. Its end
  // slopes, and the tooth slides along the slope to push the anchor. Points 0..2 run along the catch face from its
  // corner, 3..5 back along the other face. The first stretch of the catch face is one straight edge, long enough
  // that the tooth tip never has to ride over a corner of the outline while the anchor swings on.
  function pallet(entry, c) {
    var p = [], i, s = entry ? -1 : 1, f = [0, 14 * RAD, 22 * RAD];
    var ac = entry ? E0 + LOCK - HALF : X0 - LOCK + HALF;                             // angle of the catch corner
    var r2 = entry ? RL - TP : RL + TP, a2 = ac - s * 2 * HALF + s * LOCK, g = [a2 - ac, s * 14 * RAD, s * 22 * RAD];   // a2: other end of the slope
    for (i = 0; i <= 2; i++) p.push(pol(c, RL, ac + s * f[i]));
    for (i = 2; i >= 0; i--) p.push(pol(c, r2, ac + g[i]));
    return p;
  }
  // The curved bar at the end of the lever, about the pin. Gear teeth point inwards along its upper half and outwards
  // along its lower half. A tooth is centred on the direction of each pinion.
  function barOutline() {
    var p = [], i, a, stI = 2 * Math.PI / ZI, stE = 2 * Math.PI / ZE, O = [0, 0];
    var rin = RI + 1.25 * MD, rout = RE - 1.25 * MD, a0 = 100 * RAD, a1 = 199 * RAD;  // solid band between the two sets of tooth roots
    function arc(r, f, t) { var m = Math.max(2, Math.ceil(Math.abs(t - f) / (2 * RAD))); for (var j = 0; j <= m; j++) p.push(pol(O, r, f + (t - f) * j / m)); }
    var e0 = Math.ceil((LD + 4 * RAD - BE2) / stE), e1 = Math.floor((a1 - 1 * RAD - BE2) / stE);
    arc(rout, a0, BE2 + (e0 - .5) * stE);                                             // plain outer edge of the upper half
    for (i = e0; i <= e1; i++) { a = BE2 + i * stE; p.push(pol(O, rout, a - .27 * stE), pol(O, RE + MD, a - .11 * stE), pol(O, RE + MD, a + .11 * stE), pol(O, rout, a + .27 * stE)); }
    p.push(pol(O, rout, a1), pol(O, rin, a1));
    var i1 = Math.floor((LD - 4 * RAD - BE1) / stI), i0 = Math.ceil((a0 + 1 * RAD - BE1) / stI);
    arc(rin, a1, BE1 + (i1 + .5) * stI);                                              // plain inner edge of the lower half
    for (i = i1; i >= i0; i--) { a = BE1 + i * stI; p.push(pol(O, rin, a + .27 * stI), pol(O, RI - MD, a + .11 * stI), pol(O, RI - MD, a - .11 * stI), pol(O, rin, a - .27 * stI)); }
    p.push(pol(O, rin, a0));
    return p;
  }
  // Bodies: 0 escape wheel, 1 anchor (with the lever and, through the gear teeth, both balances).
  function makeSim(P) {
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: [wheelOutline()], drag: CW, a: 1 * RAD },
        { pivot: A, I: IA, polys: [pallet(true, A), pallet(false, A)], drag: CA, a: START }
      ],
      pairs: [[0, 1]]
    });
    s.t = 0; s.amp = Math.abs(START); s.beats = [];
    s.run = function (h, key) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w, k = KS[key] || KS.m;
      b[0].tq = -TAU; b[1].tq = -k * b[1].a;                                          // a steady push on the wheel; the coiled springs pull the balances, and so the lever, back to the middle
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);                                  // the far end of a swing
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }   // passing the middle: one beat
    };
    return s;
  }

  M507.define({
    number: 402,
    title: "Guernsey's twin-balance escapement",
    lede: "A watch keeps time with a balance wheel that swings to and fro. A sudden knock can speed the balance up or slow it down. This watch has two balances that always swing opposite ways, so a knock that helps one hinders the other just as much.",
    alt: "A small wheel with saw teeth at the lower right. Beside it a piece with two hooked tips rocks on a pin. A lever fixed to that piece reaches up and to the left and ends in a curved bar with fine gear teeth on both edges. Two big rings overlap behind the bar. Each has a small gear on its axis. One small gear meshes with the inner edge of the bar and the other with the outer edge.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "The mainspring of the watch, not shown, keeps trying to turn it clockwise. Watch the red dot to see it move on half a tooth at each beat." },
      { key: "anchor", color: "#C8873A", name: "Anchor and lever", note: "One piece that rocks on a pin. Its two hooked tips, called pallets, take turns to catch a tooth. Its long lever ends in a curved bar with gear teeth on the inner edge of one half and the outer edge of the other." },
      { key: "bal1", color: "#D9B13B", name: "Upper balance", note: "A wheel that swings one way and then the other. The small gear on its axis meshes with the inner teeth of the curved bar, so it turns the same way as the lever. Watch its red dot." },
      { key: "bal2", color: "#8E7AA8", name: "Lower balance", note: "The same as the upper balance, but its small gear meshes with the outer teeth of the curved bar. So it always turns the opposite way. Watch its red dot." },
      { key: "spring", color: "#4FA58A", name: "Balance springs", note: "Two coiled strips, one for each balance. The outer end is fixed to the frame and the inner end to the balance. They always pull the balances back to the middle." }
    ],
    controls: [{ id: "spring", label: "Balance springs", value: "m", options: [["s", "Soft"], ["m", "Medium"], ["h", "Stiff"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "up", label: "Balance swing" }],
    views: { "3d": [175, 303, 720], front: [-163, 118, 830], side: [680, 118, -5] },
    target: [-163, 118, -5],
    how: [
      "The escape wheel is always trying to turn. One pallet of the anchor sits in the way of a tooth and holds it. As the anchor rocks, that pallet lifts clear. The tooth slides off its sloping end and gives the anchor a small push. Then the other pallet catches the next tooth.",
      "The lever is fixed to the anchor, so it rocks too. The curved bar at its end is a piece of a gear with teeth on both edges. The upper balance has its small gear inside the curve and the lower balance has its small gear outside. When the bar swings, one small gear is turned clockwise and the other anticlockwise.",
      "Now think of a knock that twists the whole watch. It tries to turn both balances the same way. But the gear teeth only let them turn opposite ways, so the two pushes cancel and the watch keeps its pace. The springs set that pace. Try Soft, then Stiff, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The coiled springs, the back plate, the tooth numbers and the sizes were made up. The drawing does not show the shape of the pallets, so they are the common kind with a round catch face and a sloping end. The mainspring is left out and its push on the wheel is taken to be steady. The lever, the gear teeth and the two balances are taken as one body that swings together. The parts slide on each other without rubbing, and only that body and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, opts: ["s", "m", "h"], pitch: PITCH, perBeat: .5, maxd: 1.2 },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("anchor"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 15000; i++) o.sim.run(H, "m");                                   // run 3 seconds so it opens in its steady swing
      // escape wheel: plate z 0..6 on a pin from the back plate (face at z -30)
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 6, material: mw, windows: { count: 3, rIn: 13, rOut: 36, spoke: 8 } }));
      var dot = pol([0, 0], 54, T0 + 8.5 * RAD);
      P.at(P.cylZ(2.5, 1, c.mat("wheel", "mark")), dot[0], dot[1], 6.5, o.wheel);     // red dot z 6..7 on the face of one tooth
      P.at(P.cylZ(7, 2, c.mat("wheel", "dark")), 0, 0, 7, o.wheel);                    // hub cap z 6..8, on the face
      P.at(P.cylZ(3.5, 30, c.fixed), 0, 0, -15, scene);                                // pin z -30..0, plate face to the back of the wheel
      // anchor: lever and curved bar z 0..6, the two arms z 0.4..5.6 (so their faces are not level with the lever where they cross), the pallets z -0.6..6.6
      o.anchor = new T.Group(); o.anchor.position.set(A[0], A[1], 0); scene.add(o.anchor);
      o.anchor.add(P.outlinePlate({ points: barOutline(), depth: 6, material: ma }));
      o.anchor.add(P.outlinePlate({ points: P.strokeOutline([[0, 0], pol([0, 0], RI + 3 * MD, LD)], 8), depth: 6, material: ma }));   // lever, from the pin into the solid band of the curved bar
      [true, false].forEach(function (e) {
        var q = pallet(e, [0, 0]), mid = [(q[1][0] + q[4][0]) / 2, (q[1][1] + q[4][1]) / 2];
        o.anchor.add(P.outlinePlate({ points: q, depth: 7.2, z0: -.6, material: ma }));
        o.anchor.add(P.outlinePlate({ points: P.strokeOutline([[0, 0], mid], 9), depth: 5.2, z0: .4, material: ma }));           // arm from the pin into the thick end of the pallet
      });
      P.at(P.cylZ(8, 8, ma), 0, 0, 3, o.anchor);                                       // boss z -1..7
      P.at(P.cylZ(4.5, 1.5, c.mat("anchor", "dark")), 0, 0, 7.75, o.anchor);           // cap z 7..8.5, on the face of the boss
      P.at(P.cylZ(3.5, 29, c.fixed), A[0], A[1], -15.5, scene);                        // pin z -30..-1, plate face to the back of the boss
      // balances: staff from the plate face (z -30) to z 7.5. Lower balance rim z -22..-16, upper balance rim z -13..-7, so the rings pass each other.
      o.bal = [];
      [[B1, "bal1", Z1, BE1 + Math.PI / Z1, -10], [B2, "bal2", Z2, BE2 + Math.PI + Math.PI / Z2, -19]].forEach(function (q, k) {
        var mb = c.mat(q[1]), g = new T.Group(); g.position.set(q[0][0], q[0][1], 0); scene.add(g); o.bal.push(g);
        P.at(P.cylZ(3, 37.5, mb), 0, 0, -11.25, g);                                    // staff z -30..7.5
        var pin = P.spurGear({ teeth: q[2], module: MD, width: 7, material: mb }); pin.rotation.z = q[3]; g.add(pin);   // small gear z -3.5..3.5 about z 0; moved to z -0.5..6.5 below. A gap faces the curved bar.
        pin.position.z = 3;
        P.at(P.hoop(111, 3, mb), 0, 0, q[4], g);                                       // rim, tube radius 3
        P.at(P.box(216, 6, 4, mb), 0, 0, q[4], g);                                     // bar x -108..108, to the inside of the rim
        P.at(P.cylZ(3.6, 7.2, c.mat(q[1], "mark")), 0, 111, q[4], g);                  // red dot through the rim, 0.6 proud of it front and back
        P.at(P.cylZ(5, 4, mb), 0, 0, -27, g);                                          // collar z -29..-25 that holds the inner end of the spring
        var sp = P.spiralSpring({ rIn: 5.4, rOut: 40, width: 4, thick: .8, material: c.mat("spring") });
        sp.position.set(q[0][0], q[0][1], -27); scene.add(sp); g.userData.spring = sp;  // spring z -29..-25
        P.at(P.box(5.6, 6, 5, c.fixed), q[0][0] - 43.2, q[0][1], -27.5, scene);        // block 40.4..46 left of the axis (spring's outer face at 40.4), z -30..-25, on the plate face
      });
      // back plate and base
      P.at(P.box(500, 410, 6, c.fixed), -163, 120, -33, scene);                        // plate x -413..87, y -85..325, z -36..-30
      P.at(P.box(520, 12, 90, c.fixed), -163, -91, -15, scene);                        // base y -97..-85, z -60..30; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, S.controls.spring);
      var a = b[1].a, t = [a * RATIO, -a * RATIO];                                     // inner teeth turn the upper balance with the lever, outer teeth turn the lower one against it
      o.wheel.rotation.z = b[0].a; o.anchor.rotation.z = a;
      o.bal.forEach(function (g, k) { g.rotation.z = t[k]; var sp = g.userData.spring; sp.rotation.z = t[k]; sp.set(7 * Math.PI - t[k], 1); });   // the outer end of each spring stays on its block
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      function deg(x) { var d = Math.round(x * 180 / Math.PI); return (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d) + "°"; }
      S.set("up", deg(t[0]));
    }
  });
})();
