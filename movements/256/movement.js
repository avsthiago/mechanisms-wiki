M507.define({
  number: 256,
  title: "Plain pulley",
  lede: "A flat belt runs on the wide, smooth rim of this pulley. The rim bulges a little in the middle, which keeps the belt from wandering off. It is the simplest pulley for a flat belt.",
  alt: "A wheel on a shaft seen from the side, with a wide plain rim that bulges slightly in the middle. A flat belt runs over it and back to a smaller wheel behind it.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Plain pulley", note: "The big wheel. Its rim is a little higher in the middle than at the edges. This is called a crown." },
    { key: "driven", color: "#C8873A", name: "Small pulley", note: "A smaller wheel of the same shape. It turns faster than the big one." },
    { key: "belt", color: "#D9B13B", name: "Flat belt", note: "A loop of leather. It is narrower than the rim. Watch the red marks go round." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "w2", label: "Small wheel" }, { id: "v", label: "Belt speed" }],
  views: { "3d": [260, 130, 200], front: [0, -10, 290], side: [520, -10, -60] },
  target: [0, -10, -60],
  how: [
    "This pulley has no edges to hold the belt. Look at the top of the wheel in the side view. The rim curves up a little in the middle.",
    "A moving belt slides towards the highest part of a wheel. So the bulge pushes the belt back to the middle if it drifts. The belt moves at the speed of the rim.",
    "The small wheel has a smaller rim, so it must turn faster to keep up. Compare the two wheel readouts with the belt speed."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel and its shaft. The belt, the small wheel, the posts and the base were made up. The bulge is drawn larger than on a real pulley so that you can see it.",

  build: function (c) { this.o = c.P.wheelRun(c, { kind: "plain" }); },
  step: function (c, dt, S) { this.o.step(dt, S); }
});
