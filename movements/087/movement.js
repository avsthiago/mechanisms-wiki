M507.define({
  number: 87,
  title: "Self-reversing gear",
  lede: "A shaft turns one way for a while, then turns back the other way, again and again. Nobody touches it. The machine throws its own switch, using a heavy lever that tips over.",
  alt: "A bevel gear seen face on drives two loose bevel gears that face each other on a level shaft. A sliding clutch between them is moved by a fork on a lever with a heavy ball. At the right end of the shaft, small bevel gears turn a wheel with a stud. The stud pushes a bent lever, which pulls a long rod joined to the ball lever.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "It always turns the same way. It touches both loose gears at once, so they turn in opposite directions." },
    { key: "loose", color: "#C8873A", name: "Loose gears", note: "They face each other and spin freely on the shaft. The shaft only turns when the clutch grips one of them." },
    { key: "clutch", color: "#C2503F", name: "Sliding clutch", note: "A sleeve with teeth at both ends. It slides along a key on the shaft, so it always turns with the shaft. Watch which gear it grips." },
    { key: "out", color: "#4FA58A", name: "Driven shaft", note: "It turns whichever way the gripped gear turns. A small bevel gear on its right end turns the wheel." },
    { key: "wheel", color: "#8E7AA8", name: "Striking wheel", note: "Turned by the shaft, so it turns back and forth too. Watch the red stud on its face. It pushes the bent lever." },
    { key: "lever", color: "#D9B13B", name: "Weighted lever", note: "A heavy ball on an arm, with a fork that holds the clutch. A bent lever and a long rod join it to the wheel. Once it is pushed past upright, it falls over by itself." }
  ],
  readouts: [{ id: "out", label: "Driven shaft" }, { id: "rev", label: "Reversals" }],
  views: { "3d": [330, 240, 760], front: [5, -30, 820], side: [820, -10, 60] },
  target: [5, -30, 0],
  how: [
    "The driving gear turns the two loose gears in opposite directions. The clutch between them grips one gear, and the shaft turns with it. The shaft also turns the wheel on the right.",
    "The red stud on the wheel comes round and pushes the bent lever. The long rod pulls the heavy ball up towards upright. Just past upright the ball falls over by itself, fast. Its fork then pulls the clutch across to the other gear. The shaft turns back, and so does the wheel. The stud now goes almost all the way round, the other way, and pushes the ball back over.",
    "The clutch stays put while the ball is lifted. It only moves once the ball falls, so it changes over in one quick throw. Try a slow speed and watch the ball. It creeps up, then drops all at once."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown drew slanted clutch teeth; square ones are used here. The fork sits loosely between two pegs on the ball lever, so the clutch only moves late in the fall; without that free play the clutch would let go while the ball was still being lifted. The stands, the sizes and the tooth counts were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, F = c.fixed, D = Math.PI / 180;
    var K = {
      XD: -122, XE: 202, GX: 115, GY: -50, PX: -122, PY: -113,
      LF: 22, LB: 100, L2: 55, GAM: -110 * D, RS: 46, LARM: 100, C0: 7.5,
      H: 82, ENG: 14, TOUCH: 7, GRAV: 30, PHI0: 44 * D
    };
    K.GP = K.PHI0 - Math.atan(K.ENG / K.H);                        // free play of the fork between the pegs
    var o = this.o = { K: K };
    var qm = this.Q(28 * D), pm = this.Pf(0);
    K.LR = Math.hypot(qm[0] - pm[0], qm[1] - pm[1]);               // rod length: ball upright when the bent lever is at 28 degrees
    var mo = c.mat("out"), ml = c.mat("lever"), mk = c.mat("clutch"), mw = c.mat("wheel");

    // driving gear, seen face on, behind the shaft; its shaft runs back to a post
    var dg = new T.Group(); dg.position.set(K.XD, 0, 0); dg.rotation.x = -Math.PI / 2; scene.add(dg);   // local +Y is world -Z
    o.drv = P.bevelGearCone({ radius: 60, teeth: 24, cone: Math.atan2(60, 50) / D, hubLength: 20, material: c.mat("drive") }); dg.add(o.drv);
    P.at(P.cylY(8, 30, c.mat("drive")), 0, 85, 0, o.drv);                                // z -70..-100, ends at the post face
    P.at(P.box(3, 22, 1, c.mat("drive", "dark")), 0, 86, 8.5, o.drv);                   // stripe 8..9 off the axis, lifted off the shaft
    P.at(P.box(24, 147, 12, F), K.XD, -61.5, -106, scene);                               // post x -134..-110, y -135..12, z -112..-100

    // loose gears, each in a group turned about the shaft axis
    function loose(sign) {
      var g = new T.Group(); g.position.x = K.XD; scene.add(g);
      var outer = new T.Group(); outer.rotation.z = -sign * Math.PI / 2; g.add(outer);   // local +Y points along sign * X
      var gear = P.bevelGearCone({ radius: 50, teeth: 20, cone: Math.atan2(50, 60) / D, hubLength: 20, material: c.mat("loose") });
      gear.rotation.y = Math.PI / 2 + gear.pitch / 2; outer.add(gear); o.pB = gear.pitch;  // a gap faces the driving gear
      P.at(P.cylX(22, 11, c.mat("loose")), sign * 35.5, 0, 0, g);                         // jaw hub, 30..41 from the apex (toe at 40.8)
      var j = P.jawRing({ rIn: 12, rOut: 22, len: 7, material: c.mat("loose") });
      j.rotation.y = -sign * Math.PI / 2; j.position.x = sign * 30; g.add(j);            // jaws 23..30 from the apex
      return g;
    }
    o.gB = loose(-1); o.gC = loose(1);

    // shaft: x -224 (outer collar) to 158 (inside the end gear's hub)
    o.shaft = new T.Group(); scene.add(o.shaft);
    P.at(P.cylX(6, 382, mo), -33, 0, 0, o.shaft);
    P.at(P.box(56, 3, 4, mo), K.XD, 7.5, 0, o.shaft);                                    // feather key y 6..9
    [-221, -25, -5].forEach(function (x) { P.at(P.cylX(10, 6, mo), x, 0, 0, o.shaft); });  // collars beside the bearings
    P.at(P.box(30, 1, 3, c.mat("out", "dark")), 60, 7, 0, o.shaft);                      // stripe y 6.5..7.5, off the shaft
    var eg = new T.Group(); eg.position.x = K.XE; eg.rotation.z = Math.PI / 2; o.shaft.add(eg);   // local +Y is world -X
    eg.add(P.bevelGearCone({ radius: 30, teeth: 12, cone: 45, hubLength: 16, material: mo }));     // back x 172, hub to 156
    [-211, -15].forEach(function (x) {                                                  // blocks x -218..-204 and -22..-8, foot on y -135
      var b = P.bearingBlock({ bore: 6.6, outer: 13, post: 20, width: 14, drop: 135, material: F }); b.rotation.y = Math.PI / 2; P.at(b, x, 0, 0, scene);
    });

    // sliding clutch, turns with the shaft
    o.slide = new T.Group(); o.shaft.add(o.slide);
    P.at(P.cylX(22, 4, mk), 7, 0, 0, o.slide); P.at(P.cylX(22, 4, mk), -7, 0, 0, o.slide);   // x 5..9 and -9..-5
    P.at(P.cylX(15, 10, mk), 0, 0, 0, o.slide);                                          // groove
    P.at(P.box(16, 1, 3, c.mat("clutch", "dark")), 0, 15.5, 0, o.slide);                 // stripe 15..16, on the groove
    [1, -1].forEach(function (s) { var j = P.jawRing({ rIn: 12, rOut: 22, len: 7, material: mk }); j.rotation.y = s * Math.PI / 2; j.position.x = s * 9; o.slide.add(j); });

    // shifter ring in the groove, does not turn; pin down to the fork
    o.ring = new T.Group(); scene.add(o.ring);
    P.at(P.cylX(19, 8, ml), 0, 0, 0, o.ring);
    P.at(P.cylY(3, 12, ml), 0, -25, 0, o.ring);                                           // y -19..-31, fork reaches y -31

    // fork arm and weighted lever on one fixed pin
    o.fork = new T.Group(); o.fork.position.set(K.PX, K.PY, 0); scene.add(o.fork);
    o.arm = P.at(P.box(6, 1, 6, ml), 0, 0, 0, o.fork);                                    // stretched to the pin each frame
    P.at(P.cylZ(9, 6, ml), 0, 0, 0, o.fork);                                              // boss z -3..3
    o.lever = new T.Group(); o.lever.position.set(K.PX, K.PY, 0); scene.add(o.lever);
    P.at(P.cylZ(8, 53, ml), 0, 0, 30.5, o.lever);                                         // sleeve z 4..57
    P.at(P.cylZ(10, 6, ml), 0, 0, 60, o.lever);                                           // hub z 57..63
    P.at(P.box(7, K.LB, 6, ml), 0, K.LB / 2, 60, o.lever);
    P.at(P.sphere(13, ml), 0, K.LB, 60, o.lever);
    P.at(P.cylZ(3, 16, ml), 0, K.LF, 65, o.lever);                                        // rod pin z 57..73
    var lam = K.GP + Math.asin(6.5 / 22);                                                 // pegs touch the fork when it is GP off the lever
    [1, -1].forEach(function (s) {
      var pg = new T.Group(); pg.rotation.z = -s * lam; o.lever.add(pg);
      P.at(P.box(5, 22, 4, ml), 0, 11, 6, pg);                                            // carrier z 4..8
      P.at(P.cylZ(3.5, 11, ml), 0, 22, 2.5, pg);                                          // peg z -3..8, reaches the fork plane
    });
    P.at(P.cylZ(3, 70, F), K.PX, K.PY, 31, scene);                                      // pin z -3..66, from the post face
    P.at(P.box(12, 30, 12, F), K.PX, -120, -9, scene);                                    // post x -128..-116, y -135..-105, z -15..-3

    // bent lever (bell crank) in front of the wheel
    o.bell = new T.Group(); o.bell.position.set(K.GX, K.GY, 56); scene.add(o.bell);       // arms z 53..59
    P.at(P.cylZ(9, 6, ml), 0, 0, 0, o.bell);
    P.at(P.box(K.LARM, 7, 6, ml), K.LARM / 2, 0, 0, o.bell);
    var low = new T.Group(); low.rotation.z = K.GAM; o.bell.add(low);
    P.at(P.box(K.L2, 7, 6, ml), K.L2 / 2, 0, 0, low);
    P.at(P.cylZ(3, 20, ml), K.L2, 0, 7, low);                                             // rod pin z 53..73
    P.at(P.cylZ(4, 4, F), K.GX, K.GY, 61, scene);                                         // cap z 59..63 on the boss
    P.at(P.box(12, 93, 12, F), K.GX, -88.5, 47, scene);                                   // post x 109..121, y -135..-42, z 41..53
    o.rod = P.rod(3, ml); scene.add(o.rod);                                               // z 64..70
    o.eyeA = P.at(P.cylZ(5.5, 6, ml), 0, 0, 67, scene); o.eyeB = P.at(P.cylZ(5.5, 6, ml), 0, 0, 67, scene);

    // striking wheel, turned by the end gear
    var ew = new T.Group(); ew.position.set(K.XE, 0, 0); ew.rotation.x = Math.PI / 2; scene.add(ew);   // local +Y is world +Z
    o.E = P.bevelGearCone({ radius: 30, teeth: 12, cone: 45, hubLength: 12, material: mw }); ew.add(o.E);   // back z 30, body to 42
    o.pE = o.E.pitch;
    var pw = new T.Group(); pw.rotation.x = -Math.PI / 2; pw.position.y = 47; o.E.add(pw);
    pw.add(P.pulley({ radius: 52, width: 10, rim: 14, spokes: 4, material: mw }));       // one spoked wheel z 42..52, rim r 38..52 carries the stud
    P.at(P.cylY(6, 80, mw), 0, 2, 0, o.E);                                               // axle z -38..42, from the post face
    P.at(P.box(20, 145, 12, F), K.XE, -62.5, -44, scene);                                 // post x 192..212, y -135..10, z -50..-38
    o.stud = P.at(P.cylY(4, 14, c.mat("wheel", "mark")), 0, 55, 0, o.E);                 // z 48..62, past the bent lever

    P.at(P.box(510, 12, 200, F), 5, -141, -20, scene);                                    // base x -250..260, y -147..-135, z -120..80

    // start: clutch on the right gear, ball fallen to the right, stud a little short of the bent lever
    o.alpha = 0; o.off = Math.PI / 4; o.gamma = o.off; o.gvel = 0; o.locked = 1; o.last = 1; o.rev = 0;
    o.s = K.ENG; o.phi = K.PHI0; o.v = 0; o.beta = this.betaFromPhi(K.PHI0, 42 * D); o.side = 1;
    o.thOff = 150 * D - o.gamma;                                                          // stud angle = shaft angle + thOff
    var rE = o.gamma - Math.PI + o.pE / 2, phS = rE - 150 * D;
    o.stud.position.set(K.RS * Math.cos(phS), 55, K.RS * Math.sin(phS));
  },

  Pf: function (phi) { var K = this.o.K; return [K.PX + K.LF * Math.sin(phi), K.PY + K.LF * Math.cos(phi)]; },
  Q: function (b) { var K = this.o.K; return [K.GX + K.L2 * Math.cos(b + K.GAM), K.GY + K.L2 * Math.sin(b + K.GAM)]; },
  wrap: function (a) { return Math.atan2(Math.sin(a), Math.cos(a)); },
  // angle a of the point (cx, cy) + r (cos a, sin a) that lies L from (px, py), the one nearest to guess
  solve: function (cx, cy, r, px, py, L, guess) {
    var dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1e-6, base = Math.atan2(dy, dx);
    var t = Math.acos(Math.max(-1, Math.min(1, (r * r + d * d - L * L) / (2 * r * d))));
    return Math.abs(this.wrap(base + t - guess)) < Math.abs(this.wrap(base - t - guess)) ? base + t : base - t;
  },
  betaFromPhi: function (phi, guess) {
    var K = this.o.K, p = this.Pf(phi);
    return this.wrap(this.solve(K.GX, K.GY, K.L2, p[0], p[1], K.LR, guess + K.GAM) - K.GAM);
  },
  phiFromBeta: function (beta, guess) {
    var K = this.o.K, q = this.Q(beta);
    return this.wrap(Math.PI / 2 - this.solve(K.PX, K.PY, K.LF, q[0], q[1], K.LR, Math.PI / 2 - guess));
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, w = S.w, Q90 = Math.PI / 2;
    function wrap90(x) { return ((x + Q90 / 2) % Q90 + Q90) % Q90 - Q90 / 2; }
    function cl(x, a, b) { return x < a ? a : x > b ? b : x; }
    var N = Math.max(1, Math.ceil(dt / .004)), h = dt / N, i;
    for (i = 0; S.playing && i < N; i++) {
      o.alpha -= w * h;
      var gB = 1.2 * o.alpha, gC = -1.2 * o.alpha;                                       // loose gears, turned about +X

      // weighted lever: falls under its weight, unless the stud holds the bent lever
      var phi0 = o.phi;
      o.v += K.GRAV * Math.sin(o.phi) * h; o.phi += o.v * h;
      o.beta = this.betaFromPhi(o.phi, o.beta);
      var th = o.gamma + o.thOff, sx = K.XE + K.RS * Math.cos(th) - K.GX, sy = K.RS * Math.sin(th) - K.GY;
      var Dd = Math.hypot(sx, sy), a = Math.atan2(sy, sx), along = Dd * Math.cos(a - o.beta), dist = Dd * Math.sin(a - o.beta);
      if (along > 0 && along < K.LARM && o.side * dist < K.C0) {
        o.beta = a - o.side * Math.asin(K.C0 / Dd);
        o.phi = this.phiFromBeta(o.beta, o.phi); o.v = (o.phi - phi0) / h;
      } else if (Math.abs(dist) >= K.C0) o.side = dist > 0 ? 1 : -1;

      // fork: free between the two pegs; it moves the clutch only when a peg pushes it
      var psi = cl(Math.atan(o.s / K.H), o.phi - K.GP, o.phi + K.GP), sd = K.H * Math.tan(psi), sn = cl(sd, -K.ENG, K.ENG);
      if (o.locked && o.locked * sn < K.TOUCH) o.locked = 0;                             // jaws pulled out
      if (!o.locked && Math.abs(sn) > K.TOUCH) {                                         // jaws tip to tip: wait for the gaps
        var k = sn > 0 ? 1 : -1, g = k > 0 ? gC : gB, wg = k > 0 ? 1.2 * w : -1.2 * w;
        var rel = wrap90(o.gamma - g - Q90 / 2), tol = Math.max(.06, Math.abs(o.gvel - wg) * h * 1.2);
        if (Math.abs(rel) < tol && w > 0) {
          o.locked = k; o.off = o.gamma - g - rel;
          if (k !== o.last) { o.rev++; o.last = k; }
        } else sn = k * K.TOUCH;
      }
      if (sn !== sd) {                                                                   // clutch stopped: the peg stops the lever too
        var ps = Math.atan(sn / K.H), pc = cl(o.phi, ps - K.GP, ps + K.GP);
        if (pc !== o.phi) { o.phi = pc; o.v = 0; o.beta = this.betaFromPhi(o.phi, o.beta); }
      }
      o.s = sn;
      if (o.locked) { o.gamma = (o.locked > 0 ? gC : gB) + o.off; o.gvel = o.locked * 1.2 * w; }
      else { o.gvel *= Math.exp(-h * 3); if (Math.abs(o.gvel) < .004) o.gvel = 0; o.gamma += o.gvel * h; }
    }

    // place everything
    o.drv.rotation.y = o.alpha;
    o.gB.rotation.x = 1.2 * o.alpha; o.gC.rotation.x = -1.2 * o.alpha;
    o.shaft.rotation.x = o.gamma; o.slide.position.x = K.XD + o.s; o.ring.position.x = K.XD + o.s;
    o.E.rotation.y = o.gamma - Math.PI + o.pE / 2;
    var L = Math.hypot(o.s, K.H), psi2 = Math.atan2(o.s, K.H);
    o.fork.rotation.z = -psi2; o.arm.scale.y = L; o.arm.position.y = L / 2;
    o.lever.rotation.z = -o.phi; o.bell.rotation.z = o.beta;
    var p = this.Pf(o.phi), q = this.Q(o.beta);
    o.rod.span(p[0], p[1], 67, q[0], q[1], 67); o.eyeA.position.set(p[0], p[1], 67); o.eyeB.position.set(q[0], q[1], 67);

    var r = Math.round(o.gvel * 600 / (2 * Math.PI)) / 10;
    S.set("out", (r < 0 ? "−" + -r : r) + " rpm");
    S.set("rev", String(o.rev));
  }
});
