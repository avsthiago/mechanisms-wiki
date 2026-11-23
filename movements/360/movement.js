M507.define({
  number: 360,
  title: "Beam, drum and ratchet",
  lede: "A beam rocks to and fro, but the big wheel behind it turns one way only. A cord from the beam turns a drum back and forth, and a small catch on the drum, called a pawl, pushes a toothed wheel, called a ratchet wheel, round in one direction. This turns a rocking motion into a steady turning one.",
  alt: "A beam with a curved piece at each end rocks on top of an upright post. A cord from the right end runs down round a drum. A toothed wheel sits inside the drum with a catch pressing on its teeth, and a big spoked wheel turns behind them. A weight hangs from a cord on the left end.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Rocking beam", note: "Rocks on the top of the post. A curved piece at each end lets the cords wrap round it without kinking." },
    { key: "rope", color: "#D9B13B", name: "Cords", note: "The right cord runs round the drum. The left cord carries a ball that hangs straight down." },
    { key: "drum", color: "#8E7AA8", name: "Drum", note: "The drum is loose on the shaft. The cord turns it back and forth, and it carries the pawl." },
    { key: "pawl", color: "#C2503F", name: "Pawl", note: "A small catch fixed to the drum. It pushes the ratchet wheel one way and slips back over the teeth the other way." },
    { key: "ratchet", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with sloping teeth, fixed to the shaft. The pawl pushes it one way and clicks over its teeth the other way. Watch it." },
    { key: "wheel", color: "#4FA58A", name: "Big wheel and shaft", note: "Heavy, so once it is turning it keeps turning while the pawl slips back." }
  ],
  controls: [{ type: "range", id: "sw", label: "How far the beam rocks", min: 8, max: 20, step: 2, value: 14, unit: "°", presets: [[8, "Small"], [14, "Medium"], [20, "Big"]] }],
  speed: { min: 4, max: 30, value: 12, label: "Beam rocks", unit: " per min" },
  readouts: [{ id: "b", label: "Beam" }, { id: "d", label: "Drum" }, { id: "f", label: "Big wheel" }],
  views: { "3d": [60, 30, 540], front: [-32, 8, 640], side: [640, 8, 20] },
  target: [-32, 8, 20],
  distance: [300, 1400],
  how: [
    "Watch the cord from the right end of the beam. When that end goes up, the cord pulls the drum round one way. When it goes down, the drum turns back. The drum only ever rocks.",
    "The pawl is fixed to the drum and rests against the teeth of the ratchet wheel. Going one way it pushes a tooth and turns the wheel and the big wheel with it. Going back it slides over the teeth with a click and leaves the wheel alone. The heavy big wheel keeps turning in between.",
    "Try a small rock, then a big one. A bigger rock turns the drum further, so the pawl pushes more teeth on each stroke."
  ],
  note: "This model is rebuilt from Brown's drawing. The beam is rocked by an unseen hand or crank. The post, base and the two bearings were added so it stands up, and the sizes, the number of teeth and the rubbing on the big wheel were made up. The cord is tied at both ends, so the ball only hangs there and follows the left end of the beam.",

  build: function (c) {
    var T = c.THREE, P = c.P, i, o = this.o = { ph: 0, k: 0, phi: 0, wf: 0, th: 0, a: 0, PX: -52, PY: 96, Z: 23, RR: 84, RD: 32, B: 26 * Math.PI / 180, al0: 117 * Math.PI / 180, RP: 27.5, PL: 17, NT: 14, RT: 22, DT: 6 };
    function ring(rIn, rOut, z0, z1, m) {
      var sh = new T.Shape(), h = new T.Path();
      sh.absarc(0, 0, rOut, 0, 2 * Math.PI, false); h.absarc(0, 0, rIn, 0, 2 * Math.PI, true); sh.holes.push(h);
      var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 48 }); g.translate(0, 0, z0);
      return new T.Mesh(g, m);
    }
    function sector(a0, a1, m) {
      var sh = new T.Shape(); sh.absarc(0, 0, 82, a0, a1, false); sh.absarc(0, 0, 74, a1, a0, true); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false, curveSegments: 16 }); g.translate(0, 0, -4);
      return new T.Mesh(g, m);
    }
    // stand: base y -93..-85, post x -63..-41, y -85..108, z 7..19
    P.at(P.box(238, 8, 72, c.fixed), -5, -89, 12, c.scene);
    P.at(P.box(22, 193, 12, c.fixed), o.PX, 11.5, 13, c.scene);
    P.at(P.bearingBlock({ bore: 5.8, outer: 12, post: 18, width: 10, drop: 85, material: c.fixed }), 0, 0, -12, c.scene);   // z -17 .. -7
    P.at(P.bearingBlock({ bore: 5.8, outer: 12, post: 18, width: 10, drop: 85, material: c.fixed }), 0, 0, -22, c.scene);   // z -27 .. -17
    // big wheel and shaft (z -5 .. 5), turned by phi
    var wm = c.mat("wheel"), ws = o.wheel = new T.Group(); c.scene.add(ws);
    P.at(P.cylZ(5, 54, wm), 0, 0, 0, ws);                                           // shaft z -27 .. 27
    ws.add(ring(76, 82, -5, 5, wm));
    P.at(P.cylZ(11, 10, wm), 0, 0, 0, ws);
    for (i = 0; i < 6; i++) { var a = (i + .5) * Math.PI / 3, s = P.box(66, 5, 4, wm); s.position.set(43 * Math.cos(a), 43 * Math.sin(a), 0); s.rotation.z = a; ws.add(s); }
    P.at(P.box(10, 10, 1, c.mat("wheel", "dark")), 77, 0, 5.5, ws);                // stripe on the rim front, z 5 .. 6
    // toothed wheel fast on the shaft (z 21.5 .. 26.5, inside the drum ring)
    o.rat = P.ratchet({ teeth: o.NT, radius: o.RT, depth: o.DT, width: 5, reverse: true, material: c.mat("ratchet") });
    o.rat.position.z = 24; ws.add(o.rat); P.at(P.cylZ(8, 5, c.mat("ratchet")), 0, 0, 24, ws);
    o.pitch = o.rat.pitch;
    // drum, loose on the shaft (z 19 .. 27), turned by th
    var dm = c.mat("drum"), dr = o.drum = new T.Group(); c.scene.add(dr);
    dr.add(ring(25, 30, 19, 27, dm)); dr.add(ring(30, 35, 19, 21, dm)); dr.add(ring(30, 35, 25, 27, dm));
    P.at(P.cylZ(9, 2, dm), 0, 0, 20, dr);
    for (i = 0; i < 3; i++) { var b = i * 2 * Math.PI / 3 + .4, q = P.box(20, 4, 2, dm); q.position.set(17 * Math.cos(b), 17 * Math.sin(b), 20); q.rotation.z = b; dr.add(q); }
    o.pawl = P.pawl({ length: o.PL, thick: 5, width: 4, side: -1, material: c.mat("pawl") });
    o.pawl.position.set(o.RP * Math.cos(o.al0), o.RP * Math.sin(o.al0), 24.5); dr.add(o.pawl);
    // beam on the post (z 19 .. 27)
    var bm = c.mat("beam"), bg = o.beam = new T.Group(); bg.position.set(o.PX, o.PY, o.Z); c.scene.add(bg);
    P.at(P.cylZ(8, 8, bm), 0, 0, 0, bg);
    bg.add(sector(-o.B, o.B, bm)); bg.add(sector(Math.PI - o.B, Math.PI + o.B, bm));
    [-1, 1].forEach(function (sd) {
      [-20, 0, 20].forEach(function (dg) {
        var an = dg * Math.PI / 180, r = P.rod(2.4, bm);
        r.span(sd * 8 * Math.cos(an), 8 * Math.sin(an), 0, sd * 75 * Math.cos(an), 75 * Math.sin(an), 0); bg.add(r);
      });
    });
    // cords and ball
    o.rr = P.ropePath({ tube: 2, material: c.mat("rope") }); c.scene.add(o.rr);
    o.lr = P.ropePath({ tube: 2, material: c.mat("rope") }); c.scene.add(o.lr);
    o.ball = P.at(P.sphere(9, c.mat("rope", "dark")), o.PX - o.RR, -1, o.Z, c.scene);
    var rim0 = o.rat.rimAt(-1e-6);                                                  // the nose starts in a gap, against the face just ahead
    o.gam = function (rim) { return Math.acos(Math.max(-1, Math.min(1, (o.RP * o.RP + rim * rim - o.PL * o.PL) / (2 * o.RP * rim)))); };
    o.phi = o.al0 + o.gam(rim0);
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, A = +S.controls.sw * Math.PI / 180, i, deg = 180 / Math.PI, pitch = o.pitch;
    var thOld = o.th;
    o.ph += S.w * dt;
    o.a = A * Math.sin(o.ph);
    o.th = o.RR / o.RD * o.a;
    var dth = o.th - thOld;
    if (S.playing && dt > 0) {
      o.phi += o.wf * dt; o.wf *= Math.exp(-.35 * dt);
      var p = o.al0 + o.th - o.phi, rimR = o.RT - o.DT, rimT = o.RT, guard = 0;
      while (guard++ < 50 && p < (o.k - 1) * pitch - o.gam(rimT)) o.k--;           // the nose has gone over a tooth tip and dropped into the next gap
      var pb = o.k * pitch - o.gam(rimR);
      if (p > pb) { o.phi += p - pb; o.wf = Math.max(o.wf, dth / dt); }            // pushing on the tooth face
    }
    var pv = o.al0 + o.th - o.phi, pbk = o.k * pitch - o.gam(o.RT - o.DT), a, lo, hi, rim;
    if (pv >= pbk) a = o.k * pitch - 1e-6;
    else {
      lo = (o.k - 1) * pitch + 1e-6; hi = o.k * pitch - 1e-6;
      for (i = 0; i < 34; i++) { a = (lo + hi) / 2; if (a - o.gam(o.rat.rimAt(a)) < pv) lo = a; else hi = a; }
    }
    rim = o.rat.rimAt(a);
    var nw = a + o.phi, pw = o.al0 + o.th;
    var nx = rim * Math.cos(nw), ny = rim * Math.sin(nw), px = o.RP * Math.cos(pw), py = o.RP * Math.sin(pw);
    o.pawl.rotation.z = Math.atan2(ny - py, nx - px) - o.th;
    o.wheel.rotation.z = o.phi; o.drum.rotation.z = o.th; o.beam.rotation.z = o.a;
    // cords
    var C = [o.PX, o.PY, o.Z], R = o.RR, B = o.B;
    o.rr.set([{ c: C, r: R, a0: B + o.a, a1: 0 }, { c: [0, 0, o.Z], r: o.RD, a0: 0, a1: -Math.PI + o.th }]);
    var by = -1 - R * o.a;
    o.lr.set([[o.PX - R, by - 44, o.Z], { c: C, r: R, a0: Math.PI, a1: Math.PI - B + o.a }]);
    o.ball.position.y = by;
    S.set("b", Math.round(o.a * deg) + "°");
    S.set("d", (S.playing ? Math.round(dth / Math.max(dt, 1e-3) * 60 / (2 * Math.PI)) : 0) + " rpm");
    S.set("f", Math.round(o.wf * 60 / (2 * Math.PI) * 10) / 10 + " rpm");
  }
});
