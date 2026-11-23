M507.define({
  number: 8,
  title: "Speed pulleys",
  lede: "Two stepped pulleys are joined by one belt. Moving the belt to another pair of steps changes how fast the lower shaft turns. A lathe uses this to turn slowly for big, hard jobs and fast for small ones.",
  alt: "Two stepped pulleys on level shafts, one above the other, each a stack of three steps. The stacks face opposite ways. One flat belt runs between a matching pair of steps.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Upper pulley", note: "Three steps on one shaft, turned by an engine at a steady speed. It pulls the belt. Watch its dark stripe." },
    { key: "driven", color: "#C8873A", name: "Lower pulley", note: "Three steps facing the other way, on the shaft that drives the lathe. Its speed depends on which steps the belt is on." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One flat loop of leather. It fits every pair of steps without being made longer or shorter. Watch the red mark go round." }
  ],
  controls: [{ id: "step", label: "Belt on", value: "1", options: [["2", "Slow"], ["1", "Middle"], ["0", "Fast"]] }],
  readouts: [{ id: "in", label: "Upper" }, { id: "out", label: "Lower" }],
  views: { "3d": [540, 205, 690], front: [0, 0, 880], side: [880, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The upper pulley turns at a steady speed and pulls the belt along. The belt turns the lower pulley. Each pulley is a stack of three steps. The stacks face opposite ways, so a big step always sits across from a small one.",
    "The belt moves the same distance on both pulleys. So a small step has to turn more times than a big one. On Fast, the belt runs from a big step above to a small step below, and the lower pulley turns faster. On Slow it is the other way round.",
    "One belt must fit every pair of steps. Big plus small is not quite enough: when the two steps differ a lot, the belt needs a little extra. So the small steps are made a bit smaller. Try Slow, Middle and Fast. The same belt fits every pair without going loose."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the number of steps and the frame are made up. Brown does not say which pulley drives; here the upper one does. The lower steps were worked out from the exact length of an open belt, so the same belt fits all three pairs. In a real shop the belt is moved by hand with the machine stopped. Here it slides across while turning, so you can follow it.",

  build: function (c) {
    var P = c.P, scene = c.scene, T = 4, W = 30, C = 260, o = this.o = { a1: 0, a2: 0, s: 0, T: T, W: W, C: C, Y1: 130, Y2: -130 };
    o.R1 = [70, 55, 40];                                   // radius at the middle of the belt, upper steps, left to right
    o.L0 = this.len(55, 55);                               // the belt length, set by the middle pair
    o.R2 = o.R1.map(function (r) { return this.match(r); }, this);   // lower steps: 38.8, 55, 69.0, the same belt fits each pair
    function stack(R, y, key) {
      var hold = P.at(new c.THREE.Group(), 0, y, 0, scene); hold.rotation.y = Math.PI / 2;   // local Z along world X
      var p = P.at(P.stepPulley({ radii: R.map(function (r) { return r - T / 2 - 2; }), width: W, material: c.mat(key), mark: c.mat(key, "dark") }), 0, 0, 0, hold);
      P.at(P.cylX(7, 180, c.mat(key)), 0, y, 0, scene);                // shaft x -90..90, from upright face to upright face
      return p;
    }
    o.p1 = stack(o.R1, o.Y1, "drive");                     // steps x -45..45
    o.p2 = stack(o.R2, o.Y2, "driven");
    o.stepX = function (i) { return o.p1.stepZ(i); };      // step centres x -30, 0, 30
    // frame
    [-1, 1].forEach(function (sd) { P.at(P.box(14, 390, 36, c.fixed), sd * 97, -35, 0, scene); });  // uprights x ±(90..104), y -230..160, z -18..18
    P.at(P.box(240, 12, 120, c.fixed), 0, -236, 0, scene);                                        // base x -120..120, y -242..-230, z -60..60

    o.hold = P.at(new c.THREE.Group(), 0, 0, 0, scene); o.hold.rotation.y = Math.PI / 2;  // belt plane upright, across the shafts
    o.belt = P.at(P.belt({ width: 20, thick: T, material: c.mat("belt") }), 0, 0, 0, o.hold);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(12, T + 2, 21, c.mat("belt", "mark")), 0, 0, 0, o.belt);
    o.x = o.stepX(1);
    this.place(o.x);
  },

  // Exact length of an open belt round radii a and b at centre distance C.
  len: function (a, b) {
    var C = this.o.C, d = a - b;
    return 2 * Math.sqrt(C * C - d * d) + Math.PI * (a + b) + 2 * d * Math.asin(d / C);
  },
  // The lower radius that makes the belt exactly L0 long with upper radius a.
  match: function (a) {
    var lo = 5, hi = 120;
    for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (this.len(a, m) < this.o.L0) lo = m; else hi = m; }
    return (lo + hi) / 2;
  },
  // Upper radius under the belt at x: a step's radius while the belt is on it, a short ramp while it crosses between steps.
  r1At: function (x) {
    var o = this.o, f = (x - o.stepX(0)) / o.W, i = Math.max(0, Math.min(1, Math.floor(f))), u = f - i;
    u = Math.max(0, Math.min(1, (u - 1 / 6) * 1.5));         // flat for 5 either side of a step's middle (belt 20 wide on a 30 step)
    return o.R1[i] + (o.R1[i + 1] - o.R1[i]) * u;
  },
  place: function (x) {
    var o = this.o; o.r1 = this.r1At(x); o.r2 = this.match(o.r1);
    o.hold.position.x = x;
    o.belt.set(0, o.Y1, o.r1, 0, o.Y2, o.r2, false);
  },

  step: function (c, dt, S) {
    var o = this.o, xt = o.stepX(+S.controls.step);
    if (o.x !== xt) { var d = xt - o.x, mv = 60 * dt; o.x = Math.abs(d) <= mv ? xt : o.x + Math.sign(d) * mv; this.place(o.x); }
    var v = S.w * o.r1;                                      // belt speed = radius x turning speed
    o.a1 += S.w * dt; o.s += v * dt; o.a2 += v / o.r2 * dt;
    o.p1.rotation.z = o.a1; o.p2.rotation.z = o.a2;
    o.belt.place(o.mark, o.s);
    var r1 = S.playing ? S.rpm : 0, r2 = r1 * o.r1 / o.r2;
    S.set("in", r1 + " rpm");
    S.set("out", (r2 >= 10 ? Math.round(r2) : +r2.toFixed(1)) + " rpm");
  }
});
