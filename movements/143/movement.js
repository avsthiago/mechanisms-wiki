M507.define({
  number: 143,
  title: "Sliding worm and traverse",
  lede: "A turning shaft drives a screw, called a worm, that turns a gear, called a worm wheel. The wheel and screw ride together on a small frame. A rod from the wheel to a fixed post pushes the frame to and fro. A steady turn becomes a back and forth slide.",
  alt: "A long level shaft held by two upright posts, with a pulley on its left end. A short screw sits on the shaft above a gear. A small frame holds both and slides on a bar. A rod joins a pin on the wheel to the right post.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Driving shaft and worm", note: "The pulley turns the long shaft. The worm slides along it but is made to turn with it. Watch the red stripes to see the shaft turn." },
    { key: "wheel", color: "#C8873A", name: "Worm wheel", note: "The worm turns this wheel slowly. A pin near its rim holds one end of the rod. Watch the red tooth." },
    { key: "frame", color: "#4FA58A", name: "Traversing frame", note: "A small frame that holds the worm and the wheel. It slides to and fro along a bar of the fixed frame." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "A rod from the pin on the wheel to the fixed post on the right. As the pin goes round, the rod pushes and pulls the frame. Watch the red stripe." }
  ],
  controls: [{ id: "pin", label: "Pin on wheel", value: "33", options: [["20", "Near the middle"], ["33", "Halfway"], ["45", "Near the rim"]] }],
  readouts: [{ id: "in", label: "Shaft" }, { id: "wh", label: "Wheel" }, { id: "sl", label: "Frame" }],
  speed: { min: 1, max: 30, value: 12, label: "Shaft speed", unit: " rpm" },
  views: { front: [0, 20, 700], "3d": [330, 190, 560], side: [620, 40, 60] },
  target: [0, 20, 0],
  how: [
    "Turn the pulley and the long shaft turns the worm. The worm slides on the shaft but cannot spin on it, because a key in its hub fits a groove in the shaft. Its thread pushes the teeth of the wheel round, one tooth for each turn.",
    "The wheel and the worm both sit in a small frame that slides on a bar. The wheel has a pin near its rim. A rod joins that pin to the fixed post on the right. As the wheel turns, the pin swings round and the rod pushes and pulls the frame.",
    "The worm is carried along with the frame, so it stays in step with the wheel. Try the pin near the middle, then near the rim, and compare how far the frame slides."
  ],
  note: "This model is rebuilt from Brown's drawing. The posts, the base, the bar, the sizes, the number of teeth and the places of the pin were made up. The key and groove are not drawn; the worm simply turns with the shaft. The wheel has plain straight teeth, as drawn. A real worm wheel has slanted, hollowed teeth.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N = 20, PITCH = Math.PI * MD, RW = 18, WY = 78;
    var g0 = P.spurGear({ teeth: N, module: MD, material: c.mat("wheel") });
    var o = this.o = { N: N, phi: 0, rp: g0.pitchRadius, XP: 180, YP: 8, WY: WY, rw: 33, pin: 0 };
    o.base = Math.PI / 2 - g0.pitch / 2;                                        // a tooth gap at the top, under the worm
    o.b = 237 * Math.PI / 180 - o.base;                                         // pin angle on the wheel, lower left as drawn
    o.L = Math.sqrt(Math.pow(o.XP + o.rw * 0.5446, 2) + Math.pow(o.YP + o.rw * 0.8387, 2));   // rod length, frame at x 0 when the pin is at 237 degrees (33 out)

    // traversing frame: group moves along X
    var car = o.car = new T.Group(); scene.add(car);
    P.at(P.box(60, 20, 16, c.mat("frame")), 0, 40, -30, car);                   // sleeve x -30..30, y 30..50, z -38..-22, round the bar
    P.at(P.box(60, 116, 8, c.mat("frame")), 0, 38, -18, car);                   // plate x -30..30, y -20..96, z -22..-14; touches the sleeve at z -22
    [-1, 1].forEach(function (k) { P.at(P.box(6, 30, 22, c.mat("frame")), k * 21, WY, -3, car); });   // worm holders x +-18..+-24, y 63..93, z -14..8; stand on the plate face z -14
    // wheel on a shaft held by the plate
    var wh = o.wheel = new T.Group(); P.at(wh, 0, 0, 0, car);
    wh.add(g0);                                                                 // gear z -8..8
    P.at(P.cylZ(6, 22, c.mat("wheel")), 0, 0, -3, wh);                          // shaft z -14..8, plate face to gear face
    P.at(P.cylZ(14, 4, c.mat("wheel")), 0, 0, 10, wh);                          // hub z 8..12
    P.at(P.cylZ(6.5, 1.5, c.mat("wheel", "dark")), 0, 0, 12.25, wh);            // shaft end z 11.5..13
    var mk = new T.Group(); mk.rotation.z = (N - 5) * g0.pitch; wh.add(mk);     // red tooth at 3 o'clock at the start
    [-1, 1].forEach(function (k) { P.at(P.box(10, .2 * PITCH, 1, c.mat("wheel", "mark")), o.rp - 1, 0, k * 9, mk); });   // r 54..64, z 8.5..9.5 off each face
    o.wrist = P.at(P.cylZ(3.5, 12.5, c.mat("rod")), 0, 0, 14.25, wh);           // pin z 8..20.5, on the gear face

    // shaft, pulley, worm
    var sh = o.shaft = new T.Group(); sh.position.set(0, WY, 0); scene.add(sh);
    P.at(P.cylX(6, 340, c.mat("worm")), 0, 0, 0, sh);                           // shaft x -170..170, post face to post face
    P.at(P.cylX(26, 10, c.mat("worm")), -195, 0, 0, sh);                        // pulley x -200..-190, on the post face
    P.at(P.box(1, 22, 4, c.mat("worm", "mark")), -201, 14, 0, sh);              // red stripe on the pulley face x -201.5..-200.5
    [-1, 1].forEach(function (k) { P.at(P.box(60, 1, 3, c.mat("worm", "mark")), k * 100, 7, 0, sh); });   // stripes y 6.5..7.5, lifted off the shaft
    o.worm = new T.Group(); o.worm.position.set(0, WY, 0); scene.add(o.worm);
    P.at(P.worm({ radius: RW, pitch: PITCH, length: 36, material: c.mat("worm") }), 0, 0, 0, o.worm);   // x -18..18, between the holders

    // connecting rod, in front of the wheel
    var rod = o.rod = new T.Group(); scene.add(rod);
    P.at(P.box(o.L, 6, 4, c.mat("rod")), o.L / 2, 0, 17, rod);                  // bar z 15..19
    P.at(P.cylZ(8, 5, c.mat("rod")), 0, 0, 17, rod);                            // end discs z 14.5..19.5
    P.at(P.cylZ(8, 5, c.mat("rod")), o.L, 0, 17, rod);
    P.at(P.box(40, 2, 1, c.mat("rod", "mark")), o.L * 0.5, 0, 19.5 + .5, rod);  // red stripe z 19.5..20.5
    P.at(P.cylZ(3.5, 8.5, c.mat("rod")), o.XP, o.YP, 16.25, scene);             // pivot pin z 12..20.5, on the post face

    // supports
    [-1, 1].forEach(function (k) { P.at(P.box(20, 220, 52, c.fixed), k * 180, 10, -14, scene); });   // posts x 170..190, y -100..120, z -40..12; stand on the base top y -100
    P.at(P.box(420, 12, 80, c.fixed), 0, -106, -20, scene);                     // base x -210..210, y -112..-100, z -60..20
    P.at(P.cylX(5, 340, c.fixed), 0, 40, -30, scene);                           // bar x -170..170, y 35..45, z -35..-25, post face to post face
  },

  step: function (c, dt, S) {
    var o = this.o, rw = +S.controls.pin || 33;
    o.phi += S.w * dt;
    var th = o.base + o.phi / o.N;                                              // one tooth per turn of the worm; the worm travels with the wheel
    var be = th + o.b, cb = Math.cos(be), sb = Math.sin(be);
    var dy = o.YP - rw * sb;
    var x = o.XP - rw * cb - Math.sqrt(o.L * o.L - dy * dy);                    // the rod keeps its length
    o.car.position.x = x; o.worm.position.x = x;
    o.wheel.rotation.z = th; o.shaft.rotation.x = o.phi; o.worm.rotation.x = o.phi;
    o.wrist.position.set(rw * Math.cos(o.b), rw * Math.sin(o.b), 14.25);
    var wx = x + rw * cb, wy = rw * sb;
    o.rod.position.set(wx, wy, 0);
    o.rod.rotation.z = Math.atan2(o.YP - wy, o.XP - wx);
    function f(v) { return Math.round(v * 100) / 100; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm) + " rpm");
    S.set("wh", f(rpm / o.N) + " rpm");
    S.set("sl", Math.round(x) + " mm");
  }
});
