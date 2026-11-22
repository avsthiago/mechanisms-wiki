(function () {
  function clip(poly, sx, cx, s) {            // keep the part of a polygon where height u*sx + v*cx <= s
    var out = [], n = poly.length, i;
    for (i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n], fa = a[0] * sx + a[1] * cx - s, fb = b[0] * sx + b[1] * cx - s;
      if (fa <= 0) out.push(a);
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) { var t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function areaOf(p) { var A = 0, i, n = p.length; for (i = 0; i < n; i++) { var a = p[i], b = p[(i + 1) % n]; A += a[0] * b[1] - b[0] * a[1]; } return Math.abs(A) / 2; }
  function centroid(p) {
    var A = 0, cx = 0, cy = 0, i, n = p.length;
    for (i = 0; i < n; i++) { var a = p[i], b = p[(i + 1) % n], f = a[0] * b[1] - b[0] * a[1]; A += f; cx += (a[0] + b[0]) * f; cy += (a[1] + b[1]) * f; }
    if (Math.abs(A) < 1e-9) return [0, 0]; return [cx / (3 * A), cy / (3 * A)];
  }
  // Water of a given area in one compartment (side +1 right, -1 left) of a trough turned by th (right end down when positive).
  // Returns the polygon (in the trough's own u, v), its real area (never more than the compartment holds) and the most it could hold.
  function pool(side, th, V) {
    var u0 = side > 0 ? DIV : -OUT, u1 = side > 0 ? OUT : -DIV, rect = [[u0, 0], [u1, 0], [u1, HC], [u0, HC]];
    var sx = -Math.sin(th), cx = Math.cos(th), sLip = -(side > 0 ? OUT : -OUT) * Math.sin(th);
    var cap = areaOf(clip(rect, sx, cx, sLip)), v = Math.min(V, cap), lo = -400, hi = 400, k, poly;
    for (k = 0; k < 30; k++) { var mid = (lo + hi) / 2; if (areaOf(clip(rect, sx, cx, mid)) < v) lo = mid; else hi = mid; }
    poly = v > 0.5 ? clip(rect, sx, cx, hi) : [];
    return { poly: poly, A: v, cap: cap };
  }
  var DIV = 1.5, OUT = 120, HC = 44, THM = 0.3, KT = 150000, IN = 800, INERTIA = 9000, DAMP = 9000;
  function physics(o, q, h) {
    var sides = [-1, 1], i, tau = KT * Math.sin(o.th);
    for (i = 0; i < 2; i++) {
      var sd = sides[i], key = sd > 0 ? "VR" : "VL";
      // the stream falls at x = 0; the ridge top is at x = 56 sin th
      var ridge = 58 * Math.sin(o.th), toLeft = Math.max(0, Math.min(1, (ridge - 0) / 6 + 0.5));
      var share = sd < 0 ? toLeft : 1 - toLeft;
      o[key] += IN * q * share * h;
      var pl = pool(sd, o.th, o[key]);
      if (o[key] > pl.A) { var out = (o[key] - pl.A) * Math.min(1, 7 * h); o[key] -= out; o.out += out; o["sp" + key] = out; } else o["sp" + key] = 0;
      pl = pool(sd, o.th, o[key]); o["P" + key] = pl;
      if (pl.poly.length) { var cc = centroid(pl.poly); tau += pl.A * (cc[0] * Math.cos(o.th) + cc[1] * Math.sin(o.th)); }
    }
    o.al = (tau - DAMP * o.om) / INERTIA;
    o.om += o.al * h; o.th += o.om * h;
    var tip = false;
    if (o.th > THM) { o.th = THM; if (o.om > 0) o.om = -o.om * 0.25; if (Math.abs(o.om) < .05) o.om = 0; }
    if (o.th < -THM) { o.th = -THM; if (o.om < 0) o.om = -o.om * 0.25; if (Math.abs(o.om) < .05) o.om = 0; }
    var side = o.th > 0.1 ? 1 : o.th < -0.1 ? -1 : o.side;
    if (side !== o.side) { o.tips++; o.side = side; }
  }

  var GHOST = null;
  M507.define({
  number: 440,
  title: "Rocking trough",
  lede: "A trough split into two halves rocks on a pin like a seesaw. A steady stream of water fills one half until its weight tips the trough over. The water pours out and the other half moves under the stream. The trough keeps rocking by itself, and it can be used to count water.",
  alt: "A long trough divided in the middle, balanced on a pin between two upright posts on a base. Water falls from a chute onto the high half while the low half pours its water out.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Frame", note: "The base and two posts that hold the pin the trough turns on. It does not move." },
    { key: "trough", color: "#C8873A", name: "Trough", note: "Two open boxes joined end to end. It tips one way, then the other, and each half tips its water out when it goes low." },
    { key: "ridge", color: "#C2503F", name: "Ridge", note: "The top edge of the wall between the halves. Watch it swing: the water falls on one side of it or the other." }
  ],
  controls: [{ type: "range", id: "flow", label: "Water poured in", min: 1, max: 4, step: 1, value: 2, unit: "",
    presets: [[1, "A trickle"], [2, "Steady"], [4, "A lot"]] }],
  speed: false,
  readouts: [{ id: "t", label: "Tilt" }, { id: "n", label: "Tips" }, { id: "o", label: "Water out" }],
  views: { "3d": [210, 160, 520], front: [0, 30, 580], side: [580, 40, 30] },
  target: [0, 28, 0],
  distance: [180, 1200],
  how: [
    "Water falls from the chute onto the high half of the trough. The half has a closed end next to the pin, so the water collects there. As it fills, its weight pulls that side down.",
    "When the weight wins, the trough tips over and stops against a block. The full half is now low and its water runs out of the open end. At the same moment the ridge swings across, so the stream falls into the other half, which is now high.",
    "That half fills and tips in turn, and so on. Each tip delivers about the same amount of water, so counting the tips measures the water. Try a trickle, then a lot, and compare how often it tips."
  ],
  note: "This model is rebuilt from Brown's drawing. The base, the posts, the blocks that stop the trough and the chute are made up so it stands up. The front wall of the trough is made see-through so you can watch the water. The trough's weight and the amount of water needed to tip it are chosen so the rocking works. The water level is worked out from how the water settles in the tilted halves.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, sd;
    var o = this.o = { th: -THM, om: 0, VL: 0, VR: 700, out: 0, tips: 0, side: -1, parts: [], next: 0, acc: 0, B: -50 };
    var wm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), side: T.DoubleSide }); o.wm = wm;
    var ghost = new T.MeshLambertMaterial({ color: new T.Color("#C8873A"), transparent: true, opacity: .3, depthWrite: false, side: T.DoubleSide });
    var G = o.G = new T.Group(); scene.add(G);
    var tm = c.mat("trough");
    P.at(P.box(240, 4, 64, tm), 0, -2, 0, G);                         // floor y -4 .. 0, z ±32
    P.at(P.box(240, 48, 3, ghost), 0, 20, 33.5, G);                    // front wall z 32 .. 35 (see-through), y -4 .. 44
    P.at(P.box(240, 48, 3, tm), 0, 20, -33.5, G);                      // back wall z -35 .. -32
    P.at(P.box(3, 52, 64, tm), 0, 26, 0, G);                           // dividing wall y 0 .. 52
    P.at(P.box(7, 6, 70, c.mat("ridge")), 0, 55, 0, G);                // ridge y 52 .. 58, z ±35
    P.at(P.cylZ(5, 3.5, c.mat("frame")), 0, 0, 34.25, G);              // pin stubs z 32.5 .. 36 (wall inner face is z 32)
    P.at(P.cylZ(5, 3.5, c.mat("frame")), 0, 0, -34.25, G);
    // water in each half
    function prism() {
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array(16 * 9), 3));
      var m = new T.Mesh(g, wm); m.frustumCulled = false; m.userData.live = true; G.add(m); return m;
    }
    o.wL = prism(); o.wR = prism();
    // frame: base, two posts with round tops, blocks that stop the trough
    P.at(P.box(250, 8, 100, c.fixed), 0, -54, 0, scene);               // x ±125, y -58 .. -50, z ±50
    var half = new T.Shape(); half.moveTo(-14, 0); half.absarc(0, 0, 14, Math.PI, 0, true); half.lineTo(-14, 0);
    [-1, 1].forEach(function (s) {
      P.at(P.box(28, 50, 6, c.fixed), 0, -25, s * 39, scene);          // post x ±14, y -50 .. 0, z 36 .. 42
      var top = new T.Mesh(new T.ExtrudeGeometry(half, { depth: 6, bevelEnabled: false, curveSegments: 20 }), c.fixed);
      top.position.set(0, 0, s > 0 ? 36 : -42); scene.add(top);        // round top y 0 .. 14
      P.at(P.box(26, 10, 40, c.fixed), s * 113, -45, 0, scene);        // stop blocks x 100 .. 126, y -50 .. -40
    });
    // chute and stream
    var ch = P.box(110, 6, 16, c.fixed); ch.rotation.z = 0.45; P.at(ch, 50, 124, 0, scene);
    o.stream = P.at(P.rod(1, wm), 0, 0, 0, scene);
    var gp = new T.SphereGeometry(1.6, 8, 6);
    for (i = 0; i < 220; i++) { var m = new T.Mesh(gp, wm); m.visible = false; scene.add(m); o.parts.push({ m: m, on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }); }
    o.v3 = new T.Vector3();
  },

  step: function (c, dt, S) {
    var o = this.o, q = +S.controls.flow, i, k;
    if (S.playing && dt > 0) {
      var n = Math.ceil(dt / (1 / 120)), h = dt / n, sp = 0;
      for (k = 0; k < n; k++) { physics(o, q, h); sp += o.spVL + o.spVR; }
      o.acc += sp / 9;
      o.G.rotation.z = -o.th; o.G.updateMatrixWorld(true);
      var cnt = 0;
      while (o.acc >= 1 && cnt < 12) {
        o.acc -= 1; cnt++;
        var sd = (o.spVR >= o.spVL) ? 1 : -1, p = o.parts[o.next]; o.next = (o.next + 1) % o.parts.length;
        o.v3.set(sd * 120, 1, (Math.random() - .5) * 56); o.G.localToWorld(o.v3);
        p.x = o.v3.x; p.y = o.v3.y; p.z = o.v3.z; p.vx = sd * (15 + Math.random() * 30); p.vy = -10 - Math.random() * 15; p.vz = (Math.random() - .5) * 8;
        p.on = true; p.m.visible = true;
      }
      if (o.acc > 12) o.acc = 12;
      for (i = 0; i < o.parts.length; i++) {
        var pp = o.parts[i]; if (!pp.on) continue;
        pp.vy -= 330 * dt; pp.x += pp.vx * dt; pp.y += pp.vy * dt; pp.z += pp.vz * dt;
        if (pp.y < o.B + 1) { pp.on = false; pp.m.visible = false; } else pp.m.position.set(pp.x, pp.y, pp.z);
      }
    }
    o.G.rotation.z = -o.th;
    [[o.wL, o.PVL], [o.wR, o.PVR]].forEach(function (e) {
      var m = e[0], pl = e[1], pts = pl ? pl.poly : [], np = pts.length, a = m.geometry.attributes.position.array, t = 0, j, z = 31.4;
      function tri(p1, p2, p3) { [p1, p2, p3].forEach(function (p) { a[t++] = p[0]; a[t++] = p[1]; a[t++] = p[2]; }); }
      for (j = 0; j < np; j++) {
        var A = pts[j], B = pts[(j + 1) % np];
        if (j >= 1 && j < np - 1) { tri([pts[0][0], pts[0][1], z], [A[0], A[1], z], [B[0], B[1], z]); tri([pts[0][0], pts[0][1], -z], [B[0], B[1], -z], [A[0], A[1], -z]); }
        tri([A[0], A[1], z], [A[0], A[1], -z], [B[0], B[1], -z]); tri([A[0], A[1], z], [B[0], B[1], -z], [B[0], B[1], z]);
      }
      m.geometry.setDrawRange(0, t / 3); m.geometry.attributes.position.needsUpdate = true; m.geometry.computeVertexNormals();
    });
    o.stream.span(0, 98, 0, 0, 28, 0); var rr = 0.8 + 0.25 * q; o.stream.scale.x = rr; o.stream.scale.z = rr;
    var deg = Math.round(o.th * 180 / Math.PI);
    S.set("t", (deg > 0 ? "+" : deg < 0 ? "\u2212" : "") + Math.abs(deg) + "\u00B0");
    S.set("n", String(o.tips));
    S.set("o", (o.out / 1000).toFixed(1) + " L");
  }
  });
})();
