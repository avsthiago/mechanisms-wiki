M507.define({
  number: 482,
  title: "Gas regulator",
  lede: "The pressure in a town's gas main goes up and down, and so does the number of lamps people light. This regulator keeps the gas going to the burners at an even pressure anyway. A floating bell senses the pressure and works a small valve.",
  alt: "A round box cut in half, with a domed lid. Inside, a big upside-down bell has its rim dipping in a ring of mercury. A rod from the bell works a lever whose other end holds a small cup-shaped valve over the end of the inlet pipe. The valve's notched rim dips in its own ring of mercury. The outlet pipe leaves at the lower left.",
  parts: [
    { key: "bell", color: "#C8873A", name: "Bell", note: "A big upside-down cup. The gas going to the burners fills it and pushes up on its roof. Its rim dips in mercury, so no gas leaks round it." },
    { key: "valve", color: "#4FA58A", name: "Valve", note: "A small upside-down cup over the end of the inlet pipe. Gas escapes through notches in its rim, just above the mercury. Pushed down, the notches sink and let less gas through." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "Rocks on a post. When the bell rises, it pushes the valve down." },
    { key: "mercury", color: "#5E7387", name: "Mercury", note: "A heavy liquid metal in two rings. It seals the rims of the bell and the valve and still lets them move up and down." }
  ],
  controls: [{ id: "n", label: "Burners lit", value: "6", options: [["2", "2"], ["6", "6"], ["12", "12"]] }],
  speed: { min: 1, max: 12, value: 4, label: "Main pressure swings", unit: " /min" },
  readouts: [{ id: "m", label: "Main" }, { id: "o", label: "Burners" }, { id: "v", label: "Valve" }],
  closed: { label: "Box" },
  views: { "3d": [187, 113, 425], front: [-20, 0, 560], side: [540, 0, -60] },
  target: [-20, 0, -20],
  how: [
    "Gas from the main comes up the pipe on the right and out through the notches of the small valve. It fills the space under the big bell, and from there it goes out of the pipe on the left to the burners. The gas under the bell pushes up on its roof.",
    "If the pressure rises, the bell is pushed up. The lever then pushes the valve down, its notches sink into the mercury, and less gas gets through. If the pressure falls, the bell sinks and the valve opens wider. The bell settles where the gas just holds up its weight, so the pressure to the burners stays nearly the same.",
    "The bell is far bigger than the valve, so the push on the bell wins. Watch the main pressure swing while the burner pressure hardly changes. Then light 2 burners, then 12, and see how far the valve opens. Choose Closed to see the regulator as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The box is round and cut in half so you can see inside. The post for the lever, the sizes, the weight of the bell and the pressures are made up, and the outside view of the valve is left out. The mercury is drawn level; in a real regulator the gas pushes it a little lower inside the bell and the valve.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed, k;
    var o = this.o = { XV: 62, PX: 31.5, PY: 30, AL: 31.5, AR: 30.5, hb: null, th: 0 };
    // case about x = 0: inner wall r 90 .. 100 (y -50 .. 20), trough floor r 100 .. 120 (y -50 .. -40), outer wall r 120 .. 130 (y -50 .. 80)
    // closed view: each cut piece gets its whole twin (shown only when closed, solid), or a mirror image in z = 0 of its back half
    function both(poly, parent) { parent.add(c.shell(P.halfSection({ material: fx, poly: poly }), "open")); parent.add(c.shell(P.wholeSection({ material: fx, poly: poly }), "closed")); }
    function mirror(m, y0) { var g = new T.Group(), h = new T.Group(); g.position.y = y0; g.rotation.x = Math.PI; h.position.y = -y0; h.add(m); g.add(h); scene.add(c.shell(g, "closed")); return m; }   // turned half a turn about the line y = y0, z = 0 (a proper turn, not a flip, so faces keep their outside)
    both([[90, -50], [130, -50], [130, 80], [120, 80], [120, -40], [100, -40], [100, 20], [90, 20]], scene);
    // domed lid on the outer wall (y 80), with a guide for the bell's rod (hole r 3, up to y 140)
    var lid = [], inner = [], a;
    for (k = 0; k <= 16; k++) { a = k / 16 * Math.acos(10 / 130); lid.push([130 * Math.cos(a), 80 + 38 * Math.sin(a)]); }
    lid.push([10, 140]); lid.push([3, 140]);
    for (k = 16; k >= 0; k--) { a = k / 16 * Math.acos(3 / 124); inner.push([124 * Math.cos(a), 80 + 33 * Math.sin(a)]); }
    both(lid.concat(inner), scene);
    // floor inside the inner wall, y -50 .. -40, with round openings into the outlet pot (centre x -30, r 56) and the valve cup (centre x 62, r 25)
    function plan(R, rc) {
      var fl = [], b;
      for (k = 0; k <= 32; k++) { b = Math.PI + Math.PI * k / 32; fl.push([R * Math.cos(b), R * Math.sin(b)]); }
      for (k = 0; k <= 16; k++) { b = Math.PI * k / 16; fl.push([o.XV + rc * Math.cos(b), -rc * Math.sin(b)]); }
      for (k = 0; k <= 24; k++) { b = Math.PI * k / 24; fl.push([-30 + 56 * Math.cos(b), -56 * Math.sin(b)]); }
      return fl.reverse();
    }
    var floor = P.prism(plan(90, 25), 40, 50, fx); floor.rotation.x = Math.PI / 2; scene.add(c.shell(floor, "open"));   // plan z becomes height: y -50 .. -40
    // closed: both halves of the floor, edge r 89.5 and cup opening r 25.5, so its many-sided edges stay clear of the wall's and the cup floor's underside
    var floorC = P.prism(plan(89.5, 25.5), 40, 50, fx); floorC.rotation.x = Math.PI / 2; scene.add(c.shell(floorC, "closed"));
    mirror(P.prism(plan(89.5, 25.5), 40, 50, fx), -45).rotation.x = Math.PI / 2;
    // outlet pot under the floor, centre x -30: wall r 56 .. 60, bottom y -110 .. -106, with a gap for the outlet pipe (y -93 .. -67)
    var pot = P.at(new T.Group(), -30, 0, 0, scene), dl = Math.asin(13 / 58);
    both([[0, -110], [60, -110], [60, -93], [56, -93], [56, -106], [0, -106]], pot);
    both([[56, -67], [60, -67], [60, -50], [56, -50]], pot);
    pot.add(c.shell(P.shellSection({ material: fx, poly: [[56, -93], [60, -93], [60, -67], [56, -67]], from: 0, to: Math.PI - dl }), "open"));
    pot.add(c.shell(P.wholeSection({ material: fx, poly: [[56, -93], [60, -93], [60, -67], [56, -67]] }), "closed"));   // closed: the wall all round; the pipe starts inside it
    scene.add(c.shell(P.pipeSection({ pts: [[-87, -80], [-178, -80]], rIn: 10, rOut: 12, material: fx, ends: false })));   // outlet to the burners, from inside the pot wall
    mirror(P.pipeSection({ pts: [[-87, -80], [-178, -80]], rIn: 10, rOut: 12, material: fx, ends: false }), -80);
    for (k = 0; k < 6; k++) {   // thread
      scene.add(c.shell(P.pipeSection({ pts: [[-176 + 5 * k, -80], [-173.5 + 5 * k, -80]], rIn: 12, rOut: 13.5, material: fx })));
      mirror(P.pipeSection({ pts: [[-176 + 5 * k, -80], [-173.5 + 5 * k, -80]], rIn: 12, rOut: 13.5, material: fx }), -80);
    }
    // valve cup about x 62: floor r 11 .. 25 (y -50 .. -40), wall r 22 .. 25 up to y 20; inlet pipe r 9 .. 11 from y -125 to 5
    var cup = P.at(new T.Group(), o.XV, 0, 0, scene);
    both([[11, -50], [25, -50], [25, 20], [22, 20], [22, -40], [11, -40]], cup);
    both([[9, -125], [11, -125], [11, 5], [9, 5]], cup);
    both([[11, -122], [19, -122], [19, -104], [11, -104]], cup);   // union on the inlet
    // lever post: x 29.5 .. 33.5, y -40 .. 30 on the floor, z -6 .. -2 behind the lever
    P.at(P.box(4, 70, 4, fx), o.PX, -5, -4, scene);
    P.at(P.cylZ(1.5, 4, c.mat("lever", "dark")), o.PX, o.PY, 0, scene);              // pivot pin z -2 .. 2

    // mercury: trough ring and valve ring, reshaped as the rims move
    o.mt = P.halfSection({ material: c.mat("mercury"), poly: [[100.3, -40], [119.7, -40], [119.7, 10], [100.3, 10]] }); scene.add(o.mt);
    o.mv = P.halfSection({ material: c.mat("mercury"), poly: [[11.3, -40], [21.7, -40], [21.7, -5], [11.3, -5]] }); o.mv.position.x = o.XV; scene.add(o.mv);
    o.mt.userData.live = o.mv.userData.live = true;
    c.fluid(o.mt); c.fluid(o.mv);   // inside the box, so seen faintly when it is closed

    // bell: roof y 56 .. 60, wall r 108 .. 112 down to y -20; its rod from the lever (y 30) up into the lid's guide
    o.bell = P.at(new T.Group(), 0, 0, 0, scene);
    o.bell.add(P.halfSection({ material: c.mat("bell"), poly: [[2, 60], [112, 60], [112, -20], [108, -20], [108, 56], [2, 56]] }));
    o.bell.add(P.shellSection({ material: c.mat("bell", "mark"), from: .03, to: Math.PI - .03, poly: [[112, 40], [112.8, 40], [112.8, 46], [112, 46]] }));   // red band, .8 proud of the wall
    P.at(P.cylY(2, 106, c.mat("bell")), 0, 83, 0, o.bell);                            // rod y 30 .. 136
    // valve: roof y 18 .. 21, wall r 17 .. 19; the notched band y -15 .. -3 has four pieces with gaps between; stem up to the lever
    o.valve = P.at(new T.Group(), o.XV, 0, 0, scene);
    var vm = c.mat("valve");
    o.valve.add(P.halfSection({ material: vm, poly: [[0, 21], [19, 21], [19, -3], [17, -3], [17, 18], [0, 18]] }));
    [[0, .3], [.62, 1.35], [1.75, 2.5], [2.84, Math.PI]].forEach(function (q) {
      o.valve.add(P.shellSection({ material: vm, poly: [[17, -15], [19, -15], [19, -3], [17, -3]], from: q[0], to: q[1] }));
    });
    P.at(P.cylY(1.5, 9, vm), 0, 25.5, -1, o.valve);                                   // stem y 21 .. 30
    // lever
    o.lever = P.at(new T.Group(), o.PX, o.PY, 0, scene);
    P.at(P.box(o.AL + o.AR + 8, 4, 2.5, c.mat("lever")), (o.AR - o.AL) / 2, 0, 1.5, o.lever);   // z .25 .. 2.75, in front of the post and pins
    [-o.AL, o.AR].forEach(function (x) { P.at(P.cylZ(1.6, 6, c.mat("lever", "dark")), x, 0, 0, o.lever); });

    // gas dots: up the inlet, out of the notches on each side, and from under the bell to the outlet
    o.gas = P.pipeDots({ radius: 1.7, color: "#6E7B88", opacity: .8, paths: [
      { pts: [[o.XV, -125], [o.XV, 4]], n: 18, w: 13, z0: -8, z1: -1 },
      { pts: [[57, 9], [48, 13], [48, -4], [41, -4], [36, 10], [26, 24]], n: 9, w: 3, z0: -7, z1: -1 },
      { pts: [[67, 9], [76, 13], [76, -4], [83, -4], [88, 10], [96, 30]], n: 9, w: 3, z0: -7, z1: -1 },
      { pts: [[18, 26], [0, 0], [-25, -45], [-40, -80], [-88, -80], [-178, -80]], n: 34, w: 16, z0: -9, z1: -1 }
    ] });
    scene.add(o.gas);
  },

  step: function (c, dt, S) {
    var o = this.o, n = +S.controls.n;
    o.th += S.w * dt;
    var pin = 4.5 + 1.5 * Math.sin(o.th);                       // main pressure, kPa
    // the bell floats where the gas holds up its weight; the main's push on the small valve adds a little
    var W = 1.5, a = (19 / 112) * (19 / 112) * o.AR / o.AL, po = (W + pin * a) / (1 + a);
    var f = Math.min(1, n / (10.3 * Math.sqrt(pin - po)));      // how far the valve must open to feed the burners
    var hbT = -(4 * f - 2) * o.AL / o.AR;                       // bell height that sets that opening through the lever
    if (o.hb === null) o.hb = hbT;
    o.hb += (hbT - o.hb) * Math.min(1, dt * 3);
    var al = Math.asin(o.hb / o.AL), dv = -o.AR * Math.sin(al), open = (2 + dv) / 4;
    o.bell.position.y = o.hb;
    o.lever.rotation.z = -al;
    o.valve.position.y = dv;
    var yb = S.controls.case === "closed" ? -39.5 : -40;   // closed: lifted off the floor of the box's whole twin
    o.mt.set([[100.3, yb], [119.7, yb], [119.7, 10], [112.3, 10], [112.3, -20.3 + o.hb], [107.7, -20.3 + o.hb], [107.7, 10], [100.3, 10]]);
    o.mv.set([[11.3, yb], [21.7, yb], [21.7, -5], [19.3, -5], [19.3, -15.3 + dv], [16.7, -15.3 + dv], [16.7, -5], [11.3, -5]]);
    var q = 10.3 * open * Math.sqrt(pin - po), v = 2.2 * q * dt;
    o.gas.move(0, v); o.gas.move(1, v * .8); o.gas.move(2, v * .8); o.gas.move(3, v * 1.2); o.gas.flush();
    S.set("m", pin.toFixed(1) + " kPa");
    S.set("o", po.toFixed(2) + " kPa");
    S.set("v", Math.round(open * 100) + " %");
  }
});
