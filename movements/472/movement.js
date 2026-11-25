M507.define({
  number: 472,
  title: "Grimshaw's air hammer",
  lede: "A small hammer worked by squeezed air instead of steam. A pump fills the hollow frame with air. A sliding valve sends that air above or below the hammer's piston in turn, so the hammer rises and is driven down.",
  alt: "A curved iron frame on a base. A shaft with a wheel runs along the top. On the left a rod from the shaft works an air pump. On the right a cylinder with a valve box on top carries a hammer above an anvil.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Driving shaft", note: "Turned by a belt on the big wheel. A crank at its end works the pump, and a small off-centre disc near the other end works the valve." },
    { key: "ham", color: "#C8873A", name: "Piston and hammer", note: "The piston slides in the cylinder. The hammer head is on the end of its rod." },
    { key: "valve", color: "#C2503F", name: "Slide valve", note: "A small block in the box on top of the cylinder. Watch it slide left and right. It decides which side of the piston gets the air." },
    { key: "cyl", color: "#4FA58A", name: "Cylinder and valve box", note: "Fixed to the frame. It is cut open at the front so you can see the piston and the air." },
    { key: "pump", color: "#D9B13B", name: "Air pump", note: "Pushes air into the hollow frame, which stores it like a tank." },
    { key: "link", color: "#8E7AA8", name: "Valve rods", note: "Carry the up and down wobble of the off-centre disc round a corner, so the valve slides sideways." }
  ],
  speed: { min: 4, max: 30, value: 18, label: "Shaft speed", unit: " rpm" },
  controls: [{ type: "range", id: "ps", label: "Air in the frame", min: 1.5, max: 4, step: .5, value: 3, unit: " atm",
    presets: [[2, "Low"], [3, "Middle"], [4, "High"]] }],
  readouts: [{ id: "hi", label: "Air above" }, { id: "lo", label: "Air below" }, { id: "bl", label: "Last blow" }],
  closed: { label: "Cylinder and pump" },
  views: { "3d": [397, 230, 883], front: [-15, 5, 820], side: [820, 5, 0] },
  target: [-15, 5, 0],
  how: [
    "The pump on the left squeezes air into the hollow frame. The frame keeps it at a steady push, like a tank. On top of the hammer's cylinder, a small valve slides back and forth as the shaft turns.",
    "When the valve slides one way, air from the frame goes under the piston and lifts the hammer. The air above escapes up the short pipe. When it slides back, air goes on top and drives the hammer down, while the air below escapes. The hammer falls faster than by its own weight.",
    "Try low air, then high air. With too little push the hammer can hardly lift itself. With more, it rises quickly and lands much harder. Choose Closed to see the cylinder and pump as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The cylinder and pump are cut open at the front. The valve rods and the bracket that turns their motion round a corner, the shaft brackets, the pipes and all sizes were made up. The frame is drawn as a flat plate behind the moving parts. The air from the frame reaches the valve box straight through the back of the box, and the anvil is set a little lower than drawn so the hammer has room to swing. The motion is worked out from the air pushing on each side of the piston and the hammer's weight, slowed down. The blue dots show the air.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed, k = .85;
    function X(p) { return (p - 290) * k; } function Y(p) { return (265 - p) * k; }
    var o = this.o = { th: 0, yp: 110, vp: 0, mu: 20.5, ml: 66.3, pu: 1, pl: 1, blow: 0, tb: 9, D: 127.75, YA: -45, YS: 106, XV0: 100 };
    // frame: a flat plate behind, z -62..-32, standing on the base top y -174
    var fr = [[200, 470], [225, 390], [225, 300], [205, 230], [205, 110], [355, 110], [355, 45], [500, 45], [500, 240], [410, 240], [360, 255], [325, 300], [305, 370], [310, 430], [330, 470]];
    scene.add(P.prism(fr.map(function (p) { return [X(p[0]), p[1] === 470 ? -174 : Y(p[1])]; }), -62, -32, fx));
    P.at(P.box(421, 26, 115, fx), -14.5, -187, -12.5, scene);                   // base x -225..196, y -200..-174, z -70..45
    scene.add(P.prism([[75, -174], [88, -110], [110, -70], [125, -60], [125, -45], [159, -45], [159, -60], [172, -70], [185, -110], [192, -174]], -30, 30, fx));   // anvil, top y -45
    c.shell(P.at(P.box(127.5, 64, 80, fx), -157.25, -142, 0, scene));           // pump housing x -221..-93.5, y -174..-110
    // shaft along X at y 106, z 0, held by two brackets bolted to the frame's face (feet at z -32)
    var xa = new T.Vector3(0, 1, 0), ya = new T.Vector3(0, 0, 1);
    [-64, 25].forEach(function (x) { var b = P.bearingBlock({ bore: 5.5, outer: 12, post: 18, width: 12, drop: 32, material: fx }); P.frame(b, xa, ya); P.at(b, x, o.YS, 0, scene); });
    o.shaft = P.at(new T.Group(), 0, o.YS, 0, scene);
    P.at(P.cylX(5, 190, c.mat("shaft")), -45, 0, 0, o.shaft);                   // x -140..50
    P.at(P.cylX(53, 34, c.mat("shaft")), -119, 0, 0, o.shaft);                  // wheel x -136..-102
    P.at(P.box(1, 40, 6, c.mat("shaft", "dark")), -101.5, 25, 0, o.shaft);      // stripe on the wheel face
    P.at(P.box(3, 22, 8, c.mat("shaft")), -138.5, 7.5, 0, o.shaft);             // crank arm x -140..-137
    P.at(P.cylX(3.5, 11, c.mat("shaft")), -142.5, 15, 0, o.shaft);              // crank pin x -148..-137
    o.ecc = P.at(P.cylX(10, 8, c.mat("shaft")), 44, 0, 0, scene);              // off-centre disc
    var strap = P.hoop(11.5, 1.8, c.mat("link")); strap.rotation.y = Math.PI / 2; o.strap = P.at(strap, 44, 0, 0, scene);
    // cylinder (cut open), centre x 142, y 29.75..144.5; inside y 34.7..139.5
    o.XB = 142; o.YB = 87.1;
    c.shell(P.at(P.halfSection({ poly: [[4.5, -57.4], [32, -57.4], [32, 57.4], [0, 57.4], [0, 52.4], [27, 52.4], [27, -52.4], [4.5, -52.4]], material: c.mat("cyl") }), o.XB, o.YB, 0, scene), "open");
    c.shell(P.at(P.wholeSection({ poly: [[4.5, -57.4], [32, -57.4], [32, 57.4], [0, 57.4], [0, 52.4], [27, 52.4], [27, -52.4], [4.5, -52.4]], material: c.mat("cyl") }), o.XB, o.YB, 0, scene), "closed");   // closed view: the whole cylinder
    c.shell(P.at(P.box(94, 30, 46, fx), 127, 168, -9, scene));                  // valve box x 80..174, y 153..183, z -32..14
    c.shell(P.at(P.cylY(4, 10, fx), 160, 149, 0, scene));                        // top port y 144.5..153.5
    c.shell(P.at(P.cylY(4, 115, fx), 95, 95.5, 0, scene));                      // side pipe y 38..153
    c.shell(P.at(P.cylX(4, 15, fx), 102.5, 38, 0, scene), "open");              // into the bottom x 95..110
    // closed view: the bend as a ball, and the pipe run 2 into the cylinder wall (r 32, so no slit at its round face)
    c.shell(P.at(P.sphere(4, fx), 95, 38, 0, scene), "closed");
    c.shell(P.at(P.cylX(4, 17, fx), 103.5, 38, 0, scene), "closed");             // x 95..112
    c.shell(P.at(P.cylY(4, 17, fx), 128, 191.5, 0, scene));                     // outlet y 183..200
    o.valve = P.at(P.box(28, 8, 12, c.mat("valve")), 0, 157.5, 0, scene);
    // piston and hammer, origin at the piston centre
    o.ham = P.at(new T.Group(), o.XB, 0, 0, scene);
    o.ham.add(P.halfSection({ poly: [[0, -9], [26.5, -9], [26.5, 9], [0, 9]], material: c.mat("ham") }));
    P.at(P.cylY(4, 94.75, c.mat("ham")), 0, -9 - 94.75 / 2, 0, o.ham);
    P.at(P.box(28, 24, 28, c.mat("ham")), 0, -o.D + 12, 0, o.ham);
    P.at(P.box(29, 2, 29, c.mat("ham", "dark")), 0, -o.D + 16, 0, o.ham);
    // bell crank on a stud from the frame (z -32..3), pivot (64, 140)
    P.at(P.cylZ(2.5, 35, fx), 64, 140, -14.5, scene);
    o.er = P.at(P.rod(2.5, c.mat("link")), 0, 0, 0, scene);
    o.a1 = P.at(P.rod(3, c.mat("link")), 0, 0, 0, scene);
    o.a2 = P.at(P.rod(3, c.mat("link")), 0, 0, 0, scene);
    o.vr = P.at(P.rod(2, c.mat("link")), 0, 0, 0, scene);
    // air pump, cut open: x -144, y -110..-55, inside -106..-59
    c.shell(P.at(P.halfSection({ poly: [[0, -28], [22, -28], [22, 27.5], [3.5, 27.5], [3.5, 23.5], [19, 23.5], [19, -23.5], [0, -23.5]], material: c.mat("pump") }), -144, -82.5, 0, scene), "open");
    c.shell(P.at(P.wholeSection({ poly: [[0, -28], [22, -28], [22, 27.5], [3.5, 27.5], [3.5, 23.5], [19, 23.5], [19, -23.5], [0, -23.5]], material: c.mat("pump") }), -144, -82.5, 0, scene), "closed");   // closed view: the whole pump
    o.pp = P.at(P.halfSection({ poly: [[0, -12], [18.5, -12], [18.5, 0], [0, 0]], material: c.mat("pump") }), -144, 0, 0, scene);
    o.pr = P.at(P.rod(3, c.mat("pump")), 0, 0, 0, scene);
    c.shell(P.at(P.cylX(4, 72, fx), -86, -100, 0, scene), "open");              // pipe to the frame x -122..-50
    // closed view: the pipe run 2 into the pump wall (r 22) and on to the bend centre, with a ball at the bend
    c.shell(P.at(P.cylX(4, 78, fx), -85, -100, 0, scene), "closed");             // x -124..-46
    c.shell(P.at(P.sphere(4, fx), -46, -100, 0, scene), "closed");
    c.shell(P.at(P.cylZ(4, 32, fx), -46, -100, -16, scene));                    // and back to its face, z -32..0
    // air
    o.flow = P.steamFlow({ color: c.spot, light: true, count: 220, size: 2.2, z0: -12, z1: -2 }); scene.add(o.flow);
    var f = function (y, out) { out[0] = o.XB - 25; out[1] = y; out[2] = o.XB + 25; out[3] = y; };
    o.dLo = o.flow.domain({ density: .025, pad: 1.5, f: f }); o.dHi = o.flow.domain({ density: .025, pad: 1.5, f: f });
    o.pf = P.steamFlow({ color: c.spot, light: true, count: 50, size: 2, z0: -1.5, z1: 1.5 }); scene.add(o.pf);
    o.pTop = o.pf.pipe({ points: [[160, 156], [160, 140]], width: 5, n: 6, speed: .8 });
    o.pBot = o.pf.pipe({ points: [[95, 156], [95, 38], [112, 38]], width: 5, n: 18, speed: .4 });
    o.pEx = o.pf.pipe({ points: [[128, 172], [128, 215]], width: 5, n: 10, out: true, speed: .6 });
    o.pPump = o.pf.pipe({ points: [[-122, -100], [-50, -100]], width: 5, n: 10, speed: .5 });
    o.bars = [0, 0]; o.kinds = [1]; o.ports = [0];
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, ps = +S.controls.ps, K = 600, g = 400, i, n, h;
    var lap = .8, mode = 0;                                                     // 1: air under the piston, -1: air on top, 0: both shut
    function geo(th) {                                                          // valve gear from the shaft angle
      var ph = th + 1.2, ey = o.YS + 5 * Math.cos(ph), ez = 5 * Math.sin(ph);
      var p1 = P.meet(64, 140, 20, 44, ey, 34, -1), dx = (p1[0] - 64) / 20, dy = (p1[1] - 140) / 20;
      var q = [64 + 17 * dy, 140 - 17 * dx], xv = q[0] + Math.sqrt(36 * 36 - (157.5 - q[1]) * (157.5 - q[1]));
      return { ey: ey, ez: ez, p1: p1, q: q, xv: xv };
    }
    if (S.playing && dt > 0) {
      n = Math.ceil(dt * 600); h = dt / n;
      for (i = 0; i < n; i++) {
        o.tb += h; o.th += S.w * h;
        var u = geo(o.th).xv - o.XV0; mode = u > lap ? 1 : u < -lap ? -1 : 0;
        var hu = 139.5 - (o.yp + 9), hl = (o.yp - 9) - 34.7;
        if (mode === 1) { o.ml += 12 * (ps * hl - o.ml) * h; o.mu += 12 * (hu - o.mu) * h; }
        if (mode === -1) { o.mu += 12 * (ps * hu - o.mu) * h; o.ml += 12 * (hl - o.ml) * h; }
        o.pu = o.mu / Math.max(hu, .5); o.pl = o.ml / Math.max(hl, .5);
        o.vp += (K * (o.pl - o.pu) - g) * h; o.yp += o.vp * h;
        if (o.yp > 130) { o.yp = 130; o.vp = Math.min(o.vp, 0); }
        if (o.yp - o.D < o.YA) {
          if (o.vp < -20 && o.tb * S.w > 2) o.blow = -o.vp;
          if (o.vp < -20) o.tb = 0;
          o.yp = o.YA + o.D; if (o.vp < 0) o.vp = -.1 * o.vp;
        }
      }
    }
    var G = geo(o.th), uu = G.xv - o.XV0; mode = uu > lap ? 1 : uu < -lap ? -1 : 0;
    o.shaft.rotation.x = o.th;
    o.ecc.position.set(44, G.ey, G.ez); o.strap.position.set(44, G.ey, G.ez);
    o.er.span(44, G.ey, G.ez, G.p1[0], G.p1[1], 0);
    o.a1.span(64, 140, 0, G.p1[0], G.p1[1], 0); o.a2.span(64, 140, 0, G.q[0], G.q[1], 0);
    o.vr.span(G.q[0], G.q[1], 0, G.xv, 157.5, 0);
    o.valve.position.x = G.xv + 14;
    o.ham.position.y = o.yp;
    var py = o.YS + 15 * Math.cos(o.th), pz = 15 * Math.sin(o.th), yq = py - Math.sqrt(182 * 182 - pz * pz);
    o.pr.span(-144, py, pz, -144, yq, 0); o.pp.position.y = yq;
    // air in the cylinder and pipes
    o.bars[0] = 34.7; o.bars[1] = o.yp - 9; o.kinds[0] = mode === 1 ? 1 : mode === -1 ? 3 : 2; o.ports[0] = 38; o.dLo.set(o.bars, o.kinds, o.ports, 1);
    o.bars[0] = o.yp + 9; o.bars[1] = 139.5; o.kinds[0] = mode === -1 ? 1 : mode === 1 ? 3 : 2; o.ports[0] = 139.5; o.dHi.set(o.bars, o.kinds, o.ports, 1);
    var turn = Math.abs(S.w) * dt;
    o.flow.update(turn);
    o.pTop.on = o.pBot.on = mode !== 0; o.pTop.out = mode === 1; o.pBot.out = mode === -1; o.pEx.on = mode !== 0;
    o.pPump.on = Math.sin(o.th) > 0;
    o.pf.update(turn);
    S.set("hi", o.pu.toFixed(1) + " atm");
    S.set("lo", o.pl.toFixed(1) + " atm");
    S.set("bl", o.blow ? (o.blow / 100).toFixed(1) + " m/s" : "None yet");
  }
});
