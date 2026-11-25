M507.define({
  number: 407,
  title: "Drawing pointed arches",
  lede: "A springy wooden strip is bent into a curve by a cord. A pencil run along the bent strip draws the curve. This gives a smooth pointed arch with no compass, however wide the opening is.",
  alt: "A long flat bar lying across the bottom with a slot and a slide. A thin curved strip of wood stands up from its left end beside a wall, bends over to the right and is held down by a cord tied to the slide.",
  parts: [
    { key: "bar", color: "#5E7387", name: "Slotted bar", note: "The long flat bar along the bottom. It sits against the foot of the wall. A small block at its left end holds the strip upright." },
    { key: "slide", color: "#C8873A", name: "Slide and pin", note: "Slides along the slot and carries the pin that the cord is tied to. Moving it sets how wide the arch will be." },
    { key: "arch", color: "#4FA58A", name: "Springy strip", note: "A thin strip of elastic wood. It stands upright at its foot and bends as the cord pulls its end down." },
    { key: "cord", color: "#D9B13B", name: "Cord", note: "Joins the end of the strip to the pin on the slide. It stays upright and pulls the strip over." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Runs along the outside edge of the bent strip. Watch the red line it leaves behind." }
  ],
  controls: [{ type: "range", id: "w", label: "Width of the arch", min: 160, max: 240, step: 5, value: 215, unit: " mm", presets: [[170, "Narrow"], [215, "Medium"], [240, "Wide"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "s", label: "Slide" }, { id: "h", label: "Height" }],
  views: { "3d": [-157, 30, 584], front: [115, 85, 760], side: [650, 90, 230] },
  target: [115, 85, 0],
  distance: [250, 1400],
  how: [
    "The strip stands upright at its foot, held by a small block. The cord pulls straight down on its other end. Watch the strip bow over to the right as the slide moves out along the slot.",
    "A springy strip bends most where the pull is strongest, and that is near its foot. So it bends smoothly all the way along and never kinks. The pencil on its end draws that smooth curve on the paper.",
    "The slide can stop anywhere along the slot. Try Narrow, then Wide, and see how the arch gets lower and flatter as it gets wider."
  ],
  note: "This model is rebuilt from Brown's drawing. The paper behind, the wall and the pencil were added to show the line. Brown fixes the pencil to the strip, so here it is simply run along the strip once it is bent. The strip bends as a real springy strip does, found by working out its shape for each slide position. Brown does not say how the cord is kept the right length, so here it simply gets shorter as the strip bends. The sizes are made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { L: 310, N: 48, hw: 7, ht: 4, ph: 0, w: null, pf: 0, last: 0 }, N = o.N;
    // paper behind, wall on the left, bar along the bottom (bar top is y = 0)
    P.at(P.box(340, 320, 2, c.fixed), 110, 100, -8.5, c.scene);                                      // paper: x -60..280, y -60..260, z -9.5..-7.5
    P.at(P.box(6, 250, 10, c.fixed), -10, 125, 0, c.scene);                                          // wall: x -13..-7, y 0..250, z -5..5
    P.at(P.rulerPlate({ points: [[-45, -34], [275, -34], [275, 0], [-45, 0]], slots: [{ x0: -2, x1: 250, y: -23, w: 12 }], z0: -5, depth: 10, material: c.mat("bar") }), 0, 0, 0, c.scene);   // x -45..275, y -34..0, z -5..5
    P.at(P.box(18, 20, 7, c.mat("bar")), 16, 10, 0, c.scene);                                        // holding block: x 7..25, y 0..20, z -3.5..3.5
    // slide on the front of the bar
    o.slide = new T.Group(); c.scene.add(o.slide);
    P.at(P.box(26, 22, 2, c.mat("slide")), 0, 0, 6, o.slide);                                        // plate z 5..7
    P.at(P.cylZ(5.5, 9.8, c.mat("slide")), 0, 0, 0.1, o.slide);                                      // stem through the slot, z -4.8..5
    P.at(P.cylZ(3, 4, c.mat("slide", "dark")), 0, 0, 9, o.slide);                                    // pin, z 7..11
    // springy strip: a live ribbon
    var nv = 4 * (N + 1) * 2, pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = [], f, i;
    for (f = 0; f < 4; f++) for (i = 0; i < N; i++) {
      var a = (f * (N + 1) + i) * 2, b = a + 1, a2 = a + 2, b2 = b + 2;
      idx.push(a, b2, b, a, a2, b2);
    }
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos, 3)); g.setAttribute("normal", new T.BufferAttribute(nor, 3)); g.setIndex(idx);
    o.strip = P.at(new T.Mesh(g, c.mat("arch")), 0, 0, 0, c.scene); o.strip.frustumCulled = false; o.strip.userData.live = true;
    o.pos = pos; o.nor = nor; o.g = g;
    // block on the end of the strip, with the cord tie in front
    o.tip = new T.Group(); c.scene.add(o.tip);
    P.at(P.box(18, 16, 14.5, c.mat("arch", "dark")), 0, -6, 2.75, o.tip);                              // block y -14..2, z -4.5..10
    // pencil on the paper, leaning away from the strip; its point is at the group's origin
    o.pen = new T.Group(); c.scene.add(o.pen); o.penIn = new T.Group(); o.penIn.rotation.y = -50 * Math.PI / 180; o.pen.add(o.penIn);
    var cone = new T.Mesh(new T.ConeGeometry(2.2, 6, 14), c.mat("pencil", "dark")); cone.rotation.z = Math.PI / 2; cone.position.x = 3; o.penIn.add(cone);
    P.at(P.cylX(2.2, 26, c.mat("pencil")), 19, 0, 0, o.penIn);
    o.cord = P.at(P.rod(1.4, c.mat("cord")), 0, 0, 0, c.scene);
    o.line = P.trail({ color: 0xC2503F, max: 900, step: 0.8 }); c.scene.add(o.line);
  },

  // shape of the springy strip when its end is pulled straight down, found from the pendulum form of the elastica
  shape: function (pm) {
    var o = this.o, L = o.L, N = o.N, m = Math.pow(Math.sin(pm / 2), 2), a = 1, b = Math.sqrt(1 - m), i, t;
    for (i = 0; i < 30; i++) { t = (a + b) / 2; b = Math.sqrt(a * b); a = t; }
    var K = Math.PI / (2 * a), k = Math.pow(K / L, 2), w = Math.sqrt(2 * k * (1 - Math.cos(pm))), h = L / N, psi = 0, x = 0, y = 0, pts = [[0, 0, 0]];
    function f(p) { return -k * Math.sin(p); }
    for (i = 0; i < N; i++) {
      var k1p = w, k1w = f(psi), k2p = w + h / 2 * k1w, k2w = f(psi + h / 2 * k1p), k3p = w + h / 2 * k2w, k3w = f(psi + h / 2 * k2p), k4p = w + h * k3w, k4w = f(psi + h * k3p);
      var p2 = psi + h / 6 * (k1p + 2 * k2p + 2 * k3p + k4p); w += h / 6 * (k1w + 2 * k2w + 2 * k3w + k4w);
      x += h * (Math.sin(psi) + Math.sin(p2)) / 2; y += h * (Math.cos(psi) + Math.cos(p2)) / 2; psi = p2; pts.push([x, y, psi]);
    }
    return pts;
  },

  // tilt angle at the end of the strip that puts its end a distance D to the right of its foot
  tiltFor: function (D) {
    var lo = 0, hi = 115 * Math.PI / 180, i;
    for (i = 0; i < 40; i++) { var mid = (lo + hi) / 2, p = this.shape(mid); if (p[p.length - 1][0] < D) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  },

  pose: function (c, pm) {
    var o = this.o, pts = this.shape(pm), N = o.N, i, e = pts[N], hw = o.hw, ht = o.ht, P = o.pos, Nn = o.nor, f, j;
    for (i = 0; i <= N; i++) {
      var p = pts[i], nx = Math.cos(p[2]), ny = -Math.sin(p[2]);
      var cx = [p[0] + nx * hw, p[0] - nx * hw, p[0] - nx * hw, p[0] + nx * hw], cy = [p[1] + ny * hw, p[1] - ny * hw, p[1] - ny * hw, p[1] + ny * hw], cz = [ht, ht, -ht, -ht];
      for (f = 0; f < 4; f++) for (j = 0; j < 2; j++) {
        var v = ((f * (N + 1) + i) * 2 + j) * 3, q = (f + j) % 4;
        P[v] = cx[q]; P[v + 1] = cy[q]; P[v + 2] = cz[q];
        var fn = f === 0 ? [0, 0, 1] : f === 1 ? [-nx, -ny, 0] : f === 2 ? [0, 0, -1] : [nx, ny, 0];
        Nn[v] = fn[0]; Nn[v + 1] = fn[1]; Nn[v + 2] = fn[2];
      }
    }
    o.g.attributes.position.needsUpdate = true; o.g.attributes.normal.needsUpdate = true;
    o.edge = []; for (i = 0; i <= N; i++) { var q = pts[i]; o.edge.push([q[0] - Math.cos(q[2]) * (hw + 1.4), q[1] + Math.sin(q[2]) * (hw + 1.4), q[2]]); }
    o.tip.position.set(e[0], e[1], 0); o.tip.rotation.z = -e[2];
    o.slide.position.set(e[0], -23, 0);
    o.cord.span(e[0], e[1], 9, e[0], -23, 9);
    return e;
  },

  // draw the pencil line along the outside edge up to fraction t of the strip, and put the pencil at its end
  draw: function (t) {
    var o = this.o, N = o.N, k = Math.min(N, Math.floor(t * N)), fr = t * N - k, i, a, b, x, y;
    o.line.clear(); o.pen.visible = t > 0 && t < 1;
    if (t <= 0) return;
    for (i = 0; i <= k; i++) o.line.push(o.fin[i][0], o.fin[i][1], -7);
    a = o.fin[k]; b = o.fin[Math.min(N, k + 1)]; x = a[0] + (b[0] - a[0]) * fr; y = a[1] + (b[1] - a[1]) * fr;
    o.line.push(x, y, -7);
    o.pen.position.set(x, y, -7.5); o.pen.rotation.z = Math.PI + a[2];
  },

  step: function (c, dt, S) {
    var o = this.o, W = +S.controls.w, e;
    function ease(x) { x = Math.max(0, Math.min(1, x)); return .5 - .5 * Math.cos(Math.PI * x); }
    if (W !== o.w) { o.w = W; o.pf = this.tiltFor(W); o.ph = 0; this.pose(c, o.pf); o.fin = o.edge.slice(); }   // finished arch: edge points of the fully bent strip
    o.ph += S.w * dt / (2 * Math.PI);
    var u = o.ph - Math.floor(o.ph), b, t;
    if (u < .15) { b = 1; t = 1; } else if (u < .4) { b = 1 - ease((u - .15) / .25); t = 1; } else if (u < .45) { b = 0; t = 1; } else if (u < .5) { b = 0; t = 0; }
    else if (u < .75) { b = ease((u - .5) / .25); t = 0; } else if (u < .95) { b = 1; t = ease((u - .75) / .2); } else { b = 1; t = 1; }
    e = this.pose(c, o.pf * b);
    this.draw(t);
    S.set("s", Math.round(e[0]) + " mm");
    S.set("h", Math.round(e[1]) + " mm");
  }
});
