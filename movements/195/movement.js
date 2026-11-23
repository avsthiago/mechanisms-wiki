M507.define({
  number: 195,
  title: "Feed rolls driven by one worm",
  lede: "Two gears, one above the other, both turn from one screw that lies between them. The gears turn opposite ways, so the two rolls on their shafts pinch a rod and push it along. One screw feeds the rod through steadily and cannot be pushed back.",
  alt: "A gear with a red tooth sits above a plain round disc. Between them lies a short screw, and a rod passes sideways between two rolls behind the gears.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Worm", note: "The screw lying between the gears, called a worm. Some call it an endless screw. Its thread touches both gears. Watch the red stripes on its shaft to count turns." },
    { key: "upper", color: "#C8873A", name: "Upper driven gear and roll", note: "A gear with a roll behind it on the same shaft. Watch the red tooth creep round, one tooth for each turn of the worm." },
    { key: "lower", color: "#8E7AA8", name: "Lower driven gear and roll", note: "Just like the upper gear, but its teeth face away from you. A round cover hides them. The red stripe shows it turning the other way." },
    { key: "rolls", color: "#D9B13B", name: "Feed rolls", note: "Two plain rolls, one on each driven shaft. They pinch the rod between them and carry it along as they turn." },
    { key: "stock", color: "#4FA58A", name: "Rod", note: "The rod being fed, called the stock. Both rolls pinch it and move its surface the same way. Watch the red marks slide along." }
  ],
  controls: [{ id: "starts", label: "Worm", value: "1", options: [["1", "One thread"], ["2", "Two threads"]] }],
  readouts: [{ id: "fed", label: "Rod fed" }, { id: "roll", label: "Rolls" }],
  views: { "3d": [260, 150, 440], front: [0, 10, 560], side: [620, 0, 10] },
  target: [0, 0, 10],
  how: [
    "Turn the worm and its thread slides sideways, like the thread of a bolt that is turning. The thread sits in a gap of the upper gear and in a gap of the lower gear. It pushes both teeth the same way along the shaft.",
    "The upper gear touches the worm from above and the lower gear touches it from below. So the gears turn in opposite directions. That is just what two feed rolls need. Their touching sides both move the same way and carry the rod with them.",
    "Some worms have two threads wound side by side. Then each turn moves the gears on by two teeth, so the rod is fed twice as fast. Try One thread, then Two threads, and watch the red marks on the rod."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the posts that hold the worm, the sizes and the number of teeth were made up. The lower gear sits behind a round cover, so its teeth are hidden as in the drawing. The worm with two threads was added for comparison.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, N = 22, MD = 5, PITCH = Math.PI * MD, RW = 12, RR = 62;
    var o = this.o = { a: 0, wa: 0, N: N, worms: {} };
    var g0 = P.spurGear({ teeth: N, module: MD, width: 12, material: c.mat("upper") });
    var rp = g0.pitchRadius, yc = rp + RW;                                       // 55, wheel centres y = +-67
    o.st = g0.pitch;

    // each wheel group: centre on its shaft, local z as in the scene (gear z 24..36 after offset 30)
    function wheel(key, y, front) {
      var w = new T.Group(); w.position.set(0, y, 0); scene.add(w);
      var g = key === "upper" ? g0 : P.spurGear({ teeth: N, module: MD, width: 12, material: c.mat(key) });
      P.at(g, 0, 0, 30, w);                                                      // gear z 24..36
      P.at(P.cylZ(RR, 20, c.mat("rolls")), 0, 0, 0, w);                              // roll z -10..10, bottom/top touches the rod at y = +-5
      P.at(P.cylZ(12, 14, c.mat("rolls")), 0, 0, 17, w);                             // spacer z 10..24, roll face to gear face
      var zEnd = front ? 36 : 54;
      P.at(P.cylZ(6, zEnd + 20, c.mat(key)), 0, 0, (zEnd - 20) / 2, w);          // shaft z -20..zEnd, back plate face to front face
      if (front) {
        P.at(P.cylZ(14, 4, c.mat(key)), 0, 0, 38, w);                            // hub z 36..40, on the gear face
        P.at(P.cylZ(6.5, 1.5, c.mat(key, "dark")), 0, 0, 40.25, w);              // shaft end z 39.5..41
        var mk = new T.Group(); mk.rotation.z = 5 * g.pitch; w.add(mk);
        P.at(P.box(10, .2 * PITCH, 1, c.mat(key, "mark")), rp - 1, 0, 36.9, mk); // red tooth, z 36.4..37.4 off the face z 36
      } else {
        P.at(P.cylZ(RR, 6, c.mat(key)), 0, 0, 51, w);                            // cover disc z 48..54, hides the teeth, hides lower worm half
        P.at(P.cylZ(14, 4, c.mat(key)), 0, 0, 56, w);                            // hub z 54..58
        P.at(P.cylZ(6.5, 1.5, c.mat(key, "dark")), 0, 0, 58.25, w);              // shaft end z 57.5..59
        P.at(P.box(34, 4, 1, c.mat(key, "mark")), 38, 0, 54.9, w);               // red stripe x 21..55, z 54.4..55.4 off the face z 54
      }
      return w;
    }
    o.up = wheel("upper", yc, true);
    o.low = wheel("lower", -yc, false);

    // worm: axis along X at y = 0, z = 30
    [1, 2].forEach(function (s) {
      var w = new T.Group(); w.position.set(0, 0, 30); scene.add(w);
      w.thread = P.at(P.worm({ radius: RW, pitch: PITCH, length: 60, starts: s, material: c.mat("worm") }), 0, 0, 0, w);   // x -30..30, tip r 17, root r 5.75
      P.at(P.cylX(4, 140, c.mat("worm")), 0, 0, 0, w);                           // shaft x -70..70, post face to post face
      [-1, 1].forEach(function (k) { P.at(P.box(26, 1, 3, c.mat("worm", "mark")), k * 52, 4.75, 0, w); });   // red stripes x 39..65, y 4.25..5.25 off the shaft top y 4
      o.worms[s] = w;
    });

    // rod: round, along X, z = 0
    P.at(P.cylX(5, 320, c.mat("stock")), 0, 0, 0, scene);                        // x -160..160, y -5..5, touches the rolls at y +-5
    o.marks = [];
    for (var k = 0; k < 5; k++) o.marks.push(P.at(P.box(5, 3, 1, c.mat("stock", "mark")), 0, 0, 5.2, scene));   // z 4.7..5.7 on the rod front, y -1.5..1.5 clear of the rolls

    // supports
    [-1, 1].forEach(function (k) { P.at(P.box(20, 146, 24, c.fixed), k * 80, -61, 30, scene); });   // posts x 70..90 / -90..-70, y -134..12, z 18..42; worm shaft ends at x +-70; stand on base y -134
    P.at(P.box(200, 274, 10, c.fixed), 0, 3, -25, scene);                        // back plate x -100..100, y -134..140, z -30..-20; shafts end at z -20
    P.at(P.box(220, 12, 90, c.fixed), 0, -140, 15, scene);                       // base x -110..110, y -146..-134, z -30..60; plate and posts stand on y -134
  },

  step: function (c, dt, S) {
    var o = this.o, s = +S.controls.starts || 1, k, st = o.st;
    o.a += S.w * dt; o.wa += S.w * dt * s / o.N;           // the thread moves one tooth per turn for each thread it has
    for (k in o.worms) {
      var w = o.worms[k]; w.visible = +k === s; w.rotation.x = o.a;
      w.thread.rotation.x = o.N * o.wa / +k - o.a;          // thread phase kept in step with the wheels
    }
    o.low.rotation.z = Math.PI / 2 - st / 2 + o.wa;                           // gap at the top, turns anticlockwise
    o.up.rotation.z = -Math.PI / 2 + (s === 2 ? st / 2 : 0) - o.wa;           // thread meets the upper wheel half a pitch later with one thread; turns clockwise
    var d = 62 * o.wa;                                                         // rod fed, towards -X
    for (k = 0; k < o.marks.length; k++) {
      var x = (((k * 60 - d + 150) % 300) + 300) % 300 - 150;
      o.marks[k].position.x = x;
    }
    var rpm = S.playing ? S.rpm : 0;
    S.set("fed", Math.round(d) + " mm");
    S.set("roll", Math.round(rpm * s / o.N * 100) / 100 + " rpm");
  }
});
