M507.define({
  number: 223,
  title: "Sectors on different planes",
  lede: "The upper shaft carries two toothed sectors, slices of gears of different sizes, one in front of the other. Each drives a matching sector on the lower shaft. The upper shaft turns steadily, but the lower one turns fast for part of each turn and slowly for the rest.",
  alt: "Two shafts, one above the other, stick out of an upright plate. Each carries two toothed slices of gears, one just in front of the other. On the upper shaft a big quarter slice is in front and a smaller three-quarter slice behind. On the lower shaft a small half slice is in front and a bigger half slice behind. A red stripe marks the small front slice on the lower shaft.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Upper sectors", note: "Two slices of gears on the driving shaft. The front one is big but only a quarter of a circle. The back one is smaller and covers the other three quarters." },
    { key: "driven", color: "#C8873A", name: "Lower sectors", note: "Two slices on the driven shaft, each meeting one upper slice in its own plane. The front one is small, the back one is big." },
    { key: "stripe", color: "#C2503F", name: "Red mark", note: "Marks the small front slice on the lower shaft. Watch it rush round, then crawl." }
  ],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [140, 66, 500], front: [0, 5, 620], side: [700, 5, 0] },
  target: [0, 5, 0],
  how: [
    "The upper shaft turns at a steady speed. In each turn its front slice and its back slice take turns at driving. Only one pair of slices is in mesh at a time, because the two pairs lie in different planes.",
    "For a quarter turn the big front slice drives the small front slice. A big gear turning a small one makes it go fast, so the lower shaft does half a turn in that quarter. For the other three quarters the small back slice drives the big back slice. That is slow work, and the lower shaft does only the other half turn.",
    "Watch the Driven readout jump between fast and slow. The red mark hurries through its half turn, then crawls through the other half. The upper shaft never changes speed at all."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the slices in quarters and parts of quarters; here each shaft has just two slices, one in each plane, sized so they share out one whole turn. The plate, the base, the sizes and the number of teeth were made up. Where one pair hands over to the other, real teeth would need careful shaping to pass the drive on smoothly.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 5, PI = Math.PI;
    var o = this.o = { a: 0, phi0: PI };                 // opening: big front slice up and to the right, as drawn
    // Front pair: 40-tooth slice with 10 teeth (a quarter) drives a 20-tooth slice (half). Back pair: 24-tooth slice with 18 teeth
    // (three quarters) drives a 36-tooth slice (half). Both pairs: pitch radii 100 + 50 = 60 + 90 = 150 = distance between the shafts.
    var NA = 40, NA2 = 20, NB = 24, NB2 = 36, stA = 2 * PI / NA, stB = 2 * PI / NB, aA = 10 * stA;
    o.aA = aA; o.rA = NA / NA2; o.rB = NB / NB2;
    var ZA = 6, ZB = -8;                                 // front slices z 2..10, back slices z -12..-4
    function sector(N, n, rot, z, key, parent) {         // n teeth on multiples of the pitch from angle 0, then turned by rot
      var s = P.gearSector({ teeth: N, module: MD, fromDeg: 0, toDeg: (n - 1) * 360 / N + .01, width: 8, material: c.mat(key) });
      s.rotation.z = rot; s.position.z = z; parent.add(s); return s;
    }
    function shaft(y, key) {
      var g = new T.Group(); g.position.set(0, y, 0); scene.add(g);
      P.at(P.cylZ(6, 50, c.mat(key)), 0, 0, -5, g);     // shaft z -30..20, from the plate face
      P.at(P.cylZ(13, 26, c.mat(key)), 0, 0, -1, g);    // hub z -14..12, holds both slices
      return g;
    }
    // Upper shaft. The tooth meeting the lower shaft sits at local angle -PI/2 - phi. Front slice teeth at -PI/2 - (k+.5) stA, k 1..8;
    // back slice teeth at -PI/2 - aA - (k+.5) stB, k 1..16. The end teeth of every slice are left off so the pair that is
    // not driving never touches (checked over two turns: no overlap in either plane).
    o.up = shaft(75, "drive");
    sector(NA, 8, -PI / 2 - 8.5 * stA, ZA, "drive", o.up);
    sector(NB, 16, -PI / 2 - aA - 16.5 * stB, ZB, "drive", o.up);
    // Lower shaft. Its contact sits at local angle PI/2 - psi. Upper tooth k reaches the contact when the lower contact angle is
    // PI/2 + (k+.5) pitch, so the lower teeth go between: at PI/2 + k pitch.
    // At each hand-over the speed jumps; the missing end teeth leave room for that.
    o.lo = shaft(-75, "driven");
    sector(NA2, 9, PI / 2 + 2 * PI / NA2, ZA, "driven", o.lo);       // teeth k 1..9, between PI/2 and 3PI/2
    sector(NB2, 15, 3 * PI / 2 + 4 * PI / NB2, ZB, "driven", o.lo);  // teeth k 2..16, between 3PI/2 and 5PI/2
    // marks, 1 off the front faces (z 10.5..11.5)
    var m1 = new T.Group(); m1.rotation.z = PI; o.lo.add(m1);
    P.at(P.box(26, 5, 1, c.mat("stripe")), 14 + 13, 0, 11, m1);           // x 14..40, inside the root circle (43.75)
    var m2 = new T.Group(); m2.rotation.z = -PI / 2 - aA / 2; o.up.add(m2);
    P.at(P.box(76, 5, 1, c.mat("drive", "dark")), 14 + 38, 0, 11, m2);    // x 14..90, inside the root circle (93.75)
    // supports
    P.at(P.box(270, 380, 10, c.fixed), 0, 5, -35, scene);    // plate x -135..135, y -185..195, z -40..-30; shafts end at z -30
    P.at(P.box(300, 12, 100, c.fixed), 0, -191, -30, scene); // base x -150..150, y -197..-185, z -80..20; plate stands on y -185
  },

  // lower shaft angle for upper shaft angle phi (both measured from the start of the front pair's mesh)
  psi: function (phi) {
    var o = this.o, n = Math.floor(phi / (2 * Math.PI)), f = phi - 2 * Math.PI * n;
    var p = f <= o.aA ? -o.rA * f : -o.rA * o.aA - o.rB * (f - o.aA);
    return p - 2 * Math.PI * n;
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.a += S.w * dt;
    var phi = o.phi0 + o.a;
    o.up.rotation.z = phi;
    o.lo.rotation.z = this.psi(phi);
    var f = phi - 2 * Math.PI * Math.floor(phi / (2 * Math.PI)), r = f <= o.aA ? o.rA : o.rB;
    function fm(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", fm(rpm));
    S.set("out", fm(rpm === 0 ? 0 : -rpm * r));
  }
});
