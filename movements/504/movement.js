M507.define({
  number: 504,
  title: "Ferguson's paradox",
  lede: "Three thin gears sit on one pin and are driven by the same thick gear. As the arm carries them round, one creeps forwards, one creeps backwards and one does not turn at all. It looks impossible, which is why it is called a paradox.",
  alt: "Seen from the side: a short pedestal with a fixed gear on top. A flat arm reaches out from the pedestal to the right. On the arm stand a thick gear, next to the fixed gear, and beyond it three thin gears stacked on one pin.",
  parts: [
    { key: "arm", color: "#5E7387", name: "Arm", note: "Turns round the top of the pedestal and carries two upright pins. Its speed is set by the speed slider." },
    { key: "fixed", color: "#4FA58A", name: "Fixed gear", note: "Fastened to the pedestal. It never turns." },
    { key: "thick", color: "#C8873A", name: "Thick gear", note: "Rolls round the fixed gear as the arm carries it. It is thick enough to drive all three thin gears at once." },
    { key: "top", color: "#D9B13B", name: "Upper gear", note: "Has one tooth more than the fixed gear. Watch its red tooth creep slowly the same way as the arm." },
    { key: "mid", color: "#E8E2D0", name: "Middle gear", note: "Has the same number of teeth as the fixed gear. Its red tooth always points the same way, like a compass needle." },
    { key: "low", color: "#8E7AA8", name: "Lower gear", note: "Has one tooth fewer than the fixed gear. Its red tooth creeps slowly backwards." }
  ],
  readouts: [{ id: "e", label: "Upper gear" }, { id: "f", label: "Middle gear" }, { id: "g", label: "Lower gear" }],
  speed: { min: 1, max: 30, value: 12, label: "Arm speed", unit: " rpm" },
  views: { "3d": [120, 200, 420], front: [0, 60, 600], top: [0, 700, 1] },
  target: [0, 40, 0],
  how: [
    "The arm swings round the pedestal. The thick gear rolls on the fixed gear, so it spins on its pin. It passes that spin to the three thin gears, turning them backwards on their pin while the arm carries them forwards.",
    "The fixed gear has 20 teeth. The middle gear also has 20, so its backward spin exactly cancels the arm's forward turn. Its red tooth keeps pointing the same way. The upper gear has 21 teeth, so it spins back a little too slowly and ends up creeping forwards. The lower gear has 19, spins back a little too fast, and creeps backwards.",
    "The three red teeth start almost in line. Let the arm go round a few times and watch them drift apart. The upper gear needs 21 turns of the arm to go round once, and the lower gear needs 19 to go round once the other way."
  ],
  note: "This model is rebuilt from Brown's drawing, with the tooth numbers he gives. The three thin gears are all the same size, so their teeth are very slightly different in size. The real toy was made the same way. The number of teeth on the thick gear, the red teeth and stripes, and the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, MD = 4, NA = 20, NB = 20, R = NA * MD / 2, XB = 2 * R, XT = 4 * R;   // pitch radius 40, pins at 80 and 160
    var o = this.o = { th: 0, NA: NA, NB: NB, thin: [] };
    // everything in a group whose local XY is the ground plan and local +Z points up (world +Y)
    var G = new T.Group(); G.rotation.x = -Math.PI / 2; c.scene.add(G);
    // pedestal (fixed): foot z 0..8, column z 8..40; the arm rests on its top
    P.at(P.cylZ(32, 8, c.fixed), 0, 0, 4, G);
    P.at(P.cylZ(16, 32, c.fixed), 0, 0, 24, G);
    var arm = o.arm = new T.Group(); G.add(arm);
    P.at(P.box(230, 22, 10, c.mat("arm")), 97, 0, 45, arm);                  // arm x -18..212, y -11..11, z 40..50
    // fixed wheel z 69..79 on a stud that comes up through the arm
    P.at(P.cylZ(7, 34, c.mat("fixed")), 0, 0, 67, G);                        // stud z 50..84, from the arm's top
    o.A = P.spurGear({ teeth: NA, module: MD, width: 10, material: c.mat("fixed") }); P.at(o.A, 0, 0, 74, G);
    // thick wheel z 54..94 on its pin
    o.B = P.spurGear({ teeth: NB, module: MD, width: 40, material: c.mat("thick") }); P.at(o.B, XB, 0, 74, arm);
    P.at(P.box(22, 4, 1, c.mat("thick", "dark")), 20, 0, 20.8, o.B);         // stripe r 9..31, z 94.3..95.3, lifted off the top face
    [XB, XT].forEach(function (x) {
      P.at(P.cylZ(4, 48, c.mat("arm")), x, 0, 74, arm);                      // pin z 50..98
      P.at(P.cylZ(8, 4, c.mat("arm")), x, 0, 52, arm);                       // washer z 50..54 under the lowest wheel
      P.at(P.cylZ(7, 6, c.mat("arm", "dark")), x, 0, 37, arm);               // nut z 34..40 under the arm
    });
    P.at(P.cylZ(8, 5, c.mat("arm")), XT, 0, 66.5, arm);                      // spacers z 64..69 and 79..84 between the thin wheels
    P.at(P.cylZ(8, 5, c.mat("arm")), XT, 0, 81.5, arm);
    o.pB = o.B.rotation.z = P.meshTurn(o.A, o.B);
    // three thin wheels of the same pitch radius: 21, 20 and 19 teeth, z 84..94, 69..79, 54..64
    [["top", 21, 89], ["mid", 20, 74], ["low", 19, 59]].forEach(function (s) {
      var md = 2 * R / s[1], g = P.spurGear({ teeth: s[1], module: md, width: 10, material: c.mat(s[0]) });
      P.at(g, XT, 0, s[2], arm);
      var p = g.rotation.z = P.meshTurn(o.B, g);
      var j = Math.round(-p / g.pitch), m = new T.Group(); m.rotation.z = j * g.pitch; g.add(m);          // the tooth that starts nearest to pointing along the arm
      P.at(P.box(.4, .2 * g.pitch * (R + md), 9, c.mat(s[0], "mark")), R + md + .3, 0, 0, m);             // red cap on that tooth's tip, .1 to .5 off it
      P.at(P.box(R - 1.25 * md - 12, 3, .6, c.mat(s[0], "mark")), (R - 1.25 * md + 10) / 2, 0, 5.6, m);   // red stripe r 10..root-2 on the top face, .3 to .9 off it
      o.thin.push({ g: g, N: s[1], p: p });
    });
    o.pairs = [[o.A, o.B]].concat(o.thin.map(function (t) { return [o.B, t.g]; }));
  },

  step: function (c, dt, S) {
    var o = this.o, ids = ["e", "f", "g"];
    o.th += S.w * dt;
    o.arm.rotation.z = o.th;
    o.B.rotation.z = o.pB + o.th * o.NA / o.NB;          // seen from the arm the fixed wheel turns backwards, so the thick wheel spins forwards
    function f(v) { v = Math.round(v * 100) / 100; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    o.thin.forEach(function (t, i) {
      t.g.rotation.z = t.p - o.th * o.NA / t.N;          // and each thin gear spins backwards on the pin, by the fixed gear's teeth over its own
      S.set(ids[i], f(rpm * (1 - o.NA / t.N)));          // arm's turn plus that spin
    });
  }
});
