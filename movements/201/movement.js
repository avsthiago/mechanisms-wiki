M507.define({
  number: 201,
  title: "Irregular gear, arm and rod",
  lede: "A lopsided gear turns a small gear that rides on the end of a long swinging arm. As the lopsided gear turns, it pushes the small gear out and lets it back in, so the arm rocks. The rocking arm lifts and lowers a rod, while a belt carries the small gear's turning down to a big wheel.",
  alt: "At the top, a lopsided toothed gear meshes with a small gear. The small gear sits on the top of a long arm that hangs from the centre of a big wheel below. A belt runs round a small wheel behind the small gear and round the big wheel. A short arm reaches left from the centre and has a slot at its end, where a pin on an upright rod sits.",
  parts: [
    { key: "gear", color: "#5E7387", name: "Lopsided gear", note: "A gear that is not round, on a shaft that is not at its middle. It turns at a steady speed. Watch its red stripe." },
    { key: "pinion", color: "#C8873A", name: "Small gear", note: "Rides on the top of the arm and is always in mesh with the lopsided gear. A small wheel behind it carries the belt. Its red stripe shows its speed change." },
    { key: "arm", color: "#D9B13B", name: "Swinging arm", note: "One piece with a long arm up to the small gear and a short arm to the left. It pivots on the big wheel's shaft, so the short arm rocks when the long arm is pushed." },
    { key: "rod", color: "#4FA58A", name: "Sliding rod", note: "Slides up and down in a guide. A pin at its top sits in the slot of the short arm, so the rod follows the arm." },
    { key: "wheel", color: "#8E7AA8", name: "Belt and big wheel", note: "The belt passes the small gear's turning down to the big wheel. The red marks show the belt moving." }
  ],
  controls: [{ id: "shape", label: "Gear shape", value: "brown", options: [["brown", "Lopsided oval"], ["round", "Round, off centre"], ["oval", "Oval, centred"]] }],
  readouts: [{ id: "p", label: "Small gear" }, { id: "a", label: "Arm" }, { id: "r", label: "Rod" }],
  views: { "3d": [390, 130, 880], front: [5, 5, 1180], side: [1150, 5, 0] },
  target: [5, 5, 0],
  how: [
    "The lopsided gear turns at a steady speed. Its shaft is near one edge, so its teeth are close to the shaft on one side and far away on the other. The small gear must stay in mesh, so it is pushed out and comes back once in every turn.",
    "The small gear rides on the long arm, so the arm rocks to and fro. The short arm rocks with it and lifts and lowers the rod through the pin in its slot. The small gear also speeds up and slows down, because the far teeth move faster than the near ones. The belt passes that turning down to the big wheel, whose centre is the arm's pivot, so the belt stays tight.",
    "Try Round, off centre, then Oval, centred. The shape of the gear sets the pattern: the round one rocks the arm once in a turn, the centred oval twice."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not say what the big wheel drives or what turns the lopsided gear. The gear's exact outline, the numbers of teeth, the backing plate, the guide for the rod and all the sizes were made up. The small wheel behind the small gear is made smaller than drawn, so it clears the gear's shaft. The other two gear shapes were added for comparison.",

  K: { G: [-4, 184], O: [52, -88.8], L: 265, MD: 6, NP: 10, NG: 19, R1: 40, R2: 116, XR: -108.8 },

  /* Pitch curve of each gear, measured from its shaft, anticlockwise, scaled so its length is exactly NG teeth of the small
     gear's pitch. "brown" follows the drawing: an oval with the shaft up and to the right of its middle. */
  _shape: function (id) {
    var K = this.K, n = 720, pts = [], i, len = K.NG * Math.PI * K.MD, sh = { brown: [-19.2, -24, 49.6, 63.2], round: [-31, -8, 57, 57], oval: [0, 0, 39, 75] }[id];
    for (i = 0; i < n; i++) { var t = 2 * Math.PI * i / n; pts.push([sh[2] * Math.cos(t), sh[3] * Math.sin(t)]); }
    var per = 0; for (i = 0; i < n; i++) per += Math.hypot(pts[(i + 1) % n][0] - pts[i][0], pts[(i + 1) % n][1] - pts[i][1]);
    pts = pts.map(function (p) { return [sh[0] + p[0] * len / per, sh[1] + p[1] * len / per]; });
    var cum = [0], nx = [], ny = [];
    for (i = 0; i < n; i++) {
      var a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty);
      cum.push(cum[i] + Math.hypot(pts[(i + 1) % n][0] - pts[i][0], pts[(i + 1) % n][1] - pts[i][1])); nx.push(ty / tl); ny.push(-tx / tl);
    }
    return { pts: pts, cum: cum, nx: nx, ny: ny, len: cum[n] };
  },
  /* The small gear's centre sits one pitch radius out from the lopsided gear's pitch curve, along its outward normal, and also
     on the circle of radius L round the arm's pivot. With the gear turned by al, find where those meet. Of the crossings the
     one nearest the last answer (distance `prev` round the curve) is kept; with no last answer, the one furthest right. */
  _solve: function (cv, al, prev) {
    var K = this.K, rp = K.NP * K.MD / 2, c = Math.cos(al), s = Math.sin(al), n = cv.pts.length, best = null, i, a, b;
    function w(k) {
      var qx = cv.pts[k][0] + rp * cv.nx[k], qy = cv.pts[k][1] + rp * cv.ny[k], X = K.G[0] + qx * c - qy * s, Y = K.G[1] + qx * s + qy * c;
      return { X: X, Y: Y, f: Math.hypot(X - K.O[0], Y - K.O[1]) - K.L, k: k };
    }
    a = w(0);
    for (i = 1; i <= n; i++, a = b) {
      b = w(i % n);
      if ((a.f < 0) === (b.f < 0)) continue;
      var u = a.f / (a.f - b.f), sv = cv.cum[i - 1] + u * (cv.cum[i] - cv.cum[i - 1]), X = a.X + (b.X - a.X) * u, Y = a.Y + (b.Y - a.Y) * u;
      var d = prev == null ? -X : Math.abs(((sv - prev) % cv.len + 1.5 * cv.len) % cv.len - cv.len / 2);
      if (!best || d < best.d) {
        var nx = cv.nx[a.k] + (cv.nx[b.k] - cv.nx[a.k]) * u, ny = cv.ny[a.k] + (cv.ny[b.k] - cv.ny[a.k]) * u;
        best = { s: sv, X: X, Y: Y, d: d, th: Math.atan2(ny, nx) + al };     // th: direction of the outward normal at the contact, in the world
      }
    }
    return best;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, self = this, rp = K.NP * K.MD / 2;
    var o = this.o = { al: 0, sets: {}, cur: null };
    // lopsided gears, one for each shape: gear z 6..18, boss z 18..21, shaft z -36..22 from the plate face
    o.gear = new T.Group(); o.gear.position.set(K.G[0], K.G[1], 0); scene.add(o.gear);
    ["brown", "round", "oval"].forEach(function (id) {
      var cv = self._shape(id), m = P.noncircularGear({ points: cv.pts, teeth: K.NG, width: 12, material: c.mat("gear") });
      m.position.z = 12; o.gear.add(m); cv.mesh = m; o.sets[id] = cv;
    });
    P.at(P.cylZ(16, 3, c.mat("gear")), 0, 0, 19.5, o.gear);                                   // boss z 18..21
    P.at(P.cylZ(8, 58, c.mat("gear")), 0, 0, -7, o.gear);                                     // shaft z -36..22
    var st = P.at(P.box(44, 5, 1, c.mat("gear", "mark")), 0, 0, 19, o.gear);                  // stripe z 18.5..19.5, r 17..61, off the face (z 18)
    st.position.set(-.6 * 39, -.8 * 39, 19); st.rotation.z = Math.atan2(-.8, -.6);
    // small gear on the arm: gear z 6..18, hub z 18..21, shaft z -32..22, belt wheel z -32..-16 (rim under the belt's middle radius)
    o.pin = new T.Group(); scene.add(o.pin);
    P.at(P.spurGear({ teeth: K.NP, module: K.MD, width: 12, material: c.mat("pinion") }), 0, 0, 12, o.pin);
    P.at(P.cylZ(11, 3, c.mat("pinion")), 0, 0, 19.5, o.pin);
    P.at(P.cylZ(7, 54, c.mat("pinion")), 0, 0, -5, o.pin);
    P.at(P.cylZ(K.R1 - 2.5, 16, c.mat("pinion")), 0, 0, -24, o.pin);
    P.at(P.box(10, 4, 1, c.mat("pinion", "mark")), 16, 0, 19, o.pin);                         // stripe r 11..21, z 18.5..19.5
    // big wheel on its shaft: wheel z -32..-16, ring on its face, shaft z -36..3 (1 past the arm's boss)
    o.wheel = new T.Group(); o.wheel.position.set(K.O[0], K.O[1], 0); scene.add(o.wheel);
    P.at(P.cylZ(K.R2 - 2.5, 16, c.mat("wheel")), 0, 0, -24, o.wheel);
    P.at(P.hoop(95, 1.5, c.mat("wheel")), 0, 0, -16, o.wheel);
    P.at(P.cylZ(12, 39, c.mat("wheel")), 0, 0, -16.5, o.wheel);
    P.at(P.box(48, 5, 1, c.mat("wheel", "mark")), 66, 0, -15.5, o.wheel);                     // stripe r 42..90, z -16..-15 off the face (z -16)
    P.at(P.box(20, 3, 1, c.mat("wheel", "dark")), 0, 0, 4, o.wheel);                           // stripe on the shaft end, z 3.5..4.5
    // swinging arm, drawn in its own frame: pivot at the origin, long arm up +y to (0, L), short arm out along -x
    o.arm = new T.Group(); o.arm.position.set(K.O[0], K.O[1], 0); scene.add(o.arm);
    var D = Math.PI / 180, L = K.L, sh = new T.Shape(), hole = new T.Path();
    sh.moveTo(24, 26.83); sh.lineTo(15.04, L - 5.47);
    sh.absarc(0, L, 16, -20 * D, 200 * D, false); sh.lineTo(-24, 26.83);
    sh.absarc(0, 0, 36, Math.atan2(26.83, -24), Math.atan2(24, -26.83), false); sh.lineTo(-117, 12);
    sh.absarc(-133, 0, 20, Math.asin(.6), Math.PI / 2, false); sh.lineTo(-199, 20);
    sh.absarc(-199, 0, 20, Math.PI / 2, 1.5 * Math.PI, false); sh.lineTo(-133, -20);
    sh.absarc(-133, 0, 20, -Math.PI / 2, -Math.asin(.6), false); sh.lineTo(-26.83, -24);
    sh.absarc(0, 0, 36, Math.atan2(-24, -26.83) + 2 * Math.PI, Math.atan2(26.83, 24) + 2 * Math.PI, false);
    hole.moveTo(-133, -8); hole.lineTo(-199, -8); hole.absarc(-199, 0, 8, -Math.PI / 2, -1.5 * Math.PI, true); hole.lineTo(-133, 8);
    hole.absarc(-133, 0, 8, Math.PI / 2, -Math.PI / 2, true); sh.holes.push(hole);                   // slot: pin centre from 133 to 199 out
    var ag = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false, curveSegments: 24 }); ag.translate(0, 0, -10);
    o.arm.add(new T.Mesh(ag, c.mat("arm")));                                                  // arm z -10..0
    P.at(P.cylZ(30, 2, c.mat("arm")), 0, 0, 1, o.arm);                                        // boss z 0..2, on the front face
    // belt round the small wheel and the big wheel, in the arm's frame; centre z -24, 12 wide
    o.belt = P.belt({ width: 12, thick: 3, material: c.mat("wheel") }); o.belt.position.z = -24; o.arm.add(o.belt);
    o.belt.set(0, L, K.R1, 0, 0, K.R2, false);
    o.marks = [0, 1, 2, 3].map(function () { var m = P.box(6, 4, 13, c.mat("wheel", "mark")); o.belt.add(m); return m; });
    // rod: pin through the slot z -12..13, collar z 2..12, socket z 3..11, rod r 6.5 down to 155 below the pin
    o.rod = new T.Group(); o.rod.position.x = K.XR; scene.add(o.rod);
    P.at(P.cylZ(7, 25, c.mat("rod", "mark")), 0, 0, .5, o.rod);
    P.at(P.cylZ(18, 10, c.mat("rod")), 0, 0, 7, o.rod);
    P.at(P.box(22, 46, 8, c.mat("rod")), 0, -37, 7, o.rod);                                   // y -60..-14
    P.at(P.cylY(6.5, 95, c.mat("rod")), 0, -107.5, 7, o.rod);                                 // y -155..-60
    // supports: guide x -121.8..-95.8, y -197..-173, z -6..20; bracket z -36..-6 to the plate; plate z -46..-36; base under it
    P.at(P.guideBlock({ w: 26, h: 24, d: 26, hole: 7, material: c.fixed }), K.XR, -185, 7, scene);
    P.at(P.box(20, 20, 30, c.fixed), K.XR, -185, -21, scene);
    P.at(P.box(370, 502, 10, c.fixed), 5, -11, -41, scene);                                   // plate x -180..190, y -262..240
    P.at(P.box(410, 12, 110, c.fixed), 5, -268, -36, scene);                                  // base y -274..-262, z -91..19
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, rp = K.NP * K.MD / 2, id = S.controls.shape, cv = o.sets[id] || o.sets.brown, k;
    for (k in o.sets) o.sets[k].mesh.visible = o.sets[k] === cv;
    if (o.cur !== cv) { o.cur = cv; o.prev = null; }
    o.al -= S.w * dt;                                        // the lopsided gear turns clockwise at a steady speed
    var q = this._solve(cv, o.al, o.prev);
    if (!q) return;
    if (o.prev == null) { o.sUn = q.s; o.thU = q.th; }        // start counting the rolling afresh
    else {
      var ds = ((q.s - o.prev) % cv.len + 1.5 * cv.len) % cv.len - cv.len / 2, dth = q.th - o.thU;
      o.sUn += ds; o.thU += dth - 2 * Math.PI * Math.round(dth / (2 * Math.PI));
    }
    o.prev = q.s;
    // rolling without slip: the small gear turns by the arc rolled over, plus the turn of the contact direction; half a tooth
    // offset so a gap meets each tooth of the lopsided gear
    var psi = o.thU + Math.PI + o.sUn / rp - Math.PI / K.NP;
    var be = Math.atan2(q.X - K.O[0], q.Y - K.O[1]);         // arm's lean, clockwise from upright
    o.gear.rotation.z = o.al;
    o.pin.position.set(q.X, q.Y, 0); o.pin.rotation.z = psi;
    o.arm.rotation.z = -be;
    // the belt: in the arm's frame both wheels stay put, so the big wheel turns R1 / R2 as far as the small one, relative to the arm
    var rel = psi + be;
    o.wheel.rotation.z = -be + rel * K.R1 / K.R2;
    var bs = rel * K.R1;
    o.marks.forEach(function (m, i) { o.belt.place(m, bs + i * o.belt.length / 4); });
    var h = (K.O[0] - K.XR) * Math.tan(be);                  // the pin stays on the rod's line, the slot turns with the arm
    o.rod.position.y = K.O[1] + h;
    // small gear's speed: how far it turns for a little turn of the lopsided gear, times the gear's speed
    var e = 1e-3, q2 = this._solve(cv, o.al - e, q.s), rpm = 0;
    if (q2 && S.w !== 0) {
      var d2 = ((q2.s - q.s) % cv.len + 1.5 * cv.len) % cv.len - cv.len / 2, t2 = q2.th - q.th;
      t2 -= 2 * Math.PI * Math.round(t2 / (2 * Math.PI));
      rpm = (t2 + d2 / rp) / e * S.rpm;
    }
    function f(v, u) { return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + u; }
    S.set("p", f(Math.round(rpm * 10) / 10, " rpm"));
    S.set("a", f(Math.round(be * 180 / Math.PI), "°"));
    S.set("r", f(Math.round(h), " mm"));
  }
});
