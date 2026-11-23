M507.define({
  number: 145,
  title: "Beam, crank and flywheel",
  lede: "A beam rocks up and down, and through a chain of rods it makes a crank and heavy wheel spin round and round. A short lever on a small post keeps the joint in the chain on a steady path. This is how a rocking motion becomes a smooth turning one.",
  alt: "A big four-spoked flywheel at the left with a short crank arm on its face. A long rod runs from the crank pin to the right, ending at a joint. A short lever pivots on a small post at the right of that joint. An upright rod rises from the joint to the left end of a flat beam at the top, which pivots at its right end.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Flywheel and crank", note: "A heavy four-spoked wheel with a short arm, the crank, on its face. The weight of the wheel keeps it turning smoothly." },
    { key: "beam", color: "#C8873A", name: "Beam", note: "A flat arm that rocks up and down on a pivot at its right end. Its left end pulls and pushes the upright rod." },
    { key: "rods", color: "#D9B13B", name: "Rods", note: "Two thin bars. One hangs from the beam. The other joins the crank pin to the same joint at the bottom." },
    { key: "lever", color: "#4FA58A", name: "Lever and post", note: "A short lever that turns on a small post. Its free end is the joint where the two rods meet, so that joint can only swing on a small arc." },
    { key: "joint", color: "#C2503F", name: "Joint", note: "The pin where the lever and both rods meet. Watch it swing up and down on its arc." }
  ],
  controls: [{ id: "r", label: "Crank arm", value: "48", options: [["28", "Short"], ["38", "Medium"], ["48", "Long"]] }],
  readouts: [{ id: "b", label: "Beam tilt" }, { id: "l", label: "Lever tilt" }, { id: "w", label: "Wheel" }],
  views: { "3d": [420, 200, 1050], front: [30, 40, 1200], side: [1000, 40, 0] },
  target: [40, 15, 0],
  how: [
    "The beam rocks. Its left end moves a thin rod up and down. The rod moves a joint, and a long bar from that joint pulls the crank pin round the wheel's shaft.",
    "The joint is also held by a short lever on a small post. The lever makes the joint swing on a small arc, so the long bar always pushes the crank in a sensible direction. The crank goes right round, and the heavy wheel carries it past the stiff spots.",
    "Try a short crank arm, then the long one. A longer arm makes the joint swing higher and the beam rock further. Watch the tilt readings."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the lever flat. Here it tilts up a little at the start so the rods can turn the crank all the way round. The post for the lever, the post for the beam pivot, the base, the bearing behind the wheel, the shaft, the pins and all the sizes were made up. The shorter crank arms were added for comparison.",

  K: { HX: -150, HY: -90, SX: 313, BX: 373, BY: 282, L2: 153, L1: 212, LB: 213, LR: 277 },

  // circle intersection: point at distance ra from A and rb from B, the one nearest prev
  ci: function (A, ra, B, rb, prev) {
    var dx = B[0] - A[0], dy = B[1] - A[1], d = Math.sqrt(dx * dx + dy * dy);
    if (d > ra + rb) { rb = d - ra; } else if (d < Math.abs(ra - rb)) { return prev; }
    var a = (ra * ra - rb * rb + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ra * ra - a * a));
    var mx = A[0] + a * dx / d, my = A[1] + a * dy / d;
    var p = [mx + h * dy / d, my - h * dx / d], q = [mx - h * dy / d, my + h * dx / d];
    var dp = Math.hypot(p[0] - prev[0], p[1] - prev[1]), dq = Math.hypot(q[0] - prev[0], q[1] - prev[1]);
    return dp < dq ? p : q;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { a: 0, J: [160, 40], B: [160, 277] };
    var HX = K.HX, HY = K.HY, SX = HX + K.SX, SY = HY, BX = HX + K.BX, BY = HY + K.BY;
    function bar(parent, key, z, h) {
      var g = new T.Group(); parent.add(g);
      g.bar = P.at(P.box(1, h, 6, c.mat(key)), 0, 0, z, g);
      g.e1 = P.at(P.cylZ(11, 6, c.mat(key)), 0, 0, z, g);
      g.e2 = P.at(P.cylZ(11, 6, c.mat(key)), 0, 0, z, g);
      return g;
    }
    // flywheel: rim z -7..7, hub z -10..10, shaft z -60..10, crank arm z 10..16, pin z 16..27, cap z 27..30
    o.wheel = new T.Group(); o.wheel.position.set(HX, HY, 0); scene.add(o.wheel);
    o.wheel.add(P.pulley({ radius: 145, width: 14, rim: 10, spokes: 4, hub: 18, material: c.mat("wheel") }));
    P.at(P.cylZ(24, 20, c.mat("wheel")), 0, 0, 0, o.wheel);
    P.at(P.cylZ(11, 68, c.mat("wheel", "dark")), 0, 0, -26, o.wheel);   // shaft z -60..8, end inside the hub
    o.crank = P.at(P.box(1, 12, 6, c.mat("wheel")), 0, 0, 13, o.wheel);
    o.cp = new T.Group(); o.cp.position.set(0, 0, 0); o.wheel.add(o.cp);
    P.at(P.cylZ(5, 11, c.mat("wheel")), 0, 0, 21.5, o.cp);
    P.at(P.cylZ(8, 3, c.mat("wheel")), 0, 0, 28.5, o.cp);
    // coupler z 18..24 (crank pin to joint)
    o.coupler = bar(scene, "rods", 21, 16);
    // lever z 24..30 (post pivot to joint)
    o.lever = bar(scene, "lever", 27, 16);
    o.lever.e2.visible = true;
    // upright rod z 30..36 (joint to beam end)
    o.rod = bar(scene, "rods", 33, 14);
    // joint pin z 18..37, cap z 37..40... drawn at the joint
    o.jp = new T.Group(); scene.add(o.jp);
    P.at(P.cylZ(5, 20, c.mat("joint", "mark")), 0, 0, 27, o.jp);       // z 17..37
    P.at(P.cylZ(8, 3, c.mat("joint", "mark")), 0, 0, 38.5, o.jp);        // cap z 37..40
    // beam z 36..42 on its pivot, local +x toward the left end
    o.beam = bar(scene, "beam", 39, 22);
    o.beam.position.set(BX, BY, 0);
    o.beam.bar.scale.x = K.LB; o.beam.bar.position.x = K.LB / 2; o.beam.e2.position.x = K.LB;
    o.beam.e1.scale.set(2, 2, 1);
    P.at(P.cylZ(5, 14, c.mat("beam")), K.LB, 0, 36, o.beam);             // pin z 29..43 at the rod end
    o.bp = P.at(P.cylZ(8, 3, c.mat("beam")), 0, 0, 44.5, scene);
    o.bp.position.set(BX, BY, 44.5);
    P.at(P.cylZ(8, 3, c.mat("beam", "dark")), K.LB, 0, 44.5, o.beam);    // cap z 43..46
    o.beam.position.set(BX, BY, 0);
    // lever pivot pin on its post, cap
    P.at(P.cylZ(5, 6, c.mat("lever")), SX, SY, 27, scene);               // z 24..30 (post face z 24)
    P.at(P.cylZ(8, 3, c.mat("lever")), SX, SY, 31.5, scene);             // cap z 30..33
    P.at(P.cylZ(8, 12, c.mat("beam")), BX, BY, 36, scene);               // beam pivot shaft z 30..42
    // supports
    P.at(P.box(40, 165, 14, c.fixed), SX, -162.5, 17, scene);            // lever post x 143..183, y -245..-80, z 10..24
    P.at(P.box(40, 445, 10, c.fixed), BX, -22.5, 25, scene);             // beam post x 203..243, y -245..200, z 20..30
    P.at(P.box(60, 200, 20, c.fixed), HX, -145, -70, scene);             // bearing x -180..-120, y -245..-45, z -80..-60
    P.at(P.box(560, 12, 140, c.fixed), 30, -251, -20, scene);            // base x -250..310, y -257..-245, z -90..50
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, R = +(S.controls.r || 48), HX = K.HX, HY = K.HY;
    o.a += S.w * dt;
    var th = Math.PI + o.a, cs = Math.cos(th), sn = Math.sin(th);
    var Pp = [R * cs, R * sn], Sp = [K.SX, 0], Bp = [K.BX, K.BY];
    var J = this.ci(Pp, K.L1, Sp, K.L2, o.J); o.J = J;
    var B = this.ci(J, K.LR, Bp, K.LB, o.B); o.B = B;
    o.wheel.rotation.z = th;
    o.crank.scale.x = R; o.crank.position.x = R / 2;
    o.cp.position.x = R;
    function place(g, ax, ay, bx, by) {
      var dx = bx - ax, dy = by - ay, L = Math.sqrt(dx * dx + dy * dy);
      g.position.set(HX + ax, HY + ay, 0); g.rotation.z = Math.atan2(dy, dx);
      g.bar.scale.x = L; g.bar.position.x = L / 2; g.e2.position.x = L;
    }
    place(o.coupler, Pp[0], Pp[1], J[0], J[1]);
    place(o.lever, K.SX, 0, J[0], J[1]);
    place(o.rod, J[0], J[1], B[0], B[1]);
    o.jp.position.set(HX + J[0], HY + J[1], 0);
    var ba = Math.atan2(B[1] - K.BY, B[0] - K.BX);
    o.beam.rotation.z = ba;
    var bt = 180 - ba * 180 / Math.PI, lt = Math.atan2(J[1], K.SX - J[0]) * 180 / Math.PI;
    function sg(n, u, d) { return (n < -0.5 * Math.pow(10, -d) ? "−" : n > 0.5 * Math.pow(10, -d) ? "+" : "") + Math.abs(n).toFixed(d) + u; }
    S.set("b", sg(bt, "°", 0)); S.set("l", sg(lt, "°", 0)); S.set("w", sg(S.rpm || 0, " rpm", 0));
  }
});
