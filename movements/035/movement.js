M507.define({
  number: 35,
  title: "Elliptical gear with a sliding pinion",
  lede: "A small gear turning at a steady speed drives a big oval gear. The oval gear speeds up and slows down twice in every turn. A spring and a slotted bar let the small gear move in and out to follow the oval.",
  alt: "A big oval gear on an upright plate. A small round gear with a crank meshes with its upper left edge. A bar with a long slot runs from the oval gear's shaft out past the small gear, with a coil spring in the slot.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion and crank", note: "A small gear is called a pinion. The crank turns it at a steady speed, and its shaft can slide along the slot in the bar." },
    { key: "gear", color: "#C8873A", name: "Elliptical gear", note: "A big oval gear that turns on a shaft through its middle. Watch its red stripe. It hurries and then lags, twice in every turn." },
    { key: "bar", color: "#D9B13B", name: "Slotted bar", note: "It hangs loosely on the big gear's shaft and is free to swing. The dark block in its slot holds the pinion's shaft." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "It pulls the pinion towards the big gear's shaft. That keeps the teeth together while the oval edge moves in and out." }
  ],
  controls: [],
  readouts: [{ id: "in", label: "Pinion" }, { id: "out", label: "Oval gear" }],
  views: { "3d": [270, 170, 690], front: [-15, 12, 800], side: [800, 12, 0] },
  target: [-15, 12, 0],
  how: [
    "Turn the crank and the small gear, called a pinion, turns at a steady speed. Its teeth push the big oval gear round. Watch the red stripe on the oval gear. It hurries, then lags, twice in every turn. A minus sign in the readout means the other way.",
    "The pinion moves the big gear's teeth past it at a steady rate. At a long end of the oval, those teeth are far from the big gear's shaft, so the gear only turns a little. At a flat side the teeth are close to the shaft, so the same push turns the gear further. That is why it speeds up and slows down.",
    "The edge of the oval moves in and out as it turns, so the pinion has to move with it. Its shaft slides along the slot in the yellow bar, and the spring pulls it in to keep the teeth together. Slow the speed right down. Watch the pinion slide in the slot while the readout rises and falls."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show what turns the pinion, or what stops the loose bar from swinging right round. Here a crank turns the pinion, and its shaft slides between two fixed rails on the back plate. The crank, the rails, the plate, the sizes and the number of teeth were made up.",

  /* Kinematics. The big gear's pitch curve is a true ellipse (half-axes a, b) turning on its centre O. The pinion's pitch
     circle (radius rp) rolls on it without slip. In the gear's own frame, with the contact at ellipse parameter t:
       contact C = (a cos t, b sin t), outward normal at angle psi, pinion centre Q = C + rp * normal, |Q| = d, angle lam.
     The pinion's shaft is held on a fixed straight line (the rails): direction `dir`, passing h from O. A point of the line
     at distance d from O lies at world angle beta(d) = dir + atan2(h, sqrt(d^2 - h^2)); that is also the bar's angle.
     So the gear's rotation is rho = beta(d) - lam, and rolling without slip gives the pinion's rotation
       F = rho + s / rp + psi          (s = arc length of the ellipse from t = 0)
     F rises steadily with t, so the table F -> (rho, d) is inverted by search. One turn of the gear takes N / Np pinion turns. */
  _kin: function (a, b, N, Np, dir, h) {
    var n = 2880, dt = 2 * Math.PI / n, s = 0, F = [], RHO = [], D = [], pts = [], i, px = a, py = 0, lamPrev = 0, psiPrev = 0, L = 0;
    for (i = 0; i < n; i++) L += Math.hypot(a * Math.cos((i + 1) * dt) - a * Math.cos(i * dt), b * Math.sin((i + 1) * dt) - b * Math.sin(i * dt));
    var rp = Np * L / N / (2 * Math.PI);                    // same tooth pitch on both
    function near(x, ref) { return x + 2 * Math.PI * Math.round((ref - x) / (2 * Math.PI)); }
    function beta(d) { return dir + Math.atan2(h, Math.sqrt(d * d - h * h)); }
    for (i = 0; i <= n; i++) {
      var t = i * dt, cx = a * Math.cos(t), cy = b * Math.sin(t);
      s += Math.hypot(cx - px, cy - py); px = cx; py = cy;
      var psi = near(Math.atan2(a * Math.sin(t), b * Math.cos(t)), psiPrev); psiPrev = psi;
      var qx = cx + rp * Math.cos(psi), qy = cy + rp * Math.sin(psi), d = Math.hypot(qx, qy), lam = near(Math.atan2(qy, qx), lamPrev); lamPrev = lam;
      var rho = beta(d) - lam;
      D.push(d); RHO.push(rho); F.push(rho + s / rp + psi);
      if (i < n && i % 4 === 0) pts.push([cx, cy]);
    }
    var per = F[n] - F[0];
    function at(f) {                                        // f = pinion rotation; returns gear rotation, slot distance, bar angle, speed ratio
      var k = Math.floor((f - F[0]) / per), g = f - k * per, lo = 0, hi = n;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (F[m] <= g) lo = m; else hi = m; }
      var u = (g - F[lo]) / (F[lo + 1] - F[lo]), dd = D[lo] + (D[lo + 1] - D[lo]) * u;
      return { rho: RHO[lo] + (RHO[lo + 1] - RHO[lo]) * u - 2 * Math.PI * k, d: dd, bar: beta(dd), ratio: (RHO[lo + 1] - RHO[lo]) / (F[lo + 1] - F[lo]) };
    }
    for (var lo2 = 0; RHO[lo2 + 1] > 0;) lo2++;             // start where the gear lies level (rho = 0), as Brown draws it
    var f0 = F[lo2] + (F[lo2 + 1] - F[lo2]) * RHO[lo2] / (RHO[lo2] - RHO[lo2 + 1]);
    return { rp: rp, L: L, pts: pts, at: at, f0: f0, per: per, beta: beta };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, N = 38, Np = 10, DIR = 105 * Math.PI / 180, H = 68;
    var K = this._kin(137, 87, N, Np, DIR, H), o = this.o = { K: K, f: K.f0, c0: Math.PI - Math.PI / Np };
    // elliptical gear: gear z -8..8, shaft z -30..22 (starts at the plate face), hub z 8..11
    o.gear = new T.Group(); scene.add(o.gear);
    var g = P.noncircularGear({ points: K.pts, teeth: N, phase: 0, width: 16, material: c.mat("gear") }); o.gear.add(g);
    P.at(P.cylZ(6, 52, c.mat("gear")), 0, 0, -4, o.gear);                     // shaft z -30..22
    P.at(P.cylZ(12, 3, c.mat("gear")), 0, 0, 9.5, o.gear);                    // hub z 8..11, on the gear face
    P.at(P.box(111, 5, 1, c.mat("gear", "mark")), 67.5, 0, 9, o.gear);        // red stripe x 12..123 along the long axis, z 8.5..9.5, lifted off the face
    // slotted bar, loose on the gear's shaft: local +X runs along the bar
    o.bar = new T.Group(); scene.add(o.bar);
    P.at(P.cylZ(15, 8, c.mat("bar")), 0, 0, 15, o.bar);                       // eye z 11..19, sits on the hub face (z 11)
    P.at(P.box(56, 22, 6, c.mat("bar")), 42, 0, 15, o.bar);                   // solid neck x 14..70, y -11..11, z 12..18
    [-1, 1].forEach(function (sd) { P.at(P.box(125, 5, 6, c.mat("bar")), 132.5, sd * 8.5, 15, o.bar); });   // slot sides x 70..195, y 6..11 each side
    P.at(P.box(8, 22, 6, c.mat("bar")), 199, 0, 15, o.bar);                   // end x 195..203, closes the slot
    o.block = P.at(P.box(16, 11, 8, c.mat("bar", "dark")), 0, 0, 15, o.bar);  // bearing block, y -5.5..5.5 inside the slot (6 each side), z 11..19
    o.spring = P.at(P.spring({ radius: 3.6, wire: .9, turns: 9, length: 62, material: c.mat("spring") }), 70, 0, 15, o.bar);   // from the neck's end face (x 70) to the block
    // pinion and crank: gear z -8..8, shaft z -30..26 (starts at the plate face, between the rails), arm z 26..32, handle z 32..56
    o.pin = new T.Group(); scene.add(o.pin);
    o.pin.add(P.spurGear({ teeth: Np, module: g.pitch / Math.PI, material: c.mat("pinion") }));
    P.at(P.cylZ(5, 56, c.mat("pinion")), 0, 0, -2, o.pin);                    // shaft z -30..26
    P.at(P.cylZ(9, 3, c.mat("pinion")), 0, 0, 9.5, o.pin);                    // hub z 8..11, below the bar (z 12)
    P.at(P.box(48, 10, 6, c.mat("pinion")), 20, 0, 29, o.pin);                // crank arm x -4..44, z 26..32, on the shaft end
    P.at(P.cylZ(4.5, 24, c.mat("pinion")), 40, 0, 44, o.pin);                 // handle z 32..56, on the arm face
    // supports
    P.at(P.box(350, 345, 10, c.fixed), -15, 12.5, -35, scene);                // plate x -190..160, y -160..185, z -40..-30; shafts end at z -30
    P.at(P.box(390, 12, 100, c.fixed), -15, -166, -30, scene);                // base x -210..180, y -172..-160, z -80..20; plate stands on y -160
    // rails: the pinion's shaft (radius 5) slides between them along the fixed line. Local +X along the line, origin at its foot.
    var rails = new T.Group(); rails.rotation.z = DIR; rails.position.set(-H * Math.sin(DIR), H * Math.cos(DIR), 0); scene.add(rails);
    [-1, 1].forEach(function (sd) { P.at(P.box(96, 6, 8, c.fixed), 124, sd * 9.5, -26, rails); });   // x 76..172 along the line, 6.5..12.5 to each side, z -30..-22 on the plate face
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.f += S.w * dt;                                       // the pinion turns steadily
    var k = o.K.at(o.f);
    o.gear.rotation.z = k.rho;
    o.bar.rotation.z = k.bar;                              // the bar points from the gear's shaft to the pinion's shaft
    o.pin.position.set(k.d * Math.cos(k.bar), k.d * Math.sin(k.bar), 0);
    o.pin.rotation.z = o.f + o.c0;                         // a pinion gap meets each gear tooth
    o.block.position.x = k.d;
    o.spring.setLength(k.d - 8 - 70);                      // from x 70 to the block's inner face
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : rpm * k.ratio));
  }
});
