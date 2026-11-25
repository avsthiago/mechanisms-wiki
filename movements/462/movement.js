M507.define({
  number: 462,
  title: "Chain pump",
  lede: "An endless chain carries a row of discs up through a pipe. Each disc fits the pipe, so it lifts the water resting on it like a small bucket. At the top the water spills out. Turning the upper wheel keeps the chain going round.",
  alt: "Two wheels with eight arms each, one above the other, with an endless chain of round discs running over both. The lower wheel sits in a tank of water. The left side of the chain rises through an upright pipe, drawn cut open, to a spout at the top that pours into a trough on the left. A crank turns the upper wheel.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Wheels and crank", note: "The upper wheel is turned by the crank. The forked ends of its arms catch the pins of the chain and pull it round. The lower wheel only guides the chain under the water." },
    { key: "disc", color: "#C8873A", name: "Discs", note: "Round plates fixed on the chain. Each one fits the inside of the pipe closely. Watch the red one go round." },
    { key: "chain", color: "#D9B13B", name: "Chain", note: "Links joined by pins into one endless loop. It goes up through the pipe and comes down outside it." },
    { key: "pipe", color: "#4FA58A", name: "Pipe and spout", note: "A pipe that stands still with its bottom end under water. The front half is cut away so you can see inside. The spout at the top leads the water to the trough." }
  ],
  closed: { label: "Pipe" },
  readouts: [{ id: "rpm", label: "Wheel" }, { id: "v", label: "Chain" }],
  views: { "3d": [275, 176, 715], front: [-58, -6, 820], side: [820, -6, 0] },
  target: [-58, -6, 0],
  how: [
    "Look at the chain. It is one endless loop that runs over a wheel at the top and a wheel at the bottom. Round discs are fixed on it, all the same distance apart. The left side goes up through the green pipe.",
    "Each disc fits the pipe closely, so water cannot run back past it. The water between two discs is trapped and rides up with them, shown as blue dots. When a disc comes out of the top of the pipe, its water spills into the spout and runs to the trough.",
    "The discs come down the right side empty, dip under the water and go round again. The crank only has to keep the upper wheel turning. Follow the red disc all the way round. Then move the speed slider and see more water come out. Choose Closed to see the pipe as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The pipe is cut open at the front, and the water is drawn as small blue balls so you can see it move. Brown says only that power is applied at the upper wheel, so the crank was made up. The forked arms of the wheels, the shape of the spout, the tank, the trough, the stand and all the sizes were also made up. Inside the pipe the chain is drawn straight. Outside it sways a little as each pin leaves a wheel.",

  /* The chain: 22 joints 40 apart. Each wheel holds joints on a circle of radius 20 / sin(22.5 deg) = 52.26 at 8 seats,
     so the chain lies on a wheel as part of an octagon. The wheels are 7 links apart and turn in step, so the two free
     runs stay upright and exactly 7 links long. _joint(j, f, out) gives joint slot j (0 = the seat where the rising run
     meets the upper wheel, counting the way the chain moves) when the wheel has turned the fraction f of one seat. */
  _K: { N: 8, k: 7, p: 40, Rj: 20 / Math.sin(Math.PI / 8), yT: 140, yB: -140, M: 22, pipeBot: -95, pipeTop: 31 },
  _joint: function (j, f, out) {
    var K = this._K, d = 2 * Math.PI / K.N, phi = (.5 - f) * d, h = K.N / 2, a, m;
    if (j <= h) { a = phi + Math.PI - j * d; out[0] = K.Rj * Math.cos(a); out[1] = K.yT + K.Rj * Math.sin(a); }
    else if (j < h + K.k) { out[0] = K.Rj * Math.cos(phi); out[1] = K.yT + K.Rj * Math.sin(phi) - (j - h) * K.p; }
    else if (j <= K.N + K.k) { a = phi - (j - h - K.k) * d; out[0] = K.Rj * Math.cos(a); out[1] = K.yB + K.Rj * Math.sin(a); }
    else {
      m = j - K.N - K.k;
      var xs = -K.Rj * Math.cos(phi), y0 = K.yB - K.Rj * Math.sin(phi), y1 = y0 + K.k * K.p, y = y0 + m * K.p, xp = this._xp;
      // inside the pipe the discs hold the chain on the pipe's centre line; outside it runs straight to the wheel
      out[0] = y > K.pipeTop + 14 ? xp + (xs - xp) * (y - K.pipeTop - 14) / (y1 - K.pipeTop - 14) : y < K.pipeBot ? xp + (xs - xp) * (K.pipeBot - y) / (K.pipeBot - y0) : xp;
      out[1] = y;
    }
    return out;
  },
  _xp: -20 / Math.tan(Math.PI / 8),          // pipe centre line: where a pin is at the moment a wheel takes it or lets it go, -48.28

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this._K, xp = this._xp, i, fx = c.fixed;
    var o = this.o = { th: 0, pins: [], q: [0, 0], q2: [0, 0] };
    // wheels: hub, 8 arms z -3..3 ending in a fork that holds a chain pin (radius 2.5) at radius 52.26
    function wheel(y) {
      var g = new T.Group(), m = c.mat("wheel"); g.position.y = y; scene.add(g);
      g.add(P.cylZ(20, 6, m));
      P.at(P.cylZ(11, 3, c.mat("wheel", "dark")), 0, 0, 4.5, g);                       // collar z 3..6, on the hub face
      for (var a = 0; a < K.N; a++) {
        var s = new T.Group(); s.rotation.z = Math.PI / K.N + a * 2 * Math.PI / K.N; g.add(s);
        P.at(P.box(K.Rj - 2.5, 7, 6, m), (K.Rj - 2.5) / 2, 0, 0, s);                   // arm out to the underside of the pin
        [-1, 1].forEach(function (e) { P.at(P.box(5.5, 3, 6, m), K.Rj - .25, e * 4.2, 0, s); });   // prongs y 2.7..5.7 beside the pin
      }
      return g;
    }
    o.top = wheel(K.yT); o.bot = wheel(K.yB);
    P.at(P.cylZ(5, 70, c.mat("wheel", "dark")), 0, 0, -1, o.top);                       // upper shaft z -36..34, from the face of the post
    P.at(P.box(46, 9, 6, c.mat("wheel")), 20, 0, 29, o.top);                            // crank arm z 26..32, x -3..43
    P.at(P.cylZ(4, 26, c.mat("wheel", "dark")), 40, 0, 45, o.top);                      // handle z 32..58, on the arm face
    P.at(P.cylZ(5, 60, c.mat("wheel", "dark")), 0, 0, 0, o.bot);                        // lower shaft z -30..30, between the tank walls
    // chain: side bars z 5..7 in front and behind, pins z -8..8, a disc of radius 14 on the middle of every link
    var bar = new T.BoxGeometry(K.p, 5, 2), bf = bar.clone(); bf.translate(0, 0, 6); bar.translate(0, 0, -6);
    o.front = P.linkChain({ count: K.M, geo: bf, material: c.mat("chain") }); o.back = P.linkChain({ count: K.M, geo: bar, material: c.mat("chain") });
    var dg = new T.CylinderGeometry(14, 14, 3, 36); dg.rotateZ(Math.PI / 2);
    o.disc = P.linkChain({ count: K.M, geo: dg, material: c.mat("disc"), mark: c.mat("disc", "mark"), markAt: 0 });
    scene.add(o.front); scene.add(o.back); scene.add(o.disc);
    for (i = 0; i < K.M; i++) o.pins.push(P.at(P.cylZ(2.5, 16, c.mat("chain", "dark")), 0, 0, 0, scene));
    // pipe: back half only, bore 14.5, wall 5, flared at the bottom (y -95), top at y 31
    var mp = c.mat("pipe");
    P.at(c.shell(P.halfSection({ poly: [[14.5, -80], [20, -95], [25, -95], [19.5, -80], [19.5, 31], [14.5, 31]], material: mp }), "open"), xp, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[14.5, -80], [20, -95], [25, -95], [19.5, -80], [19.5, 31], [14.5, 31]], material: mp, steps: 56 }), "closed"), xp, 0, 0, scene);
    // spout: a floor at y 26..30 round the pipe mouth (the pipe stands 1 proud of it), a back wall and an end wall; open at the front and at the left end
    var xl = xp - 14.5, xr = xp + 14.5;
    P.at(P.box(xl + 135, 4, 44, mp), (xl - 135) / 2, 28, 0, scene);                     // floor left of the mouth, x -135..xl, z -22..22
    P.at(P.box(29, 4, 7.5, mp), xp, 28, -18.25, scene);                                 // floor behind the mouth, z -22..-14.5
    P.at(P.box(29, 4, 7.5, mp), xp, 28, 18.25, scene);                                  // floor in front of the mouth, z 14.5..22
    P.at(P.box(4, 24, 44, mp), xr + 2, 38, 0, scene);                                   // end wall x xr..xr+4, y 26..50
    P.at(P.box(xr + 135, 20, 4, mp), (xr - 135) / 2, 40, -20, scene);                   // back wall y 30..50 on the floor, z -22..-18
    // tank, post and trough (not part of the movement)
    P.at(P.box(192, 6, 84, fx), -10, -211, -6, scene);                                  // floor x -106..86, y -214..-208, z -48..36
    P.at(P.box(6, 146, 72, fx), -103, -135, 0, scene);                                  // left wall x -106..-100, y -208..-62, z -36..36
    P.at(P.box(6, 146, 72, fx), 83, -135, 0, scene);                                    // right wall x 80..86
    P.at(P.box(180, 146, 6, fx), -10, -135, -33, scene);                                // back wall x -100..80, z -36..-30
    P.at(P.box(180, 146, 6, fx), -10, -135, 33, scene);                                 // front wall z 30..36
    P.at(P.box(24, 373, 12, fx), 0, -21.5, -42, scene);                                 // post x -12..12, y -208..165, z -48..-36, behind the tank
    P.at(P.box(50, 12, 12, fx), -37, 0, -42, scene);                                    // crossbar x -62..-12, y -6..6, against the side of the post
    P.at(P.box(12, 12, 16.5, fx), xp, 0, -27.75, scene);                                // stub z -36..-19.5, from the crossbar to the back of the pipe
    P.at(P.box(65, 174, 60, fx), -172.5, -127, 0, scene);                               // bank x -205..-140, y -214..-40, z -30..30
    P.at(P.box(5, 20, 60, fx), -202.5, -30, 0, scene);                                  // trough walls y -40..-20 on the bank: left x -205..-200
    P.at(P.box(5, 20, 60, fx), -142.5, -30, 0, scene);                                  // right x -145..-140
    P.at(P.box(55, 20, 5, fx), -172.5, -30, -27.5, scene);                              // back z -30..-25, between the side walls
    P.at(P.box(55, 20, 5, fx), -172.5, -30, 27.5, scene);                               // front z 25..30
    var wm = new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .2, depthWrite: false });
    P.at(P.box(179, 132.5, 59, wm), -10, -141.25, 0, scene);                            // water in the tank, y -207.5..-75, 0.5 clear of every wall
    P.at(P.box(54, 12, 49, wm), -172.5, -33.5, 0, scene);                               // water in the trough, y -39.5..-27.5
    // water: 16 balls ride on each disc while it is in the pipe, then become drops that run along the spout and fall
    o.per = 16; o.dots = P.waterDots(K.M * o.per, { radius: 3, color: c.spot }); scene.add(o.dots);
    o.off = []; o.spilt = [];
    for (i = 0; i < K.M * o.per; i++) { var r = 10.5 * Math.sqrt(Math.random()), a2 = Math.random() * 6.283; o.off.push([r * Math.cos(a2), 5 + (K.p - 10) * ((i % o.per) + Math.random()) / o.per, r * Math.sin(a2)]); o.spilt.push(false); }
    o.pool = P.dropPool({ count: 220, radius: 3, color: c.spot, opacity: .85, parent: scene });
  },

  step: function (c, dt, S) {
    var o = this.o, K = this._K, d = 2 * Math.PI / K.N, i, k, q = o.q, q2 = o.q2;
    o.th += S.w * dt;                                                                    // clockwise: the left run rises
    o.top.rotation.z = o.bot.rotation.z = -o.th;
    var u = o.th / d, sh = Math.floor(u), f = u - sh;
    for (i = 0; i < K.M; i++) {
      var j = ((i + sh) % K.M + K.M) % K.M;
      this._joint(j, f, q); this._joint((j + 1) % K.M, f, q2);
      if (j === K.M - 1) this._joint(K.M, f, q2);
      var tx = q2[0] - q[0], ty = q2[1] - q[1], mx = q[0] + tx / 2, my = q[1] + ty / 2;
      o.pins[i].position.set(q[0], q[1], 0);
      o.front.put(i, mx, my, 0, tx, ty, 0, 0, 0, 1); o.back.put(i, mx, my, 0, tx, ty, 0, 0, 0, 1); o.disc.put(i, mx, my, 0, tx, ty, 0, 0, 0, 1);
      var rising = j >= K.N + K.k;
      for (k = 0; k < o.per; k++) {
        var n = i * o.per + k, w = o.off[n], y = my + w[1];
        if (!rising || y < K.pipeBot) { o.spilt[n] = false; o.dots.put(n, 0, 0, 0, 0); continue; }
        if (y > K.pipeTop + 1) {
          if (!o.spilt[n]) { o.spilt[n] = true; o.pool.emit(this._xp + w[0], K.pipeTop + 1, w[2], -(40 + 30 * Math.random()), 0, 0); }
          o.dots.put(n, 0, 0, 0, 0); continue;
        }
        if (o.spilt[n]) { o.dots.put(n, 0, 0, 0, 0); continue; }
        o.dots.put(n, this._xp + w[0], y, w[2], 1);
      }
    }
    o.dots.flush();
    o.pool.step(Math.min(dt, .05), 320, function (p, dr) {
      if (p.x > -135 && p.y < 33) { p.y = 33; dr.vy = 0; }                           // runs along the spout floor (top at y 30)
      return p.y < -27 || p.x < -200;                                                    // lands in the trough
    });
    S.set("rpm", (S.playing ? S.rpm : 0) + " rpm");
    S.set("v", (Math.abs(S.w) * K.Rj * Math.cos((.5 - f) * d) / 10).toFixed(1) + " cm/s");
  }
});
