M507.define({
  number: 464,
  title: "Hero's fountain",
  lede: "Water poured into the upper vessel runs down a pipe into the lower vessel. It squeezes the air there, and the squeezed air pushes water out of the middle vessel. The water shoots up a tube as a jet.",
  alt: "A cut-away fountain. A wide upper vessel sits on a round middle bowl and a long base. A tall pipe on the right joins the upper vessel to the base. A thin pipe on the left joins the base to the bowl. A jet tube from the bowl rises through the upper vessel and sprays water.",
  parts: [
    { key: "upper", color: "#5E7387", name: "Upper vessel", note: "The open tank you pour water into. The jet falls back into it." },
    { key: "middle", color: "#C8873A", name: "Middle bowl", note: "Sealed, and full of water at the start. The squeezed air pushes its water up the jet tube." },
    { key: "lower", color: "#4FA58A", name: "Lower vessel", note: "Sealed. Water from the top fills it from below and squeezes the air above." },
    { key: "pipes", color: "#D9B13B", name: "Pipes", note: "The wide pipe on the right carries water down. The thin pipe on the left carries only air. The tall pipe in the middle is the jet tube." }
  ],
  controls: [{ id: "jet", label: "Jet tube", value: "short", options: [["short", "Short"], ["tall", "Tall"]] }],
  speed: { min: 0, max: 30, value: 10, label: "Pouring", unit: " cups/min" },
  closed: { label: "Vessels" },
  readouts: [{ id: "p", label: "Air pressure" }, { id: "j", label: "Jet height" }, { id: "m", label: "Middle bowl" }],
  views: { "3d": [170, 275, 1000], front: [0, 270, 960], side: [960, 270, 40] },
  target: [0, 265, 0],
  how: [
    "Water poured into the upper vessel runs down the wide pipe into the lower vessel. The water rises there and squeezes the air above it. That air cannot escape. It goes up the thin pipe into the middle bowl.",
    "The pressed air pushes down on the water in the middle bowl. The only way out is up the jet tube, so the water shoots out above the upper vessel. It falls back in, and runs down again. The jet can only rise about as high as the water level above the lower vessel.",
    "Try the Short jet tube, then the Tall one. A tall tube needs more pressure, so the jet starts later and is shorter. Choose Closed to see the fountain as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a cut-away. The sizes, the pouring and the way the air squeezes are simplified and made up, with the pressure worked out from how much room the air has. When the middle bowl runs dry, the model refills it and starts again.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { r: 91, tot: Math.PI * 91 * 91 / 2, AL: 298 * 48, AU: 358, Vt: 1500, Ha: 300, yMc: 285, spent: 0, mh: -1, Vm: 0, Vl: 0, Vu: 7000, pe: 0, hj: 0 };
    o.Va0 = o.AL + (o.tot - .9 * o.tot) + o.Vt; o.Vm = .9 * o.tot; o.Vl = .5 * o.AL;
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .6, depthWrite: false });
    var mu = c.mat("upper"), ml = c.mat("lower"), mm = c.mat("middle"), mp = c.mat("pipes");
    // lower vessel: floor y -6..0, walls y 0..54, roof y 48..54 with gaps for the two pipes
    P.at(P.box(312, 6, 88, ml), 0, -3, 0, scene);                                      // x -156..156
    P.at(P.box(6, 54, 80, ml), -153, 27, 0, scene); P.at(P.box(6, 54, 80, ml), 153, 27, 0, scene);   // x -156..-150 and 150..156, z -40..40
    P.at(P.box(248, 6, 80, ml), -14, 51, 0, scene);                                    // roof x -138..110, y 48..54
    c.shell(P.at(P.box(300, 48, 4, c.fixed), 0, 24, -42, scene), "open");             // back wall z -44..-40
    c.shell(P.at(P.box(312, 54, 4, ml), 0, 27, -42, scene), "closed");                 // closed: back wall x -156..156, y 0..54, z -44..-40, in the vessel's colour
    c.shell(P.at(P.box(312, 54, 4, ml), 0, 27, 42, scene), "closed");                  // closed: front wall x -156..156, y 0..54, z 40..44, on the floor
    [[130, 20], [-144, 6]].forEach(function (p) { [-1, 1].forEach(function (s) {        // closed: roof y 48..54 filled round the two pipes, out to z 40
      c.shell(P.at(P.box(p[0] > 0 ? 40 : 12, 6, 40 - p[1], ml), p[0], 51, s * (40 + p[1]) / 2, scene), "closed");
    }); });
    o.wl = P.at(P.box(298, 1, 78, wat), 0, 0, 0, scene); o.wl.userData.live = true;
    // right pipe x 110..150, bottom y 6 (inside the lower vessel) up to y 297
    P.at(new T.Mesh(new T.CylinderGeometry(20, 20, 291, 24, 1, true), mp), 130, 151.5, 0, scene);
    // left air pipe x -150..-138, y 48..280, then across to the bowl at y 280
    P.at(new T.Mesh(new T.CylinderGeometry(6, 6, 232, 16, 1, true), mp), -144, 164, 0, scene);
    P.at(P.cylX(5, 49, mp), -119.5, 280, 0, scene);                                    // x -144..-95
    // middle bowl under the upper vessel's floor: shell centre (0, 285) from angle pi to 2 pi
    var sh = P.annulus({ rIn: 91, rOut: 95, depth: 80, z0: -40, from: Math.PI, to: 2 * Math.PI, material: mm }); sh.position.set(0, 285, 0); scene.add(sh);
    var hp = []; for (i = 0; i <= 24; i++) hp.push([95 * Math.cos(Math.PI + i * Math.PI / 24), 285 + 95 * Math.sin(Math.PI + i * Math.PI / 24)]);
    c.shell(P.at(P.prism(hp, -44, -40, c.fixed), 0, 0, 0, scene), "open");
    c.shell(P.at(P.prism(hp, -44, -40, mm), 0, 0, 0, scene), "closed");                // closed: back of the bowl, z -44..-40
    c.shell(P.at(P.prism(hp, 40, 44, mm), 0, 0, 0, scene), "closed");                  // closed: front of the bowl, z 40..44
    o.mw = new T.Mesh(new T.BufferGeometry(), wat); o.mw.userData.live = true; scene.add(o.mw);
    // upper vessel: floor y 285..297 in three pieces, walls to y 380
    P.at(P.box(172, 12, 88, mu), -94, 291, 0, scene);                                  // x -180..-8
    P.at(P.box(102, 12, 88, mu), 59, 291, 0, scene);                                   // x 8..110
    P.at(P.box(30, 12, 88, mu), 165, 291, 0, scene);                                   // x 150..180
    P.at(P.box(6, 83, 88, mu), -183, 338.5, 0, scene); P.at(P.box(6, 83, 88, mu), 183, 338.5, 0, scene);   // x -186..-180, 180..186; y 297..380
    c.shell(P.at(P.box(374, 81, 4, c.fixed), 0, 338.5, -42.5, scene), "open");
    c.shell(P.at(P.box(360, 83, 4, mu), 0, 338.5, -42, scene), "closed");              // closed: back wall x -180..180, y 297..380, z -44..-40, on the floor
    c.shell(P.at(P.box(360, 83, 4, mu), 0, 338.5, 42, scene), "closed");               // closed: front wall x -180..180, y 297..380, z 40..44, on the floor
    [[0, 8, 16], [130, 20, 40]].forEach(function (p) { [-1, 1].forEach(function (s) {   // closed: floor y 285..297 filled round the jet tube and the right pipe, out to z 44
      c.shell(P.at(P.box(p[2], 12, 44 - p[1], mu), p[0], 291, s * (44 + p[1]) / 2, scene), "closed");
    }); });
    // closed: square collars that fill the corners of the square holes round each round pipe (hole r a little under the pipe's, so no faces meet)
    function collar(x, y0, y1, half, r, m) {
      var sq = new T.Shape([new T.Vector2(-half, -half), new T.Vector2(half, -half), new T.Vector2(half, half), new T.Vector2(-half, half)]), ho = new T.Path();
      ho.absarc(0, 0, r, 0, 2 * Math.PI, true); sq.holes.push(ho);
      var ge = new T.ExtrudeGeometry(sq, { depth: y1 - y0, bevelEnabled: false, curveSegments: 40 }); ge.rotateX(-Math.PI / 2); ge.translate(x, y0, 0);
      c.shell(P.at(new T.Mesh(ge, m), 0, 0, 0, scene), "closed");
    }
    collar(130, 285, 297, 20, 19.5, mu); collar(0, 285, 297, 8, 7.5, mu);           // upper floor, round the right pipe (r 20) and the jet tube (r 8)
    collar(130, 48, 54, 20, 19.5, ml); collar(-144, 48, 54, 6, 5.5, ml);             // lower roof, round the right pipe and the air pipe (r 6)
    o.wu = c.fluid(P.at(P.box(358, 1, 78, wat), 0, 297, 0, scene)); o.wu.userData.live = true;
    // jet tube: x -8..8, from y 200 up; tall or short
    o.jet = new T.Mesh(new T.CylinderGeometry(8, 8, 1, 20, 1, true), mp); scene.add(o.jet);
    o.dots = P.dropPool({ count: 320, radius: 2.5, color: c.spot, opacity: .85, parent: scene });
    o.acc = [0, 0, 0];
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, sim = S.playing ? dt : 0, r = o.r, g = 450;
    var yN = S.controls.jet === "tall" ? 450 : 410, hN = yN - 200;
    if (o.hN !== hN) { o.hN = hN; o.jet.scale.set(1, hN, 1); o.jet.position.set(0, 200 + hN / 2, 0); }
    function area(h) { h = Math.max(0, Math.min(2 * r, h)); return r * r * Math.acos((r - h) / r) - (r - h) * Math.sqrt(Math.max(0, 2 * r * h - h * h)); }
    function level(V) { var lo = 0, hi = r; for (var k = 0; k < 24; k++) { var m = (lo + hi) / 2; if (area(m) < V) lo = m; else hi = m; } return lo; }
    var hm = level(o.Vm), ym = 285 - r + hm, yl = o.Vl / o.AL, yu = 297 + o.Vu / o.AU;
    var Va = (o.AL - o.Vl) + (o.tot - o.Vm) + o.Vt;
    o.pe = o.Ha * (o.Va0 / Va - 1);
    var steps = Math.max(1, Math.ceil(sim / .01)), h = sim / steps;
    for (var s = 0; s < steps && sim > 0; s++) {
      Va = (o.AL - o.Vl) + (o.tot - o.Vm) + o.Vt; o.pe = o.Ha * (o.Va0 / Va - 1);
      hm = level(o.Vm); ym = 285 - r + hm; yl = o.Vl / o.AL; yu = 297 + o.Vu / o.AU;
      var spent = o.Vm < .03 * o.tot;
      var pour = spent ? 0 : S.rpm * 40;
      var dn = (yu - yl) - o.pe, q1 = 0;
      if (dn > 0 && o.Vu > 0) q1 = Math.min(o.Vu / h * .5, 40 * Math.sqrt(dn));
      else if (dn < 0 && o.Vl > 0) q1 = -Math.min(o.Vl / h * .5, 25 * Math.sqrt(-dn));
      o.hj = o.pe - (yN - ym); var q2 = 0;
      if (o.hj > 0 && o.Vm > 0) q2 = Math.min(o.Vm / h * .5, 35 * Math.sqrt(o.hj));
      o.Vu += (pour - q1 + q2) * h; o.Vl += q1 * h; o.Vm -= q2 * h;
      o.Vu = Math.max(0, o.Vu); o.Vl = Math.max(0, Math.min(o.AL * .95, o.Vl));
      o.q1 = q1; o.q2 = q2; o.pour = pour;
      if (spent) {
        o.spent += h;
        if (o.spent > 2) { o.Vm = Math.min(.9 * o.tot, o.Vm + 3500 * h); o.Vl = Math.max(0, o.Vl - 2500 * h); o.Vu += (7000 - o.Vu) * h * 2; }
      }
      if (o.Vm > .88 * o.tot) o.spent = 0;
    }
    // drawing
    if (Math.abs(o.mh - hm) > .3) {
      o.mh = hm;
      var sh = new c.THREE.Shape(), ys = -r + hm, w = Math.sqrt(Math.max(0, 2 * r * hm - hm * hm)), a1 = Math.atan2(ys, -w), a2 = Math.atan2(ys, w), n = 24;
      for (var k = 0; k <= n; k++) { var an = a1 + (a2 - a1) * k / n, px = r * Math.cos(an), py = r * Math.sin(an); if (k === 0) sh.moveTo(px, py); else sh.lineTo(px, py); }
      var geo = new c.THREE.ExtrudeGeometry(sh, { depth: 78, bevelEnabled: false }); geo.translate(0, 285, -39);
      o.mw.geometry.dispose(); o.mw.geometry = geo; o.mw.visible = hm > .5;
    }
    o.wl.visible = o.Vl > 50; o.wl.scale.set(1, Math.max(.01, o.Vl / o.AL), 1); o.wl.position.y = o.Vl / o.AL / 2;
    o.wu.visible = o.Vu > 50; o.wu.scale.set(1, Math.max(.01, o.Vu / o.AU), 1); o.wu.position.y = 297 + o.Vu / o.AU / 2;
    if (sim > 0) {
      o.acc[0] += (o.q2 || 0) * sim / 4; o.acc[1] += Math.max(0, o.q1 || 0) * sim / 40; o.acc[2] += (o.pour || 0) * sim / 80;
      var v0 = Math.sqrt(2 * g * Math.max(0, o.hj));
      while (o.acc[0] >= 1) { o.acc[0] -= 1; o.dots.emit((Math.random() - .5) * 6, yN + 2, (Math.random() - .5) * 6, (Math.random() - .5) * 8, v0 * (.97 + Math.random() * .03), (Math.random() - .5) * 8); }
      while (o.acc[1] >= 1) { o.acc[1] -= 1; o.dots.emit(130 + (Math.random() - .5) * 20, 296, (Math.random() - .5) * 20, 0, -60, 0, 300); }
      while (o.acc[2] >= 1) { o.acc[2] -= 1; o.dots.emit(-120 + (Math.random() - .5) * 8, 430, (Math.random() - .5) * 8, 0, 0, 0); }
    }
    o.dots.step(sim, g, function (p) { return p.y < 297 + o.Vu / o.AU + 1 && !(p.x > 105 && p.x < 155 && p.y > 40) || (p.x > 105 && p.x < 155 && p.y < Math.max(8, o.Vl / o.AL + 2)); });
    S.set("p", (1 + o.pe / o.Ha).toFixed(1) + " bar");
    S.set("j", Math.round(Math.max(0, o.hj)) + " cm");
    S.set("m", Math.round(o.Vm / o.tot * 100) + " %");
  }
});
