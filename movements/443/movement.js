M507.define({
  number: 443,
  title: "Archimedes's screw driven by the stream",
  lede: "A long tube with a spiral inside it leans over a stream. A paddle wheel at its lower end turns in the current, and it turns the tube too. Water climbs up the spiral and pours out at the top.",
  alt: "A long tilted tube with a spiral inside, going from the upper left down to a stream at the lower right. A paddle wheel is fixed round the lower end, standing in the water. At the top left, water pours from the tube into a tank.",
  parts: [
    { key: "paddle", color: "#5E7387", name: "Paddle wheel", note: "Flat boards round the lower end. The stream pushes the ones in the water, and the wheel turns the whole screw." },
    { key: "screw", color: "#C8873A", name: "Spiral and axle", note: "A thin spiral blade round a central axle. It turns with the tube and carries the water up." },
    { key: "tube", color: "#E8E2D0", name: "Tube", note: "A see-through tube round the spiral. Its lower end is in the water." },
    { key: "mark", color: "#C2503F", name: "Red mark", note: "Watch it to see the tube turn." }
  ],
  controls: [{ id: "flow", label: "Stream speed", value: "high", options: [["low", "Slow"], ["high", "Fast"]] }],
  speed: false,
  closed: { label: "Tube" },
  readouts: [{ id: "rpm", label: "Screw" }, { id: "n", label: "Poured out" }],
  views: { "3d": [70, 55, 610], front: [-20, 10, 520], side: [540, 30, 0] },
  target: [-15, 5, 0],
  distance: [250, 1800],
  how: [
    "The lower end of the tube is in the water. The stream pushes the paddles, so the paddle wheel and the tube turn together. Water fills the lowest part of the tube near the water.",
    "The spiral blade turns round with the tube. Each pocket of water sits at the bottom of the tube, and the turning blade moves it along the slope. Watch the blue pockets climb, one after another, up to the top end. There they pour out into the tank.",
    "Try Slow, then Fast. Count how many pockets are poured out in the same time. Choose Closed to see the tube as it really is, not see-through."
  ],
  note: "This model is rebuilt from Brown's drawing. The two bearings and their posts, the tank, the stream bed and the water are made up. Brown's drawing shows a handle over the top end; it is left out. The number of turns in the spiral, the number of paddles and the speeds are chosen to look right. The pockets are drawn as blobs of water, not worked out from real flow.",

  opacity: function (key, S) { return key === "tube" ? (S.controls.case === "closed" && !S.iso ? 1 : .3) : 1; },   // closed: the tube drawn solid, as the real one is

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, AL = 34 * Math.PI / 180, PI2 = 2 * Math.PI;
    var o = this.o = { A: 0, om: -1, acc: 0, n: 6, p: 45, ca: Math.cos(AL), sa: Math.sin(AL), blobs: [], dz: [], dx: [] };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .5, depthWrite: false });
    // supports. Ground y -135..-125 (x -300..200, z -110..110); water y -125..-45 (x -140..200, z -100..100)
    P.at(P.box(500, 10, 220, c.fixed), -50, -130, 0, scene);
    P.at(P.box(340, 80, 200, wat), 30, -85, 0, scene);
    // tank pedestal x -235..-150, y -125..24, z 22..110; tank floor y 24..28; low walls y 28..38; water y 28..33
    P.at(P.box(85, 149, 88, c.fixed), -192.5, -50.5, 66, scene);
    P.at(P.box(85, 4, 88, c.fixed), -192.5, 26, 66, scene);
    P.at(P.box(85, 10, 2, c.fixed), -192.5, 33, 109, scene);   // z 108..110
    P.at(P.box(85, 10, 2, c.fixed), -192.5, 33, 23, scene);    // z 22..24
    P.at(P.box(2, 10, 84, c.fixed), -235.5 + 1, 33, 66, scene);   // x -235..-233 (z 24..108)
    P.at(P.box(2, 10, 84, c.fixed), -150 - 1, 33, 66, scene);     // x -152..-150
    P.at(P.box(79, 5, 80, wat), -192.5, 30.5, 66, scene);
    var ca = o.ca, sa = o.sa;
    // bearings: sleeves are along the axle, face to face with its ends (local x -240..-225 and 105..120); each on a thin post standing on the ground
    o.tilt = new T.Group(); o.tilt.rotation.z = -AL; scene.add(o.tilt);
    P.at(P.cylX(14, 15, c.fixed), -232.5, 0, 0, o.tilt);
    P.at(P.cylX(14, 15, c.fixed), 112.5, 0, 0, o.tilt);
    var tx = -232.5 * ca, ty = 232.5 * sa, bx = 112.5 * ca, by = -112.5 * sa;       // sleeve centres in the world
    P.at(P.box(16, (ty - 14 + 4) + 125, 12, c.fixed), tx, ((ty - 10) - 125) / 2, 0, scene);     // y -125..(ty-10), top just inside the sleeve
    P.at(P.box(16, (by - 14 + 4) + 125, 12, c.fixed), bx, ((by - 10) - 125) / 2, 0, scene);
    // spinning parts
    o.spin = new T.Group(); o.tilt.add(o.spin);
    var sm = c.mat("screw");
    P.at(P.cylX(8, 330, sm), -60, 0, 0, o.spin);                                                // x -225..105
    var tube = P.mesh(new T.CylinderGeometry(36, 36, 280, 40, 1, true), c.mat("tube")); tube.rotation.z = Math.PI / 2; P.at(tube, -70, 0, 0, o.spin);   // x -210..70
    o.flight = P.at(P.helixFlight({ rIn: 8, rOut: 35.4, length: 280, pitch: o.p, thickness: 3, hand: -1, material: sm }), -210, 0, 0, o.spin);
    P.at(P.box(30, 1.6, 8, c.mat("mark")), -150, 37, 0, o.spin);                                // lifted off the tube skin (36), y 36.2..37.8
    // paddle wheel: ring r 96..100 at x 8..12; fourteen narrow boards x -25..45, r 66..99; spokes between them
    var pm = c.mat("paddle"), ring = new T.Group(); ring.rotation.y = Math.PI / 2; ring.position.x = 10;
    ring.add(P.annulus({ rIn: 96, rOut: 100, depth: 4, z0: -2, material: pm })); o.spin.add(ring);
    for (i = 0; i < 14; i++) {
      var g = new T.Group(); g.rotation.x = i * Math.PI / 7; o.spin.add(g);
      P.at(P.box(18, 33, 1.5, pm), 10, 82.5, 0, g);
      var sp = P.rod(2, pm); sp.span(10, 36 * Math.cos(Math.PI / 14), 36 * Math.sin(Math.PI / 14), 10, 97 * Math.cos(Math.PI / 14), 97 * Math.sin(Math.PI / 14)); g.add(sp);
    }
    for (i = 0; i < o.n; i++) { var b = P.sphere(1, wat); b.userData.live = true; b.visible = false; o.tilt.add(c.fluid(b)); o.blobs.push(b); }
    o.pool = P.dropPool({ count: 120, radius: 2, color: c.spot, opacity: .85, parent: scene });
    o.dots = P.waterDots(40, { radius: 2.2, color: c.spot }); scene.add(o.dots);
    for (i = 0; i < 40; i++) { o.dz.push(-95 + Math.random() * 190); o.dx.push(-130 + Math.random() * 320); }
  },

  step: function (c, dt, S) {
    var o = this.o, i, high = S.controls.flow === "high", sim = S.playing ? dt : 0, p = o.p, n = o.n, PI2 = 2 * Math.PI;
    var target = (high ? 7 : 3.5) * Math.PI / 30;
    var k = S.controls.case === "closed" && !S.iso ? .95 : 1; o.flight.scale.set(1, k, k);   // closed: the spiral drawn a little smaller, so its edge never shows through the solid tube
    if (o.om < 0) o.om = target;
    o.om += (target - o.om) * Math.min(1, sim * 1.2);
    o.A += o.om * sim; o.spin.rotation.x = -o.A;
    function ss(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    var ca = o.ca, sa = o.sa;
    for (i = 0; i < n; i++) {
      var cc = (((i * p - p * o.A / PI2 - p / 2) % (n * p)) + n * p) % (n * p), x = -210 + cc;
      var f = ss((60 - x) / 34) * ss((x + 210) / 40), b = o.blobs[i];
      b.visible = f > .03; b.scale.set(14, 8 * f + .1, 20 * f + .1); b.position.set(x, -(34.5 - 8 * f), 0);
      if (sim > 0 && x < -192 && f > .05 && Math.random() < sim * 45 * f) {
        var lx = -210 * ca - 33 * sa, ly = 210 * sa - 33 * ca;
        o.pool.emit(lx, ly, 6 + Math.random() * 8, -8, 0, 55);
      }
    }
    o.pool.step(sim, 450, function (q) { return q.y < 34; });
    for (i = 0; i < 40; i++) { o.dz[i] += sim * (high ? 60 : 30); if (o.dz[i] > 95) o.dz[i] -= 190; o.dots.put(i, o.dx[i], -44, o.dz[i], 1); }
    o.dots.flush();
    S.set("rpm", (o.om * 30 / Math.PI).toFixed(1) + " rpm");
    S.set("n", String(Math.floor(o.A / PI2)));
  }
});
