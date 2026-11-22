M507.define({
  number: 207,
  title: "Feed rolls with two worms",
  lede: "One long shaft carries two screws. Each screw turns a gear above it, and a roll sits on each wheel shaft. Both rolls turn the same way at the same speed, so they feed stock steadily.",
  alt: "Two upright gears side by side, each with a bigger plain roll behind it. A level shaft under them carries a short screw below each wheel. A red tooth marks each wheel.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Driving shaft", note: "A level shaft with two screws on it, also called worms. Each thread sits in the teeth of the wheel above it. Watch the red stripes to count turns." },
    { key: "wheel", color: "#C8873A", name: "Worm wheels", note: "Two gears, one over each worm. Watch the red teeth creep round together, one tooth for each turn of the shaft." },
    { key: "rolls", color: "#D9B13B", name: "Feed rolls", note: "A plain roll behind each wheel, on the same shaft. The red marks on their rims show how fast they turn. Stock would be pinched against them and carried along." }
  ],
  controls: [{ id: "starts", label: "Worms", value: "1", options: [["1", "One thread"], ["2", "Two threads"]] }],
  readouts: [{ id: "in", label: "Shaft" }, { id: "out", label: "Rolls" }],
  views: { "3d": [235, 155, 520], front: [0, 50, 700], side: [620, 40, 10] },
  target: [0, 50, 10],
  how: [
    "Turn the long shaft and both screws, called worms, turn with it. Each thread slides sideways and pushes the teeth of the wheel above it. Both worms wind the same way and sit under their wheels, so both wheels turn clockwise.",
    "A roll is fixed to each wheel and turns with it. The two rolls turn together, at exactly the same speed. Stock held against both is fed straight, without twisting. The worms also stop the rolls being pushed back by the stock.",
    "Some worms have two threads wound side by side. Then each turn moves the wheels on by two teeth, so the rolls go twice as fast. Try One thread, then Two threads, and watch the red marks on the rolls."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the posts that hold the shaft, the sizes and the number of teeth were made up. The drawing shows teeth only along the bottom of each wheel. Here the teeth go all the way round so that the wheels can keep turning. The matching rolls that would pinch the stock are not drawn, and neither is the stock. The worms with two threads were added for comparison.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, N = 24, MD = 5, PITCH = Math.PI * MD, RW = 12, RR = 74, X0 = 92;
    var o = this.o = { a: 0, wa: 0, N: N, wheels: [], worms: [] };
    var g0 = P.spurGear({ teeth: N, module: MD, width: 12, material: c.mat("wheel") });
    var rp = g0.pitchRadius, yc = rp + RW; o.st = g0.pitch;                      // 60, wheel centres y = +72

    [-1, 1].forEach(function (side, i) {
      var x = side * X0, w = new T.Group(); w.position.set(x, yc, 0); scene.add(w);
      var g = i === 0 ? g0 : P.spurGear({ teeth: N, module: MD, width: 12, material: c.mat("wheel") });
      P.at(g, 0, 0, 30, w);                                                      // gear z 24..36
      P.at(P.cylZ(RR, 20, c.mat("rolls")), 0, 0, 0, w);                          // roll z -10..10, r 74 behind the gear tip r 65
      P.at(P.cylZ(12, 14, c.mat("rolls")), 0, 0, 17, w);                         // spacer z 10..24
      P.at(P.cylZ(6, 56, c.mat("wheel")), 0, 0, 8, w);                           // shaft z -20..36, back plate face to gear face
      P.at(P.cylZ(14, 4, c.mat("wheel")), 0, 0, 38, w);                          // hub z 36..40, on the gear face
      P.at(P.cylZ(6.5, 1.5, c.mat("wheel", "dark")), 0, 0, 40.25, w);            // shaft end z 39.5..41
      P.at(P.box(8, 3, 1, c.mat("rolls", "mark")), RR - 4, 0, 10.6, w);          // red roll mark r 66..74, z 10.1..11.1 off the roll face z 10
      var mk = new T.Group(); mk.rotation.z = 8 * g.pitch; w.add(mk);
      P.at(P.box(10, .2 * PITCH, 1, c.mat("wheel", "mark")), rp - 1, 0, 36.9, mk);   // red tooth z 36.4..37.4 off the face z 36
      o.wheels.push(w);

      [1, 2].forEach(function (s) {
        var wm = new T.Group(); wm.position.set(x, 0, 30); scene.add(wm);
        wm.thread = P.at(P.worm({ radius: RW, pitch: PITCH, length: 52, starts: s, material: c.mat("worm") }), 0, 0, 0, wm);   // x +-26, tip r 17, root r 5.75
        o.worms.push({ s: s, g: wm });
      });
    });

    // one shaft, with red stripes that turn with it
    o.shaft = new T.Group(); o.shaft.position.set(0, 0, 30); scene.add(o.shaft);
    P.at(P.cylX(4, 340, c.mat("worm")), 0, 0, 0, o.shaft);                       // shaft x -170..170, post face to post face
    [-1, 1].forEach(function (k) { P.at(P.box(20, 1, 3, c.mat("worm", "mark")), k * 135, 4.75, 0, o.shaft); });   // red stripes x 125..145, y 4.25..5.25 off the shaft top y 4

    // supports
    [-1, 1].forEach(function (k) { P.at(P.box(20, 54, 24, c.fixed), k * 180, -13, 30, scene); });   // posts x 170..190, y -40..14, z 18..42; shaft ends at x +-170
    P.at(P.box(400, 200, 10, c.fixed), 0, 60, -25, scene);                       // back plate x -200..200, y -40..160, z -30..-20; wheel shafts end at z -20
    P.at(P.box(420, 12, 90, c.fixed), 0, -46, 15, scene);                        // base x -210..210, y -52..-40, z -30..60; plate and posts stand on y -40
  },

  step: function (c, dt, S) {
    var o = this.o, s = +S.controls.starts || 1, k;
    o.a += S.w * dt; o.wa += S.w * dt * s / o.N;
    o.shaft.rotation.x = o.a;
    o.worms.forEach(function (m) {
      m.g.visible = m.s === s; m.g.rotation.x = o.a;
      m.g.thread.rotation.x = o.N * o.wa / m.s - o.a;
    });
    o.wheels.forEach(function (w) { w.rotation.z = -Math.PI / 2 + (s === 2 ? o.st / 2 : 0) - o.wa; });
    function f(v) { return Math.round(v * 100) / 100 + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm * s / o.N));
  }
});
