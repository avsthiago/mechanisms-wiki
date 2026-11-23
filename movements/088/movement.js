M507.define({
  number: 88,
  title: "Cam and stops",
  lede: "A cam turns all the time, but the disc behind it moves in jumps. Each turn of the cam pushes the disc half a turn, then lets it rest. This changes steady turning into stop-and-go turning.",
  alt: "A large flat disc with two square pegs near its edge, one on each side. In front of it a smaller flat cam, shaped like a snail shell, turns on a shaft a little to one side of the disc's centre. A step on the cam's edge sits just below the left peg.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Cam", note: "A flat plate shaped like a snail shell, fixed to the turning shaft. The step on its edge catches the stops and pushes them." },
    { key: "disc", color: "#C8873A", name: "Disc", note: "Turns on its own centre, a little to one side of the cam's shaft. It only moves while the cam pushes one of its stops." },
    { key: "stops", color: "#C2503F", name: "Stops", note: "Two square pegs on the disc, opposite each other. Watch them: the step pushes one, then lets it go." },
    { key: "brake", color: "#4FA58A", name: "Brake", note: "A pad pressed on the edge of the disc by a spring. It rubs just enough to keep the disc still while it rests." }
  ],
  controls: [{ id: "centre", label: "Disc centre", value: "off", options: [["off", "Beside the cam's shaft"], ["on", "On the cam's shaft"]] }],
  readouts: [{ id: "cam", label: "Cam" }, { id: "disc", label: "Disc" }],
  views: { "3d": [320, 190, 680], front: [5, -10, 600], side: [600, 0, 0] },
  target: [5, -10, 0],
  how: [
    "The cam turns steadily. Its edge has a step. When the step comes round, it catches a stop on the disc and pushes it. While it pushes, the disc turns with the cam.",
    "The disc turns on a centre a little to one side of the cam's shaft. So the stop being pushed slowly moves away from the cam's shaft. After half a turn it is past the top of the step and slips off. The disc rests while the cam finishes its turn. The rest of the cam's edge slopes inward, so it slides past the waiting stops. Then the step reaches the other stop, which now waits where the first one started.",
    "Try On the cam's shaft. Now the stop always stays the same distance from the cam's shaft. It never slips off the step, so the disc just turns with the cam. Compare the two readouts each way."
  ],
  note: "This model is rebuilt from Brown's drawing. The shape of the cam's edge was worked out so the step catches each stop and lets it go after half a turn. The plate behind, the fixed round boss the disc turns on, and all the sizes were made up. Brown does not say what keeps the disc still while it rests, so a brake pad pressed by a spring was added. The choice of disc centre was added to show why the two centres must be apart.",

  // Shape of the cam and the stops. Cam: a snail-shell edge whose radius falls steadily from ROUT just behind the step
  // to RIN just ahead of it, with the step at angle PHI (radians, cam's own frame). Stops: squares of half size H
  // whose centres sit R from the disc centre, at disc angles beta and beta + pi.
  G: { RIN: 70, ROUT: 100, PHI: 196 * Math.PI / 180, R: 101, H: 6, E: 12, QANG: -66.16 * Math.PI / 180, N: 720 },

  // Disc angle for each cam angle over one turn, found from contact: at each small step of the cam the disc turns
  // (clockwise, like the cam) only as far as it must so that no stop overlaps the cam. When nothing pushes, the brake
  // holds it. Runs two turns and keeps the second, which repeats exactly.
  table: function (e) {
    var G = this.G, TP = 2 * Math.PI, Qx = e * Math.cos(G.QANG), Qy = e * Math.sin(G.QANG), i, k;
    function rc(a) { var p = ((a - G.PHI) % TP + TP) % TP; return G.ROUT - (G.ROUT - G.RIN) * p / TP; }
    var edge = [];                                                       // points on the cam's outline, cam frame
    for (i = 0; i < 720; i++) { var a = G.PHI + TP * i / 720, r = rc(a + 1e-9); edge.push([r * Math.cos(a), r * Math.sin(a)]); }
    for (i = 0; i <= 30; i++) { var rr = G.RIN + (G.ROUT - G.RIN) * i / 30; edge.push([rr * Math.cos(G.PHI), rr * Math.sin(G.PHI)]); }
    function hit(th, beta) {
      var ct = Math.cos(th), st = Math.sin(th), H = G.H, s, t, j;
      for (k = 0; k < 2; k++) {
        var b = beta + k * Math.PI, ux = Math.cos(b), uy = Math.sin(b), cx = Qx + G.R * ux, cy = Qy + G.R * uy;
        for (s = -H; s <= H + 1e-9; s += H / 4) for (t = -H; t <= H + 1e-9; t += H / 4) {
          var wx = cx + s * ux - t * uy, wy = cy + s * uy + t * ux, px = ct * wx - st * wy, py = st * wx + ct * wy;
          if (Math.sqrt(px * px + py * py) < rc(Math.atan2(py, px))) return true;
        }
        for (j = 0; j < edge.length; j++) {
          var p = edge[j], dx = ct * p[0] + st * p[1] - cx, dy = -st * p[0] + ct * p[1] - cy;
          if (Math.abs(dx * ux + dy * uy) < H && Math.abs(-dx * uy + dy * ux) < H) return true;
        }
      }
      return false;
    }
    var N = G.N, beta = Math.PI, T = new Float64Array(N + 1);
    for (var rev = 0; rev < 2; rev++) for (i = 0; i <= (rev ? N : N - 1); i++) {
      var th = TP * (rev + i / N);
      if (hit(th, beta)) {                                                // pushed: turn back in steps, then halve the last step
        var lo = beta, n = 0; while (hit(th, lo) && n++ < 2000) { beta = lo; lo -= 0.004; }
        for (n = 0; n < 8; n++) { var m = (lo + beta) / 2; if (hit(th, m)) beta = m; else lo = m; }
        beta = lo;
      }
      if (rev) T[i] = beta;
    }
    return { T: T, D: T[0] - T[N], Q: [Qx, Qy] };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene, TP = 2 * Math.PI, i;
    var o = this.o = { a: 0, mode: "off", tabs: { off: this.table(G.E), on: this.table(0) } };
    function ring(rIn, rOut, depth, m) {                                  // flat ring, axis Z, from z 0 to depth
      var s = new T.Shape(); s.absarc(0, 0, rOut, 0, TP, false);
      var h = new T.Path(); h.absarc(0, 0, rIn, 0, TP, true); s.holes.push(h);
      return P.mesh(new T.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 96 }), m);
    }
    // cam: snail-shell outline with the step, z 2..14 (2 clear of the disc face); hub z 14..18; shaft z -30..21
    o.cam = new T.Group(); scene.add(o.cam);
    var sh = new T.Shape();
    for (i = 0; i <= 360; i++) {
      var a = G.PHI + TP * i / 360, r = G.ROUT - (G.ROUT - G.RIN) * i / 360;
      if (i === 0) sh.moveTo(r * Math.cos(a), r * Math.sin(a)); else sh.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
    sh.lineTo(G.ROUT * Math.cos(G.PHI), G.ROUT * Math.sin(G.PHI));     // the step, straight out along a radius
    P.at(P.mesh(new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false }), c.mat("cam")), 0, 0, 2, o.cam);
    P.at(P.cylZ(14, 4, c.mat("cam", "light")), 0, 0, 16, o.cam);       // pale hub z 14..18, on the cam face
    P.at(P.cylZ(6, 51, c.mat("cam")), 0, 0, -4.5, o.cam);              // shaft z -30..21, from the plate face, through the boss
    P.at(P.cylZ(3, 1, c.mat("cam", "dark")), 8, 0, 21.5, o.cam);       // dark dot z 21..22 on the shaft end, shows it turning
    // disc: ring r 26..130, z -6..0, riding on the fixed boss; stops 12 x 12, z 0..16, on its face
    o.disc = new T.Group(); scene.add(o.disc);
    P.at(ring(26, 130, 6, c.mat("disc")), 0, 0, -6, o.disc);
    [0, Math.PI].forEach(function (b) {
      var s = P.at(P.box(2 * G.H, 2 * G.H, 16, c.mat("stops")), G.R * Math.cos(b), G.R * Math.sin(b), 8, o.disc);
      s.rotation.z = b;
    });
    // fixed parts: boss ring r 20..26 at the disc centre, z -30..0 (the cam shaft, at most 12 + 6 = 18 off it, passes
    // inside); plate x -150..160, y -170..150, z -40..-30; base x -170..180, y -182..-170, z -80..20
    o.boss = P.at(ring(20, 26, 30, c.fixed), 0, 0, -30, scene);
    P.at(P.box(310, 320, 10, c.fixed), 5, -10, -35, scene);
    P.at(P.box(350, 12, 100, c.fixed), 5, -176, -30, scene);
    // brake: pad 24 x 6 x 4 (z -5..-1) whose top touches the bottom of the disc rim; spring from the base top (y -170) to the pad
    o.pad = P.at(P.box(24, 6, 4, c.mat("brake")), 0, 0, -3, scene);
    o.spring = P.at(P.spring({ radius: 5, wire: 1.2, turns: 6, length: 28, material: c.mat("brake") }), 0, -170, -3, scene);
    o.spring.rotation.z = Math.PI / 2;                                   // its +X points up
  },

  step: function (c, dt, S) {
    var o = this.o, TP = 2 * Math.PI, mode = S.controls.centre === "on" ? "on" : "off", tb = o.tabs[mode], N = this.G.N;
    if (mode !== o.mode) { o.mode = mode; o.a = 0; }
    o.a += S.w * dt;
    var th = o.a, k = Math.floor(th / TP), f = (th / TP - k) * N, j = Math.min(N - 1, Math.floor(f)), u = f - j;
    var beta = tb.T[j] + (tb.T[j + 1] - tb.T[j]) * u - k * tb.D;
    o.cam.rotation.z = -th;                                              // clockwise, as Brown's arrow shows
    o.disc.position.set(tb.Q[0], tb.Q[1], 0); o.disc.rotation.z = beta;
    o.boss.position.set(tb.Q[0], tb.Q[1], -30);
    var yb = tb.Q[1] - 130;                                              // bottom of the disc rim
    o.pad.position.set(tb.Q[0], yb - 3, -3);                             // pad y yb-6..yb
    o.spring.position.x = tb.Q[0]; o.spring.setLength(yb - 6 + 170);     // base top to pad bottom
    S.set("cam", (th / TP).toFixed(1) + " turns");
    S.set("disc", ((tb.T[0] - beta) / TP).toFixed(2) + " turns");
  }
});
