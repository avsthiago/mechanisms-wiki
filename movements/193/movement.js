M507.define({
  number: 193,
  title: "Mangle wheel with two speeds",
  lede: "A small gear turns steadily one way, yet the big wheel turns almost a whole turn one way and then almost a whole turn back. It goes back faster than it goes forward. Machines used this to move a table or a roller to and fro.",
  alt: "A big upright wheel. On its face, a ring of teeth facing inward and a smaller ring of teeth round the middle, joined at the top so the gap between them is shaped like a horseshoe. A small gear sits in the gap at the bottom. Its shaft runs forward through a sliding crossbar and two jointed couplings to a crank off to one side.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear. It always turns the same way. A short pin on its back runs in the groove, so its teeth always stay in the teeth of the wheel." },
    { key: "wheel", color: "#C8873A", name: "Mangle wheel", note: "The big wheel. On its face are a big ring with its teeth facing in and a small ring with its teeth facing out, joined at the top. The loop-shaped groove between them guides the pin behind the pinion. Watch the red tooth to follow the wheel." },
    { key: "bar", color: "#4FA58A", name: "Guide", note: "A crossbar on the pinion's shaft. It slides up and down between two fixed uprights, so the pinion can move in and out but always stays square to the wheel." },
    { key: "link", color: "#8E7AA8", name: "Swinging shaft", note: "A short shaft with a universal joint at each end. A universal joint is a hinge that bends both ways and still passes on the turning. It tilts up and down as the pinion rises and falls." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns everything. Its shaft stays put in its bearing. In a real machine an engine would do this." }
  ],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "ang", label: "Wheel angle" }, { id: "out", label: "Wheel speed" }],
  views: { "3d": [400, 120, 1000], front: [0, -20, 1150], side: [960, -20, 60] },
  target: [0, -20, 60],
  how: [
    "Turn the crank and the small gear, called a pinion, turns with it. In the picture it runs along the inside of the big ring of teeth. It pushes the wheel round the same way it turns itself.",
    "At the end of the gap the pinion rolls round the bend and onto the small ring. Now it pushes on the outside of the teeth, so the wheel turns back. The small ring is much smaller, so each turn of the pinion moves the wheel further. The wheel goes back faster than it went forward. The pinion's shaft rides up and down in the guide, and its joints let it tilt to follow.",
    "Watch the wheel speed readout. A minus sign means the wheel turns the other way. Compare how long each trip takes."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the guide, the jointed shaft, the post, the base, the sizes and the number of teeth were made up. Brown says the shaft has a universal joint; here it has two, so the pinion stays square to the wheel and turns at the same speed as the crank.",

  // Sizes. Module 6, pinion 11 teeth. The gap between the rings is a channel whose edge is the pitch outline: the big ring
  // (radius RO), a half circle round one end (radius H), the small ring (radius RI) and a half circle round the other end.
  // The channel is centred on the bottom and spans the angle B, chosen so the outline holds a whole number of teeth N.
  dims: (function () {
    var D = { MD: 6, NP: 11, RO: 180, RI: 72, N: 83, RW: 222 };
    D.RP = D.MD * D.NP / 2; D.H = (D.RO - D.RI) / 2; D.RM = (D.RO + D.RI) / 2;
    D.B = (D.N * D.MD * Math.PI - 2 * Math.PI * D.H) / (D.RO + D.RI);
    return D;
  })(),

  /** Point of the pitch outline at arc length s, going clockwise round the channel so the channel (and the pinion) is on
      the right: {x, y, psi (direction of travel, unwrapped), L}. Starts at the right-hand end of the big ring. */
  outline: function (s) {
    var D = this.dims, B = D.B, gS = -Math.PI / 2 + B / 2, gE = -Math.PI / 2 - B / 2, L1 = D.RO * B, L2 = Math.PI * D.H, L3 = D.RI * B, L = L1 + 2 * L2 + L3, g, a;
    if (s < L1) { g = gS - s / D.RO; return { x: D.RO * Math.cos(g), y: D.RO * Math.sin(g), psi: g - Math.PI / 2, L: L }; }
    s -= L1;
    if (s < L2) { a = gE - s / D.H; return { x: D.RM * Math.cos(gE) + D.H * Math.cos(a), y: D.RM * Math.sin(gE) + D.H * Math.sin(a), psi: a - Math.PI / 2, L: L }; }
    s -= L2;
    if (s < L3) { g = gE + s / D.RI; return { x: D.RI * Math.cos(g), y: D.RI * Math.sin(g), psi: g + Math.PI / 2 - 2 * Math.PI, L: L }; }
    s = Math.min(s - L3, L2); a = gS + Math.PI - s / D.H;
    return { x: D.RM * Math.cos(gS) + D.H * Math.cos(a), y: D.RM * Math.sin(gS) + D.H * Math.sin(a), psi: a - 2.5 * Math.PI, L: L };
  },
  /** The pitch outline as M + 1 samples {x, y, psi, s}, the last one closing the loop, and i0, the sample of the
      drawing's pose (pinion at the bottom of the big ring). */
  samples: function () {
    var M = 8000, L = this.outline(0).L, smp = [], i, p;
    for (i = 0; i <= M; i++) { p = this.outline(L * i / M); p.s = L * i / M; smp.push(p); }
    return { smp: smp, i0: Math.round(this.dims.RO * this.dims.B / 2 / L * M), L: L };
  },

  /** Kinematics. The pinion's centre is held on the line x = 0 below the wheel's shaft and sits one pinion radius to the
      right of the outline (n = (sin psi, -cos psi)). For the contact at arc length s the centre lies at angle al(s) on the
      wheel, so the wheel has turned th = -pi/2 - al. Rolling without slip gives the pinion's own turn
      u = th - th0 + s / RP + psi - psi0. Returns th and the centre's depth d at K even steps of u over one trip U,
      the centre path on the wheel (for the groove), the u of the drawing's pose, and the pinion's turn at u = 0. */
  kin: function () {
    var D = this.dims, sm = this.samples(), M = sm.smp.length - 1, K = 4000, i, p, x, y, al, prev, u = [], th = [], d = [], cx = [], cy = [], th0, psi0, ps = [];
    for (i = 0; i <= M; i++) {
      p = sm.smp[i];
      x = p.x + D.RP * Math.sin(p.psi); y = p.y - D.RP * Math.cos(p.psi);
      al = Math.atan2(y, x);
      if (i) { while (al - prev > Math.PI) al -= 2 * Math.PI; while (al - prev < -Math.PI) al += 2 * Math.PI; }
      prev = al;
      var t = -Math.PI / 2 - al;
      if (!i) { th0 = t; psi0 = p.psi; }
      th.push(t); d.push(Math.sqrt(x * x + y * y)); u.push(t - th0 + p.s / D.RP + p.psi - psi0); cx.push(x); cy.push(y); ps.push(p.psi);
    }
    var off = 2 * Math.PI * Math.round(th[sm.i0] / (2 * Math.PI));   // whole turns, so the drawing's pose reads 0
    for (i = 0; i <= M; i++) th[i] -= off;
    var U = u[M], T = new Float64Array(K + 1), Dd = new Float64Array(K + 1), j = 0;
    for (i = 0; i <= K; i++) {
      var uu = U * i / K;
      while (j < M - 1 && u[j + 1] < uu) j++;
      var f = (uu - u[j]) / (u[j + 1] - u[j]);
      T[i] = th[j] + (th[j + 1] - th[j]) * f; Dd[i] = d[j] + (d[j + 1] - d[j]) * f;
    }
    var i0 = sm.i0;
    // at u = 0 a tooth of the track is centred on the contact; the pinion turns so a gap faces it (tooth 0 of a spurGear is at angle 0)
    var rho0 = psi0 + Math.PI / 2 + th0 - Math.PI / D.NP;
    return { U: U, K: K, th: T, d: Dd, u: u, raw: { th: th, d: d, cx: cx, cy: cy, psi: ps }, start: u[i0], rho0: rho0, L: sm.L, M: M };
  },

  /** The pitch outline as points for noncircularGear (clockwise, so the teeth face into the channel). */
  trackPts: function () {
    var L = this.outline(0).L, pts = [], i, p;
    for (i = 0; i < 1200; i++) { p = this.outline(L * i / 1200); pts.push([p.x, p.y]); }
    return pts;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, self = this, i;
    var k = this.kin(), dmin = 1e9, dmax = 0;
    for (i = 0; i <= k.K; i++) { dmin = Math.min(dmin, k.d[i]); dmax = Math.max(dmax, k.d[i]); }
    var YC = Math.round((dmin + dmax) / 2), Z1 = 66, Z2 = 200, X2 = 70, YB = -250;
    var o = this.o = { a: 0, P: P, k: k, YC: YC, Z1: Z1, Z2: Z2, X2: X2, KAP: 0, v: [] };
    for (i = 0; i < 8; i++) o.v.push(new T.Vector3());

    // wheel, turning about z
    var g = o.wheel = new T.Group(), m = c.mat("wheel"); scene.add(g);
    function loop(off) {                                          // the pinion's centre path pushed `off` further along n
      var pts = [], n = 600, j, q;
      for (j = 0; j < n; j++) { q = Math.round(j * k.M / n); pts.push(new T.Vector2(k.raw.cx[q] + off * Math.sin(k.raw.psi[q]), k.raw.cy[q] - off * Math.cos(k.raw.psi[q]))); }
      return pts;
    }
    var la = loop(6), lb = loop(-6), area = function (a) { var s = 0; for (var j = 0; j < a.length; j++) { var p = a[j], q = a[(j + 1) % a.length]; s += p.x * q.y - q.x * p.y; } return Math.abs(s); };
    var outer = area(la) > area(lb) ? la : lb, inner = outer === la ? lb : la;   // groove 12 wide, its middle on the centre path
    P.at(P.cylZ(D.RW, 6, m), 0, 0, -7, g);                        // back disc z -10..-4
    var face = new T.Shape(); face.absarc(0, 0, D.RW, 0, 2 * Math.PI, false); face.holes.push(new T.Path(outer));
    var fg = new T.ExtrudeGeometry(face, { depth: 4, bevelEnabled: false, curveSegments: 72 }); fg.translate(0, 0, -4);
    g.add(new T.Mesh(fg, m));                                     // face layer z -4..0 with the groove cut through it
    var ig = new T.ExtrudeGeometry(new T.Shape(inner), { depth: 4, bevelEnabled: false }); ig.translate(0, 0, -4);
    g.add(new T.Mesh(ig, m));                                     // island inside the groove loop, z -4..0
    var fl = new T.Shape(outer); fl.holes.push(new T.Path(inner));
    var floor = new T.Mesh(new T.ShapeGeometry(fl), c.mat("wheel", "dark")); floor.position.z = -3.5; g.add(floor);   // groove floor, .5 above the back disc (z -4)
    // the rings' plate: a disc of radius RO + 16 with a notch at the top between the two bends, as in Brown's drawing.
    // The notch's sides stay at least 78 from the centres of the bends, whose teeth reach 61.5 from them.
    var PR = D.RO + 16, an = 10 * Math.PI / 180, plate = new T.Shape();
    plate.moveTo(PR * Math.cos(Math.PI / 2 - an), PR * Math.sin(Math.PI / 2 - an));
    plate.absarc(0, 0, PR, Math.PI / 2 - an, Math.PI / 2 + an, true); plate.lineTo(0, 100); plate.closePath();
    P.at(P.noncircularGear({ points: this.trackPts(), teeth: D.N, width: 14, plate: plate, bore: D.RI - 16, material: c.mat("wheel", "light") }), 0, 0, 7, g);   // rings z 0..14 on the face
    // one tooth marked red so the eye can follow the wheel: a thin block on the tooth's top face (z 14..15.5), along the tooth
    var sm = this.samples(), pt = sm.L / D.N, md = pt / Math.PI, sj = (Math.round(sm.smp[sm.i0].s / pt) + 3) * pt, q = sm.smp[0];
    sm.smp.forEach(function (r) { if (Math.abs(r.s - sj) < Math.abs(q.s - sj)) q = r; });
    var mk = P.at(P.box(1.9 * md, .26 * pt, 1.5, c.mat("wheel", "mark")), q.x - .1 * md * Math.sin(q.psi), q.y + .1 * md * Math.cos(q.psi), 14.75, g);
    mk.rotation.z = q.psi - Math.PI / 2;
    P.at(P.cylZ(20, 6, m), 0, 0, 3, g);                           // hub z 0..6, inside the small ring's bore (radius 56)
    P.at(P.cylZ(10, 8, c.mat("wheel", "dark")), 0, 0, 10, g);     // shaft end z 6..14, on the hub
    P.at(P.cylZ(9, 30, m), 0, 0, -25, g);                         // shaft z -40..-10, from the post's face to the back disc

    // pinion and its short shaft, kept square to the wheel by the guide. Gear z 1..15 (the teeth are z 0..14)
    o.pin = new T.Group(); scene.add(o.pin);
    o.rot = new T.Group(); o.pin.add(o.rot);
    var pm = c.mat("pinion");
    P.at(P.spurGear({ teeth: D.NP, module: D.MD, width: 14, material: pm }), 0, 0, 8, o.rot);   // z 1..15
    P.at(P.cylZ(4.5, 4, pm), 0, 0, -1, o.rot);                    // guide pin z -3..1 in the groove (12 wide; floor at z -3.5)
    P.at(P.cylZ(10, 3, pm), 0, 0, 16.5, o.rot);                   // hub z 15..18
    P.at(P.cylZ(5, Z1 - 20 - 18, pm), 0, 0, (18 + Z1 - 20) / 2, o.rot);   // shaft z 18..46, through the crossbar (z 24.5..31.5), to the fork
    var FK = { back: 20, reach: 8, half: 12, tube: 2.2 }, CX = { half: 12, head: 3, radius: 1.8, hub: 4 };
    var fp = P.hookeFork(Object.assign({ material: pm }, FK)); fp.position.z = Z1; o.rot.add(fp);
    P.frame(fp, new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0));  // fork z 46..74, its pin along local x of the pinion

    // swinging shaft between the two joints
    var lm = c.mat("link");
    o.f1 = P.hookeFork(Object.assign({ material: lm }, FK)); scene.add(o.f1);
    o.f2 = P.hookeFork(Object.assign({ material: lm }, FK)); scene.add(o.f2);
    o.c1 = P.hookeCross(Object.assign({ material: lm }, CX)); scene.add(o.c1);
    o.c2 = P.hookeCross(Object.assign({ material: lm }, CX)); scene.add(o.c2);
    o.rod = P.rod(4.5, lm); scene.add(o.rod);

    // crank and its fixed shaft, off to the side at the middle height of the pinion's travel
    var cm = c.mat("crank");
    o.crank = new T.Group(); o.crank.position.set(X2, -YC, 0); scene.add(o.crank);
    var fc = P.hookeFork(Object.assign({ material: cm }, FK)); fc.position.z = Z2; o.crank.add(fc);
    P.frame(fc, new T.Vector3(0, 0, -1), new T.Vector3(1, 0, 0)); // fork z 192..220
    P.at(P.cylZ(5, 24, cm), 0, 0, 232, o.crank);                  // shaft z 220..244, through the bearing (z 225..239)
    P.at(P.box(40, 10, 6, cm), 14, 0, 247, o.crank);              // arm x -6..34, z 244..250, on the shaft end
    P.at(P.cylZ(4.5, 22, cm), 28, 0, 261, o.crank);               // handle z 250..272, on the arm's face

    // guide: a crossbar on the pinion's shaft (z 24.5..31.5, x -RX-3..RX+3) slides between two pairs of fixed bars at
    // x = +-RX (each x RX-4..RX+4): back bars z 20..24, front bars z 32..36, from the base up to y = -dmin + 20.
    var RX = D.RP + D.MD + 10, xs = new T.Shape(), xe = RX + 3;
    xs.moveTo(xe, -5); xs.lineTo(xe, 5); xs.lineTo(8.66, 5); xs.absarc(0, 0, 10, Math.PI / 6, 5 * Math.PI / 6, false);
    xs.lineTo(-xe, 5); xs.lineTo(-xe, -5); xs.lineTo(-8.66, -5); xs.absarc(0, 0, 10, 7 * Math.PI / 6, 11 * Math.PI / 6, false); xs.closePath();
    var xh = new T.Path(); xh.absarc(0, 0, 5.6, 0, 2 * Math.PI, true); xs.holes.push(xh);   // the shaft (radius 5) turns in this hole
    var xg = new T.ExtrudeGeometry(xs, { depth: 7, bevelEnabled: false, curveSegments: 16 }); xg.translate(0, 0, 24.5);
    o.pin.add(new T.Mesh(xg, c.mat("bar")));
    var rh = -dmin + 20 - YB;
    [-1, 1].forEach(function (sx) {
      P.at(P.box(8, rh, 4, c.fixed), sx * RX, YB + rh / 2, 22, scene);   // back bar z 20..24, stands on the base
      P.at(P.box(8, rh, 4, c.fixed), sx * RX, YB + rh / 2, 34, scene);   // front bar z 32..36
    });

    // supports
    P.at(P.box(44, 290, 12, c.fixed), 0, YB + 145, -46, scene);  // post x -22..22, y -250..40, z -52..-40; the wheel's shaft ends at z -40
    P.at(P.box(330, 10, 309, c.fixed), 0, YB - 5, 90.5, scene);  // base x -165..165, y -260..-250, z -64..245; post, guide bars and bearing stand on y -250
    P.at(P.bearingBlock({ bore: 6, outer: 12, post: 18, width: 14, drop: -YB - YC, material: c.fixed }), X2, -YC, 232, scene);   // z 225..239, foot on y -250
  },

  /** Pin directions of the two universal joints. The crank's fork pin is p1; the swinging shaft's pin q is square to p1
      and to the swinging shaft; the pinion's pin r is square to q and to the pinion's shaft. With both joints bent the same
      way and the swinging shaft's two forks in line, r keeps pace with p1, so the pinion turns exactly with the crank. */
  joints: function (rho, d, v) {
    var o = this.o, J1 = v[0].set(0, -d, o.Z1), J2 = v[1].set(o.X2, -o.YC, o.Z2), e = v[2].subVectors(J1, J2).normalize();
    var p1 = v[3].set(Math.cos(rho), Math.sin(rho), 0), q = v[4].crossVectors(e, p1).normalize(), r = v[5].set(-q.y, q.x, 0).normalize();
    return { J1: J1, J2: J2, e: e, p1: p1, q: q, r: r };
  },

  step: function (c, dt, S) {
    var o = this.o, k = o.k, v = o.v;
    o.a += S.w * dt;
    var u = (o.a + k.start) % k.U; if (u < 0) u += k.U;
    var x = u / k.U * k.K, i = Math.min(k.K - 1, Math.floor(x)), f = x - i;
    var th = k.th[i] + (k.th[i + 1] - k.th[i]) * f, d = k.d[i] + (k.d[i + 1] - k.d[i]) * f;
    o.wheel.rotation.z = th;                                      // wheel angle from the rolling contact
    o.pin.position.y = -d;                                        // pinion rises and falls in the guide
    var rho = o.a + k.start + k.rho0;                             // the pinion's own turn, unbroken from one trip to the next
    o.rot.rotation.z = rho; o.crank.rotation.z = rho;             // the two joints pass the turn on unchanged
    var J = this.joints(rho, d, v), ne = v[6].copy(J.e).negate();
    o.f1.position.copy(J.J1); o.P.frame(o.f1, J.e, J.q);
    o.f2.position.copy(J.J2); o.P.frame(o.f2, ne, J.q);
    o.c1.position.copy(J.J1); o.P.frame(o.c1, J.q, J.r);
    o.c2.position.copy(J.J2); o.P.frame(o.c2, J.p1, J.q);
    o.rod.span(J.J1.x - 20 * J.e.x, J.J1.y - 20 * J.e.y, J.J1.z - 20 * J.e.z, J.J2.x + 20 * J.e.x, J.J2.y + 20 * J.e.y, J.J2.z + 20 * J.e.z);
    var ratio = (k.th[i + 1] - k.th[i]) / (k.U / k.K);            // wheel turn per pinion turn, right now
    function fm(val, unit) { return (val < 0 ? "−" + -val : val) + unit; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("ang", fm(Math.round(th * 180 / Math.PI), "°"));
    S.set("out", fm(rpm === 0 ? 0 : Math.round(rpm * ratio * 10) / 10, " rpm"));
  }
});
