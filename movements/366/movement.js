M507.define({
  number: 366,
  title: "Drilling machine",
  lede: "A crank turns a big bevel gear, which turns a small gear, called a pinion, on an upright drill shaft, so the drill spins fast. The drill shaft can slide through the small gear, and a foot treadle pushes it down into the work while it spins.",
  alt: "A frame holds a big bevel gear on a sideways shaft with a crank, meshing with a small bevel gear on an upright drill shaft. The drill bit hangs below the frame. A long treadle lever at the bottom is joined by a rod and a bent lever to the top of the drill shaft.",
  parts: [
    { key: "big", color: "#5E7387", name: "Crank and driving gear", note: "You turn the crank. The driving gear on the same shaft has twice as many teeth as the small one." },
    { key: "small", color: "#C8873A", name: "Pinion", note: "Turns twice for each turn of the driving gear. It turns the drill shaft, but lets it slide up and down." },
    { key: "drill", color: "#8E7AA8", name: "Drill shaft", note: "Spins with the small gear and slides down through it. A groove along the shaft holds a key in the gear. Watch it go down." },
    { key: "levers", color: "#D9B13B", name: "Treadle and levers", note: "Pressing the end of the treadle lifts the rod, and the bent lever at the top pushes the drill down." }
  ],
  controls: [{ type: "range", id: "p", label: "Treadle pressed", min: 0, max: 100, step: 5, value: 0, unit: "%", presets: [[0, "Up"], [50, "Half"], [100, "Down"]] }],
  speed: { min: 1, max: 30, value: 8, label: "Crank speed", unit: " rpm" },
  readouts: [{ id: "c", label: "Crank" }, { id: "d", label: "Drill" }, { id: "p", label: "Drill down" }],
  views: { "3d": [80, 0, 560], front: [10, -15, 720], side: [740, -15, 10] },
  target: [10, -15, 0],
  distance: [400, 1800],
  how: [
    "Turn the crank. The driving gear turns with it, and its teeth push the teeth of the small gear. The small gear has half as many teeth, so it turns twice as fast. It sits on the upright drill shaft, so the drill spins twice as fast as the crank.",
    "The drill shaft goes through the small gear. A groove along the shaft keeps the gear and the shaft turning together, but the shaft is free to slide. Press the treadle and the levers push the shaft down, while the gears keep turning it.",
    "Try pressing the treadle half way, then all the way down, and watch the drill go down while it spins."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the floor and the stand for the treadle were added so it stands up. The number of teeth, the sizes and how far the drill can go down were made up. The groove and key inside the small gear are hidden, so only a stripe on the shaft shows the groove.",

  build: function (c) {
    var T = c.THREE, P = c.P, i, o = this.o = { th: 0, g: 0 };
    var ST = 36, RR = 31.95, UX = -30, UY = 83, PX = -38, PY = -109, TL = 153, TLL = 35;
    o.ST = ST; o.RR = RR; o.UX = UX; o.UY = UY; o.PX = PX; o.PY = PY; o.TL = TL; o.TLL = TLL; o.TH0 = Math.atan2(40, 148);
    o.lam0 = Math.asin(11 / RR);
    var q0 = [UX - ST * Math.cos(o.lam0), UY - ST * Math.sin(o.lam0)], l0 = [PX - TLL * Math.cos(o.TH0), PY - TLL * Math.sin(o.TH0)];
    o.LL = Math.hypot(q0[0] - l0[0], q0[1] - l0[1]);
    // frame (c.fixed): top arm x -36..46, y 58..66; bottom arm x -36..38, y -58..-50; right wall x 38..46, y -165..58; left stub x -36..-28, y 6..58; all z -14..14
    var top = P.guideBlock({ w: 82, h: 8, d: 28, hole: 5.8, hx: -5, material: c.fixed }); P.at(top, 5, 62, 0, c.scene);
    var bot = P.guideBlock({ w: 74, h: 8, d: 28, hole: 5.8, hx: -1, material: c.fixed }); P.at(bot, 1, -54, 0, c.scene);
    P.at(P.box(8, 153, 28, c.fixed), 42, -88.5, 0, c.scene);                                   // wall y -165 .. -12
    var wh = P.guideBlock({ w: 24, h: 8, d: 28, hole: 5.8, material: c.fixed }); wh.rotation.z = Math.PI / 2; P.at(wh, 42, 0, 0, c.scene);   // y -12 .. 12, hole along X
    P.at(P.box(8, 46, 28, c.fixed), 42, 35, 0, c.scene);                                       // y 12 .. 58
    P.at(P.box(8, 52, 28, c.fixed), -32, 32, 0, c.scene);                                      // left stub y 6 .. 58
    P.at(P.box(240, 7, 80, c.fixed), 10, -168.5, 0, c.scene);                                  // floor y -172 .. -165
    P.at(P.box(12, 56, 24, c.fixed), -38, -137, 4, c.scene);                                   // stand for the treadle: y -165 .. -109, z -8 .. 16
    P.at(P.box(12, 17, 16, c.fixed), -30, 74.5, 0, c.scene);                                   // bracket for the bent lever: x -36..-24, y 66..83, z -8..8
    // gears: apex at the origin where the two shafts cross; 12 teeth and 24 teeth, radii 20 and 40
    var sm = c.mat("small"), bm = c.mat("big");
    o.small = P.bevelGearCone({ radius: 20, teeth: 12, cone: 26.565, addendum: 4, hub: 10, hubLength: 12, material: sm, markMaterial: c.mat("small", "mark") });
    var bg = new T.Group(); bg.rotation.z = -Math.PI / 2; c.scene.add(bg);
    o.big = P.bevelGearCone({ radius: 40, teeth: 24, cone: 63.435, addendum: 4, hub: 10, hubLength: 12, material: bm, markMaterial: c.mat("big", "mark") }); bg.add(o.big);
    o.pb = o.big.pitch;
    // crank, turned about X
    o.crank = new T.Group(); c.scene.add(o.crank);
    P.at(P.cylX(5, 32, bm), 46, 0, 0, o.crank);                                                // x 30 .. 62
    P.at(P.box(4, 52, 8, bm), 54, 20, 0, o.crank);                                             // arm x 52 .. 56
    P.at(P.cylX(3.5, 16, bm), 64, 45, 0, o.crank);                                             // handle x 56 .. 72
    // drill shaft: spins with the small gear, slides down by d
    var dm = c.mat("drill"), dr = o.drill = new T.Group(); c.scene.add(dr);
    dr.add(o.small);
    P.at(P.cylY(5, 164, dm), 0, 16, 0, dr);                                                    // y -66 .. 98
    P.at(P.cylY(7, 4, dm), 0, 90, 0, dr);                                                      // collar y 88 .. 92
    P.at(P.cylY(8, 24, c.mat("drill", "dark")), 0, -78, 0, dr);                                // chuck y -90 .. -66
    P.at(P.cylY(3.5, 40, dm), 0, -110, 0, dr);                                                 // bit y -130 .. -90
    P.at(new T.Mesh(new T.CylinderGeometry(3.5, .3, 12, 14), dm), 0, -136, 0, dr);             // point y -142 .. -130
    P.at(P.box(.8, 18, 3, c.mat("drill", "mark")), 5.1, 77, 0, dr);                            // groove stripes, 0.1 to 1 outside the shaft
    P.at(P.box(.8, 8, 3, c.mat("drill", "mark")), 5.1, -61, 0, dr);
    // thrust ring and bent lever (two plates, one each side of the bracket)
    var lm = c.mat("levers");
    o.ring = P.at(P.cylY(8, 4, lm), 0, 94, 0, c.scene);
    o.upl = [10, -10].map(function (z) { return P.at(P.armPlate({ length: ST + RR, r0: 5, thick: 4, material: lm }), 0, 0, z, c.scene); });   // z 8..12 and -12..-8
    [10.5, -10.5].forEach(function (z) { P.at(P.cylZ(3, 5, lm), UX, UY, z, c.scene); });         // pivot pins, to the bracket faces
    o.pinA = P.at(P.cylZ(2.5, 8, lm), 0, 0, 12, c.scene);                                      // joint with the rod, z 8 .. 16
    o.link = P.at(P.rod(2, lm), 0, 0, 0, c.scene);
    o.tre = P.at(P.armPlate({ length: TLL + TL, r0: 5, thick: 4, material: lm }), 0, 0, 18, c.scene);   // z 16 .. 20
    o.pinB = P.at(P.cylZ(2.5, 8, lm), 0, 0, 16, c.scene);
    P.at(P.cylZ(3.5, 6, lm), PX, PY, 19, c.scene);                                              // treadle pivot z 16 .. 22
  },

  step: function (c, dt, S) {
    var o = this.o, i, TP = 2 * Math.PI;
    o.th += S.w * dt;
    var p = +S.controls.p / 100, d = 16 * p;
    o.crank.rotation.x = o.th; o.big.rotation.y = o.th;
    var al = -2 * o.th + o.pb; o.small.rotation.y = 0; o.drill.rotation.y = al;
    o.drill.position.y = -d;
    // small gear is part of the drill group, but it must stay at the apex: undo the slide for it
    o.small.position.y = d;
    var ry = 94 - d, lam = Math.asin((ry - o.UY) / o.RR), cl = Math.cos(lam), sl = Math.sin(lam);
    o.ring.position.y = ry;
    var qx = o.UX - o.ST * cl, qy = o.UY - o.ST * sl;
    o.upl.forEach(function (m) { m.position.set(qx, qy, m.position.z); m.rotation.z = lam; });
    o.pinA.position.set(qx, qy, 12);
    // treadle: find the angle that keeps the rod the same length
    var lo = 0, hi = 1.2, th, lx, ly;
    for (i = 0; i < 30; i++) {
      var gm = (lo + hi) / 2; th = o.TH0 - gm; lx = o.PX - o.TLL * Math.cos(th); ly = o.PY - o.TLL * Math.sin(th);
      if (Math.hypot(qx - lx, qy - ly) > o.LL) lo = gm; else hi = gm;
    }
    th = o.TH0 - (lo + hi) / 2; lx = o.PX - o.TLL * Math.cos(th); ly = o.PY - o.TLL * Math.sin(th);
    o.tre.position.set(lx, ly, 18); o.tre.rotation.z = th;
    o.pinB.position.set(lx, ly, 16);
    o.link.span(lx, ly, 14, qx, qy, 14);
    S.set("c", Math.round(S.playing ? S.rpm : 0) + " rpm");
    S.set("d", Math.round(S.playing ? S.rpm * 2 : 0) + " rpm");
    S.set("p", Math.round(d) + " mm");
  }
});
