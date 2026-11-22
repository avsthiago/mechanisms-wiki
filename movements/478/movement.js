M507.define({
  number: 478,
  title: "Expansion steam trap",
  lede: "A trap that lets water out of a steam pipe but keeps the steam in. It works because a metal pipe grows a little longer when it is hot. Steam makes the pipe push its end against a valve and close it.",
  alt: "A long pipe held at its left end on a block, running into a hollow ball cut open down the middle. Inside the ball the pipe ends face to face with a plunger that comes in from the right. A weighted bent lever presses the plunger toward the pipe. A pipe goes down from the bottom of the ball.",
  parts: [
    { key: "pipe", color: "#C8873A", name: "Long pipe", note: "Brings in the water and steam. It is gripped on the left, so when it grows it can only grow toward the right. Watch the red band near its end." },
    { key: "ball", color: "#5E7387", name: "Hollow ball", note: "Cut open so you can see inside. The pipe slides through a tight ring on its left side, and water leaves through the pipe at the bottom." },
    { key: "plunger", color: "#4FA58A", name: "Plunger", note: "The valve. It slides through a tight ring on the right and its flat end can close the end of the long pipe." },
    { key: "lever", color: "#D9B13B", name: "Weighted lever", note: "A bent lever with a weight on one arm. The weight swings the other arm toward the ball, pushing the plunger toward the pipe." },
    { key: "screw", color: "#8E7AA8", name: "Stop screw", note: "Goes through the lever and stops on a post. It sets how near the plunger can come to the pipe." }
  ],
  controls: [{ id: "screw", label: "Stop screw", value: "mid", options: [["out", "Out"], ["mid", "Middle"], ["in", "In"]] }],
  speed: false,
  readouts: [{ id: "d", label: "Pipe grows" }, { id: "g", label: "Gap" }],
  closed: { label: "Ball" },
  views: { "3d": [40, 50, 330], front: [-15, -20, 370], side: [380, -20, -60] },
  target: [-15, -20, 0],
  how: [
    "Water collects at the end of the long pipe. While the plunger stands a little away from the pipe's end, the water runs out of the gap, into the ball and away down the bottom pipe. Then steam follows it.",
    "Steam is hotter than water, so the pipe warms up and grows longer. It is gripped at the left, so its right end creeps toward the plunger until it shuts against it. The steam is now trapped. As more water gathers in the pipe, the pipe cools, shrinks, and the gap opens again. The weighted lever lets the plunger give way if the pipe grows further.",
    "Turn the stop screw in or out. Screwed in, the plunger stays further away, so the pipe opens after only a little cooling. Screwed out, the pipe must cool much more and hold back more water. Choose Closed to see the trap as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the ball and pipe is cut away so the inside shows. A real pipe grows by only about a millimetre, too little to see, so the growth is made many times bigger; the readouts give believable real sizes. The timings and sizes are made up. The dots show the water and the steam.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { T: 1, w: 0, t: 0, d: 6.5, Lp: 56.1, piv: [62, 16] };
    var water = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .55, depthWrite: false, side: T.DoubleSide });
    // base, y -59 .. -50, with a square hole x, z -18 .. 18 for the outlet
    P.at(P.box(124, 9, 50, c.fixed), -80, -54.5, 0, scene);   // x -142 .. -18, z -25 .. 25
    P.at(P.box(94, 9, 50, c.fixed), 65, -54.5, 0, scene);     // x 18 .. 112
    P.at(P.box(36, 9, 7, c.fixed), 0, -54.5, 21.5, scene);    // x -18 .. 18, z 18 .. 25
    P.at(P.box(36, 9, 7, c.fixed), 0, -54.5, -21.5, scene);   // z -25 .. -18
    P.at(P.box(14, 33, 18, c.fixed), -123, -33.5, 0, scene);  // support under the clamp: x -130 .. -116, y -50 .. -17
    P.at(P.box(6, 24, 8, c.fixed), 47, -38, 0, scene);        // stop post: x 44 .. 50, y -50 .. -26
    P.at(P.box(8, 70, 7, c.fixed), 62, -15, -8.5, scene);     // lever post: x 58 .. 66, y -50 .. 20, z -12 .. -5
    // ball and outlet: one cut pipe along Y that swells into the ball; holes left for the long pipe and the plunger
    var path = [], radii = [], y;
    for (y = -85; y <= 35; y += (y < -32 ? 4 : 1)) {
      path.push([0, y]);
      if (y < -29.5) radii.push([7, 14]);
      else radii.push([Math.sqrt(Math.max(0, 961 - y * y)), Math.sqrt(Math.max(0, 1225 - y * y))]);
    }
    var lpath = [[-60, -8], [-20, -8]], rpath = [[20, -8], [60, -8]];
    // closed view: a whole pipe is the back half plus its mirror image in z = 0, with the flat cut strips (all corners on z = 0) taken out
    function half(o2) {
      var m = P.halfPipe(o2), g = m.geometry, p = g.attributes.position, ix = g.index.array, keep = [], k;
      for (k = 0; k < ix.length; k += 3) if (Math.abs(p.getZ(ix[k])) > 1e-6 || Math.abs(p.getZ(ix[k + 1])) > 1e-6 || Math.abs(p.getZ(ix[k + 2])) > 1e-6) keep.push(ix[k], ix[k + 1], ix[k + 2]);
      g.setIndex(keep); return m;
    }
    function both(o2, parent) {   // the cut-away half for the open view and its whole twin for the closed view
      parent.add(c.shell(P.halfPipe(o2), "open"));
      var g = new T.Group(), b = half(o2); b.scale.z = -1; g.add(half(o2)); g.add(b); parent.add(c.shell(g, "closed"));
    }
    both({ path: path, radii: radii, sides: 24, clip: [{ path: lpath, r: 6.5 }, { path: rpath, r: 5.5 }], material: c.mat("ball") }, scene);
    scene.add(c.shell(P.halfSection({ poly: [[14, -50.5], [22, -50.5], [22, -44], [14, -44]], material: c.mat("ball") }), "open"));   // flange on the base top, y -50 .. -44
    scene.add(c.shell(P.wholeSection({ poly: [[14, -50.5], [22, -50.5], [22, -44], [14, -44]], material: c.mat("ball") }), "closed"));
    var ball = [{ path: [[0, 0], [0, .01]], r: 35.2 }];
    both({ path: [[-52, -8], [-28, -8]], rIn: 6.5, rOut: 11, clip: ball, material: c.mat("ball") }, scene);    // left boss, the pipe slides in it
    both({ path: [[-57, -8], [-52, -8]], rIn: 6.5, rOut: 13, material: c.mat("ball") }, scene);               // its nut
    both({ path: [[28, -8], [50, -8]], rIn: 5.5, rOut: 10, clip: ball, material: c.mat("ball") }, scene);      // stuffing box on the right
    both({ path: [[50, -8], [55, -8]], rIn: 5.5, rOut: 12, material: c.mat("ball") }, scene);
    // long pipe in a group whose origin is the clamp; it grows by scaling along x
    o.pipe = P.at(new T.Group(), -123, 0, 0, scene);
    both({ path: [[-27, -8], [121, -8]], rIn: 4.5, rOut: 6, material: c.mat("pipe") }, o.pipe);   // x -150 .. -2
    both({ path: [[-5, -8], [5, -8]], rIn: 6, rOut: 9, material: c.mat("pipe") }, o.pipe);       // clamp ring, x -128 .. -118, bottom y -17 on the support
    both({ path: [[105, -8], [109, -8]], rIn: 6, rOut: 6.8, material: c.mat("pipe", "mark") }, o.pipe);   // red band, lifted 0.8 off the pipe
    o.col = P.halfPipe({ path: [[0, -8], [1, -8]], rIn: .01, rOut: 4.2, sides: 12, material: water }); scene.add(c.fluid(o.col));   // water in the pipe
    // plunger with its flat valve face
    o.plg = P.at(new T.Group(), 0, -8, 0, scene);
    P.at(P.cylX(4.5, o.Lp - 2, c.mat("plunger")), (o.Lp + 2) / 2, 0, 0, o.plg);   // x 2 .. Lp from the face
    P.at(P.cylX(6, 2, c.mat("plunger")), 1, 0, 0, o.plg);                         // face, x 0 .. 2
    // bent lever about its pin
    o.lev = P.at(new T.Group(), 62, 16, 0, scene);
    P.at(P.box(6, 48, 6, c.mat("lever")), 0, -24, 0, o.lev);                      // lower arm, x -3 .. 3 from the pin, down to -48
    P.at(P.cylZ(5, 6, c.mat("lever")), 0, 0, 0, o.lev);
    var arm = P.rod(2.5, c.mat("lever")); arm.span(0, 0, 0, 24, 0, 0); o.lev.add(arm);
    P.at(P.sphere(12, c.mat("lever")), 34, 0, 0, o.lev);                          // the weight
    P.at(P.cylZ(2, 9, c.mat("lever", "dark")), 0, 0, -.5, scene);                 // pin, z -5 .. 4, from the post's face
    o.scr = P.at(new T.Group(), 0, -44, 0, o.lev);
    o.scrRod = P.at(P.cylX(1.8, 1, c.mat("screw")), 0, 0, 0, o.scr);
    P.at(P.box(4, 7, 7, c.mat("screw")), 9, 0, 0, o.scr);                         // head, x 7 .. 11 from the arm's middle
    // dots
    o.dots = P.waterDots(70, { radius: 2, color: c.spot }); scene.add(o.dots);
    o.dp = []; for (i = 0; i < 70; i++) o.dp.push({ on: false });
    o.steam = P.waterDots(26, { radius: 2, color: "#8C99A5", opacity: .75 }); scene.add(o.steam);
    o.sp = []; for (i = 0; i < 26; i++) o.sp.push(Math.random());
    o.acc = 0; o.next = 0;
  },

  face: function (psi, dx, dy) { return 62 + dx * Math.cos(psi) + dy * Math.sin(psi); },   // x of a point on the lever after it turns clockwise by psi

  step: function (c, dt, S) {
    var o = this.o, run = S.playing && dt > 0, me = this, i;
    var s = { out: 3, mid: 6, "in": 9 }[S.controls.screw];
    // the lever turns as far as the stop allows, or less if the pipe's end holds the plunger back
    function solve(f) { var lo = -.3, hi = .4; for (var k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return lo; }
    var psiStop = solve(function (p) { return me.face(p, -3 - s, -44) - 50; });
    var xe = -2 + o.d;                                       // the pipe end, x -2 when cold
    var psiPipe = solve(function (p) { return me.face(p, -3, -24) - o.Lp - xe; });
    var psi = Math.min(psiStop, psiPipe), tip = me.face(psi, -3, -24) - o.Lp, gap = Math.max(0, tip - xe);
    if (run) {
      o.t += dt;
      o.w = Math.min(110, o.w + 5 * dt);                       // water arriving from the heating pipes
      var drain = Math.min(o.w, 30 * gap * dt); o.w -= drain;
      var blow = gap > .3 && o.w < .5;
      var env = blow ? 1 : 1 - .9 * Math.min(1, o.w / 60);
      o.T += (env - o.T) * Math.min(1, dt / 1.4);
      o.acc += drain * .8;
      while (o.acc >= 1) { o.acc -= 1; var d = o.dp[o.next]; o.next = (o.next + 1) % o.dp.length; d.on = true; d.x = xe + 1 + Math.random() * gap; d.y = -8 - Math.random() * 3; d.z = -Math.random() * 4; d.v = 0; }
      o.dp.forEach(function (d) { if (!d.on) return; d.v += 300 * dt; d.y -= d.v * dt; d.x += (0 - d.x) * Math.min(1, dt * 6); if (d.y < -103) d.on = false; });   // falls 18 out of the outlet's open end
      o.blow = blow;
    }
    o.d = 6.5 * o.T;
    o.pipe.scale.x = (121 + o.d) / 121;                      // grows from the clamp; its end goes from x -2 to -2 + d
    o.lev.rotation.z = -psi;
    o.plg.position.x = tip;
    o.scrRod.scale.y = 10 + s; o.scrRod.position.x = (7 - (3 + s)) / 2;  // from the head at 7 to the tip at -(3 + s)
    var wl = Math.min(o.w, 140);
    o.col.visible = wl > .3; o.col.scale.x = Math.max(.01, wl); o.col.position.x = xe - wl;
    o.dp.forEach(function (d, n) { o.dots.put(n, d.x || 0, d.y || 0, d.z || 0, d.on ? 1 : 0); });
    o.dots.flush();
    o.sp.forEach(function (u, n) {                             // steam in the pipe behind the water; it rushes out when the gap is clear
      if (run) { u += dt * (o.blow ? 1.4 : .05); if (u > 1) u -= 1; o.sp[n] = u; }
      var x0 = -150, x1 = xe - wl, x = x0 + (x1 - x0) * u, ok = x1 - x0 > 4;
      o.steam.put(n, x, -8 + 2 * Math.sin(n * 2.3), -2, ok ? .9 : 0);
    });
    o.steam.flush();
    S.set("d", "+" + (o.d / 6.5 * 1.2).toFixed(1) + " mm");
    S.set("g", (gap / 6.5 * 1.2).toFixed(1) + " mm");
  }
});
