M507.define({
  number: 52,
  title: "Stud clutch",
  lede: "Two discs sit face to face on two shafts. One has two pins sticking out, the other has two holes. Push them together and the pins drop into the holes, so both shafts turn as one.",
  alt: "A disc with two short pins on its face, fixed to a turning shaft. A second disc with two holes slides along another shaft, moved by a bent lever below. A coupling sits on the far end.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Stud disc", note: "Fixed to the driving shaft, which never stops. Two short pins, called studs, stick out from its face." },
    { key: "clutch", color: "#C8873A", name: "Sliding disc", note: "Has two holes that match the studs. It slides along the driven shaft on a long key, called a feather, so it always turns with that shaft." },
    { key: "out", color: "#4FA58A", name: "Driven shaft", note: "Starts and stops with the sliding disc. Its end turns freely in a hole in the stud disc. Watch the dark stripe." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "Pushes the sliding disc against the stud disc or pulls it away. A ring in a groove lets the disc turn while the lever holds it." }
  ],
  controls: [{ id: "clutch", label: "Clutch", value: "out", options: [["in", "In"], ["out", "Out"]] }],
  readouts: [{ id: "in", label: "Driving shaft" }, { id: "out", label: "Driven shaft" }],
  views: { "3d": [420, 240, 640], front: [0, -5, 760], side: [740, 30, 80] },
  target: [0, -5, 0],
  how: [
    "The stud disc turns all the time. The sliding disc is a little way off, so the driven shaft stands still. Nothing touches.",
    "Push the sliding disc in and it meets the tips of the studs. It must wait until its holes come round to the studs. Then the studs slip in and the two discs are locked. The driven shaft jumps straight to the same speed.",
    "Try In and count how long the disc waits. With only two studs it can wait up to half a turn. Then try Out and watch the shaft run down."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the stands and the lever handle were made up. Brown does not show where the two shafts meet; here the end of the driven shaft turns in a hole in the stud disc. The coupling on the right end of the driven shaft is copied from the drawing; it would join the shaft to the next one.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, F = c.fixed, PX = 10, PY = -70, PZ = 36;
    var o = this.o = { alpha: 0, gamma: 0, gvel: 0, s: 0, locked: false, off: 0, PX: PX, PY: PY, PZ: PZ };
    var md = c.mat("drive"), mo = c.mat("out"), mk = c.mat("clutch"), ml = c.mat("lever");

    // driving shaft and stud disc
    o.drv = new T.Group(); scene.add(o.drv);
    P.at(P.cylX(9, 60, md), -160, 0, 0, o.drv);                                    // shaft x -190..-130, ends inside the hub
    P.at(P.cylX(24, 33, md), -130.5, 0, 0, o.drv);                                 // hub x -147..-114
    P.at(P.cylX(84, 36, md), -96, 0, 0, o.drv);                                    // disc x -114..-78
    [1, -1].forEach(function (s) { P.at(P.cylX(7, 22, md), -67, s * 68, 0, o.drv); });   // studs x -78..-56 on the disc face
    P.at(P.box(18, 2, 3, c.mat("drive", "dark")), -170, 10, 0, o.drv);            // stripe y 9..11 on the shaft

    // driven shaft with feather key and coupling
    o.shaft = new T.Group(); scene.add(o.shaft);
    P.at(P.cylX(12, 290, mo), 45, 0, 0, o.shaft);                                  // x -100..190, its end turns inside the stud disc
    P.at(P.box(131, 6, 6, mo), 9.5, 12, 0, o.shaft);                               // feather x -56..75, y 9..15
    P.at(P.box(18, 2, 3, c.mat("out", "dark")), 98, 13, 0, o.shaft);              // stripe y 12..14
    P.at(P.cylX(22, 50, mo), 145, 0, 0, o.shaft);                                  // coupling x 120..170
    P.at(P.cylX(22.6, 2, c.mat("out", "dark")), 145, 0, 0, o.shaft);               // joint line, stands 0.6 proud

    // sliding disc: local x 0 is its face towards the studs; out at x -22, home at x -78
    o.sl = new T.Group(); scene.add(o.sl);
    o.slSpin = new T.Group(); o.sl.add(o.slSpin);
    P.at(P.cylX(94, 24, mk), 12, 0, 0, o.slSpin);                                  // disc 0..24
    [1, -1].forEach(function (s) { P.at(P.cylX(7.5, 25, c.mat("clutch", "dark")), 12, s * 68, 0, o.slSpin); });   // holes, 0.5 proud of each face
    P.at(P.cylX(24, 27, mk), 37.5, 0, 0, o.slSpin);                                // hub 24..51
    P.at(P.cylX(16, 12, mk), 57, 0, 0, o.slSpin);                                  // groove 51..63
    P.at(P.cylX(30, 6, mk), 66, 0, 0, o.slSpin);                                   // flange 63..69
    P.at(P.cylX(26, 11, ml), 57, 0, 0, o.sl);                                      // shifter ring 51.5..62.5, does not turn
    P.at(P.cylZ(4, 13, ml), 57, 0, 32.5, o.sl);                                    // pin z 26..39, from the ring to the lever

    // bent lever (bell crank) in front, pivot below
    o.lever = new T.Group(); o.lever.position.set(PX, PY, PZ); scene.add(o.lever);
    o.arm = P.at(P.box(8, 1, 6, ml), 0, 0, 0, o.lever);
    P.at(P.cylZ(8, 6, ml), 0, 0, 0, o.lever);                                      // boss z 33..39
    var h = new T.Group(); h.rotation.z = -.17; o.lever.add(h);                   // handle slopes down a little
    P.at(P.box(50, 7, 6, ml), 25, 0, 0, h);
    P.at(P.sphere(6, ml), 50, 0, 0, h);
    P.at(P.cylZ(3, 10, ml), PX, PY, 35, scene);                                    // pivot pin z 30..40, from the post face

    // stand
    P.at(P.box(435, 12, 140, F), 7.5, -111, 0, scene);                             // base x -210..225, y -117..-105, z -70..70
    P.at(P.box(16, 125, 40, F), -198, -42.5, 0, scene);                            // pedestal x -206..-190, y -105..20; driving shaft ends at -190
    P.at(P.box(16, 125, 40, F), 198, -42.5, 0, scene);                             // pedestal x 190..206; driven shaft ends at 190
    P.at(P.box(12, 41, 12, F), PX, -84.5, 24, scene);                              // lever post x 4..16, y -105..-64, z 18..30; sliding disc stays at x 2 or less
  },

  step: function (c, dt, S) {
    var o = this.o, ENG = 56, TOUCH = 34, Q = Math.PI, cmd = S.controls.clutch === "in";
    function wrap(x) { return ((x + Q / 2) % Q + Q) % Q - Q / 2; }
    o.alpha += S.w * dt;
    var limit = cmd ? (o.locked ? ENG : TOUCH) : 0;
    if (cmd && !o.locked && Math.abs(o.s - TOUCH) < .5) {   // face on the stud tips: wait for the holes to come round
      var rel = wrap(o.gamma - o.alpha), rv = o.gvel - S.w, tol = Math.max(.05, Math.abs(rv) * dt * 1.2);
      if (Math.abs(rel) < tol && Math.abs(rv) > .01) { o.locked = true; o.off = o.gamma - o.alpha - rel; limit = ENG; }
    }
    var d = limit - o.s, mv = 50 * dt;
    o.s += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    if (o.locked && o.s < TOUCH + .5 && !cmd) o.locked = false;
    if (o.locked) { o.gamma = o.alpha + o.off; o.gvel = S.w; }
    else { o.gvel *= Math.exp(-dt * 1.2); if (Math.abs(o.gvel) < .003) o.gvel = 0; o.gamma += o.gvel * dt; }

    o.drv.rotation.x = o.alpha; o.shaft.rotation.x = o.slSpin.rotation.x = o.gamma;
    o.sl.position.x = -22 - o.s;
    var dx = o.sl.position.x + 57 - o.PX, dy = -o.PY, L = Math.sqrt(dx * dx + dy * dy), del = Math.atan2(dx, dy);
    o.lever.rotation.z = -del; o.arm.scale.y = L; o.arm.position.y = L / 2;

    function f(w) { var v = Math.round(w * 600 / (2 * Math.PI)) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("in", f(S.w)); S.set("out", f(o.gvel));
  }
});
