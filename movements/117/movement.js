M507.define({
  number: 117,
  title: "Cam between two rollers",
  lede: "A lumpy cam turns on a shaft between two small wheels, called rollers. The rollers are held in a frame, and the frame moves up and down as the cam turns. Steam engines used this to open and close their valves.",
  alt: "A frame with a flat plate at the top and another at the bottom, joined by two upright bars. Each plate carries a small roller, and a rod runs out of it. Between the two rollers a lumpy cam turns on a shaft.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Cam", note: "A lumpy disc fixed on the shaft. It touches both rollers all the time. The red peg marks one spot on it. Watch it go round." },
    { key: "rollers", color: "#C8873A", name: "Rollers", note: "Two small wheels that spin on pins. They roll on the cam, so there is very little rubbing." },
    { key: "yoke", color: "#D9B13B", name: "Yoke", note: "A frame with a plate at the top and a plate at the bottom, joined by two bars. It holds the rollers a fixed distance apart." },
    { key: "rods", color: "#4FA58A", name: "Rods", note: "Fixed to the middle of each plate. They slide through fixed guides, so they move in a straight line." }
  ],
  readouts: [{ id: "x", label: "Rod travel" }],
  views: { front: [0, 0, 860], "3d": [300, 200, 760], side: [860, 0, 0] },
  target: [0, -5, 0],
  how: [
    "The shaft turns, and the cam turns with it. The cam is lumpy, so its sides are at different distances from the shaft. Watch the red peg go round.",
    "One roller sits above the cam and one below. The frame keeps them the same distance apart, and the cam is shaped so that it always touches both. A bulge on the top pushes the frame up. A bulge on the bottom pushes it down. The rods go with the frame.",
    "Watch the readout while the cam turns. The travel rises and falls once for each turn. Press pause and look at the two rollers. Both are touching the cam."
  ],
  note: "This model is rebuilt from Brown's drawing. The guides for the rods, the bearing behind the shaft, the base and all the sizes were made up. The shape of the cam was worked out so that it touches both rollers at every angle. The two rollers turn at the speed the cam surface carries them.",

  K: { R0: 76, r: 22, A: 18, B: 5 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, R0 = K.R0, r = K.r, i, p;
    var o = this.o = { a: 0, ra: [0, 0], y: 0 };
    // centre path of the rollers, measured from the shaft: the same total length for opposite directions
    o.rho = function (t) { return R0 + K.A * Math.cos(t - 0.6) + K.B * Math.sin(3 * t + 0.5); };
    o.drho = function (t) { return -K.A * Math.sin(t - 0.6) + 3 * K.B * Math.cos(3 * t + 0.5); };
    o.pt = function (t) {                                                       // centre path point and outward normal
      var q = o.rho(t), d = o.drho(t), co = Math.cos(t), si = Math.sin(t);
      var dx = d * co - q * si, dy = d * si + q * co, l = Math.sqrt(dx * dx + dy * dy);
      return { x: q * co, y: q * si, nx: dy / l, ny: -dx / l };
    };
    // cam outline: the centre path pulled in by one roller radius, so a roller on the path just touches it
    var sh = new T.Shape(), first;
    for (i = 0; i < 360; i++) {
      p = o.pt(i * Math.PI / 180);
      if (i) sh.lineTo(p.x - r * p.nx, p.y - r * p.ny); else { sh.moveTo(p.x - r * p.nx, p.y - r * p.ny); first = p; }
    }
    o.rot = new T.Group(); scene.add(o.rot);
    var cg = new T.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); cg.translate(0, 0, -7);
    o.rot.add(P.mesh(cg, c.mat("cam")));                                        // cam z -7..7
    P.at(P.cylZ(12.5, 65, c.mat("cam")), 0, 0, -12.5, o.rot);                   // shaft z -45 bearing face .. 20
    P.at(P.cylZ(12, 22, c.mat("cam")), 0, 0, 0, o.rot);                         // hub z -11..11
    P.at(P.box(3, 20, 1, c.mat("cam", "dark")), 0, 0, 20.5, o.rot);             // key mark on the shaft end, z 20..21
    P.at(P.cylZ(3.5, 7, c.mat("cam", "mark")), (first.x - r * first.nx) * 0.6, (first.y - r * first.ny) * 0.6, 10.5, o.rot);   // red peg z 7..14
    // yoke: plates y +-(100..112), z -20..20, x +-130; bars x +-105; rollers centred y +-76
    o.yoke = new T.Group(); scene.add(o.yoke);
    o.rl = [];
    [1, -1].forEach(function (s, k) {
      P.at(P.box(260, 12, 40, c.mat("yoke")), 0, s * 106, 0, o.yoke);            // plate y 100..112 (top) or -112..-100
      [1, -1].forEach(function (z) { P.at(P.box(10, 30, 6, c.mat("yoke")), 0, s * 85, z * 12, o.yoke); });   // cheeks y 70..100, z 9..15 and -15..-9
      P.at(P.cylZ(4, 28, c.mat("yoke")), 0, s * R0, 0, o.yoke);                  // pin z -14..14, ends inside the cheeks
      var g = new T.Group(); g.position.set(0, s * R0, 0); o.yoke.add(g);
      g.add(P.cylZ(r, 14, c.mat("rollers")));                                    // roller z -7..7
      P.at(P.box(3, 2 * r - 6, 1, c.mat("rollers", "dark")), 0, 0, 7.5, g);      // stripe z 7..8 on the roller face
      o.rl.push(g);
      P.at(P.cylY(7, 110, c.mat("rods")), 0, s * 162, 0, o.yoke);                // rods |y| 107..217, starting in the plate
    });
    [1, -1].forEach(function (s) { P.at(P.cylY(5, 218, c.mat("yoke")), s * 105, 0, 0, o.yoke); });   // bars y -109..109, ends inside the plates
    // supports: guides |y| 178..202 held by arms, back plate with the bearing, base
    [1, -1].forEach(function (s) {
      P.at(P.guideBlock({ w: 24, h: 24, d: 24, hole: 7.5, material: c.fixed }), 0, s * 190, 0, scene);   // guide x -12..12, |y| 178..202, z -12..12
      P.at(P.box(24, 24, 33, c.fixed), 0, s * 190, -28.5, scene);                                        // arm z -45..-12
    });
    P.at(P.box(60, 440, 10, c.fixed), 0, -8, -50, scene);                        // back plate x -30..30, y -228..212, z -55..-45; shaft ends on its face
    P.at(P.box(260, 12, 110, c.fixed), 0, -234, -15, scene);                     // base x -130..130, y -240..-228, z -70..40
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, r = K.r, a, t, yc, py, p, cx, cy, dx, dy, vx, vy, tx, ty, k, w, dy0;
    o.a += S.w * dt;
    o.rot.rotation.z = o.a;
    // the cam angle seen from the shaft: the roller above sits at 90 degrees, the one below at 270
    yc = (o.rho(Math.PI / 2 - o.a) - o.rho(3 * Math.PI / 2 - o.a)) / 2;
    dy0 = dt > 0 ? (yc - o.y) / dt : 0;
    o.y = yc;
    o.yoke.position.y = yc;
    // each roller rolls on the cam: its rim moves with the cam surface where they touch
    [1, -1].forEach(function (s, i) {
      var th = s > 0 ? Math.PI / 2 - o.a : 3 * Math.PI / 2 - o.a, cs = Math.cos(o.a), sn = Math.sin(o.a);
      p = o.pt(th);
      cx = (p.x - r * p.nx) * cs - (p.y - r * p.ny) * sn;                         // contact point, world, from the shaft
      cy = (p.x - r * p.nx) * sn + (p.y - r * p.ny) * cs;
      dx = (-p.nx) * cs - (-p.ny) * sn; dy = (-p.nx) * sn + (-p.ny) * cs;        // from roller centre to contact point, length r
      vx = -S.w * cy; vy = S.w * cx - dy0;                                        // cam surface velocity relative to the roller centre
      tx = -dy / r; ty = dx / r;
      o.ra[i] += ((vx * tx + vy * ty) / r) * dt;
      o.rl[i].rotation.z = o.ra[i];
    });
    var v = Math.round(yc);
    S.set("x", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm");
  }
});
