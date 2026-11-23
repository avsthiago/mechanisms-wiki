M507.define({
  number: 103,
  title: "Screw and slide",
  lede: "A long screw is turned by a handle. A block on it cannot turn, so it is pushed along the screw. This is how a lathe or a vice moves something in a straight line, slowly and exactly.",
  alt: "A long level screw passes through an upright plate at the left, with a handle on the outside. A block with a hole for the screw stands on a straight rail below it. A red stripe on the block shows where it is.",
  parts: [
    { key: "screw", color: "#5E7387", name: "Screw", note: "A long rod with a thread wound round it. Watch the red stripe on its end to count the turns." },
    { key: "crank", color: "#D9B13B", name: "Handle", note: "Turns the screw by hand. In a real machine a motor could do this." },
    { key: "slide", color: "#C8873A", name: "Slide", note: "A block with a threaded hole, called a nut, round the screw. It rides on a rail and cannot turn. Watch the red stripe: it shows how far the slide has moved." }
  ],
  controls: [{ id: "dir", label: "Turn", value: "both", options: [["fwd", "Forwards"], ["back", "Backwards"], ["both", "Back and forth"]] }],
  readouts: [{ id: "t", label: "Screw turned" }, { id: "s", label: "Slide moved" }],
  views: { "3d": [250, 130, 440], front: [0, -20, 640], side: [440, -30, 30] },
  target: [0, -30, 0],
  how: [
    "Turn the handle and the screw spins. The slide has a threaded hole round the screw, but it sits on a rail and cannot spin with it. So the thread pushes it along, like a nut running along a bolt.",
    "In one turn of the screw, the slide moves by exactly the gap from one thread to the next. Two turns move it twice as far. The little marks on the rail are one gap apart, so you can count them. Turn the screw the other way and the slide comes back.",
    "Try Forwards. The slide runs along until it nears the end of the screw, and then the screw stops. Now try Backwards, and then Back and forth. Compare the turns with the millimetres moved."
  ],
  note: "This model is rebuilt from Brown's drawing. The handle, the rail, the base, the thread size and the ruler marks were made up. Brown shows only a square end on the screw for a handle. The screw is held by one plate, as drawn, and its other end is free. In the model the screw stops turning when the slide nears either end.",

  build: function (c) {
    var P = c.P, T = c.THREE || THREE, scene = c.scene, o = this.o = {};
    var PITCH = 20;
    o.P = PITCH; o.tmax = 10; o.xmin = -90; o.t = 3.5; o.dirNow = 1;

    // screw group: axis along X at y = 0, z = 0; turns about X
    o.screw = new T.Group(); scene.add(o.screw);
    P.at(P.worm({ radius: 14, pitch: PITCH, length: 260, starts: 1, material: c.mat("screw") }), 0, 0, 0, o.screw);   // x -130 (plate face) .. 130, tip r 20.4, root r 6
    P.at(P.cylX(6, 20, c.mat("screw")), -160, 0, 0, o.screw);                       // stub x -170 .. -150, from the plate's outer face
    P.at(P.box(14, 1, 3, c.mat("screw", "mark")), -160, 6.5, 0, o.screw);           // red stripe on the stub, x -167 .. -153, y 6 .. 7
    P.at(P.box(6, 40, 10, c.mat("crank")), -173, 12, 0, o.screw);                   // handle arm x -176 .. -170, y -8 .. 32, on the stub end
    P.at(P.cylX(4, 20, c.mat("crank")), -186, 26, 0, o.screw);                      // grip x -196 .. -176, on the arm face

    // slide: nut round the screw, stem and foot on the rail; origin at the screw axis
    o.slide = new T.Group(); scene.add(o.slide);
    var nut = P.guideBlock({ w: 64, h: 24, d: 44, hole: 21, material: c.mat("slide") });
    nut.rotation.z = Math.PI / 2; o.slide.add(nut);                                // nut x -12 .. 12, y -32 .. 32, z -22 .. 22, hole r 21 (thread tip 20.4)
    P.at(P.box(24, 38, 44, c.mat("slide")), 0, -51, 0, o.slide);                    // stem x -12 .. 12, y -70 .. -32, z -22 .. 22
    P.at(P.box(60, 8, 44, c.mat("slide")), 0, -74, 0, o.slide);                     // foot x -30 .. 30, y -78 .. -70, z -22 .. 22; rests on the rail at y -78
    P.at(P.box(6, 30, 1, c.mat("slide", "mark")), 0, -51, 22.5, o.slide);           // red stripe on the stem front, z 22 .. 23

    // rail with ruler marks one thread gap apart
    P.at(P.box(320, 16, 60, c.fixed), 30, -86, 0, scene);                          // rail x -130 .. 190, y -94 .. -78, z -30 .. 30
    for (var k = -5; k <= 8; k++) {
      P.at(P.box(1.5, 8, 1, c.mat("slide", "dark")), k * PITCH + 10, -86, 30.5, scene);   // marks every 20, x -90 .. 170, z 30 .. 31
    }

    // frame: upright plate holding the screw, and a base
    P.at(P.box(20, 134, 100, c.fixed), -140, -27, 0, scene);                       // plate x -150 .. -130, y -94 .. 40, z -50 .. 50; screw ends at its faces
    P.at(P.box(360, 12, 100, c.fixed), 10, -100, 0, scene);                        // base x -170 .. 190, y -106 .. -94, z -50 .. 50; plate and rail stand on y -94
  },

  step: function (c, dt, S) {
    var o = this.o, mode = S.controls.dir, dt2 = S.w * dt / (2 * Math.PI), t;
    if (mode === "fwd") o.dirNow = 1; else if (mode === "back") o.dirNow = -1;
    t = o.t + o.dirNow * dt2;
    if (t > o.tmax) { t = o.tmax; if (mode === "both") o.dirNow = -1; }
    if (t < 0) { t = 0; if (mode === "both") o.dirNow = 1; }
    o.t = t;
    o.screw.rotation.x = -2 * Math.PI * t;                         // threads at the bottom move toward +X as the screw turns this way
    o.slide.position.x = o.xmin + o.P * t;                         // one thread gap for each turn, exactly
    S.set("t", t.toFixed(1) + " turns");
    S.set("s", Math.round(o.P * t) + " mm");
  }
});
