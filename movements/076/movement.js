M507.define({
  number: 76,
  title: "Revolution counter tappet",
  lede: "A stud on a big wheel gives a lever a knock once every turn. The lever lifts a jointed finger, which moves a toothed wheel on by one tooth. So the toothed wheel counts the turns of the big wheel.",
  alt: "A toothed wheel on the left. To its right a level lever turns on a fixed pin, with a hinged finger on its left end tucked under the teeth. Behind, part of a big wheel carries a stud that comes down onto the lever's right end. A second finger at the top left rests in the teeth.",
  parts: [
    { key: "big", color: "#5E7387", name: "Big wheel", note: "The wheel whose turns are counted. The stud on its face knocks the lever once every turn." },
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with slanted teeth, called a ratchet. It moves on one tooth for each turn of the big wheel. Watch the red tooth." },
    { key: "finger", color: "#C2503F", name: "Jointed pawl", note: "A finger, called a pawl, hinged to the end of the lever. Going up, it lifts a tooth. Going down, it folds back and slides over the teeth." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "Turns on a fixed pin, called a tappet. The stud pushes its right end down, so its left end goes up." },
    { key: "click", color: "#4FA58A", name: "Holding pawl", note: "A finger on a fixed pin, called a holding pawl. It lets the counting wheel turn forward and stops it from slipping back." }
  ],
  controls: [{ id: "studs", label: "Studs on the big wheel", value: "1", options: [["1", "1 stud"], ["2", "2 studs"]] }],
  speed: { min: 2, max: 30, value: 10, label: "Big wheel", unit: " rpm" },
  readouts: [{ id: "turns", label: "Big wheel" }, { id: "teeth", label: "Ratchet wheel" }],
  views: { "3d": [695, 223, 1231], front: [110, -50, 1387], side: [1267, -37, -43] },
  target: [110, -50, -30],
  how: [
    "The big wheel turns slowly. Once a turn its stud comes down onto the right end of the lever and pushes it down. The lever turns on its pin, so its left end goes up.",
    "The finger hinged to the left end hooks under a tooth and lifts it, so the counting wheel turns a little. Then the stud slides off the end of the lever. The heavier left end falls back by its own weight. On the way down the finger folds back over the next tooth and drops under it. The holding pawl holds the counting wheel still meanwhile.",
    "Count the turns of the big wheel and the teeth of the counting wheel. They stay the same. Try 2 studs. Now the wheel moves on two teeth for each turn."
  ],
  note: "This model is rebuilt from Brown's drawing. The lever is drawn as one straight bar instead of Brown's shaped one, and the big wheel is shown whole but smaller. The plates, the post, the stop pin under the lever, the sizes and the number of teeth were made up. The lever falls freely with no bounce.",

  init: function (ov) {
    var K = this.K = { N: 24, R: 150, D: 14, CR: 205, CA: 109 * Math.PI / 180, GX: 184.5, GY: -132, RS: 190, rs: 8, TH0: 1.15,
      CX: 285, CY: -10, YT: 7, XT: 90, JX: -50, G: 16, RB: 20 }, key;
    for (key in ov || {}) K[key] = ov[key];
    K.st = 2 * Math.PI / K.N; K.root = K.R - K.D;
    var jr = Math.hypot(K.CX + K.JX, K.CY);
    K.LB = Math.sqrt(jr * jr + K.root * K.root - 2 * jr * K.root * Math.cos(K.RB * Math.PI / 180));               // finger: RB degrees of reach when its tip is in a gap
    K.LC = Math.sqrt(K.CR * K.CR + K.root * K.root - 2 * K.CR * K.root * Math.cos(29 * Math.PI / 180));           // click: tip 29 degrees round from its pin
    this.o = { th: K.TH0, t: 0, tv: 0, phi: 0, k: 0, db: 0, dc: 0 };
    var o = this.o, J = this.joint(0);
    o.db = this.reach(J.r, K.LB, K.root);
    o.phi = J.a - o.db + K.st * .5;                                         // the finger tip starts half a tooth below the face it will lift
    this.phys(0, 0, "1");
  },
  reach: function (rp, L, r) { return Math.acos(Math.max(-1, Math.min(1, (rp * rp + r * r - L * L) / (2 * rp * r)))); },
  // wheel outline: teeth reversed, so a tip at each multiple of the pitch and the slope falling going round anticlockwise
  rimAt: function (u) { var K = this.K, f = -u / K.st + 1e-9; f -= Math.floor(f); return K.root + K.D * f; },
  joint: function (t) {
    var K = this.K, x = K.CX + K.JX * Math.cos(t), y = K.CY + K.JX * Math.sin(t);
    return { x: x, y: y, r: Math.hypot(x, y), a: Math.atan2(y, x) };
  },

  // h: time step, w: big wheel speed (rad/s, turning clockwise as seen from the front)
  phys: function (h, w, studs) {
    var K = this.K, o = this.o, i, n = +studs || 1, best = 1;
    o.th -= w * h;
    // each stud pushes the top edge of the lever's right arm down; find the lever angle at which it just touches
    for (i = 0; i < n; i++) {
      var a = o.th + i * 2 * Math.PI / n, sx = K.GX + K.RS * Math.cos(a) - K.CX, sy = K.GY + K.RS * Math.sin(a) - K.CY;
      var d = Math.hypot(sx, sy), b = Math.atan2(sy, sx), q = (K.YT + K.rs) / d;
      if (q >= 1) continue;
      var tc = b - Math.asin(q);                                            // lever angle with the stud resting on its top edge
      if (Math.abs(b - o.t) > 1.4) continue;                                // stud not over the right arm
      if (d * Math.cos(b - tc) > K.XT) continue;                            // past the end: it has slipped off
      if (tc < best) best = tc;
    }
    if (best < o.t) { o.t = best; o.tv = 0; }                               // pushed down by a stud
    else { o.tv += K.G * h; o.t = Math.min(o.t + o.tv * h, best); if (o.t >= 0) { o.t = 0; o.tv = 0; } }   // falls back by its weight onto the stop
    // jointed finger: hinged at the lever end, tip clockwise of the hinge. The faces stop it moving anticlockwise, so lifting it turns the wheel.
    var J = this.joint(o.t), v = -(J.a - o.db - o.phi);                     // v: mirrored position of the tip on the wheel
    while (v >= (o.k + 1) * K.st) o.k++;
    if (v < o.k * K.st) { o.db = this.reach(J.r, K.LB, K.root); o.phi = J.a - o.db + o.k * K.st; v = o.k * K.st; }
    for (i = 0; i < 4; i++) { o.db = this.reach(J.r, K.LB, this.rimAt(-v)); v = Math.max(o.k * K.st, -(J.a - o.db - o.phi)); }
    o.rb = this.rimAt(-v); o.ab = J.a - o.db; o.J = J;
    // click: tip anticlockwise of its pin, rides the teeth
    var uc = K.CA + o.dc - o.phi;
    for (i = 0; i < 4; i++) { o.dc = this.reach(K.CR, K.LC, this.rimAt(uc)); uc = K.CA + o.dc - o.phi; }
    o.rc = this.rimAt(uc);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    this.init();
    var K = this.K, o = this.o;
    o.phi0 = o.phi;
    function side(px, py, nx, ny) { return (nx - px) * -py - (ny - py) * -px < 0 ? 1 : -1; }   // pawl body away from the wheel centre

    // Layers along z: back plate face -70; big wheel -60..-48, studs -48..-11; lever -18..-10;
    // front plate -8..0 (lever post too); counting wheel, finger and click 2..14.
    // big wheel: rim, four spokes, hub; turns clockwise
    o.big = new T.Group(); o.big.position.set(K.GX, K.GY, 0); scene.add(o.big);
    var mb = c.mat("big"), rim = new T.Shape();
    rim.absarc(0, 0, 208, 0, 2 * Math.PI, false);
    var hole = new T.Path(); hole.absarc(0, 0, 172, 0, 2 * Math.PI, true); rim.holes.push(hole);
    var rg = new T.ExtrudeGeometry(rim, { depth: 12, bevelEnabled: false, curveSegments: 64 }); rg.translate(0, 0, -60);
    o.big.add(new T.Mesh(rg, mb));                                            // rim r 172..208, z -60..-48
    for (i = 0; i < 4; i++) {
      var sp = P.box(152, 14, 8, mb), a = i * Math.PI / 2 + Math.PI / 4;
      sp.position.set(97 * Math.cos(a), 97 * Math.sin(a), -54); sp.rotation.z = a; o.big.add(sp);   // spoke r 21..173, into the hub and the rim
    }
    P.at(P.cylZ(24, 22, mb), 0, 0, -59, o.big);                              // hub z -70..-48, on the back plate face
    o.studs = [];
    for (i = 0; i < 2; i++) {
      var sg = new T.Group(); o.big.add(sg); o.studs.push(sg);
      P.at(P.cylZ(K.rs, 37, mb), K.RS, 0, -29.5, sg);                        // stud z -48..-11, from the rim face into the lever's layer
    }

    // lever (tappet) on its fixed pin
    o.lever = new T.Group(); o.lever.position.set(K.CX, K.CY, -14); scene.add(o.lever);
    var ml = c.mat("lever"), L = K.XT - K.JX;
    P.at(P.box(L, 14, 8, ml), (K.XT + K.JX) / 2, 0, 0, o.lever);              // bar from the joint to the tip, y -7..7, z -18..-10
    P.at(P.cylZ(7, 8, ml), K.XT, 0, 0, o.lever);                              // rounded tip
    P.at(P.cylZ(11, 8, ml), K.JX, 0, 0, o.lever);                             // eye at the joint
    P.at(P.cylZ(12, 8, ml), 0, 0, 0, o.lever);                                // boss round the pin
    P.at(P.cylZ(4, 25.5, ml), K.JX, 0, 16.75, o.lever);                         // joint pin z -10..15, from the lever's front face through the finger
    P.at(P.cylZ(6, 2, c.mat("lever", "dark")), K.JX, 0, 30, o.lever);       // pin head z 15..17, on the finger's front face
    P.at(P.cylZ(5, 12, c.fixed), K.CX, K.CY, -14, scene);                   // lever pin z -20..-8, from the post's back face
    P.at(P.cylZ(9, 2, c.fixed), K.CX, K.CY, -19, scene);                    // pin head z -20..-18, on the lever's back face
    P.at(P.cylZ(5, 10, c.fixed), K.CX - 19, K.CY - 12, -13, scene);         // stop pin z -18..-8, top y -17 meets the lever's underside at rest

    // jointed finger and click, in the counting wheel's layer
    var J = o.J, nb = [o.rb * Math.cos(o.ab), o.rb * Math.sin(o.ab)];
    o.finger = P.pawl({ length: K.LB, thick: 7, width: 12, side: side(J.x, J.y, nb[0], nb[1]), material: c.mat("finger") });
    P.at(o.finger, J.x, J.y, 8, scene);                                       // finger z 2..14, boss 1..15
    var cx = K.CR * Math.cos(K.CA), cy = K.CR * Math.sin(K.CA), ac = K.CA + o.dc;
    o.click = P.pawl({ length: K.LC, thick: 7, width: 12, side: side(cx, cy, o.rc * Math.cos(ac), o.rc * Math.sin(ac)), material: c.mat("click") });
    P.at(o.click, cx, cy, 8, scene);
    P.at(P.cylZ(4, 15.5, c.fixed), cx, cy, 7.75, scene);                        // click stud z 0..15, from the plate face
    P.at(P.cylZ(6, 2, c.mat("click", "dark")), cx, cy, 16, scene);          // stud head z 15..17, on the click's front face

    // counting wheel
    o.wheel = new T.Group(); o.wheel.position.z = 8; scene.add(o.wheel);
    o.wheel.add(P.ratchet({ teeth: K.N, radius: K.R, depth: K.D, width: 12, reverse: true, material: c.mat("wheel") }));   // z 2..14
    P.at(P.cylZ(10, 18, c.mat("wheel")), 0, 0, 1, o.wheel);                  // shaft z 0..18, from the plate face
    P.at(P.cylZ(24, 4, c.mat("wheel")), 0, 0, 8, o.wheel);                   // hub z 14..18, on the wheel face
    P.at(P.hoop(24, 1, c.mat("wheel", "dark")), 0, 0, 10.5, o.wheel);       // ring round the hub, lifted off its face
    var mg = new T.Group(); mg.rotation.z = Math.PI / 2 - o.phi; o.wheel.add(mg);   // marked tooth starts at the top
    P.at(P.box(30, 5, 1, c.mat("wheel", "mark")), K.R - K.D - 18, 0, 7, mg); // red mark r 103..133, z 14.5..15.5, lifted off the face

    // supports
    P.at(P.box(380, 582, 8, c.fixed), 0, -61, -4, scene);                   // front plate x -190..190, y -352..230, z -8..0
    P.at(P.box(50, 357, 8, c.fixed), K.CX, -173.5, -4, scene);               // lever post x 260..310, y -352..5, z -8..0
    P.at(P.box(400, 442, 10, c.fixed), 190, -131, -75, scene);               // back plate x -10..390, y -352..90, z -80..-70
    P.at(P.box(640, 12, 130, c.fixed), 110, -358, -35, scene);               // base x -210..430, y -364..-352, z -100..30; plates stand on y -352
    this.place(1);
  },

  place: function (n) {
    var K = this.K, o = this.o;
    o.big.rotation.z = o.th - K.TH0;
    o.studs[0].rotation.z = K.TH0; o.studs[1].rotation.z = K.TH0 + Math.PI; o.studs[1].visible = n > 1;
    o.lever.rotation.z = o.t;
    o.wheel.rotation.z = o.phi;
    var J = o.J;
    o.finger.position.set(J.x, J.y, 8);
    o.finger.rotation.z = Math.atan2(o.rb * Math.sin(o.ab) - J.y, o.rb * Math.cos(o.ab) - J.x);
    var cx = K.CR * Math.cos(K.CA), cy = K.CR * Math.sin(K.CA), ac = K.CA + o.dc;
    o.click.rotation.z = Math.atan2(o.rc * Math.sin(ac) - cy, o.rc * Math.cos(ac) - cx);
  },

  step: function (c, dt, S) {
    var o = this.o, n = Math.max(1, Math.ceil(dt / .004)), i;
    for (i = 0; i < n; i++) this.phys(dt / n, S.w, S.controls.studs);
    this.place(+S.controls.studs);
    // a turn is counted as the stud leaves the lever (stud angle about 20 degrees), so both readouts change together
    var turns = Math.floor((.35 - o.th) / (2 * Math.PI)) + 1, tt = Math.round((o.phi - o.phi0) / this.K.st);
    S.set("turns", turns + (turns === 1 ? " turn" : " turns"));
    S.set("teeth", tt + (tt === 1 ? " tooth" : " teeth"));
  }
});
