M507.define({
  number: 63,
  title: "Jumping counter wheel",
  lede: "A disc turns slowly and steadily, but the star wheel beside it stands still, then jumps. Each jump moves it on by exactly one point. That makes it easy to count turns, which is why meters and turn counters use it.",
  alt: "A pivoted lever at the top with a coil spring under its left end. A long finger hangs from its right side down to a twelve-pointed star wheel at the lower left. A round disc on the right carries pins that lift the lever.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc with pins", note: "Turns steadily. Each pin lifts the lever, then slips off its end." },
    { key: "star", color: "#C8873A", name: "Star wheel", note: "The counting wheel. It only moves when the finger strikes it. Watch the red point to count the jumps." },
    { key: "pawl", color: "#C2503F", name: "Pawl", note: "A finger that hangs from the lever, called a pawl. It slides up over a point, then pushes the next one down." },
    { key: "drop", color: "#D9B13B", name: "Drop", note: "A lever that turns on the big screw. The pins lift its right side, and the spring throws it down again." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "Pushes up the left end of the drop. Watch it squeeze as the drop is lifted and spring back when it falls." }
  ],
  controls: [{ id: "pins", label: "Pins on the disc", value: "3", options: [["1", "1 pin"], ["2", "2 pins"], ["3", "3 pins"]] }],
  speed: { min: 1, max: 12, value: 6, label: "Disc speed", unit: " rpm" },
  readouts: [{ id: "disc", label: "Disc" }, { id: "star", label: "Star wheel" }],
  views: { "3d": [330, 170, 620], front: [10, 0, 720], side: [720, 20, -20] },
  target: [10, 0, -20],
  how: [
    "The disc turns all the time. A pin comes up under the yellow drop and lifts its right side slowly. The pawl hanging from the drop rises too. It slides up over one point of the star and falls into the next gap.",
    "Then the pin slips off the end of the drop. Nothing holds the drop up now, so the spring throws it down very fast. The pawl comes down with it and pushes the star round by one point. The star then waits, still, until the next pin arrives.",
    "However slowly the disc turns, each jump is just as quick, so the count is easy to read. Try 1 pin, then 3. Count how many points the star moves for each turn of the disc."
  ],
  note: "This model is rebuilt from Brown's drawing. In Brown's drawing the pins also lift the pawl clear of the star. Here the pawl simply slides up over the point instead. The drop is shaped more simply, and a coil spring stands in for Brown's flat spring. The stop pin above the spring, the plate, the posts and all the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var K = this.K = { SX: -44, SY: -64, RT: 100, RR: 58, N: 12, DX: 120, DY: -12, RPIN: 68, rp: 6, PX: -88, PY: 136,
      a: 130, b: 200, e: 146, g0: 1.87, QX: 108, QY: -46, TX: -60, TY: -12, AX: -148, AY: 53 };
    K.st = 2 * Math.PI / K.N; K.h = K.st / 2;
    var nose0 = [K.SX + K.RR * Math.cos(.1745), K.SY + K.RR * Math.sin(.1745)];                 // the gap the pawl rests in, 10 degrees above level
    K.L = Math.hypot(K.PX + K.QX - nose0[0], K.PY + K.QY - nose0[1]);
    var o = this.o = { th: 0, w: 0, held: false, disc: 0, phi: .1745 - K.h, phi0: .1745 - K.h, k: 0, psi: -1.6, pins: [] };

    // Layers along z: plate face -36; star and pawl -32..-22; drop -16..-8; disc 0..10.
    // star wheel: tips on multiples of the point angle, gaps half way between
    var sh = new T.Shape();
    for (i = 0; i < K.N; i++) {
      var at = i * K.st, ag = at + K.h;
      if (i === 0) sh.moveTo(K.RT, 0); else sh.lineTo(K.RT * Math.cos(at), K.RT * Math.sin(at));
      sh.lineTo(K.RR * Math.cos(ag), K.RR * Math.sin(ag));
    }
    sh.closePath();
    var sg = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false });
    o.star = new T.Group(); o.star.position.set(K.SX, K.SY, -32); scene.add(o.star);         // star z -32..-22
    o.star.add(new T.Mesh(sg, c.mat("star")));
    P.at(P.cylZ(6, 16, c.mat("star")), 0, 0, 8, o.star);                                       // shaft z -36..-20, from the plate face through the star
    P.at(P.cylZ(13, 3, c.mat("star")), 0, 0, 11.5, o.star);                                   // hub z -22..-19, on the star's front face
    P.at(P.cylZ(7, 1, c.mat("star", "mark")), 82, 0, 11, o.star);                             // red mark on one point, z -21.5..-20.5, lifted off the face

    // drop: a flat lever turning on the screw; local origin at the pivot, drawn at rest (level)
    var d = new T.Shape();
    d.moveTo(-80, -12); d.lineTo(-24, -12);
    d.quadraticCurveTo(60, -14, 98, -36);                                   // underside of the arm curving down to the ear
    d.quadraticCurveTo(96, -62, 110, -62); d.quadraticCurveTo(122, -62, 122, -56);   // round ear round the pawl pin (108, -46)
    d.quadraticCurveTo(126, -96, K.a, -K.e + 18); d.lineTo(K.a, -K.e);    // slim limb down to the nose
    d.lineTo(K.b, -K.e);                                                    // the nose's flat lower edge, where the pins push
    d.quadraticCurveTo(192, -70, 146, -22);                                 // back of the nose, cut back so a falling nose clears the pin
    d.quadraticCurveTo(90, 16, 22, 16);                                     // top of the arm
    d.absarc(0, 0, 26, .66, Math.PI - .48, false); d.lineTo(-80, 12);
    d.absarc(-80, 0, 12, Math.PI / 2, 3 * Math.PI / 2, false);
    var hole = new T.Path(); hole.absarc(0, 0, 6.5, 0, 2 * Math.PI, true); d.holes.push(hole);
    var dg = new T.ExtrudeGeometry(d, { depth: 8, bevelEnabled: false });
    o.drop = new T.Group(); o.drop.position.set(K.PX, K.PY, -16); scene.add(o.drop);           // drop z -16..-8; its lower edge is the line the pins push on
    o.drop.add(new T.Mesh(dg, c.mat("drop")));
    P.at(P.cylZ(4, 18, c.mat("drop")), K.QX, K.QY, -9, o.drop);                                // pawl pin z -34..-16, ends at the drop's back face
    // pawl hangs from that pin in the star's layer
    o.pawl = P.pawl({ length: K.L, thick: 7, width: 10, side: 1, material: c.mat("pawl") });
    P.at(o.pawl, K.PX + K.QX, K.PY + K.QY, -27, scene);                                        // pawl z -32..-22

    // pivot screw: fixed stud through the drop, head on its front face
    P.at(P.cylZ(6, 28, c.fixed), K.PX, K.PY, -22, scene);                                      // stud z -36..-8, from the plate face
    P.at(P.cylZ(15, 4, c.mat("drop", "dark")), K.PX, K.PY, -6, scene);                        // head z -8..-4, on the drop's front face
    o.slot = P.at(P.box(24, 3, 1, c.mat("drop", "light")), K.PX, K.PY, -3, scene);             // slot z -3.5..-2.5, lifted off the head
    o.slot.rotation.z = .9;

    // spring under the left end, and the stop pin above it
    P.at(P.cylZ(6, 30, c.fixed), K.AX, K.AY - 6, -21, scene);                                  // spring post z -36..-6, top y 53
    o.spring = P.spring({ radius: 7, wire: 1.6, turns: 8, length: 70, material: c.mat("spring") });
    P.at(o.spring, K.AX, K.AY, -12, scene);
    P.at(P.cylZ(5, 30, c.fixed), K.PX + K.TX, K.PY + 17, -21, scene);                          // stop pin z -36..-6, bottom y 148 meets the tail's top at rest

    // disc with pins, turning clockwise as seen from the front
    o.disc = new T.Group(); o.disc.position.set(K.DX, K.DY, 0); scene.add(o.disc);
    P.at(P.cylZ(95, 10, c.mat("disc")), 0, 0, 5, o.disc);                                     // disc z 0..10
    P.at(P.cylZ(5, 36, c.mat("disc")), 0, 0, -18, o.disc);                                    // shaft z -36..0, plate face to disc back
    P.at(P.cylZ(14, 4, c.mat("disc")), 0, 0, 12, o.disc);                                     // hub z 10..14
    P.at(P.box(72, 5, 1, c.mat("disc", "dark")), -52, 0, 11, o.disc);                       // dark stripe z 10.5..11.5, lifted off the face, from the hub outwards
    for (i = 0; i < 3; i++) {                                                                  // pins z -18..12, through the disc and past the drop's back face
      var pin = P.at(new T.Group(), 0, 0, 0, o.disc); o.pins.push(pin);
      P.at(P.cylZ(K.rp, 30, c.mat("disc")), 0, 0, -3, pin);
      P.at(P.cylZ(9, 2, c.mat("disc", "dark")), 0, 0, 11.5, pin);                            // dark head z 10.5..12.5, lifted off the disc face
    }

    // supports
    P.at(P.box(440, 370, 10, c.fixed), 10, 5, -41, scene);                                    // plate x -210..230, y -180..190, z -46..-36
    P.at(P.box(480, 12, 120, c.fixed), 10, -186, -40, scene);                                 // base x -230..250, y -192..-180, z -100..20; plate stands on y -180

    o.mPawl = c.mat("pawl");
    this.phys(0.004, 0, "3");
  },

  // star outline radius at a star-local angle
  rim: function (u) {
    var K = this.K; u = ((u % K.st) + K.st) % K.st; var a = u > K.h ? K.st - u : u;
    var px = K.RR * Math.cos(K.h), py = K.RR * Math.sin(K.h);
    return K.RT * py / (Math.cos(a) * py - Math.sin(a) * (px - K.RT));
  },
  inside: function (x, y) { var K = this.K, dx = x - K.SX, dy = y - K.SY; return Math.hypot(dx, dy) < this.rim(Math.atan2(dy, dx) - this.o.phi); },

  phys: function (h, wd, pinsN) {
    var K = this.K, o = this.o, i, n = +pinsN, best = -1e9;
    o.disc_a = (o.disc_a || 0) + wd * h;
    // pins push the drop's lower edge (a line in the drop) up: find the drop angle at which each pin just touches it
    for (i = 0; i < n; i++) {
      var g = K.g0 - o.disc_a + i * 2 * Math.PI / n, px = K.DX + K.RPIN * Math.cos(g) - K.PX, py = K.DY + K.RPIN * Math.sin(g) - K.PY;
      var r = Math.hypot(px, py), al = Math.atan2(py, px), kk = (K.e + K.rp) / r;
      if (kk >= 1) continue;
      var tc = al + Math.asin(kk); tc = Math.atan2(Math.sin(tc), Math.cos(tc));
      var lx = r * Math.cos(al - tc);
      if (lx < K.a || lx > K.b) continue;                                  // the pin is past the end of the edge: it has slipped off
      if (tc > best) best = tc;
    }
    if (best >= o.th) { o.w = o.held && h > 0 ? (best - o.th) / h : 0; o.th = best; o.held = true; }
    else {                                                                   // free: the spring throws the drop down until it meets the stop
      o.held = false;
      o.w += (-200 * (o.th + .25) - 6 * o.w) * h; o.th += o.w * h;
      if (o.th < 0) { o.th = 0; o.w = 0; }
      if (best > o.th) o.th = best;
    }
    // pawl: hangs from its pin and leans against the star; find where its nose first touches
    var c = Math.cos(o.th), s = Math.sin(o.th), qx = K.PX + c * K.QX - s * K.QY, qy = K.PY + s * K.QX + c * K.QY, L = K.L, self = this;
    function hit(p) { return self.inside(qx + L * Math.cos(p), qy + L * Math.sin(p)); }
    var p = -.9, stp = .005; while (p > -2.6 && !hit(p)) p -= stp;
    var lo = p, hi = p + stp; for (i = 0; i < 16; i++) { var m = (lo + hi) / 2; if (hit(m)) lo = m; else hi = m; }
    p = hi;
    var u = Math.atan2(qy + L * Math.sin(p) - K.SY, qx + L * Math.cos(p) - K.SX) - o.phi, vb = K.h + o.k * K.st;
    while (u - vb > Math.PI) u -= 2 * Math.PI; while (u - vb < -Math.PI) u += 2 * Math.PI;
    if (u > vb + K.h) o.k++;                                                 // the nose has passed over a point into the next gap
    else if (u < vb - 1e-4) {                                                // the nose is pressed into its gap: it turns the star
      var dx = qx - K.SX, dy = qy - K.SY, dd = Math.hypot(dx, dy), A = Math.atan2(dy, dx);
      var gg = A - Math.acos(Math.max(-1, Math.min(1, (K.RR * K.RR + dd * dd - L * L) / (2 * K.RR * dd))));
      var np = gg - vb, dph = Math.atan2(Math.sin(np - o.phi), Math.cos(np - o.phi));
      if (dph < 0) o.phi += dph;                                             // only ever forwards; the star never turns back
      p = Math.atan2(K.SY + K.RR * Math.sin(gg) - qy, K.SX + K.RR * Math.cos(gg) - qx);
    }
    o.psi = p; o.qx = qx; o.qy = qy;
  },

  step: function (c, dt, S) {
    var K = this.K, o = this.o, i, n = Math.ceil(dt / .004), np = +S.controls.pins;
    for (i = 0; i < n; i++) this.phys(dt / n, S.w, S.controls.pins);
    o.drop.rotation.z = o.th;
    o.pawl.position.set(o.qx, o.qy, -27); o.pawl.rotation.z = o.psi;
    o.star.rotation.z = o.phi;
    o.disc.rotation.z = -o.disc_a;
    o.pins.forEach(function (pin, j) {
      var g = K.g0 + j * 2 * Math.PI / np;
      pin.visible = j < np; pin.position.x = K.RPIN * Math.cos(g); pin.position.y = K.RPIN * Math.sin(g);
    });
    // spring from the top of its post to the underside of the drop's left end
    var cc = Math.cos(o.th), ss = Math.sin(o.th), tx = K.PX + cc * K.TX - ss * K.TY - K.AX, ty = K.PY + ss * K.TX + cc * K.TY - K.AY;
    o.spring.rotation.z = Math.atan2(ty, tx); o.spring.setLength(Math.hypot(tx, ty));
    S.set("disc", (o.disc_a / (2 * Math.PI)).toFixed(1) + " turns");
    var pts = Math.round((o.phi0 - o.phi) / K.st - .3);
    S.set("star", pts + (pts === 1 ? " point" : " points"));
  }
});
