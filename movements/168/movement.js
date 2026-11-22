M507.define({
  number: 168,
  title: "Slotted crank and connecting rod",
  lede: "A long bar, the connecting rod, joins a push-and-pull rod to a crank that has a slot in it. The pin on the bar slides in and out along the slot as the crank turns. So the pin does not go in a circle but in an oval, and the crank gets a longer lever just when the push is best.",
  alt: "A crank with a long slot on a shaft at the left. A long flat bar, the connecting rod, runs from a pin in that slot to the right. Part way along, a short crank on its own shaft is joined to the bar. The right end of the bar is joined to an upright rod that slides up and down between two guides. A thin oval line shows the path of the pin in the slot.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Slotted crank", note: "A crank on the driving shaft with a long slot cut along it. It turns once for each turn of the short crank." },
    { key: "pin", color: "#C2503F", name: "Pin in the slot", note: "The pin at the left end of the connecting rod. It slides along the slot as the crank turns. Watch it trace an oval." },
    { key: "pitman", color: "#D9B13B", name: "Connecting rod", note: "A long flat bar. One end holds the pin in the slot. The other end is joined to the upright rod. The short crank is joined to it in between." },
    { key: "crank2", color: "#C8873A", name: "Short crank", note: "A crank of fixed length on its own shaft. It guides the middle of the connecting rod round a circle. This is what makes the pin go in an oval." },
    { key: "rod", color: "#4FA58A", name: "Upright rod", note: "The rod that pushes and pulls. It slides up and down between two guides and is joined to the right end of the connecting rod." }
  ],
  controls: [{ type: "range", id: "r", label: "Short crank length", min: 35, max: 55, step: 1, value: 50, unit: " mm",
    presets: [[35, "Short"], [50, "As drawn"], [55, "Long"]] }],
  readouts: [{ id: "d", label: "Pin from shaft" }, { id: "w", label: "Slotted crank" }, { id: "x", label: "Rod" }],
  views: { "3d": [400, 200, 880], front: [0, 0, 1150], side: [950, 40, 40] },
  target: [20, 20, 0],
  how: [
    "The short crank turns at a steady speed. It carries the middle of the connecting rod round a circle. The right end of the connecting rod is held by the rod, which can only slide up and down. These two joints decide where the left end goes.",
    "The left end carries a pin, and the pin sits in the slot of the big crank. So the big crank has to follow the pin round. The pin does not stay at one distance from the shaft. It slides along the slot, close in on one side and far out on the other. Its path is an oval, drawn as the thin line.",
    "A longer short crank makes a fatter oval, and the pin slides farther in the slot. Try Short, then Long, and watch the first reading and the oval change."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows no frame, no guides and no sizes. The back plate, the bearings, the upright rod and its two guides were made up. The connecting rod is drawn as a straight bar, and the shafts and joints are placed so that the cranks never touch. The short crank is behind the connecting rod, and the connecting rod passes in front of the driving shaft. The shorter and longer short cranks were added for comparison.",

  K: { S2: [16, 10], L: 300, KA: 150, EX: 250, M: [-101, 100], TH0: 70 * Math.PI / 180, OX: -35, OY: 45 },

  solve: function (th, r) {
    var K = this.K, qx = K.S2[0] + r * Math.cos(th), qy = K.S2[1] + r * Math.sin(th);
    var dx = K.EX - qx, h = -Math.sqrt(K.L * K.L - dx * dx), ux = dx / K.L, uy = h / K.L;
    var ax = qx - K.KA * ux, ay = qy - K.KA * uy;
    return { qx: qx, qy: qy, ey: qy + h, ax: ax, ay: ay, phi: Math.atan2(ay - K.M[1], ax - K.M[0]), d: Math.hypot(ax - K.M[0], ay - K.M[1]),
      psi: Math.atan2(h, dx) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, K = this.K, i;
    var o = this.o = { th: K.TH0, r: -1, prev: null, lo: 0, hi: 0, phiPrev: null, wm: 0 };
    var root = o.root = new T.Group(); root.position.set(K.OX, K.OY, 0); c.scene.add(root);
    var M = K.M, S2 = K.S2, EX = K.EX;
    // back plate x -200..280, y -300..190, z -40..-36; everything stands on its front face
    P.at(P.box(480, 490, 4, c.fixed), 40, -55, -38, root);
    P.at(P.box(50, 50, 10, c.fixed), M[0], M[1], -31, root);                                  // main bearing z -36..-26
    P.at(P.box(40, 40, 10, c.fixed), S2[0], S2[1], -31, root);                                // short crank bearing z -36..-26
    // main crank: shaft z -26..0, hub z -1..8.5, arm z 0..8, local +x points along the slot
    P.at(P.cylZ(7, 26, c.mat("crank", "dark")), M[0], M[1], -13, root);
    o.crank = new T.Group(); o.crank.position.set(M[0], M[1], 0); root.add(o.crank);
    var m = c.mat("crank");
    P.at(P.cylZ(14, 9.5, m), 0, 0, 3.75, o.crank);                                            // hub z -1..8.5
    P.at(P.box(57, 28, 8, m), -6.5, 0, 4, o.crank);                                           // tail block x -35..22
    P.at(P.box(84, 9, 8, m), 64, 9.5, 4, o.crank);                                            // rail x 22..106, y 5..14
    P.at(P.box(84, 9, 8, m), 64, -9.5, 4, o.crank);                                           // rail y -14..-5
    P.at(P.box(16, 28, 8, m), 114, 0, 4, o.crank);                                            // end block x 106..122
    P.at(P.box(10, 5, 1, c.mat("crank", "light")), -22, 0, 8.5, o.crank);                     // stripe on the tail, z 8..9
    // short crank: shaft z -26..0, boss z 0..7, arm z 0..6, pin up to z 15.5
    P.at(P.cylZ(6, 26, c.mat("crank2", "dark")), S2[0], S2[1], -13, root);
    o.c2 = new T.Group(); o.c2.position.set(S2[0], S2[1], 0); root.add(o.c2);
    P.at(P.cylZ(12, 7, c.mat("crank2")), 0, 0, 3.5, o.c2);
    o.arm2 = P.at(P.box(1, 14, 6, c.mat("crank2")), 0, 0, 3, o.c2);
    o.end2 = P.at(P.cylZ(7, 6, c.mat("crank2")), 0, 0, 3, o.c2);
    o.pq = P.at(P.cylZ(5, 13, c.mat("crank2", "dark")), 0, 0, 9.5, o.c2);                  // pin z 3..15.5
    o.cq = P.at(P.cylZ(7, 1.5, c.mat("crank2", "dark")), 0, 0, 16.75, o.c2);                  // cap z 15.5..17
    // pitman: local +x from the slot pin to the rod, bar z 9..15, eyes z 8.5..15.5
    o.pit = new T.Group(); root.add(o.pit);
    var LT = K.KA + K.L;
    P.at(P.box(LT, 16, 6, c.mat("pitman")), LT / 2, 0, 12, o.pit);
    [0, K.KA, LT].forEach(function (x) { P.at(P.cylZ(10, 7, c.mat("pitman")), x, 0, 12, o.pit); });
    // pin in the slot: z 1..15.5 through the slot (z 0..8), red cap z 15.5..17
    o.pin = new T.Group(); root.add(o.pin);
    P.at(P.cylZ(4.5, 15, c.mat("pin")), 0, 0, 8.5, o.pin);
    P.at(P.cylZ(7, 1.5, c.mat("pin")), 0, 0, 16.75, o.pin);
    // upright rod: bar z 15.5..21.5, 16 wide; pin z 8.5..21.5 with cap z 21.5..23
    o.rod = new T.Group(); root.add(o.rod);
    P.at(P.box(16, 300, 6, c.mat("rod")), 0, 110, 18.5, o.rod);                               // y -40..260 from the pin
    P.at(P.cylZ(5, 14, c.mat("rod", "dark")), 0, 0, 15, o.rod);
    P.at(P.cylZ(7, 1.5, c.mat("rod", "dark")), 0, 0, 22.75, o.rod);
    P.at(P.box(28, 20, 51.5, c.fixed), EX, 0, -10.25, root);                                  // post x 236..264, y -10..10, z -36..15.5
    [-1, 1].forEach(function (u) { P.at(P.box(5.5, 60, 6, c.fixed), EX + u * 11.25, -20, 18.5, root); });  // guides x +-(8.5..14), y -50..10, z 15.5..21.5
    // paths: the oval of the slot pin and the circle of the short crank, drawn as thin lines at z 19 and z -1
    var lm = new T.LineBasicMaterial({ color: c.ink });
    function loop(z) {
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array(360 * 3), 3));
      var l = new T.LineLoop(g, lm); l.userData.live = true; l.frustumCulled = false; l.position.z = z; root.add(l); return l;
    }
    o.oval = loop(19); o.circ = loop(-1);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, r = +S.controls.r, i, s;
    if (r !== o.r) {
      o.r = r; o.lo = 1e9; o.hi = -1e9;
      var po = o.oval.geometry.attributes.position, pc = o.circ.geometry.attributes.position;
      for (i = 0; i < 360; i++) {
        s = this.solve(i * Math.PI / 180, r);
        po.setXYZ(i, s.ax, s.ay, 0); pc.setXYZ(i, K.S2[0] + r * Math.cos(i * Math.PI / 180), K.S2[1] + r * Math.sin(i * Math.PI / 180), 0);
        o.lo = Math.min(o.lo, s.ey); o.hi = Math.max(o.hi, s.ey);
      }
      po.needsUpdate = true; pc.needsUpdate = true;
      o.arm2.scale.x = r; o.arm2.position.x = r / 2; o.end2.position.x = r; o.pq.position.x = r; o.cq.position.x = r;
    }
    o.th += S.w * dt;
    s = this.solve(o.th, r);
    var e = 1e-3, s2 = this.solve(o.th + e, r), dphi = s2.phi - s.phi;
    if (dphi > Math.PI) dphi -= 2 * Math.PI; if (dphi < -Math.PI) dphi += 2 * Math.PI;
    o.c2.rotation.z = o.th;
    o.crank.rotation.z = s.phi;
    o.pit.position.set(s.ax, s.ay, 0); o.pit.rotation.z = s.psi;
    o.pin.position.set(s.ax, s.ay, 0);
    o.rod.position.set(K.EX, s.ey, 0);
    var rpm = S.w === 0 ? 0 : Math.round(dphi / e * S.rpm), mid = (o.lo + o.hi) / 2, x = Math.round(s.ey - mid);
    S.set("d", Math.round(s.d) + " mm");
    S.set("w", (rpm > 0 ? "+" : rpm < 0 ? "−" : "") + Math.abs(rpm) + " rpm");
    S.set("x", (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x) + " mm");
  }
});
