M507.define({
  number: 411,
  title: "Self-recording level",
  lede: "A surveyor pushes this cart over the ground, and it draws a record of every slope on a roll of paper. A hanging pendulum stays upright while the cart tips, and the pencil on it moves across the paper.",
  alt: "A cart with one spoked wheel at each end and a tall arched frame between them, standing on hilly ground. A ruled paper drum lies across the middle, turned through a screw and gear from the left wheel. A pendulum hangs from the top of the arch with a pencil pressing on the drum.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Cart", note: "The arched frame and handle. The two wheels sit at the corners of a triangle, so the cart tips exactly as much as the ground between them." },
    { key: "wheels", color: "#C8873A", name: "Wheels", note: "One wheel at each end. Each wheel goes once round in the distance between the two wheels." },
    { key: "gear", color: "#8E7AA8", name: "Screw and gear", note: "A screw on the left axle turns a gear on the drum shaft. Each turn of the wheel moves the gear on by one tooth, so the drum turns slowly." },
    { key: "drum", color: "#E8E2D0", name: "Paper drum", note: "Carries ruled paper. It turns as the cart moves, so the paper moves under the pencil." },
    { key: "pend", color: "#4FA58A", name: "Pendulum", note: "Hangs from the top of the arch and always points straight down. Watch the red pencil point on it." }
  ],
  controls: [{ id: "g", label: "Ground", value: "hilly", options: [["level", "Level"], ["gentle", "Gentle"], ["hilly", "Hilly"]] }],
  readouts: [{ id: "s", label: "Slope" }, { id: "t", label: "Rolled" }],
  speed: { min: 1, max: 30, value: 10, label: "Wheel speed", unit: " rpm" },
  views: { "3d": [318, 229, 662], front: [0, 60, 640], side: [640, 60, 40] },
  target: [0, 55, -20],
  how: [
    "The cart rolls over the ground and tips up and down with it. The pendulum hangs from the top of the arch and keeps pointing straight down. So when the cart tips, the pencil on the pendulum slides across the drum, to the left going uphill and to the right going downhill.",
    "The drum is turned by the left wheel, so the paper moves along as the cart moves. The pencil line goes across the drum as far as the ground is steep. Along the drum, it keeps step with the distance travelled. The line on the paper is a record of the slope at every point of the way.",
    "Try Level, then Gentle, then Hilly. On level ground the pencil stays on the middle line. On hilly ground the line swings further out on the steep parts."
  ],
  note: "This model is rebuilt from Brown's description and drawing. The screw and gear that turn the drum, the brackets that hold it, the sizes and the shape of the ground were made up. The pendulum is shown hanging still; a real one would swing a little after each bump. Brown's drum can also slide sideways to start a fresh strip of paper; here the old line is simply wiped after each turn of the drum.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var R = 58, L = 2 * Math.PI * R;                                         // wheels go once round in the distance between them
    var o = this.o = { R: R, L: L, Lp: 2400, A: -1, x1: 300, x2: 0, rho1: 0, rho2: 0, turns: 0, beta0: 0, LP: 125 };
    var mf = c.mat("frame"), mw = c.mat("wheels"), mg = c.mat("gear"), md = c.mat("drum"), mp = c.mat("pend");
    o.cart = new T.Group(); scene.add(o.cart);                              // origin midway between the axles; axles at x -182.2 and 182.2

    // wheels z -4..4, axles through them to the frame at z 11..21
    o.wl = P.pulley({ radius: R, width: 8, rim: 6, spokes: 8, hub: 10, material: mw }); P.at(o.wl, -L / 2, 0, 0, o.cart);
    o.wr = P.pulley({ radius: R, width: 8, rim: 6, spokes: 8, hub: 10, material: mw }); P.at(o.wr, L / 2, 0, 0, o.cart);
    o.wl.spokes[0].material = c.mat("wheels", "mark"); o.wr.spokes[0].material = c.mat("wheels", "mark");
    P.at(P.cylZ(5, 94.5, mw), 0, 0, -26.75, o.wl);                             // left axle z -74..21, carries the screw
    P.at(P.cylZ(5, 26.5, mw), 0, 0, 7.25, o.wr);                               // right axle z -6..21

    // frame at z 16 (tube 5 thick, z 11..21): arch over the top, sagging bar underneath, handle out to the left
    function tube(pts, r) { var cv = new T.CatmullRomCurve3(pts.map(function (q) { return new T.Vector3(q[0], q[1], 16); })); return P.mesh(new T.TubeGeometry(cv, 120, r, 10, false), mf); }
    var arch = []; for (i = 0; i <= 40; i++) { var t = Math.PI * i / 40; arch.push([L / 2 * Math.cos(t), 175 * Math.sin(t)]); }
    o.cart.add(tube(arch, 5));
    o.cart.add(tube([[-L / 2, 0], [-130, 12], [-70, -6], [0, -18], [70, -6], [130, 12], [L / 2, 0]], 4));
    o.cart.add(tube([[127, 125], [0, 115], [-130, 104], [-245, 94]], 4.5));  // handle, held at the left end
    P.at(P.cylZ(8, 50, mf), -250, 93, 16, o.cart);                          // grip
    [-1, 1].forEach(function (s) { P.at(P.cylZ(10, 10, mf), s * L / 2, 0, 16, o.cart); });   // axle bosses z 11..21
    // brackets for the drum shaft (y 42..58), from the arch back to z -62
    P.at(P.box(18, 16, 73, mf), 171, 50, -25.5, o.cart);                    // x 162..180, z -62..11; the shaft ends on its face x 162
    P.at(P.box(18, 16, 73, mf), -161, 50, -25.5, o.cart);                   // x -170..-152, the shaft runs through it

    // drum on its shaft at y 50, z -52, turned by the gear at x -182.2
    o.drum = new T.Group(); o.drum.position.set(0, 50, -52); o.cart.add(o.drum);
    P.at(P.cylX(5, 350, mg), -13, 0, 0, o.drum);                            // shaft x -188..162
    P.at(P.cylX(40, 160, md), 0, 0, 0, o.drum);                             // paper x -80..80, r 40
    [-1, 1].forEach(function (s) { P.at(P.cylX(43, 3, md), s * 81.5, 0, 0, o.drum); });   // end rims x 80..83
    for (i = -3; i <= 3; i++) { var h = P.hoop(40.6, i ? .4 : .6, c.mat("drum", i ? "light" : "dark")); h.rotation.y = Math.PI / 2; P.at(h, i * 22, 0, 0, o.drum); }   // ruled rings, the middle one dark
    for (i = 0; i < 6; i++) { var a = i * Math.PI / 3, ln = P.box(158, .8, .8, c.mat("drum", "light")); P.at(ln, 0, 40.6 * Math.sin(a), 40.6 * Math.cos(a), o.drum); }   // lines along the paper
    o.wg = new T.Group(); o.wg.position.set(-L / 2, 0, 0); o.wg.rotation.y = Math.PI / 2; o.drum.add(o.wg);
    o.gearW = P.spurGear({ teeth: 12, module: 6, width: 12, material: mg }); o.wg.add(o.gearW);   // x -188..-176, pitch r 36
    o.st = o.gearW.pitch;
    o.trail = P.trail({ color: c.ink, max: 2400, step: .6 }); o.drum.add(o.trail);

    // screw on the left axle at z -52 (z -72..-32), pitch r 14, under the gear (centres 50 apart)
    o.wormG = new T.Group(); o.wormG.position.set(-L / 2, 0, -52); o.wormG.rotation.y = -Math.PI / 2; o.cart.add(o.wormG);
    o.worm = P.worm({ radius: 14, pitch: Math.PI * 6, length: 40, material: mg }); o.wormG.add(o.worm);

    // pendulum from a pin at the top of the arch (z 0..11): rod z -6..0, pencil at 125 below the pin, bob at the foot
    o.pend = new T.Group(); o.pend.position.set(0, 175, 0); o.cart.add(o.pend);
    P.at(P.cylZ(4, 11, mf), 0, 175, 5.5, o.cart);                           // pin z 0..11
    P.at(P.box(7, 170, 6, mp), 0, -80, -3, o.pend);                         // rod y 5..-165 below the pin
    P.at(P.cylZ(9, 7, mp), 0, 0, -3.5, o.pend);                             // eye round the pin z -7..0
    P.at(P.box(28, 30, 10, mp), 0, -180, -3, o.pend);                       // bob y -195..-165 (cart y -20..10)
    P.at(P.cylZ(3, 5, mp), 0, -o.LP, -8.5, o.pend);                         // pencil body z -11..-6
    var tip = P.mesh(new T.ConeGeometry(3, 1.2, 12), c.mat("pend", "mark")); tip.rotation.x = -Math.PI / 2; P.at(tip, 0, -o.LP, -11.4, o.pend);   // point z -12..-10.8, on the paper

    o.groundG = new T.Group(); scene.add(o.groundG); o.groundM = null;
  },

  // ground height and its slope (amplitude A of a repeating made-up profile, period Lp)
  g: function (x) { var o = this.o, k = 2 * Math.PI / o.Lp; return o.A * (50 * Math.sin(k * x) + 15 * Math.sin(2 * k * x + 1) + 5 * Math.sin(3 * k * x + 2)); },
  gd: function (x) { var o = this.o, k = 2 * Math.PI / o.Lp; return o.A * k * (50 * Math.cos(k * x) + 30 * Math.cos(2 * k * x + 1) + 15 * Math.cos(3 * k * x + 2)); },
  centre: function (x) { var s = this.gd(x), q = Math.sqrt(1 + s * s); return [x - this.o.R * s / q, this.g(x) + this.o.R / q]; },   // wheel centre when touching at x
  front: function (x1) {                                                    // contact point of the front wheel: centres L apart
    var o = this.o, c1 = this.centre(x1), lo = x1 + .6 * o.L, hi = x1 + 1.4 * o.L;
    for (var n = 0; n < 50; n++) { var m = (lo + hi) / 2, c2 = this.centre(m); if (Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) < o.L) lo = m; else hi = m; }
    return (lo + hi) / 2;
  },
  speedAt: function (x) { var a = this.centre(x - .5), b = this.centre(x + .5); return Math.hypot(b[0] - a[0], b[1] - a[1]); },   // centre path per unit x

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, A = { level: 0, gentle: .5, hilly: 1 }[S.controls.g];
    if (A !== o.A) {                                                        // new ground: rebuild its block and wipe the paper
      o.A = A;
      if (o.groundM) { o.groundG.remove(o.groundM); o.groundM.geometry.dispose(); }
      var sh = new T.Shape(), x0 = -700, x1 = o.Lp + 700, n = Math.ceil((x1 - x0) / 6);
      sh.moveTo(x0, -170);
      for (var i = 0; i <= n; i++) { var x = x0 + (x1 - x0) * i / n; sh.lineTo(x, this.g(x)); }
      sh.lineTo(x1, -170); sh.closePath();
      var geo = new T.ExtrudeGeometry(sh, { depth: 150, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, -105);   // z -105..45
      o.groundM = c.P.mesh(geo, c.fixed); o.groundG.add(o.groundM);
      o.x2 = this.front(o.x1); o.trail.clear(); o.beta0 = o.rho1 / 12;
    }
    // roll: the left wheel's centre moves R * w * dt along its path
    var w = S.w;
    o.x1 += w * o.R * dt / this.speedAt(o.x1);
    o.rho1 -= w * dt;
    var x2 = this.front(o.x1);
    o.rho2 -= (this.speedAt(x2) * (x2 - o.x2)) / o.R; o.x2 = x2;
    if (o.x1 > o.Lp) { o.x1 -= o.Lp; o.x2 -= o.Lp; }
    var c1 = this.centre(o.x1), c2 = this.centre(o.x2), mx = (c1[0] + c2[0]) / 2, my = (c1[1] + c2[1]) / 2;
    var tilt = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]);
    o.groundG.position.set(-mx, -my, 0);
    o.cart.rotation.z = tilt;
    o.wl.rotation.z = o.rho1; o.wr.rotation.z = o.rho2;
    o.worm.rotation.x = Math.PI + o.rho1;                                   // the screw turns with the left wheel
    var beta = o.rho1 / 12;                                                 // one tooth of the gear per turn of the screw
    o.drum.rotation.x = beta;
    o.gearW.rotation.z = -Math.PI / 2 - o.st / 2;                           // fixed on the shaft, set so a gap sits on the screw's thread
    o.pend.rotation.z = -tilt;                                              // hangs straight down
    // pencil mark on the paper: across the drum by the pendulum's lean, round it by the drum's turn
    var xp = -o.LP * Math.sin(tilt), rr = 40.75;
    if (Math.abs(beta - o.beta0) >= 2 * Math.PI) { o.trail.clear(); o.beta0 = beta; }
    o.trail.push(xp, rr * Math.sin(beta), rr * Math.cos(beta));

    var dg = Math.round(tilt * 1800 / Math.PI) / 10;
    S.set("s", (dg < 0 ? "−" + -dg : dg) + "°");
    S.set("t", (-o.rho1 / (2 * Math.PI)).toFixed(1) + " turns");
  }
});
