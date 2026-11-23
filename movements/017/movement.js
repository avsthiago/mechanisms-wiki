M507.define({
  number: 17,
  title: "Spanish barton, second form",
  lede: "Two ropes and three pulleys let a small pull lift a weight five times as heavy. The rope you pull hangs a pulley on the other rope, so the other rope pulls hard too. Sailors used rigs like this to hoist heavy loads.",
  alt: "A pulley hung from a beam, a pulley hanging free beside it, and a lower pulley carrying a weight. A blue rope runs from the beam under the lower pulley, over the upper pulley and down to the free pulley. A yellow rope runs from an arm on the lower pulley over the free pulley and down to a winch.",
  parts: [
    { key: "top", color: "#4FA58A", name: "Upper pulley", note: "Hangs from the beam and does not move. The blue rope runs over it." },
    { key: "mid", color: "#C8873A", name: "Middle pulley", note: "Hangs on the blue rope, with the yellow rope running over it. It sinks twice as fast as the weight rises." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "100 kg. It hangs from the lower pulley." },
    { key: "low", color: "#E8E2D0", name: "Lower pulley", note: "Carries the weight. Two blue ropes and one yellow rope hold it up. The yellow rope is tied to its arm." },
    { key: "rope", color: "#D9B13B", name: "Hauling rope", note: "Tied to the arm on the lower pulley, it runs over the middle pulley to the winch. Watch its red marks." },
    { key: "rope2", color: "#5E7387", name: "Holding rope", note: "Tied to the beam, it runs under the lower pulley and over the upper pulley, and holds up the middle pulley." }
  ],
  readouts: [{ id: "r", label: "Rope pulled" }, { id: "l", label: "Weight raised" }, { id: "m", label: "Middle sank" }],
  views: { "3d": [650, 80, 1010], front: [50, -55, 1020], side: [1020, -55, 50] },
  target: [50, -55, 7],
  how: [
    "Follow the yellow rope up from the winch. It goes over the middle pulley and down to an arm on the lower pulley. The blue rope starts at the beam. It goes under the lower pulley, over the upper pulley, and down to hold up the middle pulley.",
    "Say the winch pulls with 20 kg. Both sides of the yellow rope pull down on the middle pulley, so the blue rope must hold 40 kg. The lower pulley is held up by two blue parts and one yellow part. That is 40 + 40 + 20 = 100 kg.",
    "In return, the winch pulls in 5 cm of rope for every 1 cm the weight rises. The middle pulley sinks 2 cm, because both blue parts beside the lower pulley get 1 cm shorter. Run it and compare the three readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown ties the yellow rope to the middle of the lower pulley, so it slants. Here it is tied to a short arm so it hangs straight, which keeps the pull at exactly a fifth. Brown leaves the end of the rope hanging; a small winch was added to pull it. The rope colours, the sizes and the weight are made up. Real pulleys rub a little on their pins.",

  build: function (c) {
    var P = c.P, scene = c.scene, R = 26, YB = 230, GY = -338, Z = 14;
    var o = this.o = { R: R, Z: Z, YB: YB, YF: YB - R - 66, YL0: -180, YM0: -10, GY: GY, TRAVEL: 200, th: 0 };
    // top block, in the front plane z = 14; hook top at YF + R + 66 = YB, the beam's underside
    P.at(P.ropeBlock({ radius: R, material: c.mat("top") }), 2 * R, o.YF, Z, scene);
    o.sTop = P.at(P.sheave({ radius: R, material: c.mat("top"), holes: c.mat("top", "dark") }), 2 * R, o.YF, Z, scene);
    P.at(P.box(230, 16, 70, c.fixed), 40, YB + 8, 7, scene);                    // beam, y 230 .. 246, z -28 .. 42
    // eye under the beam for the blue rope's tied end
    P.at(P.cylY(3, 14, c.fixed), -R, YB - 7, 0, scene);                          // shank, y 216 .. 230 (beam face)
    P.at(P.hook({ radius: 7, tube: 2.5, material: c.fixed }), -R, YB - 19, 0, scene);   // ring centre 211; shank end 5 from centre, inside the rod
    // middle block, hook up, hung on the blue rope, in the front plane
    o.M = new c.THREE.Group(); scene.add(o.M);
    P.at(P.ropeBlock({ radius: R, material: c.mat("mid") }), 0, 0, 0, o.M);
    o.sMid = P.at(P.sheave({ radius: R, material: c.mat("mid"), holes: c.mat("mid", "dark") }), 0, 0, 0, o.M);
    // bottom block at z = 0: hook below for the weight, and an arm reaching forward and right for the yellow rope
    o.L = new c.THREE.Group(); scene.add(o.L);
    var ml = c.mat("low");
    P.at(P.ropeBlock({ radius: R, material: ml, up: false }), 0, 0, 0, o.L);   // straps z ±(4.5 .. 7.5), pin ends at z ±7.5
    o.sLow = P.at(P.sheave({ radius: R, material: ml, holes: c.mat("low", "dark") }), 0, 0, 0, o.L);
    P.at(P.cylZ(3, 4.5, ml), 0, 0, 9.75, o.L);                                   // pin carried on, z 7.5 .. 12
    P.at(P.box(2 * R + 6, 6, 4, ml), R, 0, Z, o.L);                              // arm, x -3 .. 55, y -3 .. 3, z 12 .. 16
    // weight under the bottom block
    P.at(P.cylY(2.5, 16, c.mat("weight")), 0, -(R + 66), 0, o.L);               // stem, y -84 .. -100, through the hook's lower rod
    P.at(P.cylY(32, 50, c.mat("weight")), 0, -(R + 97), 0, o.L);                // weight, y -98 .. -148, stem end inside it
    // ground and winch: the drum's left side is at x = 4R, under the middle pulley's right side
    P.at(P.box(260, 8, 150, c.fixed), 50, GY - 4, Z, scene);                    // ground, y -346 .. -338; weight bottom starts at -328
    o.w = P.at(P.winch({ height: 40, material: c.mat("rope"), handle: c.mat("rope", "dark"), rope: c.mat("rope") }), 4 * R, GY + 40, Z, scene);
    o.w.position.x = 4 * R + o.w.ropeRadius;                                     // foot underside at GY
    // the two ropes
    o.y = P.ropePath({ material: c.mat("rope"), mark: c.mat("rope", "mark"), marks: 2 }); scene.add(o.y);
    o.v = P.ropePath({ material: c.mat("rope2"), mark: c.mat("rope", "mark"), marks: 2 }); scene.add(o.v);
    o.knots = [P.sphere(3.5, c.mat("rope2")), P.sphere(3.5, c.mat("rope2")), P.sphere(3.5, c.mat("rope"))];
    o.knots.forEach(function (k) { scene.add(k); });
    o.knots[0].position.set(-R, YB - 28, 0);                                     // blue end tied to the eye's bottom
  },

  step: function (c, dt, S) {
    var o = this.o, R = o.R, Z = o.Z, PI = Math.PI;
    o.th += S.w * dt;
    var pull = o.TRAVEL * (.5 - .5 * Math.cos(o.th)), d = pull / 5, yL = o.YL0 + d, yM = o.YM0 - 2 * d;
    o.L.position.y = yL; o.M.position.set(3 * R, yM, Z);
    function place() {
      // blue: eye on the beam, under the lower pulley, over the upper pulley, down to the middle pulley's eye
      o.v.set([[-R, o.YB - 26, 0], { c: [0, yL, 0], r: R, a0: PI, a1: 2 * PI }, { c: [2 * R, o.YF, Z], r: R, a0: PI, a1: 0 }, [3 * R, yM + R + 66, Z]]);
      // yellow: tied on top of the arm's end, over the middle pulley, down to the winch
      o.y.set([[2 * R, yL + 5, Z], { c: [3 * R, yM, Z], r: R, a0: PI, a1: 0 }, [4 * R, o.GY + 40, Z]]);
    }
    place();
    if (!o.y0) {                                                                 // first frame: marks on the straight parts
      o.y0 = o.y.wrapS.slice(); o.v0 = o.v.wrapS.slice();
      o.v.markS = [o.v0[0] / 2, (o.v0[0] + PI * R + o.v0[1]) / 2];
      o.y.markS = [o.y0[0] / 2, o.y0[0] + PI * R + 30];
      place();
    }
    o.knots[1].position.set(3 * R, yM + R + 68, Z); o.knots[2].position.set(2 * R, yL + 5, Z);
    o.sLow.rotation.z = -(o.v.wrapS[0] - o.v0[0]) / R;                           // wrap a1 > a0
    o.sTop.rotation.z = (o.v.wrapS[1] - o.v0[1]) / R;                            // wraps a1 < a0
    o.sMid.rotation.z = (o.y.wrapS[0] - o.y0[0]) / R;
    o.w.drum.rotation.z = pull / o.w.ropeRadius;
    S.set("r", Math.round(pull / 10) + " cm");
    var dl = Math.round(d) / 10;                                                 // round once so sank is exactly twice raised
    S.set("l", dl.toFixed(1) + " cm");
    S.set("m", (2 * dl).toFixed(1) + " cm");
  }
});
