M507.define({
  number: 344,
  title: "Oscillating engine",
  lede: "Steam pushes a piston to and fro inside a cylinder, and a crank turns that push into a spin. Here the cylinder is held at its middle on two pegs, so it can rock. The piston rod can then join the crank directly, with no sliding guide.",
  alt: "A steam cylinder, cut open to show the piston, held on pegs at its middle. A rod rises from the piston to the pin of a crank at the top, and the cylinder rocks as the crank turns.",
  parts: [
    { key: "cyl", color: "#4FA58A", name: "Cylinder", note: "Cut open at the front so you can see inside. It rests on two pegs at its middle and rocks from side to side." },
    { key: "piston", color: "#C8873A", name: "Piston and piston rod", note: "The piston slides inside the cylinder. Its rod goes straight up to the crank." },
    { key: "crank", color: "#5E7387", name: "Crank", note: "An arm fixed to a turning shaft. It turns the to-and-fro push of the piston into a spin." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "Where the rod joins the crank. Watch it travel round in a circle." }
  ],
  controls: [{ type: "range", id: "arm", label: "Crank arm", min: 20, max: 42, step: 1, value: 38, unit: " mm",
    presets: [[20, "Short"], [30, "Medium"], [42, "Long"]] }],
  readouts: [{ id: "sw", label: "Swing" }, { id: "tr", label: "Piston travel" }],
  closed: { label: "Cylinder" },
  views: { "3d": [300, 80, 460], front: [0, -30, 540], side: [540, -30, 0] },
  target: [0, -30, 0],
  how: [
    "Watch the cylinder. It does not stay still. It rocks a little to one side, then the other, once for every turn of the crank. The pegs at its middle are the pivot.",
    "The rod is part of the piston, and it is joined to the crank pin. The pin goes round in a circle, so the rod always points at it. The cylinder has to turn to keep up. Because it turns with the rod, nothing pushes the piston sideways, and no guide is needed.",
    "Try a short crank arm, then a long one. The long arm makes the piston travel further, and the cylinder rocks more. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the cylinder is cut away so the piston shows. The two fixed beams, the pegs, the shaft and all the sizes were made up. Steam pipes and valves are left out.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: 235 * Math.PI / 180, D: 150, ell: 118, Ty: -60 };
    var ri = 40, ro = 43, rf = 52, rh = 5.4, t = 5, H = 85, rr = 4.5;
    var poly = [[0, -H], [rf, -H], [rf, -H + t], [ro, -H + t], [ro, H - t], [rf, H - t], [rf, H], [rh, H], [rh, H - t], [ri, H - t], [ri, -H + t], [0, -H + t]];
    o.cyl = new T.Group(); o.cyl.position.set(0, o.Ty, 0); scene.add(o.cyl);
    o.cyl.add(c.shell(P.halfSection({ poly: poly, material: c.mat("cyl") }), "open"));
    o.cyl.add(c.shell(P.wholeSection({ poly: poly, material: c.mat("cyl") }), "closed"));   // closed view: the whole cylinder
    P.at(P.cylZ(14, 10, c.mat("cyl")), 0, 0, -43, o.cyl);                  // boss round the peg, z -48 .. -38
    P.at(P.cylZ(8, 12, c.mat("cyl")), 0, 0, -48, o.cyl);                  // peg, z -54 .. -42, ends on the beam face
    // piston, rod and rod end ride inside the cylinder's frame
    o.pis = new T.Group(); o.cyl.add(o.pis);
    o.pis.add(P.halfSection({ poly: [[0, -6], [ri - .6, -6], [ri - .6, 6], [0, 6]], material: c.mat("piston") }));
    var rod = P.at(P.cylY(rr, 1, c.mat("piston")), 0, o.ell / 2, 0, o.pis); rod.scale.y = o.ell;
    P.at(P.cylZ(9, 8, c.mat("piston")), 0, o.ell, 0, o.pis);                // rod end, z -4 .. 4
    // fixed beams, z -66 .. -54; the peg and the shaft end on the front face at z = -54
    P.at(P.box(250, 26, 12, c.fixed), 0, o.Ty, -60, scene);                // x +-115, y Ty +-11
    var Cy = o.Ty + o.D; o.Cy = Cy;
    P.at(P.box(250, 26, 12, c.fixed), 0, Cy, -60, scene);                  // x +-115, y Cy +-11
    P.at(P.cylZ(6, 41.5, c.mat("crank")), 0, Cy, -33.25, scene);          // shaft, z -42 .. -12.5
    o.crank = new T.Group(); o.crank.position.set(0, Cy, 0); scene.add(o.crank);
    P.at(P.cylZ(26, 7.4, c.mat("crank")), 0, 0, -8.8, o.crank);            // hub, z -12.5 .. -5.1
    o.arm = P.at(P.box(1, 16, 7, c.mat("crank")), 0, 0, -8.5, o.crank);    // arm, z -12 .. -5
    o.boss = P.at(P.cylZ(12, 7.2, c.mat("crank")), 0, 0, -8.6, o.crank);    // boss round the pin, z -12.2 .. -5
    o.pin = P.at(P.cylZ(4.5, 20, c.mat("pin")), 0, 0, -3.5, o.crank);      // pin, z -13.5 .. 6.5
  },

  step: function (c, dt, S) {
    var o = this.o, r = +S.controls.arm, D = o.D;
    o.th += S.w * dt;
    var vx = r * Math.cos(o.th), vy = D + r * Math.sin(o.th), len = Math.sqrt(vx * vx + vy * vy);
    o.cyl.rotation.z = Math.atan2(-vx, vy);                                // the cylinder's axis points at the crank pin
    o.pis.position.y = len - o.ell;
    o.crank.rotation.z = o.th;
    o.arm.scale.x = r; o.arm.position.x = r / 2;
    o.boss.position.x = r; o.pin.position.x = r;
    S.set("sw", (Math.atan2(vx, vy) * 180 / Math.PI).toFixed(1) + "°");
    S.set("tr", Math.round(len - (D - r)) + " mm");
  }
});
