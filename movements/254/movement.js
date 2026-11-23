M507.define({
  number: 254,
  title: "Sprocket wheel",
  lede: "A wheel with forked prongs round its rim drives a chain. Each prong catches the chain, so it cannot slip. Chains like this are used where a belt would slide, as on a bicycle.",
  alt: "A wheel on a shaft with Y-shaped prongs standing round its rim. A chain of small links and cross bars runs over it and down to a smaller wheel with the same prongs.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Sprocket wheel", note: "The big wheel on the shaft. Each Y-shaped prong holds one cross bar of the chain. The dark stripe shows it turning." },
    { key: "driven", color: "#C8873A", name: "Small sprocket", note: "A smaller wheel with the same prongs. It has fewer prongs, so it turns faster." },
    { key: "belt", color: "#D9B13B", name: "Chain", note: "Flat links joined by cross bars. Watch the red link go round." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "w2", label: "Small wheel" }, { id: "v", label: "Chain speed" }],
  views: { "3d": [260, 130, 200], front: [0, -10, 290], side: [520, -10, -60] },
  target: [0, -10, -60],
  how: [
    "Every prong on the rim is shaped like a Y. A cross bar of the chain sits in the open top of the Y. The wheel pushes the bar along, and the bar pulls the rest of the chain after it.",
    "The prongs are spaced exactly as far apart as the cross bars. So the chain cannot slip, however hard it is pulled. The chain moves at the speed of the prongs, and the readout shows how fast that is.",
    "The small wheel has fewer prongs, so it turns faster than the big one. Slow the speed down and watch one cross bar drop into a Y as it comes on, and lift out as it leaves."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel and its shaft. The small wheel, the chain, the posts and the base were made up, and so were the sizes and the shape of the chain links.",

  build: function (c) { this.o = c.P.wheelRun(c, { kind: "chain" }); },
  step: function (c, dt, S) { this.o.step(dt, S); }
});
