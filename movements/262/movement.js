/* Nos. 262 and 263 are an end view and a side view of one machine, so both pages build it from the shared function
   below. No. 263's file loads this one and calls window.M507EccCone with its own wording, views and opening moment. */
(function () {
  var TP = 2 * Math.PI;
  // Sizes. The screw's axis is the X axis; the roller turns in the upright plane x = XR and only slides up and down.
  var K = { XR: -125, r: 18, RB: 54, XB: -160, RS: 24, XS: 6, lead: 5, travel: 90 };
  K.slope = (K.RB - K.RS) / (K.XS - K.XB);
  K.aEnd = K.travel / K.lead * TP;                       // screw angle for the whole run along the cone

  // Where everything is when the screw has turned by a (from the page's start) with the cone offset by e.
  // The cone's own centre is at e (cos th, sin th) in the (y, z) plane; the screw axis is at (0, 0).
  function geo(a, e, th0) {
    var th = th0 - a, u = -K.lead * a / TP;
    var rho = K.RB - K.slope * (K.XR - (K.XB + u));      // radius of the cone under the roller
    var cy = e * Math.cos(th), cz = e * Math.sin(th), R = rho + K.r;
    var yc = cy + Math.sqrt(R * R - cz * cz);             // roller centre, straight above the screw
    var ny = (yc - cy) / R, nz = -cz / R;                 // unit normal at the touching point, cone to roller
    return { th: th, u: u, rho: rho, yc: yc, ny: ny, nz: nz, py: cy + rho * ny, pz: cz + rho * nz };
  }
  // Turn of the roller for a small turn da of the screw: no slip at the touching point (rotations about +X, so a
  // point (y, z) turned by +d moves along (-z, y)). The roller's slide moves only along y.
  function dRoll(a, da, e, th0) {
    var g = geo(a, e, th0), h = geo(a + da, e, th0);
    var dth = -da, dyc = h.yc - g.yc;
    return (-dyc * g.nz - dth * (g.py * g.ny + g.pz * g.nz)) / K.r;
  }

  window.M507EccCone = function (page) {
    return {
      number: page.number, title: page.title, lede: page.lede, alt: page.alt, how: page.how, note: page.note,
      parts: [
        { key: "screw", color: "#5E7387", name: "Screw shaft", note: "Turns at a steady speed. Its thread runs through a fixed nut, so each turn also moves it along a little." },
        { key: "cone", color: "#8E7AA8", name: "Cone", note: "Fixed on the screw, but off centre, so it wobbles as it turns. The dark line is the path the roller has run along on it." },
        { key: "roller", color: "#C8873A", name: "Roller", note: "Pressed down onto the cone and turned by it. Watch the dark stripe on its face to see it speed up and slow down." },
        { key: "holder", color: "#D9B13B", name: "Roller holder and spring", note: "A fork that carries the roller's axle. Its rod slides up and down in a guide, and the spring presses it down." },
        { key: "nut", color: "#4FA58A", name: "Nut", note: "Stays still. The screw winds through it, which moves the shaft and cone along." }
      ],
      controls: [{ type: "range", id: "e", label: "Cone off centre by", min: 0, max: 14, step: 1, value: 9, unit: " mm",
        presets: [[0, "Centred"], [9, "As drawn"], [14, "More"]] }],
      readouts: [{ id: "roll", label: "Roller" }, { id: "h", label: "Height" }, { id: "mv", label: "Cone moved" }],
      views: page.views, viewLabels: page.viewLabels, target: page.target, distance: page.distance,

      build: function (c) {
        var T = c.THREE, P = c.P, scene = c.scene;
        var o = this.o = { a: 0, phi: 0, e: -1, th0: page.th0 };

        // screw shaft, cone and screw thread all turn together about X and slide along X
        o.shaft = new T.Group(); scene.add(o.shaft);
        var ms = c.mat("screw");
        P.at(P.cylX(4.5, 234, ms), -79, 0, 0, o.shaft);                              // plain shaft x -196..38
        o.worm = P.at(P.worm({ radius: 6.5, pitch: K.lead, length: 160, material: ms }), 118, 0, 0, o.shaft);   // thread x 38..198, root 4.5, tip 8.1
        P.at(P.cylX(5.5, 1, c.mat("screw", "dark")), -186, 0, 0, o.shaft);          // a dark ring on the left end, to see it turn

        // cone, off centre: its holder sits at shaft-local y = e (set in step) and turns local Z into X
        o.coneOff = new T.Group(); o.shaft.add(o.coneOff);
        var hold = new T.Group(); hold.rotation.y = Math.PI / 2; o.coneOff.add(hold);
        hold.add(P.lathePulley({ points: [[K.RB, K.XB], [K.RS, K.XS]], material: c.mat("cone"), mark: c.mat("cone", "mark"), segments: 96 }));   // x -160..6
        // hub on the big end, round the screw (not the cone's centre): x -169..-160, touching the end face
        o.boss = P.at(P.cylX(24, 9, c.mat("cone")), -164.5, 0, 0, o.shaft);

        // path of the roller on the cone, revealed as it runs
        o.traceMat = c.mat("cone", "dark");
        o.trace = null;

        // nut on its pedestal: nut x 48..68, y -17..17, z -15..15; hole 8.7 clears the thread tip 8.1
        var nut = P.guideBlock({ w: 34, h: 20, d: 30, hole: 8.7, material: c.mat("nut") }); nut.rotation.z = Math.PI / 2;
        P.at(nut, 58, 0, 0, scene);
        var ped = P.lathePulley({ points: [[26, -28.5], [26, -25.5], [12, -12], [10, 28.5]], material: c.fixed });
        ped.rotation.x = -Math.PI / 2; P.at(ped, 58, -45.5, 0, scene);                  // y -74..-17: top meets the nut's bottom face

        // roller: crowned rim so its edge clears the sloping cone; axis X
        o.rollG = new T.Group(); scene.add(o.rollG);
        o.spin = new T.Group(); o.rollG.add(o.spin);
        var rh = new T.Group(); rh.rotation.y = Math.PI / 2; o.spin.add(rh);
        rh.add(P.lathePulley({ points: [[16.4, -4.5], [17.5, -2.5], [K.r, 0], [17.5, 2.5], [16.4, 4.5]], material: c.mat("roller") }));   // x -4.5..4.5
        P.at(P.box(1, 11, 3, c.mat("roller", "dark")), 5.3, 9.5, 0, o.spin);          // stripe x 4.8..5.8, lifted off the face at 4.5
        P.at(P.cylX(2.5, 44, c.mat("roller")), 0, 0, 0, o.spin);                      // axle x -22..22
        // holder: cheeks x +-14.5..17.5, y -4..22; bar y 22..28 (cheek tops meet its bottom face); rod y 28..128
        var mh = c.mat("holder");
        [-16, 16].forEach(function (x) { P.at(P.box(3, 26, 8, mh), x, 9, 0, o.rollG); });
        P.at(P.box(35, 6, 8, mh), 0, 25, 0, o.rollG);
        P.at(P.cylY(3, 100, mh), 0, 78, 0, o.rollG);
        o.spring = P.spring({ radius: 6.5, wire: 1.1, turns: 9, length: 70, material: mh }); o.spring.rotation.z = Math.PI / 2;   // local X -> up
        scene.add(o.spring);

        // fixed guide over the roller: block x -135..-115, y 140..156, z -10..10; arm y 143..153, z -74..-10;
        // post x -132..-118, z -88..-74, y -70..160; foot y -74..-70 (same floor as the nut pedestal)
        var gb = P.guideBlock({ w: 20, h: 16, d: 20, hole: 3.6, material: c.fixed }); P.at(gb, K.XR, 148, 0, scene);
        P.at(P.box(10, 10, 64, c.fixed), K.XR, 148, -42, scene);
        P.at(P.box(14, 230, 14, c.fixed), K.XR, 45, -81, scene);
        P.at(P.box(50, 4, 50, c.fixed), K.XR, -72, -81, scene);
      },

      makeTrace: function (c, e) {
        var T = c.THREE, o = this.o, pts = [], n = Math.round(K.aEnd / (TP / 90)), i;
        for (i = 0; i <= n; i++) {
          var a = K.aEnd * i / n, g = geo(a, e, o.th0), cs = Math.cos(-g.th), sn = Math.sin(-g.th);
          var y = g.py * cs - g.pz * sn, z = g.py * sn + g.pz * cs;          // into the shaft's own frame
          var dy = y - e, dz = z, l = Math.hypot(dy, dz) || 1;              // lift 0.8 off the cone, outward from its centre
          pts.push(new T.Vector3(K.XR - g.u, y + .8 * dy / l, z + .8 * dz / l));
        }
        if (o.trace) { o.shaft.remove(o.trace); o.trace.geometry.dispose(); }
        var geom = new T.TubeGeometry(new T.CatmullRomCurve3(pts), n, .7, 4, false);
        o.trace = new T.Mesh(geom, o.traceMat); o.trace.userData.live = true; o.shaft.add(o.trace);
        o.traceN = n;
      },

      step: function (c, dt, S) {
        var o = this.o, e = +S.controls.e, k;
        if (e !== o.e) { o.e = e; o.coneOff.position.y = e; this.makeTrace(c, e); }
        var da = S.w * dt, ns = Math.ceil(Math.abs(da) / .02);
        for (k = 0; k < ns; k++) { o.phi += dRoll(o.a, da / ns, e, o.th0); o.a += da / ns; }
        if (o.a >= K.aEnd) { o.a = 0; }                                   // the roller has reached the small end: start the run again
        var g = geo(o.a, e, o.th0);
        o.shaft.position.x = g.u; o.shaft.rotation.x = g.th;
        o.rollG.position.set(K.XR, g.yc, 0); o.spin.rotation.x = o.phi;
        o.spring.position.set(K.XR, g.yc + 28, 0); o.spring.setLength(140 - (g.yc + 28));
        o.trace.geometry.setDrawRange(0, Math.floor(o.a / K.aEnd * o.traceN) * 24);
        var ratio = Math.abs(dRoll(o.a, 1e-3, e, o.th0) / 1e-3), rpm = S.playing ? S.rpm : 0;
        S.set("roll", Math.round(ratio * rpm) + " rpm");
        S.set("h", Math.round(g.yc - K.r) + " mm");
        S.set("mv", Math.round(-g.u) + " mm");
      }
    };
  };
  window.M507EccCone.K = K; window.M507EccCone.geo = geo; window.M507EccCone.dRoll = dRoll;

  M507.define(window.M507EccCone({
    number: 262,
    title: "Eccentric cone and roller, end view",
    th0: 0,
    lede: "A cone is fixed off centre on a screw, and a small roller is pressed onto it. As the screw turns, the roller speeds up and slows down once every turn. The screw also creeps along, so the roller works its way down the cone and turns slower and slower.",
    alt: "Seen end on: a big round cone face with a smaller round hub low down on it, where the screw passes through. A small roller sits on top of the cone, held by a fork on a sprung rod from a fixed arm. Behind, the nut on its pedestal.",
    how: [
      "Seen end on, the cone looks like a big circle, and the screw passes through it below the middle. As it turns, the side under the roller swings further out, then comes back in. The roller rides up and down with it.",
      "The roller is turned by the surface it touches. When the far side of the cone is under it, that surface is far from the screw and moves fast, so the roller turns fast. Half a turn later the near side is under it and the roller turns slowly. The screw's thread runs through a fixed nut, so the cone also moves along a little each turn. The roller ends up on a thinner part, and turns slower overall.",
      "Watch the Roller and Height readings rise and fall together once each turn. Each fall is a little bigger than each rise, because the cone gets thinner under the roller. Try Centred, and the roller turns at a steady speed that slows only very gently."
    ],
    note: "This model is rebuilt from Brown's drawing. The fork, the rod, the spring and the post and arm that hold them were made up; Brown only says a spring or weight presses the roller down. Brown says the roller also changes direction. With the cone only a little off centre, as he draws it, the roller never turns backwards; what goes back and forth is the roller itself, rising and falling, with each fall longer than each rise. When the roller nears the small end, the model starts the run again.",
    views: { "3d": [-640, 55, 0], front: [-30, 45, 700], side: [-480, 230, 520] },
    viewLabels: { "3d": "End", front: "Side", side: "3D" },
    target: [-60, 45, 0], distance: [250, 1800]
  }));
})();
