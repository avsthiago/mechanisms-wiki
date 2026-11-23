M507.define({
  number: 174,
  title: "Bench clamp",
  lede: "Two curved jaws turn on screws fixed to a bench. When a board is pushed in between them, the jaws turn and close on its sides. The harder the board is pushed, the tighter it is held.",
  alt: "A flat plate with two curved jaws, one above the other, each turning on a screw. Their left ends cross like the tips of tongs. Each jaw has a round lobe on the right. A long board comes in from the right, between the lobes, and ends where the jaws pinch it.",
  parts: [
    { key: "board", color: "#5E7387", name: "Board", note: "The board is pushed in from the right. It is the only thing you move. It turns the jaws as it goes in." },
    { key: "jaw", color: "#C8873A", name: "Jaws", note: "Two curved arms, each turning on its own screw. The round lobe on the right is pushed open by the board. The left end then closes on the board." },
    { key: "screw", color: "#4FA58A", name: "Screws", note: "They hold each jaw to the plate and let it turn. They do not move." },
    { key: "mark", color: "#C2503F", name: "Red stripe", note: "A stripe on the board. Watch it to see how far the board has gone in." }
  ],
  controls: [{ type: "range", id: "t", label: "Board thickness", min: 50, max: 80, step: 1, value: 70, unit: "mm",
    presets: [[50, "Thin"], [70, "Medium"], [80, "Thick"]] }],
  readouts: [{ id: "x", label: "Board in" }, { id: "a", label: "Jaw angle" }],
  views: { front: [0, 0, 900], "3d": [380, 170, 1000], side: [850, 40, 0] },
  target: [30, 0, 0],
  how: [
    "Push the board in from the right. Its end meets the round lobe on each jaw and pushes the lobes apart. Each jaw turns on its screw, so its left end swings in towards the board.",
    "The jaws turn only while the end of the board rides over the lobes. After that the board slides under them. Soon the board reaches the curved left ends of the jaws and cannot go farther. It is now held, and pushing harder holds it tighter. Pull the board out and the jaws swing back.",
    "Try Thin, then Thick. Watch the jaw angle and how far the board goes in before it is held."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the two jaws, the two screws and the board. The exact shape of the jaws, the back plate, the base, the stops that hold the jaws open and the board thickness choice were made up. The jaws sit one in front of the other where their tips cross, so they do not touch. A real clamp would need a light spring to open the jaws again, and rubbing is left out.",

  K: {
    PY: 108, REST: -8 * Math.PI / 180, USTART: 260, cache: {}, pts: null,
    init: function () {
      if (this.pts) return;
      var inner = [[-262, -6], [-240, 12], [-200, 23], [-160, 35], [-110, 45], [-40, 52], [30, 62], [80, 66], [100, 74], [115, 85]];
      var k, a, w = inner.slice();
      for (k = 1; k <= 24; k++) { a = Math.PI + (Math.PI * 1.1) * k / 24 + 0; w.push([165 + 50 * Math.cos(a), 85 + 50 * Math.sin(a)]); }
      this.world = w;
      var loc = w.map(function (p) { return [p[0], p[1] - 108]; }), d = [], i, n, j;
      for (i = 0; i < loc.length - 1; i++) {
        n = Math.max(1, Math.ceil(Math.hypot(loc[i + 1][0] - loc[i][0], loc[i + 1][1] - loc[i][1]) / 1.5));
        for (j = 0; j < n; j++) d.push([loc[i][0] + (loc[i + 1][0] - loc[i][0]) * j / n, loc[i][1] + (loc[i + 1][1] - loc[i][1]) * j / n]);
      }
      d.push(loc[loc.length - 1]);
      this.pts = d;
      this.R = d.filter(function (p) { return p[0] > 0; });
      this.L = d.filter(function (p) { return p[0] <= 0; });
    },
    pen: function (set, a, h, u) {
      var c = Math.cos(a), s = Math.sin(a), i, p, wx, wy;
      for (i = 0; i < set.length; i++) {
        p = set[i]; wx = c * p[0] - s * p[1]; wy = this.PY + s * p[0] + c * p[1];
        if (wx >= u && wy < h - 1e-6) return true;
      }
      return false;
    },
    lo: function (h, u) {            // smallest angle at which the lobe clears the board
      this.init(); var a = -.7, b = .7, m, i;
      if (!this.pen(this.R, a, h, u)) return a;
      for (i = 0; i < 40; i++) { m = (a + b) / 2; if (this.pen(this.R, m, h, u)) a = m; else b = m; }
      return b;
    },
    hi: function (h, u) {            // largest angle at which the left end clears the board
      this.init(); var a = -.7, b = .7, m, i;
      if (!this.pen(this.L, a, h, u)) { if (!this.pen(this.L, b, h, u)) return b; } else return -9;
      for (i = 0; i < 40; i++) { m = (a + b) / 2; if (this.pen(this.L, m, h, u)) b = m; else a = m; }
      return a;
    },
    umin: function (h) {             // farthest the board goes before it is held
      var key = Math.round(h * 4), u;
      if (this.cache[key] !== undefined) return this.cache[key];
      for (u = this.USTART; u > -300; u -= .5) if (this.lo(h, u) > this.hi(h, u)) break;
      return (this.cache[key] = u + .5);
    },
    angle: function (h, u) { return Math.max(this.REST, this.lo(h, u)); }
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, o = this.o = { ph: 0 };
    K.init();
    function chaikin(a, n) {
      while (n--) {
        var r = [a[0]], i;
        for (i = 0; i < a.length - 1; i++) {
          r.push([.75 * a[i][0] + .25 * a[i + 1][0], .75 * a[i][1] + .25 * a[i + 1][1]], [.25 * a[i][0] + .75 * a[i + 1][0], .25 * a[i][1] + .75 * a[i + 1][1]]);
        }
        r.push(a[a.length - 1]); a = r;
      }
      return a;
    }
    // upper jaw outline in local coordinates (pivot at origin); lower jaw is the mirror image
    var outer = chaikin([[182, 132], [120, 160], [40, 172], [-30, 160], [-100, 125], [-150, 100], [-230, 45], [-268, 18], [-278, 5], [-262, -6]].map(function (p) { return [p[0], p[1] - 108]; }), 2);
    function jaw(sg, z0, mat) {
      var loc = K.world.map(function (p) { return [p[0], p[1] - 108]; }), sh = new T.Shape(), poly = loc.concat(outer.slice(0, outer.length - 1)), i, q;
      poly = poly.map(function (p) { return [p[0], sg * p[1]]; });
      if (sg < 0) poly.reverse();
      for (i = 0; i < poly.length; i++) { q = poly[i]; if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); }
      sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: 18, bevelEnabled: false }); g.translate(0, 0, z0);
      return new T.Mesh(g, mat);
    }
    o.up = new T.Group(); o.up.position.set(0, 108, 0); scene.add(o.up);
    o.up.add(jaw(1, 1, c.mat("jaw")));                                                        // upper jaw z 1..19
    o.dn = new T.Group(); o.dn.position.set(0, -108, 0); scene.add(o.dn);
    o.dn.add(jaw(-1, -19, c.mat("jaw")));                                                     // lower jaw z -19..-1
    // screws: spacers from the plate face (z -30), shaft through the jaw, head on its front face
    P.at(P.cylZ(10, 30, c.mat("screw")), 0, 108, -15, scene);                                 // upper spacer z -30..0
    P.at(P.cylZ(6, 24, c.mat("screw")), 0, 108, 9, scene);                                    // shaft z -3..21
    P.at(P.cylZ(12, 4, c.mat("screw")), 0, 108, 21, scene);                                   // head z 19..23
    var s1 = P.box(20, 3, .8, c.mat("screw", "dark")); s1.rotation.z = -.4; P.at(s1, 0, 108, 23.4, scene);   // slot z 23..23.8
    P.at(P.cylZ(10, 10, c.mat("screw")), 0, -108, -25, scene);                                // lower spacer z -30..-20
    P.at(P.cylZ(6, 24, c.mat("screw")), 0, -108, -10, scene);                                 // shaft z -22..2
    P.at(P.cylZ(12, 4, c.mat("screw")), 0, -108, 1, scene);                                   // head z -1..3
    var s2 = P.box(20, 3, .8, c.mat("screw", "dark")); s2.rotation.z = -.4; P.at(s2, 0, -108, 3.4, scene);   // slot z 3..3.8
    // board: local x 0..560 from its leading end, y +-35 (scaled to the chosen thickness), z -18..18
    o.board = new T.Group(); scene.add(o.board);
    o.bb = new T.Group(); o.board.add(o.bb);
    P.at(P.box(560, 70, 36, c.mat("board")), 280, 0, 0, o.bb);
    P.at(P.box(14, 40, .8, c.mat("mark")), 80, 0, 18.4, o.bb);                                // stripe z 18..18.8
    // back plate x -290..290, y -212..212, z -40..-30; base x -320..320, y -224..-212, z -80..20
    P.at(P.box(580, 424, 10, c.fixed), 0, 0, -35, scene);
    P.at(P.box(640, 12, 100, c.fixed), 0, -218, -30, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, th = +S.controls.t, h = th / 2, um, u, al, d;
    o.ph += S.w * dt;
    um = K.umin(h);
    u = um + (K.USTART - um) * (1 - Math.cos(o.ph)) / 2;
    al = K.angle(h, u);
    o.up.rotation.z = al; o.dn.rotation.z = -al;
    o.board.position.x = u; o.bb.scale.y = h / 35;
    S.set("x", Math.max(0, Math.round(K.USTART - u)) + " mm");
    d = Math.round(al * 1800 / Math.PI) / 10;
    S.set("a", (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d).toFixed(1) + "°");
  }
});
