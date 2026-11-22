M507.define({
  number: 363,
  title: "See-saw",
  lede: "A long plank rests on a post in the middle. Two riders sit on its ends and push off the ground by turns, so the plank rocks up and down. It is the simplest way to turn a push into a swing back and forth.",
  alt: "A long plank rests on a tall post. It is tilted, with its left end high and its right end low. A small rider sits at each end, against a short board.",
  parts: [
    { key: "left", color: "#5E7387", name: "Left rider", note: "Sits on the left end. When this end is on the ground, the rider pushes off and lifts it." },
    { key: "right", color: "#8E7AA8", name: "Right rider", note: "Sits on the right end and pushes off the ground in the same way. Watch this one when you change the weight." },
    { key: "plank", color: "#C8873A", name: "Plank", note: "A long board that tips about the middle. When one end goes down, the other goes up." },
    { key: "post", color: "#4FA58A", name: "Post", note: "The upright the plank turns on, held by two curved braces. It does not move." }
  ],
  controls: [{ id: "m", label: "Right rider", value: "30", options: [["30", "Same weight"], ["40", "A bit heavier"], ["60", "Twice as heavy"]] }],
  speed: { min: 10, max: 60, value: 30, label: "Pace", unit: " pushes/min" },
  readouts: [{ id: "t", label: "Tilt" }, { id: "n", label: "Swings" }],
  views: { "3d": [90, 70, 400], front: [0, 70, 420], side: [420, 70, 0] },
  target: [0, 65, 0],
  distance: [260, 1400],
  how: [
    "When one end touches the ground, the rider there pushes off. That end rises and the other end sinks until it touches the ground. Then the other rider pushes off, and the plank swings back.",
    "Gravity pulls down on each rider, and each pull turns the plank about the post. Two equal riders at equal distances turn it equally in opposite ways, so the plank is balanced. Even a small push can then swing it right across.",
    "Make the right rider heavier and the plank is no longer balanced. The heavy end stays down and the push may lift it only part of the way. Try Same weight, then A bit heavier, then Twice as heavy."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows no riders; the two figures, the ground, the base and all the sizes were made up. The plank stops where its end meets the ground, which is a little lower than in the drawing. The riders' pushes are timed to follow each landing. The weights and the swing come from real balance and gravity. The choice of rider weight was added for comparison.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { YP: 75, LH: 140, th: 0, w: 0, rest: 0, swings: 0, last: 1, riders: {} };
    // stop angle: lowest corner of a plank end (x 140, y -3 below the plank axis) just touches the ground y = 0
    var lo = 0, hi = 1.2, i;
    for (i = 0; i < 40; i++) { var md = (lo + hi) / 2; if (o.YP - o.LH * Math.sin(md) - 3 * Math.cos(md) > 0) lo = md; else hi = md; }
    o.ths = (lo + hi) / 2;
    o.th = o.ths;
    o.plank = new T.Group(); o.plank.position.set(0, o.YP, 0); scene.add(o.plank);
    var mp = c.mat("plank");
    P.at(P.box(280, 6, 34, mp), 0, 0, 0, o.plank);                    // plank x -140..140, y -3..3, z -17..17
    P.at(P.box(4, 30, 34, mp), -138, 18, 0, o.plank);                 // back board x -140..-136, y 3..33
    P.at(P.box(4, 30, 34, mp), 138, 18, 0, o.plank);                  // x 136..140
    function rider(key, s, x) {
      var g = new T.Group(), m = c.mat(key);
      P.at(P.box(20 * s, 26 * s, 20 * s, m), 0, 3 + 13 * s, 0, g);    // body, bottom y 3 on the plank top
      P.at(P.sphere(8 * s, m), 0, 3 + 26 * s + 8 * s, 0, g);          // head
      g.position.x = x; o.plank.add(g); return g;
    }
    rider("left", 1, -112);
    [["30", 1], ["40", 1.1], ["60", 1.26]].forEach(function (q) { o.riders[q[0]] = rider("right", q[1], 112); });
    // pin and post (post z -30..-18, plank z -17..17)
    P.at(P.cylZ(4, 36.5, c.mat("post")), 0, o.YP, .25, scene);        // pin z -18..18.5, starts on the post face
    P.at(P.box(32, 75, 12, c.fixed), 0, 37.5, -24, scene);            // post x -16..16, y 0..75, z -30..-18
    P.at(P.cylZ(16, 12, c.fixed), 0, o.YP, -24, scene);               // rounded top, y 59..91
    [-1, 1].forEach(function (sd) {
      var sh = new T.Shape();
      sh.moveTo(16, 45); sh.quadraticCurveTo(22, 6, 115, 0); sh.lineTo(16, 0); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false, curveSegments: 16 });
      g.translate(0, 0, -30);
      var br = new T.Mesh(g, c.fixed); br.scale.x = sd; scene.add(br);   // brace x 16..115, y 0..45, z -30..-18
    });
    P.at(P.box(290, 10, 70, c.fixed), 0, -5, -15, scene);             // base x -145..145, y -10..0, z -50..20
    this.place(o);
  },

  place: function (o) { o.plank.rotation.z = -o.th; },

  step: function (c, dt, S) {
    var o = this.o, mR = +S.controls.m || 30, k;
    for (k in o.riders) o.riders[k].visible = k === String(mR);
    var mL = 30, M = 20, X = 112, g = 760, KICK = 1.4, dwell = 15 / (S.rpm || 30);
    var I = (mL + mR) * X * X + M * 280 * 280 / 12;
    if (S.playing && dt > 0) {
      if (dt > .05) dt = .05;
      var steps = 6, h = dt / steps, i;
      for (i = 0; i < steps; i++) {
        o.w += g * (mR - mL) * X * Math.cos(o.th) / I * h;               // net turning pull of the two riders (right end down is positive)
        o.th += o.w * h;
        if (o.th >= o.ths || o.th <= -o.ths) {                           // an end meets the ground
          var sg = o.th > 0 ? 1 : -1;
          o.th = sg * o.ths;
          if (o.w * sg > 0) o.w = 0;
          if (sg !== o.last) o.swings++;
          o.last = sg;
        }
        var atStop = Math.abs(o.th) >= o.ths - 1e-6, still = Math.abs(o.w) < .05 || (atStop && o.w * o.th > 0);
        if (atStop && still) {
          o.rest += h;
          if (o.rest >= dwell) { o.w = -(o.th > 0 ? 1 : -1) * KICK; o.rest = 0; }
        } else o.rest = 0;
      }
    }
    this.place(o);
    var d = Math.round(o.th * 180 / Math.PI);
    S.set("t", (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d) + "°");
    S.set("n", String(o.swings));
  }
});
