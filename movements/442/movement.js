M507.define({
  number: 442,
  title: "Pot wheel on the Eisach",
  lede: "A big wheel stands in a river and the current turns it. Pots on its rim dip into the water, fill, and are carried up. At the top they tip out into a trough. The river lifts a little of its own water.",
  alt: "A big wheel on a long horizontal log, seen from the side. A row of pots stands round the rim. A sloping wooden trough runs out to the left from the top of the wheel. The river runs past the lower part of the wheel.",
  parts: [
    { key: "pot", color: "#C8873A", name: "Pots", note: "Each pot is open at one end and lies along the rim. It scoops water at the bottom and holds it on the way up." },
    { key: "wheel", color: "#5E7387", name: "Rim, spokes and log", note: "Two rings hold the pots. The log through the middle rests on a post at each end." },
    { key: "trough", color: "#4FA58A", name: "Trough", note: "A sloping channel. The water from the pots runs along it, away from the wheel." },
    { key: "mark", color: "#C2503F", name: "Red mark", note: "Watch it to follow the wheel round." }
  ],
  controls: [{ id: "flow", label: "River speed", value: "high", options: [["low", "Slow"], ["high", "Fast"]] }],
  speed: false,
  readouts: [{ id: "rpm", label: "Wheel" }, { id: "n", label: "Pots emptied" }],
  views: { "3d": [140, 40, 560], front: [0, 10, 700], side: [700, 10, 0] },
  target: [15, -5, 0],
  distance: [250, 1800],
  how: [
    "The river pushes on the pots at the bottom of the wheel. The wheel turns, and the near side goes up. Each pot dips under the water, and its open end faces forward. It scoops water in as it moves.",
    "The pot stays full while it climbs, because its open end points upwards. Near the top it turns over. Its open end points down and backward, and the water pours out into the trough.",
    "Try Slow, then Fast. Count how many pots are emptied in the same time."
  ],
  note: "This model is rebuilt from Brown's drawing. The posts, the stream bed, the water and the bank are made up. The spokes are drawn on one side only, so the trough can reach inside the rim. The number of pots, their shape and the wheel speeds are chosen to look right, not worked out from real flow.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, NP = 12, R = 134, rc = 115, X0 = 40, W = 44, D = Math.PI / 180;
    var o = this.o = { a: 0, om: -1, n: 0, prev: [], pots: [], blobs: [], phis: [], X0: X0, rc: rc, sl: .05, fl: 0 };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .5, depthWrite: false });
    // supports. Bed y -148..-140 (x -260..260, z -150..150); posts x +-(175..189), y -140..0, z -20..20 stand on it
    P.at(P.box(520, 8, 300, c.fixed), 0, -144, 0, scene);
    P.at(P.box(14, 140, 40, c.fixed), -182, -70, 0, scene);
    P.at(P.box(14, 140, 40, c.fixed), 182, -70, 0, scene);
    P.at(P.box(340, 45, 300, wat), 0, -117.5, 0, scene);                // water y -140..-95
    // log: radius 14, x -175..175, ends on the post faces
    var wm = c.mat("wheel");
    P.at(P.cylX(14, 350, wm), 0, 0, 0, scene);
    o.wheel = new T.Group(); o.wheel.position.x = X0; scene.add(o.wheel);
    // rings x -22..-19.5 and 19.5..22 relative to the wheel; rIn 126, rOut R
    [-1, 1].forEach(function (s) {
      var ring = new T.Group(); ring.rotation.y = Math.PI / 2; ring.position.x = s * (W / 2 - 1.5);
      ring.add(P.annulus({ rIn: 126, rOut: R, depth: 3, z0: -1.5, material: wm })); o.wheel.add(ring);
    });
    P.at(P.cylX(18, 6, wm), W / 2 - 3, 0, 0, o.wheel);                 // boss x 19..25
    for (i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, sp = P.rod(2.2, wm);
      sp.span(W / 2 - 2, 14 * Math.cos(a), 14 * Math.sin(a), W / 2 - 2, 127 * Math.cos(a), 127 * Math.sin(a)); o.wheel.add(sp);
    }
    P.at(P.box(2, 14, 3, c.mat("mark")), -W / 2 - .5, 0, R + 1.5, o.wheel);                               // red mark on the left ring (outer face x -22)
    // pot: a cup opening along local +Y (x width 28, depth 26), walls 1.5 thick, rim closed so it looks solid
    var prof = [], pm = c.mat("pot");
    [[0, -13], [7, -12.5], [12, -9], [14, -3], [14, 8], [13, 13], [11.5, 13], [12.5, 8], [12.5, -3], [10.5, -8], [6, -10.5], [0, -11]].forEach(function (q) { prof.push(new T.Vector2(q[0], q[1])); });
    var cup = new T.LatheGeometry(prof, 20);
    for (i = 0; i < NP; i++) {
      var phi0 = i * 2 * Math.PI / NP, g = new T.Group();
      g.position.set(0, rc * Math.sin(phi0), rc * Math.cos(phi0)); g.rotation.x = -(phi0 - 20 * D); o.wheel.add(g);
      g.add(P.mesh(cup, pm));
      var w = P.sphere(1, wat); w.visible = false; w.userData.live = true; g.add(w);
      o.pots.push(g); o.blobs.push(w); o.phis.push(phi0); o.prev.push(0);
    }
    // trough: floor sloping down to the left from the wheel; it rests on a post of its own
    // group pivot (X0+12, 46, -70); local floor x -300..0 y -2..2 z -10..10, walls y 2..8
    o.tr = new T.Group(); o.tr.position.set(X0 + 12, 46, -70); o.tr.rotation.z = o.sl; scene.add(o.tr);
    var tm = c.mat("trough");
    P.at(P.box(300, 4, 22, tm), -150, 0, 0, o.tr);
    P.at(P.box(300, 6, 2, tm), -150, 5, 10, o.tr); P.at(P.box(300, 6, 2, tm), -150, 5, -10, o.tr);   // walls y 2..8 on the floor, z +-(9..11)
    P.at(P.box(2, 6, 18, tm), 1, 5, 0, o.tr);
    P.at(P.box(16, 176.4, 16, c.fixed), -100, -51.8, -70, scene);        // own post: y -140..36.4, top meets the sloping floor underside (y 36.4 at x -100)
    o.pool = P.dropPool({ count: 140, radius: 2, color: c.spot, opacity: .85, parent: scene });
    o.dots = P.waterDots(30, { radius: 2.2, color: c.spot }); scene.add(o.dots);
    o.tdots = P.waterDots(24, { radius: 2.2, color: c.spot }); scene.add(o.tdots);
    o.dz = []; o.dx = [];
    for (i = 0; i < 30; i++) { o.dz.push(-140 + Math.random() * 280); o.dx.push(-165 + Math.random() * 330); }
  },

  step: function (c, dt, S) {
    var o = this.o, rc = o.rc, i, high = S.controls.flow === "high", sim = S.playing ? dt : 0, D = Math.PI / 180;
    var target = (high ? 4 : 2) * Math.PI / 30;
    if (o.om < 0) o.om = target;
    o.om += (target - o.om) * Math.min(1, sim * 1.2);
    o.a += o.om * sim; o.wheel.rotation.x = -o.a;
    function ss(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    var pour = 0;
    for (i = 0; i < 12; i++) {
      var phi = o.phis[i] + o.a, ph = ((phi / D) % 360 + 360) % 360, u = ((ph + 127) % 360 + 360) % 360;
      var f = ss(u / 45) * (1 - ss((u - 227) / 45));
      var w = o.blobs[i]; w.visible = f > .03; w.scale.set(10 * f + .1, 9 * f + .1, 10 * f + .1); w.position.set(0, -3 - 2 * f, 0);
      if (o.prev[i] < 250 && u >= 250 && u < 300 && sim > 0) o.n++;
      o.prev[i] = u;
      if (sim > 0 && u > 232 && u < 275 && f > .05) {
        pour += f;
        if (Math.random() < sim * 60 * f) {
          var da = phi - 20 * D, dy = Math.cos(da), dz = -Math.sin(da), py = rc * Math.sin(phi), pz = rc * Math.cos(phi), sp = o.om * rc;
          o.pool.emit(o.X0 + (Math.random() - .5) * 20, py + 13 * dy, pz + 13 * dz, 0, Math.cos(phi) * sp + dy * 14, -Math.sin(phi) * sp + dz * 14);
        }
      }
    }
    o.fl += (Math.min(1, pour) - o.fl) * Math.min(1, sim * 2);
    o.pool.step(sim, 450, function (p) { return p.y < 49 && p.x > o.X0 - 20; });
    for (i = 0; i < 30; i++) {
      o.dz[i] += sim * (high ? 60 : 30); if (o.dz[i] > 140) o.dz[i] -= 280;
      o.dots.put(i, o.dx[i], -94, o.dz[i], 1);
    }
    o.dots.flush();
    for (i = 0; i < 24; i++) {
      var t = ((i / 24 + (S.playing ? performance.now() / 6000 * (high ? 1 : .5) : 0)) % 1), lx = -10 - t * 280;
      o.tdots.put(i, o.X0 + 12 + lx, 46 + 4 + lx * o.sl, -70, o.fl > .1 ? 1 : 0);
    }
    o.tdots.flush();
    S.set("rpm", (o.om * 30 / Math.PI).toFixed(1) + " rpm");
    S.set("n", String(o.n));
  }
});
