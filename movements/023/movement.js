M507.define({
  number: 23,
  title: "Belt kept tight by a weighted pulley",
  lede: "A big pulley drives a lower pulley that can be moved up and down. One long belt joins them, bent round two small pulleys that hang from a weighted rope. The weight lifts the small pulleys just enough to keep the belt tight wherever the lower pulley is put.",
  alt: "A big pulley on the left and a lower pulley on the right are joined by one rope belt. Both parts of the belt from the large pulley meet at a pair of small pulleys, then run nearly straight down and round the lower pulley. The small pulleys hang in a frame from a second rope that goes up over two guide pulleys and down to a weight.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving pulley", note: "The big pulley on the left. An engine keeps it turning. Watch its dark spoke." },
    { key: "carrier", color: "#4FA58A", name: "Hanging pulleys", note: "Two small pulleys side by side on one pin, in a frame that hangs from a rope. Each turns freely, and they turn opposite ways. They bend the belt down to the lower pulley." },
    { key: "lower", color: "#C8873A", name: "Lower pulley", note: "The pulley being driven. Its bearing slides up and down, and the belt still turns it." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One endless rope that goes round all the pulleys. Watch the red mark travel the whole way round." },
    { key: "weight", color: "#8E7AA8", name: "Weight and rope", note: "A second rope runs up from the frame, over two guide pulleys, and down to the weight. The weight pulls the frame up and keeps the belt tight." }
  ],
  controls: [
    { type: "range", id: "lift", label: "Height of the lower pulley", min: -6, max: 6, step: 0.5, value: 0, unit: "cm",
      presets: [[-6, "Low"], [0, "Middle"], [6, "High"]] }
  ],
  readouts: [{ id: "hang", label: "Hanging pulleys" }],
  views: { "3d": [420, 140, 760], front: [-10, -14, 880], side: [880, -14, 0] },
  target: [-10, -14, 0],
  how: [
    "The big pulley on the left pulls one long belt round. The belt goes over a small hanging pulley, down and under the lower pulley, and back up over a second small pulley. Then it returns to the big pulley. That is how the lower pulley is turned.",
    "The two small pulleys hang in a frame from a second rope. That rope goes up over two guide pulleys and down to a weight. The weight always pulls the frame up, so the belt is always tight. Lower the bottom pulley and the belt pulls the frame down with it. The weight rises by the same amount.",
    "Try low, then high. Watch the hanging pulleys follow the lower pulley while the weight goes the other way. Then look closely at the two small pulleys. The belt passes them in opposite directions, so they turn opposite ways."
  ],
  note: "This model is rebuilt from Brown's drawing and description. Brown draws one small pulley. The belt passes it twice, in opposite directions, so here it is two free pulleys side by side on one pin. The supports are made up: the beam and hangers over the guide pulleys, the posts behind the pulleys, the sliding bearing and the floor. Brown says the hanging frame slides between guides. They are left out, as in his drawing. He does not say how the lower pulley is raised or lowered.",

  build: function (c) {
    var P = c.P, scene = c.scene, G = c.THREE.Group;
    // Belt rope: tube 2.5. It lies at z = 0 on the driver and the lower pulley, at z = +7 on the front hanging
    // pulley and z = -7 on the back one, so the long runs lean a little in z. Weight rope at z = 0. 5 units = 1 cm.
    var o = this.o = { D: [-197, 10], rD: 52, ax: 40, rA: 28, zg: 7, lx: 110, rL: 42, ayM: 40, lyM: -127,
      B1: [56, 150], B2: [194, 150], rB: 16, W0: 10, T: 2.5, a1: 0, aA: 0, aL: 0, s: 0, key: null };
    function grp() { var g = new G(); scene.add(g); return g; }
    // driving pulley on a shaft that ends at the face of its post
    o.p1 = P.at(P.ropeWheel({ radius: o.rD, tube: o.T, material: c.mat("drive") }), o.D[0], o.D[1], 0, scene);   // z -6.5..6.5
    o.p1.spokes[0].material = c.mat("drive", "dark");
    P.at(P.cylZ(6, 24, c.mat("drive")), o.D[0], o.D[1], -4, scene);              // shaft z -16..8; post face at -16
    // hanging pulleys in their frame; the frame group moves, each pulley turns in it
    o.ten = grp();
    var sm = c.mat("carrier", "dark");
    o.pF = P.at(P.ropeWheel({ radius: o.rA, tube: o.T, spokes: 3, material: c.mat("carrier") }), 0, 0, o.zg, o.ten);    // z 0.5..13.5
    o.pB = P.at(P.ropeWheel({ radius: o.rA, tube: o.T, spokes: 3, material: c.mat("carrier") }), 0, 0, -o.zg, o.ten);   // z -13.5..-0.5
    o.pF.spokes[0].material = sm; o.pB.spokes[0].material = sm;
    P.at(P.cylZ(3.5, 30, sm), 0, 0, 0, o.ten);                                   // pin z -15..15, strap face to strap face
    P.at(P.box(10, 45, 3, sm), 0, 15.5, 16.5, o.ten);                            // front strap y -7..38, z 15..18
    P.at(P.box(10, 45, 3, sm), 0, 15.5, -16.5, o.ten);                           // back strap y -7..38, z -18..-15
    P.at(P.box(10, 6, 36, sm), 0, 41, 0, o.ten);                                 // top bar y 38..44, z -18..18; straps end at its bottom; rope top at 30.5
    P.at(P.hook({ radius: 5, tube: 1.8, material: sm }), 0, 48, 0, o.ten);       // eye y 41.2..54.8, sunk into the bar top at 44
    // lower pulley on a bearing block that slides on the face of its post
    o.low = grp();
    o.p2 = P.at(P.ropeWheel({ radius: o.rL, tube: o.T, material: c.mat("lower") }), 0, 0, 0, o.low);   // z -6.5..6.5
    o.p2.spokes[0].material = c.mat("lower", "dark");
    P.at(P.cylZ(6, 18, c.mat("lower")), 0, 0, -1, o.low);                        // shaft z -10..8, from the block face
    P.at(P.box(26, 30, 6, c.mat("lower", "dark")), 0, 0, -13, o.low);            // block y ±15, z -16..-10; post face at -16
    // floor and a slim post behind each of the driver and the lower pulley
    P.at(P.box(500, 8, 80, c.fixed), -10, -216, -10, scene);                      // floor x -260..240, y -220..-212, z -50..30
    P.at(P.box(14, 234, 8, c.fixed), o.D[0], -95, -20, scene);                   // driver post y -212..22, z -24..-16; floor top -212
    P.at(P.box(14, 140, 8, c.fixed), o.lx, -142, -20, scene);                    // lower post y -212..-72, z -24..-16; block top reaches -82
    // guide pulleys in forked hangers under a short beam
    var wm = c.mat("weight"), rm = wm;
    P.at(P.box(168, 8, 16, c.fixed), 125, 188, 0, scene);                         // beam x 41..209, y 184..192, z -8..8
    o.g = [o.B1, o.B2].map(function (b) {
      P.at(P.box(10, 44, 3, c.fixed), b[0], 162, 6.5, scene);                    // hanger y 140..184, z 5..8; beam bottom 184
      P.at(P.box(10, 44, 3, c.fixed), b[0], 162, -6.5, scene);                   // z -8..-5
      P.at(P.cylZ(3, 10, c.mat("weight", "dark")), b[0], b[1], 0, scene);        // pin z -5..5, hanger face to hanger face
      return P.at(P.sheave({ radius: o.rB, material: wm, holes: c.mat("weight", "dark") }), b[0], b[1], 0, scene);   // z -4..4
    });
    var a1 = P.at(P.arc(o.rB, 2.2, Math.PI / 2, rm), o.B1[0], o.B1[1], 0, scene); a1.rotation.z = Math.PI / 2;
    P.at(P.arc(o.rB, 2.2, Math.PI / 2, rm), o.B2[0], o.B2[1], 0, scene);
    P.at(P.rod(2.2, rm), 0, 0, 0, scene).span(o.B1[0], o.B1[1] + o.rB, 0, o.B2[0], o.B2[1] + o.rB, 0);
    o.r1 = P.rod(2.2, rm); scene.add(o.r1);
    o.r2 = P.rod(2.2, rm); scene.add(o.r2);
    o.rmark = P.at(P.sphere(4.4, c.mat("weight", "mark")), 0, o.B1[1] + o.rB, 0, scene);   // rides on the level part of the rope
    o.wt = grp();                                                                 // origin at the middle of the weight
    P.at(P.cylY(20, 32, wm), 0, 0, 0, o.wt);                                     // y -16..16
    P.at(P.hook({ radius: 5, tube: 1.8, material: wm }), 0, 20, 0, o.wt);        // eye y 13.2..26.8, sunk into the top at 16
    // the one belt
    o.belt = P.ropePath({ tube: o.T, material: c.mat("belt"), mark: c.mat("belt", "mark"), marks: 1 });
    scene.add(o.belt);
    o.L0 = this.loop(o.lyM, o.ayM).len;
  },

  // The belt in the order it travels: round the driver, over the back hanging pulley, straight down and under the
  // lower pulley, up over the front hanging pulley and back. side +1: the belt goes anticlockwise round that pulley.
  loop: function (ly, ay) {
    var o = this.o, TAU = 2 * Math.PI;
    var C = [{ c: [o.D[0], o.D[1], 0], r: o.rD, s: 1 }, { c: [o.ax, ay, -o.zg], r: o.rA, s: -1 },
      { c: [o.lx, ly, 0], r: o.rL, s: 1 }, { c: [o.ax, ay, o.zg], r: o.rA, s: 1 }];
    function mod(a) { return ((a % TAU) + TAU) % TAU; }
    // tangent run from a to b: angle of the normal pointing to the left of travel, and the run's length
    var runs = C.map(function (a, i) {
      var b = C[(i + 1) % 4], dx = b.c[0] - a.c[0], dy = b.c[1] - a.c[1], d = Math.sqrt(dx * dx + dy * dy), k = b.s * b.r - a.s * a.r;
      return { n: Math.atan2(dy, dx) + Math.acos(k / d), len: Math.hypot(Math.sqrt(d * d - k * k), b.c[2] - a.c[2]) };
    });
    var len = 0, path = C.map(function (q, i) {
      var off = q.s > 0 ? Math.PI : 0, a0 = runs[(i + 3) % 4].n + off, dep = runs[i].n + off;
      var a1 = q.s > 0 ? a0 + mod(dep - a0) : a0 - mod(a0 - dep);
      len += Math.abs(a1 - a0) * q.r + runs[i].len;
      return { c: q.c, r: q.r, a0: a0, a1: a1 };
    });
    path.push([C[0].c[0] + o.rD * Math.cos(path[0].a0), C[0].c[1] + o.rD * Math.sin(path[0].a0), 0]);   // close the loop
    return { path: path, len: len };
  },
  // height of the hanging pulleys that keeps the belt at its length
  solve: function (ly) {
    var lo = ly + 100, hi = 140;
    for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (this.loop(ly, m).len < this.o.L0) lo = m; else hi = m; }
    return lo;
  },

  lay: function (cm) {
    var o = this.o, ly = o.lyM + cm * 5, ay = this.solve(ly);
    o.ten.position.set(o.ax, ay, 0);
    o.low.position.set(o.lx, ly, 0);
    o.path = this.loop(ly, ay).path;
    o.rise = o.ayM - ay;                                       // one rope: the weight rises as far as the frame falls
    var wy = o.W0 + o.rise;
    o.wt.position.set(o.B2[0] + o.rB, wy, 0);
    o.r1.span(o.ax, ay + 53, 0, o.B1[0] - o.rB, o.B1[1], 0);                     // frame eye straight up to the left guide pulley
    o.r2.span(o.B2[0] + o.rB, o.B2[1], 0, o.B2[0] + o.rB, wy + 25, 0);          // right guide pulley down to the weight's eye
    o.rmark.position.x = (o.B1[0] + o.B2[0]) / 2 - o.rise;
    o.g.forEach(function (g) { g.rotation.z = o.rise / o.rB; });
  },

  step: function (c, dt, S) {
    var o = this.o, cm = +S.controls.lift;
    if (o.key !== cm) { o.key = cm; this.lay(cm); }
    var v = S.w * o.rD;                                        // belt speed = radius x turning speed
    o.a1 += S.w * dt; o.aA += v / o.rA * dt; o.aL += v / o.rL * dt; o.s += v * dt;
    o.p1.rotation.z = o.a1; o.p2.rotation.z = o.aL;
    o.pF.rotation.z = o.aA; o.pB.rotation.z = -o.aA;           // the belt passes the two hanging pulleys opposite ways
    o.belt.markS = [((o.s % o.L0) + o.L0) % o.L0];
    o.belt.set(o.path);
    function cmText(u) { var x = Math.round(u * 2) / 10; return (x > 0 ? "+" : "") + x.toFixed(1) + " cm"; }
    S.set("hang", cmText(-o.rise));
  }
});
