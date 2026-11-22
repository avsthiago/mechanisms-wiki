M507.define({
  number: 141,
  title: "Band saw",
  lede: "A saw blade is made into one endless loop and stretched round two wheels. As the wheels turn, the blade runs in a straight line, always the same way. This gives a cut that never has to stop and go back.",
  alt: "A tall frame holds a big spoked wheel at the top and a second one below a flat table. An endless toothed band runs upright from one wheel to the other and passes through a slot in the table.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Upper wheel", note: "The upper wheel. It is turned by an engine and pulls the band round. Watch its dark spoke." },
    { key: "driven", color: "#C8873A", name: "Lower wheel", note: "The wheel below the table. The band turns it. It is the same size as the upper wheel, so the band runs straight." },
    { key: "belt", color: "#D9B13B", name: "Saw band", note: "A thin steel loop with teeth on its front edge. The two upright parts run straight. Watch the red mark go round." },
    { key: "table", color: "#4FA58A", name: "Table", note: "A flat table that holds the wood. The band passes down through a slot in it, so the teeth cut the wood as it runs." }
  ],
  controls: [{ id: "size", label: "Wheel size", value: "big", options: [["small", "Small"], ["big", "Big"]] }],
  readouts: [{ id: "in", label: "Wheels" }, { id: "out", label: "Band" }],
  views: { "3d": [620, 200, 920], front: [20, 0, 1040], side: [980, 0, 0] },
  target: [20, 0, 0],
  how: [
    "The upper wheel turns and pulls the band with it. The band turns the lower wheel. Between the wheels the band does not bend. It runs along two upright straight lines, one going down and one going up.",
    "The teeth point the same way all the time, so the saw keeps cutting. The wood sits on the table and is pushed against the straight part of the band. The turning of the wheels has become straight sawing.",
    "The band moves as fast as the rim of a wheel. A bigger wheel has a longer rim, so it moves the band further with each turn. Try small, then big, with the same turning speed, and watch the red mark."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The size of the wheels, the table, the frame and the teeth are made up. Brown draws a curved frame. Here it is a plain upright with two arms. The wood and the guides that steady the band are left out.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, BT = 4, BW = 14, o = this.o = { a: 0, s: 0, r: 0, YT: 200, YB: -140, NMAX: 110, PITCH: 18, TH: 8, sz: null };
    // wheels, axis Z, rims z -12..12
    o.pt = P.at(P.pulley({ radius: 56, width: 24, material: c.mat("drive") }), 0, o.YT, 0, scene);
    o.pb = P.at(P.pulley({ radius: 56, width: 24, material: c.mat("driven") }), 0, o.YB, 0, scene);
    o.pt.spokes[0].material = c.mat("drive", "dark"); o.pb.spokes[0].material = c.mat("driven", "dark");
    [o.YT, o.YB].forEach(function (y) {
      P.at(P.cylZ(7, 44, c.fixed), 0, y, -4, scene);                               // shaft z -26..18
      P.at(P.cylZ(16, 12, c.fixed), 0, y, -32, scene);                             // boss z -38..-26
    });
    // frame: upright plate behind the wheels, z -50..-38
    P.at(P.box(60, 443, 12, c.fixed), -160, -6.5, -44, scene);                      // column x -190..-130, y -228..215
    P.at(P.box(130, 30, 12, c.fixed), -65, 200, -44, scene);                        // top arm x -130..0, y 185..215
    P.at(P.box(130, 30, 12, c.fixed), -65, -140, -44, scene);                       // low arm x -130..0, y -155..-125
    P.at(P.box(430, 12, 120, c.fixed), 15, -234, 0, scene);                         // base x -200..230, y -240..-228, z -60..60
    P.at(P.box(40, 141, 40, c.fixed), 170, -157.5, 0, scene);                       // pillar x 150..190, y -228..-87, z -20..20
    // table, top y -75, with a slot x -66..66, z -14..14 for the band and the lower wheel
    var tm = c.mat("table");
    P.at(P.box(340, 12, 46, tm), 60, -81, 37, scene);                               // front slab x -110..230, y -87..-75, z 14..60
    P.at(P.box(340, 12, 46, tm), 60, -81, -37, scene);                              // back slab z -60..-14
    P.at(P.box(44, 12, 28, tm), -88, -81, 0, scene);                                // left piece x -110..-66, z -14..14
    P.at(P.box(164, 12, 28, tm), 148, -81, 0, scene);                               // right piece x 66..230, z -14..14

    o.belt = P.at(P.beltPath({ width: BW, thick: BT, material: c.mat("belt") }), 0, 0, 0, scene);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(12, BT + 2, 15, c.mat("belt", "mark")), 0, 0, 0, o.belt);
    // teeth: triangles in the belt's x-z plane, pointing out of the front edge (+z), 4 thick, base sunk .5 into the band
    var sh = new T.Shape(), p = o.PITCH, h = o.TH;
    sh.moveTo(0, 0); sh.lineTo(p, 0); sh.lineTo(0, -h - .5); sh.lineTo(0, 0);       // saw tooth, sloped to one side
    var tg = new T.ExtrudeGeometry(sh, { depth: BT, bevelEnabled: false }); tg.translate(-p / 2, 0, -BT / 2); tg.rotateX(-Math.PI / 2); tg.translate(0, 0, BW / 2 - .5);
    o.teeth = [];
    for (var i = 0; i < o.NMAX; i++) { var m = new T.Mesh(tg, c.mat("belt", "dark")); o.belt.add(m); o.teeth.push(m); }
  },

  // Lay the band round the wheels for a wheel size (middle radius r): up the right, over the top, down the left, round the bottom.
  lay: function (r) {
    var o = this.o, Z = [0, 0, 1], X = [1, 0, 0];
    o.r = r; o.k = (r - 4.5) / 56;
    o.pt.scale.set(o.k, o.k, 1); o.pb.scale.set(o.k, o.k, 1);
    o.belt.set([
      { c: [0, o.YT, 0], axis: Z, u: X, r: r, a0: 0, sweep: Math.PI },
      { c: [0, o.YB, 0], axis: Z, u: X, r: r, a0: Math.PI, sweep: Math.PI }
    ]);
    o.N = Math.min(o.NMAX, Math.round(o.belt.length / o.PITCH));
    o.teeth.forEach(function (m, i) { m.visible = i < o.N; });
  },

  step: function (c, dt, S) {
    var o = this.o, r = S.controls.size === "small" ? 40 : 58;
    if (o.r !== r) { this.lay(r); o.s = 0; }
    var v = S.w * r;                              // band speed = wheel radius x turning speed
    o.s += v * dt;
    o.pt.rotation.z = o.pb.rotation.z = o.s / r;
    o.belt.place(o.mark, o.s);
    var L = o.belt.length;
    for (var i = 0; i < o.N; i++) o.belt.place(o.teeth[i], o.s + i * L / o.N);
    S.set("in", (S.playing ? S.rpm : 0) + " rpm");
    S.set("out", Math.round(v * 0.4) + " cm/s");
  }
});
