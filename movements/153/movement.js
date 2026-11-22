(function () {
  // Everything is worked out in the picture's own units (1 unit = one pixel of the engraving) with the disc centre at the
  // origin, Y up, and the whole model is scaled by SC when it is added to the scene. The disc turns clockwise.
  var PI = Math.PI, SC = 0.6;
  var RD = 133, RING = 116, RS = 12, A0 = 96 * PI / 180, NST = 2;          // disc radius, stud circle, stud radius, first stud angle
  var PJ = { x0: 2, x1: 38, y0: 100, y1: 160 };                            // projection under the bar (bar at rest)
  var O = [-213, 8], U0 = Math.atan2(167, 93), UL = 190, LL = 134, HW = 12, KR = 22;   // crank pivot, upper arm angle and length, lower arm length, arm half width, knob radius
  var BY = 177, BX0 = -227;                                                // stud on the bar (rest position)
  var HIT = RS + HW;                                                       // centre distance when a stud touches an arm
  var KHIT = RS + KR;                                                      // centre distance when a stud touches the knob

  function segDist(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function upperTip(d) { return [O[0] + UL * Math.cos(U0 + d), O[1] + UL * Math.sin(U0 + d)]; }
  function knob(d) { return [O[0] + LL * Math.cos(U0 - PI / 2 + d), O[1] + LL * Math.sin(U0 - PI / 2 + d)]; }
  function studPos(i, beta) { var a = A0 - beta + i * 2 * PI / NST; return [RING * Math.cos(a), RING * Math.sin(a)]; }
  function barClear(xb, d) { return segDist([BX0 + xb, BY], O, upperTip(d)) >= HIT - 1e-9; }

  // One small step of the contacts. s = {xb: bar shift, d: crank turn (anticlockwise), beta: disc turn (clockwise)}.
  function settle(s) {
    var i, p, dy, cand, k;
    for (i = 0; i < NST; i++) {
      p = studPos(i, s.beta);
      // a stud on the left of the projection pushes the bar to the right
      dy = p[1] > PJ.y1 ? p[1] - PJ.y1 : p[1] < PJ.y0 ? PJ.y0 - p[1] : 0;
      if (dy < RS && p[0] < s.xb + (PJ.x0 + PJ.x1) / 2) { cand = p[0] + Math.sqrt(RS * RS - dy * dy) - PJ.x0; if (cand > s.xb) s.xb = cand; }
    }
    // the stud on the bar pushes the upper arm round (clockwise) if it is in the way
    for (k = 0; k < 4000 && !barClear(s.xb, s.d); k++) s.d -= 0.0005;
    // a stud pushes the knob at the end of the lower arm (anticlockwise)
    for (i = 0; i < NST; i++) {
      p = studPos(i, s.beta);
      for (k = 0; k < 4000; k++) { var q = knob(s.d); if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= KHIT - 1e-9) break; s.d += 0.0005; }
    }
    // the upper arm pushes the stud on the bar back (to the left)
    for (k = 0; k < 4000 && !barClear(s.xb, s.d); k++) s.xb -= 0.1;
    return s;
  }
  function advance(s, dbeta) {
    var n = Math.max(1, Math.ceil(Math.abs(dbeta) / 0.004)), i;
    for (i = 0; i < n; i++) { s.beta += dbeta / n; settle(s); }
    return s;
  }

  M507.define({
    number: 153,
    title: "Studs, bar and bell crank",
    lede: "Studs on a turning disc push a bar to one side. A lever bent at a corner, called a bell crank, then pushes the bar back. So a steady turn becomes a push to and fro. Machines use it to move a slide.",
    alt: "A round disc with two short studs on its face, a long horizontal bar above it with a block hanging under it, and a lever bent at a corner to the left whose upper arm reaches the bar and whose lower arm reaches the disc. Two small wheels hold the bar up.",
    parts: [
      { key: "disc", color: "#5E7387", name: "Disc and studs", note: "The disc turns clockwise. Two short pins, called studs, stand out of its face. Each stud pushes the bar, then the lever." },
      { key: "bar", color: "#C8873A", name: "Bar", note: "A long bar that slides left and right. A block hangs under it for the studs to hit. The red pin on its front is what the lever pushes." },
      { key: "crank", color: "#D9B13B", name: "Bell crank", note: "A lever bent at a corner, called a bell crank, that turns on a fixed pin. Its upper arm pushes the red pin on the bar. A small knob on the lower arm is hit by the studs." },
      { key: "rollers", color: "#8E7AA8", name: "Small wheels", note: "Two wheels under the bar. They carry it and roll as it slides." }
    ],
    controls: [],
    readouts: [{ id: "bar", label: "Bar" }, { id: "lev", label: "Lever" }, { id: "cnt", label: "Strokes" }],
    views: { front: [10, 10, 660], "3d": [300, 190, 560], side: [660, 20, 10] },
    target: [10, 10, 10],
    how: [
      "The disc turns clockwise. A stud comes up on the left of the block under the bar. It pushes the block, and the bar slides to the right.",
      "Half a turn later the other stud meets the knob on the lower arm of the bell crank. It knocks the knob up. The lever turns, and its upper arm pushes the red pin on the bar back to the left.",
      "So each stud gives the bar one push right and one push left. Watch the red pin to see where the bar is. Press play and follow one stud all the way round."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown gives no sizes, so the sizes, the two studs, the back plate and the base were made up. A round knob was added behind the lower arm so the studs can pass behind the lever. The lever pushes the bar back only part of the way, so the bar settles between two end points after the first push. The model starts in the drawn position.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { beta: 0, s: { xb: 0, d: 0, beta: 0 }, n: 0, last: 0 };
      var root = o.root = new T.Group(); root.scale.set(SC, SC, SC); scene.add(root);
      var mDisc = c.mat("disc"), mDark = c.mat("disc", "dark"), mBar = c.mat("bar"), mCr = c.mat("crank"), mRo = c.mat("rollers");
      // disc: z -14..0, hub z 0..8, studs z 0..30, shaft z -48..-14 ends on the plate face z -48
      o.disc = P.studWheel({ radius: RD, width: 14, studs: NST, ring: RING, studRadius: RS, studLength: 30, start: A0,
        material: mDisc, studMaterial: mDark });
      root.add(o.disc);
      P.at(P.cylZ(28, 8, mDark), 0, 0, 4, o.disc);                                   // hub z 0..8
      P.at(P.cylZ(10, 34, mDisc), 0, 0, -31, o.disc);                                // shaft z -48..-14
      var st = P.box(RD - 32, 5, 1, mDark); st.position.set((RD + 28) / 2 * Math.cos(A0 + PI / 2), (RD + 28) / 2 * Math.sin(A0 + PI / 2), 1);
      st.rotation.z = A0 + PI / 2; o.disc.add(st);                                   // stripe z 0.5..1.5, lifted off the face
      // bar: x -325..270, y 160..200, z 8..30; block (projection) x 2..38, y 100..170, z 6..32 reaches into the bar
      o.bar = new T.Group(); root.add(o.bar);
      P.at(P.box(595, 40, 22, mBar), -27.5, 180, 19, o.bar);
      P.at(P.box(PJ.x1 - PJ.x0, 70, 26, mBar), (PJ.x0 + PJ.x1) / 2, 135, 19, o.bar);
      P.at(P.cylZ(RS, 18, c.mat("bar", "mark")), BX0, BY, 39, o.bar);                // red pin on the bar front, z 30..48
      // small wheels under the bar: r 25, centre y 135 so the top touches the bar at y 160; z 12..28, axles z -48..30
      o.wheels = [-275, 213].map(function (x) {
        var g = new T.Group(); g.position.set(x, 135, 0); root.add(g);
        P.at(P.cylZ(25, 16, mRo), 0, 0, 20, g);
        var m = P.box(18, 5, 1, c.mat("rollers", "dark")); m.position.set(12, 0, 28.5); g.add(m);       // mark z 28..29
        P.at(P.cylZ(6, 78, c.mat("rollers", "dark")), x, 135, -9, root);                                // axle z -48..30
        return g;
      });
      // bell-crank: arms z 31..41, boss z 30..42, knob z 18..31 behind the lower arm, pin z -48..42
      o.cr = new T.Group(); o.cr.position.set(O[0], O[1], 0); root.add(o.cr);
      var up = new T.Group(); up.rotation.z = U0; o.cr.add(up);
      P.at(P.box(UL, 2 * HW, 10, mCr), UL / 2, 0, 36, up);
      P.at(P.cylZ(HW, 11, mCr), UL, 0, 36, up);                                      // round end z 30.5..41.5
      var lo = new T.Group(); lo.rotation.z = U0 - PI / 2; o.cr.add(lo);
      P.at(P.box(LL, 2 * HW, 10, mCr), LL / 2, 0, 36, lo);
      P.at(P.cylZ(KR, 13, c.mat("crank", "dark")), LL, 0, 24.5, lo);                 // knob z 18..31
      P.at(P.cylZ(26, 12, mCr), 0, 0, 36, o.cr);                                     // boss z 30..42
      P.at(P.cylZ(12, 2.5, c.mat("crank", "dark")), 0, 0, 43.25, o.cr);              // cap z 42..44.5
      P.at(P.cylZ(8, 88, c.mat("crank", "dark")), O[0], O[1], -4, root);          // pin z -48..40, ends inside the boss
      // supports: plate x -400..400, y -170..230, z -58..-48; base y -180..-170, z -58..22
      P.at(P.box(800, 400, 10, c.fixed), 0, 30, -53, root);
      P.at(P.box(800, 10, 80, c.fixed), 0, -175, -18, root);
    },

    step: function (c, dt, S) {
      var o = this.o, s = o.s;
      advance(s, S.w * dt);
      o.disc.rotation.z = -s.beta;
      o.bar.position.x = s.xb;
      o.cr.rotation.z = s.d;
      o.wheels.forEach(function (g) { g.rotation.z = -s.xb / 25; });
      // strokes: count each time the bar reaches its right end
      var n = Math.max(0, Math.floor(s.beta / PI + 0.2));
      S.set("bar", (s.xb >= 0 ? "+" : "−") + Math.abs(Math.round(s.xb * SC)) + " mm");
      S.set("lev", (s.d >= 0 ? "+" : "−") + Math.abs(Math.round(s.d * 180 / PI)) + "°");
      S.set("cnt", n + (n === 1 ? " push" : " pushes"));
    },
    kin: { advance: advance, settle: settle, barClear: barClear, studPos: studPos, knob: knob, upperTip: upperTip, segDist: segDist, K: { O: O, RS: RS, HW: HW, KR: KR, PJ: PJ, BY: BY, BX0: BX0, RING: RING } }
  });
})();
