M507.define({
  number: 401,
  title: "Brownell's crank past the dead centre",
  lede: "A treadle turns a wheel through a rod and a crank pin. When the pin is in line with the rod, pushing the treadle cannot turn the wheel. Here the pin sits on a small slide, so the push moves the pin past that point first.",
  alt: "A big wheel with a raised rim. On its face, above the centre, a flat slide with two slots is held by two screws. A red pin on the slide carries a long rod down to a treadle near the floor. A small coiled spring round the hub is hooked to the slide.",
  parts: [
    { key: "treadle", color: "#5E7387", name: "Treadle and rod", note: "A lever pivoted near its middle. The foot presses its right end down, so its left end pushes the long rod up." },
    { key: "wheel", color: "#C8873A", name: "Wheel", note: "The wheel to be turned. Two screws on its face hold the slide." },
    { key: "slide", color: "#D9B13B", name: "Slotted slide", note: "It can slide a little along its two slots. The red crank pin is fixed to it. Watch the pin." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "A coiled spring round the hub, hooked to the slide. It pulls the slide back against its stops." }
  ],
  readouts: [{ id: "sl", label: "Slide" }, { id: "w", label: "Wheel" }],
  speed: { min: 5, max: 40, value: 15, label: "Wheel speed", unit: "rpm" },
  views: { "3d": [375, 95, 805], front: [0, -110, 900], side: [900, -110, 60] },
  target: [0, -110, 0],
  distance: [300, 2200],
  how: [
    "The rod joins the treadle to the red pin on the wheel. When the pin is at the very bottom, the rod points straight at the centre of the wheel. A push along it cannot turn the wheel either way. This is called a dead centre.",
    "Here the wheel stops at that point each turn. The foot presses, and the rod pushes up on the pin. The wheel cannot turn, but the pin can still move sideways with the slide. The stops keep the slide from moving back, so it slides forward along its slots. Now the pin is past the dead centre, and the push turns the wheel. Then the spring pulls the slide back against its stops, ready for next time.",
    "Turn the speed down and watch the readouts. The wheel reads 0 rpm while the slide moves out, then the wheel starts to turn."
  ],
  note: "This model is rebuilt from Brown's drawing. The bearing, the floor and its bracket, and all sizes were made up. The spring is drawn as a small coil round the hub with a wire to the slide. The model stops the wheel at the lower dead centre every turn, as if the treadle were worked very slowly; a running wheel would usually swing past by itself.",

  // O wheel centre (origin); RC wrist radius; TP treadle pivot; RJ its arm to the rod joint; LP rod length; DM slide travel.
  K: { RC: 40, TP: [115, -248], RJ: Math.hypot(120, 18), LP: 270, DM: 12, T1: .3, RET: 50 * Math.PI / 180, AJ0: Math.atan2(18, -120) },

  cy: function (x) { x = Math.max(0, Math.min(1, x)); return x - Math.sin(2 * Math.PI * x) / (2 * Math.PI); },
  /** Wrist position for wheel angle th (anticlockwise; 0 = slide at the top as drawn) and slide travel d (forward = the
      way the wheel turns, so -x when the slide is at the top). */
  wrist: function (th, d) { var c = Math.cos(th), s = Math.sin(th); return [-d * c - this.K.RC * s, -d * s + this.K.RC * c]; },
  /** Rod joint on the treadle: where the circle round the treadle pivot meets the circle round the wrist. Of the two
      meeting points, the one on the left of the pivot. */
  joint: function (W) {
    var K = this.K, ax = K.TP[0], ay = K.TP[1], dx = W[0] - ax, dy = W[1] - ay, dd = Math.hypot(dx, dy);
    var a = (K.RJ * K.RJ - K.LP * K.LP + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, K.RJ * K.RJ - a * a)), ux = dx / dd, uy = dy / dd;
    var p1 = [ax + a * ux - h * uy, ay + a * uy + h * ux], p2 = [ax + a * ux + h * uy, ay + a * uy - h * ux];
    return p1[0] < p2[0] ? p1 : p2;
  },
  /** Lower dead centre: the wheel angle (slide at its stops) where the rod points through the wheel centre. */
  dead: function () {
    var self = this, lo = Math.PI - .6, hi = Math.PI + .6, k;
    function f(th) { var W = self.wrist(th, 0), J = self.joint(W); return W[0] * J[1] - W[1] * J[0]; }
    var flo = f(lo);
    for (k = 0; k < 60; k++) { var m = (lo + hi) / 2, fm = f(m); if ((fm < 0) === (flo < 0)) { lo = m; flo = fm; } else hi = m; }
    return (lo + hi) / 2;
  },
  /** Whole state at cycle position s (one cycle = T1 + 1). First the wheel waits at the dead centre while the push moves
      the slide out; then the wheel makes one turn, easing in and out, and the spring brings the slide back over the
      first RET of it. */
  state: function (s, thd) {
    var K = this.K, n = Math.floor(s / (K.T1 + 1)), r = s - n * (K.T1 + 1), th, d;
    if (r < K.T1) { th = thd; d = K.DM * this.cy(r / K.T1); }
    else { th = thd + 2 * Math.PI * this.cy(r - K.T1); d = K.DM * (1 - this.cy((th - thd) / K.RET)); }
    var W = this.wrist(th, d), J = this.joint(W);
    return { th: th + 2 * Math.PI * n, d: d, W: W, J: J, ga: Math.atan2(J[1] - K.TP[1], J[0] - K.TP[0]) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { thd: this.dead(), s: 0, th: null, rpm: 0 };
    // start as drawn, with the slide at the top: inside the turn, th = 2 pi, so cy(v) = (2 pi - thd) / 2 pi
    var target = (2 * Math.PI - o.thd) / (2 * Math.PI), lo = 0, hi = 1, k;
    for (k = 0; k < 50; k++) { var m = (lo + hi) / 2; if (this.cy(m) < target) lo = m; else hi = m; }
    o.s = K.T1 + lo;
    // floor top y -330; wheel shaft bearing behind the wheel (z -27..-13), foot on the floor
    P.at(P.box(520, 10, 120, c.fixed), 20, -335, -10, scene);                 // x -240..280, y -340..-330, z -70..50
    P.at(P.bearingBlock({ bore: 7.5, outer: 16, drop: 330, width: 14, material: c.fixed }), 0, 0, -20, scene);
    // wheel: disc z -12..0 radius 122, rim ring z 0..6 (r 100..122), hub z 0..8 radius 10, shaft z -27..-12
    o.wheel = new T.Group(); scene.add(o.wheel);
    var mw = c.mat("wheel");
    P.at(P.cylZ(122, 12, mw), 0, 0, -6, o.wheel);
    var rg = new T.Shape(); rg.absarc(0, 0, 122, 0, 2 * Math.PI, false); var rh = new T.Path(); rh.absarc(0, 0, 100, 0, 2 * Math.PI, true); rg.holes.push(rh);
    o.wheel.add(new T.Mesh(new T.ExtrudeGeometry(rg, { depth: 6, bevelEnabled: false, curveSegments: 72 }), mw));   // z 0..6
    P.at(P.cylZ(10, 8, mw), 0, 0, 4, o.wheel);
    P.at(P.cylZ(7, 15, mw), 0, 0, -19.5, o.wheel);
    // two screws fixed in the wheel at (+-40, 38): shank z 0..7.5 through the slots, head z 6.5..8.5 radius 6.5
    [-40, 40].forEach(function (x) {
      P.at(P.cylZ(4, 7.5, c.mat("wheel", "dark")), x, 38, 3.75, o.wheel);
      P.at(P.cylZ(6.5, 2, c.mat("wheel", "dark")), x, 38, 7.5, o.wheel);
    });
    // the slide (z 0..6 on the wheel face), in its own group inside the wheel; slots y 38, x -40..-28 and 40..52, width 9
    o.slide = new T.Group(); o.wheel.add(o.slide);
    var sh = new T.Shape(); sh.moveTo(-56, 22); sh.lineTo(56, 22); sh.lineTo(74, 50); sh.lineTo(-74, 50); sh.closePath();
    [[-40, -28], [40, 52]].forEach(function (q) {
      var p = new T.Path(); p.moveTo(q[0], 33.5); p.absarc(q[0], 38, 4.5, -Math.PI / 2, -1.5 * Math.PI, true); p.lineTo(q[1], 42.5);
      p.absarc(q[1], 38, 4.5, Math.PI / 2, -Math.PI / 2, true); p.closePath(); sh.holes.push(p);
    });
    o.slide.add(new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false }), c.mat("slide")));
    P.at(P.cylZ(5, 13.5, c.mat("slide", "mark")), 0, K.RC, 12.75, o.slide);   // wrist z 6..19.5
    P.at(P.cylZ(2.5, 6, c.mat("slide")), -14, 25, 9, o.slide);                // hook pin for the spring wire, z 6..12
    // spring: a flat coil round the hub, z 1..5, inner end fixed at angle 150, outer end near angle 60 (r 20)
    o.spr = P.spiralSpring({ rIn: 12, rOut: 20, width: 4, thick: 1.4, material: c.mat("spring") });
    o.spr.rotation.z = 150 * Math.PI / 180; P.at(o.spr, 0, 0, 3, o.wheel);
    o.wire = P.at(P.rod(1, c.mat("spring")), 0, 0, 0, o.wheel);
    // rod z 13..19 and treadle z 6..12; joint pin z 6..19.5; treadle pivot pin z -4..12.5 on a bracket z -4..5.5
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.armPlate({ length: K.LP, r0: 7, thick: 6, material: c.mat("treadle") }), 0, 0, 16, o.rod);
    o.jpin = P.at(P.cylZ(4, 13.5, c.mat("treadle")), 0, 0, 12.75, scene);
    o.tr = new T.Group(); P.at(o.tr, K.TP[0], K.TP[1], 0, scene);
    var jl = [K.RJ * Math.cos(K.AJ0), K.RJ * Math.sin(K.AJ0)], ux = jl[0] / K.RJ, uy = jl[1] / K.RJ;
    var tp = P.strokeOutline([[jl[0] + 6 * ux, jl[1] + 6 * uy], [0, 0], [95, -4]], 12);   // from 6 past the joint, through the pivot, to the foot end
    P.at(P.outlinePlate({ points: tp, depth: 6, z0: 6, material: c.mat("treadle") }), 0, 0, 0, o.tr);   // z 6..12
    P.at(P.cylZ(9, 7, c.mat("treadle")), 0, 0, 9, o.tr);                     // bosses z 5.5..12.5, thicker than the bar
    P.at(P.cylZ(9, 7, c.mat("treadle")), jl[0], jl[1], 9, o.tr);
    var fpl = P.box(30, 4, 24, c.mat("treadle", "dark")); fpl.rotation.z = Math.atan2(-4, 95);
    P.at(fpl, 78, -3.3 + 6, 9, o.tr);                                         // foot plate on top of the bar near its right end, z -3..21
    P.at(P.cylZ(4, 17, c.fixed), K.TP[0], K.TP[1], 4.5, scene);               // pivot pin z -4..13, from the bracket through the boss
    P.at(P.box(24, -248 + 330 + 12, 9.5, c.fixed), K.TP[0], (-248 + 12 - 330) / 2, .75, scene);   // bracket y -330..-236, z -4..5.5
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    o.s += S.w * dt / (2 * Math.PI);
    var q = this.state(o.s, o.thd);
    if (o.th !== null && dt > 0) o.rpm = (q.th - o.th) / dt * 60 / (2 * Math.PI);
    if (!S.playing) o.rpm = 0;
    o.th = q.th;
    o.wheel.rotation.z = q.th;
    o.slide.position.x = -q.d;
    // spring: outer end follows the hook a little, wire from the coil's end to the hook pin
    var end = 60 * Math.PI / 180 + q.d / 40, sweep = end - 150 * Math.PI / 180 + 4 * Math.PI;
    o.spr.set(sweep, 1 + q.d / 60);
    o.wire.span(20 * Math.cos(end), 20 * Math.sin(end), 4.5, -14 - q.d, 25, 10);   // from the coil's top edge, rising clear of the slide (z 6 from y 22)
    o.rod.position.set(q.J[0], q.J[1], 0); o.rod.rotation.z = Math.atan2(q.W[1] - q.J[1], q.W[0] - q.J[0]);
    o.jpin.position.set(q.J[0], q.J[1], 12.75);
    o.tr.rotation.z = q.ga - K.AJ0;
    S.set("sl", Math.round(q.d) + " mm");
    var r = Math.round(o.rpm);
    S.set("w", (r > 0 ? "+" : r < 0 ? "−" : "") + Math.abs(r) + " rpm");
  }
});
