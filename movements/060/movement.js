M507.define({
  number: 60,
  title: "Two speeds by belts",
  lede: "Two belts from two drums can turn a shaft at two speeds. One sliding bar moves both belts at once. Only one belt drives at a time, while the other runs on a loose pulley.",
  alt: "A top shaft carries a big drum on the left and a small drum on the right. Each drum drives a belt down to a pair of pulleys on a lower shaft. In each pair the outer pulley is loose and the inner one is fixed. A bar with two forks holds both belts.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Drums", note: "A big drum and a small drum fixed on the top shaft, turned by an engine. They always turn together at the same speed." },
    { key: "out", color: "#C8873A", name: "Lower shaft", note: "Carries the two inner pulleys, which are fixed to it. Its speed depends on which belt is on its fixed pulley." },
    { key: "belt", color: "#D9B13B", name: "Belts, fork and loose pulleys", note: "One bar with two forks moves both belts at once. The two outer pulleys are loose. A belt on one of them just spins it alone." }
  ],
  controls: [{ id: "speed", label: "Speed", value: "slow", options: [["slow", "Slow"], ["fast", "Fast"]] }],
  readouts: [{ id: "d", label: "Drums" }, { id: "l", label: "Lower shaft" }],
  views: { "3d": [-600, 300, 880], front: [0, 20, 1080], side: [1080, 20, 0] },
  target: [0, 20, 0],
  how: [
    "The top shaft carries a big drum and a small drum. Each drum has its own belt down to a pair of pulleys. In each pair the outer pulley is loose and the inner one is fixed to the lower shaft.",
    "A belt moves its pulley's edge as fast as its drum's edge. The small drum drives a big pulley, so the lower shaft turns slower than the drums. The big drum drives a pulley of the same size, so the lower shaft keeps up with the drums.",
    "To change speed, both belts move one pulley to the right. One belt comes off its fixed pulley as the other goes on, so they never fight. Try Slow, then Fast, and watch the lower shaft."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the bearings and the frame are made up. Brown does not show how the belts are moved. Both move the same way to change speed, so here one bar with two forks moves them together.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, YL = -100, YT = 100, R = 75, RS = 45, BT = 4, BW = 30, PW = 36;
    // pulleys on the lower shaft: loose x -128..-92, fixed -90..-54, fixed 54..90, loose 92..128
    var o = this.o = { phi: 0, wl: 0, tTop: 0, xb: null, BW: BW, PW: PW, X: { lL: -110, fL: -72, fR: 72, lR: 110 },
      lo: { lL: { th: 0, w: 0 }, lR: { th: 0, w: 0 } }, sL: 0, sR: 0, rL: R + BT / 2 + 1.5, rR: RS + BT / 2 + 1.5, rP: R + BT / 2 + 1.5 };
    function spin(x, y) { var g = new T.Group(); g.position.set(x, y, 0); scene.add(g); return g; }
    function wheel(key, x, parent) {               // spoked pulley, axis X, rim radius R, width PW
      var p = P.pulley({ radius: R, width: PW, hub: 20, material: c.mat(key) }); p.rotation.y = Math.PI / 2; p.position.x = x; parent.add(p);
      p.spokes[0].material = c.mat(key, "dark"); return p;
    }

    // lower shaft: x -170..170, between the pedestal faces, with the two fixed pulleys
    o.low = spin(0, YL);
    P.at(P.cylX(6, 340, c.mat("out")), 0, 0, 0, o.low);
    P.at(P.box(30, 2, 3, c.mat("out", "dark")), 0, 6.2, 0, o.low);             // stripe x -15..15, between the pairs
    wheel("out", o.X.fL, o.low); wheel("out", o.X.fR, o.low);
    o.lo.lL.g = spin(0, YL); wheel("belt", o.X.lL, o.lo.lL.g);                 // loose pulleys turn freely on the lower shaft
    o.lo.lR.g = spin(0, YL); wheel("belt", o.X.lR, o.lo.lR.g);

    // drums on the top shaft: big x -132..-50, small x 50..132
    o.top = spin(0, YT);
    P.at(P.cylX(R, 82, c.mat("drive")), -91, 0, 0, o.top);
    P.at(P.box(81, 1.5, 8, c.mat("drive", "dark")), -91, R + .5, 0, o.top);    // stripe on the big drum
    P.at(P.cylX(RS, 82, c.mat("drive")), 91, 0, 0, o.top);
    P.at(P.box(81, 1.5, 8, c.mat("drive", "dark")), 91, RS + .5, 0, o.top);    // stripe on the small drum
    P.at(P.cylX(7, 340, c.mat("drive")), 0, 0, 0, o.top);                      // shaft x -170..170, between the hanger faces

    // bands, built in the XY plane and turned so the pulley axes lie along X
    function band(r1) {
      var g = new T.Group(); g.rotation.y = Math.PI / 2; scene.add(g);
      var b = P.belt({ width: BW, thick: BT, material: c.mat("belt") }).set(0, YT, r1, 0, YL, R + BT / 2 + 1.5, false);
      g.add(b); b.mark = P.box(10, BT + 1.5, BW + 1, c.mat("belt", "dark")); b.add(b.mark);
      return { g: g, b: b };
    }
    o.bL = band(o.rL); o.bR = band(o.rR);
    // shifter: one bar on a rail in front of the bands, two pins either side of each front run
    // (left band z 75..79, right band about z 61..65 at y 0); positions are for Slow, bands at x -110 and 72
    o.fork = new T.Group(); scene.add(o.fork);
    var mb = c.mat("belt");
    P.at(P.box(226, 12, 16, mb), -19, 0, 103, o.fork);                        // bar x -132..94, y -6..6 on the rail top, z 95..111
    [-110, 72].forEach(function (x) {
      [-1, 1].forEach(function (s) { P.at(P.cylZ(2.5, 40, mb), x + s * 19, 0, 75, o.fork); });  // pins z 55..95, end at the bar back
    });
    P.at(P.cylZ(3, 14, mb), -19, 0, 118, o.fork);                              // handle z 111..125
    P.at(P.sphere(6, c.mat("belt", "dark")), -19, 0, 129, o.fork);

    // frame
    var F = c.fixed;
    P.at(P.box(400, 12, 210, F), 0, -196, 15, scene);                          // base x -200..200, y -202..-190, z -90..120
    P.at(P.box(16, 105, 30, F), -178, -137.5, 0, scene);                       // pedestal x -186..-170, y -190..-85; lower shaft ends at x -170
    P.at(P.box(16, 105, 30, F), 178, -137.5, 0, scene);                        // pedestal x 170..186, y -190..-85
    P.at(P.box(300, 12, 16, F), 0, -12, 103, scene);                           // rail x -150..150, y -18..-6, z 95..111; bar travels x -132..132
    P.at(P.box(12, 172, 16, F), -156, -104, 103, scene);                       // rail post x -162..-150, y -190..-18
    P.at(P.box(12, 172, 16, F), 156, -104, 103, scene);                        // rail post x 150..162, y -190..-18
    P.at(P.box(372, 12, 40, F), 0, 196, 0, scene);                             // roof beam x -186..186, y 190..202
    P.at(P.box(16, 105, 30, F), -178, 137.5, 0, scene);                        // hanger x -186..-170, y 85..190; top shaft ends at x -170
    P.at(P.box(16, 105, 30, F), 178, 137.5, 0, scene);                         // hanger x 170..186, y 85..190
  },

  step: function (c, dt, S) {
    var o = this.o, K = 6, D = .8, h = Math.min(dt, .05), X = o.X;
    var tx = S.controls.speed === "fast" ? 38 : 0;  // both bands move one pulley to the right for Fast
    if (o.xb === null) o.xb = tx;
    var d = tx - o.xb, mv = 45 * h;
    o.xb += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    var bl = -110 + o.xb, br = 72 + o.xb;
    function share(b, x) { return Math.max(0, Math.min(b + o.BW / 2, x + o.PW / 2) - Math.max(b - o.BW / 2, x - o.PW / 2)) / o.BW; }
    // a band moves its pulley's rim as fast as its drum's rim: pulley speed = drum speed * drum radius / pulley radius
    var uL = S.w * o.rL / o.rP, uR = S.w * o.rR / o.rP;
    var fL = share(bl, X.fL), fR = share(br, X.fR), fs = fL + fR;
    o.wl += (K * fL * (uL - o.wl) + K * fR * (uR - o.wl) - D * Math.max(0, 1 - fs) * o.wl) * h;
    [["lL", bl, uL], ["lR", br, uR]].forEach(function (a) {
      var q = o.lo[a[0]], f = share(a[1], X[a[0]]);
      q.w += (K * f * (a[2] - q.w) - D * (1 - f) * q.w) * h; q.th += q.w * dt; q.g.rotation.x = q.th;
    });
    o.phi += o.wl * dt; o.tTop += S.w * dt; o.sL += S.w * o.rL * dt; o.sR += S.w * o.rR * dt;

    o.top.rotation.x = o.tTop;
    o.low.rotation.x = o.phi;
    o.bL.g.position.x = bl; o.bR.g.position.x = br; o.fork.position.x = o.xb;
    o.bL.b.place(o.bL.b.mark, o.sL); o.bR.b.place(o.bR.b.mark, o.sR);

    function f(w) { var r = Math.round(w * 60 / (2 * Math.PI)); return (r < 0 ? "−" + -r : r === 0 ? 0 : r) + " rpm"; }
    S.set("d", f(S.w));
    S.set("l", f(o.wl));
  }
});
