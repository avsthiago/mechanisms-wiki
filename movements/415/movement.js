M507.define({
  number: 415,
  title: "Dickson's two-pawl lever",
  lede: "A lever rocks to and fro inside a wheel and turns it a step at a time. Two small hooks, called pawls, on the lever press on the inside of the rim, one for each direction. A small crank lifts one and lets the other down, so the wheel can be sent either way.",
  alt: "A big spoked wheel seen face on, its rim open at the front. Inside it a T-shaped lever hangs from the wheel's shaft. Two long pawls are pinned to the lever near the shaft; the right one presses on the inside of the rim and the left one is lifted. A small crank above the shaft holds a cord to each pawl. A rod from the foot of the lever runs out to a crank on the right.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Lever", note: "Hangs loose on the wheel's shaft and is rocked to and fro by the rod at its foot." },
    { key: "wheel", color: "#C8873A", name: "Wheel", note: "Fixed to the shaft. It has no teeth; the pawls grip the smooth inside of its rim. Watch the red mark on the rim." },
    { key: "pawls", color: "#D9B13B", name: "Pawls", note: "Two pawls, pinned to the lever. The one that is down jams against the rim one way and slides the other way." },
    { key: "switch", color: "#E8E2D0", name: "Switch and cords", note: "A small crank with a cord to each pawl. Turning it pulls one pawl up off the rim and lets the other down." },
    { key: "drive", color: "#8E7AA8", name: "Crank and rod", note: "Stand in for whatever rocks the lever. One turn of the crank rocks the lever over and back once." }
  ],
  controls: [{ id: "dir", label: "Wheel turns", value: "ccw", options: [["ccw", "Anticlockwise"], ["cw", "Clockwise"]] }],
  readouts: [{ id: "l", label: "Lever" }, { id: "w", label: "Wheel turned" }],
  views: { "3d": [355, 173, 698], front: [30, 0, 800], side: [800, 0, 80] },
  target: [30, -5, 0],
  how: [
    "The crank rocks the lever over and back. The pawl that is down presses its end on the inside of the rim. On one stroke the wheel goes round with the lever. On the way back the wheel stays still and the pawl slides over the rim.",
    "The pawl stands almost straight out from the shaft, leaning a little. When the lever swings the way that would stand it up straighter, it would have to get longer to fit, so it jams hard against the rim and drags the wheel along. Swing it the other way and it tilts back and slides. Each pawl leans the opposite way, so each one drives the wheel in its own direction.",
    "Try Anticlockwise, then Clockwise. Watch the small crank on the lever swing over: its cords lift one pawl and let the other down, and the steps of the wheel change direction."
  ],
  note: "This model is rebuilt from Brown's drawing. The spokes, the crank and rod that rock the lever, the back plate, the sizes and the lean of the pawls were made up. Brown's cord runs from one pawl over the small crank to the other; here it is shown as two cords from the crank pin. The rim is smooth, as Brown says, so the pawls grip it by rubbing; the wheel is assumed to stay put while the lever swings back.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { Rr: 183, LA: 145, CX: 270, CY: -145, CR: 35, LR: 270, u: 0, ph: 0, th: 0, al: null, turned: 0 };
    var ml = c.mat("lever"), mw = c.mat("wheel"), mpw = c.mat("pawls"), ms = c.mat("switch"), md = c.mat("drive");
    // pawl C (right) when down: pivot (35, 0) on the lever, its end on the rim at 15 degrees
    var Rr = o.Rr, tx = Rr * Math.cos(Math.PI / 12), ty = Rr * Math.sin(Math.PI / 12);
    o.psi = Math.atan2(ty, tx - 35); o.len = Math.hypot(tx - 35, ty); o.lift = 30 * Math.PI / 180;

    // wheel: rim r 183..195, z -14..16 (open at the front), six spokes z -14..-8, hub z -8..-2, shaft z -40..12 with a cap
    o.wheel = new T.Group(); scene.add(o.wheel);
    var rs = new T.Shape(); rs.absarc(0, 0, 195, 0, 2 * Math.PI, false); var rh = new T.Path(); rh.absarc(0, 0, Rr, 0, 2 * Math.PI, true); rs.holes.push(rh);
    var rg = new T.ExtrudeGeometry(rs, { depth: 30, bevelEnabled: false, curveSegments: 96 }); rg.translate(0, 0, -14); o.wheel.add(P.mesh(rg, mw));
    for (i = 0; i < 6; i++) { var sa = i * Math.PI / 3 + Math.PI / 6, sp = P.box(163, 9, 6, mw); sp.rotation.z = sa; P.at(sp, 102 * Math.cos(sa), 102 * Math.sin(sa), -11, o.wheel); }   // spokes r 20.5..183.5, z -14..-8
    P.at(P.cylZ(22, 6, mw), 0, 0, -5, o.wheel);                             // hub z -8..-2
    P.at(P.cylZ(10, 48, mw), 0, 0, -16, o.wheel);                           // shaft z -40..8, through the lever's hole
    P.at(P.cylZ(14, 4, mw), 0, 0, 10, o.wheel);                             // cap z 8..12, on the lever face
    P.at(P.box(10, 12, 1, c.mat("wheel", "mark")), 0, 189, 16.5, o.wheel);  // red mark on the rim front, z 16..17

    // lever z 0..8: crossbar, stem down to the rod pin at r 145, tab up to the switch at (0, 50)
    o.lever = new T.Group(); scene.add(o.lever);
    var pts = [[-85, 10], [-10, 10]], k;
    for (k = 0; k <= 12; k++) { var a = Math.PI - k * Math.PI / 12; pts.push([10 * Math.cos(a), 50 + 10 * Math.sin(a)]); }
    pts.push([10, 10], [85, 10], [85, -18]);
    for (k = 1; k < 12; k++) { var t = k / 12; pts.push([(1 - t) * (1 - t) * 85 + 2 * t * (1 - t) * 25 + t * t * 18, (1 - t) * (1 - t) * -18 + 2 * t * (1 - t) * -22 + t * t * -55]); }
    pts.push([18, -55], [18, -145]);
    for (k = 1; k < 12; k++) { var b = -k * Math.PI / 12; pts.push([18 * Math.cos(b), -145 + 18 * Math.sin(b)]); }
    pts.push([-18, -145], [-18, -55]);
    for (k = 1; k < 12; k++) { var t2 = k / 12; pts.push([-((1 - t2) * (1 - t2) * 18 + 2 * t2 * (1 - t2) * 25 + t2 * t2 * 85), (1 - t2) * (1 - t2) * -55 + 2 * t2 * (1 - t2) * -22 + t2 * t2 * -18]); }
    pts.push([-85, -18]);
    var hole = []; for (k = 0; k < 32; k++) hole.push([10.5 * Math.cos(-k * Math.PI / 16), 10.5 * Math.sin(-k * Math.PI / 16)]);
    o.lever.add(P.outlinePlate({ points: pts, holes: [hole], depth: 8, z0: 0, material: ml }));
    P.at(P.cylZ(5, 18, ml), 0, -145, 17, o.lever);                          // rod pin z 8..26

    // pawls z 8..14 on the lever face; outline in the pawl's own frame (pivot at the origin, reaching along +X), its end cut
    // to the rim circle where it rests when down
    var cx = -35 * Math.cos(o.psi), cy = 35 * Math.sin(o.psi);              // wheel centre seen from pawl C's frame when down
    function edge(s) {                                                      // where the edge y = s (7 + 4x/len) meets the rim
      var lo = o.len - 40, hi = o.len + 40;
      for (var n = 0; n < 60; n++) { var m = (lo + hi) / 2, y = s * (7 + 4 * m / o.len); if (Math.hypot(m - cx, y - cy) < Rr) lo = m; else hi = m; }
      return [lo, s * (7 + 4 * lo / o.len)];
    }
    var eb = edge(-1), et = edge(1), a0 = Math.atan2(eb[1] - cy, eb[0] - cx), a1 = Math.atan2(et[1] - cy, et[0] - cx), outC = [[0, -7], eb];
    for (k = 1; k < 8; k++) { var aa = a0 + (a1 - a0) * k / 8; outC.push([cx + Rr * Math.cos(aa), cy + Rr * Math.sin(aa)]); }
    outC.push(et, [0, 7]);
    for (k = 1; k < 12; k++) { var ab = Math.PI / 2 + k * Math.PI / 12; outC.push([7 * Math.cos(ab), 7 * Math.sin(ab)]); }
    o.outC = outC;
    var outB = outC.map(function (q) { return [q[0], -q[1]]; }).reverse();
    o.pawl = [];
    [[35, outC], [-35, outB]].forEach(function (d) {
      var g = new T.Group(); g.position.set(d[0], 0, 0); o.lever.add(g);
      g.add(P.outlinePlate({ points: d[1], depth: 6, z0: 8, material: mpw }));
      P.at(P.cylZ(3.5, 1, c.mat("pawls", "dark")), 0, 0, 14.5, g);          // pin head z 14..15
      o.pawl.push(g);
    });

    // switch on the tab: post z 8..16, arm z 16..20 turning about (0, 50), pin at its end
    P.at(P.cylZ(5, 8, ms), 0, 50, 12, o.lever);
    o.arm = new T.Group(); o.arm.position.set(0, 50, 18); o.lever.add(o.arm);
    P.at(P.box(22, 6, 4, ms), 8, 0, 0, o.arm);                              // arm x -3..19
    P.at(P.cylZ(2.5, 10, ms), 16, 0, 1, o.arm);                             // pin z 14..24
    o.cord = []; for (i = 0; i < 4; i++) o.cord.push(P.at(P.rod(1.2, ms), 0, 0, 0, o.lever));

    // drive: crank at (270, -145) on a shaft from the back plate, rod at z 20 from crank pin to lever pin
    o.crank = new T.Group(); o.crank.position.set(o.CX, o.CY, 0); scene.add(o.crank);
    P.at(P.cylZ(8, 50, md), 0, 0, -15, o.crank);                            // shaft z -40..10
    P.at(P.box(o.CR + 20, 16, 6, md), o.CR / 2, 0, 13, o.crank);            // arm z 10..16
    P.at(P.cylZ(4.5, 10, c.mat("drive", "dark")), o.CR, 0, 21, o.crank);    // crank pin z 16..26
    o.rod = P.at(P.rod(3.5, md), 0, 0, 0, scene);

    // fixed: back plate z -50..-40 behind everything; the wheel shaft and crank shaft start on its face
    P.at(P.box(560, 470, 10, c.fixed), 45, -10, -45, scene);                // x -235..325, y -245..225

    // cord lengths: taut on the lifted pawl (pin right lifts the left pawl; pin left lifts the right one)
    o.Lc = [this.cordEnds(1, 1)[2], this.cordEnds(0, 0)[3]];               // [right pawl's cord, left pawl's cord]
  },

  pawlAngles: function (u) {                                                // u 0: right pawl down, left lifted; u 1: the other way
    var o = this.o; return [o.psi + o.lift * u, Math.PI - o.psi - o.lift * (1 - u)];
  },
  cordEnds: function (uPin, uPawl) {                                        // pin position for uPin, pawls set for uPawl; returns lengths
    var o = this.o, ang = this.pawlAngles(uPawl), pa = Math.PI * uPin, px = 16 * Math.cos(pa), py = 50 + 16 * Math.sin(pa);
    var at = [[35 + .7 * o.len * Math.cos(ang[0]), .7 * o.len * Math.sin(ang[0])], [-35 + .7 * o.len * Math.cos(ang[1]), .7 * o.len * Math.sin(ang[1])]];
    return [px, py, Math.hypot(at[0][0] - px, at[0][1] - py), Math.hypot(at[1][0] - px, at[1][1] - py), at];
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, i;
    var want = S.controls.dir === "cw" ? 1 : 0;
    o.u += Math.sign(want - o.u) * Math.min(Math.abs(want - o.u), dt * 1.5);
    // crank and lever: the rod pin is where a circle of r 145 about the shaft meets one of the rod's length about the crank pin
    o.ph += S.w * dt;
    var cpx = o.CX + o.CR * Math.cos(o.ph), cpy = o.CY + o.CR * Math.sin(o.ph);
    var lp = P.meet(0, 0, o.LA, cpx, cpy, o.LR, -1), al = Math.atan2(lp[1], lp[0]) + Math.PI / 2;
    if (o.al === null) o.al = al;
    var da = al - o.al; o.al = al;
    // the pawl that is fully down drives on the stroke that jams it: right pawl anticlockwise, left pawl clockwise
    if (o.u === 0 && da > 0) o.th += da;
    if (o.u === 1 && da < 0) o.th += da;
    o.crank.rotation.z = o.ph;
    o.lever.rotation.z = al;
    o.wheel.rotation.z = o.th;
    o.rod.span(lp[0], lp[1], 20, cpx, cpy, 20);
    var ang = this.pawlAngles(o.u);
    o.pawl[0].rotation.z = ang[0]; o.pawl[1].rotation.z = ang[1];
    o.arm.rotation.z = Math.PI * o.u;
    // cords from the switch pin to each pawl; a slack cord hangs in a shallow V
    var e = this.cordEnds(o.u, o.u), px = e[0], py = e[1];
    for (i = 0; i < 2; i++) {
      var q = e[4][i], d = e[2 + i], L = o.Lc[i], mx = (px + q[0]) / 2, my = (py + q[1]) / 2;
      var sag = d < L ? Math.sqrt(L * L - d * d) / 2 : 0, nx = -(q[1] - py) / d, ny = (q[0] - px) / d;
      if (ny > 0) { nx = -nx; ny = -ny; }                                   // hang downward
      mx += nx * sag; my += ny * sag;
      o.cord[2 * i].span(px, py, 19, mx, my, 16.5);
      o.cord[2 * i + 1].span(mx, my, 16.5, q[0], q[1], 15.2);
    }
    function deg(v) { v = Math.round(v * 180 / Math.PI); return (v < 0 ? "−" + -v : v) + "°"; }
    S.set("l", deg(al));
    S.set("w", deg(o.th));
  }
});
