M507.define({
  number: 160,
  title: "Treadle, spring and belt",
  lede: "A foot treadle pulls a belt, and the belt is wound once round a wheel. Each push turns the wheel one way. A bent spring lifts the treadle back up, and the wheel turns back the other way.",
  alt: "A flat treadle slants up to the right from a small support on the ground. A thin belt rises from it, straight up past a round wheel seen end on, and is tied to the right end of a long curved spring above. The belt is wound once round the wheel.",
  parts: [
    { key: "treadle", color: "#5E7387", name: "Treadle", note: "A flat board that turns about a pin at its left end. The foot pushes its right end down." },
    { key: "band", color: "#D9B13B", name: "Belt", note: "A thin belt tied to the treadle and to the spring, and wound once round the wheel. Watch the red bead travel with it." },
    { key: "wheel", color: "#C8873A", name: "Pulley", note: "A wheel the belt is wound round. The belt cannot slip, so the wheel turns first one way, then the other. Watch the red stripe." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "A long curved strip of springy metal, held firm at its far end. The belt bends it down. When the foot lifts, it springs back and lifts the treadle." }
  ],
  controls: [{ id: "wheel", label: "Pulley", value: "wide", options: [["wide", "Wide"], ["narrow", "Narrow"]] }],
  speed: { min: 10, max: 90, value: 30, label: "Strokes", unit: " per min" },
  readouts: [{ id: "drop", label: "Treadle" }, { id: "rpm", label: "Pulley" }],
  views: { front: [-30, 115, 640], "3d": [230, 250, 520], side: [640, 115, 0] },
  target: [-30, 115, 0],
  how: [
    "Press the treadle down. It pulls the belt down with it, and the belt cannot slip on the wheel, so it drags the wheel round. The belt also bends the spring down.",
    "Let go and the spring springs back. It pulls the belt up and lifts the treadle ready for the next push. Now the wheel turns the other way. The red bead on the belt shows the belt moving the same distance as the treadle.",
    "A wheel that is turned back and forth like this can drive a lathe or a grindstone. Try the wide wheel, then the narrow one, and compare how far the wheel turns on each push."
  ],
  note: "This model is rebuilt from Brown's drawing. The base, the pin supports, the post behind the wheel and the wall that holds the spring were made up. The belt runs straight up and is tied to the spring at a fixed place, and the treadle moves by itself instead of by a foot. The spring bends like a springy strip held at one end. All sizes are made up. The narrow wheel is added to show the effect of size.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { psi: 0, prevD: 0, px: -75, py: 21, xb: 60, yc: 132, th0: 8 * Math.PI / 180, th1: -3 * Math.PI / 180, opt: {}, xl: -168, xr: 96, d: 0 };
    // base: x -190..210, y -6..0, z -45..45
    P.at(P.box(400, 6, 90, c.fixed), 10, -3, 0, scene);
    // wall for the spring: x -188..-168, y 0..200, z -10..10. Spring starts on its face at x -168
    P.at(P.box(20, 200, 20, c.fixed), -178, 100, 0, scene);
    // treadle pin supports: two cheeks x -90..-60, y 0..33, z 8..14 and -14..-8
    [-11, 11].forEach(function (z) { P.at(P.box(30, 33, 6, c.fixed), -75, 16.5, z, scene); });
    P.at(P.cylZ(4, 27, c.mat("treadle", "dark")), o.px, o.py, 0, scene);       // pin z -13.5..13.5, inside the cheeks
    var tr = o.tr = P.at(new T.Group(), o.px, o.py, 0, scene);
    P.at(P.box(200, 5, 12, c.mat("treadle")), 90, 0, 0, tr);                   // local x -10..190, y -2.5..2.5, z -6..6
    // spring: strip from x -168 to 96
    o.n = 28;
    o.rest = function (x) { return 232 - 0.00127 * (x - 40) * (x - 40); };
    o.f = function (u) { return (3 * u * u - u * u * u) / 2; };
    o.fa = o.f((o.xb - o.xl) / (o.xr - o.xl));
    var pts = [], i;
    for (i = 0; i < o.n; i++) { var x = o.xl + (o.xr - o.xl) * i / (o.n - 1); pts.push([x, o.rest(x)]); }
    o.leaf = P.flatStrip({ points: pts, thick: 5, width: 12, material: c.mat("spring") }); o.leaf.userData.live = true; scene.add(o.leaf);
    // band
    o.ra = P.at(P.rod(1.2, c.mat("band")), 0, 0, 0, scene);
    o.rb = P.at(P.rod(1.2, c.mat("band")), 0, 0, 0, scene);
    o.marks = [0, 1].map(function () { return P.at(P.sphere(3, c.mat("band", "mark")), 0, 0, 0, scene); });
    P.at(P.sphere(3, c.mat("band", "dark")), 0, 0, 0, scene);
    o.knotLo = scene.children[scene.children.length - 1]; o.knotHi = P.at(P.sphere(3, c.mat("band", "dark")), 0, 0, 0, scene);
    // pulleys: centre (xb - rs, yc); core radius rc, band path radius rc + 1.5
    [["wide", 30], ["narrow", 16]].forEach(function (e) {
      var rc = e[1], rs = rc + 1.5, cx = o.xb - rs, g = new T.Group(); P.at(g, cx, o.yc, 0, scene);
      var spool = new T.Group(); g.add(spool);
      P.at(P.cylZ(rc, 9, c.mat("wheel")), 0, 0, 0, spool);                    // core z -4.5..4.5
      [-5.5, 5.5].forEach(function (z) { P.at(P.cylZ(rc + 5, 3, c.mat("wheel")), 0, 0, z, spool); });   // flanges z 4..7 and -7..-4
      P.at(P.cylZ(5, 30, c.mat("wheel", "dark")), 0, 0, -9, spool);            // axle z -24..6, ends at the post face, hidden in the front flange
      P.at(P.box(rc * .7, 3, 1, c.mat("wheel", "mark")), (rc + 5) / 2 + 1, 0, 7.5, spool);   // stripe on the front flange, z 7..8
      var wp = [], k, n = 96;
      for (k = 0; k <= n; k++) { var t = 2 * Math.PI * k / n; wp.push(new T.Vector3(rs * Math.cos(t), rs * Math.sin(t), -2 + 4 * k / n)); }
      g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(wp), 120, 1.2, 8, false), c.mat("band")));
      var post = new T.Group(); scene.add(post);
      P.at(P.box(16, o.yc + 10, 12, c.fixed), cx, (o.yc + 10) / 2, -30, post);   // post x cx-8..cx+8, y 0..142, z -36..-24
      o.opt[e[0]] = { g: g, post: post, spool: spool, rs: rs };
    });
    this.o.yEnd = function (th) { return o.py + (o.xb - o.px) * Math.tan(th) + 2.5 / Math.cos(th); };
    o.yEnd0 = o.yEnd(o.th0);
    o.y2rest = o.rest(o.xb) - 2.5;
  },

  step: function (c, dt, S) {
    var o = this.o, key = S.controls.wheel || "wide", op = o.opt[key], rs = op.rs, cx = o.xb - rs;
    o.psi += S.w * dt;
    var th = o.th0 + (o.th1 - o.th0) * (1 - Math.cos(o.psi)) / 2;
    var d = o.yEnd0 - o.yEnd(th), rate = dt > 0 ? (d - o.prevD) / dt : 0; o.prevD = d;
    for (var k in o.opt) { o.opt[k].g.visible = k === key; o.opt[k].post.visible = k === key; }
    o.tr.rotation.z = th;
    op.spool.rotation.z = -d / rs;                                  // band speed equals rim speed
    // spring: held at the left end, bent down so that the band's tie point drops by d
    var delta = d / o.fa, pts = [], i;
    for (i = 0; i < o.n; i++) { var x = o.xl + (o.xr - o.xl) * i / (o.n - 1); pts.push([x, o.rest(x) - delta * o.f((x - o.xl) / (o.xr - o.xl))]); }
    o.leaf.setPoints(pts);
    var y1 = o.yEnd(th), y2 = o.y2rest - d, yc = o.yc, xb = o.xb, Lh = 2 * Math.PI * rs;
    var Llow = yc - y1, tot = (y2 - y1) + Lh;
    o.ra.span(xb, y1, -2, xb, yc, -2);
    o.rb.span(xb, yc, 2, xb, y2, 2);
    o.knotLo.position.set(xb, y1, -2); o.knotHi.position.set(xb, y2, 2);
    [40, tot - 35].forEach(function (m, i) {
      var p = o.marks[i];
      if (m < Llow) p.position.set(xb, y1 + m, -2);
      else if (m < Llow + Lh) { var t = (m - Llow) / rs; p.position.set(cx + rs * Math.cos(t), yc + rs * Math.sin(t), -2 + 4 * t / (2 * Math.PI)); }
      else p.position.set(xb, yc + (m - Llow - Lh), 2);
    });
    var mm = Math.round(d), r = Math.round(-rate / rs * 60 / (2 * Math.PI));
    S.set("drop", Math.abs(mm) + " mm");
    S.set("rpm", (r > 0 ? "+" : r < 0 ? "−" : "") + Math.abs(r) + " rpm");
  }
});
