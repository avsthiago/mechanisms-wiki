M507.define({
  number: 232,
  title: "Lifted pawl and toothed wheel",
  lede: "A long handle rocks up and down. Lifting it first raises a small hook, called a pawl, out of the teeth. Lowering it drops the hook into a gap and pulls the wheel round. So rocking the handle turns the wheel in steps.",
  alt: "A large toothed wheel with square teeth. A tall flat plate stands upright above the wheel's middle. A long level handle reaches out to the right from the plate. A thin rod rises from the handle to a curved hook at the top right of the wheel. The point of the hook sits between two teeth.",
  parts: [
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with square teeth, called a ratchet wheel. It only moves when the hook pushes a tooth. The dark stripe shows how far it has turned." },
    { key: "arm", color: "#5E7387", name: "Handle", note: "The long handle that you rock. It is joined to the plate by a pin and can tilt a little before it moves the plate." },
    { key: "plate", color: "#D9B13B", name: "Plate and rod", note: "The tall plate turns on the wheel's own shaft. The rod joins the handle to the hook, so tilting the handle lifts or drops the hook." },
    { key: "pawl", color: "#C2503F", name: "Pawl", note: "The curved hook, hinged at the top of the plate. Watch its point: it lifts out of a gap, rides over the teeth, drops into a gap and pulls." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing of the handle", min: 8, max: 30, step: 1, value: 15, unit: "°",
    presets: [[10, "Too short"], [15, "Just right"], [25, "Wide"]] }],
  speed: { min: 2, max: 30, value: 10, label: "Swings", unit: " a min" },
  readouts: [{ id: "arm", label: "Handle" }, { id: "wheel", label: "Wheel" }],
  views: { "3d": [368, 208, 935], front: [70, 25, 1150], side: [1100, 40, 0] },
  target: [70, 25, 0],
  how: [
    "Rock the handle up and down. It is pinned to a tall plate that turns on the same shaft as the wheel. At the top of the plate a curved hook, the pawl, rests with its point between two teeth.",
    "When you lift the handle, it first tilts a little on its pin. The rod then raises the point out of the gap. Lifting further swings the whole plate back, and the hook rides over the teeth. When you lower the handle, it first tilts back and the point drops into a gap. Lowering further drags the plate and the wheel forward.",
    "Try a short swing. The handle tilts and the hook lifts, but the plate never swings far enough to reach the next gap, so the wheel does not move. Try the middle swing, then a wide one, and watch the wheel gain more teeth on each swing."
  ],
  note: "This model is rebuilt from Brown's drawing. The pins, the stops that limit how far the handle tilts, the board, the base, the sizes and the number of teeth were made up. They were chosen so the point really lifts clear of the teeth, travels back and drops into a gap. The drawing shows two rods. Here there is one. The wheel is held still between pushes, as a little rubbing would do in a real machine.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, TAU = 2 * Math.PI, DEG = Math.PI / 180, i, j;
    var N = 20, PIT = TAU / N, RT = 215, RR = 185;
    var K = { Hx: 3, Hy: 240, Qx: 73, LBx: 130, TL: 170, c0: -39 * DEG, Ux: 30, Uy: 25, dm: .14 };
    function rim(a) {                                           // wheel radius at a local angle: square-ish teeth
      var q = ((a / PIT) % 1 + 1) % 1, fl = .12, ft = .36;
      if (q < fl) return RR + (RT - RR) * q / fl;
      if (q < fl + ft) return RT;
      if (q < 2 * fl + ft) return RT - (RT - RR) * (q - fl - ft) / fl;
      return RR;
    }
    function rot(x, y, a) { return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; }
    var u0 = rot(K.Ux, K.Uy, K.c0), LL = Math.hypot(K.Hx + u0[0] - K.LBx, K.Hy + u0[1]);      // rod length, from the closed position
    var o = this.o = { rim: rim, pit: PIT, K: K, LL: LL, psi: 0, al: 0, th: 30.2 * DEG, N: N };
    o.lb = function (d) { var r = rot(K.LBx - K.Qx, 0, d); return [K.Qx + r[0], r[1]]; };       // lower end of the rod, plate frame
    o.gam = function (d) {                                      // angle of the hook for a tilt d of the handle (rod length fixed)
      var lb = o.lb(d), a = -.05, b = .6, m, fa, f = function (g) { var u = rot(K.Ux, K.Uy, K.c0 + g); return Math.hypot(K.Hx + u[0] - lb[0], K.Hy + u[1] - lb[1]) - LL; };
      fa = f(a); for (i = 0; i < 50; i++) { m = (a + b) / 2; if ((f(m) > 0) === (fa > 0)) { a = m; fa = f(a); } else b = m; }
      return (a + b) / 2;
    };
    o.upper = function (d) { var u = rot(K.Ux, K.Uy, K.c0 + o.gam(d)); return [K.Hx + u[0], K.Hy + u[1]]; };
    o.tip = function (al, d) { var r = rot(K.TL, 0, K.c0 + o.gam(d)); return rot(K.Hx + r[0], K.Hy + r[1], al); };
    function inside(t, th) { var r = Math.hypot(t[0], t[1]); return r <= RT && r < rim(Math.atan2(t[1], t[0]) - th) - .01; }
    // One small step. The handle angle phi is set by the hand. The plate may sit anywhere from phi - dm to phi (stops on the handle's tilt).
    // It stays where it is until a stop drags it. If the point of the hook is in a tooth, the plate moves a hair (tilting the handle further
    // to lift the hook); if that is not enough, the hook pushes the wheel.
    o.move = function (phi) {
      var lo = phi - K.dm, hi = phi, al = Math.min(Math.max(o.al, lo), hi), t = o.tip(al, phi - al), i, sg, a2, t2, found = false;
      o.pushing = false;
      if (inside(t, o.th)) {
        for (i = 1; i <= 8 && !found; i++) for (sg = -1; sg <= 1; sg += 2) { a2 = al + sg * i * .0005; if (a2 < lo || a2 > hi) continue; if (!inside(o.tip(a2, phi - a2), o.th)) { al = a2; found = true; break; } }
        if (!found) {
          t = o.tip(al, phi - al);
          for (i = 1; i <= 800 && !o.pushing; i++) for (sg = -1; sg <= 1; sg += 2) { t2 = o.th + sg * i * .0005; if (!inside(t, t2)) { o.th = t2; o.pushing = true; break; } }
        }
      }
      o.al = al; o.phi = phi;
    };

    // ---- wheel: disc z -8..8, collar behind z -26..-8 (on the board), collar in front z 8..12
    var sh = new T.Shape(), pts = [];
    function pt(r, a) { pts.push([r * Math.cos(a), r * Math.sin(a)]); }
    for (i = 0; i < N; i++) {
      var a0 = i * PIT, fl = .12, ft = .36;
      pt(RR, a0); pt(RT, a0 + fl * PIT);
      for (j = 1; j <= 3; j++) pt(RT, a0 + (fl + ft * j / 3) * PIT);
      pt(RR, a0 + (2 * fl + ft) * PIT);
      for (j = 1; j <= 3; j++) pt(RR, a0 + (2 * fl + ft + (1 - 2 * fl - ft) * j / 4) * PIT);
    }
    pts.forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
    var wg = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false, curveSegments: 1 }); wg.translate(0, 0, -8);
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(new T.Mesh(wg, c.mat("wheel")));
    P.at(P.cylZ(14, 18, c.mat("wheel")), 0, 0, -17, o.wheel);                // collar z -26..-8, on the board face at z -26
    P.at(P.cylZ(14, 4, c.mat("wheel")), 0, 0, 10, o.wheel);                  // collar z 8..12, under the plate
    P.at(P.box(130, 8, 1, c.mat("wheel", "dark")), 105, 0, 9, o.wheel);       // dark stripe x 40..170, z 8.5..9.5, lifted off the face
    P.at(P.cylZ(7, 47.5, c.mat("plate", "dark")), 0, 0, -1.75, scene);         // axle z -25.5..22, starts inside the hub (hub back face z -26)
    // ---- plate: z 12..20, long upright piece from the axle to the hinge of the hook
    o.plate = new T.Group(); scene.add(o.plate);
    var L = Math.hypot(K.Hx, K.Hy), td = Math.atan2(K.Hy, K.Hx), ph = Math.acos((44 - 22) / L), hs = new T.Shape();
    hs.moveTo(44 * Math.cos(td + ph), 44 * Math.sin(td + ph));
    hs.absarc(0, 0, 44, td + ph, td + TAU - ph, false);
    hs.lineTo(K.Hx + 22 * Math.cos(td - ph), K.Hy + 22 * Math.sin(td - ph));
    hs.absarc(K.Hx, K.Hy, 22, td - ph, td + ph, false);
    hs.closePath();
    var hg = new T.ExtrudeGeometry(hs, { depth: 8, bevelEnabled: false, curveSegments: 24 }); hg.translate(0, 0, 12);
    o.plate.add(new T.Mesh(hg, c.mat("plate")));                              // z 12..20, on the wheel's front collar
    P.at(P.cylZ(5, 16.5, c.mat("arm", "dark")), K.Qx, 0, 20.75, o.plate);     // handle pin z 12.5..29, starts inside the plate (back face z 12)
    P.at(P.cylZ(5, 16.5, c.mat("arm", "dark")), K.Hx, K.Hy, 20.75, o.plate);  // hook hinge z 12.5..29
    // ---- handle: z 20..28, hinged on the plate at the pin; local origin at the pin, x along the handle
    o.arm = new T.Group(); scene.add(o.arm);
    P.at(P.box(350, 18, 8, c.mat("arm")), 102, 0, 24, o.arm);                 // x -73..277 (0..350 from the axle), y -9..9, z 20..28
    P.at(P.cylZ(20, 8, c.mat("arm")), -73, 0, 24, o.arm);                     // round end over the axle z 20..28
    P.at(P.cylZ(5, 16, c.mat("arm", "dark")), K.LBx - K.Qx, 0, 29, o.arm);    // rod pin z 21..37
    // ---- rod z 28..36 (strip z 28.5..35.5, round ends z 28..36), from the handle up to the hook
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.box(LL, 14, 7, c.mat("plate")), LL / 2, 0, 32, o.rod);
    P.at(P.cylZ(9, 8, c.mat("plate")), 0, 0, 32, o.rod);
    P.at(P.cylZ(9, 8, c.mat("plate")), LL, 0, 32, o.rod);
    // ---- hook: z 20..28, hinged at the top of the plate, band curved along the rim, point reaches back into the wheel's layer
    o.pawl = new T.Group(); scene.add(o.pawl);
    var ps = [], bu = 18, s, w, ps2 = new T.Shape();
    for (i = 0; i <= 24; i++) { s = i / 24; w = 8 - 3 * s; ps.push([s * K.TL, bu * Math.sin(Math.PI * s) + w]); }
    for (i = 24; i >= 0; i--) { s = i / 24; w = 8 - 3 * s; ps.push([s * K.TL, bu * Math.sin(Math.PI * s) - w]); }
    ps.forEach(function (p, k) { if (k) ps2.lineTo(p[0], p[1]); else ps2.moveTo(p[0], p[1]); });
    var pg = new T.ExtrudeGeometry(ps2, { depth: 7, bevelEnabled: false, curveSegments: 1 }); pg.translate(0, 0, 20.5);
    o.pawl.add(new T.Mesh(pg, c.mat("pawl")));                                // z 20.5..27.5
    P.at(P.cylZ(11, 8, c.mat("pawl")), 0, 0, 24, o.pawl);                     // boss z 20..28
    P.at(P.box(K.Ux, 12, 7, c.mat("pawl")), K.Ux / 2, K.Uy / 2, 24, o.pawl).rotation.z = Math.atan2(K.Uy, K.Ux);   // short arm to the rod pin
    P.at(P.cylZ(9, 8, c.mat("pawl")), K.Ux, K.Uy, 24, o.pawl);                // rod pin boss z 20..28
    P.at(P.box(25, 6, 33.5, c.mat("pawl", "mark")), K.TL - 13.5, 0, 11.25, o.pawl);  // point x TL-26..TL, z -6..28, in the gap and up to the band
    P.at(P.cylZ(4, 9, c.mat("arm", "dark")), K.Ux, K.Uy, 33.5, o.pawl);       // rod pin z 29..38 ... at the rod's top end
    // ---- supports: board and base
    P.at(P.box(690, 495, 8, c.fixed), 95, 22.5, -30, scene);                 // board x -250..440, y -225..270, z -34..-26
    P.at(P.box(730, 12, 100, c.fixed), 95, -231, -40, scene);                // base x -270..460, y -237..-225, z -90..10; board stands on y -225
    for (i = 0; i < 5; i++) o.move(0);
    o.th0 = o.th;
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, A = S.controls.swing * Math.PI / 180, d = S.w * dt, n = Math.max(1, Math.ceil(Math.abs(d) / .002)), i, phi = o.phi || 0, al, del;
    for (i = 0; i < n; i++) { o.psi += d / n; phi = A * Math.sin(o.psi); o.move(phi); }
    al = o.al; del = phi - al;
    var q = rotP(K.Qx, 0, al), lb = rotP(o.lb(del)[0], o.lb(del)[1], al), up = o.upper(del), uw = rotP(up[0], up[1], al), hw = rotP(K.Hx, K.Hy, al);
    function rotP(x, y, a) { return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; }
    o.wheel.rotation.z = o.th;
    o.plate.rotation.z = al;
    o.arm.position.set(q[0], q[1], 0); o.arm.rotation.z = phi;
    o.rod.position.set(lb[0], lb[1], 0); o.rod.rotation.z = Math.atan2(uw[1] - lb[1], uw[0] - lb[0]);
    o.pawl.position.set(hw[0], hw[1], 0); o.pawl.rotation.z = al + K.c0 + o.gam(del);
    var deg = Math.round(phi * 180 / Math.PI);
    S.set("arm", (deg > 0 ? "+" : deg < 0 ? "−" : "") + Math.abs(deg) + "°");
    S.set("wheel", Math.max(0, Math.floor((o.th0 - o.th) / o.pit + 1e-6)) + " teeth");
  }
});
