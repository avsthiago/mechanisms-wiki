M507.define({
  number: 420,
  title: "Bell hammer",
  lede: "A tug on a wire swings a hammer against a bell. A spring under the hammer then lifts it clear. With the hammer off the metal, the bell can ring on.",
  alt: "A hammer on a short arm pivots on an upright plate fixed to a wooden base. A wire runs from a short crank below the pivot out to the left. A curved leaf spring rises from the base under the hammer arm. A bell hangs to the right from a beam.",
  parts: [
    { key: "hammer", color: "#5E7387", name: "Hammer", note: "Swings on a pin. Its head strikes the side of the bell near the rim. Watch the red face that hits the bell." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "A curved strip of springy steel under the hammer arm. It pushes the hammer up and away from the bell." },
    { key: "wire", color: "#D9B13B", name: "Pull wire", note: "Tied to a short crank below the pin. A sharp tug flings the hammer at the bell." },
    { key: "bell", color: "#8E7AA8", name: "Bell", note: "Hangs from a beam. It rings for a long time if nothing touches it." }
  ],
  controls: [{ type: "range", id: "k", label: "Spring strength", min: 1, max: 20, step: .5, value: 8, unit: "", presets: [[1.5, "Too weak"], [8, "As drawn"], [20, "Too stiff"]] }],
  speed: false,
  readouts: [{ id: "gap", label: "Gap to bell" }, { id: "ring", label: "Bell ringing" }],
  views: { "3d": [342, 196, 712], front: [10, 15, 820], side: [820, 15, 40] },
  target: [10, 15, 0],
  how: [
    "Every few seconds the wire gets a sharp tug. The hammer flies at the bell and strikes it. Then it bounces back, and the spring catches it and holds it a little way off.",
    "A bell rings because its metal shakes after the blow. Anything resting on it stops the shaking, just as a hand on a ringing glass stops it. The hammer is heavy and its weight pulls it towards the bell. The spring holds it up, so the head does not lie against the metal.",
    "Try a weak spring. The hammer sinks onto the bell, and the ring dies at once. Try a stiff spring. The tug is no longer enough to reach the bell. The spring as drawn lets the hammer strike and come away."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not say how the wire is pulled; here it gets a sharp tug every three seconds. The beam the bell hangs from, the stop above the hammer, the weights and the strength of the tug were made up. The ring is shown by waves that fade as the bell goes quiet.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { O: [-112, -44], r: 123, rs: 70, bx: 104, phif: .728, phiMax: .85, phi: .628, w: 0, t: 0, ring: 0, I: .2, cv: 1, w0: 3.6, e: .45,
      prof: [[92, -24], [88, -14], [80, 0], [66, 24], [56, 48], [50, 72], [48, 96], [44, 112], [36, 120], [0, 121]] };
    // the angle at which the hammer face meets the bell
    var lo = -.5, hi = .628;
    for (i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (this.pen(m) > 0) lo = m; else hi = m; }
    o.phic = hi;
    // hammer: arm, head, short crank, all turning about the pin
    var mh = c.mat("hammer");
    o.hg = new T.Group(); o.hg.position.set(o.O[0], o.O[1], 0); scene.add(o.hg);
    P.at(P.box(112, 8, 8, mh), 56, 0, 0, o.hg);                                       // arm along local x 0..112, z -4..4
    P.at(P.cylZ(10, 12, mh), 0, 0, 0, o.hg);                                          // boss z -6..6
    P.at(P.cylZ(4, 17, c.mat("hammer", "dark")), 0, 0, -1.5, o.hg);                   // pin z -10..7, from the plate face
    var head = P.at(P.cylY(14, 40, mh), o.r, 0, 0, o.hg);                              // head across the arm; its axis is the line of the blow
    P.at(P.cylY(4, 8, mh), o.r, 24, 0, o.hg);                                          // stud on the back of the head, y 20..28
    P.at(P.cylY(11, 1, c.mat("hammer", "mark")), o.r, -20.5, 0, o.hg);                // red face, y -21..-20, just proud of the head
    var ca = 197 * Math.PI / 180;                                                      // short crank, pointing down and back
    var ck = P.at(P.box(22, 7, 7, mh), 11 * Math.cos(ca), 11 * Math.sin(ca), 0, o.hg); ck.rotation.z = ca;
    o.cp = [20 * Math.cos(ca), 20 * Math.sin(ca)]; o.ca = ca;
    P.at(P.cylZ(3.5, 12, c.mat("hammer", "dark")), o.cp[0], o.cp[1], 0, o.hg);        // wire pin z -6..6
    // leaf spring, fixed in a clamp on the base
    o.leaf = P.flatStrip({ points: this.leafPts(o.phi), thick: 3, width: 6, material: c.mat("spring") }); o.leaf.userData.live = true; scene.add(o.leaf);
    // pull wire and its handle
    var mw = c.mat("wire");
    o.wh = P.rod(1.5, mw); scene.add(o.wh); o.wv = P.rod(1.5, mw); scene.add(o.wv);
    o.ringH = P.hook({ radius: 9, tube: 2.5, material: mw }); scene.add(o.ringH);
    // bell, as a hollow shell turned about its upright axis
    // outline: from the top on the axis down the outside to the lip, then up the inside back to the axis
    var mb = c.mat("bell"), outl = o.prof.slice().reverse().concat([[84, -24], [76, -6], [62, 20], [51, 46], [44, 72], [42, 96], [36, 110], [0, 113]]);
    o.bell = new T.Group(); o.bell.position.x = o.bx; scene.add(o.bell);
    var bg = new T.LatheGeometry(outl.map(function (p) { return new T.Vector2(p[0], p[1]); }), 64);
    o.bell.add(new T.Mesh(bg, mb));
    [[100, 1.2], [108, 1.2], [-8, 1.4]].forEach(function (b) {                          // raised bands, standing off the surface
      var hp = P.hoop(this.R(b[0]) + 2, b[1], c.mat("bell", "dark")); hp.rotation.x = Math.PI / 2; P.at(hp, 0, b[0], 0, o.bell);
    }, this);
    P.at(P.hook({ radius: 12, tube: 3.5, material: mb }), 0, 131, 0, o.bell);         // crown ring, bottom inside the crown, top tube at y 143
    // sound waves to the right of the bell
    o.waves = [];
    for (i = 0; i < 3; i++) {
      var wm = new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: 0, depthWrite: false });
      var wv = P.arc(100, 1.2, 140 * Math.PI / 180, wm); wv.rotation.z = -70 * Math.PI / 180; P.at(wv, o.bx, 40, 0, scene); o.waves.push(wv);
    }
    // base, plate, clamp and beam (not part of the movement)
    P.at(P.box(470, 20, 100, c.fixed), 35, -122, 0, scene);                            // base x -200..270, y -132..-112
    P.at(P.box(60, 92, 6, c.fixed), -114, -66, -13, scene);                            // upright plate x -144..-84, y -112..-20, z -16..-10
    P.at(P.box(22, 12, 14, c.fixed), -92, -106, 0, scene);                             // spring clamp x -103..-81, y -112..-100, z -7..7
    P.at(P.box(16, 262, 20, c.fixed), 244, 19, 0, scene);                              // post x 236..252, y -112..150
    P.at(P.box(190, 16, 20, c.fixed), 157, 158, 0, scene);                             // beam x 62..252, y 150..166
    P.at(P.cylY(3, 7, c.fixed), o.bx, 146.5, 0, scene);                                // bolt y 143..150 into the crown ring
  },

  R: function (y) {                              // outside radius of the bell at height y
    var pr = this.o.prof, i;
    if (y <= pr[0][1]) return pr[0][0];
    for (i = 0; i < pr.length - 1; i++) if (y >= pr[i][1] && y <= pr[i + 1][1]) return pr[i][0] + (pr[i + 1][0] - pr[i][0]) * (y - pr[i][1]) / (pr[i + 1][1] - pr[i][1]);
    return 0;
  },
  pen: function (phi) {                          // how far the hammer face reaches into the bell (negative: the gap)
    var o = this.o, cs = Math.cos(phi), sn = Math.sin(phi), m = -1e9;
    for (var k = -1; k <= 1; k++) {
      var x = o.O[0] + o.r * cs + 20 * sn - 14 * k * cs, y = o.O[1] + o.r * sn - 20 * cs - 14 * k * sn;
      m = Math.max(m, x - (o.bx - this.R(y)));
    }
    return m;
  },
  leafPts: function (phi) {                      // the spring: from its clamp up to where it presses under the arm
    var o = this.o, p = Math.min(phi, o.phif), cs = Math.cos(p), sn = Math.sin(p);
    var tip = [o.O[0] + o.rs * cs + 5.5 * sn, o.O[1] + o.rs * sn - 5.5 * cs], root = [-92, -100], ctl = [-90, (root[1] + tip[1]) / 2 + 10], pts = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12, u = 1 - t; pts.push([u * u * root[0] + 2 * u * t * ctl[0] + t * t * tip[0], u * u * root[1] + 2 * u * t * ctl[1] + t * t * tip[1]]); }
    pts.unshift([-92, -110]);
    return pts;
  },

  step: function (c, dt, S) {
    var o = this.o, K = S.controls.k, t = S.playing ? Math.min(dt, .1) : 0, h = .0005, i;
    while (t > 1e-9) {
      var hh = Math.min(h, t); t -= hh;
      var t0 = o.t % 3; o.t += hh;
      if (t0 < .5 && o.t % 3 >= .5) o.w = -o.w0;                                       // a sharp tug on the wire every three seconds
      var tau = -Math.cos(o.phi) + K * Math.max(0, o.phif - o.phi) - o.cv * o.w;      // weight of the head, spring, rub
      o.w += tau / o.I * hh; o.phi += o.w * hh;
      if (o.phi <= o.phic) {                                                            // the face meets the bell
        if (o.w < 0) {
          var v = -o.w * o.r;
          if (v > 5) { o.ring = Math.min(1, o.ring + v * .004); o.w = -o.e * o.w; } else o.w = 0;
        }
        o.phi = o.phic;
      }
      if (o.phi > o.phiMax) { o.phi = o.phiMax; if (o.w > 0) o.w = -.3 * o.w; }        // stop above the hammer
      o.ring *= Math.exp(-hh / (o.phi <= o.phic + 1e-4 ? .12 : 2.5));                  // a head resting on the metal stops the ring quickly
    }
    o.hg.rotation.z = o.phi;
    o.leaf.setPoints(this.leafPts(o.phi));
    var cs = Math.cos(o.phi), sn = Math.sin(o.phi), px = o.O[0] + o.cp[0] * cs - o.cp[1] * sn, py = o.O[1] + o.cp[0] * sn + o.cp[1] * cs;
    o.wh.span(px, py, 0, px - 95, py, 0); o.wv.span(px - 95, py, 0, px - 95, py - 46, 0);
    o.ringH.position.set(px - 95, py - 46 - 9, 0);
    o.bell.position.x = o.bx + .9 * o.ring * Math.sin(o.t * 2 * Math.PI * 9);
    for (i = 0; i < 3; i++) {
      var ph = (o.t / 1.2 + i / 3) % 1, s = 1.1 + .9 * ph;
      o.waves[i].scale.set(s, s, 1); o.waves[i].material.opacity = .7 * o.ring * (1 - ph);
      o.waves[i].visible = o.ring > .01;
    }
    var gap = Math.max(0, -this.pen(o.phi));
    S.set("gap", Math.round(gap) + " mm");
    S.set("ring", Math.round(o.ring * 100) + " %");
  }
});
