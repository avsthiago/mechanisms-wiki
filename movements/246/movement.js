M507.define({
  number: 246,
  title: "Pantograph",
  lede: "Four jointed bars let you copy a drawing at a different size. You trace the outline with one point and a pencil draws the same shape, bigger. Draughtsmen use it to enlarge or shrink plans.",
  alt: "Four jointed bars make a diamond. One long bar is held at a fixed point at the lower left and the other carries a pencil at its upper left end. A tracing point sits at the left corner of the diamond. A small star is traced with the point and a larger star is drawn by the pencil.",
  parts: [
    { key: "bars", color: "#5E7387", name: "Four bars", note: "Four bars joined by pins make a diamond that can change shape. Opposite sides always stay parallel." },
    { key: "fixed", color: "#4FA58A", name: "Fixed point", note: "A post screwed to the board. The whole frame swings round it and it never moves." },
    { key: "slide", color: "#C8873A", name: "Slides", note: "One slide holds the fixed point and one holds the pencil. Each can be moved along its bar to change the size of the copy." },
    { key: "tracer", color: "#D9B13B", name: "Tracing point", note: "You guide this point along the outline you want to copy. The dark line shows where it has been." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Watch the red line. It draws the same shape as the tracing point, but larger." }
  ],
  controls: [{ id: "k", label: "Size of the copy", value: "2", options: [["1.5", "1.5 times"], ["2", "2 times"], ["3", "3 times"]] }],
  readouts: [{ id: "k", label: "Copy size" }, { id: "t", label: "Point moved" }, { id: "p", label: "Pencil moved" }],
  views: { "3d": [520, 420, 1000], front: [120, 182, 975], side: [900, 190, 100] },
  target: [120, 182, 0],
  how: [
    "Trace the small star with the tracing point. The pencil draws the same star, larger, in its own place. The dark line is where the point has been and the red line is the pencil's work.",
    "The four bars always make a diamond with opposite sides parallel. That keeps the fixed point, the tracing point and the pencil in one straight line. The pencil stays twice as far from the fixed point as the tracing point, so every line it draws is twice as long.",
    "Slide the fixed point and the pencil along their bars to change this. Try 1.5 times, then 3 times, and compare the size of the red star with the dark one."
  ],
  note: "This model is rebuilt from Brown's drawing. The board, the paper, the star and the bar thickness were made up. The bars are drawn just long enough for each setting, and the bars lie in two layers so the joints can turn. The slides move by themselves when you pick a new size.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { L: 150, a: 2, tgt: 2, s: 0, hold: 0, tl: 0, pl: 0, ang: 80 * Math.PI / 180 };
    var N = 10, i, sc = c.scene;
    // board: x -90..350, y -70..350, z -18..-14 (top at z = -14)
    P.at(P.box(620, 580, 4, c.fixed), 180, 190, -16, sc);
    // papers: top at z = -12, bottom at the board top z = -14
    o.paperB = P.at(P.box(1, 1, 2, c.mat("slide", "light")), 0, 0, -13, sc);
    o.paperA = P.at(P.box(1, 1, 2, c.mat("slide", "light")), 0, 0, -13, sc);
    o.paperB.scale.set(92, 92, 1); o.paperA.scale.set(100, 100, 1);
    // star outline: ten corners, outer 22, inner 9
    o.star = [];
    for (i = 0; i <= N; i++) { var r = i % 2 ? 15 : 37, t = Math.PI / 2 + i * Math.PI / 5; o.star.push([r * Math.cos(t), r * Math.sin(t)]); }
    o.tmpl = []; o.ink = []; o.draw = [];
    for (i = 0; i < N; i++) {
      o.tmpl.push(P.at(P.rod(2.4, c.mat("tracer", "light")), 0, 0, 0, sc));
      o.ink.push(P.at(P.rod(1.8, c.mat("bars", "dark")), 0, 0, 0, sc));
      o.draw.push(P.at(P.rod(2.2, c.mat("pencil", "mark")), 0, 0, 0, sc));
    }
    // bars: long1 at z=0, long2 at z=12, short from the tracer to the lower joint at z=12, short to the upper joint at z=0
    o.long1 = P.at(P.rod(5.5, c.mat("bars")), 0, 0, 0, sc);
    o.long2 = P.at(P.rod(5.5, c.mat("bars")), 0, 0, 0, sc);
    o.s1 = P.at(P.rod(5.5, c.mat("bars")), 0, 0, 0, sc);
    o.s3 = P.at(P.rod(5.5, c.mat("bars")), 0, 0, 0, sc);
    o.pins = [];
    for (i = 0; i < 3; i++) o.pins.push(P.at(P.cylZ(7, 28, c.mat("bars", "dark")), 0, 0, 7, sc));
    o.tr = P.at(P.cylZ(5, 36, c.mat("tracer")), 0, 0, 6, sc);            // z -12..18
    o.post = P.at(P.cylZ(6, 14, c.mat("fixed")), 0, 0, -7, sc);            // z -14..0
    o.cslide = P.at(P.sphere(15, c.mat("slide")), 0, 0, 0, sc);
    o.aslide = P.at(P.box(28, 22, 22, c.mat("slide")), 0, 0, 14, sc);
    o.pen = P.at(P.cylZ(4.5, 36, c.mat("pencil")), 0, 0, 6, sc);             // z -12..24
  },

  step: function (c, dt, S) {
    var o = this.o, L = o.L, i, N = 10, tgt = +S.controls.k;
    if (o.tgt !== tgt) { o.tgt = tgt; o.s = 0; o.hold = 0; o.tl = o.pl = 0; }
    var da = o.tgt - o.a, moving = Math.abs(da) > 0.002;
    if (moving) o.a += da * Math.min(1, dt * 4); else o.a = o.tgt;
    var a = o.a, w = moving ? 0 : S.w;
    var dc = (a <= 2 ? 1.7 - 1.4 * (a - 1.5) : 1.0 - 0.1 * (a - 2)) * L;
    var cx = 0, cy = 0, ux = Math.cos(o.ang), uy = Math.sin(o.ang);
    // advance round the star; hold a moment, then clear and start again
    var prev = o.s;
    if (o.s < 1) o.s = Math.min(1, o.s + w * dt / (2 * Math.PI));
    else { o.hold += w * dt / (2 * Math.PI); if (o.hold > 0.25) { o.s = 0; o.hold = 0; o.tl = o.pl = 0; prev = 0; } }
    function sp(s) { var f = s * N, k = Math.min(N - 1, Math.floor(f)), u = f - k, p = o.star[k], q = o.star[k + 1]; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; }
    var bc = [cx + dc * ux, cy + dc * uy], sh = sp(o.s);
    var bx = bc[0] + sh[0], by = bc[1] + sh[1], dx = bx - cx, dy = by - cy, D = Math.sqrt(dx * dx + dy * dy);
    var r1 = L / (a - 1), r2 = L; D = Math.max(Math.abs(r1 - r2) + 1e-3, Math.min(r1 + r2 - 1e-3, D));
    var ex = dx / Math.sqrt(dx * dx + dy * dy), ey = dy / Math.sqrt(dx * dx + dy * dy);
    var xx = (r1 * r1 - r2 * r2 + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, r1 * r1 - xx * xx));
    var j1x = cx + xx * ex + hh * ey, j1y = cy + xx * ey - hh * ex;       // joint on the bar to the fixed point
    var cc = a / (a - 1), px = (cx - j1x) * (a - 1), py = (cy - j1y) * (a - 1), qx = bx - j1x, qy = by - j1y;
    var j2x = cx - cc * px, j2y = cy - cc * py, j3x = j2x + qx, j3y = j2y + qy;
    var ax = cx + a * (bx - cx), ay = cy + a * (by - cy);
    // drawn and traced distances
    var shp = sp(prev); o.tl += Math.hypot(sh[0] - shp[0], sh[1] - shp[1]); o.pl += a * Math.hypot(sh[0] - shp[0], sh[1] - shp[1]);
    // bars
    var pl = Math.hypot(px, py), ql = Math.hypot(qx, qy), ph = [px / pl, py / pl], qh = [qx / ql, qy / ql];
    o.long1.span(j2x, j2y, 0, cx + ph[0] * 33, cy + ph[1] * 33, 0);
    o.long2.span(j2x, j2y, 14, ax + qh[0] * 38, ay + qh[1] * 38, 14);
    o.s1.span(bx, by, 14, j1x, j1y, 14);
    o.s3.span(bx, by, 0, j3x, j3y, 0);
    o.pins[0].position.set(j1x, j1y, 7); o.pins[1].position.set(j2x, j2y, 7); o.pins[2].position.set(j3x, j3y, 7);
    o.tr.position.set(bx, by, 6); o.post.position.set(cx, cy, -7); o.cslide.position.set(cx, cy, 0);
    o.aslide.position.set(ax, ay, 14); o.aslide.rotation.z = Math.atan2(qh[1], qh[0]);
    o.pen.position.set(ax, ay, 6);
    o.paperB.position.set(bc[0], bc[1], -13);
    o.paperA.position.set(cx + a * bc[0], cy + a * bc[1], -13); o.paperA.scale.set(a * 74 + 22, a * 74 + 22, 1);
    // lines
    var f = o.s * N;
    for (i = 0; i < N; i++) {
      var p = o.star[i], q = o.star[i + 1], u = Math.max(0, Math.min(1, f - i)), qx2 = p[0] + (q[0] - p[0]) * u, qy2 = p[1] + (q[1] - p[1]) * u;
      o.tmpl[i].span(bc[0] + p[0], bc[1] + p[1], -11.4, bc[0] + q[0], bc[1] + q[1], -11.4);
      o.ink[i].visible = o.draw[i].visible = u > 0;
      if (u > 0) {
        var ex0 = qx2 - p[0], ey0 = qy2 - p[1], el = Math.hypot(ex0, ey0) || 1, ins = Math.min(0.6, el / 3);   // ink starts and ends 0.6 inside the template line, so the end caps do not share a plane
        o.ink[i].span(bc[0] + p[0] + ex0 / el * ins, bc[1] + p[1] + ey0 / el * ins, -10.4, bc[0] + qx2 - ex0 / el * ins, bc[1] + qy2 - ey0 / el * ins, -10.4);
        o.draw[i].span(a * (bc[0] + p[0]), a * (bc[1] + p[1]), -10.4, a * (bc[0] + qx2), a * (bc[1] + qy2), -10.4);
      }
    }
    S.set("k", (a % 1 > .01 && a % 1 < .99 ? a.toFixed(1) : Math.round(a)) + " times");
    S.set("t", Math.round(o.tl / 10) + " cm");
    S.set("p", Math.round(o.pl / 10) + " cm");
  }
});
