M507.define({
  number: 379,
  title: "Cramp drill",
  lede: "A C-shaped frame holds a hand drill above a plate. A crank spins the drill, and a screw below pushes the plate up into it. It drills a hole where there is no room for a drilling machine.",
  alt: "A C-shaped metal frame. At the top, a crank turns a drill that points down. Below it a plate rests on the end of a screw that goes down through the lower arm to a wing handle. The drill is cutting a hole in the plate.",
  parts: [
    { key: "frame", color: "#5E7387", name: "C-shaped frame", note: "Holds the drill above and the screw below. The work sits in the gap between them." },
    { key: "drill", color: "#C8873A", name: "Crank and drill", note: "The crank spins the drill bit. Watch the red band on the drill to see it turn." },
    { key: "screw", color: "#4FA58A", name: "Feed screw", note: "Turns in the lower arm and moves up a little with each turn. It lifts the plate onto the drill." },
    { key: "plate", color: "#8E7AA8", name: "Plate", note: "The work. A dark spot on top shows the hole being cut." }
  ],
  controls: [{ id: "feed", label: "How hard the drill bites", value: "1", options: [["0.5", "Light"], ["1", "Medium"], ["2", "Heavy"]] }],
  speed: { min: 5, max: 60, value: 30, label: "Crank speed", unit: "rpm" },
  readouts: [{ id: "d", label: "Crank" }, { id: "s", label: "Feed screw" }, { id: "h", label: "Hole depth" }],
  views: { "3d": [50, 110, 660], front: [-35, 5, 660], side: [660, 5, 0] },
  target: [-35, 5, 0],
  how: [
    "Turn the crank and the drill spins. The screw at the bottom turns slowly and lifts the plate. When the plate touches the spinning bit, the bit starts to cut a hole.",
    "The screw does the pushing. One turn of the screw moves the plate a small, fixed distance, so the bit cuts in by the same small amount every time. This is why the drill can press very hard without slipping. When the hole is through, the screw winds back and a fresh plate is clamped on.",
    "Try Light, Medium and Heavy. A heavy bite means the screw turns faster for each turn of the crank, so the hole gets deeper sooner."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, plate, thread and drill bit are drawn simply, and all the sizes were made up. In real use a person turns both the crank and the screw by hand. Here the screw turns by itself at the right speed to match the crank. The plate stays still on the screw's end and is replaced when the hole is through.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { a: 0, adv: 0, hole: 0, mode: 0, GAP: 3, TH: 8, LEAD: 6, rate: 0 };
    var mf = c.mat("frame");
    // frame, thickness z -20..20
    P.at(P.box(36, 186, 40, mf), -108, -3, 0, scene);          // spine x -126..-90, y -96..90
    P.at(P.box(66, 36, 40, mf), -57, 72, 0, scene);            // top arm x -90..-24, y 54..90
    P.at(P.box(48, 60, 44, mf), 0, 66, 0, scene);              // drill housing x -24..24, y 36..96, z -22..22
    P.at(P.box(126, 33, 40, mf), -27, -79.5, 0, scene);        // lower arm x -90..36, y -96..-63
    // drill, crank and bit, turning about the Y axis
    var D = o.drill = new T.Group(); scene.add(D);
    var md = c.mat("drill");
    P.at(P.cylY(6, 116, md), 0, 62, 0, D);                      // spindle y 4..120, runs up through the housing into the crank
    P.at(P.cylY(9, 26, md), 0, 25, 0, D);                       // chuck y 12..38
    P.at(P.cylY(9.6, 4, c.mat("drill", "mark")), 0, 22, 0, D);  // red band, 0.6 off the chuck
    var bit = new T.Mesh(new T.CylinderGeometry(4.5, 4.5, 22, 16), md); bit.position.set(0, 3, 0); D.add(bit);   // y -8..14
    var tip = new T.Mesh(new T.CylinderGeometry(.5, 4.5, 6, 16), md); tip.position.set(0, -11, 0); D.add(tip);   // y -14..-8
    P.at(P.box(1, 20, 1.2, c.mat("drill", "dark")), 4.6, 2, 0, D); P.at(P.box(1, 20, 1.2, c.mat("drill", "dark")), -4.6, 2, 0, D);
    P.at(P.box(168, 13, 22, md), -66, 120.5, 0, D);             // crank arm x -150..18, y 114..127
    P.at(P.cylY(20, 15.5, md), 0, 133.25, 0, D);                // boss y 125.5..141
    P.at(P.cylY(6, 30, md), -140, 140, 0, D);                   // handle y 125..155
    P.at(P.sphere(10, md), -140, 158, 0, D);
    // feed screw: moves up and turns; the thread looks fixed in the lower arm because it rises one lead per turn
    var S1 = o.screw = new T.Group(); scene.add(S1);
    var wr = new T.Group(); wr.rotation.z = Math.PI / 2; wr.position.y = -83; S1.add(wr);   // thread y -132..-34
    o.worm = P.worm({ radius: 9, pitch: o.LEAD, length: 98, material: c.mat("screw") }); wr.add(o.worm);
    var hd = o.handle = new T.Group(); hd.position.y = -148; S1.add(hd);
    P.at(P.sphere(17, c.mat("screw")), 0, 0, 0, hd);
    P.at(P.cylX(6, 128, c.mat("screw")), 0, 0, 0, hd);
    P.at(P.sphere(13, c.mat("screw")), 64, 0, 0, hd); P.at(P.sphere(13, c.mat("screw")), -64, 0, 0, hd);
    // table and plate rise with the screw but do not turn
    var Tb = o.table = new T.Group(); scene.add(Tb);
    P.at(P.cylY(24, 8, c.mat("screw")), 0, -30, 0, Tb);         // y -34..-26
    P.at(P.box(60, 8, 40, c.mat("plate")), 0, -22, 0, Tb);      // plate y -26..-18
    o.holeM = P.at(P.cylY(5.5, 1, c.mat("plate", "dark")), 0, -18, 0, Tb);
    o.holeM.visible = false;
  },

  step: function (c, dt, S) {
    var o = this.o, feed = +S.controls.feed, w = S.w;
    o.a += w * dt;
    if (S.playing) {
      if (o.mode === 0) {
        o.adv += feed * w * dt / (2 * Math.PI); o.rate = w * feed / (2 * Math.PI) * 60 / o.LEAD * 1;
        if (o.adv >= o.GAP + o.TH) { o.adv = o.GAP + o.TH; o.mode = 1; }
      } else {
        o.adv -= 14 * dt; o.rate = -14 * 60 / o.LEAD;
        if (o.adv <= 0) { o.adv = 0; o.mode = 0; o.hole = 0; }
      }
    } else o.rate = 0;
    var dep = Math.max(0, o.adv - o.GAP);
    if (o.mode === 0) o.hole = Math.max(o.hole, dep);
    o.drill.rotation.y = -o.a;
    var phi = 2 * Math.PI * o.adv / o.LEAD;
    o.screw.position.y = o.adv; o.worm.rotation.x = phi; o.handle.rotation.y = phi;
    o.table.position.y = o.adv;
    o.holeM.visible = o.hole > .05;
    if (o.holeM.visible) { o.holeM.scale.y = o.hole + .5; o.holeM.position.y = -18 + .25 - o.hole / 2; }
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("d", f(S.playing ? S.rpm : 0));
    S.set("s", f(o.rate * (o.mode === 0 ? 1 : 1)));
    S.set("h", o.hole.toFixed(1) + " mm");
  }
});
