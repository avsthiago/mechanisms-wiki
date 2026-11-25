M507.define({
  number: 36,
  title: "Mangle wheel and pinion",
  lede: "A small gear turns steadily one way, yet the big wheel turns one way and then back again. The small gear runs along both sides of a curved strip of teeth. Mangles, machines that press wet washing between rollers, used this to roll the cloth back and forth.",
  alt: "A large upright wheel with a strip of teeth shaped like the letter C fixed to its face. A small gear at the bottom meshes with the strip. Its shaft passes through a slot in an upright bar.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear. It always turns the same way. It runs along the outside of the strip, round the end, and back along the inside." },
    { key: "wheel", color: "#C8873A", name: "Mangle wheel", note: "The big wheel. It turns one way, stops, and turns back. The groove in its face holds the end of the pinion's shaft so the teeth stay together." },
    { key: "track", color: "#8E7AA8", name: "Strip of teeth", note: "Fixed to the wheel, with teeth on both edges and round both ends. Watch which edge the pinion is on when the wheel changes direction." },
    { key: "bar", color: "#4FA58A", name: "Slotted bar", note: "It stands still. The pinion's shaft slides up and down in its slot, so the pinion can move from one edge of the strip to the other." }
  ],
  controls: [{ id: "strip", label: "Strip of teeth", value: "long", options: [["long", "Long"], ["short", "Short"]] }],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "in", label: "Pinion" }, { id: "out", label: "Wheel" }],
  views: { "3d": [470, 200, 900], front: [0, -15, 1020], side: [1020, -15, 0] },
  target: [0, -15, 0],
  how: [
    "The small gear, called a pinion, is turned at a steady speed. It runs along the outside of the red strip of teeth and pushes the wheel round. At the end of the strip it rolls round the end and comes back along the inside.",
    "On the inside the same turning pushes the wheel the other way, so the wheel goes back. A minus sign in the readout means the other way. The inside edge is a smaller circle than the outside edge, so the wheel goes back a little faster. The pinion's shaft slides up and down in the slot of the green bar to change sides. A groove in the wheel holds the end of the shaft, so the teeth cannot come apart.",
    "Try Long, then Short. Watch how far the wheel turns before it goes back."
  ],
  note: "This model is rebuilt from Brown's drawing. The post behind the wheel, the base, the sizes and the number of teeth were made up. Brown draws the groove further from the teeth near the middle of the wheel. Here it keeps the same distance from the teeth all the way round, so the pinion stays in mesh. The short strip was added to show what the length changes.",

  // Sizes. Module 6, pinion 10 teeth. The strip's pitch outline is a closed curve: outer arc (radius RO), a half circle
  // round the end (radius H), inner arc (radius RI) and a half circle round the other end. B is the angle between the ends.
  dims: { MD: 6, NP: 10, RP: 30, RO: 180, RI: 144, H: 18 },

  /** Point of the pitch outline at arc length s, going anticlockwise round the strip: {x, y, psi (direction of travel), L}. */
  outline: function (B, s) {
    var D = this.dims, RM = (D.RO + D.RI) / 2, L1 = D.RO * B, L2 = Math.PI * D.H, L3 = D.RI * B, L = L1 + 2 * L2 + L3, g, a;
    s = ((s % L) + L) % L;
    if (s < L1) { g = -B / 2 + s / D.RO; return { x: D.RO * Math.cos(g), y: D.RO * Math.sin(g), psi: g + Math.PI / 2, L: L }; }
    s -= L1;
    if (s < L2) { a = B / 2 + s / D.H; return { x: RM * Math.cos(B / 2) + D.H * Math.cos(a), y: RM * Math.sin(B / 2) + D.H * Math.sin(a), psi: a + Math.PI / 2, L: L }; }
    s -= L2;
    if (s < L3) { g = B / 2 - s / D.RI; return { x: D.RI * Math.cos(g), y: D.RI * Math.sin(g), psi: g + 1.5 * Math.PI, L: L }; }
    s -= L3; a = -B / 2 + Math.PI + s / D.H;
    return { x: RM * Math.cos(B / 2) + D.H * Math.cos(a), y: -RM * Math.sin(B / 2) + D.H * Math.sin(a), psi: a + Math.PI / 2, L: L };
  },

  /** Kinematics for a strip of angle B. The pinion's centre is held on the line x = 0 below the wheel's shaft, and sits one
      pinion radius outside the outline. For the contact at arc length s: the centre lies at angle al(s) on the wheel, so the
      wheel has turned th = -pi/2 - al. Rolling without slip gives the pinion's own turn u = th - th0 + s / RP + psi - psi0.
      Returns th and the centre's depth d tabulated at K even steps of u, over one full trip U = L / RP + 2 pi. */
  kin: function (B) {
    var D = this.dims, M = 6000, K = 3000, L = this.outline(B, 0).L, i, p, x, y, al, prev, u = [], th = [], d = [], th0, psi0;
    for (i = 0; i <= M; i++) {
      var s = L * i / M; p = this.outline(B, i === M ? 0 : s);
      var psi = i === M ? p.psi + 2 * Math.PI : p.psi;
      x = p.x + D.RP * Math.sin(p.psi); y = p.y - D.RP * Math.cos(p.psi);       // pinion centre on the wheel: RP along the outward normal
      al = Math.atan2(y, x);
      if (i) { while (al - prev > Math.PI) al -= 2 * Math.PI; while (al - prev < -Math.PI) al += 2 * Math.PI; }
      prev = al;
      var t = -Math.PI / 2 - al;
      if (!i) { th0 = t; psi0 = psi; }
      th.push(t); d.push(Math.sqrt(x * x + y * y)); u.push(t - th0 + s / D.RP + psi - psi0);
    }
    var U = u[M], T = new Float64Array(K + 1), Dd = new Float64Array(K + 1), j = 0;
    for (i = 0; i <= K; i++) {
      var uu = U * i / K;
      while (j < M - 1 && u[j + 1] < uu) j++;
      var f = (uu - u[j]) / (u[j + 1] - u[j]);
      T[i] = th[j] + (th[j + 1] - th[j]) * f; Dd[i] = d[j] + (d[j + 1] - d[j]) * f;
    }
    return { U: U, K: K, th: T, d: Dd, u: u, start: D.RO * (B / 2 - Math.PI / 2) / D.RP };   // start: u where the wheel angle is 0 on the outer edge
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, self = this;
    var o = this.o = { a: 0, sets: {} };
    // pinion and its shaft. Gear z 1..15 (the strip is z 0..14), pin z -3..1 in the groove (dark floor at z -3.5)
    o.pin = new T.Group(); scene.add(o.pin);
    o.rot = new T.Group(); o.pin.add(o.rot);
    P.at(P.spurGear({ teeth: D.NP, module: D.MD, width: 14, material: c.mat("pinion") }), 0, 0, 8, o.rot);   // z 1..15
    P.at(P.cylZ(5, 4, c.mat("pinion")), 0, 0, -1, o.rot);                      // guide pin z -3..1, on the gear's back face; clear of the groove floor
    P.at(P.cylZ(10, 3, c.mat("pinion")), 0, 0, 16.5, o.rot);                   // hub z 15..18, on the gear's front face
    P.at(P.cylZ(6, 45, c.mat("pinion")), 0, 0, 37.5, o.rot);                   // shaft z 15..60, through the slot (bar z 22..30)

    function ring(B, off, n) {                                                 // the outline pushed `off` outward, as Vector2s
      var pts = [], L = self.outline(B, 0).L, i, p;
      for (i = 0; i < n; i++) { p = self.outline(B, L * i / n); pts.push(new T.Vector2(p.x + off * Math.sin(p.psi), p.y - off * Math.cos(p.psi))); }
      return pts;
    }
    [["long", 300, 96], ["short", 180, 60]].forEach(function (s) {
      var B = s[1] * Math.PI / 180, g = new T.Group(), m = c.mat("wheel"), L = self.outline(B, 0).L, i, p, pts = [];
      scene.add(g);
      P.at(P.cylZ(222, 6, m), 0, 0, -7, g);                                    // back disc z -10..-4
      // face layer z -4..0 with the groove cut through it: the groove's middle line is one pinion radius outside the outline, 12 wide
      var face = new T.Shape(); face.absarc(0, 0, 222, 0, 2 * Math.PI, false); face.holes.push(new T.Path(ring(B, D.RP + 6, 500)));
      var fg = new T.ExtrudeGeometry(face, { depth: 4, bevelEnabled: false, curveSegments: 60 }); fg.translate(0, 0, -4);
      g.add(new T.Mesh(fg, m));
      var ig = new T.ExtrudeGeometry(new T.Shape(ring(B, D.RP - 6, 500)), { depth: 4, bevelEnabled: false }); ig.translate(0, 0, -4);
      g.add(new T.Mesh(ig, m));                                                // island inside the groove, z -4..0; the strip stands on it
      var fl = new T.Shape(ring(B, D.RP + 6, 500)); fl.holes.push(new T.Path(ring(B, D.RP - 6, 500)));
      var floor = new T.Mesh(new T.ShapeGeometry(fl), c.mat("wheel", "dark")); floor.position.z = -3.5; g.add(floor);   // dark groove floor, lifted .5 off the back disc (z -4)
      for (i = 0; i < 900; i++) { p = self.outline(B, L * i / 900); pts.push([p.x, p.y]); }
      P.at(P.noncircularGear({ points: pts, teeth: s[2], width: 14, material: c.mat("track") }), 0, 0, 7, g);   // strip z 0..14, pitch 6 pi like the pinion
      P.at(P.cylZ(34, 5, m), 0, 0, 2.5, g);                                    // hub z 0..5, on the face
      P.at(P.cylZ(9, 35, m), 0, 0, 22.5, g);                                   // shaft end z 5..40, on the hub
      P.at(P.cylZ(14, 3, m), 0, 0, 41.5, g);                                   // collar z 40..43, on the shaft end
      P.at(P.cylZ(9, 30, m), 0, 0, -25, g);                                    // shaft z -40..-10, from the post face to the back of the disc
      var k = self.kin(B); k.g = g; o.sets[s[0]] = k;
    });

    // slotted bar: x -13..13, y -250..-100 with a round top to y -87, z 22..30. Slot 14 wide, y -217..-107 (shaft centre -210..-114, radius 6)
    var bs = new T.Shape(); bs.moveTo(-13, -250); bs.lineTo(13, -250); bs.lineTo(13, -100); bs.absarc(0, -100, 13, 0, Math.PI, false); bs.lineTo(-13, -250);
    var sl = new T.Path(); sl.absarc(0, -210, 7, Math.PI, 2 * Math.PI, false); sl.absarc(0, -114, 7, 0, Math.PI, false); sl.closePath(); bs.holes.push(sl);
    var bg = new T.ExtrudeGeometry(bs, { depth: 8, bevelEnabled: false, curveSegments: 16 }); bg.translate(0, 0, 22);
    scene.add(new T.Mesh(bg, c.mat("bar")));
    P.at(P.box(60, 8, 20, c.mat("bar")), 0, -246, 26, scene);                  // foot x -30..30, y -250..-242 (below the slot's end at -217), z 16..36; stands on the base
    // supports
    P.at(P.box(44, 290, 12, c.fixed), 0, -105, -46, scene);                    // post x -22..22, y -250..40, z -52..-40; the wheel's shaft ends at z -40
    P.at(P.box(330, 10, 112, c.fixed), 0, -255, -8, scene);                    // base x -165..165, y -260..-250, z -64..48; post, bar and foot stand on y -250
  },

  step: function (c, dt, S) {
    var o = this.o, D = this.dims, name, cur = o.sets[S.controls.strip] || o.sets.long;
    o.a += S.w * dt;
    for (name in o.sets) o.sets[name].g.visible = o.sets[name] === cur;
    var u = (o.a + cur.start) % cur.U; if (u < 0) u += cur.U;
    var x = u / cur.U * cur.K, i = Math.min(cur.K - 1, Math.floor(x)), f = x - i;
    cur.g.rotation.z = cur.th[i] + (cur.th[i + 1] - cur.th[i]) * f;            // wheel angle from the rolling contact
    o.pin.position.y = -(cur.d[i] + (cur.d[i + 1] - cur.d[i]) * f);            // shaft rises and falls in the slot
    o.rot.rotation.z = u + Math.PI / 2 - Math.PI / D.NP;                       // a gap of the pinion meets the strip's first tooth at u = 0
    var ratio = (cur.th[i + 1] - cur.th[i]) / (cur.U / cur.K);                 // wheel turn per pinion turn, right now
    function fm(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", fm(rpm));
    S.set("out", fm(rpm === 0 ? 0 : rpm * ratio));
  }
});
