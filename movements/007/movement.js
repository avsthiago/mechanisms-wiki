M507.define({
  number: 7,
  title: "Engaging, disengaging and reversing gear",
  lede: "One belt can turn an upright shaft one way, the other way, or not at all. You only slide the belt sideways onto a different pulley. The engine above never has to stop or change direction.",
  alt: "A wide pulley at the top drives a belt down to three narrow pulleys on a horizontal shaft. A thin shaft runs inside a hollow one. Two bevel gears on them face each other and both mesh with a third bevel gear on an upright shaft. A fork holds the belt.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving pulley", note: "A wide pulley on the top shaft, turned by an engine. It always turns the same way. It is wide enough for the belt in any position." },
    { key: "hollow", color: "#C8873A", name: "Hollow shaft", note: "A tube with the left pulley fixed at one end and the right-hand bevel gear at the other. The dark stripe shows it turning." },
    { key: "out", color: "#4FA58A", name: "Upright shaft", note: "Turned by the top bevel gear, which sits between the two lower gears. Watch the red pointer to see which way it turns." },
    { key: "belt", color: "#D9B13B", name: "Belt and fork", note: "The belt carries the turning down to one of the three narrow pulleys. The fork slides it sideways from one pulley to the next." },
    { key: "loose", color: "#E8E2D0", name: "Loose pulley", note: "The middle pulley. It is not fixed to its shaft. With the belt on it, it just spins on its own." },
    { key: "inner", color: "#8E7AA8", name: "Inner shaft", note: "Runs inside the tube and sticks out at both ends. The right pulley is fixed to one end and the left-hand bevel gear to the other." }
  ],
  controls: [{ id: "belt", label: "Belt position", value: "fwd", options: [["fwd", "Forward"], ["loose", "Loose"], ["rev", "Reverse"]] }],
  readouts: [{ id: "b", label: "Hollow" }, { id: "a", label: "Inner" }, { id: "c", label: "Upright" }],
  views: { "3d": [430, 250, 700], front: [-15, 35, 800], side: [800, 35, 0] },
  target: [-15, 35, 0],
  how: [
    "Three narrow pulleys sit side by side under the belt. Only the one under the belt gets pulled round. The fork slides the belt from one pulley to the next, while the top pulley keeps turning the same way.",
    "The left pulley is fixed to a hollow tube, which carries a bevel gear. The right pulley is fixed to a thin shaft that runs inside the tube and carries a second bevel gear at the far end. These two gears face each other on either side of the top gear. So one turns the upright shaft one way, and the other turns it the other way.",
    "The middle pulley is loose, so it spins alone and nothing else moves. Try Forward, then Loose, then Reverse, and watch the red pointer. A minus sign means a shaft turns the opposite way to the belt. The inner and hollow shafts always turn opposite ways."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the tooth counts and the frame are made up. Brown does not show how the belt is moved, so the sliding fork was added. He does not say what the middle pulley turns on; here it is loose on the hollow shaft.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, RG = 56, XA = -80, Y0 = -60, YT = 150, R = 40, BT = 4, BW = 20, PW = 24;
    var o = this.o = { phi: 0, wg: 0, thL: 0, wl: 0, tTop: 0, s: 0, xb: null, X: { fwd: 70, loose: 98, rev: 126 }, R: R, BW: BW, PW: PW };
    function spin(x, y) { var g = new T.Group(); g.position.set(x, y, 0); scene.add(g); return g; }
    function wheel(key, x, parent) {               // spoked pulley, axis X, rim radius R, width PW
      var p = P.pulley({ radius: R, width: PW, hub: 14, material: c.mat(key) }); p.rotation.y = Math.PI / 2; p.position.x = x; parent.add(p);
      p.spokes[0].material = c.mat(key, "dark"); return p;
    }

    // bevel gears, all with their pitch apex at (XA, Y0, 0), set up as a mitre pair either side of C
    function gear(key) { return P.bevelGear({ radius: RG, teeth: 24, material: c.mat(key) }); }
    o.C = gear("out"); o.C.position.set(XA, Y0, 0); scene.add(o.C);       // body y Y0+41..Y0+105 = -19..45
    function side(sign, key) {
      var outer = new T.Group(); outer.rotation.z = -sign * Math.PI / 2; outer.position.set(XA, Y0, 0); scene.add(outer);
      var g = gear(key); outer.add(g); return g;
    }
    o.A = side(-1, "inner");                        // A: x XA-105..XA-41 = -185..-121
    o.B = side(1, "hollow");                        // B: x XA+41..XA+105 = -39..25
    o.pitch = o.C.pitch;

    // inner shaft a: x -200..160, ends at both pedestal faces; right pulley fixed on it
    o.a = spin(0, Y0);
    P.at(P.cylX(5, 360, c.mat("inner")), -20, 0, 0, o.a);                       // x -200..160
    P.at(P.box(30, 2, 3, c.mat("inner", "dark")), -80, 5.2, 0, o.a);            // stripe between the gears
    P.at(P.box(18, 2, 3, c.mat("inner", "dark")), 149, 5.2, 0, o.a);            // stripe on the end sticking out, x 140..158
    wheel("inner", o.X.rev, o.a);                                               // right pulley x 114..138
    // hollow shaft b: starts inside B's hub, ends just past the loose pulley; left pulley fixed on it
    o.b = spin(0, Y0);
    P.at(P.cylX(9, 92, c.mat("hollow")), 66, 0, 0, o.b);                        // x 20..112
    P.at(P.box(24, 2, 4, c.mat("hollow", "dark")), 42, 9.2, 0, o.b);            // stripe x 30..54, between B and the left pulley
    wheel("hollow", o.X.fwd, o.b);                                              // left pulley x 58..82
    o.lp = spin(0, Y0); wheel("loose", o.X.loose, o.lp);                        // loose pulley x 86..110, turns on b

    // upright shaft c: from C's hub (y 45) to the face of its top bearing (y 180), with a pointer to show the way it turns
    o.cs = spin(XA, 0);
    P.at(P.cylY(7, 135, c.mat("out")), 0, 112.5, 0, o.cs);                     // y 45..180
    P.at(P.cylY(22, 5, c.mat("out")), 0, 150, 0, o.cs);                        // disc y 147.5..152.5
    P.at(P.box(32, 5, 7, c.mat("out", "mark")), 18, 155, 0, o.cs);             // pointer y 152.5..157.5, sits on the disc

    // driving drum on the top shaft
    o.top = spin(98, YT);
    P.at(P.cylX(R, 100, c.mat("drive")), 0, 0, 0, o.top);                      // x 48..148
    P.at(P.box(98, 1.5, 8, c.mat("drive", "dark")), 0, R + .5, 0, o.top);     // stripe on the drum
    P.at(P.cylX(7, 136, c.mat("drive")), 0, 0, 0, o.top);                      // shaft x 30..166, between the hanger faces

    // belt, built in the XY plane and turned so the pulley axes lie along X
    o.bg = new T.Group(); o.bg.rotation.y = Math.PI / 2; scene.add(o.bg);
    o.belt = P.belt({ width: BW, thick: BT, material: c.mat("belt") }).set(0, YT, R + BT / 2 + 2, 0, Y0, R + BT / 2 + 2, false);
    o.bg.add(o.belt); o.rb = R + BT / 2 + 2;
    o.bmark = P.box(10, BT + 1.5, BW + 1, c.mat("belt", "dark")); o.belt.add(o.bmark);
    // fork: slider on a rail in front of the belt, two pins either side of the front run (belt z 40..44)
    o.fork = new T.Group(); scene.add(o.fork);
    var mb = c.mat("belt");
    P.at(P.box(36, 12, 16, mb), 0, 6, 60, o.fork);                            // slider y 0..12 on the rail top, z 52..68
    [-1, 1].forEach(function (s) { P.at(P.cylZ(2.5, 16, mb), s * 14, 6, 44, o.fork); });   // pins z 36..52, end at the slider back
    P.at(P.cylZ(3, 14, mb), 0, 6, 75, o.fork);                                 // handle z 68..82
    P.at(P.sphere(6, c.mat("belt", "dark")), 0, 6, 86, o.fork);

    // frame
    var F = c.fixed;
    P.at(P.box(430, 12, 130, F), -15, -136, 15, scene);                        // base x -230..200, y -142..-130, z -50..80
    P.at(P.box(16, 85, 30, F), -208, -87.5, 0, scene);                          // left pedestal x -216..-200, y -130..-45; a ends at x -200
    P.at(P.box(16, 85, 30, F), 168, -87.5, 0, scene);                           // right pedestal x 160..176, y -130..-45; a ends at x 160
    P.at(P.box(120, 12, 16, F), 100, -6, 60, scene);                            // rail x 40..160, y -12..0, z 52..68
    P.at(P.box(12, 118, 16, F), 46, -71, 60, scene);                            // rail post x 40..52, y -130..-12
    P.at(P.box(12, 118, 16, F), 154, -71, 60, scene);                           // rail post x 148..160, y -130..-12
    P.at(P.box(296, 12, 40, F), 48, 211, 0, scene);                             // roof beam x -100..196, y 205..217
    P.at(P.box(16, 70, 30, F), 22, 170, 0, scene);                              // hanger x 14..30, y 135..205; top shaft ends at x 30
    P.at(P.box(16, 70, 30, F), 174, 170, 0, scene);                             // hanger x 166..182, y 135..205; top shaft ends at x 166
    P.at(P.cylY(14, 25, F), XA, 192.5, 0, scene);                               // bearing y 180..205; c ends at y 180

  },

  step: function (c, dt, S) {
    var o = this.o, K = 6, D = .8, h = Math.min(dt, .05);
    var tx = o.X[S.controls.belt] || o.X.fwd;
    if (o.xb === null) o.xb = tx;
    var d = tx - o.xb, mv = 45 * h;
    o.xb += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    function share(x) { return Math.max(0, Math.min(o.xb + o.BW / 2, x + o.PW / 2) - Math.max(o.xb - o.BW / 2, x - o.PW / 2)) / o.BW; }
    var fL = share(o.X.fwd), fM = share(o.X.loose), fR = share(o.X.rev);
    var u = S.w * o.R / o.R;                        // speed the belt gives a lower pulley: top radius / lower radius = 1
    // a, b and the gears are one train: b turns at wg, a at -wg. The belt drags whichever pulley it rides on.
    o.wg += (K * (fL * (u - o.wg) + fR * (-u - o.wg)) - D * (1 - fL - fR) * o.wg) * h;
    o.wl += (K * fM * (u - o.wl) - D * (1 - fM) * o.wl) * h;
    o.phi += o.wg * dt; o.thL += o.wl * dt; o.tTop += S.w * dt; o.s += S.w * o.rb * dt;

    o.top.rotation.x = o.tTop;
    o.b.rotation.x = o.phi; o.a.rotation.x = -o.phi; o.lp.rotation.x = o.thL;
    o.B.rotation.y = o.A.rotation.y = o.phi + o.pitch / 2;    // B turns with b, A with a (its axis points the other way)
    o.C.rotation.y = o.cs.rotation.y = -o.phi;
    o.bg.position.x = o.xb; o.fork.position.x = o.xb;
    o.belt.place(o.bmark, o.s);

    function rpm(w) { var r = Math.round(w * 60 / (2 * Math.PI)); return r === 0 ? 0 : r; }
    var rb = rpm(o.wg), rc = rpm(-o.wg);
    S.set("b", (rb < 0 ? "−" + -rb : rb) + " rpm");
    S.set("a", (rb > 0 ? "−" + rb : -rb) + " rpm");
    S.set("c", (rb < 0 ? "−" + -rb : rb) + " rpm");      // upright turns with b; Forward reads positive
  }
});
