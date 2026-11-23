M507.define({
  number: 148,
  title: "Gears rocking a crank",
  lede: "A small gear turns a big spoked gear. A pin on the big gear pushes a link, and the link swings a long arm to and fro. The gears only go round and round, but the arm rocks back and forth. A rocking motion like this is useful where a lever must move up and down.",
  alt: "A small gear at the left meshes with the edge of a big spoked gear. A pin near the middle of the big gear holds a short link. The link joins a long arm that reaches across to a post on the right, where it pivots.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "It is turned from outside. Its teeth push the teeth of the big gear. Watch the red stripe to see it turn." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "It turns slowly the other way. A pin on its face goes round in a circle and carries the link with it." },
    { key: "link", color: "#D9B13B", name: "Crank pin and link", note: "The pin is fixed to the big gear. The short link joins it to the end of the long arm." },
    { key: "rocker", color: "#4FA58A", name: "Swinging arm", note: "The long arm. One end turns on a post on the right. It cannot go round, so it swings up and down." }
  ],
  controls: [{ id: "pin", label: "Crank pin place", value: "52", options: [["36", "Near the centre"], ["52", "Middle"], ["68", "Near the edge"]] }],
  readouts: [{ id: "in", label: "Driving gear" }, { id: "out", label: "Driven gear" }, { id: "arm", label: "Arm swing" }],
  views: { "3d": [330, 170, 700], front: [0, 0, 760], side: [760, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The small gear turns the big gear. The pin on the big gear goes round in a circle and pushes the link. The link pushes the end of the long arm. The arm is held at one end, so it swings up and down.",
    "The big gear goes round again and again, always the same way. The arm never goes round. It swings up, then down, then up again, once for each turn of the big gear. The arm moves fastest in the middle of each swing and stops for an instant at the top and the bottom.",
    "Try the three places for the pin. Watch how much the arm swings, and read the swing in the box at the top."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate behind the gears, the base, the post for the arm, the tooth counts and the thickness of every part were made up. Brown draws an oval groove in the big gear and his link is shorter. The groove was left out, and the link was made a little longer so that the big gear can turn all the way round. The choice of pin place was added to show what it changes.",

  K: { N1: 50, N2: 20, MD: 6, Q: [233, 36], L: 258, C: 96, B0: 155 * Math.PI / 180 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, o = this.o = { a: 0, J: [-23, 71] };
    var g1 = P.spurGear({ teeth: K.N1, module: K.MD, bore: 125, material: c.mat("driven") });
    var g2 = P.spurGear({ teeth: K.N2, module: K.MD, material: c.mat("drive") });
    o.d = g1.pitchRadius + g2.pitchRadius;                                   // 210
    // big gear at the origin: rim z -8..8, spokes z -4..4, hub z -8..12, shaft z -30..-8
    o.g1 = new T.Group(); scene.add(o.g1); o.g1.add(g1);
    [30, 90, 150].forEach(function (d) {
      var s = new T.Group(); s.rotation.z = d * Math.PI / 180; o.g1.add(s);
      P.at(P.box(252, 10, 8, c.mat("driven")), 0, 0, 0, s);                  // spoke x +-126, z -4..4, ends inside the rim bore (radius 125)
    });
    P.at(P.cylZ(18, 20, c.mat("driven")), 0, 0, 2, o.g1);                    // hub z -8..12
    P.at(P.cylZ(8, 22, c.mat("driven")), 0, 0, -19, o.g1);                   // shaft z -30..-8, from the plate face
    var sr = new T.Group(); sr.rotation.z = K.B0 + Math.PI; o.g1.add(sr);
    P.at(P.box(16, 5, 1, c.mat("driven", "dark")), 134, 0, 8.5, sr);   // stripe x 126..142 on the rim face, z 8..9 lifted
    // small gear, a sum of pitch radii to the left: z -8..8, hub z 8..12, shaft z -30..8
    o.g2 = new T.Group(); o.g2.position.set(-o.d, 0, 0); scene.add(o.g2); o.g2.add(g2);
    P.at(P.cylZ(6, 38, c.mat("drive")), 0, 0, -11, o.g2);                    // shaft z -30..8
    P.at(P.cylZ(10, 4, c.mat("drive")), 0, 0, 10, o.g2);                     // hub z 8..12
    P.at(P.box(g2.pitchRadius - 1.25 * K.MD - 14, 5, 1, c.mat("drive", "mark")), 11 + (g2.pitchRadius - 1.25 * K.MD - 14) / 2, 0, 9, o.g2);  // stripe z 8.5..9.5
    // crank pin on the big gear: collar z 8..14, pin z 14..20, cap z 20..22
    o.pin = new T.Group(); o.g1.add(o.pin);
    P.at(P.cylZ(8, 6, c.mat("link")), 0, 0, 11, o.pin);
    // link: z 14..20, pivot at the crank pin, local +X to the arm
    o.link = new T.Group(); scene.add(o.link);
    P.at(P.box(K.C, 12, 6, c.mat("link")), K.C / 2, 0, 17, o.link);          // x 0..96, z 14..20
    P.at(P.cylZ(9, 6, c.mat("link")), 0, 0, 17, o.link);
    P.at(P.cylZ(9, 6, c.mat("link")), K.C, 0, 17, o.link);
    P.at(P.cylZ(4.5, 8, c.mat("link")), 0, 0, 18, o.link);                   // pin z 14..22
    P.at(P.cylZ(7, 2, c.mat("link")), 0, 0, 21, o.link);                     // cap z 20..22
    P.at(P.cylZ(4.5, 14, c.mat("link")), K.C, 0, 22, o.link);                // joint pin z 15..29
    P.at(P.cylZ(7, 2, c.mat("link")), K.C, 0, 21, o.link);                   // washer z 20..22
    P.at(P.cylZ(7, 2, c.mat("link")), K.C, 0, 29, o.link);                   // cap z 28..30
    // rocking arm: group at its post, local +X to the joint; z 22..28
    o.arm = new T.Group(); o.arm.position.set(K.Q[0], K.Q[1], 0); scene.add(o.arm);
    P.at(P.box(K.L, 14, 6, c.mat("rocker")), K.L / 2, 0, 25, o.arm);         // x 0..258, y +-7, z 22..28
    P.at(P.cylZ(12, 6, c.mat("rocker")), 0, 0, 25, o.arm);
    P.at(P.cylZ(10, 6, c.mat("rocker")), K.L, 0, 25, o.arm);
    // post for the arm: z -30..22 from the plate face to the arm's underside, cap on top
    P.at(P.cylZ(10, 52, c.mat("rocker")), K.Q[0], K.Q[1], -4, scene);        // z -30..22
    P.at(P.cylZ(6, 8, c.mat("rocker")), K.Q[0], K.Q[1], 26, scene);          // z 22..30
    P.at(P.cylZ(8, 2, c.mat("rocker")), K.Q[0], K.Q[1], 29, scene);          // cap z 28..30
    // supports: plate behind, shafts end at its face z -30
    P.at(P.box(590, 350, 10, c.fixed), 0, 0, -35, scene);                    // x -295..295, y -175..175, z -40..-30
    P.at(P.box(630, 12, 100, c.fixed), 0, -181, -30, scene);                 // base x -315..315, y -187..-175, z -80..20
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    o.a += S.w * dt;
    var r = +(S.controls.pin || 52), r1 = -o.a * K.N2 / K.N1;
    o.g1.rotation.z = r1;
    o.g2.rotation.z = 2 * Math.PI - Math.PI / K.N2 + K.N1 * Math.PI / K.N2 + o.a;   // half a tooth offset, meshes with the big gear
    o.pin.position.set(r * Math.cos(K.B0), r * Math.sin(K.B0), 0);
    var W = [r * Math.cos(r1 + K.B0), r * Math.sin(r1 + K.B0)];
    // joint: at link length from the pin and arm length from the post; pick the crossing nearest the last one
    var dx = K.Q[0] - W[0], dy = K.Q[1] - W[1], d = Math.hypot(dx, dy);
    var a = (K.C * K.C - K.L * K.L + d * d) / (2 * d), h2 = K.C * K.C - a * a;
    if (h2 >= 0) {
      var h = Math.sqrt(h2), mx = W[0] + a * dx / d, my = W[1] + a * dy / d;
      var c1 = [mx + h * dy / d, my - h * dx / d], c2 = [mx - h * dy / d, my + h * dx / d];
      var d1 = Math.hypot(c1[0] - o.J[0], c1[1] - o.J[1]), d2 = Math.hypot(c2[0] - o.J[0], c2[1] - o.J[1]);
      o.J = d1 < d2 ? c1 : c2;
    }
    var J = o.J;
    o.link.position.set(W[0], W[1], 0); o.link.rotation.z = Math.atan2(J[1] - W[1], J[0] - W[0]);
    o.arm.rotation.z = Math.atan2(J[1] - K.Q[1], J[0] - K.Q[0]);
    function f1(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f1(rpm));
    S.set("out", f1(rpm === 0 ? 0 : -rpm * K.N2 / K.N1));
    var jd = Math.hypot(J[0], J[1]), cosT = (K.L * K.L + K.Q[0] * K.Q[0] + K.Q[1] * K.Q[1] - jd * jd) / (2 * K.L * Math.hypot(K.Q[0], K.Q[1]));
    S.set("arm", Math.round(Math.acos(Math.max(-1, Math.min(1, cosT))) * 180 / Math.PI) + "°");
  }
});
