M507.define({
  number: 436,
  title: "Jonval turbine",
  lede: "Water falls down a wide upright tube past a ring of fixed curved plates. The plates turn it sideways, and it pushes through the buckets of a wheel just below. The wheel and its shaft turn, and the shaft carries the power up.",
  alt: "Cut-away side view of an upright round tube with the front removed. A pipe slopes in from the upper right. Inside the tube, near the bottom, a ring of fixed curved plates sits above a wheel of curved buckets on a shaft that rises through the lid. Blue dots fall through the plates and the wheel.",
  parts: [
    { key: "guides", color: "#4FA58A", name: "Fixed guides", note: "The upper ring of curved plates. They never move, and they send the water downward at a slant." },
    { key: "wheel", color: "#C8873A", name: "Wheel and buckets", note: "The lower ring of curved buckets. There are more of them than there are guides. Watch the red bucket go round." },
    { key: "shaft", color: "#5E7387", name: "Shaft", note: "Stands on a bearing at the bottom and rises through the lid. It turns with the wheel and carries the power away." }
  ],
  speed: { min: 10, max: 100, value: 60, label: "Water flow", unit: " %" },
  closed: { label: "Tube" },
  readouts: [{ id: "w", label: "Wheel" }],
  views: { "3d": [521, 445, 902], front: [110, 215, 1070], side: [1070, 230, 160] },
  target: [100, 215, 0],
  how: [
    "Water runs in down the sloping pipe and falls inside the tube. First it goes between the fixed plates. They are curved, so the water comes out going round as well as down.",
    "Then it falls through the buckets of the wheel, which bend the other way. Turning the water this way pushes the buckets round, and the wheel spins. The water drops out at the bottom with little speed left.",
    "Try a low flow, then a high one. More water makes the wheel turn faster. Choose Closed to see the turbine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a cut-away. The front half of the tube is left off so you can see in. The sizes, the pipe, the bearing at the bottom and the number and curve of the plates and buckets are made up. The wheel speed follows the flow by a simple rule.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { A: 0, Ng: 14, Nb: 18, ps: [], R: 120, Lb: 150, Lp: 260 };
    var gm = c.mat("guides"), wm = c.mat("wheel"), sm = c.mat("shaft");
    var fx = c.fixed.clone(); fx.side = T.DoubleSide;
    o.pg = function (t) { return .9 * t * t; };                      // guide angle along the drop, t = 0 (top) to 1 (bottom)
    o.pb = function (t) { return .7 * t - .9 * t * t; };             // bucket angle
    // curved blade between radius r0 and r1, from yTop down to yBot, round the upright axis; angle ph + fn(t)
    function sweep(r0, r1, yTop, yBot, ph, fn, th, mat) {
      var pos = [], lv = [], N = 12, t, y, a, d0 = th / 2 / r0, d1 = th / 2 / r1, j;
      function pt(r, aa) { return [r * Math.sin(aa), y, r * Math.cos(aa)]; }
      function mid(q) { return [0, 1, 2].map(function (i) { return (q[0][i] + q[1][i] + q[2][i] + q[3][i]) / 4; }); }
      function tri(a, b, d, o) {                // one winding only, facing away from the point o inside the blade
        var u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
        var n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
        if (n[0] * (a[0] - o[0]) + n[1] * (a[1] - o[1]) + n[2] * (a[2] - o[2]) < 0) { var x = b; b = d; d = x; }
        pos.push(a[0], a[1], a[2], b[0], b[1], b[2], d[0], d[1], d[2]);
      }
      for (k = 0; k <= N; k++) { t = k / N; y = yTop + (yBot - yTop) * t; a = ph + fn(t); lv.push([pt(r0, a - d0), pt(r1, a - d1), pt(r1, a + d1), pt(r0, a + d0)]); }
      for (k = 0; k < N; k++) for (j = 0; j < 4; j++) {
        var A = lv[k][j], B = lv[k][(j + 1) % 4], C = lv[k + 1][(j + 1) % 4], D = lv[k + 1][j], m0 = mid(lv[k]), m1 = mid(lv[k + 1]), O = [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2, (m0[2] + m1[2]) / 2];
        tri(A, B, C, O); tri(A, C, D, O);
      }
      [[lv[0], lv[1]], [lv[N], lv[N - 1]]].forEach(function (p) { var q = p[0], O = mid(p[1]); tri(q[0], q[1], q[2], O); tri(q[0], q[2], q[3], O); });
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      return P.mesh(g, mat);
    }
    // bottom: a cone-shaped floor with a short pedestal (top y = 60, r 20)
    var prof = [[0, 0], [120, 0], [120, 8], [40, 50], [40, 58], [20, 58], [20, 60], [0, 60]];
    var flg = new T.LatheGeometry(prof.map(function (q) { return new T.Vector2(q[0], q[1]); }), 48);
    scene.add(c.shell(P.mesh(flg, fx), "open"));
    scene.add(c.shell(P.mesh(flg, c.fixed), "closed"));                    // closed view: the same floor, solid like the tube
    // tube wall, back half only (cut away): lower part y 0..200, upper part y 200..400 with a window where the pipe enters
    c.shell(P.at(P.mesh(new T.CylinderGeometry(120, 120, 200, 48, 1, true, Math.PI / 2, Math.PI), fx), 0, 100, 0, scene), "open");
    c.shell(P.at(P.mesh(new T.CylinderGeometry(120, 120, 200, 48, 1, true, Math.PI / 2 + .5236, Math.PI - .5236), fx), 0, 300, 0, scene), "open");
    c.shell(P.at(P.mesh(new T.CylinderGeometry(123, 123, 392, 48, 1, true), c.fixed), 0, 204, 0, scene), "closed");   // closed view: the whole tube, y 8..400, above the rim of the floor (y 0..8); radius 123 so it stays clear of the guide tips at 120, even with the solid depth offset
    // lid: half disc y 400..408 with a hole round the shaft (r 13)
    var sh = new T.Shape(); sh.moveTo(-128, 0); sh.lineTo(-13, 0); sh.absarc(0, 0, 13, Math.PI, 2 * Math.PI, false); sh.lineTo(128, 0); sh.absarc(0, 0, 128, 0, Math.PI, true);
    var lg = new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false, curveSegments: 32 }); lg.rotateX(Math.PI / 2); lg.translate(0, 408, 0);
    scene.add(c.shell(P.mesh(lg, c.fixed), "open"));
    var sh2 = new T.Shape(); sh2.absarc(0, 0, 128, 0, 2 * Math.PI, false); var hl = new T.Path(); hl.absarc(0, 0, 13, 0, 2 * Math.PI, true); sh2.holes.push(hl);
    var lg2 = new T.ExtrudeGeometry(sh2, { depth: 8, bevelEnabled: false, curveSegments: 32 }); lg2.rotateX(Math.PI / 2); lg2.translate(0, 408, 0);
    scene.add(c.shell(P.mesh(lg2, c.fixed), "closed"));                    // closed view: the whole lid, y 400..408, same hole for the shaft
    // pipe: three walls (top, bottom, back) from the tube, sloping up to the right
    var pipe = P.at(new T.Group(), 120, 290, 0, scene); pipe.rotation.z = .349;
    P.at(P.box(300, 4, 116, c.fixed), 150, -77, 2, pipe);       // bottom wall y -79..-75, z -56..60
    P.at(P.box(300, 4, 116, c.fixed), 150, 77, 2, pipe);        // top wall y 75..79
    P.at(P.box(300, 158, 4, c.fixed), 150, 0, -58, pipe);       // back wall z -60..-56
    c.shell(pipe);
    // closed view: the front wall between the top and bottom walls (y -75..75, z 56..60), and short pieces x -16..0 that reach back into the tube
    c.shell(P.at(P.box(316, 150, 4, c.fixed), 142, 0, 58, pipe), "closed");      // x -16..300
    c.shell(P.at(P.box(16, 4, 116, c.fixed), -8, -77, 2, pipe), "closed"); c.shell(P.at(P.box(16, 4, 116, c.fixed), -8, 77, 2, pipe), "closed");
    c.shell(P.at(P.box(16, 158, 4, c.fixed), -8, 0, -58, pipe), "closed");
    // guides: fixed, y 120..170, hub r 28 and blades out to the tube wall (r 120)
    P.at(P.cylY(28, 50, gm), 0, 145, 0, scene);
    for (i = 0; i < o.Ng; i++) scene.add(sweep(28, 120, 170, 120, i * 2 * Math.PI / o.Ng, o.pg, 3.5, gm));
    // wheel: y 66..114
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylY(28, 48, wm), 0, 90, 0, o.wheel);
    for (i = 0; i < o.Nb; i++) o.wheel.add(sweep(27, 116, 113.5, 66.5, i * 2 * Math.PI / o.Nb, o.pb, 3.5, i === 0 ? c.mat("wheel", "mark") : wm));
    // shaft: bearing collar y 60..66, shaft y 61..445 through the lid hole, two collars at the top
    P.at(P.cylY(18, 6, sm), 0, 63, 0, o.wheel);
    P.at(P.cylY(10, 384, sm), 0, 253, 0, o.wheel);
    P.at(P.cylY(26, 5, sm), 0, 418.5, 0, o.wheel);
    P.at(P.cylY(30, 5, sm), 0, 427.5, 0, o.wheel);
    o.dots = P.waterDots(170, { radius: 2.4, color: c.spot }); scene.add(o.dots);
    for (i = 0; i < 170; i++) o.ps.push({ d: -o.Lb - o.Lp + Math.random() * 520, ch: Math.floor(Math.random() * o.Ng), lat: (Math.random() - .5) * .5 * 2 * Math.PI / o.Ng, rt: 34 + Math.random() * 80, yl: (Math.random() - .5) * 110, zl: (Math.random() - .5) * 90, inW: false });
  },

  step: function (c, dt, S) {
    var o = this.o, s = S.w * dt, sg = 2 * Math.PI / o.Ng, sb = 2 * Math.PI / o.Nb, Lb = o.Lb, Lp = o.Lp;
    var ux = Math.cos(.349), uy = Math.sin(.349);
    o.A += .3 * s; o.wheel.rotation.y = o.A;
    for (var i = 0; i < o.ps.length; i++) {
      var p = o.ps[i], x, y, z, sc = 1, a, r = p.rt;
      p.d += 14 * s;
      if (p.d > 230) { p.d = -Lb - Lp - Math.random() * 60; p.ch = Math.floor(Math.random() * o.Ng); p.lat = (Math.random() - .5) * sg * .5; p.rt = 34 + Math.random() * 80; p.inW = false; }
      var ca = (p.ch + .5) * sg + p.lat, tx = r * Math.sin(ca), tz = r * Math.cos(ca);
      var qx = 120 - uy * p.yl, qy = 290 + ux * p.yl;                       // where this drop reaches the tube
      if (p.d < -Lb) { var xl = -(p.d + Lb); x = qx + ux * xl; y = qy + uy * xl; z = p.zl; }
      else if (p.d < 0) {
        var e = (p.d + Lb) / Lb, m = e * e * (3 - 2 * e);
        x = qx + (tx - qx) * m; z = p.zl + (tz - p.zl) * m; y = qy + (172 - qy) * e * e;
      } else {
        if (p.d < 50) { a = ca + o.pg(p.d / 50); y = 172 - p.d; }
        else if (p.d < 56) { a = ca + o.pg(1); y = 172 - p.d; }
        else if (p.d < 104) {
          var q = (p.d - 56) / 48;
          if (!p.inW) { p.inW = true; p.b0 = ca + o.pg(1) + o.A; p.snap = (Math.floor(p.b0 / sb) + .5) * sb; }
          a = p.b0 + (p.snap - p.b0) * Math.min(1, q / .3) + o.pb(q) - o.A; p.lastA = a; y = 114 - 48 * q;
        } else {
          var dd = p.d - 104, hc = function (rr) { return 8 + (120 - rr) * 42 / 80; }, d1 = 66 - (hc(p.rt) + 2);
          a = p.lastA || 0; y = 66 - dd;
          if (dd > d1) { r = Math.min(118, p.rt + (dd - d1) * .8); y = hc(r) + 2; sc = Math.max(0, 1 - (dd - d1) / 45); }
        }
        x = r * Math.sin(a); z = r * Math.cos(a);
      }
      o.dots.put(i, x, y, z, sc);
    }
    o.dots.flush();
    S.set("w", (S.playing ? Math.round(S.rpm * .3 * 10) / 10 : 0) + " rpm");
  }
});
