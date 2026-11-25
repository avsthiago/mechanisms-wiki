M507.define({
  number: 506,
  title: "Epicyclic train with both ends moving",
  lede: "One crank drives two sets of gears in opposite directions at nearly the same speed. An arm between them, carrying two small gears, picks up only what is left over. So a fast crank gives a very slow, strong turn of the arm.",
  alt: "An upright shaft in a frame, with a driving shaft coming in from the left. The driving shaft has two bevel gears, a big one and a smaller one. The big one drives a big gear at the top of the upright shaft, the smaller one a big gear at the bottom. Between them an arm on the upright shaft carries a pair of small bevel gears that mesh with a small gear above and a middle-sized gear below.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Driving shaft", note: "The level shaft with the handle. It has two bevel gears. One drives the big upper gear and the other the big lower gear." },
    { key: "lower", color: "#C8873A", name: "Lower gears", note: "A big gear and a smaller one on top of it, joined together. They turn loosely on the upright shaft." },
    { key: "upper", color: "#4FA58A", name: "Big upper gear", note: "Driven by the driving shaft the opposite way to the lower gears. A tube hangs down from it towards the small upper gear." },
    { key: "f", color: "#8E7AA8", name: "Small upper gear", note: "Faces down onto the smaller of the two gears on the arm. It is either joined to the big upper gear or left loose." },
    { key: "planet", color: "#D9B13B", name: "Gears on the arm", note: "Two gears joined together that spin on the arm. The bigger one meshes with the lower gears, the smaller one with the small upper gear." },
    { key: "arm", color: "#E8E2D0", name: "Arm and upright shaft", note: "The arm is fixed to the upright shaft. Watch the red nut on its end to see how slowly it goes round." }
  ],
  controls: [{ id: "top", label: "Big upper gear", value: "joined", options: [["joined", "Joined to the small upper gear"], ["shaft", "Fixed to the upright shaft"]] }],
  readouts: [{ id: "c", label: "Lower gears" }, { id: "f", label: "Small upper" }, { id: "a", label: "Arm" }],
  speed: { min: 1, max: 30, value: 12, label: "Crank speed", unit: " rpm" },
  views: { "3d": [286, 186, 709], front: [-45, 5, 800], side: [760, 70, 60] },
  target: [-45, 5, 0],
  how: [
    "Turn the crank. One of its gears drives the big gear at the top, the other the big gear below. They are driven from opposite edges, so they turn opposite ways. Each carries a smaller gear that faces the arm in the middle.",
    "The pair of gears on the arm is caught between those two. If the upper and lower gears pushed it equally, the pair would only spin and the arm would stand still. The two pushes are not quite equal, so the arm creeps round at the small difference. That is the sum of two motions, one of them backwards.",
    "Brown gives another way to connect it. Fix the big upper gear to the upright shaft, so it turns the arm directly, and leave the small upper gear loose. Now the motions add instead of cancelling, and the small upper gear spins fastest of all. Try both and compare the readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. The drawing shows the arm set a little above the driving shaft; here they are level, and the gears in the middle are a little smaller so the arm can swing past the driving shaft's gears. The shape of the frame, the sizes and the number of teeth were made up. The model does not show the pin or screw that would join the big upper gear to the small one or to the shaft.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = 3;                       // every wheel's pitch radius is 3 x its teeth, so all teeth are one size
    var o = this.o = { ph: 0, aL: 0, aF: 0, aG: 0, th: 0, Na: 28, Nb: 36, Nh: 40, Ng: 50, Nc: 20, Nd: 14, Ne: 7, Nf: 12 };
    var X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), NX = new T.Vector3(-1, 0, 0), NY = new T.Vector3(0, -1, 0);
    function gear(key, parent, ax, xl, n, nm, face, hl) { // bevel wheel of n teeth meshing with one of nm teeth; all cone points at the origin
      var h = new T.Group(), g = P.bevelGearCone({ radius: K * n, teeth: n, cone: Math.atan2(n, nm) * 180 / Math.PI, face: face, addendum: 5, hub: n < 10 ? 11 : 14, hubLength: hl || 16, material: c.mat(key) });
      P.frame(h, xl, ax); parent.add(h); h.add(g); return g;
    }
    // driving shaft along x: small wheel at x -108, big wheel at x -150, crank on the left end
    var drv = o.drv = new T.Group(); scene.add(drv);
    o.a = gear("crank", drv, NX, Y, o.Na, o.Nb, .8, 12);                     // inner face x -88.8, hub back x -123.1
    o.h = gear("crank", drv, NX, Y, o.Nh, o.Ng, .85);                        // inner face x -130.2 (7 clear of the small wheel), hub back x -169.1
    P.at(P.cylX(7, 146, c.mat("crank")), -173, 0, 0, drv);                   // shaft x -246..-100, ends inside the small wheel
    P.at(P.cylX(13, 14.9, c.mat("crank")), -176.55, 0, 0, drv);              // collar x -184..-169.1, between the column and the big wheel
    P.at(P.box(8, 70, 16, c.mat("crank")), -250, -25, 0, drv);               // crank x -254..-246, y -60..10, on the shaft end
    P.at(P.cylX(6, 26, c.mat("crank", "dark")), -267, -50, 0, drv);          // handle x -280..-254, on the crank face
    // bottom wheels: big one at y -84, smaller one on top of it at y -42
    o.b = gear("lower", scene, NY, X, o.Nb, o.Na, .68);                      // hub back y -103.9
    o.c = gear("lower", scene, NY, X, o.Nc, o.Nd, .68, 14);                  // its hub reaches into the big wheel's inner face (y -59.8)
    // big top wheel at y 120 with a tube down to the small top wheel at y 21
    o.g = gear("upper", scene, Y, X, o.Ng, o.Nh, .68);                       // inner face y 84.3, hub back y 139.9
    P.at(P.cylY(13, 49, c.mat("upper")), 0, 62, 0, o.g);                     // tube y 37.5..86.5, into the wheel's inner face
    o.f = gear("f", scene, Y, X, o.Nf, o.Ne, .68, 12);                       // hub back y 37.3, just under the tube
    // upright shaft with the arm; the pair of wheels turns on the arm
    var arm = o.arm = new T.Group(); scene.add(arm);
    P.at(P.cylY(7, 268, c.mat("arm")), 0, 22, 0, arm);                       // shaft y -112..156, between the step and the top arm of the frame
    P.at(P.cylY(12, 24, c.mat("arm")), 0, 0, 0, arm);                        // boss y -12..12
    P.at(P.cylX(6, 76, c.mat("arm")), 38, 0, 0, arm);                        // arm x 0..76
    P.at(P.cylX(10, 6, c.mat("arm", "mark")), 79, 0, 0, arm);                // red nut x 76..82, 1 clear of the pair's hub (x 74.9); it passes 6.8 from the driving shaft's small wheel
    o.d = gear("planet", arm, X, Y, o.Nd, o.Nc, .8, 12);                     // bigger wheel of the pair at x 60, inner face x 50.3, hub back x 74.9
    o.e = gear("planet", arm, X, Y, o.Ne, o.Nf, .68, 12);                    // smaller wheel at x 36, its hub back x 50.5 inside the bigger one
    // frame: base, step under the shaft, column with a hole for the driving shaft, arm over the top
    P.at(P.box(440, 12, 240, c.fixed), -30, -156, 0, scene);                 // base x -250..190, y -162..-150
    P.at(P.box(40, 38, 40, c.fixed), 0, -131, 0, scene);                     // step y -150..-112; the upright shaft ends on its top
    var col = P.guideBlock({ w: 322, h: 22, d: 40, hole: 7.5, hx: -11, material: c.fixed }); col.rotation.z = Math.PI / 2;
    P.at(col, -195, 11, 0, scene);                                           // column x -206..-184, y -150..172, hole on the driving shaft's line (y 0)
    P.at(P.box(204, 16, 40, c.fixed), -82, 164, 0, scene);                   // top arm x -184..20, y 156..172, from the column's face over the shaft
    // starting phases, link by link
    o.pb = o.b.rotation.y = P.meshTurn(o.a, o.b);
    o.pd = o.d.rotation.y = P.meshTurn(o.c, o.d);
    o.pf = o.f.rotation.y = P.meshTurn(o.e, o.f);
    o.pg = o.g.rotation.y = P.meshTurn(o.h, o.g);
    o.pairs = [[o.a, o.b], [o.h, o.g], [o.c, o.d], [o.e, o.f]];
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w, rpm = S.playing ? S.rpm : 0;
    // speeds about the upright shaft, as shares of the crank's speed
    var kL = -o.Na / o.Nb, kG = o.Nh / o.Ng;             // bottom wheels and big top wheel, driven from opposite edges
    var k = (o.Nc * o.Ne) / (o.Nd * o.Nf);               // seen from the arm: small top wheel = -k x bottom wheels
    var kA, kF;
    if (S.controls.top === "shaft") { kA = kG; kF = kA * (1 + k) - k * kL; }   // arm driven, small upper gear takes the sum
    else { kF = kG; kA = (kF + k * kL) / (1 + k); }                            // both ends driven, arm takes what is left
    o.ph += w * dt; o.aL += w * kL * dt; o.aG += w * kG * dt; o.aF += w * kF * dt; o.th += w * kA * dt;
    var spin = (o.aL - o.th) * o.Nc / o.Nd;              // the pair's spin on the arm
    o.drv.rotation.x = o.ph;
    o.b.rotation.y = o.pb - o.aL; o.c.rotation.y = -o.aL;   // their own axes point down, so the sign flips
    o.g.rotation.y = o.pg + o.aG;
    o.f.rotation.y = o.pf + o.aF;
    o.arm.rotation.y = o.th;
    o.d.rotation.y = o.pd + spin; o.e.rotation.y = spin;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("c", f(rpm * kL)); S.set("f", f(rpm * kF)); S.set("a", f(rpm * kA));
  }
});
