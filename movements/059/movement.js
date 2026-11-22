M507.define({
  number: 59,
  title: "Two speeds by gearing",
  lede: "One belt from a drum can turn a shaft slowly, fast, or not at all. You only slide the belt sideways onto a different pulley. The drum above keeps turning at the same speed the whole time.",
  alt: "A drum at the top drives a belt down to three narrow pulleys side by side. The middle pulley is fixed to a shaft with a small gear at its left end. The right pulley is fixed to a tube with a big gear at its right end. These gears mesh with a big and a small gear on a lower shaft. A fork holds the belt.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Drum", note: "A drum on the top shaft, turned by an engine. It is wide enough for the belt in any position." },
    { key: "slow", color: "#4FA58A", name: "Main shaft", note: "Carries the middle pulley and a small gear at its left end. The small gear turns the big lower gear slowly." },
    { key: "fast", color: "#8E7AA8", name: "Tube", note: "A tube that turns on the main shaft, called a hollow shaft. It carries the right pulley and a big gear at its right end." },
    { key: "out", color: "#C8873A", name: "Lower shaft", note: "Carries a big gear at the left and a small gear at the right. Its speed depends on which pulley the belt is on." },
    { key: "belt", color: "#D9B13B", name: "Belt, fork and loose pulley", note: "The fork slides the belt from pulley to pulley. The loose pulley is not fixed to its shaft. With the belt on it, it spins alone." }
  ],
  controls: [{ id: "band", label: "Belt on", value: "slow", options: [["loose", "Loose"], ["slow", "Slow"], ["fast", "Fast"]] }],
  readouts: [{ id: "d", label: "Drum" }, { id: "l", label: "Lower shaft" }],
  views: { "3d": [-600, 300, 880], front: [0, 20, 1080], side: [1080, 20, 0] },
  target: [0, 20, 0],
  how: [
    "The belt runs from the drum down to one of three pulleys. Only the pulley under the belt gets pulled round. The fork slides the belt from one pulley to the next while the drum keeps turning.",
    "The middle pulley is fixed to the main shaft, which has a small gear at its left end. The right pulley is fixed to a tube around the main shaft, with a big gear at its right end. A small gear turns a big lower gear slowly. A big gear turns a small lower gear fast.",
    "Both pairs of gears are always in mesh. So when one pair drives the lower shaft, the lower shaft turns the other upper gear too. Try Slow, then Fast, and watch the lower shaft. A minus sign means it turns the other way to the drum."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the tooth counts, the bearings and the frame are made up. Brown draws the belt on the loose pulley; here it starts on the slow pulley so the model opens moving. Brown does not show how the belt is moved, so the sliding fork was added. He does not say what the loose pulley turns on; here it turns freely on the main shaft.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 5, GW = 24, YU = -30, YL = -140, YT = 150, R = 80, BT = 4, BW = 30, PW = 36;
    // upper/lower teeth; both pairs add to 44, so both have the same centre distance 110 = YU - YL
    var pairs = { slow: { nu: 12, nl: 32, x: -110, side: -1 }, fast: { nu: 32, nl: 12, x: 110, side: 1 } };
    var o = this.o = { phi: 0, wl: 0, thLo: 0, wlo: 0, tTop: 0, s: 0, xb: null, pairs: pairs, X: { loose: -38, slow: 0, fast: 38 }, BW: BW, PW: PW };
    function spin(x, y) { var g = new T.Group(); g.position.set(x, y, 0); scene.add(g); return g; }
    function wheel(key, x, parent) {               // spoked pulley, axis X, rim radius R, width PW
      var p = P.pulley({ radius: R, width: PW, hub: 20, material: c.mat(key) }); p.rotation.y = Math.PI / 2; p.position.x = x; parent.add(p);
      p.spokes[0].material = c.mat(key, "dark"); return p;
    }
    function gear(key, N, x, side, spinA, parent) { // spur gear on axis X, width GW; dark stripe on the outer face (side = -1 left, 1 right)
      var g = P.spurGear({ teeth: N, module: MD, width: GW, material: c.mat(key) });
      g.rotation.set(0, Math.PI / 2, spinA); g.position.x = x; parent.add(g);
      var rf = g.pitchRadius - 1.25 * MD;          // stripe lifted .5..1.5 off the face
      P.at(P.box(1, rf - 15, 4, c.mat(key, "dark")), x + side * (GW / 2 + 1), 13 + (rf - 15) / 2, 0, parent);
      return g;
    }

    // lower shaft: x -150..150, between the pedestal faces; gears at x -122..-98 and 98..122
    o.low = spin(0, YL);
    P.at(P.cylX(6, 300, c.mat("out")), 0, 0, 0, o.low);                        // x -150..150
    ["slow", "fast"].forEach(function (k) {
      var p = pairs[k], g = gear("out", p.nl, p.x, p.side, 0, o.low);
      g.rotation.z = Math.PI / 2 + g.pitch / 2;                                // a gap faces up at phi = 0
    });

    // main shaft: x -150..150, pedestal face to pedestal face; small gear x -122..-98, middle pulley x -18..18
    o.sh = {};
    o.sh.slow = spin(0, YU);
    P.at(P.cylX(5, 300, c.mat("slow")), 0, 0, 0, o.sh.slow);
    P.at(P.box(30, 2, 3, c.mat("slow", "dark")), -76, 5.2, 0, o.sh.slow);      // stripe x -91..-61, between the gear and the loose pulley
    // tube: x 20..122; right pulley x 20..56, big gear x 98..122
    o.sh.fast = spin(0, YU);
    P.at(P.cylX(13, 102, c.mat("fast")), 71, 0, 0, o.sh.fast);
    P.at(P.box(30, 2, 5, c.mat("fast", "dark")), 76, 13.2, 0, o.sh.fast);      // stripe x 61..91
    ["slow", "fast"].forEach(function (k) {
      gear(k, pairs[k].nu, pairs[k].x, pairs[k].side, -Math.PI / 2, o.sh[k]);  // a tooth faces down at angle 0
      wheel(k, o.X[k], o.sh[k]);
    });
    o.lp = spin(0, YU); wheel("belt", o.X.loose, o.lp);                         // loose pulley x -56..-20, turns on the main shaft

    // drum on the top shaft
    o.top = spin(0, YT);
    P.at(P.cylX(R, 120, c.mat("drive")), 0, 0, 0, o.top);                      // x -60..60
    P.at(P.box(119, 1.5, 8, c.mat("drive", "dark")), 0, R + .5, 0, o.top);     // stripe on the drum
    P.at(P.cylX(7, 180, c.mat("drive")), 0, 0, 0, o.top);                      // shaft x -90..90, between the hanger faces

    // band, built in the XY plane and turned so the pulley axes lie along X
    o.bg = new T.Group(); o.bg.rotation.y = Math.PI / 2; scene.add(o.bg);
    o.belt = P.belt({ width: BW, thick: BT, material: c.mat("belt") }).set(0, YT, R + BT / 2 + 1.5, 0, YU, R + BT / 2 + 1.5, false);
    o.bg.add(o.belt); o.rb = R + BT / 2 + 1.5;
    o.bmark = P.box(10, BT + 1.5, BW + 1, c.mat("belt", "dark")); o.belt.add(o.bmark);
    // fork: slider on a rail in front of the band, two pins either side of the front run (band z 80..84)
    o.fork = new T.Group(); scene.add(o.fork);
    var mb = c.mat("belt");
    P.at(P.box(44, 12, 16, mb), 0, 60, 103, o.fork);                          // slider y 54..66 on the rail top, z 95..111
    [-1, 1].forEach(function (s) { P.at(P.cylZ(2.5, 20, mb), s * 19, 60, 85, o.fork); });    // pins z 75..95, end at the slider back
    P.at(P.cylZ(3, 14, mb), 0, 60, 118, o.fork);                               // handle z 111..125
    P.at(P.sphere(6, c.mat("belt", "dark")), 0, 60, 129, o.fork);

    // frame
    var F = c.fixed;
    P.at(P.box(370, 12, 210, F), 0, -236, 15, scene);                          // base x -185..185, y -242..-230, z -90..120
    P.at(P.box(16, 215, 30, F), -158, -122.5, 0, scene);                       // left pedestal x -166..-150, y -230..-15; both shafts end at x -150
    P.at(P.box(16, 215, 30, F), 158, -122.5, 0, scene);                        // right pedestal x 150..166, y -230..-15; both shafts end at x 150
    P.at(P.box(156, 12, 16, F), 0, 48, 103, scene);                            // rail x -78..78, y 42..54, z 95..111; slider travels x -60..60
    P.at(P.box(12, 272, 16, F), -72, -94, 103, scene);                         // rail post x -78..-66, y -230..42, between pulleys and gears
    P.at(P.box(12, 272, 16, F), 72, -94, 103, scene);                          // rail post x 66..78, y -230..42
    P.at(P.box(240, 12, 40, F), 0, 246, 0, scene);                             // roof beam x -120..120, y 240..252
    P.at(P.box(16, 112, 30, F), -98, 184, 0, scene);                           // hanger x -106..-90, y 128..240; top shaft ends at x -90
    P.at(P.box(16, 112, 30, F), 98, 184, 0, scene);                            // hanger x 90..106, y 128..240; top shaft ends at x 90
  },

  step: function (c, dt, S) {
    var o = this.o, K = 6, D = .8, h = Math.min(dt, .05), p = o.pairs;
    var tx = o.X[S.controls.band]; if (tx === undefined) tx = o.X.loose;
    if (o.xb === null) o.xb = tx;
    var d = tx - o.xb, mv = 45 * h;
    o.xb += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    function share(x) { return Math.max(0, Math.min(o.xb + o.BW / 2, x + o.PW / 2) - Math.max(o.xb - o.BW / 2, x - o.PW / 2)) / o.BW; }
    var u = S.w;                                    // drum and pulleys have the same radius, so the band turns a pulley at drum speed
    // both upper shafts and the lower shaft are one train: upper k turns at -wl * nl / nu. The band drags the pulley it rides on.
    var acc = 0, fs = 0;
    ["slow", "fast"].forEach(function (k) { var f = share(o.X[k]); fs += f; acc += K * f * (-u * p[k].nu / p[k].nl - o.wl); });
    o.wl += (acc - D * (1 - fs) * o.wl) * h;
    var fL = share(o.X.loose);
    o.wlo += (K * fL * (u - o.wlo) - D * (1 - fL) * o.wlo) * h;
    o.phi += o.wl * dt; o.thLo += o.wlo * dt; o.tTop += S.w * dt; o.s += S.w * o.rb * dt;

    o.top.rotation.x = o.tTop;
    o.low.rotation.x = o.phi;
    ["slow", "fast"].forEach(function (k) { o.sh[k].rotation.x = -o.phi * p[k].nl / p[k].nu; });
    o.lp.rotation.x = o.thLo;
    o.bg.position.x = o.xb; o.fork.position.x = o.xb;
    o.belt.place(o.bmark, o.s);

    function f(w) { var r = Math.round(w * 60 / (2 * Math.PI)); return (r < 0 ? "−" + -r : r === 0 ? 0 : r) + " rpm"; }
    S.set("d", f(S.w));
    S.set("l", f(o.wl));
  }
});
