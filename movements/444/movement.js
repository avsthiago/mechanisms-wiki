(function () {
  // Sizes in model units; 100 units stand for 1 m, so g is 981 units/s². Section cut on z = 0, the front half taken away.
  var G = 981, LP = 340, YS = 96, YB = -60, AP = 196, AN = 22, NT = 162, SC = 27, RI = 60, RN = 7, DT = 1 / 600;
  var VC = { light: 90, medium: 120, heavy: 150 }, BALL = { light: .8, medium: 1, heavy: 1.2 };
  function airVol(L) { var h = SC + RI - L; return Math.PI * h * h * (3 * RI - h) / 3 - Math.PI * RN * RN * h; }   // air above the water in the vessel
  var VA0 = airVol(24) * (1030 + 200) / 1030;                                     // air held in the vessel, at the pressure of the air outside
  function pAir(L) { return 1030 * (VA0 / airVol(L) - 1); }                       // air pressure above the outside air, as a head of water
  // One time step of the water in the drive pipe (speed v), the two valves and the vessel's water level L.
  function sim(s, h) {
    var pa = pAir(s.L), hj = pa + s.L - NT, q = hj > 0 ? AN * Math.sqrt(2 * G * hj) : 0;
    if (s.waste) {                                                                // waste valve open: the fall speeds the water up
      s.v += (G * (YS - YB) - 3.83 * s.v * Math.abs(s.v)) / LP * h;
      if (s.v >= s.vc) { s.waste = 0; s.del = 1; s.n++; s.per = s.t - s.t0; s.t0 = s.t; }
    } else {                                                                      // shut: the vessel's pressure stops the water
      s.v += (G * (YS - (pa + s.L)) - .5 * s.v * Math.abs(s.v)) / LP * h;
      if (s.v <= 0) { s.del = 0; s.waste = 1; s.v = -.12 * s.vc; }                // the water bounces back a little and the weight opens the valve
    }
    var r2 = RI * RI - (s.L - SC) * (s.L - SC) - RN * RN;
    s.L += ((s.del ? AP * s.v : 0) - q) / (Math.PI * r2) * h; s.t += h; s.hj = hj;
  }

  M507.define({
    number: 444,
    title: "Hydraulic ram",
    lede: "Water running down from a tank is stopped suddenly, again and again. Each time, its push forces a little water up into a vessel full of air. The squeezed air throws a jet higher than the tank it all came from, with no pump and no engine.",
    alt: "Cut-away drawing. A tank top left feeds a pipe that runs down and along the bottom to a box. On the box are two valves: on the right a waste valve with a ball weight, on the left a valve opening into a round vessel full of air above water. A thin pipe rises from the water through the top of the vessel and throws a jet. Everything stands in a shallow basin of water.",
    parts: [
      { key: "body", color: "#5E7387", name: "Tank and drive pipe", note: "Water falls from the tank down this long pipe. The moving water in it is what does the work." },
      { key: "waste", color: "#C8873A", name: "Waste valve", note: "Hangs open by its weight and lets water run out into the basin. When the water runs fast enough, it is dragged up and slams shut. Watch the red ball." },
      { key: "delivery", color: "#D9B13B", name: "Delivery valve", note: "Lets water up into the air vessel but never back. It opens just after the waste valve slams shut." },
      { key: "vessel", color: "#4FA58A", name: "Air vessel and jet pipe", note: "Air trapped at the top is squeezed like a spring. It keeps pushing water out of the jet pipe between the strokes." }
    ],
    controls: [{ id: "w", label: "Weight on the waste valve", value: "medium", options: [["light", "Light"], ["medium", "Medium"], ["heavy", "Heavy"]] }],
    speed: { min: 10, max: 100, value: 40, label: "Time speed", unit: " %" },
    closed: { label: "Ram" },
    readouts: [{ id: "jet", label: "Jet top" }, { id: "v", label: "Pipe flow" }, { id: "b", label: "Beats" }],
    views: { "3d": [276, 189, 583], front: [-5, 35, 660], side: [620, 70, -260] },
    target: [-5, 35, -20],
    distance: [250, 1600],
    how: [
      "The tank stands above the basin. Water runs down the long pipe and out through the waste valve on the right. It goes faster and faster. When it runs fast enough, it drags the waste valve up and slams it shut.",
      "The moving water in the pipe cannot stop at once. It pushes on, opens the other valve and forces some water into the air vessel. That squeezes the air. Then the water stops, bounces back a little, and the weight drops the waste valve open again. A new beat starts.",
      "The squeezed air pushes water up the thin pipe all the time, so the jet stays steady. Its top is higher than the water in the tank. Try a light weight, then a heavy one, and watch the beats and the jet. Choose Closed to see the ram as it looks from outside."
    ],
    note: "This model is rebuilt from Brown's drawing. The pipes and valve box are drawn square, cut down the middle, and the valve guide, the chute and the sizes of the parts are made up. The motion is worked out from the fall, the length of the pipe and the air pressure in the vessel. Real water stops in a pressure wave much faster than shown; here the water in the pipe is treated as one solid lump.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, i;
      var s = { v: 0, L: 24, waste: 1, del: 0, vc: VC.medium, t: 0, t0: 0, n: 0, per: .7, hj: 0 };
      for (i = 0; i < 60 / DT; i++) sim(s, DT);                                   // let the vessel fill to its working pressure
      for (i = 0; i < 4 / DT && !(s.waste && s.v > .6 * s.vc); i++) sim(s, DT);  // open on a moment like the drawing: waste valve open, water running
      var o = this.o = { s: s, acc: [0, 0, 0, 0], Lshown: -999 };
      var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .45, depthWrite: false, side: T.DoubleSide });
      var mb = c.mat("body"), mv = c.mat("vessel");
      function wall(pts, m) { c.shell(P.at(P.prism(pts, 0, 12, m), 0, 0, 0, scene), "closed"); return P.at(P.prism(pts, -12, 0, m), 0, 0, 0, scene); }   // cut walls, z -12..0; closed view adds the front half, z 0..12
      // tank: inner x -158..-92, floor top y 50
      wall([[-162, 46], [-158, 46], [-158, 106], [-162, 106]], mb); wall([[-92, 46], [-88, 46], [-88, 106], [-92, 106]], mb);
      wall([[-158, 46], [-122, 46], [-122, 50], [-158, 50]], mb); wall([[-108, 46], [-92, 46], [-92, 50], [-108, 50]], mb);
      P.at(P.prism([[-162, 46], [-88, 46], [-88, 106], [-162, 106]], -14, -12, mb), 0, 0, 0, scene);   // tank back, z -14..-12
      c.shell(P.at(P.prism([[-162, 46], [-88, 46], [-88, 106], [-162, 106]], 12, 14, mb), 0, 0, 0, scene), "closed");   // closed view: tank front, z 12..14
      // drive pipe: inner x -122..-108 going down, inner y -136..-122 along the bottom; valve box inner x 6..112, y -136..-100
      wall([[-126, 46], [-122, 46], [-122, -136], [116, -136], [116, -140], [-126, -140]], mb);          // outer wall and box floor
      wall([[-108, 46], [-104, 46], [-104, -118], [2, -118], [2, -96], [6, -96], [6, -122], [-108, -122]], mb);   // inner wall and box left side
      wall([[112, -136], [116, -136], [116, -96], [112, -96]], mb);                                       // box right side
      wall([[6, -100], [19, -100], [19, -96], [6, -96]], mb); wall([[35, -100], [70, -100], [70, -96], [35, -96]], mb);
      wall([[86, -100], [116, -100], [116, -96], [86, -96]], mb);                                         // box top, ports x 19..35 and 70..86
      P.at(P.prism([[-126, 46], [-104, 46], [-104, -118], [2, -118], [2, -96], [116, -96], [116, -140], [-126, -140]], -14, -12, mb), 0, 0, 0, scene);
      c.shell(P.at(P.prism([[-126, 46], [-104, 46], [-104, -118], [2, -118], [2, -96], [116, -96], [116, -140], [-126, -140]], 12, 14, mb), 0, 0, 0, scene), "closed");   // closed view: front of pipe and box, z 12..14
      // guide for the waste valve stem on the box top (y -96): posts y -96..-80, bar y -80..-76 with a gap for the stem
      wall([[64, -96], [67, -96], [67, -80], [64, -80]], mb); wall([[89, -96], [92, -96], [92, -80], [89, -80]], mb);
      wall([[64, -80], [75.5, -80], [75.5, -76], [64, -76]], mb); wall([[80.5, -80], [92, -80], [92, -76], [80.5, -76]], mb);
      // air vessel, neck and jet pipe, one solid of revolution about x 27: neck r 13..16 from the box top (y -96), sphere r 60..63 round (27, 27), jet pipe r 4..7 from y -2 to 162
      var poly = [[13, -95.5], [16, -95.5]], a, a0 = Math.asin(16 / 63), a1 = Math.PI - Math.asin(7 / 63), b0 = Math.PI - Math.asin(7 / 60), b1 = Math.asin(13 / 60);
      for (i = 0; i <= 40; i++) { a = a0 + (a1 - a0) * i / 40; poly.push([63 * Math.sin(a), SC - 63 * Math.cos(a)]); }
      poly.push([7, NT], [4, NT], [4, -2], [7, -2]);
      for (i = 0; i <= 40; i++) { a = b0 + (b1 - b0) * i / 40; poly.push([60 * Math.sin(a), SC - 60 * Math.cos(a)]); }
      c.shell(P.at(P.halfSection({ poly: poly, material: mv, steps: 32 }), SC, 0, 0, scene), "open");
      c.shell(P.at(P.wholeSection({ poly: poly, material: mv }), SC, 0, 0, scene), "closed");             // closed view: the whole vessel and jet pipe
      // waste valve at x 78: disc r 11 under the port, stem r 2, weight ball on top (red)
      o.wv = new T.Group(); scene.add(o.wv);
      c.shell(P.at(P.halfSection({ poly: [[0, -3], [11, -3], [11, 0], [2, 0], [2, 58], [0, 58]], material: c.mat("waste") }), 0, 0, 0, o.wv), "open");
      c.shell(P.at(P.wholeSection({ poly: [[0, -3], [11, -3], [11, 0], [2, 0], [2, 58], [0, 58]], material: c.mat("waste") }), 0, 0, 0, o.wv), "closed");   // closed view: whole disc and stem
      var ball = []; for (i = 0; i <= 16; i++) { a = Math.PI * i / 16; ball.push([7 * Math.sin(a), -7 * Math.cos(a)]); }
      o.ball = P.at(P.halfSection({ poly: ball, material: c.mat("waste", "mark") }), 0, 65, 0, o.wv);  // ball y 58..72 on the stem
      o.ball.children.forEach(function (m) { c.shell(m, "open"); });
      o.ball.add(c.shell(P.wholeSection({ poly: ball, material: c.mat("waste", "mark") }), "closed"));   // closed view: the whole ball, scaled with the half
      // delivery valve at x 27: disc r 11 resting on the box top, stem r 2 down through the port
      o.dv = P.at(P.halfSection({ poly: [[0, -14], [2, -14], [2, 0], [11, 0], [11, 3], [0, 3]], material: c.mat("delivery") }), SC, -95.5, 0, scene);
      // water: tank, pipe and box in one piece (z -11.5..-0.5); vessel and jet pipe as solids of revolution
      c.fluid(P.at(P.prism([[-158, 96], [-92, 96], [-92, 50], [-108, 50], [-108, -122], [6, -122], [6, -100], [112, -100], [112, -136], [-122, -136], [-122, 50], [-158, 50]], -11.5, -.5, wat), 0, 0, 0, scene));   // shows faintly through the closed walls
      c.fluid(c.shell(P.at(P.prism([[-158, 96], [-92, 96], [-92, 50], [-122, 50], [-158, 50]], .5, 11.5, wat), 0, 0, 0, scene), "closed"));   // closed view: front half of the tank water, seen from above
      o.vw = P.at(P.halfSection({ poly: [[0, -95], [1, -95], [1, 0], [0, 0]], material: wat, steps: 24 }), SC, 0, -.5, scene);
      o.vw.children.forEach(function (m) { m.userData.live = true; });
      c.fluid(o.vw);                                                              // shows faintly through the whole vessel when closed
      o.jw = c.fluid(P.at(P.halfSection({ poly: [[0, -2], [3.6, -2], [3.6, NT], [0, NT]], material: wat }), SC, 0, 0, scene));
      // basin round the ram, and its water (scenery): floor top y -140, walls up to -6, water to y -60
      P.at(P.box(316, 6, 70, c.fixed), -12, -143, -35, scene);                    // x -170..146, y -146..-140, z -70..0
      P.at(P.box(4, 134, 70, c.fixed), -168, -73, -35, scene); P.at(P.box(4, 134, 70, c.fixed), 144, -73, -35, scene);   // y -140..-6
      P.at(P.box(316, 140, 4, c.fixed), -12, -76, -72, scene);                    // back, z -74..-70
      P.at(P.box(308, 79.5, 69, new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .18, depthWrite: false })), -12, -99.75, -35, scene);
      var ch = P.box(80, 4, 20, c.fixed); ch.rotation.z = -.2; P.at(ch, -190, 122, -6, scene);   // chute that keeps the tank full
      // moving water: dots along the pipe, drops for the jet, the spill and the stream into the vessel
      o.flow = P.steamFlow({ color: c.spot, count: 52, z0: -10, z1: -2 }); scene.add(o.flow);
      o.pMain = o.flow.pipe({ points: [[-115, 92], [-115, -129], [60, -129]], width: 11, n: 36, speed: 1 / 388 });
      o.pWaste = o.flow.pipe({ points: [[60, -129], [78, -114], [78, -98]], width: 8, n: 8, speed: 1 / 39 });
      o.pDel = o.flow.pipe({ points: [[8, -129], [27, -114], [27, -97]], width: 8, n: 8, speed: 1 / 40 });
      o.jet = P.dropPool({ count: 90, radius: 2, color: c.spot, opacity: .85, parent: scene });
      o.spill = P.dropPool({ count: 40, radius: 2, color: c.spot, opacity: .85, parent: scene });
      o.up = P.dropPool({ count: 24, radius: 1.8, color: c.spot, opacity: .85, parent: scene });
      o.up.drops.forEach(function (d) { c.fluid(d.m); });                        // the stream inside the vessel
      o.feed = P.dropPool({ count: 30, radius: 2, color: c.spot, opacity: .85, parent: scene });
    },

    step: function (c, dt, S) {
      var o = this.o, s = o.s, h = S.playing ? dt * S.rpm / 100 : 0, n = Math.round(h / DT), i, a, R = Math.random;
      s.vc = VC[S.controls.w] || 120;
      var dist = 0, wasteOn = 0, delOn = 0;
      for (i = 0; i < n; i++) { sim(s, DT); dist += Math.abs(s.v) * DT; if (s.waste) wasteOn += DT; if (s.del) delOn += DT; }
      // valves
      var wy = s.waste ? -108 : -100.5;                                             // disc top: hanging open 8 below the seat, or shut against it
      o.wv.position.set(78, o.wv.position.y ? o.wv.position.y + (wy - o.wv.position.y) * Math.min(1, dt * 30) : wy, 0);
      var bs = BALL[S.controls.w] || 1; o.ball.scale.set(bs, bs, bs);
      var dy = s.del ? Math.min(7, s.v / 20) : 0; o.dv.position.y += (-95.5 + dy - o.dv.position.y) * Math.min(1, dt * 30);
      // water in the vessel, redrawn when the level moves
      if (Math.abs(s.L - o.Lshown) > .1) {
        o.Lshown = s.L; var p = [[0, -95], [12, -95]], a0 = Math.asin(12 / 59), a1 = Math.acos((SC - s.L) / 59);
        for (i = 0; i <= 24; i++) { a = a0 + (a1 - a0) * i / 24; p.push([59 * Math.sin(a), SC - 59 * Math.cos(a)]); }
        p.push([7.4, s.L], [7.4, -2.4], [0, -2.4]); o.vw.set(p);
      }
      // dots and drops
      o.pWaste.on = s.waste; o.pDel.on = !!s.del;
      o.flow.update(dist);
      var jv = s.hj > 0 ? Math.sqrt(2 * G * s.hj) : 0;
      o.acc[0] += h * 90; while (o.acc[0] >= 1) { o.acc[0]--; if (jv) o.jet.emit(SC + (R() - .5) * 5, NT + 1, -2 - R() * 3, (R() - .5) * 50, jv * (.9 + .1 * R()), (R() - .5) * 20); }
      o.acc[1] += wasteOn * 60 * Math.max(0, s.v) / 120; while (o.acc[1] >= 1) { o.acc[1]--; o.spill.emit(72 + 12 * R(), -95, -2 - 8 * R(), (R() - .5) * 80, 60 + 50 * R(), 0, 300); }
      o.acc[2] += delOn * 80; while (o.acc[2] >= 1) { o.acc[2]--; o.up.emit(SC + (R() - .5) * 16, -92, -2 - 8 * R(), 0, 4 * Math.max(20, s.v), 0, 0); }
      o.acc[3] += h * 30; while (o.acc[3] >= 1) { o.acc[3]--; o.feed.emit(-151, 113 + 2 * R(), -2 - 8 * R(), 40, -20, 0, G); }
      o.jet.step(h, G, function (q, d) { return d.vy < 0 && q.y < NT - 20; });
      o.spill.step(h, 300, function (q, d) { return d.vy < 0 || q.y > -62; });
      o.up.step(h, 0, function (q) { return q.y > s.L - 2; });
      o.feed.step(h, G, function (q) { return q.y < YS; });
      S.set("jet", ((NT + Math.max(0, s.hj) - YB) / 100).toFixed(2) + " m");
      S.set("v", (s.v < 0 ? "−" : "") + (Math.abs(s.v) / 100).toFixed(2) + " m/s");
      S.set("b", Math.round(60 / Math.max(.1, s.per)) + " a min");
    }
  });
})();
