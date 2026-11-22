(function () {
  // Sizes. The drum turns about the X axis; its big end is on the left. The arm swings about a pin (along Z) at PV,
  // and the roller slides along it. Everything that touches lies in the plane z = 0.
  var K = { XB: -105, XS: 105, RB: 92, RS: 34, rr: 42, hw: 7, crown: 3, PV: [238, 42], L: 372 };
  function rho(x) {                                     // the drum's curved (hollow) outline, big end to small end
    var f = (x - K.XB) / (K.XS - K.XB), q = 1 - f;
    return K.RS + (K.RB - K.RS) * (.7 * q * q + .3 * q);
  }
  // Roller surface: offset w along its axle (-hw..hw), crowned radius, angle p round it (0 = straight down the arm's normal).
  function pts(al, s) {
    var ax = -Math.cos(al), ay = Math.sin(al), nx = Math.sin(al), ny = Math.cos(al), out = [], i, j;
    var cx = K.PV[0] + s * ax, cy = K.PV[1] + s * ay;
    for (i = -4; i <= 4; i++) {
      var w = K.hw * i / 4, R = K.rr - K.crown * (w / K.hw) * (w / K.hw);
      for (j = -12; j <= 12; j++) {
        var p = j * .04, x = cx + w * ax - R * Math.cos(p) * nx, y = cy + w * ay - R * Math.cos(p) * ny, z = R * Math.sin(p);
        out.push({ x: x, y: y, z: z, w: w, R: R, p: p });
      }
    }
    return out;
  }
  function gap(al, s) {                                 // smallest clearance between the roller and the drum
    var best = { g: 1e9 };
    pts(al, s).forEach(function (q) {
      if (q.x < K.XB || q.x > K.XS) return;
      var g = Math.hypot(q.y, q.z) - rho(q.x); if (g < best.g) { best = q; best.g = g; }
    });
    return best;
  }
  // Arm angle that lets the roller just rest on the drum, with the touching point and the speed ratio roller / drum.
  function solve(s) {
    var lo = 0, hi = .8, i, m;
    for (i = 0; i < 40; i++) { m = (lo + hi) / 2; if (gap(m, s).g < 0) lo = m; else hi = m; }
    var al = hi, q = gap(al, s), ax = -Math.cos(al), ay = Math.sin(al);
    // drum surface speed at q is (0, -z, y) per unit drum speed; roller rim moves along axle x (q - axle point) / R
    var cx = K.PV[0] + (s + q.w) * ax, cy = K.PV[1] + (s + q.w) * ay;
    var rx = (q.x - cx) / q.R, ry = (q.y - cy) / q.R, rz = q.z / q.R;
    var tx = ay * rz, ty = -ax * rz, tz = ax * ry - ay * rx;
    var ratio = (-q.z * ty + q.y * tz) / q.R;
    return { al: al, x: K.PV[0] + s * ax, rad: Math.hypot(q.y, q.z), ratio: ratio, g: q.g };
  }

  M507.define({
    number: 265,
    title: "Cone drum and sliding roller",
    lede: "A drum with curved, sloping sides turns at a steady speed. A roller rests on it and is turned by it. Slide the roller towards the big end and it turns faster; towards the small end and it turns slower.",
    alt: "A drum shaped like a trumpet bell lying on its side, big end to the left, on a shaft between two bearings. A long slanting arm, hinged on the right, carries a wheel that rests on top of the drum.",
    parts: [
      { key: "drum", color: "#5E7387", name: "Drum", note: "Turns at a steady speed. Its sides curve in, so it is wide at one end and thin at the other. The red stripe shows its turning." },
      { key: "roller", color: "#C8873A", name: "Roller", note: "Rests on the drum and is turned by it. It can slide along its arm. Watch the red stripe on its face." },
      { key: "arm", color: "#D9B13B", name: "Arm", note: "A rod hinged on the right. The roller slides along it and turns it. The arm rises and falls to keep the roller on the drum." }
    ],
    controls: [{ type: "range", id: "pos", label: "Roller along the drum", min: 0, max: 100, step: 1, value: 60, unit: " %",
      presets: [[0, "Big end"], [50, "Middle"], [100, "Small end"]] }],
    readouts: [{ id: "roll", label: "Roller" }, { id: "rad", label: "Drum radius" }],
    views: { "3d": [40, 30, 640], side: [-700, 60, 40], top: [40, 720, 60] },
    viewLabels: { "3d": "Front", side: "End", top: "Top" },
    target: [40, 10, 0], distance: [250, 1800],
    how: [
      "The drum turns at a steady speed. The roller rests on top and is turned by it, the way one wheel turns another by rubbing. The arm it slides on is hinged on the right, so it can rise and fall with the drum's outline.",
      "Every turn of the drum, the surface under the roller travels once round the drum. Near the big end that is a long way, near the small end a short way. The roller's rim must travel the same distance, so its speed follows the size of the drum where it touches.",
      "Slide the roller from the big end to the small end and watch the Roller reading drop. Try the middle, then the small end, and compare. Notice how the arm tips as the roller goes."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown does not show how the roller is held or moved along; here it slides on a rod hinged at its right end, and the slider moves it. The roller is slightly rounded on its rim so that it touches the curved drum at one point. The bearings, the hinge and the base were made up.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { a: 0, phi: 0, ax: new T.Vector3(), ay: new T.Vector3() }, i;
      // table of arm angle, roller place and speed ratio for every place along the arm
      o.tab = [];
      for (i = 0; i <= 215; i++) { var s = 130 + i; o.tab.push(solve(s)); o.tab[i].s = s; }

      // drum on its shaft, turning about X: drum x -105..105, shaft x -150..196
      o.drum = new T.Group(); scene.add(o.drum);
      var hd = new T.Group(); hd.rotation.y = Math.PI / 2; o.drum.add(hd);
      hd.add(P.lathePulley({ profile: function (z) { return rho(z); }, length: 210, samples: 60, segments: 96, material: c.mat("drum"), mark: c.mat("drum", "mark") }));
      P.at(P.cylX(6, 346, c.mat("drum")), 23, 0, 0, o.drum);

      // two pedestal bearings: x -142..-128 and 148..162, feet at y -110 on the base
      [-135, 155].forEach(function (x) {
        var b = P.bearingBlock({ bore: 6.5, outer: 12, drop: 110, width: 14, material: c.fixed }); b.rotation.y = Math.PI / 2; P.at(b, x, 0, 0, scene);
      });
      P.at(P.box(410, 4, 100, c.fixed), 45, -112, 0, scene);                   // base x -160..250, y -114..-110

      // hinge: cheeks x 230..246, y -110..52, z 10..16 and -16..-10; pin z -10..10 ends on the cheeks' inner faces
      [13, -13].forEach(function (z) { P.at(P.box(16, 162, 6, c.fixed), 238, -29, z, scene); });
      P.at(P.cylZ(3, 20, c.fixed), K.PV[0], K.PV[1], 0, scene);

      // arm: framed so local X runs along the rod away from the hinge, local Y is its upper side
      o.arm = new T.Group(); o.arm.position.set(K.PV[0], K.PV[1], 0); scene.add(o.arm);
      var ma = c.mat("arm");
      P.at(P.cylX(7, 16, ma), 0, 0, 0, o.arm);                                  // swivel sleeve on the pin, x -8..8
      o.spin = new T.Group(); o.arm.add(o.spin);
      P.at(P.cylX(4, 380, ma), 182, 0, 0, o.spin);                              // rod x -8..372, ends at the sleeve's outer face
      P.at(P.box(30, 1, 2, c.mat("arm", "dark")), 30, 4.5, 0, o.spin);          // dark stripe on the rod, lifted off its top
      // roller, crowned, axis along the rod
      o.roll = new T.Group(); o.spin.add(o.roll);
      var hr = new T.Group(); hr.rotation.y = Math.PI / 2; o.roll.add(hr);
      var prof = []; for (i = -4; i <= 4; i++) { var w = K.hw * i / 4; prof.push([K.rr - K.crown * (w / K.hw) * (w / K.hw), w]); }
      hr.add(P.lathePulley({ points: prof, material: c.mat("roller"), segments: 72 }));          // x -7..7
      P.at(P.cylX(9, 22, c.mat("roller")), 0, 0, 0, o.roll);                   // sleeve with a key, slides on the rod
      P.at(P.box(1, 24, 4, c.mat("roller", "mark")), 7.6, 22, 0, o.roll);       // red stripe x 7.1..8.1, lifted off the face at 7
    },

    step: function (c, dt, S) {
      var o = this.o, tab = o.tab, xc = -85 + 1.7 * +S.controls.pos, i = 0, f;
      while (i < tab.length - 2 && tab[i + 1].x > xc) i++;                     // x falls as s grows
      f = Math.max(0, Math.min(1, (tab[i].x - xc) / (tab[i].x - tab[i + 1].x)));
      var s = tab[i].s + f, al = tab[i].al + f * (tab[i + 1].al - tab[i].al);
      var ratio = tab[i].ratio + f * (tab[i + 1].ratio - tab[i].ratio), rad = tab[i].rad + f * (tab[i + 1].rad - tab[i].rad);
      o.a += S.w * dt; o.phi += ratio * S.w * dt;
      o.drum.rotation.x = o.a;
      o.ax.set(-Math.cos(al), Math.sin(al), 0); o.ay.set(Math.sin(al), Math.cos(al), 0);
      c.P.frame(o.arm, o.ax, o.ay);                                             // local X points left and up, at al above level
      o.spin.rotation.x = o.phi; o.roll.position.x = s;
      var rpm = S.playing ? S.rpm : 0;
      S.set("roll", (Math.round(Math.abs(ratio) * rpm * 10) / 10) + " rpm");
      S.set("rad", Math.round(rad) + " mm");
    }
  });
  window.M507Cone265 = { K: K, rho: rho, solve: solve, gap: gap };
})();
