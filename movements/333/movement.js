M507.define({
  number: 333,
  title: "Special parallel motion",
  lede: "A beam rests on two swinging supports instead of a fixed pin. As it rocks, its far end slides along an almost straight line. That end can drive a piston rod with no other guide.",
  alt: "A long slanting beam. A link from a fixed pin on the left holds it in the middle, and a short rocking post on the right holds its lower end. A piston rod hangs from the beam's upper end into a slanting see-through cylinder. Below, a rod hangs from the middle of the beam to a lever that swings on the same pin as the post.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam", note: "It has no fixed pin of its own. It hangs between the radius link and the rocking post, so both its ends move." },
    { key: "radius", color: "#8E7AA8", name: "Radius link", note: "Swings on a fixed pin on the left and carries the middle of the beam round a curve." },
    { key: "post", color: "#4FA58A", name: "Rocking post", note: "A short post on a fixed pin. Its top holds the lower end of the beam and lets it slide almost straight sideways." },
    { key: "drive", color: "#D9B13B", name: "Lower lever and rod", note: "A rod from the middle of the beam to a lever on the post's pin. They follow the beam and could pass its swing on to a pump or crank." },
    { key: "rod", color: "#C8873A", name: "Piston rod", note: "Hangs from the upper end of the beam. Watch its red trace stay straight." }
  ],
  controls: [{ type: "range", id: "swing", label: "Link swing", min: 5, max: 18, step: 1, value: 15, unit: "°",
    presets: [[6, "Short"], [15, "Usual"], [18, "Long"]] }],
  readouts: [{ id: "beam", label: "Beam" }, { id: "off", label: "Off line" }, { id: "worst", label: "Worst" }],
  closed: { label: "Cylinder" },
  views: { "3d": [390, 110, 700], front: [0, -35, 790], side: [790, -35, -10] },
  target: [0, -35, -10],
  how: [
    "Watch the upper end of the beam. Its red trace is a straight slanting line, though no guide holds it. The lower end of the beam slides almost straight sideways on top of the rocking post.",
    "The middle of the beam is about as far from the fixed pin as it is from each end of the beam. So the two ends and the fixed pin stay close to one circle round the middle. When one end slides along a line through that circle, the other end has to move along the line at right angles to it, through the fixed pin. The post's top swings on a curve, not a line, so the path is only nearly straight.",
    "The Off line reading shows how far the rod strays from its line, in millimetres. Try a short swing, then a long one, and compare the worst error. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown says only that it is used in particular cases and does not say what drives it or what the lower rod and lever do. Here the radius link is rocked steadily, and the lower rod and lever simply follow. The small knob halfway down that rod is drawn as a collar. The rocking post's pin was moved a little and the beam's upper end made a little longer, so the line comes out as straight as it can. The cylinder, the floor and the bearings for the fixed pins were added. The drawing shows the beam at the top of its swing.",

  // Units: cm. Radius link from the fixed pin A0 to the beam's middle A; rocking post from B0 to the beam's lower end B;
  // the piston rod hangs from the beam's upper end, AP beyond A. Drive rod A-J, lower lever B0-J. Drawn pose from the
  // engraving; B0 and AP tuned; MID is the link angle at mid-stroke, 15 degrees below the drawn one.
  G: { A0: [-112.5, 16], A: [14, 55], B: [122.5, -15], B0: [114.8, -111.5], AP: 136.2, J: [20, -55], MID: -15 },

  // Exact solve for link angle ps: B is where a circle of radius AB about A meets a circle of radius rB about B0;
  // the beam end P is on the line from B through A; J is where the drive rod meets the lower lever.
  kin: function (ps) {
    var g = this.G, P = this.P, a = [g.A0[0] + this.rA * Math.cos(ps), g.A0[1] + this.rA * Math.sin(ps)];
    var b = P.meet(a[0], a[1], this.AB, g.B0[0], g.B0[1], this.rB, 1), k = g.AP / this.AB;
    var j = P.meet(a[0], a[1], this.AJ, g.B0[0], g.B0[1], this.BJ, -1);
    return { A: a, B: b, J: j, P: [a[0] + (a[0] - b[0]) * k, a[1] + (a[1] - b[1]) * k] };
  },
  setup: function (P) {
    var g = this.G; this.P = P;
    function d(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
    this.rA = d(g.A0, g.A); this.AB = d(g.A, g.B); this.rB = d(g.B0, g.B); this.AJ = d(g.A, g.J); this.BJ = d(g.B0, g.J);
    this.p0 = Math.atan2(g.A[1] - g.A0[1], g.A[0] - g.A0[0]); this.pm = this.p0 + g.MID * Math.PI / 180;
    var m = this.kin(this.pm).P, u = this.kin(this.pm + .26).P, l = this.kin(this.pm - .26).P, dx = u[0] - l[0], dy = u[1] - l[1], dl = Math.hypot(dx, dy);
    this.M = m; this.dir = [dx / dl, dy / dl];                                  // the piston rod's line: through the middle point, along the stroke
  },
  along: function (p) { return [(p[0] - this.M[0]) * this.dir[0] + (p[1] - this.M[1]) * this.dir[1], (p[0] - this.M[0]) * this.dir[1] - (p[1] - this.M[1]) * this.dir[0]]; },
  worst: function (deg) {
    var w = 0, a = deg * Math.PI / 180;
    for (var i = 0; i <= 200; i++) w = Math.max(w, Math.abs(this.along(this.kin(this.pm + a * Math.sin(Math.PI * (i / 100 - .5))).P)[1]));
    return w;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, g = this.G, o = this.o = { ph: Math.PI / 2, amp: -1 }, fx = c.fixed, self = this, i;
    this.setup(P);
    function annulus(rIn, rOut, y0, y1, m) { return P.mesh(new T.LatheGeometry([new T.Vector2(rIn, y0), new T.Vector2(rOut, y0), new T.Vector2(rOut, y1), new T.Vector2(rIn, y1), new T.Vector2(rIn, y0)], 64), m); }
    // stroke of the rod end along its line at the largest swing, and the cylinder sized to suit
    var sMin = 1e9, sMax = -1e9;
    for (i = 0; i <= 200; i++) { var s = this.along(this.kin(this.pm + .32 * Math.sin(Math.PI * (i / 100 - .5))).P)[0]; sMin = Math.min(sMin, s); sMax = Math.max(sMax, s); }
    var rodLen = sMax - sMin + 25, glandTop = sMin - 6, coverBot = glandTop - 14, bot = sMin - rodLen - 5, R = 14;
    var tilt = Math.atan2(this.dir[0], this.dir[1]);
    // local axis: y along the rod's line from the middle point M, cylinder axis at z -25 (z -39..-11)
    var cyl = new T.Group(); cyl.position.set(this.M[0], this.M[1], -25); cyl.rotation.z = -tilt; c.scene.add(cyl);
    c.shell(P.at(P.cylY(R, 4, fx), 0, bot - 2, 0, cyl));                                  // bottom cover bot-4..bot
    c.shell(P.at(annulus(R - 2, R, bot - 3.5, coverBot + 5.5, fx), 0, 0, 0, cyl));         // wall, 0.5 inside both covers
    c.shell(P.at(annulus(3.6, R - 1, coverBot, coverBot + 6, fx), 0, 0, 0, cyl));          // top cover, set 1 into the wall
    c.shell(P.at(annulus(3.6, 7, coverBot + 6, glandTop, fx), 0, 0, 0, cyl));              // gland
    // floor top at the lowest corner of the cylinder's bottom cover, so the cylinder stands on it
    var FLOOR = this.M[1] + (bot - 4) * Math.cos(tilt) - R * Math.sin(Math.abs(tilt));
    P.at(P.box(330, 12, 110, fx), 0, FLOOR - 6, -5, c.scene);                   // x -165..165, z -60..50
    // bearings for the fixed pins, in front: z 13..23, feet on the floor
    P.at(P.bearingBlock({ bore: 3.8, outer: 10, post: 16, width: 10, drop: g.A0[1] - FLOOR, material: fx }), g.A0[0], g.A0[1], 18, c.scene);
    P.at(P.bearingBlock({ bore: 3.8, outer: 10, post: 16, width: 10, drop: g.B0[1] - FLOOR, material: fx }), g.B0[0], g.B0[1], 18, c.scene);
    P.at(P.cylZ(3.5, 17, c.mat("radius", "dark")), g.A0[0], g.A0[1], 14.5, c.scene);   // pin z 7..23
    P.at(P.cylZ(3.5, 35, c.mat("post", "dark")), g.B0[0], g.B0[1], 5.5, c.scene);       // pin z -11..23

    // beam: plate z -5..5, local x from the middle A towards B
    o.beam = new T.Group(); c.scene.add(o.beam);
    var AP = g.AP, AB = this.AB;
    o.beam.add(P.outlinePlate({ points: [[-AP, -6], [0, -12], [AB, -6], [AB, 6], [0, 12], [-AP, 6]], depth: 10, z0: -5, material: c.mat("beam") }));
    P.at(P.cylZ(15, 12, c.mat("beam")), 0, 0, 0, o.beam);
    P.at(P.cylZ(8, 12, c.mat("beam")), -AP, 0, 0, o.beam);
    P.at(P.cylZ(8, 12, c.mat("beam")), AB, 0, 0, o.beam);
    P.at(P.box(AB - 38, 2, 1, c.mat("beam", "dark")), AB / 2 - 1, 0, 6.5, o.beam);   // stripe z 6..7, lifted 1 off the boss-free face
    P.at(P.cylZ(3.5, 30, c.mat("drive", "dark")), 0, 0, -3, o.beam);                // middle pin z -17..11
    P.at(P.cylZ(3.5, 19, c.mat("post", "dark")), AB, 0, 2.5, o.beam);                 // end pin z -5..11

    function link(len, r, key, z) { var m = P.armPlate({ length: len, r0: r, thick: 4, material: c.mat(key) }); m.position.z = z; c.scene.add(m); return m; }
    o.rad = link(this.rA, 6, "radius", 9);                    // z 7..11
    o.post = link(this.rB, 7, "post", 9);                     // z 7..11
    o.lever = link(this.BJ, 6, "drive", -9);                  // z -11..-7
    o.drod = link(this.AJ, 5, "drive", -15);                  // z -17..-13
    P.at(P.cylZ(5, 6, c.mat("drive")), this.AJ / 2, 0, 0, o.drod);                // collar halfway, z -18..-12
    o.pinJ = P.at(P.cylZ(3.2, 12, c.mat("drive", "dark")), 0, 0, -12, c.scene);   // z -17..-7

    // piston rod: cross-head z -30..-20 at the beam end, pin z -25..5, rod and piston along the line
    o.rod = new T.Group(); o.rod.rotation.z = -tilt; c.scene.add(o.rod);
    P.at(P.box(10, 10, 10, c.mat("rod")), 0, 0, -25, o.rod);
    P.at(P.cylZ(3.2, 32, c.mat("rod", "dark")), 0, 0, -9, o.rod);
    P.at(P.cylY(3, rodLen - 9, c.mat("rod")), 0, -5 - (rodLen - 9) / 2, -25, o.rod);
    P.at(P.cylY(R - 3, 8, c.mat("rod")), 0, -rodLen, -25, o.rod);

    o.tEnd = P.trail({ color: 0x8A94A0, max: 300 }); c.scene.add(o.tEnd);
    o.tRod = P.trail({ color: 0xC2503F, max: 300 }); c.scene.add(o.tRod);
  },

  step: function (c, dt, S) {
    var o = this.o, amp = +S.controls.swing, g = this.G;
    if (amp !== o.amp) { o.amp = amp; o.worst = this.worst(amp) * 10; o.tEnd.clear(); o.tRod.clear(); }
    o.ph += S.w * dt;
    var k = this.kin(this.pm + amp * Math.PI / 180 * Math.sin(o.ph));
    function place(m, p, q) { m.position.x = p[0]; m.position.y = p[1]; m.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]); }
    place(o.beam, k.A, k.B); place(o.rad, g.A0, k.A); place(o.post, g.B0, k.B); place(o.lever, g.B0, k.J); place(o.drod, k.A, k.J);
    o.pinJ.position.x = k.J[0]; o.pinJ.position.y = k.J[1];
    o.rod.position.x = k.P[0]; o.rod.position.y = k.P[1];
    o.tEnd.push(k.B[0], k.B[1], 13); o.tRod.push(k.P[0], k.P[1], 13);
    var off = this.along(k.P)[1] * 10, bd = Math.atan2(k.A[1] - k.B[1], k.B[0] - k.A[0]) * 180 / Math.PI;
    function sg(v, d) { var t = Math.abs(v).toFixed(d); return (+t === 0 ? "" : v < 0 ? "−" : "+") + t; }
    S.set("beam", Math.abs(bd).toFixed(0) + "°");
    S.set("off", sg(off, 1) + " mm");
    S.set("worst", o.worst.toFixed(1) + " mm");
  }
});
