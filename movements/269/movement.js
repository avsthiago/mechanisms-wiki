M507.define({
  number: 269,
  title: "Part-toothed racks turning a gear",
  lede: "A frame slides steadily one way, then back. It has short toothed bars along its top and bottom edges, with smooth stretches between them. A gear inside the frame turns one way when a top bar pushes it and the other way when a bottom bar does.",
  alt: "A long rectangular frame with a window in it, open at the right to a handle that ends in a flat plate. Short toothed bars are spaced along the top and bottom edges of the window. A round gear with four spokes sits inside, meshing with one bar.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Frame and bars", note: "A frame that slides left and right at a steady pace. It has short bars with gear teeth along them, each called a rack. The teeth cover only part of each bar." },
    { key: "gear", color: "#C8873A", name: "Gear", note: "A gear with teeth all round. It stays in one place and turns. Watch the red stripe to see which way it goes." },
    { key: "handle", color: "#D9B13B", name: "Handle", note: "The bar and plate at the right. Whatever pushes here moves the frame." }
  ],
  readouts: [{ id: "x", label: "Frame" }, { id: "a", label: "Gear" }],
  speed: { min: 1, max: 30, value: 8, label: "Frame strokes", unit: " a min" },
  views: { "3d": [360, 250, 1100], front: [30, 0, 1180], side: [1100, 10, 0] },
  target: [30, 0, 0],
  distance: [500, 2800],
  how: [
    "The frame slides along at a steady pace. A toothed bar on the top edge meets the gear and pushes its top to one side, so the gear turns one way. When that bar runs out, the gear stops.",
    "Next, a toothed bar on the bottom edge reaches the gear. It pushes the bottom of the gear in the same direction as the frame moves, so the gear now turns the other way. The frame never changes its pace. Only the bar that touches the gear changes.",
    "Watch the red stripe. It turns, stops, then turns back, over and over. The bars sit far enough apart that the top and bottom never touch the gear together. That would lock it."
  ],
  note: "This model is rebuilt from Brown's drawing. The gear, the toothed bars and the frame are as drawn. The bars are spaced wider apart than in the drawing, so that the top and bottom never touch the gear together. The plate behind, the shelf under the frame, the handle length, the tooth sizes and the length of the stroke were made up.",

  // Module 6, 22 teeth: pitch radius 66, tip 72, root 58.5. Rack pitch lines at y = +66 and y = -66, tooth roots at y = +-73.5, bars 36 deep.
  // Frame coordinates (frame at rest as drawn); frame group slides in x by d.
  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N = 22, p = Math.PI * MD, RP = N * MD / 2, i;
    var o = this.o = { a: 0, p: p, rp: RP, d: 0 };
    // gear z -8..8, shaft z -30..8
    var holes = [];
    var W = 4, RO = 46, RI = 16, qo = Math.sqrt(RO * RO - W * W), qi = Math.sqrt(RI * RI - W * W);   // four narrow spokes of even width
    for (i = 0; i < 4; i++) {
      var cs = Math.cos(i * Math.PI / 2), sn = Math.sin(i * Math.PI / 2), h = new T.Path();
      var R = function (x, y) { return [x * cs - y * sn, x * sn + y * cs]; };
      var A = R(qo, W), Bp = R(W, qo), C = R(W, qi), D = R(qi, W);
      h.moveTo(A[0], A[1]); h.absarc(0, 0, RO, Math.asin(W / RO) + i * Math.PI / 2, Math.acos(W / RO) + i * Math.PI / 2, false);
      h.lineTo(C[0], C[1]); h.absarc(0, 0, RI, Math.acos(W / RI) + i * Math.PI / 2, Math.asin(W / RI) + i * Math.PI / 2, true);
      holes.push(h);
    }
    o.gear = P.spurGear({ teeth: N, module: MD, holes: holes, material: c.mat("gear") }); scene.add(o.gear);
    P.at(P.cylZ(7, 38, c.mat("gear")), 0, 0, -11, o.gear);                         // shaft z -30..8
    P.at(P.cylZ(12, 4, c.mat("gear")), 0, 0, 10, o.gear);                          // hub z 8..12, on the face
    P.at(P.box(50, 5, 1, c.mat("gear", "mark")), 40, 0, 9, o.gear);                 // red stripe x 15..65, z 8.5..9.5, off the face
    // frame
    var fr = o.frame = new T.Group(), m = c.mat("frame"), H = 109.5, B = 36; scene.add(fr);
    function bar(x0, x1, y0, y1) { return P.at(P.box(x1 - x0, y1 - y0, 16, m), (x0 + x1) / 2, (y0 + y1) / 2, 0, fr); }
    var pieces = o.pieces = [
      { top: true, xs: -345, n: 3 }, { top: true, xs: -47, n: 5 },
      { top: false, xs: -205, n: 4 }, { top: false, xs: 130, n: 3 }
    ];
    pieces.forEach(function (q) {
      q.L = q.n * p;
      var r = P.rack({ teeth: q.n, module: MD, side: q.top ? 1 : -1, body: B, thick: 16, material: m });
      r.rotation.z = -Math.PI / 2; r.position.set(q.xs, q.top ? RP : -RP, 0); fr.add(r);
    });
    bar(-381, -345, -H, H);                                                       // left end bar x -381..-345, y -109.5..109.5
    bar(195, 251, -H, H);                                                         // right end bar x 195..251
    [true, false].forEach(function (top) {                                         // smooth stretches between the toothed pieces
      var x = -345, y0 = top ? 73.5 : -H, y1 = top ? H : -73.5;
      pieces.filter(function (q) { return q.top === top; }).sort(function (u, v) { return u.xs - v.xs; }).forEach(function (q) {
        if (q.xs > x + .01) bar(x, q.xs, y0, y1);
        x = q.xs + q.L;
      });
      if (x < 195) bar(x, 195, y0, y1);
    });
    // handle: stem, plate, rod
    P.at(P.box(40, 56, 16, m), 271, 0, 0, fr);                                    // stem x 251..291
    P.at(P.box(24, 140, 32, c.mat("handle")), 303, 0, 0, fr);                     // plate x 291..315
    P.at(P.box(60, 56, 16, c.mat("handle")), 345, 0, 0, fr);                      // rod x 315..375
    // windows of engagement: a piece is in the gear's zone while it covers x in -40..40
    var wins = pieces.map(function (q) { return { q: q, lo: -40 - (q.xs + q.L), hi: 40 - q.xs, s: q.top ? -1 : 1 }; })
      .sort(function (u, v) { return u.lo - v.lo; });
    var tq = wins.filter(function (w) { return w.q.xs === -47; })[0], ti = wins.indexOf(tq), th;
    tq.c = Math.PI / 2 - tq.q.xs / RP;                                             // top piece: angle = pi/2 - (d + xs) / rp
    function ang(w, d) { return w.s * d / RP + w.c; }
    for (i = ti + 1; i < wins.length; i++) wins[i].c = ang(wins[i - 1], wins[i - 1].hi) - wins[i].s * wins[i].lo / RP;
    for (i = ti - 1; i >= 0; i--) wins[i].c = ang(wins[i + 1], wins[i + 1].lo) - wins[i].s * wins[i].hi / RP;
    o.wins = wins; o.ang = ang;
    o.th0 = th = null;
    // supports
    P.at(P.box(1100, 241.5, 10, c.fixed), -20, -.75, -35, scene);                  // plate x -570..530, y -121.5..120, z -40..-30
    P.at(P.box(1100, 12, 40, c.fixed), -20, -115.5, -10, scene);                   // shelf x -570..530, y -121.5..-109.5, z -30..10; the frame rests on y -109.5
  },

  step: function (c, dt, S) {
    var o = this.o, i, w, th;
    o.a += S.w * dt;
    var u = (o.a / (2 * Math.PI) + .234) % 1, tri = u < .5 ? 4 * u - 1 : 3 - 4 * u;
    var d = 10 + 160 * tri;                                                        // steady speed one way, then back
    o.frame.position.x = d;
    var ws = o.wins;
    if (d < ws[0].lo) th = o.ang(ws[0], ws[0].lo);
    else {
      th = o.ang(ws[ws.length - 1], ws[ws.length - 1].hi);
      for (i = 0; i < ws.length; i++) {
        w = ws[i];
        if (d <= w.hi) { th = o.ang(w, Math.max(d, w.lo)); break; }
        if (i + 1 < ws.length && d < ws[i + 1].lo) { th = o.ang(w, w.hi); break; }
      }
    }
    if (o.th0 === null) o.th0 = th;
    o.gear.rotation.z = th;
    var dg = Math.round((th - o.th0) * 180 / Math.PI);
    S.set("x", (d < 0 ? "−" : "") + Math.abs(Math.round(d)) + " mm");
    S.set("a", (dg < 0 ? "−" : "") + Math.abs(dg) + "°");
  }
});
