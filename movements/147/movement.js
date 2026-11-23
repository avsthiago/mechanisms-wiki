M507.define({
  number: 147,
  title: "Fan governor",
  lede: "A spinning arm carries two big flat fans. The faster it goes, the harder the air pushes back on them, and the more the arm lags and climbs. That lifts a lever that shuts down the steam, so the engine keeps a steady speed.",
  alt: "A level cross-head with two tall flat fans at its ends turns on an upright spindle. A heavy round ball sits on top of it, with a ring above. Two small rollers under the arms rest on sloping steps on a round plate fixed to the spindle. A long lever from the top of the ball ends in a post on the right, with a short rod hanging from it.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving shaft and inclines", note: "The engine turns this upright shaft, called the spindle. A round plate on it has two sloping steps, called inclines, that push the cross-head round." },
    { key: "cross", color: "#C8873A", name: "Cross-head and ball", note: "It sits loose on the spindle. Its rollers rest on the inclines. It is heavy, so it sinks back down when the speed drops." },
    { key: "fans", color: "#8E7AA8", name: "Fans", note: "Flat boards on the ends of the arms. The air pushes back on them. Watch them fall behind the spindle as it speeds up." },
    { key: "out", color: "#4FA58A", name: "Lever and rod", note: "A collar on top of the ball lifts one end of the lever. The rod on the lever goes to the steam valve of the engine." }
  ],
  controls: [{ id: "weight", label: "Weight of the cross-head", value: "drawn", options: [["light", "Light"], ["drawn", "Medium"], ["heavy", "Heavy"]] }],
  speed: { min: 20, max: 80, value: 60, label: "Engine speed", unit: " rpm" },
  readouts: [{ id: "lag", label: "Fans lag" }, { id: "lift", label: "Cross-head up" }],
  views: { "3d": [700, 320, 1080], front: [15, 40, 1300], side: [1300, 60, 0] },
  target: [15, 50, 0],
  distance: [500, 2800],
  how: [
    "The engine turns the spindle. A round plate on the spindle has two sloping steps. The cross-head sits loose on the spindle, and two rollers under its arms rest on the slopes. So the slopes push the cross-head round. Two big flat fans are fixed to its arms.",
    "Air pushes back on the fans, and the faster they go, the harder it pushes. At low speed the push is small, and the weight keeps the rollers at the bottom of the slopes. At higher speed the fans fall behind the spindle, and the rollers climb. That lifts the cross-head and the ball. The lever then pulls the rod up, which closes the steam valve a little. When the engine slows, the weight pulls it back down and the valve opens.",
    "Move the speed slider from slow to fast and watch the lag and the lift. Then try a heavy cross-head. It needs a higher speed before it starts to rise."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the rollers on curved inclines under the arms. Here the inclines are two sloping steps on a round plate on the spindle. The base, the long floor plate, the post and pivot of the lever, the hanging rod, the sizes and the strength of the air push were made up. The cross-head rises smoothly as the speed rises. The weight choices were added for comparison.",

  // Ramp in the shaft frame: angle u runs -U..0, height above the plate = SL * (-u). Point at angle u: (r cos u, y, -r sin u).
  K: { SL: 30, U: 1.3, PM: 1.15, T0: 9.9, KS: 60, B: 6, RR: 135, YP: -20, LX: 285, LY: 254, RODX: 215 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i, k;
    var o = this.o = { ths: 0, phi: 0, pd: 0, ws: 0 };
    // spindle with plate and inclines (turns with the engine)
    o.shaft = new T.Group(); scene.add(o.shaft);
    P.at(P.cylY(14, 95, c.mat("drive")), 0, -17.5, 0, o.shaft);                          // spindle y -65..30, starts on the base top (y -65), ends inside the sleeve
    P.at(P.cylY(155, 12, c.mat("drive")), 0, -26, 0, o.shaft);                            // plate y -32..-20
    P.at(P.box(2, 17, 5, c.mat("drive", "dark")), 15, -48.5, 0, o.shaft);                 // stripe on the spindle, x 14..16, y -57..-40
    P.at(P.box(6, 1, 80, c.mat("drive", "dark")), 0, -19, -70, o.shaft);                  // stripe on the plate, y -19.5..-18.5, lifted 0.5
    function wedge(a0) {
      var n = 14, p = [], r1 = 120, r2 = 150, y0 = K.YP, U = K.U, u, v = [];
      function pt(u, r, y) { return [r * Math.cos(u), y, -r * Math.sin(u)]; }
      function quad(a, b, cc, d) { v.push.apply(v, a.concat(b, cc, a, cc, d)); }
      for (i = 0; i < n; i++) {
        var u0 = a0 - U + U * i / n, u1 = a0 - U + U * (i + 1) / n, h0 = .5 + K.SL * (a0 - u0), h1 = .5 + K.SL * (a0 - u1);
        quad(pt(u0, r1, y0 + h0), pt(u0, r2, y0 + h0), pt(u1, r2, y0 + h1), pt(u1, r1, y0 + h1));   // sloping top
        quad(pt(u0, r2, y0), pt(u1, r2, y0), pt(u1, r2, y0 + h1), pt(u0, r2, y0 + h0));             // outer side
        quad(pt(u0, r1, y0), pt(u1, r1, y0), pt(u1, r1, y0 + h1), pt(u0, r1, y0 + h0));             // inner side
      }
      var hT = .5 + K.SL * U, ue = a0 - U;
      quad(pt(ue, r1, y0), pt(ue, r2, y0), pt(ue, r2, y0 + hT), pt(ue, r1, y0 + hT));                // tall end
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(v, 3)); g.computeVertexNormals();
      return P.mesh(g, c.mat("drive"));
    }
    o.shaft.add(wedge(0)); o.shaft.add(wedge(Math.PI));
    // cross-head: loose sleeve, arms, rollers, ball, neck, fans
    o.head = new T.Group(); scene.add(o.head);
    var mc = c.mat("cross");
    P.at(P.cylY(30, 64, mc), 0, 14, 0, o.head);                                           // sleeve y -18..46
    P.at(P.box(340, 14, 14, mc), 0, 6, 0, o.head);                                        // arm x -170..170, y -1..13, z -7..7; ends on the fan faces
    for (k = -1; k <= 1; k += 2) {
      P.at(P.box(30, 5, 18, mc), k * 135, -3.5, 0, o.head);                               // bracket y -6..-1, z -9..9, under the arm
      P.at(P.cylX(8, 26, mc), k * 135, -11.3, 0, o.head);                                 // roller y -19.3..-3.3, x +-122..148, rests on the incline
      var fan = P.at(P.box(100, 220, 6, c.mat("fans")), k * 220, 10, 0, o.head);          // fan x +-170..270, y -100..120, z -3..3
      P.at(P.box(70, 6, 1, c.mat("fans", "dark")), k * 220, 90, 4, o.head);               // stripe on the fan face, z 3.5..4.5 (lifted 0.5)
      P.at(P.box(70, 6, 1, c.mat("fans", "dark")), k * 220, 90, -4, o.head);
    }
    P.at(P.sphere(95, mc), 0, 130, 0, o.head);                                            // ball y 35..225
    P.at(P.cylY(14, 70, mc), 0, 250, 0, o.head);                                          // neck y 215..285
    P.at(P.hook({ radius: 9, tube: 3, material: mc }), 0, 297, 0, o.head);                // ring y 285..309
    // collar that does not turn, lever, rod
    o.collar = P.at(P.cylY(22, 26, c.mat("out")), 0, K.LY, 0, scene);                     // collar y 241..267 at rest, rides up with the cross-head
    o.lever = new T.Group(); o.lever.position.set(K.LX, K.LY, 0); scene.add(o.lever);
    P.at(P.box(285, 14, 10, c.mat("out")), -142.5, 0, 0, o.lever);                        // lever x 0..285, z -5..5
    P.at(P.cylZ(5, 14, c.mat("out")), 0, 0, -1, o.lever);                                 // pivot pin z -8..6, ends on the post face at z -8
    o.rod = new T.Group(); o.rod.position.set(K.RODX, K.LY, 0); scene.add(o.rod);
    P.at(P.cylY(3.5, 110, c.mat("out")), 0, -55, 0, o.rod);                               // rod hangs from the lever, y -110..0
    P.at(P.sphere(7, c.mat("out")), 0, -110, 0, o.rod);
    // fixed parts
    P.at(P.cylY(20, 115, c.mat("drive")), 0, -172.5, 0, scene);                           // drive stem y -230..-115, ends on the floor plate
    P.at(P.box(460, 10, 120, c.fixed), 70, -110, 0, scene);                               // floor plate x -160..300, y -115..-105, z -60..60
    P.at(P.box(300, 40, 120, c.fixed), 0, -85, 0, scene);                                 // base x -150..150, y -105..-65, z -60..60, on the plate
    P.at(P.box(24, 371, 8, c.fixed), 285, 80.5, -12, scene);                              // post x 273..297, y -105..266, z -16..-8, on the plate; outside the fans (radius 270)
    this.place(0);
  },

  place: function (lift) {
    var o = this.o, K = this.K, s = lift / K.LX, th = -Math.asin(Math.min(.5, s));
    o.shaft.rotation.y = o.ths;
    o.head.rotation.y = o.ths - o.phi;
    o.head.position.y = lift;
    o.collar.position.y = K.LY + lift;
    o.lever.rotation.z = th;
    var yr = (K.RODX - K.LX) * Math.sin(th);                      // height of the lever at the rod
    o.rod.position.y = K.LY + yr;
    return yr;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, W = { light: .6, drawn: 1, heavy: 1.8 }[S.controls.weight] || 1, n = 12, j;
    if (S.playing && dt > 0) {
      var wp = o.ws, h = dt / n;
      o.ws += (S.w - o.ws) * Math.min(1, dt * 4);
      var dws = (o.ws - wp) / dt;
      for (j = 0; j < n; j++) {
        var wc = o.ws - o.pd;                                      // speed of the cross-head
        // air drag on the fans grows with the square of their speed; the weight on the slope pushes back
        o.pd += (dws + wc * wc - W * (K.T0 + K.KS * o.phi) - K.B * o.pd) * h;
        o.phi += o.pd * h;
        if (o.phi < 0) { o.phi = 0; if (o.pd < 0) o.pd = 0; }
        if (o.phi > K.PM) { o.phi = K.PM; if (o.pd > 0) o.pd = 0; }
      }
      o.ths += o.ws * dt;
    }
    var lift = K.SL * o.phi, yr = this.place(lift);
    S.set("lag", Math.round(o.phi * 180 / Math.PI) + "°");
    S.set("lift", lift.toFixed(1) + " mm");
  }
});
