M507.define({
  number: 32,
  title: "Friction wheels",
  lede: "Two plain wheels with no teeth press rim to rim. As one turns, it rubs the other round. They run quietly and smoothly, but they only work if they grip well.",
  alt: "A small wheel on the left and a bigger wheel on the right, touching at their rims. Each turns on a short shaft sticking out of an upright plate. The small wheel, which drives the other, has a dark rubber band round its rim. A red stripe marks each wheel.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving wheel", note: "It turns at a steady speed. Its rim is covered with a dark band of rubber that grips the other wheel. Watch its red stripe." },
    { key: "driven", color: "#C8873A", name: "Driven wheel", note: "A plain wheel with no teeth. Only the grip at the rims makes it turn. Watch its red stripe." }
  ],
  controls: [{ id: "rim", label: "Rims", value: "rubber", options: [["rubber", "Rubber faced"], ["bare", "Bare and smooth"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [255, 145, 545], front: [20, 0, 720], side: [720, 0, 0] },
  target: [20, 0, 0],
  how: [
    "The small wheel is turned at a steady speed. Where the rims touch, it rubs the big wheel and drags it round. The two wheels turn opposite ways. A minus sign in the readout means the other way.",
    "When the rims grip, they move past the meeting point at the same speed. The big wheel has a longer rim, so it turns more slowly. Both red stripes start at the meeting point. After a few turns they meet there again, both at once.",
    "The driven wheel has work to do, so it pushes back. Smooth metal rims cannot grip hard enough, so they slide. That is why one rim is covered with rubber or leather. Try Rubber faced, then Bare and smooth, and watch the red stripes stop meeting."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two wheels. The plate that holds the shafts and the sizes were made up. How much the bare wheels slip was also made up; a real pair slips more or less depending on how hard the wheels are pressed together and how much work the driven wheel does.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R1 = 60, R2 = 100, XD = -R1, XB = R2;
    var o = this.o = { a: 0, b: 0, R1: R1, R2: R2 };
    // a plain wheel: back face flat at z -10, rim z -10..10, web recessed to z 4 inside the rim
    function wheel(R, m) {
      return P.lathePulley({ points: [[R, -10], [R, -10], [R, 10], [R, 10], [R - 10, 10], [R - 10, 10], [R - 10, 4], [R - 10, 4]], material: m });
    }
    function ring(r0, r1, z0, z1, m) {
      var pts = [[r0, z0], [r1, z0], [r1, z1], [r0, z1], [r0, z0]].map(function (p) { return new T.Vector2(p[0], p[1]); });
      var g = new T.LatheGeometry(pts, 96); g.rotateX(Math.PI / 2); return P.mesh(g, m);
    }
    // driving wheel: core rim radius 57, rubber band r 56..60, z -10.5..10.5 (sticks out 0.5 past each rim face)
    o.g1 = new T.Group(); o.g1.position.set(XD, 0, 0); scene.add(o.g1);
    o.g1.add(wheel(R1 - 3, c.mat("drive")));
    o.band = ring(R1 - 4, R1, -10.5, 10.5, c.mat("drive", "dark")); o.g1.add(o.band);
    o.bandDark = o.band.material; o.bandBare = c.mat("drive");
    P.at(P.cylZ(6, 60, c.mat("drive")), 0, 0, 0, o.g1);                       // shaft z -30..30, starts at the plate face
    P.at(P.cylZ(14, 10, c.mat("drive")), 0, 0, 9, o.g1);                      // hub z 4..14, on the web face
    P.at(P.box(R1 - 3 - 10 - 17, 5, 1, c.mat("drive", "mark")), 14 + 1.5 + (R1 - 30) / 2, 0, 5, o.g1);   // stripe x 15.5..45.5, z 4.5..5.5, on the web
    P.at(P.box(8, 5, 1, c.mat("drive", "mark")), 51, 0, 11, o.g1);            // rim mark x 47..55, z 10.5..11.5, clear of the band (r >= 56)
    // driven wheel: rim radius 100, touching the band at x = 0 (centres R1 + R2 apart)
    o.g2 = new T.Group(); o.g2.position.set(XB, 0, 0); scene.add(o.g2);
    o.g2.add(wheel(R2, c.mat("driven")));
    P.at(P.cylZ(6, 34, c.mat("driven")), 0, 0, -13, o.g2);                    // shaft z -30..4, plate face to web face
    P.at(P.cylZ(14, 10, c.mat("driven")), 0, 0, 9, o.g2);                     // hub z 4..14, on the web face
    P.at(P.box(R2 - 10 - 16, 5, 1, c.mat("driven", "mark")), -(15 + (R2 - 26) / 2), 0, 5, o.g2);   // stripe x -89..-15, z 4.5..5.5, pointing at the meeting point
    P.at(P.box(9, 5, 1, c.mat("driven", "mark")), -(R2 - 5.5), 0, 11, o.g2);  // rim mark x -99..-90, z 10.5..11.5
    // supports
    P.at(P.box(390, 260, 10, c.fixed), 20, 0, -35, scene);                    // plate x -175..215, y -130..130, z -40..-30; shafts end at z -30
    P.at(P.box(430, 12, 100, c.fixed), 20, -136, -30, scene);                 // base x -195..235, y -142..-130, z -80..20; plate stands on y -130
  },

  step: function (c, dt, S) {
    var o = this.o, grip = S.controls.rim !== "bare", k = grip ? 1 : 0.6;   // bare rims: the driven rim keeps only part of the pace (made up)
    o.band.material = grip ? o.bandDark : o.bandBare;
    o.a += S.w * dt;
    o.b -= S.w * dt * o.R1 / o.R2 * k;                      // equal rim speeds, opposite way; less when slipping
    o.g1.rotation.z = o.a;
    o.g2.rotation.z = o.b;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : -rpm * o.R1 / o.R2 * k));
  }
});
