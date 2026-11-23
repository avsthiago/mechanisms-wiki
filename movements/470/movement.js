M507.define({
  number: 470,
  title: "Steam hammer",
  lede: "A heavy hammer hangs from a piston inside a steam cylinder. Steam let in under the piston lifts the hammer. When the steam is let out, the hammer falls on the hot iron and flattens it.",
  alt: "A tall iron frame on two curved legs, with a steam cylinder on top. A rod comes down from the cylinder to a heavy hammer block above an anvil. A steam pipe comes in from the left, and a long rod on the right runs down to a hand lever.",
  parts: [
    { key: "cyl", color: "#5E7387", name: "Cylinder", note: "Fixed on top of the frame. It is drawn see-through so you can watch the piston inside." },
    { key: "ham", color: "#C8873A", name: "Piston and hammer", note: "The piston, its rod and the hammer block are one piece. Steam lifts it, and its own weight brings it down." },
    { key: "valve", color: "#C2503F", name: "Slide valve", note: "A small block in the steam box on the front of the cylinder. Up, it lets steam in under the piston. Down, it lets the steam out. Watch it move just before each lift and each fall." },
    { key: "gear", color: "#D9B13B", name: "Valve rods and handle", note: "The handle at the bottom right works the valve through the long rods. The worker moves it at the right moments." },
    { key: "work", color: "#4FA58A", name: "Hot iron", note: "The piece being forged. Each blow makes it a little thinner and wider." }
  ],
  speed: false,
  controls: [{ type: "range", id: "lift", label: "Lift before the steam is let out", min: 30, max: 85, step: 5, value: 55, unit: " cm",
    presets: [[30, "Light tap"], [55, "Middle"], [85, "Full blow"]] }],
  readouts: [{ id: "st", label: "Steam" }, { id: "bl", label: "Last blow" }, { id: "wk", label: "Iron" }],
  views: { "3d": [200, 60, 1040], front: [0, 15, 1080], side: [1080, 15, 0] },
  closed: { label: "Cylinder" },
  opacity: function (key, S) { return key === "cyl" && !(S && S.controls.case === "closed" && !S.iso) ? .35 : 1; },   // closed: the cylinder solid
  target: [0, 15, 0],
  distance: [300, 2200],
  how: [
    "Watch the red valve on the front of the cylinder. When it moves up, steam rushes in under the piston. The steam pushes harder than the hammer weighs, so the hammer rises.",
    "Then the valve moves down and the steam escapes. Nothing holds the hammer up now, so it falls freely, faster and faster, like a dropped stone. It hits the iron with all the speed it gained on the way down.",
    "Try a light tap, then a full blow. A higher lift gives a faster fall and a harder blow. Watch how much thinner the iron gets each time. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The cylinder is drawn see-through, and the steam box is shown as a simple box with one sliding block inside. In a real hammer a worker moves the handle; here the model moves it when the hammer lands and when it reaches the chosen height. The rods to the handle, the anvil block, the hot iron and all the sizes and pressures were made up. The blue dots show the steam: dark when fresh, pale as it leaves.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed;
    var o = this.o = { s: 29, v: 0, p: 0.4, admit: true, dwell: 0, vpos: 8, th: 14, w: 40, blow: 0, AT: -178, DPH: 277, ZF: 87 };
    // ground and legs: legs z -25..25 stand on the ground top y -205
    P.at(P.box(470, 10, 140, fx), 0, -210, 0, scene);                                  // ground y -215..-205
    var leg = [[-135, 230], [-84, 230], [-84, -30], [-100, -100], [-125, -170], [-120, -205], [-215, -205], [-205, -185], [-175, -110], [-135, -30]];
    scene.add(P.prism(leg, -25, 25, fx));
    scene.add(P.prism(leg.map(function (p) { return [-p[0], p[1]]; }), -25, 25, fx));
    // plate across the legs under the cylinder, x -84..84 (touches the legs' inner faces), y 70..90, with a hole for the rod
    P.at(P.guideBlock({ w: 168, h: 20, d: 50, hole: 13, material: fx }), 0, 80, 0, scene);
    // cylinder: y 90..255, bore 76, covers 6 thick; gland under the plate y 50..70
    var cyl = new T.Mesh(new T.CylinderGeometry(82, 82, 165, 48, 1, true), c.mat("cyl")); P.at(cyl, 0, 172.5, 0, scene);
    P.at(P.cylY(82, 6, c.mat("cyl")), 0, 252, 0, scene);                               // top cover y 249..255
    var bot = P.annulus({ rIn: 12.6, rOut: 82, depth: 6, material: c.mat("cyl") }); bot.rotation.x = -Math.PI / 2; P.at(bot, 0, 90, 0, scene);   // y 90..96
    var gl = P.annulus({ rIn: 12.6, rOut: 24, depth: 20, material: c.mat("cyl") }); gl.rotation.x = -Math.PI / 2; P.at(gl, 0, 50, 0, scene);     // y 50..70
    // steam box on the front, x -30..20, y 92..162, z 74..100; steam pipe in from the left in front of the leg; exhaust up on the right
    c.shell(P.at(P.box(50, 70, 26, fx), -5, 127, 87, scene));
    var pin = P.cylX(8, 220, fx); c.shell(P.at(pin, -140, 115, 87, scene));            // x -250..-30
    c.shell(P.at(P.cylX(7, 30, fx), 35, 102, 87, scene), "open");                      // x 20..50
    c.shell(P.at(P.cylY(7, 48, fx), 57, 122, 87, scene), "open");                      // x 50..64, y 98..146
    // closed view: the exhaust pipe as one bent pipe, both legs running to the bend centre (57, 102) and a ball there
    c.shell(P.at(P.cylX(7, 37, fx), 38.5, 102, 87, scene), "closed");                  // x 20..57
    c.shell(P.at(P.cylY(7, 44, fx), 57, 124, 87, scene), "closed");                    // y 102..146
    c.shell(P.at(P.sphere(7, fx), 57, 102, 87, scene), "closed");
    o.valve = P.at(P.box(30, 18, 18, c.mat("valve")), -5, 0, 87, scene);
    // hammer: piston (14 thick), rod r12, head 85 x 75
    o.ham = new T.Group(); scene.add(o.ham);                                            // origin at the head's bottom face
    P.at(P.cylY(75.5, 14, c.mat("ham")), 0, o.DPH + 7, 0, o.ham);
    P.at(P.box(140, 1, 1, c.mat("ham", "dark")), 0, o.DPH + 14.6, 0, o.ham).scale.set(1, 1, 30);  // mark on the piston top
    P.at(P.cylY(12, o.DPH - 75, c.mat("ham")), 0, 75 + (o.DPH - 75) / 2, 0, o.ham);
    P.at(P.box(85, 75, 70, c.mat("ham")), 0, 37.5, 0, o.ham);
    P.at(P.box(86, 3, 71, c.mat("ham", "dark")), 0, 58, 0, o.ham);                     // band on the head, proud of its faces
    // anvil and iron
    P.at(P.box(150, 27, 90, fx), 0, -191.5, 0, scene);                                 // anvil y -205..-178
    o.work = P.at(P.box(1, 1, 30, c.mat("work")), 0, 0, 0, scene);
    // valve gear at z 87: top lever pivoted on a stud at (45, 200), rod down the right to a hand lever on a post
    P.at(P.cylZ(4, 16, c.mat("cyl")), 45, 200, 76, scene);                             // stud z 68..84
    o.top = P.at(P.rod(4, c.mat("gear")), 0, 0, 0, scene);
    o.vr = P.at(P.rod(3, c.mat("gear")), 0, 0, 0, scene);
    o.dr = P.at(P.rod(3, c.mat("gear")), 0, 0, 0, scene);
    o.arm = P.at(P.rod(4, c.mat("gear")), 0, 0, 0, scene);
    o.hdl = P.at(P.rod(3.5, c.mat("gear")), 0, 0, 0, scene);
    o.knob = P.at(P.sphere(7, c.mat("gear")), 0, 0, 0, scene);
    P.at(P.box(12, 66, 12, fx), 205, -172, 87, scene);                                 // post y -205..-139
    // steam dots: one set in the cylinder, one in the pipes on the front
    o.flow = P.steamFlow({ color: c.spot, light: true, count: 240, z0: -40, z1: 40 }); scene.add(o.flow);
    o.dom = o.flow.domain({ density: .008, pad: 2, f: function (y, out) { out[0] = -70; out[1] = y; out[2] = 70; out[3] = y; } });
    o.pf = P.steamFlow({ color: c.spot, light: true, count: 40, z0: 85, z1: 89 }); scene.add(o.pf);
    o.pIn = o.pf.pipe({ points: [[-250, 115], [-30, 115], [-12, 110], [-12, 97]], width: 11, n: 18, speed: .5 });
    o.pOut = o.pf.pipe({ points: [[2, 97], [20, 102], [57, 102], [57, 166]], width: 10, n: 16, out: true, speed: .5 });
    o.bars = [0, 0]; o.kinds = [1]; o.ports = [96];
  },

  step: function (c, dt, S) {
    var o = this.o, H = +S.controls.lift, g = 981, n, h, k;
    if (S.playing && dt > 0) {
      n = Math.ceil(dt / (1 / 240)); h = dt / n;
      for (k = 0; k < n; k++) {
        o.p += ((o.admit ? 1 : 0) - o.p) * Math.min(1, h / (o.admit ? .07 : .05));     // pressure under the piston, 0..1 of full
        if (o.dwell > 0) { o.dwell -= h; if (o.dwell <= 0) o.admit = true; }
        var a = o.p * 1.35 * g - g;
        if (o.s <= 0 && a <= 0) { o.v = 0; o.s = 0; continue; }                         // resting on the iron
        o.v += a * h; o.s += o.v * h;
        if (o.admit && o.s >= H && o.v > 0) o.admit = false;                           // worker lets the steam out
        if (o.s <= 0 && o.v < 0) {                                                     // the blow
          o.blow = -o.v; o.th -= 5.3e-6 * o.v * o.v; o.s = 0; o.v = 0; o.dwell = .35;
          if (o.th < 7) o.th = 14;                                                     // a fresh piece
          o.s = 0;
        }
      }
      o.vpos += ((o.admit ? 8 : -8) - o.vpos) * Math.min(1, dt / .06);
    }
    var bottom = o.AT + o.th + o.s, w = 40 * 14 / o.th;
    o.ham.position.y = bottom;
    o.work.scale.set(w, o.th, 1); o.work.position.y = o.AT + o.th / 2;
    // valve gear from the valve position
    var sa = Math.max(-.3, Math.min(.3, -o.vpos / 50)), ca = Math.sqrt(1 - sa * sa);
    var lx = 45 - 50 * ca, ly = 200 - 50 * sa, rx = 45 + 55 * ca, ry = 200 + 55 * sa, Z = o.ZF;
    o.top.span(lx, ly, Z, rx, ry, Z);
    var vy = ly - Math.sqrt(64 * 64 - (lx + 5) * (lx + 5));
    o.valve.position.y = vy - 9; o.vr.span(lx, ly, Z, -5, vy, Z);
    var pm = c.P.meet(205, -145, 105, rx, ry, 345, 1);
    o.dr.span(rx, ry, Z, pm[0], pm[1], Z);
    o.arm.span(205, -145, Z, pm[0], pm[1], Z);
    var ux = (205 - pm[0]) / 105, uy = (-145 - pm[1]) / 105, hx = 205 - uy * 95 + ux * 20, hy = -145 + ux * 95 + uy * 20;
    o.hdl.span(205, -145, Z, hx, hy, Z); o.knob.position.set(hx, hy, Z);
    // steam
    o.bars[0] = 96; o.bars[1] = Math.max(96.2, bottom + o.DPH - 1); o.kinds[0] = o.admit ? 1 : 3;
    o.dom.set(o.bars, o.kinds, o.ports, 1);
    var turn = S.playing ? dt * 4 : 0;
    o.flow.update(turn);
    o.pIn.on = o.admit; o.pOut.on = !o.admit && o.p > .05; o.pf.update(turn);
    S.set("st", o.admit ? "Coming in" : "Going out");
    S.set("bl", o.blow ? (o.blow / 100).toFixed(1) + " m/s" : "None yet");
    S.set("wk", o.th.toFixed(1) + " cm");
  }
});
