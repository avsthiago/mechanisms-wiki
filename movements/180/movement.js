(function () {
  var S0 = 0.6;                                               // engraving pixels to model units
  function X(px) { return (px - 90) * S0; }                   // plank face is x = 0
  function Y(py) { return (340 - py) * S0; }                  // pivot is y = 0
  var PIV = { x: X(235), y: 0 };
  // inner (gripping) edge of the jaw, tip at the top down to the lower bulb, traced from the engraving
  var INNER = [[90, 112], [110, 128], [130, 148], [150, 168], [168, 192], [182, 222], [184, 255], [174, 295], [170, 335], [178, 375],
    [196, 410], [208, 440], [200, 468], [178, 490], [160, 510], [156, 535], [165, 556], [182, 570]];
  var OUTER = [[182, 570], [215, 566], [250, 538], [276, 490], [295, 430], [305, 365], [303, 300], [288, 232], [255, 176], [205, 126],
    [150, 88], [110, 69], [90, 62]];
  function rel(p) { return [X(p[0]) - PIV.x, Y(p[1]) - PIV.y]; }
  // dense samples of the inner edge, relative to the pivot
  var DENSE = (function () {
    var out = [], i, k, a, b, n;
    for (i = 0; i < INNER.length - 1; i++) {
      a = rel(INNER[i]); b = rel(INNER[i + 1]); n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.8));
      for (k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    out.push(rel(INNER[INNER.length - 1]));
    return out;
  })();
  var L = 200, YB0 = 150, YB1 = -138, ND = 290, RAD = Math.PI / 180;

  // Does the jaw, turned clockwise by al, leave room for a board of thickness T whose bottom end is at yb?
  function room(al, T, yb) {
    var cs = Math.cos(al), sn = Math.sin(al), i, p, x, y;
    for (i = 0; i < DENSE.length; i++) {
      p = DENSE[i]; x = PIV.x + p[0] * cs + p[1] * sn; y = PIV.y - p[0] * sn + p[1] * cs;
      if (y >= yb && y <= yb + L && x < T - 1e-6) return false;
    }
    return true;
  }
  // For each push depth: the jaw angle the board forces. The jaw is pushed open only by contact; it never opens by itself.
  // Stops when no angle gives room, or when the jaw would have to jump.
  function table(T) {
    var al = 0, alT = [], d, yb, guard, last = 0;
    for (d = 0; d <= ND; d++) {
      yb = YB0 + (YB1 - YB0) * d / ND; guard = 0;
      while (!room(al, T, yb) && guard < 400) { al += 0.05 * RAD; guard++; }
      if (guard >= 400 || al > 45 * RAD) break;
      alT.push(al); last = d;
    }
    return { al: alT, stop: last, T: T };
  }

  M507.define({
    number: 180,
    title: "Single bench clamp",
    lede: "A curved jaw turns on one screw next to a fixed strip. Push a board down between them and the board turns the jaw by touching it. The jaw then grips the board against the strip and holds it still.",
    alt: "A tall fixed strip on the left. Beside it, a board standing upright. On the right, a curved orange jaw shaped like a hook, held by one large round screw. The jaw's inner edge touches the board.",
    parts: [
      { key: "drive", color: "#4FA58A", name: "Fixed side-piece", note: "A strip screwed down to the bench. It does not move. The board is pressed against it." },
      { key: "driven", color: "#C8873A", name: "Curved jaw", note: "It can only turn on its screw. Its inner edge is curved, so it gets closer to the strip as it turns one way. Watch the red dot." },
      { key: "out", color: "#5E7387", name: "Board", note: "The wood being held. Pushing it down turns the jaw. Once the jaw is jammed against it, it cannot go further." },
      { key: "crank", color: "#D9B13B", name: "Pivot screw", note: "The one fixed point of the jaw. The jaw turns around it, and nothing else holds the jaw." }
    ],
    controls: [{ id: "wood", label: "Board", value: "mid", options: [["thin", "Thin"], ["mid", "Medium"], ["thick", "Thick"]] }],
    readouts: [{ id: "depth", label: "Pushed in" }, { id: "turn", label: "Jaw turned" }],
    views: { "3d": [447, 263, 799], front: [75, 60, 760], side: [640, 60, 90] },
    target: [75, 60, 0],
    how: [
      "Push the board down. Its lower corner slides along the curved edge of the jaw and pushes it. The jaw can only turn on its screw, so it swings aside to let the board pass.",
      "Once the board is past the narrowest part of the curve, the jaw stays turned and presses on the board, helped by a light spring. A thicker board turns the jaw more, and its lower end swings in until the board cannot go deeper. Pulling the board up turns the jaw back towards the strip, so the grip gets tighter.",
      "Try the thin board, then the thick one. Watch how far each goes in before it is held, and how far the jaw turns."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown shows the strip, the jaw and the screw, seen from above. The jaw outline is traced from the drawing. The board, the backing plate, the thickness choices and the depth of the board were made up. The jaw has a light spring so that it rests against the strip when empty. The contact is worked out exactly from the jaw outline and the board edges.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { phase: Math.PI, tabs: {}, boards: {} };
      var Z = 24;                                              // thickness of strip, board and jaw: z -12..12
      // backing plate under everything
      P.at(P.box(215, 380, 12, c.fixed), 52, 20, -18, scene);  // x -55..160, y -170..210, z -24..-12
      // fixed side-piece, sits on the plate face z = -12
      P.at(P.box(45, 360, Z, c.mat("drive")), -22.5, 10, 0, scene);  // x -45..0, y -170..190, z -12..12
      [79, -105].forEach(function (y) {
        P.at(P.cylZ(8, 2, c.mat("drive", "light")), -21, y, 13, scene);      // screw head z 12..14
        P.at(P.box(13, 2.5, 1, c.mat("drive", "dark")), -21, y, 14.5, scene);  // slot z 14..15
      });
      // jaw, built around its screw
      o.jaw = new T.Group(); o.jaw.position.set(PIV.x, PIV.y, 0); scene.add(o.jaw);
      var sh = new T.Shape(), pts = INNER.concat(OUTER.slice(1)), i, r;
      for (i = 0; i < pts.length; i++) { r = rel(pts[i]); if (i) sh.lineTo(r[0], r[1]); else sh.moveTo(r[0], r[1]); }
      sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: Z, bevelEnabled: false }); g.translate(0, 0, -12);   // z -12..12
      o.jaw.add(new T.Mesh(g, c.mat("driven")));
      P.at(P.cylZ(5, 1, c.mat("driven", "mark")), -50, 137, 12.5, o.jaw);    // red dot z 12..13
      // pivot screw
      P.at(P.cylZ(7, 25.5, c.mat("crank")), PIV.x, 0, 1.25, scene);               // z -12..14, from the plate face to the head
      P.at(P.cylZ(19, 4, c.mat("crank")), PIV.x, 0, 14, scene);              // head z 12..16
      P.at(P.box(34, 4, 1, c.mat("crank", "dark")), PIV.x, 0, 16.5, scene);  // slot z 16..17
      // boards
      var thick = { thin: 22, mid: 36, thick: 48 };
      ["thin", "mid", "thick"].forEach(function (k) {
        var t = thick[k], m = P.box(t, L, Z - 2, c.mat("out"));
        m.visible = false; scene.add(m); o.boards[k] = m;                    // x 0..t, on the strip face, z -12..12
        o.tabs[k] = table(t);
      });
      o.thick = thick;
    },

    step: function (c, dt, S) {
      var o = this.o, k = S.controls.wood || "mid", tb = o.tabs[k], t, d, i, f, al, yb;
      o.phase += S.w * dt;
      t = (1 - Math.cos(o.phase)) / 2;                          // 0 = board out, 1 = pushed as far as it will go
      d = Math.min(1, t * 1.15) * tb.stop;                       // short rest at the grip
      i = Math.max(0, Math.min(tb.stop - 1, Math.floor(d))); f = Math.max(0, Math.min(1, d - i));
      al = tb.al[i] + (tb.al[Math.min(tb.stop, i + 1)] - tb.al[i]) * f;
      yb = YB0 + (YB1 - YB0) * d / ND;
      for (var n in o.boards) o.boards[n].visible = n === k;
      o.boards[k].position.set(o.thick[k] / 2 + 0.4, yb + L / 2, 0);
      o.jaw.rotation.z = -al;
      S.set("depth", Math.round(YB0 - yb) + " mm");
      S.set("turn", (al / RAD).toFixed(1) + " deg");
    }
  });
  M507.__kin = { table: table, room: room };
})();
