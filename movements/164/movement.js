M507.define({
  number: 164,
  title: "Knee lever",
  lede: "A handle turns a bent arm, and the arm pushes on a long strut. When the arm and the strut come close to one straight line, the foot of the strut is shoved down with a very strong force. Presses and stamps use this, because a light pull on the handle gives a hard squeeze.",
  alt: "A flat ceiling plate at the top. A bent lever hangs from a pin under it, with a long handle pointing out to the right and slightly down. A long leaf-shaped strut hangs from a pin on the lower left of the lever and ends on a small block above a block on the ground.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Bent lever", note: "It turns on a pin hung from the ceiling. The long handle is where you push. The lower end of the lever carries the strut." },
    { key: "strut", color: "#D9B13B", name: "Strut", note: "A stiff, long bar that cannot change length. Its top is on the lever and its foot is on the platen. The joint at its top is the knee." },
    { key: "platen", color: "#C8873A", name: "Platen", note: "The small block at the foot of the strut. It slides between two posts, so it can only go up and down. Watch it." },
    { key: "work", color: "#4FA58A", name: "Block on the ground", note: "It does not move. The platen presses on it, like a press squeezing something placed there." }
  ],
  readouts: [{ id: "d", label: "Platen down" }, { id: "a", label: "Knee" }],
  views: { "3d": [360, 120, 600], front: [40, -5, 780], side: [760, -5, 7] },
  target: [40, -5, 7],
  distance: [300, 2000],
  how: [
    "Lift the handle. It turns the bent lever on its pin under the ceiling. The lower end of the lever swings round that pin, and the long strut hangs from it. The foot of the strut sits in a block that can only slide up and down.",
    "The strut cannot get longer or shorter. As the lever swings, the lower end moves round until it is straight under the pin. Then the lever and the strut lie in one line, and the block is pushed to its lowest place. It moves only a little near the end, but the push is very strong.",
    "Watch the knee reading and the platen reading together. When the knee gets close to a straight line, the platen hardly moves at all, although the handle still moves a lot. That is where the big force comes from."
  ],
  note: "This model is rebuilt from Brown's drawing. The ceiling plate, the holder for the top pin, the block on the ground, the guide posts and all the sizes were made up. Brown's strut rests straight on the block. Here its foot is in a small platen between two posts, so it has to go straight down. The handle swings up and down so the motion repeats, and it stops just before the knee is quite straight.",

  // Frame plane XY. U: pin on the ceiling. Lever arm R to the knee pin, at angle F0 (degrees) in the opening state; strut length L.
  K: { U: [0, 135], R: 55, L: 217, F0: -112, A: 20, HL: [171, -72] },

  solve: function (phiDeg) {
    var K = this.K, p = phiDeg * Math.PI / 180, kx = K.U[0] + K.R * Math.cos(p), ky = K.U[1] + K.R * Math.sin(p);
    return { kx: kx, ky: ky, py: ky - Math.sqrt(K.L * K.L - kx * kx) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, K = this.K, o = this.o = { u: 0 };
    var pin = c.mat("lever", "dark"), lo = this.solve(K.F0 + K.A), hi = this.solve(K.F0 - K.A);
    o.yTop = hi.py;
    var pyMin = this.solve(K.F0 + K.A).py, blockTop = pyMin - 22, gTop = blockTop - 24;
    // fixed scenery
    P.at(P.box(190, 18, 80, c.fixed), 0, 162, 7, c.scene);                    // ceiling x -95..95, y 153..171, z -33..47
    P.at(P.box(24, 18, 8, c.fixed), 0, 144, -8, c.scene);                              // pin holder x -12..12, y 135..153, z -12..-4
    P.at(P.cylZ(12, 8, c.fixed), K.U[0], K.U[1], -8, c.scene);                         // round end of holder, y 123..147, z -12..-4
    P.at(P.box(220, 12, 80, c.fixed), 0, gTop - 6, 7, c.scene);                        // ground x -110..110, y gTop-12..gTop, z -33..47
    P.at(P.box(54, 24, 30, c.mat("work")), 0, blockTop - 12, 7, c.scene);              // block x -27..27, y gTop..blockTop, z -8..22
    var postTop = o.yTop + 4 - 8;
    [-1, 1].forEach(function (s) {
      var h = postTop - gTop;
      P.at(P.box(10, h, 30, c.fixed), s * 33, gTop + h / 2, 7, c.scene);          // post x 28..38 (and mirror), y gTop..postTop, z -8..22
    });
    // lever, turns about the ceiling pin
    var f0 = K.F0 * Math.PI / 180, kx = K.R * Math.cos(f0), ky = K.R * Math.sin(f0);
    o.lev = new T.Group(); P.at(o.lev, K.U[0], K.U[1], 0, c.scene);
    P.at(P.cylZ(14, 8, c.mat("lever")), 0, 0, 0, o.lev);                               // hub z -4..4
    P.at(P.cylZ(11, 8, c.mat("lever")), kx, ky, 0, o.lev);                             // knee end z -4..4
    var arm = P.at(P.box(K.R, 22, 8, c.mat("lever")), kx / 2, ky / 2, 0, o.lev); arm.rotation.z = f0;   // arm z -4..4
    var hd = P.rod(7, c.mat("lever")); o.lev.add(hd); hd.span(10, -11, 0, K.HL[0], K.HL[1], 0);
    P.at(P.sphere(7, c.mat("lever")), K.HL[0], K.HL[1], 0, o.lev);
    P.at(P.cylZ(4.5, 17, pin), 0, 0, -4, o.lev);                                       // top pin z -12.5..4.5
    P.at(P.cylZ(4.5, 15, pin), kx, ky, 3, o.lev);                                      // knee pin z -4.5..10.5
    // strut: a leaf shape lying along local X, z 4..10
    o.st = new T.Group(); c.scene.add(o.st);
    var leaf = P.sphere(1, c.mat("strut")); leaf.scale.set(K.L / 2, 15, 3); leaf.position.set(K.L / 2, 0, 7); o.st.add(leaf);
    P.at(P.cylZ(8, 6, c.mat("strut")), 0, 0, 7, o.st);                                 // eye z 4..10
    P.at(P.cylZ(8, 6, c.mat("strut")), K.L, 0, 7, o.st);                               // eye z 4..10
    // platen: group at the foot pin
    o.pl = new T.Group(); c.scene.add(o.pl);
    P.at(P.box(36, 12, 30, c.mat("platen")), 0, -15, 7, o.pl);                         // base x -18..18, y -21..-9, z -8..22
    P.at(P.box(20, 17, 4, c.mat("platen")), 0, -0.5, 2, o.pl);                         // cheek y -9..8, z 0..4
    P.at(P.box(20, 17, 4, c.mat("platen")), 0, -0.5, 12, o.pl);                        // cheek y -9..8, z 10..14
    P.at(P.cylZ(3.5, 15, pin), 0, 0, 7, o.pl);                                         // foot pin z -0.5..14.5
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    if (S.playing) o.u += S.w * dt;
    var phi = K.F0 + K.A * Math.sin(o.u), r = this.solve(phi);
    o.lev.rotation.z = (phi - K.F0) * Math.PI / 180;
    o.st.position.set(r.kx, r.ky, 0); o.st.rotation.z = Math.atan2(r.py - r.ky, -r.kx);
    o.pl.position.set(0, r.py, 0);
    var ux = K.U[0] - r.kx, uy = K.U[1] - r.ky, lx = -r.kx, ly = r.py - r.ky;
    var ang = Math.acos((ux * lx + uy * ly) / (Math.sqrt(ux * ux + uy * uy) * Math.sqrt(lx * lx + ly * ly))) * 180 / Math.PI;
    S.set("d", (o.yTop - r.py).toFixed(1) + " mm");
    S.set("a", Math.round(ang) + "°");
  }
});
