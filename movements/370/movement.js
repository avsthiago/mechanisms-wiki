M507.define({
  number: 370,
  title: "Mirror polishing motion",
  lede: "A machine that rubs a mirror over a polishing bed in an ever-changing pattern. A crank swings a long bar, and the mirror rides on the bar. A pawl, a small hook that pushes one tooth, turns the mirror a little at every turn, so no two strokes rub the same way.",
  alt: "Seen from above: a crank under a fixed upper rail swings the top of a long bar, whose lower end slides between two pins on a lower rail. Under the bar a toothed ratchet wheel carries a square mirror lying on a pale polishing bed. A lever and pawl beside the wheel are worked by a rod from a disc on the crank shaft. A dark line on the bed shows the path of a red spot on the mirror.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank and handle", note: "Turned by the handle on top. Underneath, one arm drives the bar and an off-centre disc, called an eccentric, works the pawl." },
    { key: "bar", color: "#D9B13B", name: "Long bar", note: "Its top is pinned to the crank. Its lower end slides between two pins, so the bar both slides and swings." },
    { key: "ratchet", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with saw teeth on a stud under the bar. The mirror is fixed to it." },
    { key: "click", color: "#8E7AA8", name: "Pawl and lever", note: "A lever with a pawl, worked by a rod from the eccentric. Once each turn the pawl pushes the wheel on by one tooth." },
    { key: "mirror", color: "#4FA58A", name: "Mirror", note: "Lies face down on the polishing bed. Watch the red spot: its path is drawn on the bed." },
    { key: "bed", color: "#E8E2D0", name: "Polishing bed", note: "A flat bed covered with cloth and polishing powder. It stays still while the mirror rubs over it." }
  ],
  controls: [{ id: "teeth", label: "Teeth on the wheel", value: "16", options: [["12", "12"], ["16", "16"], ["20", "20"]] }],
  readouts: [{ id: "n", label: "Strokes" }, { id: "turn", label: "Mirror turned" }],
  views: { "3d": [40, 800, 290], top: [0, 900, 81], side: [820, 260, 80] },
  target: [0, 20, 65],
  how: [
    "Turn the handle and the top of the bar goes round in a circle. The lower end can only slide between the two pins. So the bar slides back and forth and swings from side to side at the same time, and the mirror scrubs over the bed in a long loop.",
    "If that were all, the mirror would follow the same loop for ever. But the eccentric pulls the pawl lever back and forth once each turn. On each push the pawl moves the ratchet wheel on by one tooth. The mirror turns with it, so the next loop rubs at a new angle.",
    "Watch the line on the bed fill in round the middle. Try 12 teeth, then 20. Fewer teeth means a bigger turn each stroke, so the pattern comes round sooner."
  ],
  note: "This model is rebuilt from Brown's drawing. The posts under the rails, the polishing bed, the sizes and the number of teeth were made up. The eccentric is drawn big, with its centre close to the crank pin, so the click swings just over one tooth. The pins leave the bar a little play, and the bar is shown centred between them. Nothing holds the wheel between pushes except the rub of the mirror on the bed.",

  makeKin: function () {
    var K = { C: [-12.5, -77.5], r: 44, G: [13, 150], D: 165, rho: 14, l: 46, ang0: 1.57, a0: Math.atan2(-47.5, -17.5) };
    K.state = function (al, Eprev, Lr) {
      var C = K.C, r = K.r, Pc = [C[0] + r * Math.cos(al), C[1] + r * Math.sin(al)], gx = K.G[0] - Pc[0], gz = K.G[1] - Pc[1], L = Math.hypot(gx, gz);
      var u = [gx / L, gz / L], s = { al: al, Pc: Pc, u: u, b: Math.atan2(u[1], u[0]), L: L };
      s.W = [Pc[0] + K.D * u[0], Pc[1] + K.D * u[1]];
      s.Q = [C[0] + (r - K.rho) * Math.cos(al), C[1] + (r - K.rho) * Math.sin(al)];    // eccentric's centre, on the crank's line
      if (Lr) {                                                                          // lever tip: l from the wheel's centre and Lr from the eccentric's
        var dx = s.Q[0] - s.W[0], dz = s.Q[1] - s.W[1], d = Math.hypot(dx, dz), a = (K.l * K.l - Lr * Lr + d * d) / (2 * d), h = Math.sqrt(Math.max(0, K.l * K.l - a * a));
        var mx = s.W[0] + a * dx / d, mz = s.W[1] + a * dz / d, E1 = [mx + h * dz / d, mz - h * dx / d], E2 = [mx - h * dz / d, mz + h * dx / d];
        s.E = Math.hypot(E1[0] - Eprev[0], E1[1] - Eprev[1]) < Math.hypot(E2[0] - Eprev[0], E2[1] - Eprev[1]) ? E1 : E2;
      }
      return s;
    };
    var s0 = K.state(K.a0), ub = Math.atan2(-s0.u[1], -s0.u[0]);
    var c1 = [ub + K.ang0, ub - K.ang0].map(function (t) { return [s0.W[0] + K.l * Math.cos(t), s0.W[1] + K.l * Math.sin(t)]; });
    K.E0 = c1[0][0] < c1[1][0] ? c1[0] : c1[1];                                         // lever starts square to the bar, on its left
    K.Lr = Math.hypot(K.E0[0] - s0.Q[0], K.E0[1] - s0.Q[1]);
    return K;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.makeKin(), HP = Math.PI / 2, i;
    var o = this.o = { K: K, teeth: null, wheels: {} };
    function boxE(x0, x1, y0, y1, z0, z1, m, par) { return P.at(P.box(x1 - x0, y1 - y0, z1 - z0, m), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, par || scene); }
    var mc = c.mat("crank");
    // ---- crank group at the shaft; local +X is the crank's direction
    o.crank = new T.Group(); o.crank.position.set(K.C[0], 0, K.C[1]); scene.add(o.crank);
    P.at(P.cylY(5, 38, mc), 0, 55, 0, o.crank);                                  // shaft y 36..74, through the upper rail's bore (y 48..68)
    boxE(-6, K.r + 6, 36, 41, -6, 6, mc, o.crank);                               // crank arm y 36..41
    P.at(P.cylY(4, 1.5, mc), K.r, 36.25, 0, o.crank);                                  // crank pin y 34..36, down to the bar's top
    P.at(P.cylY(38, 6, mc), K.r - K.rho, 44, 0, o.crank);                         // eccentric y 41..47, round the shaft (centre 30 out, radius 38)
    boxE(-61, 6, 68, 74, -6, 6, mc, o.crank);                                     // handle arm y 68..74, above the rail, pointing the other way
    P.at(P.cylY(4, 8, mc), -55, 78, 0, o.crank);                                  // handle pin y 74..82
    P.at(P.cylY(6, 16, c.mat("crank", "dark")), -55, 90, 0, o.crank);             // grip y 82..98
    // ---- long bar, local +X along the bar from the crank pin
    o.bar = new T.Group(); scene.add(o.bar);
    boxE(-15, 290, 26, 34, -20, 20, c.mat("bar"), o.bar);                         // y 26..34, rests on the lower rail's top (y 26); 40 wide
    P.at(P.cylY(6, 1, c.mat("bar", "dark")), 0, 34.5, 0, o.bar);                  // boss on the bar's top under the crank pin, y 34..35
    // ---- ratchet wheel, stud and mirror: one group at the wheel's centre
    o.rg = new T.Group(); scene.add(o.rg);
    [12, 16, 20].forEach(function (n) {
      var w = P.ratchet({ teeth: n, radius: 38, depth: 7, width: 8, material: c.mat("ratchet") });
      w.rotation.x = -HP; w.position.y = 9; o.rg.add(w); o.wheels[n] = w;      // y 5..13, faces at world angle (wheel angle) - k * pitch
    });
    P.at(P.cylY(6, 13, c.mat("ratchet")), 0, 19.5, 0, o.rg);                      // stud y 13..26, up to the bar's underside
    o.mirror = P.at(P.box(92, 5, 92, c.mat("mirror")), 0, 2.5, 0, o.rg);          // y 0..5, face down on the bed
    o.spot = P.at(P.cylY(4, 1, c.mat("mirror", "mark")), 36.8, 6, 36.8, o.rg);    // red spot y 5.5..6.5, clear of the wheel (radius 52)
    // ---- click: lever on the stud, pin at its tip, pawl at wheel height, rod and strap from the eccentric
    var mk = c.mat("click");
    o.lever = new T.Group(); scene.add(o.lever);
    boxE(0, K.l, 13.5, 15.5, -5, 5, mk, o.lever);                                 // lever plate y 13.5..15.5, between the wheel (13) and the bar (26)
    P.at(P.cylY(9, 2, mk), 0, 14.5, 0, o.lever);                                  // hub round the stud
    P.at(P.cylY(3, 41, mk), K.l, 26.5, 0, o.lever);                               // pin y 6..47, outside the bar's edge
    o.pawlLen = 26;
    o.pawlG = new T.Group(); scene.add(o.pawlG);
    o.pawlIn = new T.Group(); o.pawlIn.rotation.x = -HP; o.pawlIn.position.y = 9.5; o.pawlG.add(o.pawlIn);
    o.pawls = {};
    [1, -1].forEach(function (sd) { var p = P.pawl({ length: o.pawlLen, thick: 6, width: 7, side: sd, material: mk }); o.pawlIn.add(p); o.pawls[sd] = p; });
    o.strap = P.at(P.hoop(41, 3, mk), 0, 44, 0, scene); o.strap.rotation.x = HP;  // strap round the eccentric, y 41..47
    o.rod = P.at(P.rod(3, mk), 0, 0, 0, scene);
    // ---- the path of the red spot, drawn on the bed as a flat ribbon at y .6
    o.MAXP = 9000;
    var pos = new Float32Array(o.MAXP * 12), idx = [];
    for (i = 0; i < o.MAXP; i++) idx.push(4 * i, 4 * i + 1, 4 * i + 2, 4 * i + 1, 4 * i + 3, 4 * i + 2);
    o.trace = new T.BufferGeometry(); o.trace.setAttribute("position", new T.BufferAttribute(pos, 3)); o.trace.setIndex(idx);
    o.trace.setDrawRange(0, 0);
    var tm = new T.Mesh(o.trace, c.mat("bed", "dark")); tm.material.side = T.DoubleSide; tm.frustumCulled = false; tm.userData.live = true; scene.add(tm);
    // ---- bed, rails and supports
    boxE(-120, 120, -10, 0, -40, 215, c.mat("bed"));                              // polishing bed y -10..0
    boxE(-175, 175, -20, -10, -110, 290, c.fixed);                                // base y -20..-10
    boxE(-165, 165, 16, 26, 142, 158, c.fixed);                                   // lower rail y 16..26; the wheel and mirror pass under it
    [-1, 1].forEach(function (sx) {
      boxE(sx > 0 ? 153 : -165, sx > 0 ? 165 : -153, -10, 16, 142, 158, c.fixed); // posts under the lower rail, on the base
      boxE(sx > 0 ? 153 : -165, sx > 0 ? 165 : -153, -10, 48, -98.5, -56.5, c.fixed);   // posts under the upper rail
    });
    [K.G[0] - 27, K.G[0] + 27].forEach(function (x) { P.at(P.cylY(5, 12, c.fixed), x, 32, K.G[1], scene); });   // guide pins y 26..38 on the rail
    var rail = P.guideBlock({ w: 330, h: 20, d: 42, hole: 5.5, hx: K.C[0], material: c.fixed });
    P.at(rail, 0, 58, K.C[1], scene);                                             // upper rail x -165..165, y 48..68, z -98.5..-56.5
  },

  opacity: function (key) { return key === "mirror" ? .7 : 1; },

  reset: function (o, n) {
    var K = o.K;
    o.teeth = n; o.al = K.a0; o.E = K.E0.slice(); o.np = 0; o.last = null;
    var s = K.state(o.al, o.E, K.Lr);
    o.lam = Math.atan2(s.E[1] - s.W[1], s.E[0] - s.W[0]) - s.b;
    var E = o.E.slice(), xm = -1e9, j;                                            // start with a tooth face where the pawl's first push ends
    for (j = 0; j <= 360; j++) {
      var q = K.state(o.al + 2 * Math.PI * j / 360, E, K.Lr), l2 = Math.atan2(q.E[1] - q.W[1], q.E[0] - q.W[0]) - q.b; E = q.E;
      l2 += 2 * Math.PI * Math.round((o.lam - l2) / (2 * Math.PI)); xm = Math.max(xm, l2);
    }
    o.R = xm + this.reachMid(o) - o.wheels[n].pitch;
    o.R0 = o.R; o.trace.setDrawRange(0, 0);
  },
  reachMid: function (o) { return o.pawls[1].reach(o.K.l, 38 - 3.5); },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, n = +S.controls.teeth || 16, w = o.wheels[n], p = w.pitch, k;
    if (o.teeth !== n) this.reset(o, n);
    for (k in o.wheels) o.wheels[k].visible = +k === n;
    o.al += S.w * dt;
    var s = K.state(o.al, o.E, K.Lr); o.E = s.E;
    // lever angle relative to the bar, kept continuous
    var lam = Math.atan2(s.E[1] - s.W[1], s.E[0] - s.W[0]) - s.b;
    lam += 2 * Math.PI * Math.round((o.lam - lam) / (2 * Math.PI));
    var rm = this.reachMid(o), x0 = o.lam + rm, x1 = lam + rm;
    if (x1 > x0) { var f = o.R + p * Math.ceil((x0 - o.R) / p - 1e-6); if (x1 > f) o.R += x1 - f; }   // pawl going forward pushes the face ahead of it
    o.lam = lam;
    // place everything
    o.crank.rotation.y = -o.al;
    o.bar.position.set(s.Pc[0], 0, s.Pc[1]); o.bar.rotation.y = -s.b;
    o.rg.position.set(s.W[0], 0, s.W[1]); o.rg.rotation.y = -(s.b + o.R);         // wheel faces at bar angle + R - k pitch
    o.lever.position.set(s.W[0], 0, s.W[1]); o.lever.rotation.y = -(s.b + lam);
    // pawl: from the lever's pin to the rim, nose just ahead of the pin
    var muE = s.b + lam, rim = 38 - 3.5, nose = 0;
    for (k = 0; k < 2; k++) { nose = muE + o.pawls[1].reach(K.l, rim); rim = w.rimAt(o.R + s.b - nose) + .4; }
    nose = muE + o.pawls[1].reach(K.l, rim);
    var Nx = s.W[0] + rim * Math.cos(nose), Nz = s.W[1] + rim * Math.sin(nose), md = Math.atan2(Nz - s.E[1], Nx - s.E[0]);
    var HP = Math.PI / 2, side = Math.cos(md - HP) * (s.W[0] - s.E[0]) + Math.sin(md - HP) * (s.W[1] - s.E[1]) > 0 ? -1 : 1;
    o.pawls[1].visible = side === 1; o.pawls[-1].visible = side === -1;
    var L = Math.hypot(Nx - s.E[0], Nz - s.E[1]);
    o.pawlG.position.set(s.E[0], 0, s.E[1]); o.pawlG.rotation.y = -md; o.pawlIn.scale.x = L / o.pawlLen;
    // eccentric strap and rod
    o.strap.position.set(s.Q[0], 44, s.Q[1]);
    var qx = s.E[0] - s.Q[0], qz = s.E[1] - s.Q[1], ql = Math.hypot(qx, qz);
    o.rod.span(s.Q[0] + 41 * qx / ql, 44, s.Q[1] + 41 * qz / ql, s.E[0], 44, s.E[1]);
    // the red spot's path
    var a = s.b + o.R, sx = s.W[0] + 36.8 * Math.cos(a) - 36.8 * Math.sin(a), sz = s.W[1] + 36.8 * Math.sin(a) + 36.8 * Math.cos(a);
    if (!o.last) o.last = [sx, sz];
    var dx = sx - o.last[0], dz = sz - o.last[1], dl = Math.hypot(dx, dz);
    if (dl > 1.5 && o.np < o.MAXP) {
      var nx = -dz / dl * .9, nz = dx / dl * .9, arr = o.trace.attributes.position.array, j = o.np * 12;
      arr.set([o.last[0] + nx, .6, o.last[1] + nz, o.last[0] - nx, .6, o.last[1] - nz, sx + nx, .6, sz + nz, sx - nx, .6, sz - nz], j);
      o.np++; o.last = [sx, sz];
      o.trace.attributes.position.needsUpdate = true; o.trace.setDrawRange(0, o.np * 6);
    }
    S.set("n", Math.floor((o.al - K.a0) / (2 * Math.PI)) + "");
    S.set("turn", Math.round(((o.R - o.R0) * 180 / Math.PI) % 360) + "°");
  }
});
