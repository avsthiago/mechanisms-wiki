M507.define({
  number: 47,
  title: "Friction clutch",
  lede: "Two shafts meet end to end. A cone on one can be pushed into a cup on the other, and rubbing makes the second shaft turn. A heavy machine then starts gently instead of with a sudden jerk.",
  alt: "A shaft with a wide cup on its end, shown with a quarter cut away. A cone on a second shaft fits inside the cup. A lever below slides the cone in and out.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving cup", note: "A wide cup fixed to the end of the driving shaft. A quarter is cut away so you can see inside. Its inner wall slopes like the inside of a bowl." },
    { key: "cone", color: "#C8873A", name: "Sliding cone", note: "Fits inside the cup. It slides along the driven shaft but always turns with it. Watch the dark stripe on its face." },
    { key: "out", color: "#4FA58A", name: "Driven shaft", note: "Carries a long key, called a feather, that the cone slides along. Its end turns freely in a hole in the cup." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "Pushes the cone into the cup or pulls it out. Its top sits in a ring that lies in a groove round the cone's hub." }
  ],
  controls: [{ id: "clutch", label: "Clutch", value: "in", options: [["in", "In"], ["out", "Out"]] }],
  readouts: [{ id: "in", label: "Driving shaft" }, { id: "out", label: "Driven shaft" }],
  closed: { label: "Cup" },
  views: { "3d": [160, 330, 600], front: [10, -5, 720], side: [720, 30, 60] },
  target: [10, -5, 0],
  how: [
    "The driving shaft and its cup turn all the time. The driven shaft only turns when the cone is pressed into the cup. Then the sloping side of the cone and the sloping wall of the cup rub hard against each other.",
    "Rubbing is not a firm grip. At first the cup slides past the cone, and the driven shaft speeds up little by little. When both turn at the same speed they stop sliding and turn as one. Pull the cone out and the driven shaft slowly runs down.",
    "Try Out and wait for the driven shaft to stop. Then try In. Watch its speed climb in the readout instead of jumping. Choose Closed to see the cup whole, as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows the clutch cut in half. Here only a quarter of the cup is cut away, so you can see the cone inside it. The sizes, the slope of the cone, the stands and the shape of the lever were made up. Brown does not show where the driven shaft ends; here it turns in a hole in the cup's hub. The speed-up is a simple model: the rubbing adds the same amount of speed every second until the two shafts match.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, F = c.fixed, PX = 43.5, PY = -87;
    var o = this.o = { alpha: 0, gamma: 0, gvel: 0, d: 0, PX: PX, PY: PY };
    function V(a) { return a.map(function (p) { return new T.Vector2(p[0], p[1]); }); }
    function turned(pts, mat, phiLen) {          // solid turned about world X; profile points are [radius, x]
      var g = new T.Group(); g.rotation.z = -Math.PI / 2;
      g.add(new T.Mesh(new T.LatheGeometry(V(pts), 72, 0, phiLen || 2 * Math.PI), mat));
      return g;
    }
    var md = c.mat("drive"), mo = c.mat("out"), mc = c.mat("cone"), ml = c.mat("lever");

    // driving shaft and cup. The cup's body is round, so it is drawn still; only its marks turn with the shaft.
    o.spin = new T.Group(); scene.add(o.spin);
    P.at(P.cylX(8, 24, md), -108, 0, 0, o.spin);                                // journal x -120..-96, ends at the pedestal face
    P.at(P.cylX(12, 36, md), -78, 0, 0, o.spin);                                // shaft x -96..-60, ends inside the cup's hub
    P.at(P.box(18, 2, 3, c.mat("drive", "dark")), -108, 9.5, 0, o.spin);        // stripe y 8.5..10.5 on the journal
    P.at(P.box(1, 80, 8, c.mat("drive", "dark")), -76, 62, 0, o.spin);          // stripe x -76.5..-75.5 on the back of the cup, r 22..102
    P.at(P.cylX(117, 21, md), -64.5, 0, 0, scene);                              // back of the cup x -75..-54
    P.at(P.cylX(34, 14, md), -47, 0, 0, scene);                                 // hub x -54..-40, the driven shaft's end turns in it
    var rim = [[88, -54], [100, -18], [117, -18], [117, -54]];                   // sloping inner wall r 88..100, outside r 117
    var cup = turned(rim, md, 1.5 * Math.PI); scene.add(cup);                   // three quarters; the quarter facing the viewer is cut away
    var sh = new T.Shape(V(rim));
    [[-Math.PI / 2], [Math.PI]].forEach(function (r) {                           // flat faces where the cup is cut
      var m = new T.Mesh(new T.ShapeGeometry(sh), md); m.rotation.y = r[0]; cup.add(c.shell(m, "open"));
    });
    var quarter = new T.Mesh(new T.LatheGeometry(V(rim), 24, 1.5 * Math.PI, .5 * Math.PI), md);   // closed view: the quarter the cut leaves out
    cup.add(c.shell(quarter, "closed"));

    // driven shaft with its feather key
    o.shaft = new T.Group(); scene.add(o.shaft);
    P.at(P.cylX(12, 209.5, mo), 45.25, 0, 0, o.shaft);                          // x -59.5..150, pedestal face at 150
    P.at(P.box(136, 6, 6, mo), 32, 12, 0, o.shaft);                              // feather x -36..100, y 9..15
    P.at(P.box(18, 2, 3, c.mat("out", "dark")), 128, 13, 0, o.shaft);           // stripe y 12..14

    // sliding cone: wall slope matches the cup's, half a unit inside it when home
    function ro(x) { return 88 + (x + 54) / 3 - .5; }
    o.cone = new T.Group(); scene.add(o.cone);
    o.coneSpin = new T.Group(); o.cone.add(o.coneSpin);
    o.coneSpin.add(turned([[ro(-50) - 12, -50], [ro(-50), -50], [ro(-16), -16], [ro(-16), 12], [36, 12], [36, 36], [22, 36], [22, 51],
      [30, 51], [30, 69], [12, 69], [12, -16], [ro(-16) - 12, -16], [ro(-50) - 12, -50]], mc));   // ring x -50..-16, web -16..12, hub 12..36, groove 36..51, collar 51..69
    P.at(P.box(1, 54, 7, c.mat("cone", "dark")), 13, 68, 0, o.coneSpin);        // stripe x 12.5..13.5 on the web's face, r 41..95
    P.at(P.cylX(31, 14, ml), 43.5, 0, 0, o.cone);                               // shifter ring x 36.5..50.5 in the groove, does not turn

    // bell-crank lever below the hub; its pivot is under the groove when the cone is home
    o.lever = new T.Group(); o.lever.position.set(PX, PY, 0); scene.add(o.lever);
    o.arm = P.at(P.box(8, 1, 6, ml), 0, 0, 0, o.lever);                         // stretched each frame from the pivot to the ring
    o.pin = P.at(P.cylZ(4, 10, ml), 0, 0, 0, o.lever);
    P.at(P.cylZ(9, 6, ml), 0, 0, 0, o.lever);                                    // boss z -3..3
    P.at(P.box(70, 7, 6, ml), 35, 0, 0, o.lever);                                // handle x 0..70
    P.at(P.sphere(6, ml), 70, 0, 0, o.lever);
    P.at(P.cylZ(3, 10, ml), PX, PY, 0, scene);                                   // pivot pin z -5..5, starts at the post face

    // stands
    P.at(P.box(310, 12, 160, F), 15, -131, 0, scene);                            // base x -140..170, y -137..-125, z -80..80
    P.at(P.box(16, 145, 40, F), -128, -52.5, 0, scene);                          // pedestal x -136..-120, y -125..20; journal ends at x -120
    P.at(P.box(16, 145, 40, F), 158, -52.5, 0, scene);                           // pedestal x 150..166, y -125..20; shaft ends at x 150
    P.at(P.box(10, 45, 12, F), PX, -102.5, -11, scene);                          // lever post x 38.5..48.5, y -125..-80, z -17..-5; clear of the cone (x up to 36)
  },

  step: function (c, dt, S) {
    var o = this.o, A = .5, OUT = 24;
    var target = S.controls.clutch === "out" ? OUT : 0, dd = target - o.d, mv = 30 * dt;
    o.d += Math.abs(dd) < mv ? dd : (dd > 0 ? mv : -mv);
    o.alpha += S.w * dt;
    if (o.d < .01) {                                   // pressed home: rubbing pulls the speeds together at a steady rate
      var dv = S.w - o.gvel, k = A * dt;
      o.gvel = Math.abs(dv) <= k ? S.w : o.gvel + (dv > 0 ? k : -k);
    } else { o.gvel *= Math.exp(-dt * .8); if (Math.abs(o.gvel) < .003) o.gvel = 0; }
    o.gamma += o.gvel * dt;

    o.spin.rotation.x = o.alpha; o.shaft.rotation.x = o.gamma;
    o.cone.position.x = o.d; o.coneSpin.rotation.x = o.gamma;
    var dx = o.d, dy = -33 - o.PY, L = Math.sqrt(dx * dx + dy * dy), del = Math.atan2(dx, dy);
    o.lever.rotation.z = -del; o.arm.scale.y = L; o.arm.position.y = L / 2; o.pin.position.y = L;

    function f(w) { var v = Math.round(w * 600 / (2 * Math.PI)) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("in", f(S.w)); S.set("out", f(o.gvel));
  }
});
