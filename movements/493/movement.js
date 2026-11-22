/* Section through a stone, drawing units (1 = a pixel of the engraving) inside one group scaled by .5.
   x right, y up, origin on the top face of the stone at the middle of the hole, z towards the viewer.
   Stone z -35 .. 35 (cut away at both faces so the inside shows), wedge z -25 .. 25, packing pieces z -24 .. 24. */
M507.define({
  number: 493,
  title: "Lewis for lifting stone",
  lede: "A lewis is a little tool that lets a crane pick up a rough stone. It fits into a hole cut in the top of the stone. Lifting on it makes it grip the sides of the hole, so the stone comes up. To let go, you set the stone down and take the tool out.",
  alt: "A section through a block of stone with a deep slot cut into its top. Inside the slot is a long wedge that is narrow at the top and wide at the bottom, with a thin packing piece on each side of it. A shackle on the top of the wedge holds a rope.",
  parts: [
    { key: "wedge", color: "#C8873A", name: "Wedge", note: "The middle piece. It is wider at the bottom. When it is pulled up, its wide part squeezes in between the two packing pieces." },
    { key: "packing", color: "#4FA58A", name: "Packing pieces", note: "Two thin pieces, one on each side of the wedge. They are thinner at the bottom, so the wedge can push them out against the stone." },
    { key: "shackle", color: "#D9B13B", name: "Shackle and rope", note: "The shackle is tied to the top of the wedge. The rope goes up to the crane. Watch the red mark rise." }
  ],
  readouts: [{ id: "stone", label: "Stone" }, { id: "grip", label: "Grip" }],
  views: { "3d": [120, 70, 520], front: [0, 20, 540], side: [540, 20, 10] },
  target: [0, 20, 0],
  distance: [150, 2200],
  how: [
    "The wedge and the two packing pieces go into the slot together. At first they sit loosely. The rope pulls the wedge up. Its wide bottom squeezes in between the packing pieces and pushes them out against the sides of the slot.",
    "Now the pieces are jammed hard against the stone. The harder the rope pulls, the harder the pieces press, so the stone comes up with the rope. A heavy stone only makes the grip stronger.",
    "Set the stone down and slack off the rope. The wedge sinks and the grip goes. Then the whole lewis lifts out of the slot, ready for the next stone. Watch the readout and see when it is gripping."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a section. The stone is cut away at its two faces so the lewis can be seen inside the slot. The size of the slot, how far the wedge has to move, the shackle, the rope and the ground were made up. In the model the packing pieces hang on the wedge when the lewis is taken out. The lifting and setting down are not driven by a real crane.",

  build: function (c) {
    var T = c.THREE, P = c.P, S = .5, i;
    var o = this.o = { ph: 0 };
    var root = new T.Group(); root.scale.set(S, S, S); root.position.set(0, 20 * S, 0); c.scene.add(root);
    var HW = 48.5, DEP = 185, SL = .0588, G0 = 1.5, TOPW = 62;
    o.U1 = G0 / SL; o.SL = SL; o.G0 = G0;
    // the stone: a slab with a slot cut in from the top
    o.stone = new T.Group(); root.add(o.stone);
    var sh = new T.Shape(); sh.moveTo(-228.5, -280); sh.lineTo(274.5, -280); sh.lineTo(274.5, 0); sh.lineTo(HW, 0); sh.lineTo(HW, -DEP);
    sh.lineTo(-HW, -DEP); sh.lineTo(-HW, 0); sh.lineTo(-228.5, 0); sh.closePath();
    var sg = new T.ExtrudeGeometry(sh, { depth: 70, bevelEnabled: false }); sg.translate(0, 0, -35);
    o.stone.add(new T.Mesh(sg, c.fixed));
    P.at(P.box(640, 6, 140, c.fixed), 23, -283.6, 0, root);                            // ground: y -286.6 .. -280.6
    function xi(y) { return 17.5 + SL * (-y); }
    // packing pieces (slide sideways as the wedge rises)
    o.piece = [-1, 1].map(function (sd) {
      var g = new T.Group(), s2 = new T.Shape(), xo = HW - G0;
      s2.moveTo(sd * xo, -DEP); s2.lineTo(sd * xi(-DEP), -DEP); s2.lineTo(sd * xi(-3), -3); s2.lineTo(sd * xo, -3); s2.closePath();
      var geo = new T.ExtrudeGeometry(s2, { depth: 48, bevelEnabled: false }); geo.translate(0, 0, -24);
      g.add(new T.Mesh(geo, c.mat("packing"))); o.pieces = o.pieces || new T.Group(); root.add(g); return g;
    });
    // wedge, drawn in the gripping position
    o.wedge = new T.Group(); root.add(o.wedge);
    var w = new T.Shape(), yb = -153;
    function hw(y) { return xi(y) + G0; }
    w.moveTo(-hw(yb), yb); w.lineTo(hw(yb), yb); w.lineTo(hw(TOPW), TOPW); w.lineTo(-hw(TOPW), TOPW); w.closePath();
    var wg = new T.ExtrudeGeometry(w, { depth: 50, bevelEnabled: false }); wg.translate(0, 0, -25);
    o.wedge.add(new T.Mesh(wg, c.mat("wedge")));
    [30, 38, 46].forEach(function (y) { P.at(P.box(2 * hw(y) - 2, 2.5, 1.2, c.mat("wedge", "dark")), 0, y, 25, o.wedge); });   // grooves, 0.6 proud of the face
    P.at(P.cylX(4.5, 66, c.mat("shackle")), 0, 54, 0, o.wedge);                          // pin across the head, x -33 .. 33
    var A = Math.PI / 180;
    [-1, 1].forEach(function (sd) {
      o.wedge.add(P.rod(3.5, c.mat("shackle")).span(sd * 31, 54, 0, sd * 17, 100, 0));
      P.at(P.sphere(5.5, c.mat("shackle")), sd * 33, 54, 0, o.wedge);
    });
    P.at(P.hook({ radius: 26, tube: 4, material: c.mat("shackle") }), 0, 124, 0, o.wedge);
    o.wedge.add(P.rod(3.5, c.mat("shackle")).span(0, 150, 0, 0, 330, 0));
    P.at(P.sphere(6, c.mat("shackle", "mark")), 0, 215, 0, o.wedge);
  },

  step: function (c, dt, S) {
    var o = this.o, M = Math.PI;
    function sm(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    o.ph = (o.ph + S.w * dt / (2 * M)) % 1;
    var ph = o.ph, U1 = o.U1;
    var H = 60 * (sm((ph - .06) / .2) - sm((ph - .40) / .18));
    var u = U1 * (1 - sm((ph - .60) / .08)) + U1 * sm((ph - .92) / .07);
    var O = 195 * (sm((ph - .70) / .10) - sm((ph - .80) / .10));
    var p = Math.min(o.G0, o.SL * u);
    o.stone.position.y = H;
    o.piece[0].position.set(-p, H + O, 0); o.piece[1].position.set(p, H + O, 0);
    o.wedge.position.y = H + (u - U1) + O;
    S.set("stone", Math.round(H * .5) + " cm up");
    S.set("grip", u >= U1 - .01 ? "tight" : u > .5 ? "easing" : "loose");
  }
});
