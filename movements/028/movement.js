M507.define({
  number: 28,
  title: "Brush wheels",
  lede: "A flat disc turns on an upright shaft. A small wheel rests on its face and is turned by rubbing. Slide the small wheel nearer the edge and it spins faster, without stopping the machine.",
  alt: "A wide flat disc on an upright shaft, faced with dark rubber. Above it a sideways shaft between two uprights carries a small wheel that rests on the disc's face and can slide along the shaft.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "A wide flat wheel on an upright shaft. It does the driving. Its top is faced with rubber so it grips better." },
    { key: "wheel", color: "#C8873A", name: "Small wheel", note: "Rests on the disc and is turned by rubbing. It can slide along its shaft. Watch the red mark to see how fast it turns." },
    { key: "shaft", color: "#4FA58A", name: "Driven shaft", note: "The sideways shaft the small wheel drives. A long thin strip on it, called a feather, fits a groove in the wheel. The wheel can slide but cannot turn on its own." }
  ],
  controls: [{ type: "range", id: "d", label: "Small wheel's place", min: -85, max: 85, step: 1, value: 70, unit: "% to the edge",
    presets: [[15, "Near centre"], [45, "Middle"], [85, "Near edge"], [-45, "Other side"]] }],
  readouts: [{ id: "disc", label: "Disc" }, { id: "wheel", label: "Small wheel" }],
  views: { "3d": [320, 205, 460], front: [0, -40, 640], side: [640, -20, 40] },
  target: [0, -50, 0],
  how: [
    "The disc turns and the small wheel turns with it, because the two rub together. Nothing else joins them. Rubber on the disc's face helps it grip.",
    "A point near the disc's edge travels a long way in each turn. A point near the centre hardly moves. The small wheel's rim must keep up with the part of the disc it sits on. So near the edge it spins fast, and near the centre it barely turns.",
    "Try moving the small wheel from near the centre to near the edge while it runs. Then slide it past the centre to the other side and watch it turn the other way."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the disc, its shaft and the small wheel. The uprights, the footstep bearing, the base and the key on the shaft were made up, as were all the sizes. A real friction drive slips a little, so the small wheel turns a bit slower than shown.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { R: 110, r: 30, YS: 33, x: 77, a: 0, b: 0 };

    // base and footstep bearing (supports)
    P.at(P.box(320, 10, 90, c.fixed), 0, -215, 0, scene);              // base: y -220..-210
    P.at(P.box(40, 20, 40, c.fixed), 0, -200, 0, scene);               // footstep: y -210..-190, sits on the base top
    // uprights carrying the sideways shaft
    P.at(P.box(16, 255, 22, c.fixed), -140, -82.5, 0, scene);          // x -148..-132, y -210..45
    P.at(P.box(16, 255, 22, c.fixed), 140, -82.5, 0, scene);           // x 132..148, y -210..45

    // disc on its upright shaft
    o.disc = new T.Group(); scene.add(o.disc);
    var md = c.mat("disc");
    P.at(P.cylY(8, 150, md), 0, -115, 0, o.disc);                      // shaft y -190..-40, ends on the footstep top
    P.at(P.mesh(new T.CylinderGeometry(34, 16, 30, 48), md), 0, -25, 0, o.disc);   // flared hub y -40..-10
    P.at(P.cylY(o.R, 10, md), 0, -5, 0, o.disc);                       // disc y -10..0
    P.at(P.cylY(108, 3, c.mat("disc", "dark")), 0, 1.5, 0, o.disc);    // rubber facing y 0..3, inside the disc's edge
    var stripe = P.at(P.box(96, .6, 5, c.mat("disc", "light")), 58, 3.6, 0, o.disc);   // lifted 0.3..0.9 off the rubber

    // sideways shaft with its feather
    o.shaft = new T.Group(); o.shaft.position.set(0, o.YS, 0); scene.add(o.shaft);
    var ms = c.mat("shaft");
    o.shaft.add(P.cylX(5, 264, ms));                                   // x -132..132, ends on the upright faces
    P.at(P.box(256, 3, 3, ms), 0, 5.5, 0, o.shaft);                    // feather, y 4..7 over a shaft of radius 5

    // small wheel, rim touching the rubber (centre 33 - radius 30 = 3)
    o.wheel = new T.Group(); o.wheel.position.set(o.x, o.YS, 0); scene.add(o.wheel);
    var mw = c.mat("wheel");
    o.wheel.add(P.cylX(o.r, 14, mw));                                  // x -7..7
    P.at(P.cylX(10, 26, mw), 0, 0, 0, o.wheel);                        // boss round the shaft
    var red = c.mat("wheel", "mark");
    P.at(P.box(12, .8, 5, red), 0, o.r + .5, 0, o.wheel);              // across the rim, lifted 0.1..0.9
    P.at(P.box(.8, 18, 4, red), 7.5, 20, 0, o.wheel);                  // on each side face, lifted 0.1..0.9
    P.at(P.box(.8, 18, 4, red), -7.5, 20, 0, o.wheel);
  },

  step: function (c, dt, S) {
    var o = this.o;
    var target = S.controls.d / 100 * o.R;
    o.x += (target - o.x) * Math.min(1, dt * 5);                       // slide along the feather
    o.wheel.position.x = o.x;
    o.a += S.w * dt;
    o.disc.rotation.y = o.a;
    // disc surface under the wheel moves at w * x; the wheel's rim must match: w_wheel * r = w * x
    o.b += S.w * o.x / o.r * dt;
    o.wheel.rotation.x = o.b; o.shaft.rotation.x = o.b;
    var wr = S.rpm * o.x / o.r;
    S.set("disc", Math.round(S.rpm) + " rpm");
    S.set("wheel", (Math.abs(wr) < .05 ? "0.0" : wr.toFixed(1)) + " rpm");
  }
});
