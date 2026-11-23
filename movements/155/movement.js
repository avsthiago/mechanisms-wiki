M507.define({
  number: 155,
  title: "Pawl on a bell crank",
  lede: "A rod moves up and down, and a ratchet wheel turns in small steps. A lever bent at a corner, called a bell crank, rocks to and fro and carries a pawl that pushes the teeth round. Set the pawl on the other side and the wheel turns the other way.",
  alt: "A big ratchet wheel with square teeth. A bell crank turns on the wheel's centre. A rod comes down from above to the end of its right arm. A pawl hangs from the top arm and rests in a gap between two teeth.",
  parts: [
    { key: "rod", color: "#5E7387", name: "Crank and connecting rod", note: "A small crank at the top moves the rod up and down. The rod rocks the bell crank." },
    { key: "lever", color: "#D9B13B", name: "Bell crank", note: "A lever bent at a corner, turning loose on the wheel's shaft. The rod pulls one arm and the other arm carries the pawl." },
    { key: "cog", color: "#C8873A", name: "Ratchet wheel", note: "The wheel that is turned. Its teeth are the same on both sides. Watch the red mark to see which way it goes." },
    { key: "click", color: "#C2503F", name: "Pawl", note: "A small arm hung from the lever, called a pawl. It pushes a tooth on one swing and slips over the teeth on the other." }
  ],
  controls: [{ id: "dir", label: "Pawl on", value: "fwd", options: [["fwd", "Right side"], ["back", "Left side"]] }],
  speed: { min: 2, max: 40, value: 15, label: "Crank speed", unit: " rpm" },
  readouts: [{ id: "rod", label: "Rod" }, { id: "cog", label: "Wheel" }],
  views: { "3d": [560, 230, 1000], front: [0, 60, 1100], side: [1100, 40, -20] },
  target: [0, 60, -10],
  how: [
    "The crank at the top moves the rod up and down. The rod pulls the end of the bell crank, so the lever rocks a short way one side and then back. The pawl hangs from the other arm of the lever and rocks with it.",
    "On one swing the pawl catches the side of a tooth and pushes the wheel round. On the other swing it slides up the other side of the tooth and drops into the next gap. The wheel stands still while that happens, so it moves in steps.",
    "To turn the wheel the other way, set the pawl on the other side. It then catches the other side of the teeth. Try Right side, then Left side, and watch the red mark. Planing machines use this to feed the work a little at a time."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the rod cut off at the top, so a small crank was added to move it. The plate, the base, the pins, the sizes and the number of teeth were made up. The pawl is a straight arm. When the pawl is moved to the other side, the machine waits.",

  init: function () {
    var K = this.K = { N: 28, R: 130, D: 18, TIP: .34, FL: .14, RV: 165, LP: 70, A0: Math.PI / 2, RP: 150, AP: -12 * Math.PI / 180, ROD: 250, rho: 32 };
    K.st = 2 * Math.PI / K.N; K.uw = (K.TIP / 2 + K.FL) * K.st;              // uw: where the wall of a gap lies, past the tooth centre
    K.px0 = K.RP * Math.cos(K.AP); K.py0 = K.RP * Math.sin(K.AP);
    K.cx = K.px0; K.cy = K.py0 + K.ROD;                                       // crank centre straight above the pin at rest
    var o = this.o = { g: 0, psi: 0, phi: 0, m: 1, k: 0, dp: 0, rn: K.R - K.D, flip: -1, from: 0, to: 0, th: 0, cogN: 0, dead: 0 };
    o.dp = this.reach(K.RV, K.LP, K.R - K.D);
    o.phi = K.A0 - o.dp - .5 * K.st;                                         // nose sits in the middle of a gap
    this.seat(1);
    o.phi0 = o.phi;
  },
  reach: function (rp, L, r) { return Math.acos(Math.max(-1, Math.min(1, (rp * rp + r * r - L * L) / (2 * rp * r)))); },
  rimAt: function (u) {
    var K = this.K, h = K.TIP / 2, s = u / K.st; s = Math.abs(s - Math.round(s));
    return s <= h ? K.R : s <= h + K.FL ? K.R - K.D * (s - h) / K.FL : K.R - K.D;
  },
  // Work in "mirrored" angles for the backwards click: negate the pivot angle and the wheel angle, and the rule is the same.
  // seat: the nose rests on the wheel for mode m at the present positions; pick the gap it is in.
  seat: function (m) {
    var K = this.K, s = this.o, i, ap = m * (K.A0 + s.psi), pv = m * s.phi, u;
    s.dp = this.reach(K.RV, K.LP, K.R - K.D);
    for (i = 0; i < 8; i++) { u = ap - s.dp - pv; s.dp = this.reach(K.RV, K.LP, this.rimAt(u)); }
    u = ap - s.dp - pv;
    s.m = m; s.pv = pv; s.k = Math.floor((u - K.uw) / K.st); s.rn = this.rimAt(u);
  },
  // advance the crank by dg
  phys: function (dg) {
    var K = this.K, o = this, s = this.o, i, m = s.m;
    s.g += dg;
    var kx = K.cx + K.rho * Math.cos(s.g), ky = K.cy + K.rho * Math.sin(s.g);
    for (i = 0; i < 8; i++) {
      var a = K.AP + s.psi, px = K.RP * Math.cos(a), py = K.RP * Math.sin(a), dx = px - kx, dy = py - ky;
      var f = dx * dx + dy * dy - K.ROD * K.ROD, df = 2 * (dx * -py + dy * px);
      s.psi -= f / df;
    }
    s.kx = kx; s.ky = ky;
    var ap = m * (K.A0 + s.psi), u = ap - s.dp - s.pv;
    while (u >= (s.k + 1) * K.st + K.uw) s.k++;
    var lo = s.k * K.st + K.uw;
    if (u < lo) {                                                            // the nose meets the wall of the gap: it pushes the wheel on
      s.dp = o.reach(K.RV, K.LP, K.R - K.D);
      s.pv = ap - s.dp - lo;
      u = lo;
    }
    var hi = ap - s.pv - o.reach(K.RV, K.LP, K.R), lw = Math.min(lo, hi);   // the nose sits where u = ap - pv - reach(rim at u); bisect, since the flanks are steep
    var ra = ap - s.pv - o.reach(K.RV, K.LP, K.R - K.D);
    if (u > lo) { var a0 = Math.max(lo, Math.min(hi, ra)), a1 = Math.max(lo, Math.max(hi, ra)); for (i = 0; i < 40; i++) { var mid = (a0 + a1) / 2; if (mid - (ap - s.pv - o.reach(K.RV, K.LP, o.rimAt(mid))) > 0) a1 = mid; else a0 = mid; } u = Math.max(lo, (a0 + a1) / 2); s.dp = o.reach(K.RV, K.LP, o.rimAt(u)); }
    s.rn = o.rimAt(u);
    s.phi = m * s.pv;
  },
  aim: function (m) {                                                        // direction the click points, for mode m, at the present state
    var K = this.K, s = this.o, a = K.A0 + s.psi, an = a - m * s.dp, px = K.RV * Math.cos(a), py = K.RV * Math.sin(a);
    return Math.atan2(s.rn * Math.sin(an) - py, s.rn * Math.cos(an) - px);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    this.init();
    var K = this.K, o = this.o;
    // Layers along z: plate face -30; cog and pawl -18..-2 (pawl boss -18..-2); lever -2..6; rod eyes 6..12; crank disc -4..4.
    o.wheel = new T.Group(); o.wheel.position.z = -10; scene.add(o.wheel);
    o.cog = P.cogWheel({ teeth: K.N, radius: K.R, depth: K.D, tip: K.TIP, flank: K.FL, width: 16, material: c.mat("cog") });
    o.wheel.add(o.cog);                                                      // z -18..-2
    P.at(P.cylZ(10, 39, c.mat("cog")), 0, 0, -.5, o.wheel);                  // shaft z -30..9, from the plate face to inside the collar
    P.at(P.cylZ(15, 4, c.mat("cog", "dark")), 0, 0, 18, o.wheel);           // collar z 6..10, on the lever's front face
    var mg = new T.Group(); mg.rotation.z = Math.PI + .5 * K.st; o.wheel.add(mg);
    P.at(P.box(22, 5, 1, c.mat("cog", "mark")), K.R - K.D - 12, 0, 8.5, mg);   // red mark r 100..122, z -2..-1 lifted off the cog's front face at -2

    // elbow lever, loose on the shaft
    o.disc = new T.Group(); scene.add(o.disc);
    var sh = new T.Shape(), px0 = K.px0, py0 = K.py0, RV = K.RV;
    sh.moveTo(-46, 0); sh.lineTo(-26, RV); sh.absarc(0, RV, 26, Math.PI, 0, true); sh.lineTo(40, 70);
    sh.quadraticCurveTo(44, 40, 80, 34); sh.lineTo(px0, py0 + 28);
    sh.absarc(px0, py0, 28, Math.PI / 2, -Math.PI / 2, true); sh.lineTo(10, -46); sh.absarc(0, 0, 46, -Math.PI / 2, -Math.PI, true);
    var lg = new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false, curveSegments: 16 }); lg.translate(0, 0, -4);
    var lv = new T.Mesh(lg, c.mat("lever")); lv.position.z = 2; o.disc.add(lv);   // lever z -2..6
    P.at(P.box(30, 5, 1, c.mat("lever", "dark")), 0, RV - 40, 6.5, o.disc);    // dark stripe z 6..7 on the lever's front face
    P.at(P.cylZ(4, 23, c.mat("lever")), RV * Math.cos(K.A0), RV * Math.sin(K.A0), -5.5, o.disc);   // pawl pin z -17..6, from inside the boss to the lever front
    P.at(P.cylZ(6, 2, c.mat("lever", "dark")), RV * Math.cos(K.A0), RV * Math.sin(K.A0), 7, o.disc);   // pin head z 6..8
    P.at(P.cylZ(4, 11, c.mat("lever")), K.px0, K.py0, 10.5, o.disc);       // rod pin z 5..16, through the eye (6..12)
    P.at(P.cylZ(6, 2, c.mat("lever", "dark")), K.px0, K.py0, 14, o.disc);   // pin head z 13..15

    // pawl
    o.cg = new T.Group(); scene.add(o.cg);
    o.pawl = P.pawl({ length: K.LP, thick: 7, width: 14, side: 1, material: c.mat("click") });
    o.cg.add(o.pawl);                                                        // body z -17..-3, boss -18..-2
    o.cg.position.z = -10;

    // crank and rod
    o.crank = new T.Group(); o.crank.position.set(K.cx, K.cy, 0); scene.add(o.crank);
    var mr = c.mat("rod");
    P.at(P.cylZ(46, 8, mr), 0, 0, 0, o.crank);                              // disc z -4..4
    P.at(P.cylZ(6, 26, mr), 0, 0, -17, o.crank);                             // shaft z -30..-4, plate face to disc back
    P.at(P.box(24, 4, 1, c.mat("rod", "dark")), -26, 0, 5, o.crank);        // dark stripe z 4.5..5.5, opposite the pin
    P.at(P.cylZ(4, 10, mr), K.rho, 0, 9, o.crank);                           // crank pin z 4..14, through the eye (6..12)
    P.at(P.cylZ(6, 2, c.mat("rod", "dark")), K.rho, 0, 14, o.crank);        // pin head z 13..15
    o.rod = P.rod(3, mr); scene.add(o.rod);                                   // rod z 4..10
    o.eyeTop = P.at(P.cylZ(8, 6, mr), 0, 0, 9, scene);
    o.eyeBot = P.at(P.cylZ(8, 6, mr), 0, 0, 9, scene);

    // supports
    P.at(P.box(520, 480, 10, c.fixed), 0, 90, -35, scene);                   // plate x -260..260, y -150..330, z -40..-30
    P.at(P.box(560, 12, 130, c.fixed), 0, -156, -35, scene);                 // base x -280..280, y -162..-150, z -100..30; plate stands on y -150
    this.place();
  },

  place: function () {
    var K = this.K, o = this.o;
    o.wheel.rotation.z = o.phi;
    o.disc.rotation.z = o.psi;
    var a = K.A0 + o.psi, px = K.RV * Math.cos(a), py = K.RV * Math.sin(a);
    o.cg.position.set(px, py, -10);
    var th, fl;
    if (o.flip < 0) { th = this.aim(o.m); fl = o.m > 0 ? 0 : Math.PI; }
    else {                                                                   // thrown over: swing up and round the outside while turning over
      var e = o.flip * o.flip * (3 - 2 * o.flip); th = o.from + (o.to - o.from) * e; fl = o.fromFlip + (o.toFlip - o.fromFlip) * e;
    }
    o.cg.rotation.z = th; o.pawl.rotation.x = fl;
    o.crank.rotation.z = o.g;
    var ax = K.RP * Math.cos(K.AP + o.psi), ay = K.RP * Math.sin(K.AP + o.psi);
    o.rod.span(o.kx, o.ky, 9, ax, ay, 9);
    o.eyeTop.position.set(o.kx, o.ky, 9); o.eyeBot.position.set(ax, ay, 9);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, want = S.controls.dir === "back" ? -1 : 1, i;
    if (o.flip < 0 && want !== o.m) {                                        // start throwing the click over
      var th0 = this.aim(o.m), st = { m: o.m, k: o.k, pv: o.pv, dp: o.dp, rn: o.rn, phi: o.phi };
      this.seat(want);
      var th1 = this.aim(want);
      o.from = th0; o.fromFlip = want < 0 ? 0 : Math.PI; o.toFlip = want < 0 ? Math.PI : 0;
      o.to = want < 0 ? th1 + (th0 > th1 ? 2 * Math.PI : 0) : th1 - (th0 < th1 ? 2 * Math.PI : 0);
      if (want < 0 && o.to < th0) o.to += 2 * Math.PI;
      if (want > 0 && o.to > th0) o.to -= 2 * Math.PI;
      o.flip = 0;
    }
    if (o.flip >= 0) {
      o.flip += dt / 1.1;
      if (o.flip >= 1) o.flip = -1;
    } else {
      var n = Math.max(1, Math.ceil(Math.abs(S.w * dt) / .01));
      for (i = 0; i < n; i++) this.phys(S.w * dt / n);
    }
    this.place();
    var dy = o.ky - (K.cy), tt = Math.round((o.phi - o.phi0) / K.st);
    S.set("rod", (dy >= 0 ? "+" : "−") + Math.abs(Math.round(dy)) + " mm");
    S.set("cog", (tt > 0 ? "+" : tt < 0 ? "−" : "") + Math.abs(tt) + (Math.abs(tt) === 1 ? " tooth" : " teeth"));
  }
});
