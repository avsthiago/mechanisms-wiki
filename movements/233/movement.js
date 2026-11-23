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
  // The pins stand out of the front of the disc; both stops work in the plane of the pins.
  var NP = 14, RPIN = 104, PR = 9, RD = 128, RR = 17.6, ST = 2 * Math.PI / NP;
  function circle(cx, cy, r, n) { var p = []; for (var i = 0; i < n; i++) { var a = 2 * Math.PI * i / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; }
  function pins() { var p = []; for (var i = 0; i < NP; i++) p.push(circle(RPIN * Math.cos(i * ST), RPIN * Math.sin(i * ST), PR, 24)); return p; }
  function arcPts(c, r, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } return p; }
  var LP = [-188, 42], ROLL = [-48.6, 104.7], HP = [232, 70];
  var hookBar = [[62, 55]].concat(arcPts(HP, 16, -90, 90, 12), [[80, 91]]);   // flat underside rests on the pins; the end is cut to meet a pin
  function local(poly, pv) { return poly.map(function (q) { return [q[0] - pv[0], q[1] - pv[1]]; }); }
  function makeSim() {
    var pawls = [
      { key: "roller", pivot: LP, polys: [circle(ROLL[0] - LP[0], ROLL[1] - LP[1], RR, 28)], up: 1, a: 0, low: -.5, L: 153, on: true },
      { key: "hook", pivot: HP, polys: [local(hookBar, HP)], up: -1, a: 0, low: .5, L: 172, on: true }];
    var sim = new Stops(pins(), pawls, RPIN); pawls.forEach(function (pw) { sim.seat(pw); }); return sim;
  }

  M507.define({
    number: 233,
    title: "Stops for a lantern wheel",
    lede: "A lantern wheel has round pins in place of teeth. Here two different stops rest on the pins. One is a firm catch that holds the wheel one way. The other only steadies it.",
    alt: "An upright disc with a ring of round pins standing out of its face turns on a shaft. On the left a lever hinged far out carries a small roller that sits between two pins. On the right a flat bar hinged at its far end rests on the pins, and its cut end presses against one pin. A crank handle on the front turns the wheel.",
    parts: [
      { key: "wheel", color: "#C8873A", name: "Lantern wheel", note: "A disc with a ring of round pins, drawn pale. The pins do the job of teeth." },
      { key: "roller", color: "#D9B13B", name: "Roller lever", note: "A heavy lever with a small wheel on its end. The wheel settles in the dip between two pins. It never locks the wheel, so it never turns red." },
      { key: "hook", color: "#4FA58A", name: "Hooked bar", note: "A flat bar whose end is cut at a slant. A pin that runs into the cut end is stopped dead. It turns red while it holds." },
      { key: "crank", color: "#5E7387", name: "Crank", note: "Stands in for a hand. It turns the wheel one way for a while, then tries to turn it back." }
    ],
    controls: [{ id: "use", label: "Stops resting on the wheel", value: "both", options: [["both", "Both"], ["roller", "Roller lever"], ["hook", "Hooked bar"]] }],
    readouts: [{ id: "hand", label: "Hand tries" }, { id: "gear", label: "Wheel turns" }],
    views: { "3d": [250, 150, 640], front: [25, 10, 680], side: [700, 30, 20] },
    target: [25, 5, 0],
    how: [
      "The crank turns the wheel anticlockwise. The pins at the top slide under the flat bar and lift it, then it drops with a click. The roller rides up over each pin and settles in the next dip. Then the hand tries to turn the wheel back, clockwise. The readouts show a minus sign for clockwise.",
      "Going back, a pin runs into the slanted end of the flat bar. The push is aimed back along the bar and a little down, so the bar is pressed harder onto the pins. It cannot lift, and the wheel stops. The roller is different. A pin meets it on its round side, so a push from either side just rolls it up and over.",
      "So the roller does not lock the wheel. Its weight only keeps the wheel from creeping when nothing pushes it, and lets go to a firm push either way. Try the roller lever alone and watch the wheel go back as easily as forward. Then try the hooked bar alone."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown shows only part of the wheel and the two stops. The upright plate, the hinge pins, the crank and the number of pins were made up. Brown draws the roller lever crossing a pin; here the lever runs just in front of the pins and only its roller reaches down among them. A stop that is switched off is simply taken away.",

    sim: makeSim, _wheel: pins,
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel");
      var o = this.o = { sim: makeSim(), hand: 0, rpm: 0, hold: {} };
      o.gear = new T.Group(); scene.add(o.gear);
      P.at(P.cylZ(RD, 12, mw), 0, 0, -6, o.gear);                                     // disc z -12..0
      for (var i = 0; i < NP; i++) P.at(P.cylZ(PR, 20, c.mat("wheel", "light")), RPIN * Math.cos(i * ST), RPIN * Math.sin(i * ST), 10, o.gear);   // pins z 0..20, on the disc face, pale so they stand out
      P.at(P.cylZ(24, 10, mw), 0, 0, 5, o.gear);                                      // hub z 0..10, on the disc face
      P.at(P.cylZ(10, 1, c.mat("wheel", "dark")), 0, 0, 10.5, o.gear);                // shaft end z 10..11, on the hub face
      P.at(P.cylZ(10, 8, mw), 0, 0, -16, o.gear);                                     // shaft z -20..-12, from the plate face to the disc
      P.at(P.box(64, 6, 1, c.mat("wheel", "dark")), 58, 0, 0.5, o.gear);              // stripe x 26..90, z 0..1, on the disc face between the hub and the pins
      var mk = c.mat("crank");
      P.at(P.box(12, 76, 5.5, mk), 0, -32, 13.25, o.gear);                             // crank arm y -70..6, z 10.5..16, just off the hub face
      P.at(P.cylZ(5, 24, mk), 0, -62, 28, o.gear);                                    // handle z 16..40, on the arm face
      var mr = c.mat("roller"), mh = c.mat("hook");
      o.stops = o.sim.pawls.map(function (pw) {
        var g = new T.Group(); g.position.set(pw.pivot[0], pw.pivot[1], 0); scene.add(g);
        var parts = [];
        if (pw.key === "roller") {
          var rx = ROLL[0] - LP[0], ry = ROLL[1] - LP[1], len = Math.hypot(rx, ry), ang = Math.atan2(ry, rx);
          var bar = new T.Group(); bar.rotation.z = ang; g.add(bar);
          parts.push(P.at(P.box(len, 16, 8, mr), len / 2, 0, 25, bar));                // lever z 21..29, in front of the pin ends (z 20)
          parts.push(P.at(P.cylZ(11, 8, mr), 0, 0, 25, bar));                          // round end at the hinge
          parts.push(P.at(P.cylZ(11, 8, mr), len, 0, 25, bar));                        // round end over the roller
          parts.push(P.at(P.cylZ(RR, 16, mr), rx, ry, 10, g));                          // roller z 2..18, among the pins
          P.at(P.cylZ(4, 18.5, c.mat("roller", "dark")), rx, ry, 11.75, g);            // axle z 2.5..21, inside the roller to the lever's back
          P.at(P.cylZ(7, 41, c.fixed), pw.pivot[0], pw.pivot[1], 0.5, scene);           // stud z -20..21, plate face to the lever's back
          P.at(P.cylZ(5, 2, c.mat("roller", "dark")), 0, 0, 30, g);                     // pin head z 29..31, on the lever face
        } else {
          var sh = new T.Shape(); pw.polys[0].forEach(function (q, i) { if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
          var geo = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false }); geo.translate(0, 0, 2);
          parts.push(new T.Mesh(geo, mh)); g.add(parts[0]);                             // bar z 2..18, among the pins
          P.at(P.cylZ(7, 22, c.fixed), pw.pivot[0], pw.pivot[1], -9, scene);           // stud z -20..2, plate face to the bar's back
          P.at(P.cylZ(5, 2, c.mat("hook", "dark")), 0, 0, 19, g);                       // pin head z 18..20, on the bar face
        }
        return { g: g, parts: parts, pw: pw, base: c.mat(pw.key), red: c.mat(pw.key, "mark") };
      });
      P.at(P.box(480, 310, 10, c.fixed), 25, 0, -25, scene);                         // plate x -215..265, y -155..155, z -30..-20
      P.at(P.box(520, 12, 100, c.fixed), 25, -161, -20, scene);                      // base y -167..-155, z -70..30; plate stands on y -155
      o.sim.settle(2);
    },

    opacity: function (key, S) { var u = S.controls.use; return (key === "roller" || key === "hook") && u !== "both" && u !== key ? 0 : 1; },

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
        s.parts.forEach(function (m) { m.material = o.hold[k] > 0 ? s.red : s.base; });
      });
      function f(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " rpm"; }
      S.set("hand", f(S.playing ? dir * S.rpm : 0));                                 // plus: anticlockwise
      S.set("gear", f(o.rpm));
    }
  });
})();
