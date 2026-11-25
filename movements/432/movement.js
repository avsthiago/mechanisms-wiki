M507.define({
  number: 432,
  title: "Breast-wheel",
  lede: "Water runs in from the side, about level with the axle, and fills the buckets. A curved wall hugs the wheel so the water cannot slip out as the buckets go down. It works where the water does not fall very far.",
  alt: "Big water wheel with buckets. A stream arrives from the right at the height of the axle, and a curved stone wall under the right side of the wheel holds the water in the buckets.",
  parts: [
    { key: "bucket", color: "#C8873A", name: "Buckets", note: "Boards that make pockets round the rim. They fill at the side of the wheel and carry the water down." },
    { key: "frame", color: "#5E7387", name: "Rim, spokes and shaft", note: "The side rings and spokes hold the buckets. The shaft carries the turning away." },
    { key: "mark", color: "#C2503F", name: "Red mark", note: "Watch it to follow one bucket on its way round." }
  ],
  controls: [{ id: "flow", label: "Water flow", value: "high", options: [["low", "Low"], ["high", "High"]] }],
  speed: false,
  readouts: [{ id: "rpm", label: "Wheel" }, { id: "full", label: "Full buckets" }],
  views: { "3d": [201, 92, 420], front: [0, -5, 470], side: [470, -10, 30] },
  target: [5, -15, 0],
  how: [
    "A stream comes in from the right and flows into the buckets at the height of the axle. The buckets on the right fill up and become heavy.",
    "The curved wall under the wheel keeps the water in the buckets as they go down. At the bottom the wall ends and the water pours out into the stream on the left. The empty buckets rise on the other side.",
    "Try Low flow, then High flow. Watch how many buckets are full and how fast the wheel turns."
  ],
  note: "This model is rebuilt from Brown's drawing. The stone bank, the curved wall, the back wall that holds the shaft and the water are made up. The tall pipe on the right of the drawing is left out. The water is drawn as drops and blobs, and the wheel speeds are chosen to look right, not worked out from real flow.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 100, W = 60, i;
    var o = this.o = { a: 0, om: -1, acc: 0, blobs: [], R: R };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .55, depthWrite: false });
    // ground: top at y -3.63 to the right of the wheel, then a curved wall of radius 104 round the lower right of the wheel to the bottom (0, -104),
    // a 8 step down to the tailrace floor y -112. z -40..40. Back wall z -48..-40.
    var pts = [[210, -3.63]], k;
    for (k = 2; k <= 90; k += 4) pts.push([104 * Math.cos(k * Math.PI / 180), -104 * Math.sin(k * Math.PI / 180)]);
    pts.push([0, -112], [-210, -112], [-210, -140], [210, -140]);
    P.at(P.prism(pts, -40, 40, c.fixed), 0, 0, 0, scene);
    P.at(P.box(420, 180, 8, c.fixed), 0, -50, -44, scene);            // x -210..210, y -140..40, z -48..-40
    P.at(P.box(106, 8.6, 76, wat), 157, 1.67, 0, scene);              // headrace water x 104..210, y -2.63..6, z -38..38
    P.at(P.box(210, 9, 68, wat), -105, -107.5, 0, scene);             // tailrace water x -210..0, y -112..-103 (a little above the floor)
    o.wheel = P.bucketWheel({ radius: R, inner: 70, width: W, buckets: 16, spokes: 6, frame: c.mat("frame"), bucket: c.mat("bucket"), mark: c.mat("mark") });
    scene.add(o.wheel);
    P.at(P.cylZ(6, 76, c.mat("frame")), 0, 0, -2, scene);            // z -40..36, ends on the back wall face
    P.at(P.cylZ(8, 4, c.mat("frame")), 0, 0, 34, scene);
    for (i = 0; i < 16; i++) { var b = P.sphere(1, wat); b.userData.live = true; b.visible = false; scene.add(b); o.blobs.push(b); }
    o.pool = P.dropPool({ count: 130, radius: 2, color: c.spot, opacity: .85, parent: scene });
  },

  step: function (c, dt, S) {
    var o = this.o, R = o.R, N = 16, st = Math.PI * 2 / N, i, full = 0;
    var high = S.controls.flow === "high", fmax = high ? 1 : .55, sim = S.playing ? dt : 0;
    var target = (high ? 6 : 3) * Math.PI / 30;
    if (o.om < 0) o.om = target;
    o.om += (target - o.om) * Math.min(1, sim * 1.2);
    o.a += o.om * sim; o.wheel.rotation.z = -o.a;
    function ss(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    for (i = 0; i < N; i++) {
      var phi = (i * st + o.wheel.centreAngle - o.a) * 180 / Math.PI; phi = ((phi + 180) % 360 + 360) % 360 - 180;
      var f = fmax * ss((20 - phi) / 25) * (1 - ss((-95 - phi) / 55));
      var b = o.blobs[i], ang = phi * Math.PI / 180, rr = o.wheel.centreRadius - 2;
      b.visible = f > .03; b.position.set(rr * Math.cos(ang), rr * Math.sin(ang), 0); b.scale.set(8 * Math.sqrt(f) + .1, 8 * f + .1, 24);
      if (f > .5) full++;
      if (sim > 0 && phi < -100 && phi > -150 && f > .05 && Math.random() < sim * 9 * f) {
        var oa = (phi + 4) * Math.PI / 180, v = o.om * R;
        o.pool.emit(R * Math.cos(oa), R * Math.sin(oa), (Math.random() - .5) * 46, Math.sin(oa) * v, -Math.cos(oa) * v, 0);
      }
    }
    o.acc += sim * (high ? 34 : 15);
    var vx = high ? 70 : 42;
    while (o.acc >= 1) { o.acc -= 1; o.pool.emit(205, 7, (Math.random() - .5) * 46, -vx, 0, 0, 0); }
    o.pool.step(sim, 450, function (p, d) { return d.g === 0 ? p.x < 101 : p.y < -101; });
    S.set("rpm", (o.om * 30 / Math.PI).toFixed(1) + " rpm");
    S.set("full", String(full));
  }
});
