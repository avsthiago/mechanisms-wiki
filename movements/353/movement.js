M507.define({
  number: 353,
  title: "Tilt hammer as a first-order lever",
  lede: "A wheel with pointed wipers turns beside the short end of a long lever. Each wiper pushes the short end down, so the heavy hammer head at the other end swings up. When the wiper slips off, the head drops onto the anvil.",
  alt: "A long wooden arm rests on a pivot in the middle. A heavy block is on its left end above an anvil. Its short right end touches a wheel with four pointed wipers that stands on a post.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Wiper wheel", note: "A wheel with pointed wipers round its rim. It turns all the time. Each wiper pushes the short end of the arm down." },
    { key: "helve", color: "#D9B13B", name: "Swinging arm", note: "The long arm, called the helve. The pivot is between its two ends, so pushing one end down lifts the other." },
    { key: "head", color: "#8E7AA8", name: "Hammer head", note: "The heavy block on the long end. Watch it rise slowly and fall fast." },
    { key: "pivot", color: "#C2503F", name: "Pivot", note: "The pin the arm swings on. It stays still." },
    { key: "anvil", color: "#4FA58A", name: "Anvil", note: "The block the head strikes. It does not move." }
  ],
  controls: [{ id: "n", label: "Wipers on the wheel", value: "4", options: [["2", "2 wipers"], ["4", "4 wipers"], ["6", "6 wipers"]] }],
  speed: { min: 1, max: 30, value: 8, label: "Speed", unit: " rpm" },
  readouts: [{ id: "h", label: "Head raised" }, { id: "b", label: "Blows" }],
  views: { "3d": [150, 0, 640], front: [10, -60, 680], side: [700, -60, 0] },
  target: [10, -60, 0],
  distance: [260, 1400],
  how: [
    "The wheel turns. A wiper meets the short end of the arm and pushes it down. Because the pivot is between the ends, the long end with the heavy head goes up.",
    "The wiper reaches only so far. When its tip slides past the end of the arm, nothing holds the arm up. The head drops by its own weight and strikes the anvil. A moment later the next wiper arrives.",
    "The long end moves much farther than the short end. A small push on the short end gives a big swing of the head. Try 2 wipers, then 6, and count the blows for each turn of the wheel."
  ],
  note: "This model is rebuilt from Brown's drawing. The posts that hold the pivot and the wheel, the base, the anvil's shape and all the sizes were made up. The wipers are drawn as plain spikes. The head falls only under its own weight and bounces a little on the anvil. The choice of 2 or 6 wipers was added for comparison.",

  // Coordinates: pivot O at the origin, arm along x. phi = tilt of the arm, positive when the head (left end) is up.
  // The tail end (distance A from O, pad radius RP) goes down by A sin(phi). The wheel centre W is to the right.
  G: function () {
    var A = 58, RP = 5, W = { x: 122, y: 17 }, PHI0 = 0, PHI1 = 16 * Math.PI / 180;
    function pad(phi) { return { x: A * Math.cos(phi), y: -A * Math.sin(phi) }; }
    function rel(phi) { var p = pad(phi), dx = p.x - W.x, dy = p.y - W.y, r = Math.sqrt(dx * dx + dy * dy); return { r: r, psi: Math.atan2(dy, dx) + 2 * Math.PI, al: Math.atan2(dy, dx) + 2 * Math.PI - Math.asin(RP / r) }; }
    var RT = Math.sqrt(Math.pow(rel(PHI1).r, 2) - RP * RP);                // wiper reach: the pad slips off at PHI1
    return { A: A, RP: RP, W: W, PHI0: PHI0, PHI1: PHI1, RT: RT, pad: pad, rel: rel, al0: rel(PHI0).al, al1: rel(PHI1).al };
  },
  // Tilt that puts the pad against a wiper edge at angle al (radians), or null when that wiper does not reach the pad.
  contact: function (G, al) {
    var d = (al - G.al0) % (2 * Math.PI); if (d < 0) d += 2 * Math.PI;
    if (d > G.al1 - G.al0) return null;
    var lo = G.PHI0, hi = G.PHI1, a = G.al0 + d;
    for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (G.rel(mid).al < a) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, G = this.G();
    var o = this.o = { G: G, th: 0, phi: G.PHI1, w: 0, blows: 0, wheels: {}, first: true };
    // helve group, turns about the pivot at the origin. Arm x -101..52, pad to x 58, head x -139..-101.
    o.arm = new T.Group(); scene.add(o.arm);
    P.at(P.box(153, 10, 12, c.mat("helve")), -24.5, 0, 0, o.arm);                 // bar x -101..52, y -5..5, z -6..6
    P.at(P.box(34, 32, 16, c.mat("helve")), 0, 0, 0, o.arm);                      // block round the pivot x -17..17, y -16..16, z -8..8
    P.at(P.box(6, 20, 16, c.mat("helve")), 55, 0, 0, o.arm);                      // pad x 52..58, y -10..10, z -8..8
    P.at(P.box(38, 56, 36, c.mat("head")), -120, 0, 0, o.arm);                    // head x -139..-101, y -28..28, z -18..18; bottom face lies flat on the anvil at tilt 0
    P.at(P.box(30, 1, 6, c.mat("head", "dark")), -120, 28.5, 0, o.arm);           // dark stripe on the head top y 28..29
    // pivot pin: from the back post face (z -10) through the block, a little proud of the front (z 8..10)
    P.at(P.cylZ(4, 20, c.mat("pivot")), 0, 0, 0, scene);                          // z -10..10
    // wheel on a front post
    o.wheel = new T.Group(); o.wheel.position.set(G.W.x, G.W.y, 0); scene.add(o.wheel);
    P.at(P.cylZ(38, 16, c.mat("wheel")), 0, 0, 0, o.wheel);                       // z -8..8
    P.at(P.cylZ(9, 2, c.mat("wheel")), 0, 0, 9, o.wheel);                         // hub z 8..10, touches the post face at 10
    [2, 4, 6].forEach(function (n) {
      var g = new T.Group(), r0 = 30, rt = G.RT;
      for (var i = 0; i < n; i++) {
        var sh = new T.Shape(), a = i * 2 * Math.PI / n, b = 40 * Math.PI / 180;
        sh.moveTo(r0, 0); sh.lineTo(rt, 0); sh.lineTo(44 * Math.cos(-b), 44 * Math.sin(-b)); sh.lineTo(r0 * Math.cos(-b * 1.3), r0 * Math.sin(-b * 1.3)); sh.closePath();
        var gm = new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false });   // z 0..12 then moved to -6..6
        gm.translate(0, 0, -6);
        var bl = new T.Mesh(gm, c.mat("wheel")); bl.rotation.z = a; g.add(bl);
      }
      o.wheel.add(g); g.visible = false; o.wheels[n] = g;
    });
    P.at(P.box(.8, 20, 4, c.mat("wheel", "dark")), 29, 0, 8.4, o.wheel);          // dark mark on the front face z 8..8.8 (x 28..30)
    // supports (c.fixed)
    var YB = -136;                                                                // top of the base
    P.at(P.box(430, 12, 120, c.fixed), 15, YB - 6, 0, scene);                      // base x -200..230, y -148..-136, z -60..60
    P.at(P.box(32, 152, 24, c.fixed), 0, -60, -22, scene);                         // pivot post x -16..16, y -136..16, z -34..-10; pin starts on its face
    P.at(P.box(32, 153, 24, c.fixed), G.W.x, -59.5, 22, scene);                    // wheel post x 106..138, y -136..17, z 10..34
    P.at(P.cylZ(16, 24, c.fixed), G.W.x, G.W.y, 22, scene);                        // rounded top y 1..33, z 10..34
    // anvil: head bottom is at y = -28 when level
    P.at(P.box(70, 12, 40, c.mat("anvil")), -120, -34, 0, scene);                  // top x -155..-85, y -40..-28, z -20..20
    P.at(P.box(44, 96, 36, c.mat("anvil")), -120, -88, 0, scene);                  // body y -136..-40
    this.place(o);
  },

  place: function (o) {
    o.arm.rotation.z = -o.phi;
    o.wheel.rotation.z = o.th;
  },

  step: function (c, dt, S) {
    var o = this.o, G = o.G, n = +S.controls.n || 4, k, vis;
    for (k in o.wheels) o.wheels[k].visible = +k === n;
    if (o.first) { o.first = false; o.th = G.rel(G.PHI1).al; }                    // opening: a wiper at the pad, about to let go
    if (dt > 0.05) dt = 0.05;
    var steps = 6, h = dt / steps, i, j;
    for (i = 0; i < steps && dt > 0; i++) {
      o.th += S.w * h;
      var floor = null;
      for (j = 0; j < n; j++) {
        var f = this.contact(G, o.th + j * 2 * Math.PI / n);
        if (f !== null && (floor === null || f > floor)) floor = f;
      }
      if (S.playing) {
        o.w -= 30 * Math.cos(o.phi) * h;                                          // head's weight pulls the head down
        o.phi += o.w * h;
        if (o.phi <= G.PHI0) { if (o.w < -1) o.blows++; o.phi = G.PHI0; o.w = o.w < -1 ? -.25 * o.w : 0; }
        if (o.phi > 0.6) { o.phi = 0.6; o.w = 0; }
      }
      if (floor !== null && o.phi < floor) { o.w = (floor - o.phi) / h; o.phi = floor; }
    }
    this.place(o);
    S.set("h", (125 * Math.sin(o.phi)).toFixed(0) + " mm");
    S.set("b", String(o.blows));
  }
});
