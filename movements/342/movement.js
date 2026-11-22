M507.define({
  number: 342,
  title: "Atmospheric beam engine",
  lede: "An old pumping engine that works by making a vacuum. Steam fills the cylinder, then a spray of cold water turns it back into water and leaves almost nothing behind. The air outside pushes the piston down, and the beam lifts the heavy pump rod at the other end.",
  alt: "A long timber beam rocks on a pivot on top of a wall. Each end has a curved iron head, an arc centred on the pivot. A chain hangs from the left head to a piston in an open-topped cylinder. A chain hangs from the right head to a heavy pump rod going down into a pump.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam and arch heads", note: "A long beam that rocks on a pivot on the wall. The curved heads at its ends are parts of one circle round the pivot." },
    { key: "chains", color: "#D9B13B", name: "Chains", note: "Each chain is fixed to the top of an arch head and lies along its curve. Watch the red link roll on and off the curve." },
    { key: "piston", color: "#C8873A", name: "Piston", note: "Slides in the cylinder, which is open at the top. The air above presses down on it all the time." },
    { key: "pump", color: "#8E7AA8", name: "Pump rod and weight", note: "A heavy rod that works the pump down in the mine. Its weight pulls the piston back up." },
    { key: "steam", color: "#E8E2D0", name: "Steam", note: "Fills the cylinder under the piston. It is pale when there is little of it left." }
  ],
  controls: [{ id: "spray", label: "Cold water spray", value: "on", options: [["on", "On"], ["off", "Off"]] }],
  speed: { min: 4, max: 15, value: 10, label: "Speed", unit: " strokes/min" },
  readouts: [{ id: "ph", label: "Stage" }, { id: "p", label: "Under piston" }, { id: "n", label: "Strokes" }],
  closed: { label: "Cylinders" },
  views: { "3d": [440, 190, 1100], front: [0, 0, 1100], side: [1100, 0, 0] },
  target: [0, 0, 0],
  how: [
    "First, steam at about the same pressure as the air is let in under the piston. Now the air pushes on the piston from above and the steam pushes from below, so they cancel. The heavy pump rod sinks and pulls the piston up.",
    "Then a spray of cold water is shot into the cylinder. The steam turns back into a few drops of water and almost nothing is left under the piston. The air above is still pressing down, so it pushes the piston down hard. The beam rocks and lifts the heavy pump rod, and the pump lifts water out of the mine.",
    "The curved heads keep both chains hanging straight down, so the rods go straight up and down. Watch the reading under the piston. Then turn the cold water spray off and see what happens. Choose Closed to see the cylinder and the pump as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the cylinder end of the beam. The other end, the wall and its bearings, the pump, the weight, the pipes, the floor and all the sizes were made up, and so were the forces that set the pace. The steam valve and the water drain are left out. The cylinder is drawn see-through so the piston and the steam show.",

  K: { YP: 110, RA: 160, BM: .3, LC: 232, LINK: 8, XC: -160, YB: -186 },

  // pressure under the piston as a share of the air's pressure: steam about 1.05, after the spray about 0.15
  sim: function (o, h, spray) {
    var K = this.K, f = 1 - o.p - .35;                       // air above minus steam below minus the pump rod's pull
    if (o.phase === 0) o.p += (1.05 - o.p) * Math.min(1, 6 * h);
    else if (spray) o.p += (.15 - o.p) * Math.min(1, 4 * h);
    o.w += (8 * f - 4 * o.w) * h; o.b += o.w * h;
    if (o.b <= -K.BM) { o.b = -K.BM; o.w = Math.max(0, o.w); if (o.phase === 0) o.phase = 1; }
    if (o.b >= K.BM) { o.b = K.BM; o.w = Math.min(0, o.w); if (o.phase === 1) { o.phase = 0; o.n++; } }
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, RA = K.RA;
    var o = this.o = { b: K.BM, w: 0, p: .15, phase: 0, n: 0 };
    // time scale: run one stroke cycle once to find how long it takes, so the speed slider gives true strokes a minute
    var t = { b: K.BM, w: 0, p: .15, phase: 0, n: 0 }, T0 = 0;
    while (t.n < 2 && T0 < 60) { this.sim(t, 1 / 240, true); T0 += 1 / 240; if (t.n === 1 && !o.T1) o.T1 = T0; }
    o.T0 = T0 - o.T1;
    // beam group, pivot at (0, YP): timber x -141..141, y -12..12, z -10..10; arch heads at radius RA, z -8..8
    var mb = c.mat("beam");
    o.beam = new T.Group(); o.beam.position.set(0, K.YP, 0); scene.add(o.beam);
    P.at(P.box(282, 24, 20, mb), 0, 0, 0, o.beam);
    [-1, 1].forEach(function (s) {
      var a0 = s < 0 ? Math.PI : 0, A = Math.PI / 6, sh = new T.Shape();
      sh.absarc(0, 0, RA - 2.5, a0 - A, a0 + A, false); sh.absarc(0, 0, RA - 20, a0 + A, a0 - A, true);
      var g = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, -8);
      o.beam.add(P.mesh(g, mb));
      var gs = new T.Shape();                                  // web from the lower half of the head to the underside of the beam
      gs.moveTo(s * 141, -12); gs.lineTo(s * 96, -12); gs.lineTo(s * 128, -68); gs.lineTo(s * 136, -40); gs.closePath();
      var gg = new T.ExtrudeGeometry(gs, { depth: 12, bevelEnabled: false }); gg.translate(0, 0, -6);
      o.beam.add(P.mesh(gg, mb));
      var st = P.rod(3, mb); st.span(s * 128, 70, 0, s * 40, 12, 0); o.beam.add(st);   // stay from the top of the head to the beam top
      var aa = a0 + s * A;                                     // the chain is fixed at the top end of each head
      P.at(P.cylZ(4, 20, c.mat("beam", "dark")), RA * Math.cos(aa), RA * Math.sin(aa), 0, o.beam);   // pin z -10..10
    });
    P.at(P.cylZ(6, 52, mb), 0, 0, 0, o.beam);                 // pivot shaft z -26..26, ends at the bearings' outer faces
    // chains: links 8 long, 10 across (z -5..5), 3 thick, centred on radius RA, so 1 clear of the head's face
    function chain() { var ch = P.linkChain({ count: K.LC / K.LINK, length: K.LINK - .4, height: 10, thick: 3, material: c.mat("chains"), alt: c.mat("chains", "dark"), mark: c.mat("chains", "mark"), markAt: 9 }); scene.add(ch); return ch; }
    o.chL = chain(); o.chR = chain();
    // piston: cross block y -10..0 below the chain end, rod, piston 12 thick 75 below the chain end
    var mp = c.mat("piston");
    o.piston = new T.Group(); scene.add(o.piston);
    P.at(P.box(20, 10, 14, mp), 0, -5, 0, o.piston);
    P.at(P.cylY(5, 59, mp), 0, -39.5, 0, o.piston);           // rod y -69..-10
    P.at(P.cylY(37, 12, mp), 0, -75, 0, o.piston);             // piston y -81..-69, bore 40
    // pump rod: cross block, rod down into the pump, weight, bucket at the bottom (165 below the chain end)
    var mq = c.mat("pump");
    o.pump = new T.Group(); scene.add(o.pump);
    P.at(P.box(20, 10, 14, mq), 0, -5, 0, o.pump);
    P.at(P.cylY(5, 155, mq), 0, -87.5, 0, o.pump);            // rod y -165..-10
    P.at(P.box(44, 46, 30, mq), 0, -37, 0, o.pump);            // weight y -60..-14
    P.at(P.cylY(15, 8, mq), 0, -165, 0, o.pump);               // bucket y -169..-161, in the pump of radius 18
    // steam under the piston, and the cold water jet
    o.steam = c.fluid(P.at(P.cylY(37, 1, c.mat("steam")), K.XC, 0, 0, scene));
    o.jetMat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .7 });
    o.jet = P.mesh(new T.ConeGeometry(14, 1, 16, 1, true), o.jetMat); o.jet.rotation.x = Math.PI; scene.add(c.fluid(o.jet));   // widens upwards

    // supports. Ground y -262..-250, x -240..240, z -70..70
    P.at(P.box(480, 12, 140, c.fixed), 0, -256, 0, scene);
    // wall x -18..18, y -250..85, z -40..40; bearings z 12..26 and -26..-12, foot on the wall top y 85, shaft axis y 110
    P.at(P.box(36, 335, 80, c.fixed), 0, -82.5, 0, scene);
    [-19, 19].forEach(function (z) { P.at(P.bearingBlock({ bore: 6.5, outer: 14, width: 14, drop: 25, material: c.fixed }), 0, K.YP, z, scene); });
    // cylinder: plinth x -230..-90, y -250..-192, z -60..60; bottom plate y -192..-186; open tube y -186..-45, radius 40; flared lip
    P.at(P.box(140, 58, 120, c.fixed), K.XC, -221, 0, scene);
    c.shell(P.at(P.cylY(48, 6, c.fixed), K.XC, -189, 0, scene));
    c.shell(P.at(P.mesh(new T.CylinderGeometry(40, 40, 141, 40, 1, true), c.fixed), K.XC, -115.5, 0, scene));
    c.shell(P.at(P.mesh(new T.CylinderGeometry(52, 40, 10, 40, 1, true), c.fixed), K.XC, -40, 0, scene));   // lip y -45..-35
    // pump: open tube y -250..-141, radius 18, at x 160 (the weight's lowest bottom is -137, the bucket's highest top -142)
    c.shell(P.at(P.mesh(new T.CylinderGeometry(18, 18, 109, 32, 1, true), c.fixed), RA, -195.5, 0, scene));
    // closed view: linings facing inwards (mirrored), 0.5 inside each open tube, so the inside of the open tops looks solid
    c.shell(P.at(P.mesh(new T.CylinderGeometry(39.5, 39.5, 141, 40, 1, true), c.fixed), K.XC, -115.5, 0, scene), "closed").scale.x = -1;
    c.shell(P.at(P.mesh(new T.CylinderGeometry(51.4, 39.5, 10, 40, 1, true), c.fixed), K.XC, -40, 0, scene), "closed").scale.x = -1;
    c.shell(P.at(P.mesh(new T.CylinderGeometry(17.5, 17.5, 109, 32, 1, true), c.fixed), RA, -195.5, 0, scene), "closed").scale.x = -1;
  },

  opacity: function (key) {
    if (key !== "steam" || !this.o) return 1;
    return .1 + .5 * Math.max(0, Math.min(1, (this.o.p - .15) / .9));
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, RA = K.RA, spray = S.controls.spray !== "off";
    if (S.playing && dt > 0) {
      var h = dt * o.T0 * S.rpm / 60, n = Math.ceil(h * 240);
      for (var i = 0; i < n; i++) this.sim(o, h / n, spray);
    }
    var b = o.b, A = Math.PI / 6;
    o.beam.rotation.z = b;
    var yL = K.YP - K.LC + RA * (A - b), yR = K.YP - K.LC + RA * (A + b);   // chain ends: unwrapped length plus straight drop
    o.piston.position.set(-RA, yL, 0); o.pump.position.set(RA, yR, 0);
    function lay(ch, s) {                                       // s = -1 left, +1 right
      var a0 = s < 0 ? Math.PI - A + b : A + b, wrap = RA * (s < 0 ? A - b : A + b);
      for (var i = 0; i < ch.links.length; i++) {
        var d = (i + .5) * K.LINK;
        if (d < wrap) {
          var a = a0 - s * d / RA, ca = Math.cos(a), sa = Math.sin(a);
          ch.put(i, RA * ca, K.YP + RA * sa, 0, s * sa, -s * ca, 0, ca, sa, 0);
        } else ch.put(i, s * RA, K.YP - (d - wrap), 0, 0, -1, 0, s, 0, 0);
      }
    }
    lay(o.chL, -1); lay(o.chR, 1);
    var pb = yL - 81, hs = pb - .5 - K.YB;                       // steam from the cylinder floor to just under the piston
    o.steam.scale.y = hs; o.steam.position.y = K.YB + hs / 2;
    var jetOn = spray && o.phase === 1 && o.p > .2, jh = Math.min(50, pb - K.YB - 4);
    o.jet.visible = jetOn && jh > 2; o.jet.scale.y = Math.max(1, jh); o.jet.position.set(K.XC, K.YB + jh / 2, 0);
    var label = o.phase === 0 ? "Steam in" : (!spray ? "No spray" : (o.w > .02 ? "Air pushes" : "Cold spray"));
    S.set("ph", label); S.set("p", Math.round(o.p * 101) + " kPa"); S.set("n", String(o.n));
  }
});
