M507.define({
  number: 429,
  title: "Holly's elliptical rotary engine",
  lede: "Two oval pistons with gear teeth turn inside a casing shaped like a figure eight. Steam comes in between them and pushes them round in opposite ways. The teeth keep the two ovals in step, so they always seal against each other.",
  alt: "A casing shaped like a figure eight lying on its side, with a pipe at the top and a pipe at the bottom, drawn with its front cover off. Inside are two oval toothed wheels, one orange and one violet, with their teeth locked together in the middle.",
  parts: [
    { key: "case", color: "#4FA58A", name: "Casing", note: "Two round rooms joined into a figure eight, with a pipe at the top and one at the bottom. The long ends of the pistons sweep round its walls." },
    { key: "left", color: "#C8873A", name: "Left piston", note: "An oval wheel with teeth all the way round. Watch its red stripe. Its two long ends seal against the casing wall." },
    { key: "right", color: "#8E7AA8", name: "Right piston", note: "An oval wheel just like the left one. The teeth make it turn the opposite way, and they stop steam slipping down the middle." }
  ],
  controls: [{ id: "steam", label: "Steam enters at the", value: "top", options: [["top", "Top"], ["bottom", "Bottom"]] }],
  closed: { label: "Casing" },
  readouts: [{ id: "l", label: "Left piston" }, { id: "r", label: "Right piston" }],
  views: { "3d": [115, 90, 450], front: [0, 0, 480], side: [560, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Look at the two ovals. Each turns on its own shaft, and their teeth lock together in the middle. When one turns clockwise, the other must turn anticlockwise. A long end of one always meets a flat side of the other, so no gap opens between them.",
    "Steam comes in at the top, shown as dark blue dots. It cannot go straight down the middle, because the teeth block the way. So it pushes the ovals round. Each oval carries a pocket of steam round the outside wall to the bottom. The pale dots at the bottom are used steam going out.",
    "Watch the two readouts. The left piston turns steadily, but the right one speeds up and slows down twice in each turn. That is because the place where the teeth meet moves nearer to one shaft, then nearer to the other. Now let the steam in at the bottom. Both pistons turn the other way. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front cover is left off, and the steam is drawn as small blue balls so you can see it move. Brown draws nearly round pistons with two long teeth each. Here they are ovals with teeth all the way round, shaped so that they roll together exactly, and their long ends do the sealing. The model turns the left piston at a steady speed. In a real engine both would speed up and slow down a little. Brown shows no foot, so the casing hangs on its two pipes. The sizes, the number of teeth and the choice of pipe were made up.",

  /* Pitch curve of an oval gear turning on its centre: r(t) = p / (1 - e cos 2t), long half-axis a at t = 0, short
     half-axis b at 90 degrees. Two equal ones roll on each other without slip on centres a + b apart: when the first
     touches at angle th from its short axis, the second touches at angle t2 from its long axis, tan t2 = (b / a) tan th. */
  _a: 72, _b: 48,
  _r: function (t) { var a = this._a, b = this._b; return 2 * a * b / (a + b) / (1 - (a - b) / (a + b) * Math.cos(2 * t)); },
  _t2: function (th) { var t2 = Math.atan2(this._b * Math.sin(th), this._a * Math.cos(th)); return t2 + 2 * Math.PI * Math.round((th - t2) / (2 * Math.PI)); },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, self = this, mc = c.mat("case"), D = Math.PI / 180, a = this._a, N = 22, pts = [], i;
    var o = this.o = { th: 0 };
    function arc(cx, cy, rad, a0, a1, n) { var p = [], k, t; for (k = 0; k <= n; k++) { t = (a0 + (a1 - a0) * k / n) * D; p.push([cx + rad * Math.cos(t), cy + rad * Math.sin(t)]); } return p; }
    for (i = 0; i < 720; i++) { var t = 2 * Math.PI * i / 720, r = this._r(t); pts.push([r * Math.cos(t), r * Math.sin(t)]); }
    // 22 teeth: a tooth on each long end and a gap on each flat side, so two equal gears mesh a quarter turn apart
    o.g = ["left", "right"].map(function (key, k) {
      var g = new T.Group(), m = c.mat(key); g.position.x = k ? 60 : -60; scene.add(g);
      P.at(P.noncircularGear({ points: pts, teeth: N, phase: 0, width: 36, material: m }), 0, 0, -2, g);   // z -20..16, on the back cover
      P.at(P.cylZ(11, 104, m), 0, 0, -8, g);                                           // shaft z -60..44
      P.at(P.cylZ(16, 3, c.mat(key, "dark")), 0, 0, 17.5, g);                          // collar z 16..19, on the gear face
      P.at(P.box(42, 5, 1, c.mat(key, "mark")), 40, 0, 17, g);                         // stripe x 19..61 along the long axis, z 16.5..17.5, lifted off the face (z 16)
      return g;
    });
    var pitch = o.g[0].children[0].pitch, md = pitch / Math.PI;
    o.ded = 1.25 * md;
    // the wall is the circle swept by the corners of the long-end tooth (tip .22 of a pitch wide, one module high)
    var k9 = Math.round(.11 * pitch / (2 * Math.PI * a / 720)), q = pts[k9], q0 = pts[k9 - 1], tl = Math.hypot(q[0] - q0[0], q[1] - q0[1]);
    var Rb = Math.hypot(q[0] + (q[1] - q0[1]) / tl * md, q[1] - (q[0] - q0[0]) / tl * md) + .2, W = Rb + 12;
    o.Rb = Rb;
    // pipes on the centre line: passage x -15..15, walls x 15..27, out to y 112 and -112
    var yq = Math.sqrt(Rb * Rb - 45 * 45), yw = Math.sqrt(W * W - 33 * 33), bi = Math.atan2(yq, 45) / D, bo = Math.atan2(yw, 33) / D;
    o.beta = bi * D; o.yq = yq;
    var left = [[-15, yq], [-15, 112], [-27, 112], [-27, yw]].concat(arc(-60, 0, W, bo, 360 - bo, 80), [[-27, -112], [-15, -112]], arc(-60, 0, Rb, 360 - bi, bi, 80));
    var back = [[27, 112]].concat(arc(60, 0, W, 180 - bo, -180 + bo, 80), [[27, -112], [-27, -112]], arc(-60, 0, W, 360 - bo, bo, 80), [[-27, 112]]);
    scene.add(P.outlinePlate({ points: left, depth: 40, z0: -20, material: mc }));     // walls z -20..20
    scene.add(P.outlinePlate({ points: left.map(function (p) { return [-p[0], p[1]]; }), depth: 40, z0: -20, material: mc }));
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: c.mat("case", "light") }), "open"));   // back cover z -26..-20; pale so the steam shows
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: mc }), "closed"));   // closed view: the same back cover in the casing colour
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: 20, material: mc }), "closed"));   // closed view: front cover z 20..26 on the walls
    function sm(op) { return new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide }); }
    o.live = sm(.14); o.used = sm(.04); o.shut = sm(.09);
    o.fill = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function () { return c.fluid(P.at(P.ribbon({ n: 90, material: o.live }), 0, 0, 15, scene)); });
    // steam as moving balls round each piston, between the circle its teeth sweep and the wall (or the other piston's circle)
    o.flow = P.steamFlow({ color: c.spot, count: 340, z0: -14, z1: 12 }); scene.add(o.flow);
    o.rz = [0, 0];
    o.dom = [0, 1].map(function (k) { var sx = k ? -1 : 1; return o.flow.domain({ density: .013, pad: .06, f: function (p, out) {
      var wa = sx > 0 ? p : Math.PI - p, ri = self._r(wa - o.rz[k]) + md, cp = Math.cos(p), sp = Math.sin(p), ro = Rb, q = 120 * sp;
      if (p < o.beta || p > 2 * Math.PI - o.beta) {
        ro = Math.min(60 / cp, 112 / Math.max(1e-6, Math.abs(sp)));
        if (Math.abs(q) < Rb) ro = Math.min(ro, 120 * cp - Math.sqrt(Rb * Rb - q * q));
      }
      if (ro < ri) ro = ri;
      out[0] = sx * (-60 + ri * cp); out[1] = ri * sp; out[2] = sx * (-60 + ro * cp); out[3] = ro * sp;
    } }); });
    o.bars = [0, 0, 0, 0]; o.kinds = [0, 0, 0]; o.ports = [0, 0, 0];
    o.fp = [1, -1].map(function (s) { return o.flow.pipe({ points: [[0, s * 138], [0, s * 62]], width: 20, n: 16 }); });
    var yc = 60 * yq / 45;                                                             // where the edge of the gear sheets meets the centre line
    o.pipe = [1, -1].map(function (s) {
      var m = P.at(P.ribbon({ n: 2, material: o.live }), 0, 0, 15, scene);
      m.set(function (x) { return [x, s * (yq + (15 - Math.abs(x)) * (yc - yq) / 15), x, s * 112]; }, -15, 15); return m;
    });
  },

  step: function (c, dt, S) {
    var o = this.o, self = this, dir = S.controls.steam === "bottom" ? -1 : 1, PI = Math.PI, i, k;
    o.th += dir * S.w * dt;
    var th = -25 * PI / 180 + o.th, rot = [PI / 2 + th, -this._t2(th)];
    o.g[0].rotation.z = rot[0]; o.g[1].rotation.z = rot[1];
    // steam round each piston, by angle p about its shaft measured from the middle (p = 0) up over the top
    for (k = 0; k < 2; k++) {
      var sx = k ? -1 : 1, be = o.beta, cut = [0];
      var f = (function (sx, rz) { return function (p) {
        var wa = sx > 0 ? p : PI - p, ri = self._r(wa - rz) - o.ded, cp = Math.cos(p), sp = Math.sin(p);
        var open = p < be || p > 2 * PI - be, ro = open ? Math.min(60 / cp, 112 / Math.max(1e-6, Math.abs(sp))) : o.Rb;
        return [sx * (-60 + ri * cp), ri * sp, sx * (-60 + ro * cp), ro * sp];
      }; })(sx, rot[k]);
      for (i = 0; i < 2; i++) { var p = sx > 0 ? rot[k] + i * PI : PI - rot[k] - i * PI; p -= 2 * PI * Math.floor(p / (2 * PI)); if (p >= be && p <= 2 * PI - be) cut.push(p); }
      cut.sort(function (x, y) { return x - y; }); cut.push(2 * PI);
      // draw each room, split where the wall ends at the pipes so the sheet follows the corner exactly
      var edges = [be, 2 * PI - be], n = 0, j;
      for (i = 0; i < cut.length - 1; i++) {
        var mat = i === 0 ? (dir > 0 ? o.live : o.used) : i === cut.length - 2 ? (dir > 0 ? o.used : o.live) : o.shut, s0 = cut[i];
        for (j = 0; j <= 2; j++) {
          var s1 = j < 2 ? Math.min(cut[i + 1], Math.max(s0, edges[j])) : cut[i + 1];
          if (s1 - s0 > 1e-3) { var m = o.fill[k * 5 + n++]; m.material = mat; m.set(f, s0 + 1e-4, s1 - 1e-4, Math.max(3, Math.ceil((s1 - s0) / .07))); }
          s0 = s1;
        }
      }
      for (; n < 5; n++) o.fill[k * 5 + n].set(f, 0, 0);
      for (i = 0; i < cut.length; i++) o.bars[i] = cut[i];
      for (i = 0; i < cut.length - 1; i++) { o.kinds[i] = i === 0 ? (dir > 0 ? 1 : 3) : i === cut.length - 2 ? (dir > 0 ? 3 : 1) : 2; o.ports[i] = i === 0 ? .85 * be : 2 * PI - .85 * be; }
      o.rz[k] = rot[k]; o.dom[k].set(o.bars, o.kinds, o.ports, cut.length - 1);
    }
    o.fp[0].out = dir < 0; o.fp[1].out = dir > 0;
    o.flow.update(Math.abs(S.w) * dt);
    o.pipe[0].material = dir > 0 ? o.live : o.used; o.pipe[1].material = dir > 0 ? o.used : o.live;
    var rpm = S.playing ? dir * S.rpm : 0, r1 = this._r(PI / 2 + th), r2 = this._a + this._b - r1;
    function fm(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("l", fm(rpm)); S.set("r", fm(rpm === 0 ? 0 : -rpm * r1 / r2));
  }
});
