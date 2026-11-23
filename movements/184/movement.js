M507.define({
  number: 184,
  title: "Hand-gear with quadrants, piston at the top",
  lede: "Two handles work the steam valves of a big pumping engine. This is the moment the piston reaches the top of its stroke. Two smooth quadrants now hold both handles up, with steam going in above the piston.",
  alt: "An upright piston rod on the left with two red blocks on it, the upper one just above the upper handle. To its right, two handles on round bosses, one above the other. The upper handle reaches straight left across the rod. Two flat fan-shaped quadrants, one on each shaft, overlap between the bosses and hold each other with small pins. Cranks on the shafts hang valve rods with round weights down to guides near the floor.",
  parts: [
    { key: "piston", color: "#5E7387", name: "Piston rod", note: "Goes up and down with the piston. Watch the two red tappets: the lower one lifts the lower handle near the top, and the upper one pushes the upper handle down near the bottom." },
    { key: "upper", color: "#C8873A", name: "Upper handle and quadrant", note: "The handle, the crank on the right and the quadrant, a flat fan with a smooth curved edge, are all fixed to one shaft. When this handle is up, steam goes in above the piston." },
    { key: "lower", color: "#4FA58A", name: "Lower handle and quadrant", note: "The handle, the crank behind it and the quadrant, a flat fan with a smooth curved edge, are all fixed to one shaft. When this handle is down, steam goes in below the piston." },
    { key: "valve", color: "#D9B13B", name: "Valve rods", note: "Carry the motion down to the valves. Each has a heavy back weight that swings its handle over as soon as the handle is let go." }
  ],
  controls: [],
  speed: { min: 2, max: 12, value: 5, label: "Strokes", unit: " a min" },
  readouts: [{ id: "p", label: "Piston" }, { id: "s", label: "Steam in" }],
  views: { "3d": [500, -10, 1300], front: [15, 20, 1120], side: [1150, 20, 0] },
  target: [15, -50, 0],
  how: [
    "The piston rod moves up and down beside two handles. It carries two red blocks called tappets. Each handle turns a shaft, and a crank on that shaft raises or lowers a valve rod. Each shaft also carries a quadrant, a flat fan with a smooth curved edge.",
    "Here the piston has just reached the top, and both handles are up. The pin of the lower quadrant rests on the curved edge of the upper one, so the lower handle cannot drop. Steam goes in above the piston and it starts down. Near the bottom, the upper tappet pushes the upper handle down and shuts the steam above. Its edge slides away under the pin, the lower handle drops, and steam goes in below.",
    "The edges are curved round each shaft, so pressing on them cannot turn them. That is what makes the lock safe. Set the speed to the lowest and watch each pin slide along the other quadrant's edge and drop off its end."
  ],
  note: "This model is rebuilt from Brown's drawing. The wall, the guides, the back weights and where they hang are made up. The quadrants' sizes and shapes are guesses, and each one carries a small pin that rests on the other. Brown speaks of one tappet. Here the rod has two, one for each handle, so it never has to pass a handle on the way. The valves are not shown, and the piston is moved by steam in a simple way, with no real engine behind it.",

  K: {
    kind: "quadrant", start: 1,
    h: 125, alDeg: 42, rp: 7, Rh: 30, Rs: 14, beta: 37, tilt: 21, TW: [-118, -98], TH: 26, ht: 6,
    A: 240, c: 2.4, G: 14, period: 3.84, gy: -290, pinU: [150, 80], pinL: [-150, -85],
    // layers along z: wall face, lower and upper catch plates, lower crank, lower valve rod eye, lower handle, upper handle and crank, upper valve rod eye
    Z: { wall: -60, pA: [-54, -46], pB: [-42, -34], cL: [-30, -22], eL: -18, hL: 20, hU: 34, eU: 43 },
    rot: function (p, a) { var c = Math.cos(a), s = Math.sin(a); return [c * p[0] - s * p[1], s * p[0] + c * p[1]]; },
    arcPts: function (r, a0, a1, n) { var D = Math.PI / 180, out = [], i; for (i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * D; out.push([r * Math.cos(a), r * Math.sin(a)]); } return out; },
    // the upper arbor is the lower one turned over: mirror top to bottom, then turn by the swing
    flip: function (q) { return this.rot([q[0], -q[1]], this.al); },
    init: function () {
      if (this.ready) return this;
      var self = this, D = Math.PI / 180, h = this.h, rp = this.rp, quad = this.kind === "quadrant";
      this.al = this.alDeg * D; this.U = [0, h]; this.L = [0, -h];
      var nu = quad ? [61.5, 20] : [50, -30];                                       // where the upper nose rests on the lower arc, piston at the bottom
      this.R = Math.hypot(nu[0], nu[1] + h) - rp - 0.5;                                  // radius of the locking arc on each piece
      var cA = Math.atan2(nu[1] + h, nu[0]) / D, a1 = cA - 3 + this.beta;                  // contact angle round the lower shaft; the arc ends here
      this.noseU = [nu[0], nu[1] - h];
      this.noseL = this.rot([nu[0], h - nu[1]], this.al);
      var nA = Math.atan2(this.noseL[1], this.noseL[0]) / D, nR = Math.hypot(this.noseL[0], this.noseL[1]), R = this.R, Rh = this.Rh, polys = [];
      if (!quad) {                                                                       // hooked catch: arm, outer band to the nose, and a pad that carries the arc
        var Ro = nR + 12, Rb = Ro - 42;
        polys.push([].concat(this.arcPts(Rh, cA - 8, cA - 17 + 360, 36), this.arcPts(Ro, cA - 17, nA + 9, 36), this.arcPts(Rb, nA + 9, cA - 8, 36),
          this.arcPts(R, cA - 8, a1, 60), this.arcPts(R - 20, a1, cA - 8, 12)));
        this.hole = null;
      } else {                                                                           // quadrant: a fan with the arc on its edge, and an arm to the nose
        polys.push([].concat(this.arcPts(R, cA - 42, a1, 90), this.arcPts(Rh, a1, cA - 42 + 360, 36)));
        var n = [-Math.sin(nA * D), Math.cos(nA * D)], w = 10;
        polys.push([[w * n[0], w * n[1]], [-w * n[0], -w * n[1]]].concat(this.arcPts(w, nA - 90, nA + 90, 12).map(function (q) { return [q[0] + self.noseL[0], q[1] + self.noseL[1]]; })));
        this.hole = [].concat(this.arcPts(R - 22, cA - 34, a1 - 9, 20), this.arcPts(Rh + 26, a1 - 9, cA - 34, 10));
      }
      this.plateL = polys;
      this.plateU = polys.map(function (p) { return p.map(function (q) { return self.flip(q); }); });
      // handle centre line round the lower shaft, piston at the bottom; the last point is the ball
      var cp = [[-20, -2], [-60, -9], [-110, -14], [-150, -12], [-185, -2], [-207, 10]].map(function (q) { return self.rot(q, self.tilt * D); }), hl = [];
      for (var i = 0; i < cp.length - 1; i++) {
        var p0 = cp[Math.max(0, i - 1)], p1 = cp[i], p2 = cp[i + 1], p3 = cp[Math.min(cp.length - 1, i + 2)];
        for (var k = 0; k < 12; k++) {
          var t = k / 12, t2 = t * t, t3 = t2 * t;
          hl.push([0, 1].map(function (j) { return 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3); }).concat([this.ht]));
        }
      }
      hl.push([cp[cp.length - 1][0], cp[cp.length - 1][1], 10]);
      this.hL = hl;
      var yc = 1e9;                                                                      // lowest point of the lower handle over the tappet; the tappet top sits a little under it
      hl.forEach(function (q) { if (q[0] > self.TW[0] - q[2] && q[0] < self.TW[1] + q[2]) yc = Math.min(yc, self.L[1] + q[1] - q[2]); });
      this.yLT = Math.round(yc + 26);
      this.hU = hl.map(function (q) { var f = self.flip(q); return [f[0], f[1], q[2]]; });
      return this;
    },
    // world position of a point fixed to the upper (up = 1) or lower arbor turned up by u
    pt: function (up, q, u) { var C = up ? this.U : this.L, r = this.rot(q, -u); return [C[0] + r[0], C[1] + r[1]]; },
    // distance from a point to a polygon; negative inside
    pdist: function (p, poly) {
      var inside = false, d = 1e9, i, j;
      for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var a = poly[i], b = poly[j];
        if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
        var ex = b[0] - a[0], ey = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / (ex * ex + ey * ey || 1)));
        d = Math.min(d, Math.hypot(p[0] - a[0] - t * ex, p[1] - a[1] - t * ey));
      }
      return inside ? -d : d;
    },
    // smallest gap between the two pieces: each nose against the other plate, the noses against each other, plates against the other shaft
    gap: function (uU, uL) {
      var self = this, nU = this.pt(1, this.noseU, uU), nL = this.pt(0, this.noseL, uL), g = 1e9;
      var inL = this.rot([nU[0] - this.L[0], nU[1] - this.L[1]], uL), inU = this.rot([nL[0] - this.U[0], nL[1] - this.U[1]], uU);
      var sU = this.rot([this.U[0] - this.L[0], this.U[1] - this.L[1]], uL), sL = this.rot([this.L[0] - this.U[0], this.L[1] - this.U[1]], uU);
      this.plateL.forEach(function (p) { g = Math.min(g, self.pdist(inL, p) - self.rp, self.pdist(sU, p) - self.Rs - 2); });
      this.plateU.forEach(function (p) { g = Math.min(g, self.pdist(inU, p) - self.rp, self.pdist(sL, p) - self.Rs - 2); });
      g = Math.min(g, Math.hypot(nU[0] - nL[0], nU[1] - nL[1]) - 2 * this.rp, Math.hypot(nU[0] - this.L[0], nU[1] - this.L[1]) - this.Rs - this.rp,
        Math.hypot(nL[0] - this.U[0], nL[1] - this.U[1]) - this.Rs - this.rp);
      return g;
    },
    // how far a handle cuts into its tappet (0 when clear). Lower tappet: top at p + yLT. Upper tappet: bottom at p - yLT.
    cut: function (up, u, p) {
      var pts = up ? this.hU : this.hL, x0 = this.TW[0], x1 = this.TW[1], y0, y1, m = 0, i;
      if (up) { y0 = p - this.yLT; y1 = y0 + this.TH; } else { y1 = p + this.yLT; y0 = y1 - this.TH; }
      for (i = 0; i < pts.length; i++) {
        var w = this.pt(up, pts[i], u), dx = Math.max(x0 - w[0], 0, w[0] - x1), dy = Math.max(y0 - w[1], 0, w[1] - y1);
        m = Math.max(m, pts[i][2] - Math.hypot(dx, dy));
      }
      return m;
    },
    // a move from u0 to u, stopped by the tappet or the other piece. Pushed by the tappet, it may slide along the other piece.
    limit: function (up, st, u0, u, h) {
      var K = this, sg = up ? -1 : 1, w = up ? "wU" : "wL", other = up ? st.uL : st.uU, forced = false;
      function gap(x) { return up ? K.gap(x, other) : K.gap(other, x); }
      if (this.cut(up, u, st.p) > 0) {
        var far = u + sg * 0.02; while (this.cut(up, far, st.p) > 0 && Math.abs(far - u) < 1) far += sg * 0.02;
        u = this.bis(function (x) { return K.cut(up, x, st.p) > 0; }, far, u); st[w] = 0; forced = true;
      }
      var g0 = Math.min(0, gap(u0));
      if (forced) g0 = Math.min(g0, -0.3);
      if (gap(u) < g0 && forced) {                                                       // the tappet wins: this piece pushes the other one back against its weight
        var ok = up ? "uL" : "uU", back = up ? 1 : -1, o0 = st[ok], gp = function (y) { return up ? K.gap(u, y) : K.gap(y, u); };
        var o1 = this.bis(function (y) { return gp(y) < g0; }, o0 + back * 0.5, o0);
        if (gp(o1) >= g0) { st[ok] = o1; st[up ? "wL" : "wU"] = 0; }
      }
      if (gap(u) < g0) { u = this.bis(function (x) { return gap(x) < g0; }, u0, u); st[w] = 0; }
      return u;
    },
    bis: function (f, ok, bad) { for (var i = 0; i < 24; i++) { var m = (ok + bad) / 2; if (f(m)) bad = m; else ok = m; } return ok; },
    state: function () {
      var up = this.start === 1;
      return { p: up ? 62 : -62, v: 0, uU: up ? this.al : 0, uL: up ? this.al : 0, wU: 0, wL: 0 };
    },
    valves: function (st) {
      function cl(x) { return Math.max(0, Math.min(1, x)); }
      return { L: cl((this.al + 0.03 - st.uL) / 0.15), U: cl((st.uU + 0.03) / 0.15) };
    },
    sim: function (st, dt) { var n = Math.ceil(dt * 240), i; for (i = 0; i < n; i++) this.sub(st, dt / n); },
    sub: function (st, h) {
      var K = this, f = this.valves(st), u0, u;
      st.v += (this.A * (f.L - f.U) - this.c * st.v) * h; st.p += st.v * h;
      // lower arbor: its weight pulls it down onto its stop; the tappet lifts it; the upper piece may block it
      u0 = st.uL; st.wL -= this.G * h; u = u0 + st.wL * h;
      if (u < 0) { u = 0; st.wL = 0; }
      st.uL = this.limit(0, st, u0, u, h);
      // upper arbor: its weight pulls it up onto its stop; the tappet pushes it down
      u0 = st.uU; st.wU += this.G * h; u = u0 + st.wU * h;
      if (u > this.al) { u = this.al; st.wU = 0; }
      u = this.limit(1, st, u0, u, h);
      st.uU = u;
    }
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K.init();
    var o = this.o = { st: K.state(), T: T };
    function shape(pts) { var sh = new T.Shape(); pts.forEach(function (q, i) { if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); }); sh.closePath(); return sh; }
    function plate(pts, z0, z1, m, hole) {
      var sh = shape(pts);
      if (hole) { var hp = new T.Path(); hole.forEach(function (q, i) { if (i) hp.lineTo(q[0], q[1]); else hp.moveTo(q[0], q[1]); }); hp.closePath(); sh.holes.push(hp); }
      var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return P.mesh(g, m);
    }
    function arm(a, b, wa, wb, z0, z1, m) {                                              // tapered flat arm from a to b
      var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), n = [-dy / l, dx / l];
      return plate([[a[0] + n[0] * wa, a[1] + n[1] * wa], [b[0] + n[0] * wb, b[1] + n[1] * wb], [b[0] - n[0] * wb, b[1] - n[1] * wb], [a[0] - n[0] * wa, a[1] - n[1] * wa]], z0, z1, m);
    }
    function tube(pts, r, z, m) {
      var cv = new T.CatmullRomCurve3(pts.map(function (q) { return new T.Vector3(q[0], q[1], z); }));
      return P.mesh(new T.TubeGeometry(cv, 90, r, 12, false), m);
    }
    function cz(r, z0, z1, m, x, y, g) { return P.at(P.cylZ(r, z1 - z0, m), x || 0, y || 0, (z0 + z1) / 2, g); }
    var Z = K.Z;
    // the two handles, each fixed on its own shaft with its catch and crank. Local frame: the piston-at-the-bottom position.
    [0, 1].forEach(function (up) {
      var g = new T.Group(), key = up ? "upper" : "lower", m = c.mat(key), C = up ? K.U : K.L, zh = up ? Z.hU : Z.hL;
      g.position.set(C[0], C[1], 0); scene.add(g);
      cz(K.Rs, Z.wall, zh - 6, m, 0, 0, g);                                               // shaft from the wall face (z -60) to the boss
      cz(30, zh - 6, zh + 6, m, 0, 0, g);                                                 // boss round the shaft
      cz(K.Rs, zh + 6, zh + 7, c.mat(key, "dark"), 0, 0, g);                              // shaft end, shaded as in the drawing
      var hp = (up ? K.hU : K.hL).filter(function (q, i, a) { return i < a.length - 1; });
      g.add(tube(hp, K.ht, zh, m));                                                       // handle
      var tip = (up ? K.hU : K.hL)[K.hL.length - 1];
      P.at(P.sphere(10, m), tip[0], tip[1], zh, g);                                       // ball on the end
      var zp = up ? Z.pB : Z.pA;                                                          // this piece's catch plate
      (up ? K.plateU : K.plateL).forEach(function (pts, i) {
        g.add(plate(pts, zp[0], zp[1], m, i === 0 && K.hole ? (up ? K.hole.map(function (q) { return K.flip(q); }) : K.hole) : null));
      });
      var nose = up ? K.noseU : K.noseL;
      cz(K.rp - 0.6, Z.pA[0] - 1, Z.pB[1] + 1, c.mat(key, "dark"), nose[0], nose[1], g);   // nose pin through both plate layers, standing 1 proud of each (z -55..-33)
      // crank to the valve rod
      var pin = up ? K.pinU : K.pinL, zc = up ? [zh - 5, zh + 5] : Z.cL;
      if (!up) cz(24, zc[0], zc[1], m, 0, 0, g);                                          // boss on the shaft, behind the piston rod
      g.add(arm([0, 0], pin, 20, 11, zc[0], zc[1], m));
      cz(12, zc[0], zc[1], m, pin[0], pin[1], g);
      cz(4, zc[0] - 1, up ? Z.eU + 4 : Z.eL + 4, c.mat(key, "dark"), pin[0], pin[1], g);  // crank pin through the rod eye, 1 proud at both ends
      o[up ? "up" : "lo"] = g;
    });
    // piston rod with its two tappets (red)
    o.pr = new T.Group(); scene.add(o.pr);
    var x0 = K.TW[0], x1 = K.TW[1];
    P.at(P.box(32, 760, 28, c.mat("piston")), -108, -20, -2, o.pr);                     // rod x -124..-92, y -400..360 (moves), z -16..12
    P.at(P.box(x1 - x0, K.TH, Z.hL + 8 - 12, c.mat("piston", "mark")), (x0 + x1) / 2, K.yLT - K.TH / 2, (12 + Z.hL + 8) / 2, o.pr);    // lower tappet, z 12..28
    P.at(P.box(x1 - x0, K.TH, Z.hU + 8 - 12, c.mat("piston", "mark")), (x0 + x1) / 2, -K.yLT + K.TH / 2, (12 + Z.hU + 8) / 2, o.pr);  // upper tappet, z 12..42
    // valve rods with their back weights; each weight lands on its guide at the end of its swing
    o.vr = [];
    [[1, K.pinU, K.al, Z.eU], [0, K.pinL, 0, Z.eL]].forEach(function (d) {
      var up = d[0], lo = K.pt(up, d[1], d[2]), hi = K.pt(up, d[1], up ? -0.07 : K.al + 0.07), gx = (lo[0] + hi[0]) / 2, gy = K.gy, z = d[3];
      var dir = [gx - lo[0], gy - lo[1]], l = Math.hypot(dir[0], dir[1]);
      var sW = (lo[1] - (gy + 10 + 25)) / (-dir[1] / l);                                 // weight bottom (centre - 25) on the guide top (gy + 10)
      var Lr = hi[1] - gy + 40;
      var r = { up: up, pin: d[1], gx: gx, z: z, sW: sW, Lr: Lr, rod: P.rod(4, c.mat("valve")), w: P.cylY(16, 50, c.mat("valve")), eye: P.cylZ(9, 6, c.mat("valve")) };
      scene.add(r.rod); scene.add(r.w); scene.add(r.eye);
      P.at(P.guideBlock({ w: 24, h: 20, d: 20, hole: 6.5, material: c.fixed }), gx, gy, z, scene);   // guide y gy-10..gy+10, z z-10..z+10
      var zb = z - 10; P.at(P.box(20, 20, zb - Z.wall, c.fixed), gx, gy, (zb + Z.wall) / 2, scene);  // bracket from the wall face (z -60) to the guide back
      o.vr.push(r);
    });
    // wall, base and the two guides of the piston rod
    P.at(P.box(450, 770, 10, c.fixed), 15, -85, Z.wall - 5, scene);                     // wall x -210..240, y -470..300, z -70..-60
    P.at(P.box(470, 12, 150, c.fixed), 15, -476, -5, scene);                             // base y -482..-470 under the wall, z -80..70
    [-300, 262].forEach(function (y) {                                              // guides y -300..-276 and 262..286, clear of the tappets (-255..255)
      var yc = y + 12;
      P.at(P.box(10, 24, 49, c.fixed), -129.5, yc, -2, scene);                           // cheek x -134.5..-124.5, z -26.5..22.5, 0.5 clear of the rod
      P.at(P.box(10, 24, 49, c.fixed), -86.5, yc, -2, scene);                            // cheek x -91.5..-81.5
      P.at(P.box(33, 24, 10, c.fixed), -108, yc, 17.5, scene);                           // front bar z 12.5..22.5, between the cheeks
      P.at(P.box(33, 24, 10, c.fixed), -108, yc, -21.5, scene);                          // back bar z -26.5..-16.5
      P.at(P.box(53, 24, 33.5, c.fixed), -108, yc, -43.25, scene);                       // bracket z -60..-26.5 to the wall
    });
    this.pose();
  },

  pose: function () {
    var o = this.o, K = this.K, st = o.st, T = o.T;
    o.lo.rotation.z = -st.uL; o.up.rotation.z = -st.uU; o.pr.position.y = st.p;
    o.vr.forEach(function (r) {
      var p = K.pt(r.up, r.pin, r.up ? st.uU : st.uL), dx = r.gx - p[0], dy = K.gy - p[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
      r.rod.span(p[0], p[1], r.z, p[0] + ux * r.Lr, p[1] + uy * r.Lr, r.z);
      r.eye.position.set(p[0], p[1], r.z);
      r.w.position.set(p[0] + ux * r.sW, p[1] + uy * r.sW, r.z);
      r.w.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(-ux, -uy, 0));
    });
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, st = o.st;
    if (S.playing && dt > 0) K.sim(st, Math.min(dt, 0.1) * S.rpm * K.period / 60);
    this.pose();
    var f = K.valves(st);
    S.set("p", st.v > 8 ? "Rising" : st.v < -8 ? "Falling" : st.p > 0 ? "At top" : "At bottom");
    S.set("s", f.L > 0.5 && f.U < 0.5 ? "Below" : f.U > 0.5 && f.L < 0.5 ? "Above" : f.L > 0.5 ? "Both" : "Shut");
  }
});
