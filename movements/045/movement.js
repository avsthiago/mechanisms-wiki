M507.define({
  number: 45,
  title: "Frictional grooved gearing",
  lede: "Two wheels with no teeth turn each other just by pressing together. Their rims are cut into ridges and grooves that fit into each other. The sloping sides wedge tight, so they grip much harder than flat rims would.",
  alt: "Two wide wheels, one above the other, on level shafts that stick out of an upright plate. Each rim is cut into rings of V-shaped ridges, and the ridges of the top wheel sit in the grooves of the bottom one. A crank turns the top wheel, and a red stripe marks the bottom wheel.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving wheel", note: "Turned by the crank. Its ridges press down into the grooves of the wheel below." },
    { key: "driven", color: "#C8873A", name: "Driven wheel", note: "It has no teeth. Only the rub in its grooves makes it turn. Watch the red stripe to count its turns." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the driving wheel. In a real machine an engine or a water wheel would do this." }
  ],
  controls: [{ id: "press", label: "Wheels", value: "in", options: [["in", "Pressed together"], ["out", "Pulled apart"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [560, 270, 740], front: [0, 20, 980], side: [980, 20, 0] },
  target: [0, 20, 0],
  how: [
    "Turn the crank and the top wheel turns. Its rim presses on the rim of the bottom wheel, and the rub between them turns that wheel too. The two wheels turn opposite ways. A minus sign in the readout means the other way.",
    "Look at the wheels from the front. The rims are cut into V-shaped rings, and each ridge sits in a groove of the other wheel. When the wheels are pressed together, the sloping sides squeeze into each other like a wedge. That squeeze makes the rub much stronger than on flat rims, so the wheels slip less. The smaller wheel turns faster, because a turn of its rim covers less ground.",
    "Try Pulled apart, then Pressed together. Apart, the top wheel spins alone and the bottom wheel stops. There are no teeth, so only the pressing makes it work."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows two wheels edge on, the bottom one a bit larger, and a close-up of the ridges fitting together. The plate that holds the shafts, the crank, the number and depth of the ridges and the exact sizes were made up. The choice to pull the wheels apart was added to show that only the pressing makes them drive.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var R1 = 85, R2 = 118, W = 120, A = 7, Y0 = 60;    // pitch radii, rim width, half the ridge depth, height of the meeting line
    var o = this.o = { a: 0, b: 0, lift: 0, R1: R1, R2: R2, Y0: Y0 };
    // rim outlines: a point every half ridge across the width; the top wheel's ridges sit in the bottom wheel's grooves
    function rim(R, sign) { var p = [], i; for (i = 0; i <= 10; i++) { var q = [R + sign * (i % 2 ? A : -A), -W / 2 + i * W / 10]; p.push(q); if (i > 0 && i < 10) p.push(q); } return p; }   // each corner doubled so it stays sharp
    function wheel(key, R, sign, markStyle) {
      var g = new T.Group(); scene.add(g);
      var w = P.lathePulley({ points: rim(R, sign), material: c.mat(key), mark: c.mat(key, markStyle), segments: 96 });
      w.rotation.y = Math.PI / 2; g.add(w);                                   // lathe axis Z -> world X; rim x -60..60
      P.at(P.cylX(11, 4, c.mat(key)), 62, 0, 0, g);                           // hub x 60..64, on the end face
      var rIn = 12, rOut = R - sign * A - 3;                                  // stripe from the hub to just inside the end face's edge
      P.at(P.box(1, rOut - rIn, 5, c.mat(key, markStyle)), 61, (rIn + rOut) / 2, 0, g);   // stripe x 60.5..61.5, lifted off the end face
      return g;
    }
    o.top = wheel("drive", R1, 1, "dark");                                    // ridges at x = -48, -24, 0, 24, 48
    o.bot = wheel("driven", R2, -1, "mark");                                  // ridges at x = -60, -36, -12, 12, 36, 60
    P.at(P.cylX(6, 186, c.mat("drive")), -3, 0, 0, o.top);                    // shaft x -96..90, starts at the plate face
    P.at(P.cylX(6, 166, c.mat("driven")), -13, 0, 0, o.bot);                  // shaft x -96..70, starts at the plate face
    P.at(P.cylX(9, 6, c.mat("driven")), 67, 0, 0, o.bot);                     // collar x 64..70, on the hub
    P.at(P.box(6, 52, 12, c.mat("crank")), 93, 22, 0, o.top);                 // arm x 90..96, y -4..48, on the shaft end
    P.at(P.cylX(5, 24, c.mat("crank")), 108, 44, 0, o.top);                   // handle x 96..120, on the arm face
    // supports
    P.at(P.box(10, 395, 300, c.fixed), -101, 2.5, 0, scene);                  // plate x -106..-96, y -195..200, z -150..150; shafts end at x -96
    P.at(P.box(260, 12, 320, c.fixed), -10, -201, 0, scene);                 // base x -140..120, y -207..-195, z -160..160; plate stands on y -195
    o.bot.position.y = Y0 - R2 - .3;                                          // lowest point of the bottom wheel y -183.3, clear of the base
  },

  step: function (c, dt, S) {
    var o = this.o, apart = S.controls.press === "out", target = apart ? 26 : 0, d = target - o.lift, v = 60 * dt;
    o.lift += Math.abs(d) < v ? d : (d > 0 ? v : -v);                         // slide the top wheel up or down in its bearing
    var grip = o.lift < .5;
    o.a += S.w * dt;
    if (grip) o.b -= S.w * dt * o.R1 / o.R2;                                  // rims roll together: opposite way, speeds in inverse ratio of radii
    o.top.position.y = o.Y0 + o.R1 + .3 + o.lift;
    o.top.rotation.x = o.a; o.bot.rotation.x = o.b;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 || !grip ? 0 : -rpm * o.R1 / o.R2));
  }
});
