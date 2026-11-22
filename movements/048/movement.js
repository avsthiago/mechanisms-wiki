M507.define({
  number: 48,
  title: "Clutch box with loose gear",
  lede: "A gear turns all the time, but the shaft it sits on stays still. Push a sliding clutch against the gear and the shaft starts turning with it. The engine never has to stop.",
  alt: "A small gear at the top drives a big gear that is loose on a shaft. Toothed half of a clutch is fixed to the big gear. A second toothed half slides along the shaft, moved by a bent lever below.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Pinion", note: "The small driving gear at the top. It never stops turning." },
    { key: "loose", color: "#C8873A", name: "Loose gear", note: "Turned by the pinion. It is not fixed to the shaft, so it spins on its own. Half of the clutch, with square teeth called jaws, is fixed to its side." },
    { key: "clutch", color: "#8E7AA8", name: "Sliding clutch", note: "The other half of the clutch. It slides along the shaft on a long key, called a feather, so it always turns with the shaft." },
    { key: "out", color: "#4FA58A", name: "Shaft", note: "The shaft that gets driven. Watch the dark stripe near its right end." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "Pushes the sliding clutch in or pulls it out. A ring in a groove lets the clutch turn while the lever holds it." }
  ],
  controls: [{ id: "clutch", label: "Clutch", value: "out", options: [["in", "In"], ["out", "Out"]] }],
  readouts: [{ id: "in", label: "Driving shaft" }, { id: "out", label: "Driven shaft" }],
  views: { "3d": [420, 260, 640], front: [-15, 0, 720], side: [720, 30, 80] },
  target: [-15, 0, 0],
  how: [
    "A small gear, called a pinion, turns the big gear all the time. The gear is loose on the shaft, so the shaft stays still. Half of a clutch is fixed to the side of the gear and turns with it.",
    "The other half slides along the shaft on a long key. It cannot turn on the shaft, only slide. Push it in and its jaws fit between the jaws of the turning half. Now the gear, the clutch and the shaft all turn together. The big gear turns the other way to the pinion, so its speed shows a minus sign.",
    "Try In and watch the jaws. They wait tip to tip until the gaps come round, then drop in, and the shaft jumps to full speed at once. Try Out and the shaft slowly runs down."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown drew rounded teeth on the clutch; square jaws are used here. In the drawing the pinion seems to sit inside the edge of the big gear, so here it meshes on the upper front side of the gear, which looks the same from the front. The sizes, the tooth counts, the stand and the handle were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, F = c.fixed, MD = 6, NG = 32, NP = 10, NJ = 6, PX = 23, PY = -75, PZ = 44, PC = 126 / Math.SQRT2;
    var o = this.o = { ap: 0, g: 0, gamma: 0, gvel: 0, s: 0, locked: false, off: 0, NG: NG, NP: NP, NJ: NJ, PX: PX, PY: PY, PZ: PZ };
    function gear(n, w, key) { var g = P.spurGear({ teeth: n, module: MD, width: w, material: c.mat(key) }); g.rotation.y = Math.PI / 2; return g; }
    var mo = c.mat("out"), ml = c.mat("lever"), mk = c.mat("clutch");

    // pinion on the upper front side of the big gear, centres 96 + 30 = 126 apart
    o.pin = new T.Group(); o.pin.position.set(-108, PC, PC); scene.add(o.pin);
    var pg = gear(NP, 24, "drive"); o.pin.add(pg);                                     // x -120..-96
    P.at(P.cylX(8, 70, c.mat("drive")), -47, 0, 0, o.pin);                             // shaft x -190..-120, plate face at -190
    P.at(P.cylX(14, 4, c.mat("drive")), -14, 0, 0, o.pin);                             // hub x -124..-120, on the gear face
    P.at(P.box(1, 12, 4, c.mat("drive", "dark")), 13, 15, 0, o.pin);                   // stripe x -95.5..-94.5, lifted off the face
    o.stP = pg.pitch;

    // loose gear with its half of the clutch
    o.loose = new T.Group(); o.loose.position.x = 0; scene.add(o.loose);
    var gg = gear(NG, 16, "loose"); gg.position.x = -108; o.loose.add(gg);             // x -116..-100
    o.stG = gg.pitch;
    P.at(P.cylX(22, 12, c.mat("loose")), -122, 0, 0, o.loose);                         // hub x -128..-116
    P.at(P.cylX(35, 38, c.mat("loose")), -81, 0, 0, o.loose);                          // drum x -100..-62
    P.at(P.box(1, 45, 5, c.mat("loose", "dark")), -99, 62.5, 0, o.loose);              // stripe x -99.5..-98.5 on the gear face, r 40..85
    var jg = new T.Group(); jg.rotation.x = Math.PI / NJ; o.loose.add(jg);              // turned half a jaw so the gaps face the other half's jaws
    var jl = P.jawRing({ count: NJ, widthDeg: 26, rIn: 22, rOut: 35, len: 10, material: c.mat("loose") });
    jl.rotation.y = Math.PI / 2; jl.position.x = -62; jg.add(jl);                       // jaws x -62..-52

    // shaft with feather key; it runs through the loose gear without being fixed to it
    o.shaft = new T.Group(); scene.add(o.shaft);
    P.at(P.cylX(12, 350, mo), -15, 0, 0, o.shaft);                                     // x -190..160, between the stand faces
    P.at(P.box(120, 6, 6, mo), 10, 12, 0, o.shaft);                                    // feather x -50..70, y 9..15
    P.at(P.box(18, 2, 3, c.mat("out", "dark")), 135, 13, 0, o.shaft);                  // stripe y 12..14

    // sliding clutch: local x 0 is the jaw-side face of its body; out at x -18, home at x -52
    o.sl = new T.Group(); scene.add(o.sl);
    o.slSpin = new T.Group(); o.sl.add(o.slSpin);
    P.at(P.cylX(35, 52, mk), 26, 0, 0, o.slSpin);                                      // body 0..52
    P.at(P.cylX(22, 12, mk), 58, 0, 0, o.slSpin);                                      // groove 52..64
    P.at(P.cylX(30, 8, mk), 68, 0, 0, o.slSpin);                                       // flange 64..72
    P.at(P.box(40, 2, 4, c.mat("clutch", "dark")), 26, 36, 0, o.slSpin);               // stripe y 35..37 on the body
    var js = P.jawRing({ count: NJ, widthDeg: 26, rIn: 22, rOut: 35, len: 10, material: mk });
    js.rotation.y = -Math.PI / 2; o.slSpin.add(js);                                    // jaws -10..0
    P.at(P.cylX(31, 11, ml), 58, 0, 0, o.sl);                                          // shifter ring 52.5..63.5, does not turn
    P.at(P.cylZ(4, 16, ml), 58, 0, 39, o.sl);                                          // pin z 31..47, from the ring to the lever

    // bent lever (bell crank) in front, pivot below
    o.lever = new T.Group(); o.lever.position.set(PX, PY, PZ); scene.add(o.lever);
    o.arm = P.at(P.box(8, 1, 6, ml), 0, 0, 0, o.lever);
    P.at(P.cylZ(8, 6, ml), 0, 0, 0, o.lever);                                          // boss z 41..47
    P.at(P.box(60, 7, 6, ml), 30, 0, 0, o.lever);                                      // arm x 0..60
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.cylZ(5, 8, ml), 0, 0, 0, o.rod);
    P.at(P.box(5, 22, 5, ml), 0, -11, 0, o.rod);                                       // hangs y 0..-22
    P.at(P.sphere(5, ml), 0, -27, 0, o.rod);
    P.at(P.cylZ(3, 10, ml), PX, PY, 43, scene);                                         // pivot pin z 38..48, from the post face

    // stand
    P.at(P.box(390, 12, 180, F), -15, -128, 30, scene);                                // base x -210..180, y -134..-122, z -60..120
    P.at(P.box(16, 237, 150, F), -198, -3.5, 35, scene);                                // plate x -206..-190, y -122..115, z -40..110; both shafts end at x -190
    P.at(P.box(16, 142, 40, F), 168, -51, 0, scene);                                    // pedestal x 160..176, y -122..20; shaft ends at x 160
    P.at(P.box(12, 54, 12, F), PX, -95, 32, scene);                                     // lever post x 17..29, y -122..-68, z 26..38
  },

  step: function (c, dt, S) {
    var o = this.o, ENG = 34, TOUCH = 24, Q = 2 * Math.PI / o.NJ, cmd = S.controls.clutch === "in";
    function wrap(x) { return ((x + Q / 2) % Q + Q) % Q - Q / 2; }
    o.ap += S.w * dt;
    var fp = (1.25 * Math.PI + Math.PI / 2 - o.ap) / o.stP;
    o.g = .75 * Math.PI - o.stG * (.5 - fp);           // gear angle that keeps its teeth meshed with the pinion's
    var wg = -S.w * o.NP / o.NG, limit = cmd ? (o.locked ? ENG : TOUCH) : 0;
    if (cmd && !o.locked && Math.abs(o.s - TOUCH) < .5) {   // jaws tip to tip: wait until the gaps come round
      var rel = wrap(o.gamma - o.g), rv = o.gvel - wg, tol = Math.max(.05, Math.abs(rv) * dt * 1.2);
      if (Math.abs(rel) < tol && Math.abs(rv) > .01) { o.locked = true; o.off = o.gamma - o.g - rel; limit = ENG; }
    }
    var d = limit - o.s, mv = 40 * dt;
    o.s += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    if (o.locked && o.s < TOUCH + .5 && !cmd) o.locked = false;
    if (o.locked) { o.gamma = o.g + o.off; o.gvel = wg; }
    else { o.gvel *= Math.exp(-dt * 1.2); if (Math.abs(o.gvel) < .003) o.gvel = 0; o.gamma += o.gvel * dt; }

    o.pin.rotation.x = o.ap; o.loose.rotation.x = o.g;
    o.shaft.rotation.x = o.slSpin.rotation.x = o.gamma;
    o.sl.position.x = -18 - o.s;
    var dx = o.sl.position.x + 58 - o.PX, dy = -o.PY, L = Math.sqrt(dx * dx + dy * dy), del = Math.atan2(dx, dy);
    o.lever.rotation.z = -del; o.arm.scale.y = L; o.arm.position.y = L / 2;
    o.rod.position.set(o.PX + 60 * Math.cos(del), o.PY - 60 * Math.sin(del), o.PZ);

    function f(w) { var v = Math.round(w * 600 / (2 * Math.PI)) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("in", f(S.w)); S.set("out", f(o.gvel));
  }
});
