M507.define({
  number: 212,
  title: "Geneva stop",
  lede: "A stop that lets a watch spring be wound only so many turns, then blocks the key. A wheel with one finger turns a star wheel one step per turn. One side of the star is left uncut, and that side is what stops it.",
  alt: "A big round disc below with one short red finger on its edge, and a star wheel above with five slots. Between two of the slots, at the upper right, the star is left as a full round edge instead of a hollow. A winding key sits on the front of the disc.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Finger wheel", note: "A round disc with one finger on its edge, turned by the key. Watch the red finger step the star wheel once each turn." },
    { key: "driven", color: "#C8873A", name: "Star wheel", note: "It has a slot for each step, with a hollow between most of them. One side has no hollow and is left round. The dark stripe points to that uncut side, which is the stop." },
    { key: "crank", color: "#D9B13B", name: "Winding key", note: "The key that winds the watch. It turns the finger wheel with the spring arbor." }
  ],
  readouts: [{ id: "wound", label: "Wound" }, { id: "state", label: "Key" }],
  views: { "3d": [250, 140, 620], front: [0, 0, 620], side: [620, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Turn the key and the round disc goes with it. Once each turn its finger slips into a slot of the star wheel. It pushes the star round by one slot, then slides out. In between, the round edge of the disc sits in a hollow of the star and holds it still.",
    "One side of the star has no hollow. It is left as a full round edge. When that side has to swing past the disc, it hits the disc's edge and cannot go on. So the key stops after a few turns, and the spring cannot be wound too tight.",
    "Let it run and watch the turns count up until the key stops. Then it turns back the other way, as the spring unwinds, until the uncut side stops it again from the other side. Count the turns between the two stops."
  ],
  note: "This model is rebuilt from Brown's drawing. The key, the plate that holds the shafts and the sizes were made up. The hollows, the slots and the cut-backs beside the finger were worked out so the finger moves the star exactly one slot and nothing rubs. The model stops at the exact place where the uncut side first touches the disc. The spring itself is left out, so the model just turns back to show unwinding.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, TAU = 2 * Math.PI, DEG = Math.PI / 180;
    var D = 150, N = 5, ST = TAU / N, RL = 80, CL = .6, RH = RL + CL, RO = 90, ETA = 8 * DEG, FT = 99.5, FH = 6, RBOT = D - FT - FH - 4;
    var RZ = 95.8 * DEG;                                   // the star sits above the disc and a little to the left, as Brown draws it
    var stopFace = 0;
    // star outline, radius at local angle g. At rest a hollow faces the disc (local -X). Hollows are arcs round the disc's
    // centre; slots have straight sides and a round bottom. The face numbered stopFace is left uncut when full is true.
    function rim(g, full) {
      var k = Math.round((g - Math.PI - ST / 2) / ST), psi = g - (Math.PI + ST / 2 + k * ST), u;
      if (Math.abs(psi) < ETA) { u = psi / ETA; return RBOT + 3 * (1 - Math.sqrt(Math.max(0, 1 - u * u))); }
      var j = Math.round((g - Math.PI) / ST), ph = g - Math.PI - j * ST, s = D * Math.sin(ph);
      if (full && ((j % N) + N) % N === stopFace) return RO;
      if (Math.abs(s) >= RH) return RO;
      return Math.min(RO, D * Math.cos(ph) - Math.sqrt(RH * RH - s * s));
    }
    var dr = P.oneToothDrive({ dist: D, drivenR: function (g) { return rim(g, false); }, finger: { base: FT - 10, tip: FT, half: FH },
      lockR: RL, clear: CL, dir: 1, pitch: ST });
    var o = this.o = { dr: dr, b0: -17 * DEG, dir: 1, hold: 0 };   // the finger starts in a slot, a little before the centre line
    // pick the face that is uncut so that it sits at the upper right in the opening view, where Brown puts it
    var want = 55 * DEG - RZ;                              // up and to the right of the star, in the frame of the pair
    stopFace = ((Math.round((want - dr.theta(o.b0) - Math.PI) / ST) % N) + N) % N;

    // Does the uncut face cut into the disc at driver angle b? Both outlines are tested against each other.
    var faceMid = Math.PI + stopFace * ST, arc = [], i, a;
    for (i = -360; i <= 360; i++) { a = faceMid + i / 360 * (ST / 2 - ETA); arc.push([RO * Math.cos(a), RO * Math.sin(a)]); }
    function hit(b) {
      var t = dr.theta(b), ct = Math.cos(t), st = Math.sin(t), cb = Math.cos(b), sb = Math.sin(b), j, X, Y, x, y, r, g;
      for (j = 0; j < arc.length; j++) {                   // points of the uncut edge, in the disc's frame
        X = ct * arc[j][0] - st * arc[j][1] + D; Y = st * arc[j][0] + ct * arc[j][1];
        x = cb * X + sb * Y; y = -sb * X + cb * Y; r = Math.hypot(x, y);
        if (r < RL + 12 && r < dr.driverR(Math.atan2(y, x))) return true;
      }
      for (j = 0; j < 1440; j++) {                         // points of the disc's edge, in the star's frame
        g = j * TAU / 1440; r = dr.driverR(g); x = r * Math.cos(g + b) - D; y = r * Math.sin(g + b);
        X = ct * x + st * y; Y = -st * x + ct * y; r = Math.hypot(X, Y);
        if (r < RO && r < rim(Math.atan2(Y, X), true) - 1e-6) return true;
      }
      return false;
    }
    function limit(sgn) {                                  // first touch going one way from the opening position
      var lo = o.b0, hi = o.b0, k;
      for (k = 0; k < 20000; k++) { hi = lo + sgn * .5 * DEG; if (hit(hi)) break; lo = hi; }
      for (k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (hit(m)) hi = m; else lo = m; }
      return lo;
    }
    o.bMax = limit(1); o.bMin = limit(-1); o.b = o.b0; o.hit = hit;

    function plate(shape, mat, z0, d) { var g = new T.ExtrudeGeometry(shape, { depth: d || 16, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, z0 === undefined ? -8 : z0); return new T.Mesh(g, mat); }
    function outline(fn, n) {
      var sh = new T.Shape(), j, aa, r;
      for (j = 0; j < n; j++) { aa = j * TAU / n; r = fn(aa); if (j) sh.lineTo(r * Math.cos(aa), r * Math.sin(aa)); else sh.moveTo(r, 0); }
      sh.closePath(); return sh;
    }
    var pair = new T.Group(); pair.rotation.z = RZ; pair.position.set(-D / 2 * Math.cos(RZ), -D / 2 * Math.sin(RZ), 0); scene.add(pair);
    // finger wheel: disc z -8..8, shaft z -30..12 (plate face to hub face), hub z 8..12, key pipe z 12..34, bow z 34..40
    o.g1 = new T.Group(); pair.add(o.g1);
    o.g1.add(plate(dr.driverShape(), c.mat("drive")));
    P.at(P.cylZ(6, 42, c.mat("drive")), 0, 0, -9, o.g1);                  // shaft z -30..12
    P.at(P.cylZ(16, 4, c.mat("drive")), 0, 0, 10, o.g1);                  // hub z 8..12, on the disc face
    P.at(P.box(FT - RL + 20, 4, 1, c.mat("drive", "mark")), (FT + RL - 20) / 2, 0, 8.5, o.g1);   // red stripe x 65..93 along the finger, z 8..9, lifted off the face
    P.at(P.cylZ(7, 22, c.mat("crank")), 0, 0, 23, o.g1);                  // key pipe z 12..34, on the hub face
    P.at(P.box(12, 56, 6, c.mat("crank")), 0, 0, 37, o.g1);               // key bow y -28..28, z 34..40, on the pipe end
    // star wheel: disc z -8..8, shaft z -30..12, hub z 8..12
    o.g2 = new T.Group(); o.g2.position.set(D, 0, 0); pair.add(o.g2);
    o.g2.add(plate(outline(function (g) { return rim(g, true); }, 7200), c.mat("driven"), -7, 14));      // star disc z -7..7, 1 thinner than the finger wheel so the faces never share a plane
    P.at(P.cylZ(6, 42, c.mat("driven")), 0, 0, -9, o.g2);                 // shaft z -30..12
    P.at(P.cylZ(14, 5, c.mat("driven")), 0, 0, 9.5, o.g2);                 // hub z 7..12
    var bar = P.box(RO - 30, 5, 1, c.mat("driven", "dark")); bar.rotation.z = faceMid;     // dark stripe r 16..71 towards the uncut face, z 8..9, lifted off the face
    bar.position.set((RO + 2) / 2 * Math.cos(faceMid), (RO + 2) / 2 * Math.sin(faceMid), 7.75); o.g2.add(bar);
    // supports: the pair's centres are at (+-7.7, -+74.6) in the scene
    P.at(P.box(240, 350, 10, c.fixed), 0, 0, -35, scene);                 // plate x -120..120, y -175..175, z -40..-30; shafts end at z -30
    P.at(P.box(280, 12, 100, c.fixed), 0, -181, -30, scene);              // base x -140..140, y -187..-175, z -80..20; plate stands on y -175

    o.check = function () {                                // node test: no overlap between the stops, contact at each stop
      var bad = 0, b, n = 0, t, e = .05 * DEG;            // a push off by less than e (rounding in the table) is not counted
      for (b = o.bMin; b <= o.bMax; b += .05 * DEG) { n++; t = dr.theta(b); if (hit(b) || (dr.overlap(b, t) && dr.overlap(b, t - e) && dr.overlap(b, t + e))) bad++; }
      return { turns: ((o.bMax - o.bMin) / TAU).toFixed(3), start: ((o.bMax - o.b0) / TAU).toFixed(3), samples: n, overlaps: bad,
        travelDeg: (dr.travel / DEG).toFixed(3), touchMax: hit(o.bMax + 1e-4), touchMin: hit(o.bMin - 1e-4), stopFace: stopFace };
    };
  },

  step: function (c, dt, S) {
    var o = this.o, TAU = 2 * Math.PI;
    if (o.hold > 0) { if (S.w > 0) o.hold -= dt; if (o.hold <= 0) o.dir = -o.dir; }
    else {
      o.b -= o.dir * S.w * dt;                             // winding turns the finger wheel clockwise
      if (o.b <= o.bMin) { o.b = o.bMin; o.hold = 1.2; }
      if (o.b >= o.bMax) { o.b = o.bMax; o.hold = 1.2; }
    }
    o.g1.rotation.z = o.b;
    o.g2.rotation.z = o.dr.theta(o.b);
    S.set("wound", ((o.bMax - o.b) / TAU).toFixed(1) + " turns");
    S.set("state", o.hold > 0 ? "Stopped" : o.dir > 0 ? "Winding" : "Unwinding");
  }
});
