M507.define({
  number: 82,
  title: "Treadles and ratchet",
  lede: "Two foot boards, called treadles, are pressed down one after the other. Each one pulls an arm that drags a toothed wheel round. One treadle works while the other rises, so the wheel keeps turning one way almost without a stop.",
  alt: "A big wheel with slanted teeth stands at the left. Two arms swing on its shaft and reach right, each with a hooked finger resting on the teeth. A rod hangs from each arm down to one of two long treadles hinged at the left. A belt joins the treadles over a small pulley on a stand at the right.",
  parts: [
    { key: "treadles", color: "#5E7387", name: "Treadles", note: "Two long boards hinged at the left end, one behind the other. A foot presses each one down in turn." },
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with slanted teeth, called a ratchet. Watch the red spoke: it only ever turns one way." },
    { key: "arms", color: "#D9B13B", name: "Swinging arms", note: "Two arms that swing loose on the wheel's shaft, one in front of the wheel and one behind. Each carries one pawl." },
    { key: "pawls", color: "#4FA58A", name: "Pawls", note: "A pawl is a hooked finger that catches a tooth. It drags the wheel when its arm swings down and slides back over the teeth when it swings up. It turns red while it pulls." },
    { key: "rods", color: "#8E7AA8", name: "Connecting rods", note: "Each rod joins one treadle to the end of one arm. Pressing the treadle pulls the arm down." },
    { key: "strap", color: "#E8E2D0", name: "Belt and pulley", note: "A belt runs from one treadle up over the pulley and down to the other. When one treadle goes down, the belt lifts the other. Watch the red mark on the pulley rock to and fro." }
  ],
  controls: [{ type: "range", id: "tread", label: "Treadle travel", min: 2, max: 9, step: 0.5, value: 8, unit: "°",
    presets: [[2, "Tiny"], [5, "Short"], [8.5, "Long"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Treading speed", unit: " a min" },
  readouts: [{ id: "in", label: "Treadle tilt" }, { id: "out", label: "Wheel" }],
  views: { "3d": [600, 150, 940], front: [110, -60, 940], side: [1000, -40, 60] },
  target: [110, -60, 0],
  how: [
    "Press the front treadle down. Its rod pulls the front arm down, and the arm's pawl drags a tooth, so the wheel turns. At the same time the belt over the pulley lifts the back treadle. That pushes the back arm up, and its pawl slides back over the slanted teeth.",
    "Now press the back treadle. The two swap jobs. The back pawl drags the wheel and the front pawl slides back for a fresh grip. Both strokes turn the wheel the same way, with only a short pause when the treadles change over.",
    "Watch which pawl turns red. Try Tiny. The arms swing less than one tooth, so the pawls never reach a new gap and the wheel soon stops. Then try Short and Long, and count the teeth that pass on each stroke."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate behind the wheel, the hinge block, the stand round the pulley, the shape of the pawls, the number of teeth and all the sizes were made up. A real wheel would coast a little between pulls. Here it stops at once.",

  K: { R: 112, D: 9, N: 30, RP: 148, L: 60, TPX: -85, TPY: -210, SC: 335, YP: -55, RS: 28,
       arms: [{ R: 182, a0: 16.3, s: 285, z: 20, sg: 1 }, { R: 165, a0: -24.4, s: 245, z: -20, sg: -1 }] },

  rim: function (u) { var K = this.K, st = 2 * Math.PI / K.N, f = u / st + 1e-9; f -= Math.floor(f); return K.R - K.D + K.D * f; },
  delta: function (r) { var K = this.K; return Math.acos((K.RP * K.RP + r * r - K.L * K.L) / (2 * K.RP * r)); },   // angle at the wheel centre from pawl pin to nose
  tread: function (A, sg, phi) { var K = this.K; return [K.TPX + A.s * Math.cos(sg * phi), K.TPY + A.s * Math.sin(sg * phi)]; },
  // arm angle with its rod pin one rod length from the treadle point q; take the crossing nearest the last angle
  armAngle: function (A, q, prev) {
    var d = Math.hypot(q[0], q[1]), b = Math.atan2(q[1], q[0]), g = Math.acos(Math.max(-1, Math.min(1, (A.R * A.R + d * d - A.len * A.len) / (2 * A.R * d))));
    return Math.abs(b + g - prev) < Math.abs(b - g - prev) ? b + g : b - g;
  },

  init: function (o) {
    var K = this.K, self = this, st = 2 * Math.PI / K.N;
    o.st = st; o.dRoot = this.delta(K.R - K.D); o.dTip = this.delta(K.R); o.psi = Math.PI / 6; o.W = 0;
    o.arms = K.arms.map(function (A) {
      var a = A.a0 * Math.PI / 180, q = self.tread(A, A.sg, 4 * Math.PI / 180);   // the drawing: front treadle up 4°, back one down 4°
      A.len = Math.hypot(q[0] - A.R * Math.cos(a), q[1] - A.R * Math.sin(a));
      return { A: A, a: a, push: false };
    });
    var f = o.arms[0], x = f.a + o.dRoot;
    f.g = Math.floor(x / st + 1e-9); o.W = o.W0 = x - f.g * st; f.seat = true;      // front pawl starts against a tooth face
    var b = o.arms[1]; b.g = Math.floor((b.a + o.dTip - o.W) / st); b.seat = b.a + o.dRoot - o.W >= b.g * st;
    this.phys(o, 4 * Math.PI / 180);
  },
  // one step for a front treadle angle phi (the back one is at -phi: the strap is one length)
  phys: function (o, phi) {
    var K = this.K, self = this, st = o.st, who = null;
    o.phi = phi;
    o.arms.forEach(function (s) { s.prev = s.a; s.q = self.tread(s.A, s.A.sg, phi); s.a = self.armAngle(s.A, s.q, s.a); });
    // a seated nose (down in its gap) may not pass the steep face at g*st, which it hooks; if it would, it drags the wheel
    o.arms.forEach(function (s) { if (!s.seat) return; var w = s.a + o.dRoot - s.g * st; if (w < o.W - 1e-12) { o.W = w; who = s; } });
    o.arms.forEach(function (s) {
      if (who === s) s.push = true; else if (s.a !== s.prev) s.push = false;
      while (s.a + o.dTip - o.W > (s.g + 1) * st) s.g++;                          // slid over a tip into the next gap
      while (s.a + o.dTip - o.W < s.g * st) s.g--;                                // or back over the tip it had just passed
      var x = s.a + o.dRoot - o.W, i, r, lo, hi, m;
      s.seat = x >= s.g * st - 1e-9;
      if (s.seat) {                                                               // nose on the slope of its gap
        var u = x;
        for (i = 0; i < 6; i++) { r = self.rim(u); u = Math.min((s.g + 1) * st - 1e-6, Math.max(s.g * st, s.a + self.delta(r) - o.W)); }
        s.u = u; s.r = self.rim(u);
      } else {                                                                    // nose still sliding down the steep face
        lo = K.R - K.D; hi = K.R;
        for (i = 0; i < 30; i++) { m = (lo + hi) / 2; if (s.a + self.delta(m) - o.W < s.g * st) lo = m; else hi = m; }
        s.u = s.g * st; s.r = (lo + hi) / 2;
      }
    });
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, o = this.o = {}, self = this;
    this.init(o);
    var mw = c.mat("wheel"), ma = c.mat("arms"), mt = c.mat("treadles"), mr = c.mat("rods"), ms = c.mat("strap"), dk = c.mat("arms", "dark");

    // wheel: toothed ring z -10..10, four spokes z -6..6, hub z -12..12, shaft z -40..28 (back end on the plate face)
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(P.ratchet({ teeth: K.N, radius: K.R, depth: K.D, width: 20, bore: 80, material: mw }));
    P.at(P.box(166, 14, 12, mw), 0, 0, 0, o.wheel);                                  // spokes x -83..83, ends inside the ring
    P.at(P.box(14, 166, 12, mw), 0, 0, 0, o.wheel);
    P.at(P.cylZ(18, 24, mw), 0, 0, 0, o.wheel);                                      // hub
    P.at(P.cylZ(7, 68, mw), 0, 0, -6, o.wheel);                                      // shaft z -40..28
    P.at(P.cylZ(11, 4, mw), 0, 0, 26, o.wheel);                                      // front collar z 24..28
    P.at(P.cylZ(11, 4, mw), 0, 0, -26, o.wheel);                                     // back collar z -28..-24
    P.at(P.box(58, 6, 1, c.mat("wheel", "mark")), 49, 0, 7, o.wheel);               // red stripe x 20..78, z 6.5..7.5, lifted off the spoke face (z 6)

    // arms on the shaft (front z 16..24, back z -24..-16); pawls hang inside the ring width (front z 1..9, back z -9..-1)
    var mp = c.mat("pawls");
    o.arms.forEach(function (s) {
      var A = s.A, z = A.z, sg = A.sg;
      s.arm = new T.Group(); scene.add(s.arm);
      P.at(P.cylZ(16, 8, ma), 0, 0, z, s.arm);                                       // boss
      P.at(P.box(A.R - 12, 12, 8, ma), (A.R + 12) / 2, 0, z, s.arm);                 // bar r 6..R-6
      P.at(P.cylZ(9, 8, ma), A.R, 0, z, s.arm);                                      // eye for the rod
      P.at(P.cylZ(9, 8, ma), K.RP, 0, z, s.arm);                                     // eye for the pawl
      P.at(P.cylZ(3, 24, dk), K.RP, 0, sg * 13, s.arm);                            // pawl pin z 1..24 (or -24..-1)
      P.at(P.cylZ(3, 19, dk), A.R, 0, sg * 24.5, s.arm);                             // rod pin z 16..33 (or -33..-16)
      s.pawl = P.hookPawl({ length: K.L, reach: 14, thick: 7, width: 8, claw: 5, lean: 4, steep: 1.6, side: -1, material: mp });
      s.pawl.position.z = sg * 5; scene.add(s.pawl);
      s.rod = P.rod(3, mr); scene.add(s.rod);
      s.eye = P.cylZ(6, 6, mr); scene.add(s.eye);                                    // rod eye z 25..31 (or -31..-25), beside the arm
      // treadle: bar s 0..440 along its length, 10 tall, z 24..32 (or -32..-24)
      s.tr = new T.Group(); s.tr.position.set(K.TPX, K.TPY, sg * 28); scene.add(s.tr);
      P.at(P.box(440, 10, 8, mt), 220, 0, 0, s.tr);
      P.at(P.cylZ(9, 8, mt), 0, 0, 0, s.tr);                                         // hinge boss
      P.at(P.box(60, 3, 9, mt), 410, 6.5, 0, s.tr);                                  // foot pad on top, y 5..8
      P.at(P.cylZ(4, 2, c.mat("treadles", "dark")), A.s, 0, sg * 5, s.tr);           // rod pin head on the outer face
      s.strap = P.rod(2.5, ms); scene.add(s.strap);
    });
    o.mp = mp; o.mk = c.mat("pawls", "mark");

    // pulley: axis along X at (x 250, y YP); strap runs over it at z ±28 (strap tube 25.5..30.5 from the axis, rim r 25.5)
    o.pulley = new T.Group(); o.pulley.position.set(250, K.YP, 0); scene.add(o.pulley);
    P.at(P.cylX(25.5, 10, ms), 0, 0, 0, o.pulley);                                   // rim x 245..255
    P.at(P.cylX(33, 3, ms), -6.5, 0, 0, o.pulley);                                   // flanges x 243..246 and 254..257, overlapping the rim
    P.at(P.cylX(33, 3, ms), 6.5, 0, 0, o.pulley);
    P.at(P.cylX(5, 52, ms), 0, 0, 0, o.pulley);                                      // axle x 224..276, between the stand plates
    P.at(P.box(1, 22, 4, c.mat("strap", "mark")), 8.5, 18, 0, o.pulley);             // red mark x 8..9, off the flange face (x 8)
    var top = P.arc(K.RS, 2.5, Math.PI, ms); top.rotation.y = Math.PI / 2; P.at(top, 250, K.YP, 0, scene);   // strap over the top, z 28 to -28

    // supports. Floor: high step x -140..40 (top y -260), low step x 40..380 (top y -290)
    P.at(P.box(180, 40, 120, c.fixed), -50, -280, -10, scene);                       // x -140..40, y -300..-260, z -70..50
    P.at(P.box(340, 10, 120, c.fixed), 210, -295, -10, scene);                       // x 40..380, y -300..-290
    P.at(P.box(48, 284, 10, c.fixed), 0, -118, -45, scene);                          // plate x -24..24, y -260..24, z -50..-40, on the high step; shaft ends at z -40
    P.at(P.box(40, 60, 36, c.fixed), K.TPX, -230, 0, scene);                         // hinge block x -105..-65, y -260..-200, z -18..18
    P.at(P.cylZ(4, 16, c.fixed), K.TPX, K.TPY, 26, scene);                           // hinge pins z 18..34 and -34..-18, from the block faces through the bosses
    P.at(P.cylZ(4, 16, c.fixed), K.TPX, K.TPY, -26, scene);
    P.at(P.box(12, 265, 36, c.fixed), 218, -157.5, 0, scene);                        // stand plates x 212..224 and 276..288, y -290..-25, z -18..18, on the low step
    P.at(P.box(12, 265, 36, c.fixed), 282, -157.5, 0, scene);
  },

  step: function (c, dt, S) {
    var K = this.K, o = this.o, A = S.controls.tread * Math.PI / 180, n = Math.max(1, Math.ceil(dt / .004)), i;
    for (i = 1; i <= n; i++) { o.psi += S.w * dt / n; this.phys(o, A * Math.sin(o.psi)); }
    o.wheel.rotation.z = o.W;
    var lens = 0;
    o.arms.forEach(function (s, k) {
      var sg = s.A.sg, ph = sg * o.phi;
      s.arm.rotation.z = s.a;
      var px = K.RP * Math.cos(s.a), py = K.RP * Math.sin(s.a), na = s.u + o.W;
      s.pawl.position.x = px; s.pawl.position.y = py;
      s.pawl.rotation.z = Math.atan2(s.r * Math.sin(na) - py, s.r * Math.cos(na) - px);
      var m = s.push ? o.mk : o.mp; s.pawl.children[0].material = m; s.pawl.children[1].material = m;
      var ex = s.A.R * Math.cos(s.a), ey = s.A.R * Math.sin(s.a), z = sg * 28;
      s.rod.span(ex, ey, z, s.q[0], s.q[1], z); s.eye.position.set(ex, ey, z);
      s.tr.rotation.z = ph;
      var cx = K.TPX + K.SC * Math.cos(ph) - 5 * Math.sin(ph), cy = K.TPY + K.SC * Math.sin(ph) + 5 * Math.cos(ph);   // strap end on the top face
      s.strap.span(cx, cy, z, 250, K.YP, z);
      if (k === 0) lens = K.YP - cy;
    });
    o.pulley.rotation.x = (lens - (K.YP - K.TPY - 5)) / K.RS;                       // the strap rolls on the pulley without slipping
    var deg = Math.round(o.phi * 180 / Math.PI);
    S.set("in", (deg > 0 ? "+" : deg < 0 ? "−" : "") + Math.abs(deg) + "°");
    S.set("out", ((o.W0 - o.W) / (2 * Math.PI)).toFixed(2) + " turns");
  }
});
