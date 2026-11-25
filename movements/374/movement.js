M507.define({
  number: 374,
  title: "Treadle, belt and eccentric",
  lede: "A foot pedal, called a treadle, rocks up and down. A belt joins it to a disc set off its centre, called an eccentric, on a shaft. The shaft turns round and round. A heavy wheel on the shaft keeps it turning through the dead spots.",
  alt: "A long tapering treadle pivots at its right end. A small roller on it is joined by an endless belt to a big disc mounted off-centre on a shaft above. A dotted circle shows where the disc goes half a turn later. A heavy flywheel sits behind the disc.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Shaft and flywheel", note: "The shaft turns round. The heavy flywheel on it carries the turning past the points where the treadle has no pull." },
    { key: "ecc", color: "#C8873A", name: "Eccentric", note: "A big disc fixed off its centre on the shaft. The red stripe shows it turning. The dotted circle is where the disc will be half a turn later." },
    { key: "band", color: "#D9B13B", name: "Endless belt", note: "A closed loop that goes round the disc and the roller. It is always tight, so it is always the same length." },
    { key: "treadle", color: "#4FA58A", name: "Treadle", note: "The foot pedal. It swings about a pin at its right end." },
    { key: "roller", color: "#8E7AA8", name: "Roller", note: "A small wheel on the treadle that holds the lower end of the belt." }
  ],
  controls: [{ type: "range", id: "throw", label: "How far off-centre the disc is", min: 15, max: 50, step: 1, value: 33, unit: " mm", presets: [[15, "Little"], [33, "As drawn"], [50, "Much"]] }],
  readouts: [{ id: "a", label: "Treadle" }, { id: "y", label: "Foot end" }],
  speed: { min: 1, max: 30, value: 8, label: "Shaft speed", unit: " rpm" },
  views: { "3d": [270, 77, 675], front: [-45, -95, 760], side: [760, -90, -40] },
  target: [-45, -95, 0],
  how: [
    "Watch the big disc. It is fixed on the shaft away from its middle, so as the shaft turns, the middle of the disc goes round in a circle. The dotted circle shows the disc half a turn later.",
    "The belt is a closed loop of fixed length. It stays tight round the disc and the roller. So when the disc swings up, the roller is pulled up. When the disc swings down, the roller is pushed down. This is why the treadle rocks.",
    "In a real workshop it works the other way: a foot pushes the treadle and the belt turns the shaft. Where the treadle and belt line up, the push has no turning effect, so the flywheel carries on. Try a small offset, then a large one, and watch how far the treadle swings."
  ],
  note: "This model is rebuilt from Brown's drawing. Here the shaft is turned and the treadle follows, which gives the same motion as a foot pushing. The flywheel, the supports and the sizes were made up. The belt is shown tight and does not slip.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = .7;
    function X(px) { return (px - 318) * K; } function Y(py) { return (108 - py) * K; }
    var o = this.o = { ang: 0, e: 0, R: 73.5, rr: 19, BT: 3 };
    o.pv = [X(460), Y(480)]; o.r0 = [X(252), Y(430)];
    o.a = Math.hypot(o.r0[0] - o.pv[0], o.r0[1] - o.pv[1]);
    o.th0 = Math.atan2(o.r0[1] - o.pv[1], o.r0[0] - o.pv[0]);
    o.Lt = 319;
    var R = o.R;
    // shaft group: shaft, flywheel, hub and the off-centre disc
    o.G = new T.Group(); scene.add(o.G);
    P.at(P.cylZ(8, 52, c.mat("shaft")), 0, 0, -36, o.G);                    // shaft z -62..-10
    var fw = P.pulley({ radius: 84, width: 12, rim: 9, spokes: 5, hub: 16, material: c.mat("shaft") }); P.at(fw, 0, 0, -34, o.G);   // z -40..-28
    P.at(P.cylZ(19, 16, c.mat("shaft")), 0, 0, 8, o.G);                       // hub z 0..16, sticks out of the disc front (z 10)
    o.disc = new T.Group(); o.G.add(o.disc);
    P.at(P.cylZ(R - .6, 20, c.mat("ecc")), 0, 0, 0, o.disc);                       // disc z -10..10
    P.at(P.box(R - 12, 5, 1, c.mat("ecc", "mark")), -((R - 12) / 2 + 4), 0, 11, o.disc);   // red stripe z 10.5..11.5
    o.dots = new T.Group(); o.G.add(o.dots);
    for (var i = 0; i < 40; i++) {
      var q = i * 2 * Math.PI / 40, dd = P.box(8, 1.4, 1.4, c.mat("ecc", "dark"));
      P.at(dd, R * Math.cos(q), R * Math.sin(q), 12.5, o.dots); dd.rotation.z = q + Math.PI / 2;   // dashes z 11.8..13.2
    }
    // treadle
    o.tg = new T.Group(); o.tg.position.set(o.pv[0], o.pv[1], 0); scene.add(o.tg);
    var sh = new T.Shape(); sh.moveTo(0, -14); sh.lineTo(o.Lt, -5); sh.lineTo(o.Lt, 5); sh.lineTo(0, 14); sh.closePath();
    var tgm = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false }); tgm.translate(0, 0, -19);
    o.tm = new T.Mesh(tgm, c.mat("treadle")); o.tg.add(o.tm);                  // z -19..-9
    P.at(P.cylZ(13, 12, c.mat("treadle")), 0, 0, -14, o.tg);                  // pivot boss z -20..-8
    P.at(P.cylZ(5, 30, c.mat("treadle")), 0, 0, -35, o.tg);                   // pin z -50..-20, ends on the post face
    var rl = P.pulley({ radius: o.rr, width: 17, rim: 5, spokes: 3, hub: 5, material: c.mat("roller") }); P.at(rl, o.a, 0, 0, o.tg);   // z -8.5..8.5
    P.at(P.cylZ(4, 8, c.mat("roller")), o.a, 0, -12.75, o.tg);                    // pin z -17..-9, ties the roller to the treadle
    // band
    o.belt = P.belt({ width: 16, thick: o.BT, material: c.mat("band") }); o.belt.userData.live = true; scene.add(o.belt);
    // supports
    P.at(P.box(400, 8, 140, c.fixed), -40, -304, -10, scene);                  // ground x -240..160, y -308..-300, z -80..60
    P.at(P.guideBlock({ w: 40, h: 10, d: 324, hole: 8.5, hz: -138, material: c.fixed }), 0, -138, -55, scene);   // post x -20..20, y -300..24, z -60..-50
    o.gb = scene.children[scene.children.length - 1]; o.gb.rotation.x = Math.PI / 2;
    P.at(P.box(40, 55, 10, c.fixed), o.pv[0], -272.5, -55, scene);              // pivot post x 79..119, y -300..-245, z -60..-50
  },

  step: function (c, dt, S) {
    var o = this.o, R = o.R, r1 = R + o.BT / 2, r2 = o.rr + o.BT / 2, e = +S.controls.throw, i;
    o.ang += S.w * dt;
    function belt(d) { var al = Math.acos((r1 - r2) / d); return 2 * Math.sqrt(d * d - (r1 - r2) * (r1 - r2)) + r1 * (2 * Math.PI - 2 * al) + r2 * 2 * al; }
    // the band is tight, so the two centres stay a fixed distance apart, fitted so that the treadle sits as drawn at the start
    var d = Math.hypot(o.r0[0] + e, o.r0[1]);
    var phi = Math.PI + o.ang, cx = e * Math.cos(phi), cy = e * Math.sin(phi);
    // roller on the circle of radius a round the pin and on the circle of radius d round the disc centre
    var dx = cx - o.pv[0], dy = cy - o.pv[1], D = Math.hypot(dx, dy), xx = (D * D + o.a * o.a - d * d) / (2 * D);
    var h = Math.sqrt(Math.max(0, o.a * o.a - xx * xx)), ux = dx / D, uy = dy / D;
    var s0 = Math.sign((o.r0[0] - o.pv[0]) * (-uy) + (o.r0[1] - o.pv[1]) * ux) || 1;   // side of the line pin-to-disc the roller is on at the start
    var rx = o.pv[0] + ux * xx - uy * h * s0, ry = o.pv[1] + uy * xx + ux * h * s0;
    var th = Math.atan2(ry - o.pv[1], rx - o.pv[0]);
    o.tg.rotation.z = th;
    o.G.rotation.z = phi - Math.PI;
    o.disc.position.x = -e; o.dots.position.x = e;
    o.belt.set(cx, cy, r1, rx, ry, r2, false);
    var dth = (th - o.th0) * 180 / Math.PI;
    var foot = o.pv[1] + o.Lt * Math.sin(th) - (o.pv[1] + o.Lt * Math.sin(o.th0));
    S.set("a", (dth > 0 ? "+" : dth < 0 ? "−" : "") + Math.abs(dth).toFixed(1) + "°");
    S.set("y", (foot > 0 ? "+" : foot < 0 ? "−" : "") + Math.abs(foot).toFixed(0) + " mm");
  }
});
