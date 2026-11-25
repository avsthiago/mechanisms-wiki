M507.define({
  number: 247,
  title: "Releasing a sounding weight",
  lede: "A heavy weight rides on a long rod and drags it down to the sea bed. When the rod touches bottom, a catch lets the weight go. The rod can then be pulled up without the heavy load.",
  alt: "A long upright rod cut in half to show its hollow lower end. A large round weight with a hole through it sits on a small catch that sticks out of the rod. A thin striker with a flat foot hangs from the bottom of the rod.",
  parts: [
    { key: "rod", color: "#5E7387", name: "Sounding rod", note: "The long rod that is lowered on a line. It is cut in half here so you can see the hollow end." },
    { key: "weight", color: "#C8873A", name: "Weight", note: "A heavy ball with a hole for the rod. It pulls the rod down fast and then stays behind on the sea bed." },
    { key: "catch", color: "#C2503F", name: "Catch", note: "A small lever inside the rod. Its nose sticks out under the weight. Watch it swing in when the foot is pushed up." },
    { key: "striker", color: "#D9B13B", name: "Striker", note: "A thin rod that slides in the bottom of the rod. Its flat foot hits the sea bed first and pushes it up." }
  ],
  controls: [],
  closed: { label: "Rod" },
  readouts: [{ id: "st", label: "Stage" }, { id: "f", label: "Foot pushed up" }, { id: "w", label: "Weight" }],
  views: { "3d": [380, 227, 814], front: [0, 20, 920], side: [900, 20, 0] },
  target: [0, 20, 0],
  how: [
    "The weight sits on the nose of the catch and hangs on the rod. The rod goes down with it. The flat foot at the bottom reaches the sea bed first.",
    "The foot stops, but the rod keeps sinking a little. So the foot is pushed up into the rod and lifts one end of the catch. The other end, the nose, swings in and leaves the weight with nothing to rest on. The weight drops off and stays on the sea bed.",
    "Now the rod is hauled up and slides out through the hole in the weight. Once the nose is clear, the foot drops back and the catch springs out again. Watch the whole cycle from lowering to the next weight. Choose Closed to see the rod and weight as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The pivot, the return of the catch, the sea bed and the new weight that appears at the top for each cycle were made up. The rod is cut in half like the drawing. The striker is held up while the rod is hauled so the nose cannot catch on the weight.",

  build: function (c) {
    var T = c.THREE, P = c.P, sc = c.scene, i;
    var o = this.o = { tau: 2.0, free: false, yw: 0, vy: 0 };
    var H = Math.PI / 2;
    function V(pts) { return pts.map(function (p) { return new T.Vector2(p[0], p[1]); }); }
    function lathe(pts, a0, a1, m, parent) { var me = new T.Mesh(new T.LatheGeometry(V(pts), 56, a0, a1 - a0), m); parent.add(me); return me; }
    function face(pts, m, parent, mirror) {         // flat cut face in the plane z = 0; mirror also draws the left half
      [1, -1].forEach(function (sg) {
        if (sg < 0 && !mirror) return;
        var sh = new T.Shape(pts.map(function (p) { return new T.Vector2(sg * p[0], p[1]); }));
        parent.add(new T.Mesh(new T.ShapeGeometry(sh), m));
      });
    }
    // rod group; local y = 0 is the middle of the weight when it hangs on the catch
    var rg = o.rg = new T.Group(); sc.add(rg);
    var mr = c.mat("rod"), ml = c.mat("rod");
    var full = [[0, 228], [28, 228], [28, -160], [0, -160], [0, -124], [19, -124], [19, 66], [0, 66]];
    var up = [[0, 228], [28, 228], [28, -20], [19, -20], [19, 66], [0, 66]];                 // right side above the slot (y -20 and up)
    var lo = [[19, -92], [28, -92], [28, -160], [0, -160], [0, -124], [19, -124]];           // right side below the slot (y -92 and down)
    lathe(full, H + 0.7, 3 * H, mr, rg);
    lathe(up, H, H + 0.7, mr, rg); lathe(lo, H, H + 0.7, mr, rg);
    var cut = c.shell(new T.Group(), "open"); rg.add(cut);              // the flat cut faces, open view only
    face(full, ml, cut, false);
    var fl = new T.Shape(full.map(function (p) { return new T.Vector2(-p[0], p[1]); })); cut.add(new T.Mesh(new T.ShapeGeometry(fl), ml));
    face(up, ml, cut, false); face(lo, ml, cut, false);
    // closed view: the front half of the rod, with the same window (phi H-0.7..H) the nose sticks out of, and end faces on the window
    var shut = c.shell(new T.Group(), "closed"); rg.add(shut);
    lathe(full, -H, H - 0.7, mr, shut);
    lathe(up, H - 0.7, H, mr, shut); lathe(lo, H - 0.7, H, mr, shut);
    [H - 0.7, H + 0.7].forEach(function (a) {                          // window sides: wall r 19..28, y -92..-20
      var wm = new T.Mesh(new T.ShapeGeometry(new T.Shape(V([[19, -92], [28, -92], [28, -20], [19, -20]]))), ml);
      wm.rotation.y = a - H; shut.add(wm);
    });
    // weight: a ball 88 across the middle, bore 30, flat seat at y = -76
    var wg = o.wg = new T.Group(); sc.add(wg);
    var wpts = [[30, -76], [Math.sqrt(88 * 88 - 76 * 76), -76]];
    var n = 28, a0 = Math.PI - Math.asin(76 / 88), a1 = Math.asin(30 / 88);        // angles from the +y axis, going up the right side
    for (i = 0; i <= n; i++) { var t = a0 + (a1 - a0) * i / n; wpts.push([88 * Math.sin(t), 88 * Math.cos(t)]); }
    wpts.push([30, Math.sqrt(88 * 88 - 30 * 30)]);
    lathe(wpts, H, 3 * H, c.mat("weight"), wg);
    var wcut = c.shell(new T.Group(), "open"); wg.add(wcut);
    face(wpts, c.mat("weight"), wcut, true);
    var wsh = c.shell(new T.Group(), "closed"); wg.add(wsh);            // closed view: the front half of the ball and the whole bore
    lathe(wpts, -H, H, c.mat("weight"), wsh);
    lathe([wpts[wpts.length - 1], [30, -76]], 0, 4 * H, c.mat("weight"), wsh);
    // catch: a bell-crank pivoted inside the rod at (12, -48)
    o.PV = [12, -48];
    var cg = o.cg = new T.Group(); cg.position.set(12, -48, 0); rg.add(cg);
    var mc = c.mat("catch");
    P.at(P.box(26, 4, 8, mc), -13, -2, 0, cg);                       // lug, x -26..0, y -4..0
    cg.add(P.rod(2.5, mc).span(0, 0, 0, 24, -30.5, 0));    // nose arm
    cg.add(P.rod(2.5, mc).span(0, 0, 0, -7, 30, 0));       // upper arm
    P.at(P.box(16, 5, 8, mc), 24, -30.5, 0, cg);                      // nose, x 16..32 (abs 28..44), top at y -28 (abs -76), the seat of the weight
    P.at(P.arc(6, 1.2, 4.2, mc), -13, 30, 0, cg);                     // curl, drawn like the spring in the picture
    P.at(P.cylZ(3, 20.7, c.mat("rod", "dark")), 12, -48, -4.35, rg);   // pivot pin, z -14.7..6
    // striker: slides in the bottom of the rod, x = -9
    var sg2 = o.sg = new T.Group(); sg2.position.x = -9; rg.add(sg2);
    var ms = c.mat("striker");
    P.at(P.cylY(3, 150, ms), 0, -125, 0, sg2);                       // y -200..-50
    P.at(P.cylY(22, 12, ms), 9, -206, 0, sg2);                       // foot, y -212..-200, centred under the rod
    P.at(P.box(360, 16, 200, c.fixed), 0, -240, 0, sc);               // sea bed, top at y = -232
  },

  step: function (c, dt, S) {
    var o = this.o, vd = 30, D1 = 92 / vd, D2 = D1 + 1.6, D3 = D2 + 92 / vd, D4 = D3 + 0.5, D5 = D4 + 0.5, D6 = D5 + 0.6;
    o.tau += (S.w / 1.047) * dt; if (o.tau >= D6) { o.tau -= D6; }
    var t = o.tau, yR, stage;
    if (t < D1) { yR = 60 - vd * t; }
    else if (t < D2) { yR = -32; }
    else if (t < D3) { yR = -32 + vd * (t - D2); }
    else yR = 60;
    // striker pushed up by the sea bed, then held up until the nose is clear
    var s = Math.max(0, Math.min(12, -20 - yR));
    if (t >= D2) s = Math.max(0, Math.min(12, 12 - (yR - 30)));
    if (t < D1 && yR > -20) s = 0;
    // catch angle from the lug resting on the striker
    var lo = -1.4, hi = 0, k, mid;
    for (k = 0; k < 30; k++) { mid = (lo + hi) / 2; if (-21 * Math.sin(mid) - 4 * Math.cos(mid) + 4 - s > 0) lo = mid; else hi = mid; }
    var dl = (lo + hi) / 2;
    // the weight: held on the nose, falls once the nose has swung clear; a new one is hung at the top
    if (!o.free && dl <= -0.45 && t < D3) { o.free = true; o.vy = 0; }
    if (t >= D4 && o.free) o.free = false;
    if (o.free) {
      if (dt > 0) { o.vy -= 400 * dt; o.yw += o.vy * dt; }
      if (o.yw < -156) { o.yw = -156; o.vy = 0; }
    } else o.yw = yR;
    var wop = t >= D3 && t < D4 ? 1 - (t - D3) / (D4 - D3) : t >= D4 && t < D5 ? (t - D4) / (D5 - D4) : 1;
    S.wop = wop;
    o.rg.position.y = yR; o.wg.position.y = o.yw;
    o.cg.rotation.z = dl; o.sg.position.y = s;
    var st = t < D1 ? (yR > -20 ? "Lowering" : "Struck bottom") : t < D2 ? (o.free ? "Weight dropped" : "Struck bottom") : t < D3 ? "Hauling up" : "Ready";
    S.set("st", st);
    S.set("f", Math.round(s) + " mm");
    S.set("w", o.free ? (o.yw > -155 ? "Falling" : "On sea bed") : "Held");
  },
  opacity: function (key, S) { return key === "weight" && S.wop !== undefined ? S.wop : 1; }
});
