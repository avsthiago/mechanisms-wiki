M507.define({
  number: 357,
  title: "Gyroscope governor",
  lede: "A governor keeps a steam engine at a steady speed. This one uses a heavy spinning wheel in place of the usual flying balls. The faster the engine runs, the harder the wheel tries to stand upright, and that lifts a rod that closes the steam valve.",
  alt: "A heavy wheel leans inside a frame that turns about an upright shaft. The wheel's axle is in two pieces joined by a universal joint, with a small pinion on its outer end that rolls on a fixed ring of teeth. A bent rod from the axle lifts an upright rod, which works a lever and a spring on top of the stand.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Turning frame", note: "The engine turns it through the belt pulley and two bevel gears at the bottom. It carries the wheel and its axle round with it." },
    { key: "wheel", color: "#C8873A", name: "Heavy wheel", note: "Spins on its own axle while the frame carries it round. Watch the red stripe to see it spin, and watch how far the wheel leans." },
    { key: "axle", color: "#8E7AA8", name: "Axle and pinion", note: "The axle is in two pieces joined by a universal joint, so the wheel half can lean. The small gear on the other half is called a pinion." },
    { key: "ring", color: "#4FA58A", name: "Ring of teeth", note: "Does not move. The pinion rolls round on it, and that is what spins the wheel." },
    { key: "rods", color: "#D9B13B", name: "Rods, lever and spring", note: "A bent rod joins the end of the axle to the upright valve rod. The valve rod tips a lever on top, and the lever squeezes the spring." }
  ],
  speed: { min: 100, max: 320, value: 200, label: "Engine speed", unit: " rpm" },
  readouts: [{ id: "w", label: "Wheel" }, { id: "t", label: "Wheel lean" }, { id: "v", label: "Valve rod" }],
  views: { "3d": [330, 210, 1060], front: [0, -5, 1130], side: [1130, -5, 1] },
  target: [0, -15, 0],
  how: [
    "Watch the small gear on the left, called a pinion. The frame carries it round the ring of teeth, so it has to roll. That turns the axle, and the axle spins the heavy wheel. The wheel turns several times for each turn of the frame.",
    "The wheel is spinning and is being carried round at the same time. A spinning wheel that is swung round like this tries to tip over, so that it lies level and spins the same way as the frame. Here that pushes the leaning wheel towards upright. The spring pushes back through the lever and the rods. The faster the engine runs, the stronger the tipping push, and the more it squeezes the spring.",
    "Try the engine speed slider. Go from slow to fast and see the wheel stand up, the valve rod rise and the spring shorten. On a real engine the rising rod closes the steam valve a little, and the engine slows down again."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The drawing does not show clearly how the wheel's axle is hinged, so here it tips about the middle of the universal joint, in a small cradle. The cradle, the collar on the end of the axle, the shape of the lever and the plain square stand were made up, and so were all the sizes and the numbers of teeth. The lean is worked out from the spin of the wheel, its weight and the spring. The pieces other than the wheel are taken to weigh nothing, the spring is taken to push back evenly, and the joint is taken to pass the spin on evenly. The model runs 8 times slower than the speeds shown, so that you can follow it.",

  // Lengths in metres (one model unit is a millimetre), per kilogram of wheel. th is how far the wheel's axle slopes
  // up from level (negative: its outer end is low). W is the frame speed, k W the spin the pinion gives the wheel.
  //   I th'' = W^2 cos (rho^2 k + rho^2/2 sin) - W^2 sw sin (sw cos - xj) - g sw cos - K (th - ths) - rub
  K: 7, RHO: .07, SW: .054, XJ: .069, KS: 136.95, THS: -19.75 * Math.PI / 180, RUB: 40, LO: -22 * Math.PI / 180, HI: 2 * Math.PI / 180, SLOW: 8,
  acc: function (th, thd, W) {
    var r2 = this.RHO * this.RHO, I = r2 / 2 + this.SW * this.SW, s = Math.sin(th), co = Math.cos(th);
    return (W * W * co * (r2 * this.K + r2 / 2 * s) - W * W * this.SW * s * (this.SW * co - this.XJ) - 9.81 * this.SW * co - this.KS * (th - this.THS)) / I - this.RUB * thd;
  },
  rest: function (W) {                    // the lean at which everything balances at frame speed W
    var lo = this.LO, hi = this.HI, i, m;
    for (i = 0; i < 50; i++) { m = (lo + hi) / 2; if (this.acc(m, 0, W) > 0) lo = m; else hi = m; }
    return lo;
  },
  // where the rods are for a lean th: E end of the axle, yC top of the bent rod, T top of the valve rod, S and F lever ends
  rods: function (P, th) {
    var e = Math.cos(th), f = Math.sin(th), E = [-69 + 131 * e - 13 * f, 131 * f + 13 * e];
    var yC = E[1] + Math.sqrt(127 * 127 - E[0] * E[0]), T = yC + 80, S = P.meet(-115, 190, 115, 0, T, 18, 1);
    var d = Math.atan2(S[1] - 190, S[0] + 115);
    return { E: E, yC: yC, T: T, S: S, d: d, F: [-115 - 115 * Math.cos(d), 190 - 115 * Math.sin(d)] };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, FX = c.fixed, i;
    var mf = c.mat("frame"), mw = c.mat("wheel"), ma = c.mat("axle"), mg = c.mat("ring"), mr = c.mat("rods");
    var o = this.o = { phi: 0, th: this.rest(200 * Math.PI / 30), thd: 0 };
    o.v0 = this.rods(P, this.THS).yC;

    // ---- stand (does not move) ----
    P.at(P.cylY(215, 8, FX), 0, -230, 0, scene);                                   // base y -234..-226
    [-1, 1].forEach(function (s) {
      P.at(P.box(14, 362, 14, FX), s * 200, -45, 0, scene);                        // column x 193..207, y -226..136, z -7..7; stands on y -226
      P.at(P.box(195, 12, 14, FX), s * 109.5, 142, 0, scene);                      // top beam x 12..207, y 136..148; sits on the column top y 136
      P.at(P.box(181, 16, 14, FX), s * 102.5, -138, 0, scene);                     // lower beam x 12..193, y -146..-130; ends on the column face x 193
      P.at(P.box(33, 8, 14, FX), s * 176.5, -41, 0, scene);                        // bracket x 160..193, y -45..-37; the ring of teeth rests on y -37
    });
    P.at(P.guideBlock({ w: 24, h: 12, d: 14, hole: 4.6, material: FX }), 0, 142, 0, scene);     // x -12..12, y 136..148; the valve rod slides through
    P.at(P.guideBlock({ w: 24, h: 16, d: 14, hole: 6.6, material: FX }), 0, -138, 0, scene);    // x -12..12, y -146..-130; the frame's shaft turns in it
    P.at(P.box(12, 50, 12, FX), -115, 173, 0, scene);                              // lever post x -121..-109, y 148..198, z -6..6; on the beam top y 148
    P.at(P.box(39, 8, 28, FX), -226.5, 66, 7, scene);                              // spring seat x -246..-207, y 62..70, z -7..21; on the column face x -207
    var bb = P.bearingBlock({ bore: 5.6, outer: 11, width: 12, drop: 34, material: FX }); bb.rotation.y = Math.PI / 2;
    P.at(bb, 84, -192, 0, scene);                                                  // foot at y -226, on the base

    // ---- ring of teeth: 84 teeth, pitch circle radius 168 at y -24 ----
    var rp = [[156, -37], [180, -37], [180, -29], [156, -29], [156, -37]].map(function (q) { return new T.Vector2(q[0], q[1]); });
    scene.add(new T.Mesh(new T.LatheGeometry(rp, 96), mg));                        // y -37..-29
    for (i = 0; i < 84; i++) {
      var tg = new T.Group(); tg.rotation.y = (i + .5) * 2 * Math.PI / 84; scene.add(tg);     // a gap, not a tooth, under the pinion at the start
      P.at(P.box(14, 9.5, 5.6, mg), 168, -24.75, 0, tg);                           // tooth y -29.5..-20
    }

    // ---- drive: belt pulley, level shaft, two equal bevel gears with their cone points at (0, -192, 0) ----
    o.side = new T.Group(); o.side.rotation.z = -Math.PI / 2; o.side.position.y = -192; scene.add(o.side);   // local +Y points to world +X
    o.bevS = P.bevelGearCone({ radius: 24, teeth: 14, cone: 45, hub: 10, hubLength: 14, material: mf }); o.side.add(o.bevS);
    P.at(P.cylY(5, 118, mf), 0, 93, 0, o.bevS);                                    // level shaft x 34..152
    var pul = P.pulley({ radius: 30, width: 20, material: mf }); pul.rotation.x = Math.PI / 2; P.at(pul, 0, 124, 0, o.bevS);   // x 114..134

    // ---- turning frame ----
    o.fr = new T.Group(); scene.add(o.fr);
    var bevT = P.bevelGearCone({ radius: 24, teeth: 14, cone: 45, hub: 10, hubLength: 14, material: mf }); P.at(bevT, 0, -192, 0, o.fr);
    P.at(P.cylY(6, 50, mf), 0, -133, 0, o.fr);                                     // upright shaft y -158..-108
    P.at(P.box(266, 12, 16, mf), 0, -116, 0, o.fr);                                // bottom bar x -133..133, y -122..-110
    P.at(P.box(12, 122, 16, mf), -127, -49, 0, o.fr);                              // left arm y -110..12; the pinion half of the axle runs through it
    P.at(P.box(12, 60, 16, mf), 127, -80, 0, o.fr);                                // right arm, for balance
    P.at(P.box(13, 13, 58, mf), -127, 0, 0, o.fr);                                 // cross piece z -29..29
    [-1, 1].forEach(function (s) { P.at(P.box(62, 10, 8, mf), -90, 0, s * 25, o.fr); });   // two prongs x -121..-59 that hold the cradle pins

    // pinion half of the axle: turns about X, 7 times as fast as the frame
    var hold = new T.Group(); hold.rotation.y = Math.PI / 2; hold.position.x = -168; o.fr.add(hold);   // local Z points to world X
    o.pin = P.spurGear({ teeth: 12, module: 4, width: 14, material: ma }); hold.add(o.pin);            // x -175..-161
    P.at(P.cylZ(4, 91, ma), 0, 0, 31.5, o.pin);                                    // shaft x -182..-91
    o.fork1 = P.hookeFork({ back: 22, reach: 8, half: 9, tube: 2.2, material: ma }); P.at(o.fork1, -69, 0, 0, o.fr);

    // the part that tips: cradle and collar (they do not spin), then the wheel half of the axle
    o.tip = new T.Group(); o.tip.position.x = -69; o.fr.add(o.tip);                // local X runs along the wheel's axle
    [-1, 1].forEach(function (s) {
      P.at(P.box(32, 8, 4.5, mr), 10, 0, s * 15.75, o.tip);                        // cradle cheeks
      P.at(P.cylZ(3, 17, mr), 0, 0, s * 21.5, o.tip);                              // pins into the prongs
    });
    P.at(P.cylX(20, 4, mr), 26, 0, 0, o.tip); P.at(P.cylX(8, 14, mr), 33, 0, 0, o.tip);   // cradle plate and sleeve x 24..40
    P.at(P.cylX(8, 14, mr), 131, 0, 0, o.tip);                                     // loose collar x 124..138
    P.at(P.box(8, 12, 6, mr), 131, 11, 0, o.tip); P.at(P.cylZ(2.5, 12, mr), 131, 13, 0, o.tip);
    o.cross = P.hookeCross({ half: 9, head: 3, radius: 2, hub: 4, material: ma }); o.tip.add(o.cross);
    o.spin = new T.Group(); o.tip.add(o.spin);
    var f2 = P.hookeFork({ back: 22, reach: 8, half: 9, tube: 2.2, material: ma }); f2.rotation.y = Math.PI; o.spin.add(f2);
    P.at(P.cylX(4, 119, ma), 81.5, 0, 0, o.spin);                                  // shaft x 22..141
    P.at(P.cylX(62, 8, mw), 54, 0, 0, o.spin);                                     // wheel middle x 50..58
    var rim = P.hoop(75, 16, mw); rim.rotation.y = Math.PI / 2; P.at(rim, 54, 0, 0, o.spin);   // heavy rim
    P.at(P.cylX(12, 22, mw), 54, 0, 0, o.spin);
    [-1, 1].forEach(function (s) { P.at(P.box(1.6, 40, 8, c.mat("wheel", "mark")), 54 + s * 4.5, 36, 0, o.spin); });   // stripes stand .7 off each face

    // bent rod from the collar up to the valve rod (turns with the frame)
    var L = 127, B = 38, pts = [[0, 0], [.75 * B, .22 * L], [B, .5 * L], [.75 * B, .78 * L], [0, L]].map(function (q) { return new T.Vector3(q[0], q[1], 0); });
    o.bent = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 2.8, 10, false), mr); o.fr.add(o.bent);

    // ---- valve rod, link, lever and spring (do not turn) ----
    o.rod = new T.Group(); scene.add(o.rod);                                       // origin at the top of the bent rod
    o.rod.add(P.sphere(6, mr));                                                    // swivel
    P.at(P.cylY(4, 80, mr), 0, 40, 0, o.rod); P.at(P.sphere(5, mr), 0, 80, 0, o.rod);
    P.at(P.cylZ(2.5, 24, mr), 0, 80, 8, o.rod);                                    // pin z -4..20
    o.link = P.rod(2.2, mr); scene.add(o.link);
    o.lever = new T.Group(); o.lever.position.set(-115, 190, 10); scene.add(o.lever);
    o.lever.add(P.box(240, 7, 6, mr));                                             // z 7..13, clear of the post face z 6
    P.at(P.cylZ(2.5, 14, mr), 115, 0, 3, o.lever);                                 // link pin z 6..20
    P.at(P.sphere(5.5, mr), -115, 0, 0, o.lever);
    P.at(P.cylZ(3, 10, mr), -115, 190, 11, scene);                                 // lever pin z 6..16, from the post face
    o.spring = P.spring({ radius: 7, wire: 1.6, turns: 7, length: 110, material: mr }); o.spring.position.set(-230, 70, 10); scene.add(o.spring);
    o.x = new T.Vector3(1, 0, 0); o.z = new T.Vector3(0, 0, 1); o.p1 = new T.Vector3(); o.p2 = new T.Vector3(); o.u = new T.Vector3(); o.xl = new T.Vector3();
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, W = S.rpm * Math.PI / 30, i;
    if (S.playing && dt > 0) {
      var h = dt / this.SLOW, n = Math.ceil(h / .0004); h /= n;
      for (i = 0; i < n; i++) {
        o.thd += h * this.acc(o.th, o.thd, W); o.th += h * o.thd;
        if (o.th < this.LO) { o.th = this.LO; o.thd = 0; } else if (o.th > this.HI) { o.th = this.HI; o.thd = 0; }
      }
      o.phi += W * dt / this.SLOW;
    }
    var a = this.K * o.phi;
    o.fr.rotation.y = o.phi;
    o.bevS.rotation.y = -o.phi + o.bevS.pitch / 2;                                 // equal gears, half a tooth apart to mesh
    o.pin.rotation.z = a;                                                          // rolls on the ring: 84 teeth to 12
    o.tip.rotation.z = o.th;
    // universal joint: the pin of the first fork turns with the pinion; the second pin is square to it and to the wheel's axle
    o.p1.set(0, Math.cos(a), Math.sin(a));
    P.frame(o.fork1, o.x, o.p1);
    o.p1.applyAxisAngle(o.z, -o.th);                     // as seen from the tipping part
    o.p2.crossVectors(o.x, o.p1).normalize();
    P.frame(o.cross, o.p1, o.p2);
    P.frame(o.spin, o.x, o.p2);
    var r = this.rods(P, o.th);
    o.u.set(-r.E[0] / 127, (r.yC - r.E[1]) / 127, 0); o.xl.set(o.u.y, -o.u.x, 0);
    o.bent.position.set(r.E[0], r.E[1], 0); P.frame(o.bent, o.xl, o.u);
    o.rod.position.y = r.yC;
    o.link.span(0, r.T, 17, r.S[0], r.S[1], 17);
    o.lever.rotation.z = r.d;
    var dx = r.F[0] + 230, dy = r.F[1] - 70;
    o.spring.rotation.z = Math.atan2(dy, dx); o.spring.setLength(Math.sqrt(dx * dx + dy * dy) - 4);
    S.set("w", Math.round(this.K * S.rpm) + " rpm");
    S.set("t", Math.round(-o.th * 180 / Math.PI) + "°");
    S.set("v", Math.round(r.yC - o.v0) + " mm");
  }
});
