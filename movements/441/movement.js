M507.define({
  number: 441,
  title: "Persian wheel",
  lede: "A wheel with curved arms stands half in a stream. The stream pushes the arms and the wheel turns. Buckets hang from the arm tips, fill in the water and carry the water up to a trough.",
  alt: "A wheel with six curved arms round a hollow hub. A bucket hangs from the tip of each arm. The lower half of the wheel is in a stream. At the top left a bucket is tipping out its water into a trough.",
  parts: [
    { key: "float", color: "#C8873A", name: "Curved arms", note: "The stream pushes on the curved arms below the water. This is what turns the wheel." },
    { key: "bucket", color: "#4FA58A", name: "Buckets", note: "Each bucket hangs from the tip of an arm. It swings freely, so it always stays upright until it is tipped." },
    { key: "hub", color: "#5E7387", name: "Hollow hub and stand", note: "The hub is a hollow ring. The back post holds it up." },
    { key: "mark", color: "#C2503F", name: "Red mark", note: "Watch it to follow one bucket round." }
  ],
  controls: [{ id: "flow", label: "Stream speed", value: "high", options: [["low", "Slow"], ["high", "Fast"]] }],
  speed: false,
  readouts: [{ id: "rpm", label: "Wheel" }, { id: "n", label: "Emptied" }],
  views: { "3d": [45, -5, 780], front: [0, -12, 780], side: [780, 10, 40] },
  target: [-5, -12, 0],
  distance: [200, 1600],
  how: [
    "The stream runs past the lower half of the wheel. It pushes on the curved arms and the wheel turns. Each bucket hangs from the tip of its arm, so it stays upright while the wheel turns. At the bottom it dips under the water and fills.",
    "The full bucket is carried up the far side. Near the top it meets a fixed pin. The pin tips the bucket and the water runs out into the trough. Then the empty bucket swings upright and goes down again.",
    "Try Slow, then Fast. Count how many buckets are emptied in the same time."
  ],
  note: "This model is rebuilt from Brown's drawing. The back post, the trough, the pin, the stream bed and the water are made up. Brown also says the hollow shaft receives water; that is not shown. The number of arms and buckets, and the wheel speeds, are chosen to look right, not worked out from real flow.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 150, i, N = 6;
    var o = this.o = { a: 0, om: -1, acc: 0, n: 0, prev: [], tips: [], buckets: [], blobs: [], R: R };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .5, depthWrite: false });
    // supports. Bed y -196..-190 (z -42..30); water sheet y -64..-60 (z -28..28); back post x -16..16, y -190..16, z -42..-30 sits on the bed
    P.at(P.box(470, 6, 72, c.fixed), 0, -193, -6, scene);
    P.at(P.box(470, 4, 56, wat), 0, -62, 0, scene);
    P.at(P.box(32, 206, 12, c.fixed), 0, -87, -36, scene);
    // trough: floor x -200..-84, y 93..96, z 8..20; low side walls z 8..9.5 and 18.5..20, y 96..101; end wall x -200..-198.5; pin x -90 stands on the floor
    P.at(P.box(116, 3, 12, c.fixed), -142, 94.5, 14, scene);
    P.at(P.box(116, 5, 1.5, c.fixed), -142, 98.5, 8.75, scene);
    P.at(P.box(116, 5, 1.5, c.fixed), -142, 98.5, 19.25, scene);
    P.at(P.box(1.5, 5, 12, c.fixed), -199.25, 98.5, 14, scene);
    P.at(P.box(112, 2, 9, wat), -142, 97, 14, scene);                   // water standing in the trough, y 96..98
    P.at(P.cylY(2, 14, c.fixed), -90, 103, 14, scene);                  // y 96..110
    // hollow hub: ring rIn 16, rOut 32, z -30..18 (its back face touches the post)
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(P.annulus({ rIn: 16, rOut: 32, depth: 48, z0: -30, material: c.mat("hub") }));
    var bm = c.mat("bucket");
    for (i = 0; i < N; i++) {
      var tip = (90 + i * 60) * Math.PI / 180, th0 = tip - 1.6, path = [], k;
      for (k = 0; k <= 16; k++) { var s = k / 16, r = 26 + (R - 26) * s, ang = th0 + 1.6 * Math.sqrt(s); path.push([r * Math.cos(ang), r * Math.sin(ang)]); }
      o.wheel.add(P.curvedVane({ path: path, thickness: 5, depth: 6, z0: 0, material: c.mat("float") }));   // z 0..6
      P.at(P.cylZ(3, 4, c.mat("hub")), R * Math.cos(tip), R * Math.sin(tip), 5, o.wheel);              // pivot pin z 3..7
      o.tips.push(tip); o.prev.push(0);
      // bucket: pivot at its top middle. Back board z 7..8.5, front board z 17.5..19, bottom y -24..-22, side boards x +-(9.5..11)
      var g = new T.Group(); scene.add(g);
      P.at(P.box(22, 24, 1.5, bm), 0, -12, 7.75, g); P.at(P.box(22, 24, 1.5, bm), 0, -12, 18.25, g);
      P.at(P.box(22, 2, 12, bm), 0, -23, 13, g);
      P.at(P.box(1.5, 24, 12, bm), -10.25, -12, 13, g); P.at(P.box(1.5, 24, 12, bm), 10.25, -12, 13, g);
      var w = P.box(1, 1, 1, wat); w.visible = false; g.add(w); w.userData.live = true;
      if (i === 0) P.at(P.box(9, 9, 1.2, c.mat("mark")), 0, -12, 19.6, g);
      o.buckets.push(g); o.blobs.push(w);
    }
    o.pool = P.dropPool({ count: 140, radius: 2, color: c.spot, opacity: .85, parent: scene });
    o.dots = P.waterDots(40, { radius: 2.2, color: c.spot });
    scene.add(o.dots);
    o.dz = []; o.dx = [];
    for (i = 0; i < 40; i++) { o.dz.push(-24 + Math.random() * 48); o.dx.push(-230 + Math.random() * 460); }
  },

  step: function (c, dt, S) {
    var o = this.o, R = o.R, i, high = S.controls.flow === "high", sim = S.playing ? dt : 0, D = Math.PI / 180;
    var target = (high ? 4 : 2) * Math.PI / 30;
    if (o.om < 0) o.om = target;
    o.om += (target - o.om) * Math.min(1, sim * 1.2);
    o.a += o.om * sim; o.wheel.rotation.z = o.a;
    function ss(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    for (i = 0; i < 6; i++) {
      var phi = o.tips[i] + o.a, ph = ((phi / D) % 360 + 360) % 360, u = ((ph - 194) % 360 + 360) % 360;
      var f = ss(u / 25) * (1 - ss((u - 287) / 12));
      var tilt = 105 * D * ss((u - 287) / 12) * (1 - ss((u - 310) / 12));
      var g = o.buckets[i], w = o.blobs[i];
      g.position.set(R * Math.cos(phi), R * Math.sin(phi), 0); g.rotation.z = tilt;
      w.visible = f > .03; w.scale.set(18, 20 * f + .1, 8); w.position.set(0, -22 + 10 * f, 13);          // inside the walls: x +-9, z 9..17, y from -22
      if (o.prev[i] < 293 && u >= 293 && u < 330 && sim > 0) o.n++;
      o.prev[i] = u;
      if (sim > 0 && u > 287 && u < 312 && f > .05 && Math.random() < sim * 70 * f) {
        var lx = g.position.x - 11 * Math.cos(tilt), ly = g.position.y - 11 * Math.sin(tilt), sp = o.om * R;
        o.pool.emit(lx, ly, 10 + Math.random() * 6, -Math.sin(phi) * sp - 12, Math.cos(phi) * sp, 0);
      }
    }
    o.pool.step(sim, 450, function (p) { return p.y < 98; });
    for (i = 0; i < 40; i++) {
      o.dx[i] += sim * (high ? 60 : 30); if (o.dx[i] > 230) o.dx[i] -= 460;
      o.dots.put(i, o.dx[i], -59, o.dz[i], 1);
    }
    o.dots.flush();
    S.set("rpm", (o.om * 30 / Math.PI).toFixed(1) + " rpm");
    S.set("n", String(o.n));
  }
});
