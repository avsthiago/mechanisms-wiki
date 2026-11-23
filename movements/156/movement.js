M507.define({
  number: 156,
  title: "Crank pin in a bell crank slot",
  lede: "A round disc turns at a steady speed. A pin on the disc slides in a long slot in a lever bent at a corner, called a bell crank. The lever rocks to and fro and moves a rod up and down. It turns a spinning motion into a straight push and pull that is not even.",
  alt: "A big disc with a red pin near its rim. The pin sits in a long slot in a bell crank that turns on a pivot below the disc. The short arm of the lever points to the right. A link joins it to a rod that slides up and down between two rails.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "A round disc that turns at a steady speed. It is the only part that is driven." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The red pin on the disc. Watch it slide along the slot as the disc turns." },
    { key: "lever", color: "#C8873A", name: "Bell crank", note: "A lever bent at a corner, with a long slotted arm and a short arm. It turns on a fixed pivot at its corner." },
    { key: "link", color: "#D9B13B", name: "Link", note: "A short bar that joins the end of the short arm to the rod." },
    { key: "rod", color: "#4FA58A", name: "Rod", note: "Slides up and down between two rails. It moves quickly in some parts of the turn and slowly in others." }
  ],
  controls: [{ type: "range", id: "r", label: "Pin distance from centre", min: 30, max: 75, step: 1, value: 61, unit: " mm",
    presets: [[30, "Near"], [61, "Middle"], [75, "Far"]] }],
  readouts: [{ id: "x", label: "Rod" }, { id: "v", label: "Speed" }, { id: "d", label: "Pin to pivot" }],
  views: { front: [-20, 0, 900], "3d": [300, 100, 760], side: [850, 0, 0] },
  target: [-20, 0, 0],
  how: [
    "The disc turns round and round. Its red pin slides up and down the slot. The pin pushes the slotted arm to one side and then the other, so the lever rocks about its pivot. The short arm moves the rod up and down through the link.",
    "The pin is close to the pivot at one end of the slot and far from it at the other. When it is far, a small turn of the disc swings the arm only a little, so the rod is slow. When it is near, the same turn swings the arm a lot, so the rod is quick. The disc never changes speed. The rod does.",
    "Move the pin closer to the centre and the lever rocks less. Try Near, then Far, and watch the speed readout."
  ],
  note: "This model is rebuilt from Brown's drawing. The pivot, the backing plate, the base, the link and the rails for the rod were made up. Brown draws the rod joined straight to the end of the short arm. Here a short link is added, because the end of the arm moves on a curve and the rod can only go straight. The pin distances were added for comparison.",

  K: { C: [-44, 118], PHI: 146 * Math.PI / 180, LL: 60, ER: 125, XR: null, S0: 35, S1: 215 },

  // pivot at the origin; pin from the crank angle; arm angle; eye of the short arm; rod top
  solve: function (psi, r) {
    var K = this.K, px = K.C[0] + r * Math.cos(psi), py = K.C[1] + r * Math.sin(psi), al = Math.atan2(py, px);
    var ex = K.ER * Math.cos(al - Math.PI / 2), ey = K.ER * Math.sin(al - Math.PI / 2), XR = this.XR;
    var dx = ex - XR;
    return { px: px, py: py, al: al, d: Math.hypot(px, py), ex: ex, ey: ey, ty: ey - Math.sqrt(K.LL * K.LL - dx * dx) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i;
    var o = this.o = { psi: K.PHI, r: -1, prev: null, vel: 0, lo: 0, hi: 0 };
    var a0 = Math.atan2(K.C[1] + 61 * Math.sin(K.PHI), K.C[0] + 61 * Math.cos(K.PHI));
    this.XR = K.ER * Math.cos(a0 - Math.PI / 2);
    var XR = this.XR;
    // backing plate z -40..-34, x -190..150, y -230..230; everything is held off its front face
    P.at(P.box(340, 460, 6, c.fixed), -20, 0, -37, scene);
    P.at(P.box(350, 12, 70, c.fixed), -20, -236, -5, scene);                                   // base x -195..155, y -242..-230, z -40..30
    // disc: hub z -34..-14 on the plate face, disc z -28..-22, arm z -22..-16
    o.crank = new T.Group(); o.crank.position.set(K.C[0], K.C[1], 0); scene.add(o.crank);
    P.at(P.cylZ(9, 20, c.mat("disc")), 0, 0, -24, o.crank);                                    // hub z -34..-14
    P.at(P.cylZ(80, 6, c.mat("disc")), 0, 0, -25, o.crank);                                    // disc z -28..-22
    P.at(P.box(20, 5, 1, c.mat("disc", "light")), -60, 0, -21.5, o.crank);                     // stripe z -22..-21, opposite the pin
    o.bar = P.at(P.box(1, 14, 6, c.mat("disc", "dark")), 0, 0, -19, o.crank);                  // arm z -22..-16
    o.end = P.at(P.cylZ(7, 6, c.mat("disc", "dark")), 0, 0, -19, o.crank);
    o.pin = P.at(P.cylZ(4.5, 23, c.mat("pin")), 0, 0, -5.5, o.crank);                          // pin z -17..6, through the slot
    // bell-crank: local +x runs along the slot from the pivot; the short arm runs along -y. z -4..4
    o.arm = new T.Group(); scene.add(o.arm);
    var m = c.mat("lever"), L = K.S1 + 10;
    P.at(P.box(K.S0 + 20, 28, 8, m), (K.S0 - 20) / 2 , 0, 0, o.arm);                          // tail block x -20..35, y -14..14
    P.at(P.box(K.S1 - K.S0, 9, 8, m), (K.S0 + K.S1) / 2, 9.5, 0, o.arm);                      // rail x 35..215, y 5..14
    P.at(P.box(K.S1 - K.S0, 9, 8, m), (K.S0 + K.S1) / 2, -9.5, 0, o.arm);                     // rail y -14..-5
    P.at(P.box(10, 28, 8, m), K.S1 + 5, 0, 0, o.arm);                                          // end block x 215..225
    P.at(P.box(20, K.ER, 8, m), 0, -K.ER / 2, 0, o.arm);                                       // short arm x -10..10, y -125..0
    P.at(P.cylZ(14, 8, m), 0, -K.ER, 0, o.arm);                                                // eye z -4..4
    P.at(P.cylZ(14, 6, m), 0, 0, 7, o.arm);                                                    // pivot boss z 4..10
    P.at(P.cylZ(6, 1, c.mat("lever", "dark")), 0, 0, 10.5, o.arm);                             // cap z 10..11
    P.at(P.cylZ(5, 30, c.fixed), 0, 0, -19, scene);                                            // pivot shaft z -34..-4
    P.at(P.cylZ(5, 13, c.mat("link")), 0, -K.ER, 9.5, o.arm);                                  // pin joining the link z 3..16
    // link and rod, z 5..17
    o.link = P.rod(4, c.mat("link")); scene.add(o.link);
    o.ram = new T.Group(); scene.add(o.ram);
    P.at(P.box(16, 120, 12, c.mat("rod")), XR, -60, 11, o.ram);                                // x XR+-8, y -120..0 from the top
    P.at(P.cylZ(5, 18, c.mat("link")), XR, 0, 11, o.ram);                                       // pin z 2..20
    P.at(P.box(17, 3, 13, c.mat("rod", "dark")), XR, -100, 11, o.ram);                       // band y -101.5..-98.5 (z 4.5..17.5), 0.5 wider each side
    [-1, 1].forEach(function (u) {                                                             // rails x XR+-(8.5..14), y -160..-20
      P.at(P.box(5.5, 140, 12, c.fixed), XR + u * 11.25, -90, 11, scene);                     // z 5..17
      P.at(P.box(5.5, 140, 39, c.fixed), XR + u * 11.25, -90, -14.5, scene);                   // post z -34..5 to the plate
    });
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, r = +S.controls.r;
    if (r !== o.r) {
      o.r = r; o.lo = 1e9; o.hi = -1e9;
      for (var i = 0; i < 720; i++) { var y = this.solve(i * Math.PI / 360, r).ty; o.lo = Math.min(o.lo, y); o.hi = Math.max(o.hi, y); }
      o.bar.scale.x = r; o.bar.position.x = r / 2; o.end.position.x = r; o.pin.position.x = r; o.prev = null;
    }
    o.psi -= S.w * dt;
    var s = this.solve(o.psi, r);
    o.crank.rotation.z = o.psi;
    o.arm.rotation.z = s.al;
    o.ram.position.y = s.ty;
    o.link.span(s.ex, s.ey, 11, this.XR, s.ty, 11);
    if (dt > 0 && S.w !== 0 && o.prev !== null) o.vel = (s.ty - o.prev) / dt; else if (S.w === 0) o.vel = 0;
    o.prev = s.ty;
    var mid = (o.lo + o.hi) / 2, v = Math.round(o.vel), x = Math.round(s.ty - mid);
    S.set("x", (x > 0 ? "+" : "") + x + " mm");
    S.set("v", (v > 0 ? "+" : "") + v + " mm/s");
    S.set("d", Math.round(s.d) + " mm");
  }
});
