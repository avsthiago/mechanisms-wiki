M507.define({
  number: 237,
  title: "Crown ratchet and pawl",
  lede: "A wheel on an upright shaft has sloping teeth standing up round its rim, like a crown. An arm above it swings to and fro and carries a pawl that hangs onto the teeth. Each swing one way pushes the wheel round a few teeth, and the swing back lets the pawl slide over them.",
  alt: "A wide round drum on an upright shaft, seen from above and in front. Sloping teeth stand up round its rim. A thin arm lies across the top, turning on the shaft's upper end. Near the rim a small plate hangs from the arm and rests between two teeth.",
  parts: [
    { key: "wheel", color: "#C8873A", name: "Crown wheel", note: "A drum with sloping teeth standing up round its rim. It turns on its upright shaft. Watch the red stripe on its top." },
    { key: "arm", color: "#5E7387", name: "Swinging arm", note: "A thin rod that turns on the top of the shaft. It swings to and fro and carries the pawl." },
    { key: "pawl", color: "#C2503F", name: "Pawl", note: "A small plate that hangs from the arm. It pushes a tooth one way and lifts over the teeth the other way. Watch it." },
    { key: "shaft", color: "#4FA58A", name: "Shaft", note: "The upright shaft the wheel is fixed to. It stands in a fixed bearing at the bottom." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing of the arm", min: 5, max: 50, step: 5, value: 30, unit: "°",
    presets: [[10, "Tiny"], [30, "Medium"], [50, "Wide"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Swings", unit: " a min" },
  readouts: [{ id: "arm", label: "Arm" }, { id: "wheel", label: "Wheel" }, { id: "teeth", label: "Moved on" }],
  views: { "3d": [330, 230, 520], front: [0, -20, 700], side: [700, 0, 40] },
  target: [0, -50, 0],
  how: [
    "The arm lies across the top of the wheel and swings to and fro round the shaft. A small plate called a pawl hangs from it and rests in the gap between two teeth.",
    "When the arm swings one way, the pawl pushes on the steep side of a tooth and carries the wheel round. When it swings back, the pawl meets the slope of the next tooth. It rides up, slides over the top and drops into the next gap. The wheel stays where it is. So the wheel only ever turns one way.",
    "Try the Tiny swing. The pawl rises and falls in the same gap and the wheel does not move. Then try Medium and Wide, and count how many teeth the wheel moves on each swing."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the pawl as a curved plate fixed to the arm. Here it is a flat plate hinged to the arm, so that it can lift over the teeth. Its own weight keeps it down. The drum, the bearing, the base, the sizes and the number of teeth were made up. A little rubbing in the bearing stops the wheel slipping back.",

  init: function () {
    var K = this.K = { N: 20, R: 112, RI: 90, D: 20, BASE: 2, HZ: 52, L: 75, RH: 80, A0: 25 * Math.PI / 180, U0: .1 };
    K.st = 2 * Math.PI / K.N;
    this.o = { th: 0, a: K.A0, phi: 0, k: 0, at: 0, pa: 0, h: K.BASE };
    var o = this.o, u = K.U0 * K.st, i, at = K.A0;
    for (i = 0; i < 6; i++) at = K.A0 + this.dang(this.hAt(u));
    o.phi = at - u; o.phi0 = o.phi; o.k = 0; o.at = at;
    this.phys(0, 0, 0);
  },
  // height of the tooth face at the angle u round the wheel: rises along the slope, drops at the steep face on each multiple of the pitch
  hAt: function (u) { var K = this.K, f = u / K.st + 1e-9; f -= Math.floor(f); return K.BASE + K.D * f; },
  // how far round, seen from the shaft, the pawl's nose lies behind its hinge when the nose rests at height h
  dang: function (h) { var K = this.K, d = K.HZ - h; return Math.atan2(Math.sqrt(K.L * K.L - d * d), K.RH); },

  // h: time step, w: input speed (rad/s), sw: full swing of the arm (radians)
  phys: function (h, w, sw) {
    var K = this.K, o = this.o, i, st = K.st;
    o.th += w * h;
    o.a = K.A0 - sw * (1 - Math.cos(o.th)) / 2;                             // arm angle; swinging clockwise from above is the pushing stroke
    var at = o.at, u, hh = o.h;
    for (i = 0; i < 6; i++) {
      u = at - o.phi;
      while (u >= (o.k + 1) * st) o.k++;                                     // slid over a tooth top into the next gap
      if (u < o.k * st) { o.phi = at - o.k * st; u = o.k * st; }              // the steep face stops the pawl, so the wheel is pushed round
      hh = this.hAt(Math.min(u, (o.k + 1) * st - 1e-6));
      at = o.a + this.dang(hh);
    }
    o.at = at; o.h = hh;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    this.init();
    var K = this.K, o = this.o;

    // Everything lives in G: local x, y are the floor, local z is up (world up). Drum top face z = 0.
    var G = this.G = new T.Group(); G.rotation.x = -Math.PI / 2; scene.add(G);
    var mw = c.mat("wheel");
    o.wheel = new T.Group(); G.add(o.wheel);
    P.at(P.cylZ(K.R, 36, mw), 0, 0, -18, o.wheel);                            // drum z -36..0
    P.at(P.faceRatchet({ teeth: K.N, rIn: K.RI, rOut: K.R, depth: K.D, base: K.BASE, material: mw }), 0, 0, 0, o.wheel);   // teeth z 0..22, on the drum's top face
    P.at(P.cylZ(11, 196, c.mat("shaft")), 0, 0, -32, o.wheel);                // shaft z -130..66, from the bearing's top face
    var mk = new T.Group(); mk.rotation.z = 0; o.wheel.add(mk);
    P.at(P.box(64, 5, 1, c.mat("wheel", "mark")), 50, 0, 1, mk);              // red stripe r 18..82, z 0.5..1.5, lifted off the drum's top
    P.at(P.cylZ(14, 2, c.mat("shaft", "dark")), 0, 0, 1, o.wheel);           // dark ring round the shaft, z 0..2

    // swinging arm on the top of the shaft
    o.arm = new T.Group(); G.add(o.arm);
    var ma = c.mat("arm");
    P.at(P.cylZ(16, 16, ma), 0, 0, K.HZ, o.arm);                              // collar z 44..60
    P.at(P.cylX(4, 206, ma), 113, 0, K.HZ, o.arm);                            // rod x 10..216, z 48..56
    P.at(P.sphere(5, ma), 216, 0, K.HZ, o.arm);                               // rounded end

    // pawl: hinged on the rod, hangs down and back
    o.pawl = P.pawl({ length: K.L, thick: 7, width: 12, side: 1, material: c.mat("pawl") });   // plate and hinge boss; boss axis along the rod
    P.at(o.pawl, K.RH, 0, K.HZ, o.arm);
    o.pawl.matrixAutoUpdate = true;

    // supports
    P.at(P.box(70, 70, 30, c.fixed), 0, 0, -145, G);                           // bearing x,y -35..35, z -160..-130; the shaft stands on its top face
    P.at(P.box(280, 280, 12, c.fixed), 0, 0, -166, G);                         // base x,y -140..140, z -172..-160; bearing stands on z -160
    this.place();
  },

  place: function () {
    var K = this.K, o = this.o, dx = Math.sqrt(Math.max(0, K.L * K.L - (K.HZ - o.h) * (K.HZ - o.h))), d = K.HZ - o.h;
    o.wheel.rotation.z = o.phi;
    o.arm.rotation.z = o.a;
    // pawl: its reach points down and a little back; its hinge axis is the rod
    var X = new this.G.position.constructor(0, dx / K.L, -d / K.L), Z = new this.G.position.constructor(1, 0, 0), Y = new this.G.position.constructor().crossVectors(Z, X);
    o.pawl.quaternion.setFromRotationMatrix(new (o.pawl.matrix.constructor)().makeBasis(X, Y, Z));
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, n = Math.max(1, Math.ceil(dt / .004)), i, sw = (+S.controls.swing) * Math.PI / 180;
    for (i = 0; i < n; i++) this.phys(dt / n, S.w, sw);
    this.place();
    var turned = Math.round((o.phi0 - o.phi) * 180 / Math.PI), moved = Math.round((o.phi0 - o.phi) / K.st);
    S.set("arm", Math.round((K.A0 - o.a) * 180 / Math.PI) + "°");
    S.set("wheel", turned + "°");
    S.set("teeth", moved + (moved === 1 ? " tooth" : " teeth"));
  }
});
