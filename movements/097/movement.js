M507.define({
  number: 97,
  title: "Grooved heart cam",
  lede: "A heart-shaped groove is cut into a turning disc, and a pin on a bar runs in the groove. The groove pushes the bar out and pulls it back, at one steady speed each way. No spring is needed.",
  alt: "A round disc on a shaft with a heart-shaped channel cut into its face, the point of the heart on the left. A small pin rides in the channel, at the dip on the right. The pin is on the end of a straight bar that runs to the right through two guides.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Grooved disc", note: "A round disc with a heart-shaped channel cut into its face. The channel is the only thing that moves the bar." },
    { key: "pin", color: "#C2503F", name: "Pin", note: "A short peg that fits in the groove and slides along it. Watch it: it goes out and back once for each turn." },
    { key: "bar", color: "#C8873A", name: "Bar", note: "Slides straight through its guides. The pin carries it out and back." }
  ],
  controls: [{ id: "size", label: "Heart size", value: "68", options: [["40", "Small"], ["68", "Medium"], ["90", "Big"]] }],
  readouts: [{ id: "pos", label: "Bar position" }, { id: "vel", label: "Bar speed" }],
  views: { "3d": [440, 200, 680], front: [90, 0, 800], side: [840, 60, 40] },
  target: [90, 0, 0],
  how: [
    "Watch the pin. It starts in the dip on the right, where the groove is closest to the centre. As the disc turns, the groove runs further out in a straight, steady way. Its wall pushes the pin, and the pin pushes the bar. Half a turn later the point of the heart reaches the pin, and the bar is as far out as it goes.",
    "Then the groove comes back in just as steadily. Now the other wall of the groove pushes the pin back and pulls the bar home. A plain cam needs a spring for this, but here the pin cannot leave the groove. The bar moves at the same speed all the way, and only turns round at each end. The speed reading stays the same, and only its sign changes.",
    "The shape is the same heart as a plain cam, with the groove cut along its middle. Try Small, Medium and Large. A bigger heart gives a longer push, so the bar goes faster at the same turning speed."
  ],
  note: "This model is rebuilt from Brown's drawing. The pin, the bar, the guides, the back plate and the shaft were made up, and so was the depth of the groove. The groove is shaped so the centre of the pin moves exactly in a straight line at a steady speed. The choice of heart size was added to show how the push changes.",

  G: { RMIN: 38, W: 5, GX: 150, BARL: 175 },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene;
    var o = this.o = { th: 0, size: null, dyn: [] };
    o.cam = new T.Group(); scene.add(o.cam);
    // shaft z -10..18.5 (plate front face to past the hub, hidden inside the disc); hub pale z 15..18; dark dot z 17.6..19
    P.at(P.cylZ(6, 28.5, c.mat("cam")), 0, 0, 4.25, o.cam);
    P.at(P.cylZ(14, 3, c.mat("cam", "light")), 0, 0, 16.5, o.cam);
    P.at(P.cylZ(2, 1.4, c.mat("cam", "dark")), 6, 0, 18.3, o.cam);
    // pin z 7.5..26.5 (groove floor is z 6); bar z 19..26, y -5..5; dark dot on the pin top z 26.3..27.7
    o.pin = new T.Group(); scene.add(o.pin);
    P.at(P.cylZ(G.W - .6, 19, c.mat("pin", "mark")), 0, 0, 17, o.pin);
    P.at(P.cylZ(2, 1.4, c.mat("pin", "dark")), 0, 0, 27, o.pin);
    o.bar = P.at(P.box(G.BARL, 10, 7, c.mat("bar")), 0, 0, 22.5, scene);
    // guides: lower block y -15.5..-5.5, upper block y 5.5..15.5 (0.5 clear of the bar), x GX..GX+30, z -10..30;
    // back plate x -160..320, y -150..150, z -20..-10; base y -162..-150
    P.at(P.box(30, 10, 40, c.fixed), G.GX + 15, -10.5, 10, scene);
    P.at(P.box(30, 10, 40, c.fixed), G.GX + 15, 10.5, 10, scene);
    P.at(P.box(480, 300, 10, c.fixed), 80, 0, -15, scene);
    P.at(P.box(480, 12, 90, c.fixed), 80, -156, -5, scene);
  },

  // Disc for a push of `size`: base z 0..6 (the groove floor), then a layer z 6..16 with the groove cut through it. The groove
  // is the heart path widened by W each side; the island inside it is a separate piece resting on the same base.
  makeCam: function (c, size) {
    var T = c.THREE, P = c.P, G = this.G, o = this.o, TP = 2 * Math.PI;
    o.dyn.forEach(function (m) { o.cam.remove(m); m.geometry.dispose(); });
    o.dyn = [];
    var rmax = G.RMIN + size, R = rmax + 16;
    function path(ctx, pts) { pts.forEach(function (p, k) { if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); }
    var outer = P.heartCurve({ rmin: G.RMIN, rmax: rmax, offset: G.W }), inner = P.heartCurve({ rmin: G.RMIN, rmax: rmax, offset: -G.W });
    var base = new T.Shape(); base.absarc(0, 0, R, 0, TP, false);
    var top = new T.Shape(); top.absarc(0, 0, R, 0, TP, false);
    var hole = new T.Path(); path(hole, outer.slice().reverse()); top.holes.push(hole);
    var isl = new T.Shape(); path(isl, inner);
    var m = c.mat("cam");
    [[base, 6, 0], [top, 10, 6], [isl, 10, 6]].forEach(function (q) {
      var mesh = P.at(P.mesh(new T.ExtrudeGeometry(q[0], { depth: q[1], bevelEnabled: false, curveSegments: 96 }), m), 0, 0, q[2], o.cam);
      o.dyn.push(mesh);
    });
    var fo = P.heartCurve({ rmin: G.RMIN, rmax: rmax, offset: G.W - .5 }), fi = P.heartCurve({ rmin: G.RMIN, rmax: rmax, offset: -(G.W - .5) });
    var floor = new T.Shape(); path(floor, fo); var fh = new T.Path(); path(fh, fi.slice().reverse()); floor.holes.push(fh);   // dark strip on the groove floor, z 6.3..6.9, 0.5 in from each wall
    o.dyn.push(P.at(P.mesh(new T.ExtrudeGeometry(floor, { depth: .6, bevelEnabled: false }), c.mat("cam", "dark")), 0, 0, 6.3, o.cam));
    o.size = size;
  },

  step: function (c, dt, S) {
    var o = this.o, G = this.G, TP = 2 * Math.PI, size = +S.controls.size;
    if (size !== o.size) this.makeCam(c, size);
    o.th += S.w * dt;
    var psi = ((o.th + Math.PI) % TP + TP) % TP - Math.PI, k = size / Math.PI;
    var x = G.RMIN + k * Math.abs(psi);                  // the pin's centre: the radius of the groove's centre path at the pin
    o.cam.rotation.z = o.th;
    o.pin.position.x = x;
    o.bar.position.x = x + G.BARL / 2;
    var v = psi === 0 ? 0 : (psi > 0 ? 1 : -1) * k * S.w;
    var p = x - (G.RMIN + size / 2);
    S.set("pos", (p > .05 ? "+" : "") + p.toFixed(0) + " mm");
    S.set("vel", (v > .05 ? "+" : "") + v.toFixed(0) + " mm/s");
  }
});
