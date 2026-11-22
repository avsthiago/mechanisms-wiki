M507.define({
  number: 206,
  title: "Lever with two pawls",
  lede: "A lever rocks to and fro above a toothed wheel. It carries two pawls, small catches that fit between the teeth. One pawl pushes the wheel on the way up and the other on the way down, so the wheel turns on every swing.",
  alt: "A big wheel with fine saw teeth. A curved plate hangs from a pivot above it and rocks. Two small catches hang from the ends of the plate and rest on the teeth. A crank and rod above rock the plate.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank and connecting rod", note: "A small crank and rod that rock the lever. They stand in for whatever pushes the lever in a real machine." },
    { key: "lever", color: "#D9B13B", name: "Swinging arm", note: "A bar with a curved plate on its end. It swings about the pin at the top and carries the two pawls." },
    { key: "pawls", color: "#C2503F", name: "Two pawls", note: "Two small catches hung from the ends of the plate. Watch them: one pushes a tooth while the other slides over the teeth, then they swap." },
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "The wheel that is turned. Each tooth has a long slope and a short steep face. The red mark shows how far it has turned." }
  ],
  controls: [{ id: "swing", label: "Lever swing", value: "4", options: [["3", "Small"], ["4", "Medium"], ["6", "Big"]] }],
  speed: { min: 1, max: 30, value: 8, label: "Crank speed", unit: " rpm" },
  readouts: [{ id: "turns", label: "Wheel" }, { id: "lever", label: "Lever" }],
  views: { "3d": [300, 215, 720], front: [0, 90, 720], side: [900, 90, -10] },
  target: [0, 90, 0],
  how: [
    "A crank at the top rocks the lever to and fro. The lever swings about the pin above the wheel, and the curved plate on it swings too. A pawl hangs from each end of the plate, with its tip resting on the teeth.",
    "As the lever swings one way, one pawl pushes against the steep face of a tooth and drives the wheel round. The other pawl slides up the long slope of the teeth and drops into the next gap. When the lever swings back, the two swap jobs. So the wheel is driven on the way up and on the way down.",
    "Try the three lever swings. With a small swing each pawl only just reaches the next tooth, so the wheel creeps. With a big swing it jumps several teeth on every swing. Watch which pawl is pushing each time."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the pawls as teeth on the ends of the curved plate and shows only a piece of the lever. Here each pawl is a short arm hinged to the plate, so it can lift over the teeth. The crank, rod, back plate, base, pins, tooth count and sizes were made up.",

  init: function () {
    var rad = Math.PI / 180, K = this.K = Object.assign({ N: 56, R: 100, d: 5, m: 1, Q: [0, 142], RP: 122, A: [144, 42], DEL: 16, arm: [46, 18], LR: 80 }, this.over || {});
    K.st = 2 * Math.PI / K.N;
    K.E0 = [K.Q[0] + K.arm[0], K.Q[1] + K.arm[1]]; K.C = [K.E0[0], K.E0[1] + K.LR];
    K.pw = K.A.map(function (pa) {
      var na = pa - K.m * K.DEL, P = [K.RP * Math.cos(pa * rad), K.RP * Math.sin(pa * rad)], Nn = [K.R * Math.cos(na * rad), K.R * Math.sin(na * rad)];
      return { p: P, L: Math.hypot(P[0] - Nn[0], P[1] - Nn[1]), nose: na * rad };
    });
    var o = this.o = { g: 0, phi: 0, th: 0, k: [0, 0], psi: [0, 0], th0: 0, rho: 4 };
    this.sol();
    for (var i = 0; i < 2; i++) { var P = this.pivot(i, 0), pw = K.pw[i], dd = Math.hypot(P[0], P[1]), bp = Math.atan2(P[1], P[0]), rr = K.R - K.d / 2;
      var g = Math.acos((dd * dd + rr * rr - pw.L * pw.L) / (2 * dd * rr)), c1 = bp + g, c2 = bp - g;
      var pick = Math.abs(this.wrap(c1 - pw.nose)) < Math.abs(this.wrap(c2 - pw.nose)) ? c1 : c2;
      o.k[i] = Math.floor((K.m * pick - o.th) / K.st); }
    this.settle(0); o.th0 = o.th;
    for (i = 0; i < 2; i++) o.psi[i] = this.aim(i);
  },
  sol: function () {},
  wrap: function (a) { while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI; return a; },
  pivot: function (i, phi) {
    var K = this.K, p = K.pw[i].p, c = Math.cos(phi), s = Math.sin(phi), dx = p[0] - K.Q[0], dy = p[1] - K.Q[1];
    return [K.Q[0] + c * dx - s * dy, K.Q[1] + s * dx + c * dy];
  },
  // distance from nose to pivot, minus the pawl length, for a nose resting on tooth k at wheel angle a (mirrored frame: the wheel always turns the way the teeth are cut)
  dist: function (i, P, k, a) {
    var K = this.K, rho = K.R - K.d + K.d * (a - k * K.st) / K.st, al = K.m * (a + this.o.th), x = rho * Math.cos(al) - P[0], y = rho * Math.sin(al) - P[1];
    return Math.sqrt(x * x + y * y) - K.pw[i].L;
  },
  // wheel angle that puts the nose at the root of the steep face at lo
  pushTo: function (i, P, lo) {
    var K = this.K, o = this.o, rho = K.R - K.d, dd = Math.hypot(P[0], P[1]), bp = Math.atan2(P[1], P[0]), L = K.pw[i].L;
    var cg = (dd * dd + rho * rho - L * L) / (2 * dd * rho); if (cg > 1 || cg < -1) return null;
    var g = Math.acos(cg), cur = K.m * (lo + o.th), best = null;
    [bp + g, bp - g].forEach(function (al, j) { var dl = this.wrap(al - cur); if (best === null || Math.abs(dl) < Math.abs(best)) best = dl; }, this);
    return o.th + K.m * best;
  },
  // where pawl i's nose is now: {push: it is pushing on a steep face, th: wheel angle needed, a: nose angle on the wheel}
  eval1: function (i, P) {
    var K = this.K, o = this.o, k = o.k[i], g, lo, hi, Dlo, Dhi, j;
    for (g = 0; g < 12; g++) {
      lo = k * K.st; hi = lo + K.st; Dlo = this.dist(i, P, k, lo); Dhi = this.dist(i, P, k, hi);
      if (Dlo * Dhi <= 0) {
        var a0 = lo, a1 = hi;
        for (j = 0; j < 40; j++) { var mid = (a0 + a1) / 2; if ((this.dist(i, P, k, mid) > 0) === (Dlo > 0)) a0 = mid; else a1 = mid; }
        o.k[i] = k; return { push: false, a: (a0 + a1) / 2 };
      }
      var below = Dhi > Dlo ? Dlo > 0 : Dlo < 0;
      if (below) { o.k[i] = k; return { push: true, th: this.pushTo(i, P, lo), a: lo }; }
      k++;
    }
    o.k[i] = k; return { push: false, a: k * K.st };
  },
  settle: function (phi) {
    var o = this.o, i, it, r, P; o.phi = phi;
    for (it = 0; it < 4; it++) {
      var moved = false;
      for (i = 0; i < 2; i++) { P = this.pivot(i, phi); r = this.eval1(i, P); if (r.push && r.th !== null && r.th < o.th - 1e-12) { o.th = r.th; moved = true; } }
      if (!moved) break;
    }
    for (i = 0; i < 2; i++) o.res = (o.res || []), o.res[i] = this.eval1(i, this.pivot(i, phi));
  },
  noseAt: function (i, psi, P) { var L = this.K.pw[i].L; return [P[0] + L * Math.cos(psi), P[1] + L * Math.sin(psi)]; },
  aim: function (i) {                                                       // direction from pivot to nose at the present state
    var K = this.K, o = this.o, a = o.res[i].a, rho = K.R - K.d + K.d * (a / K.st - Math.floor(a / K.st + 1e-12)), al = K.m * (a + o.th), P = this.pivot(i, o.phi);
    return Math.atan2(rho * Math.sin(al) - P[1], rho * Math.cos(al) - P[0]);
  },
  lever: function () {                                                      // crank angle g -> lever angle: the rod has a fixed length
    var K = this.K, o = this.o, px = K.C[0] + o.rho * Math.cos(o.g), py = K.C[1] + o.rho * Math.sin(o.g), phi = o.phi, i;
    for (i = 0; i < 8; i++) {
      var c = Math.cos(phi), s = Math.sin(phi), ex = K.Q[0] + c * K.arm[0] - s * K.arm[1], ey = K.Q[1] + s * K.arm[0] + c * K.arm[1];
      var dx = ex - px, dy = ey - py, f = dx * dx + dy * dy - K.LR * K.LR, df = 2 * (dx * (-s * K.arm[0] - c * K.arm[1]) + dy * (c * K.arm[0] - s * K.arm[1]));
      if (Math.abs(df) < 1e-9) break; phi -= f / df;
    }
    this.px = px; this.py = py; return phi;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    this.init();
    var K = this.K, o = this.o, i;
    // Layers along z: back plate -22..-16; lever plate, crank disc and spacer -14..-8 (spacer -16..-8); wheel -5..5; pawls -7..7 (hubs -8..8); rod -7..-4.
    P.at(P.box(300, 460, 6, c.fixed), 0, 100, -19, scene);                  // back plate x -150..150, y -130..330, z -22..-16
    P.at(P.box(340, 12, 120, c.fixed), 0, -136, -40, scene);                // base x -170..170, y -142..-130, z -100..20; plate stands on y -130
    o.wheel = P.ratchet({ teeth: K.N, radius: K.R, depth: K.d, width: 10, reverse: K.m < 0, material: c.mat("wheel") });
    scene.add(o.wheel);                                                     // z -5..5
    P.at(P.cylZ(14, 11, c.mat("wheel", "dark")), 0, 0, -10.5, scene);      // spacer z -16..-5, from the plate face to the wheel
    P.at(P.cylZ(7, 28, c.mat("wheel", "dark")), 0, 0, -2, scene);           // shaft z -16..12
    P.at(P.cylZ(25, 2, c.mat("wheel", "light")), 0, 0, 6, o.wheel);         // hub ring z 5..7 on the wheel face
    var mk = new T.Group(); o.wheel.add(mk);
    P.at(P.box(26, 4, 1, c.mat("wheel", "mark")), K.R - K.d - 16, 0, 6, mk);   // red mark x 71..97, z 5.5..6.5 lifted off the wheel face at 5
    // lever
    o.lever = new T.Group(); o.lever.position.set(K.Q[0], K.Q[1], 0); scene.add(o.lever);
    var ml = c.mat("lever"), rad = Math.PI / 180, sh = new T.Shape(), a0 = 160 * rad, a1 = 26 * rad, R0 = 114, R1 = 130, qx = K.Q[0], qy = K.Q[1];
    sh.absarc(-qx, -qy, R1, a1, a0, false); sh.absarc(-qx, -qy, R0, a0, a1, true); sh.closePath();   // curved plate, radii 114..130 about the wheel centre
    var pg = new T.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false, curveSegments: 40 });
    var plate = new T.Mesh(pg, ml); plate.position.z = -14; o.lever.add(plate);   // plate z -14..-8
    P.at(P.box(10, 24, 6, ml), 0, -12, -11, o.lever);                       // bridge from the plate to the pin: y 118..142, z -14..-8
    var ang = Math.atan2(K.arm[1], K.arm[0]), al = Math.hypot(K.arm[0], K.arm[1]);
    var armB = P.box(al, 8, 6, ml); armB.position.set(K.arm[0] / 2, K.arm[1] / 2, -11); armB.rotation.z = ang; o.lever.add(armB);   // arm z -14..-8
    P.at(P.cylZ(11, 6, ml), 0, 0, -11, o.lever);                             // boss at the pin z -14..-8
    P.at(P.cylZ(9, 6, ml), K.arm[0], K.arm[1], -11, o.lever);               // boss at the rod end z -14..-8
    P.at(P.cylZ(5, 10, c.mat("lever", "dark")), qx, qy, -11, scene);        // fixed pin z -16..-6, from the back plate face
    P.at(P.cylZ(7, 1.5, c.mat("lever", "dark")), qx, qy, -7.25, scene);     // pin head z -8..-6.5
    for (i = 0; i < 2; i++) {                                                // pawl pins through the plate into the pawl hub, z -13.5..0
      var p = K.pw[i].p; P.at(P.cylZ(3.5, 13.5, c.mat("lever", "dark")), p[0] - qx, p[1] - qy, -6.75, o.lever);
    }
    // pawls
    o.pawl = [];
    for (i = 0; i < 2; i++) {
      var Pv = this.pivot(i, 0), psi = o.psi[i], ux = Math.cos(psi), uy = Math.sin(psi), cr = ux * (-Pv[1]) - uy * (-Pv[0]);
      var pw = P.pawl({ length: K.pw[i].L, thick: 6, width: 14, side: cr > 0 ? -1 : 1, material: c.mat("pawls") });
      pw.position.set(Pv[0], Pv[1], 0); scene.add(pw); o.pawl.push(pw);
    }
    // crank and rod
    var mr = c.mat("crank"); o.crank = new T.Group(); o.crank.position.set(K.C[0], K.C[1], 0); scene.add(o.crank);
    P.at(P.cylZ(6, 2, mr), 0, 0, -15, o.crank);                             // axle z -16..-14, from the plate face to the disc
    P.at(P.cylZ(8, 6, mr), 0, 0, -11, o.crank); P.at(P.box(18, 7, 6, mr), 5.0, 0, -11, o.crank);                            // disc z -14..-8
    o.pin = P.cylZ(3.5, 10, c.mat("crank", "dark")); o.pin.position.z = -8; o.crank.add(o.pin);   // pin z -13..-3
    o.rod = P.rod(2, mr); scene.add(o.rod);
    o.eye1 = P.at(P.cylZ(6, 3, mr), 0, 0, -5.5, scene);                     // eyes z -7..-4
    o.eye2 = P.at(P.cylZ(6, 3, mr), 0, 0, -5.5, scene);
    o.rodpin = P.at(P.cylZ(3.5, 10, c.mat("crank", "dark")), 0, 0, -8, scene);   // rod pin z -13..-3 through the lever boss (-14..-8) and the eye
    this.place(0);
  },

  place: function (dt) {
    var K = this.K, o = this.o, i;
    o.wheel.rotation.z = K.m * o.th;
    o.lever.rotation.z = o.phi;
    for (i = 0; i < 2; i++) {
      var P = this.pivot(i, o.phi), tgt = this.aim(i), cur = o.psi[i];
      var rt = Math.hypot.apply(null, this.noseAt(i, tgt, P)), rc = Math.hypot.apply(null, this.noseAt(i, cur, P));
      if (rc > rt + .05) { var df = this.wrap(tgt - cur), mx = 14 * dt; o.psi[i] = Math.abs(df) > mx ? cur + (df > 0 ? mx : -mx) : tgt; } else o.psi[i] = tgt;   // it falls into a gap quickly but not instantly
      o.pawl[i].position.set(P[0], P[1], 0); o.pawl[i].rotation.z = o.psi[i];
    }
    o.crank.rotation.z = o.g;
    var c = Math.cos(o.phi), s = Math.sin(o.phi), ex = K.Q[0] + c * K.arm[0] - s * K.arm[1], ey = K.Q[1] + s * K.arm[0] + c * K.arm[1];
    o.rod.span(this.px, this.py, -5.5, ex, ey, -5.5);
    o.eye1.position.set(this.px, this.py, -5.5); o.eye2.position.set(ex, ey, -5.5); o.rodpin.position.set(ex, ey, -8);
    o.pin.position.x = o.rho;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, want = +S.controls.swing || 4, n = Math.max(1, Math.ceil(Math.abs(S.w * dt) / .02)), i;
    o.rho = want;
    for (i = 0; i < n; i++) { o.g += S.w * dt / n; this.settle(this.lever()); }
    if (dt === 0) this.settle(this.lever());
    this.place(dt);
    var t = (o.th0 - o.th) / (2 * Math.PI), d = Math.round(o.phi * 180 / Math.PI);
    S.set("turns", t.toFixed(2) + " turns");
    S.set("lever", (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d) + "°");
  }
});
