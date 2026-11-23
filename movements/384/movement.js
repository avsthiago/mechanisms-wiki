M507.define({
  number: 384,
  title: "Helicograph",
  lede: "A small wheel runs round a pin stuck in the paper and draws a spiral. The wheel sits on a screw, so each time it rolls it also creeps along the screw. That slowly moves it further from the pin, or nearer to it.",
  alt: "A pin with a flat head stands in a sheet of paper. A threaded rod is fixed to a plate on the pin and lies flat above the paper. Near its far end a small wheel with a milled edge, held by a nut, rests on the paper.",
  parts: [
    { key: "pin", color: "#4FA58A", name: "Centre pin", note: "Stuck in the paper and does not move. Everything else turns round it." },
    { key: "arm", color: "#5E7387", name: "Screw rod", note: "A rod with a screw thread, fixed to a plate that turns on the pin. It does not spin on its own length." },
    { key: "wheel", color: "#C8873A", name: "Wheel and nut", note: "The wheel is screwed onto the rod. It rolls on the paper, and as it turns it walks along the thread. Watch the red stripe to see it spin." },
    { key: "paper", color: "#E8E2D0", name: "Paper", note: "Coloured transfer paper lies face down on it, so the pressing wheel leaves a line." }
  ],
  controls: [{ id: "pitch", label: "Thread on the rod", value: "3", options: [["3", "Fine"], ["6", "Coarse"]] }],
  speed: { min: 5, max: 60, value: 10, label: "Turning speed", unit: "rpm" },
  readouts: [{ id: "n", label: "Turns" }, { id: "r", label: "From pin" }, { id: "g", label: "Line gap" }],
  views: { "3d": [240, 115, 320], front: [115, 70, 350], top: [115, 720, 1] },
  viewLabels: { top: "Paper" },
  target: [115, 25, 0],
  distance: [200, 1600],
  how: [
    "Push the rod round the pin and the wheel rolls on the paper. The wheel is screwed onto the rod like a nut on a bolt. So while it rolls, it also moves along the rod. The line it leaves is not a circle but a spiral.",
    "The further the wheel is from the pin, the longer its trip round, and the more times it spins. More spins mean more thread, so it moves out further each time. That is why the gaps between the lines grow wider towards the outside. Turn the rod the other way and the wheel walks back in along the same spiral.",
    "The thread sets how far the wheel moves for each spin. Try Fine, then Coarse, and compare how close the lines lie."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes of the wheel, the rod and the thread are made up. The rod is turned round for you, out to the end of the thread and then back. The drawn line is shown where the wheel touches; the transfer paper itself is left out.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { Rw: 34.5, H: 34.5, r: 140, th: 0, dir: 1, phi: 0, turns: 0, rMin: 60, rMax: 214, pitch: null, X0: 22, X1: 245 };
    // paper: top face at y = 0
    P.at(P.box(520, 2, 520, c.mat("paper")), 110, -1, 0, scene);                 // y -2..0
    // centre pin: needle from the paper up through the plate, then a shank and a flat head with a hole
    var mp = c.mat("pin");
    var nd = new T.Mesh(new T.CylinderGeometry(2.4, .4, o.H + 3, 16), mp); nd.position.y = (o.H + 3) / 2 - .5; scene.add(nd);   // y -0.5..37.5 (tip just into the paper)
    var sk = new T.Mesh(new T.CylinderGeometry(5.5, 3, 24, 24), mp); sk.position.y = o.H + 3.5 + 12; scene.add(sk);           // y 38..62, plate top 37.5 just below
    P.at(P.cylY(13, 5, mp), 0, 64.5, 0, scene);                                   // head y 62..67
    P.at(P.cylY(3.5, 1, c.mat("pin", "dark")), 0, 67.3, 0, scene);                // hole mark y 66.8..67.8, top lifted 0.8 off the head
    // the arm turns about the pin (axis Y through the origin)
    var A = o.arm = new T.Group(); scene.add(A);
    var ma = c.mat("arm");
    P.at(P.cylY(11, 7, ma), 0, o.H, 0, A);                                        // round end of the plate y 31..38, round the needle
    P.at(P.box(o.X0 + 4, 7, 22, ma), (o.X0 + 4) / 2, o.H - .2, 0, A);             // plate x 0..26 (axle starts at 22, inside it), y 30.8..37.8, offset so faces never share a plane
    o.wormHold = P.at(new T.Group(), (o.X0 + o.X1) / 2, o.H, 0, A);
    // wheel on the rod: knurled disc, nut on its outer side; axis local X
    var W = o.wheel = P.at(new T.Group(), o.r, o.H, 0, A);
    o.spin = P.at(new T.Group(), 0, 0, 0, W);
    var g = P.spurGear({ teeth: 44, module: 1.5, width: 5, material: c.mat("wheel") });   // tips at 33 + 1.5 = 34.5 = Rw, x -2.5..2.5
    g.rotation.y = Math.PI / 2; o.spin.add(g);
    var nut = new T.Mesh(new T.CylinderGeometry(10, 10, 18, 6), c.mat("wheel")); nut.rotation.z = Math.PI / 2; nut.position.x = 11.5; o.spin.add(nut);   // x 2.5..20.5
    P.at(P.box(.8, 18, 3, c.mat("wheel", "mark")), 2.9, 21, 0, o.spin);           // stripe on the outer face, x 2.5..3.3, r 12..30, beside the nut
    // the drawn line, just above the paper
    o.line = P.trail({ color: 0x2A3540, max: 14000, step: 1.2 }); scene.add(o.line);
  },

  step: function (c, dt, S) {
    var o = this.o, p = +S.controls.pitch, P = c.P;
    if (p !== o.pitch) {                      // new thread: new rod, fresh paper
      o.pitch = p;
      if (o.worm) { o.wormHold.remove(o.worm); }
      o.worm = P.worm({ radius: 5, pitch: p, length: o.X1 - o.X0, material: c.mat("arm") });
      o.wormHold.add(o.worm);
      o.line.clear();
    }
    var k = p / (2 * Math.PI * o.Rw);         // the wheel moves one thread per spin: dr / dth = k r
    var d = S.w * dt * o.dir;
    o.th += d; o.turns += Math.abs(d) / (2 * Math.PI);
    var r0 = o.r; o.r *= Math.exp(k * d);
    if (o.r >= o.rMax) { o.r = o.rMax; o.dir = -1; }
    if (o.r <= o.rMin) { o.r = o.rMin; o.dir = 1; }
    o.phi -= (o.r + r0) / 2 * d / o.Rw;        // rolling without slipping
    o.arm.rotation.y = o.th;
    o.wheel.position.x = o.r;
    o.spin.rotation.x = o.phi;
    o.line.push(o.r * Math.cos(o.th), .6, -o.r * Math.sin(o.th));
    S.set("n", Math.floor(o.turns) + "");
    S.set("r", Math.round(o.r) + " mm");
    S.set("g", (o.r * (Math.exp(2 * Math.PI * k) - 1)).toFixed(1) + " mm");
  }
});
