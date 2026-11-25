M507.define({
  number: 249,
  title: "Ball-and-socket joint for tubing",
  lede: "A pipe ends in a hollow ball that sits in a round socket. The ball can swing in every direction while the water or air still flows through. It lets a pipe bend without breaking the joint.",
  alt: "A half-section of a hollow ball held inside a round socket made of two halves bolted together. One pipe leaves the top of the ball and another leaves the bottom of the socket. The upper pipe swings from side to side.",
  parts: [
    { key: "ball", color: "#C8873A", name: "Ball and upper pipe", note: "A hollow ball with a pipe on top. It swings inside the socket. Watch the red band." },
    { key: "socket", color: "#4FA58A", name: "Socket", note: "Two halves that wrap round the ball. The lower pipe is part of it, so it does not move." },
    { key: "bolts", color: "#D9B13B", name: "Bolts", note: "They pull the two halves of the socket together round the ball." }
  ],
  controls: [{ type: "range", id: "amp", label: "How far it swings", min: 0, max: 20, step: 1, value: 15, unit: "°", presets: [[5, "A little"], [12, "Medium"], [20, "Most"]] }],
  closed: { label: "Socket" },
  readouts: [{ id: "a", label: "Tilt" }, { id: "x", label: "Pipe end moves" }],
  views: { "3d": [359, 196, 769], front: [0, 0, 880], side: [880, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The picture is cut in half, so you see inside. The ball sits in a socket of the same round shape. The two touch all round, so nothing can leak out between them. The upper pipe swings from side to side as the ball turns.",
    "The pipe sticks out of the ball through a round hole in the top of the socket. The hole is wide enough for the pipe to tilt, and no wider. That is what stops the ball swinging too far. The bottom of the ball is open, so liquid can pass from the lower pipe straight into the ball.",
    "Move the slider to change how far the pipe swings. At the largest setting the pipe nearly touches the edge of the hole. Try a small swing, then the largest. Choose Closed to see the joint as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the joint cut in half, with the socket in two halves bolted at the sides. The sizes, the wall thickness and the tiny gap between ball and socket were made up. The ball only swings in the plane of the picture, and the red band was added to show the movement.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { th: 0 }, d = Math.PI / 180;
    function arc(R, a0, a1) { var pts = [], n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 5)); for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * d; pts.push([R * Math.sin(a), R * Math.cos(a)]); } return pts; }
    function as(x, R) { return Math.asin(x / R) / d; }
    function ac(y, R) { return Math.acos(y / R) / d; }
    // ball: outer radius 100, wall 8, neck up to y 190, open bottom at y -70
    var ball = [[36, 190]].concat(arc(100, as(36, 100), ac(-70, 100)), arc(92, ac(-70, 92), as(28, 92)), [[28, 190]]);
    // the first outer point is the end of the neck, so the polygon needs the neck join: (36, 93.3) is arc's first point
    o.ball = new T.Group(); c.scene.add(o.ball);
    o.ball.add(c.shell(P.halfSection({ poly: ball, material: c.mat("ball") }), "open"));
    o.ball.add(c.shell(P.wholeSection({ poly: ball, material: c.mat("ball") }), "closed"));     // closed view: the whole ball
    o.ball.add(c.shell(P.halfSection({ poly: [[36.5, 135], [39.5, 135], [39.5, 150], [36.5, 150]], material: c.mat("ball", "mark") }), "open"));   // red band, x 36..39 on the neck wall
    o.ball.add(c.shell(P.wholeSection({ poly: [[36.5, 135], [39.5, 135], [39.5, 150], [36.5, 150]], material: c.mat("ball", "mark") }), "closed"));
    // socket: inner radius 101 (1 clear of the ball), outer 112, open top at y 75, lower pipe down to y -190
    var sock = [[ Math.sqrt(101 * 101 - 75 * 75), 75], [Math.sqrt(112 * 112 - 75 * 75), 75]].concat(arc(112, ac(75, 112), 180 - as(36, 112)), [[36, -190], [28, -190]], arc(101, 180 - as(28, 101), ac(75, 101)));
    c.scene.add(c.shell(P.halfSection({ poly: sock, material: c.mat("socket") }), "open"));
    c.scene.add(c.shell(P.wholeSection({ poly: sock, material: c.mat("socket") }), "closed"));   // closed view: the whole socket
    // flange lugs and bolts at both sides of the joint between the two halves (y -7..7), cut in half like the rest (z -22..0)
    var ink = c.mat("socket", "dark");
    [-1, 1].forEach(function (s) {
      P.at(P.box(12, 14, 22, c.mat("socket")), s * 118, 0, -11, c.scene);        // x 112..124, y -7..7
      P.at(P.box(12, 14, 22, c.mat("socket")), s * 136, 0, -11, c.scene);        // x 130..142
      P.at(P.box(6, 14, 3, c.mat("bolts")), s * 127, 0, -1.5, c.scene);          // shank x 124..130
      P.at(P.box(16, 8, 9, c.mat("bolts")), s * 127, 11, -4.5, c.scene);         // head y 7..15
      P.at(P.box(16, 8, 9, c.mat("bolts")), s * 127, -11, -4.5, c.scene);        // nut y -15..-7
      P.at(P.box(6, 4, 3, c.mat("bolts")), s * 127, -17, -1.5, c.scene);         // end of the bolt y -19..-15
      c.shell(P.at(P.box(11.2, 1, 1, ink), s * 106.6, 0, .5, c.scene), "open");    // joint line on the cut face, x 101..112, lifted off z = 0
      c.shell(P.at(P.box(12, 1, 1, ink), s * 136, 0, .5, c.scene), "open");        // x 130..142 (beside the bolt)
      c.shell(P.at(P.box(6, 1, 1, ink), s * 121, 0, .5, c.scene), "open");         // x 118..124 shown on the lug
      // closed view: the front halves the cut leaves out (z 0..22), mirrored
      c.shell(P.at(P.box(12, 14, 22, c.mat("socket")), s * 118, 0, 11, c.scene), "closed");
      c.shell(P.at(P.box(12, 14, 22, c.mat("socket")), s * 136, 0, 11, c.scene), "closed");
      c.shell(P.at(P.box(6, 14, 3, c.mat("bolts")), s * 127, 0, 1.5, c.scene), "closed");
      c.shell(P.at(P.box(16, 8, 9, c.mat("bolts")), s * 127, 11, 4.5, c.scene), "closed");
      c.shell(P.at(P.box(16, 8, 9, c.mat("bolts")), s * 127, -11, 4.5, c.scene), "closed");
      c.shell(P.at(P.box(6, 4, 3, c.mat("bolts")), s * 127, -17, 1.5, c.scene), "closed");
      c.shell(P.at(P.box(4.5, 13, 43, c.mat("socket")), s * 110.25, 0, 0, c.scene), "closed");   // closed view: filler x 108..112.5, y -6.5..6.5, z -21.5..21.5, fills the wedge between the flat lugs and the round socket (buried in the wall r 101..112)
    });
  },

  step: function (c, dt, S) {
    var o = this.o, amp = (+S.controls.amp) * Math.PI / 180, a;
    o.th += S.w * dt;
    a = amp * Math.sin(o.th);
    o.ball.rotation.z = a;
    S.set("a", (a >= 0 ? "+" : "−") + Math.abs(a * 180 / Math.PI).toFixed(0) + "°");
    S.set("x", Math.round(-190 * Math.sin(a)) + " mm");
  }
});
