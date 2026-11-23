M507.define({
  number: 100,
  title: "Quick return crank",
  lede: "A round crank turns at a steady speed, and its pin slides in a long slot in a swinging arm. The arm pushes a ram down slowly and pulls it back up fast. A shaping machine cuts on the slow stroke and wastes as little time as possible on the way back.",
  alt: "A crank disc at lower left with a red pin that slides in the long slot of an arm. The arm swings on a pivot to the right. A link hangs from the short end of the arm and carries an upright ram. The ram slides between two rails, above a block of metal.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank", note: "A disc with a short arm. It turns at a steady speed and is the only part that is driven." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The red pin at the end of the crank arm. It slides along the slot. Watch it go round, and see how fast the ram moves while it is on each side." },
    { key: "arm", color: "#C8873A", name: "Slotted arm", note: "A long arm with a slot. It swings on its pivot, always pointing at the pin. The pin slides up and down the slot as it goes." },
    { key: "link", color: "#D9B13B", name: "Link", note: "A bar that joins the short end of the arm to the ram." },
    { key: "ram", color: "#4FA58A", name: "Ram", note: "Slides up and down between two rails. The tool on its end cuts the block below on the slow stroke." }
  ],
  controls: [{ type: "range", id: "r", label: "Crank length", min: 25, max: 72, step: 1, value: 55, unit: " mm",
    presets: [[30, "Short"], [55, "Medium"], [72, "Long"]] }],
  readouts: [{ id: "x", label: "Ram" }, { id: "s", label: "Stroke" }, { id: "v", label: "Speed" }],
  views: { "3d": [330, 60, 760], front: [-25, -90, 950], side: [900, -90, 0] },
  target: [-25, -90, 0],
  how: [
    "The crank turns round at a steady speed. Its red pin slides along the slot and drags the arm from side to side. The short end of the arm moves the ram up and down through the link.",
    "The pin spends most of each turn on the far side of the crank, away from the pivot. There it takes a long time to swing the arm. This is the slow cutting stroke. Only a short part of each turn is spent on the near side. There the arm swings quickly and the ram springs back. The crank never changes speed, only the arm does.",
    "A longer crank makes the arm swing farther and the two strokes more unequal. Try Short, then Long, and watch how the speed readout changes between the two strokes."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the crank, the slotted arm and the start of a rod. The sizes, the backing plate, the link, the ram, its rails and the block of metal were made up. The ram is drawn upright so the link pushes it straight. A real shaping machine lays it on its side. The shorter and longer cranks were added for comparison.",

  K: { D: 100, DL: 8 * Math.PI / 180, LT: 60, XR: 48, LL: 100, ARM: 200, PSI0: 115 * Math.PI / 180 },

  // everything from the crank angle: pin position, arm angle, tail of the arm, ram height
  solve: function (psi, r) {
    var K = this.K, cx = -K.D * Math.cos(K.DL), cy = -K.D * Math.sin(K.DL);
    var px = cx + r * Math.cos(psi), py = cy + r * Math.sin(psi), al = Math.atan2(py, px);
    var tx = -K.LT * Math.cos(al), ty = -K.LT * Math.sin(al), dx = K.XR - tx;
    return { px: px, py: py, al: al, d: Math.hypot(px, py), tx: tx, ty: ty, yp: ty - Math.sqrt(K.LL * K.LL - dx * dx),
      fast: Math.cos(psi - Math.atan2(-cy, -cx)) > r / K.D };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, XR = K.XR, i;
    var o = this.o = { psi: K.PSI0, r: -1, prev: null, lo: 0, hi: 0, vel: 0 };
    var cx = -K.D * Math.cos(K.DL), cy = -K.D * Math.sin(K.DL);
    // backing plate z -40..-34, x -175..130, y -320..150; everything is held off its front face
    P.at(P.box(305, 470, 6, c.fixed), -22.5, -85, -37, scene);
    P.at(P.box(310, 12, 70, c.fixed), -20, -326, -5, scene);                                  // base x -175..135, y -332..-320, z -40..30
    P.at(P.box(80, 28, 40, c.fixed), XR, -306, 11, scene);                                    // block of metal x 8..88, y -320..-292, z -9..31
    // crank: hub z -34..-14 on the plate face, disc z -28..-22, arm z -22..-16
    o.crank = new T.Group(); o.crank.position.set(cx, cy, 0); scene.add(o.crank);
    P.at(P.cylZ(9, 20, c.mat("crank")), 0, 0, -24, o.crank);                                  // hub z -34..-14
    P.at(P.cylZ(80, 6, c.mat("crank")), 0, 0, -25, o.crank);                                  // disc z -28..-22
    P.at(P.box(20, 5, 1, c.mat("crank", "light")), -60, 0, -21.5, o.crank);                    // stripe z -22..-21 on the disc face, opposite the arm
    o.bar = P.at(P.box(1, 14, 6, c.mat("crank", "dark")), 0, 0, -19, o.crank);                         // arm z -22..-16, length set in step()
    o.end = P.at(P.cylZ(7, 6, c.mat("crank", "dark")), 0, 0, -19, o.crank);
    o.pin = P.at(P.cylZ(4.5, 23, c.mat("pin")), 0, 0, -5.5, o.crank);                         // pin z -17..6, through the slot
    // slotted arm: local +x points from the pivot to the pin side. Slot half width 5 from x 20 to 200, z -4..4
    o.arm = new T.Group(); scene.add(o.arm);
    var m = c.mat("arm");
    P.at(P.box(90, 28, 8, m), -25, 0, 0, o.arm);                                              // tail block x -70..20, y -14..14
    P.at(P.box(180, 9, 8, m), 110, 9.5, 0, o.arm);                                            // rail x 20..200, y 5..14
    P.at(P.box(180, 9, 8, m), 110, -9.5, 0, o.arm);                                           // rail y -14..-5
    P.at(P.box(10, 28, 8, m), 205, 0, 0, o.arm);                                              // end block x 200..210
    P.at(P.cylZ(14, 6, m), 0, 0, 7, o.arm);                                                   // pivot boss z 4..10
    P.at(P.cylZ(6, 1, c.mat("arm", "dark")), 0, 0, 10.5, o.arm);                                        // pivot cap z 10..11
    P.at(P.cylZ(5, 30, c.fixed), 0, 0, -19, scene);                                           // pivot shaft z -34..-4 at the origin (plate face to arm back)
    P.at(P.cylZ(5, 13, c.mat("link")), -60, 0, 9.5, o.arm);                                    // pin joining the link, z 3..16
    // link and ram: a bar hanging from the link, z 5..17, between two rails
    o.link = P.rod(4, c.mat("link")); scene.add(o.link);
    o.ram = new T.Group(); scene.add(o.ram);
    P.at(P.box(16, 150, 12, c.mat("ram")), XR, -65, 11, o.ram);                               // bar x -8..8 of the axis, y -140..10 from the link pin
    P.at(P.box(14, 12, 12, c.mat("ram", "dark")), XR, -146, 11, o.ram);                        // tool y -152..-140, the same thickness
    P.at(P.cylZ(5, 18, c.mat("link")), XR, 0, 11, o.ram);                                      // link pin z 2..20
    [-1, 1].forEach(function (u) {                                                           // rails x XR+-(8.5..14), y -200..-105, always beside the bar
      P.at(P.box(5.5, 95, 12, c.fixed), XR + u * 11.25, -152.5, 11, scene);                    // z 5..17
      P.at(P.box(5.5, 95, 39, c.fixed), XR + u * 11.25, -152.5, -14.5, scene);                  // post z -34..5 to the plate
    });
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, r = +S.controls.r, i;
    if (r !== o.r) {                               // find the travel of the ram for this crank length
      o.r = r; o.lo = 1e9; o.hi = -1e9;
      for (i = 0; i < 720; i++) { var y = this.solve(i * Math.PI / 360, r).yp; o.lo = Math.min(o.lo, y); o.hi = Math.max(o.hi, y); }
      o.bar.scale.x = r; o.bar.position.x = r / 2; o.end.position.x = r; o.pin.position.x = r; o.prev = null;
    }
    o.psi -= S.w * dt;
    var s = this.solve(o.psi, r), al = s.al;
    o.crank.rotation.z = o.psi;
    o.arm.position.set(0, 0, 0); o.arm.rotation.z = al;
    o.ram.position.y = s.yp;
    o.link.span(s.tx, s.ty, 11, K.XR, s.yp, 11);
    // the pin lies on the arm's centre line: its offset across the slot is zero
    this.o.slotErr = Math.abs(s.px * -Math.sin(al) + s.py * Math.cos(al));
    if (dt > 0 && S.w !== 0 && o.prev !== null) o.vel = (s.yp - o.prev) / dt; else if (S.w === 0) o.vel = 0;
    o.prev = s.yp;
    var mid = (o.lo + o.hi) / 2, v = Math.round(o.vel);
    S.set("x", (Math.round(s.yp - mid) > 0 ? "+" : "") + Math.round(s.yp - mid) + " mm");
    S.set("s", s.fast ? "Returning" : "Cutting");
    S.set("v", (v > 0 ? "+" : "") + v + " mm/s");
  }
});
