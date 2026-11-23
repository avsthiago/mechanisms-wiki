M507.define({
  number: 426,
  title: "Rotary engine with sliding pistons",
  lede: "Steam turns a round hub inside a casing with two bulges. Two flat pistons slide in and out of the hub so they always reach the wall. Steam pushes on both pistons at once, so the shaft is pulled round evenly.",
  alt: "A casing on a foot with its front cover off. A round blue hub in the middle touches the casing at the left and the right. Two orange bars stick out of the hub, one up into a curved room and one down into another. Two pipes enter on each side.",
  parts: [
    { key: "case", color: "#4FA58A", name: "Cylinder", note: "The casing. It bulges out above and below the hub, and closes in to touch the hub at the left and the right. Those two touching places stand still and block the steam." },
    { key: "hub", color: "#5E7387", name: "Hub", note: "A round block fixed on the shaft. Watch its red stripe. Two grooves cut into it hold the pistons." },
    { key: "vane", color: "#C8873A", name: "Sliding pistons", note: "Two flat bars that slide in grooves in the hub. Each one slides out to reach the wall and back in to pass the touching places." }
  ],
  controls: [{ id: "steam", label: "Top steam enters by", value: "right", options: [["left", "Left pipe"], ["right", "Right pipe"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "rpm", label: "Shaft" }, { id: "out", label: "Piston out" }],
  views: { "3d": [130, 100, 500], front: [0, -8, 530], side: [600, -8, 0] },
  target: [0, -8, 0],
  how: [
    "Look at the two curved rooms, one above the hub and one below. An orange piston stands across each room like a door. Steam comes in behind the piston, shown as dark blue dots, and pushes it along. The pale dots in front of it are used steam on its way out.",
    "At the left and the right the casing closes in until it touches the hub. Steam cannot get past there. But the pistons must get past, so they slide back into the hub. Once through, they slide out again into the next room.",
    "Each room has its own pipe in and its own pipe out. So both pistons are pushed at the same time, on opposite sides of the shaft. Watch how far a piston sticks out as it goes round. Then swap the pipes and the shaft turns the other way. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front cover is left off, and the steam is drawn as small blue balls so you can see it move. Brown does not show what pushes the pistons out against the wall, so here they simply follow it. For a moment, while a piston crosses the mouth of a pipe, nothing separates the two pipes of that room. The straight pipes, the exact curve of the wall, the sizes and the choice of pipe were made up.",

  /* The wall is drawn as the curve that the round end of a piston touches. The centre of that round end (radius 5) is
     at distance rc(a) from the shaft when the piston stands at angle a: 65 inside the two touching places (so the end
     is level with the hub, radius 70), rising smoothly to 95 in the rooms. The wall is that path pushed out by 5 along
     its normal, so the piston end always touches it exactly. */
  _rc: function (a) {
    var d = Math.abs(Math.sin(a)), d0 = Math.sin(8 * Math.PI / 180), d1 = Math.sin(40 * Math.PI / 180), u = Math.max(0, Math.min(1, (d - d0) / (d1 - d0)));
    return 65 + 30 * (.5 - .5 * Math.cos(Math.PI * u));
  },
  _wall: function (a, out) {                               // with `out`, writes the hub point and the wall point into it instead
    var h = 1e-4, r = this._rc(a), dr = (this._rc(a + h) - this._rc(a - h)) / (2 * h), ca = Math.cos(a), sa = Math.sin(a);
    var tx = dr * ca - r * sa, ty = dr * sa + r * ca, tl = Math.sqrt(tx * tx + ty * ty);
    if (out) { out[0] = 70 * ca; out[1] = 70 * sa; out[2] = r * ca + 5 * ty / tl; out[3] = r * sa - 5 * tx / tl; return out; }
    return [r * ca + 5 * ty / tl, r * sa - 5 * tx / tl];
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, self = this, W = 112, mc = c.mat("case"), D = Math.PI / 180;
    var o = this.o = { th: 0 };
    function arc(cx, cy, rad, a0, a1, n) { var p = [], i, a; for (i = 0; i <= n; i++) { a = (a0 + (a1 - a0) * i / n) * D; p.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); } return p; }
    function wall(a0, a1, n) { var p = [], i; for (i = 0; i <= n; i++) p.push(self._wall((a0 + (a1 - a0) * i / n) * D)); return p; }
    function flip(p) { return p.map(function (q) { return [-q[0], -q[1]]; }); }
    var A0 = 8, A1 = 22, w1 = this._wall(A1 * D), yp = w1[1], yq = yp + 12, yn = this._wall(A0 * D)[1], ao = Math.asin(yq / W) / D, xo = W * Math.cos(ao * D);
    o.A0 = A0 * D; o.yp = yp; o.yn = yn;
    // top wall: pipe roof y yp..yq out to x 150, outside radius 112, inside along the wall from 22 to 158 degrees
    var top = [[150, yp], [150, yq], [xo, yq]].concat(arc(0, 0, W, ao, 180 - ao, 50), [[-xo, yq], [-150, yq], [-150, yp]], wall(180 - A1, A1, 80));
    // bottom wall: the same turned half round, with the foot (y -130..-118) on its outside
    var bot = [[-150, -yp], [-150, -yq], [-xo, -yq]].concat(arc(0, 0, W, 180 + ao, 240, 16), [[-56, -118], [-95, -118], [-95, -130], [95, -130], [95, -118], [56, -118]], arc(0, 0, W, 300, 360 - ao, 16), [[xo, -yq], [150, -yq], [150, -yp]], wall(360 - A1, 180 + A1, 80));
    // the two touching places: bars y -yn..yn between the pipes, their ends hollowed to fit the hub
    var nose = [[150, -yn]].concat(wall(-A0, A0, 8), [[150, yn]]);
    var back = [[150, yq], [xo, yq]].concat(arc(0, 0, W, ao, 180 - ao, 50), [[-xo, yq], [-150, yq], [-150, -yq], [-xo, -yq]], arc(0, 0, W, 180 + ao, 240, 16), [[-56, -118], [-95, -118], [-95, -130], [95, -130], [95, -118], [56, -118]], arc(0, 0, W, 300, 360 - ao, 16), [[xo, -yq], [150, -yq]]);
    [top, bot, nose, flip(nose)].forEach(function (p) { scene.add(P.outlinePlate({ points: p, depth: 40, z0: -20, material: mc })); });   // walls z -20..20
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: c.mat("case", "light") }), "open"));   // back cover z -26..-20; pale so the steam shows
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: mc }), "closed"));   // closed view: the same back cover in the casing colour
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: 20, material: mc }), "closed"));   // closed view: front cover z 20..26 on the walls
    // hub and shaft
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(70, 36, c.mat("hub")), 0, 0, -2, o.rot);                               // z -20..16, on the back cover
    P.at(P.cylZ(12, 104, c.mat("hub")), 0, 0, -8, o.rot);                              // shaft z -60..44
    P.at(P.cylZ(18, 3, c.mat("hub", "dark")), 0, 0, 17.5, o.rot);                      // collar z 16..19, on the hub face
    P.at(P.box(44, 5, 1, c.mat("hub", "mark")), 44, 0, 17, o.rot);                     // stripe x 22..66, z 16.5..17.5, lifted off the face (z 16)
    // pistons: bars 10 wide and 50 long with a round end, lying along the hub's local Y; z -20..17, 1 proud of the hub face
    o.v = [1, -1].map(function (s) {
      var g = new T.Group(), m = c.mat("vane");
      P.at(P.box(10, 50, 36.5, m), 0, -25, -1.25, g);                                  // y -50..0 from the centre of the round end; z -19.5..17
      P.at(P.cylZ(5, 36.5, m), 0, 0, -1.25, g);
      g.rotation.z = s > 0 ? 0 : Math.PI; o.rot.add(g); return g;
    });
    function sm(op) { return new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide }); }
    o.live = sm(.14); o.used = sm(.04);
    o.fill = [0, 1, 2, 3].map(function () { return c.fluid(P.at(P.ribbon({ material: o.live }), 0, 0, 15, scene)); });
    // pipes: sheets between the bar and the pipe roof, from the mouth out to x 150. Order: top right, top left, bottom left, bottom right
    o.pipe = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(function (s) {
      var m = P.at(P.ribbon({ n: 2, material: o.live }), 0, 0, 15, scene);
      m.set(function (x) { return [s[0] * x, s[1] * yn, s[0] * x, s[1] * yp]; }, w1[0], 150); return m;
    });
    // steam as moving balls: one region for each room, cut in two by the piston that is crossing it
    o.flow = P.steamFlow({ color: c.spot, count: 300, z0: -14, z1: 12 }); scene.add(o.flow);
    var ym = (yn + yp) / 2, room = function (t, out) { self._wall(t, out); };
    o.dom = [0, 1].map(function () { return o.flow.domain({ density: .012, pad: .07, f: room }); });
    o.bars = [0, 0, 0]; o.kinds = [0, 0]; o.ports = [0, 0];
    o.fp = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(function (s) { return o.flow.pipe({ points: [[s[0] * 175, s[1] * ym], [s[0] * 82, s[1] * ym]], width: (yp - yn) * .7 }); });
  },

  step: function (c, dt, S) {
    var o = this.o, self = this, dir = S.controls.steam === "left" ? -1 : 1, i;
    o.th += dir * S.w * dt;
    var a = 95 * Math.PI / 180 + o.th;                                                 // the pistons start nearly upright, as drawn
    o.rot.rotation.z = a - Math.PI / 2;
    o.v[0].position.y = this._rc(a); o.v[1].position.y = -this._rc(a + Math.PI);
    // each room runs from 8 to 172 degrees (and the same half a turn on); the piston in it divides fresh steam from used
    function f(t) { var w = self._wall(t); return [70 * Math.cos(t), 70 * Math.sin(t), w[0], w[1]]; }
    var A0 = o.A0, A9 = Math.PI - A0;
    for (i = 0; i < 2; i++) {
      var v = a + i * Math.PI; v -= 2 * Math.PI * Math.floor(v / (2 * Math.PI));
      var up = v < Math.PI, base = up ? 0 : Math.PI, vv = Math.max(A0, Math.min(A9, v - base));
      var lo = o.fill[up ? 0 : 2], hi = o.fill[up ? 1 : 3];
      lo.set(f, base + A0, base + vv); hi.set(f, base + vv, base + A9);
      lo.material = dir > 0 ? o.live : o.used; hi.material = dir > 0 ? o.used : o.live;
      o.bars[0] = base + A0; o.bars[1] = base + vv; o.bars[2] = base + A9; o.ports[0] = base + .26; o.ports[1] = base + Math.PI - .26;
      o.kinds[0] = dir > 0 ? 1 : 3; o.kinds[1] = dir > 0 ? 3 : 1;
      o.dom[up ? 0 : 1].set(o.bars, o.kinds, o.ports, 2);
    }
    o.pipe[0].material = o.pipe[2].material = dir > 0 ? o.live : o.used;
    o.pipe[1].material = o.pipe[3].material = dir > 0 ? o.used : o.live;
    for (i = 0; i < 4; i++) o.fp[i].out = (i % 2 === 0) === (dir < 0);
    o.flow.update(Math.abs(S.w) * dt);
    var rpm = S.playing ? dir * S.rpm : 0;
    S.set("rpm", (rpm < 0 ? "−" + -rpm : rpm) + " rpm");
    S.set("out", Math.round(this._rc(a) - 65) + " mm");
  }
});
