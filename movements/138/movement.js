M507.define({
  number: 138,
  title: "Cam under a rod",
  lede: "A flat plate with three points turns on its centre. An upright rod rests on its edge and slides up and down in two guides. The rod rises over each point and sinks into each dip, so one turn gives three lifts.",
  alt: "A flat plate with three pointed lobes and curved dips between them, turning inside a faint round disc. An upright rod with a pointed foot rests on its top edge. Two small guide blocks on a post hold the rod upright.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Three-point cam", note: "A flat plate with three points and a dip between each pair. Its edge is the only thing the rod touches." },
    { key: "rod", color: "#C8873A", name: "Rod", note: "It rests on the cam by its own weight. Two guides keep it upright, so it can only slide up and down." },
    { key: "mark", color: "#C2503F", name: "Marker ring", note: "A ring on the rod. Watch it: it goes up and down three times for each turn of the cam." }
  ],
  controls: [{ id: "lift", label: "Height of the points", value: "55", options: [["30", "Low"], ["55", "As drawn"], ["80", "High"]] }],
  readouts: [{ id: "lift", label: "Rod lift" }, { id: "vel", label: "Rod speed" }],
  views: { "3d": [420, 260, 820], front: [0, 85, 1000], side: [820, 85, 40] },
  target: [0, 85, 0],
  distance: [400, 2600],
  how: [
    "Watch the pointed foot of the rod. At the start it sits in a dip, where the edge of the cam is closest to the centre. As the cam turns, the edge swings out towards a point, and it pushes the rod up.",
    "When the point passes under the rod, the rod is at its highest. Then the edge falls away again and the rod sinks down. The rise is quick near the points and slow at the dips, so the rod moves at a changing speed. It stops for an instant at the top and at the bottom.",
    "Turn the cam through one full turn and count the lifts: three, one for each point. Try Low, As drawn and High, and watch the lift reading."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the curve of the edge, the pointed foot, the two guides, the post, the back plate and the base were made up. Brown draws the points evenly spaced, and so they are here. The faint disc turns with the cam. Brown does not say what keeps the rod down, so it is held only by its weight. The rod height is worked out exactly from the edge of the cam. The choice of point height was added for comparison.",

  G: { RMAX: 105, ROD: 4, RL: 230, MK: 200 },

  // Distance from the centre to the edge of the cam at angle a (cam frame), for lobes of height h above the dips.
  // Three sharp points at 30, 150 and 270 degrees; a rounded dip in between.
  radius: function (a, h) {
    var S = 2 * Math.PI / 3, rmin = this.G.RMAX - h;
    var f = ((a - Math.PI / 6) % S + S) % S; if (f > S / 2) f -= S;     // angle from the nearest point, -60..60 degrees
    var s = Math.abs(f) / (S / 2);
    return rmin + h * Math.pow(1 - s, 1.5);
  },

  // Height of the rod's foot when the cam has turned by th: the rod stands at the top (90 degrees), so it meets the edge at cam angle 90 - th.
  tip: function (th, h) { return this.radius(Math.PI / 2 - th, h); },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene;
    var o = this.o = { th: 0, h: null, dyn: [] };
    o.cam = new T.Group(); scene.add(o.cam);
    // shaft z -10..18.5; hub pale z 14.5..17.5; dark dot z 18..19.4; plate z 3.5..15.5; faint disc z 0..3
    P.at(P.cylZ(6, 28.5, c.mat("cam")), 0, 0, 4.25, o.cam);
    P.at(P.cylZ(14, 3, c.mat("cam", "light")), 0, 0, 16, o.cam);
    P.at(P.cylZ(2, 1.4, c.mat("cam", "dark")), 6, 0, 18.7, o.cam);
    var disc = P.at(P.cylZ(G.RMAX + 7, 3, c.fixed), 0, 0, 1.5, o.cam);   // z 0..3
    // rod: pointed foot, apex at the local origin; foot cone y 0..10, rod y 10..RL; ring above the upper guide at all times
    o.rod = new T.Group(); o.rod.position.z = 9.5; scene.add(o.rod);
    var cone = P.mesh(new T.CylinderGeometry(G.ROD, 0.3, 10, 32), c.mat("rod")); P.at(cone, 0, 5, 0, o.rod);
    P.at(P.cylY(G.ROD, G.RL - 10, c.mat("rod")), 0, 10 + (G.RL - 10) / 2, 0, o.rod);
    P.at(P.cylY(G.ROD + 2.5, 5, c.mat("mark")), 0, G.MK, 0, o.rod);
    // guides: lower y 143..157, upper y 183..197, x -20..20, z -3.5..22.5 (0.5 clear of the rod); post x -20..20, y 143..197, z -10..-3.5
    [150, 190].forEach(function (y) { P.at(P.guideBlock({ w: 40, h: 14, d: 26, hole: 4.5, material: c.fixed }), 0, y, 9.5, scene); });
    P.at(P.box(40, 54, 6.5, c.fixed), 0, 170, -6.75, scene);
    P.at(P.box(360, 340, 10, c.fixed), 0, 30, -15, scene);     // back plate x -180..180, y -140..200, z -20..-10
    P.at(P.box(360, 12, 80, c.fixed), 0, -146, -10, scene);    // base y -152..-140, z -50..30
  },

  makeCam: function (c, h) {
    var T = c.THREE, P = c.P, o = this.o, i, n = 1440, sh = new T.Shape();
    if (o.plate) { o.cam.remove(o.plate); o.plate.geometry.dispose(); }
    for (i = 0; i < n; i++) {
      var a = 2 * Math.PI * i / n, r = this.radius(a, h);
      if (i) sh.lineTo(r * Math.cos(a), r * Math.sin(a)); else sh.moveTo(r, 0);
    }
    o.plate = P.at(P.mesh(new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false }), c.mat("cam")), 0, 0, 3.5, o.cam);
    o.h = h;
  },

  step: function (c, dt, S) {
    var o = this.o, G = this.G, h = +S.controls.lift || 55;
    if (h !== o.h) this.makeCam(c, h);
    o.th += S.w * dt;
    o.cam.rotation.z = o.th;
    var y = this.tip(o.th, h);
    o.rod.position.y = y;
    var e = 1e-4, v = (this.tip(o.th + e, h) - this.tip(o.th - e, h)) / (2 * e) * S.w;   // d(height)/dt
    var up = y - (G.RMAX - h);
    S.set("lift", up.toFixed(0) + " mm");
    S.set("vel", (v > .5 ? "+" : "") + v.toFixed(0) + " mm/s");
  }
});
