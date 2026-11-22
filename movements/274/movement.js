M507.define({
  number: 274,
  title: "Governor with curved guide arms",
  lede: "Two balls spin round with an upright spindle. Small wheels carry them up and out along two curved arms as the speed rises. The curve is shaped so the balls balance at almost one speed, so the governor holds the engine very close to that speed.",
  alt: "An upright spindle with a bar across its top. Two curved arms hang from the ends of the bar and sweep down and in to a block on the spindle, like the outline of a heart. A small wheel sits on each arm near the bottom. Each wheel carries a ball on a short arm and a long rod down to a sleeve on the spindle. A ring under the sleeve works a lever on a post.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Spindle and curved arms", note: "The engine turns the spindle. The bar on top and the two curved arms are fixed to it and turn with it." },
    { key: "wheels", color: "#C8873A", name: "Wheels", note: "Small wheels that roll along the top edge of the curved arms. The dark spoke shows them rolling." },
    { key: "balls", color: "#8E7AA8", name: "Balls", note: "Each ball hangs on a short arm from a wheel. Watch them climb the curve as the speed goes up." },
    { key: "rods", color: "#D9B13B", name: "Rods and sleeve", note: "The long rods join the wheels to a sleeve that slides on the spindle. When the wheels climb, the sleeve is pulled up." },
    { key: "lever", color: "#4FA58A", name: "Ring and lever", note: "The ring sits under the sleeve and does not turn. It lifts the lever, which would go to the steam valve." }
  ],
  speed: { min: 110, max: 130, value: 120, label: "Engine speed", unit: " rpm" },
  readouts: [{ id: "out", label: "Balls out" }, { id: "lift", label: "Sleeve up" }],
  views: { "3d": [430, 150, 760], front: [-15, 5, 880], side: [880, 5, 0] },
  target: [-15, 5, 0],
  distance: [400, 2400],
  how: [
    "The engine turns the spindle, and the balls spin round with it. Spinning things try to fly outwards. Here each ball can only move by rolling its wheel along a curved arm. To go further out, it must also climb.",
    "The arms are curved like a bowl, called a parabola. It gets steeper further out. That steepness grows just as fast as the outward pull does. So at one speed the balls balance anywhere on the curve. A little faster, and they climb all the way up. A little slower, and they roll all the way down. The rods pull the sleeve up with them, and the lever closes the steam valve.",
    "The model opens at the speed where the balls rest. Move the speed slider up by one step and watch them creep out. Then one more step. Then go back down a few steps. A tiny change in speed moves the sleeve its whole way."
  ],
  note: "This model is rebuilt from Brown's drawing. The floor, the bearing, the ring under the sleeve, the lever and its post were made up. The weights of the balls and the sleeve, the curve and the rub that slows the balls were chosen so the balls rest where Brown drew them at the opening speed. Stops keep the wheels from running off the curve. The weight of the sleeve makes the balance speed rise a little as the balls go out, so it is close to one speed but not exactly.",

  // a: curve y = a r^2 for the ball centres; DX, DY: ball centre from the wheel axle; Y0: axle height when the ball is out R0
  K: { a: .007008, DX: 41, DY: -64, Y0: 31.5, R0: 67.5, RMIN: 62, RMAX: 125, RW: 11, OFF: 16, RB: 34,
       XP: 28, YP: -124, m: 1, ms: .3, g: 9810, C: 4, PX: -170, A: 128, LK: 40, LUGX: -42 },
  ax: function (r) { return r - this.K.DX; },
  ay: function (r) { var K = this.K; return K.Y0 + K.a * (r * r - K.R0 * K.R0); },
  LF: function () { var K = this.K, dx = this.ax(K.R0) - K.XP; return Math.sqrt((K.Y0 - K.YP) * (K.Y0 - K.YP) + dx * dx); },
  ys: function (r) { var dx = this.ax(r) - this.K.XP; return this.ay(r) - Math.sqrt(this.lf * this.lf - dx * dx); },
  // length along the wheel's path from the spindle axis line, for rolling the wheels
  arcLen: function (r) { var u = 2 * this.K.a * r; return (u * Math.sqrt(1 + u * u) + Math.asinh(u)) / (4 * this.K.a); },
  lever: function (lugY) {   // lever angle that keeps the link to the ring lug at its fixed length
    var K = this.K, dx = K.LUGX - K.PX, dy = lugY - this.py, D = Math.sqrt(dx * dx + dy * dy);
    var a = (K.A * K.A - K.LK * K.LK + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, K.A * K.A - a * a)), ux = dx / D, uy = dy / D;
    return Math.atan2(a * uy + hh * ux, a * ux - hh * uy);   // the crossing with the lever end above the lug
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, k, s, i;
    var o = this.o = { a: 0, r: K.R0, rd: 0, ws: 2 * Math.PI * 2 };
    this.lf = this.LF(); this.ys0 = this.ys(K.R0);
    this.py = this.ys0 - 31 + K.LK;                                  // lever pivot: ring centre at rest plus the link
    var md = c.mat("drive"), mw = c.mat("wheels"), mr = c.mat("rods");
    o.spin = new T.Group(); scene.add(o.spin);
    P.at(P.cylY(7, 415, md), 0, 17.5, 0, o.spin);                     // spindle y -190..225, foot on the bearing top
    P.at(P.sphere(6, md), 0, 231, 0, o.spin);                         // knob at the top
    P.at(P.box(2, 40, 4, c.mat("drive", "dark")), 8, -80, 0, o.spin);  // stripe x 7..9
    P.at(P.cylY(12, 18, md), 0, 195, 0, o.spin);                      // hub of the top bar y 186..204
    P.at(P.box(20, 28, 16, md), 0, -6, 0, o.spin);                    // block x -10..10, y -20..8, z -8..8; arm ends meet it at x 9
    var bar = [];
    for (i = 0; i <= 24; i++) { var xb = -80 + 160 * i / 24; bar.push([xb, 172 + 23 * Math.pow(Math.cos(Math.PI * xb / 160), 2)]); }
    o.spin.add(P.flatStrip({ points: bar, thick: 10, width: 12, material: md }));
    // curved arms: under the wheel path, offset by the wheel radius plus half the arm
    var arm = [], r, sl, n;
    for (i = 0; i <= 40; i++) {
      r = 41 + (133 - 41) * i / 40; sl = 2 * K.a * r; n = Math.sqrt(1 + sl * sl);
      arm.push([this.ax(r) + K.OFF * sl / n, this.ay(r) - K.OFF / n]);
    }
    var E = arm[arm.length - 1], te = [1 / n, sl / n], Pp = [80, 172];
    var B1 = [E[0] + te[0] * 25, E[1] + te[1] * 25], B2 = [107, 158.5];
    for (i = 1; i <= 16; i++) {
      var t = i / 16, u = 1 - t;
      arm.push([u * u * u * E[0] + 3 * u * u * t * B1[0] + 3 * u * t * t * B2[0] + t * t * t * Pp[0], u * u * u * E[1] + 3 * u * u * t * B1[1] + 3 * u * t * t * B2[1] + t * t * t * Pp[1]]);
    }
    for (s = -1; s <= 1; s += 2) {
      o.spin.add(P.flatStrip({ points: arm.map(function (p) { return [s * p[0], p[1]]; }), thick: 10, width: 10, material: md }));
      P.at(P.cylZ(6, 16, md), s * 80, 172, 0, o.spin);                // pin z -8..8
      P.at(P.cylZ(3, 17, c.mat("drive", "dark")), s * 80, 172, 0, o.spin);   // dark centre 0.5 proud of each face
    }
    // wheels, balls, links, rods
    o.wheel = []; o.wg = []; o.ball = []; o.link = []; o.rod = [];
    for (k = 0; k < 2; k++) {
      var wg = new T.Group(); o.spin.add(wg); o.wg.push(wg);
      var w = new T.Group(); wg.add(w); o.wheel.push(w);
      w.add(P.cylZ(K.RW, 10, mw));                                     // wheel z -5..5, on the arm's edge
      P.at(P.box(K.RW * 2 - 4, 2.5, 1, c.mat("wheels", "dark")), 0, 0, 5.5, w);   // spoke z 5..6
      P.at(P.cylZ(3, 28, mr), 0, 0, 0, wg);                            // axle z -14..14
      var b = new T.Group(); o.spin.add(b); o.ball.push(b);
      P.at(P.sphere(K.RB, c.mat("balls")), 0, 0, 0, b);
      P.at(P.hoop(K.RB + .8, 1.4, c.mat("balls", "dark")), 0, 0, 0, b);
      o.link.push(P.rod(3, c.mat("balls"))); o.spin.add(o.link[k]);
      o.rod.push(P.rod(3, mr)); o.spin.add(o.rod[k]);
    }
    o.sleeve = new T.Group(); o.spin.add(o.sleeve);                    // local y 0 = height of the rod pins
    P.at(P.cylY(14, 54, mr), 0, -17, 0, o.sleeve);                     // tube y -44..10
    P.at(P.cylY(26, 6, mr), 0, -23, 0, o.sleeve);                      // flange y -26..-20
    P.at(P.cylY(20, 6, mr), 0, -47, 0, o.sleeve);                      // lower flange y -50..-44
    for (s = -1; s <= 1; s += 2) {
      P.at(P.box(22, 10, 8, mr), s * 21, 0, 10, o.sleeve);             // ear x 10..32, z 6..14
      P.at(P.cylZ(3.5, 12, mr), s * K.XP, 0, 10, o.sleeve);            // pin z 4..16
    }
    // ring that does not turn, lever, link
    o.ring = new T.Group(); scene.add(o.ring);                         // centre 31 under the rod pins: y -35..-27, 1 clear of both flanges
    o.ring.add(new T.Mesh(new T.LatheGeometry([new T.Vector2(15, -4), new T.Vector2(26, -4), new T.Vector2(26, 4), new T.Vector2(15, 4), new T.Vector2(15, -4)], 40), c.mat("lever")));
    P.at(P.box(22, 8, 8, c.mat("lever")), -35, 0, 0, o.ring);          // lug x -46..-24
    P.at(P.cylZ(3, 22, c.mat("lever")), K.LUGX, 0, 0, o.ring);          // lug pin z -11..11
    o.lev = new T.Group(); o.lev.position.set(K.PX, this.py, 0); scene.add(o.lev);
    P.at(P.box(K.A + 12, 10, 8, c.mat("lever")), K.A / 2, 0, 0, o.lev);  // lever z -4..4
    P.at(P.cylZ(3, 22, c.mat("lever")), K.A, 0, 0, o.lev);             // end pin z -11..11
    P.at(P.cylZ(5, 11, c.mat("lever")), 0, 0, .5, o.lev);              // pivot pin z -5..6, ends on the post face
    o.lk = P.rod(2.5, c.mat("lever")); scene.add(o.lk);
    // fixed
    P.at(P.box(260, 10, 120, c.fixed), -70, -220, 0, scene);           // floor x -200..60, y -225..-215, z -60..60
    P.at(P.box(40, 25, 40, c.fixed), 0, -202.5, 0, scene);             // bearing y -215..-190, on the floor
    var pTop = this.py + 15;
    P.at(P.box(24, pTop + 215, 35, c.fixed), K.PX, (pTop - 215) / 2, -22.5, scene);   // post y -215..pivot+15, z -40..-5
    this.place();
  },

  place: function () {
    var o = this.o, K = this.K, r = o.r, ax = this.ax(r), ay = this.ay(r), ys = this.ys(r), k, s;
    var roll = (this.arcLen(r) - this.arcLen(K.R0)) / K.RW;
    o.spin.rotation.y = o.a;
    for (k = 0; k < 2; k++) {
      s = k ? 1 : -1;
      o.wg[k].position.set(s * ax, ay, 0);
      o.wheel[k].rotation.z = -s * roll;
      o.ball[k].position.set(s * r, ay + K.DY, 0);
      o.link[k].span(s * ax, ay, -12, s * r, ay + K.DY, 0);
      o.rod[k].span(s * ax, ay, 10, s * K.XP, ys, 10);
    }
    o.sleeve.position.y = ys;
    var yr = ys - 31;
    o.ring.position.y = yr;
    var phi = this.lever(yr);
    o.lev.rotation.z = phi;
    o.lk.span(K.PX + K.A * Math.cos(phi), this.py + K.A * Math.sin(phi), 8, K.LUGX, yr, 8);
    return ys;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, n = 12, j, self = this;
    function ysd(r) { return (self.ys(r + 1e-3) - self.ys(r - 1e-3)) / 2e-3; }
    function M(r) { var d = ysd(r); return 2 * K.m * (1 + 4 * K.a * K.a * r * r) + K.ms * d * d; }
    if (S.playing && dt > 0) {
      var h = dt / n;
      o.ws += (S.w - o.ws) * Math.min(1, dt * 4);
      for (j = 0; j < n; j++) {
        var r = o.r, Mr = M(r), dM = (M(r + .01) - M(r - .01)) / .02;
        var Q = 2 * K.m * o.ws * o.ws * r - 4 * K.m * K.g * K.a * r - K.ms * K.g * ysd(r);
        o.rd += ((Q - .5 * dM * o.rd * o.rd) / Mr - K.C * o.rd) * h;
        o.r += o.rd * h;
        if (o.r < K.RMIN) { o.r = K.RMIN; if (o.rd < 0) o.rd = 0; }
        if (o.r > K.RMAX) { o.r = K.RMAX; if (o.rd > 0) o.rd = 0; }
      }
      o.a += o.ws * dt;
    }
    var ys = this.place();
    S.set("out", Math.round(o.r) + " mm");
    S.set("lift", Math.round(ys - this.ys0) + " mm");
  }
});
