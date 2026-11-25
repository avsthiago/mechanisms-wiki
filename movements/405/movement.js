M507.define({
  number: 405,
  title: "Drawing hyperbolas",
  lede: "A rule turning on a pin and a piece of cord draw a hyperbola, a curve with two open arms. The pencil keeps the cord tight against the rule. Then the rule is moved to the other pin to draw the facing curve.",
  alt: "Two dotted lines cross on a sheet of paper. Two pins stand on the upright line, one above the crossing and one below. A long rule turns on the upper pin. A cord runs from the lower end of the rule up along its edge to a pencil, and from the pencil to the lower pin. The pencil draws a curve that bends round the lower pin.",
  parts: [
    { key: "rule", color: "#5E7387", name: "Rule", note: "Turns on one pin. Its edge always points straight at that pin. It is turned over to draw the other half of each curve." },
    { key: "string", color: "#D9B13B", name: "Cord", note: "Tied to the far end of the rule and looped on the other pin. Its length never changes." },
    { key: "pins", color: "#4FA58A", name: "Pins", note: "Two pins on the upright line. They are the two focus points of the curves." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Holds the cord tight against the rule. Watch it trace both curves." }
  ],
  controls: [{ id: "a", label: "Length of cord", value: "84", options: [["95", "Short"], ["84", "Medium"], ["70", "Long"]] }],
  speed: { min: 1, max: 6, value: 2, label: "Speed", unit: " rounds/min" },
  readouts: [{ id: "r1", label: "To rule pin" }, { id: "r2", label: "To cord pin" }, { id: "d", label: "Difference" }],
  views: { "3d": [473, -290, 1015], front: [0, -20, 1040], side: [1000, -200, 320] },
  target: [0, -60, 0],
  distance: [300, 1800],
  how: [
    "The rule turns on the upper pin. The cord goes from the end of the rule, along its edge to the pencil, then to the lower pin. As the rule swings out, the pencil slides along it and draws the lower curve. Then the rule is turned over to draw the other half.",
    "When the pencil moves away from the rule's pin, the cord along the rule gets shorter. All of that cord goes into the part between the pencil and the other pin. So the two distances grow by the same amount, and their difference never changes. That is what makes the curve a hyperbola.",
    "Next the rule and the cord swap pins, and the upper curve is drawn the same way. Try a short cord, then a long one, and watch the difference in the readouts and the shape of the curves."
  ],
  note: "This model is rebuilt from Brown's description. The paper, the length of the rule and the cord lengths are made up. Brown draws a thread tied at the rule's end; here it lies along the edge of the rule. The rule is lifted off its pin to turn it over and to move it to the other pin. Brown calls the curve a parabola in one place, but the tool draws a hyperbola.",

  build: function (c) {
    var T = c.THREE, P = c.P, sc = c.scene, o = this.o = { C: 105, L: 430, W: 18, DL: 2.5, ZF: 3.4, RMAX: 395, a: null, ph: 0 }, i;
    P.at(P.box(800, 660, 2, c.fixed), 0, -10, -1, sc);                                 // paper: x -400..400, y -340..320, z -2..0
    var dm = c.mat("pins", "dark");                                                     // dotted centre lines, z 0.3..0.5
    for (i = -330; i < 310; i += 14) P.at(P.box(1, 6, .2, dm), 0, i + 3, .4, sc);
    for (i = -290; i < 290; i += 14) P.at(P.box(6, 1, .2, dm), i + 3, 0, .4, sc);
    o.pinT = P.at(P.cylZ(3, 9, c.mat("pins")), 0, o.C, 4.5, sc);                        // pins z 0..9
    o.pinB = P.at(P.cylZ(3, 9, c.mat("pins")), 0, -o.C, 4.5, sc);
    // rule: working line along local -Y from the pin, body on +X from DL to DL + W, round end with a hole on the pin
    var L = o.L, W = o.W, DL = o.DL, R0 = 11, pts = [[DL, -L - 10], [DL + W, -L - 10], [DL + W, 0], [R0, 0]], a0 = Math.acos(DL / R0);
    for (i = 1; i <= 24; i++) { var t = i / 24 * (2 * Math.PI - a0); pts.push([R0 * Math.cos(t), R0 * Math.sin(t)]); }
    o.rule = new T.Group(); sc.add(o.rule);                                             // at the pivot, turned about Z
    o.flip = new T.Group(); o.rule.add(o.flip);                                         // turns the rule over about its working line
    P.at(P.rulerPlate({ points: pts, holes: [[0, 0, 3.6]], z0: -2, depth: 4, material: c.mat("rule") }), 0, 0, 0, o.flip);   // z 1.4..5.4 when flat
    P.at(P.sphere(2.2, c.mat("string")), -1, -L, 0, o.flip);                            // knot at the end of the rule
    o.s1 = P.at(P.rod(.8, c.mat("string")), 0, 0, 0, sc);
    o.s2 = P.at(P.rod(.8, c.mat("string")), 0, 0, 0, sc);
    o.ink = [0, 1, 2, 3].map(function () { var m = P.inkTrail({ material: c.mat("pencil", "dark"), width: 1.8, max: 900, step: 1 }); sc.add(m); return m; });
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 1, sc);
    // the round: draw, return, turn over, draw, return, move to the other pin ... for both curves
    o.seq = [["d", -1, -1, 1], ["r", -1, -1, .5], ["f", -1, 0, .6], ["d", -1, 1, 1], ["r", -1, 1, .5], ["m", -1, 0, .9],
             ["d", 1, -1, 1], ["r", 1, -1, .5], ["f", 1, 0, .6], ["d", 1, 1, 1], ["r", 1, 1, .5], ["m", 1, 0, .9]];
    o.tot = o.seq.reduce(function (s, q) { return s + q[3]; }, 0);
  },

  step: function (c, dt, S) {
    var o = this.o, a = +S.controls.a, C = o.C, bb, i;
    if (a !== o.a) { o.a = a; o.ph = .55 / o.tot; o.fill = true; o.ink.forEach(function (m) { m.clear(); }); }   // open part-way along the first stroke, as Brown draws it
    bb = C * C - a * a;
    var psiM = Math.acos((bb / o.RMAX + a) / C);
    var prev = o.ph; o.ph += S.w * dt / (2 * Math.PI);
    if (Math.floor(o.ph) !== Math.floor(prev)) o.ink.forEach(function (m) { m.clear(); });
    var t = (o.ph - Math.floor(o.ph)) * o.tot, k = 0;
    while (t > o.seq[k][3] && k < o.seq.length - 1) { t -= o.seq[k][3]; k++; }
    var sg = o.seq[k], u = Math.min(1, t / sg[3]), e = function (x) { return .5 - .5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x))); };
    var br = sg[1], side = sg[2], psi = 0, beta, lift = 0, th, qx = 0, qy = -br * C, fx = 0, fy = br * C, r1;
    function betaOf(b, s) { return b * s > 0 ? Math.PI : 0; }
    if (sg[0] === "d" || sg[0] === "r") {
      psi = psiM * (sg[0] === "d" ? e(u) : 1 - e(u)); beta = betaOf(br, side);
      var dx = side * Math.sin(psi), dy = br * Math.cos(psi);
      th = Math.atan2(dx, -dy);
      r1 = bb / (C * Math.cos(psi) - a);
    } else if (sg[0] === "f") {
      var b0 = betaOf(br, -1), b1 = betaOf(br, 1);
      th = br < 0 ? 0 : Math.PI; r1 = C + a;
      lift = Math.min(1, 4 * Math.min(u, 1 - u)); beta = b0 + (b1 - b0) * e((u - .25) / .5);
    } else {                                                                            // carry the rule and the cord loop to the other pins
      var m = e(u); lift = Math.min(1, 4 * Math.min(u, 1 - u));
      th = (br < 0 ? 0 : Math.PI) + Math.PI * m; beta = br < 0 ? 0 : Math.PI;
      qy = -br * C + 2 * br * C * m; fy = -qy; r1 = C + a;
    }
    var up = 9 * lift + (sg[0] === "m" ? 24 * Math.sin(Math.PI * e(u)) : 0);
    var zf = o.ZF + up + (o.W + o.DL) * Math.abs(Math.sin(beta));
    o.rule.position.set(qx, qy, 0); o.rule.rotation.z = th;
    o.flip.position.z = zf; o.flip.rotation.y = beta;
    var ux = Math.sin(th), uy = -Math.cos(th);                                         // along the rule from the pivot
    var px = qx + r1 * ux, py = qy + r1 * uy, ex = qx + o.L * ux, ey = qy + o.L * uy, zs = zf;
    var bs = Math.cos(beta) > 0 ? 1 : -1, nx = Math.cos(th) * bs, ny = Math.sin(th) * bs;   // towards the rule's body
    o.s1.span(ex - nx, ey - ny, zs, px - nx, py - ny, zs);
    o.s2.span(px, py, zs, fx, fy, Math.max(3, up + 3));
    o.pen.place(px, py, 1 + up, 1); o.pen.rotation.z = Math.atan2(nx, -ny);           // leans away from the rule
    if (o.fill && sg[0] === "d") {                                                     // the part of the first stroke already drawn
      for (i = 0; i < 60; i++) { var q = psi * i / 60, rq = bb / (C * Math.cos(q) - a); o.ink[1].push(qx + side * rq * Math.sin(q), qy + br * rq * Math.cos(q), .8); }
      o.fill = false;
    }
    if (sg[0] === "d") o.ink[(br < 0 ? 0 : 2) + (side < 0 ? 1 : 0)].push(px, py, .8);
    var r2 = Math.hypot(px - fx, py - fy);
    if (sg[0] !== "d" && sg[0] !== "r") r2 = C - a;
    S.set("r1", (r1 / 10).toFixed(1) + " cm");
    S.set("r2", (r2 / 10).toFixed(1) + " cm");
    S.set("d", ((r1 - r2) / 10).toFixed(1) + " cm");
  }
});
