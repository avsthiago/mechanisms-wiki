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

  // Flat shapes, in model units, with the wheel centre at the origin and the stops where Brown drew them.
  var N = 26, R = 118, D = 14, ST = 2 * Math.PI / N;
  function wheelOutline() {                      // the same outline as P.ratchet with reverse: steep faces look clockwise
    var p = [], i;
    for (i = 0; i < N; i++) { p.push([R * Math.cos(i * ST), R * Math.sin(i * ST)]); p.push([(R - D) * Math.cos((i + 1) * ST), (R - D) * Math.sin((i + 1) * ST)]); }
    return p;
  }
  function arcPts(c, r, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } return p; }
  var BP = [226, 80], HP = [-137, -4], SP = [0, -131];
  var bar = arcPts(BP, 11, 80, -100, 10).concat([[57.5, 93.8], [65.3, 106.6]]);   // the tip, then the end face, cut along a steep tooth face
  var hook = arcPts(HP, 11, 160, 340, 10).concat([
    [-125.6, -11.6], [-108.75, 42.75], [-88.1, 76.5], [-71.25, 93.4],   // inner edge, facing the wheel
    [-63, 87.75],                                                        // the claw
    [-58.1, 121.5],                                                      // top corner
    [-97.5, 91.5], [-123.75, 42.75], [-144.4, -13.5]]);                 // outer edge
  var block = [[20.4, -108.1], [23.2, -122.8], [24, -134], [10, -146], [-20, -150], [-60, -152], [-66, -144], [-60, -138], [-50, -140], [-30, -136], [-4, -124], [14, -121]];
  var TAIL = [-50, -151];                         // where the spring presses on the sprung stop
  function local(poly, pv) { return poly.map(function (q) { return [q[0] - pv[0], q[1] - pv[1]]; }); }
  function makeSim() {
    var pawls = [
      { key: "bar", pivot: BP, polys: [local(bar, BP)], up: -1, a: 0, low: .5, L: 170, on: true },
      { key: "hook", pivot: HP, polys: [local(hook, HP)], up: 1, a: 0, low: -.5, L: 120, on: true },
      { key: "sprung", pivot: SP, polys: [local(block, SP)], up: -1, a: 0, low: .5, L: 40, on: true }];
    var sim = new Stops([wheelOutline()], pawls, R); sim.th = 4.6 * Math.PI / 180; pawls.forEach(function (pw) { sim.seat(pw); }); return sim;   // a steep face just beside each stop, as drawn
  }

  M507.define({
    number: 240,
    title: "Stops for a ratchet wheel",
    lede: "A wheel with saw-shaped teeth, called a ratchet, can be held by stops of many shapes. Here are three. Each lets the wheel turn one way and catches it at once if it tries to go back.",
    alt: "A ratchet wheel with many saw teeth turns on a shaft in an upright plate. A straight bar hinged on the right rests on the top teeth. A curved hook hinged low on the left reaches up and over the teeth on the left side. Under the wheel a short stop hinged in the middle is pushed up into the teeth by a bent strip of spring steel. A crank handle on the front turns the wheel.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Ratchet wheel", note: "Each tooth has a gentle slope on one side and a steep face on the other. The dark crank on the front stands in for a hand." },
      { key: "bar", color: "#D9B13B", name: "Straight bar", note: "Lies on the top of the wheel and falls into each gap by its own weight. It turns red while it holds." },
      { key: "hook", color: "#4FA58A", name: "Curved hook", note: "Stands up beside the wheel and leans over onto the teeth. Its claw catches a steep face. It turns red while it holds." },
      { key: "sprung", color: "#C8873A", name: "Sprung stop", note: "Sits under the wheel, where its weight would pull it away. A spring pushes it up into the teeth instead. It turns red while it holds." },
      { key: "spring", color: "#8E7AA8", name: "Spring", note: "A bent strip of springy steel, clamped at one end. Its other end presses up on the tail of the sprung stop." }
    ],
    controls: [{ id: "use", label: "Stops resting on the wheel", value: "all", options: [["all", "All three"], ["bar", "Bar"], ["hook", "Hook"], ["sprung", "Sprung"]] }],
    readouts: [{ id: "hand", label: "Hand tries" }, { id: "gear", label: "Wheel turns" }],
    views: { "3d": [250, 130, 640], front: [40, 0, 700], side: [700, 20, 30] },
    target: [40, -10, 0],
    how: [
      "The crank turns the wheel anticlockwise. The gentle slopes slide under each stop and lift it, and it drops into the next gap with a click. Then the hand tries to turn the wheel back, clockwise. A steep face runs into a stop and the wheel halts. The readouts show a minus sign for clockwise.",
      "The three stops are held against the teeth in different ways. The bar on top falls by its own weight. The hook stands beside the wheel and leans onto it. The stop underneath would fall away, so a spring pushes it up. The bar is pushed back towards its hinge when it holds. The hook is pulled away from its hinge instead.",
      "Each one needs its hinge in the right place. The force from the steep face must point at the hinge or press the stop deeper, never lift it out. Try each stop alone and watch it turn red as it catches the wheel."
    ],
    note: "This model is rebuilt from Brown's drawing. The upright plate, the hinge pins, the clamp for the spring, the crank and the number of teeth were made up. A stop that is switched off is simply taken away. In the drawing the spring's clamp looks like a second lever; here it is fixed.",

    sim: makeSim, _wheel: function () { return [wheelOutline()]; },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel");
      var o = this.o = { sim: makeSim(), hand: 0, rpm: 0, hold: {}, T: T, P: P };
      o.gear = new T.Group(); scene.add(o.gear);
      o.gear.add(P.ratchet({ teeth: N, radius: R, depth: D, width: 16, reverse: true, material: mw }));   // wheel z -8..8
      P.at(P.cylZ(30, 6, mw), 0, 0, 11, o.gear);                                      // hub z 8..14, on the wheel face
      P.at(P.cylZ(12, 34, mw), 0, 0, -3, o.gear);                                     // shaft z -20..14, from the plate face to the hub face
      P.at(P.box(R - D - 42, 6, 1, c.mat("wheel", "dark")), 30 + (R - D - 42) / 2, 0, 8.5, o.gear);   // stripe x 30..R-D-12, z 8..9, on the wheel face
      var mk = c.mat("wheel", "dark");
      P.at(P.box(12, 76, 6, mk), 0, -32, 17, o.gear);                                 // crank arm y -70..6, z 14..20, on the hub face
      P.at(P.cylZ(5, 26, mk), 0, -62, 33, o.gear);                                    // handle z 20..46, on the arm face
      o.stops = o.sim.pawls.map(function (pw) {
        var g = new T.Group(); g.position.set(pw.pivot[0], pw.pivot[1], 0); scene.add(g);
        var sh = new T.Shape(); pw.polys[0].forEach(function (q, i) { if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
        var geo = new T.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); geo.translate(0, 0, -7);
        var m = new T.Mesh(geo, c.mat(pw.key)); g.add(m);                              // stop z -7..7
        P.at(P.cylZ(5, 2, c.mat(pw.key, "dark")), 0, 0, 8, g);                         // pin head z 7..9, on the stop's face
        P.at(P.cylZ(6, 13, c.fixed), pw.pivot[0], pw.pivot[1], -13.5, scene);          // stud z -20..-7, plate face to the stop's back
        return { g: g, m: m, pw: pw, base: c.mat(pw.key), red: c.mat(pw.key, "mark") };
      });
      // spring clamp, fixed to the plate, and the spring strip itself (rebuilt as the stop moves)
      var ms = c.mat("spring"), cl = new T.Shape();
      [[30, -180], [70, -176], [72, -190], [20, -198], [-6, -196]].forEach(function (q, i) { if (i) cl.lineTo(q[0], q[1]); else cl.moveTo(q[0], q[1]); });
      var cg = new T.ExtrudeGeometry(cl, { depth: 14, bevelEnabled: false }); cg.translate(0, 0, -7);
      scene.add(new T.Mesh(cg, ms));                                                  // clamp z -7..7
      P.at(P.cylZ(5, 2, c.mat("spring", "dark")), 40, -187, 8, scene);                // screw head z 7..9, on the clamp face
      P.at(P.cylZ(6, 13, c.fixed), 40, -187, -13.5, scene);                           // stud z -20..-7, plate face to the clamp's back
      o.ms = ms;
      P.at(P.box(470, 380, 10, c.fixed), 40, -10, -25, scene);                       // plate x -195..275, y -200..180, z -30..-20
      P.at(P.box(510, 12, 100, c.fixed), 40, -206, -20, scene);                      // base y -212..-200, z -70..30; plate stands on y -200
      o.sim.settle(2);
      this.spring();
    },

    spring: function () {                        // strip from the clamp, round the bend, to the tail of the sprung stop
      var o = this.o, T = o.T, pw = o.sim.pawls[2], c = Math.cos(pw.a), s = Math.sin(pw.a);
      if (o.springA === pw.a) return;
      o.springA = pw.a;
      var tx = TAIL[0] - SP[0], ty = TAIL[1] - SP[1] - 3.5;                           // just under the tail, so the strip's top meets it
      var end = new T.Vector3(SP[0] + c * tx - s * ty, SP[1] + s * tx + c * ty, 0);
      var pts = [end, new T.Vector3(end.x + 25, end.y - 2, 0), new T.Vector3(60, -158, 0), new T.Vector3(112, -158, 0),
        new T.Vector3(126, -172, 0), new T.Vector3(104, -186, 0), new T.Vector3(70, -185, 0)];
      var geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 48, 3.5, 8, false);
      if (o.strip) { o.strip.geometry.dispose(); o.strip.geometry = geo; }
      else { o.strip = new T.Mesh(geo, o.ms); o.strip.userData.live = true; o.strip.scale.z = 3; this.o.gear.parent.add(o.strip); }   // flattened to a strip 21 deep, z -10.5..10.5
    },

    opacity: function (key, S) {
      var u = S.controls.use; if (key === "spring") key = "sprung";
      return (key === "bar" || key === "hook" || key === "sprung") && u !== "all" && u !== key ? 0 : 1;
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, u = S.controls.use, SPAN = 3.5 * ST;
      sim.pawls.forEach(function (pw) { var on = u === "all" || u === pw.key; if (on && !pw.on) { pw.on = true; sim.seat(pw); } pw.on = on; });
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
      this.spring();
      function f(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " rpm"; }
      S.set("hand", f(S.playing ? dir * S.rpm : 0));                                 // plus: anticlockwise, the way the stops let it go
      S.set("gear", f(o.rpm));
    }
  });
})();
