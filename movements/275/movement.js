M507.define({
  number: 275,
  title: "Worm and rack",
  lede: "A screw stands on an upright shaft beside a straight bar with teeth, called a rack. When the screw turns, its thread pushes the teeth along and the rack slides up or down its own length. Turn the screw the other way and the rack comes back.",
  alt: "A tall flat bar with teeth along its right edge stands upright. Beside it, a screw thread winds round an upright shaft, its thread fitting between the teeth of the bar.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Worm", note: "A screw on an upright shaft, called a worm. It turns. Watch the red stripe on its shaft." },
    { key: "rack", color: "#C8873A", name: "Rack", note: "A tall bar with teeth on one edge. The thread sits between its teeth. It slides up and down but cannot turn. Watch the red mark on it." }
  ],
  controls: [{ id: "starts", label: "Worm", value: "1", options: [["1", "One thread"], ["2", "Two threads"]] }],
  readouts: [{ id: "t", label: "Worm" }, { id: "x", label: "Rack" }],
  speed: { min: 1, max: 30, value: 8, label: "Turning speed", unit: " a min" },
  views: { "3d": [340, 180, 660], front: [-10, 15, 900], side: [900, 15, 0] },
  target: [-10, 15, 0],
  distance: [300, 2000],
  how: [
    "The screw turns on its shaft. The thread winds round it like the thread of a bolt. It sits in a gap between two teeth of the rack. As the screw turns, the thread slides along the shaft, so it pushes a tooth and the rack moves.",
    "In one turn of the screw, the thread moves along by the distance from one thread to the next. That is the same as the distance from one tooth to the next. So one turn moves the rack on by one tooth. A rack is a good way to turn a spin into a slow, strong, straight push.",
    "The screw turns a few times one way, then a few times back. Try One thread, then Two threads. With two threads, each turn moves the rack on by two teeth. The screw turns the same amount, but the rack goes twice as far."
  ],
  note: "This model is rebuilt from Brown's drawing. The worm and the rack are as drawn. The plate behind, the two bearings, the rail the rack slides on, the sizes and the number of teeth were made up. The screw turns back and forth because the rack is not infinitely long. The worm with two threads was added for comparison.",

  // Module 8: pitch 25.13. Worm axis vertical at x = 0, z = 0, centre y = 0; contact on its left (-X) side. Rack pitch line x = -28 (worm pitch radius).
  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 8, p = Math.PI * MD, RW = 28, XP = -RW, NR = 12, RACK0 = -3 * p;
    var o = this.o = { p: p, a: 0, RACK0: RACK0, worms: {} };
    // worms: built along local X, the outer group turns the axis to point down (world -Y), contact side at world -X
    [1, 2].forEach(function (s) {
      var G = new T.Group(); G.rotation.z = -Math.PI / 2; scene.add(G);
      var W = new T.Group(); G.add(W);
      W.add(P.worm({ radius: RW, pitch: p, length: 130, starts: s, material: c.mat("worm") }));   // x -65..65, tip r 36, root r 18
      P.at(P.cylX(7, 240, c.mat("worm")), 0, 0, 0, W);                                  // shaft x -120..120, bearing face to bearing face
      [-1, 1].forEach(function (k) { P.at(P.box(32, 1, 3, c.mat("worm", "mark")), k * 92, 7, 0, W); });   // red stripes x 76..108 / -108..-76, y 6.5..7.5, off the shaft
      o.worms[s] = { G: G, W: W, lead: s * p };
    });
    // rack, teeth toward the worm (+X), local y runs up the world
    o.rack = new T.Group(); scene.add(o.rack);
    var rack = P.rack({ teeth: NR, module: MD, side: 1, body: 28, thick: 16, material: c.mat("rack") });
    P.at(rack, XP, 0, 0, o.rack);                                                       // pitch line x -28, root x -38, back face x -66, z -8..8
    P.at(P.box(16, 6, 1, c.mat("rack", "mark")), -52, 50, 9, o.rack);                   // red mark on the bar, x -60..-44, z 8.5..9.5 (the bar face is z 8)
    // supports: plate behind, two bearings for the worm shaft, a rail behind the rack
    P.at(P.box(240, 455, 10, c.fixed), -40, 12.5, -55, scene);                           // plate x -160..80, y -215..240, z -60..-50
    P.at(P.box(30, 24, 70, c.fixed), 0, 132, -15, scene);                               // top bearing x -15..15, y 120..144, z -50..20; shaft ends at y 120
    P.at(P.box(30, 24, 70, c.fixed), 0, -132, -15, scene);                              // bottom bearing y -144..-120, shaft ends at y -120
    P.at(P.box(12, 455, 58, c.fixed), -72, 12.5, -21, scene);                            // rail x -78..-66, y -215..240, z -50..8; rack back face at x -66
  },

  step: function (c, dt, S) {
    var o = this.o, s = +S.controls.starts || 1, k, W = o.worms[s];
    o.a += S.w * dt;
    var turns = 2.2 * (1 - Math.cos(o.a)) / 2;                                          // worm turns, one way and back
    var phi = -turns * 2 * Math.PI;
    for (k in o.worms) o.worms[k].G.visible = +k === s;
    W.W.rotation.x = phi;
    var shift = W.lead * phi / (2 * Math.PI);                                           // the thread moves along the shaft; the rack follows
    o.rack.position.y = o.RACK0 + shift;
    S.set("t", (turns < .05 ? "" : "−") + turns.toFixed(1) + " turns");
    S.set("x", Math.round(-shift) + " mm down");
  }
});
