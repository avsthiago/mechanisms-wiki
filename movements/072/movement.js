M507.define({
  number: 72,
  title: "Tilt hammer",
  lede: "A turning wheel with cams lifts a heavy hammer and lets it drop, again and again. Each cam gives one blow. Old forges used this, with a water wheel doing the work, to beat hot iron into shape.",
  alt: "A long hammer arm rocks on a pin at its right end. Its heavy head rests on an iron bar on a tall anvil block at the left. Under the middle of the arm a wheel with four curved cams turns and lifts the arm by a short lug, then lets it fall.",
  parts: [
    { key: "wiper", color: "#5E7387", name: "Wiper wheel", note: "A wheel with four curved cams, called wipers. Each one lifts the hammer once per turn. Watch the red cam to count the turns." },
    { key: "hammer", color: "#C8873A", name: "Hammer", note: "A heavy head on a long arm, called a helve. The arm rocks on a pin at its right end." },
    { key: "lug", color: "#D9B13B", name: "Lug", note: "A short knob under the arm. The cams push on it to lift the hammer." },
    { key: "work", color: "#4FA58A", name: "Iron bar", note: "The hot iron being shaped. It lies on the anvil, a heavy block that takes each blow." }
  ],
  controls: [{ id: "cams", label: "Cams on the wheel", value: "4", options: [["2", "Two"], ["4", "Four"], ["6", "Six"]] }],
  readouts: [{ id: "turns", label: "Wheel" }, { id: "blows", label: "Blows" }],
  views: { "3d": [260, 190, 560], front: [0, 30, 640], side: [640, 40, 0] },
  target: [0, 30, 0],
  how: [
    "The wheel turns clockwise. A cam slides under the lug and pushes it up. The arm rocks on its pin, so the head at the far end rises even higher than the lug.",
    "When the tip of the cam slips past the lug, nothing holds the hammer up any more. It falls under its own weight and strikes the iron. With four cams, the wheel gives four blows in every turn.",
    "Try two, four and six cams, and compare the blows with the wheel's turns. Then try six cams at top speed. Watch whether the hammer has time to fall all the way."
  ],
  note: "This model is rebuilt from Brown's drawing. The exact shape of the cams, the post that holds the wheel's shaft, the pin and cheeks the arm rocks on, and the iron bar were made up. The hammer falls freely under its own weight, as a real one does. The choice of two or six cams was added to compare.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var PX = 158, PY = 30, TD = 0.105;                     // pivot pin centre; arm angle between Brown's drawn pose and rest
    var o = this.o = { a: 0, th: TD, w: 0, turns: 0, blows: 0, n: "4", wheels: {}, PX: PX, PY: PY, RN: 6, TMAX: 0.3 };
    function rest(x, y) {                                   // turn a point of the drawn (lifted) pose down to the rest pose
      var dx = x - PX, dy = y - PY, cs = Math.cos(TD), sn = Math.sin(TD);
      return [PX + dx * cs - dy * sn, PY + dx * sn + dy * cs];
    }
    // hammer: built in its rest pose inside a group pivoting at the pin; step() turns it up by th
    o.ham = new T.Group(); o.ham.position.set(PX, PY, 0); scene.add(o.ham);
    var arm = [[-80, 165], [176, 104], [176, 40], [140, 40], [140, 84], [4, 90], [-30, 108], [-80, 128]];   // drawn pose, traced from the engraving
    var sh = new T.Shape();
    arm.forEach(function (p, i) { var q = rest(p[0], p[1]); sh[i ? "lineTo" : "moveTo"](q[0] - PX, q[1] - PY); });
    var g = new T.ExtrudeGeometry(sh, { depth: 20, bevelEnabled: false }); g.translate(0, 0, -10);
    o.ham.add(new T.Mesh(g, c.mat("hammer")));                                       // arm z -10..10, its left end buried in the head
    P.at(P.box(104, 48, 28, c.mat("hammer")), -102 - PX, 120 - PY, 0, o.ham);        // head x -154..-50, y 96..144 at rest, z -14..14
    P.at(P.box(50, 10, 20, c.mat("hammer", "dark")), -115 - PX, 91 - PY, 0, o.ham);  // face x -140..-90, y 86..96: rests on the bar top y 86
    P.at(P.cylZ(12, 24, c.mat("hammer")), 0, 0, 0, o.ham);                           // knob round the pin, z -12..12, ends at the cheek faces
    // lug: a narrow block down from the arm's underside, with a round nose the cams push on
    var lsh = new T.Shape(), lp = [[-7, 62], [1, 62], [3, 96], [-9, 96]];            // drawn pose; nose centre (-3, 62)
    lp.forEach(function (p, i) { var q = rest(p[0], p[1]); lsh[i ? "lineTo" : "moveTo"](q[0] - PX, q[1] - PY); });
    var lg = new T.ExtrudeGeometry(lsh, { depth: 12, bevelEnabled: false }); lg.translate(0, 0, -6);
    o.ham.add(new T.Mesh(lg, c.mat("lug")));                                         // z -6..6
    var nz = rest(-3, 62);
    P.at(P.cylZ(o.RN, 20, c.mat("lug")), nz[0] - PX, nz[1] - PY, 0, o.ham);          // nose r 6, z -10..10 like the wheel
    o.nR = Math.hypot(nz[0] - PX, nz[1] - PY); o.nA = Math.atan2(nz[1] - PY, nz[0] - PX);
    // wiper wheels, one for each cam count; each cam rises slowly to its tip, then drops sharply
    var RH = 20, RT = 56;
    ["2", "4", "6"].forEach(function (k) {
      var n = +k, per = 2 * Math.PI / n, W = Math.min(1.05, 0.62 * per), pts = [], i, j, s;
      for (i = 0; i < n; i++) {
        var a0 = i * per;
        for (j = 0; j <= 24; j++) { s = j / 24; pts.push([a0 + s * W, RH + (RT - RH) * (1 - Math.pow(1 - s, 1.7))]); }
        pts.push([a0 + W + 0.03, RT - 10], [a0 + W + 0.02, RH + 12], [a0 + W + 0.12, RH]);    // the drop face, hooked a little
        for (j = 1; j <= 6; j++) pts.push([a0 + W + 0.12 + (per - W - 0.12) * j / 7, RH]);
      }
      var ws = new T.Shape(), xy = pts.map(function (p) { return [p[1] * Math.cos(p[0]), p[1] * Math.sin(p[0])]; });
      xy.forEach(function (p, i) { ws[i ? "lineTo" : "moveTo"](p[0], p[1]); });
      var wg = new T.ExtrudeGeometry(ws, { depth: 20, bevelEnabled: false }); wg.translate(0, 0, -10);
      var grp = new T.Group(); scene.add(grp);
      grp.add(new T.Mesh(wg, c.mat("wiper")));                                       // wheel z -10..10
      P.at(P.cylZ(6, 46, c.mat("wiper")), 0, 0, -7, grp);                            // shaft z -30..16, from the post face
      P.at(P.cylZ(10, 4, c.mat("wiper")), 0, 0, 12, grp);                            // collar z 10..14, on the wheel face
      var am = 0.5 * W, st = P.box(28, 5, 1, c.mat("wiper", "mark"));                // red stripe r 14..42 along the first cam
      st.position.set(28 * Math.cos(am), 28 * Math.sin(am), 11); st.rotation.z = am; grp.add(st);   // z 10.5..11.5, lifted off the face
      o.wheels[k] = { g: grp, pts: xy.filter(function (p) { return Math.hypot(p[0], p[1]) > RH + 4; }) };
    });
    // supports
    P.at(P.box(470, 12, 110, c.fixed), 5, -68, -10, scene);                // base x -230..240, y -74..-62, z -65..45
    P.at(P.box(120, 138, 70, c.fixed), -135, 7, -5, scene);               // anvil x -195..-75, y -62..76, z -40..30; stands on y -62
    P.at(P.box(44, 76, 10, c.fixed), 0, -24, -35, scene);                 // shaft post x -22..22, y -62..14, z -40..-30; shaft ends at z -30
    P.at(P.box(164, 67, 70, c.fixed), 148, -28.5, -5, scene);             // right block x 66..230, y -62..5, z -40..30
    P.at(P.box(60, 13, 40, c.fixed), 158, 11.5, 0, scene);                // pin seat x 128..188, y 5..18, z -20..20; knob bottom touches y 18
    [-16, 16].forEach(function (z) {
      P.at(P.box(24, 26, 8, c.fixed), 158, 31, z, scene);                 // cheeks x 146..170, y 18..44, z 12..20 and -20..-12; knob ends at z 12
    });
    P.at(P.box(133, 10, 16, c.mat("work")), -148.5, 81, 0, scene);        // bar x -215..-82, y 76..86, z -8..8; on the anvil top y 76
    // start as drawn: a cam pushing the lug near the top of its lift
    var best = 0, bestA = 0, q;
    for (q = 0; q < 1.6; q += 0.002) { var t = this.cam(o, "4", q); if (t > best * 0.999) { best = t; bestA = q; } }
    o.a = o.a0 = bestA - 0.08; o.th = this.cam(o, "4", o.a);
  },

  cam: function (o, k, a) {                                  // lowest arm lift (rad) that keeps the nose clear of every cam point
    var pts = o.wheels[k].pts, cs = Math.cos(-a), sn = Math.sin(-a), best = 0, i, x, y, dx, dy, d, ca, need;
    for (i = 0; i < pts.length; i++) {
      x = pts[i][0] * cs - pts[i][1] * sn; y = pts[i][0] * sn + pts[i][1] * cs;
      dx = x - o.PX; dy = y - o.PY; d = Math.hypot(dx, dy);
      if (Math.abs(d - o.nR) >= o.RN) continue;
      ca = (o.nR * o.nR + d * d - o.RN * o.RN) / (2 * o.nR * d);
      need = o.nA - Math.atan2(dy, dx) + Math.acos(Math.min(1, ca));   // nose must swing above this point
      if (need > best && need < o.TMAX) best = need;
    }
    return best;
  },

  step: function (c, dt, S) {
    var o = this.o, k = S.controls.cams || "4", h, n, G = 5;          // G: fall of the arm under its weight, rad/s²
    if (k !== o.n) { o.n = k; o.turns = 0; o.blows = 0; o.a = o.a0; o.th = this.cam(o, k, o.a); o.w = 0; }
    for (h in o.wheels) o.wheels[h].g.visible = h === k;
    if (S.playing && dt > 0) {
      dt = Math.min(dt, 0.05); n = Math.max(1, Math.ceil(dt / 0.004));
      for (var i = 0; i < n; i++) {
        var e = dt / n, th0 = o.th, tc;
        o.a += S.w * e; o.turns += S.w * e / (2 * Math.PI);
        tc = this.cam(o, k, o.a);
        o.w -= G * e; o.th += o.w * e;
        if (o.th <= tc) { o.th = tc; o.w = (tc - th0) / e; }        // a cam is pushing: the arm moves with it
        if (o.th <= 0) { if (o.w < -0.05) o.blows++; o.th = 0; o.w = 0; }   // head lands on the iron
      }
    }
    o.ham.rotation.z = -o.th;
    o.wheels[k].g.rotation.z = -o.a;
    S.set("turns", Math.floor(o.turns) + (Math.floor(o.turns) === 1 ? " turn" : " turns"));
    S.set("blows", String(o.blows));
  }
});
