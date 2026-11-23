(function () {
  // Engraving pixels to model units; local = relative to the holder's pivot pin (world 0, 49.8).
  var S0 = 0.6, PIVY = 49.8;
  function LX(px) { return (px - 300) * S0; }
  function LY(py) { return (312 - py) * S0; }
  var XS = 67.8;                         // screw axis x (engraving 413)
  var XW = XS - 8;                       // left edge of the collar, where the holder rests on it
  var YT = 16.8;                         // holder underside below the pin
  var PINX = -78, PINY = -2.4;           // swivel pin of the shoe, local to the holder
  var DSHOE = 22.2;                      // pin down to shoe bottom
  var PITCH = 4, PHI0 = -5 * Math.PI / 180;

  function bis(f, a, b) { var i, m; for (i = 0; i < 40; i++) { m = (a + b) / 2; if (f(m) > 0) b = m; else a = m; } return (a + b) / 2; }
  function underside(p) { return PIVY + XW * Math.tan(p) - YT / Math.cos(p); }          // holder underside at the collar edge
  function shoeBottom(p) { return PIVY + PINX * Math.sin(p) + PINY * Math.cos(p) - DSHOE; }
  var YU0 = underside(PHI0);
  function phiOfL(L) { return bis(function (p) { return underside(p) - YU0 - L; }, -.3, .3); }
  function phiJam(h) { return bis(function (p) { return h + 0.3 - shoeBottom(p); }, -.3, .3); }   // shoe bottom reaches the block
  function lJam(h) { return Math.max(0, underside(phiJam(h)) - YU0); }

  M507.define({
    number: 190,
    title: "Screw clamp",
    lede: "Turning a handle makes a screw climb. The screw lifts one end of a holder, so the other end swings down and presses on a block of wood. A small turn of the handle holds the wood with a big force.",
    alt: "A wooden bench with a curved orange holder on an upright post. At the right an upright screw with a crank handle pushes up under the holder's tail. The holder's left end presses down on a block of wood on the bench.",
    parts: [
      { key: "drive", color: "#5E7387", name: "Screw and handle", note: "The handle turns the screw. The thread works like a ramp, so each turn lifts the screw a little." },
      { key: "driven", color: "#C8873A", name: "Holder", note: "A curved arm that tilts on a pin in the post, like a seesaw. The screw lifts its right end and its left end goes down." },
      { key: "out", color: "#4FA58A", name: "Block of wood", note: "The wood being held. When the holder touches it, the screw cannot climb any more." },
      { key: "mark", color: "#C2503F", name: "Handle knob", note: "The grip on the crank. Watch it go round to see how many turns the screw makes." }
    ],
    controls: [{ type: "range", id: "t", label: "Block of wood", min: 14, max: 28, step: 1, value: 20, unit: "mm",
      presets: [[14, "Thin"], [20, "Medium"], [28, "Thick"]] }],
    readouts: [{ id: "up", label: "Screw up" }, { id: "tilt", label: "Holder" }, { id: "turns", label: "Turns" }],
    views: { "3d": [200, 165, 405], front: [6, 40, 450], side: [520, 70, 90] },
    target: [5, 35, 0],
    how: [
      "Watch the handle go round. The screw climbs a little with each turn, because its thread works like a ramp that winds round and round. It pushes up under the right end of the holder.",
      "The holder tilts on a pin in the upright post, like a seesaw. When the right end goes up, the left end goes down and its round foot presses on the block. Once the foot touches the wood, the screw cannot climb any more and the handle stops. Turning back lowers the screw and the holder lifts off again.",
      "Try Thin, then Thick. A thin block needs many more turns before it is held, and the holder tilts much further."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown shows the bench, the post, the holder, the screw with its crank, and the block. The thread, the collar under the holder, the nut block in the bench, the round foot on the left end, the windows in the holder, the pin heads and the choice of block thickness were made up. The model starts clamped, as drawn, then loosens and tightens again. The holder rests on the collar by its own weight.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { th: 0, dir: -1, hold: 0, init: false }, i;
      function poly(pts, depth, mat, holes, circ) {
        var sh = new T.Shape();
        pts.forEach(function (p, j) { if (j) sh.lineTo(LX(p[0]), LY(p[1])); else sh.moveTo(LX(p[0]), LY(p[1])); });
        (holes || []).forEach(function (hp) {
          var pa = new T.Path();
          hp.forEach(function (p, j) { if (j) pa.lineTo(LX(p[0]), LY(p[1])); else pa.moveTo(LX(p[0]), LY(p[1])); });
          sh.holes.push(pa);
        });
        if (circ) { var pc = new T.Path(); pc.absarc(circ[0], circ[1], circ[2], 0, Math.PI * 2, true); sh.holes.push(pc); }
        var g = new T.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false }); g.translate(0, 0, -depth / 2);
        return new T.Mesh(g, mat);
      }
      // holder: z -8..8, pivot at the group origin
      o.hold_ = new T.Group(); o.hold_.position.set(0, PIVY, 0); scene.add(o.hold_);
      // foot is a round lug centred on the pin (radius = DSHOE), so its lowest point is always straight under the pin
      var outline = [], ang, cx = 170, cy = 316, rr = DSHOE / S0;
      for (ang = 90; ang <= 270; ang += 15) outline.push([cx + rr * Math.cos(ang * Math.PI / 180), cy + rr * Math.sin(ang * Math.PI / 180)]);
      outline = outline.concat([[226, 268], [262, 259], [300, 258], [336, 262], [366, 272], [388, 290], [396, 313], [455, 313], [455, 340], [205, 340]]);
      outline = (function (a) {                                   // one round of corner cutting on the closed outline
        var r = [], n = a.length, k, u, v;
        for (k = 0; k < n; k++) { u = a[k]; v = a[(k + 1) % n]; r.push([.75 * u[0] + .25 * v[0], .75 * u[1] + .25 * v[1]], [.25 * u[0] + .75 * v[0], .25 * u[1] + .75 * v[1]]); }
        return r;
      })(outline);
      var hm = poly(outline, 16, c.mat("driven"), [
        [[216, 322], [234, 303], [262, 292], [268, 322]],
        [[336, 322], [336, 296], [352, 300], [372, 314], [374, 322]]], [XS, LY(326.5), 5]);   // screw hole through the tail
      o.hold_.add(hm);
      P.at(P.cylZ(2.8, 18, c.mat("driven", "dark")), PINX, PINY, 0, o.hold_);                  // shoe pin z -9..9
      // post: two plates z 8..20 and -20..-8 either side of the holder, web between, on the bench top (y 0)
      var postPts = [[265, 395], [265, 318], [272, 292], [285, 279], [300, 275], [318, 279], [332, 292], [340, 318], [342, 395]];
      // plate outline is in pivot-local units, so its bottom (local y -49.8) sits on the bench top
      function plate(z) { var m = poly(postPts, 12, c.fixed); m.position.set(0, PIVY, z); return m; }
      var pl1 = plate(14), pl2 = plate(-14);                                                        // z 8..20 and -20..-8
      scene.add(pl1); scene.add(pl2);
      P.at(P.box(46.2, 26, 16, c.fixed), 2, 13, 0, scene);                                        // web x -21..25.2, y 0..26, z -8..8
      P.at(P.cylZ(6, 3, c.mat("driven", "dark")), 0, PIVY, 21.5, scene);                          // pin head z 20..23
      P.at(P.cylZ(6, 3, c.mat("driven", "dark")), 0, PIVY, -21.5, scene);                         // pin head z -23..-20
      // nut block in the bench with a hole for the screw: x 46..90, z -14..14, y 0..18
      var nsh = new T.Shape(); nsh.moveTo(46, -14); nsh.lineTo(90, -14); nsh.lineTo(90, 14); nsh.lineTo(46, 14); nsh.closePath();
      var nh = new T.Path(); nh.absarc(XS, 0, 5.6, 0, Math.PI * 2, true); nsh.holes.push(nh);
      var ng = new T.ExtrudeGeometry(nsh, { depth: 18, bevelEnabled: false }); ng.rotateX(-Math.PI / 2);
      scene.add(new T.Mesh(ng, c.fixed));
      // bench x -180..168, y -36..0, z -45..45, with grain lines on the front face
      P.at(P.box(348, 36, 90, c.fixed), -6, -18, 0, scene);
      [[-120, -9, 120], [30, -15, 150], [-60, -24, 90], [100, -29, 110], [-140, -30, 40]].forEach(function (g) {
        P.at(P.box(g[2], .8, 1.2, c.mat("driven", "dark")), g[0], g[1], 45.6, scene);              // z 45..46.2
      });
      // block: x -125..-35, z -14..14, y 0..h
      o.block = new T.Group(); scene.add(o.block);
      P.at(P.box(90, 20, 28, c.mat("out")), -80, 10, 0, o.block);
      // screw: group origin is its lift L; turns about Y
      o.screw = new T.Group(); o.screw.position.set(XS, 0, 0); scene.add(o.screw);
      var wg = new T.Group(); wg.rotation.z = Math.PI / 2; wg.position.set(0, 33.5, 0); o.screw.add(wg);       // thread y 1..66
      o.worm = P.worm({ radius: 3.2, pitch: PITCH, length: 65, addendum: 1, dedendum: 1, material: c.mat("drive") });
      wg.add(o.worm);
      o.spin = new T.Group(); o.screw.add(o.spin);
      P.at(P.cylY(8, 3, c.mat("drive")), 0, YU0 - .3 - 1.5, 0, o.spin);                          // collar, top 0.3 under the holder
      P.at(P.box(27, 12, 12, c.mat("drive")), 0, 72, 0, o.spin);                                 // hub y 66..78
      P.at(P.cylX(3, 56, c.mat("drive")), 40.5, 72, 0, o.spin);                                  // arm x 12.5..68.5
      var kn = P.sphere(4.2, c.mat("mark")); kn.scale.set(1, 1.9, 1); P.at(kn, 63, 78, 0, o.spin);  // knob
      o.cache = {};
    },

    step: function (c, dt, S) {
      var o = this.o, h = +S.controls.t, L, p, tj, ph, tilt, ph0 = 0;
      if (!o.cache[h]) o.cache[h] = { phi: phiJam(h), L: lJam(h) };
      var jm = o.cache[h], tMax = 2 * Math.PI * jm.L / PITCH;
      if (!o.init) { o.th = tMax; o.init = true; }
      if (o.hold > 0) { if (S.w > 0) o.hold -= dt; }
      else {
        o.th += o.dir * S.w * dt;
        if (o.th >= tMax) { o.th = tMax; if (o.dir > 0) { o.dir = -1; o.hold = .8; } }
        if (o.th <= 0) { o.th = 0; if (o.dir < 0) { o.dir = 1; o.hold = .8; } }
      }
      if (o.th > tMax) o.th = tMax;
      L = PITCH * o.th / (2 * Math.PI);
      p = Math.min(phiOfL(L), jm.phi);
      o.screw.position.y = L; o.spin.rotation.y = o.th; o.worm.rotation.x = o.th;
      o.hold_.rotation.z = p;
      o.block.scale.y = h / 20;
      S.set("up", L.toFixed(1) + " mm");
      tilt = (p - PHI0) * 180 / Math.PI;
      S.set("tilt", tilt.toFixed(1) + "°");
      S.set("turns", (o.th / (2 * Math.PI)).toFixed(1));
    }
  });
})();
