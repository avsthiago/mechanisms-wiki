M507.define({
  number: 101,
  title: "Swinging slotted bar",
  lede: "A long bar hangs from a pivot at the top and swings from side to side. A pin on a straight horizontal bar sits in a slot in the swinging bar. As the swinging bar moves, it pushes the horizontal bar to and fro in a straight line.",
  alt: "A ceiling at the top with a pivot under it. A long bar hangs from the pivot and tilts. Part way down it has an oval slot. A horizontal round bar runs left to right through two guides, and a pin on it sits in the slot.",
  parts: [
    { key: "arm", color: "#5E7387", name: "Swinging bar", note: "Hangs from the pivot at the top and swings like a pendulum. The slot near its lower end holds the pin. Its long tail below the slot is the handle." },
    { key: "pin", color: "#C2503F", name: "Pin", note: "Fixed to the horizontal bar and sits in the slot. Watch it. It is pushed sideways, and it slides up and down the slot as the bar tilts." },
    { key: "bar", color: "#C8873A", name: "Horizontal bar", note: "A round bar held by two guides. It can only slide left and right. The dark bands help you see it move." }
  ],
  controls: [{ type: "range", id: "a", label: "Size of swing", min: 10, max: 35, step: 1, value: 30, unit: "°",
    presets: [[12, "Small"], [22, "Medium"], [35, "Large"]] }],
  readouts: [{ id: "x", label: "Bar" }, { id: "t", label: "Swing" }, { id: "v", label: "Speed" }],
  views: { front: [0, -100, 780], "3d": [260, 30, 560], side: [800, -100, 0] },
  target: [0, -100, 0],
  how: [
    "The top of the long bar is fixed to a pivot, so its lower part swings from side to side. The pin is part of the horizontal bar and has to stay in the slot. The guides let the horizontal bar move only left and right.",
    "When the long bar tilts, the slot pushes the pin sideways. The pin also has to slide along the slot, because the slot gets farther from the pivot as it tilts. The bar moves a little faster when the long bar is tilted a lot. It is slowest when the long bar hangs straight down.",
    "Try Small, then Large. With a small swing the bar moves almost evenly. With a large swing the speed readout changes more from the middle to the ends."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show what moves the long bar, so the model swings it back and forth by its handle. The ceiling, the plate at the pivot, the hangers, the guides and all the sizes were made up. The horizontal bar is drawn round. The different swing sizes were added for comparison.",

  K: { H: 130, SL0: 108, SL1: 188 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, H = K.H;
    var o = this.o = { ph: 1.0, prev: null, vel: 0 };
    // ceiling x -170..170, y 14..28, z -30..30; back plate under it x -30..30, y -22..14, z -30..-24
    P.at(P.box(340, 14, 60, c.fixed), 0, 21, 0, scene);
    P.at(P.box(60, 36, 6, c.fixed), 0, -4, -27, scene);
    P.at(P.cylZ(5, 33, c.fixed), 0, 0, -7.5, scene);                                          // pivot shaft z -24..9, ends at the arm's back face
    // swinging bar: hangs along local -y, slot at distance 108..188 from the pivot, z 9..17
    o.arm = new T.Group(); scene.add(o.arm);
    var m = c.mat("arm"), z = 13;
    P.at(P.cylZ(14, 8, m), 0, 0, z, o.arm);                                                   // eye z 9..17
    P.at(P.cylZ(5, 1, c.mat("arm", "dark")), 0, 0, 17.5, o.arm);                              // cap z 17..18
    P.at(P.box(14, 108, 8, m), 0, -54, z, o.arm);                                             // stem d 0..108, x -7..7
    P.at(P.box(28, 8, 8, m), 0, -112, z, o.arm);                                              // end block d 108..116
    P.at(P.box(28, 8, 8, m), 0, -184, z, o.arm);                                              // end block d 180..188
    [-1, 1].forEach(function (s) { P.at(P.box(9, 64, 8, m), s * 9.5, -148, z, o.arm); });     // rails d 116..180, x 5..14
    P.at(P.box(14, 54, 8, m), 0, -215, z, o.arm);                                             // handle d 188..242
    // horizontal bar: round, length 480, on y = -H, z -7..7
    o.bar = new T.Group(); scene.add(o.bar);
    P.at(P.cylX(7, 480, c.mat("bar")), 0, -H, 0, o.bar);
    [-90, 90].forEach(function (x) { P.at(P.cylX(7.8, 8, c.mat("bar", "dark")), x, -H, 0, o.bar); });   // bands, 0.8 off the surface
    P.at(P.cylZ(4, 20, c.mat("pin", "mark")), 0, -H, 10, o.bar);                              // pin z 0..20, through the slot (arm z 9..17)
    P.at(P.cylZ(6.5, 3, c.mat("pin", "mark")), 0, -H, 18.5, o.bar);                           // head z 17..20
    // guides: blocks x +-(112..128), y -145..-115, z -15..15; hangers up to the ceiling underside y 14
    [-1, 1].forEach(function (s) {
      var g = P.guideBlock({ w: 30, h: 16, d: 30, hole: 7.5, material: c.fixed }); g.rotation.z = Math.PI / 2;
      P.at(g, s * 120, -H, 0, scene);
      P.at(P.box(16, 129, 16, c.fixed), s * 120, -50.5, 0, scene);                            // x +-(112..128), y -115..14, z -8..8
    });
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, A = (+S.controls.a) * Math.PI / 180;
    o.ph += S.w * dt;
    var th = A * Math.sin(o.ph), x = K.H * Math.tan(th);       // the pin lies on the slot line, the bar on its guide line
    o.arm.rotation.z = th;
    o.bar.position.x = x;
    if (dt > 0 && S.w !== 0 && o.prev !== null) o.vel = (x - o.prev) / dt; else if (S.w === 0) o.vel = 0;
    o.prev = x;
    var xr = Math.round(x), v = Math.round(o.vel), d = Math.round(th * 180 / Math.PI);
    S.set("x", (xr > 0 ? "+" : xr < 0 ? "−" : "") + Math.abs(xr) + " mm");
    S.set("t", (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d) + "°");
    S.set("v", (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " mm/s");
  }
});
