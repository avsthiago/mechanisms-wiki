(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // clockwise. The pendulum hangs from a pin at (0, L) straight above the wheel and carries a plate with an opening
  // round the wheel. Points on the pendulum are given as (distance from the pin, angle from straight down).
  var RAD = Math.PI / 180, R = 60, L = 230, TR = 22 * RAD, HP = R * (1 - Math.cos(TR));    // tip circle; pin height; a tooth leaves a pallet this far past the top or bottom; depth of a pallet
  var RU = L - (R - HP), RLO = L + (R - HP), R1 = L - (R + 5), R2 = L + (R + 5);            // resting faces of the upper and lower pallet (circles about the pin); far ends of the two pushing faces
  var TU = -.0375, TLO = .0375;                                                             // corners of the two pallets: the upper one a little left of the middle, the lower one a little right
  var XA = 117, XB = 147, RC = 38, PW = 186, PH = 87;                                       // near and far walls of the opening, corner radius, half size of the plate
  var IW = .5, TAU = 600, CW = 30, MP = .16, L0 = 385, G = 16 * L0, CP = 2000, H = .00025, START = .19, T0 = -65 * RAD;
  function pp(r, t) { return [r * Math.sin(t), L - r * Math.cos(t)]; }
  function px(r, x) { return pp(r, Math.asin(x / r)); }
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function leg(k) {                                // one leg: out from the hub, then bent forward to a sharp tip
    var a = T0 + k * 120 * RAD;
    return [pol(9, a + 110 * RAD), pol(46, a + 42 * RAD), pol(R, a), pol(34, a + 22 * RAD), pol(9, a - 35 * RAD)];
  }
  function hub() { var p = []; for (var i = 0; i < 16; i++) p.push(pol(11, i * 22.5 * RAD)); return p; }
  // The two pallets as solid blocks for the contact test: the upper one is the plate above the opening to the right
  // of its corner, the lower one is the plate below the opening to the left of its corner.
  function upperPallet() {
    var p = [], i, n = 8, far = .37;
    for (i = 0; i <= n; i++) p.push(pp(RU, TU + (far - TU) * i / n));
    p.push(pp(RU - 30, far), pp(RU - 30, TU));
    return p;
  }
  function lowerPallet() {
    var p = [], i, n = 8, far = -.26;
    for (i = 0; i <= n; i++) p.push(pp(RLO, TLO + (far - TLO) * i / n));
    p.push(pp(RLO + 30, far), pp(RLO + 30, TLO));
    return p;
  }
  function arcPts(cx, cy, r, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * RAD; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; }
  function openingOutline() {                      // the opening in the plate, with the pendulum hanging straight
    var p = [], i, xu = Math.sqrt(RU * RU - Math.pow(L - 68, 2)), xl = -Math.sqrt(RLO * RLO - Math.pow(L + 46, 2)), a = pp(RU, TU), b = pp(RLO, TLO);
    p.push(a, pp(R1, TU));                                                            // pushing face of the upper pallet
    p = p.concat(arcPts(-XA + RC, 66 - RC, RC, 90, 180, 8), [[-XA, 3], [-XB, 3]], arcPts(-XB + RC, -8, RC, 180, 270, 8));   // top left, the step, bottom left
    for (i = 0; i <= 8; i++) p.push(px(RLO, xl + (b[0] - xl) * i / 8));               // resting face of the lower pallet
    p.push(pp(R2, TLO));                                                              // pushing face of the lower pallet
    p = p.concat(arcPts(XA - RC, -66 + RC, RC, 270, 360, 8), [[XA, -3], [XB, -3]], arcPts(XB - RC, 30, RC, 0, 90, 8));      // bottom right, the step, top right
    for (i = 0; i < 8; i++) p.push(px(RU, xu + (a[0] - xu) * i / 8));                 // resting face of the upper pallet
    return p;
  }
  // Bodies: 0 escape wheel (one outline per leg), 1 pendulum with its plate.
  function makeSim(P) {
    var s = P.pivotSim({
      bodies: [{ pivot: [0, 0], I: IW, polys: [leg(0), leg(1), leg(2)], drag: CW }, { pivot: [0, L], I: MP * L0 * L0, polys: [upperPallet(), lowerPallet()], drag: CP, a: START }],
      pairs: [[0, 1]]
    });
    s.t = 0; s.amp = START; s.beats = [];
    s.run = function (h, len) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = -TAU; b[1].tq = -MP * G * len * Math.sin(b[1].a);                     // the weight turns the wheel; the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }
  function inside(x, y, p) {
    for (var i = 0, j = p.length - 1, c = false; i < p.length; j = i++)
      if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
    return c;
  }
  function edgeDist(x, y, p) {
    for (var i = 0, best = 1e9; i < p.length; i++) {
      var a = p[i], b = p[(i + 1) % p.length], dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(a[0] + t * dx - x, a[1] + t * dy - y));
    }
    return best;
  }

  M507.define({
    number: 306,
    title: "Three-legged escapement",
    lede: "A weight tries to spin a wheel with only three teeth. The wheel sits in an opening cut in a plate on the pendulum. Two steps in the edge of the opening take turns to stop a tooth, so the wheel moves one sixth of a turn for each swing.",
    alt: "A wide flat plate with a long opening cut in it, wider at the top left and at the bottom right. Inside the opening is a small wheel with three bent legs. The tip of one leg touches a small step in the top edge of the opening. The plate is fixed across two upright bars of a pendulum that hangs from a pin above.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "A weight, not shown, keeps trying to turn it clockwise. It has three legs with sharp tips. Watch the red leg." },
      { key: "plate", color: "#C8873A", name: "Plate with pallets", note: "A plate screwed to the pendulum. The edge of its opening has a small step at the top and another at the bottom. These steps are the pallets. The legs of the wheel rest on them and push them." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Two bars that hang from a pin and carry the plate, with a heavy bob below. Its length sets how quickly it swings." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 345, max: 425, step: 40, value: L0, unit: "",
      presets: [[345, "Short"], [385, "Medium"], [425, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [320, 105, 860], front: [0, 28, 700], side: [700, 28, 0] },
    target: [0, 28, 0],
    how: [
      "The wheel tries to turn clockwise. A leg comes up on the left and its tip meets the curved edge of the upper pallet from below. It rests there and the wheel stands still. That edge is part of a circle round the pin of the pendulum, so the plate can slide past the tip without moving the wheel.",
      "As the pendulum swings to the right, the corner of the pallet slides off the tip. The leg is free and runs into the upright side of the step. Now it pushes the plate to the right, the way the pendulum is already going. That push keeps the pendulum swinging. When the tip slips under the corner, the next leg lands on the lower pallet. On the swing back the same thing happens at the bottom, with the push to the left.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The top of the pendulum, the bob, the back plate and the sizes were made up. The pendulum here is much shorter than a real one would be, so the resting edges of the opening are plainly curved and the swing is wide. In the drawing they look straight. The weight that turns the wheel is left out and its pull is taken to be steady. The legs slide on the pallets without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, opts: [345, 385, 425], pitch: 120 * RAD, perBeat: .5, maxd: 1.2, back: 1 * RAD },
    // every corner of the wheel must stay inside the opening, apart from the tips that press on the pallets
    check: function (s0, P, len) {
      var s = makeSim(P), op = openingOutline(), worst = 0, i, k, j;
      for (i = 0; i < 60000; i++) {
        s.run(H, len);
        if (i % 20) continue;
        var a = -s.bodies[1].a, ca = Math.cos(a), sa = Math.sin(a);
        for (k = 0; k < 3; k++) { var q = s.outline(0, k); for (j = 0; j < q.length; j++) {
          var x = q[j][0], y = q[j][1] - L, X = ca * x - sa * y, Y = L + sa * x + ca * y;
          if (!inside(X, Y, op)) worst = Math.max(worst, edgeDist(X, Y, op));
        } }
      }
      return worst > 1 ? "a leg is " + worst.toFixed(1) + " outside the opening" : "";
    },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), mp = c.mat("pend"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      // wheel z 0..6 in the opening of the plate; the red leg z -0.6..6.6 is proud of both faces
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: leg(0), depth: 7.2, z0: -.6, material: c.mat("wheel", "mark") }));
      o.wheel.add(P.outlinePlate({ points: leg(1), depth: 6, material: mw })); o.wheel.add(P.outlinePlate({ points: leg(2), depth: 6, material: mw }));
      P.at(P.cylZ(11, 8, mw), 0, 0, 3, o.wheel);                                      // hub z -1..7
      P.at(P.cylZ(5, 2, c.mat("wheel", "dark")), 0, 0, 8, o.wheel);                   // cap z 7..9, on the hub
      P.at(P.cylZ(4, 29, c.fixed), 0, 0, -15.5, scene);                               // pin z -30..-1, plate face to the back of the hub
      // pendulum: everything hangs from the pin at (0, L); positions below are measured from the pin
      o.pend = new T.Group(); o.pend.position.set(0, L, 0); scene.add(o.pend);
      function local(p) { return p.map(function (q) { return [q[0], q[1] - L]; }); }
      o.pend.add(P.outlinePlate({ points: [[-PW, -PH - L], [PW, -PH - L], [PW, PH - L], [-PW, PH - L]], holes: [local(openingOutline())], depth: 6, material: c.mat("plate") }));   // plate z 0..6, x -186..186, y -87..87
      [[-153, 62], [153, 62], [-153, -62], [153, -62]].forEach(function (q) { P.at(P.cylZ(5, 1.5, c.mat("plate", "dark")), q[0], q[1] - L, 6.75, o.pend); });   // screw heads z 6..7.5, on the face of the plate
      [-1, 1].forEach(function (s) { P.at(P.box(30, 324, 8, mp), s * 153, 57 - L, -4, o.pend); });   // bars x 138..168, y -105..219, z -8..0; the plate lies on their front faces
      P.at(P.box(336, 22, 8, mp), 0, 0, -4, o.pend);                                  // top bar x -168..168, y 219..241, z -8..0; the two bars end on its under side
      P.at(P.cylZ(13, 3, mp), 0, 0, 1.5, o.pend);                                     // boss z 0..3 on the face of the top bar
      P.at(P.cylZ(5, 22, c.fixed), 0, L, -19, scene);                                 // pin z -30..-8, plate face to the back of the top bar
      o.rod = P.at(P.box(6, 1, 4, mp), 0, 0, 3, o.pend);                              // rod z 1..5, from the bottom edge of the plate down to the bob; length set each frame
      o.bob = P.at(P.cylZ(22, 8, mp), 0, 0, 3, o.pend);                               // bob z -1..7
      // back plate and base
      P.at(P.box(450, 500, 6, c.fixed), 0, 5, -33, scene);                            // plate x -225..225, y -245..255, z -36..-30
      P.at(P.box(470, 12, 100, c.fixed), 0, -251, -10, scene);                        // base y -257..-245, z -60..40; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l);
      o.wheel.rotation.z = b[0].a; o.pend.rotation.z = b[1].a;
      var top = -PH - L, len = l - (L + PH);                                          // rod from the bottom edge of the plate (y -87) to the middle of the bob
      o.rod.scale.y = len; o.rod.position.y = top - len / 2; o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp * 180 / Math.PI).toFixed(1) + "°");
    }
  });
})();
