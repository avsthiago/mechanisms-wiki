M507.define({
  number: 226,
  title: "Speeding up with equal bevel gears",
  lede: "Six bevel gears, all the same size, make one gear turn faster than the shaft that drives it. A frame carries one gear round the driven shaft, and that gear spins on its own pin as it goes. The two motions add up.",
  alt: "A level shaft with an upright shaft above it. The upright shaft's bevel gear drives two bevel gears on the long shaft. On the left a rectangular frame on the long shaft carries a bevel gear on a pin, which meshes with a bevel gear on each side of it.",
  parts: [
    { key: "top", color: "#5E7387", name: "Driving shaft", note: "The upright shaft with a hand wheel. Its gear drives two gears below it, one on each side, so those two turn opposite ways." },
    { key: "main", color: "#C8873A", name: "Driven shaft", note: "The long level shaft, driven by the upright one. The right gear under the driving shaft is fixed to it, so it turns as fast as the driving shaft." },
    { key: "hollow", color: "#E8E2D0", name: "Hollow shaft", note: "A tube that turns loosely round the driven shaft, the opposite way. It has a gear at each end." },
    { key: "frame", color: "#D9B13B", name: "Frame", note: "Fixed to the driven shaft by the pin that the middle gear turns on. It carries the middle gear round the shaft." },
    { key: "middle", color: "#8E7AA8", name: "Middle gear", note: "Turns on a pin in the frame. It is carried round by the frame and spun by the hollow shaft's gear at the same time." },
    { key: "end", color: "#4FA58A", name: "End gear", note: "Turns loosely on the driven shaft and is driven by the middle gear. Watch the crank on its tube to count its turns." }
  ],
  controls: [{ id: "hollow", label: "Hollow shaft", value: "in", options: [["in", "In place"], ["out", "Out, middle gear held"]] }],
  readouts: [{ id: "top", label: "Driving" }, { id: "main", label: "Driven" }, { id: "end", label: "End" }],
  views: { "3d": [260, 260, 700], front: [-10, 20, 760], side: [760, 60, 40] },
  target: [-10, 10, 0],
  how: [
    "Turn the driving shaft. Its gear drives two gears on the driven shaft, one on each side of it, so they turn opposite ways. The right one is fixed to the driven shaft. The left one is on a hollow shaft that turns loosely round the driven shaft.",
    "The frame is fixed to the driven shaft and carries the middle gear round with it. That alone would take the end gear round once for each turn of the driving shaft. But the hollow shaft turns the other way, so its gear also spins the middle gear on its pin. That spin turns the end gear twice more.",
    "So the end gear makes three turns for each turn of the driving shaft. Take the hollow shaft out and hold the middle gear still, and the end gear only goes round with the frame. Try both and compare the readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown says the end gear turns twice for each turn of the driving shaft. Following the gears through gives three turns: one with the frame, and two from the spin of the middle gear. So it turns twice as fast as the frame that carries it, and three times as fast as the shafts. The bearings, the stand, the pin through the driven shaft, the crank on the end gear, the hand wheel and the number of teeth were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = Math.PI / 2;
    var R = 60, N = 16, XB = 110, XD = -110;
    var o = this.o = { th: 0, d: 0, g: {} };
    var X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), Z = new T.Vector3(0, 0, 1);
    function gear(key, parent, apex, ax, xl, name) {     // bevel gear, pitch-cone apex at `apex` (x on the shaft line), axis ax pointing away from it
      var g = P.bevelGearCone({ radius: R, teeth: N, cone: 45, hub: 18, hubLength: 16, material: c.mat(key) });
      P.frame(g, xl, ax); g.position.copy(apex); parent.add(g);
      o.g[name] = g; return g;                           // back of the hub at R + 4.95 + 16 = 80.95 from the apex
    }
    var top = o.top = new T.Group(); top.position.set(XB, 0, 0); scene.add(top);
    var main = o.main = new T.Group(); scene.add(main);
    var hollow = o.hollow = new T.Group(); scene.add(hollow);
    var end = o.end = new T.Group(); scene.add(end);
    var frame = o.frame = new T.Group(); scene.add(frame);
    var mid = o.mid = new T.Group(); mid.position.set(XD, 0, 0); frame.add(mid);
    var V = function (x, y, z) { return new T.Vector3(x, y, z); };

    // top shaft: gear apex on the main shaft line, hub top y 80.95; shaft up to the arm's underside at y 170
    gear("top", top, V(0, 0, 0), Y, X, "B");
    P.at(P.cylY(8, 95, c.mat("top")), 0, 122.5, 0, top);                    // shaft y 75..170
    P.at(P.cylY(42, 18, c.mat("top")), 0, 128, 0, top);                      // hand wheel y 119..137
    P.at(P.box(34, 1, 5, c.mat("top", "dark")), 24, 137.5, 0, top);          // stripe y 137..138, lifted off the wheel's top face

    // main shaft with its gear (right of the top shaft) and a disc on its right end
    P.at(P.cylX(8, 580, c.mat("main")), -24, 0, 0, main);                    // shaft x -314..266
    gear("main", main, V(XB, 0, 0), X, Y, "F");                              // hub back at x 190.95
    P.at(P.cylX(34, 14, c.mat("main")), 245, 0, 0, main);                    // disc x 238..252
    P.at(P.box(1, 26, 5, c.mat("main", "dark")), 252.5, 17, 0, main);        // stripe x 252..253, lifted off the disc face

    // hollow shaft: gear left of the top shaft, a tube, and the gear on the right of the middle gear
    gear("hollow", hollow, V(XB, 0, 0), V(-1, 0, 0), Y, "C");               // hub back at x 29.05
    gear("hollow", hollow, V(XD, 0, 0), X, Y, "C2");                         // hub back at x -29.05
    P.at(P.cylX(13, 58.1, c.mat("hollow")), 0, 0, 0, hollow);                // tube x -29.05..29.05, hub to hub, round the main shaft (r 8)

    // end gear, left of the middle gear, with a tube out through the frame and a crank on its end
    gear("end", end, V(XD, 0, 0), V(-1, 0, 0), Y, "E");                      // hub back at x -190.95
    P.at(P.cylX(13, 55.05, c.mat("end")), -218.5, 0, 0, end);                // tube x -246..-190.95
    P.at(P.box(6, 70, 16, c.mat("end")), -249, 22, 0, end);                  // crank x -252..-246, y -13..57, on the tube end
    P.at(P.cylX(5, 14, c.mat("end", "mark")), -259, 47, 0, end);             // handle x -266..-252, on the crank face

    // frame, fixed to the main shaft by the middle gear's pin; bars z -8..8
    P.at(P.box(12, 192, 16, c.mat("frame")), -208, 0, 0, frame);             // left side x -214..-202, y -96..96, turns on the end gear's tube
    P.at(P.box(12, 192, 16, c.mat("frame")), -16, 0, 0, frame);              // right side x -22..-10, turns on the hollow shaft
    P.at(P.box(180, 16, 16, c.mat("frame")), -112, 88, 0, frame);            // top bar x -202..-22, y 80..96
    P.at(P.box(180, 16, 16, c.mat("frame")), -112, -88, 0, frame);           // bottom bar y -96..-80
    P.at(P.box(16, 16, 76, c.mat("frame")), XD, 88, 46, frame);              // block z 8..84 on the top bar
    P.at(P.box(16, 16, 76, c.mat("frame")), XD, -88, 46, frame);             // block z 8..84 on the bottom bar
    P.at(P.box(16, 192, 8, c.mat("frame")), XD, 0, 88, frame);               // strap z 84..92, y -96..96, across the blocks' ends
    P.at(P.cylZ(5, 84, c.mat("frame")), XD, 0, 42, frame);                   // pin z 0..84, from the main shaft's middle to the strap
    P.at(P.cylZ(10, 4, c.mat("frame", "dark")), XD, 0, 94, frame);           // nut z 92..96 on the strap face
    gear("middle", mid, V(0, 0, 0), Z, X, "D");                              // hub back at z 80.95, under the strap (z 84)

    // supports: two bearings for the main shaft, a post and arm for the top shaft, a base; base top y -145, frame sweeps to 133
    [-288, 214].forEach(function (x) {
      var b = P.bearingBlock({ bore: 8.5, outer: 18, drop: 145, width: 14, material: c.fixed });
      b.rotation.y = D; P.at(b, x, 0, 0, scene);                              // x -295..-281 and 207..221, foot at y -145
    });
    P.at(P.box(30, 315, 16, c.fixed), XB, 12.5, -120, scene);                // post x 95..125, y -145..170, z -128..-112, on the base
    P.at(P.box(30, 16, 136, c.fixed), XB, 178, -60, scene);                  // arm y 170..186, z -128..8, on the post top; top shaft ends at y 170
    P.at(P.box(620, 12, 220, c.fixed), -15, -151, -30, scene);               // base x -325..295, y -157..-145, z -140..80
    o.pitch = 2 * Math.PI / N;
  },

  step: function (c, dt, S) {
    var o = this.o, held = S.controls.hollow === "out";
    o.th += S.w * dt;                                     // top shaft angle
    var th = o.th, a = -th;                               // main shaft and frame, about +X: the right gear turns against the top gear
    if (!held) {                                          // hollow shaft turns +th, so relative to the frame it turns 2 th, and spins the middle gear -2 th
      var free = -2 * th;
      o.d = free + o.pitch * Math.round((o.d - free) / o.pitch);   // only jumps (less than half a tooth) when the hollow shaft goes back in
    }
    o.hollow.visible = !held;
    o.top.rotation.y = th;
    o.main.rotation.x = a + o.pitch / 2;                 // half a tooth on every second gear so the teeth fall between each other
    o.hollow.rotation.x = th + o.pitch / 2;
    o.frame.rotation.x = a;
    o.mid.rotation.z = o.d;                               // spin of the middle gear on its pin
    o.end.rotation.x = a + o.d + o.pitch / 2;             // end gear: the frame's turn plus the middle gear's spin
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("top", f(rpm));
    S.set("main", f(rpm));
    S.set("end", f(held ? rpm : 3 * rpm));
  }
});
