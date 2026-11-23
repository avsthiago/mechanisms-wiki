M507.define({
  number: 152,
  title: "Ellipsograph",
  lede: "A flat bar has two studs that slide in two grooves set at right angles, and a pencil fixed to the bar. As you turn the bar, the pencil draws an oval, called an ellipse. Draughtsmen used this tool to draw ovals that a compass cannot.",
  alt: "A flat plus-shaped plate with a straight groove along each arm, lying on a board. A long tilted bar rests on it. Two studs on the bar slide in the grooves, and a red pencil near the top left end of the bar draws a dark oval round the plate.",
  parts: [
    { key: "frame", color: "#4FA58A", name: "Cross-piece", note: "A plus-shaped plate that does not move. Each of its two arms has a straight groove, and the grooves cross at the middle." },
    { key: "bar", color: "#C8873A", name: "Traverse bar", note: "A flat bar that you turn. It rides on the cross-piece, and its studs are held in the grooves." },
    { key: "stud", color: "#5E7387", name: "Studs", note: "Two pins under the bar. One slides along the sideways groove and the other along the upright groove, so each can only move in a straight line." },
    { key: "pin", color: "#C2503F", name: "Pencil", note: "The red pencil is fixed to the bar, past one stud. Watch it. It leaves a dark line as it goes round." }
  ],
  controls: [{ type: "range", id: "e", label: "Pencil distance past the stud", min: 30, max: 105, step: 1, value: 105, unit: "",
    presets: [[30, "Close"], [60, "Middle"], [105, "Far"]] }],
  readouts: [{ id: "w", label: "Width" }, { id: "h", label: "Height" }, { id: "a", label: "Bar turn" }],
  views: { front: [0, 0, 680], "3d": [150, -290, 640], side: [760, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The two studs sit in two grooves that cross at a right angle. The bar has a fixed length between them. So when one stud slides toward the middle, the other must slide away from it.",
    "The pencil is fixed to the bar, past one stud. As the bar turns, the studs slide to and fro in a straight line, and the pencil goes round in an oval. It is wide in the direction of the sideways groove and shorter in the upright one.",
    "Try Close, then Far. The closer the pencil is to the stud, the flatter the oval gets."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows two grooves on each arm. The model has one on each, which is all the studs need. The board under the cross-piece, the thickness of the plate and bar, and all the sizes were made up. The line is drawn a little above the board so that it can be seen. The other pencil positions were added for comparison.",

  K: { L: 50, N: 380 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, L = K.L, N = K.N;
    var o = this.o = { phi: Math.PI + 0.75, last: null, pts: [], e: null };
    // board x -190..190, y -150..150, z -6..0
    P.at(P.box(380, 300, 6, c.fixed), 0, 0, -3, scene);
    // cross-piece z 0..5: arms half length 70, half width 22; plus-shaped hole (grooves half width 4.5, half length 54)
    function plus(a, b) { return [[b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a], [-a, -b], [a, -b], [a, -a]]; }
    var sh = new T.Shape(), hole = new T.Path(), q;
    q = plus(22, 70); sh.moveTo(q[0][0], q[0][1]); q.slice(1).forEach(function (p) { sh.lineTo(p[0], p[1]); }); sh.closePath();
    q = plus(4.5, 54); hole.moveTo(q[0][0], q[0][1]); q.slice(1).forEach(function (p) { hole.lineTo(p[0], p[1]); }); hole.closePath();
    sh.holes.push(hole);
    scene.add(P.mesh(new T.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: false }), c.mat("frame")));
    // moving bar group: local x runs from the stud in the upright groove (0) to the stud in the sideways groove (L) and on to the pencil
    o.bar = new T.Group(); scene.add(o.bar);
    o.barMesh = null;
    o.studs = [];
    [0, L].forEach(function (x) {
      P.at(P.cylZ(3.5, 7.5, c.mat("stud")), x, 0, 4.25, o.bar);                         // stud z 0.5..8 in the groove (plate z 0..5), top meets bar underside z 8
      P.at(P.cylZ(5, 1.6, c.mat("bar", "dark")), x, 0, 15, o.bar);                       // dark ring seat on the bar top (bar z 8..14), z 14.2..15.8
    });
    o.pen = P.cylZ(4.5, 19.5, c.mat("pin", "mark"));                                     // pencil z 6.5..26, tip above the plate (z 5) and under the bar
    o.bar.add(o.pen);
    // trace ribbon, live
    var geo = new T.BufferGeometry(), pos = new Float32Array(N * 6), idx = [], i;
    for (i = 0; i < N - 1; i++) { var a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.setDrawRange(0, 0);
    o.trace = new T.Mesh(geo, new T.MeshBasicMaterial({ color: new T.Color(c.ink), side: T.DoubleSide }));
    o.trace.userData.live = true; o.trace.frustumCulled = false; scene.add(o.trace);
    o.pos = pos; o.geo = geo;
  },

  rebuildBar: function (c, e) {
    var o = this.o, K = this.K, T = c.THREE, P = c.P, L = K.L;
    if (o.barMesh) { o.bar.remove(o.barMesh); o.barMesh.geometry.dispose(); }
    var x0 = -16, x1 = L + e + 16;
    o.barMesh = P.box(x1 - x0, 14, 6, c.mat("bar"));                                     // bar x -16..L+e+16, y -7..7, z 8..14
    o.barMesh.position.set((x0 + x1) / 2, 0, 11); o.bar.add(o.barMesh);
    o.pen.position.set(L + e, 0, 16.25);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, L = K.L, N = K.N, e = +S.controls.e;
    if (o.e !== e) { o.e = e; o.pts = []; o.last = null; this.rebuildBar(c, e); }
    o.phi += S.w * dt;
    var phi = o.phi;
    function pt(p) { return [(L + e) * Math.cos(p), -e * Math.sin(p)]; }
    if (o.last === null) { o.last = phi; o.pts.push(pt(phi)); }
    var d = phi - o.last, st = 0.0175, s = d >= 0 ? 1 : -1;
    while (Math.abs(phi - o.last) >= st) { o.last += s * st; o.pts.push(pt(o.last)); }
    while (o.pts.length > N - 6) o.pts.shift();
    var n = o.pts.length, pos = o.pos, i, a, b, tx, ty, l;
    for (i = 0; i < n; i++) {
      a = o.pts[Math.max(0, i - 1)]; b = o.pts[Math.min(n - 1, i + 1)];
      tx = b[0] - a[0]; ty = b[1] - a[1]; l = Math.hypot(tx, ty) || 1;
      var nx = -ty / l * 1.3, ny = tx / l * 1.3, p = o.pts[i];
      pos[6 * i] = p[0] + nx; pos[6 * i + 1] = p[1] + ny; pos[6 * i + 2] = 6.5;
      pos[6 * i + 3] = p[0] - nx; pos[6 * i + 4] = p[1] - ny; pos[6 * i + 5] = 6.5;
    }
    o.geo.attributes.position.needsUpdate = true;
    o.geo.setDrawRange(0, Math.max(0, n - 1) * 6);
    // bar pose: stud in the sideways groove at (L cos phi, 0), stud in the upright groove at (0, L sin phi)
    o.bar.position.set(0, L * Math.sin(phi), 0);
    o.bar.rotation.z = -phi;
    S.set("w", Math.round(2 * (L + e)) + " mm");
    S.set("h", Math.round(2 * e) + " mm");
    S.set("a", Math.round(((phi * 180 / Math.PI) % 360 + 360) % 360) + "°");
  }
});
