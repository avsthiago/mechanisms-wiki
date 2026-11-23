M507.define({
  number: 215,
  title: "Watch stop, fourth kind",
  lede: "A stop that lets a watch spring be wound only so many turns, then blocks the key. A pin on a round plate turns a wavy star wheel one step per turn. One side of the star is left uncut, and that side is what stops the key.",
  alt: "On the left, a round plate with a smaller disc on its face. The disc has a deep round bite cut out of its right side, and a red pin stands in the middle of the bite. On the right, a star wheel with six narrow slots and a wavy edge. The pin sits in the slot nearest the disc.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Pin plate", note: "A round plate turned by the key. It carries a disc with a deep bite cut out, and a pin in the middle of the bite. Watch the red pin step the star once each turn." },
    { key: "driven", color: "#C8873A", name: "Star wheel", note: "It has narrow slots all round, with a shallow hollow between most of them. One side has no hollow and stays fully round. The dark stripe points to that side, which is the stop." },
    { key: "crank", color: "#D9B13B", name: "Winding key", note: "The key that winds the watch. It fits on the square end of the arbor and turns the pin plate." }
  ],
  readouts: [{ id: "wound", label: "Wound" }, { id: "state", label: "Key" }],
  views: { "3d": [240, 120, 540], front: [0, 0, 560], side: [560, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Turn the key and the plate goes round with it. Once each turn the pin slides into a slot of the star. It turns the star by one slot, then slides out. The bite in the disc gives the points of the star room to swing past.",
    "The rest of the time the round edge of the disc sits in a shallow hollow of the star and holds it still. One side of the star has no hollow. When that side comes round, it hits the edge of the disc just past the bite. Then the key cannot turn any further.",
    "Let it run and watch the turns count up until the key stops. Then it turns back as the spring unwinds, and the same uncut side stops it from the other side. Count the turns between the two stops."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not say how this stop works. Here it is read as a pin that steps a star wheel, with the uncut side drawn as one of the star's bulging sides. The key, the plate that holds the shafts, the sizes and the depth of the hollows were made up. The bite and the slots were worked out so the pin moves the star exactly one slot and nothing rubs. The spring itself is left out, so the model just turns back to show unwinding.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, TAU = 2 * Math.PI, DEG = Math.PI / 180;
    var D = 150, N = 6, ST = TAU / N, RL = 70, CL = .6, RH = RL + CL, RO = 83, ETA = 6 * DEG, FT = 91.6, FH = 4.5, RBOT = D - FT - FH - 4;
    var RB = 55, RP = 100;                                 // radius of the bite (centred on the pin) and of the round plate
    var stopFace = 0;
    // star outline, radius at local angle g. At rest a hollow faces the disc (local -X). Hollows are shallow arcs round the
    // disc's centre; slots are narrow with a round bottom. The face numbered stopFace is left uncut when full is true.
    function rim(g, full) {
      var k = Math.round((g - Math.PI - ST / 2) / ST), psi = g - (Math.PI + ST / 2 + k * ST), u;
      if (Math.abs(psi) < ETA) { u = psi / ETA; return RBOT + 3 * (1 - Math.sqrt(Math.max(0, 1 - u * u))); }
      var j = Math.round((g - Math.PI) / ST), ph = g - Math.PI - j * ST, s = D * Math.sin(ph);
      if (full && ((j % N) + N) % N === stopFace) return RO;
      if (Math.abs(s) >= RH) return RO;
      return Math.min(RO, D * Math.cos(ph) - Math.sqrt(RH * RH - s * s));
    }
    var dr = P.oneToothDrive({ dist: D, drivenR: function (g) { return rim(g, false); }, finger: { base: FT - 1, tip: FT, half: FH },
      lockR: RL, clear: CL, dir: 1, pitch: ST });
    var o = this.o = { dr: dr, b0: 0, dir: 1, hold: 0 };   // the pin starts deepest in a slot, on the line of centres, as Brown draws it
    var want = 30 * DEG;                                   // the uncut side is the star's upper right side in the opening view
    stopFace = ((Math.round((want - dr.theta(o.b0) - Math.PI) / ST) % N) + N) % N;
    var faceMid = Math.PI + stopFace * ST;

    // Outline of the bitten disc in the driver's frame. inDriver tests a point, edge lists points on it. The pin is
    // left out here: its push is worked out by oneToothDrive, and the node test checks it with dr.overlap.
    function inDriver(x, y) { return Math.hypot(x, y) < RL && Math.hypot(x - FT, y) > RB; }
    var edge = [], i, a, gb = Math.acos((RL * RL + FT * FT - RB * RB) / (2 * RL * FT)), gp = Math.atan2(RL * Math.sin(gb), RL * Math.cos(gb) - FT);
    for (i = 0; i <= 1440; i++) { a = gb + (TAU - 2 * gb) * i / 1440; edge.push([RL * Math.cos(a), RL * Math.sin(a)]); }        // rim outside the bite
    for (i = 0; i <= 720; i++) { a = Math.PI - (Math.PI - gp) + 2 * (Math.PI - gp) * i / 720; edge.push([FT + RB * Math.cos(a), RB * Math.sin(a)]); }   // the bite
    var star = [];
    for (i = 0; i < 5760; i++) { a = i * TAU / 5760; var r0 = rim(a, true); star.push([r0 * Math.cos(a), r0 * Math.sin(a)]); }
    // Does the star (with its uncut side) cut into the bitten disc at driver angle b? Both outlines are tested against each other.
    function hit(b) {
      var t = dr.theta(b), ct = Math.cos(t), st = Math.sin(t), cb = Math.cos(b), sb = Math.sin(b), j, X, Y, x, y, r;
      for (j = 0; j < star.length; j++) {                  // points of the star's edge, in the driver's frame
        X = ct * star[j][0] - st * star[j][1] + D; Y = st * star[j][0] + ct * star[j][1];
        if (X > RP) continue;
        x = cb * X + sb * Y; y = -sb * X + cb * Y;
        if (inDriver(x, y)) return true;
      }
      for (j = 0; j < edge.length; j++) {                  // points of the driver's edge, in the star's frame
        x = cb * edge[j][0] - sb * edge[j][1] - D; y = sb * edge[j][0] + cb * edge[j][1];
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
    o.bMax = limit(1); o.bMin = limit(-1); o.b = o.b0;

    function extrude(shape, z0, z1, mat) { var g = new T.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false, curveSegments: 48 }); g.translate(0, 0, z0); return new T.Mesh(g, mat); }
    var cShape = new T.Shape();                            // disc with the bite cut out of its +X side
    cShape.absarc(0, 0, RL, gb, TAU - gb, false);
    cShape.absarc(FT, 0, RB, -gp, gp, true);
    var sShape = new T.Shape();
    for (i = 0; i < star.length; i++) { if (i) sShape.lineTo(star[i][0], star[i][1]); else sShape.moveTo(star[i][0], star[i][1]); }
    sShape.closePath();
    // pin plate: arbor z -30..10 (plate face to square end), round plate z -14..-6, bitten disc z -6..6, pin z -6..6,
    // square end z 6..10, key pipe z 10..32, key bow z 32..38
    o.g1 = new T.Group(); o.g1.position.set(-D / 2, 0, 0); scene.add(o.g1);
    P.at(P.cylZ(5, 16, c.mat("drive")), 0, 0, -22, o.g1);                 // arbor z -30..-14, plate face to round plate
    P.at(P.cylZ(RP, 8, c.mat("drive", "light")), 0, 0, -10, o.g1);        // round plate z -14..-6, pale so the bitten disc stands out
    o.g1.add(extrude(cShape, -6, 6, c.mat("drive")));                      // bitten disc z -6..6, on the plate's face
    P.at(P.cylZ(FH, 12, c.mat("drive", "mark")), FT, 0, 0, o.g1);         // red pin z -6..6, standing on the plate's face
    P.at(P.box(12, 12, 4, c.mat("drive", "dark")), 0, 0, 8, o.g1);        // square end z 6..10, on the disc face
    P.at(P.cylZ(7, 22, c.mat("crank")), 0, 0, 21, o.g1);                  // key pipe z 10..32, on the square end
    P.at(P.box(12, 56, 6, c.mat("crank")), 0, 0, 35, o.g1);               // key bow y -28..28, z 32..38, on the pipe end
    // star wheel: wheel z -4..6 (clear of the round plate's face at z -6), shaft z -30..10, hub z 6..10
    o.g2 = new T.Group(); o.g2.position.set(D / 2, 0, 0); scene.add(o.g2);
    o.g2.add(extrude(sShape, -4, 6, c.mat("driven")));
    P.at(P.cylZ(5, 40, c.mat("driven")), 0, 0, -10, o.g2);                // shaft z -30..10
    P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 8, o.g2);                  // hub z 6..10, on the wheel face
    var bar = P.box(RO - 30, 5, 1, c.mat("driven", "dark")); bar.rotation.z = faceMid;     // dark stripe r 12..65 towards the uncut side, z 6.5..7.5, lifted off the face
    bar.position.set((RO - 6) / 2 * Math.cos(faceMid), (RO - 6) / 2 * Math.sin(faceMid), 7); o.g2.add(bar);
    // supports: centres at x -75 and 75; the round plate reaches y -100..100
    P.at(P.box(370, 230, 10, c.fixed), 0, 0, -35, scene);                 // plate x -185..185, y -115..115, z -40..-30; shafts end at z -30
    P.at(P.box(410, 12, 100, c.fixed), 0, -121, -30, scene);              // base x -205..205, y -127..-115, z -80..20; plate stands on y -115

    o.check = function () {                                // node test: no overlap between the stops, contact at each stop
      var bad = 0, b, n = 0, t, e = .05 * DEG;            // a push off by less than e (rounding in the table) is not counted
      for (b = o.bMin; b <= o.bMax; b += .05 * DEG) { n++; t = dr.theta(b); if (hit(b) || (dr.overlap(b, t) && dr.overlap(b, t - e) && dr.overlap(b, t + e))) bad++; }
      return { turns: ((o.bMax - o.bMin) / TAU).toFixed(3), start: ((o.b0 - o.bMin) / TAU).toFixed(3), samples: n, overlaps: bad,
        travelDeg: (dr.travel / DEG).toFixed(3), touchMax: hit(o.bMax + 1e-4), touchMin: hit(o.bMin - 1e-4), stopFace: stopFace };
    };
  },

  step: function (c, dt, S) {
    var o = this.o, TAU = 2 * Math.PI;
    if (o.hold > 0) { if (S.w > 0) o.hold -= dt; if (o.hold <= 0) o.dir = -o.dir; }
    else {
      o.b += o.dir * S.w * dt;
      if (o.b >= o.bMax) { o.b = o.bMax; o.hold = 1.2; }
      if (o.b <= o.bMin) { o.b = o.bMin; o.hold = 1.2; }
    }
    o.g1.rotation.z = o.b;
    o.g2.rotation.z = o.dr.theta(o.b);
    S.set("wound", ((o.b - o.bMin) / TAU).toFixed(1) + " turns");
    S.set("state", o.hold > 0 ? "Stopped" : o.dir > 0 ? "Winding" : "Unwinding");
  }
});
