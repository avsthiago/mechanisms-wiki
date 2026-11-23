M507.define({
  number: 343,
  title: "Parallel motion for an upright engine",
  lede: "In this upright engine the crank sits on top of the frame, right above the cylinder. The top of the piston rod is held by a small rocking piece with two radius rods, one to each side of the frame. They keep the piston rod going up and down almost straight.",
  alt: "A tall see-through frame with two columns and a platform on top. A crank on the platform drives a long connecting rod down to a small yellow rocking piece. Two orange radius rods join the ends of the rocking piece to brackets on the left and right columns. A red piston rod hangs from the middle of the rocking piece into a cylinder, and a big flywheel turns behind the frame. A dark line shows the path of the piston rod's top.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank and connecting rod", note: "The crank and flywheel turn on top of the frame. The connecting rod joins the crank to the middle of the rocking piece." },
    { key: "link", color: "#8E7AA8", name: "Rocking piece", note: "A short bar on top of the piston rod. It tilts to and fro as the piston goes up and down." },
    { key: "radius", color: "#D9B13B", name: "Radius rods", note: "Two rods of the same length, one from each column. One holds the top of the rocking piece, the other its bottom." },
    { key: "piston", color: "#C8873A", name: "Piston rod", note: "Hangs from the middle of the rocking piece into the cylinder. Watch the red pin at its top: the dark line is its path." }
  ],
  controls: [{ type: "range", id: "rc", label: "Stroke", min: 12, max: 28, step: 1, value: 22, unit: " cm",
    format: function (v) { return 2 * v; },
    presets: [[12, "Short"], [22, "As drawn"], [28, "Long"]] }],
  readouts: [{ id: "off", label: "Sideways" }, { id: "y", label: "Piston" }],
  closed: { label: "Cylinder" },
  views: { "3d": [-260, 70, 640], front: [0, 25, 480], side: [480, 25, 0] },
  target: [0, 25, 0],
  how: [
    "The left radius rod holds the top of the rocking piece. The right one holds its bottom. Each rod swings on a curve, so its end moves toward its own column at the top and bottom of the stroke.",
    "One end of the rocking piece is pulled left and the other end is pulled right, by the same amount. The middle stays where it is sideways. That is where the piston rod hangs, so it goes up and down almost straight. The piece only tilts.",
    "The line is only nearly straight, and less so the further the rods swing. Look at the Sideways reading. Try Short, then Long, and watch the dark path. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank is drawn shorter than in Brown's figure, because the radius rods could not follow a stroke that long. The two radius rods are made the same length, the brackets, the floor, the cylinder and all sizes were made up, and the flywheel is set behind the frame. The other strokes were added for comparison.",

  // geometry (model units, read as cm; engraving pixels x 0.5): radius rods r from fixed pins PL (left, high) and PR
  // (right, low), rocking piece l long, piston rod at its middle. At mid-stroke both rods lie flat and the piece stands
  // upright on the line x = 0. Crank shaft S, connecting rod Lc.
  K: { PL: [-46, 23.5], PR: [46, -23.5], r: 46, l: 47, S: [0, 138], Lc: 140, rodLen: 105 },

  solve: function (P, phi, rc) {                             // phi: crank angle from straight up
    var K = this.K, pin = [K.S[0] + rc * Math.sin(phi), K.S[1] + rc * Math.cos(phi)];
    function at(al) {                                        // al: left rod angle below level
      var U = [K.PL[0] + K.r * Math.cos(al), K.PL[1] - K.r * Math.sin(al)], L = P.meet(U[0], U[1], K.l, K.PR[0], K.PR[1], K.r, -1);
      return { U: U, L: L, M: [(U[0] + L[0]) / 2, (U[1] + L[1]) / 2] };
    }
    var lo = -0.9, hi = 0.9, i, m, s;                        // the middle goes down as al grows: find where the rod fits
    for (i = 0; i < 50; i++) {
      m = (lo + hi) / 2; s = at(m);
      if (Math.hypot(s.M[0] - pin[0], s.M[1] - pin[1]) < K.Lc) lo = m; else hi = m;
    }
    s = at((lo + hi) / 2); s.pin = pin;
    return s;
  },
  probe: function () { return this.o.last; },                // for the node test

  crankArm: function (c, rc) {
    var o = this.o, K = this.K;
    if (o.crank) { o.crankG.remove(o.crank); o.crank.geometry.dispose(); }
    o.crank = c.P.armPlate({ length: rc, r0: 11, r1: 6, thick: 4, material: c.mat("crank") });   // z 8..12
    o.crankG.add(o.crank);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i;
    var o = this.o = { ph: 2.2, rc: null, y0: this.solve(P, Math.PI / 2, 22).M[1] };   // crank down and to the right, as drawn
    // floor x -150..150, y -156..-148, z -70..45
    P.at(P.box(300, 8, 115, c.fixed), 0, -152, -12.5, scene);
    // columns x -85..-63 and 63..85, y -148..87 (floor top to platform underside), z -12..12
    P.at(P.box(22, 235, 24, c.fixed), -74, -30.5, 0, scene);
    P.at(P.box(22, 235, 24, c.fixed), 74, -30.5, 0, scene);
    // platform x -130..130, y 87..120, z -14..14; crank bearing on top, foot at y = 138 - 18 = 120, z -7..7
    P.at(P.box(260, 33, 28, c.fixed), 0, 103.5, 0, scene);
    P.at(P.bearingBlock({ bore: 6.5, outer: 17, post: 30, width: 14, drop: 18, material: c.fixed }), K.S[0], K.S[1], 0, scene);
    // brackets for the radius rods on the inner faces of the columns, z -12..-8; pins z -8..-4 into their front faces
    P.at(P.box(17, 10, 4, c.fixed), -54.5, K.PL[1], -10, scene);             // x -63..-46
    P.at(P.cylZ(7, 4, c.fixed), K.PL[0], K.PL[1], -10, scene);
    P.at(P.box(17, 10, 4, c.fixed), 54.5, K.PR[1], -10, scene);              // x 46..63
    P.at(P.cylZ(7, 4, c.fixed), K.PR[0], K.PR[1], -10, scene);
    // cylinder under the stroke, axis z 7: top y -70, bottom -148 (floor top), inside -145..-73
    c.shell(P.at(P.steamCylinder({ radius: 24, length: 78, wall: 3, hole: 5, material: c.fixed }), 0, -70, 7, scene));
    // turning parts on the crank shaft: shaft z -54..10, flywheel z -54..-46 behind the frame, crank arm z 8..12
    o.crankG = new T.Group(); o.crankG.position.set(K.S[0], K.S[1], 0); scene.add(o.crankG);
    P.at(P.cylZ(6, 62, c.mat("crank", "dark")), 0, 0, -21, o.crankG);
    var fw = new T.Group(); fw.position.z = -50; o.crankG.add(fw);
    var fwm = c.mat("crank").clone(); fwm.opacity = 0.3; fwm.depthWrite = false;   // flywheel faint, only a background arc
    fw.add(P.hoop(140, 4, fwm));
    P.at(P.cylZ(14, 8, fwm), 0, 0, 0, fw);
    for (i = 0; i < 6; i++) { var a = i * Math.PI / 3, sp = P.rod(2.5, fwm); sp.span(13 * Math.cos(a), 13 * Math.sin(a), 0, 136 * Math.cos(a), 136 * Math.sin(a), 0); fw.add(sp); }
    var arm = new T.Group(); arm.position.z = 10; o.crankG.add(arm); o.crankG = arm;
    o.crankPin = P.at(P.cylZ(3, 9, c.mat("crank", "dark")), 0, 0, 14.5, scene);   // z 10..19
    o.conrod = P.at(P.rod(3, c.mat("crank")), 0, 0, 0, scene);                      // plane z 16
    // radius rods z -8..-4, rocking piece z -2..2, piston rod plane z 7
    o.radL = P.at(P.armPlate({ length: K.r, r0: 4.5, thick: 4, material: c.mat("radius") }), K.PL[0], K.PL[1], -6, scene);
    o.radR = P.at(P.armPlate({ length: K.r, r0: 4.5, thick: 4, material: c.mat("radius") }), K.PR[0], K.PR[1], -6, scene);
    P.at(P.cylZ(2.5, 5, c.mat("radius", "dark")), K.PL[0], K.PL[1], -6, scene);
    P.at(P.cylZ(2.5, 5, c.mat("radius", "dark")), K.PR[0], K.PR[1], -6, scene);
    o.piece = P.at(P.armPlate({ length: K.l, r0: 5, thick: 4, material: c.mat("link") }), 0, 0, 0, scene);
    o.pinU = P.at(P.cylZ(2.5, 11, c.mat("link", "dark")), 0, 0, -3, scene);       // z -8.5..2.5
    o.pinL = P.at(P.cylZ(2.5, 11, c.mat("link", "dark")), 0, 0, -3, scene);
    o.pinM = P.at(P.cylZ(3, 22, c.mat("piston", "mark")), 0, 0, 8, scene);      // z -3..19, the red point to follow
    o.rod = P.at(P.rod(3, c.mat("piston")), 0, 0, 0, scene);
    o.pist = P.at(P.cylY(20.5, 10, c.mat("piston")), 0, 0, 7, scene);
    o.trace = P.trail({ color: c.ink, max: 500 }); scene.add(o.trace);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, rc = +S.controls.rc;
    if (o.rc !== rc) { o.rc = rc; o.trace.clear(); this.crankArm(c, rc); }
    o.ph += S.w * dt;
    var s = this.solve(c.P, o.ph, rc), U = s.U, L = s.L, M = s.M, pin = s.pin;
    o.crankG.parent.rotation.z = Math.atan2(pin[1] - K.S[1], pin[0] - K.S[0]);
    o.crankPin.position.set(pin[0], pin[1], 14.5); o.conrod.span(pin[0], pin[1], 16, M[0], M[1], 16);
    o.radL.rotation.z = Math.atan2(U[1] - K.PL[1], U[0] - K.PL[0]);
    o.radR.rotation.z = Math.atan2(L[1] - K.PR[1], L[0] - K.PR[0]);
    o.piece.position.set(U[0], U[1], 0); o.piece.rotation.z = Math.atan2(L[1] - U[1], L[0] - U[0]);
    o.pinU.position.set(U[0], U[1], -3); o.pinL.position.set(L[0], L[1], -3); o.pinM.position.set(M[0], M[1], 8);
    var py = M[1] - K.rodLen;                                  // the piston keeps to the bore, so the rod leans by the tiny error
    o.pist.position.y = py; o.rod.span(M[0], M[1], 7, 0, py, 7);
    o.trace.push(M[0], M[1], 24);                               // path of the red pin, drawn in front of the rods
    o.last = { U: U, L: L, M: M, pin: pin, py: py };
    var off = M[0] * 10;
    S.set("off", (Math.abs(off) < 0.05 ? "0.0" : off.toFixed(Math.abs(off) < 10 ? 1 : 0)) + " mm");
    S.set("y", Math.round(M[1] - o.y0) + " cm");
  }
});
