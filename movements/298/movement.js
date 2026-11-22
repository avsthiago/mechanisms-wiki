(function () {
  // Sizes (model units). The rocking rod (the verge) lies along X through the origin. The escape wheel stands in the
  // XY plane just below it and turns anticlockwise, so its top teeth run along the rod towards -x.
  // Each pallet is a flat blade set slantwise on the rod, like one blade of a propeller: a tooth running along the rod
  // wedges the blade sideways, and that turns the rod. The two blades slant opposite ways.
  var RAD = Math.PI / 180, N = 20, RW = 55, DT = 11, F0 = .65, WT = 6, D = 12, XW = -50, YW = -(D + RW), XS = 60, NC = 24, NP = 8, MD = 4;
  var GA = 33 * RAD, U = 1.1, RB = 17.5, TP = 3, SEP = 12.4;               // slant of the blades, reach past the middle, radius about the rod, thickness, spacing
  var ST = 2 * Math.PI / N, RATIO = 3, IW = .02, CW = .02, IVG = .2, IBAL = .07, CV = 2.5, H = .0005;
  var CG = Math.cos(GA), SG = Math.sin(GA), UP = RB / CG;
  var PAL = [{ x: XW + SEP, sg: 1, lo: -UP, hi: U }, { x: XW - SEP, sg: -1, lo: -U, hi: UP }];

  // gap(): least distance from the front edge of tooth k (its tip and a little way down its steep face, on both sides
  // of the wheel) to the working face of blade j; null when the tooth is nowhere on the blade.
  var TS = [0, 1.5, 3, 4.5, 6], ZS = [-WT / 2, 0, WT / 2];
  function gap(j, k, th, ph) {
    var ang = k * ST + th, c = Math.cos(ang), s = Math.sin(ang), p = PAL[j], cp = Math.cos(ph), sp = Math.sin(ph), best = null;
    if (s < .75) return null;                                        // only teeth near the top
    for (var a = 0; a < TS.length; a++) for (var b = 0; b < ZS.length; b++) {
      var r = RW - TS[a], x = XW + r * c - p.x, y = YW + r * s, z = ZS[b];
      var q = -y * sp + z * cp;                                      // how far the point is to the side of the blade's middle line
      var down = -y * cp - z * sp;                                   // how far along the blade from the rod
      var along = -p.sg * SG * x + CG * q;
      if (down < 0 || y * y + z * z > RB * RB || along < p.lo || along > p.hi) continue;   // each blade is a quarter of a slanted disc about the rod
      var dist = Math.abs(CG * x + p.sg * SG * q) - TP / 2;           // the blade is a slab: inside it this is negative, nearest face wins
      if (best === null || dist < best) best = dist;
    }
    return best;
  }
  function Sim() { this.th = ST / 3; this.w = 0; this.ph = 0; this.W = 0; this.side = -1; this.beats = []; this.t = 0; this.amp = 0; this.maxd = 0; }
  Sim.prototype.step = function (h, tau) {
    var Iv = IVG + RATIO * RATIO * IBAL, w0 = this.W;                 // the rod, plus the balance wheel as felt through the gears
    this.w += (tau - CW * this.w) / IW * h; this.W -= CV * this.W / Iv * h;
    this.th += this.w * h; this.ph += this.W * h; this.t += h;
    for (var it = 0; it < 3; it++) for (var j = 0; j < 2; j++) for (var k = 0; k < N; k++) {
      var C = gap(j, k, this.th, this.ph); if (C === null || C >= 0) continue;
      var e = 1e-6, Ct = gap(j, k, this.th + e, this.ph), Cp = gap(j, k, this.th, this.ph + e);
      if (Ct === null || Cp === null) continue;
      if (it === 2 && -C > this.maxd) this.maxd = -C;
      var gt = (Ct - C) / e, gp = (Cp - C) / e, den = gt * gt / IW + gp * gp / Iv; if (den <= 0) continue;
      var lam = -C / den; this.th += lam * gt / IW; this.ph += lam * gp / Iv;
      var vn = gt * this.w + gp * this.W; if (vn < 0) { var mu = -vn / den; this.w += mu * gt / IW; this.W += mu * gp / Iv; }
      if (j !== this.side) { this.side = j; this.beats.push(this.t); if (this.beats.length > 6) this.beats.shift(); }
    }
    if (w0 * this.W < 0 && Math.abs(this.ph) > .2) this.amp = Math.abs(this.ph);   // the far end of a swing
  };

  M507.define({
    number: 298,
    title: "Old watch escapement",
    lede: "A toothed wheel is driven by the watch's spring. Two slanted blades on a rocking rod let it pass one tooth at a time. Gears join the rod to a big balance wheel, which swings to and fro and slows the whole thing down.",
    alt: "A small upright wheel with saw teeth all round it, low on the left. A thin rod runs across just above its top, with two small slanted blades set on it over the teeth. At its right end the rod carries a gear with teeth on its face. That gear turns a small gear on an upright rod, and a very big flat ring, the balance wheel, sits on top of the upright rod like a table top.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "The watch's spring, not shown, keeps trying to turn it. Its top teeth run along under the rocking rod. Watch the red dot go round in small steps." },
      { key: "verge", color: "#C8873A", name: "Rod, blades and gear", note: "The rod rocks to and fro. Its two blades slant opposite ways, and each tooth has to wedge a blade aside to get past. The gear on the end has its teeth on its face." },
      { key: "balance", color: "#D9B13B", name: "Balance wheel", note: "A big ring on an upright rod with a small gear. The gears make it swing three times as far as the rocking rod. Its weight is what makes each beat take time." }
    ],
    controls: [{ type: "range", id: "tau", label: "Pull of the spring", min: 60, max: 160, step: 10, value: 100, unit: "",
      presets: [[60, "Weak"], [100, "Medium"], [160, "Strong"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [80, 210, 580], front: [0, -20, 600], side: [600, -20, 0] },
    target: [0, -20, 0],
    how: [
      "The spring turns the escape wheel, so the teeth at the top run along under the rod from right to left. A tooth meets the first blade. The blade is slanted, so the tooth wedges it sideways, and that turns the rod. The gears pass the turning on to the big balance wheel.",
      "The blade swings aside until the tooth slips past its edge. The wheel jumps on, but another tooth at once meets the second blade. That blade slants the other way, so now the rod is pushed back. The heavy balance wheel takes a moment to stop, and while it does, the blade even pushes the wheel backwards a little. Then the balance swings the other way. Each push and slip is one beat.",
      "Nothing here sets the pace except the weight of the balance wheel. If the spring pulls harder, the balance is thrown to and fro faster, and the watch runs fast. That is why old watches kept poor time. Try Weak, then Strong, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown gives no description, so the working of the two pallets is a best reading of his picture. They are made here as flat blades set slantwise on the rod. The posts, the base, the tooth counts and the sizes were made up. The bridge that holds the top of the balance in a real watch is left out, and so is the spring that drives the wheel. The rubbing that keeps the swing steady is a simple guess.",

    Sim: Sim, gap: gap,
    K: { N: N, ST: ST, H: H, RW: RW, DT: DT, F0: F0, WT: WT, XW: XW, YW: YW, PAL: PAL, GA: GA, RB: RB, TP: TP, RATIO: RATIO },
    build: function (c) {
      var T = c.THREE, P = c.P, mw = c.mat("wheel"), mv = c.mat("verge"), mb = c.mat("balance"), i;
      var o = this.o = { sim: new Sim() };
      for (i = 0; i < 12000; i++) o.sim.step(H, 100);                                // run 6 seconds so it opens in its steady swing
      var root = new T.Group(); root.position.set(-35, 0, 0); c.scene.add(root);     // the sizes above put the balance staff at x = 60; centre the model
      // escape wheel, z -3..3: saw teeth outside, four windows inside
      o.wheel = new T.Group(); o.wheel.position.set(XW, YW, 0); root.add(o.wheel);
      var sh = new T.Shape();
      for (i = 0; i < N; i++) {
        var a0 = i * ST, a1 = (i + 1) * ST;
        if (i) sh.lineTo((RW - DT) * Math.cos(a0), (RW - DT) * Math.sin(a0)); else sh.moveTo(RW - DT, 0);   // foot of the steep face
        sh.lineTo((RW - DT) * Math.cos(a0 + F0 * ST), (RW - DT) * Math.sin(a0 + F0 * ST));                  // along the bottom of the gap
        sh.lineTo(RW * Math.cos(a1), RW * Math.sin(a1));                                                    // up the back of the next tooth to its tip
      }
      sh.closePath();
      for (i = 0; i < 4; i++) {
        var h0 = i * Math.PI / 2 + .25, h1 = (i + 1) * Math.PI / 2 - .25, hole = new T.Path();
        hole.absarc(0, 0, 36, h0, h1, false); hole.absarc(0, 0, 14, h1, h0, true); hole.closePath(); sh.holes.push(hole);
      }
      var wg = new T.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false }); wg.translate(0, 0, -WT / 2); o.wheel.add(new T.Mesh(wg, mw));
      P.at(P.cylZ(3, 1, c.mat("wheel", "mark")), 40, 0, WT / 2 + .5, o.wheel);       // red dot z 3..4 on the rim
      P.at(P.cylZ(7, 2, c.mat("wheel", "dark")), 0, 0, WT / 2 + 1, o.wheel);         // hub z 3..5 on the face
      P.at(P.cylZ(3, 19, mw), 0, 0, -12.5, o.wheel);                                 // arbor z -22..-3, post face to the wheel's back
      // rocking rod along X with the two slanted blades and the face gear
      o.verge = new T.Group(); root.add(o.verge);
      P.at(P.cylX(2.5, 128, mv), -52, 0, 0, o.verge);                                // rod x -116..12, between the faces of two posts
      P.at(P.cylX(2.5, 11, mv), 27.5, 0, 0, o.verge);                                // rod x 22..33, post face to the back of the face gear
      PAL.forEach(function (p) {
        var g = new T.Group(); g.position.set(p.x, 0, 0); o.verge.add(g);
        g.setRotationFromMatrix(new T.Matrix4().makeBasis(new T.Vector3(CG, 0, p.sg * SG), new T.Vector3(0, 1, 0), new T.Vector3(-p.sg * SG, 0, CG)));
        var bs = new T.Shape(), far = p.lo < -U ? -1 : 1, t1 = Math.asin(U * CG / RB), k;                     // outline: sideways distance, height
        bs.moveTo(-far * U, 3); bs.lineTo(-far * U, -RB * Math.cos(t1));
        for (k = 1; k <= 24; k++) { var t = -t1 + (Math.PI / 2 + t1) * k / 24; bs.lineTo(far * RB * Math.sin(t) / CG, -RB * Math.cos(t)); }   // the round edge, RB from the rod
        bs.lineTo(far * UP, 3); bs.closePath();
        var bg = new T.ExtrudeGeometry(bs, { depth: TP, bevelEnabled: false }); bg.rotateY(-Math.PI / 2); bg.translate(TP / 2, 0, 0);
        g.add(new T.Mesh(bg, mv));                                                   // blade: thickness TP, from 3 above the rod down to the round edge
      });
      var cw = P.crownWheel({ teeth: NC, module: MD, width: 6, material: mv }); cw.rotation.y = Math.PI / 2;
      P.at(cw, XS - NP * MD / 2 - cw.pitchZ, 0, 0, o.verge);                         // disc x 33..39, pitch line at x 44, a pinion radius from the staff
      // balance staff, upright at x = XS, with its pinion and the balance wheel
      o.staff = new T.Group(); o.staff.position.set(XS, 0, 0); root.add(o.staff);
      P.at(P.cylY(3, 220, mb), 0, -18, 0, o.staff);                                  // staff y -128..92, stands on the base
      var pin = P.spurGear({ teeth: NP, module: MD, width: 10, material: mb }); pin.rotation.set(-Math.PI / 2, 0, Math.PI / NP);
      P.at(pin, 0, NC * MD / 2, 0, o.staff);                                         // pinion y 43..53, level with the top of the face gear
      var rs = new T.Shape(), rh = new T.Path(); rs.absarc(0, 0, 176, 0, 2 * Math.PI, false); rh.absarc(0, 0, 162, 0, 2 * Math.PI, true); rs.holes.push(rh);
      var rim = new T.Mesh(new T.ExtrudeGeometry(rs, { depth: 6, bevelEnabled: false, curveSegments: 48 }), mb); rim.rotation.x = -Math.PI / 2;
      P.at(rim, 0, 80, 0, o.staff);                                                  // rim y 80..86
      for (i = 0; i < 3; i++) { var sp = P.at(P.box(157, 4, 9, mb), 0, 83, 0, o.staff); sp.rotation.y = i * 2 * Math.PI / 3 + .4; sp.translateX(85.5); }   // spokes from 7 to 164, y 81..85
      P.at(P.cylY(10, 10, mb), 0, 83, 0, o.staff);                                   // hub y 78..88
      P.at(P.cylY(5, 1, c.mat("balance", "mark")), 169, 86.5, 0, o.staff);           // red dot y 86..87 on the rim
      // stand: base, two posts for the rod, one post behind the wheel for its arbor
      P.at(P.box(220, 12, 90, c.fixed), -26, -134, 0, root);                         // base x -136..84, y -140..-128
      P.at(P.box(10, 136, 16, c.fixed), -121, -60, 0, root);                         // post x -126..-116, y -128..8; the rod ends at its face
      P.at(P.box(10, 136, 16, c.fixed), 17, -60, 0, root);                           // post x 12..22, y -128..8
      P.at(P.box(16, 71, 8, c.fixed), XW, -92.5, -26, root);                         // post z -30..-22, y -128..-57; the wheel's arbor ends at its face
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, tau = S.controls.tau, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0;
      for (var i = 0; i < n; i++) sim.step(H, tau);
      o.wheel.rotation.z = sim.th; o.verge.rotation.x = sim.ph; o.staff.rotation.y = RATIO * sim.ph;
      var b = sim.beats, per = b.length > 2 ? (b[b.length - 1] - b[0]) / (b.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(RATIO * sim.amp * 180 / Math.PI) + "°");
    }
  });
})();
