M507.define({
  number: 245,
  title: "Bayonet joint",
  lede: "A tube slides into a socket and a short pin on the tube runs along a bent slot. A small twist locks the tube in. A twist the other way lets it be pulled out again. It joins two parts quickly and holds them firmly.",
  alt: "A tall tube standing in a short see-through socket. A red pin on the tube sticks out through an L-shaped slot in the socket wall.",
  parts: [
    { key: "tube", color: "#5E7387", name: "Tube", note: "It slides down into the socket and turns. Its bottom end stays inside." },
    { key: "pin", color: "#C2503F", name: "Pin", note: "A short peg on the tube. Watch it follow the slot." },
    { key: "socket", color: "#4FA58A", name: "Socket", note: "It does not move. The L-shaped slot is cut right through its wall, so you can see the pin and the tube inside." }
  ],
  controls: [],
  readouts: [{ id: "d", label: "Tube pushed in" }, { id: "t", label: "Twist" }],
  views: { "3d": [170, 190, 640], front: [0, 105, 500], side: [700, 120, 0] },
  target: [0, 105, 0],
  how: [
    "Watch the red pin. It starts at the end of the sideways part of the slot, which is the locked place. First the tube is twisted back. The pin slides along to the open end of the slot.",
    "Now the pin is under the straight part of the slot. The tube can be lifted straight out. To put it back, push it in until the pin reaches the bottom of the slot, then twist it the other way.",
    "Once twisted, the pin sits under the roof of the sideways slot, so a pull on the tube cannot lift it out. Only a twist back to the open end frees it. Play the cycle and watch the pin each time."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws one pin and one slot with the socket cut open. The socket is drawn as a thin shell. The size, the length of the slot and the amount of twist were made up. The socket has a floor so it looks closed.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { th: 0 };
    var RS = 58, RT = 50, H = 110, Y1 = 22, Y2 = 48, TURN = 25 * Math.PI / 180, GAP = 14 * Math.PI / 180;   // socket wall radius, tube radius, socket height, slot y range, half turn, half slot width as angle
    function wall(y0, y1, a0, len) {            // a piece of the thin socket wall, from angle a0 round by len
      var g = new T.CylinderGeometry(RS, RS, y1 - y0, 40, 1, true, a0, len), m = new T.Mesh(g, c.mat("socket")); m.position.y = (y0 + y1) / 2; c.scene.add(m);
    }
    wall(0, Y1, 0, 2 * Math.PI);                                              // below the slot: y 0..22
    wall(Y1, Y2, TURN + GAP, 2 * Math.PI - 2 * (TURN + GAP));                 // the sideways slot is open from -39 to +39 degrees: y 22..48
    wall(Y2, H, -TURN + GAP, 2 * Math.PI - 2 * GAP);                          // the entry slot is open at -39 to -11 degrees: y 48..110
    P.at(P.cylY(RS, 6, c.mat("socket")), 0, -3, 0, c.scene);                  // floor y -6..0, wall stands on y 0
    // dark outline of the slot, drawn a hair outside the wall
    var pts = [], r = RS + .6, A = TURN + GAP, B = -TURN - GAP, E = -TURN + GAP;
    function pt(a, y) { pts.push(new T.Vector3(r * Math.sin(a), y, r * Math.cos(a))); }
    pt(E, H); pt(E, Y2); pt(A, Y2); pt(A, Y1); pt(B, Y1); pt(B, H);
    var line = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x2A3540 })); c.scene.add(line);
    // tube with its pin; the group's origin is the tube's bottom end
    o.tube = new T.Group(); c.scene.add(o.tube);
    var body = new T.Mesh(new T.CylinderGeometry(RT, RT, 190, 40, 1, true), c.mat("tube")); body.position.y = 95; o.tube.add(body);   // y 0..190
    P.at(P.cylY(RT, 3, c.mat("tube")), 0, 1.5, 0, o.tube);                    // closed bottom end y 0..3
    o.pin = new T.Group(); o.tube.add(o.pin); o.pin.position.y = 27;
    P.at(P.cylZ(11, 18, c.mat("pin")), 0, 0, RT + 9, o.pin);                   // pin z 50..68, from the tube wall out through the slot
    o.TURN = TURN; o.base = 8;
  },

  step: function (c, dt, S) {
    var o = this.o, u, lift, ang;
    o.th += S.w * dt;
    u = (o.th / (2 * Math.PI)) % 1;
    function sm(a, b) { var t = Math.max(0, Math.min(1, (u - a) / (b - a))); return t * t * (3 - 2 * t); }
    // locked, twist back, pull out, wait, push in, twist to lock, stay locked
    ang = o.TURN * (1 - 2 * sm(.08, .25)) + 2 * o.TURN * sm(.75, .92) - o.TURN * 0;   // from +half to -half, then back
    ang = o.TURN - 2 * o.TURN * sm(.08, .25) + 2 * o.TURN * sm(.75, .92);
    lift = 150 * (sm(.25, .5) - sm(.58, .75));
    o.tube.position.y = o.base + lift; o.tube.rotation.y = ang;
    var depth = Math.max(0, Math.min(102, 110 - o.base - lift));
    S.set("d", Math.round(depth) + " mm");
    S.set("t", Math.round((ang + o.TURN) * 180 / Math.PI) + "°");
  }
});
