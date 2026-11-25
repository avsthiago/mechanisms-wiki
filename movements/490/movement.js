/* Plan view laid on the wall: the drawing is in the XY plane and the viewer looks down -Z at it. The model is built in
   drawing units (x right, y up, 1 = one pixel of the engraving) inside one group scaled by .5. */
M507.define({
  number: 490,
  title: "Ship's steering gear",
  lede: "A hand wheel turns a barrel with a rope wound on it. The rope runs round two guide pulleys to the end of a long lever on the rudder. Turning the wheel swings the lever, and the rudder with it.",
  alt: "Plan view of a ship's steering gear. A hand wheel seen edge-on sits on a shaft with a rope barrel. The rope runs up and down to two guide pulleys and then to the end of a long lever, the tiller, that points to the rudder head on the right.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Hand wheel and shaft", note: "The helmsman turns this. The shaft carries the barrel. Watch the red handle." },
    { key: "barrel", color: "#C8873A", name: "Barrel", note: "The rope is wound on it. Turning one way winds one end on and lets the other end off." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One rope with both ends tied to the tiller. The red marks on it show which way it is moving." },
    { key: "pulleys", color: "#4FA58A", name: "Guide pulleys", note: "Two wheels that turn the rope round the corner, so it can pull the tiller sideways." },
    { key: "tiller", color: "#8E7AA8", name: "Tiller", note: "A long lever fixed to the top of the rudder. When the rope pulls its end, the rudder turns." }
  ],
  controls: [{ id: "k", label: "Barrel", value: "1", options: [["0.6", "Thin"], ["1", "Medium"], ["1.3", "Thick"]] }],
  readouts: [{ id: "w", label: "Wheel" }, { id: "r", label: "Rudder" }],
  views: { "3d": [196, -30, 400], front: [0, 0, 500], side: [560, 40, 20] },
  target: [0, 0, -20],
  distance: [120, 2000],
  how: [
    "The wheel turns the barrel. One end of the rope winds onto the barrel and the other end unwinds from it. The rope runs from the barrel round a guide pulley to the end of the tiller. The other end goes round the other pulley to the same place.",
    "So when one part of the rope is pulled in, the other is let out by the same amount. The pulled end drags the tiller towards its pulley, and the rudder turns. Turn the wheel back and the tiller swings back.",
    "A thick barrel takes in more rope with each turn, so the rudder swings further. Try Thin, then Thick, and watch the tiller."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a plan view, so the model is laid flat and seen from above. Brown does not show how it is held up. The floor, the posts under the bearings and pulleys, the rudder post and the wheel's spokes were made up. The wheel is turned back and forth, as a ship's wheel is, so the rope never runs out. The rope is treated as one that does not stretch.",

  build: function (c) {
    var T = c.THREE, P = c.P, S = .5, i;
    var o = this.o = { ph: 0, th: 0, ph0: 0 };
    var root = new T.Group(); root.scale.set(S, S, S); root.position.set(-15, 0, 0); c.scene.add(root);
    var Z0 = 41, TUBE = 3, DECK = -206;                       // rope plane height; deck top
    o.Z0 = Z0; o.RP = 28; o.A1 = [-108, 0, Z0]; o.A2 = [-68, 0, Z0]; o.C1 = [-45, 175, Z0]; o.C2 = [-45, -175, Z0]; o.PX = 245; o.L = 210;
    var mw = c.mat("wheel"), mb = c.mat("barrel"), mr = c.mat("rope"), mp = c.mat("pulleys"), mt = c.mat("tiller");
    // everything on the shaft turns together
    o.assy = new T.Group(); root.add(o.assy);                 // z is set in step() to suit the barrel
    var A = o.assy;
    P.at(P.cylX(8, 205, mw), -108, 0, 0, A);                  // shaft x -210.5 .. -5.5 (round ends inside the wheel hub and the collar)
    var wheel = new T.Group(); P.at(wheel, -205, 0, 0, A);    // wheel x -225 .. -185
    var disc = P.pulley({ radius: 150, width: 36, rim: 10, spokes: 8, hub: 26, material: mw }); disc.rotation.y = Math.PI / 2; wheel.add(disc);
    for (i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, hd = new T.Group(); hd.rotation.x = a; wheel.add(hd);                  // handle sticks out along +Y of its group
      P.at(P.cylY(6, 28, mw), 0, 164, 0, hd); P.at(P.sphere(9, i === 0 ? c.mat("wheel", "mark") : mw), 0, 183, 0, hd);
    }
    P.at(P.cylX(24, 32, mw), -164, 0, 0, A);                  // collars, x -180 .. -148 and -35 .. -5
    P.at(P.cylX(18, 30, mw), -20, 0, 0, A);
    o.bar = new T.Group(); P.at(o.bar, 0, 0, 0, A);           // scaled in y and z for the barrel size
    var dr = P.drum({ radius: 38, length: 70, flange: 8, flangeThick: 4, material: mb }); dr.rotation.y = Math.PI / 2; P.at(dr, -90, 0, 0, o.bar);   // x -129 .. -51
    for (i = 0; i < 6; i++) { var hp = P.hoop(38 + TUBE, TUBE, mr); hp.rotation.y = Math.PI / 2; P.at(hp, -108 + 8 * i, 0, 0, o.bar); }
    P.at(P.box(1.5, 10, 5, c.mat("barrel", "mark")), -51 + 0, 36, 0, o.bar);   // placeholder, moved below
    o.bar.children[o.bar.children.length - 1].position.set(-50 + .75, 46 - 5, 0);   // red stripe on the right flange face (x -51), lifted
    // posts under the collars
    o.postA = P.at(P.box(16, 30, 1, c.fixed), -164, 0, 0, root); o.postB = P.at(P.box(16, 30, 1, c.fixed), -20, 0, 0, root);
    // guide pulleys on their arms
    o.pul = [o.C1, o.C2].map(function (C, j) {
      var s = j ? -1 : 1, w = P.ropeWheel({ radius: 28, tube: TUBE, spokes: 4, material: mp }); P.at(w, C[0], C[1], Z0, root);
      var arm = P.box(60, 16, 5, mp); arm.position.set(C[0] + 24, C[1] + s * 14, Z0 - 11.5); arm.rotation.z = s * .5; root.add(arm);   // z Z0-14 .. Z0-9
      P.at(P.cylZ(4, 26, mp), C[0], C[1], Z0 - 1, root);                                                                           // pin z Z0-14 .. Z0+12
      P.at(P.cylZ(7, Z0 - 14 - DECK, c.fixed), C[0], C[1], (Z0 - 14 + DECK) / 2, root);                                           // post: deck top up to the arm
      return w;
    });
    P.at(P.box(520, 420, 4, c.fixed), 15, 0, DECK - 2, root);   // the floor: x -245 .. 275, y -210 .. 210, z -210 .. -206
    // tiller on the rudder post
    P.at(P.cylZ(12, Z0 - 13 - DECK, mt), o.PX, 0, (Z0 - 13 + DECK) / 2, root);                // post z -206 .. 28
    o.til = new T.Group(); P.at(o.til, o.PX, 0, Z0 - 9, root);                                // tiller z 28 .. 36 at the boss
    P.at(P.cylZ(30, 8, mt), 0, 0, 0, o.til); P.at(P.box(14, 14, 1, c.mat("tiller", "dark")), 0, 0, 4.6, o.til);
    P.at(P.box(215, 18, 6, mt), -107.5, 0, 0, o.til);
    P.at(P.cylZ(5, 17, mt), -o.L, 0, 3.5, o.til);
    o.r1 = P.ropePath({ material: mr, tube: 2.2, marks: 1, mark: c.mat("rope", "mark") }); root.add(o.r1);
    o.r2 = P.ropePath({ material: mr, tube: 2.2, marks: 1, mark: c.mat("rope", "mark") }); root.add(o.r2);
  },

  step: function (c, dt, S) {
    var o = this.o, k = +S.controls.k, M = Math.PI, i, Z0 = o.Z0, DECK = -206, TUBE = 3;
    o.ph += S.w * dt;
    var th = 2.3 * Math.sin(o.ph), rbe = 41 * k;
    function tin(A, C, r, cw) {
      var dx = A[0] - C[0], dy = A[1] - C[1], b = Math.atan2(dy, dx), d = Math.acos(r / Math.hypot(dx, dy)), best = 0;
      [b + d, b - d].forEach(function (a) {
        var ex = C[0] + r * Math.cos(a), ey = C[1] + r * Math.sin(a), tx = cw ? Math.sin(a) : -Math.sin(a), ty = cw ? -Math.cos(a) : Math.cos(a);
        if ((ex - A[0]) * tx + (ey - A[1]) * ty > 0) best = a;
      });
      return best;
    }
    function geom(A, C, r, cw, Tp) {
      var ai = tin(A, C, r, cw), ao = tin(Tp, C, r, !cw), wrap;      // leaving the wheel is arriving backwards, so the sense flips
      wrap = cw ? ai - ao : ao - ai; wrap = ((wrap % (2 * M)) + 2 * M) % (2 * M);
      var E1 = [C[0] + r * Math.cos(ai), C[1] + r * Math.sin(ai)], E2 = [C[0] + r * Math.cos(ao), C[1] + r * Math.sin(ao)];
      return { ai: ai, ao: ao, wrap: wrap, len: Math.hypot(E1[0] - A[0], E1[1] - A[1]) + r * wrap + Math.hypot(Tp[0] - E2[0], Tp[1] - E2[1]) };
    }
    function tip(ph) { return [o.PX - o.L * Math.cos(ph), o.L * Math.sin(ph), Z0]; }
    function f(ph) { var t = tip(ph); return (geom(o.A1, o.C1, o.RP, true, t).len - geom(o.A2, o.C2, o.RP, false, t).len) / 2; }
    var base = f(0), target = -rbe * th + base, lo = -1.1, hi = 1.1, ph;
    for (i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (f(mid) > target) lo = mid; else hi = mid; }   // f falls as the tiller swings up
    ph = (lo + hi) / 2;
    var Tp = tip(ph);
    var g1 = geom(o.A1, o.C1, o.RP, true, Tp), g2 = geom(o.A2, o.C2, o.RP, false, Tp);
    function pa(g, C, cw) { return { c: C, r: o.RP, a0: g.ai, a1: cw ? g.ai - g.wrap : g.ai + g.wrap }; }
    o.r1.markS = [200 - rbe * th]; o.r1.set([o.A1, pa(g1, o.C1, true), Tp]);
    o.r2.markS = [200 + rbe * th]; o.r2.set([o.A2, pa(g2, o.C2, false), Tp]);
    o.til.rotation.z = -ph;
    o.pul[0].rotation.z = o.pul[1].rotation.z = rbe * th / o.RP;
    // shaft height so the rope plane stays put whatever the barrel size
    var zs = Z0 - rbe;
    o.assy.position.z = zs; o.assy.rotation.x = th; o.bar.scale.set(1, k, k);
    [[o.postA, 24], [o.postB, 18]].forEach(function (p) {
      var top = zs - p[1], h = top - (DECK); p[0].scale.z = h; p[0].position.z = DECK + h / 2;
    });
    S.set("w", (th / (2 * M) >= 0 ? "+" : "") + (th / (2 * M)).toFixed(2) + " turn");
    S.set("r", (ph >= 0 ? "+" : "") + Math.round(ph * 180 / M) + "°");
  }
});
