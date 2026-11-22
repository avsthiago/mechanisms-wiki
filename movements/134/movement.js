M507.define({
  number: 134,
  title: "Rope and drum",
  lede: "A rope is wound round a wheel called a drum. When the drum turns, the rope is pulled along a straight line. This is how a turning motion becomes a straight one.",
  alt: "A spoked drum standing on the ground, with a rope wound twice round its rim. The rope runs off the bottom to a small sled on rails.",
  parts: [
    { key: "drum", color: "#5E7387", name: "Drum", note: "A wide wheel on a fixed axle. It turns, and the rope winds on or off its rim." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "Wound twice round the drum, so it grips. One end is tied to the drum and the other to the sled. Watch the red marks." },
    { key: "sled", color: "#C8873A", name: "Sled", note: "Slides along the rails and is pulled by the rope. Watch how far it goes." },
    { key: "track", color: "#4FA58A", name: "Rails", note: "Two rails that keep the sled going in a straight line." }
  ],
  readouts: [{ id: "t", label: "Drum turned" }, { id: "r", label: "Rope pulled" }, { id: "v", label: "Sled speed" }],
  views: { "3d": [430, 300, 680], front: [150, 100, 760], side: [820, 100, 0] },
  target: [150, 100, 0],
  how: [
    "The rope leaves the bottom of the drum and runs straight to the sled. When the drum turns clockwise, the bottom of the rim moves to the left. It takes the rope with it, and the sled is pulled toward the drum.",
    "The rope does not slip on the rim. So the length pulled in is exactly the distance a point on the rim has travelled. A bigger drum pulls more rope in one turn. The rope is wound more than once so it grips and does not slide.",
    "Watch the red mark on the drum and the red mark on the rope. They move together. When the drum turns back, the rope is let out and the sled slides away. Try a slow speed and follow one mark all the way."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the drum from the end, standing on a line. The rope, the sled, the rails, the axle posts and the ground were added to show what the drum does. The sizes are made up. The sled is pulled back out again by the drum turning the other way.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var R = 100, RE = R + 2.2, YC = RE + 6, o = this.o = { R: R, RE: RE, YC: YC, YR: 6, TRAVEL: 220, X0: 340, th: 0, prev: 0 };
    // ground y -8 .. 0; rails y 0 .. 2; post bottoms at y 0
    P.at(P.box(640, 8, 130, c.fixed), 180, -4, 0, scene);                   // x -140 .. 500, z -65 .. 65
    [-16, 16].forEach(function (z) { P.at(P.box(380, 2, 8, c.mat("track")), 310, 1, z, scene); });   // x 120 .. 500, y 0 .. 2, z +-12 .. +-20
    // axle posts: y 0 .. 108.2, inner faces at z = +-42, the axle ends there
    P.at(P.box(30, YC, 6, c.fixed), 0, YC / 2, 45, scene);                  // x -15 .. 15, z 42 .. 48
    P.at(P.box(30, YC, 6, c.fixed), 0, YC / 2, -45, scene);                 // z -48 .. -42
    // drum: hollow rim, four broad spokes, hub, axle
    var d = o.drum = new T.Group(); d.position.set(0, YC, 0); scene.add(d);
    var sh = new T.Shape(); sh.absarc(0, 0, R, 0, 2 * Math.PI, false);
    var hole = new T.Path(); hole.absarc(0, 0, R - 11, 0, 2 * Math.PI, true); sh.holes.push(hole);
    var rg = new T.ExtrudeGeometry(sh, { depth: 60, bevelEnabled: false, curveSegments: 72 }); rg.translate(0, 0, -30);
    d.add(new T.Mesh(rg, c.mat("drum")));                                    // rim radius 89 .. 100, z -30 .. 30
    for (i = 0; i < 4; i++) {
      var a = Math.PI / 4 + i * Math.PI / 2, sp = P.box(80, 18, 12, c.mat("drum")), m = 50;   // r 10 .. 90, tucked into the rim
      sp.position.set(m * Math.cos(a), m * Math.sin(a), 0); sp.rotation.z = a; d.add(sp);
    }
    P.at(P.cylZ(24, 30, c.mat("drum")), 0, 0, 0, d);                         // hub z -15 .. 15
    P.at(P.cylZ(11, 1.5, c.mat("drum", "dark")), 0, 0, 15.75, d);            // bore mark, z 15 .. 16.5
    P.at(P.cylZ(11, 1.5, c.mat("drum", "dark")), 0, 0, -15.75, d);
    P.at(P.cylZ(5, 84, c.mat("drum")), 0, 0, 0, d);                          // axle z -42 .. 42
    for (i = 0; i < 8; i++) {                                                // seams between the eight rim boards, lifted off the rim faces
      var b = i * Math.PI / 4 + Math.PI / 8;
      [30.75, -30.75].forEach(function (z) {
        var q = P.box(11, 2.5, 1.5, c.mat("drum", "dark")); q.position.set(94.5 * Math.cos(b), 94.5 * Math.sin(b), z); q.rotation.z = b; d.add(q);
      });
    }
    // turns of rope on the rim, one carries a red mark
    [-12, 0, 12].forEach(function (z) { P.at(P.hoop(RE, 2.2, c.mat("rope")), 0, 0, z, d); });
    P.at(P.sphere(4.5, c.mat("rope", "mark")), RE * Math.cos(0.5), RE * Math.sin(0.5), -12, d);
    P.at(P.sphere(4, c.mat("rope", "dark")), RE * Math.cos(2.6), RE * Math.sin(2.6), 12, d);   // where the other end is tied to the drum
    // rope run off the bottom of the drum, to the sled
    o.run = P.at(P.rod(2.2, c.mat("rope")), 0, 0, 0, scene);
    o.mark = P.at(P.sphere(4.5, c.mat("rope", "mark")), 0, o.YR, 0, scene);
    var s = o.sled = new T.Group(); scene.add(s);
    P.at(P.box(60, 14, 40, c.mat("sled")), 30, 9, 0, s);                     // x 0 .. 60, y 2 .. 16 (sits on the rails' top at 2), z -20 .. 20
    P.at(P.sphere(4.5, c.mat("rope")), 0, o.YR, 0, s);                       // rope end tied to the sled's front
  },

  step: function (c, dt, S) {
    var o = this.o, ang, pull, xs, y = o.YR;
    o.th += S.w * dt;
    ang = (o.TRAVEL / o.RE) * (.5 - .5 * Math.cos(o.th));      // drum angle, clockwise
    pull = o.RE * ang;                                           // rope in = radius x angle
    xs = o.X0 - pull;
    o.drum.rotation.z = -ang;
    o.sled.position.x = xs;
    o.run.span(0, y, 0, xs, y, 0);
    o.mark.position.x = xs - 60;
    S.set("t", (ang / (2 * Math.PI)).toFixed(2) + " turns");
    S.set("r", Math.round(pull / 10) + " cm");
    var v = dt > 0 ? (pull - o.prev) / dt / 10 : 0; o.prev = pull;
    S.set("v", (v >= 0 ? "" : "−") + Math.abs(Math.round(v)) + " cm/s");
  }
});
