M507.define({
  number: 430,
  title: "Overshot water-wheel",
  lede: "Water falls into buckets at the top of the wheel. The full buckets on one side are heavy, so they pull the wheel round. It turns machines such as a mill without any engine.",
  alt: "Water wheel in a stone pit. Water from a wooden channel pours into the buckets at the top. Full buckets on the right side go down and spill at the bottom.",
  parts: [
    { key: "bucket", color: "#C8873A", name: "Buckets", note: "Boards that make pockets round the rim. They catch the water at the top and carry it down." },
    { key: "frame", color: "#5E7387", name: "Rim, spokes and shaft", note: "The two side rings and spokes hold the buckets. The shaft carries the turning to a machine." },
    { key: "mark", color: "#C2503F", name: "Red mark", note: "Watch it to follow one bucket on its way round." }
  ],
  controls: [{ id: "flow", label: "Water flow", value: "high", options: [["low", "Low"], ["high", "High"]] }],
  speed: false,
  readouts: [{ id: "rpm", label: "Wheel" }, { id: "full", label: "Full buckets" }],
  views: { "3d": [214, 126, 447], front: [0, 15, 500], side: [500, 20, 40] },
  target: [5, 12, 0],
  how: [
    "Water runs along a wooden channel and pours into the buckets at the top of the wheel. The buckets on the right are full, so they are heavy. The buckets on the left are empty, so they are light.",
    "The heavy side sinks and pulls the wheel round. Near the bottom each bucket tips out its water and starts up again, empty. The wheel turns because one side is always heavier than the other.",
    "Try Low flow, then High flow. Watch how full the buckets get and how fast the wheel turns."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows only the wheel and the pit. The wooden channel, the stone walls, the back wall that holds the shaft and the water are made up. The water is drawn as drops and blobs, and the wheel speeds are chosen to look right, not worked out from real flow.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 100, W = 60;
    var o = this.o = { a: 0, om: -1, acc: 0, spill: 0, blobs: [], R: R };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .55, depthWrite: false });
    // supports (all c.fixed). Edges: floor y -125..-112, z -40..40; left wall x -190..-108, y -112..112 (sits on the floor); back wall z -48..-40, y -125..112
    P.at(P.box(390, 13, 80, c.fixed), 5, -118.5, 0, scene);          // x -190..200
    P.at(P.box(82, 224, 80, c.fixed), -149, 0, 0, scene);            // x -190..-108, y -112..112
    P.at(P.box(390, 237, 8, c.fixed), 5, -6.5, -44, scene);          // z -48..-40
    // channel: floor y 112..116 sits on the wall top, sides z 30..37 touch the water
    P.at(P.box(236, 4, 74, c.fixed), -72, 114, 0, scene);            // x -190..46
    P.at(P.box(236, 14, 7, c.fixed), -72, 123, 33.5, scene);         // y 116..130, z 30..37
    P.at(P.box(236, 14, 7, c.fixed), -72, 123, -33.5, scene);
    P.at(P.box(236, 6, 60, wat), -72, 119, 0, scene);                // water in the channel y 116..122
    P.at(P.box(308, 8, 68, wat), 46, -107, 0, scene);                // tailrace water x -108..200, y -111..-103
    // wheel
    o.wheel = P.bucketWheel({ radius: R, inner: 70, width: W, buckets: 16, spokes: 6, frame: c.mat("frame"), bucket: c.mat("bucket"), mark: c.mat("mark") });
    scene.add(o.wheel);
    P.at(P.cylZ(6, 76, c.mat("frame")), 0, 0, -2, scene);            // z -40..36, ends on the back wall face
    P.at(P.cylZ(8, 4, c.mat("frame")), 0, 0, 34, scene);
    for (var i = 0; i < 16; i++) {
      var b = P.sphere(1, wat); b.userData.live = true; b.visible = false; scene.add(b); o.blobs.push(b);
    }
    o.pool = P.dropPool({ count: 120, radius: 2.1, color: c.spot, opacity: .85, parent: scene });
  },

  step: function (c, dt, S) {
    var o = this.o, R = o.R, N = 16, st = Math.PI * 2 / N, i, full = 0;
    var high = S.controls.flow === "high", fmax = high ? 1 : .55, sim = S.playing ? dt : 0;
    var target = (high ? 6 : 3) * Math.PI * 2 / 60;
    if (o.om < 0) o.om = target;
    o.om += (target - o.om) * Math.min(1, sim * 1.2);
    o.a += o.om * sim; o.wheel.rotation.z = -o.a;
    function ss(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    var fills = [];
    for (i = 0; i < N; i++) {
      var phi = (i * st + o.wheel.centreAngle - o.a) * 180 / Math.PI; phi = ((phi + 180) % 360 + 360) % 360 - 180;
      var f = fmax * ss((100 - phi) / 45) * (1 - ss((-10 - phi) / 60)); fills.push(f);
      var b = o.blobs[i], ang = phi * Math.PI / 180, rr = o.wheel.centreRadius - 2;
      b.visible = f > .03; b.position.set(rr * Math.cos(ang), rr * Math.sin(ang), 0); b.scale.set(8 * Math.sqrt(f) + .1, 8 * f + .1, 24);
      if (f > .5) full++;
      // spill from emptying buckets
      if (sim > 0 && phi < -10 && phi > -70 && f > .05 && Math.random() < sim * 9 * f) {
        var oa = (phi + 4) * Math.PI / 180, v = o.om * R;
        o.pool.emit(R * Math.cos(oa), R * Math.sin(oa), (Math.random() - .5) * 46, Math.sin(oa) * v + 6, -Math.cos(oa) * v, 0);
      }
    }
    // jet from the channel
    o.acc += sim * (high ? 90 : 45);
    while (o.acc >= 1) { o.acc -= 1; o.pool.emit(46, 119 + Math.random() * 3, (Math.random() - .5) * 46, 30 + Math.random() * 6, 0, 0); }
    o.pool.step(sim, 450, function (p) { return p.y < -100 || (p.y > 0 && p.y < 100 && p.x * p.x + p.y * p.y < R * R - 30); });
    S.set("rpm", (o.om * 60 / (Math.PI * 2)).toFixed(1) + " rpm");
    S.set("full", String(full));
  }
});
