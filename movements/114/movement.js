M507.define({
  number: 114,
  title: "Part-toothed pinion and two racks",
  lede: "A small gear, called a pinion, with teeth on only part of its rim turns round and round. It pushes a frame one way, rests a moment, then pushes it back the other way. A steady turn becomes a push, rest, pull, rest.",
  alt: "An oval ring-shaped frame with round ends, with a row of gear teeth along the straight inside of its top and another along its bottom. Inside it a small gear turns, with teeth on only part of its rim. A rod sticks out of each end of the frame and slides through a post.",
  parts: [
    { key: "gear", color: "#5E7387", name: "Part-toothed pinion", note: "A small gear with teeth on only part of its rim. It turns all the time. Watch the red stripe to count its turns." },
    { key: "frame", color: "#C8873A", name: "Rack frame", note: "A frame with a row of teeth along the inside of its top edge and another along its bottom edge. Each row is called a rack." },
    { key: "rod", color: "#D9B13B", name: "End rods", note: "Two rods fixed to the ends of the frame. They slide through the posts and keep the frame moving in a straight line." }
  ],
  controls: [{ id: "k", label: "Teeth on the pinion", value: "7", options: [["5", "5 teeth"], ["6", "6 teeth"], ["7", "7 teeth"]] }],
  readouts: [{ id: "turns", label: "Pinion" }, { id: "pos", label: "Frame" }],
  views: { "3d": [410, 190, 600], front: [20, 0, 880], side: [880, 0, 0] },
  target: [20, 0, 0],
  distance: [300, 1800],
  how: [
    "The pinion turns clockwise all the time. First its teeth meet the top row. The top of a clockwise wheel moves right, so the frame is pushed right.",
    "Then the last tooth leaves the top row and the frame stops. The smooth part of the rim passes by without touching anything. Half a turn later the first tooth meets the bottom row. The bottom of the wheel moves left, so the frame is pushed back left. Then it rests again.",
    "Each tooth on the pinion moves the frame one tooth along. Try 5 teeth, then 7, and watch how far the frame travels."
  ],
  note: "This model is rebuilt from Brown's drawing. The teeth cover less than half of the pinion's rim, so that one row lets go before the other row is reached; otherwise the frame would jam. The posts, the base, the plate behind, the end rods, the sizes and the number of teeth were made up. The choice of 5, 6 or 7 teeth was added for comparison.",

  // Pinion: module 4, 20 teeth, pitch radius 40, centre at the origin, turning clockwise seen from the front.
  // Tooth 0 is the leading tooth; teeth 0..k-1 are cut. Racks sit on pitch lines y = +40 and y = -40.
  K: function () {
    var MD = 4, N = 20, rp = 40, ra = rp + MD, st = 2 * Math.PI / N, p = Math.PI * MD;
    var dm = Math.acos((rp - .7 * MD) / ra);             // a tooth tip is in the band of rack teeth within this angle of top or bottom
    var KMAX = 7, ext = ra + 3;                         // racks reach this far past the pinion's edge, so the round ends never touch it
    var X1 = -rp * dm, X2max = rp * ((KMAX - 1) * st + dm);
    var m = Math.ceil((ext + X2max) / p), n = m + Math.ceil((ext - X1) / p) + 1;   // rack teeth before and after the gap at x = 0
    return { MD: MD, N: N, rp: rp, ra: ra, st: st, p: p, dm: dm, X1: X1, X2max: X2max, m: m, n: n, ph1: -Math.PI / 2 - dm, BODY: 12 };
  },
  // Frame position for pinion angle phi (clockwise): rises while the top row is engaged, rests, falls while the bottom row is engaged, rests.
  pos: function (K, k, phi) {
    var span = (k - 1) * K.st + 2 * K.dm, ph = (phi - K.ph1) % (2 * Math.PI); if (ph < 0) ph += 2 * Math.PI;
    var X2 = K.X1 + K.rp * span;
    if (ph < span) return K.X1 + K.rp * ph;
    if (ph < Math.PI) return X2;
    if (ph < Math.PI + span) return X2 - K.rp * (ph - Math.PI);
    return K.X1;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K(), i;
    var o = this.o = { K: K, phi: 0, X: 0, gears: {} };
    var m = K.m, n = K.n, p = K.p, rp = K.rp, MD = K.MD, B = K.BODY;
    var HO = rp + 1.25 * MD + B;                                       // frame outer half height: 57
    // pinion: z -8..8, hub z 8..12, shaft z -30 (plate face) .. 8
    o.gearG = new T.Group(); scene.add(o.gearG);
    [5, 6, 7].forEach(function (k) {
      var g = P.partGear({ teeth: K.N, module: MD, width: 16, fromDeg: -.5, toDeg: (k - 1) * 18 + .5, material: c.mat("gear") });
      o.gearG.add(g); o.gears[k] = g;
    });
    P.at(P.cylZ(6, 38, c.mat("gear")), 0, 0, -11, o.gearG);              // shaft z -30..8
    P.at(P.cylZ(9, 4, c.mat("gear")), 0, 0, 10, o.gearG);                // hub z 8..12
    P.at(P.box(18, 4, 1, c.mat("gear", "mark")), 0, 21, 9, o.gearG).rotation.z = Math.PI / 2;   // red stripe y 12..30, z 8.5..9.5, off the face
    // frame: one flat piece z -8..8. Racks run along x from -m*p to (n-m)*p; end bars touch their end faces.
    o.frame = new T.Group(); scene.add(o.frame);
    var top = P.rack({ teeth: n, module: MD, side: 1, body: B, thick: 16, material: c.mat("frame") });
    P.at(top, -m * p, rp, 0, o.frame).rotation.z = -Math.PI / 2;         // teeth point down: roots y 45, tips y 37.2, body to y 57
    var bot = P.rack({ teeth: n, module: MD, side: -1, body: B, thick: 16, material: c.mat("frame") });
    P.at(bot, -m * p, -rp, 0, o.frame).rotation.z = -Math.PI / 2;        // teeth point up: roots y -45, tips y -37.2, body to y -57
    var xl = -m * p, xr = (n - m) * p;
    // round ends: half rings z -8..8, outer radius 57, inner radius 45, centred on the rack ends; their end faces (x = xl or xr, y 45..57) are the racks' end faces
    function endCap(left) {
      var sh = new T.Shape(), a0 = left ? Math.PI / 2 : -Math.PI / 2, a1 = a0 + Math.PI, ri = rp + 1.25 * MD;
      sh.absarc(0, 0, HO, a0, a1, false); sh.absarc(0, 0, ri, a1, a0, true); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, -8);
      var mm = new T.Mesh(g, c.mat("frame")); mm.position.set(left ? xl : xr, 0, 0); o.frame.add(mm);
    }
    endCap(true); endCap(false);
    var LR = K.X2max - K.X1 + 6;
    P.at(P.cylX(4, LR, c.mat("rod")), xl - HO + 2 - LR / 2, 0, 0, o.frame);   // left rod, from just inside the ring's outer point x xl-57
    P.at(P.cylX(4, LR, c.mat("rod")), xr + HO - 2 + LR / 2, 0, 0, o.frame);   // right rod
    // posts: x centre 8 thick, z -10..10, resting on the base top y -70, window y -6..6, z -5..5 for the rod (r 4)
    var pl = K.X1 + xl - HO - 6, pr = K.X2max + xr + HO + 6;   // posts clear of the ring at both ends of travel
    [pl, pr].forEach(function (x) {
      P.at(P.box(8, 64, 20, c.fixed), x, -38, 0, scene);                // y -70..-6
      P.at(P.box(8, 76, 20, c.fixed), x, 44, 0, scene);                 // y 6..82
      P.at(P.box(8, 12, 5, c.fixed), x, 0, 7.5, scene);                 // cheek z 5..10
      P.at(P.box(8, 12, 5, c.fixed), x, 0, -7.5, scene);                // cheek z -10..-5
    });
    var W = pr - pl + 60, cx = (pl + pr) / 2;
    P.at(P.box(W, 10, 80, c.fixed), cx, -75, -20, scene);              // base y -80..-70, z -60..20
    P.at(P.box(W, 150, 10, c.fixed), cx, 5, -35, scene);               // plate y -70..80, z -40..-30; shaft ends on its face
    o.pl = pl; o.pr = pr;
    this.place(o, 7);
    o.phi = K.ph1 + .4 * (6 * K.st + 2 * K.dm);                          // open while the top row is pushing
  },

  place: function (o, k) {
    var kk; for (kk in o.gears) o.gears[kk].visible = +kk === k;
    o.gearG.rotation.z = -o.phi;
    o.X = this.pos(o.K, k, o.phi);
    o.frame.position.x = o.X;
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, k = +S.controls.k || 7;
    o.phi += S.w * dt;
    this.place(o, k);
    function f(v) { v = Math.round(v * 10) / 10; return v < 0 ? "−" + -v : String(v); }
    S.set("turns", f(o.phi / (2 * Math.PI)) + " turns");
    S.set("pos", Math.round(o.X - K.X1) + " mm");
  }
});
