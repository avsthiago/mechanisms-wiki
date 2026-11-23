/* Copy this folder to movements/NNN/ and edit. Delete what you don't need.
   This template is a working pair of spur gears so a fresh copy renders something. */
M507.define({
  number: 0,                                   // movement number in the book
  title: "Title in sentence case",
  lede: "Two or three short sentences a 12-year-old can follow: what it does and why that is useful.",   // see "Writing for students" in CLAUDE.md
  alt: "Plain description of the model for screen readers.",
  parts: [                                     // 3 to 6 parts; key is used in build() via c.mat(key); colours from the palette in CLAUDE.md
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "On the first shaft. It does the driving." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "It has twice as many teeth, so it turns half as fast." }
  ],
  controls: [],                                // optional: [{id, label, value, options: [[value, label], ...]}]
  readouts: [{ id: "in", label: "Driver" }, { id: "out", label: "Driven" }],
  views: { "3d": [300, 200, 700], front: [0, 0, 800] },   // first entry is the opening view
  target: [40, 0, 0],
  how: ["What you see happening, in short sentences.", "Why it happens, with real numbers.", "Something to try with the control."],
  note: "This model is rebuilt from Brown's drawing. Say plainly what was made up.",

  build: function (c) {
    var P = c.P, o = this.o = { a: 0 };
    o.g1 = P.spurGear({ teeth: 12, bore: 8, material: c.mat("drive") });
    o.g2 = P.spurGear({ teeth: 24, bore: 8, material: c.mat("driven") });
    P.at(o.g1, 0, 0, 0, c.scene);
    P.at(o.g2, o.g1.pitchRadius + o.g2.pitchRadius, 0, 0, c.scene);
  },

  step: function (c, dt, S) {                  // S.w is the input speed in rad/s (0 when paused)
    var o = this.o; o.a += S.w * dt;
    o.g1.rotation.z = o.a;
    o.g2.rotation.z = -o.a / 2 + o.g2.pitch / 2;   // opposite sense, half speed, offset half a tooth to mesh
    S.set("in", (S.playing ? S.rpm : 0) + " rpm");
    S.set("out", (S.playing ? S.rpm / 2 : 0) + " rpm");
  }
});
