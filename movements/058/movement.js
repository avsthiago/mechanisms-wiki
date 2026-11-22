M507.define({
  number: 58,
  title: "Three speeds by gearing",
  lede: "One belt from a drum can turn a shaft at three different speeds, or not at all. You only slide the belt sideways onto a different pulley. The drum above keeps turning at the same speed the whole time.",
  alt: "A wide drum at the top drives a belt down to four narrow pulleys side by side. Three of them sit on shafts fitted one inside another. Each of those shafts carries a gear of a different size. The three gears mesh with three gears on a lower shaft. A fork holds the belt.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Drum", note: "A wide drum on the top shaft, turned by an engine. It is wide enough for the belt in any position." },
    { key: "slow", color: "#4FA58A", name: "Main shaft", note: "The thin shaft in the middle of the others. Its pulley sits next to the loose one, and the smallest gear is at its far end." },
    { key: "mid", color: "#8E7AA8", name: "Inner tube", note: "A tube that turns on the main shaft. It carries the second pulley and a middle-sized gear." },
    { key: "fast", color: "#C2503F", name: "Outer tube", note: "A shorter tube that turns on the inner tube. It carries the end pulley and the biggest gear, next to the pulleys." },
    { key: "out", color: "#C8873A", name: "Lower shaft", note: "Carries three gears that mesh with the three upper gears. Its speed depends on which pulley the belt is on." },
    { key: "belt", color: "#D9B13B", name: "Belt, fork and loose pulley", note: "The fork slides the belt from pulley to pulley. The loose pulley is not fixed to its shaft. With the belt on it, it spins alone." }
  ],
  controls: [{ id: "band", label: "Belt on", value: "slow", options: [["loose", "Loose"], ["slow", "Slow"], ["mid", "Middle"], ["fast", "Fast"]] }],
  readouts: [{ id: "d", label: "Drum" }, { id: "l", label: "Lower shaft" }],
  views: { "3d": [-620, 260, 980], front: [-20, 0, 920], side: [920, 0, 0] },
  target: [-20, 0, 0],
  how: [
    "The belt runs from the drum down to one of four pulleys. Only the pulley under the belt gets pulled round. The fork slides the belt from one pulley to the next while the drum keeps turning.",
    "Three of the pulleys sit on shafts fitted one inside another, so each can turn on its own. Each of these shafts has a gear of a different size at its other end. A small gear turns a big lower gear slowly. A big gear turns a small lower gear fast.",
    "All three pairs of gears are always in mesh. So when one pair drives the lower shaft, the lower shaft turns the other two upper shafts too, each at its own speed. Try Slow, then Middle, then Fast, and watch the lower shaft. A minus sign means it turns the other way to the drum."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the tooth counts, the bearings and the frame are made up. Brown does not show how the belt is moved, so the sliding fork was added. He does not say what the loose pulley turns on; here it turns freely on the end of the main shaft.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 5, GW = 24, YU = -40, YL = -145, YT = 130, R = 75, BT = 4, BW = 30, PW = 36;
    // upper/lower teeth; every pair adds to 42, so all three pairs have the same centre distance 105 = YU - YL
    var pairs = { slow: { nu: 13, nl: 29, x: -175 }, mid: { nu: 19, nl: 23, x: -118 }, fast: { nu: 29, nl: 13, x: -56 } };
    var o = this.o = { phi: 0, wl: 0, thLo: 0, wlo: 0, tTop: 0, s: 0, xb: null, pairs: pairs, X: { fast: 15, mid: 53, slow: 91, loose: 129 }, BW: BW, PW: PW };
    function spin(x, y) { var g = new T.Group(); g.position.set(x, y, 0); scene.add(g); return g; }
    function wheel(key, x, parent) {               // spoked pulley, axis X, rim radius R, width PW
      var p = P.pulley({ radius: R, width: PW, hub: 20, material: c.mat(key) }); p.rotation.y = Math.PI / 2; p.position.x = x; parent.add(p);
      p.spokes[0].material = c.mat(key, "dark"); return p;
    }
    function gear(key, N, x, spinA, parent) {      // spur gear on axis X, width GW; spinA turns it about its own axis
      var g = P.spurGear({ teeth: N, module: MD, width: GW, material: c.mat(key) });
      g.rotation.set(0, Math.PI / 2, spinA); g.position.x = x; parent.add(g);
      var rf = g.pitchRadius - 1.25 * MD;          // dark stripe on the face towards +X, lifted .5..1.5 off it
      P.at(P.box(1, rf - 18, 4, c.mat(key, "dark")), x + GW / 2 + 1, 15 + (rf - 18) / 2, 0, parent);
      return g;
    }

    // lower shaft: x -190..-40, between the bearing faces; gears at x -187..-163, -130..-106, -68..-44
    o.low = spin(0, YL);
    P.at(P.cylX(6, 150, c.mat("out")), -115, 0, 0, o.low);                     // x -190..-40
    ["slow", "mid", "fast"].forEach(function (k) {
      var p = pairs[k], g = gear("out", p.nl, p.x, 0, o.low);
      g.rotation.z = Math.PI / 2 + g.pitch / 2;                                // a gap faces up at phi = 0
    });

    // main shaft: x -190..149, bearing face to bearing face; smallest gear x -187..-163, pulley x 73..109
    o.sh = {};
    o.sh.slow = spin(0, YU);
    P.at(P.cylX(5, 339, c.mat("slow")), -20.5, 0, 0, o.sh.slow);
    P.at(P.box(22, 2, 3, c.mat("slow", "dark")), -146.5, 5.2, 0, o.sh.slow);   // stripe x -157.5..-135.5, between two gears
    // inner tube: x -130..71; middle gear x -130..-106, pulley x 35..71
    o.sh.mid = spin(0, YU);
    P.at(P.cylX(9, 201, c.mat("mid")), -29.5, 0, 0, o.sh.mid);
    P.at(P.box(24, 2, 4, c.mat("mid", "dark")), -87, 9.2, 0, o.sh.mid);        // stripe x -99..-75
    // outer tube: x -68..33; biggest gear x -68..-44, pulley x -3..33
    o.sh.fast = spin(0, YU);
    P.at(P.cylX(13, 101, c.mat("fast")), -17.5, 0, 0, o.sh.fast);
    P.at(P.box(26, 2, 5, c.mat("fast", "dark")), -23.5, 13.2, 0, o.sh.fast);   // stripe x -36.5..-10.5
    ["slow", "mid", "fast"].forEach(function (k) {
      gear(k, pairs[k].nu, pairs[k].x, -Math.PI / 2, o.sh[k]);                 // a tooth faces down at angle 0
      wheel(k, o.X[k], o.sh[k]);
    });
    o.lp = spin(0, YU); wheel("belt", o.X.loose, o.lp);                         // loose pulley x 111..147, turns on the main shaft

    // drum on the top shaft
    o.top = spin(72, YT);
    P.at(P.cylX(R, 154, c.mat("drive")), 0, 0, 0, o.top);                      // x -5..149
    P.at(P.box(153, 1.5, 8, c.mat("drive", "dark")), 0, R + .5, 0, o.top);     // stripe on the drum
    P.at(P.cylX(7, 172, c.mat("drive")), 0, 0, 0, o.top);                      // shaft x -14..158, between the hanger faces

    // band, built in the XY plane and turned so the pulley axes lie along X
    o.bg = new T.Group(); o.bg.rotation.y = Math.PI / 2; scene.add(o.bg);
    o.belt = P.belt({ width: BW, thick: BT, material: c.mat("belt") }).set(0, YT, R + BT / 2 + 1.5, 0, YU, R + BT / 2 + 1.5, false);
    o.bg.add(o.belt); o.rb = R + BT / 2 + 1.5;
    o.bmark = P.box(10, BT + 1.5, BW + 1, c.mat("belt", "dark")); o.belt.add(o.bmark);
    // fork: slider on a rail in front of the band, two pins either side of the front run (band z 75..79)
    o.fork = new T.Group(); scene.add(o.fork);
    var mb = c.mat("belt");
    P.at(P.box(44, 12, 16, mb), 0, 51, 103, o.fork);                          // slider y 45..57 on the rail top, z 95..111
    [-1, 1].forEach(function (s) { P.at(P.cylZ(2.5, 25, mb), s * 19, 51, 82.5, o.fork); });   // pins z 70..95, end at the slider back
    P.at(P.cylZ(3, 14, mb), 0, 51, 118, o.fork);                               // handle z 111..125
    P.at(P.sphere(6, c.mat("belt", "dark")), 0, 51, 129, o.fork);

    // frame
    var F = c.fixed;
    P.at(P.box(390, 12, 210, F), -20, -236, 15, scene);                        // base x -215..175, y -242..-230, z -90..120
    P.at(P.box(16, 205, 30, F), -198, -127.5, 0, scene);                       // left pedestal x -206..-190, y -230..-25; both shafts end at x -190
    P.at(P.box(16, 205, 30, F), 157, -127.5, 0, scene);                        // right pedestal x 149..165, y -230..-25; main shaft ends at x 149
    P.at(P.box(16, 99, 30, F), -32, -180.5, 0, scene);                         // lower bearing x -40..-24, y -230..-131; lower shaft ends at x -40
    P.at(P.box(184, 12, 16, F), 72, 39, 103, scene);                           // rail x -20..164, y 33..45, z 95..111
    P.at(P.box(12, 263, 16, F), -14, -98.5, 103, scene);                       // rail post x -20..-8, y -230..33
    P.at(P.box(12, 263, 16, F), 158, -98.5, 103, scene);                       // rail post x 152..164, y -230..33
    P.at(P.box(224, 12, 40, F), 72, 236, 0, scene);                            // roof beam x -40..184, y 230..242
    P.at(P.box(16, 112, 30, F), -22, 174, 0, scene);                           // hanger x -30..-14, y 118..230; top shaft ends at x -14
    P.at(P.box(16, 112, 30, F), 166, 174, 0, scene);                           // hanger x 158..174, y 118..230; top shaft ends at x 158
  },

  step: function (c, dt, S) {
    var o = this.o, K = 6, D = .8, h = Math.min(dt, .05), p = o.pairs;
    var tx = o.X[S.controls.band]; if (tx === undefined) tx = o.X.loose;
    if (o.xb === null) o.xb = tx;
    var d = tx - o.xb, mv = 45 * h;
    o.xb += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    function share(x) { return Math.max(0, Math.min(o.xb + o.BW / 2, x + o.PW / 2) - Math.max(o.xb - o.BW / 2, x - o.PW / 2)) / o.BW; }
    var u = S.w;                                    // drum and pulleys have the same radius, so the band turns a pulley at drum speed
    // the three upper shafts and the lower shaft are one train: upper k turns at -wl * nl / nu. The band drags the pulley it rides on.
    var acc = 0, fs = 0;
    ["slow", "mid", "fast"].forEach(function (k) { var f = share(o.X[k]); fs += f; acc += K * f * (-u * p[k].nu / p[k].nl - o.wl); });
    o.wl += (acc - D * (1 - fs) * o.wl) * h;
    var fL = share(o.X.loose);
    o.wlo += (K * fL * (u - o.wlo) - D * (1 - fL) * o.wlo) * h;
    o.phi += o.wl * dt; o.thLo += o.wlo * dt; o.tTop += S.w * dt; o.s += S.w * o.rb * dt;

    o.top.rotation.x = o.tTop;
    o.low.rotation.x = o.phi;
    ["slow", "mid", "fast"].forEach(function (k) { o.sh[k].rotation.x = -o.phi * p[k].nl / p[k].nu; });
    o.lp.rotation.x = o.thLo;
    o.bg.position.x = o.xb; o.fork.position.x = o.xb;
    o.belt.place(o.bmark, o.s);

    function f(w) { var r = Math.round(w * 60 / (2 * Math.PI)); return (r < 0 ? "−" + -r : r === 0 ? 0 : r) + " rpm"; }
    S.set("d", f(S.w));
    S.set("l", f(o.wl));
  }
});
