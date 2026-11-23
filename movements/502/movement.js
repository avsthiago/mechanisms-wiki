M507.define({
  number: 502,
  title: "Epicyclic train",
  lede: "An arm swings round a centre and carries gears with it. The gears roll on a gear at the centre, so they spin on their own pins while they travel. Trains like this add two turning motions into one.",
  alt: "An upright arm turning on a pin at its lower end. Behind that end is a big gear with a smaller gear in front of it. Halfway up the arm is a pair of gears fixed together, and at the top a small gear. The gears form a chain from the big gear to the top one.",
  parts: [
    { key: "arm", color: "#5E7387", name: "Arm", note: "Swings round the centre pin and carries the gears above it. Its speed is set by the speed slider." },
    { key: "big", color: "#4FA58A", name: "Big centre gear", note: "Sits on the centre pin behind the arm. Held still, it makes the gears on the arm roll round it." },
    { key: "pair", color: "#C8873A", name: "Middle pair", note: "Two gears fixed together on one pin of the arm. The back one rolls on the big centre gear. The front one drives the upper gear and the small centre gear." },
    { key: "top", color: "#8E7AA8", name: "Upper gear", note: "Turns on the pin at the end of the arm. Watch its red stripe to see it spin as it is carried round." },
    { key: "small", color: "#D9B13B", name: "Small centre gear", note: "Loose on the centre pin, in front of the big gear. The front gear of the middle pair turns it." }
  ],
  controls: [{ id: "big", label: "Big centre gear", value: "held", options: [["held", "Held still"], ["with", "Turning with the arm"], ["against", "Turning against the arm"]] }],
  readouts: [{ id: "arm", label: "Arm" }, { id: "top", label: "Upper gear" }, { id: "small", label: "Small centre gear" }],
  speed: { min: 1, max: 30, value: 8, label: "Arm speed", unit: " rpm" },
  views: { "3d": [90, 50, 800], front: [0, 0, 1000], side: [1000, 60, 60] },
  target: [0, 0, 0],
  how: [
    "The arm swings round the centre pin. The big centre gear is held still. The back gear of the middle pair touches it, so the pair has to roll round it and spin on its pin.",
    "The front gear of the pair passes that spin on to the upper gear and to the small centre gear. Each of them turns partly because the arm carries it round and partly because the pair spins it. The readouts show the two motions added together.",
    "What counts is how the big gear moves compared with the arm. Try Turning with the arm: nothing rolls, and the whole set goes round as one piece. Then try Turning against the arm, and every gear spins twice as fast on its pin."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown describes the upper gear and the small centre gear as two different ways to end the train; his drawing shows both, and so does this model. The post, the base, the sizes and the number of teeth were made up. So was the choice of how the big centre gear moves, which follows Brown's remark that it may turn as well as the arm.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 5;
    var o = this.o = { th: 0, a: 0, NA: 24, NF: 16, NE: 22, ND: 18, NB: 14 };
    var d1 = (o.NA + o.NF) * MD / 2, d2 = (o.NE + o.NB) * MD / 2;           // 100 from centre to the pair, 90 more to the top wheel
    // back layer z -8..8: big centre wheel and the back gear of the pair. Front layer z 10.5..25.5: the other three. Arm z 30..36.
    o.A = P.spurGear({ teeth: o.NA, module: MD, bore: 5.5, material: c.mat("big") }); scene.add(o.A);
    P.at(P.cylZ(11, 21.5, c.mat("big")), 0, 0, -18.75, o.A);                      // sleeve z -30..-8, from the post face to the wheel
    P.at(P.box(13, 3, 1, c.mat("big", "dark")), 57.5, 0, 9, o.A);            // stripe r 51..64 up one tooth, z 8.5..9.5, lifted off the face
    o.D = P.spurGear({ teeth: o.ND, module: MD, width: 15, bore: 5.5, material: c.mat("small") }); P.at(o.D, 0, 0, 18, scene);
    P.at(P.box(26, 4, 1, c.mat("small", "dark")), 25, 0, 8.5, o.D);          // stripe r 12..38, z 26..27 (local 8..9), lifted off the face
    var arm = o.arm = new T.Group(); scene.add(arm);
    var plate = P.armPlate({ length: d1 + d2, r0: 13, r1: 10, thick: 6, material: c.mat("arm") }); plate.rotation.z = Math.PI / 2;
    P.at(plate, 0, 0, 33, arm);                                              // arm z 30..36, from the centre straight up
    P.at(P.cylZ(4.5, 37.5, c.mat("arm")), 0, d1, 11.25, arm);                     // pin of the pair z -8..30, up to the arm's back face
    P.at(P.cylZ(4.5, 19, c.mat("arm")), 0, d1 + d2, 20.5, arm);           // pin of the top wheel z 10.5..30
    [0, d1, d1 + d2].forEach(function (y) { P.at(P.cylZ(7, 2, c.mat("arm", "dark")), 0, y, 37, arm); });   // pin heads z 36..38 on the arm face
    o.pair = new T.Group(); o.pair.position.set(0, d1, 0); arm.add(o.pair);
    o.F = P.spurGear({ teeth: o.NF, module: MD, material: c.mat("pair") }); o.pair.add(o.F);               // back gear z -8..8
    o.E = P.spurGear({ teeth: o.NE, module: MD, width: 15, material: c.mat("pair") }); P.at(o.E, 0, 0, 18, o.pair);   // front gear z 10.5..25.5
    P.at(P.cylZ(12, 2.5, c.mat("pair")), 0, 0, 9.25, o.pair);                // spacer z 8..10.5 between the two
    P.at(P.box(34, 4, 1, c.mat("pair", "dark")), 29, 0, 8.5, o.E);           // stripe r 12..46, z 26..27
    o.B = P.spurGear({ teeth: o.NB, module: MD, width: 15, material: c.mat("top") }); P.at(o.B, 0, d1 + d2, 18, arm);
    P.at(P.box(19, 4, 1, c.mat("top", "mark")), 18.5, 0, 8.5, o.B);          // red stripe r 9..28, z 26..27
    // supports: centre pin from the post, post on a base; the gears sweep 230 from the centre, base top y -245
    P.at(P.cylZ(5, 70, c.fixed), 0, 0, 5, scene);                            // centre pin z -30..40, starts at the post face
    P.at(P.box(44, 271, 12, c.fixed), 0, -109.5, -36, scene);                // post x -22..22, y -245..26, z -42..-30
    P.at(P.box(200, 12, 110, c.fixed), 0, -251, -20, scene);                 // base y -257..-245, z -75..35
    // starting phases, link by link along the train
    o.pF = o.pair.rotation.z = P.meshTurn(o.A, o.F);
    o.pB = o.B.rotation.z = P.meshTurn(o.E, o.B);
    o.pD = o.D.rotation.z = P.meshTurn(o.E, o.D);
    o.pairs = [[o.A, o.F], [o.E, o.B], [o.E, o.D]];
  },

  step: function (c, dt, S) {
    var o = this.o, m = S.controls.big, kA = m === "with" ? 1 : m === "against" ? -1 : 0;   // big wheel's speed as a share of the arm's
    o.th += S.w * dt; o.a += S.w * kA * dt;
    // seen from the arm, each gear turns its neighbour the other way in inverse ratio of teeth
    var relA = o.a - o.th, relP = -relA * o.NA / o.NF, relB = -relP * o.NE / o.NB, relD = -relP * o.NE / o.ND;
    o.arm.rotation.z = o.th;
    o.A.rotation.z = o.a;
    o.pair.rotation.z = o.pF + relP;
    o.B.rotation.z = o.pB + relB;
    o.D.rotation.z = o.pD + o.th + relD;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0, rP = (1 - kA) * o.NA / o.NF;           // pair's spin on its pin, as a share of the arm's speed
    S.set("arm", f(rpm));
    S.set("top", f(rpm * (1 - rP * o.NE / o.NB)));
    S.set("small", f(rpm * (1 - rP * o.NE / o.ND)));
  }
});
