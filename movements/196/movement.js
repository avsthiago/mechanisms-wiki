M507.define({
  number: 196,
  title: "Pinion and swinging wheel arm",
  lede: "A small gear, called a pinion, turns in one place. A lumpy gear rests on it, held up by an arm. As the gear turns, its bumps roll over the small gear and lift the arm up and down in an uneven way.",
  alt: "A small round gear low on the left. Above it a gear with two bumps of different size rests on it. The gear turns on the end of a long arm whose other end is hinged to a post on a block at the right.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "A small gear, called a pinion. It turns at a steady speed on a shaft that never moves. It drives the lumpy gear." },
    { key: "driven", color: "#C8873A", name: "Lumpy driven gear", note: "A gear with one big bump and one small one. Its weight keeps its teeth in the small gear. Watch its red stripe, which points along the big bump." },
    { key: "arm", color: "#D9B13B", name: "Arm", note: "Carries the lumpy gear on its free end and swings on a pin in the post. It rises and falls as the gear turns." }
  ],
  readouts: [{ id: "arm", label: "Arm" }, { id: "wheel", label: "Gear" }],
  views: { "3d": [330, 200, 640], front: [80, 80, 720], side: [740, 80, 0] },
  target: [80, 80, 0],
  how: [
    "The small gear turns steadily. Its teeth drive the lumpy gear the other way. The gear sits on the end of the arm, so it can move up and down. Watch the arm rise and fall.",
    "The lumpy gear is held on the small gear by its own weight. When a big bump rolls over the small gear, the lumpy gear's centre has to be far from the small gear, so the arm is pushed up. When a narrow part comes round, the arm drops. The lumpy gear also speeds up and slows down, because the small gear has to work its way round long bumps and short sides.",
    "Watch the Arm readout through one turn of the lumpy gear. Notice it rises twice, once high and once low. Then slow the speed right down and follow the big bump past the small gear."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the outline of the lumpy gear; its exact shape, the sizes and the number of teeth were made up so the teeth stay in mesh all the way round. The arm is assumed to rest on the small gear by its weight. The shaft stand behind the small gear and the floor were added to hold it up.",

  /* Wheel pitch curve r(a) = sum of H[k] cos k(a - 20deg): a long bump at 20 degrees (radius 141), a waist either side
     (52) and a rounder end opposite (64), fitted to Brown's outline. Its tightest hollow curves with radius 49, more than
     the pinion's 28, so the pinion can roll into it.
     Kinematics, tabled once in build: when the gear touches the pinion at curve point i, the pinion centre sits at
     Q(i) = point + rB * outward normal in the gear's frame. The gear centre is where a circle of radius |Q| round the
     pinion meets the arm's circle round the pivot (upper crossing); the gear's turn makes Q point at the pinion. Rolling
     without slip: pinion angle = contact direction + (arc length along the gear) / rB + half a tooth.
     Checked in node over a full wheel turn: pinion angle always rises, teeth never overlap, the gear's teeth stay 88 from the
     pivot and clear of the block and floor, and the arm swings between about 1 and 23 degrees above level. */
  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, n = 1440, NA = 30, NB = 10, H = [72.63, 25.31, 25.33, 12.49, 4.89, 0.88], al0 = 20 * Math.PI / 180, i, j;
    var pts = [], cum = [0];
    for (i = 0; i < n; i++) { var a = 2 * Math.PI * i / n, r = 0; for (j = 0; j < H.length; j++) r += H[j] * Math.cos(j * (a - al0)); pts.push([r * Math.cos(a), r * Math.sin(a)]); }
    for (i = 0; i < n; i++) { var p = pts[i], q = pts[(i + 1) % n]; cum.push(cum[i] + Math.hypot(q[0] - p[0], q[1] - p[1])); }
    var L = cum[n], MD = L / NA / Math.PI, rB = NB * MD / 2;
    function Q(i) {
      var p = pts[(i + n - 1) % n], q = pts[(i + 1) % n], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      return [pts[i][0] + (q[1] - p[1]) / l * rB, pts[i][1] - (q[0] - p[0]) / l * rB];
    }
    // opening state as drawn: the pinion almost straight below the gear centre, the big bump up and to the right
    var i0 = 0, best = 9;
    for (i = 0; i < n; i++) { var qq = Q(i), e = Math.abs(Math.atan2(qq[1], qq[0]) + 92 * Math.PI / 180); if (e < best) { best = e; i0 = i; } }
    var q0 = Q(i0), La = 236, O = [-q0[0] + La * Math.cos(-2 * Math.PI / 180), -q0[1] + La * Math.sin(-2 * Math.PI / 180)];
    var OB = Math.hypot(O[0], O[1]), ex = O[0] / OB, ey = O[1] / OB, tab = [], prevG = null, s = 0;
    for (j = 0; j <= n; j++) {
      i = (i0 + j) % n;
      var Qi = Q(i), d = Math.hypot(Qi[0], Qi[1]), x = (d * d - La * La + OB * OB) / (2 * OB), h = Math.sqrt(Math.max(0, d * d - x * x));
      var A = [x * ex - h * ey, x * ey + h * ex];                               // upper crossing (pivot is to the right)
      var g = Math.atan2(-A[1], -A[0]) - Math.atan2(Qi[1], Qi[0]);
      if (prevG !== null) g += 2 * Math.PI * Math.round((prevG - g) / (2 * Math.PI));
      prevG = g;
      var C = [A[0] + Math.cos(g) * pts[i][0] - Math.sin(g) * pts[i][1], A[1] + Math.sin(g) * pts[i][0] + Math.cos(g) * pts[i][1]];
      var lam = Math.atan2(C[1], C[0]);
      if (j) { var pp = pts[(i + n - 1) % n]; s += Math.hypot(pts[i][0] - pp[0], pts[i][1] - pp[1]); lam = tab[j - 1].lam + Math.atan2(Math.sin(lam - tab[j - 1].lam), Math.cos(lam - tab[j - 1].lam)); }
      tab.push({ x: A[0], y: A[1], g: g, lam: lam, phi: lam + (cum[i0] + s) / rB + Math.PI / NB });
    }
    var o = this.o = { tab: tab, O: O, La: La, n: n, phi: tab[0].phi };
    o.period = tab[n].phi - tab[0].phi;                                         // pinion turn for one wheel turn: NA / NB turns
    o.turn = tab[n].g - tab[0].g;                                               // -2 pi

    // pinion at the origin: gear z -8..8, shaft z -31..12 (runs through the bearing, back face z -31), hub z 8..12
    o.pin = new T.Group(); scene.add(o.pin);
    o.pin.add(P.spurGear({ teeth: NB, module: MD, width: 16, material: c.mat("drive") }));
    P.at(P.cylZ(5, 43, c.mat("drive")), 0, 0, -9.5, o.pin);                    // shaft z -31..12
    P.at(P.cylZ(9, 4, c.mat("drive")), 0, 0, 10, o.pin);                       // hub z 8..12
    P.at(P.box(rB - 1.25 * MD - 12, 4, 1, c.mat("drive", "dark")), 9 + (rB - 1.25 * MD - 12) / 2, 0, 9, o.pin);   // dark stripe z 8.5..9.5, off the face (z 8)
    var bb = P.bearingBlock({ bore: 5.6, outer: 13, post: 22, width: 14, drop: 45, material: c.fixed });
    P.at(bb, 0, 0, -24, scene);                                                 // bearing z -31..-17, foot y -45 on the floor; gear back face z -8 clear

    // lumpy gear: turns on a pin in the arm's end. Wheel z -8..8, hub z 8..12
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(P.noncircularGear({ points: pts, teeth: NA, phase: 0, width: 16, material: c.mat("driven") }));
    P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 10, o.wheel);                   // hub z 8..12
    var big = 141 - 1.25 * MD - 14, st = P.box(big, 5, 1, c.mat("driven", "mark"));
    st.position.set(Math.cos(al0) * (11 + big / 2), Math.sin(al0) * (11 + big / 2), 9); st.rotation.z = al0; o.wheel.add(st);   // red stripe z 8.5..9.5 along the big bump

    // arm: pivot at O, wheel end at -La along local x. Bar z 12..20 (in front of the hub at z 12)
    o.arm = new T.Group(); o.arm.position.set(O[0], O[1], 0); scene.add(o.arm);
    P.at(P.box(La, 14, 8, c.mat("arm")), -La / 2, 0, 16, o.arm);               // bar x -236..0, z 12..20
    P.at(P.cylZ(11, 8, c.mat("arm")), 0, 0, 16, o.arm);                        // pivot boss z 12..20
    P.at(P.cylZ(11, 8, c.mat("arm")), -La, 0, 16, o.arm);                      // wheel boss z 12..20
    P.at(P.cylZ(4.5, 33, c.mat("arm")), 0, 0, 6.5, o.arm);                     // pivot pin z -10..23: through the post's bore, from its back face
    P.at(P.cylZ(4.5, 30, c.mat("arm")), -La, 0, 8, o.arm);                     // wheel pin z -7..23, its back end hidden inside the gear
    P.at(P.cylZ(7, 3, c.mat("arm")), 0, 0, 21.5, o.arm);                       // caps z 20..23
    P.at(P.cylZ(7, 3, c.mat("arm")), -La, 0, 21.5, o.arm);

    // supports. Block top y 10; post (bearing) z -10..10 behind the arm (arm back face z 12)
    var post = P.bearingBlock({ bore: 5, outer: 15, post: 26, width: 20, drop: O[1] - 10, material: c.fixed });
    P.at(post, O[0], O[1], 0, scene);                                           // foot y 10, on the block top
    P.at(P.box(120, 55, 60, c.fixed), O[0], -17.5, 0, scene);                   // block x O-60..O+60 (179..299), y -45..10, z -30..30
    P.at(P.box(450, 12, 70, c.fixed), 85, -51, -15, scene);                    // floor x -140..310, y -57..-45, z -50..20; block and bearing stand on y -45
  },

  step: function (c, dt, S) {
    var o = this.o, t = o.tab;
    o.phi += S.w * dt;
    var u = o.phi - t[0].phi, k = Math.floor(u / o.period), v = t[0].phi + u - k * o.period, lo = 0, hi = o.n;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (t[mid].phi <= v) lo = mid; else hi = mid; }
    var a = t[lo], b = t[lo + 1], f = (v - a.phi) / (b.phi - a.phi);
    var x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f, g = a.g + (b.g - a.g) * f + k * o.turn;
    o.pin.rotation.z = o.phi;
    o.wheel.position.set(x, y, 0); o.wheel.rotation.z = g;
    o.arm.rotation.z = Math.atan2(o.O[1] - y, o.O[0] - x);                     // local -x points from the pivot to the gear
    var deg = Math.round(Math.atan2(y - o.O[1], o.O[0] - x) * 180 / Math.PI);
    S.set("arm", (deg < 0 ? "−" + -deg : deg) + "° up");
    var w = S.playing ? S.rpm * (b.g - a.g) / (b.phi - a.phi) : 0;
    w = Math.round(w * 10) / 10;
    S.set("wheel", (w < 0 ? "−" + -w : w) + " rpm");
  }
});
