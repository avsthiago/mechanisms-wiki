M507.define({
  number: 199,
  title: "Mangle rack with a lantern pinion",
  lede: "A wheel with pins on one side only turns steadily one way, yet the frame round it slides to the right and then back to the left. The pins push on teeth along the top of the opening, then on teeth along the bottom. Mangles, machines that press wet washing, used this to roll a heavy box back and forth.",
  alt: "A long flat frame with an opening in its middle. A row of teeth hangs down from the top of the opening and another row stands up from the bottom. Each row starts with one long tooth. A small lantern pinion, a pale disc with five round pins standing out of one side, sits in the opening. Four rollers hold the frame at the top and bottom.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Lantern pinion", note: "Short blue pins standing out of a pale disc, on less than half of its edge. A shaft from behind turns it the same way all the time. Watch the red pin." },
    { key: "frame", color: "#C8873A", name: "Frame", note: "It slides back and forth. Teeth hang from the top of its opening and stand up from the bottom. A long first tooth on each row catches the pins as they arrive." },
    { key: "rollers", color: "#4FA58A", name: "Rollers", note: "Four wheels that hold the frame at the top and bottom edges. They let it slide sideways but not up or down." }
  ],
  controls: [{ id: "dir", label: "Pinion turns", value: "cw", options: [["cw", "Clockwise"], ["ccw", "Anticlockwise"]] }],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "pos", label: "Frame" }, { id: "dir", label: "Moving" }],
  views: { "3d": [280, 140, 440], front: [0, 0, 480], side: [500, 0, 0] },
  distance: [300, 1800],
  target: [0, 0, 0],
  how: [
    "A shaft from behind turns a small disc with round pins standing out of it. It is called a lantern pinion, because old ones looked like a lantern. While the pins pass over the top, they catch the top teeth and push the frame one way.",
    "The pins cover less than half of the disc. So when they reach the bottom teeth, they have already let go of the top ones. Now they push the frame the other way. For a moment, while the pins swing round the end, no pin touches any tooth and the frame stands still. The long first tooth on each row makes sure the first pin lands in the right gap.",
    "Try Clockwise, then Anticlockwise. Watch which tooth the first pin meets each time."
  ],
  note: "This model is rebuilt from Brown's drawing. The rollers' supports, the board behind and all the sizes were made up. The pins are held at the back only, so they and the teeth stay in sight. The pins let go of one row just before they reach the other, so the teeth have to be shallow. The shape of every tooth was worked out from the paths of the pins, so no pin ever runs into a tooth.",

  // Sizes. Pins of radius RPIN on a circle of radius R, NPIN of them, STEP apart. A pin pushes a row of teeth while it is
  // within WIN / 2 of straight up or straight down. Rows: roots ROOT from the centre line, tips TIP, the long tooth to BIG.
  dims: { R: 40, RPIN: 5, NPIN: 5, STEP: 30 * Math.PI / 180, WIN: 56 * Math.PI / 180, ROOT: 47, TIP: 40.8, BIG: 22, FW: 180, FH: 78, BAR: 50 },

  /** Half the stroke: the frame moves while any pin is in a window, which spans (NPIN - 1) STEP + WIN of the disc's turn. */
  half: function () { var D = this.dims; return D.R * ((D.NPIN - 1) * D.STEP + D.WIN) / 2; },
  /** Frame position for the angle c of the middle of the row of pins. Turning clockwise (c falling): pins on top push the
      frame right at R per radian, pins underneath push it left, and in between it stands still. */
  xOf: function (c) {
    var D = this.dims, A = this.half() / D.R, e = c - Math.PI / 2;
    e = Math.atan2(Math.sin(e), Math.cos(e));
    if (Math.abs(e) <= A) return -D.R * e;
    var e2 = Math.atan2(Math.sin(c + Math.PI / 2), Math.cos(c + Math.PI / 2));   // c - 3 pi / 2
    if (Math.abs(e2) <= A) return D.R * e2;
    return Math.cos(c) > 0 ? this.half() : -this.half();
  },
  /** Pin centres relative to the frame, for the angle c. */
  pins: function (c) {
    var D = this.dims, x = this.xOf(c), out = [], k;
    for (k = 0; k < D.NPIN; k++) { var a = c + (k - (D.NPIN - 1) / 2) * D.STEP; out.push([D.R * Math.cos(a) - x, D.R * Math.sin(a)]); }
    return out;
  },
  /** Lower edge of the top row, at x = x0 + i dx: the highest point any pin (or the shaft) reaches at that x over a whole
      turn, plus 1 of clearance, but no lower than the tooth tips and no higher than the roots or the round ends. */
  topEdge: function (x0, dx, n) {
    var D = this.dims, H = this.half(), sw = new Float64Array(n).fill(-1e9), M = 7200, i, j, k;
    var b0 = H - D.R * D.WIN / 2 + D.RPIN + 1.5;                              // right side of the first gap the pins meet
    function mark(px, py, r) {
      var a = Math.max(0, Math.ceil((px - r - x0) / dx)), b = Math.min(n - 1, Math.floor((px + r - x0) / dx));
      for (j = a; j <= b; j++) { var u = x0 + j * dx - px, y = py + Math.sqrt(Math.max(0, r * r - u * u)); if (y > sw[j]) sw[j] = y; }
    }
    for (i = 0; i < M; i++) {
      var c = 2 * Math.PI * i / M, ps = this.pins(c);
      for (k = 0; k < ps.length; k++) mark(ps[k][0], ps[k][1], D.RPIN + 1);
      mark(-this.xOf(c), 0, 7);                                               // the shaft, radius 6
    }
    var out = [];
    for (j = 0; j < n; j++) {
      var x = x0 + j * dx, ax = Math.abs(x), lim = ax <= H ? D.ROOT : Math.sqrt(Math.max(0, D.ROOT * D.ROOT - (ax - H) * (ax - H)));
      var cap = x >= b0 && x <= b0 + 13.5 ? D.BIG : (x >= -b0 - 13.5 && x < b0 ? D.TIP : lim);   // the long tooth sits just past the first gap, at the right end of the top row
      out.push(Math.min(lim, Math.max(cap, sw[j])));
    }
    return out;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, H = this.half(), i;
    var o = this.o = { a: 0, px: null, last: "Still" };
    var span = (D.NPIN - 1) * D.STEP;

    // lantern pinion: shaft z -34..-10 from the bearing, back disc z -10..-4 behind the frame (z 0..14), pins z -4..17,
    // their front ends free. Nothing else in front.
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(5, 24, c.mat("pinion")), 0, 0, -22, o.rot);
    P.at(P.cylZ(D.R + D.RPIN + 1, 6, c.mat("pinion", "light")), 0, 0, -7, o.rot);   // pale back disc, so the pins show against it
    for (i = 0; i < D.NPIN; i++) {
      var a = (i - (D.NPIN - 1) / 2) * D.STEP;
      P.at(P.cylZ(D.RPIN, 21, c.mat("pinion", i === 0 ? "mark" : null)), D.R * Math.cos(a), D.R * Math.sin(a), 6.5, o.rot);   // z -4..17, on the disc face
    }

    // frame z 0..14: bars x -180..180, outer edges y +-78; each end hollowed by an arc through (+-xw, 0) meeting the bars at y +-50
    var F = D.FW, xw = H + D.ROOT + 22, ar = ((F - xw) * (F - xw) + D.BAR * D.BAR) / (2 * (F - xw)), ac = xw + ar, a0 = Math.atan2(D.BAR, F - ac);
    var sh = new T.Shape();
    sh.moveTo(-F, -D.FH); sh.lineTo(F, -D.FH); sh.lineTo(F, -D.BAR);
    sh.absarc(ac, 0, ar, 2 * Math.PI - a0, a0, true);
    sh.lineTo(F, D.FH); sh.lineTo(-F, D.FH); sh.lineTo(-F, D.BAR);
    sh.absarc(-ac, 0, ar, Math.PI - a0, a0 - Math.PI, true);
    sh.closePath();
    // the opening: rounded ends of radius ROOT round the pinion's two end places (x = +-H), teeth cut from the pins' paths
    var dx = .5, n = Math.round(2 * (H + D.ROOT) / dx) + 1, x0 = -(H + D.ROOT), top = this.topEdge(x0, dx, n), hole = new T.Path();
    hole.moveTo(x0 + (n - 1) * dx, 0);
    for (i = n - 1; i >= 0; i--) hole.lineTo(x0 + i * dx, -top[n - 1 - i]);  // bottom row: the top row turned half a turn
    for (i = 0; i < n; i++) hole.lineTo(x0 + i * dx, top[i]);
    hole.closePath(); sh.holes.push(hole);
    o.frame = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false, curveSegments: 30 }), c.mat("frame"));
    scene.add(o.frame);

    // rollers radius 16, rims on the frame's edges (y = +-78), z -1..15 round the frame. Placed as in the drawing.
    o.rollers = [];
    [[-67, 94], [56, 94], [-78, -94], [56, -94]].forEach(function (q) {
      var r = new T.Group(); P.at(r, q[0], q[1], 0, scene);
      P.at(P.cylZ(16, 16, c.mat("rollers")), 0, 0, 7, r);                     // z -1..15
      P.at(P.box(11, 2.5, 1, c.mat("rollers", "dark")), 7, 0, 16, r);         // dark stripe z 15.5..16.5, lifted .5 off the face
      P.at(P.cylZ(4, 39, c.fixed), q[0], q[1], -20.5, scene);                 // axle z -40..-1, from the board face to the roller's back
      r.sgn = q[1] > 0 ? -1 : 1; o.rollers.push(r);
    });

    // behind: bearing boss z -40..-34 for the shaft; board x -100..100, y -115..115, z -48..-40
    P.at(P.cylZ(9, 6, c.fixed), 0, 0, -37, scene);
    P.at(P.box(200, 230, 8, c.fixed), 0, 0, -44, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, sgn = S.controls.dir === "ccw" ? -1 : 1;
    o.a += sgn * S.w * dt;
    var cc = Math.PI - o.a, x = this.xOf(cc);                                 // starts as drawn: pins on the left, pinion at the right end
    o.rot.rotation.z = cc;
    o.frame.position.x = x;
    o.rollers.forEach(function (r) { r.rotation.z = r.sgn * x / 16; });
    if (o.px !== null && dt > 0) o.last = Math.abs(x - o.px) < 1e-7 ? "Still" : (x > o.px ? "Right" : "Left");
    if (!S.playing) o.last = "Still";
    o.px = x;
    var r = Math.round(x);
    S.set("pos", (r < 0 ? "−" + -r : r) + " mm");
    S.set("dir", o.last);
  }
});
