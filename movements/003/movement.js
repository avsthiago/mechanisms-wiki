M507.define({
  number: 3,
  title: "Belt round a corner on guide pulleys",
  lede: "A belt carries turning from one shaft to another that points a different way, at a right angle. Two small guide pulleys lead the belt round the corner. Each one carries one half of the belt.",
  alt: "A large spoked pulley at the top right, two small guide pulleys side by side at the top left, and a pulley at the bottom whose shaft runs left to right. One flat belt runs from the large pulley over the guide pulleys and down to the bottom pulley.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving pulley", note: "The large pulley at the top right. Its shaft points straight at you. It pulls the belt along." },
    { key: "driven", color: "#C8873A", name: "Driven pulley", note: "The pulley at the bottom. Its shaft runs from left to right, at a right angle to the top shaft. Turn the model to watch its dark spoke." },
    { key: "guide", color: "#4FA58A", name: "Guide pulleys", note: "Two small pulleys side by side on one fixed pin. Each carries one half of the belt round the corner. They turn opposite ways." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One flat loop of leather. On the way down to the bottom pulley each half makes a quarter turn. Watch the red mark go round." }
  ],
  controls: [{ id: "dir", label: "Turn the top pulley", value: "1", options: [["1", "Forwards"], ["-1", "Backwards"]] }],
  readouts: [{ id: "in", label: "Top pulley" }, { id: "out", label: "Bottom pulley" }, { id: "gd", label: "Guide pulleys" }],
  views: { "3d": [520, 220, 640], front: [0, 0, 820], side: [820, 0, 0] },
  target: [0, -5, 0],
  how: [
    "The top pulley pulls the belt. One half runs left over the front guide pulley and drops straight down. It goes under the bottom pulley, comes up to the back guide pulley, and runs back to the top pulley.",
    "On the way down, each half of the belt makes a quarter turn. That lets it lie flat on the bottom pulley, whose shaft points another way. The two halves move in opposite directions, so the guide pulleys turn opposite ways. That is why there are two.",
    "Try forwards, then backwards. The belt runs just as well both ways. A belt twisted straight from one shaft to the other, with no guide pulleys, runs off its pulleys when turned backwards."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the distance between the shafts and the frame are made up. Brown does not say which pulley drives; here the large one does. The two guide pulleys share one pin, so the belt runs to the top pulley at a slight slant. A real drive would tilt them a little so the belt runs straight on.",

  build: function (c) {
    var P = c.P, scene = c.scene, o = this.o = { a: 0, ag: 0, ab: 0, s: 0, T: 4,
      D: [90, 110], rD: 56, G: [-70, 125], rG: 28, rb: 28, yb: -110 };
    o.xb = o.G[0] - o.rG;                       // the belt drops straight down from the left side of the guide pulleys
    var T = o.T;
    // driving pulley, axis Z, rim z -12..12
    o.pd = P.at(P.pulley({ radius: o.rD - T / 2 - 2, width: 24, material: c.mat("drive") }), o.D[0], o.D[1], 0, scene);
    o.pd.spokes[0].material = c.mat("drive", "dark");
    P.at(P.cylZ(7, 88, c.mat("drive")), o.D[0], o.D[1], -28, scene);          // shaft z -72..16, from the boss face to past the pulley
    // guide pulleys at z +28 (front, 17..39) and -28 (back, -39..-17), loose on one fixed pin
    o.ga = P.at(P.pulley({ radius: o.rG - T / 2 - 2, width: 22, material: c.mat("guide") }), o.G[0], o.G[1], o.rb, scene);
    o.gb = P.at(P.pulley({ radius: o.rG - T / 2 - 2, width: 22, material: c.mat("guide") }), o.G[0], o.G[1], -o.rb, scene);
    o.ga.spokes[0].material = o.gb.spokes[0].material = c.mat("guide", "dark");
    P.at(P.cylZ(4, 115, c.mat("guide", "dark")), o.G[0], o.G[1], -14.5, scene); // pin z -72..43, thinner than the hubs (radius 6)
    // driven pulley, axis X, rim x -112..-84
    var hold = P.at(new c.THREE.Group(), o.xb, o.yb, 0, scene); hold.rotation.y = Math.PI / 2;
    o.pb = P.at(P.pulley({ radius: o.rb - T / 2 - 2, width: 28, material: c.mat("driven") }), 0, 0, 0, hold);
    o.pb.spokes[0].material = c.mat("driven", "dark");
    P.at(P.cylX(4, 90, c.mat("driven")), -95, o.yb, 0, scene);              // shaft x -140..-50, between the pedestal faces; thinner than the hub (radius 6)
    // frame
    [o.D, o.G].forEach(function (p) { P.at(P.cylZ(16, 12, c.fixed), p[0], p[1], -78, scene); }); // bosses z -84..-72
    P.at(P.box(300, 150, 12, c.fixed), 15, 115, -90, scene);                 // back plate x -135..165, y 40..190, z -96..-84
    P.at(P.box(24, 240, 12, c.fixed), 150, -80, -90, scene);                 // post x 138..162, y -200..40, z -96..-84
    P.at(P.box(20, 100, 30, c.fixed), -150, -150, 0, scene);                 // pedestal x -160..-140, y -200..-100
    P.at(P.box(20, 100, 30, c.fixed), -40, -150, 0, scene);                  // pedestal x -50..-30, y -200..-100
    P.at(P.box(360, 12, 141, c.fixed), -15, -206, -25.5, scene);             // base x -195..165, y -212..-200, z -96..45

    // belt path: round the top pulley anticlockwise, over the front guide, down, under the bottom pulley, up, over the back guide
    var dx = o.D[0] - o.G[0], dy = o.D[1] - o.G[1], d = Math.sqrt(dx * dx + dy * dy), be = Math.atan2(dy, dx);
    var nA = be + Math.acos((o.rG - o.rD) / d);   // open run: tops of both pulleys
    var nB = be + Math.acos((o.rG + o.rD) / d);   // crossed run: upper right of the guide to lower left of the top pulley
    var Z = [0, 0, 1], X = [1, 0, 0], sw = ((nA - nB - Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    o.belt = P.at(P.beltPath({ width: 18, thick: T, material: c.mat("belt") }), 0, 0, 0, scene);
    o.belt.set([
      { c: [o.D[0], o.D[1], 0], axis: Z, u: X, r: o.rD, a0: nB + Math.PI, sweep: sw },
      { c: [o.G[0], o.G[1], o.rb], axis: Z, u: X, r: o.rG, a0: nA, sweep: Math.PI - nA },
      { c: [o.xb, o.yb, 0], axis: X, u: Z, r: o.rb, a0: 0, sweep: Math.PI },
      { c: [o.G[0], o.G[1], -o.rb], axis: Z, u: X, r: o.rG, a0: Math.PI, sweep: nB - Math.PI }
    ]);
    o.mark = P.at(P.box(14, T + 2, 19, c.mat("belt", "mark")), 0, 0, 0, o.belt);
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w * +S.controls.dir, v = w * o.rD;     // belt speed
    o.a += w * dt; o.ag += v / o.rG * dt; o.ab += v / o.rb * dt; o.s += v * dt;
    o.pd.rotation.z = o.a;
    o.ga.rotation.z = o.ag; o.gb.rotation.z = -o.ag;            // the two halves of the belt run opposite ways
    o.pb.rotation.z = o.ab;
    o.belt.place(o.mark, o.s);
    var r = S.playing ? S.rpm : 0, k = o.rD / o.rb, g = o.rD / o.rG;
    function f(x) { return (x % 1 ? x.toFixed(1) : x) + " rpm"; }
    S.set("in", f(r));
    S.set("out", f(r * k));
    S.set("gd", f(r * g));
  }
});
