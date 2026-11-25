M507.define({
  number: 416,
  title: "Spring past the dead centre",
  lede: "A foot pedal, called a treadle, turns a wheel through a crank and a rod. Twice a turn the rod points straight at the shaft, and a push there does nothing. A spring pulls the crank away from those dead spots, so the treadle always starts.",
  alt: "A heavy wheel with a crank on its face. A long rod hangs from the crank pin down to a treadle that pivots near the floor. A cord runs from the crank pin to a spring barrel on a post to the left.",
  parts: [
    { key: "treadle", color: "#5E7387", name: "Treadle", note: "The foot pedal. It swings on a pin near the floor. The foot presses the long left end down." },
    { key: "wheel", color: "#C8873A", name: "Wheel and crank", note: "A heavy wheel with a crank on its face. Watch the red crank pin go round." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "Joins the crank pin to the short end of the treadle. It can only push or pull along its length." },
    { key: "spring", color: "#4FA58A", name: "Spring and cord", note: "A coil spring winds a barrel on the fixed post. A cord from the barrel always pulls the crank pin towards the post." }
  ],
  controls: [{ type: "range", id: "k", label: "Spring strength", min: 0, max: 10, step: 1, value: 5, unit: "", presets: [[1, "Weak"], [5, "As drawn"], [10, "Strong"]] }],
  speed: false,
  readouts: [{ id: "foot", label: "Foot" }, { id: "rpm", label: "Wheel" }, { id: "dc", label: "From dead spot" }],
  views: { "3d": [343, 164, 799], front: [-30, -40, 920], side: [900, -40, -30] },
  target: [-30, -40, 0],
  how: [
    "The foot presses the treadle for a few turns, then rests. Watch where the crank stops each time. The foot can only push down, so it drives the wheel for half of each turn. The heavy wheel carries it through the other half.",
    "When the crank pin is straight above or below the shaft, the rod pushes right at the shaft. That push cannot turn it at all. These are the dead spots. Without help, the weight of the treadle lets the crank settle in one of them, and then the foot is stuck. The cord pulls the pin to the left, so the crank comes to rest away from the dead spots.",
    "When the crank rests at the side, a push on the treadle starts it at once. Try a weak spring and watch it stop close to a dead spot, or on the wrong side, where the foot cannot start it. Then try the spring as drawn."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the spring as a circle round a post with a line to the crank pin; here it is a coil spring that winds a barrel, and the line is a cord. The frame, the floor, the weights of the parts, the rub in the bearings and the foot's push were made up. The foot is not shown; it presses only while the treadle can go down.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o = {};
    o.W = [76, 96]; o.r = 65; o.O = [-10, -154]; o.a = 94; o.Lf = 200; o.L = 260; o.A = [-88, 52]; o.Rc = 40;
    o.I = 250; o.cv = 140; o.tc = 60; o.F0 = 250; o.vmax = 600; o.Mw = -400; o.s0 = 10;
    o.th = 2.95; o.w = 0; o.ped = false; o.tp = 0; o.still = 0; o.push = false;
    // dead spots: where the treadle stops and turns back, so d(phi)/d(theta) = 0
    o.dead = [];
    var prev = null, i;
    for (i = 0; i <= 720; i++) {
      var th = i * Math.PI / 360, d = this.geo(th + 1e-4).phi - this.geo(th - 1e-4).phi;
      if (prev !== null && prev * d < 0) o.dead.push(th);
      prev = d;
    }
    // wheel: rim, web, boss and crank, all turning together
    o.wg = new T.Group(); o.wg.position.set(o.W[0], o.W[1], 0); scene.add(o.wg);
    var mw = c.mat("wheel"), sh = new T.Shape(), hole = new T.Path();
    sh.absarc(0, 0, 110, 0, 2 * Math.PI, false); hole.absarc(0, 0, 92, 0, 2 * Math.PI, true); sh.holes.push(hole);
    var rg = new T.ExtrudeGeometry(sh, { depth: 24, bevelEnabled: false, curveSegments: 64 }); rg.translate(0, 0, -12);
    o.wg.add(new T.Mesh(rg, mw));                                                   // rim z -12..12
    o.wg.add(P.cylZ(93, 6, mw));                                                     // web z -3..3
    P.at(P.cylZ(18, 10.5, mw), 0, 0, 8.25, o.wg);                                    // boss z 3..13.5
    o.crank = P.armPlate({ length: o.r, r0: 18, r1: 10, thick: 8, material: c.mat("wheel", "dark") }); P.at(o.crank, 0, 0, 17.5, o.wg);   // z 13.5..21.5
    P.at(P.cylZ(7, 51, mw), 0, 0, -4.5, o.wg);                                   // shaft z -30..21.5, ends on the frame face
    o.pin = P.at(P.cylZ(4, 27, c.mat("wheel", "mark")), o.r, 0, 35, o.wg);          // crank pin z 21.5..48.5
    // treadle, turning about its pin
    o.tg = new T.Group(); o.tg.position.set(o.O[0], o.O[1], 0); scene.add(o.tg);
    var mt = c.mat("treadle");
    P.at(P.box(o.Lf + o.a + 10, 10, 10, mt), (o.a + 10 - o.Lf) / 2, 0, 32, o.tg);   // bar x -200..104, z 27..37
    P.at(P.box(34, 4, 20, mt), -o.Lf + 17, 7, 32, o.tg);                             // foot plate on top of the long end, y 5..9
    P.at(P.cylZ(9, 10, mt), 0, 0, 32, o.tg);                                         // boss round the pivot, z 27..37
    P.at(P.cylZ(4, 13.5, c.mat("treadle", "dark")), 0, 0, 30.75, o.tg);              // pivot pin z 24..37.5, ends on the post face
    P.at(P.cylZ(4, 12, mt), o.a, 0, 43, o.tg);                                       // rod pin z 37..49
    // rod
    o.rod = P.armPlate({ length: o.L, r0: 8, r1: 8, thick: 6, material: c.mat("rod") }); P.at(o.rod, 0, 0, 42, scene);   // z 39..45
    // spring barrel on the fixed post, and the coil that winds it
    var ms = c.mat("spring");
    o.barrel = new T.Group(); o.barrel.position.set(o.A[0], o.A[1], 0); scene.add(o.barrel);
    P.at(P.cylZ(o.Rc, 14, ms), 0, 0, 30, o.barrel);                                  // barrel z 23..37, its ends inside the flanges
    P.at(P.cylZ(o.Rc + 5, 3, ms), 0, 0, 23.5, o.barrel); P.at(P.cylZ(o.Rc + 5, 3, ms), 0, 0, 36.5, o.barrel);   // flanges z 22..25 and 35..38
    P.at(P.box(o.Rc - 14, 4, 1, c.mat("spring", "dark")), (o.Rc + 14) / 2, 0, 39, o.barrel);   // stripe on the front, z 38.5..39.5
    P.at(P.hoop(o.Rc + 1.6, 1.6, c.mat("spring", "light")), 0, 0, 30, o.barrel);    // cord wound on the barrel
    o.coil = P.spring({ radius: 34, wire: 2.5, turns: 9, length: 48, material: ms });
    o.coil.rotation.y = -Math.PI / 2; o.coilG = new T.Group(); o.coilG.position.set(o.A[0], o.A[1], -27); o.coilG.add(o.coil); scene.add(o.coilG);   // coil z -27..21
    P.at(P.cylZ(10, 72, c.fixed), o.A[0], o.A[1], 6, scene);                          // post z -30..42, through the barrel
    o.cord = P.at(P.rod(1.6, c.mat("spring", "light")), 0, 0, 0, scene);
    // frame and floor (not part of the movement)
    P.at(P.box(360, 512, 10, c.fixed), 30, -26, -35, scene);                          // back frame x -150..210, y -282..230, z -40..-30
    P.at(P.box(20, 116, 12, c.fixed), o.O[0], -224, 18, scene);                       // treadle post y -282..-166, z 12..24
    P.at(P.box(30, 24, 12, c.fixed), o.O[0], -154, 18, scene);                        // its head round the pin, y -166..-142
    P.at(P.box(490, 10, 120, c.fixed), -15, -287, 0, scene);                          // floor y -292..-282
  },

  geo: function (th) {
    var o = this.o, B = [o.W[0] + o.r * Math.cos(th), o.W[1] + o.r * Math.sin(th)];
    var Tp = this.meetPt(o.O[0], o.O[1], o.a, B[0], B[1], o.L), phi = Math.atan2(Tp[1] - o.O[1], Tp[0] - o.O[0]);
    var dx = B[0] - o.A[0], dy = B[1] - o.A[1], d = Math.sqrt(dx * dx + dy * dy), q = Math.atan2(dy, dx) + Math.acos(o.Rc / d);
    return { B: B, T: Tp, phi: phi, q: q, s: Math.sqrt(d * d - o.Rc * o.Rc) - o.Rc * q, yf: o.O[1] - o.Lf * Math.sin(phi) };
  },
  meetPt: function (ax, ay, ra, bx, by, rb) {          // treadle end: on its circle round the pivot, rod length from the crank pin, right-hand meeting point
    var dx = bx - ax, dy = by - ay, d = Math.sqrt(dx * dx + dy * dy) || 1e-9, a = (ra * ra - rb * rb + d * d) / (2 * d);
    var h = Math.sqrt(Math.max(0, ra * ra - a * a)), ux = dx / d, uy = dy / d;
    return [ax + a * ux + h * uy, ay + a * uy - h * ux];
  },

  step: function (c, dt, S) {
    var o = this.o, self = this, k = .02 * S.controls.k, e = 1e-4;
    function U(th) { var g = self.geo(th); return .5 * k * (g.s - o.s0) * (g.s - o.s0) + o.Mw * Math.sin(g.phi); }   // spring and treadle weight
    var t = S.playing ? Math.min(dt, .1) : 0, h = .004;
    while (t > 1e-9) {
      var hh = Math.min(h, t); t -= hh;
      if (o.ped) { if ((o.tp += hh) > 6) { o.ped = false; o.still = 0; } }          // the foot presses for six seconds, then rests
      else { o.still = o.w === 0 ? o.still + hh : 0; if (o.still > 1.5) { o.ped = true; o.tp = 0; } }   // and starts again once the wheel has stood still
      var dyf = (this.geo(o.th + e).yf - this.geo(o.th - e).yf) / (2 * e), vf = -dyf * o.w;
      var Ff = (o.ped && dyf > 0) ? Math.max(0, o.F0 * (1 - Math.max(0, vf) / o.vmax)) : 0;   // a foot pushes less hard the faster it has to move
      o.push = Ff > 0;
      var tau = -(U(o.th + e) - U(o.th - e)) / (2 * e) - Ff * dyf - o.cv * o.w;
      if (!(o.w === 0 && Math.abs(tau) < o.tc)) { var w0 = o.w; o.w += (tau - o.tc * Math.sign(o.w || tau)) / o.I * hh; if (w0 * o.w < 0) o.w = 0; }
      o.th += o.w * hh;
    }
    var g = this.geo(o.th);
    o.wg.rotation.z = o.th;
    o.tg.rotation.z = g.phi;
    o.rod.position.set(g.B[0], g.B[1], 42); o.rod.rotation.z = Math.atan2(g.T[1] - g.B[1], g.T[0] - g.B[0]);
    var turn = -(g.s - 30) / o.Rc;                                                   // barrel turns as cord pays out
    o.barrel.rotation.z = turn; o.coil.rotation.x = turn / 2;
    o.cord.span(o.A[0] + o.Rc * Math.cos(g.q), o.A[1] + o.Rc * Math.sin(g.q), 30, g.B[0], g.B[1], 30);
    var deg = 180, i;
    for (i = 0; i < o.dead.length; i++) {
      var dd = Math.abs(((o.th - o.dead[i]) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) * 180 / Math.PI;
      deg = Math.min(deg, dd);
    }
    var rpm = Math.round(-o.w * 60 / (2 * Math.PI));
    S.set("foot", o.push ? "Pushing" : "Resting");
    S.set("rpm", (rpm < 0 ? "−" : "") + Math.abs(rpm) + " rpm");
    S.set("dc", Math.round(deg) + "°");
  }
});
