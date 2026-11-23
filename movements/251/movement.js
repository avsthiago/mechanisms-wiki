M507.define({
  number: 251,
  title: "Pile-driver releasing hook",
  lede: "A heavy weight is pulled up a tall frame by two hooks. At the top, the hooks let go by themselves and the weight drops onto a post. Each blow drives the post a little deeper into the ground.",
  alt: "Two tall uprights capped by a top piece with a slot that narrows upwards. A heavy block hangs between them from a pair of curved hooks on a small block, which hangs from a rope. Below the block a square post stands in the ground.",
  parts: [
    { key: "block", color: "#5E7387", name: "Hook block", note: "Hangs from the rope and carries the two hooks on pins. The winch pulls it up and lets it down again." },
    { key: "hooks", color: "#C2503F", name: "Hooks", note: "Two curved hooks. Their lower ends catch under the head of the weight. Watch their upper ends meet the top of the frame." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "A heavy iron block with a head on top for the hooks to hold. It slides between the uprights." },
    { key: "top", color: "#4FA58A", name: "Slotted top", note: "The top of the frame. The slot in it gets narrower towards the top, so it squeezes the upper ends of the hooks together." },
    { key: "pile", color: "#C8873A", name: "Post", note: "The post being driven into the ground, called a pile. It sinks a little at each blow." },
    { key: "rope", color: "#D9B13B", name: "Rope and winch", note: "The rope runs over a wheel above the frame and down to a winch, which winds it in and lets it out." }
  ],
  controls: [],
  speed: { min: 2, max: 20, value: 8, label: "Blows", unit: " a min" },
  readouts: [{ id: "n", label: "Blows" }, { id: "d", label: "Post driven" }, { id: "l", label: "Last blow" }],
  views: { "3d": [430, 130, 860], front: [0, 0, 1000], side: [1000, 0, 0] },
  target: [0, 10, 0],
  how: [
    "The winch pulls the hook block up, and the weight hangs from its two hooks. Near the top, the upper ends of the hooks run into the slot in the frame. The slot gets narrower as they rise, so it squeezes them together.",
    "Each hook turns on a pin, like a see-saw. When its upper end is pushed in, its lower end swings out. Once the lower ends clear the head of the weight, nothing holds it, and it falls onto the post.",
    "Then the winch lets the block down. The lower ends of the hooks slide over the head and snap back under it, ready for the next lift. Watch the readouts: the post sinks less at each blow, because the ground holds it more firmly the deeper it goes."
  ],
  note: "This model is rebuilt from Brown's drawing. The rope wheel, the winch, the ground and the post were added to show where the rope goes and what the weight strikes. The shapes of the hooks and the head, the sizes, and how far the post sinks at each blow are made up. The hooks are taken to fall shut by their own weight.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = {
      th: 0, PX: 18, GY: -190, CB: 156, CH: 30, WB: 45, WT: 20,     // pivot offset, ground top, cap bottom and height, slot half-width at bottom and top
      pileTop: -150, sunk: 0, blows: 0, last: 0, phi: 0, v: 0, state: "held", ypLow: 0
    };
    o.CT = o.CB + o.CH;
    // ---- outline of the left hook, around its pin, closed; x outwards is negative ----
    function band(C, h) {
      var L = [], R = [], n = C.length;
      for (var k = 0; k < n; k++) {
        var a = C[Math.max(0, k - 1)], b = C[Math.min(n - 1, k + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty);
        L.push([C[k][0] - ty / tl * h, C[k][1] + tx / tl * h]); R.push([C[k][0] + ty / tl * h, C[k][1] - tx / tl * h]);
      }
      return L.concat(R.reverse());
    }
    o.horn = band([[-1, -30], [-1, 0], [-2, 20], [-4, 40], [-7, 54], [-12, 63], [-18, 66], [-22, 63], [-23, 57]], 3.5);
    o.lip = [[-4.5, -30], [10, -30], [10, -31], [3, -37], [-4.5, -37]];          // jaw; its top edge (y -30) carries the head
    function shape(pts) { var s = new T.Shape(); pts.forEach(function (p, k) { if (k) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); }); s.closePath(); return s; }
    function plate(pts, z0, z1, m) { var g = new T.ExtrudeGeometry(shape(pts), { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return new T.Mesh(g, m); }
    // ---- moving parts: hook block, hooks (z 5.5 .. 11.5, in front of the block z -5 .. 5), rope ----
    o.blk = new T.Group(); scene.add(o.blk);
    var mb = c.mat("block"), mh = c.mat("hooks");
    P.at(P.box(48, 32, 10, mb), 0, 8, 0, o.blk);                                // body x +-24, y -8 .. 24 from the pins, z -5 .. 5
    P.at(P.hook({ radius: 9, tube: 3, material: mb }), 0, 33, 0, o.blk);          // eye, rod y 21 .. 45; its bottom is sunk in the body top (24)
    o.hooks = [];
    [-1, 1].forEach(function (s) {
      var outer = new T.Group(), inner = new T.Group(); outer.position.set(s * o.PX, 0, 0); outer.scale.x = -s; outer.add(inner); o.blk.add(outer);
      inner.add(plate(o.horn, 5.5, 11.5, mh)); inner.add(plate(o.lip, 5.5, 11.5, mh));
      P.at(P.cylZ(6, 6, mh), 0, 0, 8.5, inner);                                  // boss round the pin
      P.at(P.cylZ(2.5, 8, c.mat("block", "dark")), s * o.PX, 0, 9, o.blk);       // pin z 5 .. 13, from the body face
      o.hooks.push(inner);
    });
    // ---- weight: block, side lugs, neck and head ----
    o.wt = new T.Group(); scene.add(o.wt);
    var mw = c.mat("weight");
    P.at(P.box(80, 110, 36, mw), 0, 55, 0, o.wt);                                // x +-40, y 0 .. 110 from its bottom, z +-18
    [-1, 1].forEach(function (s) { [16, 94].forEach(function (y) { P.at(P.box(5.5, 14, 20, mw), s * 42.75, y, 0, o.wt); }); });   // lugs x 40 .. 45.5; uprights start at 46
    P.at(P.cylY(5, 16, mw), 0, 118, 0, o.wt);                                    // neck y 110 .. 126
    P.at(P.box(28, 12, 24, mw), 0, 132, 0, o.wt);                                // head x +-14, y 126 .. 138 (underside Hu = bottom + 126)
    // ---- post in the ground ----
    o.pile = P.at(P.box(30, 60, 30, c.mat("pile")), 0, 0, 0, scene);            // x, z +-15; top at pileTop
    P.at(P.box(30.6, 1, 30.6, c.mat("pile", "dark")), 0, 27, 0, o.pile);         // dark band 3 below the top, standing .3 proud of the sides
    // ---- frame (supports) ----
    var G = o.GY;
    P.at(P.box(94.5, 60, 80, c.fixed), -62.75, G - 30, 0, scene);              // ground x -110 .. -15.5, y -250 .. -190, z +-40
    P.at(P.box(94.5, 60, 80, c.fixed), 62.75, G - 30, 0, scene);               // x 15.5 .. 110
    P.at(P.box(31, 60, 24.5, c.fixed), 0, G - 30, 27.75, scene);               // x +-15.5, z 15.5 .. 40 (hole for the post: +-15.5)
    P.at(P.box(31, 60, 24.5, c.fixed), 0, G - 30, -27.75, scene);              // z -40 .. -15.5
    [-1, 1].forEach(function (s) { P.at(P.box(23.5, o.CB - G + .5, 28, c.fixed), s * 57.75, (o.CB + .5 + G) / 2, 0, scene); });   // uprights x 46 .. 69.5, y -190 .. CB + .5 (0.5 into the top pieces), z +-14
    var mt = c.mat("top");
    [-1, 1].forEach(function (s) {                                              // top pieces, z +-18, x out to 70; bottom face on the uprights' tops (CB)
      var m = plate([[-70, o.CB], [-o.WB, o.CB], [-o.WT, o.CT], [-70, o.CT]], -18, 18, mt); m.scale.x = -s; scene.add(m);
    });
    // ---- rope wheel on the top, rope, winch on the ground to the right ----
    o.RS = 37; o.SY = o.CT + 4 + o.RS;                                          // wheel centre (37, SY, 0): rope rises at x 0, comes down at x 74
    o.sheave = P.at(P.sheave({ radius: o.RS, width: 8, material: c.mat("rope"), holes: c.mat("rope", "dark") }), o.RS, o.SY, 0, scene);   // z +-4
    P.at(P.cylZ(4, 9, c.mat("rope", "dark")), o.RS, o.SY, 0, scene);            // axle z +-4.5, ends at the cheeks' inner faces
    [-1, 1].forEach(function (s) { P.at(P.box(12, o.SY + 8.5 - o.CT, 6, c.fixed), o.RS, (o.CT - .5 + o.SY + 8) / 2, s * 7.5, scene); });   // cheeks x 31 .. 43 on the right top piece, y CT .. SY+8, z 4.5 .. 10.5
    o.ropeUp = P.at(P.rod(2, c.mat("rope")), 0, 0, 0, scene);
    P.at(P.arc(o.RS, 2, Math.PI, c.mat("rope")), o.RS, o.SY, 0, scene);         // over the top of the wheel
    o.winch = P.winch({ material: c.mat("rope"), handle: c.mat("rope", "dark"), rope: c.mat("rope") });
    o.WX = 2 * o.RS + o.winch.ropeRadius;                                        // drum centre x 89.5: barrel x 75.5 .. 103.5, clear of the upright (70)
    P.at(o.winch, o.WX, G + 40, 0, scene);                                       // foot underside on the ground top
    P.at(P.rod(2, c.mat("rope")), 0, 0, 0, scene).span(2 * o.RS, o.SY, 0, 2 * o.RS, G + 40, 0);   // down run at x 74, outside the upright and the top (70)
    o.mark = P.at(P.sphere(3.5, c.mat("rope", "mark")), 2 * o.RS, 0, 0, scene); // a mark on the down run

    // ---- geometry shared with step() ----
    o.world = function (pts, yp, phi) {                                         // left hook points in the frame, pin at (-PX, yp), turned clockwise by phi
      var cs = Math.cos(phi), sn = Math.sin(phi);
      return pts.map(function (p) { return [-o.PX + p[0] * cs + p[1] * sn, yp - p[0] * sn + p[1] * cs]; });
    };
    function cross(a, b, q) { return (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]); }
    function segHit(a, b, p, q) { return cross(a, b, p) * cross(a, b, q) < 0 && cross(p, q, a) * cross(p, q, b) < 0; }
    function inside(pt, poly) {
      var r = false; for (var k = 0, j = poly.length - 1; k < poly.length; j = k++) {
        var a = poly[k], b = poly[j];
        if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) r = !r;
      } return r;
    }
    o.hit = function (A, B) {
      for (var k = 0; k < A.length; k++) for (var j = 0; j < B.length; j++) if (segHit(A[k], A[(k + 1) % A.length], B[j], B[(j + 1) % B.length])) return true;
      return inside(A[0], B) || inside(B[0], A);
    };
    o.cap = [[-70, o.CB], [-o.WB, o.CB], [-o.WT, o.CT], [-70, o.CT]];
    o.head = function (Hu) { return [[-14, Hu], [14, Hu], [14, Hu + 12], [-14, Hu + 12]]; };
    o.clear = function (yp, phi, Hu) {                                          // true when the left hook at this angle touches nothing
      var h = o.world(o.horn, yp, phi), l = o.world(o.lip, yp, phi), obs = [o.cap];
      if (Hu !== null) obs.push(o.head(Hu));
      return !obs.some(function (b) { return o.hit(h, b) || o.hit(l, b); });
    };
    o.need = function (yp, Hu) {                                                // smallest opening angle at which the hook touches nothing
      if (o.clear(yp, 0, Hu)) return 0;
      var a = 0, b = 0;
      for (b = .005; b < .6; b += .005) { if (o.clear(yp, b, Hu)) break; a = b; }
      for (var k = 0; k < 14; k++) { var m = (a + b) / 2; if (o.clear(yp, m, Hu)) b = m; else a = m; }
      return b;
    };
    o.grip = function (yp, phi) {                                               // height of the jaw's top edge under the head's edge, or null once it has slid clear
      var cs = Math.cos(phi), sn = Math.sin(phi), x = (4 + 30 * sn) / cs;          // the point of the top edge now at 14 from the middle
      if (x > 10) return null;
      return yp - x * sn - 30 * cs;
    };
    // the top of the lift: where the slot has opened the hooks by .25
    for (o.ypTop = 0; o.need(o.ypTop + .25, null) < .25; o.ypTop += .25);
    o.ypLow = o.pileTop + 126 + 28;                                              // jaws 2 below the head's underside
    var u0 = 0, target = o.ypTop - 30;                                           // start part way up, hooks just below the slot, as in the drawing
    while (o.ypLow + (o.ypTop - o.ypLow) * this.ease(u0 / .55) < target) u0 += .001;
    o.th = u0 * 2 * Math.PI; o.wb = target - 156;
  },

  ease: function (t) { return t - Math.sin(2 * Math.PI * t) / (2 * Math.PI); },

  step: function (c, dt, S) {
    var o = this.o;
    if (!S.playing) dt = 0;
    o.th += S.w * dt;
    var u = (o.th / (2 * Math.PI)) % 1, yp;
    var restHu = o.pileTop + 126;
    if (u < .55) yp = o.ypLow + (o.ypTop - o.ypLow) * this.ease(u / .55);
    else if (u < .62) yp = o.ypTop;
    else yp = o.ypTop + (restHu + 28 - o.ypTop) * this.ease((u - .62) / .38);
    if (u >= .55) o.ypLow = restHu + 28;                                       // the next lift starts where this lowering ends
    o.yp = yp;
    // hooks: pushed open by whatever they touch, otherwise they fall shut
    var Hu;
    if (o.state === "rest" && u < .55 && yp - 30 >= restHu - .01 && o.phi < .02) { o.state = "held"; }
    if (o.state === "held") {
      var need = o.need(yp, null);
      o.phi = Math.max(need, o.phi - 4 * dt);
      var g = o.grip(yp, o.phi);
      if (g === null) { o.state = "fall"; o.v = 0; o.wb = o.wb; }
      else o.wb = g - 126.5;                                        // head sits 0.5 into the jaw, so the faces do not share a plane
    }
    if (o.state === "fall") {
      o.v += 980 * dt; o.wb -= o.v * dt;
      if (o.wb <= o.pileTop) {
        o.last = 5.5 * Math.pow(.83, o.blows); o.blows++; o.sunk += o.last;
        o.pileTop -= o.last; o.wb = o.pileTop; o.state = "rest";
      }
    }
    if (o.state === "rest") o.wb = o.pileTop;
    if (o.state !== "held") o.phi = Math.max(o.need(yp, o.wb + 126), o.phi - 4 * dt);
    // place everything
    o.blk.position.y = yp;
    o.hooks.forEach(function (h) { h.rotation.z = -o.phi; });
    o.wt.position.y = o.wb;
    o.pile.position.y = o.pileTop - 30;
    o.ropeUp.span(0, yp + 45, 0, 0, o.SY, 0);
    var a = yp - 60;                                                           // rope wound in since the block was at 60
    o.winch.drum.rotation.z = a / o.winch.ropeRadius; o.sheave.rotation.z = -a / o.RS;
    o.mark.position.y = 20 - a;
    S.set("n", String(o.blows));
    S.set("d", o.sunk.toFixed(1) + " cm");
    S.set("l", o.blows ? o.last.toFixed(1) + " cm" : "none yet");
  }
});
