M507.define({
  number: 469,
  title: "Rotary motion from warm water",
  lede: "An old French idea for getting turning motion from warm water. A screw in a cold tank pushes air down a pipe, and the bubbles rise under a wheel in a warm tank and turn it. The wheel turns the screw, and because warm air takes up more room than cold air, this is supposed to keep it going.",
  alt: "Two tanks of water side by side. In the left tank a sloping screw in a tube leads down to a bell. A pipe runs from the bell up over both tanks and down under a bladed wheel in the right tank. Gears join the wheel to the top of the screw.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Air wheel", note: "Stands in the warm tank. Bubbles rising from the pipe are caught under its blades on one side, and lift that side. Watch the red blade go round." },
    { key: "screw", color: "#C8873A", name: "Screw", note: "A spiral blade turning inside a fixed tube in the cold tank. Turned this way, it carries pockets of air down to the bell at the bottom." },
    { key: "gears", color: "#D9B13B", name: "Gears and shafts", note: "A toothed ring on the wheel drives a small gear. Its shaft turns the screw through two bevel gears at the top." },
    { key: "pipe", color: "#4FA58A", name: "Bell, tube and pipe", note: "The air collects in the bell and climbs the pipe, crosses over, and comes out under the wheel." },
    { key: "mark", color: "#C2503F", name: "Red blade", note: "One blade of the wheel, to follow as it turns." }
  ],
  speed: false,
  controls: [{ type: "range", id: "tw", label: "Warm tank", min: 15, max: 95, step: 5, value: 60, unit: " °C",
    presets: [[15, "Same as the cold"], [60, "Warm"], [95, "Nearly boiling"]] }],
  readouts: [{ id: "w", label: "Wheel" }, { id: "g", label: "Air grows" }],
  closed: { label: "Tube" },
  views: { "3d": [110, 70, 700], front: [0, 5, 720], side: [720, 5, 10] },
  target: [0, 5, 10],
  how: [
    "Follow the white bubbles. The screw in the cold tank pushes pockets of air down into the bell. The air climbs the pipe, crosses over, and bubbles out under the wheel in the warm tank. It is caught under the blades on the left and floats that side up, so the wheel turns. The wheel drives the screw through the gears.",
    "Why might it keep going? Air swells when it warms. The screw pushes down cold air, but the wheel is lifted by the same air after it has warmed and grown. Bigger bubbles lift harder, so the wheel gets back a little more than it spends. This is really a heat engine, like a steam engine, and it only runs while one tank stays warmer than the other. Brown points out that nobody says how that is done. Rub in the parts takes most of the small gain.",
    "Try a nearly boiling tank, then make it the same as the cold one. With no difference in warmth, the air does not grow and the wheel slows to a stop. Choose Closed to see the tube and bell as they look from outside."
  ],
  note: "This model is rebuilt from Brown's description and drawing. The supports for the shafts, the feet of the bell, the shape of the blades and all sizes were made up. The machine is drawn as Brown shows it; the speed it settles at is not worked out from real forces. Here it simply runs faster the more the warm air grows, after taking off a made-up share for rub, and stops when there is too little. When it has stopped and the tank is made warm again, the model gives the screw a turn by hand to start it, as Brown says it must be started.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed, i;
    var d = new T.Vector3(.682, .731, 0).normalize(), e = new T.Vector3(d.y, -d.x, 0), z3 = new T.Vector3(0, 0, 1);
    var S0 = new T.Vector3(-170, -110, 54), Q = S0.clone().addScaledVector(d, 257.2), W = new T.Vector3(100, -10, 0);
    var o = this.o = { d: d, e: e, S0: S0, Q: Q, W: W, psi: 0, om: .6, off: 0, ps: 0, em: 0, b: [], n1: new T.Vector3(-d.y, d.x, 0) };
    // tanks: floor y -171..-165, walls 6 thick up to y 45, back wall z -60..-54, open at the front (z 85)
    [[-225, -10], [20, 225]].forEach(function (t) {
      var w = t[1] - t[0], cx = (t[0] + t[1]) / 2;
      P.at(P.box(w, 6, 145, fx), cx, -168, 12.5, scene);
      P.at(P.box(6, 210, 145, fx), t[0] + 3, -60, 12.5, scene); P.at(P.box(6, 210, 145, fx), t[1] - 3, -60, 12.5, scene);
      P.at(P.box(w - 12, 210, 6, fx), cx, -60, -57, scene);
    });
    o.cold = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .22, depthWrite: false });
    o.warm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .22, depthWrite: false });
    o.spot = new T.Color(c.spot); o.hot = new T.Color("#D2774A");
    P.at(P.box(202, 202.5, 137.5, o.cold), -117.5, -63.75, 15.75, scene);     // water y -164.5..38
    P.at(P.box(193, 202.5, 137.5, o.warm), 122.5, -63.75, 15.75, scene);
    // wheel: drum, back plate, blades; crown ring in front; axle from the back wall
    o.wheel = P.at(new T.Group(), W.x, W.y, 0, scene);
    P.at(P.cylZ(35, 34, c.mat("wheel")), 0, 0, 0, o.wheel);                    // drum z -17..17
    P.at(P.cylZ(55, 3, c.mat("wheel")), 0, 0, -18.5, o.wheel);                 // back plate z -20..-17
    for (i = 0; i < 18; i++) {
      var a = i * Math.PI / 9, bl = P.box(20, 2.5, 34, c.mat(i ? "wheel" : "mark"));
      bl.rotation.z = a; P.at(bl, 45 * Math.cos(a), 45 * Math.sin(a), 0, o.wheel);
    }
    P.at(P.cylZ(10, 10, c.mat("gears")), 0, 0, 22, o.wheel);                   // hub z 17..27
    var cw = P.crownWheel({ teeth: 12, module: 4, width: 6, material: c.mat("gears") }); P.at(cw, 0, 0, 30, o.wheel);   // disc z 27..33
    P.at(P.cylZ(5, 90, c.mat("pipe")), W.x, W.y, -9, scene);                   // axle z -54..36
    P.at(P.cylZ(10, 6, c.mat("pipe")), W.x, W.y, -51, scene);                  // boss on the back wall z -54..-48
    // shaft from the bevel gears down to the pinion, local Y along e
    o.sh = P.frame(P.at(new T.Group(), Q.x, Q.y, Q.z, scene), z3, e);
    o.shS = P.at(new T.Group(), 0, 0, 0, o.sh);
    var bg = { radius: 12, teeth: 12, cone: 45, hub: 4, hubLength: 12, addendum: 3, material: c.mat("gears") };
    o.shS.add(P.bevelGearCone(bg));
    P.at(P.cylY(3, 96, c.mat("gears")), 0, 62, 0, o.shS);                      // y 14..110
    var pin = P.spurGear({ teeth: 8, module: 4, width: 10, material: c.mat("gears") }); pin.rotation.x = -Math.PI / 2;
    P.at(pin, 0, 129.2 - 24, 0, o.shS); o.pinPitch = pin.pitch;
    var bp = P.frame(P.at(new T.Group(), 23, 78 - (23 - Q.x) * .933, Q.z, scene), z3, e);
    P.at(P.cylY(8, 12, c.mat("pipe")), 0, 0, 0, bp);                           // bearing on the shaft
    P.at(P.box(10, 11, 10, c.mat("pipe")), 23, 50.5, Q.z, scene);               // post y 45..56 on the tank wall
    // screw: fixed tube (cut open) along d, from 5 to 195 along the axis; spiral inside; shaft up to the bevel gears
    o.tube = P.frame(P.at(new T.Group(), 0, 0, 0, scene), e, d);
    o.tube.position.copy(S0);
    o.tube.add(c.shell(P.halfSection({ poly: [[14.5, 5], [17, 5], [17, 195], [3.5, 195], [3.5, 191], [14.5, 191]], material: c.mat("pipe") }), "open"));
    o.tube.add(c.shell(P.wholeSection({ poly: [[14.5, 5], [17, 5], [17, 195], [3.5, 195], [3.5, 191], [14.5, 191]], material: c.mat("pipe") }), "closed"));   // closed view: the whole tube
    o.scS = P.at(new T.Group(), 0, 0, 0, o.tube);
    var wm = P.worm({ radius: 9, pitch: 14, length: 176, material: c.mat("screw") }); wm.rotation.z = Math.PI / 2; P.at(wm, 0, 100, 0, o.scS);
    P.at(P.cylY(2.8, 65, c.mat("screw")), 0, 220.5, 0, o.scS);                   // shaft 188..253
    var g2 = P.bevelGearCone(bg); g2.rotation.x = Math.PI; P.at(g2, 0, 257.2, 0, o.scS);   // its +Y points back down the screw
    // bell with feet, and the pipe over to the warm tank
    c.shell(P.at(P.halfSection({ poly: [[28, -110], [32, -110], [32, -40], [4.5, -40], [4.5, -44], [28, -44]], material: c.mat("pipe") }), -185, 0, 54, scene), "open");
    c.shell(P.at(P.wholeSection({ poly: [[28, -110], [32, -110], [32, -40], [4.5, -40], [4.5, -44], [28, -44]], material: c.mat("pipe") }), -185, 0, 54, scene), "closed");   // closed view: the whole bell
    [-210, -160].forEach(function (x) { P.at(P.box(5, 55, 5, c.mat("pipe")), x, -137, 54, scene); });   // feet y -165..-110
    var path = [[-185, -44, 54], [-185, 175, 54], [185, 175, 54], [185, 175, 0], [185, -140, 0], [75, -140, 0], [75, -88, 0]];
    o.path = path; o.plen = [0];
    for (i = 1; i < path.length; i++) {
      var p0 = path[i - 1], p1 = path[i], r = P.at(P.rod(4.5, fx), 0, 0, 0, scene);
      r.span(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2]);
      o.plen.push(o.plen[i - 1] + Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]));
    }
    [1, 2, 3, 4, 5].forEach(function (k) { P.at(P.sphere(4.5, fx), path[k][0], path[k][1], path[k][2], scene); });   // bends
    // air: pockets in the screw, a stream in the pipe, bubbles in the warm tank
    o.dots = P.waterDots(240, { radius: 2.4, color: "#FFFFFF", opacity: .95 }); scene.add(o.dots);
    for (i = 0; i < 110; i++) o.b.push({ st: 0, x: 0, y: 0, z: 0, a: 0, r: 0 });
  },

  step: function (c, dt, S) {
    var o = this.o, tw = +S.controls.tw, grow = (tw + 273) / 288 - 1, k, i;
    var target = grow > .05 ? Math.min(1.5, (grow - .05) / .2 * 1.2) : 0;
    o.warm.color.copy(o.spot).lerp(o.hot, (tw - 15) / 80 * .7);
    var run = S.playing && dt > 0;
    if (run) {
      if (o.om < .02 && target > 0) o.om = .3;                                 // started again by hand
      o.om += (target - o.om) * Math.min(1, dt / 4);
      if (o.om < .005 && target === 0) o.om = 0;
    }
    var dpsi = run ? o.om * dt : 0;
    o.psi -= dpsi;                                                              // clockwise from the front
    o.wheel.rotation.z = o.psi;
    var ps = -o.psi * 1.5;                                                      // pinion and screw turn 12/8 as fast
    o.shS.rotation.y = ps + o.pinPitch / 2;
    o.scS.rotation.y = ps;
    // pockets of air in the screw, moving down one pitch per turn
    o.off = (o.off + 14 * dpsi * 1.5 / (2 * Math.PI)) % 14;
    var n = 0, D = o.dots, d = o.d, n1 = o.n1, S0 = o.S0, sz = 1, sR = Math.cbrt(1 + grow);
    for (k = 0; k < 13; k++) {
      var t = 190 - ((k * 14 + o.off) % 182);
      if (t < 12) { D.put(n++, 0, 0, 0, 0); D.put(n++, 0, 0, 0, 0); continue; }
      var bx = S0.x + d.x * t + n1.x * 9, by = S0.y + d.y * t + n1.y * 9;
      D.put(n++, bx, by, 54 - 4, o.om > 0 ? sz : 0); D.put(n++, bx + d.x * 3, by + d.y * 3, 54 + 4, o.om > 0 ? sz * .8 : 0);
    }
    // stream in the pipe
    o.ps = (o.ps + dpsi * .12) % 1;
    var L = o.plen[o.plen.length - 1];
    for (k = 0; k < 50; k++) {
      var s = ((k / 50 + o.ps) % 1) * L, j = 1;
      while (j < o.plen.length - 1 && o.plen[j] < s) j++;
      var u = (s - o.plen[j - 1]) / (o.plen[j] - o.plen[j - 1]), a = o.path[j - 1], b = o.path[j];
      D.put(n++, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, o.om > .02 ? .8 : 0);
    }
    // bubbles: rise from the pipe end, ride under the blades on the left, let go near the top, rise to the top of the water
    if (run) {
      o.em += dpsi * 14;
      while (o.em >= 1) {
        o.em -= 1;
        for (i = 0; i < o.b.length; i++) if (!o.b[i].st) { var q = o.b[i]; q.st = 1; q.x = 75 + (Math.random() - .5) * 8; q.y = -86; q.z = (Math.random() - .5) * 26; break; }
      }
      for (i = 0; i < o.b.length; i++) {
        q = o.b[i];
        if (q.st === 1 || q.st === 3) {
          q.y += 70 * dt;
          var dx = q.x - o.W.x, dy = q.y - o.W.y;
          if (q.st === 1 && dx < 0 && dx * dx + dy * dy < 53 * 53) { q.st = 2; q.r = Math.max(37, Math.sqrt(dx * dx + dy * dy)); q.a = Math.atan2(dy, dx) - o.psi; }
          if (q.y > 36) q.st = 0;
        } else if (q.st === 2) {
          var wa = q.a + o.psi;
          q.x = o.W.x + q.r * Math.cos(wa); q.y = o.W.y + q.r * Math.sin(wa);
          if (wa < 1.75) q.st = 3;
        }
      }
    }
    for (i = 0; i < o.b.length; i++) { q = o.b[i]; D.put(n++, q.x, q.y, q.z, q.st ? sR * 1.35 : 0); }
    D.flush();
    var rpm = o.om * 60 / (2 * Math.PI);
    S.set("w", (rpm < .05 ? "0" : rpm.toFixed(1)) + " rpm");
    S.set("g", "+" + Math.round(grow * 100) + "%");
  }
});
