M507.define({
  number: 163,
  title: "Water-wheel governor with a belt",
  lede: "Two heavy balls spin on an upright shaft. When the shaft speeds up, the balls swing out and slide a belt onto a lower pulley. When it slows, the belt moves to a higher pulley. A drum on the gate shaft is turned one way, left still, or turned the other way, to shut or open the water gate.",
  alt: "An upright spindle with two big round balls on jointed arms, forming a diamond. A sleeve slides on the spindle below them. A collar under the sleeve is joined to a bent lever. The lever's long arm reaches right and holds a rod that ends in a fork on a belt. Three pulleys sit on the spindle below a table. The belt runs from them to a tall drum on a second upright shaft.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Spindle, arms and fixed pulleys", note: "The engine turns the spindle. The arms are hinged to it. The top and bottom pulleys are fixed to it, so they always turn with it." },
    { key: "balls", color: "#8E7AA8", name: "Balls", note: "They are thrown outward as the spindle turns. Watch how far they swing as you change the speed." },
    { key: "lever", color: "#C8873A", name: "Sleeve, collar and bent lever", note: "The sleeve rises as the balls swing out. The collar under it does not turn. It lifts one end of the bent lever, and the other end goes down." },
    { key: "loose", color: "#E8E2D0", name: "Loose pulley", note: "The middle pulley turns freely on the spindle. When the belt is on it, it spins alone and nothing is driven." },
    { key: "belt", color: "#D9B13B", name: "Belt and fork", note: "The belt carries the turning to the gate shaft. The fork, hung from the lever, slides the belt up or down the pulleys." },
    { key: "out", color: "#4FA58A", name: "Gate shaft", note: "A tall drum on an upright shaft. It turns one way, stops, or turns the other way. It would work the water gate." }
  ],
  speed: { min: 50, max: 70, value: 60, label: "Engine speed", unit: " rpm" },
  readouts: [{ id: "ang", label: "Balls out" }, { id: "g", label: "Gate shaft" }],
  views: { "3d": [680, 230, 880], front: [120, -35, 1000], top: [120, 1050, 1] },
  target: [120, -35, 0],
  distance: [500, 2600],
  how: [
    "The balls hang from arms on the spindle. As the spindle turns, the balls are thrown outward. The faster it turns, the further out they swing, and the higher the sleeve slides up the spindle.",
    "A collar under the sleeve lifts one end of a bent lever. The other end drops and pushes the belt down onto the lower pulley. The belt then turns the gate shaft one way. The middle pulley is loose, so the belt on it drives nothing. On the top pulley the belt is crossed, so the gate shaft turns the other way.",
    "A small change in speed is enough, so slide it slowly from low to high. Watch the balls, then the belt, then the gate shaft. A minus sign means the gate shaft turns the other way. Pause to see the balls drop."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the table and frame, the bearings, the stops that limit the arms, the pulley widths and the whole gate shaft were made up. Brown does not draw the far end of the belt, so a drum was added. The belt is drawn crossed when it sits on the top pulley, so that the gate shaft reverses. The weights of the balls and sleeve were chosen so the belt rests on the loose pulley at a middle speed. The gate and its gearing are left out.",

  K: { a: 105, e: 85, dl: .17, off: 11, g: 3968, M: 1.5, YT: 189, PMIN: .28, PMAX: .66, L1: 55, L2: 130, A0: .61, PVX: 60, PHI0: .49, BY: -180, SP: 58, PW: 42, PWL: 70, BASE: -266, BW: 18, BT: 4, R: 36, RD: 46, XD: 290 },

  // Ball arm angle phi from upright. Two balls (mass 1 each), sleeve mass M, arms of length a, ball arm e bent back by dl.
  // Returns the angular acceleration of the arms (Lagrange equation) for spindle speed om and arm speed pd.
  acc: function (phi, pd, om) {
    var K = this.K, psi = phi - K.dl, p = K.a * Math.cos(phi) + K.e * Math.cos(psi), q = K.a * Math.sin(phi) + K.e * Math.sin(psi);
    var xb = K.off + q, I = 2 * (p * p + q * q) + 4 * K.M * K.a * K.a * Math.pow(Math.sin(phi), 2);
    var dI = 8 * K.M * K.a * K.a * Math.sin(phi) * Math.cos(phi);
    var F = 2 * om * om * xb * p - 2 * K.g * q - 2 * K.M * K.g * K.a * Math.sin(phi);
    return (F - .5 * dI * pd * pd - 4 * I * pd) / I;
  },
  // Lever geometry for arm angle phi: sleeve height, collar height, lever angle, rod top and fork height.
  lev: function (phi) {
    var K = this.K, ys = K.YT - 2 * K.a * Math.cos(phi), yc = ys - 18;
    var ys0 = K.YT - 2 * K.a * Math.cos(K.PHI0), pvy = ys0 - 18 - K.L1 * Math.sin(K.A0);
    var al = Math.asin(Math.max(-1, Math.min(1, (yc - pvy) / K.L1))), th = K.A0 - al;
    var px = K.PVX + K.L2 * Math.cos(th), py = pvy + K.L2 * Math.sin(th), xf = K.PVX + K.L2, dx = px - xf;
    var Lr = pvy - 8 - K.BY + 0, yf = py - Math.sqrt(Lr * Lr - dx * dx) - 8;
    return { ys: ys, yc: yc, th: th, px: px, py: py, xf: xf, yf: yf, pvy: pvy, Lr: Lr };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, F = c.fixed, md = c.mat("drive"), mk = c.mat("lever");
    var o = this.o = { th: 0, thL: 0, thG: 0, wL: 0, wG: 0, phi: K.PHI0, pd: 0, s: 0, crossed: false, wb: 0 };
    var L0 = this.lev(K.PHI0); o.Lr = L0.Lr; o.pvy = L0.pvy; o.xf = L0.xf;
    function spin(x, y) { var g = new T.Group(); g.position.set(x, y, 0); scene.add(g); return g; }
    function wheel(key, y, parent, w) {              // spoked pulley turned so its axis is upright
      var p = P.pulley({ radius: K.R, width: w || K.PW, hub: 12, material: c.mat(key) }); p.rotation.x = Math.PI / 2; p.position.y = y; parent.add(p);
      p.spokes[0].material = c.mat(key, "dark"); return p;
    }
    // spindle
    o.sp = spin(0, 0);
    P.at(P.cylY(6, 168, md), 0, -182, 0, o.sp);                                // lower shaft y -266..-98, base top to table underside
    P.at(P.cylY(6, 275, md), 0, 51.5, 0, o.sp);                                // upper shaft y -86..189, table top to the top collar
    P.at(P.box(1.5, 40, 4, c.mat("drive", "dark")), 7.2, -30, 0, o.sp);        // stripe on the shaft, x 6.45..7.95
    P.at(P.cylY(12, 14, md), 0, K.YT, 0, o.sp);                                // top collar y 182..196
    P.at(P.sphere(7, md), 0, 203, 0, o.sp);                                    // finial y 196..210
    wheel("drive", K.BY + K.SP, o.sp); wheel("drive", K.BY - K.SP, o.sp);      // fixed pulleys, centres -122 and -238
    o.lp = spin(0, 0); wheel("loose", K.BY, o.lp, K.PWL);                              // loose pulley, turns on the shaft
    // arms, balls, sleeve (on the spindle, so they turn with it)
    o.sleeve = P.at(P.cylY(12, 22, md), 0, 0, 0, o.sp);
    o.arms = []; o.balls = []; o.links = []; o.barms = []; o.knees = [];
    var pinM = c.mat("drive", "dark");
    [-1, 1].forEach(function (sx) {
      P.at(P.cylZ(3.5, 18, pinM), sx * K.off, K.YT, 3.5, o.sp);                  // hinge on the top collar, z -5.5..12.5
      o.arms.push(P.rod(3, md)); o.links.push(P.rod(2.5, md)); o.barms.push(P.rod(3, md));
      o.balls.push(P.sphere(28, c.mat("balls"))); o.knees.push(P.cylZ(4, 14, pinM)); o.sp.add(o.arms[o.arms.length - 1], o.links[o.links.length - 1], o.barms[o.barms.length - 1], o.balls[o.balls.length - 1], o.knees[o.knees.length - 1]);
    });
    // collar that does not turn, bent lever
    o.collar = P.at(P.cylY(20, 14, mk), 0, 0, 0, scene);
    o.lever = new T.Group(); o.lever.position.set(K.PVX, L0.pvy, 3); scene.add(o.lever);
    P.at(P.cylZ(8, 6, mk), 0, 0, 0, o.lever);                                   // hub z 0..6
    var arm2 = P.box(K.L2, 6, 5, mk); P.at(arm2, K.L2 / 2, 0, 0, o.lever);       // long arm, z .5..5.5
    var a1 = Math.PI - K.A0, arm1 = P.box(K.L1, 6, 5, mk); arm1.rotation.z = a1; P.at(arm1, K.L1 / 2 * Math.cos(a1), K.L1 / 2 * Math.sin(a1), 0, o.lever);
    P.at(P.cylZ(4, 8, mk), K.PVX, L0.pvy, -4, scene);                              // pivot pin z -8..0, ends on the block face z -8
    o.xpin = P.at(P.cylZ(3, 60, mk), 0, 0, 33, scene);                          // cross pin z 3..63
    o.rod = P.rod(3, c.mat("belt")); scene.add(o.rod);
    // belts (open and crossed), built in the XY plane and turned so the pulley axes are upright
    var D = K.XD, r1 = K.R + K.BT / 2 + .5, r2 = K.RD + K.BT / 2 + .5;
    o.bg = new T.Group(); o.bg.rotation.x = Math.PI / 2; scene.add(o.bg);
    o.belts = [false, true].map(function (cr) {
      var b = P.belt({ width: K.BW, thick: K.BT, material: c.mat("belt") }).set(0, 0, r1, D, 0, r2, cr);
      b.mark = P.box(10, K.BT + 1.5, K.BW + 1, c.mat("belt", "dark")); b.add(b.mark); o.bg.add(b);
      var best = -99; for (var i = 0; i < 2000; i++) { var pt = b.pointAt(i * b.length / 2000); if (Math.abs(pt.x - o.xf) < 1.5 && pt.y > best) best = pt.y; }
      b.zrun = best + K.BT / 2 + 1; return b;
    });
    o.r1 = r1;
    // fork: slider on a rail in front of the belt, two pins above and below it
    o.fork = new T.Group(); scene.add(o.fork);
    var mb = c.mat("belt");
    P.at(P.box(30, 16, 14, mb), 0, 0, 63, o.fork);                              // slider x +-15, y +-8, z 56..70, against the rail face z 70
    o.pins = [-1, 1].map(function (s) { var r = P.rod(2.5, mb); o.fork.add(r); r.sg = s; return r; });
    // gate shaft with a tall drum
    o.gate = spin(K.XD, 0);
    P.at(P.cylY(7, 178, c.mat("out")), 0, -177, 0, o.gate);                      // y -266..-88, base top to the bracket underside
    P.at(P.cylY(K.RD, 134, c.mat("out")), 0, K.BY, 0, o.gate);                   // drum y -247..-113
    P.at(P.box(1.5, 134, 8, c.mat("out", "dark")), K.RD + 1.2, K.BY, 0, o.gate);   // stripe on the drum, x 46.45..47.95, lifted off the surface
    // frame
    P.at(P.box(460, 12, 166, F), 120, -272, 7, scene);                          // base x -110..350, y -278..-266, z -76..90
    P.at(P.box(12, 168, 116, F), -104, -182, -18, scene);                       // left side plate x -110..-98, y -266..-98, z -76..40
    P.at(P.box(220, 12, 116, F), 0, -92, -18, scene);                           // table x -110..110, y -98..-86, z -76..40
    P.at(P.box(460, 190, 12, F), 120, -171, -70, scene);                        // back wall x -110..350, y -266..-76, z -76..-64
    P.at(P.box(30, 43, 12, F), 60, -64.5, -14, scene);                          // lever block x 45..75, y -86..-43, z -20..-8, on the table
    P.at(P.box(56, 12, 84, F), 290, -82, -22, scene);                           // bracket x 262..318, y -88..-76, z -64..20, on the wall face
    P.at(P.box(14, 166, 14, F), o.xf, -183, 77, scene);                         // rail x +-7, y -266..-100, z 70..84
    this.place(c, 0);
  },

  // pose everything from the arm angle phi and the belt height
  place: function (c, h) {
    var o = this.o, K = this.K, L = this.lev(o.phi), phi = o.phi, psi = phi - K.dl, sx, i, d;
    o.sp.rotation.y = o.th; o.lp.rotation.y = o.thL; o.gate.rotation.y = o.thG;
    o.sleeve.position.y = L.ys; o.collar.position.y = L.yc;
    [-1, 1].forEach(function (sx, i) {
      var top = [sx * K.off, K.YT, 3.5], kn = [sx * (K.off + K.a * Math.sin(phi)), K.YT - K.a * Math.cos(phi), 3.5];
      var bl = [kn[0] + sx * K.e * Math.sin(psi), kn[1] - K.e * Math.cos(psi), 3.5];
      o.arms[i].span(top[0], top[1], top[2], kn[0], kn[1], kn[2]);
      o.barms[i].span(kn[0], kn[1], kn[2], bl[0], bl[1], bl[2]);
      o.links[i].span(kn[0], kn[1], -3.5, sx * K.off, L.ys, -3.5);
      o.balls[i].position.set(bl[0], bl[1], bl[2]); o.knees[i].position.set(kn[0], kn[1], 0);
    });
    o.lever.rotation.z = L.th;
    o.xpin.position.set(L.px, L.py, 33);
    o.rod.span(L.px, L.py, 63, o.xf, L.yf + 8, 63);
    o.yf = L.yf; o.bg.position.y = L.yf; o.fork.position.set(o.xf, L.yf, 0);
    var b = o.belts[o.crossed ? 1 : 0], zr = b.zrun;
    o.belts[0].visible = !o.crossed; o.belts[1].visible = o.crossed;
    o.pins.forEach(function (r) { r.span(o.xf, L.yf + r.sg * 12, zr, o.xf, L.yf + r.sg * 12, 56); });
    b.place(b.mark, o.s);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, i, n = 16;
    if (S.playing && dt > 0) {
      var h = Math.min(dt, .05) / n;
      for (i = 0; i < n; i++) {
        o.pd += this.acc(o.phi, o.pd, S.w) * h; o.phi += o.pd * h;
        if (o.phi < K.PMIN) { o.phi = K.PMIN; if (o.pd < 0) o.pd = 0; }
        if (o.phi > K.PMAX) { o.phi = K.PMAX; if (o.pd > 0) o.pd = 0; }
      }
      var L = this.lev(o.phi), off = L.yf - K.BY, hh = Math.min(dt, .05);
      if (off > 26) o.crossed = true; else if (off < -26) o.crossed = false;
      function share(cy, w) { return Math.max(0, Math.min(off + K.BW / 2, cy + w / 2) - Math.max(off - K.BW / 2, cy - w / 2)) / K.BW; }
      var fU = share(K.SP, K.PW), fL = share(-K.SP, K.PW), fM = share(0, K.PWL), fs = Math.min(1, fU + fL), KK = 6, DD = .8;
      var u = S.w * K.R / K.RD * (o.crossed ? -1 : 1);
      o.wG += (KK * fs * (u - o.wG) - DD * (1 - fs) * o.wG) * hh;
      o.wL += (KK * fM * (S.w - o.wL) - DD * (1 - fM) * o.wL) * hh;
      o.th += S.w * dt; o.thL += o.wL * dt; o.thG += o.wG * dt;
      o.s -= (fM * o.wL + (1 - fM) * S.w) * o.r1 * dt;
    }
    this.place(c, 0);
    var r = Math.round(o.wG * 60 / (2 * Math.PI));
    S.set("ang", Math.round(o.phi * 180 / Math.PI) + "°");
    S.set("g", (r < 0 ? "−" + -r : r === 0 ? 0 : r) + " rpm");
  }
});
