(function () {
  // Section across the river; water runs left to right (+x). 1 model unit stands for 1 cm. Angles: th for the upper leaf, positive
  // when its top goes downstream; ph for the lower leaf, negative when its top goes upstream.
  var D = Math.PI / 180, G = 981, TW = 50, NOTCH = 200, THMAX = 24 * D;
  var UP = { x: 1, y: 130, s0: -48, s1: 114, notch: 70 }, LO = { x: -13, y: 50, s0: -48.5, s1: 58 };   // upper y 82..244, lower y 1.5..108; both 14 thick
  function pt(lf, a, dx, s) { return [lf.x + dx * Math.cos(a) + s * Math.sin(a), lf.y - dx * Math.sin(a) + s * Math.cos(a)]; }
  // turning push of the water on one leaf about its pivot (net of the water on each side), per cm of width
  function torque(lf, a, h, notch) {
    var n = 60, t = 0, ds = (lf.s1 - lf.s0) / n, i;
    for (i = 0; i < n; i++) {
      var s = lf.s0 + (i + .5) * ds, y = lf.y + s * Math.cos(a), p = Math.max(h - y, 0) - Math.max(TW - y, 0);
      t += p * s * (notch && s > lf.notch ? .57 : 1) * ds;                       // less leaf across the notch
    }
    return t;
  }
  // The upper leaf's lower upstream corner rests on the lower leaf's downstream face: how far it is past that face.
  function gap(th, ph) { var C = pt(UP, th, -7, UP.s0), F = pt(LO, ph, 7, 0); return (C[0] - F[0]) * Math.cos(ph) - (C[1] - F[1]) * Math.sin(ph); }
  function phiOf(th) {
    if (gap(th, 0) >= 0) return 0;
    var lo = -80 * D, hi = 0, k; for (k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (gap(th, m) < 0) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }
  function push(th, h) {                                                          // the push that opens the pair, the lower leaf's share included
    var ph = phiOf(th), d = 1e-4, dp = (phiOf(th + d) - ph) / d;
    return torque(UP, th, h, true) + torque(LO, ph, h, false) * dp;
  }
  function flows(s) {                                                             // water leaving the pond: notch, over the top, under the lower leaf
    var top = pt(UP, s.th, 7, UP.s1)[1], b = pt(LO, s.ph, 7, LO.s0)[1] - 1.5 + 48.5 * Math.sin(-s.ph) * .6;
    s.qn = s.h > NOTCH ? 1.0 * Math.pow(s.h - NOTCH, 1.5) : 0;
    s.qt = s.h > top ? 2.3 * Math.pow(s.h - top, 1.5) : 0;
    s.gap = Math.max(0, b); s.qg = .011 * s.gap * Math.sqrt(2 * G * s.h);
  }
  function sim(s, h, qin) {
    flows(s);
    s.h += (qin - s.qn - s.qt - s.qg) / 40 * h;                                   // the pond fills or empties
    s.th = Math.max(0, Math.min(THMAX, s.th + push(s.th, s.h) / 60000 * h));      // leaves turn slowly, held by the water round them
    s.ph = phiOf(s.th);
    s.silt = Math.max(0, Math.min(20, s.silt + (s.qg > 5 ? -s.qg * .004 : .25) * h));   // mud settles while shut, is washed out while open
  }

  var def = {
    number: 463,
    title: "Self-acting weir",
    lede: "A dam across a stream made of two hinged boards that open by themselves in a flood. When the water rises too high, they tip over and let it rush out along the bottom, washing away the mud. When it falls again, they close.",
    alt: "Cut-away side view of a stream running left to right. A tall board stands across it on a pin, with a small notch in its top, and a shorter board below and upstream of it on its own pin, their edges overlapping. Deep water stands on the left, shallow water on the right.",
    parts: [
      { key: "upper", color: "#5E7387", name: "Upper board", note: "The big board. Its pin is below its middle, so water high up turns it top downstream. Watch the red pin." },
      { key: "lower", color: "#C8873A", name: "Lower board", note: "The short board at the bottom. Its top edge presses on the upper board and helps hold it shut. When the upper board tips, it pushes this one the other way." },
      { key: "mud", color: "#E8E2D0", name: "Mud", note: "Mud the stream leaves on the bottom while the weir is shut. The rush of water along the bottom carries it away." }
    ],
    controls: [{ type: "range", id: "q", label: "Water in the river", min: 50, max: 600, step: 10, value: 100, unit: "", presets: [[100, "Ordinary"], [450, "Flood"]] }],
    speed: { min: 1, max: 8, value: 4, label: "Time speed", unit: "×" },
    readouts: [{ id: "h", label: "Water" }, { id: "g", label: "Tilt" }, { id: "m", label: "Mud" }],
    views: { "3d": [90, 170, 640], front: [10, 120, 650], side: [640, 150, 40] },
    target: [10, 120, -30],
    distance: [250, 1600],
    how: [
      "In an ordinary stream the two boards stand upright and hold the water back. The water spills out through the notch in the top of the upper board. Mud slowly settles on the bottom in front of the weir.",
      "Each board turns on a pin a little below its middle. Water presses harder the deeper it is, so most of the push is low down, and the upper board stays shut. When the water rises over its top, there is more push above the pin than below. The upper board tips over and shoves the lower one the other way. A gap opens along the bottom, and the water rushes out and scours away the mud. When the water falls, the push low down wins and both close.",
      "Move the water to Flood and watch the level climb until the boards tip. Then go back to Ordinary and watch them close."
    ],
    note: "This model is rebuilt from Brown's description and his two drawings, which show the weir shut and open. The pins, the wall that holds them, the stop pins, the depth of the water below the weir and the mud are made up. The boards are taken as floating just enough that their own weight does not count. Each turn is worked out from the pressure of the water on both faces of both boards. How fast the pond fills is chosen so the change can be watched.",
    kin: { pt: pt, phiOf: phiOf, push: push, UP: UP, LO: LO, sim: sim, THMAX: THMAX },

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, i;
      var s = { h: 215, th: 0, ph: 0, silt: 12, qn: 0, qt: 0, qg: 0, gap: 0 };
      for (i = 0; i < 4000; i++) sim(s, .01, 100);                               // settle at the ordinary level
      s.silt = 12;
      var o = this.o = { s: s, acc: [0, 0, 0] };
      var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .4, depthWrite: false, side: T.DoubleSide });
      // bed y -12..0 and a wall behind (front face z -60) that holds the pins; the leaves are cut away at z = 0 and reach back to z -58
      P.at(P.box(520, 12, 64, c.fixed), 0, -6, -32, scene);                     // x -260..260, z -64..0
      P.at(P.box(120, 262, 4, c.fixed), -10, 131, -62, scene);                  // x -70..50, y 0..262, z -64..-60
      function leaf(lf, key, notch) {
        var g = new T.Group(); g.position.set(lf.x, lf.y, 0); scene.add(g);
        var m = c.mat(key), L = lf.s1 - lf.s0;
        if (notch) {
          P.at(P.box(14, L, 33), 0, 0, 0, g); g.children[0].material = m; g.children[0].position.set(0, (lf.s0 + lf.s1) / 2, -41.5);   // z -58..-25, full height
          P.at(P.box(14, lf.notch - lf.s0, 25, m), 0, (lf.s0 + lf.notch) / 2, -12.5, g);                                                // z -25..0, up to the notch floor
        } else P.at(P.box(14, L, 58, m), 0, (lf.s0 + lf.s1) / 2, -29, g);                                                             // z -58..0
        P.at(P.cylZ(4, 2, c.fixed), 0, 0, -59, g);                               // pin from the wall face (z -60) to the leaf (z -58)
        P.at(P.cylZ(4, .8, c.mat(key, notch ? "mark" : "dark")), 0, 0, .4, g);  // pin end on the cut face, 0.8 proud
        return g;
      }
      o.U = leaf(UP, "upper", true); o.L = leaf(LO, "lower", false);
      // stop pins on the wall, z -60..-50: one upstream of the upper board's top when shut, one downstream of it when fully open
      P.at(P.cylZ(3, 10, c.fixed), -9, 236, -55, scene);
      var sp = pt(UP, THMAX, 10, 100); P.at(P.cylZ(3, 10, c.fixed), sp[0], sp[1], -55, scene);
      o.mud = P.at(P.box(178, 1, 57, c.mat("mud")), -111, 0, -29.5, scene);     // x -200..-22, grows up from the bed top
      o.pond = P.ribbon({ material: wat, depth: 57 }); o.pond.position.z = -29.5; scene.add(o.pond);
      o.tail = P.ribbon({ material: wat, depth: 57 }); o.tail.position.z = -29.5; scene.add(o.tail);
      o.nappe = P.dropPool({ count: 120, radius: 2.2, color: c.spot, opacity: .85, parent: scene });
      o.over = P.dropPool({ count: 160, radius: 2.2, color: c.spot, opacity: .85, parent: scene });
      o.under = P.dropPool({ count: 100, radius: 2.4, color: c.spot, opacity: .85, parent: scene });
    },

    step: function (c, dt, S) {
      var o = this.o, s = o.s, h = S.playing ? dt * S.rpm : 0, n = Math.ceil(h / .01), i, R = Math.random;
      for (i = 0; i < n; i++) sim(s, h / n, S.controls.q);
      o.U.rotation.z = -s.th; o.L.rotation.z = -s.ph;
      var mh = Math.max(.01, s.silt); o.mud.scale.y = mh; o.mud.position.y = .2 + mh / 2;
      // faces of the boards at height y, for the edges of the water
      function faceX(y, dx, side) {
        var best = null;
        [[UP, s.th], [LO, s.ph]].forEach(function (e) {
          var a = pt(e[0], e[1], dx, e[0].s0), b = pt(e[0], e[1], dx, e[0].s1);
          if ((y - a[1]) * (y - b[1]) <= 0 && Math.abs(b[1] - a[1]) > 1e-6) { var x = a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); if (best === null || side * x > side * best) best = x; }
        });
        return best;
      }
      var top = pt(UP, s.th, -7, UP.s1), bot = pt(LO, s.ph, -7, LO.s0), lvl = s.h;
      o.pond.set(function (y) { var x = faceX(y, -7, -1); if (x === null) x = y > 100 ? top[0] : bot[0]; return [-260, y, x - .5, y]; }, s.silt + .5, lvl, 40);
      o.tail.set(function (y) { var x = faceX(y, 7, 1); if (x === null) x = pt(LO, s.ph, 7, LO.s0)[0]; return [x + .5, y, 260, y]; }, .5, TW, 12);
      // falling water: through the notch, over the top, and along the bottom
      var lip = pt(UP, s.th, 7, UP.notch), tp = pt(UP, s.th, 7, UP.s1), gb = pt(LO, s.ph, 7, LO.s0);
      var rt = S.playing ? dt : 0;                                                // drops fly in real time so they can be followed
      o.acc[0] += rt * s.qn * 1.2; o.acc[1] += rt * s.qt * 1.5; o.acc[2] += rt * s.qg * .6;
      while (o.acc[0] >= 1) { o.acc[0]--; o.nappe.emit(lip[0] + 1, lip[1] + R() * Math.max(1, s.h - NOTCH), -2 - 22 * R(), Math.sqrt(2 * G * Math.max(1, s.h - NOTCH)) * (.6 + .2 * R()), 0, 0, G); }
      while (o.acc[1] >= 1) { o.acc[1]--; o.over.emit(tp[0] + 1, tp[1] + 1 + R() * 4, -2 - 54 * R(), Math.sqrt(2 * G * Math.max(1, s.h - tp[1])) * (.6 + .3 * R()), 0, 0, G); }
      while (o.acc[2] >= 1) { o.acc[2]--; o.under.emit(gb[0] + 2, 2 + R() * Math.max(2, s.gap * .5), -2 - 54 * R(), 180 + 120 * R(), 0, 0, 0); }
      var dead = function (q) { return q.y < TW || q.x > 255; };
      o.nappe.step(rt, G, dead); o.over.step(rt, G, dead); o.under.step(rt, 0, function (q) { return q.x > 255; });
      S.set("h", (s.h / 100).toFixed(2) + " m");
      S.set("g", Math.round(s.th / D) + "°");
      S.set("m", Math.round(s.silt) + " cm");
    }
  };
  if (typeof M507 !== "undefined") M507.define(def); else module.exports = def;
})();
