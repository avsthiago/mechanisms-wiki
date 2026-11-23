M507.define({
  number: 255,
  title: "Flanged pulley",
  lede: "A flat belt runs on the middle of this wheel. A raised edge on each side, called a flange, stops the belt from sliding off. The belt turns the wheel, or the wheel pulls the belt.",
  alt: "A wheel on a shaft seen from the side, with a raised flange on each side of its flat rim. A flat belt runs over it and back to a smaller wheel behind it.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Flanged pulley", note: "The big wheel. Its flat middle carries the belt and the two flanges keep the belt in place." },
    { key: "driven", color: "#C8873A", name: "Small pulley", note: "A smaller wheel that the belt also turns. It turns faster than the big one." },
    { key: "belt", color: "#D9B13B", name: "Flat belt", note: "A loop of leather that grips the wheels. Watch the red marks go round." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "w2", label: "Small wheel" }, { id: "v", label: "Belt speed" }],
  views: { "3d": [260, 130, 200], front: [0, -10, 290], side: [520, -10, -60] },
  target: [0, -10, -60],
  how: [
    "The belt lies flat on the middle of the wheel, between the two flanges. You can see the flange on each side of the belt. If the belt starts to drift sideways, it meets a flange and stops.",
    "The belt is pulled tight round the wheel, so it grips and does not slip. It moves at the same speed as the rim. The small wheel has a smaller rim, so it turns faster to keep up with the belt.",
    "Watch the red marks and the belt readout. The wheel readouts show that the small wheel turns faster than the big one."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel and its shaft. The belt, the small wheel, the posts and the base were made up, and so were the sizes.",

  build: function (c) { this.o = c.P.wheelRun(c, { kind: "flanged" }); },
  step: function (c, dt, S) { this.o.step(dt, S); }
});
