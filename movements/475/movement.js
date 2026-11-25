M507.define({
  number: 475,
  title: "Bilge ejector",
  lede: "A pump with no moving parts. A fast jet of steam blows up through a round chamber and drags water along with it. It was used to empty the dirty water from the bottom of a ship.",
  alt: "A bulging round chamber cut open down the middle, with a pipe going down from its bottom and a pipe going up from its top. A steam pipe comes in through the side, bends upward and points into the top pipe.",
  parts: [
    { key: "chamber", color: "#5E7387", name: "Chamber", note: "The bulging box in the middle, cut open so you can see inside. The jet, the water coming up and the water going out all meet here." },
    { key: "suck", color: "#4FA58A", name: "Suction pipe", note: "Hangs down into the water to be pumped out. Water climbs up it because the jet takes the air away above it." },
    { key: "out", color: "#C8873A", name: "Discharge pipe", note: "Carries the water away. The jet pushes the water up through it." },
    { key: "steam", color: "#D9B13B", name: "Steam pipe", note: "Brings steam from the boiler. It bends upward inside the chamber so its narrow end points straight up the discharge pipe." }
  ],
  controls: [{ id: "jet", label: "Jet of", value: "steam", options: [["steam", "Steam"], ["air", "Squeezed air"]] }],
  speed: false,
  readouts: [{ id: "q", label: "Flow" }, { id: "v", label: "Lifted" }],
  closed: { label: "Pipes" },
  views: { "3d": [253, 145, 511], front: [15, 15, 600], side: [600, 15, 0] },
  target: [15, 15, 0],
  how: [
    "Steam rushes out of the narrow end of the bent pipe and shoots straight up the discharge pipe. At first the chamber is full of air. Watch the water climb up the suction pipe until it fills the chamber.",
    "A fast jet drags the air or water next to it along with it. So the jet carries the air out of the top, and the air pressing on the water outside pushes water up the suction pipe to take its place. Then the jet drags the water out, and more water follows in a steady stream. The steam meets the cold water and turns back into water, so it vanishes into the stream.",
    "Try squeezed air instead of steam. It lifts the water just the same, but air does not turn into water. Watch its bubbles ride up the discharge pipe. Choose Closed to see the pipes as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the pipes and chamber is cut away so the inside shows, as in the engraving. The length of the pipes, the speeds and the flow numbers are made up. The dots show the water, steam and air. Real water near the jet swirls and mixes; here it simply flows up along smooth paths.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { level: -125, lifted: 0, q: 0, t: 0 };
    // steam pipe centre line: in from the right at y -10, bends up to the middle, nozzle from y 34 to 44
    o.sp = P.bendPath([[92, -10], [0, -10], [0, 34]], 24, 3);
    var sp = c.shell(P.at(P.halfPipe({ path: o.sp, rIn: 6.5, rOut: 9.5, material: c.mat("steam") }), 0, 0, .6, scene), "open");   // cut face lifted to z 0.6, off the chamber's cut face
    sp.add(P.halfSection({ poly: [[6.5, 34], [9.5, 34], [6.5, 44], [3.5, 44]], material: c.mat("steam") }));   // nozzle narrows from 6.5 to 3.5 inside
    var fl = P.halfPipe({ path: [[92, -10], [97, -10]], rIn: 6.5, rOut: 15, material: c.mat("steam") }); c.shell(P.at(fl, 0, 0, .6, scene), "open");   // flange, x 92 .. 97
    // closed view: the steam pipe outside the chamber, x 40 (inside the chamber wall, r 53 at y -10) .. 92, and its flange x 92 .. 97
    c.shell(P.at(P.cylX(9.5, 52, c.mat("steam")), 66, -10, 0, scene), "closed");
    c.shell(P.at(P.annulus({ rIn: 6.5, rOut: 15, depth: 5, material: c.mat("steam") }), 92, -10, 0, scene), "closed").rotation.y = Math.PI / 2;
    // chamber: a pipe that swells, y -62 .. 96, wall 3; a hole is left where the steam pipe goes through
    var prof = [[-62, 22], [-56, 23], [-46, 30], [-36, 40], [-22, 48], [-6, 53], [8, 53], [28, 50], [52, 42], [70, 32], [84, 24], [90, 23], [96, 23]], path = [], radii = [];
    prof.forEach(function (q, k) {
      if (k) { var a = prof[k - 1]; for (var s = 1; s <= 4; s++) { var u = s / 4; path.push([0, a[0] + (q[0] - a[0]) * u]); var r = a[1] + (q[1] - a[1]) * u; radii.push([r - 3, r]); } }
      else { path.push([0, q[0]]); radii.push([q[1] - 3, q[1]]); }
    });
    scene.add(c.shell(P.halfPipe({ path: path, radii: radii, sides: 24, clip: [{ path: o.sp, r: 9.6 }], material: c.mat("chamber") }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: prof.map(function (q) { return [q[1], q[0]]; }).concat(prof.slice().reverse().map(function (q) { return [q[1] - 3, q[0]]; })), material: c.mat("chamber") }), "closed"));   // closed view: the whole chamber
    o.prof = prof;
    // lips round the two joints, outside the chamber neck
    [[[23, -66], [27, -66], [27, -58], [23, -58]], [[23, 92], [27, 92], [27, 100], [23, 100]]].forEach(function (q) {   // r 23 .. 27, y -66 .. -58 and 92 .. 100
      scene.add(c.shell(P.halfSection({ poly: q, material: c.mat("chamber") }), "open")); scene.add(c.shell(P.wholeSection({ poly: q, material: c.mat("chamber") }), "closed"));
    });
    // suction pipe y -125 .. -62 and discharge pipe y 96 .. 158, bore 19 and 20
    scene.add(c.shell(P.halfSection({ poly: [[19, -125], [22, -125], [22, -66], [19, -66]], material: c.mat("suck") }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: [[19, -125], [22, -125], [22, -66], [19, -66]], material: c.mat("suck") }), "closed"));
    scene.add(c.shell(P.halfSection({ poly: [[17, 100], [20, 100], [20, 158], [17, 158]], material: c.mat("out") }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: [[17, 100], [20, 100], [20, 158], [17, 158]], material: c.mat("out") }), "closed"));
    // the suction pipe's bottom 4 units and discharge top 4 run inside the lips: pipes end at the lips' faces (y -66 and y 100)
    o.water = P.waterDots(300, { radius: 2.2, color: c.spot }); scene.add(o.water);
    o.gas = P.waterDots(178, { radius: 2.6, color: "#7E8B97", opacity: .8 }); scene.add(o.gas);
    o.wp = [];
    for (i = 0; i < 300; i++) o.wp.push(this.seed({}, true));
    o.gp = []; for (i = 0; i < 160; i++) o.gp.push({ on: false });
    o.pipeS = []; for (i = 0; i < 18; i++) o.pipeS.push(i / 18);
    var L = 0; o.spL = [0]; for (i = 1; i < o.sp.length; i++) { L += Math.hypot(o.sp[i][0] - o.sp[i - 1][0], o.sp[i][1] - o.sp[i - 1][1]); o.spL.push(L); }
    o.next = 0; o.acc = 0;
  },

  rad: function (y) {             // bore radius at height y
    var p = this.o.prof;
    if (y < -62) return 19; if (y > 96) return 17;
    for (var k = 1; k < p.length; k++) if (y <= p[k][0]) { var a = p[k - 1], u = (y - a[0]) / (p[k][0] - a[0]); return a[1] + (p[k][1] - a[1]) * u - 3; }
    return 17;
  },
  seed: function (q, anywhere) {  // a water drop on a random path, spread evenly through the water
    for (var k = 0; k < 40; k++) {
      var y = anywhere ? -125 + Math.random() * 283 : -125 - Math.random() * 6, r = this.o ? this.rad(y) : 19;
      if (!anywhere || Math.random() < (r * r) / (53 * 53)) { q.y = y; break; }
    }
    if (q.y === undefined) q.y = -125;
    var a = Math.PI + Math.random() * Math.PI, s = Math.sqrt(Math.random()) * .85;
    q.u = s * Math.cos(a); q.w = s * Math.sin(a);
    return q;
  },
  nearPipe: function (x, y, z) {
    var p = this.o.sp, b = 1e9;
    for (var k = 0; k < p.length; k += 2) b = Math.min(b, (p[k][0] - x) * (p[k][0] - x) + (p[k][1] - y) * (p[k][1] - y));
    return b + z * z < 110;
  },

  step: function (c, dt, S) {
    var o = this.o, i, air = S.controls.jet === "air", run = S.playing && dt > 0;
    var full = o.level >= 158, Q = full ? 1 : 0;
    if (run) {
      o.t += dt;
      if (!full) o.level = Math.min(158, o.level + 70 * dt);
      o.q += ((full ? 1 : 0) - o.q) * Math.min(1, dt * 1.5);
      o.lifted += o.q * 120 / 60 * dt;            // 120 litres a minute when running full
    }
    var vB = 32;                                   // speed in the suction pipe
    for (i = 0; i < o.wp.length; i++) {
      var q = o.wp[i], r = this.rad(q.y);
      if (run) {
        if (full) q.y += vB * (19 * 19) / (r * r) * dt;
        if (q.y > 176) { q.y = undefined; this.seed(q, false); r = this.rad(q.y); }
      }
      var x = q.u * r, z = q.w * r - 1;
      var show = (q.y <= o.level || (full && q.y <= 176)) && q.y >= -125 && !this.nearPipe(x, q.y, z);   // when full, it runs 18 out of the top
      o.water.put(i, x, q.y, z, show ? (q.y > 158 ? 1 - (q.y - 158) / 18 : 1) : 0);
    }
    o.water.flush();
    // steam in the pipe and the jet
    var k = 0, Lt = o.spL[o.spL.length - 1];
    for (i = 0; i < o.pipeS.length; i++, k++) {
      if (run) { o.pipeS[i] += 2.2 * dt; o.pipeS[i] -= Math.floor(o.pipeS[i]); }
      var at = o.pipeS[i] * Lt, j = 1; while (j < o.spL.length - 1 && o.spL[j] < at) j++;
      var a = o.sp[j - 1], b = o.sp[j], u = (at - o.spL[j - 1]) / (o.spL[j] - o.spL[j - 1] || 1);
      o.gas.put(k, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, -2.5, air ? 0 : .8);
    }
    if (run) {
      o.acc += dt * (air ? 22 : 60);
      while (o.acc >= 1) {
        o.acc -= 1;
        for (var n = 0; n < o.gp.length; n++) { var g = o.gp[o.next]; o.next = (o.next + 1) % o.gp.length; if (!g.on) break; }
        g.on = true; g.y = 44; g.x = (Math.random() - .5) * 4; g.z = -1 - Math.random() * 3; g.vx = (Math.random() - .5) * 10; g.s = 1;
        g.vy = air ? 60 + 20 * Math.random() : 210 + 40 * Math.random(); g.air = air;
      }
      o.gp.forEach(function (g) {
        if (!g.on) return;
        g.y += g.vy * dt; g.x += g.vx * dt; g.x = Math.max(-14, Math.min(14, g.x));
        var wet = g.y < o.level;
        if (!g.air && wet && g.y > 50) g.s -= dt * 4.5;   // steam meets cold water and turns into water
        if (g.air) g.s = Math.min(1.6, g.s + dt * .4);
        if (g.y > 176 || g.s <= 0) g.on = false;
      });
    }
    o.gp.forEach(function (g, n) { o.gas.put(o.pipeS.length + n, g.x || 0, g.y || 0, g.z || 0, g.on ? g.s * (g.air ? 1.5 : 1) : 0); });
    o.gas.flush();
    S.set("q", Math.round(o.q * 120) + " L/min");
    S.set("v", Math.round(o.lifted) + " L");
  }
});
