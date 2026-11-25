(function () {
  // Flat layout in model units, wheel centre at the origin, as in Brown's drawing.
  var DEG = Math.PI / 180;
  var RIN = 100, ROUT = 125, TIP = 4;                       // rim: inside and outside radius; round end of the short lever
  var PIN = [150, -5];                                      // short lever's pin, in the block's frame (block frame = wheel frame turned by psi)
  var TV = [-25, 25], EV = [100, 5];                        // short lever, from its pin: centre of its round end; end for the link
  var HP = [320, 325], JV = [-70, -5], GV = [80, -380];     // hand lever: pivot; short arm end; handle end
  var PLAY = 0.09;                                          // how far the short lever can turn on its pin, in radians
  var NR = 60, RR = 118, DR = 6, STR = 2 * Math.PI / NR;    // ratchet behind the wheel: teeth, tip radius, depth, pitch

  function rot(v, a) { var c = Math.cos(a), s = Math.sin(a); return [c * v[0] - s * v[1], s * v[0] + c * v[1]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function tipC(g) { return add(PIN, rot(TV, g)); }         // round end centre in the block frame
  var GG = (function () {                                   // lever angle at which the round end bears on the rim
    var lo = -0.6, hi = 0.6;                                // |tipC| falls as g grows
    for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (Math.hypot.apply(null, tipC(m)) > ROUT + TIP) lo = m; else hi = m; }
    return (lo + hi) / 2;
  })(), GR = GG - PLAY;
  function E(psi, g) { return rot(add(PIN, rot(EV, g)), psi); }
  function J(a) { return add(HP, rot(JV, a)); }
  var LL = Math.hypot(J(0)[0] - E(0, GG - PLAY / 2)[0], J(0)[1] - E(0, GG - PLAY / 2)[1]);
  function solve(f, x) {                                    // Newton on one unknown
    for (var i = 0; i < 30; i++) { var y = f(x); if (Math.abs(y) < 1e-10) break; var d = (f(x + 1e-6) - y) / 1e-6; x -= y / d; }
    return x;
  }
  function Sim() { this.psi = 0; this.g = GG - PLAY / 2; this.th = 0; this.a = 0; this.state = "free"; this.gain = 0; this.last = null; this.da = 0; }
  Sim.prototype.to = function (a) {                         // move the hand lever to angle a
    var s = this, j = J(a), da = a - s.a;
    function gap(p, g) { var e = E(p, g); return Math.hypot(e[0] - j[0], e[1] - j[1]) - LL; }
    var g = solve(function (x) { return gap(s.psi, x); }, s.g);
    if (g > GG || g < GR) {                                 // the lever is at the end of its play: the block must move
      var gc = g > GG ? GG : GR, p = solve(function (x) { return gap(x, gc); }, s.psi), d = p - s.psi;
      if (gc === GG && d > 0) { s.th += d; s.gain += d; s.state = "grip"; } else s.state = gc === GG ? "grip" : "slide";
      s.psi = p; s.g = gc;
    } else { s.g = g; s.state = "free"; }
    if (s.da < 0 && da > 0) { s.last = s.gain; s.gain = 0; }   // the lifting stroke has ended
    if (da !== 0) s.da = da;
    s.a = a;
  };

  function rimAt(a) { var f = -a / STR + 1e-9; f -= Math.floor(f); return RR - DR + DR * f; }   // same as P.ratchet with reverse: true
  function pawlDef(deg, back, out) {                        // a click whose nose sits at angle deg on the ratchet's root, with its pin back along the rim and out
    var n = (RR - DR), c = Math.cos(deg * DEG), s = Math.sin(deg * DEG);
    var piv = [n * c + back * s + out * c, n * s - back * c + out * s];
    return { piv: piv, len: Math.hypot(back, out), deg: deg * DEG, back: back, out: out };
  }
  var PAWLS = [pawlDef(60, 40, 70), pawlDef(39, 35, 45)];  // three and a half teeth apart, so one of them is always close to a face
  function pawlShape(pw) {                                  // outline in the pawl's frame: pin at the origin, nose at (len, 0)
    var n = [(RR - DR) * Math.cos(pw.deg), (RR - DR) * Math.sin(pw.deg)], ex = (n[0] - pw.piv[0]) / pw.len, ey = (n[1] - pw.piv[1]) / pw.len;
    function loc(vx, vy) { return [vx * ex + vy * ey, -vx * ey + vy * ex]; }
    var rh = loc(Math.cos(pw.deg), Math.sin(pw.deg)), th = loc(-Math.sin(pw.deg), Math.cos(pw.deg));
    function at(a, b) { return [pw.len + a * th[0] + b * rh[0], a * th[1] + b * rh[1]]; }
    var k = pw.out / pw.back;
    return [at(0, 0), at(-1.5, 8.5), at(-pw.back + 6, pw.out + 6 * k / 2 + 3), at(-pw.back - 6, pw.out - 6)];
  }
  function meet(r1, q, r2, side) {
    var d = Math.hypot(q[0], q[1]), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a)), ux = q[0] / d, uy = q[1] / d;
    return [a * ux + side * h * uy, a * uy - side * h * ux];
  }
  function seat(pw, th) {                                   // the nose resting on the teeth (the nose is anticlockwise of its pin)
    var r = RR - DR, n;
    for (var i = 0; i < 30; i++) { n = meet(r, pw.piv, pw.len, -1); r = rimAt(Math.atan2(n[1], n[0]) - th); }
    return n;
  }

  M507.define({
    number: 280,
    title: "Lever-worked windlass",
    lede: "A way to turn a heavy windlass by rocking a long hand lever. A short lever grips the rim of the wheel, pushes it round a little, then lets go and slides back for the next push. Nothing has teeth except the ratchet that stops the wheel running back.",
    alt: "A big wheel with a broad rim stands in front of a timber frame. A block straddles the right side of the rim, and a short red lever on a pin in the block touches the outside of the rim. A long rod rises from the short lever to a tall hand lever hinged on top of the right-hand post. Two holding pawls hang from the middle post and rest on a toothed wheel behind the big wheel.",
    parts: [
      { key: "hand", color: "#5E7387", name: "Hand lever", note: "The long lever a person rocks to and fro. Its short arm at the top lifts and lowers the rod." },
      { key: "link", color: "#D9B13B", name: "Rod", note: "Joins the hand lever to the outer end of the short lever." },
      { key: "lever", color: "#C2503F", name: "Short lever", note: "Turns a little on a pin in the block. Its round end presses on the outside of the rim. Watch the small gap open and close." },
      { key: "block", color: "#4FA58A", name: "Gripping block", note: "A cast-iron block with two jaws, one each side of the rim. A ledge on each jaw reaches under the rim and touches its inside." },
      { key: "wheel", color: "#C8873A", name: "Wheel", note: "The windlass wheel, with a broad rim to be gripped. It only ever turns one way." },
      { key: "ratchet", color: "#8E7AA8", name: "Ratchet wheel and holding pawls", note: "A wheel with saw teeth on the same shaft, behind the big wheel. Two catches, called holding pawls, rest on it and stop it turning back." }
    ],
    controls: [{ type: "range", id: "sw", label: "Swing of the hand lever", min: 4, max: 16, step: 1, value: 12, unit: "°",
      presets: [[5, "Short"], [12, "As drawn"], [16, "Long"]] }],
    speed: { min: 4, max: 40, value: 16, label: "Strokes", unit: " a min" },
    readouts: [{ id: "st", label: "Short lever" }, { id: "per", label: "Last stroke" }, { id: "tot", label: "Wheel" }],
    views: { "3d": [615, 396, 1063], front: [110, 105, 1180], side: [1120, 120, -20] },
    target: [110, 120, -20],
    how: [
      "Rock the hand lever and the rod goes up and down. On the way up, the short lever first turns on its pin until its round end meets the rim. Then the rim is caught tight between that end and the ledges on the inside. The block, the short lever and the wheel all turn together.",
      "On the way down, the short lever turns back and its end lifts off the rim. Now nothing grips, so the block slides back down the rim. The wheel stays put, because the holding pawls behind it drop into the ratchet teeth. The harder you lift, the harder the rim is squeezed, so it does not slip.",
      "The first part of every lift is spent closing the small gap at the round end. Only the rest of the lift turns the wheel. Try a short swing and see how little the wheel moves. Then try a long one."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown mentions the ratchet and holding pawls but does not show the ratchet; here it sits behind the wheel, and the two rods drawn from the middle post are read as the holding pawls. The barrel and rope of the windlass are left out, as in the drawing. The bearing for the wheel's shaft, the studs, the sizes and the amount of play in the short lever were made up.",

    Sim: Sim, geo: { GG: GG, GR: GR, tipC: tipC, PAWLS: PAWLS, pawlShape: pawlShape, seat: seat, rimAt: rimAt, ROUT: ROUT, RIN: RIN, TIP: TIP, PIN: PIN, TV: TV },

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed, i;
      var o = this.o = { sim: new Sim(), ph: 0 };
      function ext(pts, depth, z0, m) {
        var sh = new T.Shape(); pts.forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
        var g = new T.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, z0);
        return new T.Mesh(g, m);
      }
      function arcPts(r, a0, a1, n) { var p = []; for (var k = 0; k <= n; k++) { var a = (a0 + (a1 - a0) * k / n) * DEG; p.push([r * Math.cos(a), r * Math.sin(a)]); } return p; }

      // frame, behind everything (front faces at z -40)
      P.at(P.box(570, 10, 110, fx), 135, -170, -45, scene);        // ground x -150..420, y -175..-165, z -100..10
      P.at(P.box(80, 330, 40, fx), 60, 0, -60, scene);             // left post x 20..100, y -165..165 (on the ground), z -80..-40
      P.at(P.box(42, 44, 40, fx), -1, 0, -60, scene);              // bearing for the wheel's shaft x -22..20 (against the post), y -22..22
      P.at(P.box(85, 330, 40, fx), 157.5, 0, -60, scene);          // middle post x 115..200, y -165..165
      P.at(P.box(60, 545, 40, fx), 300, 107.5, -60, scene);        // right post x 270..330, y -165..380
      scene.add(ext([[20, 165], [100, 165], [270, 290], [270, 365]], 40, -80, fx));   // brace: foot on the left post top, end on the right post's face
      P.at(P.cylZ(6, 8, fx), HP[0], HP[1], -36, scene);            // hand lever stud z -40..-32
      PAWLS.forEach(function (pw) { P.at(P.cylZ(5, 2, fx), pw.piv[0], pw.piv[1], -39, scene); });   // click studs z -40..-38

      // wheel and ratchet on one shaft
      o.wheel = P.at(new T.Group(), 0, 0, 0, scene);
      var mw = c.mat("wheel"), rim = new T.Shape(), hole = new T.Path();
      rim.absarc(0, 0, ROUT, 0, 2 * Math.PI, false); hole.absarc(0, 0, RIN, 0, 2 * Math.PI, true); rim.holes.push(hole);
      var rg = new T.ExtrudeGeometry(rim, { depth: 30, bevelEnabled: false, curveSegments: 90 }); rg.translate(0, 0, -15);
      o.wheel.add(new T.Mesh(rg, mw));                                  // rim r 100..125, z -15..15
      P.at(P.cylZ(RIN + .5, 10, mw), 0, 0, 0, o.wheel);                // web z -5..5, into the rim
      P.at(P.cylZ(18, 18, mw), 0, 0, 0, o.wheel);                      // hub z -9..9
      P.at(P.cylZ(9, 35, mw), 0, 0, -22.5, o.wheel);                   // shaft z -40..-5, bearing face to web
      P.at(P.box(19, 6, .6, c.mat("wheel", "dark")), 0, 112.5, 15.3, o.wheel).rotation.z = Math.PI / 2;   // stripe on the rim's front, 0.6 proud
      P.at(P.cylZ(10, 1, c.mat("wheel", "dark")), 0, 0, 9.5, o.wheel); // hub cap z 9..10
      var mr = c.mat("ratchet");
      P.at(P.ratchet({ teeth: NR, radius: RR, depth: DR, width: 12, bore: 9, reverse: true, material: mr }), 0, 0, -32, o.wheel);   // z -38..-26
      o.pawls = PAWLS.map(function (pw) {
        var g = P.at(new T.Group(), pw.piv[0], pw.piv[1], -32, scene);
        g.add(ext(pawlShape(pw), 10, -5, mr));                          // z -37..-27
        g.add(P.cylZ(8, 12, mr));                                       // boss z -38..-26
        return g;
      });

      // gripping block (turns about the wheel's axis by psi)
      o.block = P.at(new T.Group(), 0, 0, 0, scene);
      var mb = c.mat("block");
      var jaw = arcPts(92, -22, 16, 20).concat(arcPts(132, 16, 4, 6), [[168, 9], [168, -20]], arcPts(132, -9, -22, 6));
      o.block.add(ext(jaw, 6, 16, mb));                                 // front jaw z 16..22, 1 clear of the rim's face
      o.block.add(ext(jaw, 6, -22, mb));                                // back jaw z -22..-16
      var ledge = arcPts(92, -22, 16, 20).concat(arcPts(RIN - .5, 16, -22, 20));
      o.block.add(ext(ledge, 9, 7, mb));                                // front ledge z 7..16, 0.5 inside the rim's inner face
      o.block.add(ext(ledge, 9, -16, mb));                              // back ledge z -16..-7 (the web is z -5..5)
      P.at(P.box(8, 7.5, 32, mb), 136, -15.75, 0, o.block);             // bridge x 132..140, y -19.5..-12, z -16..16, joins the jaws outside the rim
      P.at(P.cylZ(5, 46, c.mat("block", "dark")), PIN[0], PIN[1], 0, o.block);   // pin z -23..23 through both jaws

      // short lever, on its pin
      o.lever = P.at(new T.Group(), PIN[0], PIN[1], 0, o.block);
      var ml = c.mat("lever");
      var a1 = P.armPlate({ length: Math.hypot(TV[0], TV[1]), r0: 9, r1: TIP, thick: 24, material: ml }); a1.rotation.z = Math.atan2(TV[1], TV[0]); o.lever.add(a1);   // z -12..12
      var a2 = P.armPlate({ length: Math.hypot(EV[0], EV[1]), r0: 9, r1: 7, thick: 16, material: ml }); a2.rotation.z = Math.atan2(EV[1], EV[0]); o.lever.add(a2);   // z -8..8
      P.at(P.cylZ(4, 9.5, c.mat("link")), EV[0], EV[1], -12.75, o.lever);   // pin for the rod z -17.5..-8

      // rod and hand lever
      var mk = c.mat("link");
      o.rod = P.at(P.rod(4, mk), 0, 0, 0, scene);
      o.eyeA = P.at(P.cylZ(8, 9, mk), 0, 0, -17, scene); o.eyeB = P.at(P.cylZ(8, 9, mk), 0, 0, -17, scene);   // rod eyes z -21.5..-12.5
      o.hand = P.at(new T.Group(), HP[0], HP[1], -27, scene);           // hand lever z -32..-22
      var mh = c.mat("hand");
      var h1 = P.armPlate({ length: Math.hypot(JV[0], JV[1]), r0: 20, r1: 9, thick: 10, material: mh }); h1.rotation.z = Math.atan2(JV[1], JV[0]); o.hand.add(h1);
      var h2 = P.armPlate({ length: Math.hypot(GV[0], GV[1]) - 50, r0: 14, r1: 6, thick: 9, material: mh }); h2.rotation.z = Math.atan2(GV[1], GV[0]); o.hand.add(h2);
      var grip = P.sphere(1, mh); grip.scale.set(9, 36, 9);
      var gd = Math.hypot(GV[0], GV[1]) - 30, ga = Math.atan2(GV[1], GV[0]);
      P.at(grip, gd * Math.cos(ga), gd * Math.sin(ga), 0, o.hand).rotation.z = ga - Math.PI / 2;   // handle, along the arm
      P.at(P.cylZ(9, 1, c.mat("hand", "dark")), 0, 0, 5.5, o.hand);    // cap on the pivot z 5..6 (local)
      P.at(P.cylZ(4, 9.5, mk), JV[0], JV[1], 9.75, o.hand);             // pin for the rod, z -22..-12.5

      // settle into the steady rocking, then start the count from zero
      for (i = 0; i <= 400; i++) o.sim.to(12 * DEG * Math.sin(i / 400 * 2 * Math.PI));
      o.sim.th = 0; o.sim.last = null; o.sim.gain = 0;
      this.place();
    },

    place: function () {
      var o = this.o, s = o.sim;
      o.block.rotation.z = s.psi;
      o.lever.rotation.z = s.g;
      o.wheel.rotation.z = s.th;
      o.hand.rotation.z = s.a;
      var e = E(s.psi, s.g), j = J(s.a);
      o.rod.span(e[0], e[1], -17, j[0], j[1], -17);
      o.eyeA.position.set(e[0], e[1], -17); o.eyeB.position.set(j[0], j[1], -17);
      PAWLS.forEach(function (pw, k) { var n = seat(pw, s.th); o.pawls[k].rotation.z = Math.atan2(n[1] - pw.piv[1], n[0] - pw.piv[0]); });
    },

    step: function (c, dt, S) {
      var o = this.o, A = +S.controls.sw * DEG, n = Math.max(1, Math.ceil(Math.abs(S.w * dt) / .01));
      for (var i = 0; i < n; i++) { o.ph += S.w * dt / n; o.sim.to(A * Math.sin(o.ph)); }
      if (n === 1 && dt === 0) o.sim.to(A * Math.sin(o.ph));
      this.place();
      var s = o.sim;
      S.set("st", s.state === "grip" ? "Gripping" : s.state === "slide" ? "Sliding back" : "Turning on pin");
      S.set("per", s.last === null ? "–" : (s.last / DEG).toFixed(1) + "°");
      S.set("tot", Math.round(s.th / DEG) + "°");
    }
  });
})();
