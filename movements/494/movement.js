/* Elevation, drawing units (1 = a pixel of the engraving) inside one group scaled by .5; x right, y up, ground top at y = 0,
   z towards the viewer. The tongs are built about their centre pivot O (group `tg`, z layers back to front:
   rear arm z -14 .. -2, front arm z 2 .. 14, links at z = -20 and 20, centre pin z -22 .. 22). */
M507.define({
  number: 494,
  title: "Stone tongs",
  lede: "Two curved arms cross like scissors and are pulled shut by two links. The tongs close round a block of stone, and the bigger the stone, the wider they open. Lift on the rope and the stone comes up.",
  alt: "A pair of curved tongs hangs from a ring on a rope. Two short links meet at the ring and join the upper ends of two crossed arms. The arms swing round a pin at the middle and their lower ends press on the two sides of a block of stone.",
  parts: [
    { key: "arms", color: "#5E7387", name: "Tong arms", note: "Two curved arms that cross and turn on a pin. Their lower ends bite the stone. Watch the red points." },
    { key: "links", color: "#C8873A", name: "Links", note: "Two short bars. When the rope pulls their top joint up, they pull the upper ends of the arms together." },
    { key: "rope", color: "#E8E2D0", name: "Ring and rope", note: "The rope goes up to the crane. The ring ties it to the top joint of the links." }
  ],
  controls: [{ id: "w", label: "Stone", value: "97", options: [["70", "Narrow"], ["97", "Medium"], ["118", "Wide"]] }],
  readouts: [{ id: "gap", label: "Jaws" }, { id: "lift", label: "Stone lifted" }],
  views: { "3d": [90, 70, 560], front: [0, 30, 580], side: [580, 30, 10] },
  target: [0, 30, 0],
  distance: [150, 2400],
  how: [
    "The tongs are lowered over the stone with their jaws open. The rope pulls up on the top joint of the two links. The links pull up on the upper ends of the two arms, and those ends move together. The arms turn on their middle pin, so the lower ends, the jaws, close on the stone.",
    "Once the jaws touch the stone, they cannot close more. Pulling on, the rope lifts the tongs and the stone with them. A heavy stone pulls the tongs down harder. That pulls the links tighter, so the jaws squeeze harder too. The heavier the stone, the harder the tongs bite.",
    "Put the stone down and the rope goes slack. The links drop, the arms swing wide and the jaws let go. Try Narrow, then Wide, and watch how far the jaws open and how high the rope has to go."
  ],
  note: "This model is rebuilt from Brown's drawing. The stone is a plain block. The ground, the rope up to the crane, the thickness of the arms and the way the two arms sit one in front of the other were made up. The tongs are held at one height while they close. Real tongs hang from the rope, and a rough stone would help them grip.",

  build: function (c) {
    var T = c.THREE, P = c.P, S = .5, i;
    var o = this.o = { ph: .28, a: 80, l: 73, b0: Math.atan2(53, 60) };
    var root = new T.Group(); root.scale.set(S, S, S); root.position.set(0, -250 * S, 0); c.scene.add(root);
    var ma = c.mat("arms"), ml = c.mat("links"), mr = c.mat("rope");
    o.stone = P.box(1, 250, 60, c.fixed); root.add(o.stone);
    P.at(P.box(560, 6, 180, c.fixed), 0, -3.6, 0, root);                                 // ground: y -6.6 .. -.6
    o.tg = new T.Group(); root.add(o.tg);
    var tip = [[0, 0], [-55, -20], [-112, -60], [-128, -110], [-118, -160], [-103, -172]];
    o.tip = tip;
    function arm(sd, z) {
      var g = new T.Group(); g.position.z = z;
      var pts = tip.map(function (p) { return new T.Vector3(sd * p[0], p[1], 0); });
      g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 6, 10, false), ma));
      g.add(P.rod(6, ma).span(0, 0, 0, sd * 53, 60, 0));
      P.at(P.sphere(6.8, c.mat("arms", "mark")), sd * tip[5][0], tip[5][1], 0, g);       // the jaw point, a little proud of the arm
      P.at(P.sphere(6, ma), sd * 53, 60, 0, g);
      o.tg.add(g); return g;
    }
    o.arm1 = arm(1, 8); o.arm2 = arm(-1, -8);              // arm1 has its upper end on the right and its jaw on the left
    P.at(P.cylZ(7, 44, ma), 0, 0, 0, o.tg);                // centre pin
    o.pinR = P.at(P.cylZ(4, 26, ml), 0, 0, 13, o.tg); o.pinL = P.at(P.cylZ(4, 26, ml), 0, 0, -13, o.tg); o.pinT = P.at(P.cylZ(5, 52, ml), 0, 0, 0, o.tg);
    o.linkR = P.rod(4, ml); o.linkL = P.rod(4, ml); o.tg.add(o.linkR, o.linkL);
    o.stem = P.rod(4, mr); o.tg.add(o.stem);
    o.ring = P.at(P.hook({ radius: 20, tube: 3.5, material: mr }), 0, 0, 0, o.tg);
    o.rope = P.rod(3.5, mr); root.add(o.rope);
    o.mark = P.at(P.sphere(6, c.mat("rope", "mark")), 0, 0, 0, root);
  },

  step: function (c, dt, S) {
    var o = this.o, M = Math.PI, a = o.a, l = o.l, tip = o.tip[5];
    function sm(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    o.ph = (o.ph + S.w * dt / (2 * M)) % 1;
    var ph = o.ph, Ws = +S.controls.w;
    function tx(d) { return (tip[0] * Math.cos(d) - tip[1] * Math.sin(d)); }       // x of the jaw point turned by d (anticlockwise)
    function ty(d) { return tip[0] * Math.sin(d) + tip[1] * Math.cos(d); }
    var lo = -.5, hi = .5, d;
    for (var i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (tx(m) < -(Ws + 6)) lo = m; else hi = m; }   // the jaw reaches the stone
    var dc = (lo + hi) / 2, dOpen = -.30;
    var close = sm((ph - .08) / .2) - sm((ph - .76) / .16);
    d = dOpen + (dc - dOpen) * close;
    var H = 90 * (sm((ph - .28) / .2) - sm((ph - .58) / .18));
    var beta = o.b0 - d, Oy = 143 + H - ty(d);
    o.stone.scale.x = 2 * Ws; o.stone.position.set(0, 125 + H, 0);
    o.tg.position.y = Oy;
    o.arm1.rotation.z = d; o.arm2.rotation.z = -d;
    var sb = Math.sin(beta), cb = Math.cos(beta), h = a * cb + Math.sqrt(l * l - a * a * sb * sb);
    o.pinR.position.set(a * sb, a * cb, 13); o.pinL.position.set(-a * sb, a * cb, -13); o.pinT.position.set(0, h, 0);
    o.linkR.span(a * sb, a * cb, 20, 0, h, 20); o.linkL.span(-a * sb, a * cb, -20, 0, h, -20);
    o.stem.span(0, h, 0, 0, h + 22, 0); o.ring.position.set(0, h + 42, 0);
    o.rope.span(0, Oy + h + 62, 0, 0, 560, 0);
    o.mark.position.set(0, Math.min(Oy + h + 180, 520), 0);
    S.set("gap", Math.round(-tx(d)) + " cm");
    S.set("lift", Math.round(H * .5) + " cm");
  }
});
