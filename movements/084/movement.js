M507.define({
  number: 84,
  title: "Cam and double rack frame",
  lede: "A turning cam can push a frame left, push it right, or leave it alone. Which one happens depends only on how high the frame hangs. An engine used this to open or close its steam valve a little at a time.",
  alt: "A long frame with rounded ends has saw teeth along its top and bottom inside edges. It hangs from a rod by a loop whose pins sit in a slot in the frame. A wheel with four arms turns in the middle of the frame, and a peg on each arm can reach one row of teeth. Rods on the frame's ends slide through slots in two posts.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Cam", note: "A wheel with a short peg on each of its four arms. It turns all the time. Watch the red peg to count the turns." },
    { key: "frame", color: "#C8873A", name: "Rack frame", note: "A frame with a row of saw teeth on its upper edge and another on its lower edge. Its end rods slide in the slots of the two posts." },
    { key: "rod", color: "#D9B13B", name: "Hanging rod", note: "Holds the frame up by a loop with two pins. The pins sit in a long slot, so the frame can slide sideways but must go up and down with the rod." }
  ],
  controls: [{ id: "rod", label: "Rod", value: "up", options: [["up", "Raised"], ["mid", "Middle"], ["down", "Lowered"]] }],
  readouts: [{ id: "turns", label: "Cam" }, { id: "pos", label: "Frame" }],
  views: { "3d": [260, 150, 600], front: [0, 0, 720], side: [720, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The cam turns in the gap between the two rows of teeth. When the frame hangs in the middle, the pegs miss both rows. The cam spins and the frame stays still.",
    "Raise the rod and the lower row of teeth comes up into the pegs' path. The pegs pass the lowest point of the circle moving right, so each one pushes the frame one tooth to the right. Lower the rod and the upper row meets the pegs instead. At the highest point of the circle they move left, so the frame goes left. When a row runs out of teeth, the pegs miss it and the frame stops at the end of its slot.",
    "The model opens with the rod raised. Count: four pegs move the frame four teeth for each turn of the cam. Then try Middle, then Lowered. In an engine a speed governor lifted or lowered the rod, and the frame opened or closed the steam valve."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the cam as a spoked wheel, so here each arm carries a peg that reaches the teeth. The posts, the base, the top beam that guides the rod, the shaft's stand and all sizes and tooth counts were made up. The rows of teeth are kept short so that they run out just as the frame reaches the ends of its slot.",

  // Shared sizes. Frame-local: the frame centre is at (X, Y); the cam axis is at the origin.
  K: { IN: 31, H: 8, PITCH: 16, NT: 6, RP: 3, RT: 17, LIFT: 9, TRAVEL: 48.8, PINS: 4 },

  // Lowest height the centre of a peg (radius RP) may have above the bottom row, as a function of frame-local x.
  // The top row is the bottom row turned half a turn about the frame centre, so the same table serves it mirrored.
  kin: function () {
    var K = this.K, A0 = -K.NT * K.PITCH / 2, DU = 0.05, U0 = -130, NU = Math.round(260 / DU), E = new Float64Array(NU + 1), i, t, v, m;
    function s(u) {                                         // tooth edge: rises along the slope, drops straight at the crest
      if (u >= A0 && u < A0 + K.NT * K.PITCH) return -K.IN + K.H * (((u - A0) % K.PITCH) / K.PITCH);
      return -K.IN;
    }
    for (i = 0; i <= NU; i++) {
      m = -1e9;
      for (t = -K.RP; t <= K.RP; t += DU / 2) { v = s(U0 + i * DU + t) + Math.sqrt(Math.max(0, K.RP * K.RP - t * t)); if (v > m) m = v; }
      E[i] = m;
    }
    // Nearest frame-local x where a peg at height v is clear of the teeth (the teeth push the frame the shortest way).
    function resolve(u, v) {
      var i = Math.max(0, Math.min(NU, Math.round((u - U0) / DU))), k;
      if (E[i] <= v) return u;
      for (k = 1; k < NU; k++) {
        if (i - k >= 0 && E[i - k] <= v) return U0 + (i - k) * DU;
        if (i + k <= NU && E[i + k] <= v) return U0 + (i + k) * DU;
      }
      return u;
    }
    return { resolve: resolve, A0: A0, s: s, depth: function (u, v) { return E[Math.max(0, Math.min(NU, Math.round((u - U0) / DU)))] - v; } };
  },

  // Turn the cam by da and move the hanging height toward Yt by up to dy, in small steps; the pegs push the frame.
  advance: function (o, da, Yt, dyMax) {
    var K = this.K, dy = Math.max(-dyMax, Math.min(dyMax, Yt - o.Y)), n = Math.max(1, Math.ceil(Math.abs(da) * K.RT / .2), Math.ceil(Math.abs(dy) / .1)), j, k, a, px, py;
    for (j = 0; j < n; j++) {
      o.a += da / n; o.Y += dy / n;
      for (k = 0; k < K.PINS; k++) {
        a = o.a + k * 2 * Math.PI / K.PINS; px = K.RT * Math.cos(a); py = K.RT * Math.sin(a);
        o.X = px - o.kin.resolve(px - o.X, py - o.Y);         // bottom row
        o.X = px + o.kin.resolve(o.X - px, o.Y - py);         // top row, seen turned half a turn
        o.X = Math.max(-K.TRAVEL, Math.min(K.TRAVEL, o.X));    // ends of the slot
      }
    }
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { a: -Math.PI / 6, X: 0, Y: K.LIFT, kin: this.kin() };   // opens raised, a peg just meeting a tooth, so the frame moves at once

    // Rack frame, one flat piece z -5..5. Outer: rounded box x -115..115, y -37..37, corners r 26, plus a top block
    // x -80..80, y 37..60. Inside: x -109..109, y -31..31, corners r 20, with the two rows of saw teeth. Slot x -72.8..72.8, y 43..53.
    function rounded(path, hx, hy, r, cw) {
      // corners as arcs, counter-clockwise from bottom middle
      var pts = [], i, a;
      function corner(cx, cy, a0) { for (i = 0; i <= 8; i++) { a = a0 + i * Math.PI / 16; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } }
      corner(hx - r, -hy + r, -Math.PI / 2); corner(hx - r, hy - r, 0); corner(-hx + r, hy - r, Math.PI / 2); corner(-hx + r, -hy + r, Math.PI);
      return pts;
    }
    var outer = rounded(null, 115, 37, 26), sh = new T.Shape(), i, k;
    // splice the top block in between the top-right and top-left corners (indices 17 and 18)
    var top = [[80, 37], [80, 60], [-80, 60], [-80, 37]];
    outer = outer.slice(0, 18).concat(top, outer.slice(18));
    outer.forEach(function (p, j) { if (j) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
    sh.closePath();
    var A0 = o.kin.A0, low = [];                           // bottom row, left to right
    for (k = 0; k < K.NT; k++) { var x0 = A0 + k * K.PITCH; low.push([x0, -K.IN], [x0 + K.PITCH, -K.IN + K.H]); }
    low.push([A0 + K.NT * K.PITCH, -K.IN]);
    var inner = rounded(null, 109, 31, 20), hp = [];
    // inner[0..8] bottom-right corner ... inner[27..35] bottom-left corner; bottom edge runs from inner[35] to inner[0]
    hp = low.concat(inner.slice(0, 18), low.map(function (p) { return [-p[0], -p[1]]; }), inner.slice(18));
    var hole = new T.Path();
    hp.forEach(function (p, j) { if (j) hole.lineTo(p[0], p[1]); else hole.moveTo(p[0], p[1]); });
    hole.closePath(); sh.holes.push(hole);
    var SL = 20 + 4 + K.TRAVEL, slot = new T.Path();      // pins at x ±20, radius 4: the slot ends touch them at the ends of travel
    slot.moveTo(-SL, 43); slot.lineTo(-SL, 53); slot.lineTo(SL, 53); slot.lineTo(SL, 43); slot.closePath(); sh.holes.push(slot);
    var fg = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false }); fg.translate(0, 0, -5);
    o.frame = new T.Group(); scene.add(o.frame);
    o.frame.add(new T.Mesh(fg, c.mat("frame")));
    P.at(P.cylX(3, 115, c.mat("frame")), 172.5, 0, 0, o.frame);   // end rod x 115..230 (frame-local), starts at the flat end face
    P.at(P.cylX(3, 115, c.mat("frame")), -172.5, 0, 0, o.frame);  // end rod x -230..-115

    // Cam: spoked wheel z -19..-13 behind the frame, pegs r 3 at radius 17 from z -14 (in the spoke) to z 7, through the teeth plane z -5..5.
    o.cam = new T.Group(); o.cam.position.set(0, 0, -16); scene.add(o.cam);
    o.cam.add(P.pulley({ radius: 51, width: 6, rim: 5, spokes: 4, material: c.mat("cam") }));
    for (k = 0; k < K.PINS; k++) {
      var a = k * 2 * Math.PI / K.PINS;
      P.at(P.cylZ(K.RP, 21, c.mat("cam", k === 0 ? "mark" : undefined)), K.RT * Math.cos(a), K.RT * Math.sin(a), 12.5, o.cam);  // z -14..7 in the world
    }
    P.at(P.cylZ(4, 46, c.mat("cam")), 0, 0, -11, scene);   // shaft z -34..12, from the stand's face
    P.at(P.cylZ(7, 4, c.mat("cam")), 0, 0, 10, scene);     // collar z 8..12, in front of the frame face z 5

    // Hanging rod with its loop (z 7..13, in front of the frame) and pins through the slot.
    o.hang = new T.Group(); scene.add(o.hang);
    [-20, 20].forEach(function (x) {
      P.at(P.cylZ(4, 19, c.mat("rod")), x, 47, .5, o.hang);   // pin z -9..10; its underside y 43 rests on the slot's bottom
      P.at(P.cylZ(6, 2, c.mat("rod")), x, 47, -10, o.hang);   // washer z -11..-9, clear of the frame back z -5
      P.at(P.cylY(3, 19, c.mat("rod")), x, 56.5, 10, o.hang); // leg y 47..66
    });
    P.at(P.arc(20, 3, Math.PI, c.mat("rod")), 0, 66, 10, o.hang); // loop top, centre line peaks at y 86
    P.at(P.cylY(4, 104, c.mat("rod")), 0, 138, 10, o.hang);  // rod y 86..190

    // Supports. Base x -190..190, y -160..-150, z -50..30.
    P.at(P.box(380, 10, 80, c.fixed), 0, -155, -10, scene);
    P.at(P.box(50, 162, 6, c.fixed), 0, -69, -37, scene);    // cam stand x -25..25, y -150..12, z -40..-34; on the base, shaft ends at z -34
    [-170, 170].forEach(function (x) {
      // post x ±(166..174), z -10..10, y -150..150, with a window y -18..18, z -4..4 for the end rod (r 3, centre y -9..9)
      P.at(P.box(8, 132, 20, c.fixed), x, -84, 0, scene);    // y -150..-18, on the base
      P.at(P.box(8, 132, 20, c.fixed), x, 84, 0, scene);     // y 18..150
      P.at(P.box(8, 36, 6, c.fixed), x, 0, 7, scene);        // cheek z 4..10
      P.at(P.box(8, 36, 6, c.fixed), x, 0, -7, scene);       // cheek z -10..-4
    });
    // top beam y 150..160 (on the posts' tops), z 0..20, with a window x -5..5, z 5..15 for the hanging rod (r 4 at z 10)
    P.at(P.box(169, 10, 20, c.fixed), -89.5, 155, 10, scene); // x -174..-5
    P.at(P.box(169, 10, 20, c.fixed), 89.5, 155, 10, scene);  // x 5..174
    P.at(P.box(10, 10, 5, c.fixed), 0, 155, 2.5, scene);      // cheek z 0..5
    P.at(P.box(10, 10, 5, c.fixed), 0, 155, 17.5, scene);     // cheek z 15..20
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, Yt = { up: K.LIFT, mid: 0, down: -K.LIFT }[S.controls.rod] || 0;
    this.advance(o, S.w * dt, Yt, 15 * dt);                 // the rod moves at 15 units a second
    o.cam.rotation.z = o.a;
    o.frame.position.set(o.X, o.Y, 0);
    o.hang.position.y = o.Y;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v); }
    S.set("turns", f(o.a / (2 * Math.PI)) + " turns");
    S.set("pos", f(o.X / K.PITCH) + " teeth");
  }
});
