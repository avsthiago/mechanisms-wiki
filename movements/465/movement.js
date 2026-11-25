M507.define({
  number: 465,
  title: "Balance pumps",
  lede: "Two pumps worked by one person standing on a seesaw. As the person leans from one foot to the other, one pump lifts water while the other gets ready. The heavy balls on the beam ends balance it, so it rocks easily.",
  alt: "A wooden platform over a pit of water, between two banks of earth. A long beam with a heavy ball on each end rocks on a pivot on the platform. A person stands on the beam, holding a rail, and leans from side to side. Rods hang from the beam through slots in the platform to two pumps cut open at the front, standing in the water. Each pump pours water out of a spout onto the bank.",
  parts: [
    { key: "handle", color: "#5E7387", name: "Beam and rods", note: "A long beam that rocks on a pin in the middle, with a heavy ball on each end. A rod hangs from each side of the pin to one pump." },
    { key: "piston", color: "#C8873A", name: "Pistons", note: "Each piston is a ring with a lid valve on top. One goes up while the other goes down." },
    { key: "valves", color: "#D9B13B", name: "Valves", note: "Each pump has a lid valve in its piston and one at the foot of its tube. Watch the red knobs: in each pump one valve opens while the other shuts." },
    { key: "body", color: "#4FA58A", name: "Pumps", note: "Two tubes standing in the water, cut open at the front. Each has a spout near the top." },
    { key: "person", color: "#8E7AA8", name: "Person", note: "Leans on one foot, then the other. The weight of the body does the work, so the arms only need to steady it." }
  ],
  closed: { label: "Pumps" },
  readouts: [{ id: "q", label: "Delivered" }, { id: "s", label: "Lifting" }],
  views: { "3d": [328, 289, 703], front: [0, 115, 800], side: [800, 115, 0] },
  target: [0, 110, 0],
  how: [
    "Watch the person lean to the left. The left end of the beam goes down and the right end comes up. The right rod lifts its piston, and the water above that piston pours out of the spout.",
    "Then the person leans to the right and the other pump lifts. In each pump the lid on the piston is shut on the way up, so it carries the water. On the way down the lid opens and the piston slides through the water. The valve at the foot stops the water running back into the pit.",
    "The pumps take turns, so water comes out on every lean, first on one side, then the other. Try pausing when the beam is level and see which pump is lifting. Choose Closed to see the pumps as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The pumps are cut open at the front so the inside shows. In the drawing the two pump pipes join in the middle and rise through the platform; here each pump pours out of its own spout onto the bank, so the water can be seen. The person is drawn as simple blocks. The rail, the clamps that hold the pumps, the inside of the pumps and all the sizes were made up. The litres count assumes a made-up size for the pumps.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, bm = c.mat("body"), vm = c.mat("valves"), red = c.mat("valves", "mark"), hm = c.mat("handle"), pm = c.mat("person"), i;
    var o = this.o = { th: -1.9, dir: 1, q: 0, Yp: 165, d: 70, A: .23, Lr: 173, pumps: [], Y: [null, null] };
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
    // ground: banks y -100 .. 0, pit floor y -110 .. -100 between them, water up to y -70
    P.at(P.box(150, 100, 160, c.fixed), -185, -50, 0, scene);               // left bank x -260 .. -110
    P.at(P.box(150, 100, 160, c.fixed), 185, -50, 0, scene);                // right bank x 110 .. 260
    P.at(P.box(220, 10, 160, c.fixed), 0, -105, 0, scene);                  // pit floor, top y -100
    P.at(P.box(219, 30, 159, new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .25, depthWrite: false })), 0, -85, 0, scene);   // pit water y -100 .. -70
    // platform: legs on the banks (y 0 .. 100), top y 100 .. 110 with a slot for each rod (x 60 .. 80, z -10 .. 10)
    [-150, 150].forEach(function (x) { [-50, 50].forEach(function (z) { P.at(P.box(10, 100, 10, c.fixed), x, 50, z, scene); }); });
    P.at(P.box(80, 10, 120, c.fixed), -120, 105, 0, scene); P.at(P.box(120, 10, 120, c.fixed), 0, 105, 0, scene); P.at(P.box(80, 10, 120, c.fixed), 120, 105, 0, scene);
    [-70, 70].forEach(function (x) { [-35, 35].forEach(function (z) { P.at(P.box(20, 10, 50, c.fixed), x, 105, z, scene); }); });
    // pivot: two cheeks on the platform (y 110 .. 172) either side of the beam (z -4 .. 4)
    P.at(P.box(20, 62, 11, c.fixed), 0, 141, -10.5, scene); P.at(P.box(20, 62, 11, c.fixed), 0, 141, 10.5, scene);
    // rail for the hands: posts on the platform (y 110 .. 252), bar on top
    [-60, 60].forEach(function (x) { P.at(P.cylY(3, 142, c.fixed), x, 181, 32, scene); });
    P.at(P.cylX(3, 126, c.fixed), 0, 255, 32, scene);
    // beam
    o.beam = P.at(new T.Group(), 0, o.Yp, 0, scene);
    P.at(P.box(424, 8, 8, hm), 0, 0, 0, o.beam);                             // x -212 .. 212, top y 4
    [-220, 220].forEach(function (x) { P.at(P.sphere(18, hm), x, 0, 0, o.beam); });
    P.at(P.cylZ(4, 10, c.mat("handle", "dark")), 0, 0, 0, o.beam);           // pivot pin, z -5 .. 5 between the cheeks
    [-o.d, o.d].forEach(function (x) { P.at(P.cylZ(2.5, 10, c.mat("handle", "dark")), x, 0, 0, o.beam); });
    o.feet = [-30, 30].map(function (x) { return P.at(P.box(16, 5, 12, pm), x, 6.5, 0, o.beam); });   // feet on the beam's top (y 4 .. 9)
    // pumps: bore r 14 from the foot valve seat (y -58) to the top (y 30), tail r 8 down into the water, spout at y 18
    [-1, 1].forEach(function (s) {
      var x = s * 70, g = P.at(new T.Group(), x, 0, 0, scene), ga = Math.asin(8 / 18), pu = { s: s, x: x };
      g.add(c.shell(P.halfSection({ poly: [[8, -95], [12, -95], [12, -64], [18, -64], [18, 10], [14, 10], [14, -58], [8, -58]], material: bm }), "open"));
      g.add(c.shell(P.shellSection({ poly: [[14, 10], [18, 10], [18, 26], [14, 26]], from: s < 0 ? 0 : ga, to: s < 0 ? Math.PI - ga : Math.PI, material: bm }), "open"));
      g.add(c.shell(P.halfSection({ poly: [[14, 26], [18, 26], [18, 30], [14, 30]], material: bm }), "open"));
      scene.add(c.shell(P.pipeSection({ pts: [[x + s * 11, 18], [s * 100, 18], [s * 118, 14]], rIn: 5, rOut: 8, material: bm }), "open"));
      // closed: the whole barrel in one outline, and the spout from inside its wall (r 14 .. 18)
      g.add(c.shell(P.wholeSection({ poly: [[8, -95], [12, -95], [12, -64], [18, -64], [18, 30], [14, 30], [14, -58.5], [8, -58.5]], material: bm, steps: 56 }), "closed"));   // seat 0.5 below the foot valve
      scene.add(c.shell(wholePipe([[x + s * 15, 18], [s * 100, 18], [s * 118, 14]], 5, 8, bm), "closed"));
      P.at(P.box(110 - 86.97, 6, 6, c.fixed), s * (110 + 86.97) / 2, -20, -6, scene);   // clamp from the bank's face (x 110) to the tube's outside (x 86.97 at z -6)
      pu.foot = P.at(P.buttonValve({ radius: 10, height: 4.5, lift: 4, material: vm, mark: red }), x, -58, 0, scene);
      pu.pis = P.at(new T.Group(), x, 0, 0, scene);                          // piston, about its ring's top
      P.at(P.halfSection({ poly: [[6, -14], [13.5, -14], [13.5, 0], [6, 0]], material: c.mat("piston") }), 0, 0, 0, pu.pis);
      P.at(P.arc(10, 1.5, Math.PI, c.mat("piston")), 0, 0, 0, pu.pis);       // bridge over the valve, top y 11.5
      pu.pv = P.at(P.buttonValve({ radius: 8.5, height: 3.8, lift: 3.4, material: vm, mark: red }), 0, 0, 0, pu.pis);
      pu.rod = P.rod(2.5, hm); scene.add(pu.rod);
      o.pumps.push(pu);
    });
    // person: torso, head, legs with knees, arms to the rail
    o.body = P.at(new T.Group(), 0, 0, 0, scene);
    P.at(P.box(34, 52, 18, pm), 0, 271, 0, o.body);                           // torso y 245 .. 297
    P.at(P.sphere(12, pm), 0, 312, 0, o.body);
    P.at(P.cylY(5, 4, pm), 0, 299, 0, o.body);                                // neck
    o.limbs = []; for (i = 0; i < 6; i++) { var r = P.rod(i < 4 ? 5 : 4, pm); scene.add(r); o.limbs.push(r); }
    o.joints = []; for (i = 0; i < 2; i++) o.joints.push(P.at(P.sphere(5.5, pm), 0, 0, 0, scene));
    [-24, 24].forEach(function (x) { P.at(P.sphere(5, pm), x, 255, 32, scene); });   // hands on the rail
    // water
    var z0 = -10, z1 = -2, paths = [];
    o.pumps.forEach(function (pu) {
      var x = pu.x, s = pu.s;
      paths.push({ pts: [[x, -95], [x, -58]], n: 8, w: 10, z0: z0, z1: z1 });                                              // up the tail
      paths.push({ pts: [[x, 14], [x + s * 14, 18], [s * 100, 18], [s * 118, 14], [s * 122, 8], [s * 124, 1]], n: 16, w: 6, z0: -5, z1: -1 });   // out the spout
    });
    o.flow = P.pipeDots({ color: c.spot, paths: paths }); scene.add(o.flow);
    o.bd = P.waterDots(80, { radius: 2.2, color: c.spot }); scene.add(o.bd);
    o.pd = []; for (i = 0; i < 80; i++) { var rr = 11 * Math.sqrt(Math.random()), an = Math.PI * (1 + Math.random()); o.pd.push([rr * Math.cos(an), Math.random(), Math.min(-1.5, rr * Math.sin(an))]); }
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, i;
    if (S.w) o.dir = S.w > 0 ? 1 : -1;
    o.th += S.w * dt;
    var ph = o.A * Math.sin(o.th), cs = Math.cos(o.th) * o.dir, open = Math.sqrt(Math.abs(cs)), rightUp = cs > 0, dq = 0;
    o.beam.rotation.z = ph;
    var cp = Math.cos(ph), sp = Math.sin(ph);
    o.pumps.forEach(function (pu, k) {
      var px = pu.s * o.d * cp, py = o.Yp + pu.s * o.d * sp, dx = px - pu.x;
      var Y = py - Math.sqrt(o.Lr * o.Lr - dx * dx) - 11.5;                 // ring top; the rod keeps its length
      pu.pis.position.y = Y; pu.rod.span(pu.x, Y + 11.5, 0, px, py, 0);
      var up = (pu.s > 0) === rightUp, dy = o.Y[k] === null ? 0 : Y - o.Y[k]; o.Y[k] = Y;
      pu.foot.set(up ? open : 0); pu.pv.set(up ? 0 : open);
      var ds = 2 * Math.abs(dy);
      o.flow.move(2 * k, up ? ds : 0); o.flow.move(2 * k + 1, up ? 1.5 * ds : 0);
      if (up) dq += Math.abs(dy);
      for (i = 0; i < 40; i++) {                                              // water below the piston and above it, up to the spout
        var d = o.pd[k * 40 + i], y = i < 20 ? -56 + d[1] * (Y - 16 + 56) : Y + 13 + d[1] * (15 - Y - 13);
        o.bd.put(k * 40 + i, pu.x + d[0], y, d[2], 1);
      }
    });
    o.flow.flush(); o.bd.flush();
    // person: hips over the lower side, knees bent outward, hands on the rail
    var hx = -14 * Math.sin(o.th), hy = 245;
    o.body.position.x = hx;
    [-1, 1].forEach(function (s, k) {
      var fx = s * 30 * cp - 9 * sp, fy = o.Yp + s * 30 * sp + 9 * cp, ax = hx + s * 9;
      var kn = P.meet(ax, hy, 42, fx, fy, 42, s);
      o.limbs[2 * k].span(ax, hy, 0, kn[0], kn[1], 0); o.limbs[2 * k + 1].span(kn[0], kn[1], 0, fx, fy, 0);
      o.joints[k].position.set(kn[0], kn[1], 0);
      o.limbs[4 + k].span(hx + s * 15, 290, 0, s * 24, 255, 32);
    });
    o.q += .01 * dq;                                                          // a made-up size: 1 cm of lift moves 0.1 L
    S.set("q", o.q.toFixed(1) + " L");
    S.set("s", rightUp ? "Right" : "Left");
  }
});
