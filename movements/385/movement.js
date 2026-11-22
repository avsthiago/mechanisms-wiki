M507.define({
  number: 385,
  title: "Russian door closer",
  lede: "Two bars joined at the top hold up a weight above a door. Opening the door pulls the bottom ends of the bars closer, which lifts the weight. Let go, and the weight sinks and pushes the door shut.",
  alt: "Two straight bars meet at a joint at the top, like a roof. A pear-shaped weight hangs from the joint on a hook. The lower end of one bar sits on an upright pin fixed to the door, the other on a pin fixed to the wall beside the doorway.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Wall pin", note: "An upright pin that turns in a socket fixed to the wall. It lets the bars swing round to follow the door." },
    { key: "door", color: "#C8873A", name: "Door and its pin", note: "The door swings on its hinges. Its pin turns in a socket fixed to the door, just like the wall pin." },
    { key: "links", color: "#D9B13B", name: "Bars", note: "Two bars joined at the top by a pin, called a toggle. The red pin end marks the joint." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "Hangs from the joint. Its fall is what shuts the door." }
  ],
  controls: [{ type: "range", id: "open", label: "Open the door to", min: 30, max: 120, step: 5, value: 90, unit: "°",
    presets: [[45, "45°"], [90, "90°"], [120, "120°"]] }],
  speed: false,
  readouts: [{ id: "a", label: "Door" }, { id: "h", label: "Weight up" }, { id: "m", label: "Moved by" }],
  views: { "3d": [195, 120, 690], front: [20, 25, 720], top: [20, 720, 160] },
  viewLabels: { top: "Above" },
  target: [20, 20, 40],
  how: [
    "When the door is shut, the two pins are far apart and the bars lean over low, like a flat roof. Open the door and its pin swings round towards the wall pin. The bars stand up steeper, and the weight rises.",
    "Let go and the weight wants to sink. It can only sink if the bars lean over again. That pushes the two pins apart, and the only way they can move apart is for the door to swing shut. The pins turn in their sockets so the bars can follow the door round.",
    "The wider the door opens, the higher the weight goes, and the harder it pushes back. Try 45°, then 120°, and compare how high the weight climbs."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the bars, the weight and the pins. The door, the wall, the sockets and all the sizes are made up. The door is pushed open for you, then let go. Its closing speed comes from the weight, the heaviness of the door and a little rub in the hinges.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { L: 150, a: 110, b: 150, e: 35, W: 320, phi: 0, v: 0, mode: "rest", t: 0, from: 0, to: 0, dur: 1, g: 9810, m: 5, I: 4.3e6, damp: 4e5 };
    o.F = [-o.a, o.e];                                   // wall pin (x, z), on the swing side of the wall
    // wall round the doorway: face at z = 0, back at z = -40; opening x 0..W, top at y = -75
    P.at(P.box(220, 760, 40, c.fixed), -110, -220, -20, scene);           // x -220..0, y -600..160
    P.at(P.box(o.W, 235, 40, c.fixed), o.W / 2, 42.5, -20, scene);         // lintel x 0..320, y -75..160
    P.at(P.box(60, 760, 40, c.fixed), o.W + 30, -220, -20, scene);         // x 320..380
    // door: hangs on a hinge line at x = 0, z = 0; body x' 1..319, y -575..-77, z' -13..-1 (clear of the wall faces)
    var D = o.door = new T.Group(); scene.add(D);
    var md = c.mat("door");
    P.at(P.box(o.W - 2, 498, 12, md), o.W / 2, -326, -7, D);
    // door pin socket and bracket at x' = b, z' = e
    P.at(P.box(12, 30, 36, md), o.b, -95, 17, D);                         // bracket z' -1..35 (meets the door face), y -110..-80
    P.at(P.cylY(8, 40, md), o.b, -90, o.e, D);                            // socket y -110..-70
    // wall pin socket and bracket
    var mf = c.mat("frame");
    P.at(P.box(12, 30, 31, mf), -o.a, -95, 15.5, scene);                  // bracket z 0..31, its back face on the wall face z = 0
    P.at(P.cylY(8, 40, mf), -o.a, -90, o.e, scene);                       // socket y -110..-70
    // the two pins: each an upright stalk that turns in its socket, with a cross pin on top
    function pin(m) {
      var g = new T.Group(); scene.add(g);
      P.at(P.cylY(4, 72, m), 0, -35, 0, g);                               // stalk y -71..1, foot inside the socket
      P.at(P.sphere(5.5, m), 0, 0, 0, g);
      P.at(P.cylZ(3, 26, m), 0, 0, 0, g);                                 // cross pin along local Z (the toggle's sideways direction), z -13..13
      return g;
    }
    o.pF = pin(mf); o.pD = pin(md);
    // the bars: local X along the bar, local Z sideways; the two bars sit side by side, 6 each side of the middle
    var ml = c.mat("links");
    function bar(side) {
      var g = new T.Group(); scene.add(g);
      P.at(P.box(o.L, 12, 6, ml), o.L / 2, 0, 0, g);                      // z -3..3
      P.at(P.cylZ(11, 8, ml), 0, 0, 0, g);                                // eyes z -4..4
      P.at(P.cylZ(13, 8, ml), o.L, 0, 0, g);
      P.at(P.cylZ(4.5, 1, c.mat("links", "dark")), 0, 0, side * 4.5, g);  // pin hole mark, lifted 0.5 off the outer face
      g.side = side; return g;
    }
    o.b1 = bar(-1); o.b2 = bar(1);
    o.top = new T.Group(); scene.add(o.top);                              // joint pin, local Z sideways
    P.at(P.cylZ(3, 21, ml), 0, 0, 0, o.top);                              // z -10.5..10.5, ends 0.5 out of the eyes
    P.at(P.cylZ(4, 1, c.mat("links", "mark")), 0, 0, 10.5, o.top);        // red end z 10..11
    // weight on a closed ring round the joint pin, between the two bars (gap z -2..2, ring tube 1.5)
    var Wt = o.wt = new T.Group(); scene.add(Wt);
    var mw = c.mat("weight");
    P.at(P.hook({ radius: 6, tube: 1.5, material: mw }), 0, -1.5, 0, Wt);  // inner top at -1.5 + 4.5 = 3 = top of the pin
    P.at(P.cylY(1.6, 20, mw), 0, -17.5, 0, Wt);                           // shank y -27.5..-7.5, top in the ring rod
    var pts = [[0, -84], [12, -83], [21, -76], [24, -66], [21, -54], [13, -44], [7, -37], [5, -30], [4, -26], [0, -26]].map(function (q) { return new T.Vector2(q[0], q[1]); });
    Wt.add(new T.Mesh(new T.LatheGeometry(pts, 40), mw));
    o.h0 = this.lift(0);
    this.place(c);
  },

  // where the door pin is at door angle p, and the height of the joint above the pins
  pinD: function (p) { var o = this.o; return [o.b * Math.cos(p) - o.e * Math.sin(p), o.b * Math.sin(p) + o.e * Math.cos(p)]; },
  lift: function (p) {
    var o = this.o, d = this.pinD(p), dx = d[0] - o.F[0], dz = d[1] - o.F[1], s = Math.sqrt(dx * dx + dz * dz) / 2;
    return Math.sqrt(o.L * o.L - s * s);
  },

  place: function (c) {
    var T = c.THREE, o = this.o, p = o.phi, d = this.pinD(p), F = o.F, h = this.lift(p);
    o.door.rotation.y = -p;
    var ux = d[0] - F[0], uz = d[1] - F[1], dl = Math.sqrt(ux * ux + uz * uz); ux /= dl; uz /= dl;
    var n = new T.Vector3(-uz, 0, ux), up = new T.Vector3(0, 1, 0), mx = (F[0] + d[0]) / 2, mz = (F[1] + d[1]) / 2;
    var ay = Math.atan2(n.x, n.z);
    o.pF.position.set(F[0], 0, F[1]); o.pF.rotation.y = ay;
    o.pD.position.set(d[0], 0, d[1]); o.pD.rotation.y = ay;
    [[o.b1, F[0], F[1]], [o.b2, d[0], d[1]]].forEach(function (q) {
      var g = q[0], x = new T.Vector3(mx - q[1], h, mz - q[2]).normalize(), y = new T.Vector3().crossVectors(n, x);
      P2(g, x, y); g.position.set(q[1] + n.x * 6 * g.side, 0, q[2] + n.z * 6 * g.side);
    });
    function P2(g, x, y) { c.P.frame(g, x, y); }
    o.top.position.set(mx, h, mz); o.top.rotation.set(0, ay, 0);
    o.wt.position.set(mx, h, mz); o.wt.rotation.set(0, ay, 0);
    return h;
  },

  step: function (c, dt, S) {
    var o = this.o, self = this, target = (+S.controls.open) * Math.PI / 180;
    if (S.playing && dt > 0) {
      o.t += dt;
      if (o.mode === "rest") {
        if (o.t > 1.2) { o.mode = "hand"; o.t = 0; o.from = o.phi; o.to = target; o.dur = .6 + 1.4 * Math.abs(target - o.phi) / (Math.PI / 2); }
      } else if (o.mode === "hand") {
        var f = Math.min(1, o.t / o.dur);
        o.phi = o.from + (o.to - o.from) * (.5 - .5 * Math.cos(Math.PI * f)); o.v = 0;
        if (f >= 1 && o.t > o.dur + .8) { o.mode = "weight"; o.t = 0; }
      } else {
        // weight lets go: (I + m h'^2) phi'' + m h' h'' phi'^2 + m g h' + damp phi' = 0
        var n = Math.ceil(dt / .001), hdt = dt / n, e = 1e-4;
        for (var k = 0; k < n; k++) {
          var h0 = self.lift(o.phi - e), h1 = self.lift(o.phi), h2 = self.lift(o.phi + e);
          var hp = (h2 - h0) / (2 * e), hpp = (h2 - 2 * h1 + h0) / (e * e);
          var acc = -(o.m * hp * hpp * o.v * o.v + o.m * o.g * hp + o.damp * o.v) / (o.I + o.m * hp * hp);
          o.v += acc * hdt; o.phi += o.v * hdt;
          if (o.phi <= 0) { o.phi = 0; o.v = -.15 * o.v; if (o.v < .02) o.v = 0; }   // the door meets its stop and bounces a little
        }
        if (o.phi === 0 && o.v === 0) { o.mode = "rest"; o.t = 0; }
      }
    }
    var h = this.place(c);
    S.set("a", Math.round(o.phi * 180 / Math.PI) + "°");
    S.set("h", Math.round(h - o.h0) + " mm");
    S.set("m", o.mode === "hand" ? "hand" : o.mode === "weight" ? "weight" : "shut");
  }
});
