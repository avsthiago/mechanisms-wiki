M507.define({
  number: 169,
  title: "Crank, link and connecting rod",
  lede: "A turning crank moves a long flat bar, called a connecting rod. The bar pushes a lever to and fro. A short link joins the far end of the bar to a second crank. The second crank is not driven by anything but the link, yet it goes round and round.",
  alt: "A long flat bar slants up from a lever at the lower left to a short link at the upper right. A small crank on a shaft in the middle holds the bar on its pin. The link ends on the arm of a second crank on the right.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Driving crank", note: "The crank on the driving shaft. This is the part you turn. Its pin goes round in a circle, shown by the dashes." },
    { key: "pitman", color: "#D9B13B", name: "Connecting rod", note: "The long flat bar. The driving crank pin holds it near the middle. One end rocks the lever and the other end swings the link." },
    { key: "link", color: "#C2503F", name: "Short link", note: "A short bar that joins the connecting rod's end to the second crank. Watch it. It lets the second crank be pushed round without any slot." },
    { key: "second", color: "#4FA58A", name: "Second crank", note: "A crank of fixed length on its own shaft. It is turned by the link and goes round by itself." },
    { key: "lever", color: "#C8873A", name: "Lever", note: "The arm at the left that carries the work. The connecting rod rocks it from side to side." }
  ],
  controls: [{ id: "l", label: "Link length", value: "90", options: [["90", "As drawn"], ["120", "Longer"]] }],
  readouts: [{ id: "s", label: "Second crank" }, { id: "t", label: "Rod tilt" }, { id: "x", label: "Lever end" }],
  views: { front: [10, -30, 740], "3d": [300, 130, 700], side: [700, 0, 0] },
  target: [-10, -30, 0],
  how: [
    "The driving crank pin goes round in a circle. It holds the long bar near its middle, so the bar slides and tilts as the pin moves. The left end rocks the lever. The right end swings the short link, and the link turns the second crank.",
    "The second crank does not turn at an even pace. It speeds up and slows down while the driving crank turns evenly. That is because the link pushes the second crank from a slanting angle that keeps changing.",
    "Try the longer link and watch the second crank. Its speed changes in a different way, and the bar tilts the same."
  ],
  note: "This model is rebuilt from Brown's drawing. The back plate, the shafts, the pins, the thickness of every bar and the length of the lever were made up. The lever's pivot is below the picture and its length was chosen so the model turns right round without jamming. The longer link was added for comparison.",

  K: { s: 0.8 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, k = this.K.s;
    function X(px) { return (px - 303) * k; }
    function Y(py) { return (295 - py) * k; }
    var o = this.o = { a: 0, prevE: null, prevQ: null, Lk: 0, phi: 0 };
    var O1 = [0, 0], M0 = [X(285), Y(245)], E0 = [X(68), Y(308)], R0 = [X(488), Y(177)], Q0 = [X(562), Y(228)], O2 = [X(488), Y(297)], P0 = [X(1), Y(517)];
    o.O1 = O1; o.O2 = O2; o.P0 = P0; o.E0 = E0; o.Q0 = Q0;
    o.r1 = Math.hypot(M0[0], M0[1]); o.th0 = Math.atan2(M0[1], M0[0]);
    o.rE = [E0[0] - M0[0], E0[1] - M0[1]]; o.rR = [R0[0] - M0[0], R0[1] - M0[1]];
    o.C = Math.hypot(Q0[0] - O2[0], Q0[1] - O2[1]);
    o.Lr = Math.hypot(E0[0] - P0[0], E0[1] - P0[1]);
    var rE = o.rE, rR = o.rR, W = 0.0;
    // back plate x -280..250, y -210..120, z -20..-8; shafts and the lever pivot end on its front face z -8
    P.at(P.box(530, 330, 12, c.fixed), -15, -45, -14, scene);
    // main shaft z -8..10 with hub z 4..10
    P.at(P.cylZ(7, 17.5, c.mat("crank", "dark")), O1[0], O1[1], 0.75, scene);
    P.at(P.cylZ(15, 6, c.mat("crank")), O1[0], O1[1], 7, scene);                              // hub z 4..10
    P.at(P.cylZ(7, 18, c.mat("second", "dark")), O2[0], O2[1], 1, scene);                     // second shaft z -8..10
    // driving crank group at O1: arm along +X, z 4..10
    o.crank = new T.Group(); o.crank.position.set(O1[0], O1[1], 0); scene.add(o.crank);
    P.at(P.box(o.r1, 11, 6, c.mat("crank")), o.r1 / 2, 0, 7, o.crank);                         // arm x 0..r1, z 4..10
    P.at(P.cylZ(9, 6, c.mat("crank")), o.r1, 0, 7, o.crank);                                  // eye z 4..10
    P.at(P.cylZ(4.5, 16, c.mat("crank", "mark")), o.r1, 0, 16, o.crank);                      // pin z 8..24
    P.at(P.cylZ(7, 2, c.mat("crank", "mark")), o.r1, 0, 25, o.crank);                         // cap z 24..26
    // pitman: plate z 12..20 in a group at the main pin
    o.pit = new T.Group(); scene.add(o.pit);
    var sh = new T.Shape();
    sh.moveTo(rE[0], rE[1] + 6); sh.lineTo(rR[0], rR[1] + 7); sh.lineTo(rR[0] + 6, rR[1] - 5); sh.lineTo(rE[0] + 3, rE[1] - 6); sh.lineTo(rE[0], rE[1] + 6);
    var pm = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false }), c.mat("pitman")); pm.position.z = 12; o.pit.add(pm);   // z 12..20
    P.at(P.cylZ(11, 8, c.mat("pitman")), rE[0], rE[1], 16, o.pit);
    P.at(P.cylZ(12, 8, c.mat("pitman")), 0, 0, 16, o.pit);
    P.at(P.cylZ(12, 8, c.mat("pitman")), rR[0], rR[1], 16, o.pit);
    // lever: group at its pivot, bar z 4..12 along local +Y
    o.lev = new T.Group(); o.lev.position.set(P0[0], P0[1], 0); scene.add(o.lev);
    P.at(P.box(12, o.Lr, 8, c.mat("lever")), 0, o.Lr / 2, 8, o.lev);                          // z 4..12
    P.at(P.cylZ(11, 8, c.mat("lever")), 0, 0, 8, o.lev);
    P.at(P.cylZ(10, 8, c.mat("lever")), 0, o.Lr, 8, o.lev);
    P.at(P.cylZ(5, 16, c.mat("lever", "dark")), 0, 0, 0, o.lev);                              // pivot pin z -8..8
    P.at(P.cylZ(4.5, 18.5, c.mat("lever", "dark")), 0, o.Lr, 12.75, o.lev);                        // end pin z 4..22
    // link: group at the pitman end, bar along +X, z 20..26
    o.link = new T.Group(); scene.add(o.link);
    o.lbar = P.at(P.box(1, 10, 6, c.mat("link", "mark")), 0, 0, 23, o.link);
    P.at(P.cylZ(9, 6, c.mat("link", "mark")), 0, 0, 23, o.link);
    o.leye = P.at(P.cylZ(9, 6, c.mat("link", "mark")), 0, 0, 23, o.link);
    o.rpin = P.at(P.cylZ(4.5, 14, c.mat("pitman", "dark")), 0, 0, 18.5, scene);                // z 12..26
    // second crank: group at O2, arm along +X, z 26..32
    o.sec = new T.Group(); o.sec.position.set(O2[0], O2[1], 0); scene.add(o.sec);
    P.at(P.box(o.C, 11, 6, c.mat("second")), o.C / 2, 0, 29, o.sec);                           // z 26..32
    P.at(P.cylZ(15, 6, c.mat("second")), 0, 0, 29, o.sec);
    P.at(P.cylZ(9, 6, c.mat("second")), o.C, 0, 29, o.sec);
    P.at(P.cylZ(4.5, 14, c.mat("second", "dark")), o.C, 0, 26.5, o.sec);                        // pin z 20..34
    P.at(P.cylZ(7, 2, c.mat("second", "dark")), o.C, 0, 33, o.sec);                           // cap z 32..34
    o.cap = P.at(P.cylZ(7, 2, c.mat("pitman", "dark")), 0, 0, 27, scene);                     // cap z 26..28 at link/pitman pin
    // dashed paths at z 36: driving crank pin circle, and the pitman end's path
    o.dashes = [];
    var i, d, s0 = null;
    for (i = 0; i < 40; i++) { d = P.sphere(1.3, c.mat("crank", "dark")); P.at(d, o.r1 * Math.cos(i * Math.PI / 20), o.r1 * Math.sin(i * Math.PI / 20), 36, scene); }
    for (i = 0; i < 60; i++) {
      var s = this.solve(o, o.th0 - i * 2 * Math.PI / 60, s0, 90 * k); s0 = s;
      P.at(P.sphere(1.3, c.mat("pitman", "dark")), s.R[0], s.R[1], 36, scene);
    }
    o.prevE = null; o.prevQ = null;
  },

  // circle-circle intersection nearest the previous point
  ci: function (A, ra, B, rb, pref) {
    var dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy);
    if (d > ra + rb || d < Math.abs(ra - rb) || d === 0) return null;
    var aa = (ra * ra - rb * rb + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ra * ra - aa * aa)), mx = A[0] + dx * aa / d, my = A[1] + dy * aa / d;
    var q1 = [mx - dy * h / d, my + dx * h / d], q2 = [mx + dy * h / d, my - dx * h / d];
    return Math.hypot(q1[0] - pref[0], q1[1] - pref[1]) < Math.hypot(q2[0] - pref[0], q2[1] - pref[1]) ? q1 : q2;
  },
  solve: function (o, th, prev, L) {
    var M = [o.O1[0] + o.r1 * Math.cos(th), o.O1[1] + o.r1 * Math.sin(th)], n = Math.hypot(o.rE[0], o.rE[1]);
    var E = this.ci(M, n, o.P0, o.Lr, prev ? prev.E : o.E0); if (!E) return prev;
    var phi = Math.atan2(E[1] - M[1], E[0] - M[0]) - Math.atan2(o.rE[1], o.rE[0]), cs = Math.cos(phi), sn = Math.sin(phi);
    var R = [M[0] + cs * o.rR[0] - sn * o.rR[1], M[1] + sn * o.rR[0] + cs * o.rR[1]];
    var Q = this.ci(o.O2, o.C, R, L, prev ? prev.Q : o.Q0); if (!Q) return prev;
    return { M: M, E: E, R: R, Q: Q, phi: phi };
  },

  step: function (c, dt, S) {
    var o = this.o, k = this.K.s, L = +(S.controls.l || 90) * k;
    if (o.Lk !== L) { o.Lk = L; o.prev = null; }
    o.a += S.w * dt;
    var th = o.th0 - o.a;                      // the driving crank turns clockwise, as it faces the viewer
    var s = this.solve(o, th, o.prev, L); if (!s) return; o.prev = s;
    o.crank.rotation.z = th;
    o.pit.position.set(s.M[0], s.M[1], 0); o.pit.rotation.z = s.phi;
    o.lev.rotation.z = Math.atan2(s.E[1] - o.P0[1], s.E[0] - o.P0[0]) - Math.PI / 2;
    o.link.position.set(s.R[0], s.R[1], 0);
    o.link.rotation.z = Math.atan2(s.Q[1] - s.R[1], s.Q[0] - s.R[0]);
    o.lbar.scale.x = L; o.lbar.position.x = L / 2; o.leye.position.x = L;
    o.rpin.position.set(s.R[0], s.R[1], 18.5); o.cap.position.set(s.R[0], s.R[1], 27);
    var qa = Math.atan2(s.Q[1] - o.O2[1], s.Q[0] - o.O2[0]);
    o.sec.rotation.z = qa;
    var rate = 0;
    if (dt > 0 && o.qa !== undefined) { var dq = Math.atan2(Math.sin(qa - o.qa), Math.cos(qa - o.qa)); rate = dq / dt * 60 / (2 * Math.PI); o.rate = o.rate === undefined ? rate : o.rate + (rate - o.rate) * Math.min(1, dt * 8); }
    o.qa = qa;
    function sg(n, u, d) { return (n < -0.5 * Math.pow(10, -d) ? "−" : n > 0.5 * Math.pow(10, -d) ? "+" : "") + Math.abs(n).toFixed(d) + u; }
    S.set("s", sg(S.playing ? (o.rate || 0) : 0, " rpm", 1));
    S.set("t", sg(s.phi * 180 / Math.PI, "°", 1));
    S.set("x", sg(s.E[0] - o.E0[0], " mm", 0));
  }
});
