/* Nos. 294 and 295 are two drawings of one machine, the cylinder escapement. It is built here by window.M507Cylinder.
   No. 295's file loads this one and calls window.M507Cylinder with its own wording, views and way of standing. */
(function () {
  // Flat layout (the plan, as in Brown's 295): the cylinder turns about the origin, the escape wheel about (0, -RC).
  // The wheel turns anticlockwise, so its teeth pass the cylinder from right to left. Each tooth is a wedge: a low
  // point in front and a high heel behind. The shell of the cylinder covers the half away from the wheel.
  var RAD = Math.PI / 180, N = 15, RC = 104, RI = 10, RO = 12.4, LEN = 16.2, LIFT = 4.5, UNDER = 2;
  var IW = .06, TAU = 55, CW = .3, IB = 1, CB = .3, H = .0005, STRIP = 50 * RAD;
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a) - RC]; }
  function toothAngle(k) { return 90 * RAD + k * 2 * Math.PI / N; }
  function tooth(k) {                              // point, heel, and the corner under the heel
    var a = toothAngle(k), d = LEN / RC;
    return [pol(RC, a), pol(RC + LIFT, a - d), pol(RC - UNDER, a - d)];
  }
  function shell() {                               // the half shell, from 0 to 180 degrees
    var p = [], i;
    for (i = 0; i <= 60; i++) p.push([RO * Math.cos(i * 3 * RAD), RO * Math.sin(i * 3 * RAD)]);
    for (i = 60; i >= 0; i--) p.push([RI * Math.cos(i * 3 * RAD), RI * Math.sin(i * 3 * RAD)]);
    return p;
  }
  // Bodies: 0 escape wheel, 1 cylinder with the balance.
  function makeSim(P) {
    var teeth = []; for (var k = 0; k < N; k++) teeth.push(tooth(k));
    var s = P.pivotSim({
      bodies: [{ pivot: [0, -RC], I: IW, polys: teeth, drag: CW, a: -14 / RC },      // a tooth just short of the cylinder
        { pivot: [0, 0], I: IB, polys: [shell()], drag: CB, a: -.5 }],                // the balance held a little to one side, then let go
      pairs: [[0, 1]]
    });
    s.t = 0; s.amp = 0; s.beats = [];
    s.run = function (h, k) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      b[0].tq = TAU; b[1].tq = -k * b[1].a;                                          // the mainspring turns the wheel, the balance spring pulls the balance back to the middle
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0 && Math.abs(b[1].a) > .2) s.amp = Math.abs(b[1].a);        // the far end of a swing
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }   // passing the middle: one beat
    };
    return s;
  }
  var K = { N: N, RC: RC, RI: RI, RO: RO, LEN: LEN, LIFT: LIFT, H: H, STRIP: STRIP, toothAngle: toothAngle };

  var PARTS = [
    { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "The mainspring, not shown, keeps trying to turn it. Each tooth is a small wedge held up on a post. Watch the red tooth go through the cylinder." },
    { key: "cyl", color: "#C8873A", name: "Cylinder", note: "A thin tube with half its wall cut away where the teeth pass. A tooth rests first on the outside of the wall, then on the inside." },
    { key: "balance", color: "#D9B13B", name: "Balance wheel", note: "A heavy ring fixed to the top of the cylinder. It swings the cylinder to and fro and sets the pace." },
    { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A fine coiled spring. It always pulls the balance wheel back towards the middle, so the wheel keeps swinging." }
  ];

  window.M507Cylinder = function (page) {
    return {
      number: page.number, title: page.title, lede: page.lede, alt: page.alt, how: page.how, note: page.note,
      parts: PARTS,
      controls: [{ type: "range", id: "k", label: "Balance spring", min: 20, max: 80, step: 5, value: 40, unit: "",
        presets: [[20, "Soft"], [40, "Medium"], [80, "Stiff"]] }],
      speed: false,
      readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
      views: page.views, target: page.target, distance: page.distance, opacity: page.opacity,
      makeSim: makeSim, K: K,

      build: function (c) {
        var T = c.THREE, P = c.P, mw = c.mat("wheel"), mc = c.mat("cyl"), mb = c.mat("balance"), i;
        var o = this.o = { sim: makeSim(P) };
        for (i = 0; i < 12000; i++) o.sim.run(H, 40);                                // run 6 seconds so it opens in its steady swing
        // The machine is built on a plate: x and y as in the plan, z up from the plate along the cylinder.
        var m = new T.Group(); c.scene.add(m);
        if (page.lying) {                                                            // No. 294: the cylinder lies along world X, the wheel hangs below it
          m.setRotationFromMatrix(new T.Matrix4().makeBasis(new T.Vector3(0, 0, -1), new T.Vector3(0, 1, 0), new T.Vector3(1, 0, 0)));
          m.position.set(-40, 60, 0);
        }
        var top = mc;
        if (page.ghostTop) { top = mc.clone(); top.transparent = true; top.opacity = .13; top.depthWrite = false; }   // No. 295: see down into the cut
        function slab(pts, z0, z1, mat) {
          var sh = new T.Shape(); pts.forEach(function (q, j) { if (j) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
          var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return new T.Mesh(g, mat);
        }
        function ring(r0, r1, a0, a1, z0, z1, mat) {                                 // part of a tube wall, from angle a0 to a1
          var pts = [], n = Math.max(8, Math.round((a1 - a0) / (3 * RAD))), j;
          for (j = 0; j <= n; j++) pts.push([r1 * Math.cos(a0 + (a1 - a0) * j / n), r1 * Math.sin(a0 + (a1 - a0) * j / n)]);
          for (j = n; j >= 0; j--) pts.push([r0 * Math.cos(a0 + (a1 - a0) * j / n), r0 * Math.sin(a0 + (a1 - a0) * j / n)]);
          return slab(pts, z0, z1, mat);
        }
        function tube(r0, r1, z0, z1, mat) {
          var sh = new T.Shape(), hole = new T.Path(); sh.absarc(0, 0, r1, 0, 2 * Math.PI, false); hole.absarc(0, 0, r0, 0, 2 * Math.PI, true); sh.holes.push(hole);
          var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 40 }); g.translate(0, 0, z0); return new T.Mesh(g, mat);
        }
        // escape wheel: arbor z 0..14 from the plate, hub 14..24, rim and arms z 17..23, posts 23..40, teeth 40..46
        o.wheel = new T.Group(); o.wheel.position.set(0, -RC, 0); m.add(o.wheel);
        P.at(P.cylZ(4, 14, mw), 0, 0, 7, o.wheel);                                   // arbor z 0..14, plate face to the hub
        P.at(P.cylZ(11, 10, mw), 0, 0, 19, o.wheel);                                 // hub z 14..24
        P.at(P.cylZ(6, 1, c.mat("wheel", "dark")), 0, 0, 24.5, o.wheel);             // dot z 24..25 on the hub
        o.wheel.add(tube(76, 86, 17, 23, mw));                                       // rim z 17..23
        for (i = 0; i < 4; i++) { var sp = P.at(P.box(67, 7, 5, mw), 0, 0, 20, o.wheel); sp.rotation.z = i * Math.PI / 2 + .3; sp.translateX(43.5); }   // spokes from 10 to 77, z 17.5..22.5
        for (i = 0; i < N; i++) {
          var a = toothAngle(i) - .75 * LEN / RC, tm = i ? mw : c.mat("wheel", "mark");
          var arm = P.at(P.box(21.4, 4.5, 6, mw), 0, 0, 20, o.wheel); arm.rotation.z = a; arm.translateX(95.7);   // arm from 85 to 106.4, z 17..23
          P.at(P.cylZ(1.6, 17, mw), (RC + .8) * Math.cos(a), (RC + .8) * Math.sin(a), 31.5, o.wheel);         // post z 23..40, arm top to the tooth
          o.wheel.add(slab(tooth(i).map(function (q) { return [q[0], q[1] + RC]; }), 40, 46, tm));            // tooth z 40..46
        }
        // cylinder: plug z 10..14, a narrow strip of wall 14..39.5 (the wheel's arms and posts pass here), the half
        // shell 39.5..47 (the teeth pass here), whole tube 47..60, plug 60..64
        o.cyl = new T.Group(); m.add(o.cyl);
        o.cyl.add(ring(RI, RO, 90 * RAD - STRIP, 90 * RAD + STRIP, 14, 39.5, mc));
        o.cyl.add(ring(RI, RO, 0, Math.PI, 39.5, 47, mc));
        o.cyl.add(tube(RI, RO, 47, 60, top));
        P.at(P.cylZ(RO, 4, top), 0, 0, 62, o.cyl);                                   // top plug z 60..64
        P.at(P.cylZ(RO, 4, page.ghostTop ? top : mc), 0, 0, 12, o.cyl);              // bottom plug z 10..14
        // balance: staff below z 0..10 and above 64..92, spring collar 67..73, wheel 78..84
        o.bal = new T.Group(); m.add(o.bal);
        P.at(P.cylZ(3, 10, mb), 0, 0, 5, o.bal);                                     // lower staff z 0..10, plate face to the plug
        P.at(P.cylZ(3, 28, mb), 0, 0, 78, o.bal);                                    // upper staff z 64..92
        P.at(P.cylZ(4.5, 6, mb), 0, 0, 70, o.bal);                                   // collar z 67..73, holds the inner end of the spring
        P.at(P.cylZ(8, 8, mb), 0, 0, 81, o.bal);                                     // hub z 77..85
        o.bal.add(tube(52, 60, 78, 84, mb));                                         // rim z 78..84
        for (i = 0; i < 3; i++) { var bs = P.at(P.box(46, 6, 4, mb), 0, 0, 81, o.bal); bs.rotation.z = i * 2 * Math.PI / 3 + .5; bs.translateX(30); }   // spokes from 7 to 53, z 79..83
        P.at(P.cylZ(4, 1, c.mat("balance", "mark")), 56, 0, 84.5, o.bal);            // red dot z 84..85 on the rim, to follow the swing
        // balance spring z 68..72: inner end on the collar, outer end held by a post at (0, 32)
        o.sp = new T.Group(); o.sp.position.z = 70; m.add(o.sp);
        o.spring = P.spiralSpring({ rIn: 5, rOut: 32, width: 4, thick: 1, material: c.mat("spring") }); o.sp.add(o.spring);
        P.at(P.box(5, 5, 73, c.fixed), 0, 35, 36.5, m);                              // post y 32.5..37.5, z 0..73, stands on the plate
        // plate z -8..0 under everything
        P.at(P.box(250, 300, 8, c.fixed), 0, -70, -4, m);                            // plate x -125..125, y -220..80, z -8..0
        if (page.lying) P.at(P.box(12, 250, 120, c.fixed), 226, 0, 0, m);            // foot x 220..232 (below the plate's lower edge), z -60..60
        else P.at(P.box(250, 12, 120, c.fixed), 0, -226, 0, m);                      // foot y -232..-220, the plate stands on it
      },

      step: function (c, dt, S) {
        var o = this.o, sim = o.sim, k = S.controls.k, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0;
        for (var i = 0; i < n; i++) sim.run(H, k);
        var th = sim.bodies[0].a, ph = sim.bodies[1].a;
        o.wheel.rotation.z = th; o.cyl.rotation.z = ph; o.bal.rotation.z = ph; o.sp.rotation.z = ph;
        o.spring.set(8.5 * Math.PI - ph);                                            // the outer end stays at the post
        var b = sim.beats, per = b.length > 2 ? (b[b.length - 1] - b[0]) / (b.length - 1) : 0;
        S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
        S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
      }
    };
  };

  M507.define(window.M507Cylinder({
    number: 294,
    title: "Cylinder escapement",
    lede: "A watch needs something to let its wheels turn one small step at a time. Here a thin tube with half its wall cut away does the job. The teeth of a wheel slip through the tube one by one as it swings.",
    alt: "A thin tube lies on its side with a long notch cut out of its wall, so you can see inside. A toothed wheel hangs below it, with one of its small wedge teeth sitting in the notch. A ring-shaped balance wheel and a coiled spring are fixed to one end of the tube.",
    how: [
      "The tube is called the cylinder. Half of its wall is cut away where the teeth pass. A spring, not shown, tries to turn the escape wheel, but a tooth is stopped by the outside of the wall. The balance wheel swings the cylinder round until the cut edge passes the tooth. Then the tooth slips into the cylinder.",
      "Each tooth is a wedge. As it slides in, its sloping back pushes on the cut edge and gives the balance a small shove. Then the point of the tooth stops against the inside of the wall. The balance swings back, the other cut edge passes the point, and the tooth slides out. It gives a second shove the other way as it goes. The next tooth then lands on the outside of the wall.",
      "The balance spring pulls the balance back to the middle, and that sets the pace. A stiff spring pulls harder, so the swings are quicker and the wheel turns faster. Try Soft, then Stiff, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing and description. Brown draws only the cylinder here. The escape wheel, the balance wheel, the balance spring and its post, the plate and all the sizes were made up. The bridge that holds the top of the balance in a real watch is left out, and so is the spring that drives the wheel. The escape wheel, balance wheel and balance spring are drawn faint so the cylinder shows clearly. Pick one to see it solid. The rubbing that keeps the swing steady is a simple guess.",
    lying: true,
    views: { "3d": [70, 75, 165], front: [-3, 60, 640], side: [640, 60, 0] },
    target: [-3, 60, 0], distance: [60, 1800],
    opacity: function (key, S) { return (key === "cyl" || S.iso === key) ? 1 : .12; }   // the cylinder reads first, as in the drawing; pick a part to see it solid
  }));
})();
