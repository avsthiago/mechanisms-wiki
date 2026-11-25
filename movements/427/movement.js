M507.define({
  number: 427,
  title: "Rotary engine with an eccentric shaft",
  lede: "In this steam engine the shaft is not in the middle of the cylinder. Its hub touches the wall at the top and leaves a wide gap at the bottom. Two pistons reach across the gap, and steam pushes them round.",
  alt: "A round cylinder on a foot with two pipes on top, drawn with its front cover off. A blue hub sits high inside it and touches the wall at the top. Two orange bars run from a pin at the centre of the cylinder, through round yellow bars in the hub, out to the wall.",
  parts: [
    { key: "case", color: "#4FA58A", name: "Cylinder", note: "The round casing with two pipes on top. It stands still. The front cover is left off so you can see inside." },
    { key: "hub", color: "#5E7387", name: "Hub", note: "A hollow drum fixed on the shaft. Watch its red stripe. It sits higher than the centre of the cylinder, so it touches the wall at the top only." },
    { key: "vane", color: "#C8873A", name: "Pistons", note: "Two flat bars, each held on a ring round a pin at the centre of the cylinder. They always point straight out from that centre, so their tips always reach the wall." },
    { key: "pack", color: "#D9B13B", name: "Rolling packings", note: "Two round bars set in the hub. Each piston slides through one. The round bar swivels a little so the piston can tilt as the hub turns." }
  ],
  controls: [{ id: "steam", label: "Steam enters by", value: "right", options: [["left", "Left pipe"], ["right", "Right pipe"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "rpm", label: "Shaft" }, { id: "out", label: "Piston out" }],
  views: { "3d": [258, 155, 553], front: [0, 4, 565], side: [620, 4, 0] },
  target: [0, 14, 0],
  how: [
    "Look at the blue hub. Its shaft sits above the centre of the cylinder. So the hub touches the wall at the top, between the two pipes, and leaves a wide gap round the bottom.",
    "The orange pistons are not fixed to the hub. Each one is held on a ring round a pin at the very centre of the cylinder. That keeps its tip just touching the wall all the way round. The hub carries the pistons round with it. As it turns, they slide in and out through the round yellow bars.",
    "Steam comes in by one pipe and pushes a piston round through the wide gap to the other pipe. Dark blue dots are fresh steam and pale dots are used steam. Dots shut in between the two pistons spread out and turn paler as their room grows. Watch how far a piston sticks out of the hub. Then swap the pipes. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front cover is left off, and the steam is drawn as small blue balls so you can see it move. The pin at the centre belongs to that cover, so it is drawn grey and see-through. Brown draws the two pistons in one straight line. They only line up twice in each turn, so the model starts at a different moment. The sizes, the shape of the foot and the choice of pipe were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 100, W = 112, e = 21, rh = 79, rp = 62, mc = c.mat("case"), D = Math.PI / 180;
    var o = this.o = { th: 0, R: R, e: e, rh: rh, rp: rp };
    function arc(cx, cy, rad, a0, a1, n) { var p = [], i, a; for (i = 0; i <= n; i++) { a = (a0 + (a1 - a0) * i / n) * D; p.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); } return p; }
    function ang(x, rad) { return Math.acos(x / rad) / D; }                           // angle of the point on a circle at this x, upper half
    function yy(x, rad) { return Math.sqrt(rad * rad - x * x); }
    // pipes: passage x 48..66 each side, walls 10 thick (x 38..48 and 66..76), up to y 138
    var foot = [[56, -118], [95, -118], [95, -130], [-95, -130], [-95, -118], [-56, -118]];
    var out = [[76, 138], [76, yy(76, W)]].concat(arc(0, 0, W, ang(76, W), -60, 40), foot, arc(0, 0, W, 240, 180 - ang(76, W), 40), [[-76, yy(76, W)], [-76, 138]]);
    var body = out.concat([[-66, 138], [-66, yy(66, R)]], arc(0, 0, R, 180 - ang(66, R), 360 + ang(66, R), 90), [[66, 138]]);
    var mid = [[48, 138], [38, 138], [38, yy(38, W)]].concat(arc(0, 0, W, ang(38, W), 180 - ang(38, W), 10), [[-38, yy(38, W)], [-38, 138], [-48, 138]], arc(0, 0, R, 180 - ang(48, R), ang(48, R), 14));
    var back = out.concat([[-38, 138], [-38, yy(38, W)]], arc(0, 0, W, 180 - ang(38, W), ang(38, W), 10), [[38, yy(38, W)], [38, 138]]);
    scene.add(P.outlinePlate({ points: body, depth: 40, z0: -20, material: mc }));     // walls z -20..20
    scene.add(P.outlinePlate({ points: mid, depth: 40, z0: -20, material: mc }));
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: c.mat("case", "light") }), "open"));   // back cover z -26..-20; pale so the steam shows
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: mc }), "closed"));   // closed view: the same back cover in the casing colour
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: 20, material: mc }), "closed"));   // closed view: front cover z 20..26 on the walls
    // hub: a drum about the shaft at (0, 21). 21 + 79 = 100, so it touches the wall at the top.
    o.hub = new T.Group(); o.hub.position.y = e; scene.add(o.hub);
    var mh = c.mat("hub");
    P.at(P.cylZ(rh, 4, mh), 0, 0, -18, o.hub);                                         // floor z -20..-16, on the back cover
    P.at(P.cylZ(12, 40, mh), 0, 0, -46, o.hub);                                        // shaft z -66..-26, ends on the back of the cover
    P.at(P.cylZ(12, .6, c.mat("hub", "dark")), 0, 0, -15.7, o.hub);                    // shaft end showing on the floor, z -16..-15.4
    // rim in two halves, radius 47..79, z -16..16, with a slot 21 wide between them for each piston and its packing
    var ao = Math.asin(10.5 / rh) / D, ai = Math.asin(10.5 / 47) / D, half = arc(0, 0, rh, ao, 180 - ao, 40).concat(arc(0, 0, 47, 180 - ai, ai, 30));
    o.hub.add(P.outlinePlate({ points: half, depth: 32, z0: -16, material: mh }));
    o.hub.add(P.outlinePlate({ points: half.map(function (q) { return [-q[0], -q[1]]; }), depth: 32, z0: -16, material: mh }));
    P.at(P.box(4, 26, 1, c.mat("hub", "mark")), 0, 63, 17, o.hub);                     // stripe y 50..76, z 16.5..17.5, lifted off the rim face (z 16)
    o.pk = [1, -1].map(function (s) { return P.at(P.cylZ(10.5, 32, c.mat("pack")), s * rp, 0, 0, o.hub); });   // z -16..16, filling the slot
    // pistons: bars from the ring (radius 22) to the wall (radius 100), z -15..17; each ring z-range is its own
    var ring = arc(0, 0, 22, 0, 360, 40), hole = arc(0, 0, 13, 0, 360, 30);
    o.v = [0, 1].map(function (k) {
      var g = new T.Group(), m = c.mat("vane");
      P.at(P.box(77.9, 7, 32, m), 22 + 77.9 / 2, 0, 1, g);                             // x 22..99.9 along the piston
      g.add(P.outlinePlate({ points: ring, holes: [hole], depth: 9, z0: k ? 4 : -6, material: m }));   // rings z -6..3 and 4..13
      scene.add(g); return g;
    });
    P.at(P.cylZ(12.5, 34, c.fixed), 0, 0, 7, scene);                                   // pin of the front cover, z -10..24; the rings (hole 13) turn on it
    function sm(op) { return new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide }); }
    o.live = sm(.14); o.used = sm(.04); o.shut = sm(.09);
    o.fill = [0, 1, 2].map(function () { return c.fluid(P.at(P.ribbon({ material: o.live }), 0, 0, 15, scene)); });
    o.pipe = [1, -1].map(function (s) {
      var m = P.at(P.ribbon({ n: 8, material: o.live }), 0, 0, 15, scene);
      m.set(function (x) { return [s * x, yy(x, R), s * x, 138]; }, 48, 66); return m;
    });
    // steam as moving balls: the ring between hub and wall, measured from the touching place the way the hub turns
    o.flow = P.steamFlow({ color: c.spot, count: 340, z0: -14, z1: 12 }); scene.add(o.flow);
    o.dir = -1;
    o.dom = o.flow.domain({ density: .012, pad: .045, f: function (s, out) {
      var a = Math.PI / 2 + o.dir * s, ca = Math.cos(a), sa = Math.sin(a), q = e * sa + Math.sqrt(rh * rh - e * e * ca * ca);
      out[0] = q * ca; out[1] = q * sa; out[2] = R * ca; out[3] = R * sa;
    } });
    o.bars = [0, 0, 0, 2 * Math.PI]; o.kinds = [0, 0, 0]; o.ports = [0, 0, 0];
    o.fp = [1, -1].map(function (s) { return o.flow.pipe({ points: [[s * 57, 166], [s * 57, 84]], width: 13 }); });
  },

  step: function (c, dt, S) {
    var o = this.o, dir = S.controls.steam === "left" ? 1 : -1, R = o.R, e = o.e, rh = o.rh, D = Math.PI / 180, i;
    o.th += dir * S.w * dt;
    var psi = 135 * D + o.th, ph = [];
    o.hub.rotation.z = psi;
    // each packing is carried round the shaft; its piston is the line from the cylinder's centre through it
    for (i = 0; i < 2; i++) {
      var px = o.rp * Math.cos(psi + i * Math.PI), py = e + o.rp * Math.sin(psi + i * Math.PI);
      ph[i] = Math.atan2(py, px); o.v[i].rotation.z = ph[i]; o.pk[i].rotation.z = ph[i] - psi;
    }
    // steam: measure round the wall from the touching place at the top, the way the hub turns. s = 0..360 degrees.
    function f(s) { var a = Math.PI / 2 + dir * s, ca = Math.cos(a), sa = Math.sin(a), q = e * sa + Math.sqrt(rh * rh - e * e * ca * ca); return [q * ca, q * sa, R * ca, R * sa]; }
    var b = ph.map(function (a) { var s = dir * (a - Math.PI / 2); return s - 2 * Math.PI * Math.floor(s / (2 * Math.PI)); }).sort(function (x, y) { return x - y; });
    b = [0].concat(b, [2 * Math.PI]);
    for (i = 0; i < 3; i++) {
      var s0 = b[i], s1 = b[i + 1], inl = s0 < 35 * D && s1 > 35 * D, exh = s0 < 325 * D && s1 > 325 * D;
      o.bars[i] = s0; o.kinds[i] = inl ? 1 : exh ? 3 : i === 1 ? 2 : 0; o.ports[i] = (inl ? 35 : 325) * D;
      if (!inl && !exh && (i === 0 || i === 2)) { o.fill[i].set(f, 0, 0); continue; }   // cut off beside the touching place: no steam
      o.fill[i].material = inl ? o.live : exh ? o.used : o.shut;
      o.fill[i].set(f, s0, s1, Math.max(4, Math.ceil((s1 - s0) / (4 * D))));
    }
    o.pipe[0].material = dir < 0 ? o.live : o.used; o.pipe[1].material = dir < 0 ? o.used : o.live;
    o.dir = dir; o.dom.set(o.bars, o.kinds, o.ports, 3);
    o.fp[0].out = dir > 0; o.fp[1].out = dir < 0;
    o.flow.update(Math.abs(S.w) * dt);
    var rpm = S.playing ? dir * S.rpm : 0, ca = Math.cos(ph[0]), q = e * Math.sin(ph[0]) + Math.sqrt(rh * rh - e * e * ca * ca);
    S.set("rpm", (rpm < 0 ? "−" + -rpm : rpm) + " rpm");
    S.set("out", Math.round(R - q) + " mm");
  }
});
