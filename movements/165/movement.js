M507.define({
  number: 165,
  title: "Waved wheel and rod",
  lede: "A wheel with a wavy lower edge turns on an upright shaft. A small roller rides under that edge and lifts and drops an upright bar. A turning motion becomes a straight up-and-down one, and a jointed rod follows along.",
  alt: "A wide drum-shaped wheel hangs from an upright shaft, its lower edge cut in rounded waves. A small roller rests under the edge, with an upright bar below it. A rod in two jointed parts runs from the roller to a post on the left.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Waved wheel", note: "A drum on an upright shaft. The lower edge is cut in waves, so it is lower in some places and higher in others." },
    { key: "bar", color: "#C8873A", name: "Roller and bar", note: "The roller is pressed up against the waved edge by a spring. The upright bar below it slides in a guide, so it can only go up and down." },
    { key: "rod", color: "#D9B13B", name: "Jointed rod", note: "Two links joined in the middle. One end is fixed to the post, the other is pinned to the roller. It swings as the bar moves." },
    { key: "mark", color: "#C2503F", name: "Marker ring", note: "A ring on the bar. Watch it: it goes down and up once for every wave that passes the roller." }
  ],
  controls: [{ id: "waves", label: "Waves on the wheel", value: "8", options: [["4", "Few"], ["8", "As drawn"], ["12", "Many"]] }],
  readouts: [{ id: "trav", label: "Bar travel" }, { id: "vel", label: "Bar speed" }],
  views: { front: [-60, -30, 1000], "3d": [400, 160, 740], side: [950, -30, 0] },
  target: [-60, -30, 0],
  distance: [400, 2600],
  how: [
    "The wheel turns and the roller stays in one place under its edge. Where the edge dips low, it pushes the roller down, and the bar goes down with it. Where the edge is high, the spring pushes the roller back up against it.",
    "The bar can only slide up and down in its guide, so the roller goes straight up and down. The jointed rod is pinned to the roller. It folds and unfolds a little at the middle joint and swings about the post. It does not move the bar. It just follows it.",
    "Count the dips that pass the roller in one turn: that is how many times the bar goes down and up. Try Few, As drawn and Many, and watch the bar speed reading."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the shape of the waves, the spring that holds the roller up, the guide, the bearing at the top of the shaft, the post, the back plate and the base were made up. Brown does not say what presses the roller up, so a spring was added. The bar height is worked out exactly from where the round roller touches the wavy edge. The Few and Many choices were added for comparison.",

  G: { R: 130, RI: 120, ZR: 125, A: 26, RR: 30, TOP: 45, L: 120, PX: -228, PY: -100, BAR: 150, GUIDE: -130 },

  // Height of the roller centre when the wheel has turned by th and has n waves. The roller circle lies in the plane z = ZR,
  // centre x = 0, and is pushed up until it touches the lower edge: the lowest of (edge height - roller height) over its width.
  tip: function (th, n) {
    var G = this.G, c = Math.cos(th), s = Math.sin(th), best = 1e9, i, x, xp, zp, h, v;
    for (i = -60; i <= 60; i++) {
      x = G.RR * i / 60;
      xp = x * c - G.ZR * s; zp = x * s + G.ZR * c;
      h = -G.A * (1 + Math.cos(n * Math.atan2(zp, xp))) / 2;
      v = h - Math.sqrt(Math.max(0, G.RR * G.RR - x * x));
      if (v < best) best = v;
    }
    return best;
  },

  // Middle joint: two links of equal length L from the fixed pivot to the roller pin; the joint sits above the line between them.
  joint: function (yc) {
    var G = this.G, dx = 0 - G.PX, dy = yc - G.PY, d = Math.sqrt(dx * dx + dy * dy), a = d / 2, h = Math.sqrt(Math.max(0, G.L * G.L - a * a));
    return [G.PX + dx / 2 - dy / d * h, G.PY + dy / 2 + dx / d * h];
  },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene;
    var o = this.o = { th: 0, n: 0, last: null };
    c.mat("wheel").side = T.DoubleSide;
    // wheel: skirt y edge..45 (r 120..130), plate y 45..53 (r 130, sits on the skirt top), hub y 53..68, shaft y 68..150
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylY(130, 8, c.mat("wheel")), 0, 49, 0, o.wheel);
    P.at(P.cylY(36, 15, c.mat("wheel", "light")), 0, 60.5, 0, o.wheel);
    P.at(P.cylY(24, 82, c.mat("wheel")), 0, 109, 0, o.wheel);
    P.at(P.cylY(4, 1.4, c.mat("wheel", "dark")), 18, 69, 0, o.wheel);   // dark dot on the hub top, y 68.3..69.7... hub top is 68, dot lifted
    // bar group: origin at the roller centre
    o.bar = new T.Group(); o.bar.position.z = G.ZR; scene.add(o.bar);
    P.at(P.cylZ(G.RR, 12, c.mat("bar")), 0, 0, 0, o.bar);                    // roller z 119..131
    P.at(P.cylZ(4, 28, c.mat("bar", "dark")), 0, 0, 9, o.bar);             // pin z 119..148 (local -6..23)
    P.at(P.cylY(5, G.BAR - 10, c.mat("bar")), 0, -(G.BAR - 10) / 2 - 0, 0, o.bar);   // stem y 0..-140
    P.at(P.mesh(new T.CylinderGeometry(5, 0.4, 10, 24), c.mat("bar")), 0, -G.BAR + 5, 0, o.bar);   // foot, y -150..-140 (cone up)
    o.bar.children[3].rotation.z = Math.PI;
    P.at(P.cylY(11, 6, c.mat("bar", "light")), 0, -41, 0, o.bar);            // collar y -44..-38
    P.at(P.cylY(7.5, 5, c.mat("mark")), 0, -125, 0, o.bar);                  // marker ring below the guide
    // spring from the guide top (y -130) to the collar (y yc-44)
    o.spring = P.spring({ radius: 9, wire: 1.5, turns: 6, length: 40, material: c.fixed });
    o.spring.rotation.z = Math.PI / 2; o.spring.position.set(0, G.GUIDE, G.ZR); scene.add(o.spring);
    // links: link one z 134..140, link two z 140..146
    function link(z, mat) { var m = P.box(1, 14, 6, mat); m.position.z = z; var g = new T.Group(); g.add(m); scene.add(g); g.body = m; return g; }
    o.l1 = link(137, c.mat("rod")); o.l2 = link(143, c.mat("rod"));
    P.at(P.cylZ(5, 10, c.mat("rod", "dark")), G.PX, G.PY, 138, scene);       // pivot pin z 134..143
    o.jp = P.at(P.cylZ(5, 16, c.mat("rod", "dark")), 0, 0, 141, scene);     // joint pin z 134..149
    // supports (all fixed)
    P.at(P.box(360, 360, 10, c.fixed), -90, -30, -145, scene);                // back plate x -270..90, y -210..150, z -150..-140
    P.at(P.box(360, 12, 200, c.fixed), -90, -216, -50, scene);                // base x -270..90, y -222..-210, z -150..50
    P.at(P.guideBlock({ w: 80, h: 30, d: 60, hole: 25, material: c.fixed }), 0, 115, 0, scene);   // bearing x -40..40, y 100..130, z -30..30
    P.at(P.box(80, 30, 110, c.fixed), 0, 115, -85, scene);                    // arm x -40..40, y 100..130, z -140..-30
    P.at(P.box(40, 14, 250, c.fixed), 0, -137, -15, scene);                   // guide arm x -20..20, y -144..-130, z -140..110
    P.at(P.guideBlock({ w: 40, h: 14, d: 30, hole: 5.5, material: c.fixed }), 0, -137, G.ZR, scene);   // guide x -20..20, y -144..-130, z 110..140
    P.at(P.box(16, 122, 274, c.fixed), G.PX, -149, -3, scene);                // post x -236..-220, y -210..-88, z -140..134
    this.setWaves(c, 8);
  },

  setWaves: function (c, n) {
    var T = c.THREE, G = this.G, o = this.o, i, N = 720, pos = [], idx = [], a, ca, sa, y;
    if (o.skirt) { o.wheel.remove(o.skirt); o.skirt.geometry.dispose(); }
    for (i = 0; i <= N; i++) {
      a = 2 * Math.PI * i / N; ca = Math.cos(a); sa = Math.sin(a);
      y = -G.A * (1 + Math.cos(n * a)) / 2;
      pos.push(G.R * ca, G.TOP, G.R * sa, G.R * ca, y, G.R * sa, G.RI * ca, y, G.RI * sa, G.RI * ca, G.TOP, G.RI * sa);
    }
    for (i = 0; i < N; i++) {
      var b = i * 4, e = b + 4, q;
      for (q = 0; q < 4; q++) { var p0 = b + q, p1 = b + (q + 1) % 4, q0 = e + q, q1 = e + (q + 1) % 4; if (q === 3) continue; idx.push(p0, q0, p1, p1, q0, q1); }
    }
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    o.skirt = c.P.mesh(g, c.mat("wheel")); o.wheel.add(o.skirt);
    var lo = 1e9, hi = -1e9, k, v;
    for (k = 0; k < 360; k++) { v = this.tip(2 * Math.PI / n * k / 360, n); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    o.lo = lo; o.hi = hi; o.n = n; o.last = null;
  },

  place: function (th) {
    var o = this.o, G = this.G, n = o.n, yc = this.tip(th, n), j = this.joint(yc), self = this;
    o.wheel.rotation.y = th;
    o.bar.position.y = yc;
    o.spring.setLength(Math.max(8, yc - 44 - G.GUIDE));
    function put(l, x0, y0, x1, y1) {
      var dx = x1 - x0, dy = y1 - y0, len = Math.sqrt(dx * dx + dy * dy);
      l.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); l.rotation.z = Math.atan2(dy, dx); l.body.scale.x = len;
    }
    put(o.l1, G.PX, G.PY, j[0], j[1]); put(o.l2, j[0], j[1], 0, yc);
    o.jp.position.x = j[0]; o.jp.position.y = j[1];
    return yc;
  },

  step: function (c, dt, S) {
    var o = this.o, n = +S.controls.waves || 8;
    if (n !== o.n) this.setWaves(c, n);
    o.th += S.w * dt;
    var yc = this.place(o.th);
    var v = (dt > 0 && o.last !== null) ? (yc - o.last) / dt : 0;
    o.last = yc;
    S.set("trav", (yc - o.lo).toFixed(0) + " mm");
    S.set("vel", (v > 0.5 ? "+" : "") + v.toFixed(0) + " mm/s");
  }
});
