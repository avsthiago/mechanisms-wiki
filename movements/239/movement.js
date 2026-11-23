(function () {
  // Flat contact solver for the stops. The wheel turns about the origin; each stop swings about its own pivot and is
  // pressed towards the wheel (by its weight or a spring). Shapes are polygons; "hit" means their outlines cross.
  // A wheel move is allowed only if every stop resting on it can be lifted out of the way at a sensible rate. A stop
  // whose face would have to jump up, or rise much faster than the rim moves, holds the wheel still.
  function Stops(wheel, pawls, R) {
    var K = 4, self = this;
    function box(p) { var b = [1e9, 1e9, -1e9, -1e9]; p.forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); }); return b; }
    function apart(a, b) { return a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]; }
    function orient(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    function inside(x, y, p) {
      for (var i = 0, j = p.length - 1, c = false; i < p.length; j = i++)
        if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
      return c;
    }
    var W = wheel.map(function (p) {
      var e = p.map(function (q, i) { var r = p[(i + 1) % p.length]; return { a: q, b: r, box: box([q, r]) }; });
      return { p: p, box: box(p), e: e };
    });
    function place(pw, a, th) {                    // stop outlines in the wheel's own frame
      var c = Math.cos(a), s = Math.sin(a), C = Math.cos(-th), S = Math.sin(-th);
      return pw.polys.map(function (p) {
        var q = p.map(function (v) {
          var x = pw.pivot[0] + c * v[0] - s * v[1], y = pw.pivot[1] + s * v[0] + c * v[1];
          return [C * x - S * y, S * x + C * y];
        });
        return { p: q, box: box(q) };
      });
    }
    function hit(pw, a, th) {
      var Q = place(pw, a, th), i, j, k, w, q;
      for (i = 0; i < Q.length; i++) for (j = 0; j < W.length; j++) {
        q = Q[i]; w = W[j];
        if (apart(q.box, w.box)) continue;
        for (k = 0; k < w.e.length; k++) {
          var e = w.e[k]; if (apart(q.box, e.box)) continue;
          for (var m = 0; m < q.p.length; m++) {
            var r = q.p[m], t = q.p[(m + 1) % q.p.length];
            if (orient(r, t, e.a) * orient(r, t, e.b) < 0 && orient(e.a, e.b, r) * orient(e.a, e.b, t) < 0) return true;
          }
        }
        if (inside(q.p[0][0], q.p[0][1], w.p) || inside(w.p[0][0], w.p[0][1], q.p)) return true;
      }
      return false;
    }
    this.pawls = pawls; this.th = 0; this.hit = hit;
    // try the wheel at th1: lift each resting stop just clear, or return null if one of them holds it
    function lifts(th1) {
      var d = Math.abs(th1 - self.th), out = [], stop = false;
      self.why = [];
      for (var i = 0; i < pawls.length; i++) {
        var pw = pawls[i], a = pw.a;
        if (pw.on && hit(pw, a, th1)) {
          var lim = K * R * d / pw.L + 1e-6, lo = a, hi = null;
          for (var j = 1; j <= 8 && hi === null; j++) { var t = a + pw.up * lim * j / 8; if (hit(pw, t, th1)) lo = t; else hi = t; }   // smallest lift that clears
          if (hi === null) { stop = true; self.why[i] = true; out.push(a); continue; }
          for (var n = 0; n < 14; n++) { var mid = (lo + hi) / 2; if (hit(pw, mid, th1)) lo = mid; else hi = mid; }
          a = hi;
        }
        out.push(a);
      }
      return stop ? null : out;
    }
    // a stop put back on the wheel: lift it just clear of the teeth it would be inside
    this.seat = function (pw) {
      var a = pw.a; while (hit(pw, a, self.th) && Math.abs(a - pw.a) < 1) a += pw.up * .002;
      pw.a = a;
    };
    // let each stop that is on the wheel fall towards it by at most maxd (a stop that is off is taken away and stays put)
    this.settle = function (maxd) {
      pawls.forEach(function (pw) {
        if (!pw.on) return;
        var a = pw.a, floor = pw.low, gone = 0, h = .004;
        while (gone < maxd && pw.up * (a - floor) > 1e-9) {
          var na = a - pw.up * Math.min(h, pw.up * (a - floor));
          if (hit(pw, na, self.th)) { var lo = a, hi = na; for (var n = 0; n < 14; n++) { var mid = (lo + hi) / 2; if (hit(pw, mid, self.th)) hi = mid; else lo = mid; } a = lo; break; }
          gone += Math.abs(na - a); a = na;
        }
        pw.a = a;
      });
    };
    // turn the wheel by d (radians) in small steps; returns the angle actually turned and sets .held
    this.turn = function (d, maxd) {
      var n = Math.max(1, Math.ceil(Math.abs(d) / .003)), h = d / n, done = 0, k, i;
      self.held = false; self.holders = [];
      for (k = 0; k < n; k++) {
        var r = lifts(self.th + h);
        if (!r) {                                    // a stop holds: creep up to the contact
          var why = self.why;
          var lo = 0, hi = 1, best = null;
          for (i = 0; i < 8; i++) { var mid = (lo + hi) / 2, q = lifts(self.th + h * mid); if (q) { lo = mid; best = q; } else hi = mid; }
          if (best) { self.th += h * lo; done += h * lo; best.forEach(function (a, j) { pawls[j].a = a; }); }
          self.held = true; self.holders = why; self.settle(maxd / n); break;
        }
        self.th += h; done += h;
        r.forEach(function (a, j) { pawls[j].a = a; });
        self.settle(maxd / n);
      }
      return done;
    };
  }
  // @@END STOPS

  // Flat shapes, in model units, with the gear centre at the origin and the stops where Brown drew them.
  var N = 18, MD = 13, RP = N * MD / 2, RA = RP + MD, RF = RP - 1.25 * MD, ST = 2 * Math.PI / N;
  function gearOutline() {                       // the same outline as P.spurGear, tooth 0 on angle 0
    var p = [], i;
    function pt(r, a) { p.push([r * Math.cos(a), r * Math.sin(a)]); }
    for (i = 0; i < N; i++) { var a = i * ST; pt(RF, a - .27 * ST); pt(RA, a - .11 * ST); pt(RA, a + .11 * ST); pt(RF, a + .27 * ST); }
    return p;
  }
  function arcPts(c, r, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } return p; }
  var LP = [-157.5, 61.3], RPV = [216.3, 84.7];
  var leftArm = arcPts(LP, 13, 148, 328, 10).concat([
    [-117, 88], [-72, 114], [-54, 123],      // underside of the arm
    [-47, 118], [-35, 97.3], [-21, 107.8],          // the nose that drops into a gap
    [-10.5, 154],                                     // the end, cut steep
    [-45, 143], [-80.5, 129.5], [-110, 114], [-133, 101.5], [-153, 83]]);
  var rightBar = arcPts(RPV, 13, 73, -107, 10).concat([
    [94.5, 99.75], [73.5, 84], [62.3, 77], [56, 89.25], [55.3, 115.5], [64.75, 130.2]]);
  function spin(poly, deg) { var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return poly.map(function (q) { return [c * q[0] - s * q[1], s * q[0] + c * q[1]]; }); }
  LP = spin([LP], -4)[0]; leftArm = spin(leftArm, -4); RPV = spin([RPV], 4)[0]; rightBar = spin(rightBar, 4);   // both noses sit in gaps at once
  var TH0 = 11 * Math.PI / 180;                   // the gear's starting turn: a tooth at the top, as drawn
  function local(poly, pv) { return poly.map(function (q) { return [q[0] - pv[0], q[1] - pv[1]]; }); }
  function makeSim() {
    var pawls = [
      { key: "pull", pivot: LP, polys: [local(leftArm, LP)], up: 1, a: 0, low: -.5, L: 130, on: true },
      { key: "push", pivot: RPV, polys: [local(rightBar, RPV)], up: -1, a: 0, low: .5, L: 160, on: true }];
    var sim = new Stops([gearOutline()], pawls, RA); sim.th = TH0; pawls.forEach(function (pw) { sim.seat(pw); }); return sim;
  }

  M507.define({
    number: 239,
    title: "Stops for a spur gear",
    lede: "Two swinging bars rest in the teeth of a gear. Each one lets the gear turn one way and stops it going back. They are two ways of building the same kind of catch.",
    alt: "A gear with square teeth turns on a shaft in an upright plate. A curved arm hinged on the left and a straight bar hinged on the right both reach over the top of the gear, and each has a pointed nose that drops into a gap between the teeth. A crank handle on the front turns the gear.",
    parts: [
      { key: "wheel", color: "#C8873A", name: "Gear", note: "An ordinary gear with square teeth. The dark stripe shows how far it has turned." },
      { key: "pull", color: "#D9B13B", name: "Curved arm", note: "Hinged on the left. Its nose hooks into a gap and is pulled when the gear tries to go back. It turns red while it holds." },
      { key: "push", color: "#4FA58A", name: "Straight bar", note: "Hinged on the right. Its nose is pushed back towards the hinge when the gear tries to go back. It turns red while it holds." },
      { key: "crank", color: "#5E7387", name: "Crank", note: "Stands in for a hand. It turns the gear one way for a while, then tries to turn it back." }
    ],
    controls: [{ id: "use", label: "Stops resting on the gear", value: "both", options: [["both", "Both"], ["pull", "Curved arm"], ["push", "Straight bar"]] }],
    readouts: [{ id: "hand", label: "Hand tries" }, { id: "gear", label: "Gear turns" }],
    views: { "3d": [260, 160, 640], front: [30, 30, 700], side: [700, 40, 30] },
    target: [30, 20, 0],
    how: [
      "The crank turns the gear anticlockwise. Each tooth lifts the noses of the two stops as it passes, and they drop into the next gap with a click. Then the hand tries to turn the gear back, clockwise. It stops almost at once. The readouts show a minus sign for clockwise.",
      "The two stops hold in different ways. The curved arm is hinged below and to the left of its nose. When the gear tries to go back, a tooth drags the nose away from the hinge, and that only pulls the nose deeper into the gap. The straight bar is hinged to the right. A tooth shoves its nose straight back towards the hinge, and a bar cannot get shorter, so it jams.",
      "Going anticlockwise is different. A tooth then pushes each nose the other way, and the nose can swing up and over it. Try the curved arm alone, then the straight bar alone. Each one holds the gear by itself."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown shows only the gear and the two stops. The upright plate, the hinge pins, the crank and the number of teeth were made up, and the shapes of the noses were adjusted so that each one sits flat in a gap. A stop that is switched off is simply taken away.",

    sim: makeSim, _wheel: function () { return [gearOutline()]; },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel");
      var o = this.o = { sim: makeSim(), hand: 0, rpm: 0, hold: {} };
      o.gear = new T.Group(); scene.add(o.gear);
      o.gear.add(P.spurGear({ teeth: N, module: MD, width: 16, material: mw }));      // gear z -8..8
      P.at(P.cylZ(30, 6, mw), 0, 0, 11, o.gear);                                      // hub z 8..14, on the gear face
      P.at(P.cylZ(12, 34, mw), 0, 0, -3, o.gear);                                     // shaft z -20..14, from the plate face to the hub face
      P.at(P.box(RF - 36, 6, 1, c.mat("wheel", "dark")), 30 + (RF - 36) / 2, 0, 8.5, o.gear);   // stripe x 30..RF-6, z 8..9, on the gear face
      var mk = c.mat("crank");
      P.at(P.box(12, 76, 6, mk), 0, -32, 17, o.gear);                                 // crank arm y -70..6, z 14..20, on the hub face
      P.at(P.cylZ(5, 26, mk), 0, -62, 33, o.gear);                                    // handle z 20..46, on the arm face
      o.stops = o.sim.pawls.map(function (pw) {
        var g = new T.Group(); g.position.set(pw.pivot[0], pw.pivot[1], 0); scene.add(g);
        var sh = new T.Shape(); pw.polys[0].forEach(function (q, i) { if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
        var geo = new T.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); geo.translate(0, 0, -7);
        var m = new T.Mesh(geo, c.mat(pw.key)); g.add(m);                              // stop z -7..7
        P.at(P.cylZ(6, 2, c.mat(pw.key, "dark")), 0, 0, 8, g);                         // pin head z 7..9, on the stop's face
        P.at(P.cylZ(7, 13, c.fixed), pw.pivot[0], pw.pivot[1], -13.5, scene);          // stud z -20..-7, plate face to the stop's back
        return { g: g, m: m, pw: pw, base: c.mat(pw.key), red: c.mat(pw.key, "mark") };
      });
      P.at(P.box(440, 330, 10, c.fixed), 30, 10, -25, scene);                        // plate x -190..250, y -155..175, z -30..-20
      P.at(P.box(480, 12, 100, c.fixed), 30, -161, -20, scene);                      // base y -167..-155, z -70..30; plate stands on y -155
      o.sim.settle(2);
    },

    opacity: function (key, S) { var u = S.controls.use; return (key === "pull" || key === "push") && u !== "both" && u !== key ? 0 : 1; },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, u = S.controls.use, SPAN = 2.5 * ST;
      sim.pawls.forEach(function (pw) { var on = u === "both" || u === pw.key; if (on && !pw.on) { pw.on = true; sim.seat(pw); } pw.on = on; });
      o.hand += S.w * dt;
      var dir = Math.floor(o.hand / SPAN) % 2 === 0 ? 1 : -1;                         // anticlockwise (the free way) first, then back
      var moved = dt > 0 ? sim.turn(dir * S.w * dt, 6 * dt) : (sim.settle(0), 0);
      if (dt > 0) o.rpm += (moved / dt * 60 / (2 * Math.PI) - o.rpm) * Math.min(1, dt * 12);
      o.gear.rotation.z = sim.th;
      o.stops.forEach(function (s, i) {
        s.g.rotation.z = s.pw.a;
        var k = s.pw.key; o.hold[k] = sim.held && sim.holders[i] ? .25 : Math.max(0, (o.hold[k] || 0) - dt);
        s.m.material = o.hold[k] > 0 ? s.red : s.base;
      });
      function f(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " rpm"; }
      S.set("hand", f(S.playing ? dir * S.rpm : 0));                                 // plus: anticlockwise, the way the stops let it go
      S.set("gear", f(o.rpm));
    }
  });
})();
