(function () {
  // Flat layout in model units, pin wheel centre at the origin, y up, measured from Brown's drawing. The wheel turns
  // clockwise. The arm swings on a pin above the right-hand side of the wheel and carries two flat bars, the pallets.
  var RAD = Math.PI / 180, N = 8, R = 100, PR = 13, RD = 126, AX = 82.4, AY = 158.8, PITCH = 2 * Math.PI / N;
  var TILT = 4 * RAD;                              // the drawing shows the arm swung 4 degrees to the left of where it hangs at rest
  var IW = 3, TAU = 300, CW = 30, IP = 3000, CP = 480, L0 = 330, MP = IP / (L0 * L0), G = 16 * L0, H = .00025, START = .12;
  function turn(p) { var c = Math.cos(TILT), s = Math.sin(TILT); return p.map(function (v) { var x = v[0] - AX, y = v[1] - AY; return [AX + c * x - s * y, AY + s * x + c * y]; }); }
  function bar(p, q, t) { var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy), nx = -dy / l * t / 2, ny = dx / l * t / 2; return [[p[0] - nx, p[1] - ny], [q[0] - nx, q[1] - ny], [q[0] + nx, q[1] + ny], [p[0] + nx, p[1] + ny]]; }
  // Upper pallet: slopes up to the right, outside the lower one. Its lower end is cut 18 shorter than drawn so a pin
  // can pass between the two bars. Lower pallet: slopes down to the right, 4 shorter than drawn at its right-hand end.
  function upper() { return turn(bar([70.6 + .664 * 18, 50 + .747 * 18], [117.6, 102.9], 8)); }
  function lower() { return turn(bar([35.3, 41.2], [88.2 - .853 * 4, 8.8 + .522 * 4], 9)); }
  function armOutline() {                          // the wide flat arm behind the pallets, as Brown's dotted outline
    var p = [[31, 44], [86, 4], [96, 70], [95, 152]], i;
    for (i = 0; i <= 8; i++) p.push([AX + 13 * Math.cos(-20 * RAD + i * 27.5 * RAD), AY + 13 * Math.sin(-20 * RAD + i * 27.5 * RAD)]);
    return turn(p);
  }
  function pinAngle(k) { return 3 * RAD + k * PITCH; }
  function pinOutline(k) { var a = pinAngle(k), p = []; for (var i = 0; i < 24; i++) p.push([R * Math.cos(a) + PR * Math.cos(i * 15 * RAD), R * Math.sin(a) + PR * Math.sin(i * 15 * RAD)]); return p; }
  // Bodies: 0 pin wheel (one outline per pin), 1 the two pallets with the arm and pendulum.
  function makeSim(P) {
    var polys = [], k;
    for (k = 0; k < N; k++) polys.push(pinOutline(k));
    var s = P.pivotSim({ bodies: [{ pivot: [0, 0], I: IW, polys: polys, drag: CW }, { pivot: [AX, AY], I: IP, polys: [upper(), lower()], drag: CP, a: START }], pairs: [[0, 1]] });
    s.t = 0; s.amp = START; s.beats = []; s.hi = 0; s.dip = 0; s.rec = [0, 0];
    s.run = function (h, len) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = -TAU; b[1].tq = -MP * G * len * Math.sin(b[1].a);                     // the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (-b[0].a > s.hi) s.hi = -b[0].a; else if (s.hi + b[0].a > s.dip) s.dip = s.hi + b[0].a;   // how far the wheel has been pushed back
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); s.rec = [s.rec[1], s.dip]; s.dip = 0; }
    };
    return s;
  }

  M507.define({
    number: 297,
    title: "Lantern-wheel escapement",
    lede: "This escape wheel has round pins standing out of its face instead of teeth. A swinging arm carries two slanted bars that take turns to catch a pin. Each swing of the pendulum lets the wheel move on by half the gap between two pins.",
    alt: "A round disc with eight pins standing out of its face in a ring. Above its right-hand side an arm hangs from a pin and reaches down in front of the disc. The arm carries two flat bars set like an open letter V lying on its side: the upper bar slopes up to the right and the lower bar slopes down to the right. A pendulum hangs from the same pin.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Pin wheel", note: "A weight, not shown, keeps trying to turn it clockwise. Watch the red pin. It slides down the upper bar, drops onto the lower bar, slides along that and drops off." },
      { key: "pallets", color: "#C8873A", name: "Pallets", note: "Two flat bars fixed to the arm. The upper bar catches a pin on its top face. The lower bar catches the pin after it has slipped past the end of the upper one." },
      { key: "arm", color: "#4FA58A", name: "Arm", note: "Swings on the pin at the top and carries the two pallets. It is shown see-through, so you can watch the pins behind it." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Fixed to the arm and swings with it. Its length sets how quickly the arm rocks." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 290, max: 370, step: 20, value: L0, unit: "",
      presets: [[290, "Short"], [330, "Medium"], [370, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }, { id: "rec", label: "Pushed back" }],
    views: { "3d": [220, 52, 610], front: [5, 22, 590], side: [590, 22, 0] },
    target: [5, 22, 0],
    how: [
      "The weight tries to turn the wheel clockwise, so the pins on the right move downward. A pin comes down onto the top face of the upper bar and stops. The wheel cannot move.",
      "The pin presses on the sloping bar and pushes it to the right. As the pendulum swings that way, the pin slides down the bar and slips off its lower end. It drops a short way onto the lower bar. Now the pin pushes this bar to the left, and as the pendulum swings back the pin slides along it and drops off the end. Then the next pin lands on the upper bar. These pushes keep the pendulum swinging. At the end of each swing the bar pushes the pin back a little before it lets go. The Recoil number shows how far.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown says only that an arm carries the two pallets, so how they work is worked out from the picture. His arrow shows the wheel turning the other way, but with the bars placed as drawn the pins can only keep a pendulum going when the wheel turns clockwise, so it does here. The lower end of the upper bar is cut shorter than drawn, because as drawn a pin cannot quite pass between the two bars. The pendulum, the back plate and the sizes were made up. The arm is drawn in front of the pins and see-through, where Brown shows it as a dotted outline. The weight that turns the wheel is left out and its pull is taken to be steady. The pins slide on the bars without rubbing, and only the pendulum and the wheel are slowed a little.",
    opacity: function (key, S) { return (key !== "arm" || S.iso === key) ? 1 : .4; },

    makeSim: makeSim, K: { H: H, pitch: PITCH, lens: [290, 330, 370], dir: -1 },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), mb = c.mat("pallets"), mp = c.mat("pend"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      // disc z -8..-2; pins z -2..10 standing on its face; one red pin
      o.wheel = new T.Group(); scene.add(o.wheel);
      P.at(P.cylZ(RD, 6, mw), 0, 0, -5, o.wheel);
      for (i = 0; i < N; i++) P.at(P.cylZ(PR, 12, i ? c.mat("wheel", "light") : c.mat("wheel", "mark")), R * Math.cos(pinAngle(i)), R * Math.sin(pinAngle(i)), 4, o.wheel);
      P.at(P.cylZ(22, 3, c.mat("wheel", "dark")), 0, 0, -.5, o.wheel);                // hub z -2..1, on the face
      P.at(P.cylZ(8, 22, c.fixed), 0, 0, -19, scene);                                 // pin z -30..-8, plate face to the back of the disc
      // pallets z 0..16.5 among the pins (clear of the disc face at -2) and standing through the see-through arm (z 11..15) so they show in front of it
      o.arm = new T.Group(); o.arm.position.set(AX, AY, 0); scene.add(o.arm);
      function local(p) { return p.map(function (q) { return [q[0] - AX, q[1] - AY]; }); }
      o.arm.add(P.outlinePlate({ points: local(upper()), depth: 16.5, z0: 0, material: mb }));
      o.arm.add(P.outlinePlate({ points: local(lower()), depth: 16.5, z0: 0, material: mb }));
      o.arm.add(P.outlinePlate({ points: local(armOutline()), depth: 4, z0: 11, material: c.mat("arm") }));
      P.at(P.cylZ(5, 41, c.fixed), AX, AY, -9.5, scene);                              // pin z -30..11, plate face to the back of the arm; it stands clear of the disc
      // pendulum in front: boss z 15..23 on the arm, rod z 17..21, bob z 15..23
      P.at(P.cylZ(10, 8, mp), 0, 0, 19, o.arm);
      o.rod = P.at(P.box(5, 1, 4, mp), 0, 0, 19, o.arm);                              // length set each frame
      o.bob = P.at(P.cylZ(22, 8, mp), 0, 0, 19, o.arm);
      // back plate and base
      P.at(P.box(300, 440, 6, c.fixed), 5, -35, -33, scene);                          // plate x -145..155, y -255..185, z -36..-30
      P.at(P.box(320, 12, 100, c.fixed), 5, -261, -10, scene);                        // base y -267..-255, z -60..40; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l);
      o.wheel.rotation.z = b[0].a; o.arm.rotation.z = b[1].a;
      o.rod.scale.y = l - 10; o.rod.position.y = -(l - 10) / 2 - 10;                 // rod from the boss (10 below the pin) down to the middle of the bob
      o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp / RAD).toFixed(1) + "°");
      S.set("rec", ((sim.rec[0] + sim.rec[1]) / 2 / RAD).toFixed(1) + "°");           // mean of the last two beats, one on each bar
    }
  });
})();
