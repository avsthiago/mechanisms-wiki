M507.define({
  number: 272,
  title: "Bevelled disc cam",
  lede: "A thick disc turns on a shaft. One face of the disc is wavy, and its rim slopes. A rod lies along the slope with its end against the wavy face. As the disc turns, the rod is pushed back and then slides down again. This turns a steady spin into a push and pull.",
  alt: "A thick disc on a level shaft held by two uprights. Its right face is flat with a hub. Its left face is wavy, and its rim slopes like the side of a cone. A straight rod in two guides comes down from the upper left, lying along the sloping rim, with its end against the wavy face.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Bevelled disc", note: "A thick disc fixed square on the shaft. Its rim is bevelled, which means sloped, and its left face rises and falls in waves. The red line on the rim shows it turning." },
    { key: "shaft", color: "#8E7AA8", name: "Shaft", note: "The level shaft that carries the disc and spins. It turns in two uprights." },
    { key: "rod", color: "#D9B13B", name: "Rod", note: "A bar in two guides. It can only slide along its own length. It lies on the sloping rim with its end against the wavy face. Watch the red band at the far end go to and fro." }
  ],
  controls: [{ id: "wave", label: "Depth of the waves", value: "mid", options: [["small", "Shallow"], ["mid", "As drawn"], ["large", "Deep"]] }],
  readouts: [{ id: "x", label: "Rod pushed out" }],
  views: { "3d": [-520, 260, 900], front: [-60, 50, 1000], side: [-1000, 60, 0] },
  target: [-60, 50, 0],
  distance: [350, 2000],
  how: [
    "Look at the left face of the disc. It is not flat. It bulges out in two places and dips in two places. The rim between the two faces slopes, like the side of a cone.",
    "The rod lies along the top of the sloping rim, and its end rests against the wavy face. When a bulge comes round to the top, it pushes the rod back up its guides. When a dip comes round, the rod slides down again under its own weight. One turn of the disc gives two pushes.",
    "Try shallow waves, then deep ones. The deeper the waves, the farther the rod is pushed. Watch the red band at the end of the rod."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the wavy face from the side only, so the shape of the waves, two to a turn, was made up. The base, the two uprights, the posts for the guides and the sizes were also made up. The rod is kept on the disc by its own weight, as it slopes down towards it.",

  // Shaft along X through the origin. The right face of the disc is flat at x = XR with radius R1. The rim is a cone
  // whose radius grows by K for each unit to the left. The left face sits at x = XL0 - A cos 2phi (phi round the shaft,
  // 0 at the top), so it has two bulges and two dips. The rod lies along the top line of the cone, one rod radius above it.
  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { a: 0, XR: 40, R1: 95, K: .6, XL0: -48, RT: 11, A: null };
    var n = Math.hypot(1, o.K); o.U = [1 / n, -o.K / n]; o.N = [o.K / n, 1 / n];   // U along the rod towards the disc, N outward from the cone
    o.spin = new T.Group(); scene.add(o.spin);
    o.disc = new T.Mesh(new T.BufferGeometry(), c.mat("cam")); o.disc.material.side = T.DoubleSide; o.disc.userData.live = true; o.spin.add(o.disc);
    o.line = P.at(P.rod(1.5, c.mat("cam", "mark")), 0, 0, 0, o.spin);                 // red line along the rim at phi = 0, set with the disc
    P.at(P.cylX(25, 30, c.mat("shaft")), 55, 0, 0, o.spin);                           // hub x 40..70 on the flat face
    P.at(P.cylX(10, 310, c.mat("shaft")), 15, 0, 0, o.spin);                          // shaft x -140..170, bearing face to bearing face
    P.at(P.box(30, 1, 6, c.mat("shaft", "mark")), 120, 10.5, 0, o.spin);              // red stripe on the shaft x 105..135, y 10..11 (off the shaft)
    // rod and its red end band
    o.rod = P.at(P.rod(o.RT, c.mat("rod")), 0, 0, 0, scene);
    o.band = P.at(P.rod(o.RT + .8, c.mat("rod", "mark")), 0, 0, 0, scene);
    // the rod's line: corner of the cone at x = XL0, lifted by RT
    var r0 = o.R1 + o.K * (o.XR - o.XL0); o.L0 = [o.XL0 + o.RT * o.N[0], r0 + o.RT * o.N[1]];
    // guides on posts, left of the shaft's end so the posts miss it
    var base = -180, ang = Math.atan2(o.U[1], o.U[0]);
    [-200, -262].forEach(function (gx) {
      var t = (gx - o.L0[0]) / o.U[0], gy = o.L0[1] + t * o.U[1];
      var gb = P.at(P.guideBlock({ w: 30, h: 28, d: 40, hole: 11.6, material: c.fixed }), gx, gy, 0, scene);
      gb.rotation.z = ang - Math.PI / 2;
      var top = gy - 23;
      P.at(P.box(20, top - base, 30, c.fixed), gx, (top + base) / 2, 0, scene);     // post y -180 (base top)..under the guide, z -15..15
    });
    // supports
    P.at(P.box(24, 205, 60, c.fixed), -152, -77.5, 0, scene);                         // left upright x -164..-140, y -180..25; shaft ends at -140
    P.at(P.box(24, 205, 60, c.fixed), 182, -77.5, 0, scene);                          // right upright x 170..194
    P.at(P.box(520, 12, 200, c.fixed), -50, -186, 0, scene);                          // base x -310..210, y -192..-180, z -100..100
  },

  xl: function (phi) { return this.o.XL0 - this.o.A * Math.cos(2 * phi); },

  // Rebuild the disc for wave depth A: wavy left face, sloping rim, flat right face, each with its own vertices so edges stay sharp.
  shape: function (A) {
    var o = this.o, T = this.T, self = this, NA = 96, NR = 6, pos = [], idx = [], i, j;
    o.A = A;
    function v(x, r, p) { pos.push(x, r * Math.cos(p), r * Math.sin(p)); return pos.length / 3 - 1; }
    function rim(x) { return o.R1 + o.K * (o.XR - x); }
    var start = 0;                                                                   // left face: rings from the centre out
    for (i = 0; i <= NA; i++) { var p = i / NA * 2 * Math.PI, x = self.xl(p); for (j = 0; j <= NR; j++) v(x, rim(x) * j / NR, p); }
    for (i = 0; i < NA; i++) for (j = 0; j < NR; j++) { var a0 = start + i * (NR + 1) + j, b0 = a0 + NR + 1; idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1); }
    start = pos.length / 3;                                                          // rim: left edge to right edge
    for (i = 0; i <= NA; i++) { var q = i / NA * 2 * Math.PI, xq = self.xl(q); v(xq, rim(xq), q); v(o.XR, o.R1, q); }
    for (i = 0; i < NA; i++) { var k = start + 2 * i; idx.push(k, k + 1, k + 2, k + 2, k + 1, k + 3); }
    start = pos.length / 3; var cIdx = v(o.XR, 0, 0);                                // right face
    for (i = 0; i <= NA; i++) v(o.XR, o.R1, i / NA * 2 * Math.PI);
    for (i = 0; i < NA; i++) idx.push(cIdx, start + 1 + i, start + 2 + i);
    var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    o.disc.geometry.dispose(); o.disc.geometry = g;
    var x0 = this.xl(0), lift = 1.6;                                                  // red line along the rim at phi = 0, lifted off it
    o.line.span(x0 + lift * o.N[0], rim(x0) + lift * o.N[1], 0, o.XR + lift * o.N[0], o.R1 + lift * o.N[1], 0);
  },

  step: function (c, dt, S) {
    var o = this.o, A = { small: 10, mid: 20, large: 30 }[S.controls.wave] || 20;
    this.T = c.THREE;
    if (o.A !== A) this.shape(A);
    o.a += S.w * dt;
    o.spin.rotation.x = o.a;
    // the face point now at the top is at local phi = -a; the rod's end face rests on the corner there
    var x = this.xl(-o.a), s = (x - o.XL0) / o.U[0];                                  // how far the end has moved along the rod from x = XL0
    var tx = o.L0[0] + s * o.U[0], ty = o.L0[1] + s * o.U[1];
    var bx = tx - 290 * o.U[0], by = ty - 290 * o.U[1];
    o.rod.span(bx, by, 0, tx, ty, 0);
    o.band.span(bx - .6 * o.U[0], by - .6 * o.U[1], 0, bx + 40 * o.U[0], by + 40 * o.U[1], 0);
    S.set("x", Math.round((o.XL0 + A - x) / o.U[0]) + " mm");
  }
});
