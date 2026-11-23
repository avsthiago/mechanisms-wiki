M507.define({
  number: 102,
  title: "Screw and nut",
  lede: "A bolt has a ridge wound round it like a spiral ramp. When the bolt turns and the nut is stopped from turning, the nut slides along the bolt in a straight line. This is how a turning handle makes a straight push or pull.",
  alt: "An upright bolt with a big six-sided head at the top and a thick spiral thread below. A big six-sided nut sits on the thread near the bottom. A small arm on the nut slides on an upright rod, so the nut cannot turn. A red stripe marks the bolt head.",
  parts: [
    { key: "bolt", color: "#5E7387", name: "Bolt", note: "A rod with a thick spiral ridge, called a thread, and a six-sided head. Watch the red stripe under the head to count its turns." },
    { key: "nut", color: "#C8873A", name: "Nut", note: "A six-sided block with a spiral groove inside that fits the thread. A small arm keeps it from turning, so it slides up and down the bolt. Watch the red mark on the arm." },
    { key: "guide", color: "#4FA58A", name: "Guide rods", note: "Two upright rods. One passes through the arm on the nut, so the nut can only move straight up or down." }
  ],
  controls: [{ id: "pitch", label: "Thread", value: "fine", options: [["fine", "Fine"], ["coarse", "Coarse"]] }],
  readouts: [{ id: "turns", label: "Bolt" }, { id: "dist", label: "Nut moved" }],
  views: { "3d": [480, 260, 820], front: [0, 10, 860], side: [860, 10, 0] },
  target: [0, 10, 0],
  how: [
    "Turn the bolt and the nut slides along it, but it does not turn. An arm on the nut slides on an upright rod, so the nut can only go straight up or down. Each time the bolt goes round once, the nut moves on by the gap from one thread ridge to the next.",
    "That gap is called the pitch. The readouts show it: the distance the nut has moved is the number of turns times the pitch. A screw changes turning into a straight push, and it can push very hard, because the nut moves only a little for each turn. When the nut nears the head, the model turns the bolt the other way so the nut comes back.",
    "Try Fine, then Coarse. Watch the red mark on the arm and count the bolt's turns. Which thread moves the nut further for each turn?"
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the bolt and the nut. The plate that holds the bolt head, the two rods, the arm on the nut, the base, the sizes and the two thread choices were made up. The nut is shown solid, so its inside thread is not drawn. The model turns the bolt back when the nut nears an end, so you can keep watching.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 44, LEN = 230, X0 = -83, DMAX = 163, RH = 72;
    var o = this.o = { d: 0, dir: 1, DMAX: DMAX, X0: X0, bolts: {}, lead: { fine: 20, coarse: 40 } };
    function hex(r, len, m) { var h = new T.Mesh(new T.CylinderGeometry(r, r, len, 6), m); h.rotation.z = Math.PI / 2; return h; }   // axis X
    // bolt: built along X, tilted so X becomes up. Thread y -115..115, head y 115..171, bolt axis x = 0 z = 0
    ["fine", "coarse"].forEach(function (k) {
      var up = new T.Group(); up.rotation.z = Math.PI / 2; scene.add(up);
      var g = new T.Group(); up.add(g);
      P.at(P.worm({ radius: R, pitch: o.lead[k], length: LEN, material: c.mat("bolt") }), 0, 0, 0, g);   // x -115..115, tip r 50.4 or 56.7
      P.at(hex(RH, 56, c.mat("bolt")), 143, 0, 0, g);                                    // head x 115..171, corner r 72, flat r 62.4
      P.at(P.box(1, 16, 6, c.mat("bolt", "mark")), 114.25, 62, 0, g);                    // red stripe x 113.75..114.75, lifted 0.75 off the head's underside at x 115; r 54..70
      o.bolts[k] = g; g.parent.visible = true;
    });
    // nut: hex prism along Y, thickness 60, corner towards the viewer; arm on its right flat with a hole for the rod
    o.nut = new T.Group(); scene.add(o.nut);
    P.at(new T.Mesh(new T.CylinderGeometry(RH, RH, 60, 6), c.mat("nut")), 0, 0, 0, o.nut);   // y -30..30, flat at x 62.35
    var a = 72 * Math.cos(Math.PI / 6), lw = 40;                                          // flat distance 62.35
    var lug = P.guideBlock({ w: lw, h: 20, d: 30, hole: 6.5, hx: 88 - (a + lw / 2), material: c.mat("nut") });
    P.at(lug, a + lw / 2, 0, 0, o.nut);                                                   // arm x 62.35..102.35, y -10..10, z -15..15, on the nut flat; hole at x 88
    P.at(P.box(10, 1, 10, c.mat("nut", "mark")), a + 10, 10.75 + .25, 0, o.nut);           // red mark y 10.5..11.5 on top of the arm, lifted 0.5
    // guide rods: x = ±88, y -150..171, one through the arm
    [-88, 88].forEach(function (x) { P.at(P.cylY(6, 321, c.mat("guide")), x, 10.5, 0, scene); });
    // supports
    P.at(P.box(240, 12, 150, c.fixed), 0, -156, 0, scene);                                // base x -120..120, y -162..-150, z -75..75; rods stand on y -150
    P.at(P.box(240, 10, 150, c.fixed), 0, 176, 0, scene);                                 // plate x -120..120, y 171..181; rods end at y 171, bolt head top at y 171
  },

  step: function (c, dt, S) {
    var o = this.o, k = S.controls.pitch === "coarse" ? "coarse" : "fine", p = o.lead[k], b;
    o.d += o.dir * S.w * dt * p / (2 * Math.PI);                  // one pitch of travel for each turn
    if (o.d >= o.DMAX) { o.d = o.DMAX; o.dir = -1; }
    if (o.d <= 0) { o.d = 0; o.dir = 1; }
    for (b in o.bolts) { o.bolts[b].parent.visible = b === k; }
    o.bolts[k].rotation.x = -2 * Math.PI * (o.X0 + o.d) / p;      // the thread under the nut sits at the nut's height
    o.nut.position.y = o.X0 + o.d;                                // climbs towards the head as the bolt turns
    S.set("turns", Math.round(o.d / p * 10) / 10 + " turns");
    S.set("dist", Math.round(o.d) + " mm");
  }
});
