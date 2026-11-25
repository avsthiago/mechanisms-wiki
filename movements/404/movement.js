M507.define({
  number: 404,
  title: "Cyclograph with a bent bar",
  lede: "A springy bar is bent by a screw until its edge is part of a true circle. A pencil run along the edge then draws an arc through three chosen points. You never need the centre of the circle, which may be far off the paper.",
  alt: "A straight bar lies on a sheet of paper with an upright plate at each end. Each plate holds a small roller. A curved springy bar, thick in the middle and thin at the ends, passes under the rollers. A screw with a wing handle pushes the middle of the curved bar outwards, and a pencil draws along its outer edge.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Straight bar", note: "The base of the tool, with an upright plate at each end. Each plate holds a small roller that keeps an end of the springy bar in place." },
    { key: "bar", color: "#C8873A", name: "Springy bar", note: "Thick in the middle and half as thick at the ends. That shape makes it bend into a true circle, not a sharper or flatter curve." },
    { key: "screw", color: "#D9B13B", name: "Screw", note: "Turned by its wing handle. It pushes the middle of the springy bar outwards and bends it." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Runs along the outer edge of the springy bar. Watch it pass through the three dark points." }
  ],
  controls: [{ id: "t", label: "Arc to draw", value: "104", options: [["80", "Flat"], ["92", "Medium"], ["104", "Curved"]] }],
  speed: { min: 1, max: 10, value: 4, label: "Speed", unit: " arcs/min" },
  readouts: [{ id: "n", label: "Screw turns" }, { id: "r", label: "Radius" }],
  views: { "3d": [270, -130, 580], front: [0, -25, 680], side: [700, -175, 260] },
  target: [0, -25, 0],
  distance: [300, 1600],
  how: [
    "Three points of the arc are marked on the paper. The screw is turned and pushes out the middle of the springy bar. The rollers hold its ends back, so the bar bends. When its edge touches all three points, the pencil is run along it.",
    "A bar of even thickness would bend most in the middle and hardly at all near the ends. This bar is thick where the push bends it hardest and thin where the push is weak. So every part bends by the same amount, and the edge is a true circle at any setting.",
    "Try a flat arc, then a curved one. Count the screw turns needed, and see how the radius gets smaller as the bar bends more."
  ],
  note: "This model is rebuilt from Brown's drawing. The paper, the three points and the pencil were added. The ends of the springy bar past the rollers are drawn straight, because nothing bends them there. The sizes, the thread of the screw and the shape of the handle are made up. The tool hangs over the edge of the paper so the handle can turn.",

  build: function (c) {
    var T = c.THREE, P = c.P, sc = c.scene, i, o = this.o = { AX: 170, YR: 56, RR: 8, LB: 460, D: 32, Y0: 58, CAP: 14, LS: 140, PITCH: 2.5, ph: 0, tgt: null, yTop: 58 };
    P.at(P.box(640, 290, 2, c.fixed), 0, 89, -1, sc);                                   // paper: x -320..320, y -56..234, z -2..0
    var fm = c.mat("frame"), dk = c.mat("frame", "dark");
    P.at(P.outlinePlate({ points: [[-226, -44], [226, -44], [210, 0], [-210, 0]], depth: 10.8, z0: 1.2, material: fm }), 0, 0, 0, sc);   // straight bar: y -44..0, z 1.2..12
    [-1, 1].forEach(function (sx) {
      var x = sx * o.AX;
      P.at(P.box(30, 112, 3, fm), x, 10, 13.5, sc);                                   // upright plate: y -46..66, z 12..15, on the bar's top face
      P.at(P.cylZ(o.RR, 8, c.mat("frame", "light")), x, o.YR, 5.5, sc);               // roller: z 1.5..9.5, the same height as the springy bar
      P.at(P.cylZ(3, 2.5, dk), x, o.YR, 10.75, sc);                                   // its pin, z 9.5..12, up to the plate
      P.at(P.cylZ(4, 1, dk), x, o.YR, 15.5, sc);                                      // pin head, z 15..16
      [[-7, -10], [7, -22], [-7, -34]].forEach(function (q) { P.at(P.cylZ(2.2, 1, dk), x + q[0], q[1], 15.5, sc); });   // rivets, z 15..16
    });
    o.bar = new T.Mesh(new T.BufferGeometry(), c.mat("bar")); o.bar.userData.live = true; sc.add(o.bar);
    var sm = c.mat("screw");
    o.cap = P.at(P.box(30, o.CAP, 8, sm), 0, 0, 5.5, sc);                                // swivel cap: z 1.5..9.5
    o.screw = new T.Group(); sc.add(o.screw);                                           // origin at the screw's top end, turns about Y
    P.at(P.cylY(4.5, o.LS, sm), 0, -o.LS / 2, 0, o.screw);                               // z 1.5..10.5 when placed at z = 6, inside the straight bar
    for (i = 4; i < o.LS - 16; i += 5) P.at(P.hoop(4.5, .5, c.mat("screw", "dark")), 0, -i, 0, o.screw).rotation.x = Math.PI / 2;
    P.at(P.cylY(7, 12, sm), 0, -o.LS + 6, 0, o.screw);                                  // handle hub
    [-1, 1].forEach(function (sx) { var w = P.at(P.cylZ(10, 5, sm), sx * 14, -o.LS + 8, 0, o.screw); w.scale.set(1, 1.15, 1); });   // the two wings
    P.at(P.box(4, 3, 5.2, c.mat("pencil", "mark")), 14, -o.LS + 8, 0, o.screw);        // red mark on one wing, sticks out 0.1 each side
    o.pts = [0, 1, 2].map(function () { return P.at(P.cylZ(2.4, .2, c.mat("frame", "dark")), 0, 0, .4, sc); });   // the three given points, z 0.3..0.5
    o.ink = P.inkTrail({ material: c.mat("pencil", "dark"), width: 1.6, max: 1500, step: 1 }); sc.add(o.ink);
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 1, sc);
    o.c = c;
  },

  // circle of the outer edge for a given top height: it touches both rollers
  circle: function (yTop) {
    var o = this.o, k = o.YR - yTop, R = (o.AX * o.AX + k * k - o.RR * o.RR) / (2 * (o.RR - k));
    return { R: R, yc: yTop - R, th: Math.atan2(o.AX, o.YR - (yTop - R)) };
  },

  outline: function (yTop) {
    var o = this.o, ci = this.circle(yTop), R = ci.R, half = o.LB / 2, scn = R * ci.th, N = 70, out = [], inn = [], i;
    for (i = 0; i <= N; i++) {
      var s = -half + i * o.LB / N, a = Math.abs(s), sg = s < 0 ? -1 : 1, f, x, y;
      if (a <= scn) { f = s / R; x = R * Math.sin(f); y = ci.yc + R * Math.cos(f); }
      else { f = sg * ci.th; x = R * Math.sin(f) + (s - sg * scn) * Math.cos(f); y = ci.yc + R * Math.cos(f) - (s - sg * scn) * Math.sin(f); }
      var d = o.D * (1 - .5 * a / half), nx = Math.sin(f), ny = Math.cos(f);
      out.push([x, y]); inn.push([x - d * nx, y - d * ny]);
    }
    return out.concat(inn.reverse());
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, tg = +S.controls.t;
    if (tg !== o.tgt) {
      o.tgt = tg; o.ph = 0; o.ink.clear();
      var ct = this.circle(tg), r = ct.R + 1.2, xs = [-150, 0, 150];
      o.pts.forEach(function (m, k) { m.position.set(xs[k], ct.yc + Math.sqrt(r * r - xs[k] * xs[k]), .4); });
    }
    var prev = o.ph; o.ph += S.w * dt / (2 * Math.PI);
    if (Math.floor(o.ph) !== Math.floor(prev)) o.ink.clear();
    var u = o.ph - Math.floor(o.ph), e = function (x) { return .5 - .5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x))); }, yTop, dr = -1;
    if (u < .3) yTop = o.Y0 + (tg - o.Y0) * e(u / .3);
    else if (u < .82) { yTop = tg; dr = Math.max(0, Math.min(1, (u - .36) / .4)); }
    else yTop = tg + (o.Y0 - tg) * e((u - .86) / .14);
    o.yTop = yTop;
    // bar
    var sh = new c.THREE.Shape(), pts = this.outline(yTop);
    pts.forEach(function (q, k) { if (k) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
    var g = new c.THREE.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false }); g.translate(0, 0, 1.5);   // z 1.5..9.5
    o.bar.geometry.dispose(); o.bar.geometry = g;
    // screw: its top end carries the cap, which presses on the inside of the bar's middle
    var cb = yTop - o.D - o.CAP, turns = (yTop - o.Y0) / o.PITCH;
    o.cap.position.y = cb + o.CAP / 2;
    o.screw.position.set(0, cb, 6); o.screw.rotation.y = turns * 2 * Math.PI;
    // pencil along the outer edge, a hair outside it
    var ci = this.circle(yTop), r = ci.R + 1.2, fe = Math.asin(150 / r), f;
    if (dr >= 0 && u >= .36) {
      f = -fe + 2 * fe * dr;
      var px = r * Math.sin(f), py = ci.yc + r * Math.cos(f), lift = 0;
      if (u > .76) lift = Math.min(1, (u - .76) / .04);
      o.pen.place(px, py, 1 + 12 * lift, 1); o.pen.rotation.z = -f;
      if (u < .76) o.ink.push(px, py, .8);
    } else {
      var ct2 = this.circle(tg), r2 = ct2.R + 1.2, f2 = u < .5 ? -Math.asin(150 / r2) : Math.asin(150 / r2);
      o.pen.place(r2 * Math.sin(f2), ct2.yc + r2 * Math.cos(f2) + 6, 13, 1); o.pen.rotation.z = -f2;
    }
    S.set("n", turns.toFixed(1));
    S.set("r", (ci.R / 10).toFixed(1) + " cm");
  }
});
