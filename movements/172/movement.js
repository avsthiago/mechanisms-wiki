M507.define({
  number: 172,
  title: "Egg-shaped motion",
  lede: "A long bar is pushed round by a crank, while one spot of the bar is held in a swivel. A pencil on the bar then draws a rounded shape like an egg. It shows how a round motion can be bent into another shape.",
  alt: "Two flat discs joined by a belt at the lower left. A long flat bar is pinned to the lower disc and slides through a swivel at the right. A red pencil on the bar draws a dark egg-shaped line on a board.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving disc and belt", note: "The upper disc is turned by you. The belt carries its turning to the lower disc." },
    { key: "crank", color: "#C8873A", name: "Crank disc", note: "The lower disc has a pin near its rim. The pin goes round in a small circle and carries the end of the bar." },
    { key: "bar", color: "#D9B13B", name: "Slotted bar", note: "A long bar made of two rails with a gap between them. One end is on the crank pin. The swivel pin slides along the gap." },
    { key: "pen", color: "#C2503F", name: "Pencil", note: "The red pencil is fixed to the bar. Watch it. It leaves a dark line shaped like an egg." },
    { key: "post", color: "#4FA58A", name: "Swivel post", note: "A post that does not move, with a pin on top. The bar can turn on the pin and slide past it." }
  ],
  controls: [{ type: "range", id: "d", label: "Pencil distance from the crank", min: 85, max: 140, step: 1, value: 105, unit: "",
    presets: [[88, "Near crank"], [105, "As drawn"], [140, "Near swivel"]] }],
  readouts: [{ id: "c", label: "Crank" }, { id: "t", label: "Bar tilt" }, { id: "s", label: "To swivel" }],
  views: { front: [135, 40, 600], "3d": [320, -190, 500], side: [700, 35, 0] },
  target: [135, 40, 0],
  how: [
    "The crank pin goes round in a small circle and carries one end of the bar. Further along, the bar is held by the swivel pin. So the bar must turn and slide as the crank goes round.",
    "The pencil sits on the bar, away from the crank. It moves with the crank pin, and it also swings up and down as the bar tilts. The two together make a shape that is fuller at one end, like an egg.",
    "Try Near crank, then Near swivel, and compare. The nearer the pencil is to the swivel, the flatter the egg gets."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows no slot and no board. The two rails that make the slot, the crank arm, the swivel post, the board, the belt and all the sizes were made up. The dashed egg is drawn in advance so you can see where the pencil is going. The other pencil positions were added for comparison.",

  K: { N: 400, RU: 30, RL: 26, RC: 55, U: [36, 95], Q: [235, 36], LB: 300, PHI0: 3.93 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, N = K.N, i;
    var o = this.o = { a: 0, last: null, pts: [], d: null };
    // board x -85..355, y -70..150, z -6..0
    P.at(P.box(440, 220, 6, c.fixed), 135, 40, -3, scene);
    // lower (crank) disc z 0..8; pin z 8..14; hub cap z 8..9.5
    o.crank = new T.Group(); scene.add(o.crank);
    P.at(P.cylZ(K.RL, 8, c.mat("crank")), 0, 0, 4, o.crank);
    P.at(P.box(K.RC + 14, 10, 3, c.mat("crank")), (K.RC + 14) / 2 - 7, 0, 9.5, o.crank);                 // crank arm x -7..RC+7, z 8..11
    P.at(P.cylZ(4, 3, c.mat("crank")), K.RC, 0, 12.5, o.crank);                                          // pin z 11..14
    P.at(P.cylZ(5, 1.5, c.mat("crank", "dark")), 0, 0, 11.75, o.crank);                                  // hub cap z 11..12.5
    // upper (driving) disc z 0..8
    o.drive = new T.Group(); o.drive.position.set(K.U[0], K.U[1], 0); scene.add(o.drive);
    P.at(P.cylZ(K.RU, 8, c.mat("drive")), 0, 0, 4, o.drive);
    P.at(P.box(K.RU - 8, 4, 1, c.mat("drive", "dark")), (K.RU - 8) / 2 + 4, 0, 9, o.drive);
    P.at(P.cylZ(5, 1.5, c.mat("drive", "dark")), 0, 0, 8.75, o.drive);
    // belt z 1..7 round the two rims (open, same direction)
    var belt = P.belt({ width: 6, thick: 3, material: c.mat("drive", "dark") });
    belt.set(0, 0, K.RL + 3, K.U[0], K.U[1], K.RU + 3, false); belt.position.z = 4; scene.add(belt);
    // swivel post: post z 0..13, pin z 13..20, cap z 20..23.5
    var Q = K.Q;
    P.at(P.cylZ(14, 13, c.mat("post")), Q[0], Q[1], 6.5, scene);
    P.at(P.cylZ(3.5, 7, c.mat("post")), Q[0], Q[1], 16.5, scene);
    P.at(P.cylZ(9, 3.5, c.mat("post")), Q[0], Q[1], 21.75, scene);
    // bar group at the crank pin; local x along the bar. end block x -10..14, rails x 14..LB, y +-(4..9), z 14..20
    o.bar = new T.Group(); scene.add(o.bar);
    P.at(P.box(24, 18, 6, c.mat("bar")), 2, 0, 17, o.bar);
    P.at(P.cylZ(5, 1.5, c.mat("bar", "dark")), 0, 0, 20.75, o.bar);                                      // cap z 20..21.5
    var len = K.LB - 14;
    P.at(P.box(len, 5, 6, c.mat("bar")), 14 + len / 2, 6.5, 17, o.bar);
    P.at(P.box(len, 5, 6, c.mat("bar")), 14 + len / 2, -6.5, 17, o.bar);
    // pencil: disc z 20..23 on the rails, tip z 1.4..20 through the gap
    o.pen = new T.Group(); o.bar.add(o.pen);
    P.at(P.cylZ(8, 3, c.mat("pen", "mark")), 0, 0, 21.5, o.pen);
    P.at(P.cylZ(2.2, 18.6, c.mat("pen", "mark")), 0, 0, 10.7, o.pen);
    // trace ribbon, live, at z 0.8
    var geo = new T.BufferGeometry(), pos = new Float32Array(N * 6), idx = []; for (i = 0; i < N * 2; i++) pos[3 * i + 2] = 0.8;
    for (i = 0; i < N - 1; i++) { var a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.setDrawRange(0, 0);
    o.trace = new T.Mesh(geo, new T.MeshBasicMaterial({ color: new T.Color(c.ink), side: T.DoubleSide }));
    o.trace.userData.live = true; o.trace.frustumCulled = false; scene.add(o.trace);
    o.pos = pos; o.geo = geo;
    // dashed full egg, static between control changes, z 0.4
    var dg = new T.BufferGeometry();
    dg.setAttribute("position", new T.BufferAttribute(new Float32Array(360 * 12), 3)); dg.setIndex(new T.BufferAttribute(new Uint16Array(360 * 6), 1)); dg.setDrawRange(0, 0);
    o.dash = new T.Mesh(dg, new T.MeshBasicMaterial({ color: new T.Color(c.ink), side: T.DoubleSide }));
    o.dash.userData.live = true; o.dash.frustumCulled = false; scene.add(o.dash);
  },

  geom: function (p, d) {
    var K = this.K, Q = K.Q, cx = K.RC * Math.cos(p), cy = K.RC * Math.sin(p), vx = Q[0] - cx, vy = Q[1] - cy, s = Math.hypot(vx, vy);
    return { cx: cx, cy: cy, s: s, th: Math.atan2(vy, vx), tx: cx + d * vx / s, ty: cy + d * vy / s };
  },

  rebuildDash: function (d) {
    var o = this.o, K = this.K, pts = [], i, q = 0, pos = o.dash.geometry.attributes.position.array, ix = o.dash.geometry.index.array;
    for (i = 0; i <= 360; i++) { var g = this.geom(K.PHI0 + i * Math.PI / 180, d); pts.push([g.tx, g.ty]); }
    for (i = 0; i < 360; i++) {
      if (i % 10 >= 6) continue;
      var a = pts[i], b = pts[i + 1], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l * 1.1, ny = tx / l * 1.1, v = q * 4, w = q * 12;
      pos.set([a[0] + nx, a[1] + ny, 0.4, a[0] - nx, a[1] - ny, 0.4, b[0] + nx, b[1] + ny, 0.4, b[0] - nx, b[1] - ny, 0.4], w);
      ix.set([v, v + 1, v + 2, v + 1, v + 3, v + 2], q * 6); q++;
    }
    o.dash.geometry.attributes.position.needsUpdate = true; o.dash.geometry.index.needsUpdate = true;
    o.dash.geometry.setDrawRange(0, q * 6);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, N = K.N, d = +S.controls.d, Q = K.Q, r = K.RC;
    if (o.d !== d) { o.d = d; o.pts = []; o.last = null; this.rebuildDash(d); }
    o.a += S.w * dt;
    var k = K.RU / K.RL, phi = K.PHI0 + k * o.a;
    var self = this; function geom(p) { return self.geom(p, d); }
    if (o.last === null) { o.last = phi; var g0 = geom(phi); o.pts.push([g0.tx, g0.ty]); }
    var st = 0.0175, sg = phi >= o.last ? 1 : -1;
    while (Math.abs(phi - o.last) >= st) { o.last += sg * st; var gg = geom(o.last); o.pts.push([gg.tx, gg.ty]); }
    while (o.pts.length > N - 6) o.pts.shift();
    var n = o.pts.length, pos = o.pos, i, a, b, tx, ty, l;
    for (i = 0; i < n; i++) {
      a = o.pts[Math.max(0, i - 1)]; b = o.pts[Math.min(n - 1, i + 1)];
      tx = b[0] - a[0]; ty = b[1] - a[1]; l = Math.hypot(tx, ty) || 1;
      var nx = -ty / l * 1.3, ny = tx / l * 1.3, p = o.pts[i];
      pos[6 * i] = p[0] + nx; pos[6 * i + 1] = p[1] + ny; pos[6 * i + 2] = 0.8;
      pos[6 * i + 3] = p[0] - nx; pos[6 * i + 4] = p[1] - ny; pos[6 * i + 5] = 0.8;
    }
    o.geo.attributes.position.needsUpdate = true;
    o.geo.setDrawRange(0, Math.max(0, n - 1) * 6);
    var g = geom(phi);
    o.crank.rotation.z = phi;
    o.drive.rotation.z = o.a;
    o.bar.position.set(g.cx, g.cy, 0); o.bar.rotation.z = g.th;
    o.pen.position.x = d;
    S.set("c", Math.round(((phi * 180 / Math.PI) % 360 + 360) % 360) + "°");
    var tl = g.th * 180 / Math.PI;
    S.set("t", (tl < 0 ? "−" : "+") + Math.abs(tl).toFixed(1) + "°");
    S.set("s", Math.round(g.s - d) + " mm");
  }
});
