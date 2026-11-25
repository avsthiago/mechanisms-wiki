M507.define({
  number: 241,
  title: "One-tooth wheel driving",
  lede: "A small gear with one tooth turns steadily. Once each turn, its tooth catches the big gear and moves it on by one tooth. A bent spring then holds the big gear still until the next push.",
  alt: "A big wheel with sloping saw teeth turns on a shaft in the middle. Below and to its left, a small round wheel with one thin red tooth turns beside it. Above, a curved spring arm rests its tip in a gap between two teeth of the big wheel.",
  parts: [
    { key: "drive", color: "#5E7387", name: "One-tooth gear", note: "A small round wheel with a single tooth, turned by the crank. Watch the red tooth go into a gap of the big gear once each turn." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "The big gear with sloping teeth. It moves one tooth for every turn of the small gear. The dark stripe shows how far it has turned." },
    { key: "spring", color: "#4FA58A", name: "Spring arm", note: "A bent strip of springy metal. Its tip rides up each sloping tooth and drops into the next gap. It stops the big gear from slipping back." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the small gear. In a real machine an engine would do this." }
  ],
  readouts: [{ id: "in", label: "Small gear" }, { id: "out", label: "Big gear" }],
  views: { "3d": [298, 190, 747], front: [-50, 0, 880], side: [800, 0, 0] },
  target: [-50, 0, 0],
  how: [
    "Turn the crank and the small gear goes round steadily. Once each turn, its one tooth swings into a gap between two teeth of the big gear. It pushes that wheel round by one tooth, then leaves the gap.",
    "For the rest of the turn the big gear has no push. The round edge of the small gear fits against the big gear and keeps it from turning. The spring arm helps. Its tip slides up a sloping tooth while the wheel moves, then drops into the next gap. A tooth then lies in front of the spring, so the wheel cannot go backwards.",
    "Watch the two readouts. The big gear gains one tooth for every turn of the small gear. Slow the speed right down to see the tooth go into the gap and the spring tip drop."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the plate and base, the shafts, the sizes and the number of teeth were made up. The drawing shows a curved tooth on the small gear. Here it is a straight, thin tooth, and the gaps of the big gear were cut to fit it. The motion of the big gear was worked out so the tooth moves it exactly one tooth and nothing passes through anything. The spring arm is drawn as a stiff curved arm that swings on its pin. A real one would bend.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, DEG = Math.PI / 180;
    var D = 244, RL = 72, CL = .6, RH = RL + CL, N = 16, ST = 2 * Math.PI / N, RT = 190, RV = 156;
    var HW = 6 * DEG, FF = 3.5 * DEG, VV = 3.5 * DEG, RR = 2 * DEG, ANG = 25.5 * DEG;
    function arc(phi) { return D * Math.cos(phi) - Math.sqrt(Math.max(0, RH * RH - D * D * Math.sin(phi) * Math.sin(phi))); }
    // one tooth period of the big wheel: a steep face down to a narrow notch (where the tooth goes in), then a slope that follows
    // the small wheel's round edge while it is locked, then a short climb to the tip
    function rim(g) {
      var q = ((g + FF + VV + HW) % ST + ST) % ST, ae;
      if (q < FF) return RT + (RV - RT) * q / FF;
      if (q < FF + VV) { ae = arc(-HW); return RV + (ae - RV) * (q - FF) / VV; }
      if (q > ST - RR) { ae = arc(ST - RR - FF - VV - HW); return ae + (RT - ae) * (q - (ST - RR)) / RR; }
      return arc(q - FF - VV - HW);
    }
    var dr = P.oneToothDrive({ dist: D, drivenR: rim, finger: { base: 40, tip: 69, half: 4 }, lockR: RL, clear: CL, dir: 1, pitch: ST });
    var o = this.o = { dr: dr, rim: rim, st: ST, b0: 340 * DEG, b: 340 * DEG, a: 0 };
    function plate(shape, mat) { var g = new T.ExtrudeGeometry(shape, { depth: 16, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, -8); return new T.Mesh(g, mat); }
    var cs = Math.cos(ANG), sn = Math.sin(ANG);   // big wheel at the origin, small wheel at the lower left
    var fr = new T.Group(); fr.position.set(-D * cs, -D * sn, 0); fr.rotation.z = ANG; scene.add(fr);
    // small wheel: disc z -8..8, shaft z -30..30 (from the plate face), hub z 8..12, crank arm z 30..36, handle z 36..60
    o.g1 = new T.Group(); fr.add(o.g1);
    o.g1.add(plate(dr.driverShape(), c.mat("drive")));
    P.at(P.cylZ(6, 60, c.mat("drive")), 0, 0, 0, o.g1);                   // shaft z -30..30
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 10, o.g1);                  // hub z 8..12, on the disc face
    P.at(P.box(24, 3, 1, c.mat("drive", "mark")), 57, 0, 9, o.g1);         // red stripe x 45..69 along the tooth, z 8.5..9.5, lifted off the face
    P.at(P.box(52, 12, 6, c.mat("crank")), -22, 0, 33, o.g1);             // arm x -48..4, z 30..36, on the shaft end
    P.at(P.cylZ(5, 24, c.mat("crank")), -44, 0, 48, o.g1);                // handle z 36..60, on the arm face
    // big wheel: disc z -8..8, shaft z -30..8, hub z 8..12
    o.g2 = new T.Group(); o.g2.position.set(D, 0, 0); fr.add(o.g2);
    o.g2.add(plate(dr.drivenShape(), c.mat("driven")));
    P.at(P.cylZ(7, 38, c.mat("driven")), 0, 0, -11, o.g2);                // shaft z -30..8
    P.at(P.cylZ(22, 4, c.mat("driven")), 0, 0, 10, o.g2);                 // hub z 8..12
    P.at(P.box(70, 5, 1, c.mat("driven", "dark")), 100, 0, 9, o.g2);       // dark stripe x 65..135, z 8.5..9.5, lifted off the face
    // spring arm: pivot fixed on the plate, curved strip whose tip rides on the rim of the big wheel
    var PX = -230, PY = 105, PL = 163, B0 = Math.atan2(49, 156);
    o.sp = { x: PX, y: PY, L: PL, b0: B0, al: 0 };
    var sh = new T.Shape(), i, s, w, pts = [], bu = 20;
    for (i = 0; i <= 24; i++) { s = i / 24; w = 8 - 5 * s; pts.push([s * PL, bu * Math.sin(Math.PI * s) + w]); }
    for (i = 24; i >= 0; i--) { s = i / 24; w = 8 - 5 * s; pts.push([s * PL, bu * Math.sin(Math.PI * s) - w]); }
    pts.forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
    var ag = new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false, curveSegments: 1 }); ag.translate(0, 0, -4);
    o.arm = new T.Group(); o.arm.position.set(PX, PY, 0); scene.add(o.arm);
    o.arm.add(new T.Mesh(ag, c.mat("spring")));                            // strip z -4..4
    P.at(P.cylZ(20, 16, c.mat("spring")), 0, 0, 0, o.arm);                 // boss z -8..8
    P.at(P.cylZ(6, 42, c.mat("spring", "dark")), PX, PY, -9, scene);       // pin z -30..12
    // supports
    P.at(P.box(540, 420, 10, c.fixed), -50, 5, -35, scene);               // plate x -320..220, y -205..215, z -40..-30; shafts end at z -30
    P.at(P.box(580, 12, 100, c.fixed), -50, -211, -30, scene);            // base x -340..240, y -217..-205, z -80..20; plate stands on y -205
  },

  step: function (c, dt, S) {
    var o = this.o, i, TAU = 2 * Math.PI, ANG = 25.5 * Math.PI / 180, sp = o.sp;
    o.b += S.w * dt;                                       // the small wheel turns anticlockwise, as Brown's arrow shows
    var t = o.dr.theta(o.b);
    o.g1.rotation.z = o.b;
    o.g2.rotation.z = t;
    // spring tip: find the arm angle at which its tip just touches the rim of the big wheel
    function gap(al) {
      var a = sp.b0 + al, x = sp.x + sp.L * Math.cos(a), y = sp.y + sp.L * Math.sin(a), g = Math.atan2(y, x) - ANG - t;
      return Math.hypot(x, y) - o.rim(g);
    }
    var lo = -.6, hi = .6, m, al = hi;
    for (m = hi; m >= lo; m -= .01) { if (gap(m) <= 0) { al = m; break; } }
    var a1 = Math.min(hi, al + .01), a0 = al;
    for (i = 0; i < 30; i++) { m = (a0 + a1) / 2; if (gap(m) <= 0) a0 = m; else a1 = m; }
    sp.al = a0; o.arm.rotation.z = sp.b0 + a0;
    var turns = (o.b - o.b0) / TAU;
    S.set("in", Math.max(0, turns).toFixed(1) + " turns");
    var nt = Math.floor(-t / o.st + 1e-6); S.set("out", nt + (nt === 1 ? " tooth" : " teeth"));
  }
});
