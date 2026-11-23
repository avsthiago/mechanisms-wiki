(function () {
  // Layout from the engraving, 1 px = 0.8 units, disc centre at the origin, y up.
  var K = {
    O: [178.4, -28],        // lever pivot
    LA: 122, LB: 108,       // lower arm (reaches the disc) and upper arm (carries the rope), at right angles
    A0: 198 * Math.PI / 180, B0: 108 * Math.PI / 180,
    H: 6,                   // half thickness of the arms
    RS: 96, RT: 11,         // ring of the studs, stud radius
    RD: 108,                // disc radius
    C: [260, 228], R: 28, RC: 31,   // pulley centre, rim radius, rope radius round it
    YB0: -36, BR: 34,       // weight ball centre at rest, ball radius
    G: 520,                 // fall speed of the weight (units/s^2)
    ZR: 11                  // z of the arms and ropes
  };
  var TWO = 2 * Math.PI;

  /** Rope from the lever's upper eye over the pulley: straight part, tangent angle, and Q = rope used on the lever side. */
  function rope(phi) {
    var b = K.B0 + phi, ex = K.O[0] + K.LB * Math.cos(b), ey = K.O[1] + K.LB * Math.sin(b);
    var dx = ex - K.C[0], dy = ey - K.C[1], D = Math.sqrt(dx * dx + dy * dy), Lt = Math.sqrt(D * D - K.RC * K.RC);
    var tau = Math.atan2(dy, dx) - Math.acos(K.RC / D); if (tau < 0) tau += TWO;
    return { ex: ex, ey: ey, Lt: Lt, tau: tau, Q: Lt + K.RC * tau };
  }
  /** Is a stud at world position (sx, sy) pressing into the lower arm when the lever is turned by phi? */
  function pen(phi, sx, sy) {
    var a = K.A0 + phi, ux = Math.cos(a), uy = Math.sin(a), rx = sx - K.O[0], ry = sy - K.O[1];
    var t = rx * ux + ry * uy, dn = rx * Math.sin(a) - ry * Math.cos(a), d;
    if (dn <= 0) return false;
    if (t < 0) d = Math.sqrt(rx * rx + ry * ry); else if (t > K.LA) d = Math.sqrt((rx - K.LA * ux) * (rx - K.LA * ux) + (ry - K.LA * uy) * (ry - K.LA * uy)); else d = dn;
    return d < K.H + K.RT;
  }
  /** Smallest lever turn that keeps this stud off the arm: the largest turn at which the stud would still press into it. */
  function need(sx, sy) {
    var top = 0.8, step = 0.008, f = top;
    while (f > 0 && !pen(f, sx, sy)) f -= step;
    if (f <= 0 && !pen(0, sx, sy)) return 0;
    var lo = Math.max(f, 0), hi = lo + step;
    for (var i = 0; i < 22; i++) { var m = (lo + hi) / 2; if (pen(m, sx, sy)) lo = m; else hi = m; }
    return hi;
  }
  function studAngle(st, k) { return st.s0 - st.th + k * TWO / st.n; }
  function studPos(st, k) { var a = studAngle(st, k); return [K.RS * Math.cos(a), K.RS * Math.sin(a)]; }
  /** Largest lever turn demanded by any stud. */
  function demand(st) {
    var m = 0, who = -1;
    for (var k = 0; k < st.n; k++) { var p = studPos(st, k), v = need(p[0], p[1]); if (v > m) { m = v; who = k; } }
    return { phi: m, who: who };
  }
  /** Lever turn for a given rope length Q (Q grows with phi). */
  function invert(q) {
    var lo = 0, hi = 1.2;
    for (var i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (rope(m).Q < q) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  /** Advance by dt: the disc turns clockwise by w*dt; the weight falls freely unless a stud holds the lever. */
  function adv(st, dt, w) {
    if (!(dt > 1e-6)) return;
    st.th += w * dt;
    var dm = demand(st), qmin = rope(dm.phi).Q, q1 = st.q + st.qd * dt - 0.5 * K.G * dt * dt;
    st.qd -= K.G * dt;
    st.driven = false;
    if (q1 <= qmin) {
      if (dm.phi > 1e-4) st.driven = true;
      st.qd = (qmin - st.q) / dt; q1 = qmin;
      if (!st.driven && st.qd < 0) st.qd = 0;
    }
    st.q = q1;
    st.phi = invert(st.q);
    if (st.phi > 0.05 && !st.was) { st.pushes++; st.was = true; }
    if (st.phi < 0.02) st.was = false;
  }
  /** Starting state: first stud just touching the arm on its upper side, at the drawn place. */
  function init(n) {
    var st = { n: n, th: 0, s0: 0, q: rope(0).Q, qd: 0, phi: 0, pushes: 0, driven: false, was: false };
    var a = -10 * Math.PI / 180;
    while (!pen(0, K.RS * Math.cos(a), K.RS * Math.sin(a))) a -= 0.0005;
    st.s0 = a + 0.0005;
    return st;
  }
  function sg(n, u, d) { return (n < -0.5 * Math.pow(10, -d) ? "−" : n > 0.5 * Math.pow(10, -d) ? "+" : "") + Math.abs(n).toFixed(d) + u; }

  var def = {
    number: 154,
    title: "Studs, bell crank and weight",
    lede: "A disc with studs turns round and round. Each stud pushes down on one end of a lever bent at a corner, called a bell crank. A weight on a rope pulls the lever back, so the weight rises and falls again and again.",
    alt: "A round disc on the left with studs near its rim. To its right, a bell crank turns on an upright. Its lower arm touches the studs. Its upper arm has a rope that runs up over a pulley to a hanging ball.",
    parts: [
      { key: "disc", color: "#5E7387", name: "Disc", note: "The disc turns on its shaft. It carries the studs and is what you turn by hand or by motor." },
      { key: "stud", color: "#C2503F", name: "Studs", note: "Round pins fixed near the rim of the disc. Watch each one reach the lever and push it down." },
      { key: "crank", color: "#C8873A", name: "Bell crank", note: "A lever bent at a corner, called a bell crank, with two arms at right angles. It turns on a fixed pin at its corner. The studs push one arm and the rope pulls the other." },
      { key: "rope", color: "#D9B13B", name: "Rope", note: "It ties the lever to the weight and runs over the pulley. The red marks move with it." },
      { key: "pulley", color: "#4FA58A", name: "Pulley", note: "A wheel that turns the rope from running up to hanging down. It turns with the rope." },
      { key: "weight", color: "#8E7AA8", name: "Weight", note: "A heavy ball on the end of the rope. It pulls the lever back when a stud lets go." }
    ],
    controls: [{ id: "n", label: "Studs on the disc", value: "3", options: [["1", "1"], ["2", "2"], ["3", "3"]] }],
    readouts: [{ id: "ang", label: "Lever turn" }, { id: "lift", label: "Weight raised" }, { id: "push", label: "Pushes" }],
    views: { front: [90, 70, 850], "3d": [380, 170, 880], side: [850, 40, 40] },
    target: [100, 70, 0],
    how: [
      "The disc turns clockwise. Each stud comes round to the lower arm of the lever and pushes it down. The lever turns, and its upper arm pulls the rope. The rope runs over the pulley and lifts the weight.",
      "The stud keeps pushing until it slides off the end of the arm. Then nothing holds the lever. The weight falls and pulls the lever back to where it started. It stops against a small pin. The next stud then comes round and pushes again.",
      "Try 1 stud, then 2, then 3. With more studs the weight is lifted more often. Watch the readout count the pushes."
    ],
    note: "This model is rebuilt from Brown's drawing. The shaft, the stand for the disc, the upright for the lever, the post for the pulley, the base and the small stop pin that holds the lever up were made up. Brown does not say how far the lever turns. Here it turns as far as each stud pushes it. The weight falls freely, so it does not slow down before it stops.",
    calc: { K: K, rope: rope, pen: pen, need: need, demand: demand, adv: adv, init: init, invert: invert, studPos: studPos },

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { st: init(3) };
      var mr = c.mat("rope"), mk = c.mat("rope", "mark"), mc = c.mat("crank"), mcd = c.mat("crank", "dark"), mpd = c.mat("pulley", "dark");
      var Z = K.ZR, i;
      // disc z -4..4, face stripe z 4.5..5, hub z 4..10; shaft z -5..8 ends on the stand's face at z -5
      o.disc = new T.Group(); scene.add(o.disc);
      P.at(P.cylZ(K.RD, 8, c.mat("disc")), 0, 0, 0, o.disc);                                   // z -4..4
      P.at(P.box(K.RD - 12, 7, 0.5, c.mat("disc", "dark")), (K.RD + 12) / 2, 0, 4.75, o.disc);   // stripe hub to rim, z 4.5..5
      P.at(P.cylZ(12, 6, c.mat("disc")), 0, 0, 7, o.disc);                                      // hub z 4..10
      P.at(P.cylZ(8, 13, c.mat("disc")), 0, 0, 1.5, o.disc);                                    // shaft z -5..8
      o.studs = [];
      for (i = 0; i < 4; i++) { var s = P.cylZ(K.RT, 16, c.mat("stud")); s.position.z = 12; o.disc.add(s); o.studs.push(s); }   // z 4..20
      // stand for the disc: z -15..-5 (disc back face z -4 clear), top rounded at the shaft
      P.at(P.box(52, 125.6, 10, c.fixed), 0, -62.8, -10, scene);                                // x -26..26, y -125.6..0, z -15..-5
      P.at(P.cylZ(26, 9, c.fixed), 0, 0, -9.5, scene);                                          // z -14..-5, y -26..26
      // lever: arms z 8..14
      o.cr = new T.Group(); o.cr.position.set(K.O[0], K.O[1], 0); scene.add(o.cr);
      var lowG = new T.Group(); lowG.rotation.z = K.A0; o.cr.add(lowG);
      P.at(P.box(K.LA, 2 * K.H, 6, mc), K.LA / 2, 0, Z, lowG);
      P.at(P.cylZ(K.H, 6, mc), K.LA, 0, Z, lowG);                                              // rounded tip, z 8..14
      var upG = new T.Group(); upG.rotation.z = K.B0; o.cr.add(upG);
      P.at(P.box(K.LB, 2 * K.H, 6, mc), K.LB / 2, 0, Z, upG);
      P.at(P.cylZ(9, 6, mc), K.LB, 0, Z, upG);                                                 // eye, z 8..14
      P.at(P.cylZ(14, 6, mc), 0, 0, Z, o.cr);                                                  // boss, z 8..14
      o.eyePin = P.at(P.cylZ(4, 7, mcd), 0, 0, Z, scene);                                      // z 7.5..14.5
      // pivot pin on the upright: z 4..15, cap z 14..16
      P.at(P.cylZ(6, 11, mpd), K.O[0], K.O[1], 9.5, scene);
      P.at(P.cylZ(8, 2, mpd), K.O[0], K.O[1], 15, scene);
      // upright: x 164..192, y -125.6..-8, z -4..4
      P.at(P.box(28, 117.6, 8, c.fixed), K.O[0], -66.8, 0, scene);
      // stop pin against the back of the upper arm at rest, on a thin fin above the upright
      var sx = K.O[0] + 60 * Math.cos(K.B0) + (K.H + 5) * Math.sin(K.B0), sy = K.O[1] + 60 * Math.sin(K.B0) - (K.H + 5) * Math.cos(K.B0);
      P.at(P.box(12, sy + 8 + 8, 6, c.fixed), sx, (sy + 8 - 8) / 2, 0, scene);               // fin x sx+-6, y -8..sy+8, z -3..3
      P.at(P.cylZ(5, 10, mpd), sx, sy, 8, scene);                                              // z 3..13
      // base z -30..40, y -143.6..-125.6
      P.at(P.box(402, 18, 70, c.fixed), 129, -134.6, 5, scene);                                 // x -72..330
      // pulley: rim z 4..18, shaft z 2..20 from the post face z 2
      o.pul = P.pulley({ radius: K.R, width: 14, rim: 4, spokes: 4, hub: 7, material: c.mat("pulley") });
      o.pul.spokes[0].material = c.mat("pulley", "mark");
      P.at(o.pul, K.C[0], K.C[1], Z, scene);
      P.at(P.cylZ(4.5, 18, mpd), K.C[0], K.C[1], 11, scene);                                    // z 2..20
      P.at(P.cylZ(6, 1.5, mpd), K.C[0], K.C[1], 20.75, scene);                                  // cap z 20..21.5
      P.at(P.box(16, 353.6, 6, c.fixed), K.C[0], 51.2, -1, scene);                              // x 252..268, y -125.6..228, z -4..2
      // ropes
      o.wrap = new T.Mesh(new T.BufferGeometry(), mr); o.wrap.userData.live = true; scene.add(o.wrap);
      o.slant = P.rod(2.5, mr); scene.add(o.slant);
      o.hang = P.rod(2.5, mr); scene.add(o.hang);
      o.m1 = P.at(P.sphere(4.5, mk), 0, 0, Z, scene);
      o.m2 = P.at(P.sphere(4.5, mk), 0, 0, Z, scene);
      // weight: origin where the stem meets the ball's top
      o.wt = new T.Group(); scene.add(o.wt);
      P.at(P.hoop(5, 2, c.mat("weight")), 0, 13, 0, o.wt);                                       // eye y 6..20
      P.at(P.cylY(2.5, 16, c.mat("weight")), 0, 0, 0, o.wt);
      P.at(P.sphere(K.BR, c.mat("weight")), 0, -K.BR + 6, 0, o.wt);                               // ball top at y 6
      o.q0 = rope(0).Q; o.lastN = 3;
    },

    step: function (c, dt, S) {
      var o = this.o, st = o.st, n = +(S.controls.n || 3);
      if (n !== st.n) { st.n = n; }
      dt = Math.min(dt, 0.05);
      if (!(dt > 1e-6)) dt = 1e-6;
      var ns = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / ns, i;
      for (i = 0; i < ns; i++) adv(st, h, S.w);
      for (i = 0; i < 4; i++) {
        var s = o.studs[i]; s.visible = i < st.n;
        if (i < st.n) { var al = st.s0 + i * TWO / st.n; s.position.x = K.RS * Math.cos(al); s.position.y = K.RS * Math.sin(al); }
      }
      o.disc.rotation.z = -st.th;
      var phi = st.phi, r = rope(phi);
      o.cr.rotation.z = phi;
      o.eyePin.position.set(r.ex, r.ey, K.ZR);
      var tx = K.C[0] + K.RC * Math.cos(r.tau), ty = K.C[1] + K.RC * Math.sin(r.tau);
      o.slant.span(r.ex, r.ey, K.ZR, tx, ty, K.ZR);
      o.m1.position.set(r.ex + (tx - r.ex) * 40 / r.Lt, r.ey + (ty - r.ey) * 40 / r.Lt, K.ZR);
      o.pul.rotation.z = (r.Q - o.q0) / K.RC;
      var sh = new c.THREE.Shape(), r1 = K.RC + 2.5, r0 = K.RC - 2.5;
      sh.absarc(0, 0, r1, 0, r.tau, false); sh.absarc(0, 0, r0, r.tau, 0, true);
      var g = new c.THREE.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: false, curveSegments: 40 });
      g.translate(0, 0, -2.5); o.wrap.geometry.dispose(); o.wrap.geometry = g; o.wrap.position.set(K.C[0], K.C[1], K.ZR);
      var up = r.Q - o.q0, yb = K.YB0 + up, hx = K.C[0] + K.RC, top = yb + (K.BR - 6) + 20;
      o.wt.position.set(hx, yb + K.BR - 6, K.ZR);
      o.hang.span(hx, K.C[1], K.ZR, hx, top, K.ZR);
      o.m2.position.set(hx, top + (K.C[1] - top) * 0.3, K.ZR);
      S.set("ang", sg(phi * 180 / Math.PI, "°", 0));
      S.set("lift", Math.round(up) + " mm");
      S.set("push", String(st.pushes));
    }
  };
  M507.define(def);
})();
