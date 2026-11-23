M507.define({
  number: 167,
  title: "Drum with an endless spiral groove",
  lede: "An upright drum has one groove that runs all the way round it. Half the groove slants up and half slants down. A stud on a sliding block rides in the groove, so the block goes up and down once for every turn of the drum. Brown says this was used in place of a crank in a steam engine.",
  alt: "An upright drum between a top plate and a bottom plate. A dark groove runs diagonally across its front face. On the right, a block slides on an upright rod, and a short red stud reaches from the block into the groove.",
  parts: [
    { key: "drum", color: "#5E7387", name: "Grooved drum", note: "An upright drum that turns on a shaft. One groove runs right round it, up on one side and down on the other, and joins up with itself." },
    { key: "pin", color: "#C2503F", name: "Stud", note: "A short peg that fits in the groove. Watch it: it is pushed up for half a turn and down for the other half." },
    { key: "carriage", color: "#C8873A", name: "Sliding block", note: "A block that slides up and down an upright rod. It carries the stud and can only move straight up and down." }
  ],
  controls: [{ id: "stroke", label: "How far the block slides", value: "40", options: [["25", "Short"], ["40", "Medium"], ["55", "Long"]] }],
  readouts: [{ id: "pos", label: "Block height" }, { id: "vel", label: "Block speed" }],
  views: { "3d": [270, 120, 360], front: [0, 0, 440], side: [430, 40, 0] },
  target: [10, 0, 0],
  how: [
    "Watch the red stud. The drum turns, and the groove slides past it. On the front of the drum the groove slants down to the right. On the back it slants up again. The wall of the groove pushes the stud, and the stud pushes the block.",
    "The groove has no end. Where the downward slope finishes, it turns round and starts the upward slope. So the drum can keep turning the same way while the block goes up, then down, then up again. Each trip takes half a turn.",
    "It also works the other way. If the block is pushed up and down, the stud pushes on the groove walls and spins the drum. That is how it could replace a crank. Try Short, Medium and Long. A longer trip means the block must go faster to finish it in the same turn."
  ],
  note: "This model is rebuilt from Brown's drawing. The top and bottom plates, the shaft, the upright rod, the sliding block and the stud were made up. So were the drum's size and the depth and width of the groove. Brown shows only a thin line for the groove. Here it is cut into the drum so the stud can sit in it. The groove is shaped so the block moves at a steady speed, with a short smooth turn at each end. The choice of how far the block slides was added.",

  G: { R: 36, DEPTH: 5, HW: 5, L: 160, RP: 3, E: .08 },

  // smooth triangle wave, period 1, peaks +1 at whole numbers and -1 at halves, corners rounded over a width E either side
  wave: function (u) {
    var E = this.G.E, d = Math.abs(u - Math.round(u)), t;
    if (d < E) t = 1 - 4 * (d * d / (2 * E) + E / 2);
    else if (.5 - d < E) { var e = .5 - d; t = -1 + 4 * (e * e / (2 * E) + E / 2); }
    else t = 1 - 4 * d;
    return t / (1 - 2 * E);
  },
  pathX: function (phi, A) { return A * this.wave(phi / (2 * Math.PI)); },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene;
    var o = this.o = { th: 0, A: null, dyn: [] };
    // axis of the drum is local X; the outer group turns local X into world Y
    o.outer = new T.Group(); o.outer.rotation.z = Math.PI / 2; scene.add(o.outer);
    o.drum = new T.Group(); o.outer.add(o.drum);
    // grooved surface local x -80..80; end caps x 80..83 and -83..-80; shaft x -100..100 ends on the plate faces
    P.at(P.cylX(7, 200, c.mat("drum")), 0, 0, 0, o.drum);
    P.at(P.cylX(G.R, 3, c.mat("drum", "light")), 81.5, 0, 0, o.drum);
    P.at(P.cylX(G.R, 3, c.mat("drum", "light")), -81.5, 0, 0, o.drum);
    // turning mark on the top cap face, x 83..84.4, y 8..32
    P.at(P.box(1.4, 24, 5, c.mat("drum", "dark")), 83.7, 20, 0, o.drum);
    // sliding block on the fixed rod, stud from the groove floor out to the block face
    o.fol = new T.Group(); scene.add(o.fol);
    P.at(P.guideBlock({ w: 24, h: 30, d: 24, hole: 5.5, material: c.mat("carriage") }), 64, 0, 0, o.fol);   // x 52..76, hole round the rod
    P.at(P.cylX(G.RP, 20, c.mat("pin", "mark")), 42, 0, 0, o.fol);                  // x 32..52, groove floor is at x 31
    P.at(P.cylY(5, 200, c.fixed), 64, 0, 0, scene);                                // rod x 59..69, y -100..100, plate face to plate face
    // frame: top plate x -50..80, y 100..110, z -40..40; bottom plate y -110..-100
    P.at(P.box(130, 10, 80, c.fixed), 15, 105, 0, scene);
    P.at(P.box(130, 10, 80, c.fixed), 15, -105, 0, scene);
  },

  makeDrum: function (c, A) {
    var G = this.G, o = this.o, self = this;
    o.dyn.forEach(function (m) { o.drum.remove(m); m.geometry.dispose(); });
    var m = c.P.groovedDrum({ radius: G.R, depth: G.DEPTH, length: G.L, halfWidth: G.HW, material: c.mat("drum"), floorMaterial: c.mat("drum", "dark"),
      path: function (phi) { return self.pathX(phi, A); } });
    o.dyn = m.children.slice();
    o.dyn.forEach(function (k) { o.drum.add(k); });
    o.A = A;
  },

  step: function (c, dt, S) {
    var o = this.o, A = +S.controls.stroke || 40;
    if (A !== o.A) this.makeDrum(c, A);
    o.th += S.w * dt;
    var phi = Math.PI - o.th, h = .002;                    // angle round the drum that is under the stud
    var y = this.pathX(phi, A);
    o.drum.rotation.x = o.th;
    o.fol.position.y = y;
    var v = -(this.pathX(phi + h, A) - this.pathX(phi - h, A)) / (2 * h) * S.w;
    S.set("pos", Math.round(y + A) + " mm");
    S.set("vel", (v > .5 ? "+" : "") + v.toFixed(0) + " mm/s");
  }
});
