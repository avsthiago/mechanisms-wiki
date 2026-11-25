M507.define({
  number: 507,
  title: "Epicyclic train for very slow motion",
  lede: "Seven gears are arranged so that two almost equal motions cancel each other. What is left is tiny. The arm at the top must go round 25,000 times to turn the big gear at the side just once.",
  alt: "An upright fixed shaft on a base. Two tubes turn on it, one inside the other, each with a small bevel gear low down and a big flat gear high up. A big bevel gear on a bracket at the right meshes with both small bevel gears. At the top an arm reaches to the left and carries two more flat gears, joined together, that mesh with the two on the tubes.",
  parts: [
    { key: "arm", color: "#5E7387", name: "Arm", note: "Turns freely on top of the fixed shaft and carries the pair of gears round. Its speed is set by the speed slider." },
    { key: "pair", color: "#C8873A", name: "Gears on the arm", note: "Two gears joined together on a pin at the end of the arm. Each one meshes with one of the two gears on the tubes." },
    { key: "long", color: "#4FA58A", name: "Long tube", note: "Turns on the fixed shaft. It has the upper gear at its top end and the lowest small bevel gear at its foot. The dark peg on the gear shows it creeping." },
    { key: "short", color: "#D9B13B", name: "Short tube", note: "Turns on the long tube. It has the second gear and the upper small bevel gear. It creeps the opposite way to the long tube." },
    { key: "big", color: "#8E7AA8", name: "Big gear", note: "A bevel gear on a bracket. It meshes with both small bevel gears, so the two tubes must turn opposite ways. Watch the red peg near its rim." }
  ],
  controls: [{ id: "fast", label: "Time", value: "1", options: [["1", "Real speed"], ["200", "200 times faster"]] }],
  readouts: [{ id: "a", label: "Arm" }, { id: "e", label: "Upper gear" }, { id: "c", label: "Big gear" }],
  speed: { min: 1, max: 30, value: 12, label: "Arm speed", unit: " rpm" },
  views: { "3d": [276, 216, 752], front: [-75, 25, 860], side: [860, 60, 60] },
  target: [-75, 25, 0],
  how: [
    "The arm whirls round and its pair of gears rolls round the two gears below it. Those two gears hardly seem to move. The big gear at the side meshes with both tubes, one above its centre and one below, so the tubes can only turn opposite ways at the same speed.",
    "The two gears on the arm are joined, so they must turn together. The upper pair of gears has 61 and 49 teeth and the lower pair 51 and 41. Those two ratios are almost the same, but not quite. To satisfy both, the tubes must creep by one turn for every 2,500 turns of the arm. The big gear has ten times as many teeth as the small bevel gears, so it turns ten times slower still.",
    "At real speed you will not see the big gear move. Choose 200 times faster. The arm becomes a blur, the two pegs on the gears drift opposite ways, and the red peg on the big gear just creeps."
  ],
  note: "This model is rebuilt from Brown's drawing, with the tooth numbers he gives. With those numbers the two pairs of gears would not be the same distance apart, so the lower pair has slightly bigger teeth. The base, the bracket, the collars and the pegs were made up. The fast setting only speeds up time; the gears are the same.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = Math.PI / 2;
    var o = this.o = { th: 0, aE: 0, aC: 0, NA: 10, NC: 100, ND: 10, NE: 61, NF: 49, NG: 41, NH: 51 };
    var X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), Z = new T.Vector3(0, 0, 1), NY = new T.Vector3(0, -1, 0);
    var RC = 130, RP = RC * o.NA / o.NC, cone = Math.atan2(o.NA, o.NC) * 180 / Math.PI;   // small bevel wheels radius 13, cone half-angle 5.71 degrees
    function bevel(key, parent, ax, xl, big) {           // all three bevel wheels share a cone point at the origin, on the fixed shaft
      var h = new T.Group(), g = P.bevelGearCone(big ? { radius: RC, teeth: o.NC, cone: 90 - cone, face: .8, addendum: 3, hub: 16, hubLength: 16, material: c.mat(key) }
        : { radius: RP, teeth: o.NA, cone: cone, face: .8, addendum: 3, hub: 7, hubLength: 12, material: c.mat(key) });
      P.frame(h, xl, ax); parent.add(h); h.add(g); return g;
    }
    function flat(key, parent, n, md, x, y) {            // spur gear lying flat (axis upright), 10 thick, centred at height y
      var h = new T.Group(); h.rotation.x = -D; h.position.set(x, y, 0); parent.add(h);
      var g = P.spurGear({ teeth: n, module: md, width: 10, material: c.mat(key) }); h.add(g); return g;
    }
    var M1 = 3, dist = (o.NE + o.NF) * M1 / 2, M2 = 2 * dist / (o.NH + o.NG);              // centres 165 apart; lower pair's module 3.587
    // big wheel on the right, its back pitch circle at x 13
    o.C = bevel("big", scene, X, Y, true);                                   // hub back at x 31.99
    var xb = o.C.backY;
    var peg = P.cylY(5, 9, c.mat("big", "mark")); P.at(peg, 118, 26.5, 0, o.C);            // red peg standing on the wheel's back, x 22..31, clear of the bracket (x 32)
    // long tube: lowest bevel wheel (teeth up, body y -104.2..-142.3), tube, top gear y 190..200
    o.D = bevel("long", scene, NY, X);
    var yb = o.D.backY;                                                      // 130 + 0.3 + 12 = 142.3
    var lt = new T.Group(); scene.add(lt); o.lt = lt;
    P.at(P.cylY(6.5, 306, c.mat("long")), 0, 48, 0, lt);                     // tube y -105..201, from inside the lowest bevel wheel to just above the top gear
    o.E = flat("long", lt, o.NE, M1, 0, 195);
    P.at(P.cylY(3.5, 6, c.mat("long", "dark")), 75, 203, 0, lt);             // peg y 200..206 on the top gear, under the arm (y 208)
    // short tube: upper bevel wheel (body y 104.2..142.3), tube y 142..160, second gear y 160..170
    o.A = bevel("short", scene, Y, X);
    var st = new T.Group(); scene.add(st); o.st = st;
    P.at(P.cylY(9, 19, c.mat("short")), 0, 151, 0, st);                      // tube y 141.5..160.5, round the long tube
    o.H = flat("short", st, o.NH, M2, 0, 165);
    P.at(P.cylY(3.5, 6, c.mat("short", "dark")), 75, 157, 0, st);            // peg y 154..160 under the second gear
    // arm on top, reaching left to the pin that carries the pair
    var arm = o.arm = new T.Group(); scene.add(arm);
    P.at(P.cylY(10, 14, c.mat("arm")), 0, 209, 0, arm);                      // hub y 202..216
    P.at(P.box(dist, 8, 16, c.mat("arm")), -dist / 2, 212, 0, arm);          // bar x -165..0, y 208..216
    P.at(P.cylY(10, 8, c.mat("arm")), -dist, 212, 0, arm);                   // round end y 208..216
    P.at(P.cylY(4, 58, c.mat("arm")), -dist, 179, 0, arm);                   // pin y 150..208, down from the arm
    P.at(P.cylY(7, 7.5, c.mat("arm")), -dist, 204.25, 0, arm);               // collar y 200.5..208 above the pair
    P.at(P.cylY(7, 7, c.mat("arm", "dark")), -dist, 156, 0, arm);            // nut y 152.5..159.5 under the pair
    o.F = flat("pair", arm, o.NF, M1, -dist, 195);
    o.G = flat("pair", arm, o.NG, M2, -dist, 165);
    var sl = P.cylZ(9, 20, c.mat("pair")); P.at(sl, 0, 0, -15, o.F);         // tube between the two gears, y 170..190
    P.at(P.box(40, 4, .8, c.mat("pair", "dark")), 40, 0, 5.7, o.F);          // stripe r 20..60 on the upper gear's top face, y 200.3..201.1
    // supports: fixed shaft, a collar the lowest wheel sits on, base, bracket for the big wheel
    P.at(P.cylY(3.5, 385, c.fixed), 0, 27.5, 0, scene);                      // fixed shaft y -165..220, inside the tubes
    P.at(P.cylY(12, 165 - yb, c.fixed), 0, -(165 + yb) / 2, 0, scene);       // collar y -165..-142.3, under the lowest bevel wheel
    P.at(P.box(240, 12, 150, c.fixed), 10, -171, 0, scene);                  // base x -110..130, y -177..-165
    P.at(P.box(24, 190, 32, c.fixed), xb + 12, -70, 0, scene);               // bracket x 31.99..55.99, y -165..25, against the big wheel's hub
    // starting phases
    o.pA = o.A.rotation.y = P.meshTurn(o.C, o.A);
    o.pD = o.D.rotation.y = P.meshTurn(o.C, o.D);
    o.pF = o.F.rotation.z = P.meshTurn(o.E, o.F);
    o.pG = o.G.rotation.z = P.meshTurn(o.H, o.G);
    o.pairs = [[o.C, o.A], [o.C, o.D], [o.E, o.F], [o.H, o.G]];
  },

  step: function (c, dt, S) {
    var o = this.o, fast = +S.controls.fast || 1, w = S.w * fast;
    // the two tubes turn opposite ways (e and -e). Seen from the arm, the joined pair must suit both gears:
    // (NE / NF)(e - arm) = (NH / NG)(-e - arm), so arm = e (NE NG + NH NF) / (NE NG - NH NF) = 2500 e. The big wheel turns e x ND / NC.
    var kE = (o.NE * o.NG - o.NH * o.NF) / (o.NE * o.NG + o.NH * o.NF), kC = kE * o.ND / o.NC;
    o.th += w * dt; o.aE += w * kE * dt; o.aC += w * kC * dt;
    var rel = -(o.aE - o.th) * o.NE / o.NF;              // the pair's spin on its pin
    o.arm.rotation.y = o.th;
    o.lt.rotation.y = o.aE; o.D.rotation.y = o.pD - o.aE;    // the lowest wheel's own axis points down
    o.st.rotation.y = -o.aE; o.A.rotation.y = o.pA - o.aE;
    o.C.rotation.y = o.aC;
    o.F.rotation.z = o.pF + rel; o.G.rotation.z = o.pG + rel;
    function f(v) { v = +v.toPrecision(2); return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = (S.playing ? S.rpm : 0) * fast;
    S.set("a", f(rpm)); S.set("e", f(rpm * kE)); S.set("c", f(rpm * kC));
  }
});
