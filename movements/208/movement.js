M507.define({
  number: 208,
  title: "Pin wheel with three speeds",
  lede: "A wheel carries three rings of pins. A cage with slots slides along its shaft until it meets one of the rings. Each ring makes the drum turn at a different speed, with no gears to swap.",
  alt: "A big round wheel with three circles of pins standing out of its face. A slotted drum on a horizontal shaft lies across the face at the left edge, with the pins of the outer circle fitting into its slots.",
  parts: [
    { key: "wheel", color: "#E8E2D0", name: "Pin wheel", note: "The big disc. It is turned from outside and carries all the pins." },
    { key: "pins", color: "#5E7387", name: "Pins", note: "Short posts in three circles. They are all the same distance apart. One pin in each circle is red so you can follow it." },
    { key: "pinion", color: "#C8873A", name: "Slotted drum", note: "A cage with slots round its edge. Each pin drops into a slot and pushes the drum round. Watch the red stripe." },
    { key: "shaft", color: "#D9B13B", name: "Shaft", note: "A bar that lies across the wheel. The drum sits on it and slides from one circle of pins to another." }
  ],
  controls: [{ id: "pos", label: "Drum on", value: "outer", options: [["inner", "Inner"], ["middle", "Middle"], ["outer", "Outer"]] }],
  readouts: [{ id: "w", label: "Wheel" }, { id: "p", label: "Drum" }],
  views: { "3d": [420, 280, 880], front: [0, 0, 950], side: [900, 20, 40] },
  target: [0, 0, 40],
  how: [
    "The wheel turns and its pins pass under the drum. Each pin drops into a slot and pushes the drum round by one slot. Then the pin leaves and the next one arrives.",
    "All the pins are the same distance apart. So the drum always moves one slot for each pin that goes by. The outer circle has the most pins, so the drum turns fastest there. The inner circle has the fewest pins, so the drum turns slowest.",
    "Slide the drum to another circle while the wheel turns. It lifts a little on the way so the pins do not catch on it. Try Inner, then Middle, then Outer, and watch the drum speed up."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel, the pins and the drum on its shaft. The posts that hold the shaft, the back plate, the base, the number of pins and slots, and the shape of the slots were made up. Brown does not show how the drum is moved. Here the shaft rises a little while it slides so the drum clears the pins.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { th: 0, s: 1, cur: null };
    var Rw = 148, NP = 22, p = 2 * Math.PI * Rw / NP;          // pin spacing along every circle
    var NS = 18, rp = NS * p / (2 * Math.PI), RO = rp + 3, RI = RO - 14, WS = 24, ZC = 141, HW = 24;
    o.p = p; o.NS = NS; o.rp = rp; o.ZC = ZC;
    o.rings = { inner: { n: 10, a0: .5 }, middle: { n: 16, a0: .3 }, outer: { n: 22, a0: 0 } };
    // wheel: disc z -14..0, hub z -1..12, axle z -30..-14 (ends on the back plate face), pins z -1..20
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylZ(170, 14, c.mat("wheel")), 0, 0, -7, o.wheel);
    P.at(P.cylZ(35, 13, c.mat("wheel", "dark")), 0, 0, 5.5, o.wheel);
    P.at(P.cylZ(10, 16, c.mat("wheel")), 0, 0, -22, o.wheel);
    ["inner", "middle", "outer"].forEach(function (nm) {
      var R = o.rings[nm], r = R.r = R.n * p / (2 * Math.PI);
      for (i = 0; i < R.n; i++) {
        var a = R.a0 + i * 2 * Math.PI / R.n;
        P.at(P.cylZ(8, 21, c.mat("pins", i === 0 ? "mark" : undefined)), r * Math.cos(a), r * Math.sin(a), 9.5, o.wheel);
      }
    });
    // slotted drum: two end rims, a hub and 18 bars between them (x -24..24)
    o.drum = new T.Group(); scene.add(o.drum);
    P.at(P.cylX(RO - 1, 4, c.mat("pinion")), HW - 2, 0, 0, o.drum);        // end rims x 20..24 and -24..-20
    P.at(P.cylX(RO - 1, 4, c.mat("pinion")), -HW + 2, 0, 0, o.drum);
    P.at(P.cylX(15, 2 * HW - 4, c.mat("pinion")), 0, 0, 0, o.drum);        // hub x -22..22, inside the rims
    var D = 2 * Math.PI / NS, h = WS / 2, ri = RI - 3;
    for (k = 0; k < NS; k++) {
      var sh = new T.Shape(), a0 = k * D, a1 = (k + 1) * D, pts = [], j;
      pts.push([ri, a0 + Math.asin(h / ri)], [RO, a0 + Math.asin(h / RO)]);
      for (j = 1; j < 4; j++) pts.push([RO, a0 + Math.asin(h / RO) + (a1 - Math.asin(h / RO) - a0 - Math.asin(h / RO)) * j / 4]);
      pts.push([RO, a1 - Math.asin(h / RO)], [ri, a1 - Math.asin(h / ri)]);
      pts.forEach(function (q, n) { var x = q[0] * Math.cos(q[1]), y = q[0] * Math.sin(q[1]); if (n) sh.lineTo(x, y); else sh.moveTo(x, y); });
      var g = new T.ExtrudeGeometry(sh, { depth: 2 * HW - 4, bevelEnabled: false });
      g.translate(0, 0, -HW + 2); g.rotateY(Math.PI / 2);           // shape x -> world -z, shape y -> world y, depth along x
      o.drum.add(new T.Mesh(g, c.mat("pinion", k === 0 ? "mark" : undefined)));
    }
    o.shaft = P.at(P.cylX(12, 368, c.mat("shaft")), -15, 0, ZC, scene);     // x -199..169, a gap of 1 to each post
    // supports: base x -230..200, y -197..-185, z -50..180; back plate x -185..185, y -185..185, z -40..-30
    P.at(P.box(430, 12, 230, c.fixed), -15, -191, 65, scene);
    P.at(P.box(370, 370, 10, c.fixed), 0, 0, -35, scene);
    // posts: left x -214..-200, right x 170..184, y -185..20, z 120..170; they stand on the base top at y -185
    P.at(P.box(14, 205, 50, c.fixed), -207, -82.5, 145, scene);
    P.at(P.box(14, 205, 50, c.fixed), 177, -82.5, 145, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, D = 2 * Math.PI / o.NS;
    function sm(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
    o.th += S.w * dt;
    function psi(nm) { var R = o.rings[nm]; return -(R.r / o.rp) * (o.th + R.a0 - Math.PI); }
    var want = S.controls.pos || "outer";
    if (o.cur === null) { o.cur = o.to = o.from = want; o.offTo = o.offFrom = 0; o.xFrom = -o.rings[want].r; o.s = 1; }
    else if (want !== o.to) {
      var e0 = sm((o.s - .2) / .6);
      o.xFrom = o.xFrom + (-o.rings[o.to].r - o.xFrom) * e0;
      var pf = psi(o.from) * (1 - e0) + (psi(o.to) + o.offTo) * e0 + 0;
      o.from = o.to; o.offFrom = 0; o.to = want;
      o.offFrom = pf - psi(o.from);
      o.offTo = D * Math.round((pf - psi(want)) / D);
      o.s = 0;
    }
    if (o.s < 1) o.s = Math.min(1, o.s + dt / 1.6);
    var s = o.s, e = sm((s - .2) / .6), lift = 12 * sm(Math.min(s, 1 - s) / .25);
    var pt = psi(o.to) + o.offTo, pfr = psi(o.from) + o.offFrom;
    var ps = pfr * (1 - e) + pt * e;
    o.drum.position.set(o.xFrom + (-o.rings[o.to].r - o.xFrom) * e, 0, o.ZC + lift);
    o.shaft.position.z = o.ZC + lift;
    o.drum.rotation.x = ps;
    o.wheel.rotation.z = o.th;
    var ratio = (o.rings[o.from].r * (1 - e) + o.rings[o.to].r * e) / o.rp;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("w", f(rpm));
    S.set("p", f(rpm === 0 ? 0 : -rpm * ratio));
  }
});
