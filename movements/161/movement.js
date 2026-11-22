M507.define({
  number: 161,
  title: "Centrifugal governor",
  lede: "A spinning upright shaft carries two heavy balls on arms. The faster it spins, the further the balls fly out and the higher the sleeve below them rises. The sleeve moves a lever that shuts the steam valve a little, so the engine keeps a steady speed.",
  alt: "A level shaft with a bevel gear at the top turns an upright spindle. Two arms hang from the top of the spindle, each with a heavy ball. Two links join the arms to a sleeve on the spindle. A lever under the sleeve reaches to the left and lifts a round plate in front of a pipe opening.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Gears and spindle", note: "The engine turns the level shaft. Two bevel gears pass the turning to the upright spindle." },
    { key: "arms", color: "#D9B13B", name: "Arms and links", note: "The arms hang from the top of the spindle. The links join the arms to the sleeve below." },
    { key: "balls", color: "#8E7AA8", name: "Balls", note: "Heavy balls on the arms. Watch them swing outwards as the speed goes up." },
    { key: "sleeve", color: "#C8873A", name: "Sleeve and lever", note: "The sleeve slides up the spindle when the balls fly out. It lifts a lever that does not turn." },
    { key: "valve", color: "#4FA58A", name: "Valve", note: "A round plate slides in front of the steam pipe. The higher it goes, the less steam gets through." }
  ],
  controls: [{ id: "load", label: "Weight of the sleeve", value: "mid", options: [["light", "Light"], ["mid", "Medium"], ["heavy", "Heavy"]] }],
  speed: { min: 35, max: 65, value: 55, label: "Engine speed", unit: " rpm" },
  readouts: [{ id: "ang", label: "Arm angle" }, { id: "lift", label: "Sleeve up" }, { id: "open", label: "Valve open" }],
  views: { "3d": [450, 40, 1700], front: [-60, -150, 1750], side: [1300, -150, -60] },
  target: [-130, -70, 0],
  distance: [700, 3400],
  how: [
    "The engine turns a level shaft. Two bevel gears turn the upright spindle. The balls spin round with it. Spinning things try to fly outwards, so the balls swing away from the spindle and pull the arms up.",
    "The links join the arms to a sleeve that slides on the spindle. When the balls swing out, the sleeve rises. A lever under it lifts a round plate in front of the steam pipe. Less steam reaches the engine, so it slows down. When it slows, the balls drop, the plate falls, and more steam flows.",
    "Move the speed slider from slow to fast and watch the arm angle and the valve. Then try a heavy sleeve. It holds the balls down, so they need more speed to rise."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the bevel gears face on, with the toothed face towards the viewer. Here the toothed face turns away so you can see the gears mesh. The stand, the wall, the bearings, the lever on its post, the link to the sleeve, the pipe and the round plate were made up. The ball weight, the arm lengths and the pull of gravity are chosen to look right. The sleeve weight choices were added for comparison.",

  K: { d: 30, L1: 193, L2: 315, L3: 197, e: 14, R: 50, g: 9810, C: 6, TMAX: 1.0, TH0: 0.5,
       PX: -460, A: 360, B: 120, LK: 60, ROD: 90, LUGX: -100, XP: -340, SLOT: 40, RB: 34, RP: 38 },
  ys: function (th) { var K = this.K, x = K.d + K.L1 * Math.sin(th) - K.e; return -K.L1 * Math.cos(th) - Math.sqrt(K.L3 * K.L3 - x * x); },
  accel: function (th, w, ms) {
    var K = this.K, h = 1e-4, dys = (this.ys(th + h) - this.ys(th - h)) / (2 * h), s = Math.sin(th), cs = Math.cos(th);
    return (w * w * (K.d + K.L2 * s) * K.L2 * cs - K.g * K.L2 * s - ms / 2 * K.g * dys) / (K.L2 * K.L2);
  },
  // Lever angle that keeps the link to the sleeve lug at its fixed length.
  lever: function (lugY) {
    var K = this.K, dx = K.LUGX - K.PX, dy = lugY - this.py, D = Math.sqrt(dx * dx + dy * dy);
    var a = (K.A * K.A - K.LK * K.LK + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, K.A * K.A - a * a)), ux = dx / D, uy = dy / D;
    return Math.atan2(a * uy - hh * ux, a * ux + hh * uy);      // of the two crossings, the one with the link hanging below the lug
  },
  plateY: function (phi, ph) {
    var K = this.K, rx = K.PX + K.B * Math.cos(phi), ry = this.py + K.B * Math.sin(phi), dx = rx - K.XP;
    return ry - Math.sqrt(K.ROD * K.ROD - dx * dx);
  },
  openFrac: function (s) {       // share of the round opening left uncovered by the plate, s = height of the plate centre above the opening centre
    var K = this.K, a = K.RB, b = K.RP, d = Math.abs(s), ov;
    if (d >= a + b) ov = 0;
    else if (d <= b - a) ov = Math.PI * a * a;
    else {
      var d1 = (d * d + a * a - b * b) / (2 * d), d2 = d - d1;
      ov = a * a * Math.acos(d1 / a) - d1 * Math.sqrt(a * a - d1 * d1) + b * b * Math.acos(d2 / b) - d2 * Math.sqrt(b * b - d2 * d2);
    }
    return 1 - ov / (Math.PI * a * a);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, k, s;
    var o = this.o = { a: 0, th: .55, pd: 0, ws: 5.76, phi: 0 };
    var YA = 265.95;                                    // apex of both bevel gears
    this.py = this.ys(K.TH0) - 29 - K.LK;                      // pivot height of the lever = the lug at the start, less the link
    this.ys0 = this.ys(0); this.phi0 = 0;
    this.plate0 = this.plateY(0);
    this.pipeY = this.plate0 + K.SLOT;
    // turning group: spindle, head, arms, balls, links, sleeve, spindle gear
    o.spin = new T.Group(); scene.add(o.spin);
    var mD = c.mat("drive");
    P.at(P.cylY(9, 600, mD), 0, -150, 0, o.spin);                                    // spindle y -450..150, ends on the lower bearing top (-450) and the upper bearing underside (150)
    P.at(P.box(2, 40, 5, c.mat("drive", "dark")), 10, 100, 0, o.spin);               // stripe x 9..11
    P.at(P.box(90, 34, 30, mD), 0, 0, 0, o.spin);                                    // head x -45..45, y -17..17, z -15..15
    for (s = -1; s <= 1; s += 2) P.at(P.cylZ(7, 34, c.mat("arms")), s * K.d, 0, 0, o.spin);   // top pins z -17..17
    var gs = new T.Group(); gs.rotation.x = Math.PI; gs.position.set(0, YA, 0); o.spin.add(gs);   // gear body points down
    var g1 = P.bevelGearCone({ radius: 60, teeth: 16, cone: 45, hubLength: 20, material: mD }); gs.add(g1);   // back of hub at y 181, 1 above the bearing
    o.sleeve = P.at(P.cylY(20, 36, c.mat("sleeve")), 0, 0, 0, o.spin);
    o.arm = []; o.link = []; o.jp = []; o.ball = [];
    for (k = 0; k < 2; k++) {
      o.arm.push(P.rod(5, c.mat("arms")));  o.spin.add(o.arm[k]);
      o.link.push(P.rod(5, c.mat("arms"))); o.spin.add(o.link[k]);
      o.jp.push(P.at(P.cylZ(7, 30, c.mat("arms")), 0, 0, 0, o.spin));               // joint pin z -10..20 about; arm z -5..5, link z 6.5..16.5
      var b = new T.Group(); o.spin.add(b); o.ball.push(b);
      P.at(P.sphere(K.R, c.mat("balls")), 0, 0, 0, b);
      P.at(P.hoop(K.R + .8, 1.4, c.mat("balls", "dark")), 0, 0, 0, b);               // band 0.5 off the ball
    }
    // level shaft and gear
    var out = new T.Group(); out.rotation.x = -Math.PI / 2; out.position.set(0, YA, 0); scene.add(out);   // local +Y points to -Z
    o.g2 = P.bevelGearCone({ radius: 60, teeth: 16, cone: 45, material: c.mat("drive") }); out.add(o.g2);   // hub end at z -108.95
    P.at(P.cylY(12, 26.05, mD), 0, o.g2.backY + 13.025, 0, o.g2);                    // shaft z -108.95..-135, ends on the wall
    P.at(P.box(2, 14, 6, c.mat("drive", "dark")), 0, o.g2.backY + 10, 0, o.g2).position.x = 12.8;   // stripe on the shaft
    // lever (does not turn), collar, link, rod, plate
    o.collar = new T.Group(); scene.add(o.collar);
    P.at(P.cylY(26, 20, c.mat("sleeve")), 0, 0, 0, o.collar);                         // ring, rides under the sleeve
    P.at(P.box(86, 10, 10, c.mat("sleeve")), -57, 0, 0, o.collar);                    // lug x -100..-14
    o.lev = new T.Group(); o.lev.position.set(K.PX, this.py, 0); scene.add(o.lev);
    P.at(P.box(K.A + 12, 12, 10, c.mat("sleeve")), K.A / 2, 0, 0, o.lev);             // lever from the pivot, z -5..5
    P.at(P.cylZ(5, 14, c.mat("sleeve")), K.A, 0, 0, o.lev);
    P.at(P.cylZ(6, 12, c.mat("sleeve")), 0, 0, -4, o.lev);                            // pivot pin z -10..2, ends on the post face at z -10
    o.lrod = P.rod(4, c.mat("sleeve")); scene.add(o.lrod);
    o.vrod = P.rod(4, c.mat("valve")); scene.add(o.vrod);
    o.plate = new T.Group(); scene.add(o.plate);
    P.at(P.cylZ(K.RP, 8, c.mat("valve")), 0, 0, 0, o.plate);                          // plate z -4..4
    P.at(P.box(30, 6, 1, c.mat("valve", "dark")), 0, 0, 4.5, o.plate);                // stripe z 4..5
    // fixed: floor, wall, bearings, bars, lever post, valve body
    P.at(P.box(600, 10, 190, c.fixed), -240, -645, -50, scene);                      // floor x -540..60, y -650..-640, z -145..45
    P.at(P.box(40, 985, 10, c.fixed), 0, -147.5, -140, scene);                       // back post x -20..20, y -640..345, z -145..-135, on the floor
    P.at(P.box(240, 260, 10, c.fixed), -380, -510, -140, scene);                     // valve panel x -500..-260, y -640..-380, z -145..-135, on the floor
    P.at(P.box(56, 30, 56, c.fixed), 0, 165, 0, scene);                               // upper bearing y 150..180
    P.at(P.box(56, 30, 56, c.fixed), 0, -465, 0, scene);                              // lower bearing y -480..-450
    P.at(P.box(40, 30, 107, c.fixed), 0, 165, -81.5, scene);                          // bar z -135..-28, y 150..180
    P.at(P.box(40, 30, 107, c.fixed), 0, -465, -81.5, scene);                         // bar y -480..-450
    P.at(P.box(30, 80, 125, c.fixed), K.PX, this.py, -72.5, scene);                   // lever post x -475..-445, z -135..-10
    P.at(P.cylZ(60, 127, c.fixed), K.XP, this.pipeY, -71.5, scene);                   // valve body z -135..-8
    P.at(P.cylZ(K.RB, 2, c.mat("valve", "dark")), K.XP, this.pipeY, -7, scene);       // pipe opening, z -8..-6
    this.place(0, 0);
  },

  place: function (th, a) {
    var o = this.o, K = this.K, s, sn = Math.sin(th), cs = Math.cos(th), ys = this.ys(th);
    o.spin.rotation.y = a;
    o.sleeve.position.y = ys;
    for (var k = 0; k < 2; k++) {
      s = k ? 1 : -1;
      var jx = s * (K.d + K.L1 * sn), jy = -K.L1 * cs;
      o.arm[k].span(s * K.d, 0, 0, s * (K.d + K.L2 * sn), -K.L2 * cs, 0);
      o.link[k].span(jx, jy, 11.5, s * K.e, ys, 11.5);
      o.jp[k].position.set(jx, jy, 5);
      o.ball[k].position.set(s * (K.d + K.L2 * sn), -K.L2 * cs, 0);
    }
    o.collar.position.set(0, ys - 29, 0);                       // ring top at ys - 19, 1 below the sleeve
    var lugY = ys - 29;
    var phi = this.lever(lugY);
    o.lev.rotation.z = phi;
    o.lrod.span(K.PX + K.A * Math.cos(phi), this.py + K.A * Math.sin(phi), 0, K.LUGX, lugY, 0);
    var rx = K.PX + K.B * Math.cos(phi), ry = this.py + K.B * Math.sin(phi), py2 = this.plateY(phi);
    o.vrod.span(rx, ry, 0, K.XP, py2, 0);
    o.plate.position.set(K.XP, py2, 0);
    return { ys: ys, open: this.openFrac(py2 - this.pipeY) };
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, ms = { light: .02, mid: .1, heavy: .5 }[S.controls.load] || .1, n = 12, j;
    if (S.playing && dt > 0) {
      var h = dt / n;
      o.ws += (S.w - o.ws) * Math.min(1, dt * 4);
      for (j = 0; j < n; j++) {
        o.pd += (this.accel(o.th, o.ws, ms) - K.C * o.pd) * h;
        o.th += o.pd * h;
        if (o.th < 0) { o.th = 0; if (o.pd < 0) o.pd = 0; }
        if (o.th > K.TMAX) { o.th = K.TMAX; if (o.pd > 0) o.pd = 0; }
      }
      o.a += o.ws * dt;
      o.g2.rotation.y = o.a + o.g2.pitch / 2;
    }
    var r = this.place(o.th, o.a);
    S.set("ang", Math.round(o.th * 180 / Math.PI) + "°");
    S.set("lift", (r.ys - this.ys0).toFixed(0) + " mm");
    S.set("open", Math.round(r.open * 100) + "%");
  }
});
