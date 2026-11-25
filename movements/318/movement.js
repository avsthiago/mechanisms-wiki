(function () {
  // Layout (model units). Seen from the front (+Z), balance staff on the Z axis. Back plate face z -34; balance z -4..4;
  // balance spring z 10..16; regulator lever z 23..29 on a fixed ring z 22..30; cock (bridge) z 30..36.
  // The spring's outer turn is a true circle of radius RP from the curb pins round to the stud at 180 degrees, so the
  // pins can slide along it. Going outwards the spring winds clockwise. The lever sits at angle -90 + PHI (pointing down
  // at PHI = 0); turning it to the right moves the pins along the outer turn towards the inner coils, so less spring is
  // left to bend. A spring's stiffness goes as 1 / length, so the beat rate goes as 1 / sqrt(acting length).
  var RAD = Math.PI / 180, RIN = 6.4, RP = 62, TURNS = 4, AMP = 160 * RAD, PER0 = 2.5, BEATS0 = 300;   // beats a minute at the middle (18,000 an hour)
  function spiralLen(sweep) {                                    // length of the Archimedean part from RIN to RP over `sweep` radians
    var n = 400, L = 0, dr = (RP - RIN) / n, da = sweep / n;
    for (var i = 0; i < n; i++) { var r = RIN + (i + .5) * dr; L += Math.sqrt(dr * dr + r * r * da * da); }
    return L;
  }
  var L0 = spiralLen(TURNS * 2 * Math.PI);
  function phi(v) { return v * 5 * RAD; }                        // control steps of 5 degrees
  function acting(p) { return spiralLen(TURNS * 2 * Math.PI - p); }

  M507.define({
    number: 318,
    title: "Watch regulator",
    lede: "A small lever on a watch lets you make it run faster or slower. Two pins on the lever hold the coiled balance spring. Moving the lever changes how much of the spring is free to bend.",
    alt: "A balance wheel with three spokes, seen face on. A fine coiled spring sits on its middle, its outer end held in a small block on the left. A long lever turns about the middle and points down past the wheel to a curved scale. Two small pins on the lever hold the outer turn of the spring. The scale is marked slow on the left and fast on the right.",
    parts: [
      { key: "balance", color: "#D9B13B", name: "Balance wheel", note: "Swings one way and then the other, and sets the pace of the watch. Watch the red dot on its rim." },
      { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A fine coiled strip. Its inner end turns with the wheel and its outer end is held still. Only the part inside the pins bends; the dark part beyond them stays still." },
      { key: "lever", color: "#C8873A", name: "Regulator lever", note: "Turns on a fixed ring round the middle. The two small pins on it, called curb pins, hold the spring between them." },
      { key: "stud", color: "#8E7AA8", name: "Stud", note: "A small block that holds the outer end of the spring. It does not move." }
    ],
    controls: [{ type: "range", id: "lev", label: "Lever", min: -5, max: 5, step: .5, value: 0, unit: "",
      format: function (v) { return v === 0 ? "middle" : (v < 0 ? "slow " : "fast ") + Math.abs(v); },
      presets: [[-5, "Slow"], [0, "Middle"], [5, "Fast"]] }],
    speed: false,
    readouts: [{ id: "len", label: "Spring used" }, { id: "beat", label: "Beats" }, { id: "gain", label: "Gains" }],
    views: { "3d": [387, -80, 830], front: [0, -30, 740], side: [740, -30, 0] },
    target: [0, -30, 0],
    how: [
      "The balance wheel swings to and fro, and the coiled spring winds and unwinds with it. The spring always pulls the wheel back towards the middle, so it keeps swinging. Each swing lets the watch move on one tick.",
      "The two pins on the lever pinch the outer turn of the spring. The spring can only bend between the wheel and the pins; past the pins it is held still. Move the lever to the right and the pins slide along the spring towards its middle. Less spring is free to bend, so it is stiffer, and a stiffer spring swings the wheel faster.",
      "A small move makes a big difference to a watch, because it ticks hundreds of times a minute all day long. Try Slow, then Fast, and watch how much the watch gains or loses in a day."
    ],
    note: "This model is rebuilt from Brown's drawing. The back plate, the bridge that holds the stud and the ring, and the sizes were made up. The wheel swings far more slowly than a real one so that you can follow it. The rate is worked out from the free length of the spring alone, and the scale on the plate has no real units.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mb = c.mat("balance"), ml = c.mat("lever"), i;
      var o = this.o = { t: 0, ph: 0 };
      function ring(r1, r2, z0, d, m) {
        var sh = new T.Shape(), h = new T.Path(); sh.absarc(0, 0, r2, 0, 2 * Math.PI, false); h.absarc(0, 0, r1, 0, 2 * Math.PI, true); sh.holes.push(h);
        var g = new T.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 64 }); g.translate(0, 0, z0); return new T.Mesh(g, m);
      }
      // balance: rim, three spokes, hub, staff
      o.bal = new T.Group(); scene.add(o.bal);
      o.bal.add(ring(111, 131, -4, 8, mb));                                             // rim z -4..4
      [125, -10, 235].forEach(function (a) {
        var s = P.at(P.box(100, 9, 6, mb), 62 * Math.cos(a * RAD), 62 * Math.sin(a * RAD), 0, o.bal); s.rotation.z = a * RAD;   // r 12..112, z -3..3
      });
      P.at(P.cylZ(12, 8, mb), 0, 0, 0, o.bal);                                         // hub z -4..4
      P.at(P.cylZ(3, 56, mb), 0, 0, -6, o.bal);                                        // staff z -34..22: back plate face to the fixed ring
      P.at(P.cylZ(6, 6, mb), 0, 0, 13, o.bal);                                         // collet z 10..16 for the spring's inner end
      P.at(P.cylZ(4, 1, c.mat("balance", "mark")), 0, 121, 4.5, o.bal);                 // red dot z 4..5 on the rim's face
      // balance spring: the bending part and the held part beyond the pins
      o.spr = P.spiralSpring({ rIn: RIN, rOut: RP, width: 6, thick: 1.2, material: c.mat("spring") }); P.at(o.spr, 0, 0, 13, scene);
      o.dead = P.spiralSpring({ rIn: RP, rOut: RP, width: 6, thick: 1.2, segments: 60, material: c.mat("spring", "dark") }); P.at(o.dead, 0, 0, 13, scene);
      // stud holding the outer end at 180 degrees: x -70..-62.6 (the spring's outer face), z 10..30 (the cock's back face)
      P.at(P.box(7.4, 10, 20, c.mat("stud")), -66.3, 0, 20, scene);
      // lever on its ring
      o.lev = new T.Group(); scene.add(o.lev);
      o.lev.add(ring(16.5, 26, 23, 6, ml));                                            // z 23..29 round the fixed ring (radius 16)
      o.lev.add(P.outlinePlate({ points: [[-8, -24], [8, -24], [4, -168], [6, -172], [6, -190], [0, -212], [-6, -190], [-6, -172], [-4, -168]], depth: 6, z0: 23, material: ml }));
      [RP - 1.8, RP + 1.8].forEach(function (r) { P.at(P.cylZ(1.2, 14, c.mat("lever", "dark")), 0, -r, 16, o.lev); });   // curb pins z 9..23, either side of the spring (thick 1.2)
      // fixed parts: ring, cock, post, back plate, scale
      P.at(P.cylZ(16, 8, c.fixed), 0, 0, 26, scene);                                   // ring z 22..30
      P.at(P.cylZ(30, 6, c.fixed), 0, 0, 33, scene);                                   // cock z 30..36
      P.at(P.box(46, 14, 6, c.fixed), -51, 0, 33, scene);                               // cock arm over the stud, x -74..-28, z 30..36
      var arm = P.at(P.box(165, 24, 6, c.fixed), 82.5 * Math.cos(45 * RAD), 82.5 * Math.sin(45 * RAD), 33, scene); arm.rotation.z = 45 * RAD;   // cock arm to the post
      P.at(P.box(24, 24, 64, c.fixed), 165 * Math.cos(45 * RAD), 165 * Math.sin(45 * RAD), -2, scene);   // post z -34..30, under the arm
      P.at(P.box(380, 420, 6, c.fixed), 0, -15, -37, scene);                            // back plate x -190..190, y -225..195, z -40..-34
      var sc = [], a;
      for (i = 0; i <= 20; i++) { a = (235 + 70 * i / 20) * RAD; sc.push([200 * Math.cos(a), 200 * Math.sin(a)]); }
      for (i = 20; i >= 0; i--) { a = (235 + 70 * i / 20) * RAD; sc.push([168 * Math.cos(a), 168 * Math.sin(a)]); }
      scene.add(P.outlinePlate({ points: sc, depth: 54, z0: -34, material: c.fixed }));   // scale z -34..20, standing on the plate
      var ink = c.mat("stud", "dark");
      [176, 184, 192].forEach(function (r) { var q = P.arc(r, .5, 70 * RAD, ink); q.rotation.z = 235 * RAD; P.at(q, 0, 0, 20.9, scene); });   // tube z 20.4..21.4
      for (i = 0; i <= 10; i++) { a = (235 + 7 * i) * RAD; var t = P.at(P.box(32, 1, 1, ink), 184 * Math.cos(a), 184 * Math.sin(a), 20.9, scene); t.rotation.z = a; }   // z 20.4..21.4
      P.at(P.label("Slow", 20, c.ink), -150, -176, 22, scene);
      P.at(P.label("Fast", 20, c.ink), 150, -176, 22, scene);
    },

    step: function (c, dt, S) {
      var o = this.o, p = phi(S.controls.lev);
      o.ph += (p - o.ph) * Math.min(1, dt * 6);
      var La = acting(o.ph), rate = Math.sqrt(L0 / La);
      if (S.playing) o.t += dt * rate;
      var th = AMP * Math.sin(2 * Math.PI * o.t / PER0), aP = -Math.PI / 2 + o.ph, aIn = -Math.PI / 2 + TURNS * 2 * Math.PI + th;
      o.bal.rotation.z = th;
      o.spr.rotation.z = aIn; o.spr.set(aP - aIn, 1);
      o.dead.rotation.z = aP; o.dead.set(-(aP + Math.PI), 1);
      o.lev.rotation.z = o.ph;
      var pr = acting(p), rr = Math.sqrt(L0 / pr);
      S.set("len", Math.round(100 * pr / (pr + RP * (p + Math.PI / 2))) + "%");
      S.set("beat", Math.round(BEATS0 * rr) + " a min");
      var g = Math.round(1440 * (rr - 1));
      S.set("gain", (g > 0 ? "+" : g < 0 ? "−" : "") + Math.abs(g) + " min a day");
    }
  });
})();
