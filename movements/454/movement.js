M507.define({
  number: 454,
  title: "Diaphragm forcing pump",
  lede: "A pump with no piston. A sheet of flexible stuff, called a diaphragm, is clamped across the top of the chamber. Pulling its middle up draws water in, and pushing it down forces water out up the pipe.",
  alt: "A pump cut open at the front. A handle pivoted on a curved bracket moves a rod up and down. The rod is fixed to the middle of a flexible sheet clamped across the top of the chamber. A suction pipe enters from below with a lifting valve on top of it. A delivery pipe leaves at the lower right, curves up through a flap valve in a wide bulge, and rises. Blue dots show the water.",
  parts: [
    { key: "handle", color: "#5E7387", name: "Handle and rod", note: "The handle rocks on a pin at the top of the bracket. Its short end lifts and lowers the rod, which is fixed to the middle of the diaphragm." },
    { key: "diaphragm", color: "#C8873A", name: "Diaphragm", note: "A flexible sheet, such as leather or rubber, clamped all round its edge. Only its middle moves, so it bends into a dish shape." },
    { key: "valves", color: "#D9B13B", name: "Valves", note: "Two one-way valves. The one at the bottom lifts to let water in. The flap in the bulge lifts to let water out. Watch the red marks." },
    { key: "body", color: "#4FA58A", name: "Body and pipes", note: "The chamber under the diaphragm, the suction pipe below it and the delivery pipe on the right." }
  ],
  closed: { label: "Pump" },
  readouts: [{ id: "q", label: "Delivered" }, { id: "s", label: "Stroke" }],
  views: { "3d": [263, 134, 585], front: [0, -15, 680], side: [680, -15, 0] },
  target: [-10, -15, 0],
  how: [
    "Watch the middle of the diaphragm. When the handle lifts it, the space under it grows. Water pushes up the lifting valve at the bottom and fills the chamber. The flap on the right stays shut, so nothing comes back down the delivery pipe.",
    "When the handle pushes it down, the space shrinks. The bottom valve drops shut, so the water has only one way to go. It lifts the flap in the bulge and is forced up the pipe on the right.",
    "The edge of the diaphragm never moves, so nothing has to slide or rub to keep the water in. Try pausing halfway down a stroke and follow the dots through the open flap. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the pump is cut away so the inside shows. The body is drawn as a flat box so all the passages show at once, and the diaphragm bends only from side to side. The shape of the handle and bracket, the guide for the lifting valve and all the sizes were made up. The litres count assumes a made-up size for the chamber.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, bm = c.mat("body"), vm = c.mat("valves"), red = c.mat("valves", "mark"), hm = c.mat("handle"), i;
    var o = this.o = { th: 0, dir: 1, q: 0, D: null, Lr: 159, px0: -100, py0: 120 };
    function wall(x0, x1, y0, y1) {
      c.shell(P.at(P.box(x1 - x0, y1 - y0, 50, bm), (x0 + x1) / 2, (y0 + y1) / 2, 25, scene), "closed");   // closed view: the front half, z 0 .. 50
      return P.at(P.box(x1 - x0, y1 - y0, 50, bm), (x0 + x1) / 2, (y0 + y1) / 2, -25, scene);
    }   // walls z -50 .. 0
    function line(pts, w) {
      scene.add(c.shell(P.outlinePlate({ points: P.strokeOutline(pts, w), depth: 50, z0: 0, material: bm }), "closed"));   // closed: front half, z 0 .. 50
      return scene.add(P.outlinePlate({ points: P.strokeOutline(pts, w), depth: 50, z0: -50, material: bm }));
    }
    function arc(cx, cy, r, a0, a1, n, out) { for (var k = 0; k <= n; k++) { var a = a0 + (a1 - a0) * k / n; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return out; }
    wall(-80, -48, -8, 0); wall(48, 80, -8, 0);                              // lower flange, top y 0 where the diaphragm lies
    wall(-80, -48, 2.5, 10.5); wall(48, 80, 2.5, 10.5);                      // upper flange, on the diaphragm's edge (y 0 .. 2.5)
    wall(-56, -48, -100, -8);                                                 // left wall, from the floor's top y -100 to the flange y -8
    wall(-80, -15, -108, -100);                                               // floor, left of the suction port x -15 .. 15
    wall(-23, -15, -170, -108); wall(15, 23, -170, -108);                    // suction pipe walls, up to the floor's underside
    var inner = arc(80, -34, 30, -Math.PI / 2, 0, 12, [[52, -8], [52, -64]]); // right wall of the chamber, then the inside of the bend
    inner.push([110, -20], [98, -8], [98, 24], [110, 36], [110, 110]);
    var outer = arc(100, -44, 60, -Math.PI / 2, 0, 16, [[15, -104]]);        // floor right of the port, then the outside of the bend
    outer.push([160, -20], [172, -8], [172, 24], [160, 36], [160, 110]);
    line(inner, 8); line(outer, 8);
    wall(104, 116, -22, -17); wall(154, 166, -22, -17);                       // seat for the flap, at the foot of the bulge
    var back = [[-80, 0], [-80, -108], [-23, -108], [-23, -170], [23, -170], [23, -108], [100, -108]];
    arc(100, -44, 64, -Math.PI / 2, 0, 16, back);
    back.push([164, -20], [176, -8], [176, 24], [164, 36], [164, 110], [106, 110], [106, 36], [94, 24], [94, -8], [106, -20]);
    arc(80, -34, 26, 0, -Math.PI / 2, 12, back);
    back.push([56, -60], [56, -8], [80, -8], [80, 0]);
    scene.add(c.shell(P.prism(back, -54, -50, c.mat("body", "light")), "open"));   // back wall of the cut-away half
    scene.add(c.shell(P.prism(back, -54, -50, bm), "closed"));               // closed: the same back wall in the casing colour, so no pale edge shows
    scene.add(c.shell(P.prism(back, 50, 54, bm), "closed"));                 // closed: front wall, z 50 .. 54
    // bracket for the handle, standing on the upper flange (y 10.5), behind the handle (z -41 .. -29.5)
    scene.add(P.outlinePlate({ points: P.strokeOutline([[-67, 10.5], [-68, 60], [-80, 100], [-100, 120]], 10), depth: 11.5, z0: -41, material: bm }));
    P.at(P.cylZ(4.6, 12.5, c.mat("handle", "dark")), o.px0, o.py0, -23.25, scene);   // pivot pin, z -29.5 .. -17
    // handle, z -29 .. -21, pivot at its local origin; the rod's pin is 100 to the right
    o.handle = P.at(new T.Group(), o.px0, o.py0, 0, scene);
    o.handle.add(P.outlinePlate({ points: P.strokeOutline([[100, 0], [70, 14], [30, 14], [0, 0], [-50, -18], [-110, -48], [-160, -60]], 8), depth: 8, z0: -29, material: hm }));
    P.at(P.cylZ(3.5, 11, c.mat("handle", "dark")), 100, 0, -25, o.handle);  // rod pin
    o.rod = P.rod(3.5, hm); scene.add(o.rod);
    // diaphragm: a sheet across the chamber, redrawn each frame; washers above and below its middle
    o.dia = P.at(new T.Mesh(new T.BufferGeometry(), c.mat("diaphragm")), 0, 0, 0, scene); o.dia.userData.live = true;
    o.dia2 = c.shell(P.at(new T.Mesh(new T.BufferGeometry(), c.mat("diaphragm")), 0, 0, 0, scene), "closed"); o.dia2.userData.live = true;   // closed: the sheet out to the front wall, z -1 .. 49
    o.cen = P.at(new T.Group(), 0, 0, 0, scene);
    P.at(P.box(26, 4, 40, hm), 0, 3.25, -25, o.cen);                          // top washer, on the sheet (y 1.25 .. 5.25)
    P.at(P.box(16, 6, 30, hm), 0, -4.25, -25, o.cen);                         // nut under the sheet (y -7.25 .. -1.25)
    // lifting valve on the suction port: disc on the floor (y -100), stem down the pipe, knob on top
    o.pop = P.at(new T.Group(), 0, -100, 0, scene);
    P.at(P.box(40, 5, 44, vm), 0, 2.5, -25, o.pop);                           // disc y 0 .. 5, z -47 .. -3
    P.at(P.cylY(3, 24, vm), 0, -12, -25, o.pop);                              // stem, inside the pipe
    P.at(P.sphere(6, vm), 0, 8, -25, o.pop);
    P.at(P.box(6, 4, 2, red), 0, 2.5, -1.5, o.pop);                           // red mark z -2.5 .. -.5
    // flap in the bulge: rests on the seat (y -17), hinged at the left
    o.flap = P.at(new T.Group(), 113, -15.75, 0, scene);
    P.at(P.box(44, 2.5, 44, vm), 22, 0, -25, o.flap);
    c.shell(P.at(P.box(5, 4, 2, red), 34, 0, -1.5, o.flap), "open");
    c.shell(P.at(P.box(44, 2.5, 50, vm), 22, 0, 22, o.flap), "closed");       // closed: the flap carried on to the front wall (z -3 .. 47), seen down the open pipe
    P.at(P.cylZ(1.6, 45, c.mat("valves", "dark")), 0, 0, -25, o.flap);
    var z0 = -44, z1 = -6;
    o.flow = P.pipeDots({ color: c.spot, paths: [
      { pts: [[0, -170], [0, -92]], n: 16, w: 22, z0: z0, z1: z1 },                                                  // 0 up the suction pipe
      { pts: [[20, -86], [70, -84], [100, -78], [128, -56], [135, -30], [135, 118]], n: 52, w: 22, z0: z0, z1: z1 }  // 1 out and up, a little way out of the open top (y 110)
    ] });
    scene.add(o.flow);
    o.cd = P.waterDots(50, { radius: 2.4, color: c.spot }); scene.add(o.cd);
    o.pd = []; for (i = 0; i < 50; i++) o.pd.push([-44 + 88 * Math.random(), Math.random(), z0 + (z1 - z0) * Math.random()]);
  },

  sag: function (x, D) {                                                       // how far the sheet's centre line sits below y 1.25
    var a = Math.abs(x);
    return a < 12 ? D : a > 48 ? 0 : D * .5 * (1 + Math.cos(Math.PI * (a - 12) / 36));
  },

  step: function (c, dt, S) {
    var o = this.o, me = this, i, k;
    if (S.w) o.dir = S.w > 0 ? 1 : -1;
    o.th += S.w * dt;
    var psi = .05 + .25 * Math.sin(o.th), cs = Math.cos(o.th) * o.dir, open = Math.sqrt(Math.abs(cs));
    var up = cs > 0;                                                          // the rod end of the handle rises: suction
    o.handle.rotation.z = psi;
    var px = o.px0 + 100 * Math.cos(psi), py = o.py0 + 100 * Math.sin(psi);
    var yc = py - Math.sqrt(o.Lr * o.Lr - px * px) , D = 1.25 - yc;           // the rod keeps its length; its foot stays on the axis
    o.rod.span(0, yc + 5.25, -25, px, py, -25);
    o.cen.position.y = yc - 1.25;
    var path = []; for (k = 0; k <= 40; k++) { var x = -80 + 4 * k; path.push([x, 1.25 - me.sag(x, D)]); }
    o.dia.geometry.dispose(); o.dia.geometry = c.P.outlinePlate({ points: c.P.strokeOutline(path, 2.5), depth: 48, z0: -49 }).geometry;
    o.dia2.geometry.dispose(); o.dia2.geometry = c.P.outlinePlate({ points: c.P.strokeOutline(path, 2.5), depth: 50, z0: -1 }).geometry;
    o.pop.position.y = -100 + (up ? 9 * open : 0);
    o.flap.rotation.z = up ? 0 : .8 * open;
    var dD = o.D === null ? 0 : D - o.D; o.D = D;
    var ds = 2.5 * Math.abs(dD);
    o.flow.move(0, up ? ds : 0); o.flow.move(1, up ? 0 : ds); o.flow.flush();
    for (i = 0; i < 50; i++) {                                                // water in the chamber fills up to the sheet
      var d = o.pd[i], top = 1.25 - me.sag(d[0], D) - 4;
      o.cd.put(i, d[0], -97 + d[1] * (top + 97), d[2], 1);
    }
    o.cd.flush();
    o.q += .012 * Math.abs(dD) * (up ? 0 : 1);                                // only the down stroke delivers
    S.set("q", o.q.toFixed(1) + " L");
    S.set("s", up ? "Up" : "Down");
  }
});
