M507.define({
  number: 99,
  title: "Spiral guide",
  lede: "A flat disc has a spiral groove on its face. A small roller sits in the groove and is held by a sliding rod. As the disc turns, the groove pushes the roller steadily along. It feeds a drill forward at a slow, even pace.",
  alt: "A big upright disc with a raised spiral rib of several turns on its face. Below it, a rod slides up and down between two guides. A small roller on the top of the rod sits between two turns of the spiral.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "The driving wheel. It turns on a shaft that points straight at you." },
    { key: "thread", color: "#4FA58A", name: "Spiral rib", note: "A raised rib that winds out from the middle in several turns. The gap between two turns is the track the roller rides in." },
    { key: "roller", color: "#C2503F", name: "Roller", note: "A small wheel that sits between two turns of the rib. Watch it: it is pushed out along the track as the disc turns." },
    { key: "slide", color: "#C8873A", name: "Sliding rod", note: "Carries the roller and slides straight up and down in its guides. On a drilling machine it would carry the drill." }
  ],
  controls: [{ id: "dir", label: "Turn", value: "both", options: [["fwd", "Forwards"], ["back", "Backwards"], ["both", "Back and forth"]] }],
  readouts: [{ id: "t", label: "Disc turned" }, { id: "s", label: "Slide moved" }],
  views: { "3d": [330, 60, 640], front: [0, -70, 780], side: [760, -60, 40] },
  target: [0, -70, 0],
  how: [
    "Watch the roller. It sits in the gap between two turns of the spiral, so it cannot wander off. The rod it is fixed to can only slide up and down, in a straight line toward the middle of the disc.",
    "As the disc turns, each turn of the rib sweeps past the roller and pushes it along. Every full turn of the disc moves the roller out by exactly one gap between turns. That is why the rod moves at an even, slow pace, however fast the disc turns.",
    "Try Forwards. The rod moves down. At the end of the groove the roller cannot go further, so the disc stops. Now try Backwards, and then Back and forth. Turning the disc the other way pulls the rod back."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows a groove; here it is drawn as a raised rib, with the roller between two turns. The rod, the guides, the stand, the number of turns and all the sizes were made up. Brown gives no drill, so none is shown. In the model the disc stops when the roller reaches either end of the spiral.",

  build: function (c) {
    var P = c.P, T = c.THREE || THREE, scene = c.scene, o = this.o = {};
    var R0 = 24, PITCH = 20, TURNS = 4.5, RW = 5, H = 5, RR = 6;
    o.R0 = R0; o.P = PITCH; o.tmin = .25; o.tmax = TURNS - 1 + .25 - 0;     // roller between turns: rib exists on both sides for t .25 .. 3.75
    o.t0 = 2; o.t = o.t0; o.dirNow = 1;

    // disc turning about Z; front face at z = 0, back at z = -10
    o.disc = new T.Group(); scene.add(o.disc);
    P.at(P.cylZ(124, 10, c.mat("disc")), 0, 0, -5, o.disc);                        // z -10 .. 0
    P.at(P.cylZ(15, 7.5, c.mat("disc")), 0, 0, 3.25, o.disc);                      // hub, z -0.5 .. 7
    P.at(P.cylZ(8, 47.5, c.mat("disc", "dark")), 0, 0, -16.25, o.disc);            // shaft, z -40 (post face) .. 7.5
    var rib = P.spiralRib({ r0: R0, pitch: PITCH, from: 0, to: TURNS * 2 * Math.PI, width: RW, height: H + .5, material: c.mat("thread") });
    P.at(rib, 0, 0, -.5, o.disc);                                                   // rib z -0.5 .. 5, sunk 0.5 into the face
    P.at(P.box(60, 3, 1, c.mat("disc", "dark")), 92, 0, 1, o.disc);                 // turning mark on the face, z 0.5 .. 1.5 (0.5 off the face), x 62 .. 122

    // sliding rod, moves along Y; roller centre is the origin of o.slide
    o.slide = new T.Group(); scene.add(o.slide);
    P.at(P.cylZ(RR, 7, c.mat("roller")), 0, 0, 4.5, o.slide);                       // roller z 1 .. 8, rib top at 5
    P.at(P.box(8, 100, 8, c.mat("slide")), 0, -50, 12, o.slide);                    // rod y 0 .. -100, z 8 .. 16, sits on the roller's top face
    P.at(P.box(24, 30, 16, c.mat("slide")), 0, -115, 12, o.slide);                  // crosshead x -12 .. 12, y -100 .. -130, z 4 .. 20
    P.at(P.box(8, 4, 1, c.mat("slide", "dark")), 0, -115, 20.5, o.slide);           // dark band on the crosshead front, 0.5 off the face z 20

    // stand: post behind the disc, base, and two guide plates either side of the crosshead
    P.at(P.box(180, 10, 105, c.fixed), 0, -255, -22.5, scene);                      // base x -90 .. 90, y -260 .. -250, z -75 .. 30
    P.at(P.box(40, 276, 24, c.fixed), 0, -122, -52, scene);                         // post x -20 .. 20, y -260 .. 16, z -64 .. -40
    [-1, 1].forEach(function (k) {
      P.at(P.box(4, 124, 60, c.fixed), k * 15, -188, -10, scene);                  // plate x 13 .. 17 (crosshead edge 12), y -250 .. -126, z -40 .. 20
    });
  },

  step: function (c, dt, S) {
    var o = this.o, mode = S.controls.dir, dt2 = S.w * dt / (2 * Math.PI), t;
    if (mode === "fwd") o.dirNow = 1; else if (mode === "back") o.dirNow = -1;
    t = o.t + o.dirNow * dt2;
    if (t > o.tmax) { t = o.tmax; if (mode === "both") o.dirNow = -1; }
    if (t < o.tmin) { t = o.tmin; if (mode === "both") o.dirNow = 1; }
    o.t = t;
    o.disc.rotation.z = -2 * Math.PI * t;                           // clockwise: the rib at the bottom moves outward
    var r = o.R0 + o.P * (t + .25);                                 // middle of the gap at the bottom of the disc
    o.slide.position.set(0, -r, 0);
    var turns = t - o.tmin;
    S.set("t", turns.toFixed(1) + " turns");
    S.set("s", Math.round(turns * o.P) + " mm");
  }
});
