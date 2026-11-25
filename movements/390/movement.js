M507.define({
  number: 390,
  title: "Lever, two belts and ratchets",
  lede: "A lever rocks a half wheel to and fro. Two round belts carry the rocking down to two small pulleys. Through two ratchets, both strokes turn a flywheel the same way, so the rocking becomes steady turning.",
  alt: "A level lever on a central pivot, with a half wheel hanging below it. Two round belts run from the half wheel down to two small pulleys on the shaft of a big spoked flywheel. One belt runs straight, the other crosses. A small toothed ratchet wheel with a pawl sits on the front of the pulleys.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Lever and half wheel", note: "Rocks on the pivot at the middle of the lever. The belts are tied to the ends of the half wheel." },
    { key: "belts", color: "#D9B13B", name: "Round belts", note: "The front belt runs straight, so its pulley turns the same way as the half wheel. The back belt crosses, so its pulley turns the other way." },
    { key: "pulleys", color: "#C8873A", name: "Pulleys and pawls", note: "Two pulleys, loose on the shaft, each carrying a small hook, called a pawl. They only rock to and fro." },
    { key: "shaft", color: "#4FA58A", name: "Flywheel and ratchets", note: "The flywheel and the two toothed ratchet wheels are fixed on the shaft. Watch the red spoke: it always turns the same way." }
  ],
  controls: [{ id: "fly", label: "Flywheel", value: "heavy", options: [["heavy", "Heavy"], ["light", "Light"]] }],
  speed: { min: 2, max: 30, value: 12, label: "Rocking speed", unit: " a min" },
  readouts: [{ id: "lev", label: "Lever" }, { id: "fw", label: "Flywheel" }, { id: "dr", label: "Pushing" }],
  views: { "3d": [513, 83, 1085], front: [0, -120, 940], side: [940, -120, 0] },
  target: [0, -198, -16],
  how: [
    "Push one end of the lever down and the half wheel rocks. The belts are tied to its ends, so one side of each belt is pulled in and the other is let out. Both pulleys turn, but in opposite ways, because one belt is crossed.",
    "Each pulley carries a pawl that rests on a toothed ratchet wheel fixed to the shaft. When its pulley turns clockwise, the pawl pushes a tooth and turns the shaft. When it turns back, the pawl just slides over the teeth. On every stroke one of the two pulleys is turning clockwise, so the shaft is pushed both ways the lever goes.",
    "Between pushes the flywheel keeps the shaft going by itself. Try Heavy, then Light, and watch the flywheel speed. A light one slows down between strokes; a heavy one hardly notices."
  ],
  note: "This model is rebuilt from Brown's drawing. The back plate, the pivot pins, the sizes and the number of ratchet teeth are made up. The second ratchet and its pawl sit behind the back pulley, out of sight from the front. The belts are round cords here and do not slip. The flywheel slows a little by rubbing between pushes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { ph: 0, phi: null, RA: 175, r: 45, Q: [0, -270], amp: 20 * Math.PI / 180, tie: 3 * Math.PI / 180,
      s: 0, sv: 0, a: [0, 0], u: [0, 0], N: [null, null], zC: 13, zD: -5, rp: 38, beta: [Math.PI / 2, -Math.PI / 2] };
    var ml = c.mat("lever"), mb = c.mat("belts"), mp = c.mat("pulleys"), ms = c.mat("shaft");
    // back plate carrying the lever pivot and the shaft
    P.at(P.box(520, 500, 10, c.fixed), 0, -210, -65, scene);                    // x -260..260, y -460..40, z -70..-60
    // lever and half wheel, rocking about the origin; z -13..21
    o.lev = P.at(new T.Group(), 0, 0, 0, scene);
    var ro = o.RA - 2.5, ri = 150, sh = new T.Shape();
    sh.absarc(0, 0, ro, Math.PI, 2 * Math.PI, false); sh.lineTo(ri, 0); sh.absarc(0, 0, ri, 2 * Math.PI, Math.PI, true); sh.closePath();
    var rg = new T.ExtrudeGeometry(sh, { depth: 34, bevelEnabled: false, curveSegments: 48 }); rg.translate(0, 0, -13);
    o.lev.add(P.mesh(rg, ml));                                                   // rim r 150..172.5, z -13..21
    P.at(P.box(500, 18, 34, ml), 0, 0, 4, o.lev);                               // lever x -250..250, y -9..9, z -13..21 (rim tips sit under it)
    P.at(P.cylZ(18, 35, ml), 0, 0, 4, o.lev);                                   // hub z -13.5..21.5, 0.5 proud of the lever faces
    P.at(P.cylZ(7, 1, c.mat("lever", "dark")), 0, 0, 22, o.lev);               // pin end z 21.5..22.5
    P.at(P.cylZ(6, 46.5, c.fixed), 0, 0, -36.75, scene);                        // pivot pin z -60..-13.5, plate face to hub back
    [-1, 1].forEach(function (sd) { P.at(P.sphere(12, c.mat("lever", "dark")), sd * 262, 0, 4, o.lev); });
    // shaft with flywheel and two ratchets
    var Q = o.Q;
    o.sh = P.at(new T.Group(), Q[0], Q[1], 0, scene);
    P.at(P.cylZ(6, 98, ms), 0, 0, -11, o.sh);                                    // shaft z -60..38
    var fw = P.pulley({ radius: 160, width: 20, rim: 22, spokes: 4, material: ms }); fw.position.z = -40; o.sh.add(fw);   // z -50..-30
    fw.spokes[0].material = c.mat("shaft", "mark");
    o.rat = [];
    [27, -19].forEach(function (z) { var rt = P.ratchet({ teeth: 8, radius: 26, depth: 7, width: 10, tip: 1.5, material: ms }); rt.position.z = z; o.sh.add(rt); o.rat.push(rt); });   // z 22..32 and -24..-14
    P.at(P.cylZ(9, 6, ms), 0, 0, 35, o.sh);                                     // collar z 32..38
    // two pulleys, loose on the shaft: core r 42.5 under the belt, flanges r 49
    o.pul = []; o.pawl = [];
    var self = this, rr = 26 - 7;
    o.L = Math.sqrt(o.rp * o.rp + rr * rr - 2 * o.rp * rr * Math.cos(40 * Math.PI / 180));   // pawl length: reaches 40 degrees round at the root
    [[13, 1], [-5, -1]].forEach(function (q, i) {
      var g = P.at(new T.Group(), Q[0], Q[1], q[0], scene);
      P.at(P.cylZ(o.r - 2.5, 11, mp), 0, 0, 0, g);                              // core z ±5.5 about the lane
      P.at(P.cylZ(49, 1.5, mp), 0, 0, 6.25, g); P.at(P.cylZ(49, 1.5, mp), 0, 0, -6.25, g);   // flanges ±5.5..±7
      // pawl on the face next to its ratchet: front face (z +7) for the front pulley, back face (z -7) for the back one
      var zr = (i === 0 ? 27 : -19) - q[0];
      var pv = P.at(new T.Group(), o.rp * Math.cos(o.beta[i]), o.rp * Math.sin(o.beta[i]), zr, g);
      var pw = P.pawl({ length: o.L, thick: 6, width: 10, material: c.mat("pulleys", "dark") }); pv.add(pw);
      P.at(P.cylZ(3, Math.abs(zr) - 7, mp), o.rp * Math.cos(o.beta[i]), o.rp * Math.sin(o.beta[i]), (zr + q[1] * 7) / 2, g);   // pin from the pulley face to the pawl
      o.pul.push(g); o.pawl.push(pw);
    });
    o.reachRoot = o.pawl[0].reach(o.rp, rr);
    // belts: straight runs and wraps; wraps on the half wheel change length while it rocks
    function run() { return P.at(P.rod(2.5, mb), 0, 0, 0, scene); }
    o.runs = { C: [run(), run()], D: [run(), run(), run(), run()] };
    o.wraps = []; for (var k = 0; k < 4; k++) { var w = P.at(P.mesh(new T.BufferGeometry(), mb), 0, 0, k < 2 ? o.zC : o.zD, scene); w.userData.live = true; o.wraps.push(w); }
    // the belts round the pulleys stay put while the pulleys turn under them
    var d = -Q[1];
    o.gC = Math.acos((o.RA - o.r) / d); o.gD = Math.acos((o.RA + o.r) / d);
    var wc = P.arc(o.r, 2.5, 2 * o.gC, mb); wc.rotation.z = -Math.PI / 2 - o.gC; P.at(wc, Q[0], Q[1], o.zC, scene);
    var wd = P.arc(o.r, 2.5, 2 * Math.PI - 2 * o.gD, mb); wd.rotation.z = Math.PI / 2 + o.gD; P.at(wd, Q[0], Q[1], o.zD, scene);
    // fixed straight runs (they only depend on tangent points, which do not move)
    function on(cx, cy, R, a) { return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; }
    var aR = -Math.PI / 2 + o.gC, aL = -Math.PI / 2 - o.gC;
    [aR, aL].forEach(function (a, k) { var p1 = on(0, 0, o.RA, a), p2 = on(Q[0], Q[1], o.r, a); o.runs.C[k].span(p1[0], p1[1], o.zC, p2[0], p2[1], o.zC); });
    var bR = -Math.PI / 2 + o.gD, bL = -Math.PI / 2 - o.gD;
    [[bR, 2.6], [bL, -2.6]].forEach(function (q, k) {          // crossed runs: each bends a little to pass the other at the crossing
      var p1 = on(0, 0, o.RA, q[0]), p2 = on(Q[0], Q[1], o.r, q[0] + Math.PI), t = -p1[0] / (p2[0] - p1[0]), xm = 0, ym = p1[1] + (p2[1] - p1[1]) * t;
      o.runs.D[2 * k].span(p1[0], p1[1], o.zD, xm, ym, o.zD + q[1]); o.runs.D[2 * k + 1].span(xm, ym, o.zD + q[1], p2[0], p2[1], o.zD);
    });
    o.tan = { C: [aR, aL], D: [bR, bL] };
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, i, k;
    o.ph += S.w * dt;
    var phi = o.amp * Math.sin(o.ph);
    o.lev.rotation.z = phi;
    // wraps on the half wheel: from each tangent point to the tie near each tip
    var tR = phi - o.tie, tL = phi + Math.PI + o.tie, W = [[o.tan.C[0], tR], [tL, o.tan.C[1] + 2 * Math.PI], [o.tan.D[0], tR], [tL, o.tan.D[1] + 2 * Math.PI]];
    for (k = 0; k < 4; k++) { var w = o.wraps[k]; w.geometry.dispose(); w.geometry = new T.TorusGeometry(o.RA, 2.5, 8, 24, W[k][1] - W[k][0]); w.rotation.z = W[k][0]; }
    // pulleys: the open belt turns its pulley with the half wheel, the crossed one against it
    var g = o.RA / o.r, a0 = [-phi * g, phi * g];                    // clockwise angles
    // shaft: coasts and slows by rubbing; a pawl drags it on when its pulley gets ahead by a notch
    var tau = S.controls.fly === "heavy" ? 12 : .35, st = o.rat[0].pitch, drive = -1;
    var s0 = o.s, sNew = o.s + o.sv * dt;
    for (i = 0; i < 2; i++) {
      var c0 = o.beta[i] - o.reachRoot;                                // notches: u = c0 + m * pitch puts the nose on a tooth face
      if (o.N[i] === null) o.N[i] = c0 + st * Math.ceil((a0[i] - sNew - c0) / st - 1e-9);
      if (a0[i] - sNew > o.N[i]) { sNew = a0[i] - o.N[i]; drive = i; }
    }
    o.s = sNew;
    if (dt > 0) { o.sv = drive >= 0 ? Math.max(0, (o.s - s0) / dt) : o.sv * Math.exp(-dt / tau); }
    o.sh.rotation.z = -o.s;
    for (i = 0; i < 2; i++) {
      var u = a0[i] - o.s, c1 = o.beta[i] - o.reachRoot;
      o.N[i] = c1 + st * Math.ceil((u - c1) / st - 1e-9);
      o.pul[i].rotation.z = -a0[i];
      // nose of the pawl on the ratchet rim, worked out in the ratchet's own frame
      var rim = 19, lam = 0;
      for (k = 0; k < 3; k++) { var rch = o.pawl[i].reach(o.rp, rim); lam = o.beta[i] - u - rch; rim = Math.abs(o.N[i] - u) < 1e-7 ? 19 : o.rat[i].rimAt(lam); }
      rch = o.pawl[i].reach(o.rp, rim);
      var nb = o.beta[i] - rch, px = o.rp * Math.cos(o.beta[i]), py = o.rp * Math.sin(o.beta[i]);
      o.pawl[i].rotation.z = Math.atan2(rim * Math.sin(nb) - py, rim * Math.cos(nb) - px);
    }
    S.set("lev", Math.round(phi * 180 / Math.PI) + "°");
    S.set("fw", (o.sv * 60 / (2 * Math.PI)).toFixed(1) + " rpm");
    S.set("dr", drive === 0 ? "front" : drive === 1 ? "back" : "neither");
  }
});
