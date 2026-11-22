M507.define({
  number: 450,
  title: "Force pump",
  lede: "A pump that pushes water out instead of lifting it. The piston is solid, so it draws water in on the way up and squeezes it out on the way down. It can send water up a pipe as high as you can push.",
  alt: "A pump cut open down the middle. A solid piston slides in an open-topped tube, worked by a handle on a short swinging link. A hinged flap covers the hole in the floor. A side passage leaves the bottom of the tube, goes left and up to a lid valve, and on up a tall pipe. Blue dots show the water.",
  parts: [
    { key: "handle", color: "#5E7387", name: "Handle and rod", note: "The handle hangs from a short swinging link on the left, so the rod can go straight up and down." },
    { key: "piston", color: "#C8873A", name: "Piston", note: "Solid, with a leather band round it. No water can get past it." },
    { key: "valves", color: "#D9B13B", name: "Valves", note: "A hinged flap in the floor lets water in. A lid under the dome lets it out. Watch the red marks: they never open together." },
    { key: "body", color: "#4FA58A", name: "Pump body", note: "The tube the piston slides in, the pipe from the well below, and the passage to the tall outlet pipe." }
  ],
  closed: { label: "Pump" },
  speed: { min: 4, max: 40, value: 16, label: "Strokes", unit: " a min" },
  readouts: [{ id: "q", label: "Delivered" }, { id: "s", label: "Stroke" }],
  views: { "3d": [110, 60, 640], front: [12, 45, 660], side: [660, 45, 0] },
  target: [12, 45, 0],
  how: [
    "Watch the piston rise. It leaves an empty space below it, and water from the well pushes up through the flap in the floor to fill it. The lid under the dome stays shut, so nothing comes back down the outlet pipe.",
    "Now the piston comes down. The flap in the floor falls shut, so the water cannot go back to the well. It has only one way out: along the passage, up past the lid and into the tall pipe. The water only leaves on this stroke, in spurts.",
    "The harder you push, the higher the water can go. Try a slow speed, then a fast one, and watch the spurts at the top of the pipe. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a cut-away. The front half of the pump is left off so you can see in. The passage from the tube to the dome is drawn as one simple pipe. The sizes, the shape of the valves and the made-up size used for the litres are not from the book. The outlet pipe is cut short, and the model starts with the pump full of water.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, bm = c.mat("body"), vm = c.mat("valves"), red = c.mat("valves", "mark"), dk = c.mat("valves", "dark"), hm = c.mat("handle");
    var o = this.o = { th: 0, out: 0, ti: 0, to: 0, G: [-40, 107.5], Lg: 37.5, Lh: 40.3, Lr: 117.5, VX: -72.5 };
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
    // body: suction pipe y -85 .. -50, floor flange -50 .. -35 (hole r 11), bore r 20 up to the open top y 105
    P.at(c.shell(P.halfSection({ poly: [[11, -85], [19, -85], [19, -50], [37, -50], [37, -35], [27.5, -35], [27.5, -31], [20, -31], [20, -35], [11, -35]], material: bm }), "open"), 0, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[12, -85], [19, -85], [19, -50], [37, -50], [37, -35], [27.5, -35], [27.5, -31], [21, -31], [21, -35], [12, -35]], material: bm, steps: 56 }), "closed"), 0, 0, 0, scene);   // closed: bores 1 wider here and below, so the water fill never lies on them
    // wall y -31 .. -9 with a gap on the left for the passage (outside radius 11)
    scene.add(c.shell(P.shellSection({ poly: [[20, -31], [27.5, -31], [27.5, -9], [20, -9]], from: 0, to: Math.PI - Math.asin(11 / 20), material: bm }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: [[21, -31], [27.5, -31], [27.5, -9], [21, -9]], material: bm }), "closed"));   // closed: no gap, the passage starts inside the wall
    P.at(c.shell(P.halfSection({ poly: [[20, -9], [27.5, -9], [27.5, 105], [20, 105]], material: bm }), "open"), 0, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[21, -9], [27.5, -9], [27.5, 105], [21, 105]], material: bm, steps: 56 }), "closed"), 0, 0, 0, scene);
    scene.add(c.shell(P.pipeSection({ pts: [[-Math.sqrt(400 - 121), -20], [o.VX, -20], [o.VX, 4]], rIn: 7, rOut: 11, material: bm }), "open"));   // passage, ends under the valve plate y 4
    scene.add(c.shell(wholePipe([[-22, -20], [o.VX, -20], [o.VX, 4]], 7, 11, bm), "closed"));   // starts in the tube wall (r 20 .. 27.5)
    // valve plate y 4 .. 10 (hole r 7), dome and tall outlet pipe up to y 157 (open)
    P.at(c.shell(P.halfSection({ poly: [[7, 4], [34, 4], [34, 10], [31, 10], [31, 28], [12, 44], [12, 157], [9, 157], [9, 42], [26, 27], [26, 10], [7, 10]], material: bm }), "open"), o.VX, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[8, 4], [34, 4], [34, 10], [31, 10], [31, 28], [12, 44], [12, 157], [10, 157], [10, 42], [27, 27], [27, 10], [8, 10]], material: bm, steps: 56 }), "closed"), o.VX, 0, 0, scene);
    o.vo = P.at(P.buttonValve({ radius: 10, height: 5, lift: 5, material: vm, mark: red }), o.VX, 10.5, 0, scene);
    o.vi = P.at(P.flapValve({ radius: 12, side: 1, open: .8, material: vm, mark: red, pin: dk }), -12, -34.5, 0, scene);
    // bracket for the swinging link, from the tube wall (z -9 is inside the wall) to the link pin
    P.at(P.rod(3, bm), 0, 0, 0, scene).span(-25, 92, -9, o.G[0], o.G[1], -9);
    P.at(P.cylZ(2.5, 10, c.mat("body", "dark")), o.G[0], o.G[1], -6, scene);   // pin z -11 .. -1
    o.link = P.at(P.rod(2.5, hm), 0, 0, 0, scene);
    // handle in its own frame: origin at the rod pin, +X toward the link pin
    var E0 = [-40, -5], a0 = Math.atan2(E0[1], E0[0]), ca = Math.cos(-a0), sa = Math.sin(-a0);
    function loc(p) { return [p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca]; }
    var pts = [E0, [0, 0], [35, 2], [80, -20], [105, -60], [120, -95]].map(loc), i;
    o.h = P.at(new T.Group(), 0, 0, 0, scene);
    for (i = 1; i < pts.length; i++) { P.at(P.rod(3.2, hm), 0, 0, 0, o.h).span(pts[i - 1][0], pts[i - 1][1], 0, pts[i][0], pts[i][1], 0); P.at(P.sphere(3.2, hm), pts[i][0], pts[i][1], 0, o.h); }
    P.at(P.sphere(7, hm), pts[5][0], pts[5][1], 0, o.h);
    P.at(P.cylZ(5, 5, hm), 0, 0, 0, o.h); P.at(P.cylZ(5, 5, hm), pts[0][0], pts[0][1], 0, o.h);
    // piston about its centre: y -10 .. 10 with a leather band, rod up to the pin
    o.pis = P.at(new T.Group(), 0, 30, 0, scene);
    [[-10, -3, ""], [-3, 3, "dark"], [3, 10, ""]].forEach(function (b) { P.at(P.halfSection({ poly: [[0, b[0]], [19.5, b[0]], [19.5, b[1]], [0, b[1]]], material: b[2] ? c.mat("piston", "dark") : c.mat("piston") }), 0, 0, 0, o.pis); });
    P.at(P.cylY(3, o.Lr - 9.5, hm), 0, 9.5 + (o.Lr - 9.5) / 2, 0, o.pis);    // rod from the piston top to the pin
    // water: shows faintly through the closed pump
    var fm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide });
    c.fluid(P.at(P.halfSection({ poly: [[0, -84.5], [10.5, -84.5], [10.5, -34.7], [0, -34.7]], material: fm }), 0, 0, -.6, scene));
    o.cf = c.fluid(P.at(P.halfSection({ poly: [[0, 0], [19.5, 0], [19.5, 1], [0, 1]], material: fm }), 0, -34.5, -.6, scene));
    c.fluid(P.at(P.pipeSection({ pts: [[-18, -20], [o.VX, -20], [o.VX, 10]], rIn: .1, rOut: 6.5, ends: false, material: fm }), 0, 0, -.6, scene));
    c.fluid(P.at(P.halfSection({ poly: [[0, 11], [25.5, 11], [25.5, 27], [8.5, 42], [8.5, 156.5], [0, 156.5]], material: fm }), o.VX, 0, -.6, scene));
    o.w = P.pumpWater({ count: 420, color: c.spot, density: .03, fall: 4 }); scene.add(o.w);
    o.top = o.w.chain({ pts: [[o.VX, 10], [o.VX, 27], [o.VX, 42], [o.VX, 157]], w: [50, 30, 17], spill: true });
    o.pas = o.w.chain({ pts: [[-16, -20], [o.VX, -20], [o.VX, 10]], w: 13, over: o.top });
    o.cham = o.w.chain({ pts: [[0, -35], [0, 105]], w: 39, under: o.pas });
    o.inl = o.w.chain({ pts: [[0, -85], [0, -35]], w: 21, over: o.cham });
    [o.top, o.pas, o.inl].forEach(function (k) { o.w.fill(k, 0, o.w.chains[k].L); });
    o.w.fill(o.cham, 0, 39 * (30 - 10 + 35));
    o.w.hide = function (x, y) { var Y = o.pis.position.y; return (y > Y - 11 && y < Y + 11 && Math.abs(x) < 21) || (y < -30 && y > -36 && Math.abs(x) < 13); };
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P;
    var y0 = o.pis.position.y;
    o.th += S.w * dt;
    var Y = 30 + 15 * Math.sin(o.th), dy = Y - y0, v = dt > 0 ? dy / dt : 0, yr = Y + o.Lr;
    o.pis.position.y = Y;
    var E = P.meet(o.G[0], o.G[1], o.Lg, 0, yr, o.Lh, 1);
    o.link.span(o.G[0], o.G[1], -4, E[0], E[1], -4);
    o.h.position.set(0, yr, 0); o.h.rotation.z = Math.atan2(E[1] - yr, E[0]);
    o.cf.scale.y = Y - 10 + 34.5;
    var dq = 39 * Math.abs(dy), W = o.w;
    if (dy > 0) { W.shift(o.cham, dq); W.shift(o.inl, dq, true); }                  // up: water comes in from the well
    else if (dy < 0) {                                                                // down: water is pushed out along the passage
      W.chains[o.top].v = 2.2 * Math.abs(v) * 39 / 17;
      W.shift(o.top, dq); W.shift(o.pas, dq); W.shift(o.cham, -dq);
      o.out += -dy * .01;
    }
    W.update(dt);
    var up = Math.cos(o.th) * (S.w >= 0 ? 1 : -1) > 0, want = Math.min(1, Math.sqrt(Math.abs(v) / 30)), k = Math.min(1, dt * 10);
    o.ti += ((up ? want : 0) - o.ti) * k; o.to += ((up ? 0 : want) - o.to) * k;
    o.vi.set(o.ti); o.vo.set(o.to);
    S.set("q", o.out.toFixed(1) + " L");
    S.set("s", S.w ? (up ? "Up" : "Down") : "Stopped");
  }
});
