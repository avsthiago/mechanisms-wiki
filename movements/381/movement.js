M507.define({
  number: 381,
  title: "Joiner's wedge clamp",
  lede: "Two wedges are driven in beside a board. They squeeze it tight against the bed so it cannot slide while the carpenter planes it. No screw or lever is needed.",
  alt: "Plan view of a long bed with two angled cheeks at the left end. A board lies between them and a thin wedge sits on each side of it.",
  parts: [
    { key: "bed", color: "#5E7387", name: "Bed and cheeks", note: "The long bed and the two angled blocks at its end. The blocks do not move." },
    { key: "wedge", color: "#C8873A", name: "Wedges", note: "Two thin pieces that slide along the slanted faces of the cheeks. Watch the red mark on each one as it is pushed in." },
    { key: "board", color: "#4FA58A", name: "Board", note: "The piece of wood to be planed. It lies between the wedges." }
  ],
  controls: [{ id: "w", label: "Board width", value: "50", options: [["34", "Narrow"], ["50", "Medium"], ["68", "Wide"]] }],
  readouts: [{ id: "st", label: "Stage" }, { id: "push", label: "Wedges pushed" }],
  views: { "3d": [-100, 820, 170], front: [0, 660, 1], side: [-330, 400, 300] },
  target: [-100, 0, 0],
  distance: [150, 2000],
  how: [
    "The board slides in between the two cheeks. Then a wedge is pushed in on each side. Each wedge slides along the slanted face of a cheek and moves a little closer to the board.",
    "A wedge turns a long push into a small, strong squeeze. The wedge travels a long way along the slope, but it only moves a short way towards the board. The sideways squeeze is much bigger than the push. The grip also holds, because the wedge is wedged hard against the slope.",
    "Watch the wedges stop when they touch the board. Try Narrow, Medium and Wide boards and see how far the wedges have to go each time."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the plan. The height of the cheeks and the thickness of the board were made up. The dovetail that holds the cheeks to the bed, and the small section drawn above the plan, are left out. The wedges are shown by hand without a hammer.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: 3.3, SL: 0.33, XA: -256, HA: 16, WL: 120, XT: -230, wedge: [], mark: [] };
    var al = Math.atan(o.SL), ca = Math.cos(al), sa = Math.sin(al);
    o.ca = ca; o.sa = sa;
    // prism: polygon in plan (x, z), standing from y0 to y1
    function prism(pts, y0, y1, m) {
      var sh = new T.Shape(); pts.forEach(function (p, i) { if (i) sh.lineTo(p[0], -p[1]); else sh.moveTo(p[0], -p[1]); });
      var g = new T.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
      return new T.Mesh(g, m);
    }
    o.prism = prism;
    P.at(P.box(580, 20, 166, c.fixed), 14, -10, 0, scene);        // bed x -276..304, y -20..0, z -83..83
    [1, -1].forEach(function (s) {
      var xe = -72, ze = o.HA + (xe - o.XA) * o.SL;                      // cheek ends at x=-72, face at z=77
      P.at(prism([[o.XA - 20, 83 * s], [xe, 83 * s], [xe, ze * s], [o.XA - 20, (o.HA - 20 * o.SL) * s]], 0, 34, c.mat("bed")), 0, 0, 0, scene);   // cheek y 0..34
    });
    o.board = new T.Group(); scene.add(o.board);
    o.boardMesh = P.at(P.box(1, 24, 1, c.mat("board")), 0, 12.5, 0, o.board);          // y 0.5..24.5
    P.at(P.box(10, .6, 8, c.mat("board", "mark")), 0, 25.1, 0, o.board);
    o.bx = o.board.children[1];
    this.o.dummy = null;
    this.o.wMat = c.mat("wedge");
    this.o.wMark = c.mat("wedge", "mark");
    this.o.built = [0, 0];
    this.o.hw = 0;
  },

  rebuildWedges: function (c, hw) {
    var o = this.o, T = c.THREE, P = c.P, scene = c.scene, i;
    o.wedge.forEach(function (g) { scene.remove(g); g.traverse(function (m) { if (m.geometry) m.geometry.dispose(); }); });
    o.wedge = []; o.hw = hw;
    var xt = o.XA + (hw - o.HA) / o.SL, L = 100, bx = xt + L * o.ca, bz = hw + L * o.sa;   // tip, tail corner on the slope
    [1, -1].forEach(function (s) {
      var g = new T.Group();
      g.add(o.prism([[xt, hw * s], [bx, hw * s], [bx, bz * s]], .5, 29.5, o.wMat));         // y .5..29.5
      var mk = P.box(14, .6, 6, o.wMark); mk.position.set(bx - 9, 30, (hw + 8) * s); g.add(mk);   // red mark on top, lifted .5
      scene.add(g); o.wedge.push(g);
    });
  },

  step: function (c, dt, S) {
    var o = this.o, hw = +S.controls.w / 2;
    if (Math.abs(hw - o.hw) > .1) this.rebuildWedges(c, hw);
    o.th += S.w * dt;
    var p = (o.th / (2 * Math.PI)) % 1;
    function sm(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    var boardIn = sm(0, .2, p) - sm(.8, 1, p), push = sm(.2, .45, p) - sm(.65, .8, p);
    var back = 50 * (1 - push);                                    // wedge held back along its slope
    var xl = o.XA + 46 + 20;
    o.board.position.set(0, 0, 0);
    var len = 560, bxL = -176 + 220 * (1 - boardIn);
    o.boardMesh.scale.set(len, 1, hw * 2 - 0);
    o.boardMesh.position.set(bxL + len / 2, 12.5, 0);
    o.bx.position.set(bxL + 200, 25.1, 0);
    o.wedge.forEach(function (g, i) {
      var s = i ? -1 : 1;
      g.position.set(back * o.ca, 0, s * back * o.sa);
    });
    S.set("st", p < .2 ? "Board in" : p < .45 ? "Wedges in" : p < .65 ? "Gripped" : p < .8 ? "Wedges out" : "Board out");
    S.set("push", Math.round(push * 10) + " cm");
  }
});
