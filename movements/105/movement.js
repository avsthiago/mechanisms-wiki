M507.define({
  number: 105,
  title: "Screw press",
  lede: "A big screw turns in a fixed nut and slides down as it turns. It carries a heavy block, called the ram, down onto a blank of metal and squeezes it. Presses like this stamp coins and medals.",
  alt: "A strong frame shaped like a letter C stands on a base. A thick screw runs down through a ring in its top arm. A long bar with a ball at each end is fixed across the top of the screw, and a round block hangs from its foot above a flat disc.",
  parts: [
    { key: "bar", color: "#5E7387", name: "Bar and balls", note: "The bar is the handle. The heavy balls on its ends keep it swinging once it is going, so it pushes hard." },
    { key: "screw", color: "#C8873A", name: "Screw", note: "A thick screw with a spiral thread. It runs through a fixed nut in the frame, so each turn moves it down by one step of the thread." },
    { key: "ram", color: "#8E7AA8", name: "Ram", note: "A heavy round block on the foot of the screw. Watch it slide straight down and squeeze the blank." },
    { key: "die", color: "#4FA58A", name: "Bed and blank", note: "The flat block that does not move, and the disc of metal lying on it. The ram presses the blank against the bed." }
  ],
  controls: [{ id: "pitch", label: "Thread", value: "f", options: [["f", "Fine"], ["c", "Coarse"]] }],
  readouts: [{ id: "t", label: "Screw" }, { id: "h", label: "Ram height" }],
  views: { "3d": [520, 230, 760], front: [0, 35, 900], side: [900, 35, 0] },
  target: [0, 35, 0],
  distance: [320, 2400],
  how: [
    "Push the bar round. The screw turns with it. Its thread runs in a nut fixed in the frame, so the screw cannot just spin. It has to travel down the nut, one step of the thread for each turn.",
    "The ram is on the foot of the screw, so it goes straight down without turning. It stops on the blank and squeezes it. Then the bar is swung back and the screw lifts the ram up again. The bar is long, so a small push on the balls gives a very large push on the blank.",
    "The ram always goes down the same distance. Try Fine, then Coarse. Count the turns the screw needs each time, and look at how the thread is spaced."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the base, the bed and the blank, the sizes and the thread spacing were made up. Brown draws the bar swinging back and forth; here it turns round and back so the turns can be counted. The coarse thread has two threads side by side. A guide in the frame was added so the ram stays upright.",

  K: { DROP: 70, LEN: 200, TOP: 222, HOLE: 27.5, LEAD: { f: 14, c: 40 } },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { u: 0, mode: "f", screws: {} };
    // moving screw group: origin at world y 0 at rest, drops by DROP. spin turns about the axis (Y).
    o.screw = new T.Group(); scene.add(o.screw);
    o.spin = new T.Group(); o.screw.add(o.spin);
    var hold = { f: { pitch: 14, starts: 1 }, c: { pitch: 20, starts: 2 } };
    ["f", "c"].forEach(function (k) {
      var h = new T.Group(); h.rotation.z = Math.PI / 2; h.position.y = K.TOP - K.LEN / 2;   // thread y 22..222, axis turned from X to Y
      P.at(P.worm({ radius: 20, pitch: hold[k].pitch, length: K.LEN, starts: hold[k].starts, material: c.mat("screw") }), 0, 0, 0, h);
      o.spin.add(h); o.screws[k] = h;
    });
    P.at(P.cylY(18, 30, c.mat("screw")), 0, K.TOP + 15, 0, o.spin);                       // hub y 222..252, on the thread's top end
    P.at(P.cylY(10, 10, c.mat("screw")), 0, 257, 0, o.spin);                              // cap y 252..262
    P.at(P.box(4, 24, 1.5, c.mat("screw", "mark")), 0, K.TOP + 15, 18.75, o.spin);          // red stripe on the hub, z 18..19.5
    [-1, 1].forEach(function (k) {
      P.at(P.cylX(5, 147, c.mat("bar")), k * 91.5, K.TOP + 15, 0, o.spin);                // bar x 18..165, from the hub face
      P.at(P.cylX(27, 14, c.mat("bar")), k * 172, K.TOP + 15, 0, o.spin);                 // ball disc x 165..179
      P.at(P.cylX(5, 10, c.mat("bar")), k * 184, K.TOP + 15, 0, o.spin);                  // end knob x 179..189
    });
    // ram: y -98..22 at rest, hangs from the foot of the screw
    o.ram = new T.Group(); scene.add(o.ram);
    P.at(P.cylY(30, 120, c.mat("ram")), 0, -38, 0, o.ram);                                  // y -98..22
    // fixed frame
    P.at(P.guideBlock({ w: 80, h: 50, d: 80, hole: K.HOLE, material: c.fixed }), 0, 125, 0, scene);       // nut x -40..40, y 100..150, z -40..40
    P.at(P.box(55, 40, 52, c.fixed), 67.5, 125, 0, scene);                                 // upper arm x 40..95, y 105..145, z -26..26
    P.at(P.box(30, 340, 60, c.fixed), 110, -20, 0, scene);                                 // column x 95..125, y -190..150, z -30..30
    P.at(P.guideBlock({ w: 80, h: 40, d: 80, hole: 30.5, material: c.fixed }), 0, -50, 0, scene);          // ram guide x -40..40, y -70..-30
    P.at(P.box(55, 30, 52, c.fixed), 67.5, -50, 0, scene);                                 // lower arm x 40..95, y -65..-35
    P.at(P.box(220, 12, 120, c.fixed), 30, -196, 0, scene);                                // base x -80..140, y -202..-190, z -60..60
    P.at(P.box(110, 12, 110, c.mat("die")), 0, -184, 0, scene);                            // bed x -55..55, y -190..-178 (stands on base top)
    P.at(P.cylY(40, 10, c.mat("die")), 0, -173, 0, scene);                                 // blank y -178..-168; ram stops on it
  },

  place: function (o, mode) {
    var K = this.K, f = (1 - Math.cos(o.u)) / 2, th = f * K.DROP / K.LEAD[mode] * 2 * Math.PI;
    for (var k in o.screws) o.screws[k].visible = k === mode;
    o.spin.rotation.y = -th;                      // clockwise from above: a right-hand thread goes down
    o.screw.position.y = o.ram.position.y = -K.DROP * f;
    return { f: f, th: th };
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, mode = S.controls.pitch === "c" ? "c" : "f";
    if (S.playing) o.u += S.w * dt;
    var r = this.place(o, mode);
    S.set("t", (r.th / (2 * Math.PI)).toFixed(1) + " turns");
    S.set("h", Math.round(K.DROP * (1 - r.f)) + " mm");
  }
});
