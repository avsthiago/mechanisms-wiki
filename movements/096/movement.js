M507.define({
  number: 96,
  title: "Heart cam",
  lede: "A heart-shaped plate turns at a steady speed. A roller rests on its edge and pushes a bar out, then lets it come back. The bar moves at one steady speed in each direction.",
  alt: "A flat heart-shaped plate on a shaft, with its point on the left and a dip on the right. Pale dotted circles and lines cover the plate. A small wheel on the end of a straight bar rests in the dip. The bar runs to the right through two guides, and a spring pulls it back.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Heart cam", note: "A flat plate shaped like a heart, turning on its centre. Its edge is the only thing the roller touches." },
    { key: "roller", color: "#C2503F", name: "Roller", note: "A small wheel on the end of the bar. It rolls along the cam's edge. Watch it: it goes out and back once for each turn." },
    { key: "bar", color: "#C8873A", name: "Bar", note: "Slides straight through its guides. It moves out and back as the roller follows the cam." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "Pulls the bar back, so the roller always stays on the cam's edge." }
  ],
  controls: [{ id: "size", label: "Heart size", value: "68", options: [["40", "Small"], ["68", "Medium"], ["90", "Big"]] }],
  readouts: [{ id: "pos", label: "Bar position" }, { id: "vel", label: "Bar speed" }],
  views: { "3d": [420, 190, 640], front: [90, 0, 780], side: [820, 60, 40] },
  target: [90, 0, 0],
  how: [
    "Watch the roller. It starts in the dip on the right, where the edge is closest to the centre. As the cam turns, the edge moves further out in a straight, steady way, so the roller is pushed out. Half a turn later the point of the heart reaches the roller, and the bar is as far out as it goes.",
    "Then the edge comes back in just as steadily, and the spring pulls the bar home. Out and back each take half a turn, so the bar moves at the same speed all the way. It only turns round at each end. The speed reading stays the same, and only its sign changes.",
    "The pale lines show how Brown draws the curve. The push is cut into equal steps, with a circle for each. Half a turn is cut into the same number of equal steps, with a line for each. The curve passes through the crossings. Try Small, Medium and Large. A bigger heart gives a longer push, so the bar goes faster at the same turning speed."
  ],
  note: "This model is rebuilt from Brown's drawing. The roller, the bar, the guides, the back plate and the shaft were made up. Brown does not say what keeps the roller on the cam, so a spring was added. The edge of the cam is shaped so the centre of the roller moves exactly in a straight line at a steady speed. The pale lines turn with the cam. The choice of heart size was added to show how the push changes.",

  G: { RMIN: 38, RR: 6, HUB: 14, DIV: 8, GX: 140, BARL: 175 },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene;
    var o = this.o = { th: 0, size: null };
    o.cam = new T.Group(); scene.add(o.cam);
    o.dyn = [];
    // shaft z -10..18.5 (plate front face to past the hub); hub pale z 14.5..17.5; dark dot z 18..19.4
    P.at(P.cylZ(6, 28.5, c.mat("cam")), 0, 0, 4.25, o.cam);
    P.at(P.cylZ(14, 3, c.mat("cam", "light")), 0, 0, 16, o.cam);
    P.at(P.cylZ(2, 1.4, c.mat("cam", "dark")), 6, 0, 18.7, o.cam);
    // roller z 3.2..15.8 with a dark dot z 15.5..16.9; bar z 6..13, y -4..4; tab on the bar z 6.5..12.5, y 3..27
    o.roller = new T.Group(); o.roller.position.set(0, 0, 0); scene.add(o.roller);
    P.at(P.cylZ(G.RR, 12.6, c.mat("roller", "mark")), 0, 0, 9.5, o.roller);
    P.at(P.cylZ(2, 1.4, c.mat("roller", "dark")), 0, 0, 16.2, o.roller);
    o.bar = P.at(P.box(G.BARL, 8, 7, c.mat("bar")), 0, 0, 9.5, scene);
    o.tab = P.at(P.box(4, 24, 6, c.mat("bar")), 0, 15, 9.5, scene);
    o.spring = P.at(P.spring({ radius: 4, wire: 1, turns: 10, length: 70, material: c.mat("spring") }), G.GX + 6, 24, 9.5, scene);
    // guides: lower block y -14.5..-4.5, upper block y 4.5..14.5 (0.5 clear of the bar), x GX..GX+30, z -10..16;
    // post for the spring x GX..GX+6, y 14.5..32; back plate x -150..320, y -140..140, z -20..-10; base y -152..-140
    P.at(P.box(30, 10, 26, c.fixed), G.GX + 15, -9.5, 3, scene);
    P.at(P.box(30, 10, 26, c.fixed), G.GX + 15, 9.5, 3, scene);
    P.at(P.box(6, 17.5, 26, c.fixed), G.GX + 3, 23.25, 3, scene);
    P.at(P.box(470, 280, 10, c.fixed), 85, 0, -15, scene);
    P.at(P.box(470, 12, 80, c.fixed), 85, -146, -10, scene);
    o.lineMatA = new T.LineDashedMaterial({ color: 0xEFE7D2, dashSize: 3, gapSize: 3, transparent: true, opacity: .8 });
    o.lineMatB = new T.LineDashedMaterial({ color: 0x4A5560, dashSize: 3, gapSize: 3, transparent: true, opacity: .55 });
  },

  // Heart for a push of `size`: plate (z 3.5..15.5), the faint blank behind it (ring r 7..rmax+6, z 0..3) and Brown's dotted
  // circles and lines, lifted 0.7 off the plate face (z 16.2) and off the blank face (z 3.7).
  makeCam: function (c, size) {
    var T = c.THREE, P = c.P, G = this.G, o = this.o, TP = 2 * Math.PI, i, j;
    o.dyn.forEach(function (m) { o.cam.remove(m); if (m.geometry) m.geometry.dispose(); });
    o.dyn = [];
    var rmax = G.RMIN + size, nb = 1440, pts = P.heartCurve({ rmin: G.RMIN, rmax: rmax, offset: -G.RR });
    var sh = new T.Shape(); pts.forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
    var plate = P.at(P.mesh(new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false }), c.mat("cam")), 0, 0, 3.5, o.cam);
    var rb = rmax + 6, ring = new T.Shape(); ring.absarc(0, 0, rb, 0, TP, false);
    var hole = new T.Path(); hole.absarc(0, 0, 7, 0, TP, true); ring.holes.push(hole);
    var blank = P.at(P.mesh(new T.ExtrudeGeometry(ring, { depth: 3, bevelEnabled: false, curveSegments: 96 }), c.fixed), 0, 0, 0, o.cam);
    function rcam(x, y) { return Math.hypot(pts[Math.min(nb - 1, Math.floor((Math.atan2(y, x) + Math.PI) / TP * nb))][0], pts[Math.min(nb - 1, Math.floor((Math.atan2(y, x) + Math.PI) / TP * nb))][1]); }
    var A = [], B = [];
    function seg(x0, y0, x1, y1) {                       // goes on the plate if inside the heart, else on the blank
      var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, r = Math.hypot(mx, my);
      if (r < rcam(mx, my) - 1) A.push(x0, y0, 16.2, x1, y1, 16.2); else if (r < rb - .4) B.push(x0, y0, 3.7, x1, y1, 3.7);
    }
    for (i = 0; i <= G.DIV; i++) {                       // one circle for each step of the push
      var r = G.RMIN + size * i / G.DIV;
      for (j = 0; j < 720; j++) seg(r * Math.cos(TP * j / 720), r * Math.sin(TP * j / 720), r * Math.cos(TP * (j + 1) / 720), r * Math.sin(TP * (j + 1) / 720));
    }
    for (i = 0; i < 2 * G.DIV; i++) {                    // one line for each step of the half turn, both sides
      var a = Math.PI * i / G.DIV, k;
      for (k = G.HUB; k < rb; k += 2) seg(k * Math.cos(a), k * Math.sin(a), (k + 2) * Math.cos(a), (k + 2) * Math.sin(a));
    }
    [[A, o.lineMatA], [B, o.lineMatB]].forEach(function (q) {
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(q[0], 3));
      var l = new T.LineSegments(g, q[1]); l.computeLineDistances(); o.cam.add(l); o.dyn.push(l);
    });
    o.dyn.push(plate, blank);
    o.size = size; o.rmax = rmax;
  },

  step: function (c, dt, S) {
    var o = this.o, G = this.G, TP = 2 * Math.PI, size = +S.controls.size;
    if (size !== o.size) this.makeCam(c, size);
    o.th += S.w * dt;
    var psi = ((o.th + Math.PI) % TP + TP) % TP - Math.PI, k = size / Math.PI;
    var x = G.RMIN + k * Math.abs(psi);                  // the roller's centre: the radius of the heart's centre path at the roller
    o.cam.rotation.z = o.th;
    o.roller.position.x = x;
    o.bar.position.x = x + G.BARL / 2;
    var tx = x + 145; o.tab.position.x = tx;
    o.spring.setLength(tx - 2 - (G.GX + 6));
    var v = psi === 0 ? 0 : (psi > 0 ? 1 : -1) * k * S.w;
    var p = x - (G.RMIN + size / 2);
    S.set("pos", (p > .05 ? "+" : "") + p.toFixed(0) + " mm");
    S.set("vel", (v > .05 ? "+" : "") + v.toFixed(0) + " mm/s");
  }
});
