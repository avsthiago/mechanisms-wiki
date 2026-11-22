M507.define({
  number: 230,
  title: "Two cranks at right angles",
  lede: "Two shafts turn together because long links join their cranks. There are two pairs of links, set a quarter turn apart. When one pair has no pull, the other pair has its full pull, so the shafts never stick.",
  alt: "Two parallel shafts, one above the other. Each has a crank at the far end and a disc at the near end. A long link joins the two cranks and a second link joins the two discs.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving shaft", note: "The upper shaft. It carries a crank at the far end and a disc at the near end." },
    { key: "driven", color: "#C8873A", name: "Driven shaft", note: "The lower shaft. It is turned by the links and always keeps in step with the upper one." },
    { key: "link", color: "#D9B13B", name: "Links", note: "One bar joins the two far cranks and one joins the two discs. Each bar stays upright and slides round in a circle." },
    { key: "pin", color: "#C2503F", name: "Crank pins", note: "They join the links to the cranks and discs. Watch them go round a quarter turn apart." }
  ],
  controls: [{ type: "range", id: "ang", label: "Angle between the two pairs", min: 0, max: 90, step: 1, value: 90, unit: "°",
    presets: [[90, "Right angles"], [45, "Half way"], [0, "Same angle"]] }],
  readouts: [{ id: "far", label: "Far link pulls" }, { id: "near", label: "Near link pulls" }],
  views: { "3d": [-520, 190, 330], front: [0, 0, 640], side: [-640, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Watch the two long links. The cranks are the same length and the links are as long as the gap between the shafts. So each link keeps upright as it goes round, and the lower shaft turns exactly with the upper one.",
    "A link cannot turn a crank when the crank points straight along it. That is a dead point. The far crank and the near disc are set a quarter turn apart. When one link is at a dead point, the other is pulling with its full strength. The readouts show how hard each link is able to pull.",
    "Try the angle slider. At right angles the two readouts take turns, and one is always strong. Set the angle to the same and both fall to nothing together. That is why Brown needs no heavy wheel to carry the shafts past the dead point."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the shafts in the air, so no bearings are drawn. The two long links are shown as flat bars in front of the cranks and the discs. All sizes are made up. The pull readouts show how much of each crank is sideways to its link, as a share of its best. Brown shows right angles only, and the slider is added.",

  R: 45, H: 90,
  grip: function (th) { return Math.abs(Math.cos(th)); },      // a link pulls with a lever of R cos(th); at its dead points (crank along the link) this is zero

  build: function (c) {
    var T = c.THREE, P = c.P, R = this.R, H = this.H, o = this.o = { th: 135 * Math.PI / 180, alpha: Math.PI / 2, sh: [], disc: [] };
    [1, -1].forEach(function (k) {
      var key = k > 0 ? "drive" : "driven", g = new T.Group(); c.scene.add(g);
      P.at(P.armPlate({ length: R, r0: 16, r1: 10, thick: 8, material: c.mat(key) }), 0, 0, -76, g);      // far crank, z -80..-72
      P.at(P.cylZ(7, 136, c.mat(key)), 0, 0, -4, g);                                                      // shaft z -72..64
      P.at(P.box(3, 1, 80, c.mat(key, "dark")), 0, 8, -20, g);                                            // stripe z -60..20
      P.at(P.cylZ(3.5, 22, c.mat("pin", "mark")), R, 0, -87, g);                                         // far pin z -98..-76
      P.at(P.cylZ(6, 2, c.mat("pin", "mark")), R, 0, -97, g);                                            // head z -98..-96
      var d = new T.Group(); P.at(d, 0, 0, 0, g);
      P.at(P.cylZ(70, 8, c.mat(key)), 0, 0, 68, d);                                                       // disc z 64..72
      P.at(P.box(50, 3, 1, c.mat(key, "dark")), -38, 0, 73, d);                                          // mark on the disc face, z 72.5..73.5
      P.at(P.cylZ(3.5, 21, c.mat("pin", "mark")), R, 0, 78.5, d);                                        // near pin z 68..89
      P.at(P.cylZ(6, 2, c.mat("pin", "mark")), R, 0, 88, d);                                             // head z 87..89
      g.position.y = k * H; o.sh.push(g); o.disc.push(d);
    });
    function link(z) { var l = P.armPlate({ length: 2 * H, r0: 9, thick: 7, material: c.mat("link") }); l.position.z = z; c.scene.add(l); return l; }
    o.far = link(-92.5); o.near = link(83.5);                                                           // z -96..-89 and 80..87
  },

  step: function (c, dt, S) {
    var o = this.o, R = this.R, H = this.H, target = +S.controls.ang * Math.PI / 180;
    o.alpha += (target - o.alpha) * Math.min(1, dt * 6);
    o.th += S.w * dt;
    var th1 = o.th, th2 = o.th - o.alpha;
    o.sh[0].rotation.z = o.sh[1].rotation.z = th1;
    o.disc[0].rotation.z = o.disc[1].rotation.z = -o.alpha;
    // each link joins a pin on the upper shaft to the same pin on the lower one, so it stays upright: its lower end is at the lower pin
    function place(l, th) { l.position.set(R * Math.cos(th), -H + R * Math.sin(th), l.position.z); l.rotation.z = Math.PI / 2; }
    place(o.far, th1); place(o.near, th2);
    S.set("far", Math.round(100 * this.grip(th1)) + "%");
    S.set("near", Math.round(100 * this.grip(th2)) + "%");
  }
});
