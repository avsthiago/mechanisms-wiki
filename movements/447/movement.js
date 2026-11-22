(function () {
  // Plan view: x runs downstream, z across the river, y up. 10 model units stand for 1 m.
  var U = 15, L = 170, KN = .05, KT = .002, ZB = 45, AX = -200, DT = 1 / 200, D = Math.PI / 180;
  // One time step. The boat is tied at the bow, so it can only swing round the buoy (rope angle p, speed w).
  // The hull is held at angle a to the current; water pushes on its side (KN) and drags along it (KT).
  function sim(s, h) {
    var want = s.al * s.dir; s.a += Math.max(-.5 * h, Math.min(.5 * h, want - s.a));   // the boatman puts the rudder over, the hull swings round slowly
    var hx = -Math.cos(s.a), hz = Math.sin(s.a), nx = -hz, nz = hx;
    var vx = -L * Math.sin(s.p) * s.w, vz = L * Math.cos(s.p) * s.w, Wx = U - vx, Wz = -vz;   // water flowing past the boat
    var wn = Wx * nx + Wz * nz, wh = Wx * hx + Wz * hz;
    var Fx = KN * wn * Math.abs(wn) * nx + KT * wh * Math.abs(wh) * hx, Fz = KN * wn * Math.abs(wn) * nz + KT * wh * Math.abs(wh) * hz;
    s.w += (-Fx * Math.sin(s.p) + Fz * Math.cos(s.p)) / L * h; s.p += s.w * h; s.vz = vz;   // only the push across the rope moves the boat
    if (L * Math.sin(s.p) * s.dir >= ZB) { s.p = Math.asin(s.dir * ZB / L); s.w = 0; s.dir = -s.dir; s.n++; }   // landed: steer for the other bank
  }

  M507.define({
    number: 447,
    title: "Flying ferry",
    lede: "A boat is tied by a long rope to an anchor far upstream. With its rudder set at a slant, the river itself pushes it across, from one bank to the other. No oars and no sail are needed.",
    alt: "Seen from above: a river running left to right between two banks. On the left an anchor lies on the bottom, with a buoy above it. A long rope runs from the buoy to the front of a boat in the middle of the river. A rudder sticks out of the back of the boat at a slant.",
    parts: [
      { key: "anchor", color: "#5E7387", name: "Anchor and buoy", note: "The anchor holds fast on the river bottom. The buoy keeps the rope up out of the mud." },
      { key: "rope", color: "#D9B13B", name: "Rope", note: "Ties the front of the boat to the buoy. It stops the boat from floating away, so the boat can only swing round in a curve." },
      { key: "boat", color: "#C8873A", name: "Boat", note: "Its long side faces a little into the current. The water pushing on that side moves it across." },
      { key: "rudder", color: "#4FA58A", name: "Rudder", note: "Holds the boat at a slant to the current. At each bank it is put over the other way. Watch the red tip." }
    ],
    controls: [{ type: "range", id: "al", label: "Slant of the boat", min: 0, max: 30, step: 1, value: 20, unit: "°", presets: [[5, "Too little"], [20, "Usual"], [30, "Steep"]] }],
    speed: { min: 1, max: 8, value: 4, label: "Time speed", unit: "×" },
    readouts: [{ id: "ang", label: "Rope angle" }, { id: "vz", label: "Across" }, { id: "n", label: "Crossings" }],
    views: { "3d": [-65, 520, 110], top: [-65, 560, 1], side: [-65, 220, 430] },
    target: [-65, 0, 0],
    distance: [200, 1600],
    how: [
      "The river runs from left to right. The rope keeps the boat from drifting away, so it can only swing in a curve round the buoy. The front of the boat points upstream, turned a little toward the far bank.",
      "The current hits the slanted side of the boat. The water pushes it partly downstream and partly sideways. The rope takes the downstream part. The sideways part swings the boat across. At the bank, the rudder is put over the other way and the boat swings back.",
      "Try a small slant: the boat drifts part way and stops in the river. Then try 20 degrees and 30, and watch the boat cross faster."
    ],
    note: "This model is rebuilt from Brown's drawing and description. The river is drawn a little wider than Brown's so the slanted boat fits, and the river bed, the anchor's chain and the sizes are made up. The rudder is not worked out on its own: the boat is simply held at the chosen slant, and turns round slowly at each bank. The push of the water is worked out from the current and the boat's own speed.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, i;
      var o = this.o = { s: { p: 0, w: 0, a: -20 * D, al: 20 * D, dir: -1, n: 0, vz: 0 }, acc: 0, seg: [] };
      // river: bed y -28..-24, water y -24..0 between z -74.5 and 74.5; banks z ±75..±150 up to y 4
      P.at(P.box(560, 4, 150, c.fixed), -50, -26, 0, scene);
      P.at(P.box(560, 32, 75, c.fixed), -50, -12, 112.5, scene); P.at(P.box(560, 32, 75, c.fixed), -50, -12, -112.5, scene);
      P.at(P.box(560, 24, 149, new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .3, depthWrite: false })), -50, -12, 0, scene);
      // anchor lying on the bed (top y -24), chain up to the buoy, which floats at x -200
      var ma = c.mat("anchor"), sh = P.rod(2, ma); sh.span(-232, -22, 0, -262, -22, 0); scene.add(sh);
      var arm = P.arc(12, 2, Math.PI, ma); arm.rotation.x = Math.PI / 2; arm.rotation.z = Math.PI / 2; P.at(arm, -262, -22, 0, scene);
      var stock = P.rod(1.6, ma); stock.span(-236, -22, -11, -236, -22, 11); scene.add(stock);
      P.at(P.hoop(3, 1, ma), -229, -22, 0, scene).rotation.y = Math.PI / 2;
      var chain = P.rod(.8, ma); chain.span(-226, -22, 0, AX, -4, 0); scene.add(chain);
      P.at(P.cylY(7, 10, ma), AX, 1, 0, scene);                                    // buoy y -4..6
      for (i = 0; i < 6; i++) { o.seg.push(P.rod(1.3, c.mat("rope"))); scene.add(o.seg[i]); }
      // boat: bow at the local origin, stern along local +x; hull y -4..5, two hatches on top, rudder at the stern
      var b = o.boat = new T.Group(); scene.add(b);
      var hull = P.prism([[0, 0], [14, -12], [34, -16], [108, -16], [120, -13], [120, 13], [108, 16], [34, 16], [14, 12]], -5, 4, c.mat("boat"));
      hull.rotation.x = Math.PI / 2; b.add(hull);                                  // prism z -5..4 turns into y -4..5
      P.at(P.box(28, 5, 22, c.mat("boat", "light")), 50, 7.5, 0, b); P.at(P.box(28, 5, 22, c.mat("boat", "light")), 86, 7.5, 0, b);   // y 5..10
      P.at(P.hoop(2.5, .8, c.mat("rope")), 2, 6, 0, b).rotation.x = Math.PI / 2;
      var r = o.rudder = new T.Group(); r.position.set(122, 0, 0); b.add(r);
      var mr = c.mat("rudder");
      P.at(P.cylY(2.5, 18, mr), 0, 1, 0, r);                                       // stock y -8..10, just behind the stern (x 119.5..124.5 local)
      P.at(P.box(45, 10, 2, mr), 24.5, -3, 0, r);                                  // blade x 2..47, y -8..2
      P.at(P.box(4, 4, 3, c.mat("rudder", "mark")), 43, 1, 0, r);                  // red tip, 0.5 proud each side and on top
      o.drops = P.dropPool({ count: 70, radius: 1.6, color: c.spot, opacity: .8, parent: scene });
      for (i = 0; i < 40; i++) o.drops.emit(-320 + 540 * Math.random(), .6, (Math.random() - .5) * 140, U, 0, 0, 0);
    },

    step: function (c, dt, S) {
      var o = this.o, s = o.s, h = S.playing ? dt * S.rpm : 0, n = Math.round(h / DT), i;
      s.al = S.controls.al * D;
      for (i = 0; i < n; i++) sim(s, DT);
      var bx = AX + L * Math.cos(s.p), bz = L * Math.sin(s.p);
      o.boat.position.set(bx, 0, bz); o.boat.rotation.y = s.a; o.rudder.rotation.y = .4 * s.a;
      for (i = 0; i < 6; i++) {                                                    // rope from the buoy top (y 6) to the bow ring (y 6), sagging a little
        var u0 = i / 6, u1 = (i + 1) / 6;
        o.seg[i].span(AX + (bx + 2 * Math.cos(s.a) - AX) * u0, 6 - 3.5 * Math.sin(Math.PI * u0), (bz - 2 * Math.sin(s.a)) * u0,
          AX + (bx + 2 * Math.cos(s.a) - AX) * u1, 6 - 3.5 * Math.sin(Math.PI * u1), (bz - 2 * Math.sin(s.a)) * u1);
      }
      o.acc += h * 9; while (o.acc >= 1) { o.acc--; o.drops.emit(-320, .6, (Math.random() - .5) * 140, U, 0, 0, 0); }
      o.drops.step(h, 0, function (q) { return q.x > 220; });
      var deg = Math.round(-s.p / D);
      S.set("ang", (deg > 0 ? "+" : deg < 0 ? "−" : "") + Math.abs(deg) + "°");
      S.set("vz", (Math.abs(s.vz) / 10).toFixed(2) + " m/s");
      S.set("n", String(s.n));
    }
  });
})();
