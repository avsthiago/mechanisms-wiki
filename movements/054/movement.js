M507.define({
  number: 54,
  title: "Star wheel",
  lede: "A small gear turns steadily one way, yet the big wheel turns one way and then back again. The small gear works on the front of a ring of bars, then slips through a gap and works on the back. Mangles, machines that press wet washing between rollers, used this to roll the cloth back and forth.",
  alt: "A big upright wheel with four spokes and a ring of bars round its edge, like the rungs of a ladder bent into a circle. A small gear at the bottom lies across the ring with its shaft pointing down through a slotted plate to a crank. There is a gap in the ring where no bars are.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear. It always turns the same way. Its teeth catch the bars of the ring, first from the front and later from the back." },
    { key: "wheel", color: "#C8873A", name: "Star wheel", note: "The big wheel. It turns one way, stops, and turns back." },
    { key: "bars", color: "#8E7AA8", name: "Ring of bars", note: "Bars set like spokes between two rims. There is a gap where a few bars are missing. Watch the pinion go round the last bar into the gap." },
    { key: "guide", color: "#4FA58A", name: "Slotted plate", note: "It stands still. The pinion's shaft slides back and forth in its slot, so the pinion can move from the front of the ring to the back." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the pinion. In a real machine an engine or a water wheel would do this." }
  ],
  controls: [{ id: "ring", label: "Ring of bars", value: "full", options: [["full", "Nearly all round"], ["half", "Half way round"]] }],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "in", label: "Pinion" }, { id: "out", label: "Wheel" }],
  views: { "3d": [520, 160, 820], front: [0, -20, 980], side: [980, -20, 0] },
  target: [0, -20, 0],
  how: [
    "Turn the crank and the small gear, called a pinion, turns with it. It lies across the ring with its teeth between the bars. On the front of the ring it pushes the bars sideways, so the wheel turns.",
    "When the last bar reaches the pinion, the pinion swings round that bar into the gap and comes out behind the ring. Now its teeth push on the back of the bars. It still turns the same way, but the back of the bars moves the opposite way, so the wheel goes back. A minus sign in the readout means the other way. The pinion's shaft slides in the slot of the green plate to change sides.",
    "Try Nearly all round, then Half way round. Watch how far the wheel turns before it goes back."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the ring with no gap, but the pinion needs one to get from the front to the back, so a gap was cut and the outer rim split there. Brown also draws a second small gear on the left; the drawing does not show what it does, so it is left out. The crank, the slotted plate, the post behind the wheel, the base, the sizes and the number of bars were made up. The half ring was added to show what the length of the ring changes.",

  // Sizes. Pinion: module 6, 10 teeth, pitch radius RP 30, tips 36, 40 long (radius 136..176 from the wheel's centre).
  // Bars sit on a circle of RM 156 at 52 steps (pitch 6 pi like the pinion) in the plane z = 0. The pinion's centre is
  // RP in front of that plane (z = 30) or behind it (z = -30), and swings round the last bar at each end of the ring.
  dims: { NP: 10, MD: 6, RP: 30, RM: 156, N: 52 },
  rings: { full: 47, half: 26 },                // steps covered by bars; the rest is the gap (5 steps when nearly full)

  /** Wheel angle th, pinion depth z and d th / d u for pinion turn u, with `steps` bar steps. Cycle from the moment the
      first bar (wheel angle 0) is under the pinion at the bottom: swing round it to the back (pinion half a turn),
      back run, swing round the last bar to the front, front run. k = RP / RM is the wheel turn per pinion turn. */
  kin: function (steps, u) {
    var D = this.dims, k = D.RP / D.RM, B = steps * 2 * Math.PI / D.N, Lp = B / k, U = 2 * Math.PI + 2 * Lp, h = -Math.PI / 2, v;
    u = ((u % U) + U) % U;
    if (u < Math.PI) return { th: h + k * Math.sin(u), z: D.RP * Math.cos(u), r: k * Math.cos(u), U: U };
    if (u < Math.PI + Lp) return { th: h - k * (u - Math.PI), z: -D.RP, r: -k, U: U };
    v = u - Math.PI - Lp;
    if (v < Math.PI) return { th: h - B - k * Math.sin(v), z: -D.RP * Math.cos(v), r: -k * Math.cos(v), U: U };
    v -= Math.PI;
    return { th: h - B + k * v, z: D.RP, r: k, U: U };
  },
  /** Pinion turn u at which the gap's middle stands at the upper left, as in Brown's drawing (on the front run). */
  start: function (steps) {
    var D = this.dims, k = D.RP / D.RM, st = 2 * Math.PI / D.N, B = steps * st, G = 2 * Math.PI - B;
    var th = 150 * Math.PI / 180 + G / 2 - 2 * Math.PI;           // gap middle is at wheel angle -G/2
    while (th < -Math.PI / 2 - B) th += 2 * Math.PI;
    return 2 * Math.PI + B / k + (th + Math.PI / 2 + B) / k;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, self = this, st = 2 * Math.PI / D.N;
    var o = this.o = { a: 0, sets: {} };

    // pinion, shaft and crank, all on the line x = z = 0 of o.rot, which turns about Y. o.pin slides along Z.
    o.pin = new T.Group(); scene.add(o.pin);
    o.rot = new T.Group(); o.pin.add(o.rot);
    var gear = P.spurGear({ teeth: D.NP, module: D.MD, width: 40, material: c.mat("pinion") });
    gear.rotation.x = Math.PI / 2;                                             // gear axis along -Y: local X = world x, local Y = world z
    P.at(gear, 0, -156, 0, o.rot);                                             // y -176..-136
    P.at(P.cylY(10, 4, c.mat("pinion")), 0, -178, 0, o.rot);                  // collar y -180..-176, on the gear's outer face
    P.at(P.cylY(6, 50, c.mat("pinion")), 0, -205, 0, o.rot);                  // shaft y -230..-180, through the slot (plate y -215..-207)
    P.at(P.box(40, 6, 10, c.mat("crank")), 14, -233, 0, o.rot);               // arm x -6..34, y -236..-230, on the shaft end
    P.at(P.cylY(4.5, 10, c.mat("crank")), 28, -225, 0, o.rot);                // handle y -230..-220, on the arm's top face

    // wheel: hub, four spokes, inner rim; shaft to the post behind
    o.wheel = new T.Group(); scene.add(o.wheel);
    var m = c.mat("wheel"), i;
    P.at(P.cylZ(46, 20, m), 0, 0, 0, o.wheel);                                 // hub z -10..10
    var spOff = -this.kin(this.rings.full, this.start(this.rings.full)).th;     // spokes upright and level at the start, as drawn
    for (i = 0; i < 4; i++) {
      var sp = P.box(74, 16, 10, m); sp.rotation.z = i * Math.PI / 2 + spOff;  // spoke radius 40..114 (into hub and rim), z -5..5
      P.at(sp, 77 * Math.cos(sp.rotation.z), 77 * Math.sin(sp.rotation.z), 0, o.wheel);
    }
    function band(r1, r2, a0, a1) {                                            // flat ring or part ring, z -6..6
      var s = new T.Shape(); s.absarc(0, 0, r2, a0, a1, false); s.absarc(0, 0, r1, a1, a0, true); s.closePath();
      var g = new T.ExtrudeGeometry(s, { depth: 12, bevelEnabled: false, curveSegments: 96 }); g.translate(0, 0, -6);
      return new T.Mesh(g, m);
    }
    o.wheel.add(band(112, 124, 0, 2 * Math.PI));                               // inner rim r 112..124
    P.at(P.cylZ(9, 20, m), 0, 0, 20, o.wheel);                                 // shaft end z 10..30, on the hub
    P.at(P.cylZ(14, 3, m), 0, 0, 31.5, o.wheel);                               // collar z 30..33
    P.at(P.cylZ(9, 90, m), 0, 0, -55, o.wheel);                                // shaft z -100..-10, from the post face to the hub

    // bar rings: bars r 123..189 (ends sunk 1 into the rims), radius 4, at wheel angles 0..steps*st; outer rim r 188..200
    // covers the bars and 10 units past each end bar, so the gap stays open for the pinion's shaft.
    Object.keys(this.rings).forEach(function (key) {
      var n = self.rings[key], g = new T.Group(), j, a, bm = c.mat("bars");
      o.wheel.add(g);
      for (j = 0; j <= n; j++) {
        a = j * st;
        var b = P.cylY(4, 66, bm); b.rotation.z = a - Math.PI / 2;            // cylinder axis along the radius
        P.at(b, 156 * Math.cos(a), 156 * Math.sin(a), 0, g);
      }
      g.add(band(188, 200, -10 / 194, n * st + 10 / 194));
      o.sets[key] = { g: g, n: n, s: self.start(n) };
    });

    // slotted plate x -50..50, y -215..-207, z -45..45; slot x -7..7, z -37..37 (shaft centre z -30..30, radius 6)
    var ps = new T.Shape(); ps.moveTo(-50, -45); ps.lineTo(50, -45); ps.lineTo(50, 45); ps.lineTo(-50, 45); ps.closePath();
    var sl = new T.Path(); sl.absarc(0, -30, 7, Math.PI, 2 * Math.PI, false); sl.absarc(0, 30, 7, 0, Math.PI, false); sl.closePath(); ps.holes.push(sl);
    var pg = new T.ExtrudeGeometry(ps, { depth: 8, bevelEnabled: false, curveSegments: 16 });
    pg.rotateX(Math.PI / 2); pg.translate(0, -207, 0);                         // shape y becomes -z, depth runs y -215..-207
    scene.add(new T.Mesh(pg, c.mat("guide")));
    P.at(P.box(12, 43, 40, c.mat("guide")), 56, -228.5, 0, scene);             // leg x 50..62, y -250..-207, z -20..20; plate side face x 50, base top y -250
    P.at(P.box(12, 43, 40, c.mat("guide")), -56, -228.5, 0, scene);            // leg x -62..-50
    // supports
    P.at(P.box(44, 290, 12, c.fixed), 0, -105, -106, scene);                   // post x -22..22, y -250..40, z -112..-100; the wheel's shaft ends at z -100
    P.at(P.box(460, 10, 200, c.fixed), 0, -255, -30, scene);                   // base x -230..230, y -260..-250, z -130..70; post and legs stand on y -250
  },

  step: function (c, dt, S) {
    var o = this.o, D = this.dims, name, cur = o.sets[S.controls.ring] || o.sets.full;
    o.a += S.w * dt;
    for (name in o.sets) o.sets[name].g.visible = o.sets[name] === cur;
    var u = o.a + cur.s, K = this.kin(cur.n, u);
    o.wheel.rotation.z = K.th;
    o.pin.position.z = K.z;
    o.rot.rotation.y = -(((u % K.U) + K.U) % K.U) + Math.PI / 2 + Math.PI / D.NP;   // a tooth gap faces the first bar when the swing starts
    function fm(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", fm(rpm));
    S.set("out", fm(rpm === 0 ? 0 : rpm * K.r));
  }
});
