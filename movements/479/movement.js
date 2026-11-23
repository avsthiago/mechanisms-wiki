M507.define({
  number: 479,
  title: "Gasometer",
  lede: "A big upside-down cup floats in a tank of water and holds gas. When gas flows in, the cup rises. When gas flows out, it sinks. Weights on ropes carry part of the cup's weight, and they decide how hard the gas is squeezed.",
  alt: "A dome-shaped bell with an open bottom stands in a tank of water cut open to show the inside. Two ropes run from the bell up over two pulleys to two heavy balls. Two thin pipes rise through the floor of the tank into the bell.",
  parts: [
    { key: "bell", color: "#C8873A", name: "Bell", note: "An upside-down cup with no bottom. Its rim stays under the water, so the gas cannot escape. Watch the red band rise and fall." },
    { key: "weights", color: "#8E7AA8", name: "Counterweights", note: "Two heavy balls on ropes. They hold up part of the bell's weight, not all of it." },
    { key: "ropes", color: "#D9B13B", name: "Ropes and pulleys", note: "Each rope runs from the bell over a pulley to a ball. When the bell goes up, the balls come down." },
    { key: "pipes", color: "#4FA58A", name: "Gas pipes", note: "One pipe brings gas in and the other takes it out. Both end above the water, inside the bell." }
  ],
  controls: [{ id: "cw", label: "Counterweights", value: "mid", options: [["small", "Small"], ["mid", "Medium"], ["large", "Big"]] }],
  readouts: [{ id: "g", label: "Flow" }, { id: "v", label: "Gas" }, { id: "p", label: "Push" }],
  closed: { label: "Tank" },
  views: { "3d": [110, 70, 790], front: [0, 25, 800], side: [800, 25, 0] },
  target: [0, 18, 0],
  how: [
    "Gas goes into the bell through one pipe. The bell has no bottom, so the gas pushes up on the roof and the bell rises. When gas leaves by the other pipe, the bell sinks. The water seals the rim in every position.",
    "Look at the water inside the bell. It sits lower than the water outside. The gas has to push the water down to make room, and the gap shows how hard the gas is squeezed. That squeeze is the weight the gas carries, spread over the roof.",
    "The balls take weight off the gas. Try small balls, then big ones. With big balls the bell is lighter, the squeeze is gentler and the water inside sits nearly level with the water outside. Choose Closed to see the gasometer as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The tank is round and cut open at the front so you can see inside. The posts that hold the pulleys, the sizes, the rope lengths and the three ball sizes are made up. The water level outside is kept steady, and the gas dots only show how much gas is in the bell.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { th: 2.6, f: .93, h: 0, RB: 90, RI: 100, RO: 200, YW: -33, FL: -170, PY: 187, PR: 22, CX: 116.5, HB: 195, ph: 0, key: "", wkey: "" };
    var fix = c.fixed;
    // tank: round, front half cut away. Floor y -185..-170, wall r 100..200, ground at y 0
    var tank = P.halfSection({ material: fix, poly: [[0, -185], [o.RO, -185], [o.RO, 0], [o.RI, 0], [o.RI, o.FL], [0, o.FL]] }); scene.add(c.shell(tank, "open"));
    scene.add(c.shell(P.wholeSection({ material: fix, poly: [[0, -185], [o.RO, -185], [o.RO, 0], [o.RI, 0], [o.RI, o.FL], [0, o.FL]] }), "closed"));   // closed view: the whole tank, solid
    // water, set to the right level in step()
    var wm = new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .3, depthWrite: false });
    o.water = P.halfSection({ material: wm, poly: [[0, -169], [o.RI, -169], [o.RI, o.YW], [0, o.YW]] }); o.water.position.z = -.6; o.water.userData.live = true; scene.add(c.shell(o.water, "open"));
    var ring = new T.Mesh(new T.RingGeometry(88, o.RI, 64), wm); ring.rotation.x = -Math.PI / 2; ring.position.y = o.YW; scene.add(c.shell(ring, "closed"));   // closed view: the water between the bell (inside its wall, r 87.5..90) and the tank wall
    // bell: wall r 87.5..90, roof domed, rim at group y = 0
    var HB = o.HB, dome = [], dome2 = [];
    for (k = 0; k <= 8; k++) { var a = k / 8 * Math.PI / 2; dome.push([o.RB * Math.cos(a), HB + 40 * Math.sin(a)]); dome2.push([(o.RB - 2.5) * Math.cos(a), HB + 37.5 * Math.sin(a)]); }
    var poly = [[o.RB - 2.5, 0], [o.RB, 0]].concat(dome, dome2.reverse());
    o.bell = P.at(new T.Group(), 0, 0, 0, scene);
    o.bell.add(c.shell(P.halfSection({ material: c.mat("bell"), poly: poly }), "open"));
    o.bell.add(c.shell(P.wholeSection({ material: c.mat("bell"), poly: poly }), "closed"));   // closed view: the whole bell
    var band = P.halfSection({ material: c.mat("bell", "mark"), poly: [[o.RB, 60], [o.RB + .8, 60], [o.RB + .8, 72], [o.RB, 72]] }); o.bell.add(c.shell(band, "open"));
    o.bell.add(c.shell(P.wholeSection({ material: c.mat("bell", "mark"), poly: [[o.RB, 60], [o.RB + .8, 60], [o.RB + .8, 72], [o.RB, 72]] }), "closed"));
    // pulleys on posts, ropes, balls
    o.sides = [];
    for (k = -1; k <= 1; k += 2) {
      var s = { k: k, cx: k * o.CX };
      P.at(P.box(10, o.PY, 8, fix), s.cx, o.PY / 2, -16, scene);                         // post x cx±5, y 0..187, z -20..-12
      P.at(P.cylZ(o.PR, 8, c.mat("ropes")), s.cx, o.PY, 0, scene);                       // pulley z -4..4
      P.at(P.cylZ(3, 18, c.mat("ropes", "dark")), s.cx, o.PY, -3, scene);                // axle z -12..6, from the post face
      var wrap = P.arc(o.PR + 1.5, 1.5, Math.PI, c.mat("ropes")); P.at(wrap, s.cx, o.PY, 0, scene);
      s.inner = P.at(P.rod(1.5, c.mat("ropes")), 0, 0, 0, scene); s.outer = P.at(P.rod(1.5, c.mat("ropes")), 0, 0, 0, scene);
      s.knob = P.at(P.sphere(3.5, c.mat("ropes")), 0, 0, 0, scene);
      s.ball = P.at(P.sphere(1, c.mat("weights")), 0, 0, 0, scene);
      o.sides.push(s);
    }
    // gas pipes: in on the right, out on the left
    P.at(P.cylY(7, 149, c.mat("pipes")), -14, -96.5, 0, scene);                            // y -170..-22, on the floor top
    P.at(P.cylY(7, 149, c.mat("pipes")), 14, -96.5, 0, scene);
    // gas dots in the bell and in the pipes
    o.gas = P.waterDots(150, { radius: 1.8, color: "#7C8896", opacity: .55 }); scene.add(o.gas);
    o.fl = P.waterDots(20, { radius: 2.6, color: "#E0A431", opacity: .95 }); o.fl.material.depthTest = false; o.fl.renderOrder = 10; scene.add(o.fl);   // drawn over everything when open; behind the walls when closed (see step)
    o.rnd = []; for (i = 0; i < 150; i++) o.rnd.push([20 + Math.random() * (o.RB - 30), Math.random() * Math.PI, Math.random(), Math.random() * 6.28]);
    o.sizes = { small: 14, mid: 19, large: 24 };
  },

  step: function (c, dt, S) {
    var o = this.o, i, k, cw = o.sizes[S.controls.cw];
    o.th += S.w * dt;
    var f = .5 - .5 * Math.cos(o.th), dfdt = .5 * Math.sin(o.th) * S.w;
    var rim = -160 + 97 * f;
    // weights: bigger balls carry more of the bell; the squeeze on the gas is the net weight over the roof area
    var bellW = 32000, net = bellW - 2 * Math.pow(cw, 3), hT = net * .0008;
    o.h += (hT - o.h) * Math.min(1, 6 * dt + (dt === 0 ? 1 : 0));
    var yi = o.YW - o.h;
    o.bell.position.y = rim;
    var wkey = (+o.h).toFixed(1);
    if (wkey !== o.wkey) {
      o.wkey = wkey;
      o.water.set([[0, -169], [o.RI, -169], [o.RI, o.YW], [o.RB - 1.2, o.YW], [o.RB - 1.2, yi], [0, yi]]);
    }
    var a = rim + o.HB, wt = 374 - a - 182, r = cw;
    o.sides.forEach(function (s) {
      var xi = s.cx - s.k * 23.5, xo = s.cx + s.k * 23.5;                                // rope on the bell side, rope on the ball side
      s.inner.span(xi, a, 0, xi, o.PY, 0); s.outer.span(xo, o.PY, 0, xo, wt, 0);
      s.knob.position.set(xi, a, 0);
      s.ball.scale.set(r, r, r); s.ball.position.set(xo, wt - 4 - r, 0);
    });
    // gas dots fill the bell; more gas means more dots, at the same density
    var top = rim + o.HB - 4, n = Math.round(150 * Math.max(.05, (top - yi) / 190)), t = performance.now() / 1000;
    for (i = 0; i < 150; i++) {
      var q = o.rnd[i];
      if (i >= n) { o.gas.put(i, 0, 0, 0, 0); continue; }
      var ry = yi + 5 + q[2] * (top - yi - 5) + 2 * Math.sin(t * 1.3 + q[3]);
      o.gas.put(i, q[0] * Math.cos(q[1]) + 2 * Math.sin(t + q[3]), ry, -q[0] * Math.sin(q[1]), 1);
    }
    o.gas.flush();
    // arrows of dots in the pipes
    var moving = Math.abs(dfdt) > 1e-4, dir = dfdt > 0 ? 1 : -1;
    o.ph = (o.ph + dt * (.3 + .5 * Math.min(1, Math.abs(S.w) / 1.5)) * (moving ? 1 : 0)) % 1;
    for (i = 0; i < 20; i++) {
      var pipe = i < 10 ? 1 : -1, j = i % 10, u = (j / 10 + o.ph) % 1;
      var on = moving && ((pipe === 1 && dir > 0) || (pipe === -1 && dir < 0));
      if (!on) { o.fl.put(i, 0, 0, 0, 0); continue; }
      var y = pipe === 1 ? -165 + u * 170 : 5 - u * 170;
      var sc = (y > -22 ? Math.max(0, 1 - (y + 22) / 24) : 1);
      o.fl.put(i, pipe * 14, y, 0, sc);
    }
    o.fl.flush(); o.fl.material.depthTest = S.controls.case === "closed";   // open: drawn over the cut tank; closed: behind its walls
    S.set("g", moving ? (dir > 0 ? "In" : "Out") : "Still");
    S.set("v", Math.round(f * 100) + " %");
    S.set("p", Math.round(o.h * 1.5) + " mm");
  }
});
