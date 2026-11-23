M507.define({
  number: 461,
  title: "Swinging gutters",
  lede: "A frame of pipes hangs like a pendulum with its foot in the water. Each swing makes the water inside run one step higher. After a few swings it pours out at the top, with no pump and no wheel.",
  alt: "Six level pipes stacked one above another, each with a box on its right end. Long sloping pipes cross behind them and join the boxes into two zigzag paths. The lowest ends dip into a pool and water pours from a spout at the top left.",
  parts: [
    { key: "pipe", color: "#5E7387", name: "Pipes", note: "Six level pipes and six sloping ones, joined into two zigzag paths. They are drawn cut open so you can see the water inside." },
    { key: "box", color: "#C8873A", name: "Boxes", note: "A box sits at every corner of the zigzag. Water waits here until the next pipe tips downhill." },
    { key: "flap", color: "#C2503F", name: "Flap valves", note: "A little door at the way in to each box. Water pushes it open to get in. Then it drops shut, so the water cannot run back. Watch them open." },
    { key: "scoop", color: "#4FA58A", name: "Scoops", note: "Open cups at the two bottom ends. Each one dips into the pool, fills, and lifts out on the swing." },
    { key: "bar", color: "#D9B13B", name: "Pendulum bar", note: "The bar that carries all the pipes. It hangs from a pin and swings from side to side." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing size", min: 10, max: 32, step: 1, value: 26, unit: "°", presets: [[14, "Too small"], [26, "Enough"], [32, "Big"]] }],
  speed: { min: 4, max: 12, value: 8, label: "Swings", unit: " a min" },
  readouts: [{ id: "tilt", label: "Tilt" }, { id: "out", label: "Water lifted" }],
  views: { "3d": [70, 60, 1080], front: [-25, 10, 1090], side: [1050, 40, 260] },
  target: [-25, 10, 0],
  how: [
    "The pipes make two zigzag paths that climb from the pool to the top. When the frame hangs still, every pipe slopes uphill, so the water inside stays where it is.",
    "When the frame swings one way, the level pipes tip down to the left. Water runs along them into the left boxes. When it swings back, the sloping pipes tip downhill instead, and the water runs on into the right boxes. A flap in each box stops it running back. So each full swing lifts the water two pipes higher.",
    "Try Too small. The pipes never tip past level, so no water climbs. Then try Big and watch the flaps open."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the frame at one end of its swing, and the model starts the same way. The pin it hangs from, the stand, the two catch trays, the pool and the size of the swing are made up. A hand would have to push the frame to keep it swinging, and that is not shown. The pipes and boxes are cut open at the front, and the water is drawn as dots.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, k, i;
    var PX = -27, PY = 96, DA = 35.4 * Math.PI / 180, ux = Math.cos(DA), uy = Math.sin(DA);
    var o = this.o = { phi: -.72, PX: PX, PY: PY, th0: -DA / 2, segs: [], flaps: [], out: 0, tray: [0, 0], WY: -164 };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .4, depthWrite: false });

    // ground, pool, stand and catch trays (none of them move)
    P.at(P.box(560, 8, 110, c.fixed), -30, -249, 0, scene);                             // floor x -310..250, y -253..-245, z -55..55
    P.at(P.box(540, 80.5, 90, wat), -30, -204.25, 0, scene);                            // pool x -300..240, y -244.5..-164
    P.at(P.box(16, 355, 12, c.fixed), PX, -67.5, -32, scene);                           // post y -245..110, z -38..-26
    P.at(P.cylZ(4, 38, c.mat("bar", "dark")), PX, PY, -7, scene);                       // pin z -26 (post face) .. 12
    [[-230, 96, -74.5, 341], [187, 44, -100.5, 289]].forEach(function (q, n) {          // [centre x, tray bottom y, post centre y, post height]
      var x = q[0], y = q[1];
      P.at(P.box(12, q[3], 12, c.fixed), x, q[2], -32, scene);                          // post y -245..tray bottom, z -38..-26
      P.at(P.box(70, 4, 60, c.fixed), x, y + 2, -8, scene);                             // tray bottom y..y+4, x ±35, z -38..22
      P.at(P.box(4, 20, 60, c.fixed), x - 33, y + 14, -8, scene);                       // end walls y+4..y+24
      P.at(P.box(4, 20, 60, c.fixed), x + 33, y + 14, -8, scene);
      P.at(P.box(62, 20, 4, c.fixed), x, y + 14, -36, scene);                           // long walls x ±31, z -38..-34 and 18..22
      P.at(P.box(62, 20, 4, c.fixed), x, y + 14, 20, scene);
      var w = P.at(P.box(61, 1, 51, wat), x, y + 4.3, -8, scene); w.userData.live = true; w.visible = false;
      o["tw" + n] = w; o["ty" + n] = y;
    });

    // the swinging frame: everything below is placed in the drawing's own position and turns about the pin
    var f = o.f = P.at(new T.Group(), PX, PY, 0, scene);
    function put(m, x, y, z) { return P.at(m, x - PX, y - PY, z, f); }
    function Y(k) { return 195 - 66 * k; }
    function R(k) { return [k === 5 ? 190 : 83 + 20 * k, Y(k)]; }                       // right boxes (the lowest is a scoop)
    function L(k) { return [-150 + 22 * (k - 1), Y(k) - 12]; }                          // left boxes, rows 1 to 5
    function Tn(k) { var r = R(k); return [r[0] - 5, r[1] - 7]; }                       // where a sloping pipe aims inside a right box
    var S = [Tn(4)[0] - 245 * ux, Tn(4)[1] - 245 * uy], E = [L(1)[0] + 240 * ux, L(1)[1] + 240 * uy];
    var pm = c.mat("pipe");
    function pipe(a, b, z, ends) { put(P.pipeSection({ pts: [a, b], rIn: 6.2, rOut: 8, material: pm, ends: ends }), 0, 0, z); }
    function slope(a, b, cutA, cutB) {                                                  // sloping pipes sit behind: z -17..-9
      var l = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / l, dy = (b[1] - a[1]) / l;
      pipe([a[0] + dx * cutA, a[1] + dy * cutA], [b[0] - dx * cutB, b[1] - dy * cutB], -9);
    }
    for (k = 0; k < 6; k++) pipe([k ? L(k)[0] + 10 : -170, Y(k)], [R(k)[0] - 12, Y(k)], 9);   // level pipes in front: z 1..9
    for (k = 2; k < 6; k++) slope(L(k), Tn(k - 2), 13, 11);
    slope(S, Tn(4), 13, 11); slope(L(1), E, 13, 0);

    // boxes and scoops: a back plate and side walls, open at the front. Walls are left out where a pipe comes in.
    function tray(x, y, rot, m, walls) {
      var g = put(new T.Group(), x, y, 0); g.rotation.z = rot;
      P.at(P.box(30, 30, 2, m), 0, 0, -18, g);                                          // back plate z -19..-17
      walls.forEach(function (w) { P.at(P.box(w[2], w[3], 27, m), w[0], w[1], -3.5, g); });   // walls z -17..10
      return g;
    }
    function flap(g, x, y, z, sign) {                                                   // hinge at the top, plate hangs 14 down
      var h = P.at(new T.Group(), x, y, z, g); P.at(P.box(2, 14, 6.4, c.mat("flap")), 0, -7, 0, h); h.userData.sign = sign; return h;
    }
    var bm = c.mat("box"), sm = c.mat("scoop"), rb = [], lb = [];
    for (k = 0; k < 5; k++) {
      rb[k] = tray(R(k)[0], R(k)[1], 0, bm, [[13.5, 0, 3, 24], [0, 13.5, 30, 3], [3, -13.5, 24, 3], [-13.5, 10.25, 3, 3.5]]);
      rb[k].fl = flap(rb[k], -10.5, 1, -12.6, 1);                                        // across the sloping pipe's mouth, z -15.8..-9.4
    }
    for (k = 1; k < 6; k++) {
      lb[k] = tray(L(k)[0], L(k)[1], DA, bm, [[-13.5, 0, 3, 24], [0, -13.5, 30, 3], [-6, 13.5, 18, 3], [13.5, -10.25, 3, 3.5]]);
      lb[k].fl = flap(lb[k], 12.5, 11.5, 5, -1);                                         // across the level pipe's mouth, z 1.8..8.2
    }
    tray(S[0], S[1], DA, sm, [[-13.5, 0, 3, 24], [0, -13.5, 30, 3], [13.5, -11.75, 3, 6.5]]);
    tray(R(5)[0], R(5)[1], 0, sm, [[13.5, 0, 3, 24], [0, -13.5, 30, 3], [-13.5, -11.75, 3, 6.5]]);

    // pendulum bar behind the pipes (z -25..-17): upright when the frame hangs still
    var b0 = o.th0, bar = P.box(14, 270, 8, c.mat("bar")); bar.rotation.z = -b0;
    put(bar, PX + 110 * Math.sin(-b0), PY - 110 * Math.cos(-b0), -21);                   // from 25 above the pin to 245 below it
    put(P.cylZ(8, 3, c.mat("bar", "dark")), PX, PY, -15.5);                             // collar z -17..-14 on the bar's front face

    // the water's two paths, as stretches of pipe. Water only moves forward along a stretch; at its end it drops into a box.
    function seg(a, b, z, flapGroup) {
      var s = { a: a, b: b, z: z, L: Math.hypot(b[0] - a[0], b[1] - a[1]), ang: Math.atan2(b[1] - a[1], b[0] - a[0]), list: [], next: null, fl: flapGroup, open: 0, hit: 0 };
      o.segs.push(s); return s;
    }
    function A(k) { return [L(k)[0] + 9, Y(k)]; }
    function chain(list) { for (var j = 0; j < list.length - 1; j++) list[j].next = list[j + 1]; }
    var odd = [seg(S, Tn(4), -12.5, rb[4].fl), seg(R(4), A(4), 5.5, lb[4].fl), seg(L(4), Tn(2), -12.5, rb[2].fl), seg(R(2), A(2), 5.5, lb[2].fl),
      seg(L(2), Tn(0), -12.5, rb[0].fl), seg(R(0), [-170, Y(0)], 5.5, null)];
    var even = [seg(R(5), A(5), 5.5, lb[5].fl), seg(L(5), Tn(3), -12.5, rb[3].fl), seg(R(3), A(3), 5.5, lb[3].fl), seg(L(3), Tn(1), -12.5, rb[1].fl),
      seg(R(1), A(1), 5.5, lb[1].fl), seg(L(1), E, -12.5, null)];
    chain(odd); chain(even); odd[0].src = true; even[0].src = true; odd[5].exit = 0; even[5].exit = 1;
    // start as Brown drew it: water part of the way along every level pipe
    o.segs.forEach(function (s) { if (s.z > 0) for (i = 0; i < 5; i++) s.list.push({ s: s.L * (.3 + .09 * i), v: 60, f: 1 - .07 * i }); });
    o.dots = P.waterDots(110, { radius: 3.9, color: c.spot, opacity: 1 }); f.add(o.dots);
    o.pool = P.dropPool({ count: 40, radius: 3, color: c.spot, opacity: .85, parent: scene });
    o.off = [[0, -6], [7, -6], [-7, -6], [3.5, 0], [-3.5, 0], [0, 6], [7, 6], [-7, 6]];
  },

  step: function (c, dt, S) {
    var o = this.o, d2r = Math.PI / 180, sim = S.playing ? Math.min(dt, .1) : 0, G = 5000, DRAG = 1.5, CAP = 5, i, j, n;
    o.phi += S.w * dt;
    var th = o.th0 + S.controls.swing * d2r * Math.cos(o.phi), ct = Math.cos(th), st = Math.sin(th);
    o.f.rotation.z = th;
    function world(p) { var x = p[0] - o.PX, y = p[1] - o.PY; return [o.PX + x * ct - y * st, o.PY + x * st + y * ct]; }
    function waiting(s) { var q = 0; s.list.forEach(function (p) { if (p.s < 1) q++; }); return q; }

    var steps = Math.max(1, Math.ceil(sim / .008)), h = sim / steps;
    for (n = 0; n < steps && sim > 0; n++) o.segs.forEach(function (s) {
      var acc = -G * Math.sin(s.ang + th);
      if (s.src && world(s.a)[1] < o.WY - 6) while (s.list.length < CAP) s.list.push({ s: 0, v: 0, f: 1 - .07 * s.list.length });   // a scoop under water fills
      for (j = s.list.length - 1; j >= 0; j--) {
        var p = s.list[j];
        p.v += (acc * p.f - DRAG * p.v) * h; p.s += p.v * h;
        if (p.s <= 0) { p.s = 0; p.v = 0; }                                             // the flap behind it is shut
        else if (p.s >= s.L) {
          if (s.next) {
            if (waiting(s.next) >= 8) { p.s = s.L; p.v = 0; continue; }                 // the box ahead is full
            s.list.splice(j, 1); s.hit = .35; s.next.list.push({ s: 0, v: 0, f: 1 - .07 * (waiting(s.next) % 5) });
          } else {
            s.list.splice(j, 1);
            var e = world(s.b), a = s.ang + th, v = Math.max(50, Math.min(110, p.v));
            o.pool.emit(e[0], e[1], s.z, v * Math.cos(a), v * Math.sin(a), 0);
          }
        }
      }
    });

    // draw the water: dots along the pipes, gathered in a little heap while they wait in a box
    var di = 0;
    o.segs.forEach(function (s) {
      var q = 0, dx = Math.cos(s.ang), dy = Math.sin(s.ang);
      s.list.forEach(function (p) {
        if (di >= 110) return;
        var b = Math.max(0, 1 - p.s / 18), of = o.off[q % 8]; if (p.s < 1) q++;
        o.dots.put(di++, s.a[0] + dx * p.s + of[0] * b - o.PX, s.a[1] + dy * p.s + of[1] * b - o.PY, s.z + (-4 - s.z) * b, 1);
      });
      if (s.fl) {
        s.hit = Math.max(0, s.hit - sim);
        var near = s.hit > 0; s.list.forEach(function (p) { if (p.v > 5 && p.s > s.L - 30) near = true; });
        s.open += ((near ? 1 : 0) - s.open) * Math.min(1, dt * 10);
        s.fl.rotation.z = s.fl.userData.sign * s.open * .95;
      }
    });
    for (; di < 110; di++) o.dots.put(di, 0, 0, 0, 0);
    o.dots.flush();

    o.pool.step(sim, 600, function (p) {
      var t = p.x < 0 ? 0 : 1;
      if (Math.abs(p.x - (t ? 187 : -230)) < 31 && p.y < o["ty" + t] + 7) { o.out++; o.tray[t]++; return true; }
      return p.y < o.WY;
    });
    for (n = 0; n < 2; n++) {
      var w = o["tw" + n], lev = Math.min(15, o.tray[n] * .3);
      w.visible = lev > .2; w.scale.y = Math.max(.2, lev); w.position.y = o["ty" + n] + 4.3 + lev / 2;
    }
    S.set("tilt", (th < 0 ? "−" : "") + Math.abs(Math.round(th / d2r)) + "°");
    S.set("out", o.out + " L");
  }
});
