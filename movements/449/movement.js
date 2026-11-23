M507.define({
  number: 449,
  title: "Lifting pump with a flap valve",
  lede: "A lift pump with a closed top. The piston rod slides out through a tight collar, and the water leaves by a side pipe with a hinged flap in it. Because nothing can leak back, the pipe can carry the water up as high as you like.",
  alt: "A pump cut open down the middle. A piston with a lid valve slides in a closed upright tube. Its rod comes out through a collar in the lid. A pipe leaves the top of the tube on the right and turns upward, with a hinged flap inside it. Another hinged flap covers the hole in the floor of the tube. Blue dots show the water.",
  parts: [
    { key: "rod", color: "#5E7387", name: "Piston rod", note: "Moves the piston up and down. The handle that works it is off the top of the picture." },
    { key: "piston", color: "#C8873A", name: "Piston", note: "A ring with a leather band round it and a lid valve on top. It lifts the water above it on the way up." },
    { key: "valves", color: "#D9B13B", name: "Valves", note: "A lid on the piston and two hinged flaps, one in the floor and one in the outlet pipe. Each opens only one way. Watch the red marks." },
    { key: "body", color: "#4FA58A", name: "Pump body", note: "A tube closed at the top by a lid. The rod passes through a packed collar in the lid, called a stuffing box, so no water squirts out round it." }
  ],
  closed: { label: "Pump" },
  speed: { min: 4, max: 40, value: 16, label: "Strokes", unit: " a min" },
  readouts: [{ id: "q", label: "Delivered" }, { id: "s", label: "Stroke" }],
  views: { "3d": [120, 60, 730], front: [15, 35, 630], side: [630, 35, 0] },
  target: [15, 45, 0],
  how: [
    "Watch the piston go up. Its lid is pressed shut, so it pushes all the water above it out of the side pipe. The flap in that pipe swings open to let it pass. Below the piston, the flap in the floor opens and water from the well follows the piston up.",
    "On the way down, both flaps fall shut. The flap in the pipe holds up all the water above it, so none runs back. The lid on the piston lifts, and the piston slides down through the water ready for the next stroke.",
    "The tube is closed at the top and the flap holds the water in the pipe, so the pipe can climb as high as needed. Try pausing in the middle of each stroke and see which valves are open. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a cut-away. The front half of the pump is left off so you can see in. The handle is not in Brown's drawing, so a plain grip on the rod stands in for it. The sizes, the shape of the valves and the made-up size used for the litres are not from the book. The pipes are cut short, and the model starts with them full of water.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, bm = c.mat("body"), vm = c.mat("valves"), red = c.mat("valves", "mark"), dk = c.mat("valves", "dark");
    var o = this.o = { th: 0, out: 0, tl: 0, tf: 0, tp: 0 };
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
    // body: suction pipe y -110 .. -77.5, floor flange -77.5 .. -65 (hole r 12), barrel bore r 27.5 up to the lid underside y 80
    P.at(c.shell(P.halfSection({ poly: [[12, -110], [20, -110], [20, -77.5], [42, -77.5], [42, -65], [32.5, -65], [32.5, 54], [27.5, 54], [27.5, -65], [12, -65]], material: bm }), "open"), 0, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[13, -110], [20, -110], [20, -77.5], [42, -77.5], [42, -65], [32.5, -65], [32.5, 54], [28.5, 54], [28.5, -65], [13, -65]], material: bm, steps: 56 }), "closed"), 0, 0, 0, scene);   // closed: bore 1 wider, so the water fill inside never lies on it
    // wall y 54 .. 78, with a gap on the right where the outlet pipe (outside radius 12) leaves
    scene.add(c.shell(P.shellSection({ poly: [[27.5, 54], [32.5, 54], [32.5, 78], [27.5, 78]], from: Math.asin(12 / 27.5), to: Math.PI, material: bm }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: [[28.5, 54], [32.5, 54], [32.5, 78], [28.5, 78]], material: bm }), "closed"));   // closed: no gap, the outlet starts inside the wall
    // top of the wall, lid flange y 80 .. 90 and stuffing box y 90 .. 105, bored r 3 for the rod
    P.at(c.shell(P.halfSection({ poly: [[27.5, 78], [32.5, 78], [32.5, 80], [42, 80], [42, 90], [15, 90], [15, 105], [3, 105], [3, 80], [27.5, 80]], material: bm }), "open"), 0, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[28.5, 78], [32.5, 78], [32.5, 80], [42, 80], [42, 90], [15, 90], [15, 105], [3, 105], [3, 80], [28.5, 80]], material: bm, steps: 56 }), "closed"), 0, 0, 0, scene);
    P.at(c.shell(P.halfSection({ poly: [[3, 105], [17, 105], [17, 110], [3, 110]], material: c.mat("body", "dark") }), "open"), 0, 0, 0, scene);   // gland that squeezes the packing, y 105 .. 110
    P.at(c.shell(P.wholeSection({ poly: [[3, 105], [17, 105], [17, 110], [3, 110]], material: c.mat("body", "dark"), steps: 56 }), "closed"), 0, 0, 0, scene);
    scene.add(c.shell(P.pipeSection({ pts: [[Math.sqrt(27.5 * 27.5 - 144), 66], [62.5, 66], [62.5, 180]], rIn: 9, rOut: 12, ends: false, material: bm }), "open"));   // outlet, off the top
    scene.add(c.shell(wholePipe([[28, 66], [62.5, 66], [62.5, 180]], 9, 12, bm, false), "closed"));   // starts in the barrel wall (r 27.5 .. 32.5)
    P.at(P.halfSection({ poly: [[6, 0], [9.3, 0], [9.3, 3], [6, 3]], material: bm }), 62.5, 117, 0, scene);   // seat in the outlet, y 117 .. 120
    o.fo = P.at(P.flapValve({ radius: 8.4, side: 1, open: .95, material: vm, mark: red, pin: dk }), 54.1, 120.5, 0, scene);
    o.fl = P.at(P.flapValve({ radius: 13, side: 1, open: .8, material: vm, mark: red, pin: dk }), -13, -64.5, 0, scene);
    // piston about the top of its stirrup (y = 0): ring y -52.5 .. -30 with a leather band, valve hole r 12
    o.pis = P.at(new T.Group(), 0, 43, 0, scene);
    [[-52.5, -45, "piston"], [-45, -37, "dark"], [-37, -30, "piston"]].forEach(function (b) {
      P.at(P.halfSection({ poly: [[12, b[0]], [27, b[0]], [27, b[1]], [12, b[1]]], material: b[2] === "dark" ? c.mat("piston", "dark") : c.mat("piston") }), 0, 0, 0, o.pis);
    });
    P.at(P.arc(20, 2, Math.PI, c.mat("piston")), 0, -20, 0, o.pis);         // stirrup, top at y 2
    P.at(P.cylY(2, 10, c.mat("piston")), -20, -25, 0, o.pis); P.at(P.cylY(2, 10, c.mat("piston")), 20, -25, 0, o.pis);   // legs y -30 .. -20
    o.pv = P.at(P.buttonValve({ radius: 14, height: 6, lift: 5, material: vm, mark: red }), 0, -30, 0, o.pis);
    P.at(P.cylY(2.4, 150, c.mat("rod")), 0, 77, 0, o.pis);                  // rod y 2 .. 152 above the stirrup
    P.at(P.cylX(3.5, 40, c.mat("rod")), 0, 152, 0, o.pis);                  // grip
    // water: a faint fill everywhere (the pump is full), and dots that move by volume
    var fm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide });
    c.fluid(P.at(P.halfSection({ poly: [[0, -109.5], [11.5, -109.5], [11.5, -64.5], [27.3, -64.5], [27.3, 79.5], [0, 79.5]], material: fm }), 0, 0, -.6, scene));   // water seen through the cut, faintly through the closed pump
    c.fluid(P.at(P.pipeSection({ pts: [[26, 66], [62.5, 66], [62.5, 180]], rIn: .1, rOut: 8.5, ends: false, material: fm }), 0, 0, -.6, scene));   // water seen through the cut, faintly through the closed pump
    o.w = P.pumpWater({ count: 420, color: c.spot, density: .03 }); scene.add(o.w);
    o.main = o.w.chain({ pts: [[0, -110], [0, -65], [0, 66], [62.5, 66], [62.5, 180]], w: [24, 55, 18, 18], spill: true });   // spills out of the open top of the outlet
    o.w.fill(o.main, 0, o.w.chains[o.main].L);
    o.w.hide = function (x, y) { var Y = o.pis.position.y; return (y > Y - 53 && y < Y - 29 && Math.abs(x) < 28) || (y < -60 && y > -66 && Math.abs(x) < 14); };
  },

  step: function (c, dt, S) {
    var o = this.o;
    var y0 = o.pis.position.y;
    o.th += S.w * dt;
    var Y = 43 + 28.7 * Math.sin(o.th), dy = Y - y0, v = dt > 0 ? dy / dt : 0;
    o.pis.position.y = Y;
    var up = Math.cos(o.th) * (S.w >= 0 ? 1 : -1) > 0;
    o.w.chains[o.main].v = dy > 0 ? 55 * v / 18 : 0;                       // water leaves the outlet as fast as the piston pushes it
    if (dy > 0) { o.w.shift(o.main, 55 * dy, true); o.out += dy * .019; }   // up stroke: all the water moves on by the piston's sweep
    o.w.update(dt);
    var want = Math.min(1, Math.sqrt(Math.abs(v) / 40)), k = Math.min(1, dt * 10);
    o.tl += ((up ? want : 0) - o.tl) * k; o.tp += ((up ? 0 : want) - o.tp) * k;
    o.fl.set(o.tl); o.fo.set(o.tl); o.pv.set(o.tp);
    S.set("q", o.out.toFixed(1) + " L");
    S.set("s", S.w ? (up ? "Up" : "Down") : "Stopped");
  }
});
