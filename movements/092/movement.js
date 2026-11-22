M507.define({
  number: 92,
  title: "Crank and connecting rod",
  lede: "A heavy wheel turns, and a pin on its face swings round in a circle. A rod joins the pin to a block that can only slide in a straight line. So the turning of the wheel becomes a to-and-fro push. Steam engines work this way.",
  alt: "A big spoked wheel on a shaft at the left, with a pin on its face near the rim. A flat rod runs from the pin to a block on the right. The block slides between two fixed bars.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Flywheel and crank", note: "A heavy wheel on a shaft. A short arm, the crank, is fixed to its face. The weight of the wheel keeps it turning smoothly." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The pin at the end of the crank. It goes round in a circle. Watch it." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "A flat bar from the crank pin to the sliding block. One end goes round in a circle, the other goes to and fro, so the bar swings from side to side." },
    { key: "block", color: "#C8873A", name: "Cross-head", note: "The block that slides between two fixed bars. It can only move in a straight line." }
  ],
  controls: [{ id: "l", label: "Rod length", value: "200", options: [["160", "Short"], ["200", "As drawn"], ["320", "Long"]] }],
  readouts: [{ id: "x", label: "Cross-head" }, { id: "v", label: "Speed" }, { id: "a", label: "Rod tilt" }],
  views: { "3d": [370, 200, 770], front: [60, -10, 1000], side: [900, 0, 0] },
  target: [60, -20, 0],
  how: [
    "The crank pin goes round in a circle. The rod pushes and pulls the block, and the bars let the block move only in a straight line. One turn of the wheel makes one trip out and one trip back.",
    "The block does not move at an even pace. It stops for an instant at each end of its trip. Because the rod slants, the block moves faster in the half of its trip far from the wheel than in the half near the wheel.",
    "Try Short, then Long. A longer rod slants less, so the two halves of the trip get more alike. Watch the tilt reading and the speed shrink or grow."
  ],
  note: "This model is rebuilt from Brown's drawing. The shaft, the bearing, the base, the posts under the guide bars, the pin caps and all the sizes were made up. Brown's guide bars run off the edge of the drawing. The shorter and longer rods were added for comparison.",

  K: { X0: -150, R: 59, WR: 100, TH0: -59 * Math.PI / 180, HW: 32.5, XE: 280 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { a: 0 };
    // flywheel group: rim z -7..7, hub z -10..10, shaft z -60..10.5
    o.wheel = new T.Group(); o.wheel.position.set(K.X0, 0, 0); scene.add(o.wheel);
    o.wheel.add(P.pulley({ radius: K.WR, width: 14, rim: 9, spokes: 6, hub: 18, material: c.mat("wheel") }));
    P.at(P.cylZ(24, 20, c.mat("wheel")), 0, 0, 0, o.wheel);                                 // hub z -10..10
    P.at(P.cylZ(11, 70.5, c.mat("wheel", "dark")), 0, 0, -24.75, o.wheel);                    // shaft z -60..10.5
    P.at(P.box(K.R, 12, 6, c.mat("wheel")), K.R / 2, 0, 6, o.wheel);                         // crank arm x 0..59, z 3..9, below the pin's start
    P.at(P.cylZ(5.5, 26, c.mat("pin")), K.R, 0, 22, o.wheel);                                // pin z 9..35
    P.at(P.cylZ(8, 3, c.mat("pin")), K.R, 0, 35, o.wheel);                                   // cap z 33.5..36.5
    // connecting rod: group at the crank pin, local +X points at the crosshead; bar z 25..33
    o.rod = new T.Group(); scene.add(o.rod);
    o.bar = P.at(P.box(1, 16, 8, c.mat("rod")), 0, 0, 29, o.rod);
    P.at(P.cylZ(11, 7, c.mat("rod")), 0, 0, 29, o.rod);                                      // eye z 25.5..32.5
    o.eye2 = P.at(P.cylZ(11, 7, c.mat("rod")), 0, 0, 29, o.rod);
    // crosshead: block z 10..24 between the bars, pin z 24..35
    o.slide = new T.Group(); scene.add(o.slide);
    P.at(P.box(2 * K.HW, 56, 14, c.mat("block")), 0, 0, 17, o.slide);                        // x +-32.5, y +-28, z 10..24
    P.at(P.cylZ(5, 11, c.mat("block")), 0, 0, 29.5, o.slide);                                // pin z 24..35
    P.at(P.cylZ(7.5, 3, c.mat("block")), 0, 0, 35, o.slide);                                 // cap z 33.5..36.5
    // guide bars: y 29..43 and -43..-29, z 10..24; left end follows the rod length; posts stand on the base
    o.top = P.at(P.box(1, 14, 14, c.fixed), 0, 36, 17, scene);
    o.bot = P.at(P.box(1, 14, 14, c.fixed), 0, -36, 17, scene);
    o.postL = P.at(P.box(20, 87, 14, c.fixed), 0, -86.5, 17, scene);                         // y -130..-43 under the lower bar
    P.at(P.box(20, 87, 14, c.fixed), K.XE - 10, -86.5, 17, scene);                           // x 260..280
    P.at(P.box(60, 160, 20, c.fixed), K.X0, -50, -70, scene);                                // bearing x -180..-120, y -130..30, z -80..-60; shaft ends on its face
    P.at(P.box(580, 12, 140, c.fixed), 20, -136, -20, scene);                                // base x -270..310, y -142..-130, z -90..50
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, L = +(S.controls.l || 200), R = K.R, s, cs, rt, px, py, dx;
    o.a += S.w * dt;
    var th = K.TH0 + o.a;
    s = Math.sin(th); cs = Math.cos(th); rt = Math.sqrt(L * L - R * R * s * s);
    py = R * s; dx = R * cs + rt; px = K.X0 + dx;
    o.wheel.rotation.z = th;
    o.rod.position.set(K.X0 + R * cs, py, 0);
    var psi = Math.atan2(-py, rt);
    o.rod.rotation.z = psi;
    o.bar.scale.x = L; o.bar.position.x = L / 2; o.eye2.position.x = L;
    o.slide.position.x = px;
    var lm = K.X0 + L - R - K.HW - 5, len = K.XE - lm;
    o.top.scale.x = o.bot.scale.x = len; o.top.position.x = o.bot.position.x = lm + len / 2;
    o.postL.position.x = lm + 10;
    var v = -R * S.w * s * (1 + R * cs / rt);
    function sg(n, u, d) { return (n < -0.5 * Math.pow(10, -d) ? "−" : n > 0.5 * Math.pow(10, -d) ? "+" : "") + Math.abs(n).toFixed(d) + u; }
    S.set("x", sg(dx - L, " mm", 0)); S.set("v", sg(v, " mm/s", 0)); S.set("a", sg(psi * 180 / Math.PI, "°", 1));
  }
});
