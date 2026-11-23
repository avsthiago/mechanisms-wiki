M507.define({
  number: 136,
  title: "Toothed cam wheel",
  lede: "A wheel has a ring of teeth cut into its flat face. A rod, pressed against the teeth by a spring, is pushed out by each tooth and drawn back between them. The wheel turns round, and the rod moves in and out in a straight line.",
  alt: "A round wheel on a horizontal shaft, held by an upright bearing on the left. Its right face has a ring of pointed teeth. A rod from a wall on the right presses on the teeth. A coil spring winds round the rod, between a collar and the wall.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Cam wheel", note: "A round wheel on a shaft. A ring of teeth is cut into its flat face. The teeth push the rod as the wheel turns." },
    { key: "rod", color: "#C8873A", name: "Rod", note: "Slides to and fro through a hole in the wall. Its flat end rests on the teeth." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "A coil round the rod. It pushes the rod back against the teeth, so it never leaves them." },
    { key: "mark", color: "#C2503F", name: "Marker ring", note: "A ring on the far end of the rod. Watch it move out and back with every tooth." }
  ],
  controls: [{ id: "shape", label: "Tooth shape", value: "tri", options: [["tri", "Pointed"], ["round", "Rounded"], ["saw", "Saw"]] }],
  readouts: [{ id: "w", label: "Wheel" }, { id: "x", label: "Rod out" }, { id: "n", label: "Strokes" }],
  views: { "3d": [340, 190, 480], front: [70, 0, 640], top: [70, 640, 20] },
  target: [70, 0, 0],
  how: [
    "The wheel turns on its shaft. The rod's flat end rests on the ring of teeth. As a tooth comes round, its slope pushes the rod to the right. Then the tooth moves on, and the spring pushes the rod back to the left.",
    "The rod goes out and back once for every tooth that passes it. The wheel has many teeth, so the rod makes many short strokes in each turn. Its position is simply the height of the tooth under its end.",
    "The shape of the teeth decides how the rod moves. Try Pointed, then Rounded, then Saw. With Saw the rod is pushed out slowly, then drops back quickly."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the wheel from the side, so the teeth show as a zigzag edge. Here they are cut in the flat face of the wheel. The number and height of the teeth, the bearing and base, the wall with its hole, the collar on the rod and the marker ring were made up. Brown does not say what presses the rod on the teeth, so he draws a spring, as here. The other tooth shapes were added for comparison.",

  // Units: mm. Wheel axis on X at y 0, z 0. Rod at y 0, z ZR, parallel to the axis.
  K: { N: 12, A: 18, B: 3, R: 100, RI: 40, RO: 98, ZR: 70, RR: 4, WALL: 190, CD: 110, RL: 280 },

  // Tooth height (above the wheel's front face, x 0) at phase u in 0..1 within one tooth.
  prof: function (shape, u) {
    var K = this.K, f;
    if (shape === "round") f = (1 - Math.cos(2 * Math.PI * u)) / 2;
    else if (shape === "saw") f = u < .92 ? u / .92 : (1 - u) / .08;
    else f = 1 - Math.abs(2 * u - 1);
    return K.B + K.A * f;
  },
  height: function (shape, al) {                                         // al: angle in the wheel's own frame
    var u = al / (2 * Math.PI) * this.K.N; u -= Math.floor(u);
    return this.prof(shape, u);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, K = this.K, scene = c.scene;
    var o = this.o = { th: 0, shape: null, strokes: 0, last: null };
    o.wheel = new T.Group(); scene.add(o.wheel);
    // shaft x -130..-20 through the bearing bore; collar x -40..-20; back plate x -20..0 (r 100); hub x 0..2 (r 24)
    P.at(P.cylX(12, 108, c.mat("wheel")), -76, 0, 0, o.wheel);
    P.at(P.cylX(22, 20, c.mat("wheel", "light")), -30, 0, 0, o.wheel);
    P.at(P.cylX(K.R, 20, c.mat("wheel")), -10, 0, 0, o.wheel);
    P.at(P.cylX(24, 2, c.mat("wheel", "light")), 1, 0, 0, o.wheel);
    // dark stripe on the front face, x 0..1 (top lifted 1), r 26..38 between hub and teeth; on the hub face too
    P.at(P.box(1.5, 14, 5, c.mat("wheel", "dark")), 2.75, 0, 0, o.wheel).position.set(2.75, 0, 31);
    o.teeth = null;
    // rod: flat end at local x 0, then to x RL; collar x CD-3..CD+3; marker ring near the far end
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.cylX(K.RR, K.RL, c.mat("rod")), K.RL / 2, 0, 0, o.rod);
    P.at(P.cylX(12, 6, c.mat("rod", "light")), K.CD, 0, 0, o.rod);
    P.at(P.cylX(7, 5, c.mat("mark")), 250, 0, 0, o.rod);
    o.rod.position.z = K.ZR;
    o.spring = P.at(P.spring({ radius: 8, wire: 1.4, turns: 9, length: 70, material: c.mat("spring") }), K.CD + 3, 0, K.ZR, scene);
    // supports: bearing block x -80..-66 (bore r 13), foot to y -110; base x -150..230, y -122..-110, z -110..110;
    // wall x 190..200, y -110..190, z -100..100, with a hole of r 5 for the rod
    var b = P.at(P.bearingBlock({ bore: 13, outer: 38, post: 60, width: 14, drop: 110, material: c.fixed }), -73, 0, 0, scene);
    b.rotation.y = Math.PI / 2;
    P.at(P.box(380, 12, 220, c.fixed), 40, -116, 0, scene);
    var w = P.at(P.guideBlock({ w: 300, h: 10, d: 200, hole: 5, hz: K.ZR, material: c.fixed }), K.WALL + 5, 40, 0, scene);
    w.rotation.z = Math.PI / 2;
  },

  // Ring of teeth, x 0..max, between r RI and RO, as a flat-shaded surface. Valleys stay B above the face.
  makeTeeth: function (c, shape) {
    var T = c.THREE, K = this.K, o = this.o, M = K.N * 36, pos = [], i;
    if (o.teeth) { o.wheel.remove(o.teeth); o.teeth.geometry.dispose(); }
    function v(r, a, x) { pos.push(x, r * Math.cos(a), r * Math.sin(a)); }
    for (i = 0; i < M; i++) {
      var a0 = 2 * Math.PI * i / M, a1 = 2 * Math.PI * (i + 1) / M, h0 = this.height(shape, a0 + 1e-9), h1 = this.height(shape, a1 - 1e-9);
      if (shape === "saw" && i % 36 === 35) h1 = this.prof("saw", 1 - 1e-9);
      [[K.RI, K.RO]].forEach(function (rr) {
        v(rr[0], a0, h0); v(rr[1], a0, h0); v(rr[1], a1, h1);                 // top
        v(rr[0], a0, h0); v(rr[1], a1, h1); v(rr[0], a1, h1);
        v(K.RO, a0, 0); v(K.RO, a1, 0); v(K.RO, a1, h1);                      // outer wall
        v(K.RO, a0, 0); v(K.RO, a1, h1); v(K.RO, a0, h0);
        v(K.RI, a0, 0); v(K.RI, a1, h1); v(K.RI, a1, 0);                      // inner wall
        v(K.RI, a0, 0); v(K.RI, a0, h0); v(K.RI, a1, h1);
      });
    }
    var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    var m = new T.Mesh(g, c.mat("wheel")); o.wheel.add(m); o.teeth = m; o.shape = shape;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, TP = 2 * Math.PI, shape = S.controls.shape || "tri";
    if (shape !== o.shape) this.makeTeeth(c, shape);
    o.th += S.w * dt;
    o.wheel.rotation.x = o.th;
    // the rod's flat end is a disc of radius RR at z ZR; it rests on the highest tooth under any point of it
    var xt = 0, pts = [[0, 0], [K.RR, 0], [-K.RR, 0], [0, K.RR], [0, -K.RR], [.7 * K.RR, .7 * K.RR], [-.7 * K.RR, .7 * K.RR], [.7 * K.RR, -.7 * K.RR], [-.7 * K.RR, -.7 * K.RR]];
    for (var i = 0; i < pts.length; i++) {
      var al = Math.atan2(K.ZR + pts[i][1], pts[i][0]) - o.th;
      xt = Math.max(xt, this.height(shape, al));
    }
    o.rod.position.x = xt;
    o.spring.setLength(K.WALL - (xt + K.CD + 3));
    o.spring.position.x = xt + K.CD + 3;
    var out = xt - K.B;
    S.set("w", Math.round(S.w * 30 / Math.PI) + " rpm");
    S.set("x", out.toFixed(0) + " mm");
    S.set("n", Math.floor(o.th * K.N / TP) + "");
  }
});
