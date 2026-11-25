M507.define({
  number: 448,
  title: "Common lift pump",
  lede: "The pump you work by hand in an old farmyard. Each time the handle goes down, a piston inside the tube lifts the water above it, and some pours out of the spout. Two little valves make sure the water only ever goes up.",
  alt: "A pump cut open down the middle. A narrow tube widens into a cup at the top with a spout on the left. A handle on a pivot at the top right works a rod that goes down to a piston in the tube. The piston has a small lid valve on top, and another lid valve sits at the bottom of the tube. Blue dots show the water.",
  parts: [
    { key: "handle", color: "#5E7387", name: "Handle and rod", note: "Push the long end of the handle down and the short end lifts the rod and the piston." },
    { key: "piston", color: "#C8873A", name: "Piston", note: "A ring with a leather band that fits the tube tightly. It is hollow in the middle, with a valve on top, so water can pass through it on the way down." },
    { key: "valves", color: "#D9B13B", name: "Valves", note: "Two lids that lift to let water up and drop to stop it going back. Watch the red knobs: one valve opens while the other shuts." },
    { key: "body", color: "#4FA58A", name: "Pump body", note: "The tube, the wide cup at the top and the spout. The pipe below reaches down into the well." }
  ],
  controls: [{ type: "range", id: "d", label: "Depth to water", min: 2, max: 14, step: 1, value: 4, unit: " m",
    presets: [[4, "4 m"], [9, "9 m"], [12, "12 m"]] }],
  closed: { label: "Pump" },
  speed: { min: 4, max: 40, value: 16, label: "Strokes", unit: " a min" },
  readouts: [{ id: "q", label: "Delivered" }, { id: "s", label: "Stroke" }],
  views: { "3d": [258, 119, 485], front: [32, -5, 550], side: [550, -5, 30] },
  target: [32, -5, 0],
  how: [
    "Watch the piston as it rises. The lid on top of it is pressed shut, so it lifts all the water above it. Below it, the bottom valve opens and water from the well rushes up to fill the space. When the water above reaches the spout, it pours out.",
    "On the way down, the bottom valve drops shut, so no water goes back to the well. The lid on the piston lifts instead, and the piston slides down through the water. Nothing pours out on this stroke. The water stays where it is, ready to be lifted again.",
    "The water below is pushed up by the air pressing on the well, not pulled. That push can only hold up about 10 m of water. Try 4 m, then 12 m, and watch the tube stay empty. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a cut-away. The front half of the pump is left off so you can see in. The sizes, the shape of the valves and the made-up size used for the litres are not from the book. The pipe down to the well is cut short, and the model starts with it already full of water.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, bm = c.mat("body"), vm = c.mat("valves"), red = c.mat("valves", "mark"), hm = c.mat("handle");
    var o = this.o = { th: 0, Y0: 27.5, Lr: 106.5, PV: [46.5, 116], qs: 0, out: 0, primed: true, tv: 0, tp: 0 };
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
    // body, outline right of the axis: tail y -140 .. -88, barrel bore r 17.5 from the valve seat (y -80) to the cup floor (y 28)
    var body = [[12, -140], [17, -140], [24, -88], [24, 22], [37.5, 22], [37.5, 31], [30, 31], [30, 28], [17.5, 28], [17.5, -80], [11, -80], [11, -90]];
    P.at(c.shell(P.halfSection({ poly: body, material: bm }), "open"), 0, 0, 0, scene);
    var bodyC = [[13, -140], [17, -140], [24, -88], [24, 22], [37.5, 22], [37.5, 31], [30, 31], [30, 28], [18.5, 28], [18.5, -80.5], [11, -80.5], [12, -90]];   // closed: bore and tail 1 wider, seat 0.5 below the valve, so nothing hidden inside lies on the water fill
    scene.add(c.shell(P.wholeSection({ poly: bodyC, material: bm, steps: 56 }), "closed"));
    // cup wall y 31 .. 53, with a gap on the left where the spout comes in (spout outside radius 11)
    scene.add(c.shell(P.shellSection({ poly: [[30, 31], [37.5, 31], [37.5, 53], [30, 53]], from: 0, to: Math.PI - Math.asin(11 / 30), material: bm }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: [[30, 31], [37.5, 31], [37.5, 53], [30, 53]], material: bm }), "closed"));   // closed: no gap, the spout starts inside the wall
    P.at(c.shell(P.halfSection({ poly: [[30, 53], [37.5, 53], [37.5, 78], [40, 78], [40, 83], [30, 83]], material: bm }), "open"), 0, 0, 0, scene);
    scene.add(c.shell(P.wholeSection({ poly: [[30, 53], [37.5, 53], [37.5, 78], [40, 78], [40, 83], [30, 83]], material: bm }), "closed"));   // cup y 53 .. 83, rim
    scene.add(c.shell(P.pipeSection({ pts: [[-27.9, 42], [-44, 42], [-64, 29]], rIn: 7, rOut: 11, material: bm }), "open"));
    scene.add(c.shell(wholePipe([[-33.5, 42], [-44, 42], [-64, 29]], 7, 11, bm), "closed"));   // starts in the middle of the cup wall (r 30 .. 37.5)   // spout, starts inside the cup's bore
    P.at(P.rod(3, bm), 0, 0, 0, scene).span(35, 79, -6, 46.5, 116, -6);   // bracket from the rim to the pivot, z -9 .. -3 (behind the handle)
    P.at(P.cylZ(2.5, 13, c.mat("body", "dark")), 46.5, 116, -2.5, scene);   // pivot pin z -9 .. 4
    // handle, turning about the pivot: short arm to the rod pin, long curved arm to the ball (handle z -2.5 .. 2.5)
    o.h = P.at(new T.Group(), o.PV[0], o.PV[1], 0, scene);
    var sa = 160 * Math.PI / 180, pin = [52 * Math.cos(sa), 52 * Math.sin(sa)], arm = [[0, 0], [21, -18.5], [51, -51], [81, -88.5]];
    P.at(P.rod(3.5, hm), 0, 0, 0, o.h).span(0, 0, 0, pin[0], pin[1], 0);
    for (var i = 1; i < arm.length; i++) { P.at(P.rod(3.5, hm), 0, 0, 0, o.h).span(arm[i - 1][0], arm[i - 1][1], 0, arm[i][0], arm[i][1], 0); P.at(P.sphere(3.5, hm), arm[i][0], arm[i][1], 0, o.h); }
    P.at(P.sphere(7, hm), 81, -88.5, 0, o.h);                               // ball on the end
    P.at(P.cylZ(5.5, 5, hm), 0, 0, 0, o.h); P.at(P.cylZ(5, 5, hm), pin[0], pin[1], 0, o.h);
    o.pin = pin; o.sa = sa;
    o.rod = P.at(P.rod(2.2, hm), 0, 0, 0, scene);
    // piston, about the top of its stirrup (y = 0): ring y -37.5 .. -23.5, leather band -23.5 .. -15.5, valve hole r 9
    o.pis = P.at(new T.Group(), 0, o.Y0, 0, scene);
    P.at(P.halfSection({ poly: [[9, -37.5], [17, -37.5], [17, -23.5], [9, -23.5]], material: c.mat("piston") }), 0, 0, 0, o.pis);
    P.at(P.halfSection({ poly: [[9, -23.5], [17, -23.5], [17, -15.5], [9, -15.5]], material: c.mat("piston", "dark") }), 0, 0, 0, o.pis);
    P.at(P.arc(14, 1.8, Math.PI, c.mat("piston")), 0, -14, 0, o.pis);       // stirrup, top at y 1.8
    P.at(P.cylY(1.8, 1.5, c.mat("piston")), -14, -14.25, 0, o.pis); P.at(P.cylY(1.8, 1.5, c.mat("piston")), 14, -14.25, 0, o.pis);   // legs y -15.5 .. -14
    o.pv = P.at(P.buttonValve({ radius: 11, height: 5, lift: 4, material: vm, mark: red }), 0, -15.5, 0, o.pis);
    o.lv = P.at(P.buttonValve({ radius: 14, height: 6, lift: 5, material: vm, mark: red }), 0, -80, 0, scene);
    // water: a faint fill up to the level, and dots that move by volume
    o.fm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .18, depthWrite: false, side: T.DoubleSide });
    o.fill = c.fluid(P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: o.fm }), 0, 0, -.6, scene));   // shows faintly through the closed pump
    o.fill.children.forEach(function (m) { m.userData.live = true; });
    o.w = P.pumpWater({ count: 260, color: c.spot, density: .03, fall: 70 }); scene.add(o.w);
    o.spout = o.w.chain({ pts: [[0, 37], [-30, 39], [-46, 39], [-64, 27]], w: 8, spill: true });
    o.main = o.w.chain({ pts: [[0, -140], [0, -80], [0, 28], [0, 35]], w: [22, 35, 60], over: o.spout });
    o.w.chains[o.spout].v = 60;
    var s = this;
    o.w.hide = function (x, y) { var Y = o.pis.position.y; return (y > Y - 38 && y < Y - 15 && Math.abs(x) < 18) || (y < -73 && y > -81 && Math.abs(x) < 15); };
    o.qOf = function (y) { return y < -80 ? 22 * (y + 140) : y < 28 ? 1320 + 35 * (y + 80) : 1320 + 3780 + 60 * (y - 28); };
    o.yOf = function (q) { return q < 1320 ? -140 + q / 22 : q < 5100 ? -80 + (q - 1320) / 35 : 28 + (q - 5100) / 60; };
    o.prime = function () { o.w.clear(o.main); o.w.clear(o.spout); o.qs = o.qOf(o.pis.position.y - 15.5); o.w.fill(o.main, 0, o.qs); o.ys = null; };
    o.prime();
  },

  setFill: function (ys) {
    var o = this.o, q = [[0, -139.5], [11.5, -139.5]];
    if (ys === null) { this.o.fill.visible = false; return; }
    this.o.fill.visible = true;
    [[10.5, -90], [10.5, -79.5], [17.3, -79.5], [17.3, 28.5], [29, 28.5], [29, 83]].forEach(function (p, i, a) {
      var prev = i ? a[i - 1] : [11.5, -139.5];
      if (p[1] <= ys) q.push(p); else if (prev[1] < ys) q.push([prev[0], ys]);
    });
    q.push([0, ys]);
    o.fill.set(q);
  },

  step: function (c, dt, S) {
    var o = this.o, primed = S.controls.d <= 10;
    if (primed !== o.primed) { o.primed = primed; if (primed) o.prime(); else { o.w.clear(o.main); o.qs = 0; } o.ys = undefined; }
    var y0 = o.pis.position.y;
    o.th += S.w * dt;
    var d = .35 * (1 - Math.cos(o.th)), a = o.sa + d;
    o.h.rotation.z = d;
    var px = o.PV[0] + 52 * Math.cos(a), py = o.PV[1] + 52 * Math.sin(a), Y = py - Math.sqrt(o.Lr * o.Lr - px * px);
    o.pis.position.y = Y; o.rod.span(px, py, 0, 0, Y + 1.8, 0);
    var dy = Y - y0, v = dt > 0 ? dy / dt : 0, up = Math.sin(o.th) * (S.w >= 0 ? 1 : -1) < 0;
    if (dy > 0 && primed) {                                                  // up stroke: everything from the well to the spout moves up
      var dq = 35 * dy, room = o.w.chains[o.main].L - o.qs;
      o.w.shift(o.spout, 0); o.w.shift(o.main, dq, true);
      if (dq > room) o.out += (dq - Math.max(0, room)) / 35 * .0077;
      o.qs = Math.min(o.w.chains[o.main].L, o.qs + dq);
    }
    o.w.shift(o.spout, 60 * 8 * dt);                                       // water in the spout runs out by itself
    o.w.chains[o.spout].v = 60;
    o.w.update(dt);
    var ys = primed ? o.yOf(o.qs) : null;
    if (ys !== o.ys) { this.setFill(ys); o.ys = ys; }
    var want = Math.min(1, Math.abs(v) / 25);
    o.tv += ((up && primed ? want : 0) - o.tv) * Math.min(1, dt * 10);
    o.tp += ((!up && primed && o.qs > 0 ? want : 0) - o.tp) * Math.min(1, dt * 10);
    o.lv.set(o.tv); o.pv.set(o.tp);
    S.set("q", o.out.toFixed(1) + " L");
    S.set("s", S.w ? (up ? "Up" : "Down") : "Stopped");
  }
});
