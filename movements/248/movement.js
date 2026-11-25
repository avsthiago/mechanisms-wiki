M507.define({
  number: 248,
  title: "Union coupling",
  lede: "A union joins two pipes so they can be taken apart again. A nut screws onto one pipe and presses the flange of the other pipe against it. The picture is cut in half so you can see inside.",
  alt: "A half-section of two pipes joined end to end. A ring-shaped nut with a screw thread surrounds the joint. The cut surfaces show the thread, the flange and the wall of each pipe.",
  parts: [
    { key: "upper", color: "#C8873A", name: "Upper pipe", note: "It has a wide ring, called a flange, on its lower end. It cannot move up through the nut." },
    { key: "lower", color: "#4FA58A", name: "Lower pipe", note: "It stays still. Its top end has a screw thread on the outside." },
    { key: "nut", color: "#5E7387", name: "Nut", note: "It screws onto the lower pipe. Its top lip presses the flange down. Watch the red marks go round." }
  ],
  controls: [],
  closed: { label: "Joint" },
  readouts: [{ id: "n", label: "Nut turned" }, { id: "h", label: "Nut raised" }, { id: "g", label: "Pipes apart" }],
  views: { "3d": [307, 168, 658], front: [0, 0, 720], top: [0, 700, 120] },
  target: [0, 0, 0],
  how: [
    "The picture is cut in half, so you see the walls as flat surfaces. Look at the zigzag where the nut meets the lower pipe. That is the screw thread. Each turn of the nut moves it up or down by one thread.",
    "When the nut is screwed down, its lip pushes on the flange. The flange pushes on the end of the lower pipe, so the two pipes are pressed together. When the nut is unscrewed, the upper pipe is free and can be lifted away.",
    "Follow the red marks as the nut turns. Count how many turns it takes to free the pipe. A coarser thread would need fewer turns, and a finer one more. Choose Closed to see the joint as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the joint cut in half with the nut screwed tight. The sizes, the thread depth and the number of threads were made up, and the thread is drawn as rings, not a spiral. The red marks, the small gap and the lifting of the upper pipe by hand were added.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { th: 0, p: 8, marks: [] };
    // everything is a half section about the Y axis; the top face of the lower pipe is y = 0
    o.lower = P.halfSection({ poly: lowerPoly(), material: c.mat("lower") }); c.scene.add(c.shell(o.lower, "open"));
    c.scene.add(c.shell(P.wholeSection({ poly: lowerPoly(), material: c.mat("lower") }), "closed"));   // closed view: the whole lower pipe
    o.upper = P.halfSection({ poly: [[34, .4], [62, .4], [62, 18.4], [42, 18.4], [42, 150], [34, 150]], material: c.mat("upper") }); c.scene.add(c.shell(o.upper, "open"));
    o.upperW = c.shell(P.wholeSection({ poly: [[34, .4], [62, .4], [62, 18.4], [42, 18.4], [42, 150], [34, 150]], material: c.mat("upper") }), "closed"); c.scene.add(o.upperW);
    o.nut = P.halfSection({ poly: nutPoly(0), material: c.mat("nut") }); c.scene.add(c.shell(o.nut, "open"));
    o.nutW = c.shell(P.wholeSection({ poly: nutPoly(0), material: c.mat("nut") }), "closed"); o.nutW.userData.live = true; c.scene.add(o.nutW);   // closed view: the whole nut, rebuilt as it moves
    o.ring = new T.Group(); c.scene.add(o.ring);
    for (var k = 0; k < 3; k++) { var m = P.box(4, 1, 10, c.mat("nut", "mark")); m.position.y = 0; o.ring.add(m); o.marks.push(m); }
    function tri(y) { var f = y / 8 - Math.floor(y / 8); return 2 * Math.abs(f - .5) * 2 - 1; }
    function rth(y) { return 67 + 3 * tri(y); }                              // thread outline, from radius 64 to 70
    function thread(y0, y1, add) {
      var pts = [[rth(y0) + add, y0]], b = Math.ceil(y0 / 4) * 4;
      for (var y = b; y < y1; y += 4) if (y > y0) pts.push([rth(y) + add, y]);
      pts.push([rth(y1) + add, y1]); return pts;
    }
    function lowerPoly() {
      var p = [[34, -170], [50, -170], [50, -61]];
      return p.concat(thread(-61, 0, 0), [[43, 0], [43, -34], [34, -34]]);
    }
    function nutPoly(d) {
      var yb = -61 + d, yl = 18.8 + d, yt = 40 + d;
      return thread(yb, yl, .4).concat([[48, yl], [48, yt], [92, yt], [92, yb + 27], [104, yb + 27], [104, yb]]);
    }
    this.nutPoly = nutPoly;
  },

  step: function (c, dt, S) {
    var o = this.o, u, d, hand, lift, k;
    o.th += S.w * dt;
    u = (o.th / (2 * Math.PI)) % 1;
    function sm(a, b) { var t = Math.max(0, Math.min(1, (u - a) / (b - a))); return t * t * (3 - 2 * t); }
    // tight, unscrew, rest, upper pipe lifted by hand, screw down again (the nut presses the flange back), tight
    d = 48 * (sm(.08, .38) - sm(.58, .9));
    hand = 24 * sm(.43, .53) * (u < .95 ? 1 : 0);
    lift = Math.min(hand, d);
    o.nut.set(this.nutPoly(d));
    o.upper.position.y = lift; o.upperW.position.y = lift;
    var shut = S.controls["case"] === "closed";
    if (shut && o.nutD !== d) { o.nutD = d; var gw = c.P.wholeSection({ poly: this.nutPoly(d), material: o.nutW.material }).geometry; o.nutW.geometry.dispose(); o.nutW.geometry = gw; }
    var phi = 2 * Math.PI * d / o.p;
    o.ring.position.y = -34 + d + .8;
    for (k = 0; k < 3; k++) {
      var a = phi + k * 2 * Math.PI / 3, m = o.marks[k];
      m.position.set(98 * Math.sin(a), 0, 98 * Math.cos(a)); m.rotation.y = a; m.visible = shut || Math.cos(a) < 0;
    }
    S.set("n", (d / o.p).toFixed(1) + " turns");
    S.set("h", Math.round(d) + " mm");
    S.set("g", Math.round(lift) + " mm");
  }
});
