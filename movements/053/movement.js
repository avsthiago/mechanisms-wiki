M507.define({
  number: 53,
  title: "Reversing gear with double clutch",
  lede: "One shaft always turns the same way. A sliding clutch lets it drive a second shaft forwards or backwards, or not at all.",
  alt: "A bevel gear on a vertical shaft meshes with two bevel gears facing each other on a horizontal shaft. A clutch sleeve between them slides left or right, moved by a lever bent at a corner, called a bell crank.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "On the driving shaft, which is upright. It always turns the same way." },
    { key: "loose", color: "#C8873A", name: "Loose gears", note: "Two gears that face each other and spin in opposite directions. They are not fixed to the shaft they sit on." },
    { key: "clutch", color: "#8E7AA8", name: "Double clutch", note: "A sleeve with teeth at both ends. It can slide along the shaft, but it always turns with it." },
    { key: "out", color: "#4FA58A", name: "Driven shaft", note: "The shaft that gets driven. Watch the disc on its end to see which way it turns." },
    { key: "lever", color: "#D9B13B", name: "Shifting lever", note: "Pushes the clutch to the left or to the right." }
  ],
  controls: [{ id: "clutch", label: "Clutch position", value: "left", options: [["left", "Left gear"], ["mid", "Neutral"], ["right", "Right gear"]] }],
  readouts: [{ id: "in", label: "Driving shaft" }, { id: "out", label: "Driven shaft" }, { id: "st", label: "Clutch", text: true }],
  views: { "3d": [520, 280, 1020], front: [10, 5, 1080], top: [10, 1080, 2] },
  target: [10, 5, 0],
  how: [
    "The driving gear touches both side gears at once, one on its left and one on its right. That makes them spin in opposite directions. But they are loose on their shaft, so the shaft itself does not turn yet.",
    "The clutch is the only part locked to the shaft. Slide it left and its teeth grip the left gear, so the shaft turns with that gear. Slide it right and it grips the other gear, so the shaft turns the other way. In the middle it grips neither, and the shaft slows down and stops.",
    "Watch closely when you change sides. The clutch waits until the gaps line up with its teeth, then it drops in."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown drew slanted clutch teeth; square ones are used here so both sides grip the same way. The number of gear teeth, the sizes and the stand for the lever were made up.",

  build: function (c) {
    var P = c.P, scene = c.scene, RG = 110, PY = -85, PZ = 44, o = this.o = { PY: PY, PZ: PZ };
    function gear(key) { return P.bevelGear({ radius: RG, teeth: 24, material: c.mat(key) }); }
    o.top = gear("drive"); scene.add(o.top);
    P.at(P.cylY(12, 150, c.mat("drive")), 0, RG + 95, 0, o.top);
    function side(sign) {
      var outer = new c.THREE.Group(); outer.rotation.z = -sign * Math.PI / 2; scene.add(outer);
      var g = gear("loose"); outer.add(g);
      P.at(P.cylY(30, 16, c.mat("loose")), 0, 72, 0, g);
      var j = P.jawRing({ rIn: 14, rOut: 30, len: 12, material: c.mat("loose") }); j.rotation.x = Math.PI / 2; j.position.y = 64; g.add(j);
      return g;
    }
    o.gearL = side(-1); o.gearR = side(1); o.pitch = o.top.pitch;
    o.shaft = new c.THREE.Group(); scene.add(o.shaft);
    P.at(P.cylX(12, 400, c.mat("out")), 10, 0, 0, o.shaft);
    P.at(P.box(100, 7, 7, c.mat("out")), 0, 13, 0, o.shaft);
    P.at(P.cylX(46, 10, c.mat("out")), 208, 0, 0, o.shaft);
    P.at(P.cylX(6, 26, c.mat("out")), 222, 30, 0, o.shaft);
    o.slide = new c.THREE.Group(); o.shaft.add(o.slide);
    var mc = c.mat("clutch");
    P.at(P.cylX(30, 16, mc), 16, 0, 0, o.slide); P.at(P.cylX(30, 16, mc), -16, 0, 0, o.slide); P.at(P.cylX(21, 16, mc), 0, 0, 0, o.slide);
    [1, -1].forEach(function (s) { var j = P.jawRing({ rIn: 14, rOut: 30, len: 12, material: mc }); j.rotation.y = s * Math.PI / 2; j.position.x = s * 24; o.slide.add(j); });
    var ml = c.mat("lever");
    o.lever = new c.THREE.Group(); o.lever.position.set(0, PY, PZ); scene.add(o.lever);
    o.arm = P.at(P.box(8, 1, 6, ml), 0, 0, 0, o.lever);
    o.pin = P.at(P.cylZ(4, 24, ml), 0, 0, -12, o.lever);
    P.at(P.box(60, 8, 6, ml), -30, 0, 0, o.lever); P.at(P.cylZ(10, 12, ml), 0, 0, 0, o.lever);
    o.rod = new c.THREE.Group(); scene.add(o.rod);
    P.at(P.box(6, 90, 6, ml), 0, -45, 0, o.rod); P.at(P.sphere(9, ml), 0, -94, 0, o.rod); P.at(P.cylZ(5, 8, ml), 0, 0, 0, o.rod);
    P.at(P.cylZ(4, PZ + 6, c.fixed), 0, PY, PZ / 2 - 3, scene);
    P.at(P.box(12, 130, 12, c.fixed), 0, PY - 65, 0, scene);
    P.at(P.box(300, 8, 150, c.fixed), -20, PY - 134, 20, scene);
    // simulation state: start engaged with the left gear
    o.alpha = 0; o.locked = -1; o.shift = -24; o.gamma = 0; o.gvel = 0; o.off = Math.PI / 4;
  },

  step: function (c, dt, S) {
    var o = this.o, ENG = 24, TOUCH = 15, Q90 = Math.PI / 2, w = S.w;
    var cmd = { left: -1, mid: 0, right: 1 }[S.controls.clutch];
    function wrap(x) { return ((x + Q90 / 2) % Q90 + Q90) % Q90 - Q90 / 2; }
    o.alpha += w * dt;
    var gL = o.alpha - o.pitch / 2, gR = -o.alpha + o.pitch / 2 + Math.PI, limit = ENG;
    if (cmd !== 0 && o.locked !== cmd) {
      limit = TOUCH;                                   // jaws wait tip to tip until they line up
      if (o.locked === 0 && Math.abs(o.shift - cmd * TOUCH) < .5) {
        var g = cmd < 0 ? gL : gR, wg = cmd < 0 ? w : -w;
        var rel = wrap(o.gamma - g - Q90 / 2), tol = Math.max(.07, Math.abs(o.gvel - wg) * dt * 1.2);
        if (Math.abs(rel) < tol && w > 0) { o.locked = cmd; o.off = o.gamma - g - rel; limit = ENG; }
      }
    }
    var target = cmd * limit, d = target - o.shift, mv = 70 * dt;
    o.shift += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    if (o.locked !== 0 && cmd !== o.locked && o.locked * o.shift < TOUCH + 1) o.locked = 0;
    if (o.locked !== 0) { o.gamma = (o.locked < 0 ? gL : gR) + o.off; o.gvel = o.locked < 0 ? w : -w; }
    else { o.gvel *= Math.exp(-dt * 2.2); if (Math.abs(o.gvel) < .004) o.gvel = 0; o.gamma += o.gvel * dt; }

    o.top.rotation.y = o.alpha; o.gearL.rotation.y = o.gearR.rotation.y = -o.alpha + o.pitch / 2;
    o.shaft.rotation.x = o.gamma; o.slide.position.x = o.shift;
    var L = Math.sqrt(o.PY * o.PY + o.shift * o.shift), del = Math.atan2(o.shift, -o.PY);
    o.lever.rotation.z = -del; o.arm.scale.y = L; o.arm.position.y = L / 2; o.pin.position.y = L;
    o.rod.position.set(-60 * Math.cos(del), o.PY + 60 * Math.sin(del), o.PZ);

    S.set("in", (S.playing ? S.rpm : 0) + " rpm");
    var r = Math.round(Math.abs(o.gvel) * 60 / (2 * Math.PI));
    S.set("out", r === 0 ? "0 rpm" : r + " rpm " + (o.gvel > 0 ? "↺" : "↻"));
    S.set("st", o.locked < 0 ? "Left gear" : o.locked > 0 ? "Right gear" : cmd === 0 ? "Neutral" : S.playing ? "Engaging" : "Waiting");
  }
});
