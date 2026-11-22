(function () {
  // Layout (model units, y up). The pendulum hangs from a short spring under a bracket on a back board; its pivot is
  // at (0, PY, 0) and it swings in the XY plane. Below the pivot everything is measured down from the pivot (local y).
  // Warmth makes the rod longer by e, so the nut, stirrup and jar all drop by e. The mercury swells and its level rises
  // 2e inside the jar, so the middle of the mercury stays put. The model's e is made very large so you can see it;
  // the readouts give the real sizes for a seconds pendulum about a metre long with a steel rod.
  var PY = 235, RAD = Math.PI / 180, T0 = 20, EX = 8 / 15;      // pivot height, the temperature the model is drawn at, model drop per degree
  var YC = -248, YB = -467, H0 = 132;                            // rod's end at the nut top, inside of the jar bottom, mercury depth at T0
  var RC = YB + H0 / 2;                                          // middle of the mercury: the centre of the swing, fixed
  var ALPHA = 11.5e-6, LM = 1000, AMP = 3 * RAD, PER = 2;       // steel, rod length in mm, swing, seconds per full swing

  function jarProfile() {                                        // outside up, then inside down: a bottle with a short neck
    return [[0, -470], [36, -470], [42, -464], [42, -318], [38, -307], [38, -292], [40, -290], [40, -288],
            [36, -288], [35, -292], [35, -306], [39, -318], [39, -462], [35, -467], [0, -467]];
  }

  M507.define({
    number: 316,
    title: "Mercury pendulum",
    lede: "A clock pendulum whose weight is a glass jar of mercury. Heat makes the rod longer, which would slow the clock. The mercury swells upwards by just the right amount to cancel it.",
    alt: "The lower end of a pendulum. The rod ends in a nut, and below it a threaded piece passes through a flat cap into a tall glass jar. Two straps hang from the cap and grip the jar's neck with screws. The jar is about a third full of mercury. A red line runs round the jar at the middle of the mercury.",
    parts: [
      { key: "rod", color: "#D9B13B", name: "Pendulum rod", note: "A long steel rod hung from a short spring. In the warm it gets a little longer, which lowers everything that hangs from it." },
      { key: "stirrup", color: "#C8873A", name: "Nut and cap", note: "The nut screws up or down to set the clock. The cap and its two straps hold the jar by the neck." },
      { key: "jar", color: "#4FA58A", name: "Glass jar", note: "A plain glass jar. It goes down with the rod when it is warm." },
      { key: "mercury", color: "#E8E2D0", name: "Mercury", note: "A heavy liquid metal. It swells much more than steel when warm, so its level climbs up the jar." },
      { key: "mark", color: "#C2503F", name: "Centre mark", note: "Not a real part. The red line marks the centre of the swing. Watch it stay level with the dark line on the board while the jar goes up and down." }
    ],
    controls: [{ id: "temp", label: "Temperature", value: "20", options: [["5", "5 °C"], ["20", "20 °C"], ["35", "35 °C"]] }],
    speed: false,
    readouts: [{ id: "rod", label: "Rod longer" }, { id: "hg", label: "Mercury up" }, { id: "plain", label: "Plain bob" }],
    views: { "3d": [170, -50, 640], front: [0, -110, 1150], side: [1150, -110, 0] },
    target: [0, -110, 0],
    opacity: function (key) { return key === "jar" ? .3 : 1; },
    how: [
      "Change the temperature and watch the jar. When it is warm, the rod gets longer and the jar drops. At the same time the mercury climbs up inside the jar. The red line stays level with the dark line on the board.",
      "A pendulum keeps time by its length, measured down to the middle of its weight. A longer pendulum swings more slowly. With a solid weight, a warm day would make the clock lose about 7 seconds. Here the mercury rises twice as far as the rod drops, so the middle of the mercury stays at the same height.",
      "The real changes are far too small to see, less than half a millimetre. The model makes them much bigger. Try 5 °C, then 35 °C, and keep an eye on the red line."
    ],
    note: "This model is rebuilt from Brown's drawing, which shows only the jar end of the pendulum. The rod above, its spring, the bracket and the back board were made up, and the rod is drawn much shorter than a real one. The changes in length are made far larger than real ones so that you can see them. The readouts are worked out for a steel rod about a metre long, and the glass is taken not to change.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mr = c.mat("rod"), ms = c.mat("stirrup");
      var o = this.o = { t: 0, T: T0 };
      // back board and bracket
      P.at(P.box(260, 520, 6, c.fixed), 0, -5, -57, scene);                           // x -130..130, y -265..255, z -60..-54
      P.at(P.box(40, 20, 64, c.fixed), 0, PY + 10, -22, scene);                         // bracket y 235..255, z -54..10, on the board's face
      var ref = P.arc(PY - RC, 1.2, 16 * RAD, c.mat("mark", "dark"));                   // fixed dark line on the board at the centre's distance from the pivot
      ref.rotation.z = -98 * RAD; P.at(ref, 0, PY, -52.3, scene);                       // tube z -53.5..-51.1, 0.5 off the board's face
      // pendulum
      o.pend = new T.Group(); o.pend.position.set(0, PY, 0); scene.add(o.pend);
      P.at(P.box(10, 16, 1.2, c.mat("rod", "dark")), 0, -8, 0, o.pend);               // spring y 0..-16 from the bracket's bottom face
      P.at(P.box(14, 6, 6, mr), 0, -19, 0, o.pend);                                    // clamp y -16..-22
      o.rod = P.at(P.cylY(4, 1, mr), 0, 0, 0, o.pend);                                 // y -22..YC - e, set each frame
      o.hang = new T.Group(); o.pend.add(o.hang);                                      // everything below the rod, dropped by e
      P.at(P.box(56, 14, 14, ms), 6, -255, 0, o.hang);                                 // nut y -262..-248, x -22..34
      P.at(P.sphere(9, ms), -27, -255, 0, o.hang);                                     // knob on the nut's left end
      P.at(P.cylY(4.5, 178, c.mat("stirrup", "dark")), 0, -351, 0, o.hang);            // threaded piece y -262..-440, through the cap into the mercury
      P.at(P.box(94, 6, 30, ms), 0, -285, 0, o.hang);                                  // cap y -288..-282, sits on the jar's lip at -288
      [-1, 1].forEach(function (s) {
        P.at(P.box(6, 24, 16, ms), s * 44, -300, 0, o.hang);                           // straps x 41..47, y -312..-288 under the cap
        P.at(P.cylX(2.5, 9, ms), s * 42.5, -301, 0, o.hang);                            // screws x 38..47: tip on the neck (radius 38), head in the strap
        P.at(P.cylX(4, 3, ms), s * 48.5, -301, 0, o.hang);                              // screw heads x 47..50, on the strap's outer face
      });
      var jp = jarProfile().map(function (q) { return new T.Vector2(q[0], q[1]); });
      o.hang.add(new T.Mesh(new T.LatheGeometry(jp, 64), c.mat("jar")));
      o.hg = P.at(P.cylY(38.5, 1, c.mat("mercury")), 0, 0, 0, o.hang);                // y -466.5..level, set each frame
      // centre mark: fixed distance from the pivot, so it is not in the dropping group
      P.at(P.hoop(43.5, 1.2, c.mat("mark")), 0, RC, 0, o.pend).rotation.x = Math.PI / 2;   // ring 0.3 off the jar's side (radius 42)
    },

    step: function (c, dt, S) {
      var o = this.o, Tt = +S.controls.temp;
      if (S.playing) o.t += dt;
      o.T += (Tt - o.T) * Math.min(1, dt * 1.5);
      var dT = o.T - T0, e = EX * dT;
      o.pend.rotation.z = AMP * Math.sin(2 * Math.PI * o.t / PER);
      var top = -22, bot = YC - e; o.rod.scale.y = top - bot; o.rod.position.y = (top + bot) / 2;
      o.hang.position.y = -e;
      var lvl = YB + H0 + 2 * e, b0 = YB + .5; o.hg.scale.y = lvl - b0; o.hg.position.y = (lvl + b0) / 2;
      function sg(v, d) { var s = v.toFixed(d); return (+s > 0 ? "+" : +s < 0 ? "−" : "") + s.replace("-", ""); }
      var drod = ALPHA * LM * dT;
      S.set("rod", sg(drod, 2) + " mm");
      S.set("hg", sg(2 * drod, 2) + " mm");
      S.set("plain", sg(-86400 * ALPHA * dT / 2, 0) + " s a day");
    }
  });
})();
