M507.define({
  number: 264,
  title: "Two worm wheels on one worm",
  lede: "One worm turns two wheels of the same size side by side. One wheel has one tooth more than the other, so it turns a tiny bit slower. The two slowly drift apart, which is a way to count a very big number of turns.",
  alt: "Two big toothed wheels stand side by side on one level shaft, seen edge on. A thick worm lies across the top of both. Two thin pointers stand up from the shaft beside the wheels, one on each wheel.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Worm", note: "A thick screw that lies across the tops of both wheels. A gear that a screw like this turns is called a worm wheel. Each turn moves each wheel on by one tooth." },
    { key: "w1", color: "#C8873A", name: "Fixed worm wheel", note: "Fixed to the shaft. Its pointer is on the far end of the shaft." },
    { key: "w2", color: "#4FA58A", name: "Loose worm wheel", note: "Turns freely on the shaft. It has one tooth more, so it is a little slower. Its pointer is on a tube that leaves the wheel." }
  ],
  controls: [{ id: "n2", label: "Loose worm wheel", value: "21", options: [["20", "Same teeth"], ["21", "One tooth more"]] }],
  speed: { min: 10, max: 120, value: 60, label: "Worm speed" },
  readouts: [{ id: "t", label: "Worm" }, { id: "g", label: "Gap" }],
  views: { "3d": [460, 210, 560], front: [0, 30, 690], side: [650, 30, 0] },
  target: [0, 30, 0],
  how: [
    "Turn the worm and both wheels creep round the same way. Each turn of the worm pushes each wheel on by one tooth. At first the two pointers stand together.",
    "One tooth is a smaller step on the wheel with more teeth, because its teeth are packed closer. So that wheel falls a little behind on every turn. The gap between the pointers grows by the same small amount each time. It takes as many worm turns as both tooth counts multiplied together for one wheel to gain a whole turn.",
    "Try Same teeth and the pointers never part. Then try One tooth more and watch the gap grow. Look from the side to see the pointers."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown uses wheels of 100 and 101 teeth; this model uses far fewer so the drift can be seen in minutes. The stands, the base and the sizes were made up. As Brown says, the wheels are the same size, so the teeth of the loose wheel are a little closer than the worm's thread. A real pair would cut the teeth to suit.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 90, N1 = 20, MD = 9, RW = 40, XW = 10, LEAD = Math.PI * MD;
    var YW = R + Math.sqrt(RW * RW - XW * XW);                       // 128.7: worm pitch surface touches each wheel's pitch circle mid-width
    var o = this.o = { phi: 0, N1: N1, n2: 0, off2: 0, w2: {} };
    function base0(N, x) { return Math.PI / 2 - Math.PI / N + LEAD * Math.asin(x / RW) / (2 * Math.PI) / R; }   // a tooth gap under the thread at the start
    function wheel(key, N, x) {
      var holder = new T.Group(); holder.rotation.y = Math.PI / 2; scene.add(holder);   // local Z is world X
      var spin = new T.Group(); holder.add(spin);
      var g = P.spurGear({ teeth: N, module: 2 * R / N, width: 16, bore: key === "w2" ? 7.5 : 0, material: c.mat(key) });
      P.at(g, 0, 0, x, spin);                                         // x -18..-2 or 2..18
      return { holder: holder, spin: spin, b0: base0(N, x), N: N };
    }
    function pointer(key, spin, b0, x) {                              // a needle along local +Y, pointing up when the wheel is at b0
      var pg = new T.Group(); pg.rotation.z = -b0; pg.position.z = x; spin.add(pg);
      P.at(P.cylZ(10, 3, c.mat(key)), 0, 0, 0, pg);                  // hub, 3 thick along the shaft
      var nd = P.mesh(new T.CylinderGeometry(.8, 2.6, 92, 12), c.mat(key)); P.at(nd, 0, 54, 0, pg);   // needle r 8..100
      P.at(P.sphere(2.2, c.mat(key, "mark")), 0, 100, 0, pg);         // red tip
    }
    // wheel on the shaft, with the shaft and the far pointer: shaft x -95..91 (bearing face to bearing face)
    o.w1 = wheel("w1", N1, -10);
    P.at(P.cylZ(7, 186, c.mat("w1")), 0, 0, -2, o.w1.spin);
    pointer("w1", o.w1.spin, o.w1.b0, 69.5);                           // x 68..71
    // loose wheels, one per tooth count, each with a tube x 18..55.5 and its pointer x 52.5..55.5 (worm tip reaches x 49)
    [20, 21].forEach(function (n) {
      var w = wheel("w2", n, 10);
      P.at(P.cylZ(11, 37.5, c.mat("w2")), 0, 0, 36.75, w.spin);        // tube x 18..55.5, on the wheel face
      pointer("w2", w.spin, w.b0, 54);
      o.w2[n] = w;
    });

    // worm: axis along world Z at x 0, y 128.7
    o.worm = new T.Group(); o.worm.position.set(0, YW, 0); o.worm.rotation.y = -Math.PI / 2; scene.add(o.worm);   // local X is world Z
    o.wspin = new T.Group(); o.worm.add(o.wspin);
    P.at(P.worm({ radius: RW, pitch: LEAD, length: 80, material: c.mat("worm") }), 0, 0, 0, o.wspin);   // z -40..40, tip r 49, root r 28.75
    P.at(P.cylX(10, 204, c.mat("worm")), 0, 0, 0, o.wspin);           // shaft z -102..102, bearing face to bearing face
    [-1, 1].forEach(function (k) { P.at(P.box(50, 1, 3, c.mat("worm", "dark")), k * 70, 10.5, 0, o.wspin); });   // stripes z 45..95, lifted off the shaft

    // supports
    [-1, 1].forEach(function (k) {
      P.at(P.bearingBlock({ bore: 10.5, outer: 18, width: 14, drop: YW + 110, material: c.fixed }), 0, YW, k * 109, scene);   // z 102..116 (wheels reach z 99), foot on y -110
      var b = P.bearingBlock({ bore: 7.5, outer: 14, width: 14, drop: 110, material: c.fixed }); b.rotation.y = Math.PI / 2;
      P.at(b, k < 0 ? -88 : 84, 0, 0, scene);                          // x -95..-81 and 77..91, foot on y -110
    });
    P.at(P.box(200, 10, 250, c.fixed), -2, -115, 0, scene);           // base x -102..98, y -120..-110, z -125..125
  },

  step: function (c, dt, S) {
    var o = this.o, n2 = +S.controls.n2 || 21, k, w2 = o.w2[n2], TAU = 2 * Math.PI;
    o.phi += S.w * dt;
    var a1 = -o.phi / o.N1, a2 = -o.phi / n2;                         // each worm turn moves each wheel one tooth
    if (n2 !== o.n2) {                                                // new loose wheel: keep its pointer where it was, to the nearest whole tooth
      if (o.n2) { var prev = -o.phi / o.n2 + o.off2; o.off2 = Math.round((prev - a2) / (TAU / n2)) * TAU / n2; }
      o.n2 = n2;
    }
    a2 += o.off2;
    o.w1.spin.rotation.z = o.w1.b0 + a1;
    for (k in o.w2) { o.w2[k].holder.visible = +k === n2; o.w2[k].spin.rotation.z = o.w2[k].b0 + a2; }
    o.wspin.rotation.x = o.phi;
    var gap = Math.abs((a2 - a1) * 180 / Math.PI) % 360; gap = Math.min(gap, 360 - gap);   // angle between the pointers
    var nt = Math.floor(o.phi / TAU); S.set("t", nt + (nt === 1 ? " turn" : " turns"));
    S.set("g", gap.toFixed(1) + "°");
  }
});
