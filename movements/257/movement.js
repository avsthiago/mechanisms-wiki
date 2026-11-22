M507.define({
  number: 257,
  title: "Pulley with a round groove",
  lede: "A round belt runs in a rounded groove cut into the rim of this wheel. The groove holds the belt in place. It is used for thin cords that drive light machines.",
  alt: "A wheel on a shaft seen from the side, with a rounded groove cut into its rim between two edges. A round belt lies in the groove and runs back to a smaller wheel behind it.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Grooved pulley", note: "The big wheel. The groove is curved like half a pipe, so the belt sits in it." },
    { key: "driven", color: "#C8873A", name: "Small pulley", note: "A smaller wheel with the same groove. It turns faster than the big one." },
    { key: "belt", color: "#D9B13B", name: "Round belt", note: "A cord like a thin rope. Watch the red beads go round." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "w2", label: "Small wheel" }, { id: "v", label: "Belt speed" }],
  views: { "3d": [260, 130, 200], front: [0, -10, 290], side: [520, -10, -60] },
  target: [0, -10, -60],
  how: [
    "The groove is curved like a half pipe. The round belt lies at the bottom of it and cannot slip out sideways.",
    "The belt touches the wheel only along the groove. It is pulled tight, so it grips and the wheel turns with it. The belt moves at the speed of the groove.",
    "The small wheel has a smaller groove, so it turns faster. Watch the red beads and compare the speeds in the readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel and its shaft. The belt, the small wheel, the posts and the base were made up, and so were the sizes.",

  build: function (c) { this.o = c.P.wheelRun(c, { kind: "round" }); },
  step: function (c, dt, S) { this.o.step(dt, S); }
});
