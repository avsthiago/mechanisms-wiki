M507.define({
  number: 179,
  title: "Reversing gear for a single engine",
  lede: "An engine shaft pushes its valve to and fro through a rod with a notched end. Lift the rod off, slide the valve with a hand lever, and drop the rod again. The engine now runs the other way.",
  alt: "A shaft with a round disc on it, off centre, inside a ring. A long rod runs left from the ring and ends in a notch that rests on a pin on a sliding valve rod. An upright hand lever on the left is joined to the valve rod by a short link.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Shaft and disc", note: "A round disc set off its centre, called an eccentric. It is loose on the shaft. A small stop on the shaft pushes it round, and the disc can slip half a turn when the shaft changes direction." },
    { key: "rod", color: "#D9B13B", name: "Eccentric rod", note: "Joined to the ring round the disc. Its far end has a notch and a hinge, so that end can be lifted clear of the pin." },
    { key: "valve", color: "#4FA58A", name: "Valve rod", note: "Slides to and fro and works the engine's valve. Watch the red pin. The notch drops onto it." },
    { key: "lever", color: "#C8873A", name: "Upright lever", note: "Turns on a pin at the bottom. A short link joins it to the valve rod. Moving the lever slides the valve rod." }
  ],
  controls: [{ id: "r", label: "Eccentric rod", value: "down", options: [["down", "Down"], ["up", "Up"]] }],
  readouts: [{ id: "d", label: "Shaft" }, { id: "v", label: "Valve" }, { id: "r", label: "Rod" }],
  views: { "3d": [330, 230, 950], front: [-20, 60, 1000], side: [1150, 120, 0] },
  target: [-25, 90, 0],
  how: [
    "The shaft turns the disc, and the ring round the disc pushes the long rod to and fro. The notch at the end of the rod sits on the red pin, so the valve rod moves with it. The valve lets steam into the engine.",
    "To reverse the engine, lift the rod. The notch leaves the pin and the valve rod is free. The hand lever now slides it to the other side. The shaft turns the other way, and the loose disc slips half a turn on it.",
    "Press Up, and watch the lever swing and the shaft change direction. Then press Down. The notch waits until it passes over the pin, then drops onto it. Try it again to go back."
  ],
  note: "This model is rebuilt from Brown's drawing. The shaft, base, bearing, guide and the hinge in the rod were made up. So was the stop that pushes the loose disc. The sizes are guesses, and the disc is shown with a small throw. In the drawing the lever stays put while the engine runs, but here it sways a little with the valve rod.",

  K: { X0: 175, L: 300, E: 10, PY: 18, PIN0: -125, SX: -185, HX: 200, LB: 100, LAM: 0.26, LMIN: 0.5, DOG: 0.3,
       BX: -225, BY: -80, LR: 100 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { th: 0, rel: K.LMIN, dir: 1, lam: 0, s: 0, sl: 0, prev: "down" };
    function hex(r, len, m) { var g = new T.CylinderGeometry(r, r, len, 6); g.rotateZ(Math.PI / 2); return P.mesh(g, m); }
    function sector(r0, r1, a0, a1, z0, z1, m) {
      var sh = new T.Shape(); sh.absarc(0, 0, r1, a0, a1, false); sh.absarc(0, 0, r0, a1, a0, true);
      var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, z0);
      return P.mesh(g, m);
    }
    // shaft turning with the shaft angle; z -60 (bearing face) .. 26
    o.rot = new T.Group(); o.rot.position.set(K.X0, 0, 0); scene.add(o.rot);
    P.at(P.cylZ(12.5, 86, c.mat("disc")), 0, 0, -17, o.rot);                              // shaft z -60..26
    P.at(P.cylZ(22.5, 28, c.mat("disc")), 0, 0, -2, o.rot);                               // hub z -16..12, inside the disc lips
    var dd = K.DOG - 0.04;
    o.rot.add(sector(12.5, 52, -dd / 2, dd / 2, 14, 26, c.mat("disc", "mark")));          // stop on the shaft, z 14..26, red to follow
    // loose disc: core, lips, and the half-ring projection the stop pushes on
    o.disc = new T.Group(); scene.add(o.disc);
    P.at(P.cylZ(59.6, 20, c.mat("disc")), 0, 0, 0, o.disc);                               // core z -10..10
    P.at(P.cylZ(64, 3, c.mat("disc")), 0, 0, 11.5, o.disc);                               // lips z 10..13 and -13..-10
    P.at(P.cylZ(64, 3, c.mat("disc")), 0, 0, -11.5, o.disc);
    var a1 = K.DOG / 2 - K.LMIN;
    o.disc.add(sector(30, 46, a1, a1 + Math.PI - K.DOG, 13, 26, c.mat("disc")));            // half-ring z 13..26 on the lip face
    // strap, two halves bolted, as in a plain eccentric
    o.strap = new T.Group(); scene.add(o.strap);
    [1, -1].forEach(function (s) {
      var sh = new T.Shape();
      sh.absarc(s * .5, 0, 72.5, -Math.PI / 2, Math.PI / 2, s < 0); sh.absarc(s * .5, 0, 60, Math.PI / 2, -Math.PI / 2, s > 0);
      var geo = new T.ExtrudeGeometry(sh, { depth: 20, bevelEnabled: false, curveSegments: 40 }); geo.translate(0, 0, -10);
      o.strap.add(P.mesh(geo, c.mat("rod")));                                             // half ring r 60..72.5, z -10..10
      [1, -1].forEach(function (u) {
        P.at(P.box(28.5, 13, 20, c.mat("rod")), s * 15.25, u * 68.5, 0, o.strap);          // lug x 1..29.5, y 62..75
        P.at(hex(6, 6, c.mat("rod", "dark")), s * 32.5, u * 68.5, 0, o.strap);             // nut x 29.5..35.5
      });
    });
    [1, -1].forEach(function (u) { P.at(P.cylX(3.2, 76, c.mat("rod", "dark")), 0, u * 68.5, 0, o.strap); });
    P.at(P.cylX(8, 26, c.mat("rod")), 82, 0, 0, o.strap);                                  // neck x 69..95
    P.at(P.box(6, 70, 24, c.mat("rod")), 98, 0, 0, o.strap);                               // flange x 95..101
    P.at(P.box(6, 70, 24, c.mat("rod")), 104.5, 0, 0, o.strap);                            // flange x 101.5..107.5
    [1, -1].forEach(function (u) {
      P.at(P.cylX(3, 26, c.mat("rod", "dark")), 101, u * 26, 0, o.strap);                   // bolt x 88..114
      P.at(hex(5.5, 5, c.mat("rod", "dark")), 92.5, u * 26, 0, o.strap);
      P.at(hex(5.5, 5, c.mat("rod", "dark")), 110, u * 26, 0, o.strap);
    });
    P.at(P.cylX(7, K.HX - 10 - 107.5, c.mat("rod")), (107.5 + K.HX - 10) / 2, 0, 0, o.strap);   // rod x 107.5..190
    P.at(P.cylZ(10, 14, c.mat("rod")), K.HX, 0, 0, o.strap);                               // hinge eye x 190..210, z -7..7
    // outer part of the rod: hinged at the eye, ends in the notch and a curved lifting arm. Flipped so local +Y is up in the model.
    o.hinge = new T.Group(); scene.add(o.hinge);
    P.at(P.cylZ(4, 20, c.mat("rod", "dark")), 0, 0, 0, o.hinge);                            // hinge pin z -10..10
    var flip = new T.Group(); flip.rotation.x = Math.PI; o.hinge.add(flip);
    P.at(P.cylX(5, K.LB - 20, c.mat("rod")), (K.LB - 20) / 2, 0, 0, flip);                  // bar x 0..80, y -5..5
    var nb = new T.Shape();
    nb.moveTo(-20, -5); nb.lineTo(-7.5, -5); nb.lineTo(-7.5, 0); nb.absarc(0, 0, 7.5, Math.PI, 0, true);
    nb.lineTo(7.5, -5); nb.lineTo(20, -5); nb.lineTo(20, 22); nb.lineTo(-20, 22); nb.lineTo(-20, -5);
    var ng = new T.ExtrudeGeometry(nb, { depth: 16, bevelEnabled: false, curveSegments: 24 }); ng.translate(0, 0, -8);
    P.at(P.mesh(ng, c.mat("rod")), K.LB, 0, 0, flip);                                       // notch block x 80..120, y -5..22, z -8..8
    var pts = [[0, 22], [2, 45], [14, 75], [40, 95], [68, 97], [80, 90]].map(function (p) { return new T.Vector3(K.LB + p[0], p[1], 0); });
    var tube = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 4.5, 8, false);
    P.at(P.mesh(tube, c.mat("rod")), 0, 0, 0, flip);                                        // lifting arm, starts on the block top (y 22)
    // valve rod: group at x = s; local origin is the middle position
    o.sp = new T.Group(); scene.add(o.sp);
    P.at(P.cylX(4, 250, c.mat("valve")), -185, 0, 0, o.sp);                                 // bar x -310..-60, y -4..4
    P.at(P.cylX(6, 4, c.mat("valve")), -308, 0, 0, o.sp);                                   // end cap x -310..-306
    P.at(P.box(12, 10, 14, c.mat("valve")), K.PIN0, 9, 0, o.sp);                            // stud x -131..-119, y 4..14
    P.at(P.cylZ(6, 20, c.mat("valve", "mark")), K.PIN0, K.PY, 0, o.sp);                     // red pin y 12..24, z -10..10
    P.at(P.cylZ(8, 16, c.mat("valve")), K.SX, 0, 0, o.sp);                                  // boss r 8, z -8..8
    P.at(P.cylZ(3, 7, c.mat("lever", "dark")), K.SX, 0, 11.5, o.sp);                        // link pin z 8..15
    // lever: pivot at the bottom, group rotated in step()
    o.lev = new T.Group(); o.lev.position.set(K.BX, K.BY, 0); scene.add(o.lev);
    P.at(P.box(7, 372, 6, c.mat("lever")), 0, 186, 17, o.lev);                              // bar y 0..372, z 14..20
    P.at(P.cylZ(10, 6, c.mat("lever")), 0, 0, 17, o.lev);                                   // hub z 14..20
    P.at(P.sphere(8, c.mat("lever")), 0, 380, 17, o.lev);                                   // knob
    P.at(P.cylZ(4.5, 8, c.mat("lever", "dark")), 0, K.LR, 17, o.lev);                       // pin at the link, z 13..21
    P.at(P.cylZ(5.5, 2, c.mat("lever", "dark")), 0, 0, 21, o.lev);                          // pivot head z 20..22
    o.link = P.at(P.rod(3, c.mat("lever")), 0, 0, 0, scene);
    // supports
    P.at(P.box(660, 12, 150, c.fixed), -25, -106, -15, scene);                              // base x -355..305, y -112..-100, z -90..60
    P.at(P.box(60, 130, 20, c.fixed), K.X0, -35, -70, scene);                               // bearing x 145..205, y -100..30, z -80..-60; shaft ends on its face
    P.at(P.box(36, 35, 10, c.fixed), K.BX, -82.5, 9, scene);                                // bracket y -100..-65, z 4..14; lever hub starts at z 14
    var bush = P.guideBlock({ w: 36, h: 28, d: 24, hole: 4.8, material: c.fixed }); bush.rotation.z = Math.PI / 2;
    P.at(bush, -276, 0, 0, scene);                                                          // guide x -290..-262, y -18..18, z -12..12
    P.at(P.box(20, 82, 24, c.fixed), -276, -59, 0, scene);                                  // post y -100..-18 under the guide
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, want = S.controls.r === "up";
    if (want && o.prev !== "up") o.dir = -o.dir;                                            // lifting the rod starts the reversal
    o.prev = want ? "up" : "down";
    var dth = o.dir * S.w * dt;
    o.th += dth;
    o.rel = Math.min(K.LMIN + Math.PI, Math.max(K.LMIN, o.rel - dth));                       // loose disc waits until the stop reaches it
    var te = o.th + o.rel, ex = K.X0 + K.E * Math.cos(te), ey = K.E * Math.sin(te);
    var dy = K.PY - ey, gx = ex - Math.sqrt(K.L * K.L - dy * dy), psi = Math.atan2(dy, gx - ex);
    var sEng = gx - K.PIN0;                                                                 // valve position the rod would force
    var rate = 2.2, sT = o.dir > 0 ? 7 : -7;
    if (want) {
      o.lam = Math.min(1, o.lam + rate * dt);
    } else if (o.lam > 0 && (o.lam < 1 || Math.abs(sEng - o.sl) < 6)) {
      o.lam = Math.max(0, o.lam - rate * dt);
    }
    if (o.lam > 0.7) o.sl += Math.max(-40 * dt, Math.min(40 * dt, sT - o.sl));              // lever slides the free valve rod
    if (o.lam <= 0) { o.s = sEng; o.sl = sEng; } else o.s = o.sl * o.lam + sEng * (1 - o.lam);
    o.rot.rotation.z = o.th; o.disc.position.set(ex, ey, 0); o.disc.rotation.z = te;
    o.strap.position.set(ex, ey, 0); o.strap.rotation.z = psi;
    o.hinge.position.set(ex + K.HX * Math.cos(psi), ey + K.HX * Math.sin(psi), 0);
    o.hinge.rotation.z = psi - o.lam * K.LAM;
    o.sp.position.x = o.s;
    // lever: its link point sits at distance LR from the pivot and LINK from the valve rod boss
    if (!o.l0) { var d0 = 0.186 / Math.sqrt(1 + 0.186 * 0.186), kx = K.BX - K.LR * d0, ky = K.BY + K.LR * Math.sqrt(1 - d0 * d0); o.l0 = Math.hypot(kx - K.SX, ky); }
    var sx = o.s + K.SX, Dx = sx - K.BX, Dy = -K.BY, d = Math.hypot(Dx, Dy);
    var g = Math.acos(Math.max(-1, Math.min(1, (K.LR * K.LR + d * d - o.l0 * o.l0) / (2 * K.LR * d))));
    var ka = Math.atan2(Dy, Dx) + g, kpx = K.BX + K.LR * Math.cos(ka), kpy = K.BY + K.LR * Math.sin(ka);
    o.lev.rotation.z = ka - Math.PI / 2;
    o.link.span(kpx, kpy, 11.5, sx, 0, 11.5);
    function sg(v) { return (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v).toFixed(0); }
    S.set("d", S.playing ? sg(o.dir * S.rpm) + " rpm" : "0 rpm");
    S.set("v", sg(Math.round(o.s)) + " mm");
    S.set("r", o.lam <= 0 ? "Down" : o.lam >= 1 ? (want ? "Up" : "Waiting") : (want ? "Rising" : "Dropping"));
  }
});
