(function () {
  var D = Math.PI / 180, TP = 2 * Math.PI;
  // Sizes, in the front (XY) plane; the shaft is the Z axis. Rim inside radius RI; four pivots at radius DP on the hub.
  // Each arm's working edge is a log spiral about its pivot, so wherever it touches the rim the line from the pivot
  // to the touching point leans GAM from the rim's radius. Turning the arm forward (counter-clockwise) makes it reach
  // further out, so a rim turning counter-clockwise drags it tighter and it jams; the other way it lets go.
  var K = { RI: 100, RO: 108, DP: 30, GAM: 8 * D, P0: 8 * D };
  (function () {
    var aPv = Math.PI - Math.asin(K.RI * Math.sin(K.GAM) / K.DP);      // triangle centre, pivot, touching point
    K.aO = Math.PI - K.GAM - aPv;                                       // angle at the centre between pivot and touching point
    K.L = K.DP * Math.sin(K.aO) / Math.sin(K.GAM);                      // pivot to touching point
    K.k = Math.tan(K.GAM);
  })();

  M507.define({
    number: 267,
    title: "Friction pulley with eccentric arms",
    lede: "A pulley rim that drives its shaft one way only. Turned one way, four arms inside it jam against the rim and the shaft turns with it. Turned the other way, the arms slip and the shaft stays still.",
    alt: "A wide rim seen face on, with a square hub in the middle on the shaft. From each corner of the hub a curved arm reaches out, and its broad end rests on the inside of the rim. Small springs press the arms outward. An arrow over the top right of the rim points clockwise.",
    parts: [
      { key: "rim", color: "#5E7387", name: "Rim", note: "The pulley's rim. It turns loose on the shaft and is always driven." },
      { key: "hub", color: "#C8873A", name: "Hub and shaft", note: "Fixed to the shaft. It only turns when the arms grip the rim." },
      { key: "arms", color: "#D9B13B", name: "Arms", note: "Each turns on a pin at a corner of the hub. Its curved end is shaped so that turning the arm forward pushes it harder against the rim." },
      { key: "springs", color: "#4FA58A", name: "Springs", note: "Small springs that keep each arm's end lightly pressed on the rim." }
    ],
    controls: [{ id: "dir", label: "Rim turns", value: "against", options: [["against", "Against the arrow"], ["with", "With the arrow"]] }],
    readouts: [{ id: "rim", label: "Rim" }, { id: "shaft", label: "Shaft" }, { id: "arms", label: "Arms" }],
    views: { "3d": [0, -8, 500], side: [520, -8, -40], top: [300, 200, 380] },
    viewLabels: { "3d": "Front", side: "Side", top: "3D" },
    target: [0, -8, -20], distance: [250, 1600],
    how: [
      "The rim turns loose on the shaft. The hub is fixed to the shaft. Four arms hang from pins at the corners of the hub, and springs press their curved ends onto the inside of the rim.",
      "Each arm leans back a little from straight out. When the rim turns against the arrow, it drags the arm's end forward. That tries to stand the arm up straighter, which would need more room than there is. So the arm jams tight, and the rim carries the hub and shaft round with it. When the rim turns with the arrow, it drags the arm's end back. That only tips the arm further over, so it cannot jam. The rim slides past and the shaft stays still.",
      "Try against the arrow, then with the arrow, and watch the Shaft reading. The arms grip one way and slip the other, so the shaft only ever turns one way."
    ],
    note: "This model is rebuilt from Brown's drawing. The shapes of the arms and hub follow the drawing loosely. The arms' working ends are shaped so that they lean back from the rim by the same small angle wherever they touch, which is less than the angle at which they would slide. The springs, the web behind the rim, the bearing and the base were made up. When the arms slip, a load on the shaft is taken to hold it still.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { rim: 0, hub: 0 }, i;
      function dir(a, r) { return [r * Math.cos(a), r * Math.sin(a)]; }
      function ring(rOut, rIn) { var s = new T.Shape(); s.absarc(0, 0, rOut, 0, TP, false); var h = new T.Path(); h.absarc(0, 0, rIn, 0, TP, true); s.holes.push(h); return s; }
      function ext(sh, z0, z1, m, parent) { var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 96 }); return P.at(new T.Mesh(g, m), 0, 0, z0, parent); }

      // rim: band z -16..12, web z -16..-12, loose boss z -26..-16; holes 9 round the shaft (radius 8)
      o.rimG = new T.Group(); scene.add(o.rimG);
      var mr = c.mat("rim");
      ext(ring(K.RO, K.RI), -16, 12, mr, o.rimG);
      ext(ring(K.RI, 9), -16, -12, c.mat("rim", "light"), o.rimG);           // pale web, so the arms stand out as in the drawing
      ext(ring(14, 9), -26, -16, mr, o.rimG);
      P.at(P.box(8, 3, 1, c.mat("rim", "dark")), 0, 104, 12.7, o.rimG);         // stripe on the front face, z 12.2..13.2

      // hub, fixed to the shaft: plate z -10..-2 with a tab for each spring; front boss z -2..8
      o.hubG = new T.Group(); scene.add(o.hubG);
      var mh = c.mat("hub"), sh = new T.Shape(), arms = [], k;
      for (k = 0; k < 4; k++) {
        var ap = K.P0 + k * 90 * D, pv = dir(ap, K.DP), aq = ap - K.aO, q = dir(aq, K.RI);
        var psc = Math.atan2(q[1] - pv[1], q[0] - pv[0]);
        arms.push({ pv: pv, psc: psc, ap: ap });
      }
      // spring seat for the arm on pivot k: worked out from the arm's inner edge (see the arm outline below)
      function inner(a, t) {
        var Sb = dir(a.psc - .2, K.L * Math.exp(.2 * K.k)), C = dir(a.psc + .2, 36), B2 = dir(a.psc - 1.4, 8), u = 1 - t;
        return [u * u * Sb[0] + 2 * t * u * C[0] + t * t * B2[0], u * u * Sb[1] + 2 * t * u * C[1] + t * t * B2[1]];
      }
      arms.forEach(function (a) {
        var A = inner(a, .8), l = Math.hypot(A[0], A[1]), f = [-A[1] / l, A[0] / l];       // push direction: forward about the pivot
        a.A = [a.pv[0] + A[0], a.pv[1] + A[1]]; a.f = f;
        a.S0 = [a.A[0] - 14 * f[0], a.A[1] - 14 * f[1]];
        a.lug = Math.atan2(a.S0[1], a.S0[0]);
      });
      for (k = 0; k < 4; k++) {
        var a = arms[k], b = arms[(k + 1) % 4];
        if (!k) sh.moveTo(a.pv[0] + 9 * Math.cos(a.ap - Math.PI / 2), a.pv[1] + 9 * Math.sin(a.ap - Math.PI / 2));
        sh.absarc(a.pv[0], a.pv[1], 9, a.ap - Math.PI / 2, a.ap + Math.PI / 2, false);
        var lg = b.lug, w1 = 6 / 18, w2 = 5 / 42;                                // tab out to radius 42 for the next arm's spring
        sh.lineTo(18 * Math.cos(lg - w1), 18 * Math.sin(lg - w1));
        sh.lineTo(42 * Math.cos(lg - w2), 42 * Math.sin(lg - w2));
        sh.lineTo(42 * Math.cos(lg + w2), 42 * Math.sin(lg + w2));
        sh.lineTo(18 * Math.cos(lg + w1), 18 * Math.sin(lg + w1));
      }
      ext(sh, -10, -2, mh, o.hubG);
      P.at(P.cylZ(16, 10, mh), 0, 0, 3, o.hubG);                                // boss z -2..8
      P.at(P.hoop(12, .8, c.mat("hub", "dark")), 0, 0, 8.6, o.hubG);            // ring on the boss face, lifted
      P.at(P.box(6, 2.5, 1, c.mat("hub", "dark")), 0, 13, 8.7, o.hubG);         // and a stripe, to see it turn
      P.at(P.cylZ(8, 50, mh), 0, 0, -35, o.hubG);                               // shaft z -60..-10, ends at the plate's back face

      // arms z -2..6 on pins; springs z 2 between a stud on each tab and the arm
      var ma = c.mat("arms"), ms = c.mat("springs");
      arms.forEach(function (a) {
        var s = new T.Shape(), n = 24, i2;
        var B1 = dir(a.psc + 1.4, 8), Ca = dir(a.psc + .35, 40), Sa = dir(a.psc + .2, K.L * Math.exp(-.2 * K.k));
        s.moveTo(B1[0], B1[1]); s.quadraticCurveTo(Ca[0], Ca[1], Sa[0], Sa[1]);       // back edge, bowed out
        for (i2 = 1; i2 <= n; i2++) { var ps = a.psc + .2 - .4 * i2 / n, pp = dir(ps, K.L * Math.exp(-K.k * (ps - a.psc))); s.lineTo(pp[0], pp[1]); }
        var C = dir(a.psc + .2, 36), B2 = dir(a.psc - 1.4, 8);
        s.quadraticCurveTo(C[0], C[1], B2[0], B2[1]);                             // inner edge, hollowed
        s.absarc(0, 0, 8, a.psc - 1.4, a.psc + 1.4 - TP, true);
        var hole = new T.Path(); hole.absarc(0, 0, 3.2, 0, TP, true); s.holes.push(hole);
        var g = new T.Group(); g.position.set(a.pv[0], a.pv[1], 0); o.hubG.add(g);
        ext(s, -2, 6, ma, g);
        P.at(P.cylZ(3, 8, c.mat("hub", "dark")), a.pv[0], a.pv[1], 2, o.hubG);     // pin z -2..6 in the arm's hole
        P.at(P.cylZ(4.5, 2, c.mat("hub", "dark")), a.pv[0], a.pv[1], 7, o.hubG);   // pin head z 6..8
        P.at(P.cylZ(3.5, 7, mh), a.S0[0], a.S0[1], 1.5, o.hubG);                  // stud z -2..5 on the tab's face
        var sp = P.spring({ radius: 2.6, wire: .7, turns: 5, length: 10.5, material: ms });
        sp.position.set(a.S0[0] + 3.5 * a.f[0], a.S0[1] + 3.5 * a.f[1], 2); sp.rotation.z = Math.atan2(a.f[1], a.f[0]);
        o.hubG.add(sp);                                                           // from the stud's side to the arm's edge
      });

      // bearing z -52..-38 on the base; base y -134..-130
      var bb = P.bearingBlock({ bore: 8.5, outer: 16, drop: 130, width: 14, material: c.fixed }); P.at(bb, 0, 0, -45, scene);
      P.at(P.box(120, 4, 100, c.fixed), 0, -132, -30, scene);                   // z -80..20, under the rim (bottom at -108)

      // Brown's arrow over the top right, pointing clockwise
      var ink = c.mat("rim", "dark"), arc = P.arc(122, 1.4, 30 * D, ink); arc.rotation.z = 25 * D; P.at(arc, 0, 0, 0, scene);
      var head = P.at(new T.Mesh(new T.CylinderGeometry(0, 4.5, 12, 16), ink), 122 * Math.cos(25 * D) + 5 * Math.sin(25 * D), 122 * Math.sin(25 * D) - 5 * Math.cos(25 * D), 0, scene);
      head.rotation.z = 25 * D - Math.PI;
    },

    step: function (c, dt, S) {
      var o = this.o, against = S.controls.dir === "against", d = against ? 1 : -1;
      o.rim += d * S.w * dt;
      if (against) o.hub += S.w * dt;                                            // jammed: the hub goes round with the rim
      o.rimG.rotation.z = o.rim; o.hubG.rotation.z = o.hub;
      var rpm = S.playing ? S.rpm : 0;
      S.set("rim", (d * rpm < 0 ? "−" : "") + rpm + " rpm");
      S.set("shaft", (against ? rpm : 0) + " rpm");
      S.set("arms", against ? "Gripping" : "Slipping");
    }
  });
})();
