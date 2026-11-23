M507.define({
  number: 86,
  title: "Pump wheel with a catch",
  lede: "A shaft that turns all the time works a pump that must go up and down. Once each turn, a catch hooks the wheel to the shaft and lifts the pump bucket. Then it lets go, and the bucket falls back by its own weight.",
  alt: "A spoked wheel on an A-shaped stand, with a rope hanging from its left side down to a pump bucket in a barrel. A red lever is pinned to the wheel. An arm on the shaft hooks it, and a block under the beam above knocks it free.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Driving shaft and cam", note: "The shaft turns all the time. The arm fixed on it, called a cam, comes round once each turn and pulls the catch." },
    { key: "wheel", color: "#C8873A", name: "Wheel", note: "Turns loose on the shaft. The rope is tied to its rim, so turning it lifts the bucket." },
    { key: "catch", color: "#C2503F", name: "Catch", note: "A hooked lever pinned to the wheel. Watch its hook take hold of the cam, then slip off when its tail hits the stop." },
    { key: "stop", color: "#4FA58A", name: "Stop", note: "A block fixed under the beam. It knocks the tail of the catch so the hook lets go." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "Tied to the rim of the wheel. It winds on while the wheel is dragged round and unwinds as the bucket falls." },
    { key: "pump", color: "#8E7AA8", name: "Pump rod and bucket", note: "Slides up and down inside the pump barrel. Its weight is what turns the wheel back." }
  ],
  controls: [{ id: "stop", label: "Stop", value: "drawn", options: [["left", "Further left"], ["drawn", "As drawn"], ["right", "Further right"]] }],
  speed: { min: 1, max: 20, value: 8 },
  closed: { label: "Pump" },
  readouts: [{ id: "c", label: "Catch" }, { id: "b", label: "Bucket" }, { id: "n", label: "Strokes" }],
  views: { "3d": [330, 40, 720], front: [-15, -65, 720], side: [720, -65, 0] },
  target: [-15, -65, 0],
  how: [
    "The shaft and the arm on it, called the cam, turn all the time. The big wheel is loose on the shaft, so it does not have to follow. When the cam comes round, it meets the hook of the red catch and drags the wheel along. The wheel winds up the rope and lifts the bucket.",
    "As the wheel turns, the tail of the catch swings up to the stop under the beam. The stop pushes the tail back, so the hook tips outward and slides off the end of the cam. Now the wheel is free. The heavy bucket falls and turns the wheel back until the bucket rests at the bottom. The cam keeps going and takes hold again on its next turn.",
    "Try moving the stop further left, then further right. Watch how high the bucket rises before the catch lets go. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The pump barrel, the second stand behind the wheel and the shape of the cam were made up. Brown draws ropes on both sides of the wheel; here one rope hangs from the left of the rim. A light spring, not shown, keeps the catch back against a small pin on the wheel. The engine that turns the shaft is left out. The choice of stop place was added to show what it changes.",

  // Geometry in the wheel's own frame (wheel centre at the origin, y up). Angles of the wheel and cam are clockwise.
  K: { PV: [-57.5, 2.5], LH: 66.6, LT: 70, PS0: Math.atan2(55, 37.5), RP: 3, WF: 3.5, RF: 68, WB: 3, RG: 72.6, TF0: 118 * Math.PI / 180,
       A: 16, B: 1.5, SX: { left: -30, drawn: 1, right: 25 }, Y0: 95, Y1: 116, SW: 25, EYE0: -201.2 },

  hookAt: function (ps) { var K = this.K; return [K.PV[0] + K.LH * Math.cos(ps), K.PV[1] + K.LH * Math.sin(ps)]; },
  // Smallest catch angle the stop allows: the corner points of the stop, seen from the turning wheel, must stay on the far side of the tail.
  stopPsi: function (phi, sx) {
    var K = this.K, best = -1e9, c = Math.cos(phi), s = Math.sin(phi), i, pts = [];
    for (i = 0; i <= 6; i++) pts.push([sx, K.Y0 + (K.Y1 - K.Y0) * i / 6]);
    for (i = 1; i <= 5; i++) pts.push([sx + K.SW * i / 5, K.Y0]);
    pts.forEach(function (p) {
      var kx = c * p[0] - s * p[1] - K.PV[0], ky = s * p[0] + c * p[1] - K.PV[1], L = Math.hypot(kx, ky);
      if (L > K.LT || L < K.WB) return;
      var ps = Math.atan2(ky, kx) + Math.asin(K.WB / L) - Math.PI;
      while (ps - K.PS0 > Math.PI) ps -= 2 * Math.PI; while (ps - K.PS0 < -Math.PI) ps += 2 * Math.PI;
      if (ps > K.PS0 - .6 && ps < K.PS0 + 1.2) best = Math.max(best, ps);
    });
    return best;
  },
  // Hook peg seen against the cam arm: t along the arm, d sideways (positive = ahead of the arm, the way it turns).
  pinRel: function (st, ps) {
    var h = this.hookAt(ps), c = Math.cos(st.phi), s = Math.sin(st.phi), x = c * h[0] + s * h[1], y = -s * h[0] + c * h[1];
    var tf = this.K.TF0 - st.a, fx = Math.cos(tf), fy = Math.sin(tf);
    return { t: x * fx + y * fy, d: x * fy - y * fx };
  },
  overlap: function (q) {
    var K = this.K, m = K.WF + K.RP;
    if (q.t < 10) return false;
    if (q.t <= K.RF) return Math.abs(q.d) < m;
    return Math.hypot(q.t - K.RF, Math.max(0, Math.abs(q.d) - K.WF)) < K.RP;
  },
  init: function () { return { a: 0, phi: 0, v: 0, psi: this.K.PS0, hooked: false, sx: this.K.SX.drawn, strokes: 0, dPrev: 1e9 }; },
  advance: function (st, dt, w, sxT) {
    var K = this.K, n = Math.max(1, Math.ceil(dt / .004)), h = dt / n, i, j, m = K.WF + K.RP;
    for (i = 0; i < n; i++) {
      if (st.phi < 1.2 && st.sx !== sxT) st.sx += Math.max(-80 * h, Math.min(80 * h, sxT - st.sx));   // the stop only slides while the tail is far from it
      st.a += w * h;
      if (st.hooked) {
        var tf = K.TF0 - st.a, ps = st.psi, phi = st.phi;
        for (j = 0; j < 4; j++) {        // the peg sits against the leading face of the cam; the stop may tip the catch
          ps = Math.max(K.PS0, this.stopPsi(phi, st.sx));
          var hk = this.hookAt(ps), r = Math.hypot(hk[0], hk[1]);
          var p = Math.atan2(hk[1], hk[0]) - tf + Math.asin(m / r);
          phi = p + 2 * Math.PI * Math.round((st.phi - p) / (2 * Math.PI));
        }
        st.v = (phi - st.phi) / h; st.phi = phi; st.psi = ps;
        var q = this.pinRel(st, ps);
        if (q.t > K.RF) { st.hooked = false; st.strokes++; st.v = w; st.dPrev = q.d; }
      } else {
        if (st.phi > 0 || st.v > 0) {   // the bucket's weight turns the wheel back; a little rubbing slows it
          st.v += (-K.A - K.B * st.v) * h; st.phi += st.v * h;
          if (st.phi <= 0) { st.phi = 0; st.v = 0; }
        }
        st.psi += (K.PS0 - st.psi) * Math.min(1, h * 10);   // light spring back to the pin
        st.psi = Math.max(st.psi, K.PS0, this.stopPsi(st.phi, st.sx));
        var q2 = this.pinRel(st, st.psi);
        if (st.dPrev > m && q2.d <= m && q2.d > -m && q2.t < K.RF - 1 && q2.t > 12 && st.psi < K.PS0 + .03) { st.hooked = true; st.v = w; }
        else { for (j = 0; j < 200 && this.overlap(q2); j++) { st.psi += .005; q2 = this.pinRel(st, st.psi); } }   // peg rides over the cam
        st.dPrev = q2.d;
      }
    }
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i;
    var o = this.o = { st: this.init(), span: -1 };
    // wheel: grooved rim r 52..75, groove bottom r 71 between flanges, z -9..9
    o.wheel = new T.Group(); scene.add(o.wheel);
    var prof = [[52, -9], [75, -9], [75, -6], [71, -6], [71, 6], [75, 6], [75, 9], [52, 9], [52, -9]].map(function (p) { return new T.Vector2(p[0], p[1]); });
    var rg = new T.LatheGeometry(prof, 96); rg.rotateX(Math.PI / 2); o.wheel.add(new T.Mesh(rg, c.mat("wheel")));
    o.wheel.add(P.cylZ(12, 20, c.mat("wheel")));                                    // hub z -10..10, loose on the shaft
    for (i = 0; i < 4; i++) { var sp = P.at(P.box(42, 6, 6, c.mat("wheel")), 32 * Math.cos(i * Math.PI / 2), 32 * Math.sin(i * Math.PI / 2), 0, o.wheel); sp.rotation.z = i * Math.PI / 2; }   // spokes r 11..53
    P.at(P.cylZ(3.5, 6.5, c.mat("wheel", "dark")), K.PV[0], K.PV[1], 12.25, o.wheel);   // pivot pin z 9..15.5, from the rim face through the catch
    var tx = -Math.cos(K.PS0), ty = -Math.sin(K.PS0);                                 // tail direction at rest
    P.at(P.cylZ(1.5, 5.5, c.mat("wheel", "dark")), K.PV[0] + 10 * tx + 4.5 * ty, K.PV[1] + 10 * ty - 4.5 * tx, 11.75, o.wheel);   // rest pin z 9..14.5, touching the tail's side
    var ta = 160 * Math.PI / 180;
    P.at(P.sphere(3.2, c.mat("rope")), K.RG * Math.cos(ta), K.RG * Math.sin(ta), 0, o.wheel);   // where the rope is tied to the rim
    // catch: bar z 11..15 pivoting on the rim, hook peg z 15..22 reaching into the cam's plane
    o.catch = new T.Group(); o.catch.position.set(K.PV[0], K.PV[1], 0); o.wheel.add(o.catch);
    var mc = c.mat("catch");
    P.at(P.box(K.LH + K.LT, 6, 4, mc), (K.LH - K.LT) / 2, 0, 13, o.catch);
    P.at(P.box(5, 10, 3.6, mc), K.LH - 2.5, -5, 13, o.catch);                       // hooked nose, bent towards the shaft
    P.at(P.cylZ(K.RP, 7, mc), K.LH, 0, 18.5, o.catch);                              // hook peg
    // shaft and cam: shaft z -20..24 between the two stands' faces, cam z 16..22
    o.cam = new T.Group(); scene.add(o.cam);
    var md = c.mat("cam");
    P.at(P.cylZ(5, 44, md), 0, 0, 2, o.cam);
    P.at(P.cylZ(8, 4, md), 0, 0, -12, o.cam);                                       // collar z -14..-10, against the wheel hub
    P.at(P.cylZ(12, 6, md), 0, 0, 19, o.cam);                                       // cam hub
    P.at(P.box(K.RF - K.WF - 10, 2 * K.WF, 6, md), (K.RF - K.WF + 10) / 2, 0, 19, o.cam);   // cam arm r 10..64.5
    P.at(P.cylZ(K.WF, 6, md), K.RF - K.WF, 0, 19, o.cam);                          // rounded tip, out to r 68
    // stands: A-frames z 24..32 (front) and -28..-20 (back), feet on the base plate top y -120
    var sh = new T.Shape(); sh.moveTo(-52, -120); sh.lineTo(52, -120); sh.lineTo(20, -14); sh.lineTo(20, 20); sh.lineTo(-20, 20); sh.lineTo(-20, -14); sh.lineTo(-52, -120);
    var hole = new T.Path(); hole.moveTo(-34, -112); hole.lineTo(0, -38); hole.lineTo(34, -112); hole.lineTo(-34, -112); sh.holes.push(hole);
    [[24, 32], [-28, -32]].forEach(function (z) {
      var g = new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false }); g.translate(0, 0, z[0] > 0 ? 24 : -28);
      scene.add(new T.Mesh(g, c.fixed));
      P.at(P.cylZ(12, 4, c.fixed), 0, 0, z[1] > 0 ? 34 : -30, scene);               // bearing boss on the outer face, z 32..36 / -32..-28
    });
    P.at(P.box(142, 8, 72, c.fixed), 11, -124, 2, scene);                           // base plate x -60..82, y -128..-120, z -34..38
    P.at(P.box(33, 8, 22, c.fixed), -103.5, -124, -35, scene);                      // post foot x -120..-87, y -128..-120, z -46..-24
    P.at(P.box(17, 221, 10, c.fixed), -103.5, -9.5, -35, scene);                    // post x -112..-95, y -120..101, z -40..-30
    P.at(P.box(197, 15, 10, c.fixed), -13.5, 108.5, -35, scene);                    // beam x -112..85, y 101..116, z -40..-30
    o.stop = P.at(P.box(K.SW, K.Y1 - K.Y0, 52, c.mat("stop")), K.SX.drawn + K.SW / 2, (K.Y0 + K.Y1) / 2, -4, scene);   // y 95..116, z -30..22, back face on the beam's front face
    // pump: open barrel y -241..-45 on a bottom disc y -247..-241
    var glass = c.fixed.clone(); glass.opacity = .18; glass.depthWrite = false;   // thinner than the stands, so the bucket shows inside
    c.shell(P.at(new T.Mesh(new T.CylinderGeometry(11, 11, 196, 36, 1, true), glass), -K.RG, -143, 0, scene), "open");
    c.shell(P.at(new T.Mesh(new T.CylinderGeometry(11, 11, 196, 36, 1, true), c.fixed), -K.RG, -143, 0, scene), "closed");   // closed view: the same barrel, solid
    c.shell(P.at(new T.Mesh(new T.CylinderGeometry(10.5, 10.5, 196, 36, 1, true), c.fixed), -K.RG, -143, 0, scene), "closed").scale.x = -1;   // closed view: lining facing inwards (mirrored), 0.5 inside the barrel, so the open top looks like a tube
    P.at(P.cylY(13, 6, c.fixed), -K.RG, -244, 0, scene);
    o.pump = new T.Group(); o.pump.position.x = -K.RG; scene.add(o.pump);           // origin at the top of the eye
    var mp = c.mat("pump");
    P.at(P.hook({ radius: 4, tube: 1.3, material: mp }), 0, -5.3, 0, o.pump);      // eye, top at 0
    P.at(P.cylY(2, 18, mp), 0, -18.3, 0, o.pump);                                  // rod -27.3..-9.3
    P.at(P.cylY(9.5, 12, mp), 0, -33.3, 0, o.pump);                                // bucket -39.3..-27.3, rests 0.5 above the barrel bottom
    o.rope = P.at(P.rod(1.6, c.mat("rope")), 0, 0, 0, scene);
    o.wrap = P.at(P.arc(K.RG, 1.6, .5, c.mat("rope")), 0, 0, 0, scene); o.wrap.userData.live = true;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, st = o.st;
    if (S.playing) this.advance(st, dt, S.w, K.SX[S.controls.stop] || K.SX.drawn);
    o.wheel.rotation.z = -st.phi;
    o.catch.rotation.z = st.psi;
    o.cam.rotation.z = K.TF0 - st.a;
    o.stop.position.x = st.sx + K.SW / 2;
    var eye = K.EYE0 + K.RG * st.phi;
    o.pump.position.y = eye;
    o.rope.span(-K.RG, 0, 0, -K.RG, eye - 1.3, 0);
    var tie = 160 * Math.PI / 180 - st.phi, span = Math.PI - tie;                    // rope wound from the left of the rim up to the tie
    if (Math.abs(span - o.span) > .002) {
      o.wrap.geometry.dispose(); o.wrap.geometry = new c.THREE.TorusGeometry(K.RG, 1.6, 8, 64, span); o.span = span;
    }
    o.wrap.rotation.z = tie;
    S.set("c", st.hooked ? "Hooked" : (st.phi > 0 ? "Free" : "Waiting"));
    S.set("b", Math.round(K.RG * st.phi / 2) + " cm");
    S.set("n", String(st.strokes));
  }
});
