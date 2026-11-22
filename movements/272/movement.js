M507.define({
  number: 272,
  title: "Bevelled disc cam",
  lede: "A thick disc sits slightly crooked on a shaft, with a sloping edge. A rod rests against its face. As the shaft turns, the face seems to rock to and fro, and the rod is pushed along its own length and then follows it back. This turns a steady spin into a push and pull.",
  alt: "A thick round disc with a sloping rim, mounted crooked on a level shaft held by two uprights. A straight rod, held in two guides, slopes down from the upper left and rests its rounded end on the face of the disc.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Bevelled disc", note: "A thick disc fixed on the shaft at a slant. Its edge is bevelled, which means sloped. The red stripe on its face shows it turning." },
    { key: "shaft", color: "#8E7AA8", name: "Shaft", note: "The level shaft that carries the disc and spins. It turns in two uprights." },
    { key: "rod", color: "#D9B13B", name: "Rod", note: "A bar in two guides. It can only slide along its own length. Its rounded end rests on the disc. Watch the red band at the far end go to and fro." }
  ],
  controls: [{ id: "tilt", label: "Slant of the disc", value: "mid", options: [["small", "Small"], ["mid", "Medium"], ["large", "Large"]] }],
  readouts: [{ id: "x", label: "Rod pushed out" }, { id: "w", label: "Disc" }],
  views: { "3d": [150, 230, 900], front: [-65, 60, 950], side: [1000, 60, 0] },
  target: [-65, 60, 0],
  distance: [350, 2000],
  how: [
    "The disc does not stand square on the shaft. Its face leans a little, so as it spins, the point of the face that touches the rod keeps moving nearer and farther along the shaft. It is like a wobbling coin that has just been dropped.",
    "The rod is held in two guides, so it can only slide. The face pushes it away, then a little later lets it come back. The rod keeps pressing on the face as it turns. One full turn of the disc gives one push out and one return.",
    "Try the three slants. The more crooked the disc, the farther the rod is pushed. Watch the red band at the end of the rod."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the disc as a solid with a curved side and a sloping edge. Here it is made as a thick disc set crooked on the shaft, with a bevelled rim, which gives the same push on the rod. The base, the two uprights, the posts for the guides, the sizes and the three slants were made up. A real rod would need a spring or its own weight to keep touching the disc.",

  // Disc centre at the origin, shaft along X. Rod in the XY plane (z = 0), sloping down to the right.
  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, U = { x: .83, y: -.55 }, P0 = { x: -48, y: 90 }, i;
    var o = this.o = { a: 0, U: U, P0: P0, RT: 11, H: 18 + 11, s0: {} };
    o.spin = new T.Group(); scene.add(o.spin);
    o.tilt = new T.Group(); o.spin.add(o.tilt);
    var geo = new T.CylinderGeometry(112, 125, 36, 56), disc = new T.Mesh(geo, c.mat("cam"));
    disc.rotation.z = Math.PI / 2; o.tilt.add(disc);                                // faces x -18 (radius 112) and +18 (radius 125), in the tilted frame
    P.at(P.box(1, 70, 6, c.mat("cam", "mark")), -19, 62, 0, o.tilt);                // red stripe on the face, x -19.5..-18.5
    P.at(P.cylX(20, 64, c.mat("shaft")), 0, 0, 0, o.spin);                           // hub x -32..32
    P.at(P.cylX(10, 292, c.mat("shaft")), 0, 0, 0, o.spin);                          // shaft x -146..146, bearing face to bearing face
    P.at(P.box(1, 4, 14, c.mat("shaft", "dark")), 0, 0, 0, o.spin).visible = false;
    P.at(P.box(30, 1, 6, c.mat("shaft", "mark")), 110, 10.5, 0, o.spin);               // red stripe on the shaft x 95..125, y 10..11 (off the shaft)
    // rod and its red end band
    o.rod = P.at(P.rod(11, c.mat("rod")), 0, 0, 0, scene);
    o.cap = P.at(P.sphere(11, c.mat("rod")), 0, 0, 0, scene);
    o.band = P.at(P.rod(11.8, c.mat("rod", "mark")), 0, 0, 0, scene);
    // guides on posts
    [-100, -210].forEach(function (t) {
      var gx = P0.x + t * U.x, gy = P0.y + t * U.y, top = gy - 23, a = Math.atan2(U.y, U.x);
      var gb = P.at(P.guideBlock({ w: 30, h: 28, d: 40, hole: 11.6, material: c.fixed }), gx, gy, 0, scene);
      gb.rotation.z = a - Math.PI / 2;
      P.at(P.box(20, top + 140, 30, c.fixed), gx, (top - 140) / 2, 0, scene);       // post y -140..top, z -15..15
    });
    // supports
    [-1, 1].forEach(function (k) { P.at(P.box(24, 170, 60, c.fixed), k * 158, -55, 0, scene); });   // uprights x +-146..170, y -140..30, z -30..30; shaft ends at x +-146
    P.at(P.box(500, 12, 200, c.fixed), -30, -146, 0, scene);                         // base x -280..220, y -152..-140, z -100..100
  },

  step: function (c, dt, S) {
    var o = this.o, al = { small: 10, mid: 17, large: 26 }[S.controls.tilt] || 17;
    al *= Math.PI / 180;
    o.a += S.w * dt;
    o.spin.rotation.x = o.a; o.tilt.rotation.z = al;
    var cp = Math.cos(o.a), ca = Math.cos(al), sa = Math.sin(al), U = o.U, P0 = o.P0;
    function sOf(cphi) { return (-o.H - (P0.x * ca + P0.y * sa * cphi)) / (U.x * ca + U.y * sa * cphi); }
    var s = sOf(cp), s0 = sOf(1);
    var tx = P0.x + s * U.x, ty = P0.y + s * U.y;
    var bx = P0.x - 300 * U.x, by = P0.y - 300 * U.y;
    o.rod.span(bx, by, 0, tx, ty, 0);
    o.cap.position.set(tx, ty, 0);
    o.band.span(bx - .6 * U.x, by - .6 * U.y, 0, bx + 40 * U.x, by + 40 * U.y, 0);
    S.set("x", Math.round(s - s0) + " mm");
    S.set("w", (S.playing ? S.rpm : 0) + " rpm");
  }
});
