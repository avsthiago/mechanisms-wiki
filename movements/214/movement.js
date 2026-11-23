M507.define({
  number: 214,
  title: "Watch stop, third kind",
  lede: "A stop that lets a watch spring be wound only so many turns, then blocks the key. Two gears of different sizes each carry a finger. Because they turn at different speeds, the fingers miss each other for a few turns, then meet and stop.",
  alt: "Two gears side by side with their teeth locked together, the left one a little bigger. Each has a pointed finger fixed on the front of its arbor. The left finger is red and points straight up. The right one points up and to the right.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Key gear", note: "The bigger gear, on the spring arbor, turned by the key. Watch its red finger." },
    { key: "driven", color: "#C8873A", name: "Stop gear", note: "The smaller gear, turned by the bigger one. It has fewer teeth, so it turns a little faster. Its dark finger slowly gets ahead of the red one." },
    { key: "crank", color: "#D9B13B", name: "Winding key", note: "The key that winds the watch. It fits on the square end of the arbor." }
  ],
  readouts: [{ id: "wound", label: "Wound" }, { id: "state", label: "Key" }],
  views: { "3d": [200, 120, 540], front: [-12, 0, 560], side: [560, 0, 0] },
  target: [-12, 0, 0],
  how: [
    "Turn the key and both gears turn, opposite ways. The small gear has fewer teeth, so it goes round a little faster. Each finger sweeps across the space between the two arbors once per turn.",
    "At first the fingers cross that space at different moments, so they miss. But each turn the small gear gets a little further ahead. After a few turns the two fingers reach the space together and hit. Then neither gear can turn, so the key stops.",
    "Let it run and watch the turns count up until the fingers meet. Then it turns back as the spring unwinds, until the fingers meet again from the other side. Watch how close the fingers come on each turn before they hit."
  ],
  note: "This model is rebuilt from Brown's drawing. The key, the plate that holds the arbors, the sizes and the shape of the fingers were made up. The numbers of teeth were chosen so the fingers meet once every few turns, so the two gears differ in size a little more than in Brown's drawing. The model stops at the exact place where the two fingers first touch. The spring is left out, so the model just turns back to show unwinding.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, TAU = 2 * Math.PI, DEG = Math.PI / 180;
    var MD = 12, N1 = 14, N2 = 10, L1 = 96, L2 = 88, RB1 = 15, RB2 = 14;   // tooth size, teeth, finger lengths, finger base radii
    var g1 = P.spurGear({ teeth: N1, module: MD, material: c.mat("drive") }), g2 = P.spurGear({ teeth: N2, module: MD, material: c.mat("driven") });
    var D = g1.pitchRadius + g2.pitchRadius, X1 = -D / 2, X2 = D / 2;   // centres a sum of pitch radii apart
    var F1 = 90 * DEG, F2 = 36 * DEG - g2.pitch / 2;       // finger angles on their gears: left straight up, right up and to the right
    function finger(L, rb) {                               // convex teardrop: a round base and two straight sides to a point
      var pts = [[L, 0]], be = Math.acos(rb / L), i, a;
      for (i = 0; i <= 40; i++) { a = be + (TAU - 2 * be) * i / 40; pts.push([rb * Math.cos(a), rb * Math.sin(a)]); }
      return pts;
    }
    var p1 = finger(L1, RB1), p2 = finger(L2, RB2);
    function place(pts, cx, ang) { var cs = Math.cos(ang), sn = Math.sin(ang); return pts.map(function (p) { return [cx + cs * p[0] - sn * p[1], sn * p[0] + cs * p[1]]; }); }
    function apart(A, B) {                                 // separating axis test for two convex outlines: true if they do not touch
      var polys = [A, B], k, i, j, nx, ny, d, a0, a1, b0, b1, q;
      for (k = 0; k < 2; k++) {
        var Q = polys[k];
        for (i = 0; i < Q.length; i++) {
          j = (i + 1) % Q.length; nx = Q[j][1] - Q[i][1]; ny = Q[i][0] - Q[j][0];
          a0 = b0 = Infinity; a1 = b1 = -Infinity;
          for (q = 0; q < A.length; q++) { d = A[q][0] * nx + A[q][1] * ny; a0 = Math.min(a0, d); a1 = Math.max(a1, d); }
          for (q = 0; q < B.length; q++) { d = B[q][0] * nx + B[q][1] * ny; b0 = Math.min(b0, d); b1 = Math.max(b1, d); }
          if (a1 < b0 || b1 < a0) return true;
        }
      }
      return false;
    }
    function th2(a) { return -a * N1 / N2 + g2.pitch / 2; }   // opposite way, speed in inverse ratio of teeth, half a tooth offset to mesh
    function hit(a) { return !apart(place(p1, X1, a + F1), place(p2, X2, th2(a) + F2)); }
    var o = this.o = { a: 0, dir: 1, hold: 0, th2: th2 };
    function limit(sgn) {                                  // first touch going one way from the opening position
      var lo = 0, hi = 0, k;
      for (k = 0; k < 20000; k++) { hi = lo + sgn * .25 * DEG; if (hit(hi)) break; lo = hi; }
      for (k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (hit(m)) hi = m; else lo = m; }
      return lo;
    }
    o.aW = limit(1); o.aU = limit(-1);                     // winding turns the key gear anticlockwise

    function plate(pts, z0, z1, mat) {
      var sh = new T.Shape(), i; for (i = 0; i < pts.length; i++) { if (i) sh.lineTo(pts[i][0], pts[i][1]); else sh.moveTo(pts[i][0], pts[i][1]); }
      sh.closePath(); var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return new T.Mesh(g, mat);
    }
    // key gear: gear z -8..8, arbor z -30..-8, hub z 8..10, finger z 10..14, square end z 14..18, key pipe z 18..40, bow z 40..46
    o.g1 = new T.Group(); o.g1.position.set(X1, 0, 0); scene.add(o.g1); o.g1.add(g1);
    P.at(P.cylZ(6, 22, c.mat("drive")), 0, 0, -19, o.g1);                 // arbor z -30..-8, plate face to gear
    P.at(P.cylZ(RB1, 2, c.mat("drive")), 0, 0, 9, o.g1);                  // hub z 8..10, on the gear face
    var f1 = plate(p1, 10, 14, c.mat("drive", "mark")); f1.rotation.z = F1; o.g1.add(f1);   // red finger z 10..14, on the hub
    P.at(P.box(12, 12, 4, c.mat("drive", "dark")), 0, 0, 16, o.g1);       // square end z 14..18, on the finger
    P.at(P.cylZ(7, 22, c.mat("crank")), 0, 0, 29, o.g1);                  // key pipe z 18..40, on the square end
    P.at(P.box(12, 56, 6, c.mat("crank")), 0, 0, 43, o.g1);               // key bow y -28..28, z 40..46, on the pipe end
    // stop gear: gear z -8..8, arbor z -30..-8, hub z 8..10, finger z 10..14, square end z 14..18
    o.g2 = new T.Group(); o.g2.position.set(X2, 0, 0); scene.add(o.g2); o.g2.add(g2);
    P.at(P.cylZ(6, 22, c.mat("driven")), 0, 0, -19, o.g2);                // arbor z -30..-8
    P.at(P.cylZ(RB2, 2, c.mat("driven")), 0, 0, 9, o.g2);                 // hub z 8..10
    var f2 = plate(p2, 10, 14, c.mat("driven", "dark")); f2.rotation.z = F2; o.g2.add(f2);  // dark finger z 10..14, on the hub
    P.at(P.box(12, 12, 4, c.mat("driven", "light")), 0, 0, 16, o.g2);     // square end z 14..18, on the finger
    // supports: gear tips reach x -168..144 and y -96..96
    P.at(P.box(356, 240, 10, c.fixed), -12, 0, -35, scene);               // plate x -190..166, y -120..120, z -40..-30; arbors end at z -30
    P.at(P.box(396, 12, 100, c.fixed), -12, -126, -30, scene);            // base x -210..186, y -132..-120, z -80..20; plate stands on y -120

    o.check = function () {                                // node test: no touch strictly between the stops, touch just past each
      var bad = 0, n = 0, a;
      for (a = o.aU + 1e-6; a < o.aW - 1e-6; a += .02 * DEG) { n++; if (hit(a)) bad++; }
      return { turns: ((o.aW - o.aU) / TAU).toFixed(3), start: (-o.aU / TAU).toFixed(3), samples: n, overlaps: bad,
        touchW: hit(o.aW + 1e-4), touchU: hit(o.aU - 1e-4), D: D };
    };
  },

  step: function (c, dt, S) {
    var o = this.o, TAU = 2 * Math.PI;
    if (o.hold > 0) { if (S.w > 0) o.hold -= dt; if (o.hold <= 0) o.dir = -o.dir; }
    else {
      o.a += o.dir * S.w * dt;                             // winding turns the key gear anticlockwise
      if (o.a >= o.aW) { o.a = o.aW; o.hold = 1.2; }
      if (o.a <= o.aU) { o.a = o.aU; o.hold = 1.2; }
    }
    o.g1.rotation.z = o.a;
    o.g2.rotation.z = o.th2(o.a);
    S.set("wound", ((o.a - o.aU) / TAU).toFixed(1) + " turns");
    S.set("state", o.hold > 0 ? "Stopped" : o.dir > 0 ? "Winding" : "Unwinding");
  }
});
