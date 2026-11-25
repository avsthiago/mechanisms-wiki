M507.define({
  number: 276,
  title: "Constant-width cam",
  lede: "A three-lobed cam turns on a shaft. Two pins on a bar touch it, one on each side. The cam is the same size across its centre in every direction, so both pins stay touching and the bar slides to and fro.",
  alt: "A three-lobed cam on a shaft. A horizontal bar behind it has a small pin on each side of the cam, level with the shaft. As the cam turns, the bar slides left and right.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Cam", note: "A rounded three-armed shape. Measured straight across its centre, it is the same size in every direction." },
    { key: "bar", color: "#C8873A", name: "Bar", note: "Slides level in two guides. The shaft passes through a slot in it." },
    { key: "face", color: "#C2503F", name: "Pins", note: "Two small pins fixed to the bar, one each side of the cam. Watch that the cam never leaves either one." }
  ],
  controls: [{ id: "r", label: "Lobes", value: "33", options: [["20", "Shallow"], ["33", "As drawn"], ["42", "Deep"]] }],
  readouts: [{ id: "x", label: "Bar" }, { id: "s", label: "Stroke" }],
  views: { "3d": [290, 183, 718], front: [-45, 0, 800], side: [800, 80, 60] },
  target: [-45, 0, 0],
  how: [
    "The cam turns on a fixed shaft. The two pins on the bar are always the same distance apart. Measured straight across the centre of the cam, in any direction, the cam is that same size. So both pins keep touching it.",
    "When a lobe points at one pin, the other pin touches the waist on the far side. The bar is pushed toward the lobe. The bar slides to and fro three times for every turn of the cam.",
    "Try the three lobe depths. Deeper lobes make the bar slide further. The pins still touch the cam every time."
  ],
  note: "This model is rebuilt from Brown's drawing. The shape is a three-lobed outline whose size across the centre is the same in every direction, so the pins can touch it exactly. The pins are small so they fit the waists. The slot for the shaft, the back plate, the guides and the length of the bar were made up. The lobe choices change how deep the lobes are.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { th: 0, R0: 130, cams: {} }, i;
    function rad(a, t) { return o.R0 + a * Math.cos(3 * t); }   // r(t) + r(t + pi) = 2 R0: the same size across the centre
    o.rad = rad;
    o.cam = new T.Group(); c.scene.add(o.cam);
    [20, 33, 42].forEach(function (a) {
      var pts = [], t;
      for (i = 0; i < 720; i++) { t = i * 2 * Math.PI / 720; pts.push(new T.Vector2(rad(a, t) * Math.cos(t), rad(a, t) * Math.sin(t))); }
      var g = new T.ExtrudeGeometry(new T.Shape(pts), { depth: 12, bevelEnabled: false }); g.translate(0, 0, 2);   // z 2..14
      var m = new T.Mesh(g, c.mat("cam")); m.visible = false; o.cam.add(m); o.cams[a] = m;
    });
    P.at(P.cylZ(26, 3, c.mat("cam", "dark")), 0, 0, 15.5, o.cam);             // boss z 14..17
    P.at(P.cylZ(10, 3, c.mat("cam", "light")), 0, 0, 18.5, o.cam);            // pin z 17..20
    P.at(P.box(90, 4, 1, c.mat("cam", "dark")), 56, 0, 14.8, o.cam);           // stripe toward a lobe, z 14.3..15.3
    P.at(P.cylZ(10, 17, c.mat("cam", "dark")), 0, 0, -6.5, c.scene);           // shaft z -15..2
    o.bar = new T.Group(); c.scene.add(o.bar);
    var bm = P.slottedPlate({ outline: [[-330, -28], [240, -28], [240, 28], [-330, 28]], slot: [[-44, 0], [44, 0]], half: 11, thick: 10, material: c.mat("bar") });
    P.at(bm, 0, 0, -9, o.bar);                                                // z -14..-4
    o.PR = 3.5;
    P.at(P.cylZ(o.PR, 20, c.mat("face")), o.R0 + o.PR, 0, 6, o.bar);           // right pin, z -4..16; touches the cam at local x = R0
    P.at(P.cylZ(o.PR, 20, c.mat("face")), -o.R0 - o.PR, 0, 6, o.bar);          // left pin
    P.at(P.box(525, 90, 10, c.fixed), -37.5, 0, -20, c.scene);                 // x -300..225, y -45..45, z -25..-15
    [[-260, 60], [202.5, 35]].forEach(function (q) {
      P.at(P.box(q[1], 12, 12, c.fixed), q[0], 36, -9, c.scene);               // y 30..42, z -15..-3
      P.at(P.box(q[1], 12, 12, c.fixed), q[0], -36, -9, c.scene);              // y -42..-30
    });
  },

  step: function (c, dt, S) {
    var o = this.o, key = String(S.controls.r || "33"), a = +key;
    o.th += S.w * dt;
    Object.keys(o.cams).forEach(function (k) { o.cams[k].visible = k === key; });
    var off = o.rad(a, -o.th) - o.R0;        // the right pin rides on the cam's outline at world angle 0
    o.cam.rotation.z = o.th;
    o.bar.position.x = off;
    S.set("x", (off >= 0 ? "+" : "\u2212") + Math.abs(off).toFixed(0) + " mm");
    S.set("s", (2 * a).toFixed(0) + " mm");
  }
});
