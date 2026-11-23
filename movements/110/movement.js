M507.define({
  number: 110,
  title: "Double screw for spooling",
  lede: "A roller turns steadily and a thread guide slides along it, first one way and then back. The roller has two fine screw threads, one wound each way. Two half-nuts take turns gripping them, so the guide can lay thread evenly across a spool.",
  alt: "A horizontal roller between two upright plates. The left half has a fine screw thread and the right half has another, with a smooth stretch between. Below the roller a rocking spindle carries two arms with half-nuts, one on top of the left thread and one under the right thread. A lever sticks up at the right end.",
  parts: [
    { key: "roller", color: "#5E7387", name: "Roller", note: "A rod with a fine screw thread on each half. The left half is wound one way and the right half the other way. The red stripe shows when it turns." },
    { key: "nuts", color: "#C8873A", name: "Half-nuts", note: "Two blocks that grip a thread. One sits on top of the left thread. The other sits under the right thread. Only one grips at a time." },
    { key: "spindle", color: "#D9B13B", name: "Rocking spindle", note: "A rod beside the roller with two arms and a lever. Rocking the lever lifts one half-nut off and drops the other on. The whole spindle slides along as the grip pulls it." },
    { key: "guide", color: "#8E7AA8", name: "Thread guide", note: "A ring on a post that rides with the spindle. A thread would pass through it. Watch it slide to one end, wait, and come back." }
  ],
  controls: [{ type: "range", id: "stroke", label: "Length of the sweep", min: 20, max: 80, step: 5, value: 80, unit: " mm",
    presets: [[20, "Short"], [50, "Medium"], [80, "Full"]] }],
  readouts: [{ id: "turns", label: "Roller" }, { id: "pos", label: "Guide" }],
  views: { "3d": [330, 230, 560], front: [0, 0, 640], top: [0, 560, 90] },
  target: [0, -10, 20],
  distance: 1,
  how: [
    "The roller turns the same way all the time. Each thread works like a bolt that is held still: if a nut grips it, the nut is pushed along the roller. A thread wound one way pushes the nut left. A thread wound the other way pushes it right.",
    "The spindle holds a half-nut for each thread. Rocking the lever drops one half-nut onto its thread and lifts the other off. When the guide reaches the end of its sweep, the lever rocks over. Watch the two half-nuts swap, with a short pause when neither one grips.",
    "A fine thread moves the guide only a little for each turn, so the thread is laid down evenly. Try a short sweep, then the full sweep, and watch how many turns of the roller each one takes."
  ],

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var PITCH = 8, R = 20;
    var o = this.o = { a: 0, X: 0, dir: -1, th: 0.3927, tmr: 0, H: 0.3927, LEAD: PITCH, MAXS: 80 };
    o.th = o.H;                                        // the top half-nut grips first, so the guide goes left
    var SY = -55, SZ = 62;                              // spindle axis: y -55, z 62, in front of the plates (plates reach z 45, spindle rod z 57..67)

    // roller: smooth core r 16.8 in the middle, a right-hand thread on the left, a left-hand thread on the right
    o.roller = new T.Group(); scene.add(o.roller);
    var wl = P.worm({ radius: R, pitch: PITCH, length: 124.5, material: c.mat("roller") });   // x -150..-25
    P.at(wl, -87.25, 0, 0, o.roller);
    var wr = P.worm({ radius: R, pitch: PITCH, length: 119.5, material: c.mat("roller") });   // mirrored, so it is left-handed; x 30..150
    wr.scale.x = -1; P.at(wr, 89.75, 0, 0, o.roller);
    var tip = wl.tip, root = wl.root;                  // 22.5 and 16.8
    P.at(P.cylX(root, 55, c.mat("roller")), 2.5, 0, 0, o.roller);   // smooth middle x -25..30, ends meet the thread cores
    P.at(P.box(40, 1.3, 4, c.mat("roller", "mark")), 2.5, root + .15, 0, o.roller);   // red stripe x -17.5..22.5, y root-0.5..root+0.8
    // drive: shaft and disc beyond the left plate
    var drive = new T.Group(); scene.add(drive); o.drive = drive;
    P.at(P.cylX(8, 40, c.mat("roller")), -210, 0, 0, drive);        // x -230..-190, starts on the plate face
    P.at(P.cylX(28, 12, c.mat("roller")), -216, 0, 0, drive);       // disc x -222..-210
    P.at(P.box(1.3, 20, 4, c.mat("roller", "mark")), -222.15, 18, 0, drive);   // red stripe x -222.8..-221.5, sunk 0.5 in the disc face

    // carriage: everything that slides along x with the guide
    var car = o.car = new T.Group(); scene.add(car);
    var sp = c.mat("spindle");
    P.at(P.cylX(5, 470, sp), 5, SY, SZ, car);           // spindle rod x -230..240, y -60..-50, z 57..67
    // top arm, built as it looks when gripping the top of the left thread; pivot is the spindle axis
    var topArm = o.topArm = new T.Group(); topArm.position.set(-90, SY, SZ); car.add(topArm);
    P.at(P.cylX(8, 12, sp), 0, 0, 0, topArm);
    P.at(P.box(8, 8, 32, sp), 0, 0, -16, topArm);       // dz -32..0, dy -4..4
    P.at(P.box(10, 94, 8, sp), 0, 43, -28, topArm);     // dz -32..-24, dy -4..90
    P.at(P.box(12, 8, 38, sp), 0, 88, -43, topArm);     // dz -62..-24, dy 84..92: world y 29..37
    P.at(P.box(28, 8, 20, c.mat("nuts")), 0, 80, -62, topArm);   // half-nut dy 76..84, world y 21..29, z -10..10; thread tip is y 22.5
    // bottom arm, built as it looks when gripping the underside of the right thread
    var botArm = o.botArm = new T.Group(); botArm.position.set(90, SY, SZ); car.add(botArm);
    P.at(P.cylX(8, 12, sp), 0, 0, 0, botArm);
    P.at(P.box(8, 30, 8, sp), 0, 15, 0, botArm);        // dy 0..30... up to the bar
    P.at(P.box(12, 8, 66, sp), 0, 22, -29, botArm);     // dz -62..4, dy 18..26: world y -37..-29, below the roller (bottom tip y -22.5)
    P.at(P.box(28, 8, 20, c.mat("nuts")), 0, 30, -62, botArm);   // half-nut dy 26..34, world y -29..-21, z -10..10
    // lever at the right end
    var lev = o.lever = new T.Group(); lev.position.set(220, SY, SZ); car.add(lev);
    P.at(P.cylX(8, 12, sp), 0, 0, 0, lev);
    P.at(P.box(10, 70, 8, sp), 0, 38, 0, lev);          // handle dy 3..73
    P.at(P.sphere(7, sp), 0, 76, 0, lev);
    var gd = c.mat("guide");
    P.at(P.box(14, 8, 14, gd), 0, SY + 8, SZ, car);     // collar on the rod, y -51..-43... base of the post
    P.at(P.box(6, 130, 6, gd), 0, SY + 69, SZ, car);    // post y -50..80, z 59..65
    var eye = P.hoop(8, 1.8, gd); eye.position.set(0, 90, SZ); car.add(eye);   // ring y 80.2..99.8, bottom meets post top

    // fixed frame
    P.at(P.box(40, 180, 90, c.fixed), -170, -10, 0, scene);   // left plate x -190..-150, y -100..80, z -45..45
    P.at(P.box(40, 180, 90, c.fixed), 170, -10, 0, scene);    // right plate x 150..190
    P.at(P.box(520, 12, 190, c.fixed), 0, -106, 15, scene);   // base x -260..260, y -112..-100, z -80..110; plates stand on y -100
    [-1, 1].forEach(function (k) {
      var ring = P.hoop(9, 3, c.fixed); ring.rotation.y = Math.PI / 2; ring.position.set(k * 170, SY, SZ); scene.add(ring);   // ring x ±173..±167, inner r 6, rod r 5
      P.at(P.box(8, 34, 8, c.fixed), k * 170, -83, SZ, scene);   // post y -100..-66, ring bottom is y -67
    });
  },

  step: function (c, dt, S) {
    var o = this.o, H = o.H, half = (+S.controls.stroke || 80) / 2;
    var w = S.w, dphi = w * dt, th = o.th, grip = 0;
    o.a += dphi;
    // which half-nut grips: the top one only when the lever is fully over to one side, the bottom one at the other
    if (th >= H - 0.012) grip = -1;                    // top half-nut on the left thread: right-hand thread, guide goes left
    else if (th <= -H + 0.012) grip = 1;               // bottom half-nut on the right thread: left-hand thread, guide goes right
    if (grip) {
      o.X += grip * o.LEAD * dphi / (2 * Math.PI);
      if (grip < 0 && o.X <= -half) { o.X = Math.max(o.X, -half); o.dir = 1; }
      if (grip > 0 && o.X >= half) { o.X = Math.min(o.X, half); o.dir = -1; }
    }
    // the lever rocks toward the side the guide should go next, when playing
    var target = o.dir < 0 ? H : -H;
    if (w > 0 && th !== target) {
      var d = 2 * H / 0.7 * dt, dd = target - th;
      // only rock over once the guide is at the end of its sweep
      var atEnd = (o.dir > 0 && o.X <= -half + 1e-6) || (o.dir < 0 && o.X >= half - 1e-6);
      if (atEnd || !grip) th += Math.max(-d, Math.min(d, dd));
    }
    o.th = th;
    o.roller.rotation.x = o.a;
    o.drive.rotation.x = o.a;
    o.car.position.x = o.X;
    o.topArm.rotation.x = H - th;                      // swings up and out as the lever rocks over
    o.botArm.rotation.x = -(th + H);
    o.lever.rotation.x = -th;
    S.set("turns", (Math.round(o.a / (2 * Math.PI) * 10) / 10) + " turns");
    S.set("pos", Math.round(o.X + 40) + " mm");
  }
});
