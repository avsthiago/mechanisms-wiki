/* Elevation, drawing units (1 = a pixel of the engraving) inside one group scaled by .5. x right, y up, z towards the viewer.
   The roving runs along y = 0; back rolls at x = -120, front rolls at x = -20, the spindle is the line x = 0 below them.
   Rolls z -20 .. 20, back plate z -30 .. -26 (roll axles end on its face at z = -26). */
M507.define({
  number: 496,
  title: "Drawing and twisting rollers",
  lede: "A loose rope of cotton fibres is squeezed between pairs of rollers. The front rollers turn faster than the back ones, so they pull the rope thinner. Then a spinning arm twists it into a strong thread and winds it onto a reel.",
  alt: "Two pairs of rollers side by side. A rope of fibre runs between the first pair and then the second, and bends down to the top of an upright spindle. A bent arm, the flyer, turns round a reel on the spindle.",
  parts: [
    { key: "back", color: "#5E7387", name: "Back rollers", note: "The first pair. They feed the thick rope in slowly." },
    { key: "front", color: "#C8873A", name: "Front rollers", note: "The second pair. They turn faster, so they pull the fibres out and make the rope thinner." },
    { key: "roving", color: "#D9B13B", name: "Roving", note: "The loose rope of fibres. The red marks show how fast it moves before and after the front rollers." },
    { key: "flyer", color: "#4FA58A", name: "Flyer and spindle", note: "A bent arm that spins round the reel. Each turn puts one twist into the thread." },
    { key: "bobbin", color: "#8E7AA8", name: "Reel", note: "Takes up the finished thread. It turns a little slower than the flyer, so the thread winds on." }
  ],
  controls: [{ id: "d", label: "Pull-out", value: "4", options: [["2", "Small"], ["4", "Medium"], ["6", "Big"]] }],
  readouts: [{ id: "draft", label: "Front faster" }, { id: "twist", label: "Twist" }],
  views: { "3d": [168, 92, 360], front: [0, 0, 400], side: [400, 0, 10] },
  target: [0, 0, 0],
  distance: [150, 2000],
  how: [
    "The thick rope goes in between the back rollers. The front rollers are a little further on and turn faster. They pull the fibres along faster than the back rollers let them in. The fibres slide past each other and the rope gets thinner. This is called drawing.",
    "The thin rope slips down into the flyer, a bent arm that spins round the reel. Every time the arm goes round, it twists the rope once. Twisting makes the fibres grip each other, so the thread is strong. The reel turns a little slower than the flyer and winds the thread on.",
    "Try Small, Medium and Big. With a bigger pull-out the front rollers are much faster, the rope after them is much thinner, and the twists are spread further apart."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the sizes of the rollers and the reel, the speed of the flyer and the exact path of the rope inside the flyer were made up. The spinning arm is shown going round much more slowly than a real one, so you can follow it. The twist is not drawn on the rope. The readout gives the length of thread that gets one twist.",

  build: function (c) {
    var T = c.THREE, P = c.P, S = .5, i;
    var o = this.o = { tb: 0, fl: 0 };
    var root = new T.Group(); root.scale.set(S, S, S); root.position.set(85 * S, 140 * S, 0); c.scene.add(root);
    P.at(P.box(230, 120, 4, c.fixed), -85, 0, -28, root);                               // back plate x -200 .. 30, y -60 .. 60, z -30 .. -26
    function roll(key, x, y, dir) {
      var g = new T.Group(); P.at(g, x, y, 0, root);
      g.add(P.cylZ(27, 40, c.mat(key)));
      P.at(P.cylZ(4, 6, c.mat(key)), 0, 0, -23, g);                                       // axle z -26 .. -20
      P.at(P.box(26, 3, 1.2, c.mat(key, "dark")), 13, 0, 20.6, g);                        // stripe, proud of the end face
      return g;
    }
    o.b1 = roll("back", -120, 30); o.b2 = roll("back", -120, -30); o.f1 = roll("front", -20, 30); o.f2 = roll("front", -20, -30);
    var mr = c.mat("roving");
    o.thick = P.rod(3, mr); o.thick.span(-230, 0, 0, -20, 0, 0); root.add(o.thick);
    o.thin = P.rod(2, mr); root.add(o.thin);
    o.m1 = P.at(P.sphere(5, c.mat("roving", "mark")), 0, 0, 0, root); o.m2 = P.at(P.sphere(4, c.mat("roving", "mark")), 0, 0, 0, root);
    // spindle, flyer, reel
    P.at(P.box(120, 10, 60, c.fixed), 0, -335, 0, root);                                // base top at y -330
    P.at(P.cylY(4, 220, c.mat("flyer")), 0, -220, 0, root);                              // spindle y -330 .. -110
    o.fly = new T.Group(); P.at(o.fly, 0, 0, 0, root);
    var mf = c.mat("flyer");
    P.at(P.cylY(10, 16, mf), 0, -118, 0, o.fly);
    P.at(P.box(76, 6, 6, mf), 0, -128, 0, o.fly);
    P.at(P.cylY(3, 130, mf), 38, -195, 0, o.fly); P.at(P.sphere(5, mf), 38, -262, 0, o.fly);
    P.at(P.cylY(3, 130, mf), -38, -195, 0, o.fly);
    o.ft = P.rod(1.6, mr); o.fly.add(o.ft.span(0, -112, 0, 38, -128, 0)); o.fly.add(P.rod(1.6, mr).span(38, -128, 0, 38, -255, 0)); o.fly.add(P.rod(1.6, mr).span(38, -255, 0, 30, -255, 0));
    o.bob = new T.Group(); P.at(o.bob, 0, 0, 0, root);
    var mb = c.mat("bobbin");
    P.at(P.cylY(26, 100, mb), 0, -205, 0, o.bob);
    P.at(P.cylY(32, 5, mb), 0, -152.5, 0, o.bob); P.at(P.cylY(32, 5, mb), 0, -257.5, 0, o.bob);
    P.at(P.box(2, 90, 5, c.mat("bobbin", "dark")), 26.8, -205, 0, o.bob);
    P.at(P.cylY(16, 22, mb), 0, -277, 0, o.bob);
    P.at(P.cylY(8, 40, mf), 0, -310, 0, root);
  },

  step: function (c, dt, S) {
    var o = this.o, D = +S.controls.d, M = Math.PI;
    o.tb += S.w * dt; o.fl += 8 * S.w * dt;
    var tb = o.tb;
    o.b1.rotation.z = -tb; o.b2.rotation.z = tb; o.f1.rotation.z = -D * tb; o.f2.rotation.z = D * tb;
    o.fly.rotation.y = o.fl; o.bob.rotation.y = .85 * o.fl;
    o.thin.span(-20, 0, 0, 0, -108, 0); o.thin.scale.x = o.thin.scale.z = 3 / Math.sqrt(D) / 2;
    var L1 = 210, L2 = Math.hypot(20, 108);
    o.m1.position.set(-230 + ((((27 * tb + 40) % L1) + L1) % L1), 0, 0);
    var t = ((((D * 27 * tb + 20) % L2) + L2) % L2) / L2;
    o.m2.position.set(-20 + 20 * t, -108 * t, 0);
    S.set("draft", D + " times");
    S.set("twist", "1 per " + Math.round(D * 2 * M * 13.5 / 8) + " cm");
  }
});
