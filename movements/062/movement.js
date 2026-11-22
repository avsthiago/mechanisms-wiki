M507.define({
  number: 62,
  title: "Two speeds with a variable differential",
  lede: "One belt from a drum can turn a shaft at two speeds. One of them comes through gears hidden inside a pulley. A second belt turns one of those gears, so it can make that speed slower or faster.",
  alt: "A wide drum and a small pulley on a top shaft. The drum drives a belt down to three pulleys on a lower shaft, and the small pulley drives a second belt to a fourth pulley. Part of the third pulley's rim is cut away to show three bevel gears inside. A fork holds the belt.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Drum and small pulley", note: "A wide drum and a small pulley on the top shaft, turned by an engine. The drum drives the belt. The small pulley drives the second belt." },
    { key: "shaft", color: "#C8873A", name: "Shaft and middle pulley", note: "The middle pulley is fixed to the shaft. So is a gear with sloping teeth, called a bevel gear, on the end of its hub." },
    { key: "carrier", color: "#E8E2D0", name: "Right-hand pulley", note: "It turns freely on the shaft. Inside it, a small bevel gear spins on a pin that sticks out sideways. Watch the small gear roll between the two big ones." },
    { key: "third", color: "#4FA58A", name: "Third gear and end pulley", note: "A second big bevel gear that turns freely on the shaft, facing the first. It is fixed to the end pulley, so the second belt turns it." },
    { key: "belt", color: "#D9B13B", name: "Belts, fork and loose pulley", note: "The fork slides the belt from pulley to pulley. The loose pulley is not fixed to the shaft. The second belt can run open or crossed." }
  ],
  controls: [
    { id: "band", label: "Belt on", value: "right", options: [["loose", "Loose"], ["mid", "Middle"], ["right", "Right"]] },
    { id: "rb", label: "Right-hand belt", value: "open", options: [["open", "Open"], ["cross", "Crossed"]] }
  ],
  closed: { label: "Pulley" },
  readouts: [{ id: "d", label: "Drum" }, { id: "s", label: "Shaft" }, { id: "t", label: "Third gear" }],
  views: { "3d": [360, -60, 1000], front: [20, 0, 920], side: [920, 0, 0] },
  target: [20, 0, 0],
  how: [
    "The belt runs from the drum down to one of three pulleys. The fork slides it across while the drum keeps turning. On the middle pulley the shaft turns at the same speed as the drum, because that pulley is fixed to it.",
    "The right-hand pulley carries a small bevel gear on a pin, between two big bevel gears. One big gear is fixed to the shaft. The other, the third gear, is fixed to the end pulley, which a second belt turns from the top shaft. If the third gear stood still, the shaft would turn twice as fast as the right-hand pulley.",
    "With an open belt the third gear turns the same way as the drum, and its speed is taken off that double speed. With a crossed belt it turns the other way, and its speed is added on. Put the belt on Right, then try Open and Crossed and compare the shaft's speed. Choose Closed to see the pulley as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing and description. His dotted lines show the gears hidden inside the pulleys. Here part of the right-hand pulley's rim is cut away, below the belt, so you can see them. The sizes, the tooth counts, the frame and the fork were made up. Brown draws the belt on the loose pulley and the second belt open.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, F = c.fixed, YT = 110, YL = -80, R = 75, RT = 45, BT = 4, BW = 26, XC = 40;
    var RS = 30, NS = 15, RP = 20, NP = 10, CS = Math.atan2(RS, RP) * 180 / Math.PI;   // equal big gears; small gear on the pin
    var o = this.o = { tc: 0, t3: 0, wc: 0, w3: 0, tlo: 0, wlo: 0, tTop: 0, s: 0, xb: null, init: false, cross: null,
      X: { loose: -60, mid: -20, right: XC }, W: { loose: 36, mid: 40, right: 76 }, BW: BW, rb: R + BT / 2 + .6, rt: RT + BT / 2 + 1, ps: 2 * Math.PI / NS, k: RS / RP };
    function spin(x, y) { var g = new T.Group(); g.position.set(x, y, 0); scene.add(g); return g; }
    function V(a) { return a.map(function (p) { return new T.Vector2(p[0], p[1]); }); }
    function turned(pts, mat, phi0, phiLen) {        // solid turned about world X; profile points are [radius, x]
      var g = new T.Group(); g.rotation.z = -Math.PI / 2;
      g.add(new T.Mesh(new T.LatheGeometry(V(pts), 72, phi0 || 0, phiLen || 2 * Math.PI), mat)); return g;
    }
    function wheel(key, x, w, hub, parent) {          // spoked pulley, axis X, rim radius R
      var p = P.pulley({ radius: R, width: w, hub: hub, material: c.mat(key) }); p.rotation.y = Math.PI / 2; p.position.x = x; parent.add(p);
      p.spokes[0].material = c.mat(key, "dark"); return p;
    }
    function bevel(key, r, n, cone, hub, hl, side, parent) {   // apex at x = XC on the shaft; side -1: back towards -X, +1: towards +X, 0: along the pin
      var w = new T.Group(); w.position.x = side ? XC : 0; w.rotation.z = side ? -side * Math.PI / 2 : 0; parent.add(w);
      w.add(P.bevelGearCone({ radius: r, teeth: n, cone: cone, addendum: 4, hub: hub, hubLength: hl, material: c.mat(key) })); return w;
    }

    // shaft x -80..120, bearing face to bearing face. Middle pulley x -40..0, hub x -38..-2.
    o.sh = spin(0, YL);
    P.at(P.cylX(5, 200, c.mat("shaft")), 20, 0, 0, o.sh);
    wheel("shaft", -20, 40, 16, o.sh);
    // shaft gear: back of the teeth at x 16.7, body to x -7.3 (it comes out of the pulley hub's end at x -2), hub r 12 to x -27.3
    var g1 = new T.Group(); g1.rotation.x = o.ps / 2; o.sh.add(g1);               // half a tooth offset so it meshes with the small gear
    bevel("shaft", RS, NS, CS, 12, 44, -1, g1);

    // third gear, loose on the shaft: teeth back at x 63.3, body to x 87.3, hub r 12 to x 107.3 inside the end pulley x 85..115, hub x 86.5..113.5
    o.held = spin(0, YL);
    bevel("third", RS, NS, CS, 12, 44, 1, o.held);
    wheel("third", 100, 30, 16, o.held);

    // right-hand pulley, the gear carrier, x 2..78. The rim is round, so it is drawn still with the front-lower quarter cut away;
    // the side plates, the cross bar, the pin and the small gear turn with it. The cut runs from the front (phi 0) round to 45 degrees past the bottom.
    var mc = c.mat("carrier"), rim = [[69, -38], [75, -38], [75, 38], [69, 38], [69, -38]];
    var rimG = turned(rim, mc, .75 * Math.PI, 1.25 * Math.PI); rimG.position.set(XC, YL, 0); scene.add(c.shell(rimG, "open"));
    var rimW = turned(rim, mc); rimW.position.set(XC, YL, 0); scene.add(c.shell(rimW, "closed"));   // closed view: the whole rim, r 69..75, x 2..78
    var sh = new T.Shape(V(rim));
    [Math.PI / 4, -Math.PI / 2].forEach(function (r) { var m = new T.Mesh(new T.ShapeGeometry(sh), mc); m.rotation.y = r; rimG.add(m); });   // the two cut faces
    o.car = spin(XC, YL);
    [-1, 1].forEach(function (s) { o.car.add(turned([[31, 34 * s], [68.5, 34 * s], [68.5, 38 * s], [31, 38 * s], [31, 34 * s]], mc)); });   // side plates x ±34..±38 from the centre, r 31..68.5
    P.at(P.box(1, 30, 6, c.mat("carrier", "dark")), 39, -48, 0, o.car);          // stripe x 38.5..39.5 on the right plate, r 33..63
    P.at(P.cylX(3.5, 68, mc), 0, 58, 0, o.car);                                // cross bar between the plates' inner faces x ±34, r 54.5..61.5
    P.at(P.cylY(3.5, 44.5, mc), 0, 32.25, 0, o.car);                           // pin r 10..54.5, from the collar to the bar
    P.at(P.cylX(10, 14, mc), 0, 0, 0, o.car);                                  // collar x ±7, loose on the shaft
    o.pl = new T.Group(); o.car.add(o.pl);
    bevel("carrier", RP, NP, 90 - CS, 7, 16, 0, o.pl);                          // small gear along the pin, r 21.9..48.2

    // loose pulley x -78..-42
    o.lp = spin(0, YL); wheel("belt", -60, 36, 14, o.lp);

    // drum and small pulley on the top shaft
    o.top = spin(-5, YT);
    P.at(P.cylX(R, 150, c.mat("drive")), 0, 0, 0, o.top);                      // x -80..70
    P.at(P.box(148, 1.5, 8, c.mat("drive", "dark")), 0, R + .5, 0, o.top);     // stripe on the drum
    P.at(P.cylX(7, 215, c.mat("drive")), 22.5, 0, 0, o.top);                   // shaft x -90..125, between the hanger faces
    var sp = P.pulley({ radius: RT, width: 30, hub: 12, material: c.mat("drive") }); sp.rotation.y = Math.PI / 2; sp.position.x = 105; o.top.add(sp);   // x 85..115
    sp.spokes[0].material = c.mat("drive", "dark");

    // band, built in the XY plane and turned so the pulley axes lie along X
    o.bg = new T.Group(); o.bg.rotation.y = Math.PI / 2; scene.add(o.bg);
    o.belt = P.belt({ width: BW, thick: BT, material: c.mat("belt") }).set(0, YT, o.rb, 0, YL, o.rb, false);
    o.bg.add(o.belt);
    o.bmark = P.box(10, BT + 1.5, BW + 1, c.mat("belt", "dark")); o.belt.add(o.bmark);
    // second belt, from the small pulley to the end pulley at x 100, rebuilt when it is crossed or opened
    o.rg = new T.Group(); o.rg.rotation.y = Math.PI / 2; o.rg.position.x = 100; scene.add(o.rg);
    o.belt2 = P.belt({ width: 20, thick: BT, material: c.mat("belt") }); o.rg.add(o.belt2);
    o.rmark = P.box(10, BT + 1.5, 21, c.mat("belt", "dark")); o.belt2.add(o.rmark);
    o.YT = YT; o.YL = YL;
    // fork: slider on a rail in front of the band, two pins either side of the front run (band z 75..79)
    o.fork = new T.Group(); scene.add(o.fork);
    var mb = c.mat("belt");
    P.at(P.box(44, 12, 16, mb), 0, 15, 103, o.fork);                           // slider y 9..21 on the rail top, z 95..111
    [-1, 1].forEach(function (s) { P.at(P.cylZ(2.5, 25, mb), s * 19, 15, 82.5, o.fork); });   // pins z 70..95, end at the slider back
    P.at(P.cylZ(3, 14, mb), 0, 15, 118, o.fork);                               // handle z 111..125
    P.at(P.sphere(6, c.mat("belt", "dark")), 0, 15, 129, o.fork);

    // frame
    P.at(P.box(260, 12, 210, F), 20, -221, 15, scene);                         // base x -110..150, y -227..-215, z -90..120
    P.at(P.box(16, 150, 30, F), -88, -140, 0, scene);                          // pedestal x -96..-80, y -215..-65; shaft ends at x -80
    P.at(P.box(16, 150, 30, F), 128, -140, 0, scene);                          // pedestal x 120..136, y -215..-65; shaft ends at x 120
    P.at(P.box(180, 12, 16, F), -6, 3, 103, scene);                            // rail x -96..84, y -3..9, z 95..111
    P.at(P.box(12, 212, 16, F), -90, -109, 103, scene);                        // rail post x -96..-84, y -215..-3
    P.at(P.box(12, 212, 16, F), 78, -109, 103, scene);                         // rail post x 72..84, y -215..-3
    P.at(P.box(263, 12, 40, F), 17.5, 221, 0, scene);                          // roof beam x -114..149, y 215..227
    P.at(P.box(16, 117, 30, F), -98, 156.5, 0, scene);                         // hanger x -106..-90, y 98..215; top shaft ends at x -90
    P.at(P.box(16, 117, 30, F), 133, 156.5, 0, scene);                         // hanger x 125..141, y 98..215; top shaft ends at x 125
  },

  step: function (c, dt, S) {
    var o = this.o, u = S.w, K = 6, K3 = 15, D = .8, Is = 1, Ic = .3, I3 = .1, N = 8, h = Math.min(dt, .05) / N;
    var band = S.controls.band, tx = o.X[band]; if (tx === undefined) { band = "loose"; tx = o.X.loose; }
    var cross = S.controls.rb === "cross";
    if (cross !== o.cross) { o.cross = cross; o.belt2.set(0, o.YT, o.rt, 0, o.YL, o.rb + 1, cross); }
    var w3t = (cross ? -1 : 1) * u * o.rt / o.rb;            // belt speed is the same at both pulleys
    if (!o.init) { o.init = true; o.w3 = w3t; o.wc = band === "right" ? u : band === "mid" ? (u + w3t) / 2 : w3t / 2; o.wlo = band === "loose" ? u : 0; }
    if (o.xb === null) o.xb = tx;
    var d = tx - o.xb, mv = 45 * Math.min(dt, .05);
    o.xb += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    function share(k) { var x = o.X[k], w = o.W[k]; return Math.max(0, Math.min(o.xb + o.BW / 2, x + w / 2) - Math.max(o.xb - o.BW / 2, x - w / 2)) / o.BW; }
    var fm = share("mid"), fc = share("right"), fl = share("loose");
    // Two free turnings: the pulley that carries the small gear (wc) and the third gear (w3). The big gears are equal, so the
    // shaft turns at ws = 2 wc - w3. Mass matrix from the energy Ic wc^2 + I3 w3^2 + Is ws^2; each belt drags the pulley under it.
    var a = Ic + 4 * Is, b = -2 * Is, e = I3 + Is, det = a * e - b * b;
    for (var i = 0; i < N; i++) {
      var ws = 2 * o.wc - o.w3;
      var ts = K * fm * (u - ws) - D * (1 - fm - fc) * ws, Qc = K * fc * (u - o.wc) + 2 * ts, Q3 = K3 * (w3t - o.w3) - ts;
      o.wc += (e * Qc - b * Q3) / det * h;
      o.w3 += (a * Q3 - b * Qc) / det * h;
    }
    o.wlo += (K * fl * (u - o.wlo) - D * (1 - fl) * o.wlo) * Math.min(dt, .05);
    o.tc += o.wc * dt; o.t3 += o.w3 * dt; o.tlo += o.wlo * dt; o.tTop += u * dt; o.s += u * o.rb * dt;
    var ts2 = 2 * o.tc - o.t3;

    o.top.rotation.x = o.tTop;
    o.sh.rotation.x = ts2;
    o.held.rotation.x = o.t3;
    o.car.rotation.x = o.tc;
    o.pl.rotation.y = (ts2 - o.tc) * o.k;                   // the small gear rolls on both big gears
    o.lp.rotation.x = o.tlo;
    o.bg.position.x = o.xb; o.fork.position.x = o.xb;
    o.belt.place(o.bmark, o.s);
    o.belt2.place(o.rmark, o.tTop * o.rt);

    function f(w) { var r = Math.round(w * 60 / (2 * Math.PI)); return (r < 0 ? "−" + -r : r === 0 ? 0 : r) + " rpm"; }
    S.set("d", f(u));
    S.set("s", f(2 * o.wc - o.w3));
    S.set("t", f(o.w3));
  }
});
