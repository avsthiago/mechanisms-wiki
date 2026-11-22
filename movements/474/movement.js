M507.define({
  number: 474,
  title: "Hero's aeolipile",
  lede: "A hollow ball spins on two pipes above a pot of boiling water. Steam fills the ball and rushes out of bent arms, and the ball turns the other way. It was made in ancient Egypt more than 2000 years ago, and is often called the first steam engine.",
  alt: "A round pot with a lid, standing on four curved legs over a small fire. Two upright pipes rise from the lid and hold a ball between them. Four bent arms stick out round the ball, and steam puffs from their ends.",
  parts: [
    { key: "pot", color: "#5E7387", name: "Boiler", note: "A closed pot of water over the fire. The steam has nowhere to go but up the two pipes." },
    { key: "ball", color: "#C8873A", name: "Ball", note: "Hollow and free to turn on the ends of the two pipes. Steam fills it from both sides." },
    { key: "arms", color: "#4FA58A", name: "Bent arms", note: "Short pipes with a right-angle bend at the end. Each one squirts steam sideways, along the circle. Watch the red ring on one of them to count the turns." },
    { key: "fire", color: "#D9B13B", name: "Fire", note: "Heats the water. A bigger fire makes steam faster, so the steam inside pushes harder." }
  ],
  controls: [{ id: "fire", label: "Fire", value: "high", options: [["low", "Low"], ["high", "High"]] }],
  speed: false,
  readouts: [{ id: "w", label: "Ball" }, { id: "p", label: "Steam" }],
  views: { "3d": [-360, 180, 520], front: [0, 0, 680], side: [680, 0, 0] },
  target: [0, 15, 0],
  how: [
    "The fire boils the water in the closed pot. The steam goes up the two pipes and into the ball. Its only way out is through the bent arms, so it shoots out of their ends in four jets.",
    "When a jet of steam is pushed out of an arm, the arm is pushed back the other way. This push is called reaction. All four jets point round the same way, so all four pushes turn the ball the opposite way. The ball speeds up until the air and the rubbing on the pipes hold it back as hard as the jets push.",
    "Watch it start from still as the steam builds up. Then try a low fire and a high fire, and compare how fast the red ring goes round."
  ],
  note: "This model is rebuilt from Brown's drawing. The fire under the pot, the number of arms and all the sizes were made up. The steam numbers are only a guide. The way the ball speeds up is simplified: a steady push from the jets against a drag that grows with speed.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { a: 0, w: 0, p: 0, t: 0, R: 56, Y: 84, nz: [], next: 0, acc: 0, fl: [] };
    var V = function (x, y) { return new T.Vector2(x, y); };
    // pot: bowl y -100 .. -18, rim band y -22 .. -16, lid y -16 .. -10
    var bowl = [V(0, -100), V(30, -97), V(52, -88), V(68, -72), V(78, -52), V(80, -34), V(79, -18)];
    scene.add(new T.Mesh(new T.LatheGeometry(bowl, 48), c.mat("pot")));
    P.at(new T.Mesh(new T.CylinderGeometry(82, 82, 6, 48), c.mat("pot")), 0, -19, 0, scene);          // rim band, y -22 .. -16
    P.at(new T.Mesh(new T.CylinderGeometry(76, 80, 6, 48), c.mat("pot")), 0, -13, 0, scene);          // lid, y -16 .. -10
    var hd = P.arc(18, 3, Math.PI, c.mat("pot")); hd.rotation.z = -Math.PI / 2; P.at(hd, 84, -40, 0, scene);   // handle on the side
    var hl = P.arc(14, 2.5, Math.PI, c.mat("pot")); hl.rotation.z = Math.PI / 2; P.at(hl, -84, -19, 0, scene); // small loop on the rim
    // four curved legs from the bowl to the ground at y -165
    for (i = 0; i < 4; i++) {
      var a = Math.PI / 4 + i * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
      var cv = new T.CatmullRomCurve3([new T.Vector3(44 * ca, -88, 44 * sa), new T.Vector3(66 * ca, -108, 66 * sa), new T.Vector3(76 * ca, -136, 76 * sa), new T.Vector3(92 * ca, -162, 92 * sa)]);
      scene.add(new T.Mesh(new T.TubeGeometry(cv, 24, 4, 10), c.mat("pot")));
      P.at(P.sphere(4, c.mat("pot")), 92 * ca, -162, 92 * sa, scene);                                // foot, bottom at y -166
    }
    P.at(P.box(260, 6, 260, c.fixed), 0, -169, 0, scene);                                             // ground, y -172 .. -166
    // fire: a dish on the ground and a ring of flames
    P.at(new T.Mesh(new T.CylinderGeometry(34, 26, 10, 32), c.mat("fire", "dark")), 0, -161, 0, scene);   // dish, y -166 .. -156
    for (i = 0; i < 7; i++) {
      var f = new T.Mesh(new T.ConeGeometry(7, 1, 12), c.mat("fire")); f.geometry.translate(0, .5, 0);
      var b = i * 2 * Math.PI / 7, rr = i ? 16 : 0; P.at(f, rr * Math.cos(b), -156, rr * Math.sin(b), scene); o.fl.push(f);
    }
    // two pipes from the lid up to the ball, bent inward at the top
    [-1, 1].forEach(function (s) {
      P.at(P.cylY(4.5, 94, c.mat("pot")), s * 74, 37, 0, scene);          // y -10 .. 84, up to the elbow
      P.at(P.sphere(4.5, c.mat("pot")), s * 74, o.Y, 0, scene);
      P.at(P.cylX(4.5, 10, c.mat("pot")), s * 69, o.Y, 0, scene);          // stub, x 64 .. 74, ends at the sleeve face
    });
    // ball, with a sleeve at each end that turns on the stub
    o.ball = P.at(new T.Group(), 0, o.Y, 0, scene);
    o.ball.add(P.sphere(o.R, c.mat("ball")));
    [-1, 1].forEach(function (s) { P.at(P.cylX(8, 14, c.mat("ball")), s * 57, 0, 0, o.ball); });  // sleeves x 50 .. 64, outer face at 64
    // four bent arms round the middle; each points its jet backward, toward -angle
    for (i = 0; i < 4; i++) {
      var g = new T.Group(); g.rotation.x = i * Math.PI / 2 + .35; o.ball.add(g);
      P.at(P.cylY(4, 26, c.mat("arms")), 0, o.R + 9, 0, g);                 // radial, y R-4 .. R+22
      P.at(P.sphere(4, c.mat("arms")), 0, o.R + 22, 0, g);
      P.at(P.cylZ(4, 16, c.mat("arms")), 0, o.R + 22, 8, g);                // bend along +z, z 0 .. 16
      P.at(P.cylZ(5.2, 2.5, c.mat("arms", i ? "dark" : "mark")), 0, o.R + 22, 15, g);   // ring at the mouth
      o.nz.push(g);
    }
    // steam puffs
    o.puff = P.waterDots(260, { radius: 2.6, color: "#A3AEB8", opacity: .7 }); scene.add(o.puff);
    o.pp = []; for (i = 0; i < 260; i++) o.pp.push({ on: false });
    o.v = new T.Vector3(); o.d = new T.Vector3(); o.q = new T.Quaternion();
  },

  step: function (c, dt, S) {
    var o = this.o, run = S.playing && dt > 0, hi = S.controls.fire === "high", i;
    if (run) {
      o.t += dt;
      o.p += ((hi ? 1 : .45) - o.p) * Math.min(1, dt / 3);     // the steam builds up over a few seconds
      var push = 3.6 * o.p, drag = .04 * o.w * o.w + .05 * o.w;  // jets against air drag and rubbing
      o.w = Math.max(0, o.w + (push - drag) * dt);
      o.a += o.w * dt; o.ball.rotation.x = -o.a;
      o.ball.updateMatrixWorld(true);
      o.acc += dt * 90 * o.p;
      while (o.acc >= 1) {
        o.acc -= 1;
        var g = o.nz[o.next % 4], pp = o.pp[o.next % o.pp.length]; o.next++;
        o.v.set(0, o.R + 22, 17); g.localToWorld(o.v);
        o.d.set(0, 0, 1).applyQuaternion(g.getWorldQuaternion(o.q));
        var vj = 140 * Math.sqrt(o.p), r = Math.hypot(o.v.y - o.Y, o.v.z);
        // speed of the steam = its speed out of the arm, less the speed the arm is moving the other way
        var sy = o.w * o.v.z, sz = -o.w * (o.v.y - o.Y);          // velocity of the mouth as the ball turns
        pp.on = true; pp.x = o.v.x; pp.y = o.v.y; pp.z = o.v.z; pp.age = 0;
        pp.vx = (Math.random() - .5) * 12; pp.vy = o.d.y * vj + sy * 1 + (Math.random() - .5) * 10; pp.vz = o.d.z * vj + sz + (Math.random() - .5) * 10;
      }
      o.pp.forEach(function (q) {
        if (!q.on) return;
        q.age += dt; var k = Math.exp(-2.5 * dt); q.vx *= k; q.vy = q.vy * k + 25 * dt; q.vz *= k;
        q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
        if (q.age > 1.1) q.on = false;
      });
    }
    o.pp.forEach(function (q, n) { o.puff.put(n, q.x || 0, q.y || 0, q.z || 0, q.on ? .7 + 1.6 * q.age : 0); });
    o.puff.flush();
    o.fl.forEach(function (f, n) { var h = (hi ? 26 : 12) * (1 + .15 * Math.sin(o.t * 11 + n * 2.1)); f.scale.set(hi ? 1 : .7, h, hi ? 1 : .7); });
    var rpm = Math.round(o.w * 60 / (2 * Math.PI)); S.set("w", (rpm ? "−" : "") + rpm + " rpm");
    S.set("p", Math.round(o.p * 30) + " kPa");
  }
});
