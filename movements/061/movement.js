M507.define({
  number: 61,
  title: "Two speeds, one by differential gearing",
  lede: "One belt from a drum can turn a shaft at two speeds. On one pulley the shaft turns as fast as the drum. On the next, gears hidden inside the pulley make it turn twice as fast.",
  alt: "A wide drum at the top drives a belt down to three pulleys on a lower shaft. Part of the right-hand pulley's rim is cut away to show three bevel gears inside. A strap with a hanging weight grips a small drum beside it. A fork holds the belt.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Drum", note: "A wide drum on the top shaft, turned by an engine. It is wide enough for the belt in any position." },
    { key: "shaft", color: "#C8873A", name: "Shaft and middle pulley", note: "The middle pulley is fixed to the shaft. So is a gear with sloping teeth, called a bevel gear, on the end of its hub." },
    { key: "carrier", color: "#E8E2D0", name: "Right-hand pulley", note: "It turns freely on the shaft. Inside it, a small bevel gear spins on a pin that sticks out sideways. Watch the small gear roll between the two big ones." },
    { key: "held", color: "#4FA58A", name: "Held gear", note: "A second big bevel gear that turns freely on the shaft, facing the first. The small drum beside it is part of it. The brake keeps it still." },
    { key: "brake", color: "#8E7AA8", name: "Brake strap and weight", note: "A strap over the small drum, tied down at the back. The weight pulls it tight. It holds the gear only by rubbing, so the gear can slip." },
    { key: "belt", color: "#D9B13B", name: "Belt, fork and loose pulley", note: "The fork slides the belt from pulley to pulley. The loose pulley is not fixed to the shaft. With the belt on it, it spins alone." }
  ],
  controls: [{ id: "band", label: "Belt on", value: "right", options: [["loose", "Loose"], ["mid", "Middle"], ["right", "Right"]] }],
  closed: { label: "Pulley" },
  readouts: [{ id: "d", label: "Drum" }, { id: "s", label: "Shaft" }],
  views: { "3d": [350, -60, 980], front: [10, 0, 900], side: [900, 0, 0] },
  target: [10, 0, 0],
  how: [
    "The belt runs from the drum down to one of three pulleys. The fork slides it across while the drum keeps turning. On the middle pulley the shaft turns at the same speed as the drum, because that pulley is fixed to it.",
    "The right-hand pulley carries a small bevel gear on a pin. It sits between two big bevel gears. One is fixed to the shaft. The other is held still by a brake. As the pulley turns, the small gear is carried round and rolls on the held gear, so it spins. Being carried round turns the shaft gear once. The spin adds a second turn. So the shaft turns twice for each turn of the pulley.",
    "The brake only grips by rubbing. When the shaft must suddenly speed up, the held gear is pushed hard and slips forward a little, then stops again. This saves the gears from a jerk. Try Middle, then Right, and watch the shaft's speed double while the held gear gives a small jump. Choose Closed to see the pulley as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing and description. His dotted lines show the gears hidden inside the pulleys. Here part of the right-hand pulley's rim is cut away, below the belt, so you can see them. The sizes, the tooth counts, the frame and the fork were made up. Brown draws the belt on the loose pulley. How hard the brake grips and how heavy the shaft is were also made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, F = c.fixed, YT = 110, YL = -80, R = 75, BT = 4, BW = 26, XC = 40;
    var RS = 30, NS = 15, RP = 20, NP = 10, CS = Math.atan2(RS, RP) * 180 / Math.PI;   // equal big gears; small gear on the pin
    var o = this.o = { tc: 0, t3: 0, wc: 0, w3: 0, tlo: 0, wlo: 0, tTop: 0, s: 0, xb: null, stuck: true, init: false,
      X: { loose: -60, mid: -20, right: XC }, W: { loose: 36, mid: 40, right: 76 }, BW: BW, rb: R + BT / 2 + .6, ps: 2 * Math.PI / NS, k: RS / RP };
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

    // shaft x -80..116, bearing face to bearing face. Middle pulley x -40..0, hub x -38..-2.
    o.sh = spin(0, YL);
    P.at(P.cylX(5, 196, c.mat("shaft")), 18, 0, 0, o.sh);
    P.at(P.box(8, 2, 3, c.mat("shaft", "dark")), 111.5, 5.2, 0, o.sh);         // stripe x 107.5..115.5, between the gear hub and the bearing
    wheel("shaft", -20, 40, 16, o.sh);
    // shaft gear: back of the teeth at x 16.7, body to x -7.3 (it comes out of the pulley hub's end at x -2), hub r 12 to x -27.3
    var g1 = new T.Group(); g1.rotation.x = o.ps / 2; o.sh.add(g1);               // half a tooth offset so it meshes with the small gear
    bevel("shaft", RS, NS, CS, 12, 44, -1, g1);

    // held gear, loose on the shaft: teeth back at x 63.3, body to x 87.3, hub r 12 to x 107.3; small drum x 90..104 on the hub
    o.held = spin(0, YL);
    bevel("held", RS, NS, CS, 12, 44, 1, o.held);
    P.at(P.cylX(24, 14, c.mat("held")), 97, 0, 0, o.held);
    P.at(P.box(1, 10, 4, c.mat("held", "dark")), 105, 18, 0, o.held);          // stripe x 104.5..105.5 on the drum's end face, r 13..23

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

    // drum on the top shaft
    o.top = spin(-5, YT);
    P.at(P.cylX(R, 150, c.mat("drive")), 0, 0, 0, o.top);                      // x -80..70
    P.at(P.box(148, 1.5, 8, c.mat("drive", "dark")), 0, R + .5, 0, o.top);     // stripe on the drum
    P.at(P.cylX(7, 170, c.mat("drive")), 0, 0, 0, o.top);                      // shaft x -90..80, between the hanger faces

    // band, built in the XY plane and turned so the pulley axes lie along X
    o.bg = new T.Group(); o.bg.rotation.y = Math.PI / 2; scene.add(o.bg);
    o.belt = P.belt({ width: BW, thick: BT, material: c.mat("belt") }).set(0, YT, o.rb, 0, YL, o.rb, false);
    o.bg.add(o.belt);
    o.bmark = P.box(10, BT + 1.5, BW + 1, c.mat("belt", "dark")); o.belt.add(o.bmark);
    // fork: slider on a rail in front of the band, two pins either side of the front run (band z 75..79)
    o.fork = new T.Group(); scene.add(o.fork);
    var mb = c.mat("belt");
    P.at(P.box(44, 12, 16, mb), 0, 15, 103, o.fork);                           // slider y 9..21 on the rail top, z 95..111
    [-1, 1].forEach(function (s) { P.at(P.cylZ(2.5, 25, mb), s * 19, 15, 82.5, o.fork); });   // pins z 70..95, end at the slider back
    P.at(P.cylZ(3, 14, mb), 0, 15, 118, o.fork);                               // handle z 111..125
    P.at(P.sphere(6, c.mat("belt", "dark")), 0, 15, 129, o.fork);

    // brake strap over the small drum (r 24, x 90..104): wraps the top half at r 24.5..26, x 92..102
    var mk = c.mat("brake"), strap = turned([[24.5, 92], [26, 92], [26, 102], [24.5, 102], [24.5, 92]], mk, Math.PI, Math.PI);
    strap.position.y = YL; scene.add(strap);
    P.at(P.box(10, 135, 1.5, mk), 97, -147.5, -25.25, scene);                  // back end y -215..-80, tied to the base top
    P.at(P.box(10, 85, 1.5, mk), 97, -122.5, 25.25, scene);                    // front end y -165..-80
    P.at(P.cylY(11, 26, mk), 97, -178, 25.25, scene);                          // weight y -191..-165, hangs from the strap's end

    // frame
    P.at(P.box(250, 12, 210, F), 15, -221, 15, scene);                         // base x -110..140, y -227..-215, z -90..120
    P.at(P.box(16, 150, 30, F), -88, -140, 0, scene);                          // pedestal x -96..-80, y -215..-65; shaft ends at x -80
    P.at(P.box(16, 150, 30, F), 124, -140, 0, scene);                          // pedestal x 116..132, y -215..-65; shaft ends at x 116
    P.at(P.box(180, 12, 16, F), -6, 3, 103, scene);                            // rail x -96..84, y -3..9, z 95..111
    P.at(P.box(12, 212, 16, F), -90, -109, 103, scene);                        // rail post x -96..-84, y -215..-3
    P.at(P.box(12, 212, 16, F), 78, -109, 103, scene);                         // rail post x 72..84, y -215..-3
    P.at(P.box(218, 12, 40, F), -5, 221, 0, scene);                            // roof beam x -114..104, y 215..227
    P.at(P.box(16, 117, 30, F), -98, 156.5, 0, scene);                         // hanger x -106..-90, y 98..215; top shaft ends at x -90
    P.at(P.box(16, 117, 30, F), 88, 156.5, 0, scene);                          // hanger x 80..96, y 98..215; top shaft ends at x 80
  },

  step: function (c, dt, S) {
    var o = this.o, u = S.w, K = 6, D = .8, Is = 1, Ic = .3, I3 = .1, TB = .35, N = 6, h = Math.min(dt, .05) / N;
    var band = S.controls.band, tx = o.X[band]; if (tx === undefined) { band = "loose"; tx = o.X.loose; }
    if (!o.init) { o.init = true; o.wc = band === "right" ? u : band === "mid" ? u / 2 : 0; o.wlo = band === "loose" ? u : 0; }
    if (o.xb === null) o.xb = tx;
    var d = tx - o.xb, mv = 45 * Math.min(dt, .05);
    o.xb += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    function share(k) { var x = o.X[k], w = o.W[k]; return Math.max(0, Math.min(o.xb + o.BW / 2, x + w / 2) - Math.max(o.xb - o.BW / 2, x - w / 2)) / o.BW; }
    var fm = share("mid"), fc = share("right"), fl = share("loose");
    // Two free turnings: the pulley that carries the small gear (wc) and the held gear (w3). The big gears are equal, so the
    // shaft turns at ws = 2 wc - w3. Mass matrix from the energy Ic wc^2 + I3 w3^2 + Is ws^2; the band drags the pulley under it.
    var a = Ic + 4 * Is, b = -2 * Is, e = I3 + Is, det = a * e - b * b;
    for (var i = 0; i < N; i++) {
      var ws = 2 * o.wc - o.w3;
      var ts = K * fm * (u - ws) - D * (1 - fm - fc) * ws, tc = K * fc * (u - o.wc), Qc = tc + 2 * ts;
      if (o.stuck) {
        var ac = Qc / a, need = ts - 2 * Is * ac;          // torque the brake must give to keep the held gear still
        if (Math.abs(need) <= TB) { o.wc += ac * h; o.w3 = 0; continue; }
        o.stuck = false; var t3 = need > 0 ? TB : -TB;
      } else t3 = o.w3 > 0 ? -TB : TB;                      // slipping: the brake rubs against the motion
      var Q3 = t3 - ts, w3 = o.w3;
      o.wc += (e * Qc - b * Q3) / det * h;
      o.w3 += (a * Q3 - b * Qc) / det * h;
      if (w3 !== 0 && w3 * o.w3 <= 0) { o.w3 = 0; o.stuck = true; }   // it has come to rest; the brake holds it again
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
    this.ws = 2 * o.wc - o.w3;

    function f(w) { var r = Math.round(w * 60 / (2 * Math.PI)); return (r < 0 ? "−" + -r : r === 0 ? 0 : r) + " rpm"; }
    S.set("d", f(u));
    S.set("s", f(this.ws));
  }
});
