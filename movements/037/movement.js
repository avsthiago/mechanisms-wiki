M507.define({
  number: 37,
  title: "Bevel pinion and spiral studs",
  lede: "A toothed cone turns at a steady speed. It drives a second cone that speeds up through each turn, then drops back to slow. The trick is a row of studs that climbs round the second cone in a spiral.",
  alt: "Two cones stand side by side on upright shafts. The left cone is wide at the top and has long teeth down its whole sloping face. The right cone is wide at the bottom and carries a row of studs that climbs round it in a spiral. The studs fit between the teeth where the two slopes meet.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Toothed cone", note: "A cone with teeth running the whole length of its slope. It turns at a steady speed and does the driving." },
    { key: "driven", color: "#C8873A", name: "Stud wheel", note: "A cone the other way up, turned by its studs. It is slow when a low stud is pushed and fast when a high one is." },
    { key: "studs", color: "#4FA58A", name: "Studs", note: "Short pegs set in a spiral that climbs round the stud wheel. Watch the red one. It is the stud the teeth are pushing now." }
  ],
  controls: [{ id: "spiral", label: "Stud spiral", value: "steep", options: [["steep", "Steep climb"], ["gentle", "Gentle climb"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [330, 300, 900], front: [0, 10, 1020], side: [1020, 10, 0] },
  target: [0, 10, 0],
  how: [
    "The left cone turns steadily. One of its teeth catches a stud on the right cone and pushes it along. Then the next tooth catches the next stud. The stud being pushed is shown in red. The two cones turn opposite ways, so the driven speed has a minus sign.",
    "The studs climb round the right cone in a spiral. Low down, the toothed cone is thin and the stud wheel is wide, so the stud wheel turns slowly. Higher up, the toothed cone is wide and the stud wheel is thin, so the same push turns the stud wheel much faster. Each stud is higher than the last, so the stud wheel speeds up step by step.",
    "After the top stud, the bottom stud comes round again and the speed drops back all at once. Try Steep climb, then Gentle climb. Watch the driven speed and see which spiral changes it more."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not say which cone drives, how far the spiral climbs or what happens when it ends. Here the toothed cone drives and the spiral goes once round, so the stud wheel drops from its fastest to its slowest with a knock each turn. The speed changes in small steps, one for each stud. The stand, the sizes, the number of teeth and studs and the gentle spiral were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var N = 12, RB = 152, CONE = 30, TAN = Math.tan(CONE * Math.PI / 180), CD = Math.cos(CONE * Math.PI / 180), ADD = 10;
    var A = RB / TAN;                        // 263.3: height of the big end of the pitch cone above its point
    var CC = 182, GAP = 12 / CD;             // shaft spacing; level gap between the pitch cone and the stud wheel's skin, clear of the tooth tips
    var Y0 = -170, XP = -85, XW = XP + CC;   // both cones use heights measured from the toothed cone's point, at world y -170
    var o = this.o = { u: 0.2, N: N, sets: {} };

    // toothed cone: wide end up, teeth the whole length of the slope (local y 63.6..268.3, rim and hub up to 312.3)
    o.pin = new T.Group(); o.pin.position.set(XP, Y0, 0); scene.add(o.pin);
    var cone = P.bevelGearCone({ radius: RB, teeth: N, cone: CONE, face: 36 / RB, addendum: ADD, material: c.mat("drive") }); o.pin.add(cone);
    P.at(P.cylY(12, 330, c.mat("drive")), 0, 175, 0, o.pin);                        // shaft local y 10..340 = world -160..170, base top to arm underside
    P.at(P.box(2, 30, 5, c.mat("drive", "dark")), 13, 37, 0, o.pin);                // stripe x 12..14 off the shaft, world y -148..-118
    P.at(P.box(48, 1, 6, c.mat("drive", "dark")), 48, cone.backY - 19, 0, o.pin);   // stripe on the flat back, y +24.5..+25.5, lifted 0.5 above it

    // stud wheel: wide end down, its skin parallel to the toothed cone's slope
    o.wheel = new T.Group(); o.wheel.position.set(XW, Y0, 0); scene.add(o.wheel);
    var yLo = 62, yHi = 264;
    function skin(y) { return CC - y * TAN - GAP; }                                 // radius of the stud wheel at height y: 132.3 at the bottom, 15.7 at the top
    P.at(P.mesh(new T.CylinderGeometry(skin(yHi), skin(yLo), yHi - yLo, 72), c.mat("driven")), 0, (yLo + yHi) / 2, 0, o.wheel);
    P.at(P.cylY(12, 330, c.mat("driven")), 0, 175, 0, o.wheel);                     // shaft local y 10..340 = world -160..170
    P.at(P.box(2, 30, 5, c.mat("driven", "dark")), 13, 37, 0, o.wheel);             // stripe x 12..14 off the shaft, world y -148..-118
    P.at(P.box(2, 36, 5, c.mat("driven", "dark")), 13, 300, 0, o.wheel);            // stripe on the upper shaft, world y 112..148

    // Studs. A stud at height y meets the teeth at radius rp = y * TAN on the toothed cone and rs = CC - rp on the stud wheel.
    // While it is pushed, the toothed cone turns one tooth (2 pi / N) and the stud wheel turns d = (2 pi / N) * rp / rs,
    // so the stud's arc equals the tooth spacing at its height. K studs at even height steps; the step is solved so the d's add to one turn.
    function lay(id, K, y0) {
      var lo = 0, hi = (255 - y0) / (K - 1), i, k, dy, s, rp, st = [], phi = 0, g = new T.Group();
      for (i = 0; i < 50; i++) { dy = (lo + hi) / 2; s = 0; for (k = 0; k < K; k++) { rp = (y0 + k * dy) * TAN; s += rp / (CC - rp); } if (s < N) lo = dy; else hi = dy; }
      for (k = 0; k < K; k++) {
        var y = y0 + k * dy, ratio, d, h = ADD * y / A;
        rp = y * TAN; ratio = rp / (CC - rp); d = 2 * Math.PI / N * ratio;
        var rIn = skin(y) - 3, rTip = CC - rp + .7 * h / CD, hold = new T.Group();   // stud from 3 inside the skin to part way down the tooth gap
        hold.rotation.y = Math.PI + phi + d / 2;                                    // on the line of centres half way through its push
        var m = P.at(P.cylX(4, rTip - rIn, c.mat("studs")), (rIn + rTip) / 2, y, 0, hold);
        g.add(hold); st.push({ phi: phi, d: d, ratio: ratio, mesh: m }); phi += d;
      }
      o.wheel.add(g); o.sets[id] = { g: g, K: K, st: st };
    }
    lay("steep", 12, 80);
    lay("gentle", 18, 80);
    o.mStud = c.mat("studs"); o.mMark = c.mat("studs", "mark");

    // stand: base, a post behind the cones and a T-shaped arm over the shaft tops
    P.at(P.box(530, 12, 360, c.fixed), 0, -166, -10, scene);     // base x -265..265, y -172..-160, z -190..170; shafts and post stand on y -160
    P.at(P.box(20, 350, 20, c.fixed), 6, 15, -160, scene);       // post x -4..16, y -160..190, z -170..-150
    P.at(P.box(20, 20, 130, c.fixed), 6, 180, -85, scene);       // arm x -4..16, y 170..190, z -150..-20; meets the post at z -150
    P.at(P.box(232, 20, 40, c.fixed), 6, 180, 0, scene);         // beam x -110..122, y 170..190, z -20..20; meets the arm at z -20; shafts end at y 170
  },

  step: function (c, dt, S) {
    var o = this.o, id, cur = o.sets[S.controls.spiral] || o.sets.steep, pitch = 2 * Math.PI / o.N;
    o.u += S.w * dt / pitch;                                    // teeth of the toothed cone gone past
    for (id in o.sets) o.sets[id].g.visible = o.sets[id] === cur;
    var turns = Math.floor(o.u / cur.K), s = o.u - turns * cur.K, k = Math.min(cur.K - 1, Math.floor(s)), st = cur.st[k];
    o.pin.rotation.y = o.u * pitch;                             // a tooth gap faces the stud wheel at every half tooth
    o.wheel.rotation.y = -(turns * 2 * Math.PI + st.phi + (s - k) * st.d);   // opposite way; stud k crosses the line of centres half way through its push
    for (var i = 0; i < cur.K; i++) cur.st[i].mesh.material = i === k ? o.mMark : o.mStud;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : -rpm * st.ratio));
  }
});
