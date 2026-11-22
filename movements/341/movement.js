M507.define({
  number: 341,
  title: "Grasshopper beam engine",
  lede: "A long beam rocks over a steam cylinder, but it has no fixed pivot. One end rides on a swinging post, and a bar from the wall steers it. Together they make the other end of the beam go straight up and down, right above the piston.",
  alt: "A long bellied beam lies across the top. Its left end is pinned to a piston rod that goes down into an upright cylinder. Its right end rests on a tall post that rocks on a bearing at the floor. A bar from a bracket on the wall holds the middle of the beam. A connecting rod hangs from the beam near the cylinder down to a crank at the floor.",
  parts: [
    { key: "beam", color: "#D9B13B", name: "Beam", note: "A long beam that rocks and slides a little. It has no fixed pivot of its own." },
    { key: "crank", color: "#5E7387", name: "Crank", note: "An arm on a shaft near the floor. The connecting rod turns it round once for every up and down stroke." },
    { key: "pillar", color: "#4FA58A", name: "Rocking post", note: "A tall post that rocks on a bearing at the floor. It holds up the far end of the beam and lets it move a little sideways." },
    { key: "links", color: "#8E7AA8", name: "Steering bar and connecting rod", note: "The short bar from the wall holds the middle of the beam on an arc. The connecting rod joins the beam to the crank." },
    { key: "piston", color: "#C8873A", name: "Piston rod and piston", note: "Pinned to the end of the beam. Watch it go straight up and down, with no sideways push on the cylinder." }
  ],
  readouts: [{ id: "p", label: "Piston" }, { id: "b", label: "Beam tilt" }],
  closed: { label: "Cylinder" },
  views: { "3d": [370, 220, 1000], front: [0, 30, 1040], side: [1040, 30, 0] },
  target: [0, 30, 0],
  how: [
    "Watch the beam. Its left end goes straight up and down over the cylinder. Its right end sits on the rocking post and only shuffles a little to the side. The crank near the floor goes round once for every stroke.",
    "The steering bar from the wall is exactly half as long as the beam, and it holds the middle of the beam. When the beam tilts, the bar swings and pulls its middle along an arc. Its right end can only shuffle sideways on the post. Those two moves together keep the left end on a straight upright line, so the piston rod needs no slide to guide it.",
    "Pick the piston rod and watch it slide straight through the cover. Then compare the two readings. The piston moves up and down a long way, while the beam only tilts a little. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the steering bar short, joined near the connecting rod. That shape cannot keep the piston rod straight, so here the bar is half as long as the beam and holds its middle, which makes the path straight to within a hair. The wall bracket, the bearings, the cylinder cover, the floor and all the sizes were made up. The cylinder is drawn see-through so the piston shows.",

  K: { XG: -176, Y2: 158, H: 172.5, DF: 98.7, LA: 308, CX: -78, CY: -143, R: 46, LF: 301, LP: 236 },

  // circle intersection: the point at distance ra from A and rb from B, the one nearest prev
  ci: function (A, ra, B, rb, prev) {
    var dx = B[0] - A[0], dy = B[1] - A[1], d = Math.sqrt(dx * dx + dy * dy);
    var a = (ra * ra - rb * rb + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ra * ra - a * a));
    var mx = A[0] + a * dx / d, my = A[1] + a * dy / d;
    var p = [mx + h * dy / d, my - h * dx / d], q = [mx - h * dy / d, my + h * dx / d];
    return Math.hypot(p[0] - prev[0], p[1] - prev[1]) < Math.hypot(q[0] - prev[0], q[1] - prev[1]) ? p : q;
  },
  // linkage for a steering-bar angle b: middle M on its arc about the wall pin, right end E on the post's arc, left end G = 2M - E
  cfg: function (b, Ep) {
    var K = this.K, M = [K.XG + K.H * Math.cos(b), K.Y2 + K.H * Math.sin(b)];
    var E = this.ci(M, K.H, K.O1, K.LA, Ep), ux = (M[0] - E[0]) / K.H, uy = (M[1] - E[1]) / K.H, k = 2 * K.H - K.DF;
    return { M: M, E: E, G: [2 * M[0] - E[0], 2 * M[1] - E[1]], F: [E[0] + k * ux, E[1] + k * uy] };
  },
  // find the bar angle that puts the connecting-rod pin F at the rod's length from the crank pin (Newton, small steps)
  solve: function (th) {
    var K = this.K, o = this.o, P = [K.CX + K.R * Math.cos(th), K.CY + K.R * Math.sin(th)], b = o.b, c, i;
    for (i = 0; i < 30; i++) {
      c = this.cfg(b, o.E);
      var r = Math.hypot(c.F[0] - P[0], c.F[1] - P[1]) - K.LF;
      if (Math.abs(r) < 1e-9) break;
      var c2 = this.cfg(b + 1e-6, c.E), r2 = Math.hypot(c2.F[0] - P[0], c2.F[1] - P[1]) - K.LF;
      b -= Math.max(-.02, Math.min(.02, r / ((r2 - r) / 1e-6)));
    }
    c = this.cfg(b, o.E); o.b = b; o.E = c.E; c.P = P;
    return c;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    K.O1 = [K.XG + K.H * (1 + Math.cos(Math.asin(K.R / (2 * K.H - K.DF)))), K.Y2 - K.LA];   // post foot under the middle of the top end's shuffle
    var o = this.o = { th: -117 * Math.PI / 180, b: 0, E: [K.XG + 2 * K.H, K.Y2] };
    // beam: a bellied plate z -6..6 from the left pin (x 0) to the right pin (x 2H), pins on its centre line
    var L = 2 * K.H, sh = new T.Shape(), i, n = 40, mb = c.mat("beam");
    for (i = 0; i <= n; i++) { var x = L * i / n, s = Math.sin(Math.PI * i / n); if (i) sh.lineTo(x, 9 + 5 * s); else sh.moveTo(x, 9); }
    for (i = n; i >= 0; i--) { var x2 = L * i / n, s2 = Math.sin(Math.PI * i / n); sh.lineTo(x2, -9 - 20 * s2); }
    var bg = new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false }); bg.translate(0, 0, -6);
    o.beam = new T.Group(); scene.add(o.beam);
    o.beam.add(P.mesh(bg, mb));
    P.at(P.cylZ(13, 12, mb), 0, 0, 0, o.beam); P.at(P.cylZ(13, 12, mb), L, 0, 0, o.beam);      // end eyes z -6..6
    P.at(P.cylZ(4, 30, mb), K.H, 0, 9, o.beam);                                                 // middle pin z -6..24
    P.at(P.cylZ(6, 2, c.mat("beam", "dark")), K.H, 0, 23.5, o.beam);                             // cap z 22..24
    P.at(P.cylZ(4, 22, mb), K.DF, 0, 5, o.beam);                                            // rod pin z -6..14
    P.at(P.cylZ(6, 1, c.mat("beam", "dark")), K.DF, 0, 16.5, o.beam);                      // cap z 14..15
    P.at(P.cylZ(4, 22, mb), L, 0, 5, o.beam);                                                   // post pin z -6..14
    P.at(P.cylZ(6, 2, c.mat("beam", "dark")), L, 0, 17, o.beam);                               // cap z 14..16
    // piston rod: fork cheeks z -12..-6 and 6..12 round the beam's left eye, cross piece, rod, piston
    var mp = c.mat("piston");
    o.piston = new T.Group(); scene.add(o.piston);
    [-9, 9].forEach(function (z) { P.at(P.box(16, 24, 6, mp), 0, -12, z, o.piston); P.at(P.cylZ(8, 6, mp), 0, 0, z, o.piston); });  // cheeks y -24..0
    P.at(P.cylZ(4, 24, mp), 0, 0, 0, o.piston);                                                // pin z -12..12
    P.at(P.cylZ(6, 2, c.mat("piston", "mark")), 0, 0, 13, o.piston);                           // cap z 12..14
    P.at(P.box(16, 8, 24, mp), 0, -28, 0, o.piston);                                            // cross piece y -32..-24
    P.at(P.cylY(5, K.LP - 32, mp), 0, -32 - (K.LP - 32) / 2, 0, o.piston);                     // rod y -LP..-32
    P.at(P.cylY(33, 10, mp), 0, -K.LP, 0, o.piston);                                            // piston in the bore of 36
    // links: steering bar z 16..22 (wall pin to middle), connecting rod z 8..14 (beam to crank), rocking post z 8..14
    var my = c.mat("links"), mg = c.mat("pillar");
    function link(m, z, r, er) { var g = { rod: P.rod(r, m), e1: P.cylZ(er, 6, m), e2: P.cylZ(er, 6, m), z: z }; scene.add(g.rod); scene.add(g.e1); scene.add(g.e2); return g; }
    o.bar = link(my, 19, 4, 8); o.con = link(my, 11, 4.5, 9); o.post = link(mg, 11, 5, 10);
    // crank: shaft z -24..0, arm z 0..6, pin z 6..15, cap 15..17
    var mc = c.mat("crank");
    o.crank = new T.Group(); o.crank.position.set(K.CX, K.CY, 0); scene.add(o.crank);
    P.at(P.cylZ(7, 24, mc), 0, 0, -12, o.crank);
    P.at(P.cylZ(14, 6, mc), 0, 0, 3, o.crank);
    P.at(P.box(K.R, 16, 6, mc), K.R / 2, 0, 3, o.crank);
    P.at(P.cylZ(10, 6, mc), K.R, 0, 3, o.crank);
    P.at(P.cylZ(5, 9, mc), K.R, 0, 10.5, o.crank);
    P.at(P.cylZ(7, 2, c.mat("crank", "dark")), K.R, 0, 16, o.crank);

    // supports. Floor y -222..-210, x -260..240, z -70..50
    P.at(P.box(500, 12, 120, c.fixed), -10, -216, -10, scene);
    // wall x -250..-200, y -210..260, z -60..-40; bracket x -212..-200, y 144..172, z -40..30; plate x -200..-164, y 146..170, z 24..30
    P.at(P.box(50, 470, 20, c.fixed), -225, 25, -50, scene);
    P.at(P.box(12, 28, 70, c.fixed), -206, 158, -5, scene);
    P.at(P.box(36, 24, 6, c.fixed), -182, 158, 27, scene);
    P.at(P.cylZ(4, 15.5, my), K.XG, K.Y2, 23.75, scene);                                            // wall pin z 16..30
    P.at(P.cylZ(6, 2, c.mat("links", "dark")), K.XG, K.Y2, 32.5, scene);                         // cap z 30..32
    // cylinder: foot x -224..-128, y -210..-171, z -48..48; open tube y -171..-6, radius 36; cover y -6..0; gland y 0..10
    P.at(P.box(96, 39, 96, c.fixed), K.XG, -190.5, 0, scene);
    c.shell(P.at(P.mesh(new T.CylinderGeometry(36, 36, 165, 40, 1, true), c.fixed), K.XG, -88.5, 0, scene));
    c.shell(P.at(P.guideBlock({ w: 84, h: 6, d: 84, hole: 6, material: c.fixed }), K.XG, -3, 0, scene));
    c.shell(P.at(P.guideBlock({ w: 22, h: 10, d: 22, hole: 6, material: c.fixed }), K.XG, 5, 0, scene));
    // crank bearing z -24..-10, foot on the floor y -210; post bearing z -6..7, foot on the floor
    P.at(P.bearingBlock({ bore: 7.5, outer: 16, width: 14, drop: K.CY + 210, material: c.fixed }), K.CX, K.CY, -17, scene);
    P.at(P.bearingBlock({ bore: 4.5, outer: 14, width: 13, drop: K.O1[1] + 210, material: c.fixed }), K.O1[0], K.O1[1], .5, scene);
    P.at(P.cylZ(4, 20, mg), K.O1[0], K.O1[1], 4, scene);                                       // post foot pin z -6..14
    P.at(P.cylZ(6, 2, c.mat("pillar", "dark")), K.O1[0], K.O1[1], 15, scene);                  // cap z 14..16
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    o.th += S.w * dt;
    var q = this.solve(o.th);
    o.crank.rotation.z = o.th;
    o.beam.position.set(q.G[0], q.G[1], 0); o.beam.rotation.z = Math.atan2(q.E[1] - q.G[1], q.E[0] - q.G[0]);
    o.piston.position.set(q.G[0], q.G[1], 0);
    function place(g, A, B) { g.rod.span(A[0], A[1], g.z, B[0], B[1], g.z); g.e1.position.set(A[0], A[1], g.z); g.e2.position.set(B[0], B[1], g.z); }
    place(o.bar, [K.XG, K.Y2], q.M); place(o.con, q.F, q.P); place(o.post, K.O1, q.E);
    function sg(v, u) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + u; }
    S.set("p", sg(q.G[1] - K.Y2, " mm"));
    S.set("b", sg(o.beam.rotation.z * 180 / Math.PI, "°"));
  }
});
