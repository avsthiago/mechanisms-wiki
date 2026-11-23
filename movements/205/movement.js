M507.define({
  number: 205,
  title: "Wheel driven by a two-tooth pinion",
  lede: "A wheel has two rings of pegs, one on its front face and one on its back, set in between each other. A shaft below it carries two cams, one in front of the wheel and one behind. Together they work like a gear with only two teeth.",
  alt: "A big upright wheel seen face on, with long pegs standing out of its front face around the rim and a second set of pegs on its back face, placed between them. Below the rim a shaft carries two egg-shaped cams pointing opposite ways, one in front of the wheel and one behind it.",
  parts: [
    { key: "wheel", color: "#C8873A", name: "Wheel", note: "It has a ring of pegs on each face. The back pegs sit halfway between the front ones. Watch the red peg." },
    { key: "front", color: "#5E7387", name: "Front cam", note: "An egg-shaped cam in front of the wheel. Once each turn it pushes one front peg along." },
    { key: "back", color: "#4FA58A", name: "Back cam", note: "The same cam behind the wheel, pointing the other way. It pushes the back pegs, half a turn after the front cam." }
  ],
  readouts: [{ id: "out", label: "Wheel" }, { id: "who", label: "Pushing" }],
  views: { "3d": [310, 125, 595], front: [0, -20, 640], side: [640, -20, 0] },
  target: [0, -20, 0],
  how: [
    "The shaft turns steadily. Its front cam swings up, catches a peg on the front of the wheel and pushes it along. Then the wheel rests for a moment. Half a turn later the back cam comes up behind the wheel and pushes a back peg the same way.",
    "The back pegs sit halfway between the front ones. So each cam only has to push the wheel half the gap between two front pegs. The two cams take turns, like the two teeth of a very small gear. The wheel goes round much more slowly than the shaft.",
    "Watch the Pushing readout. It goes front cam, neither, back cam, neither. Each turn of the shaft moves the wheel on by one front peg. Slow the speed right down and follow the red peg."
  ],
  note: "This model is rebuilt from Brown's drawing. The shape of the cams, the size and number of pegs, the shafts, the plate and the base were made up. The wheel's motion is worked out from the outlines, so a cam only moves the wheel as far as it pushes a peg, and nothing passes through anything.",

  /* Kinematics, worked out once in build (and by the node test). Wheel at the origin, cam shaft at (0, -D). The cams turn
     anticlockwise by psi (front cam lobe along local +X at psi = 0; back cam half a turn round); the wheel turns clockwise
     (its angle th falls). Each cam is an egg: a hub circle r0 round the shaft and an end circle r1 at distance d, joined by
     tangent lines. The pegs are bars across the rim: front ones centred on th + k * 30 deg, back ones half a step on. The
     wheel stands still until a cam would cut into a peg, then turns just far enough to clear. One shaft turn is solved after
     a turn to settle; it moves the wheel exactly one step (30 deg), so the table repeats. Checked in node over four shaft
     turns: no cam cuts into any peg, the wheel never jumps, and it never turns backwards. */
  _kin: function () {
    var TAU = 2 * Math.PI, DEG = Math.PI / 180, D = 127, N = 12, ST = TAU / N, R0 = 10, R1 = 16, DL = 21, PI0 = 80, PI1 = 115, PW = 11, NT = 2880, i;
    var g = Math.acos((R0 - R1) / DL), cam = [];                                 // egg outline, as P.armPlate draws it
    for (i = 0; i <= 40; i++) { var a = g - (2 * g) * i / 40; cam.push([DL + R1 * Math.cos(a), R1 * Math.sin(a)]); }
    for (i = 0; i <= 80; i++) { var b = -g - (TAU - 2 * g) * i / 80; cam.push([R0 * Math.cos(b), R0 * Math.sin(b)]); }
    var cg = Math.cos(g), sg = Math.sin(g), XA = R0 * cg, XB = DL + R1 * cg;
    function inCam(u, v) {                                 // inside the egg: either circle, or the band between the tangent lines
      if (u * u + v * v < R0 * R0 || (u - DL) * (u - DL) + v * v < R1 * R1) return true;
      return u > XA && u < XB && u * cg + Math.abs(v) * sg < R0;
    }
    var camPts = []; for (i = 0; i < cam.length - 1; i++) { var p0 = cam[i], p1 = cam[i + 1], m = Math.max(1, Math.ceil(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / .7)), j; for (j = 0; j < m; j++) camPts.push([p0[0] + (p1[0] - p0[0]) * j / m, p0[1] + (p1[1] - p0[1]) * j / m]); }
    var CM = .25, pegPts = [], x, y, HW = PW / 2 + CM;                       // the solver keeps 0.25 clear, more than its sample spacing can miss
    for (x = PI0 - CM; x <= PI1 + CM; x += .7) pegPts.push([x, -HW], [x, HW]); for (y = -HW; y <= HW; y += .7) pegPts.push([PI1 + CM, y]);
    function cut(th, psi, off) {                           // does a cam (turned psi) cut into a peg of its row (centres th + off + k ST)?
      var cp = Math.cos(psi), sp = Math.sin(psi), k, j;
      for (k = 0; k < N; k++) {
        var a = th + off + k * ST, ca = Math.cos(a), sa = Math.sin(a);
        if (-sa < .88) continue;                           // only pegs within 28 deg of straight down can reach a cam (the rest stay over 45 from the shaft)
        for (j = 0; j < camPts.length; j++) {              // cam points into the peg's frame
          var X = camPts[j][0] * cp - camPts[j][1] * sp, Y = camPts[j][0] * sp + camPts[j][1] * cp - D, u = X * ca + Y * sa, v = -X * sa + Y * ca;
          if (u > PI0 - CM && u < PI1 + CM && Math.abs(v) < PW / 2 + CM) return true;
        }
        for (j = 0; j < pegPts.length; j++) {              // peg points into the cam's frame
          var px = pegPts[j][0] * ca - pegPts[j][1] * sa, py = pegPts[j][0] * sa + pegPts[j][1] * ca + D, U = px * cp + py * sp, V = -px * sp + py * cp;
          if (inCam(U, V)) return true;
        }
      }
      return false;
    }
    function hit(th, psi) { return cut(th, psi, 0) ? 1 : cut(th, psi + Math.PI, ST / 2) ? 2 : 0; }
    var th, it, lo, hi, mm, tab = new Float64Array(NT + 1), who = new Uint8Array(NT + 1);
    function solve(rec) {
      for (i = 0; i <= NT; i++) {
        var psi = i * TAU / NT, h = hit(th, psi);
        if (h) {
          lo = hi = th; for (it = 0; it < 2000 && hit(hi, psi); it++) { lo = hi; hi -= .001; }
          for (it = 0; it < 16; it++) { mm = (lo + hi) / 2; if (hit(mm, psi)) lo = mm; else hi = mm; }
          th = hi;
        }
        if (rec) { tab[i] = th; who[i] = h; }
      }
    }
    th = -90 * DEG - ST / 2 + 1 * DEG; solve(false);                   // settle, then record one shaft turn
    var start = th; solve(true);
    var step = tab[NT] - start;                            // one front peg: -ST, up to the solver's tolerance
    for (i = 0; i <= NT; i++) tab[i] = start + (tab[i] - start) * (-ST / step);
    function thOf(psi) { var u = psi / TAU, n = Math.floor(u), f = (u - n) * NT, k = Math.min(NT - 1, Math.floor(f)); return tab[k] + (tab[k + 1] - tab[k]) * (f - k) - n * ST; }
    function whoOf(psi) { var u = psi / TAU, f = (u - Math.floor(u)) * NT, k = Math.round(f) % NT, j; for (j = 0; j < 8; j++) { if (who[(k + j) % NT]) return who[(k + j) % NT]; } return 0; }
    return { thOf: thOf, whoOf: whoOf, cam: cam, hit: hit, D: D, N: N, ST: ST, PI0: PI0, PI1: PI1, PW: PW, step: step, tab: tab, who: who, NT: NT };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this._kin(), D = K.D, k;
    var o = this.o = { K: K, psi: 90 * Math.PI / 180 };                        // opening: the front cam points up between two front pegs, as drawn
    function plate(pts, z0, z1, mat) {
      var sh = new T.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return new T.Mesh(g, mat);
    }
    // wheel at the origin: disc z -6..6 (radius 100), front pegs z 6..16 and back pegs z -16..-6, radius 80..115 (the outer 15 stand clear of the rim)
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylZ(100, 12, c.mat("wheel")), 0, 0, 0, o.wheel);
    for (k = 0; k < K.N; k++) {
      [[0, 11], [K.ST / 2, -11]].forEach(function (r, j) {
        var a = k * K.ST + r[0], g = new T.Group(); g.rotation.z = a; o.wheel.add(g);
        P.at(P.box(K.PI1 - K.PI0, K.PW, 10, c.mat("wheel", k === 0 && j === 0 ? "mark" : "light")), (K.PI0 + K.PI1) / 2, 0, r[1], g);   // z 6..16 or -16..-6
      });
    }
    P.at(P.cylZ(8, 34, c.mat("wheel")), 0, 0, -23, o.wheel);                // shaft z -40..-6, from the plate face to the disc
    P.at(P.cylZ(24, 4, c.mat("wheel")), 0, 0, 8, o.wheel);                  // hub z 6..10 on the front face
    P.at(P.cylZ(10, 1.5, c.mat("wheel", "dark")), 0, 0, 10.25, o.wheel);    // shaft end z 9.5..11, sunk 0.5 into the hub
    // cam shaft at (0, -D): front cam z 7..15, back cam z -15..-7 (1 clear of the wheel's faces), shaft z -40..19, collar z 15..19
    o.cams = new T.Group(); o.cams.position.y = -D; scene.add(o.cams);
    o.cams.add(plate(K.cam, 7, 15, c.mat("front")));
    var bc = plate(K.cam, -15, -7, c.mat("back")); bc.rotation.z = Math.PI; o.cams.add(bc);
    P.at(P.cylZ(5, 59, c.mat("front")), 0, 0, -10.5, o.cams);                // shaft z -40..19
    P.at(P.cylZ(8, 4, c.mat("front")), 0, 0, 17, o.cams);                    // collar z 15..19 on the front cam
    // supports
    P.at(P.box(300, 330, 10, c.fixed), 0, -20, -45, scene);                 // plate x -150..150, y -185..145, z -50..-40; both shafts end at z -40
    P.at(P.box(340, 12, 110, c.fixed), 0, -191, -40, scene);                // base x -170..170, y -197..-185, z -95..15; plate stands on y -185
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, e = 1e-3;
    o.psi += S.w * dt;
    o.cams.rotation.z = o.psi;
    o.wheel.rotation.z = K.thOf(o.psi);
    var rpm = S.playing ? Math.round(-(K.thOf(o.psi + e) - K.thOf(o.psi - e)) / (2 * e) * S.rpm * 10) / 10 : 0;
    S.set("out", rpm + " rpm");
    var w = K.whoOf(o.psi);
    S.set("who", w === 1 ? "Front cam" : w === 2 ? "Back cam" : "Neither");
  }
});
