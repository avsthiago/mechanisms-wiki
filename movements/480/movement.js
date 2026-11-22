M507.define({
  number: 480,
  title: "Gasometer with a guide tube",
  lede: "A floating bell stores gas over water, rising as gas comes in and sinking as it goes out. A tube fixed to the bell slides over a standing tube in the tank. The standing tube keeps the bell straight and upright, so it cannot tilt or jam.",
  alt: "A dome-shaped bell with an open bottom stands in a round tank of water cut open to show the inside. A tall thin tube stands in the middle of the tank and passes through the roof of the bell. A wider tube hangs from the roof around it. Two thin gas pipes rise from the floor on each side.",
  parts: [
    { key: "bell", color: "#C8873A", name: "Bell and its tube", note: "An upside-down cup with no bottom, and a short tube joined to its roof that slides down over the standing tube. Watch the red band rise and fall." },
    { key: "post", color: "#4FA58A", name: "Standing tube", note: "Fixed to the floor of the tank. It stays still and guides the bell, like a rail." },
    { key: "pipes", color: "#5E7387", name: "Gas pipes", note: "One pipe brings gas in and the other takes it out. Both end above the water, inside the bell." }
  ],
  controls: [{ id: "ld", label: "Bell weight", value: "mid", options: [["light", "Light"], ["mid", "Medium"], ["heavy", "Heavy"]] }],
  readouts: [{ id: "g", label: "Flow" }, { id: "v", label: "Gas" }, { id: "p", label: "Push" }],
  closed: { label: "Tank" },
  views: { "3d": [95, 60, 790], front: [0, 5, 650], side: [650, 5, 0] },
  target: [0, 5, 0],
  how: [
    "Gas goes into the bell through one pipe, so the bell rises. When gas leaves through the other pipe, the bell sinks. Its open rim always stays under the water, which seals the gas in.",
    "The bell has no weights, so its own weight squeezes the gas. Look at the water inside the bell. It sits lower than the water outside, and the gap shows the squeeze. A narrow channel between the two tubes holds water at the outside level.",
    "The tube on the bell slides on the standing tube, so the bell can only move straight up and down. Try a light bell, then a heavy one. The heavy bell squeezes the gas harder and pushes the water inside lower. Choose Closed to see the gasometer as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The tank is round and cut open at the front so you can see inside. The sizes, the gap between the two tubes and the three bell weights are made up. The water outside is kept at one level, and the gas dots only show how much gas is in the bell.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { th: 2.6, h: 16, RB: 84, RI: 98, RO: 170, YW: -24, FL: -138, HB: 153, ph: 0, wkey: "" };
    var fix = c.fixed;
    // tank, front half cut away. Floor y -153..-138, wall r 98..170, ground at y 0
    scene.add(c.shell(P.halfSection({ material: fix, poly: [[0, -153], [o.RO, -153], [o.RO, 0], [o.RI, 0], [o.RI, o.FL], [0, o.FL]] }), "open"));
    scene.add(c.shell(P.wholeSection({ material: fix, poly: [[0, -153], [o.RO, -153], [o.RO, 0], [o.RI, 0], [o.RI, o.FL], [0, o.FL]] }), "closed"));   // closed view: the whole tank, solid
    var wm = new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .3, depthWrite: false });
    o.water = P.halfSection({ material: wm, poly: [[11.5, -137], [o.RI, -137], [o.RI, o.YW], [11.5, o.YW]] }); o.water.position.z = -.6; o.water.userData.live = true; scene.add(c.shell(o.water, "open"));
    var ring = new T.Mesh(new T.RingGeometry(82, o.RI, 64), wm); ring.rotation.x = -Math.PI / 2; ring.position.y = o.YW; scene.add(c.shell(ring, "closed"));   // closed view: the water between the bell (inside its wall, r 81.5..84) and the tank wall
    // standing tube: r 8..11.5, y -138..150, bottom on the floor
    scene.add(c.shell(P.halfSection({ material: c.mat("post"), poly: [[8, o.FL], [11.5, o.FL], [11.5, 150], [8, 150]] }), "open"));
    scene.add(c.shell(P.wholeSection({ material: c.mat("post"), poly: [[8, o.FL], [11.5, o.FL], [11.5, 150], [8, 150]] }), "closed"));
    // bell with its guide tube, rim and tube foot at group y 0. Tube wall r 13.5..17.5 up to the top of the roof.
    var HB = o.HB, outer = [], inner = [];
    for (k = 0; k <= 8; k++) { var u = k / 8; var e = 1 - (1 - u) * (1 - u); outer.push([o.RB - (o.RB - 17.5) * u, HB + 27 * e]); inner.push([o.RB - 2.5 - (o.RB - 20) * u, HB - 2.5 + 27 * e]); }
    var poly = [[13.5, 0], [17.5, 0], [17.5, HB + 24.5]];
    inner.reverse().forEach(function (p, j) { if (j > 0) poly.push(p); });
    poly.push([o.RB - 2.5, 0], [o.RB, 0]);
    outer.slice(0, -1).forEach(function (p) { poly.push(p); });
    poly.push([17.5, HB + 27], [13.5, HB + 27]);
    o.bell = P.at(new T.Group(), 0, 0, 0, scene);
    o.bell.add(c.shell(P.halfSection({ material: c.mat("bell"), poly: poly }), "open"));
    o.bell.add(c.shell(P.wholeSection({ material: c.mat("bell"), poly: poly }), "closed"));   // closed view: the whole bell
    o.bell.add(c.shell(P.halfSection({ material: c.mat("bell", "mark"), poly: [[o.RB, 50], [o.RB + .8, 50], [o.RB + .8, 62], [o.RB, 62]] }), "open"));
    o.bell.add(c.shell(P.wholeSection({ material: c.mat("bell", "mark"), poly: [[o.RB, 50], [o.RB + .8, 50], [o.RB + .8, 62], [o.RB, 62]] }), "closed"));
    // gas pipes, in on the right, out on the left (r 4, y -138..-6)
    P.at(P.cylY(4, 133, c.mat("pipes")), -36, -72.5, 0, scene);
    P.at(P.cylY(4, 133, c.mat("pipes")), 36, -72.5, 0, scene);
    o.gas = P.waterDots(130, { radius: 1.8, color: "#7C8896", opacity: .55 }); scene.add(o.gas);
    o.fl = P.waterDots(20, { radius: 2.4, color: "#E0A431", opacity: .95 }); o.fl.material.depthTest = false; o.fl.renderOrder = 10; scene.add(o.fl);   // drawn over everything when open; behind the walls when closed (see step)
    o.rnd = []; for (i = 0; i < 130; i++) o.rnd.push([24 + Math.random() * (o.RB - 34), Math.random() * Math.PI, Math.random(), Math.random() * 6.28]);
    o.hs = { light: 8, mid: 16, heavy: 26 };
  },

  step: function (c, dt, S) {
    var o = this.o, i, hT = o.hs[S.controls.ld];
    o.th += S.w * dt;
    var f = .5 - .5 * Math.cos(o.th), dfdt = .5 * Math.sin(o.th) * S.w, rim = -126 + 64 * f;
    o.h += (hT - o.h) * (dt === 0 ? 1 : Math.min(1, 6 * dt));
    var yi = o.YW - o.h, wkey = o.h.toFixed(1);
    o.bell.position.y = rim;
    if (wkey !== o.wkey) {
      o.wkey = wkey;
      o.water.set([[11.5, -137], [o.RI, -137], [o.RI, o.YW], [o.RB - 1.2, o.YW], [o.RB - 1.2, yi], [15.5, yi], [15.5, o.YW], [11.5, o.YW]]);
    }
    var top = rim + o.HB - 6, n = Math.round(130 * Math.max(.05, (top - yi) / 170)), t = performance.now() / 1000;
    for (i = 0; i < 130; i++) {
      var q = o.rnd[i];
      if (i >= n) { o.gas.put(i, 0, 0, 0, 0); continue; }
      var ry = yi + 5 + q[2] * (top - yi - 5) + 2 * Math.sin(t * 1.3 + q[3]);
      o.gas.put(i, q[0] * Math.cos(q[1]) + 2 * Math.sin(t + q[3]), ry, -q[0] * Math.sin(q[1]), 1);
    }
    o.gas.flush();
    var moving = Math.abs(dfdt) > 1e-4, dir = dfdt > 0 ? 1 : -1;
    o.ph = (o.ph + dt * (.3 + .5 * Math.min(1, Math.abs(S.w) / 1.5)) * (moving ? 1 : 0)) % 1;
    for (i = 0; i < 20; i++) {
      var pipe = i < 10 ? 1 : -1, j = i % 10, u = (j / 10 + o.ph) % 1;
      if (!(moving && ((pipe === 1 && dir > 0) || (pipe === -1 && dir < 0)))) { o.fl.put(i, 0, 0, 0, 0); continue; }
      var y = pipe === 1 ? -134 + u * 140 : 6 - u * 140, sc = y > -6 ? Math.max(0, 1 - (y + 6) / 24) : 1;
      o.fl.put(i, pipe * 36, y, 0, sc);
    }
    o.fl.flush(); o.fl.material.depthTest = S.controls.case === "closed";   // open: drawn over the cut tank; closed: behind its walls
    S.set("g", moving ? (dir > 0 ? "In" : "Out") : "Still");
    S.set("v", Math.round(f * 100) + " %");
    S.set("p", Math.round(o.h * 1.5) + " mm");
  }
});
