M507.define({
  number: 16,
  title: "Spanish barton",
  lede: "Two ropes and three pulleys let a small pull lift a weight four times as heavy. One rope holds up a pulley that the other rope runs over, so the two ropes help each other. Sailors used this rig to hoist heavy loads.",
  alt: "A pulley hung from a beam, a pulley hanging free below it on a rope, and a lower pulley carrying a weight. A yellow rope runs from the beam under the lower pulley, over the free pulley and down to a winch. A blue rope runs from the top of the lower pulley over the upper pulley and down to the free pulley.",
  parts: [
    { key: "top", color: "#4FA58A", name: "Upper pulley", note: "Hangs from the beam and does not move. The blue rope runs over it." },
    { key: "mid", color: "#C8873A", name: "Middle pulley", note: "Hangs on the blue rope, with the yellow rope running over it. It sinks as the weight rises." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "100 kg. It hangs from the lower pulley." },
    { key: "low", color: "#E8E2D0", name: "Lower pulley", note: "Carries the weight. Two yellow ropes and the blue rope hold it up." },
    { key: "rope", color: "#D9B13B", name: "Hauling rope", note: "Tied to the beam, it runs under the lower pulley and over the middle one to the winch. Watch its red marks." },
    { key: "rope2", color: "#5E7387", name: "Holding rope", note: "Tied to the top of the lower pulley. It runs over the upper pulley and holds up the middle pulley." }
  ],
  readouts: [{ id: "r", label: "Rope pulled" }, { id: "l", label: "Weight raised" }],
  views: { "3d": [630, 80, 990], front: [40, -45, 1000], side: [1000, -45, 40] },
  target: [40, -45, 0],
  how: [
    "Follow the yellow rope up from the winch. It goes over the middle pulley, down under the lower pulley and up to the beam. The blue rope goes from the top of the lower pulley, over the upper pulley, and down to the middle pulley.",
    "Say the winch pulls with 25 kg. Every part of the yellow rope pulls with 25 kg. Two yellow parts hang from the middle pulley, so the blue rope must hold 50 kg. The lower pulley is held up by two yellow parts and the blue rope. That is 25 + 25 + 50 = 100 kg.",
    "In return, the winch pulls in 4 cm of rope for every 1 cm the weight rises. The middle pulley sinks exactly as far as the weight rises, because the blue rope lets it down. Run it and compare the two readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown leaves the end of the rope hanging; a small winch was added to pull it. The rope colours, the sizes and the weight are made up. Real pulleys rub a little on their pins, so a real lift needs a bit more pull than shown here.",

  build: function (c) {
    var P = c.P, scene = c.scene, R = 26, YB = 230, GY = -320;
    var o = this.o = { R: R, YB: YB, YF: YB - R - 66, YL0: -162, YM0: -12, GY: GY, TRAVEL: 240, th: 0 };
    // top block hangs from the beam: hook top at YF + R + 66 = YB, the beam's underside
    P.at(P.ropeBlock({ radius: R, material: c.mat("top") }), R, o.YF, 0, scene);
    o.sTop = P.at(P.sheave({ radius: R, material: c.mat("top"), holes: c.mat("top", "dark") }), R, o.YF, 0, scene);
    P.at(P.box(220, 16, 60, c.fixed), 30, YB + 8, 0, scene);                    // beam, y 230 .. 246
    // eye under the beam for the yellow rope's tied end
    P.at(P.cylY(3, 14, c.fixed), -R, YB - 7, 0, scene);                          // shank, y 216 .. 230 (beam face)
    P.at(P.hook({ radius: 7, tube: 2.5, material: c.fixed }), -R, YB - 19, 0, scene);   // ring centre 211; shank end 5 from centre, inside the rod
    // middle block, hook up, hung on the blue rope
    o.M = new c.THREE.Group(); scene.add(o.M);
    P.at(P.ropeBlock({ radius: R, material: c.mat("mid") }), 0, 0, 0, o.M);
    o.sMid = P.at(P.sheave({ radius: R, material: c.mat("mid"), holes: c.mat("mid", "dark") }), 0, 0, 0, o.M);
    // bottom block: hook below for the weight, and an eye on top where the blue rope is tied
    o.L = new c.THREE.Group(); scene.add(o.L);
    var ml = c.mat("low");
    P.at(P.ropeBlock({ radius: R, material: ml, up: false }), 0, 0, 0, o.L);   // straps y ±39, hook below to -92
    o.sLow = P.at(P.sheave({ radius: R, material: ml, holes: c.mat("low", "dark") }), 0, 0, 0, o.L);
    P.at(P.box(18, 5, 15, ml), 0, R + 13, 0, o.L);                               // top cross strap over the straps' ends, y 36.5 .. 41.5
    P.at(P.cylY(3, 34, ml), 0, R + 30, 0, o.L);                                  // rod, y 39 .. 73
    P.at(P.hook({ material: ml }), 0, R + 54, 0, o.L);                           // eye, y 68 .. 92
    // weight under the bottom block
    P.at(P.cylY(2.5, 16, c.mat("weight")), 0, -(R + 66), 0, o.L);               // stem, y -84 .. -100, through the hook's lower rod
    P.at(P.cylY(32, 50, c.mat("weight")), 0, -(R + 97), 0, o.L);                // weight, y -98 .. -148, stem end inside it
    // ground and winch: the drum's left side is at x = 3R, under the middle pulley's right side
    P.at(P.box(300, 8, 140, c.fixed), 30, GY - 4, 0, scene);                    // ground, y -328 .. -320; weight bottom starts at -310
    o.w = P.at(P.winch({ height: 40, material: c.mat("rope"), handle: c.mat("rope", "dark"), rope: c.mat("rope") }), 0, GY + 40, 0, scene);
    o.w.position.x = 3 * R + o.w.ropeRadius;                                     // foot underside at GY
    // the two ropes
    o.y = P.ropePath({ material: c.mat("rope"), mark: c.mat("rope", "mark"), marks: 3 }); scene.add(o.y);
    o.v = P.ropePath({ material: c.mat("rope2"), mark: c.mat("rope", "mark"), marks: 1 }); scene.add(o.v);
    o.knots = [P.sphere(3.5, c.mat("rope")), P.sphere(3.5, c.mat("rope2")), P.sphere(3.5, c.mat("rope2"))];
    o.knots.forEach(function (k) { scene.add(k); });
    o.knots[0].position.set(-R, YB - 28, 0);                                     // yellow end tied to the eye's bottom
  },

  step: function (c, dt, S) {
    var o = this.o, R = o.R, PI = Math.PI;
    o.th += S.w * dt;
    var pull = o.TRAVEL * (.5 - .5 * Math.cos(o.th)), d = pull / 4, yL = o.YL0 + d, yM = o.YM0 - d;
    o.L.position.y = yL; o.M.position.set(2 * R, yM, 0);
    // yellow: eye on the beam, under the lower pulley, over the middle pulley, down to the winch
    o.y.set([[-R, o.YB - 26, 0], { c: [0, yL, 0], r: R, a0: PI, a1: 2 * PI }, { c: [2 * R, yM, 0], r: R, a0: PI, a1: 0 }, [3 * R, o.GY + 40, 0]]);
    // blue: eye on top of the lower pulley, over the upper pulley, down to the middle pulley's eye
    o.v.set([[0, yL + R + 66, 0], { c: [R, o.YF, 0], r: R, a0: PI, a1: 0 }, [2 * R, yM + R + 66, 0]]);
    if (!o.y0) {                                                                 // first frame: marks halfway along the straight parts
      o.y0 = o.y.wrapS.slice(); o.v0 = o.v.wrapS.slice();
      o.y.markS = [o.y0[0] / 2, (o.y0[0] + PI * R + o.y0[1]) / 2, o.y0[1] + PI * R + 13];
      o.v.markS = [o.v0[0] / 2];
      o.y.set([[-R, o.YB - 26, 0], { c: [0, yL, 0], r: R, a0: PI, a1: 2 * PI }, { c: [2 * R, yM, 0], r: R, a0: PI, a1: 0 }, [3 * R, o.GY + 40, 0]]);
      o.v.set([[0, yL + R + 66, 0], { c: [R, o.YF, 0], r: R, a0: PI, a1: 0 }, [2 * R, yM + R + 66, 0]]);
    }
    o.knots[1].position.set(0, yL + R + 68, 0); o.knots[2].position.set(2 * R, yM + R + 68, 0);
    o.sLow.rotation.z = -(o.y.wrapS[0] - o.y0[0]) / R;                           // wraps a1 > a0
    o.sMid.rotation.z = (o.y.wrapS[1] - o.y0[1]) / R;                            // wraps a1 < a0
    o.sTop.rotation.z = (o.v.wrapS[0] - o.v0[0]) / R;
    o.w.drum.rotation.z = pull / o.w.ropeRadius;
    S.set("r", Math.round(pull / 10) + " cm");
    S.set("l", (d / 10).toFixed(1) + " cm");
  }
});
