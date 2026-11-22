M507.define({
  number: 259,
  title: "Notched V-grooved pulley",
  lede: "A round belt runs in a V-shaped groove whose sloping sides are cut with small ridges. The ridges bite into the belt and help it grip, so it slips even less.",
  alt: "A wheel on a shaft seen from the side, with a V-shaped groove whose sloping sides carry many small ridges running across them. A round belt lies in the groove and runs back to a smaller wheel behind it.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Notched pulley", note: "The big wheel. The notches are small ridges across both sloping sides of the V." },
    { key: "driven", color: "#C8873A", name: "Small pulley", note: "A smaller wheel with the same notched groove. It turns faster than the big one." },
    { key: "belt", color: "#D9B13B", name: "Round belt", note: "A cord that rests on the ridges. Watch the red beads go round." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "w2", label: "Small wheel" }, { id: "v", label: "Belt speed" }],
  views: { "3d": [260, 130, 200], front: [0, -10, 290], side: [520, -10, -60] },
  target: [0, -10, -60],
  how: [
    "The groove is a V, like a smooth V-grooved wheel, but its two sides are covered with ridges. They run straight down the slope, from the edge of the groove to the bottom.",
    "The belt presses into the notches between the ridges. A ridge is hard to slide over, so the belt grips better than on a smooth side. The belt moves at the speed of the wheel where it sits.",
    "The small wheel has a smaller groove, so it turns faster. Watch the red beads and the wheel readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel and its shaft. The belt, the small wheel, the posts and the base were made up, and so were the sizes. The ridges are shown a little larger than a real pulley's.",

  build: function (c) { this.o = c.P.wheelRun(c, { kind: "notched" }); },
  step: function (c, dt, S) { this.o.step(dt, S); }
});
