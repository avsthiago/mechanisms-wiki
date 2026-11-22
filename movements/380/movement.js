M507.define({
  number: 380,
  title: "Cramp drill with a hollow feed screw",
  lede: "A C-shaped frame holds a hand drill over a plate. The drill shaft runs right through the middle of a hollow screw. Turning the screw pushes the drill down into the work.",
  alt: "A C-shaped metal frame. A crank at the top turns a drill shaft that passes down through a screw in the upper arm. A wing handle sits on the screw. The drill points down at a plate resting on the lower arm.",
  parts: [
    { key: "frame", color: "#5E7387", name: "C-shaped frame", note: "Holds the screw above and the work below. The plate rests on the lower arm." },
    { key: "drill", color: "#C8873A", name: "Crank and drill", note: "The crank spins the drill shaft, which goes down through the middle of the screw. Watch the red band on the collar to see it turn." },
    { key: "screw", color: "#4FA58A", name: "Feed screw", note: "A hollow screw in the upper arm. With each turn it moves down a little and pushes the drill down with it." },
    { key: "plate", color: "#8E7AA8", name: "Plate", note: "The work. A dark spot on top shows the hole being cut." }
  ],
  controls: [{ id: "feed", label: "How hard the drill bites", value: "1", options: [["0.5", "Light"], ["1", "Medium"], ["2", "Heavy"]] }],
  speed: { min: 5, max: 60, value: 30, label: "Crank speed", unit: "rpm" },
  readouts: [{ id: "d", label: "Crank" }, { id: "s", label: "Feed screw" }, { id: "h", label: "Hole depth" }],
  views: { "3d": [35, 120, 620], front: [-30, 35, 620], side: [620, 35, 0] },
  target: [-30, 35, 0],
  how: [
    "Turn the crank and the drill shaft spins. At the same time the wing handle turns slowly. The handle turns the screw, and the screw moves down through the upper arm. The drill sinks with it until the bit cuts into the plate.",
    "The shaft goes through the middle of the screw, so the drill and the screw share one line. The pushing force goes straight down the shaft and does not bend the frame. The screw turns in the frame, and the shaft spins inside the screw, so the two turn at different speeds. When the hole is through, the screw winds back and a fresh plate is put in.",
    "Try Light, Medium and Heavy. A heavy bite makes the screw turn faster for each turn of the crank, so the hole gets deeper sooner."
  ],
  note: "This model is rebuilt from Brown's drawing. The thread, the collar and the drill bit are drawn simply, and all the sizes were made up. In real use a person turns both the crank and the handle. Here the handle turns by itself at the right speed to match the crank. The plate lies still on the lower arm and is replaced when the hole is through.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { a: 0, adv: 0, hole: 0, mode: 0, GAP: 3, TH: 8, LEAD: 6, rate: 0 };
    var mf = c.mat("frame");
    // frame, thickness z -20..20
    P.at(P.box(39, 198, 40, mf), -118.5, -18, 0, scene);       // spine x -138..-99, y -117..81
    P.at(P.box(75, 45, 40, mf), -61.5, 58.5, 0, scene);        // upper arm x -99..-24, y 36..81
    P.at(P.box(48, 51, 44, mf), 0, 58.5, 0, scene);            // boss for the screw x -24..24, y 33..84, z -22..22
    P.at(P.box(162, 27, 40, mf), -57, -103.5, 0, scene);       // lower arm x -138..24, y -117..-90
    // plate on the lower arm
    var Tb = o.table = new T.Group(); scene.add(Tb);
    P.at(P.box(60, 8, 40, c.mat("plate")), -10, -86, 0, scene); // x -40..20, y -90..-82
    o.holeM = P.at(P.cylY(5.5, 1, c.mat("plate", "dark")), 0, -82, 0, scene); o.holeM.visible = false;
    // screw and drill both move down together: the collar sits on the screw's lower end
    var Sg = o.screw = new T.Group(); scene.add(Sg);
    var wr = new T.Group(); wr.rotation.z = Math.PI / 2; wr.position.y = 52.5; Sg.add(wr);   // thread y 0..105
    o.worm = P.worm({ radius: 9, pitch: o.LEAD, length: 105, material: c.mat("screw") }); wr.add(o.worm);
    var hd = o.handle = new T.Group(); hd.position.y = 108; Sg.add(hd);
    P.at(P.cylY(16, 14, c.mat("screw")), 0, 0, 0, hd);          // hub y 101..115
    P.at(P.cylX(5.5, 175, c.mat("screw")), 0, 0, 0, hd);
    P.at(P.sphere(8, c.mat("screw")), 87, 0, 0, hd); P.at(P.sphere(8, c.mat("screw")), -87, 0, 0, hd);
    var D = o.drill = new T.Group(); scene.add(D);
    var md = c.mat("drill");
    P.at(P.cylY(5, 154, md), 0, 67, 0, D);                      // shaft y -10..144, inside the screw and the collar
    P.at(P.cylY(16, 24, md), 0, -12, 0, D);                     // collar y -24..0, top touches the screw end
    P.at(P.cylY(16.6, 4, c.mat("drill", "mark")), 0, -6, 0, D); // red band 0.6 off the collar
    var bit = new T.Mesh(new T.CylinderGeometry(4.5, 4.5, 53, 16), md); bit.position.set(0, -46.5, 0); D.add(bit);   // y -73..-20
    var tip = new T.Mesh(new T.CylinderGeometry(.5, 4.5, 6, 16), md); tip.position.set(0, -76, 0); D.add(tip);      // y -79..-73
    P.at(P.box(1, 40, 1.2, c.mat("drill", "dark")), 4.6, -46, 0, D); P.at(P.box(1, 40, 1.2, c.mat("drill", "dark")), -4.6, -46, 0, D);
    P.at(P.box(174, 13, 22, md), -63, 144.5, 0, D);             // crank arm x -150..24, y 138..151
    P.at(P.cylY(20, 14.5, md), 0, 156.75, 0, D);                // boss y 149.5..164
    P.at(P.cylY(6, 30, md), -140, 164, 0, D);                   // handle y 149..179
    P.at(P.sphere(10, md), -140, 182, 0, D);
  },

  step: function (c, dt, S) {
    var o = this.o, feed = +S.controls.feed, w = S.w;
    o.a += w * dt;
    if (S.playing) {
      if (o.mode === 0) {
        o.adv += feed * w * dt / (2 * Math.PI); o.rate = w * feed / (2 * Math.PI) * 60 / o.LEAD;
        if (o.adv >= o.GAP + o.TH) { o.adv = o.GAP + o.TH; o.mode = 1; }
      } else {
        o.adv -= 14 * dt; o.rate = -14 * 60 / o.LEAD;
        if (o.adv <= 0) { o.adv = 0; o.mode = 0; o.hole = 0; }
      }
    } else o.rate = 0;
    var dep = Math.max(0, o.adv - o.GAP);
    if (o.mode === 0) o.hole = Math.max(o.hole, dep);
    var phi = 2 * Math.PI * o.adv / o.LEAD;
    o.drill.rotation.y = -o.a; o.drill.position.y = -o.adv;
    o.screw.position.y = -o.adv; o.worm.rotation.x = -phi; o.handle.rotation.y = -phi;
    o.holeM.visible = o.hole > .05;
    if (o.holeM.visible) { o.holeM.scale.y = o.hole + .5; o.holeM.position.y = -82 + .25 - o.hole / 2; }
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("d", f(S.playing ? S.rpm : 0));
    S.set("s", f(o.rate));
    S.set("h", o.hole.toFixed(1) + " mm");
  }
});
