M507.define({
  number: 399,
  title: "Chain link with screws",
  lede: "A chain link is made in two halves that screw together. Turning the two swivel nuts pulls the halves closer, so the link gets shorter and the chain tightens. It is a quick way to repair a chain or take up slack in a brace.",
  alt: "A long oval chain link made of two bent halves. Where the halves meet, each side has a small cage-like nut round one half and a threaded end from the other half going into it.",
  parts: [
    { key: "upper", color: "#5E7387", name: "Upper half", note: "A bent bar with a screw on one end and a nut on the other. It moves down as the nuts are turned." },
    { key: "lower", color: "#C8873A", name: "Lower half", note: "The same bar turned upside down. It moves up as the nuts are turned." },
    { key: "nut", color: "#4FA58A", name: "Swivel nuts", note: "Each nut turns freely on the end of its own half. Watch the red bar go round." },
    { key: "screw", color: "#D9B13B", name: "Screws", note: "The threaded end of each half. It goes into the nut of the other half and does not turn." }
  ],
  controls: [],
  speed: { min: 1, max: 20, value: 6, label: "Nut speed", unit: " rpm" },
  readouts: [{ id: "len", label: "Link length" }, { id: "t", label: "Nut turns" }],
  views: { "3d": [102, 56, 219], front: [0, 0, 300], side: [300, 0, 0] },
  target: [0, 0, 0],
  distance: [150, 1200],
  how: [
    "The link is cut in two. Each half has a screw on one end and a nut on the other. The screw of one half goes into the nut of the other, on both sides of the link.",
    "The nuts turn on their own half, but the screws cannot turn. When a nut turns, it pulls the screw deeper in. Both sides pull together, so the halves slide towards each other and the whole link gets shorter. One turn of the nut shortens the link by the distance between two threads.",
    "Watch the screws slide into the cages as the nuts turn. The model turns the nuts in and then back out. Change the speed and see how the length follows the turns."
  ],
  note: "This model is rebuilt from Brown's drawing. The size of the link, the thread and the number of turns are made up. Brown draws the nuts as open rings so the screws show; here each nut is a cage of four rods. The nuts are turned in and out in a loop so you can watch both. The link is drawn flat, not twisted.",

  build: function (c) {
    var T = c.THREE, P = c.P, sc = c.scene, o = this.o = { th: 0, a: 0 };
    function half(key) {
      var g = new T.Group(), m = c.mat(key), i;
      P.at(P.arc(22, 4, Math.PI, m), 0, 34, 0, g);                       // top bend, centre y 34
      P.at(P.cylY(4, 8.5, m), -22, 30, 0, g);                            // left leg y 26..34.5
      var wm = P.worm({ radius: 4, pitch: 4, length: 25, addendum: .8, dedendum: .8, material: c.mat("screw") });
      wm.rotation.z = Math.PI / 2; P.at(wm, -22, 14.5, 0, g);            // screw y 2..27, the end of the left leg
      P.at(P.cylY(4, 21, m), 22, 23.5, 0, g);                            // right leg y 13..34
      var nut = new T.Group(); nut.position.set(22, 0, 0); g.add(nut);    // swivel nut: collar y 10..16, cage y -10..10
      P.at(P.cylY(8, 6, c.mat("nut")), 0, 13, 0, nut);
      P.at(P.hoop(6.8, 1.4, c.mat("nut")), 0, -9.3, 0, nut).rotation.x = Math.PI / 2;
      for (i = 0; i < 4; i++) { var a = i * Math.PI / 2; P.at(P.cylY(1.4, 19, i ? c.mat("nut") : c.mat("nut", "mark")), 6.8 * Math.cos(a), 0, 6.8 * Math.sin(a), nut); }
      g.nut = nut; return g;
    }
    o.top = half("upper"); sc.add(o.top);
    o.bot = half("lower"); o.bot.rotation.z = Math.PI; sc.add(o.bot);
  },

  step: function (c, dt, S) {
    var o = this.o, TURNS = 2.5, LEAD = 4;
    o.th += S.w * dt;
    var turns = TURNS * (.5 - .5 * Math.cos(o.th)), a = LEAD * turns;
    o.top.position.y = -a / 2; o.bot.position.y = a / 2;
    o.top.nut.rotation.y = o.bot.nut.rotation.y = turns * 2 * Math.PI;
    S.set("len", Math.round(120 - a) + " mm");
    S.set("t", turns.toFixed(1) + " turns");
  }
});
