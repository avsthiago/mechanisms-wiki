M507.define({
  number: 350,
  title: "Lever traverse motion",
  lede: "A long lever with a slot at each end swings about a pin that rides on a bar. One slot holds a pin that stays still. The other holds a pin that moves from side to side. The lever then slides the bar to and fro in its guides.",
  alt: "A slanting lever with a slot at each end lies across a flat horizontal bar. The upper slot holds a pin fixed to the wall. The lower slot holds a pin on a small slide that moves along a rail. The middle of the lever is pinned to a post on the bar, which slides in two guides.",
  parts: [
    { key: "slide", color: "#5E7387", name: "Moving pin", note: "A pin on a small slide that runs along a rail. It is the part that is pushed from side to side." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "Has a slot at each end and is pinned to the bar in the middle. It leans one way, then the other." },
    { key: "bar", color: "#C8873A", name: "Bar", note: "The flat bar that slides in two guides. Watch it move to and fro." },
    { key: "pin", color: "#4FA58A", name: "Fixed pin", note: "Does not move. It sits in the upper slot, and the lever slides along it as it leans." }
  ],
  controls: [{
    type: "range", id: "reach", label: "How far the moving pin goes", min: 20, max: 55, step: 5, value: 45, unit: " mm",
    presets: [[20, "Short"], [45, "Medium"], [55, "Long"]]
  }],
  readouts: [{ id: "d", label: "Moving pin" }, { id: "b", label: "Bar" }, { id: "t", label: "Lever lean" }],
  views: { "3d": [140, 80, 570], front: [0, -10, 600], side: [580, 20, 40] },
  target: [0, -10, 0],
  how: [
    "Watch the lever. Its upper slot slides over the fixed pin, so the lever can only lean about that pin. The moving pin in the lower slot pushes the bottom of the lever left and right, and the lever leans with it.",
    "The middle of the lever is pinned to a post on the bar. When the lever leans, that pin is carried sideways, and it takes the bar with it. The bar is closer to the fixed pin than the moving pin is, so it moves much less than the moving pin does.",
    "Try the three settings of the slider. A longer reach makes the lever lean more and the bar travel farther, but the bar always moves less than the moving pin."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows no drive for the lower pin, so a slide on a rail that moves back and forth by itself was added. The wall, the rail, the guides, the post on the bar and all the sizes were made up. The post is cut shorter than in the drawing so that it clears the fixed pin.",

  // The lever is a straight line through the fixed pin F and the moving pin D. Its middle pin H is where that line
  // crosses the height of the bar, and the bar goes wherever H goes.
  kin: function (xD, F, yH, yD) {
    var k = (yH - yD) / (F[1] - yD), rx = F[0] - xD, ry = F[1] - yD, L = Math.hypot(rx, ry);
    return { xH: xD + (F[0] - xD) * k, rx: rx / L, ry: ry / L, dF: L * (1 - k), dD: L * k };   // dF, dD: distances from H to F and to D
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var F = [22, 64], YH = 21, YD = -64, XC = -61, GL = -145, GR = 118;
    var o = this.o = { th: 0, F: F, YH: YH, YD: YD, XC: XC };
    // back plate z -20..-12 holds everything; the bar, post and guides sit in front of it
    P.at(P.box(380, 190, 8, c.fixed), 0, 0, -16, scene);                           // x -190..190, y -95..95, z -20..-12
    // guides: a frame round the bar (bar y -46..-26, z 0..8; one unit of room on each side)
    [GL, GR].forEach(function (x) {
      P.at(P.box(10, 12, 29, c.fixed), x, -19, 2.5, scene);                        // top: y -25..-13, z -12..17
      P.at(P.box(10, 12, 29, c.fixed), x, -53, 2.5, scene);                        // bottom: y -59..-47, z -12..17
      P.at(P.box(10, 22, 11, c.fixed), x, -36, -6.5, scene);                       // back: y -47..-25, z -12..-1, on the plate
    });
    // bar and post (z 0..8, post a little thicker so no faces share a plane)
    o.bar = new T.Group(); scene.add(o.bar);
    P.at(P.box(375, 20, 8, c.mat("bar")), -7.5, -36, 4, o.bar);                    // x -195..180 from the post, y -46..-26, z 0..8
    P.at(P.box(28, 51, 8.8, c.mat("bar")), 0, -4.5, 4, o.bar);                     // post x -14..14, y -30..21, z -0.4..8.4
    P.at(P.cylZ(15, 9.6, c.mat("bar")), 0, YH, 4, o.bar);                          // round top, z -0.8..8.8
    P.at(P.cylZ(9, 0.7, c.mat("lever", "dark")), 0, YH, 9.15, o.bar);              // washer z 8.8..9.5, under the lever
    // lever z 9.5..17.5, hub at its local origin, long along local y: lower end -170, upper end 100
    var sh = new T.Shape(), cb = -156, ct = 86, w = 14;
    sh.moveTo(w, cb); sh.lineTo(w, ct); sh.absarc(0, ct, w, 0, Math.PI, false); sh.lineTo(-w, cb); sh.absarc(0, cb, w, Math.PI, 2 * Math.PI, false);
    function slot(a, b) {
      var h = new T.Path(), r = 5.5; h.moveTo(r, a); h.lineTo(r, b); h.absarc(0, b, r, 0, Math.PI, false); h.lineTo(-r, a); h.absarc(0, a, r, Math.PI, 2 * Math.PI, false); sh.holes.push(h);
    }
    slot(32, 80); slot(-140, -70);                                                  // centre lines of the two slots
    var lg = new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false, curveSegments: 24 }); lg.translate(0, 0, 9.5);
    o.lever = new T.Group(); scene.add(o.lever); o.lever.add(new T.Mesh(lg, c.mat("lever")));
    o.hubHead = P.at(P.cylZ(7, 1.2, c.mat("lever", "dark")), 0, 0, 18.1, o.lever);  // hub pin head z 17.5..18.7
    // fixed pin: z -12..18 from the plate, head on top
    P.at(P.cylZ(4.5, 30, c.mat("pin")), F[0], F[1], 3, scene);
    P.at(P.cylZ(7, 1.2, c.mat("pin")), F[0], F[1], 18.1, scene);
    // rail (y -80..-73, z -12..6, on the plate) and the slide on it (y -72..-56, z -5..5)
    P.at(P.box(160, 7, 18, c.fixed), -60, -76.5, -3, scene);                        // x -140..20
    o.slide = P.at(P.box(26, 16, 10, c.mat("slide")), 0, YD, 0, scene);
    o.dpin = P.at(P.cylZ(4.5, 13, c.mat("slide")), 0, YD, 11.5, scene);              // z 5..18
    o.dhead = P.at(P.cylZ(7, 1.2, c.mat("slide")), 0, YD, 18.1, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, A = +S.controls.reach;
    o.th += S.w * dt;
    var xD = o.XC - A * Math.cos(o.th), k = this.kin(xD, o.F, o.YH, o.YD), x0 = this.kin(o.XC - A, o.F, o.YH, o.YD).xH;
    o.slide.position.x = o.dpin.position.x = o.dhead.position.x = xD;
    o.bar.position.x = k.xH;
    o.lever.position.set(k.xH, o.YH, 0); o.lever.rotation.z = Math.atan2(k.ry, k.rx) - Math.PI / 2;
    S.set("d", Math.round(xD - (o.XC - A)) + " mm");
    S.set("b", Math.round(k.xH - x0) + " mm");
    S.set("t", Math.round(Math.atan2(k.rx, k.ry) * 180 / Math.PI) + " deg");
  }
});
