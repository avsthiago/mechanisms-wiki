M507.define({
  number: 438,
  title: "Barker's mill",
  lede: "Water poured into a funnel runs down a hollow upright shaft and out of the ends of bent arms. As the jets shoot out one way, the whole shaft is pushed the other way and spins. It turns water falling from a height into a turning shaft.",
  alt: "A hollow upright shaft with a funnel on top and four bent arms near the bottom, standing on a block. A bracket from a wall holds it steady. Water pours into the funnel and sprays from the ends of the arms.",
  parts: [
    { key: "funnel", color: "#C8873A", name: "Funnel", note: "Catches the water and sends it down into the shaft. It turns with the shaft." },
    { key: "shaft", color: "#5E7387", name: "Hollow shaft", note: "An upright pipe that rests on a point at the bottom, so it spins easily. Watch the red stripe to see it turn." },
    { key: "arms", color: "#4FA58A", name: "Bent arms", note: "Pipes that carry the water out sideways. Each ends in a bend that makes the jet shoot along the circle, not straight out." }
  ],
  controls: [{ type: "range", id: "flow", label: "Water poured in", min: 1, max: 5, step: 1, value: 3, unit: "",
    presets: [[1, "A trickle"], [3, "Steady"], [5, "Full"]] }],
  speed: false,
  readouts: [{ id: "q", label: "Water" }, { id: "w", label: "Shaft" }],
  views: { "3d": [294, 134, 545], front: [40, 0, 520], top: [40, 460, 40] },
  target: [40, -5, 0],
  distance: [200, 1500],
  how: [
    "Water poured into the funnel falls down the hollow shaft and into four arms. At the end of each arm the pipe bends, so the water sprays out sideways along the circle.",
    "The water is pushed one way, so it pushes back on the arm the other way. That is called reaction. Each of the four arms is pushed round in the opposite direction to its jet, and the shaft spins on its point.",
    "More water means stronger jets and a faster spin. Try a trickle, then a full pour, and compare how fast the red stripe goes round."
  ],
  note: "This model is rebuilt from Brown's drawing. The wall, its bracket, the block under the shaft and the chute are made up so the mill stands up. The water drops are simple dots that fall under their own weight. The way the shaft speeds up is simplified: the push from the jets is balanced by a small drag.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { w: 0, a: 0.35, parts: [], acc: [0, 0, 0, 0], nz: [] };
    var wm = new T.MeshLambertMaterial({ color: new T.Color(c.spot) });
    o.wm = wm;
    o.rot = new T.Group(); scene.add(o.rot);
    var R = o.rot;
    // hollow shaft: y -100 .. 62, tip cone y -120 .. -100
    P.at(P.cylY(14, 162, c.mat("shaft")), 0, -19, 0, R);
    var tip = new T.Mesh(new T.CylinderGeometry(14, 2, 20, 32), c.mat("shaft")); P.at(tip, 0, -110, 0, R);   // y -120 .. -100, point on the block top
    // funnel: open cone y 60 .. 100
    P.at(new T.Mesh(new T.CylinderGeometry(46, 14, 40, 40, 1, true), c.mat("funnel")), 0, 80, 0, R);
    P.at(new T.Mesh(new T.CylinderGeometry(21, 14.5, 8, 32), wm), 0, 66, 0, R);   // water standing in the funnel, y 62 .. 70
    // red stripe on the shaft
    P.at(P.box(2, 128, 3, c.mat("shaft", "mark")), 15.6, -36, 0, R);              // x 14.6 .. 16.6, y -100 .. 28
    // four arms, each a radial pipe and a bend that points along the circle
    var ys = [-60, -84, -60, -84];
    for (k = 0; k < 4; k++) {
      var g = new T.Group(); g.rotation.y = k * Math.PI / 2; R.add(g);
      P.at(P.cylX(5, 66, c.mat("arms")), 43, ys[k], 0, g);                         // x 10 .. 76
      P.at(P.sphere(5, c.mat("arms")), 76, ys[k], 0, g);
      P.at(P.cylZ(5, 26, c.mat("arms")), 76, ys[k], 13, g);                        // bend, z 0 .. 26
      P.at(P.cylZ(6.2, 3, c.mat("arms", "dark")), 76, ys[k], 25, g);               // nozzle ring
      o.nz.push({ g: g, y: ys[k] });
    }
    // fixed: block, collar, bracket, wall, chute
    P.at(P.box(60, 12, 60, c.fixed), 0, -126, 0, scene);                          // x ±30, y -132 .. -120
    var ring = P.hoop(19, 3, c.fixed); ring.rotation.x = Math.PI / 2; P.at(ring, 0, 40, 0, scene);   // inner radius 16, outer 22
    P.at(P.box(100, 5, 8, c.fixed), 72, 40, 0, scene);                             // x 22 .. 122
    P.at(P.box(12, 260, 120, c.fixed), 128, -2, 0, scene);                        // wall face at x 122, y -132 .. 128
    var chute = P.box(110, 6, 16, c.fixed); chute.rotation.z = 0.42; P.at(chute, 68, 148, 0, scene);   // lower end near x 17, y 126
    o.stream = P.at(P.rod(1, wm), 0, 0, 0, scene);
    // droplets
    var gp = new T.SphereGeometry(1.7, 8, 6);
    for (i = 0; i < 420; i++) { var m = new T.Mesh(gp, wm); m.visible = false; scene.add(m); o.parts.push({ m: m, on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }); }
    o.next = 0;
    o.q = 3; o.w = 0.25 * 3;     // starts already turning at its steady speed
    o.v = new T.Vector3(); o.d = new T.Vector3(); o.p = new T.Vector3();
  },

  step: function (c, dt, S) {
    var o = this.o, q = +S.controls.flow, i, k;
    if (S.playing && dt > 0) {
      // push of the jets against a small drag; the same push for any number of arms
      var tau = 1.4, wss = 0.25 * q;
      o.w += (wss - o.w) * Math.min(1, dt / tau);
      o.a += o.w * dt;
      o.rot.rotation.y = o.a; o.rot.updateMatrixWorld(true);
      var vrel = 75 + 12 * q, rate = 14 * q;
      for (k = 0; k < 4; k++) {
        o.acc[k] += rate * dt;
        var nz = o.nz[k];
        while (o.acc[k] >= 1) {
          o.acc[k] -= 1;
          var pr = o.parts[o.next]; o.next = (o.next + 1) % o.parts.length;
          o.p.set(76, nz.y, 26); nz.g.localToWorld(o.p);
          o.d.set(0, 0, 1).applyQuaternion(nz.g.getWorldQuaternion(new c.THREE.Quaternion()));
          var jit = 0.07, r1 = (Math.random() - .5) * jit, r2 = (Math.random() - .5) * jit;
          // water leaves at vrel along the bend, plus the nozzle's own sideways speed
          var sx = -o.w * o.p.z, sz = o.w * o.p.x;
          pr.x = o.p.x; pr.y = o.p.y; pr.z = o.p.z;
          pr.vx = o.d.x * vrel * (1 + r1) + sx; pr.vz = o.d.z * vrel * (1 + r1) + sz; pr.vy = vrel * r2 * 1.5 + 6;
          pr.on = true; pr.m.visible = true;
        }
      }
      for (i = 0; i < o.parts.length; i++) {
        var p = o.parts[i]; if (!p.on) continue;
        var dr = Math.exp(-1.2 * dt); p.vx *= dr; p.vz *= dr; p.vy = p.vy * dr - 330 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.y < -230) { p.on = false; p.m.visible = false; } else p.m.position.set(p.x, p.y, p.z);
      }
    }
    var r = 1.1 + 0.35 * q;
    o.stream.span(10, 126, 0, 10, 66, 0); o.stream.scale.x = r; o.stream.scale.z = r;
    S.set("q", (q * 4) + " L/min");
    S.set("w", Math.round(o.w * 60 / (2 * Math.PI)) + " rpm");
  }
});
