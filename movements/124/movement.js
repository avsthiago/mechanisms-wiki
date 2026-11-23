M507.define({
  number: 124,
  title: "Bow drill",
  lede: "A bow is pushed to and fro along its string. The string is wound once round a small wheel on a drill, so the drill spins one way, then the other. One hand's straight to-and-fro push becomes a quick turning.",
  alt: "A curved bow slants from lower left to upper right. Its straight string touches a small round spool seen end on, wound once round it. A long thin spindle with a pointed bit runs through the spool, towards a block behind.",
  parts: [
    { key: "bow", color: "#5E7387", name: "Bow", note: "A springy curved stick that the hand pushes to and fro along its string. It never turns." },
    { key: "string", color: "#D9B13B", name: "String", note: "Tied between the two tips of the bow and wound once round the spool. Watch the red beads travel with it." },
    { key: "spindle", color: "#C8873A", name: "Spindle and spool", note: "The thin rod and the small wheel on it. The string turns the spool, so the rod spins first one way, then the other. Watch the red stripe on the spool." },
    { key: "bit", color: "#4FA58A", name: "Drill bit", note: "A pointed tip at the end of the spindle. It turns with the spindle and rests on the block behind." }
  ],
  controls: [{ id: "wheel", label: "Spool", value: "wide", options: [["wide", "Wide"], ["narrow", "Narrow"]] }],
  speed: { min: 10, max: 90, value: 30, label: "Strokes", unit: " per min" },
  readouts: [{ id: "bow", label: "Bow" }, { id: "rpm", label: "Spindle" }],
  views: { front: [0, 0, 760], "3d": [420, 230, 620], side: [760, 0, 0] },
  target: [30, 20, -10],
  how: [
    "Push the bow along its string and the string slides past the spool. The string cannot slip, so it drags the spool round with it. Pull the bow back and the spool turns back too.",
    "The string is wound once round the spool, so one side of it leaves in front and the other behind. The bow moves the same distance the string moves. The red beads on the string show this. At the end of each stroke the bow stops for a moment, and so does the spindle.",
    "The drill bit turns with the spindle and cuts where it touches. Try the wide spool, then the narrow one, and compare how far the spindle turns on each stroke."
  ],
  note: "This model is rebuilt from Brown's drawing. The drawing shows the spool end on, so the spindle, the bit, the block, the post and the arm that holds the top of the spindle were made up. The string is shown wound once round with a small gap between the two sides. The sizes are made up. The narrow spool is added to show the effect of size.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { psi: 0, A: 70, L1: 265, L2: 135, th: 48.6 * Math.PI / 180, sag: 65, opt: {}, rs: 31.5 };
    var Tw = [55, 50];
    var rail = o.rail = P.at(new T.Group(), Tw[0], Tw[1], 0, scene); rail.rotation.z = o.th;   // local x runs along the string, y to the upper left, string tangent point at the origin
    // bow: a circular arc, chord 400, rise 65, in the plane z 0. Group origin at the middle of the chord.
    var chord = o.L1 + o.L2, R = (chord * chord / 4 + o.sag * o.sag) / (2 * o.sag), half = Math.asin(chord / 2 / R);
    var bow = o.bow = P.at(new T.Group(), (o.L2 - o.L1) / 2, 0, 0, rail);
    var arc = P.at(P.arc(R, 3.5, 2 * half, c.mat("bow")), 0, o.sag - R, 0, bow); arc.rotation.z = Math.PI / 2 - half;
    [-chord / 2, chord / 2].forEach(function (x) { P.at(P.sphere(5, c.mat("bow", "dark")), x, 0, 0, bow); });   // knots at the tips, r 5 cover the string ends at z +-2
    // string: two straight runs, z -2 and +2, plus a fixed wrap
    o.ra = P.at(P.rod(1.2, c.mat("string")), 0, 0, 0, rail);
    o.rb = P.at(P.rod(1.2, c.mat("string")), 0, 0, 0, rail);
    o.marks = [0, 1].map(function () { return P.at(P.sphere(3, c.mat("string", "mark")), 0, 0, 0, rail); });
    // spools: centre at local (0, -rs); core radius rc, string axis radius rc + 1.5
    [["wide", 30], ["narrow", 16]].forEach(function (e) {
      var rc = e[1], rs = rc + 1.5, g = new T.Group(); P.at(g, 0, -rs, 0, rail);
      var spool = new T.Group(); g.add(spool);
      P.at(P.cylZ(rc, 9, c.mat("spindle")), 0, 0, 0, spool);                  // core z -4.5..4.5
      [-5.5, 5.5].forEach(function (z) { P.at(P.cylZ(rc + 5, 3, c.mat("spindle")), 0, 0, z, spool); });   // flanges z 4..7 and -7..-4
      P.at(P.cylZ(5, 122, c.mat("spindle")), 0, 0, -1, spool);                // spindle z -62..60, ends at the arm's lower face
      P.at(P.cylZ(7, 15, c.mat("bit")), 0, 0, -67.5, spool);                  // chuck z -75..-60
      var cone = new T.Mesh(new T.CylinderGeometry(5, 0, 17, 24), c.mat("bit")); cone.rotation.x = Math.PI / 2; cone.position.z = -81.5; spool.add(cone);   // z -90..-73, point touches the block
      P.at(P.box(rc * .7, 3, 1, c.mat("spindle", "dark")), (rc + 5) / 2 + 1, 0, 7.5, spool);   // stripe on the front flange, z 7..8, lifted
      var pts = [], i, n = 96;
      for (i = 0; i <= n; i++) { var t = 2 * Math.PI * i / n, a = Math.PI / 2 - t; pts.push(new T.Vector3(rs * Math.cos(a), rs * Math.sin(a), -2 + 4 * i / n)); }
      var wrap = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 120, 1.2, 8, false), c.mat("string")); g.add(wrap);
      o.opt[e[0]] = { g: g, spool: spool, rs: rs };
    });
    // supports: block behind, post on its face, arm over the top of the spindle (rail local, y -112.5..-10)
    var ctr = [Tw[0] + 31.5 * Math.sin(o.th), Tw[1] - 31.5 * Math.cos(o.th)];
    P.at(P.box(160, 160, 20, c.fixed), ctr[0], ctr[1], -100, scene);          // block z -110..-90, tip touches z -90
    P.at(P.box(12, 12, 150, c.fixed), 0, -106.5, -15, rail);                    // post y -112.5..-100.5, z -90..60, on the block face
    P.at(P.box(12, 102.5, 12, c.fixed), 0, -61.25, 66, rail);                   // arm y -112.5..-10, z 60..72, spindle top touches z 60
  },

  step: function (c, dt, S) {
    var o = this.o, key = S.controls.wheel || "wide", op = o.opt[key], rs = op.rs;
    o.psi += S.w * dt;
    var d = o.A * Math.sin(o.psi), dd = o.A * S.w * Math.cos(o.psi);
    for (var k in o.opt) o.opt[k].g.visible = k === key;
    op.spool.rotation.z = -d / rs;                         // string speed equals rim speed
    o.bow.position.x = (o.L2 - o.L1) / 2 + d;
    var L1 = o.L1 - d, L2 = o.L2 + d, Lh = 2 * Math.PI * rs, tot = o.L1 + Lh + o.L2;
    o.ra.span(-L1, 0, -2, 0, 0, -2);
    o.rb.span(0, 0, 2, L2, 0, 2);
    [90, tot - 40].forEach(function (m, i) {                // beads at fixed distances along the string from the first tip
      var p = o.marks[i], x, y = 0, z;
      if (m < L1) { x = -L1 + m; z = -2; }
      else if (m < L1 + Lh) { var t = (m - L1) / rs, a = Math.PI / 2 - t; x = rs * Math.cos(a); y = rs * Math.sin(a) - rs; z = -2 + 4 * t / (2 * Math.PI); }
      else { x = m - L1 - Lh; z = 2; }
      p.position.set(x, y, z);
    });
    var mm = Math.round(d), r = Math.round(-dd / rs * 60 / (2 * Math.PI));
    S.set("bow", (mm > 0 ? "+" : mm < 0 ? "−" : "") + Math.abs(mm) + " mm");
    S.set("rpm", (r > 0 ? "+" : r < 0 ? "−" : "") + Math.abs(r) + " rpm");
  }
});
