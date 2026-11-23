M507.define({
  number: 451,
  title: "Force pump with an air chamber",
  lede: "A force pump only pushes water out on the down stroke, so the water comes in spurts. Here the water goes first into a closed dome with air trapped in it. The squeezed air keeps pushing while the piston goes back up, so the water flows out steadily.",
  alt: "A pump cut open down the middle. A solid piston slides in an open-topped tube on the right, worked by a handle on a curved post. A passage runs from the bottom of the tube to a hinged flap under a tall round dome on the left. A pipe comes down through the top of the dome, and a second pipe leaves its side and turns up. Blue dots show the water, with air above it in the dome.",
  parts: [
    { key: "handle", color: "#5E7387", name: "Handle and rod", note: "Push the ball end down and the rod and piston go down." },
    { key: "piston", color: "#C8873A", name: "Piston", note: "Solid, with a leather band round it. It draws water in on the way up and pushes it out on the way down." },
    { key: "valves", color: "#D9B13B", name: "Valves", note: "A lid on the floor of the tube lets water in from the well. A hinged flap under the dome lets it into the dome and stops it coming back. Watch the red marks." },
    { key: "air", color: "#8E7AA8", name: "Air chamber", note: "A closed dome with air trapped at the top. The water squeezes the air, and the air pushes the water out of the two outlet pipes." },
    { key: "body", color: "#4FA58A", name: "Pump body", note: "The tube the piston slides in, the pipe from the well and the passage to the dome." }
  ],
  controls: [{ type: "range", id: "air", label: "Air in the dome", min: 10, max: 100, step: 5, value: 100, unit: " %",
    presets: [[10, "A little"], [50, "Half"], [100, "Full"]] }],
  closed: { label: "Pump" },
  speed: { min: 4, max: 40, value: 16, label: "Strokes", unit: " a min" },
  readouts: [{ id: "q", label: "Delivered" }, { id: "s", label: "Stroke" }, { id: "p", label: "Air" }],
  views: { "3d": [95, 70, 580], front: [-12, 55, 600], side: [600, 55, -40] },
  target: [-12, 55, 0],
  how: [
    "Watch the piston go down. It pushes water along the passage, past the flap and into the dome. The water has nowhere to go fast enough, so it rises in the dome and squeezes the air above it.",
    "When the piston goes back up, the flap shuts. The squeezed air springs back and keeps pushing water out of the two pipes, so the jets hardly drop between strokes. After a few strokes the air settles at a steady squeeze, and the water rises and falls only a little in the dome.",
    "A lot of air acts like a soft cushion. A little air is stiff, so it squeezes and springs back quickly. Try a full dome, then a little air, and watch the jets start to come in spurts. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a cut-away. The front half of the pump is left off so you can see in. The passage to the dome is drawn as one simple pipe, and the dome's waist is left out. The sizes, the shape of the valves, how easily water leaves the pipes and the made-up size used for the litres are not from the book. The pipes are cut short, and the model starts with the pump full of water and the air already squeezed.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, bm = c.mat("body"), am = c.mat("air"), vm = c.mat("valves"), red = c.mat("valves", "mark"), dk = c.mat("valves", "dark"), hm = c.mat("handle");
    var X = -82.5, i, a;
    var o = this.o = { th: 0, out: 0, ti: 0, to: 0, PV: [-32.5, 135], X: X, top: 150, a0: -1, ha0: 117, yl: 91.5, k: 2.27 };
    // closed view: a pipeSection path drawn all the way round (inline helper, same mitred bends)
    function wholePipe(p, rIn, rOut, m, ends) {
      var n = p.length, st = 32, pos = [], M = [], i, k;
      for (i = 0; i < n; i++) {
        var c0 = i > 0 ? p[i - 1] : p[i], c1 = i < n - 1 ? p[i + 1] : p[i], t0x = p[i][0] - c0[0], t0y = p[i][1] - c0[1], t1x = c1[0] - p[i][0], t1y = c1[1] - p[i][1], l0 = Math.hypot(t0x, t0y), l1 = Math.hypot(t1x, t1y);
        if (!l0) { t0x = t1x; t0y = t1y; l0 = l1; } if (!l1) { t1x = t0x; t1y = t0y; l1 = l0; }
        var n0x = -t0y / l0, n0y = t0x / l0, n1x = -t1y / l1, n1y = t1x / l1, mx = n0x + n1x, my = n0y + n1y, ml = Math.hypot(mx, my) || 1;
        mx /= ml; my /= ml; var d = mx * n1x + my * n1y || 1; M.push([mx / d, my / d]);
      }
      function pt(i, r, k) { var f = 2 * Math.PI * k / st, cf = Math.cos(f); return [p[i][0] + r * cf * M[i][0], p[i][1] + r * cf * M[i][1], -r * Math.sin(f)]; }
      function quad(A, B, C, D) { pos.push(A[0], A[1], A[2], B[0], B[1], B[2], C[0], C[1], C[2], A[0], A[1], A[2], C[0], C[1], C[2], D[0], D[1], D[2]); }
      for (i = 0; i < n - 1; i++) for (k = 0; k < st; k++) {
        quad(pt(i, rOut, k), pt(i + 1, rOut, k), pt(i + 1, rOut, k + 1), pt(i, rOut, k + 1));
        quad(pt(i, rIn, k), pt(i, rIn, k + 1), pt(i + 1, rIn, k + 1), pt(i + 1, rIn, k));
      }
      if (ends !== false) [0, n - 1].forEach(function (e) { for (k = 0; k < st; k++) quad(pt(e, rIn, k), pt(e, rOut, k), pt(e, rOut, k + 1), pt(e, rIn, k + 1)); });
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      return new T.Mesh(g, m);
    }
    // body: suction pipe y -80 .. -50, floor flange -50 .. -37.5 (hole r 11), bore r 17.5 up to the open top y 87.5
    P.at(c.shell(P.halfSection({ poly: [[11, -80], [19, -80], [19, -50], [30, -50], [30, -37.5], [25, -37.5], [25, -27], [17.5, -27], [17.5, -37.5], [11, -37.5]], material: bm }), "open"), 0, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[12, -80], [19, -80], [19, -50], [30, -50], [30, -37.5], [25, -37.5], [25, -27], [18.5, -27], [18.5, -37.5], [12, -37.5]], material: bm, steps: 56 }), "closed"), 0, 0, 0, scene);   // closed: bores 1 wider here, in the tube and in the dome, so the water fill never lies on them
    scene.add(c.shell(P.shellSection({ poly: [[17.5, -27], [25, -27], [25, -3], [17.5, -3]], from: 0, to: Math.PI - Math.asin(12 / 17.5), material: bm }), "open"));   // gap for the passage
    scene.add(c.shell(P.wholeSection({ poly: [[18.5, -27], [25, -27], [25, -3], [18.5, -3]], material: bm }), "closed"));   // closed: no gap, the passage starts inside the wall
    P.at(c.shell(P.halfSection({ poly: [[17.5, -3], [25, -3], [25, 87.5], [17.5, 87.5]], material: bm }), "open"), 0, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[18.5, -3], [25, -3], [25, 87.5], [18.5, 87.5]], material: bm, steps: 56 }), "closed"), 0, 0, 0, scene);
    scene.add(c.shell(P.pipeSection({ pts: [[-Math.sqrt(17.5 * 17.5 - 144), -15], [X, -15], [X, 26]], rIn: 8, rOut: 12, material: bm }), "open"));   // passage, ends under the dome's floor y 26
    scene.add(c.shell(wholePipe([[-19, -15], [X, -15], [X, 28]], 7.9, 12, bm), "closed"));   // starts in the tube wall (r 17.5 .. 25), ends inside the dome floor (y 26 .. 32.5)
    // dome on axis x = X: floor y 26 .. 32.5 (hole r 8), wall r 30 .. 35 up to y 120, round top bored r 10.3 for the pipe
    var dome = [[8, 26], [36, 26], [36, 32.5], [35, 32.5], [35, 36], [30, 36], [30, 32.5], [8, 32.5]];
    P.at(c.shell(P.halfSection({ poly: dome, material: am }), "open"), X, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[8, 26], [36, 26], [36, 32.5], [35, 32.5], [35, 36], [31, 36], [31, 32.5], [8, 32.5]], material: am, steps: 56 }), "closed"), X, 0, 0, scene);
    P.at(c.shell(P.shellSection({ poly: [[30, 36], [35, 36], [35, 54], [30, 54]], from: 0, to: Math.PI - Math.asin(9 / 30), material: am }), "open"), X, 0, 0, scene);   // gap on the left for the side outlet
    P.at(c.shell(P.wholeSection({ poly: [[31, 36], [35, 36], [35, 54], [31, 54]], material: am }), "closed"), X, 0, 0, scene);   // closed: no gap, the outlet starts inside the wall
    var up = [[30, 54], [35, 54], [35, 120]];
    for (a = 1; a <= 8; a++) { var f = Math.acos(10.3 / 35) * a / 8; up.push([35 * Math.cos(f), 120 + 35 * Math.sin(f)]); }
    var fi = Math.acos(10.3 / 30); up.push([10.3, 120 + 30 * Math.sin(fi)]);
    for (a = 7; a >= 0; a--) { var g = fi * a / 8; up.push([30 * Math.cos(g), 120 + 30 * Math.sin(g)]); }
    P.at(c.shell(P.halfSection({ poly: up, material: am }), "open"), X, 0, 0, scene);
    var upC = up.slice(0, 11); upC[0] = [31, 54]; fi = Math.acos(10.3 / 31); upC.push([10.3, 120 + 31 * Math.sin(fi)]);
    for (a = 7; a >= 0; a--) { g = fi * a / 8; upC.push([31 * Math.cos(g), 120 + 31 * Math.sin(g)]); }   // closed: inside 1 wider
    P.at(c.shell(P.wholeSection({ poly: upC, material: am, steps: 56 }), "closed"), X, 0, 0, scene);
    scene.add(c.shell(P.pipeSection({ pts: [[X, 60], [X, 177.5]], rIn: 7, rOut: 10, material: bm }), "open"));                    // pipe down through the top
    scene.add(c.shell(wholePipe([[X, 60], [X, 177.5]], 7, 10, bm), "closed"));
    scene.add(c.shell(P.pipeSection({ pts: [[X - Math.sqrt(900 - 81), 45], [-132, 45], [-132, 115]], rIn: 6, rOut: 9, material: bm }), "open"));   // side outlet, turns up
    scene.add(c.shell(wholePipe([[X - 31.5, 45], [-132, 45], [-132, 115]], 6, 9, bm), "closed"));   // starts in the dome wall (r 30 .. 35)
    o.vo = P.at(P.flapValve({ radius: 9, side: 1, open: .9, material: vm, mark: red, pin: dk }), X - 9, 33.5, 0, scene);
    o.vi = P.at(P.buttonValve({ radius: 13, height: 5, lift: 5, material: vm, mark: red }), 0, -37, 0, scene);
    // curved post for the handle, from inside the tube wall (z -8) to the pivot
    var post = [[-21, 35], [-35, 70], [-28, 110], o.PV];
    for (i = 1; i < post.length; i++) { P.at(P.rod(4, bm), 0, 0, 0, scene).span(post[i - 1][0], post[i - 1][1], -8, post[i][0], post[i][1], -8); if (i < 3) P.at(P.sphere(4, bm), post[i][0], post[i][1], -8, scene); }
    P.at(P.cylZ(2.5, 13, c.mat("body", "dark")), o.PV[0], o.PV[1], -5.5, scene);   // pivot pin z -12 .. 1
    // handle about the pivot, drawn at its middle position; the rod pin is 30 along it
    o.h = P.at(new T.Group(), o.PV[0], o.PV[1], 0, scene);
    o.a0 = Math.atan2(-5, 30);
    var hp = [[0, 0], [30, -5], [72.5, -22.5], [107.5, -60], [140, -112.5]], c0 = Math.cos(-o.a0), s0 = Math.sin(-o.a0);
    hp = hp.map(function (p) { return [p[0] * c0 - p[1] * s0, p[0] * s0 + p[1] * c0]; });
    for (i = 1; i < hp.length; i++) { P.at(P.rod(3.2, hm), 0, 0, 0, o.h).span(hp[i - 1][0], hp[i - 1][1], 0, hp[i][0], hp[i][1], 0); P.at(P.sphere(3.2, hm), hp[i][0], hp[i][1], 0, o.h); }
    P.at(P.sphere(7, hm), hp[4][0], hp[4][1], 0, o.h);
    P.at(P.cylZ(5, 5, hm), 0, 0, 0, o.h); P.at(P.cylZ(5, 5, hm), 30.4, 0, 0, o.h);
    o.rod = P.at(P.rod(2.6, hm), 0, 0, 0, scene);
    o.pis = P.at(new T.Group(), 0, 22.5, 0, scene);
    [[-10, -3, ""], [-3, 3, "dark"], [3, 10, ""]].forEach(function (b) { P.at(P.halfSection({ poly: [[0, b[0]], [17, b[0]], [17, b[1]], [0, b[1]]], material: b[2] ? c.mat("piston", "dark") : c.mat("piston") }), 0, 0, 0, o.pis); });
    // water: shows faintly through the closed pump
    var fm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide });
    c.fluid(P.at(P.halfSection({ poly: [[0, -79.5], [10.5, -79.5], [10.5, -37], [0, -37]], material: fm }), 0, 0, -.6, scene));
    o.cf = c.fluid(P.at(P.halfSection({ poly: [[0, 0], [17, 0], [17, 1], [0, 1]], material: fm }), 0, -36.5, -.6, scene));
    c.fluid(P.at(P.pipeSection({ pts: [[-15, -15], [X, -15], [X, 32.5]], rIn: .1, rOut: 7.5, ends: false, material: fm }), 0, 0, -.6, scene));
    o.vf = c.fluid(P.at(P.halfSection({ poly: [[0, 0], [29.5, 0], [29.5, 1], [0, 1]], material: fm }), X, 33, -.6, scene));
    c.fluid(P.at(P.pipeSection({ pts: [[X - 29, 45], [-132, 45], [-132, 115]], rIn: .1, rOut: 5.5, ends: false, material: fm }), 0, 0, -.6, scene));
    o.tf = c.fluid(P.at(P.pipeSection({ pts: [[X, 60], [X, 177.5]], rIn: .1, rOut: 6.5, ends: false, material: fm }), 0, 0, -.6, scene));
    o.w = P.pumpWater({ count: 560, color: c.spot, density: .03, fall: 4 }); scene.add(o.w);
    o.cJ = o.w.chain({ pts: [[X - 28, 45], [-132, 45], [-132, 115]], w: 11, spill: true });
    o.cT = o.w.chain({ pts: [[X, 60], [X, 177.5]], w: 13, spill: true });
    o.cV = o.w.chain({ pts: [[X, 32.5], [X, 150]], w: 58, under: o.cJ });
    o.cP = o.w.chain({ pts: [[-12, -15], [X, -15], [X, 32.5]], w: 15, over: o.cV });
    o.cC = o.w.chain({ pts: [[0, -37.5], [0, 87.5]], w: 34, under: o.cP });
    o.cI = o.w.chain({ pts: [[0, -80], [0, -37.5]], w: 21, over: o.cC });
    [o.cJ, o.cP, o.cI].forEach(function (k) { o.w.fill(k, 0, o.w.chains[k].L); });
    o.w.fill(o.cC, 0, 34 * (22.5 - 10 + 37.5)); o.w.fill(o.cT, 0, o.w.chains[o.cT].L); o.w.fill(o.cV, 0, 58 * (o.yl - 32.5));
    o.w.hide = function (x, y) { var Y = o.pis.position.y; return (y > Y - 11 && y < Y + 11 && Math.abs(x) < 18) || (y < -32 && y > -38 && Math.abs(x) < 14); };
  },

  step: function (c, dt, S) {
    var o = this.o, W = o.w, ha0 = 117 * S.controls.air / 100;
    if (ha0 !== o.ha0) {                                 // new amount of air: keep the squeeze, so the water level moves
      var p0 = o.ha0 / (o.top - o.yl); o.ha0 = ha0;
      o.yl = Math.max(33, o.top - ha0 / p0);
      W.clear(o.cV); W.fill(o.cV, 0, 58 * (o.yl - 32.5));
    }
    var y0 = o.pis.position.y;
    o.th += S.w * dt;
    var al = o.a0 + .436 * Math.sin(o.th), px = o.PV[0] + 30.4 * Math.cos(al), py = o.PV[1] + 30.4 * Math.sin(al), Y = py - Math.sqrt(107.5 * 107.5 - px * px);
    o.h.rotation.z = al - o.a0;
    o.pis.position.y = Y; o.rod.span(px, py, 0, 0, Y + 10, 0);
    o.cf.scale.y = Y - 10 + 36.5;
    var dy = Y - y0, v = dt > 0 ? dy / dt : 0, dq = 34 * Math.abs(dy);
    // the dome: water in from the piston, out through the pipes as hard as the squeezed air pushes
    var hin = dy < 0 ? -dy * .34 : 0, p = o.ha0 / (o.top - o.yl), hout = dt > 0 ? Math.min(o.k * Math.max(0, p - 1) * dt, o.yl - 33) : 0;
    o.yl = Math.min(o.top - 4, o.yl + hin - hout);
    p = o.ha0 / (o.top - o.yl);
    var qo = 58 * hout, both = o.yl > 62, vj = dt > 0 ? 2.2 * qo / dt : 0;
    W.chains[o.cJ].v = vj / (both ? 2 : 1) / 11; W.chains[o.cT].v = vj / 2 / 13;
    if (dy > 0) { W.shift(o.cC, dq); W.shift(o.cI, dq, true); }
    else if (dy < 0) { W.shift(o.cV, 58 * hin); W.shift(o.cP, dq); W.shift(o.cC, -dq); }
    if (both) { W.shift(o.cJ, qo / 2); W.shift(o.cT, qo / 2); } else W.shift(o.cJ, qo);
    W.chains[o.cV].under = both && Math.random() < .5 ? o.cT : o.cJ;
    W.shift(o.cV, -qo);
    W.update(dt);
    o.out += hout / .34 * .0077;
    o.vf.scale.y = Math.min(87.5, o.yl - 32.5); o.tf.visible = both;
    var up = Math.cos(o.th) * (S.w >= 0 ? 1 : -1) > 0, want = Math.min(1, Math.sqrt(Math.abs(v) / 25)), k = Math.min(1, dt * 10);
    o.ti += ((up ? want : 0) - o.ti) * k; o.to += ((up ? 0 : want) - o.to) * k;
    o.vi.set(o.ti); o.vo.set(o.to);
    S.set("q", o.out.toFixed(1) + " L");
    S.set("s", S.w ? (up ? "Up" : "Down") : "Stopped");
    S.set("p", p.toFixed(1) + " bar");
  }
});
