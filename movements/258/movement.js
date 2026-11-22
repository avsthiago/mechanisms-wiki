M507.define({
  number: 258,
  title: "V-grooved pulley",
  lede: "A round belt runs in a V-shaped groove in the rim. The belt wedges in between the two sloping sides, so it grips much harder than in a rounded groove. It is smooth, so it is quiet.",
  alt: "A wheel on a shaft seen from the side, with a V-shaped groove cut into its rim. A round belt wedges in the groove and runs back to a smaller wheel behind it.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "V-grooved pulley", note: "The big wheel. Two smooth, sloping sides make a V that the belt wedges into." },
    { key: "driven", color: "#C8873A", name: "Small pulley", note: "A smaller wheel with the same V groove. It turns faster than the big one." },
    { key: "belt", color: "#D9B13B", name: "Round belt", note: "A cord that fits in the V. Watch the red beads go round." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "w2", label: "Small wheel" }, { id: "v", label: "Belt speed" }],
  views: { "3d": [260, 130, 200], front: [0, -10, 290], side: [520, -10, -60] },
  target: [0, -10, -60],
  how: [
    "The sides of the groove slope towards each other. The belt cannot reach the bottom of the V. It is wedged between the two sides.",
    "Pulling on the belt presses it harder into the V. The sloping sides push back on it from both sides, so it grips well and does not slip. The belt moves at the speed of the wheel at the point where it sits.",
    "The small wheel has a smaller groove, so it turns faster. Watch the red beads and the wheel readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel and its shaft. The belt, the small wheel, the posts and the base were made up, and so were the sizes.",

  build: function (c) { this.o = c.P.wheelRun(c, { kind: "vee" }); },
  step: function (c, dt, S) { this.o.step(dt, S); }
});
