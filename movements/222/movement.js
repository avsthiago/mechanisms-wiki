M507.define({
  number: 222,
  title: "Eccentric gear and linked pinion",
  lede: "A round gear turns on a shaft that is off its centre, so it wobbles. A small gear, called a pinion, rides on a swinging arm and stays in mesh with it, held by a link to the gear's centre. The pinion drives a second gear that turns round at a changing speed.",
  alt: "Three spur gears. A gear at the top left, a smaller pinion to its right, and below them a gear whose shaft is beside its centre. An arm joins that gear's centre to the pinion's centre, and a link joins the pinion's centre to the lower gear's centre.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "The driving gear. It is round, but its shaft passes beside its centre, so its centre goes round in a small circle." },
    { key: "pinion", color: "#4FA58A", name: "Pinion", note: "The small gear between the other two. It meshes with both and passes the turning on to the driven gear." },
    { key: "wheel", color: "#C8873A", name: "Driven gear", note: "The gear that is driven. Its shaft does not move. Watch its red mark: it hurries and lags." },
    { key: "arm", color: "#D9B13B", name: "Swinging arm", note: "Hangs from the driven gear's shaft and carries the pinion. It keeps the pinion in mesh with the driven gear." },
    { key: "link", color: "#8E7AA8", name: "Link", note: "A bar from the pinion's axle to a pin at the centre of the driving gear. It keeps the pinion in mesh with that gear." }
  ],
  controls: [{ type: "range", id: "off", label: "Shaft off the centre", min: 0, max: 40, step: 1, value: 40, unit: "% of radius",
    presets: [[0, "Centred"], [20, "A little"], [40, "As drawn"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [306, 187, 731], front: [0, 0, 1000], side: [1000, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The driving gear is round, but its shaft is not at its centre. As it turns, its centre goes round in a small circle and its teeth come nearer and further. The pinion has to follow. It rides on an arm that swings about the driven gear's shaft.",
    "A link joins the pinion's centre to a pin at the centre of the driving gear. The link never changes length, so the two gears always stay the right distance apart. The teeth cannot go too deep or slip apart. When the far side of the gear meets the pinion, its teeth move fast and the driven gear hurries. On the near side it lags.",
    "Move the shaft off the centre slider. With Centred, the driven gear turns at a steady speed. Try A little, then As drawn, and watch the Driven readout swing more."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate, the shafts, the sizes and the number of teeth were made up. The slider was added. It moves the shaft's place in the gear to show what the offset does.",

  geo: function () {
    if (this._g) return this._g;
    var g = { MD: 6, NA: 32, NB: 22, NC: 32, A: [-125, 105] };
    g.rA = g.NA * g.MD / 2; g.rB = g.NB * g.MD / 2; g.rC = g.NC * g.MD / 2; g.L1 = g.rA + g.rB; g.L2 = g.rC + g.rB;
    var u = [161, -191], m = Math.hypot(u[0], u[1]);
    g.D = [g.A[0] + 250 * u[0] / m, g.A[1] + 250 * u[1] / m];             // shaft 250 from the wheel's: the gear (out to 102 + 38) never reaches the wheel (102)
    this._g = g; return g;
  },
  /** Advance state st to gear angle th with offset e; fills E, B and the angles. */
  solve: function (st, th, e) {
    var g = this.geo(), T = 2 * Math.PI;
    function unwrap(prev, v) { return prev === undefined ? v : v + T * Math.round((prev - v) / T); }
    var E = [g.D[0] + e * Math.cos(th), g.D[1] + e * Math.sin(th)];
    // pinion centre: g.L1 from the wheel's shaft and g.L2 from the gear's centre, on the upper-right side of the line between them
    var dx = E[0] - g.A[0], dy = E[1] - g.A[1], d = Math.hypot(dx, dy), a = (d * d + g.L1 * g.L1 - g.L2 * g.L2) / (2 * d), h = Math.sqrt(Math.max(0, g.L1 * g.L1 - a * a));
    var ux = dx / d, uy = dy / d, B = [g.A[0] + a * ux - h * uy, g.A[1] + a * uy + h * ux];
    if (B[0] * -uy + B[1] * ux < g.A[0] * -uy + g.A[1] * ux) B = [g.A[0] + a * ux + h * uy, g.A[1] + a * uy - h * ux];
    st.th = th; st.E = E; st.B = B;
    st.delta = unwrap(st.delta, Math.atan2(B[1] - E[1], B[0] - E[0]));     // from the gear's centre to the pinion's
    st.alpha = unwrap(st.alpha, Math.atan2(B[1] - g.A[1], B[0] - g.A[0])); // from the wheel's shaft to the pinion's centre
    var stB = T / g.NB, stA = T / g.NA;
    // rolling: pinion-frame contact angle = half a pitch - (rC / rB) * gear-frame contact angle, and the same for the wheel
    st.phiB = st.delta + Math.PI - (stB / 2 - (g.rC / g.rB) * (st.delta - th));
    st.phiA = st.alpha - (stA / 2 - (g.rB / g.rA) * (st.alpha + Math.PI - st.phiB));
    return st;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, g = this.geo();
    var o = this.o = { st: {}, th: 0 };
    // driving gear z -8..8, turning about the shaft at D; the gear itself sits off-centre inside the group
    o.c = new T.Group(); o.c.position.set(g.D[0], g.D[1], 0); scene.add(o.c);
    o.cg = new T.Group(); o.c.add(o.cg);
    o.cg.add(P.spurGear({ teeth: g.NC, module: g.MD, width: 16, material: c.mat("drive") }));
    var rfC = g.rC - 1.25 * g.MD;
    P.at(P.box(rfC - 30, 5, 1, c.mat("drive", "mark")), 18 + (rfC - 30) / 2, 0, 9, o.cg);   // red stripe x 18..rf-12, away from the shaft, z 8.5..9.5, lifted off the face
    P.at(P.cylZ(5, 15.5, c.mat("link")), 0, 0, 15.75, o.cg);                  // centre pin z 8..23.5, just inside the link (front face z 24)
    P.at(P.cylZ(7, 39, c.mat("drive")), 0, 0, -10.5, o.c);                   // shaft z -30..9, plate face into the end cap
    P.at(P.cylZ(10, 2, c.mat("drive", "dark")), 0, 0, 9, o.c);               // shaft end z 8..10 on the gear face
    // pinion z -8..8, axle z -8..24
    o.b = new T.Group(); scene.add(o.b);
    o.b.add(P.spurGear({ teeth: g.NB, module: g.MD, width: 16, material: c.mat("pinion") }));
    P.at(P.cylZ(5.5, 31.5, c.mat("pinion")), 0, 0, 7.75, o.b);                 // axle z -8..23.5, inside the link
    // wheel z -8..8 on a shaft z -30..16 from the plate face to the arm's front face
    o.a = new T.Group(); o.a.position.set(g.A[0], g.A[1], 0); scene.add(o.a);
    o.a.add(P.spurGear({ teeth: g.NA, module: g.MD, width: 16, material: c.mat("wheel") }));
    P.at(P.cylZ(7, 45.5, c.mat("wheel")), 0, 0, -7.25, o.a);                  // shaft z -30..15.5, inside the arm
    var rfA = g.rA - 1.25 * g.MD;
    P.at(P.box(rfA - 30, 5, 1, c.mat("wheel", "mark")), 18 + (rfA - 30) / 2, 0, 9, o.a);   // red stripe x 18..rf-12, z 8.5..9.5, lifted off the face
    // arm z 10..16 (wheel shaft to pinion axle); link z 18..24 (pinion axle to the gear's centre pin)
    function bar(len, z, key) {
      var gr = new T.Group(); gr.position.z = z; scene.add(gr);
      P.at(P.box(len, 12, 6, c.mat(key)), len / 2, 0, 0, gr);
      P.at(P.cylZ(11, 6, c.mat(key)), 0, 0, 0, gr); P.at(P.cylZ(11, 6, c.mat(key)), len, 0, 0, gr);
      return gr;
    }
    o.arm = bar(g.L1, 13, "arm"); o.arm.position.x = g.A[0]; o.arm.position.y = g.A[1];
    o.link = bar(g.L2, 21, "link");
    // supports
    P.at(P.box(520, 480, 10, c.fixed), -10, -20, -35, scene);                // plate x -270..250, y -260..220, z -40..-30; shafts end at z -30
    P.at(P.box(560, 12, 100, c.fixed), -10, -266, -30, scene);               // base y -272..-260, z -80..20; plate stands on y -260
  },

  step: function (c, dt, S) {
    var o = this.o, g = this.geo(), e = (S.controls.off || 0) / 100 * g.rC, st = o.st;
    o.th += S.w * dt;
    this.solve(st, o.th, e);
    o.c.rotation.z = o.th; o.cg.position.x = e;
    o.b.position.set(st.B[0], st.B[1], 0); o.b.rotation.z = st.phiB;
    o.a.rotation.z = st.phiA;
    o.arm.rotation.z = st.alpha;
    o.link.position.set(st.E[0], st.E[1], 21); o.link.rotation.z = st.delta;
    var w = S.playing ? S.rpm : 0, h = 1e-3, nx = this.solve({ delta: st.delta, alpha: st.alpha }, o.th + h, e);
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("in", f(w));
    S.set("out", f(w * (nx.phiA - st.phiA) / h));
  }
});
