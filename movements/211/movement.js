M507.define({
  number: 211,
  title: "Intermittent pinion with a locking curve",
  lede: "A big gear turns all the time, but the small gear beside it, called a pinion, turns only now and then. Each time the big gear goes round once, the small gear makes exactly one turn and then stops. While it waits, it is locked so it cannot creep.",
  alt: "A big gear with teeth on only part of its edge, the rest of the edge plain. Beside it on the left a small gear with a curved arm on its front and a green plate behind it whose edge is hollowed to fit the plain rim. A small pin stands on the face of the big gear just ahead of its teeth.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Big gear", note: "Turns steadily. It has teeth on about a third of its edge and a plain rim on the rest. The red pin on its face is the one to watch." },
    { key: "pinion", color: "#C8873A", name: "Small gear", note: "It has teeth all the way round. It turns once each time the big gear's teeth pass, then waits." },
    { key: "guide", color: "#D9B13B", name: "Guide piece", note: "An arm on the front of the small gear. The pin on the big gear strikes it and starts the small gear turning, so the first teeth meet cleanly." },
    { key: "lock", color: "#4FA58A", name: "Locking plate", note: "A plate behind the small gear. Its edge is hollowed to the same curve as the big gear's plain rim, so it holds the small gear still while the rim slides past." }
  ],
  readouts: [{ id: "out", label: "Small gear" }, { id: "n", label: "Turns" }],
  views: { "3d": [300, 170, 640], front: [-46, 0, 700], side: [700, 0, 0] },
  target: [-46, 0, 0],
  how: [
    "The big gear turns steadily. For most of its turn the small gear stands still. Then the red pin on the big gear hits the curved arm on the small gear. The small gear starts to move, the teeth meet, and they carry it round once. Then it stops again.",
    "Behind the small gear is a green plate. Its edge is hollowed into the same curve as the big gear's plain rim. While the plain rim passes, it slides round inside that hollow. The plate cannot turn without cutting into the rim, so the small gear is locked. Where the big gear has teeth, the plain disc behind them is cut back, so the green plate is free to swing round.",
    "Watch the Turns readout. Each turn of the big gear adds exactly one. Slow the speed right down and watch the pin start the small gear before the first tooth arrives."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate and base that hold the shafts, the sizes, the number of teeth and the shape of the guide piece were made up. Brown's locking piece and guide are hard to make out, so here the locking plate sits behind the small gear and the gear's plain rim is a disc behind its teeth. The motion was worked out so the pin and the teeth push the small gear exactly one turn and nothing rubs. As in a real one, the small gear starts and stops with a small knock.",

  /* Kinematics, worked out once in build (and by the node test). Gear at the origin turning anticlockwise by t; small gear at
     (-C, 0) turning clockwise (its angle q goes negative). Both have the plain straight-sided teeth of P.spurGear (module 6,
     42 and 14 teeth); the wheel keeps teeth 7..17 only. The pin's push is found from the outlines: the gear stands still until
     the pin would cut into the guide, then turns just far enough to clear. In mesh the gear turns three times as fast as the
     wheel with a gap facing each wheel tooth on the line of centres. The gear follows whichever is further on and stops dead
     after one turn. Its teeth are set PHP degrees round from the guide and plate: checked in node, every value from -5 to 13
     gives a clean start and stop, so 5 sits in the middle. Over three wheel turns nothing cuts into anything (pin, teeth,
     plate), the gear turns exactly three times, and while at rest the plate cannot turn either way. The disc behind the
     wheel is cut back wherever the moving plate passes, with 0.6 to spare. */
  _kin: function (o) {
    var TAU = 2 * Math.PI, D = Math.PI / 180, MD = 6, NP = 14, NW = 42, rp = 42, Rw = 126, C = 168, K0 = 7, K1 = 17, PHP = (o && o.php !== undefined ? o.php : 5) * D, MM = o && o.mm !== undefined ? o.mm : 20;
    var PINA = 154 * D, PINR = 112, PINr = 4, GL = 75, GW = 11, GAM = 32 * D, BEND = 26 * D, RL = 132, RLP = 56, CL = .6, NT = 3600, T0 = -20 * D;
    function gearPoly(N, from, to, ph) {
      var rpp = N * MD / 2, ra = rpp + MD, rf = rpp - 1.25 * MD, st = TAU / N, pts = [], k, all = from === undefined;
      if (all) { from = 0; to = N - 1; }
      for (k = from; k <= to; k++) { var a = ph + k * st; [[rf, -.27], [ra, -.11], [ra, .11], [rf, .27]].forEach(function (q) { pts.push([q[0] * Math.cos(a + q[1] * st), q[0] * Math.sin(a + q[1] * st)]); }); }
      if (!all) { var a1 = ph + to * st + .27 * st, a0 = ph + from * st - .27 * st + TAU, n = Math.ceil((a0 - a1) / .01); for (k = 1; k < n; k++) { var b = a1 + (a0 - a1) * k / n; pts.push([rf * Math.cos(b), rf * Math.sin(b)]); } }
      return pts;
    }
    function polar(poly) {                                 // star-shaped outline round the origin: radius by angle
      var NB = 14400, tab = new Float64Array(NB), i, j;
      for (i = 0; i < poly.length; i++) {
        var A = poly[i], B = poly[(i + 1) % poly.length], aA = Math.atan2(A[1], A[0]), d = Math.atan2(B[1], B[0]) - aA; d -= TAU * Math.round(d / TAU);
        for (j = Math.ceil(Math.min(aA, aA + d) / TAU * NB); j <= Math.floor(Math.max(aA, aA + d) / TAU * NB); j++) {
          var a = j * TAU / NB, ux = Math.cos(a), uy = Math.sin(a), ex = B[0] - A[0], ey = B[1] - A[1], den = ux * ey - uy * ex, jj = ((j % NB) + NB) % NB;
          if (Math.abs(den) > 1e-12) tab[jj] = Math.max(tab[jj], (A[0] * ey - A[1] * ex) / den);
        }
      }
      return function (x, y) { var u = (Math.atan2(y, x) / TAU + 1) * NB, k = Math.floor(u), f = u - k; k %= NB; return tab[k] + (tab[(k + 1) % NB] - tab[k]) * f; };
    }
    function dens(poly, step, open) {
      var out = [], n = poly.length, i, t;
      for (i = 0; i < (open ? n - 1 : n); i++) { var a = poly[i], b = poly[(i + 1) % n], m = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (t = 0; t < m; t++) out.push([a[0] + (b[0] - a[0]) * t / m, a[1] + (b[1] - a[1]) * t / m]); }
      if (open) out.push(poly[n - 1]);
      return out;
    }
    function inPoly(p, poly) { var c = false, i, j; for (i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
    function polyDist(p, poly) {
      var d = 1e9, i; for (i = 0; i < poly.length; i++) {
        var a = poly[i], b = poly[(i + 1) % poly.length], ex = b[0] - a[0], ey = b[1] - a[1], l = ex * ex + ey * ey, t = l ? ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / l : 0;
        t = Math.max(0, Math.min(1, t)); d = Math.min(d, Math.hypot(p[0] - a[0] - t * ex, p[1] - a[1] - t * ey));
      }
      return inPoly(p, poly) ? -d : d;
    }
    var wheel = gearPoly(NW, K0, K1, 0), wR = polar(wheel), wTeeth = dens(wheel.slice(0, (K1 - K0 + 1) * 4), .4, true);
    var pinion = gearPoly(NP, undefined, undefined, PHP), pR = polar(pinion), pD = dens(pinion, .4);
    // guide: a curved arm from the hub, bending up towards its round tip (angle GAM - BEND at the hub, GAM at the tip)
    var guide = [], left = [], i, ns = 24;
    function cl(u) { var r = 12 + (GL - 12) * u, a = GAM - BEND * (1 - u) * (1 - u); return [r * Math.cos(a), r * Math.sin(a)]; }
    for (i = 0; i <= ns; i++) {
      var u = i / ns, p0 = cl(Math.max(0, u - .01)), p1 = cl(Math.min(1, u + .01)), pc = cl(u), tx = p1[0] - p0[0], ty = p1[1] - p0[1], l = Math.hypot(tx, ty), W = (GW - 3 * u) / 2;
      guide.push([pc[0] + ty / l * W, pc[1] - tx / l * W]); left.push([pc[0] - ty / l * W, pc[1] + tx / l * W]);
    }
    var pe = cl(1), pd = cl(.99), ae = Math.atan2(pe[1] - pd[1], pe[0] - pd[0]), We = (GW - 3) / 2;
    for (i = 1; i < 12; i++) { var b = ae - Math.PI / 2 + Math.PI * i / 12; guide.push([pe[0] + We * Math.cos(b), pe[1] + We * Math.sin(b)]); }
    guide = guide.concat(left.reverse());
    // locking plate: a disc of radius RLP with a hollow of radius RL + CL round the wheel centre (at (C, 0) in the gear's frame at rest)
    var plate = [], ha = Math.acos((C * C + RLP * RLP - (RL + CL) * (RL + CL)) / (2 * C * RLP)), hb = Math.asin(RLP * Math.sin(ha) / (RL + CL)), n = 240;
    for (i = 0; i <= n; i++) { var a = ha + (TAU - 2 * ha) * i / n; plate.push([RLP * Math.cos(a), RLP * Math.sin(a)]); }
    for (i = 1; i < 40; i++) { var e = -hb + 2 * hb * i / 40; plate.push([C - (RL + CL) * Math.cos(e), (RL + CL) * Math.sin(e)]); }
    function pinHits(t, q) {                              // does the pin cut into the guide?
      var x = PINR * Math.cos(PINA + t) + C, y = PINR * Math.sin(PINA + t), cq = Math.cos(q), sq = Math.sin(q);
      return Math.hypot(x, y) < GL + 10 && polyDist([x * cq + y * sq, -x * sq + y * cq], guide) < PINr;
    }
    // 1. the pin's push: the gear stands still until the pin would cut into the guide, then turns just far enough to clear
    var tab = new Float64Array(NT + 1), q = 0, it, lo, hi, m;
    for (i = 0; i <= NT; i++) {
      var t = T0 + i * TAU / NT;
      if (pinHits(t, q)) {
        lo = hi = q; for (it = 0; it < 4000 && pinHits(t, hi); it++) { lo = hi; hi -= .002; }
        for (it = 0; it < 30; it++) { m = (lo + hi) / 2; if (pinHits(t, m)) lo = m; else hi = m; }
        q = hi;
      }
      tab[i] = q;
    }
    // 2. the teeth: in mesh the gear turns three times as fast as the wheel, with a gap of the gear facing each wheel tooth as
    // it crosses the line of centres. The gear follows whichever is further on, and stops dead after exactly one turn.
    var STP = TAU / NP, Q0 = STP / 2 - PHP - MM * STP;
    function qIdeal(t) { return 3 * (Math.PI - t) + Q0; }
    for (i = 0; i <= NT; i++) tab[i] = Math.max(-TAU, Math.min(tab[i], qIdeal(T0 + i * TAU / NT)));
    // lock disc behind the wheel: radius RL, cut back wherever the moving plate passes
    var NB = 1440, cut = new Float64Array(NB).fill(RL), pp = dens(plate, 1);
    for (i = 0; i <= NT; i++) {
      if (tab[i] > -1e-9 || tab[i] < -TAU + 1e-9) continue;
      var tt = T0 + i * TAU / NT, ct = Math.cos(tt), st = Math.sin(tt), cq = Math.cos(tab[i]), sq = Math.sin(tab[i]);
      for (var j = 0; j < pp.length; j++) {
        var x = pp[j][0] * cq - pp[j][1] * sq - C, y = pp[j][0] * sq + pp[j][1] * cq, X = x * ct + y * st, Y = -x * st + y * ct, r = Math.hypot(X, Y);
        if (r < RL + 1) { var k = Math.round((Math.atan2(Y, X) / TAU + 1) * NB), kk; for (kk = k - 1; kk <= k + 1; kk++) { var mm = ((kk % NB) + NB) % NB; cut[mm] = Math.min(cut[mm], r - CL); } }
      }
    }
    var lockPoly = []; for (i = 0; i < NB; i++) { var a = i * TAU / NB; lockPoly.push([cut[i] * Math.cos(a), cut[i] * Math.sin(a)]); }
    function qOf(t) {                                      // gear angle for any wheel angle, over any number of turns
      var u = (t - T0) / TAU, n = Math.floor(u), f = (u - n) * NT, k = Math.min(NT - 1, Math.floor(f));
      return -n * TAU + tab[k] + (tab[k + 1] - tab[k]) * (f - k);
    }
    return { qOf: qOf, qIdeal: qIdeal, pinHits: pinHits, wheel: wheel, pinion: pinion, guide: guide, plate: plate, lockPoly: lockPoly, C: C, T0: T0,
      PINA: PINA, PINR: PINR, PINr: PINr, RL: RL, CL: CL, tab: tab, NT: NT, polar: polar, dens: dens };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this._kin(), XW = 46, XP = XW - K.C;
    var o = this.o = { K: K, t: 12 * Math.PI / 180 };                       // opening: the pin has just met the guide, as Brown draws it
    function plate(pts, z0, z1, mat) {
      var sh = new T.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return new T.Mesh(g, mat);
    }
    // big wheel at (XW, 0): lock disc z -26..-10, web z -10..-8 (radius 104, inside every part of the small gear's reach of 112),
    // toothed layer z -8..8, hub z 8..12, pin z 8..20 at radius 112 (the body runs out to the tooth roots at 118.5)
    o.wheel = new T.Group(); o.wheel.position.x = XW; scene.add(o.wheel);
    o.wheel.add(plate(K.lockPoly, -26, -10, c.mat("wheel")));
    P.at(P.cylZ(104, 2, c.mat("wheel")), 0, 0, -9, o.wheel);                  // web z -10..-8, joins the two layers
    o.wheel.add(plate(K.wheel, -8, 8, c.mat("wheel")));
    P.at(P.cylZ(8, 48, c.mat("wheel")), 0, 0, -16, o.wheel);                  // shaft z -40..8, from the plate face
    P.at(P.cylZ(16, 4, c.mat("wheel")), 0, 0, 10, o.wheel);                   // hub z 8..12, on the face
    P.at(P.cylZ(K.PINr, 12, c.mat("wheel", "mark")), K.PINR * Math.cos(K.PINA), K.PINR * Math.sin(K.PINA), 14, o.wheel);   // pin z 8..20
    // small gear at (XP, 0): locking plate z -26..-10, hub z -10..-8, gear z -8..8, front hub z 8..18, guide z 10..18
    o.pin = new T.Group(); o.pin.position.x = XP; scene.add(o.pin);
    o.pin.add(plate(K.plate, -26, -10, c.mat("lock")));
    P.at(P.cylZ(14, 2, c.mat("pinion")), 0, 0, -9, o.pin);                    // hub z -10..-8
    o.pin.add(plate(K.pinion, -8, 8, c.mat("pinion")));
    P.at(P.cylZ(6, 48, c.mat("pinion")), 0, 0, -16, o.pin);                   // shaft z -40..8, from the plate face
    P.at(P.cylZ(12, 10, c.mat("pinion")), 0, 0, 13, o.pin);                   // hub z 8..18, the guide is fixed to it
    o.pin.add(plate(K.guide, 10, 18, c.mat("guide")));
    // supports
    P.at(P.box(470, 300, 10, c.fixed), -46, 0, -45, scene);                    // plate x -281..189, y -150..150, z -50..-40; shafts end at z -40
    P.at(P.box(510, 12, 110, c.fixed), -46, -156, -40, scene);                 // base x -301..209, y -162..-150, z -95..15; plate stands on y -150
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, e = 1e-3;
    o.t += S.w * dt;
    var q = K.qOf(o.t);
    o.wheel.rotation.z = o.t; o.pin.rotation.z = q;
    var rpm = S.playing ? Math.round((K.qOf(o.t + e) - K.qOf(o.t - e)) / (2 * e) * S.rpm * 10) / 10 : 0;   // clockwise comes out negative
    S.set("out", (rpm < 0 ? "−" + -rpm : rpm) + " rpm");
    var n = Math.floor(-q / (2 * Math.PI) + 1e-6);                            // whole turns finished since the start
    S.set("n", n + (n === 1 ? " turn" : " turns"));
  }
});
