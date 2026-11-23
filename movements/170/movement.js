M507.define({
  number: 170,
  title: "Crossed-arm governor",
  lede: "Two heavy balls swing out as the spindle spins faster. Their arms cross at the top and pull a rod down. The rod closes the steam valve, so the engine does not run away.",
  alt: "An upright spindle with two round balls on arms that cross at a pivot on the spindle. The arms reach up past the pivot. Two short links join their upper ends to a rod above. At the bottom, a pair of bevel gears turns the spindle from a sideways shaft.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Spindle and gears", note: "The engine turns the sideways shaft. A pair of bevel gears turns the upright spindle. The arms are hinged to it." },
    { key: "arms", color: "#C8873A", name: "Crossed arms", note: "Each arm has a ball at one end. The arms cross at the hinge. The long end of each arm reaches up above it." },
    { key: "balls", color: "#8E7AA8", name: "Balls", note: "Heavy balls. They fly outward as the speed rises. Watch how far they swing." },
    { key: "links", color: "#D9B13B", name: "Links", note: "Two short bars. They join the top ends of the arms to the rod." },
    { key: "rod", color: "#4FA58A", name: "Valve rod", note: "It does not turn. It slides up and down. The red band shows how far it has moved. It goes to the steam valve." }
  ],
  controls: [{ id: "spring", label: "Spring on the valve rod", value: "light", options: [["none", "None"], ["light", "Light"], ["strong", "Strong"]] }],
  speed: { min: 55, max: 95, value: 73, label: "Engine speed", unit: " rpm" },
  readouts: [{ id: "ang", label: "Balls out" }, { id: "rod", label: "Rod down" }],
  views: { "3d": [480, -20, 1400], front: [-50, -110, 1300], side: [1300, -110, 0] },
  target: [-50, -110, 0],
  distance: [600, 3000],
  how: [
    "The engine turns the spindle through two bevel gears. The two balls turn with it. Spinning balls want to fly outward, and they swing out from the spindle.",
    "The arms cross at the hinge. So when the balls swing out, the other ends of the arms swing in. Two short links join those ends to the rod. The rod is pulled down, and the steam valve closes a little. When the engine slows, the balls drop, the rod rises and the valve opens.",
    "Move the speed slider up and watch the balls and the rod. Below a certain speed the balls just hang. Then try a stronger spring on the rod. The balls need more speed to move it."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the bearings, the gear sizes, the ball weight, the rod spring and the rod's top end were made up. Stops keep the balls from touching and from going too high. The curved bar in the drawing is made as two halves that slide past each other. The valve is not shown.",

  K: { L: 208, LU: 75, LK: 63, R: 44, PMIN: .25, PMAX: .9, M: 1, G: 9.81, B: .8, YA: -300, RG: 36 },

  rodY: function (phi) { var K = this.K, ux = K.LU * Math.sin(phi); return K.LU * Math.cos(phi) + Math.sqrt(K.LK * K.LK - ux * ux); },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i;
    var o = this.o = { th: 0, ws: 0, phi: .52, pd: 0 };
    var md = c.mat("drive"), ma = c.mat("arms"), mb = c.mat("balls"), ml = c.mat("links"), mr = c.mat("rod");
    o.top0 = this.rodY(K.PMIN);
    // turning group: spindle, hinge, arms, balls, links, rod fork, upper gear
    o.sp = new T.Group(); scene.add(o.sp);
    P.at(P.cylY(7, 405, md), 0, -202.5, 0, o.sp);                                   // spindle y -405..0, bottom on the bearing top face
    P.at(P.box(1.5, 40, 4, c.mat("drive", "dark")), 7.25, -150, 0, o.sp);           // stripe on the spindle, x 6.5..8
    P.at(P.cylZ(16, 6, md), 0, 0, 18, o.sp);                                        // hinge collar z 15..21, on the arm face
    P.at(P.cylZ(16, 6, md), 0, 0, -18, o.sp);                                       // z -21..-15
    P.at(P.cylZ(4, 44, md), 0, 0, 0, o.sp);                                         // hinge pin z -22..22
    o.C = P.bevelGear({ radius: K.RG, teeth: 24, material: md }); P.at(o.C, 0, K.YA, 0, o.sp);
    o.pitch = o.C.pitch;
    function armGroup(sign) {
      var g = new T.Group(); g.position.set(0, 0, sign * 12); o.sp.add(g);
      P.at(P.box(9, K.L - 30 + K.LU + 8, 6, ma), 0, (K.LU + 8 - (K.L - 30)) / 2, 0, g);   // arm local y -(L-30)..LU+8, z +-9..15
      P.at(P.sphere(K.R, mb), 0, -K.L, 0, g);
      var ring = P.hoop(K.R + .8, 1.6, c.mat("balls", "dark")); P.at(ring, 0, -K.L, 0, g);
      var arc = P.arc(140, 2.5, 1.0, ma); arc.rotation.z = sign > 0 ? -Math.PI / 2 : -Math.PI / 2 - 1.0; g.add(arc);   // half of the curved bar, z +-9.5..14.5
      P.at(P.cylZ(4, 13, ma), 0, K.LU, sign * 3.5, g);                            // upper pin through arm and link
      return g;
    }
    o.a1 = armGroup(1);  o.a2 = armGroup(-1);   // a1: z +12, ball on the left; a2: z -12, ball on the right
    o.l1 = P.at(P.rod(3.5, ml), 0, 0, 0, o.sp); o.l2 = P.at(P.rod(3.5, ml), 0, 0, 0, o.sp);
    o.fork = new T.Group(); o.sp.add(o.fork);
    P.at(P.box(12, 14, 30, mr), 0, 0, 0, o.fork);                                   // fork z -15..15, between the links
    P.at(P.cylZ(3.5, 44, mr), 0, 0, 0, o.fork);                                     // pin z -22..22
    // rod that does not turn
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.cylY(4.5, 120, mr), 0, 60, 0, o.rod);                                    // local y 0..120
    P.at(P.cylY(5.5, 8, c.mat("rod", "mark")), 0, 40, 0, o.rod);                    // red band, radius 1 above the rod
    P.at(P.sphere(7, mr), 0, 122, 0, o.rod);
    // horizontal shaft and its gear
    o.ag = new T.Group(); o.ag.position.set(0, K.YA, 0); o.ag.rotation.z = Math.PI / 2; scene.add(o.ag);
    o.A = P.bevelGear({ radius: K.RG, teeth: 24, material: md }); o.ag.add(o.A);
    o.hs = new T.Group(); o.hs.position.set(0, K.YA, 0); scene.add(o.hs);
    P.at(P.cylX(6, 105, md), -137.5, 0, 0, o.hs);                                   // shaft x -190..-85, ends on the bearing face
    P.at(P.box(30, 2, 3, c.mat("drive", "dark")), -150, 6.2, 0, o.hs);              // stripe y 5.2..7.2
    // fixed supports
    P.at(P.box(275, 10, 80, c.fixed), -97.5, -440, 0, scene);                       // floor x -235..40, y -445..-435, z -40..40
    P.at(P.box(50, 30, 50, c.fixed), 0, -420, 0, scene);                            // spindle bearing x -25..25, y -435..-405, z +-25, on the floor
    P.at(P.box(32, 157, 44, c.fixed), -206, -356.5, 0, scene);                      // shaft bearing x -222..-190, y -435..-278, on the floor
    this.place();
  },

  place: function () {
    var o = this.o, K = this.K, p = o.phi, yr = this.rodY(p), ux = K.LU * Math.sin(p), uy = K.LU * Math.cos(p);
    o.sp.rotation.y = -o.th;
    o.a1.rotation.z = -p; o.a2.rotation.z = p;
    o.l1.span(ux, uy, 18, 0, yr, 18); o.l2.span(-ux, uy, -18, 0, yr, -18);
    o.fork.position.set(0, yr, 0);
    o.rod.position.y = yr;
    o.A.rotation.y = o.th + o.pitch / 2;
    o.hs.rotation.x = -(o.th + o.pitch / 2);
    return yr;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, F = { none: 0, light: 1.5, strong: 4 }[S.controls.spring] || 0, n = 10, j;
    if (S.playing && dt > 0) {
      var h = dt / n;
      if (!o.init) { o.init = 1; o.ws = S.w; }
      o.ws += (S.w - o.ws) * Math.min(1, dt * 4);
      for (j = 0; j < n; j++) {
        var p = o.phi, dy = (this.rodY(p + 1e-4) - this.rodY(p - 1e-4)) / 2e-4 / 1000;   // metres of rod per radian
        var Lm = K.L / 1000;
        var Q = 2 * K.M * Lm * Lm * o.ws * o.ws * Math.sin(p) * Math.cos(p) - 2 * K.M * K.G * Lm * Math.sin(p) + F * dy - K.B * o.pd;
        o.pd += Q / (2 * K.M * Lm * Lm) * h;
        o.phi += o.pd * h;
        if (o.phi < K.PMIN) { o.phi = K.PMIN; if (o.pd < 0) o.pd = 0; }
        if (o.phi > K.PMAX) { o.phi = K.PMAX; if (o.pd > 0) o.pd = 0; }
      }
      o.th += o.ws * dt;
    }
    var yr = this.place();
    S.set("ang", Math.round(o.phi * 180 / Math.PI) + "°");
    S.set("rod", (o.top0 - yr).toFixed(0) + " mm");
  }
});
