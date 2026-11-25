(function () {
  // Flat layout: the cog wheel is at the origin and turns anticlockwise. Two racks hang upright, one each side of the
  // wheel, on pivots at the two ends of a crosshead on the piston rod. Everything is worked out from one number, u: how
  // many teeth the wheel has turned since the piston was at the bottom. One whole cycle is K teeth.
  //   - The right rack is in mesh while the piston goes up, the left rack while it goes down. In mesh a rack moves
  //     exactly one tooth for each tooth of the wheel.
  //   - The racks are short. Each runs off the wheel just before the end of its working stroke, so the piston is free
  //     to turn round. Over the turn (W teeth either side of the end) its speed changes evenly from +1 to -1.
  //   - Each rack leans away from the wheel on its way back. The lean is a set function of u, and the guide groove is
  //     drawn along the path that the pin at the top of the rack then follows, so the pin always fits its groove.
  var RAD = Math.PI / 180, M = 3.5, N = 22, RP = N * M / 2, PT = Math.PI * M, K = 40, W = .5, NT = 13;
  var BODY = 12, PO = 1.25 * M + BODY / 2, XP = RP + PO;         // each pivot is in the middle of the bar behind the teeth, PO from the pitch line: pivots at x = -XP and +XP
  var D0 = 105, Y0 = -16.75 * PT - D0;                           // teeth start D0 above the pivot; pivot height with the piston at the bottom (puts a gap of each rack on a tooth of the wheel)
  var LP = D0 + NT * PT + 8, AX = 46, PINR = 3.5, GW = 4.3;      // the pin is LP above the pivot and AX out from it; pin radius; half width of the groove
  var PHM = 9 * RAD, RA = 4, RB = 2.5, E = 1.5, TS = 18.75, TR = 3;   // lean on the way back; how many teeth each change of lean takes
  var ROL = [-24, LP + 28], ROLR = 5;                            // roller on the right rack, from its pivot; radius
  var PC = [75, 250], ARM = [[0, 0], [-6.7, -64.7], [-46.8, -115.9]], AHT = 3, ATT = .25;   // bent lever: pivot; its long arm as a curve (start, pull point, tip) before it is turned to its rest; half thickness; where the spring pulls
  var SA = [138, 236];                                           // fixed end of the spring
  function sm(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function wrap(u) { u %= K; return u < 0 ? u + K : u; }
  function sigma(u) {                              // piston height in teeth above its lowest point
    u = wrap(u);
    if (u < W) return u * u / (2 * W);
    if (u <= K / 2 - W) return u - W / 2;
    if (u < K / 2 + W) return K / 2 - W - (u - K / 2) * (u - K / 2) / (2 * W);
    if (u <= K - W) return K - W / 2 - u;
    return (u - K) * (u - K) / (2 * W);
  }
  function rate(u) { u = wrap(u); return u < W ? u / W : u <= K / 2 - W ? 1 : u < K / 2 + W ? -(u - K / 2) / W : u <= K - W ? -1 : (u - K) / W; }   // piston speed in teeth per tooth of the wheel
  function leanL(u) {                              // left rack: swings out as it starts up, is steered back in by the top of its groove
    u = wrap(u);
    return u < RA ? PHM * sm(u / RA) : u < K / 2 - RB ? PHM : u < K / 2 ? PHM * (1 - sm((u - K / 2 + RB) / RB)) : 0;
  }
  function leanR(u) {                              // right rack: swings in as it starts up, is pushed out at the top by the bent lever
    u = wrap(u);
    return u < E ? PHM * (1 - sm(u / E)) : u < TS ? 0 : u < TS + TR ? PHM * sm((u - TS) / TR) : PHM;
  }
  function pivotY(u) { return Y0 + PT * sigma(u); }
  // A point given from a rack's pivot (x towards the wheel is +PO for the left rack, -PO for the right), where it is at u.
  function onRack(side, u, x, y) {
    var f = side < 0 ? leanL(u) : -leanR(u), cs = Math.cos(f), sn = Math.sin(f);
    return [side * XP + cs * x - sn * y, pivotY(u) + sn * x + cs * y];
  }
  function pin(side, u) { return onRack(side, u, side * AX, LP); }
  function rackOutline(side, u) {                  // the toothed part of a rack, the same shape P.rack builds
    var s = -side, p = [], i, rf = -1.25 * M, ra = .7 * M, L = NT * PT;
    function pt(x, y) { p.push(onRack(side, u, -side * PO + s * x, D0 + y)); }
    pt(rf, 0);
    for (i = 0; i < NT; i++) { var y = (i + .5) * PT; pt(rf, y - .27 * PT); pt(ra, y - .11 * PT); pt(ra, y + .11 * PT); pt(rf, y + .27 * PT); }
    pt(rf, L); pt(rf - BODY, L); pt(rf - BODY, 0);
    return p;
  }
  function gearOutline(u) {                        // the same shape P.spurGear builds, turned to where the wheel is at u
    var p = [], st = 2 * Math.PI / N, rf = RP - 1.25 * M, ra = RP + M, th = u * st;
    for (var i = 0; i < N; i++) { var a = th + i * st; [[rf, -.27], [ra, -.11], [ra, .11], [rf, .27]].forEach(function (q) { p.push([q[0] * Math.cos(a + q[1] * st), q[0] * Math.sin(a + q[1] * st)]); }); }
    return p;
  }
  function driving(side, u) {                      // true while a tooth of this rack is between the teeth of the wheel
    if ((side < 0 ? leanL(u) : leanR(u)) > 1e-6) return false;
    var y0 = pivotY(u) + D0;
    return y0 + .5 * PT < 1.7 * PT && y0 + (NT - .5) * PT > -1.7 * PT;
  }
  // The path of a pin over one cycle, as a closed list of points about 2 apart, anticlockwise. The sharp ends are kept.
  function locus(side) {
    var p = [], n = 4000, i, last = null, sharp = side < 0 ? [0, n / 2] : [0];
    for (i = 0; i < n; i++) {
      var q = pin(side, K * i / n), key = sharp.indexOf(i) >= 0;
      if (key) { while (p.length && !p[p.length - 1].key && Math.hypot(q[0] - p[p.length - 1][0], q[1] - p[p.length - 1][1]) < 1.2) p.pop(); }
      if (key || !last || Math.hypot(q[0] - last[0], q[1] - last[1]) >= (last.key ? 1.2 : 2)) { q.key = key; p.push(q); last = q; }
    }
    while (p.length > 3 && Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < 1.2) p.pop();
    var ar = 0; for (i = 0; i < p.length; i++) { var b = p[(i + 1) % p.length]; ar += p[i][0] * b[1] - b[0] * p[i][1]; }
    if (ar < 0) p.reverse();
    return p;
  }
  // The outline d outside (d > 0) or inside (d < 0) a closed anticlockwise path. Sharp outside corners are rounded.
  function offset(p, d) {
    var out = [], n = p.length, i;
    for (i = 0; i < n; i++) {
      var a = p[(i + n - 1) % n], b = p[i], c = p[(i + 1) % n];
      var l0 = Math.hypot(b[0] - a[0], b[1] - a[1]), l1 = Math.hypot(c[0] - b[0], c[1] - b[1]);
      var e0 = [(b[0] - a[0]) / l0, (b[1] - a[1]) / l0], e1 = [(c[0] - b[0]) / l1, (c[1] - b[1]) / l1];
      var n0 = [e0[1], -e0[0]], n1 = [e1[1], -e1[0]], turn = Math.atan2(e0[0] * e1[1] - e0[1] * e1[0], e0[0] * e1[0] + e0[1] * e1[1]);
      if (d > 0 && turn > .35) {
        var a0 = Math.atan2(n0[1], n0[0]), m = Math.ceil(turn / .25);
        for (var j = 0; j <= m; j++) out.push([b[0] + d * Math.cos(a0 + turn * j / m), b[1] + d * Math.sin(a0 + turn * j / m)]);
      } else {
        var k = d / (1 + n0[0] * n1[0] + n0[1] * n1[1]);
        out.push([b[0] + k * (n0[0] + n1[0]), b[1] + k * (n0[1] + n1[1])]);
      }
    }
    return out;
  }
  // Where an outline crosses itself (at the sharp ends of the island, where the two sides of the groove run together),
  // cut off the small loop and keep the rest.
  function uncross(p) {
    for (var pass = 0; pass < 40; pass++) {
      var n = p.length, hit = null, i, j;
      for (i = 0; i < n && !hit; i++) for (j = i + 2; j < n && !hit; j++) {
        if (i === 0 && j === n - 1) continue;
        var a = p[i], b = p[i + 1], c = p[j], d = p[(j + 1) % n], rx = b[0] - a[0], ry = b[1] - a[1], sx = d[0] - c[0], sy = d[1] - c[1], den = rx * sy - ry * sx;
        if (Math.abs(den) < 1e-12) continue;
        var t = ((c[0] - a[0]) * sy - (c[1] - a[1]) * sx) / den, v = ((c[0] - a[0]) * ry - (c[1] - a[1]) * rx) / den;
        if (t > 0 && t < 1 && v > 0 && v < 1) hit = [i, j, [a[0] + t * rx, a[1] + t * ry]];
      }
      if (!hit) break;
      p = hit[1] - hit[0] <= n / 2 ? p.slice(0, hit[0] + 1).concat([hit[2]], p.slice(hit[1] + 1)) : [hit[2]].concat(p.slice(hit[0] + 1, hit[1] + 1));
    }
    return p;
  }
  function groove(side) { var p = locus(side); return { path: p, slot: uncross(offset(p, GW)), island: uncross(offset(p, -GW)) }; }
  // The long arm of the bent lever as a list of points along its middle, from the pivot, before it is turned.
  function armLine() {
    var p = [], n = 16;
    for (var i = 0; i <= n; i++) { var t = i / n, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), cc = t * t; p.push([a * ARM[0][0] + b * ARM[1][0] + cc * ARM[2][0], a * ARM[0][1] + b * ARM[1][1] + cc * ARM[2][1]]); }
    return p;
  }
  var LINE = armLine();
  // How far the roller is from the lower right face of the arm when the lever is turned by psi (negative if it is inside the arm).
  function gap(c, psi) {
    var cs = Math.cos(-psi), sn = Math.sin(-psi), x = c[0] - PC[0], y = c[1] - PC[1], px = cs * x - sn * y, py = sn * x + cs * y, best = 1e9, sign = 1;
    for (var i = 0; i < LINE.length - 1; i++) {
      var a = LINE[i], b = LINE[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy)));
      var qx = a[0] + t * dx, qy = a[1] + t * dy, d = Math.hypot(px - qx, py - qy);
      if (d < best) { best = d; sign = dx * (py - qy) - dy * (px - qx) >= 0 ? 1 : -1; }
    }
    return sign * best - ROLR - AHT;
  }
  function roller(u) { return onRack(1, u, ROL[0], ROL[1]); }
  // The lever rests where its arm just touches the roller of a rack that is leaning right out at the top of the stroke.
  var REST = (function () { var c = roller(TS + TR), lo = -.6, hi = .6; for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (gap(c, m) > 0) lo = m; else hi = m; } return lo; })();
  function leverAngle(u) {                         // the spring holds the arm against its stop, unless the roller pushes it back
    var c = roller(u);
    if (gap(c, REST) >= 0) return REST;
    var lo = REST - 1.5, hi = REST; for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (gap(c, m) > 0) lo = m; else hi = m; }
    return lo;
  }
  function onLever(psi, q) { var cs = Math.cos(psi), sn = Math.sin(psi); return [PC[0] + cs * q[0] - sn * q[1], PC[1] + sn * q[0] + cs * q[1]]; }
  var PULL = LINE[Math.round(ATT * 16)], TAIL = [[0, 0], [-38, 4]];   // where the spring pulls the arm; the short arm of the lever (before turning)

  M507.define({
    number: 391,
    title: "Weighted racks turning a wheel",
    lede: "A piston rod goes up and down. Two toothed bars, called racks, ride on it, one each side of a gear. One rack turns the wheel on the way up and the other on the way down, so the wheel keeps turning the same way without a crank.",
    alt: "A gear with an upright toothed bar on each side of it. The two bars stand on pivots at the ends of a crosspiece on a piston rod, and each has a ball on a short arm at its foot. The left bar is upright with its teeth in the wheel. The right bar leans away from the wheel. A pin at the top of each bar sits in a looped groove in a fixed plate. A bent lever with a spring hangs above the right bar.",
    parts: [
      { key: "rod", color: "#5E7387", name: "Piston rod", note: "Steam in the cylinder under the floor pushes the piston up and down. The crosspiece on top of the rod carries the two racks." },
      { key: "wheel", color: "#C8873A", name: "Gear", note: "It is turned by whichever rack is in mesh. Watch the red dot. It always goes round the same way." },
      { key: "racks", color: "#D9B13B", name: "Racks", note: "Two toothed bars on pivots. The right one drives the wheel going up and the left one going down. The ball at the foot of each is a weight that tips the rack to the left. Watch the red pin at the top of each rack." },
      { key: "guides", color: "#4FA58A", name: "Guide grooves", note: "Two fixed plates, each with a looped groove. The pin of a rack runs up one side of its loop and down the other. One side holds the rack against the wheel and the other holds it clear." },
      { key: "lever", color: "#8E7AA8", name: "Bell crank and spring", note: "A lever bent at a corner, called a bell crank. A roller on the right rack pushes this lever back as the rack comes up. At the top the spring pulls the lever forward again, and the lever pushes the rack over to the far side of its groove." }
    ],
    speed: { min: 2, max: 30, value: 12, label: "Wheel speed", unit: " rpm" },
    closed: { label: "Cylinder" },
    readouts: [{ id: "drive", label: "Driving" }, { id: "v", label: "Piston" }],
    views: { "3d": [634, 227, 1355], front: [0, 10, 920], side: [920, 10, 0] },
    target: [0, -119, -5],
    how: [
      "Look at the wheel first. Its left side moves down and its right side moves up. So a rack on the right can push it round while rising, and a rack on the left can push it round while falling. That is what the two racks do, taking turns.",
      "A rack must stay out of the teeth on its way back, or it would turn the wheel the wrong way. The grooves see to that. The red pin of each rack runs round a loop. On one side of the loop the rack stands upright in the wheel. On the other side it leans clear. Each rack is short, so it runs off the wheel just before the piston turns round.",
      "The weights tip both racks to the left. For the left rack that is away from the wheel, and for the right rack it is towards it. So at the top the right rack needs a push to cross to the far side of its loop. The bell crank and its spring give that push. Change the wheel speed and watch one stroke slowly. Choose Closed to see the cylinder as it looks from outside."
    ],
    note: "This model is rebuilt from Brown's drawing. The tooth numbers, the sizes, the exact shape of the two grooves, the floor and the steam cylinder under it were made up. The drawing is hard to read where the bell crank meets the rack, so its shape, the roller it bears on, its stop and the place of the spring are a guess that works. The racks are shorter than in the drawing so that each one runs clear of the wheel at the end of its stroke. For a moment at each end no rack is in mesh. A real machine would need a heavy wheel to carry it over, and here the wheel is simply kept turning steadily.",

    kin: { K: K, PT: PT, sigma: sigma, leanL: leanL, leanR: leanR, pin: pin, rackOutline: rackOutline, gearOutline: gearOutline, groove: groove, driving: driving, leverAngle: leverAngle, roller: roller, gap: gap, REST: REST, PINR: PINR, pivotY: pivotY },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mr = c.mat("racks"), mg = c.mat("guides"), ml = c.mat("lever"), mp = c.mat("rod"), i;
      var o = this.o = { th: 27.85 * 2 * Math.PI / N, racks: [] };              // opens as drawn: left rack in mesh going down, right rack leaning out
      // cog wheel z -4..4 on a shaft from the board face (z -22)
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.spurGear({ teeth: N, module: M, width: 8, material: c.mat("wheel") }));
      P.at(P.cylZ(5, 18, c.mat("wheel")), 0, 0, -13, o.wheel);                   // shaft z -22..-4, board face to the back of the wheel
      P.at(P.cylZ(7, 1.5, c.mat("wheel", "dark")), 0, 0, 4.75, o.wheel);         // hub cap z 4..5.5, on the face
      P.at(P.cylZ(2.5, 1, c.mat("wheel", "mark")), RP - 12, 0, 4.5, o.wheel);    // red dot z 4..5, on the face
      // piston rod, crosshead and piston: one group that goes up and down. Group origin at the height of the two pivots.
      o.rod = new T.Group(); scene.add(o.rod);
      P.at(P.box(2 * XP + 16, 12, 9, mp), 0, 0, -9.5, o.rod);                    // crosshead x -57..57, y -6..6, z -14..-5 (behind the racks, z -4..4)
      P.at(P.cylY(4, 253.2, mp), 0, -6 - 126.6, -9.5, o.rod);                    // rod from the crosshead (y -6) down to the middle of the piston (y -259.2)
      P.at(P.cylY(22.5, 10, mp), 0, -259.2, -9.5, o.rod);                        // piston y -264.2..-254.2, radius 22.5 in a bore of 23
      // racks: each a group at its pivot. Toothed bar z -4..4.
      [-1, 1].forEach(function (side) {
        var g = new T.Group(); scene.add(g); o.racks.push(g);
        var rk = P.rack({ teeth: NT, module: M, side: -side, body: BODY, thick: 8, material: mr });
        P.at(rk, -side * PO, D0, 0, g);                                          // teeth from D0 to D0 + NT * PT above the pivot; bar x -6..6
        P.at(P.box(BODY, D0 + 8, 8, mr), 0, D0 / 2 - 4, 0, g);                   // plain foot of the bar y -8..D0, the same section as the toothed part
        P.at(P.box(BODY, 13, 8, mr), 0, D0 + NT * PT + 6.5, 0, g);               // plain top y D0 + NT * PT .. LP + 5
        P.at(P.cylZ(3.2, 20.5, c.mat("racks", "dark")), 0, 0, -4.25, g);         // pivot pin z -14.5..6: through the crosshead and the bar, half a unit proud at the back, 2 at the front
        P.at(P.box(AX, 7, 6, mr), side * (AX / 2 + 3), LP, 0, g);                // arm out to the pin, x 3..AX + 3, z -3..3
        P.at(P.cylZ(PINR, 26, c.mat("racks", "mark")), side * AX, LP, -8, g);    // red pin z -21..5: from inside the groove (plate z -22..-14) through the arm, 2 proud at the front
        if (side < 0) {
          P.at(P.box(56, 6, 6, mr), -34, -3, 0, g);                              // weight arm x -62..-6, z -3..3
          P.at(P.sphere(9, c.mat("racks", "dark")), -62, -3, 0, g);              // ball
        } else {
          P.at(P.box(52, 6, 4, mr), -26, 8, 6, g);                               // weight arm x -52..0, y 5..11, z 4..8, on the front face of the bar, above the pivot pin
          P.at(P.sphere(8, c.mat("racks", "dark")), -52, 8, 6, g);               // ball z -2..14, clear of the crosshead (front face z -5)
          g.add(P.outlinePlate({ points: P.strokeOutline([[0, LP - 4], [ROL[0], ROL[1]]], 7), depth: 3, z0: 4, material: mr }));   // bracket z 4..7 up to the roller
          P.at(P.cylZ(ROLR, 5, c.mat("racks", "dark")), ROL[0], ROL[1], 9.5, g); // roller z 7..12
        }
      });
      // guide plates z -22..-14 on the board face, each with a looped slot and the island left inside the loop
      [-1, 1].forEach(function (side) {
        var gr = groove(side), xs = gr.slot.map(function (q) { return q[0]; }), ys = gr.slot.map(function (q) { return q[1]; });
        var x0 = Math.min.apply(null, xs) - 9, x1 = Math.max.apply(null, xs) + 9, y0 = Math.min.apply(null, ys) - 9, y1 = Math.max.apply(null, ys) + 9;
        scene.add(P.outlinePlate({ points: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], holes: [gr.slot], depth: 8, z0: -22, material: mg }));
        scene.add(P.outlinePlate({ points: gr.island, depth: 8, z0: -22, material: mg }));
      });
      // bent lever z 7.5..11.5 on a post from the board; long curved arm and short arm in one group
      o.lever = new T.Group(); o.lever.position.set(PC[0], PC[1], 0); scene.add(o.lever);
      o.lever.add(P.outlinePlate({ points: P.strokeOutline(LINE, 2 * AHT), depth: 4, z0: 7.5, material: ml }));
      o.lever.add(P.outlinePlate({ points: P.strokeOutline(TAIL, 2 * AHT), depth: 3, z0: 8, material: ml }));   // short arm z 8..11, thinner so its faces are not level with the long arm's
      P.at(P.cylZ(6, 5, ml), 0, 0, 9.5, o.lever);                                // boss z 7..12
      P.at(P.cylZ(1.8, 9.5, c.mat("lever", "dark")), PULL[0], PULL[1], 16.25, o.lever);   // pin z 11.5..21 on the face of the arm; the end of the spring goes round it
      P.at(P.cylZ(3, 29, c.fixed), PC[0], PC[1], -7.5, scene);                   // post z -22..7, board face to the back of the boss
      var tip = onLever(REST, TAIL[1]);
      P.at(P.cylZ(2.5, 33.5, c.fixed), tip[0] + 3, tip[1] - AHT - 2.5, -5.25, scene);   // stop pin z -22..11.5 under the end of the short arm when the lever is at rest
      P.at(P.cylZ(2.5, 43, c.fixed), SA[0], SA[1], -.5, scene);                  // spring post z -22..21; the other end of the spring goes round it
      o.spring = P.spring({ radius: 3.5, wire: .9, turns: 9, length: 60, material: c.mat("lever", "light") }); o.spring.position.set(SA[0], SA[1], 16.5); scene.add(o.spring);   // coil z 12.1..20.9, in front of the lever (z up to 12)
      // board, floor and steam cylinder
      P.at(P.box(330, 590, 6, c.fixed), 0, Y0 - 20.8 + 295, -25, scene);         // board y Y0 - 20.8 (floor top) .. +590, z -28..-22
      var fl = P.guideBlock({ w: 350, h: 14, d: 100, hole: 4.6, hx: 0, hz: -9.5, material: c.fixed }); P.at(fl, 0, Y0 - 27.8, 0, scene);   // floor y Y0 - 34.8 .. Y0 - 20.8, with a hole for the rod
      var cyl = c.shell(P.steamCylinder({ radius: 26, length: 240, wall: 3, hole: 4.6, material: c.fixed })); P.at(cyl, 0, Y0 - 34.8, -9.5, scene);   // cylinder hangs under the floor: top face on the floor's underside
    },

    step: function (c, dt, S) {
      var o = this.o; o.th += S.w * dt;
      var u = wrap(o.th * N / (2 * Math.PI)), y = pivotY(u);
      o.wheel.rotation.z = o.th;
      o.rod.position.y = y;
      o.racks[0].position.set(-XP, y, 0); o.racks[0].rotation.z = leanL(u);
      o.racks[1].position.set(XP, y, 0); o.racks[1].rotation.z = -leanR(u);
      var psi = leverAngle(u), q = onLever(psi, PULL), dx = q[0] - SA[0], dy = q[1] - SA[1];
      o.lever.rotation.z = psi;
      o.spring.rotation.z = Math.atan2(dy, dx); o.spring.setLength(Math.hypot(dx, dy));
      S.set("drive", driving(1, u) ? "Right rack" : driving(-1, u) ? "Left rack" : "Neither");
      var v = Math.round(rate(u) * S.w * RP);
      S.set("v", (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " mm/s");
    }
  });
})();
