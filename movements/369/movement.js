M507.define({
  number: 369,
  title: "Cycloidal pendulum",
  lede: "A pendulum whose cord wraps against two curved cheeks as it swings. The cheeks bend the pendulum bob's path into a curve called a cycloid. Then every swing takes exactly the same time, big or small, which is what a clock needs.",
  alt: "A bar with two curved cheeks hanging under it, one each side of a cord. A violet bob on the cord swings along a dotted curve, and the cord lies against a cheek at each end of the swing. A pale pendulum on a straight cord swings in front for comparison.",
  parts: [
    { key: "cheeks", color: "#4FA58A", name: "Cheeks", note: "Two curved plates fixed under the bar. Their edges are cut to a cycloid, the curve a spot on a rolling wheel's rim draws." },
    { key: "cord", color: "#D9B13B", name: "Cord", note: "Hangs from the bar between the cheeks. As the bob swings out, the cord lies against one cheek, so the part that swings gets shorter." },
    { key: "bob", color: "#8E7AA8", name: "Pendulum bob", note: "The weight. It runs along the dotted curve, which is a cycloid too. Watch it take the same time for every swing." },
    { key: "ghost", color: "#E8E2D0", name: "Plain pendulum", note: "An ordinary pendulum of the same length on a straight cord, swinging from a pin in front. It is here to compare against." }
  ],
  controls: [{ id: "amp", label: "Size of swing", value: "large", options: [["small", "Small"], ["mid", "Medium"], ["large", "Large"]] }],
  speed: false,
  readouts: [{ id: "cyc", label: "Cycloid swing" }, { id: "circ", label: "Plain swing" }],
  views: { "3d": [190, -20, 560], front: [0, -95, 600], side: [600, -95, 0] },
  target: [0, -95, 0],
  how: [
    "The pendulum bob swings from side to side. Near the ends of its swing, the cord lies against one of the curved cheeks. Only the part below the cheek can swing, so the bob climbs more steeply than on a plain cord.",
    "On a plain pendulum, a big swing takes a little longer than a small one. The cheeks fix that. They make the bob run on a cycloid, and on that curve the slope always pulls back in proportion to the distance from the middle. So a wide swing goes faster in just the right amount, and every swing takes the same time.",
    "The two readouts time one full swing, there and back. Try Small, then Large. The cycloid time stays the same. The plain pendulum gets slower, and it falls behind the pendulum bob."
  ],
  note: "This model is rebuilt from Brown's drawing. The pin and the pale plain pendulum in front were added to compare. The bar is shown on its own, without the wall or clock case it would be fixed to. The time for a swing is made up. Air and rub are left out, so the swings never die away.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, a = 50, RC = 1.5, i;
    var o = this.o = { a: a, t: 0, amp: null };
    function cyc(t) { return [a * (t - Math.sin(t)), -a * (1 - Math.cos(t))]; }             // right cheek's cycloid, cusp at the origin (under the bar)
    function off(t, d) { var p = cyc(t); return [p[0] + d * Math.cos(t / 2), p[1] + d * Math.sin(t / 2)]; }   // pushed d into the cheek, along its normal
    o.cyc = cyc;
    // Each cheek is one flat plate, z -10..10: the curved band, the upright post and a brace, with two windows.
    function cheek(sg) {
      var sh = new T.Shape(), n = 60, k, p, W = 14, POST = 63, PW = 8, TOP = -5;
      function X(x) { return sg * x; }
      function solve(f, lo, hi) { for (var m = 0; m < 50; m++) { var md = (lo + hi) / 2; if ((f(lo) < 0) === (f(md) < 0)) lo = md; else hi = md; } return (lo + hi) / 2; }
      var pts = [], tb = solve(function (t) { return off(t, RC + W)[0] - POST - PW; }, 1, 3);
      for (k = 0; k <= n; k++) pts.push(off(Math.PI * k / n, RC));                            // edge the cord lies on, from (1.5, 0) out to the tip
      for (k = n; k >= 0; k--) { var tk = Math.PI * k / n; if (tk <= tb) break; pts.push(off(tk, RC + W)); }   // back edge of the band, 14 thick
      pts.push(off(tb, RC + W)); pts.push([POST + PW, 0]); pts.push([RC, 0]);                 // up the outside of the post, along the bar's underside
      pts.forEach(function (q, j) { if (j) sh.lineTo(X(q[0]), q[1]); else sh.moveTo(X(q[0]), q[1]); });
      // window region: under the bar strip (y < TOP), left of the post (x < POST), outside the band plus a 5 wide rim
      var t1 = solve(function (t) { return off(t, RC + W + 5)[1] - TOP; }, .4, 2), t2 = solve(function (t) { return off(t, RC + W + 5)[0] - POST; }, 1, 3);
      var A = off(t1, RC + W + 5), B = off(t2, RC + W + 5), reg = [[A[0], TOP], [POST, TOP], [POST, B[1]]];
      for (k = 20; k >= 0; k--) reg.push(off(t1 + (t2 - t1) * k / 20, RC + W + 5));
      // brace from the top of the post down to the middle of the band; windows are the region each side of it, kept 3 clear
      var M = off((t1 + t2) / 2, RC + W + 5), bx0 = POST, by0 = TOP, dx = M[0] - bx0, dy = M[1] - by0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
      function clip(poly, s) {                                                                // keep points with s * distance-from-brace > 3
        var out = [], m;
        function f(q) { return s * ((q[0] - bx0) * nx + (q[1] - by0) * ny) - 3; }
        for (m = 0; m < poly.length; m++) {
          var u = poly[m], v = poly[(m + 1) % poly.length], fu = f(u), fv = f(v);
          if (fu >= 0) out.push(u);
          if ((fu >= 0) !== (fv >= 0)) { var r = fu / (fu - fv); out.push([u[0] + (v[0] - u[0]) * r, u[1] + (v[1] - u[1]) * r]); }
        }
        return out;
      }
      [clip(reg, 1), clip(reg, -1)].forEach(function (h) {
        if (h.length < 3) return;
        if (sg < 0) h = h.slice().reverse();
        var hp = new T.Path(); h.forEach(function (q, j) { if (j) hp.lineTo(X(q[0]), q[1]); else hp.moveTo(X(q[0]), q[1]); }); sh.holes.push(hp);
      });
      var g = new T.ExtrudeGeometry(sh, { depth: 20, bevelEnabled: false }); g.translate(0, 0, -10);
      scene.add(new T.Mesh(g, c.mat("cheeks")));
    }
    cheek(1); cheek(-1);
    P.at(P.box(160, 16, 28, c.fixed), 0, 8, 0, scene);                     // bar x -80..80, y 0..16, z -14..14; the cheeks' tops meet its underside at y 0
    P.at(P.cylZ(3, 12, c.fixed), 0, 8, 20, scene);                          // pin for the plain pendulum, z 14..26, out of the bar's front face
    // cord: wrapped part as short pieces along the cheek, then the straight part
    o.wrap = []; for (i = 0; i < 24; i++) o.wrap.push(P.at(P.rod(RC, c.mat("cord")), 0, 0, 0, scene));
    o.free = P.at(P.rod(RC, c.mat("cord")), 0, 0, 0, scene);
    o.bob = P.at(P.sphere(10, c.mat("bob")), 0, -4 * a, 0, scene);
    // dotted path of the bob, as in the drawing
    for (i = -40; i <= 40; i++) { var s = Math.PI * i / 40 * .97; P.at(P.sphere(1.6, c.mat("bob", "dark")), a * (s + Math.sin(s)), -a * (3 + Math.cos(s)), 0, scene); }
    // plain pendulum, same length 4a, hung from the pin at (0, 8, 22)
    o.gp = new T.Group(); o.gp.position.set(0, 8, 22); scene.add(o.gp);
    P.at(P.cylY(1.2, 4 * a - 9, c.mat("ghost")), 0, -(4 * a - 9) / 2, 0, o.gp);
    P.at(P.sphere(9, c.mat("ghost")), 0, -4 * a, 0, o.gp);
    P.at(P.cylZ(4.5, 4, c.mat("ghost")), 0, 0, 0, o.gp);                     // eye on the pin, z 20..24
  },

  opacity: function (key) { return key === "ghost" ? .55 : 1; },

  step: function (c, dt, S) {
    var o = this.o, a = o.a, i, OM = Math.PI, A0 = { small: .6, mid: 1.5, large: 2.3 }[S.controls.amp] || 2.3;
    if (o.amp !== A0) {                                                       // release both from the same height
      o.amp = A0; o.t = 0; o.th = Math.acos(1 - (1 - Math.cos(A0)) / 4); o.om = 0;
      o.prevC = o.prevG = null; o.tc = []; o.tg = []; o.lastC = o.lastG = 0;
    }
    var h = S.playing ? Math.min(dt, .05) : 0, n = Math.ceil(h / (1 / 240)), hs = n ? h / n : 0;
    // plain pendulum: theta'' = -OM^2 sin(theta), RK4
    for (i = 0; i < n; i++) {
      var th = o.th, om = o.om, f = function (x) { return -OM * OM * Math.sin(x); };
      var k1t = om, k1o = f(th), k2t = om + hs / 2 * k1o, k2o = f(th + hs / 2 * k1t), k3t = om + hs / 2 * k2o, k3o = f(th + hs / 2 * k2t), k4t = om + hs * k3o, k4o = f(th + hs * k3t);
      o.th += hs / 6 * (k1t + 2 * k2t + 2 * k3t + k4t); o.om += hs / 6 * (k1o + 2 * k2o + 2 * k3o + k4o);
    }
    o.t += h;
    // cycloid: arc length from the bottom is 4a sin(s/2) and moves as a pure cosine, the same time for any size
    var sig = 4 * a * Math.sin(A0 / 2) * Math.cos(OM * o.t), s = 2 * Math.asin(sig / (4 * a));
    var bx = a * (s + Math.sin(s)), by = -a * (3 + Math.cos(s));
    o.bob.position.set(bx, by, 0);
    var tp = o.cyc(Math.abs(s)), sg = s < 0 ? -1 : 1, px = 0, py = 0;
    for (i = 0; i < 24; i++) {
      var q = o.cyc(Math.abs(s) * (i + 1) / 24);
      o.wrap[i].span(px, py, 0, sg * q[0], q[1], 0); px = sg * q[0]; py = q[1];
    }
    var dx = bx - sg * tp[0], dy = by - tp[1], L = Math.hypot(dx, dy) || 1;
    o.free.span(sg * tp[0], tp[1], 0, bx - dx / L * 9, by - dy / L * 9, 0);
    o.gp.rotation.z = o.th;
    // time each full swing from one pass through the middle (moving the same way) to the next
    function timing(list, prev, now, t) {
      if (prev !== null && prev < 0 && now >= 0) { list.push(t - h * now / (now - prev)); if (list.length > 2) list.shift(); }
    }
    if (h > 0) { timing(o.tc, o.prevC, sig, o.t); timing(o.tg, o.prevG, o.th, o.t); o.prevC = sig; o.prevG = o.th; }
    function show(id, list) { S.set(id, list.length > 1 ? (list[1] - list[0]).toFixed(2) + " s" : "timing"); }
    show("cyc", o.tc); show("circ", o.tg);
  }
});
