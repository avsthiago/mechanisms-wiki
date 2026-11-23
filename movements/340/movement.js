M507.define({
  number: 340,
  title: "Parallel motion with a rocking pillar",
  lede: "This beam has no fixed pivot. It sits on top of a pillar that rocks to and fro on a pin at its foot. A short radius bar holds the beam, and the end of the beam goes up and down almost straight, so the piston rod can hang straight from it.",
  alt: "A long tapered beam rests on the top of a tall yellow pillar that rocks on a pin at the floor. A short orange radius bar joins the beam to a bracket on a wall at the right. A red piston rod hangs from the right end of the beam into a see-through cylinder, and a violet rod hangs from the left end. A dark line shows the path of the piston rod's top.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam", note: "Rests on the top of the pillar. It tips up and down, and the pillar lets its middle slide a little to the side." },
    { key: "pillar", color: "#D9B13B", name: "Rocking pillar", note: "Stands on a pin at the floor and rocks to and fro. Its top carries the beam." },
    { key: "radius", color: "#4FA58A", name: "Radius bar", note: "Swings about a fixed pin on the wall bracket. It holds the beam between its middle and the piston end." },
    { key: "piston", color: "#C8873A", name: "Piston rod", note: "Hangs from the right end of the beam into the cylinder. Watch the red pin at its top: the dark line is its path." },
    { key: "crankrod", color: "#8E7AA8", name: "Rod to the crank", note: "Hangs from the left end of the beam. In a real engine it goes down to the crank." }
  ],
  controls: [{ type: "range", id: "amp", label: "Beam swing", min: 10, max: 32, step: 1, value: 28, unit: "°",
    presets: [[14, "Small"], [28, "As drawn"], [32, "Large"]] }],
  readouts: [{ id: "off", label: "Off line" }, { id: "y", label: "Piston" }],
  closed: { label: "Cylinder" },
  views: { "3d": [-260, 80, 640], front: [10, -20, 720], side: [720, -20, 0] },
  target: [10, -20, 0],
  how: [
    "The beam has no fixed pivot. Its middle rests on a pillar that can rock on a pin at the floor. When the beam tips, the radius bar pulls on it, and the pillar leans a little to let the beam's middle move sideways.",
    "If the beam had a fixed pivot, its end would swing on a curve and pull the piston rod sideways. Here, as the end goes up or down, the radius bar and the pillar shift the whole beam sideways by just the right amount. So the piston end goes up and down almost straight, even when the beam tips a long way.",
    "Watch the top of the pillar move to the side as the beam tips. Then look at the Off line reading. Try Small, then Large, and see how little it changes. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The cylinder, the wall, the bearings, the floor and all sizes were made up. The beam is rocked to and fro as if by the crank, which is left out, so the rod on the left end just hangs. The radius bar is pinned a little closer to the pillar than drawn, which makes the line straighter.",

  // geometry (model units, read as cm; engraving pixels x 0.5): pillar foot F, pillar Lp, beam pin on the pillar top,
  // radius bar pinned Lb along the beam and r long to the wall pin E. Piston pin BC along the beam, crank rod pin BD the other way.
  // At mid-swing the pillar stands upright and the beam and radius bar lie flat on the line y = 60.
  K: { F: [0, -111], Lp: 171, Lb: 67.5, r: 80.5, E: [148, 60], BC: 123.5, BD: 116, rodLen: 154, hang: 150 },

  solve: function (P, g) {                                   // g: beam tilt, positive puts the piston end down
    var K = this.K, co = Math.cos(g), si = Math.sin(g);
    // the pillar top lies on a circle round F, and also on the radius bar circle moved back along the beam
    var B = P.meet(K.F[0], K.F[1], K.Lp, K.E[0] - K.Lb * co, K.E[1] + K.Lb * si, K.r, 1);
    return { B: B, A: [B[0] + K.Lb * co, B[1] - K.Lb * si], C: [B[0] + K.BC * co, B[1] - K.BC * si], D: [B[0] - K.BD * co, B[1] + K.BD * si] };
  },
  probe: function () { return this.o.last; },                // for the node test

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, mid = this.solve(P, 0);
    var o = this.o = { ph: Math.PI / 2, amp: null, x0: mid.C[0], y0: mid.C[1] };    // starts with the piston end down, as drawn
    // floor x -170..190, y -180..-172, z -45..45; wall x 165..177, y -172..130, z -40..40 standing on it
    P.at(P.box(360, 8, 90, c.fixed), 10, -176, 0, scene);
    P.at(P.box(12, 302, 80, c.fixed), 171, -21, 0, scene);
    // wall bracket in front of the radius bar: x 148..165 (meets the wall face), y 54..66, z 15..21, round boss at the pin
    P.at(P.box(17, 12, 6, c.fixed), 156.5, 60, 18, scene);
    P.at(P.cylZ(8, 6, c.fixed), K.E[0], K.E[1], 18, scene);
    P.at(P.cylZ(3, 7, c.mat("radius", "dark")), K.E[0], K.E[1], 11.5, scene);   // pin z 9..15, into the bracket face
    // pillar foot bearing behind the pillar: z -27..-15, foot at y = -111 - 61 = -172 (floor top)
    P.at(P.bearingBlock({ bore: 5, outer: 16, post: 26, width: 12, drop: 61, material: c.fixed }), K.F[0], K.F[1], -21, scene);
    P.at(P.cylZ(4.5, 18, c.mat("pillar", "dark")), K.F[0], K.F[1], -20, scene);   // foot pin z -29..-11
    // cylinder under the piston pin, axis z -8: top y -20, bottom -172 (floor top), inside -169..-23
    c.shell(P.at(P.steamCylinder({ radius: 18, length: 152, wall: 3, hole: 5, material: c.fixed }), o.x0, -20, -8, scene));
    // pillar z -13..-5, from the foot along local +X to the top
    o.pillar = P.at(P.armPlate({ length: K.Lp, r0: 16, r1: 14, thick: 8, material: c.mat("pillar") }), K.F[0], K.F[1], -9, scene);
    // beam z -3..5 in a group at the pillar top: tapered arms both ways, dark ring on the hub face z 5.6..6.4
    o.beam = new T.Group(); scene.add(o.beam);
    o.beam.add(P.armPlate({ length: K.BC, r0: 20, r1: 9, thick: 8, material: c.mat("beam") }));
    var back = P.armPlate({ length: K.BD, r0: 20, r1: 9, thick: 8, material: c.mat("beam") }); back.rotation.z = Math.PI; o.beam.add(back);
    o.beam.children.forEach(function (m) { m.position.z = 1; });
    P.at(P.hoop(12, 0.8, c.mat("beam", "dark")), 0, 0, 6, o.beam);
    P.at(P.cylZ(5, 20, c.mat("beam", "dark")), 0, 0, -4, o.beam);              // pillar top pin z -13..5
    // radius bar z 9..13 from the wall pin along local +X to the beam
    o.rad = P.at(P.armPlate({ length: K.r, r0: 5, thick: 4, material: c.mat("radius") }), K.E[0], K.E[1], 11, scene);
    o.pinA = P.at(P.cylZ(3, 18, c.mat("radius", "dark")), 0, 0, 5.5, scene);    // z -3..13
    // piston rod and crank rod hang in the plane z -8, behind the beam
    o.pinC = P.at(P.cylZ(3.5, 17, c.mat("piston", "mark")), 0, 0, -2.5, scene);  // z -11..5, the red point to follow
    o.pinD = P.at(P.cylZ(3, 17, c.mat("crankrod", "dark")), 0, 0, -2.5, scene);
    o.rod = P.at(P.rod(3, c.mat("piston")), 0, 0, 0, scene);
    o.pist = P.at(P.cylY(14.5, 10, c.mat("piston")), o.x0, 0, -8, scene);
    o.crod = P.at(P.rod(3, c.mat("crankrod")), 0, 0, 0, scene);
    o.trace = P.trail({ color: c.ink, max: 500 }); scene.add(o.trace);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, amp = +S.controls.amp;
    if (o.amp !== amp) { o.amp = amp; o.trace.clear(); }
    o.ph += S.w * dt;
    var g = amp * Math.PI / 180 * Math.sin(o.ph), s = this.solve(c.P, g), A = s.A, B = s.B, C = s.C, D = s.D;
    o.pillar.rotation.z = Math.atan2(B[1] - K.F[1], B[0] - K.F[0]);
    o.beam.position.set(B[0], B[1], 0); o.beam.rotation.z = -g;
    o.rad.rotation.z = Math.atan2(A[1] - K.E[1], A[0] - K.E[0]);
    o.pinA.position.set(A[0], A[1], 5); o.pinC.position.set(C[0], C[1], -3); o.pinD.position.set(D[0], D[1], -3);
    var py = C[1] - K.rodLen;                                  // the piston keeps to the bore, so the rod leans by the tiny error
    o.pist.position.y = py; o.rod.span(C[0], C[1], -8, o.x0, py, -8);
    o.crod.span(D[0], D[1], -8, D[0], D[1] - K.hang, -8);
    o.trace.push(C[0], C[1], 18);                               // path of the red pin, drawn in front of the beam
    o.last = { A: A, B: B, C: C, D: D, py: py };
    var off = (C[0] - o.x0) * 10;
    S.set("off", (Math.abs(off) < 0.05 ? "0.0" : off.toFixed(Math.abs(off) < 10 ? 1 : 0)) + " mm");
    S.set("y", Math.round(C[1] - o.y0) + " cm");
  }
});
