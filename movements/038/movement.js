M507.define({
  number: 38,
  title: "Part steady, part varied rotation",
  lede: "Two equal gears turn each other at the same speed for most of a turn. Then their teeth stop, and two pairs of toothed arms take over. One pair makes the second gear hurry and the other makes it dawdle, while the crank keeps turning steadily.",
  alt: "Two equal gears side by side on an upright plate, each with a wide slice cut out. In each cut sit a short toothed arm near the centre and a long toothed arm that reaches across to the other wheel. A crank turns the left gear, and a red stripe marks the right gear.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "A gear with a slice cut out, fixed to the crank's shaft. While its teeth meet the other wheel's teeth, both turn at the same speed." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "The same gear, turned half way round. Watch the red stripe. It turns steadily, then hurries, then dawdles." },
    { key: "fast", color: "#8E7AA8", name: "Fast pair", note: "A long toothed arm on the driving wheel pushes a short one on the driven wheel. A small swing of the long arm turns the short one a long way." },
    { key: "slow", color: "#4FA58A", name: "Slow pair", note: "A short toothed arm on the driving wheel pushes a long one on the driven wheel. The short arm must turn a long way to swing the long one a little." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the driving gear at a steady speed. In a real machine an engine or a water wheel would do this." }
  ],
  controls: [{ id: "arms", label: "Toothed arms", value: "drawn", options: [["drawn", "As drawn"], ["close", "Closer in size"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }, { id: "mesh", label: "In mesh" }],
  views: { "3d": [250, 155, 590], front: [0, 0, 720], side: [720, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Turn the crank and the left gear turns steadily. For most of the turn its teeth push the teeth of the right gear. The gears are the same size, so the right one turns at the same speed, the other way. A minus sign in the readout means the other way.",
    "Each gear has a slice cut out, so for a while the big teeth do not meet. Toothed arms fill the cut. First a long arm on the left pushes a short arm on the right. The tip of a long arm travels far, so the short arm is whirled round and the right gear hurries. Later a short arm on the left pushes a long arm on the right, and the right gear dawdles.",
    "The hurry and the dawdle cancel out, so both gears still finish each turn together. Try As drawn, then Closer in size, and watch how much the Driven speed changes."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two cut wheels and the toothed arms between their centres. The crank, the plate, the sizes and the number of teeth were made up. A tooth or two is left out at the end of some rows, so that teeth do not hit each other when the speed changes. In a real machine these changes of speed would come as sharp knocks. The choice of arm sizes was added to show what it changes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, NM = 24, D = NM * MD, RAD = Math.PI / 180;   // equal wheels of pitch radius 72, centres 144 apart
    var o = this.o = { a: 0, sets: {} };
    // a row of teeth i0..i1 of a full circle of N, then turned by rot degrees; z -8..8
    function row(N, i0, i1, rot, mat) {
      var st = 360 / N, s = P.gearSector({ teeth: N, module: MD, width: 16, fromDeg: i0 * st - 1, toDeg: i1 * st + 1, material: mat });
      s.rotation.z = rot * RAD; return s;
    }
    // ns + nb = 2 * NM so each short and long arm meet on the line of centres; t teeth on each arm
    [["drawn", 12, 36, 3], ["close", 16, 32, 4]].forEach(function (s) {
      var ns = s[1], nb = s[2], t = s[3], ps = 360 / ns, pb = 360 / nb, pm = 360 / NM, gS = t * ps, gB = t * pb, nm = (360 - gS - gB) / pm;
      var L = new T.Group(), R = new T.Group();
      L.position.set(-D / 2, 0, 0); R.position.set(D / 2, 0, 0); scene.add(L); scene.add(R);
      // Teeth are placed by the order they cross the line of centres: driving teeth a quarter pitch after each
      // whole pitch, driven teeth three quarters after, so they sit half a pitch apart. One end tooth is left
      // off four rows so nothing clashes at the changes of speed (checked numerically over a whole turn).
      L.add(row(nb, 0, t - 2, -(t - .75) * pb, c.mat("fast")));                          // long arm, first tooth left off
      L.add(row(NM, 0, nm - 2, -gB - (nm - 1.75) * pm, c.mat("drive")));                 // main teeth, last tooth left off
      L.add(row(ns, 0, t - 1, -gB - nm * pm - (t - .75) * ps, c.mat("slow")));           // short arm
      R.add(row(ns, 0, t - 1, 180 + .75 * ps, c.mat("fast")));                           // short arm
      R.add(row(NM, 0, nm - 2, 180 + gS + 1.75 * pm, c.mat("driven")));                  // main teeth, first tooth left off
      R.add(row(nb, 0, t - 2, 180 + gS + nm * pm + .75 * pb, c.mat("slow")));            // long arm, last tooth left off
      P.at(P.cylZ(11, 21, c.mat("drive")), 0, 0, 1.5, L);                                // hub z -9..12, joins the three rows
      P.at(P.cylZ(6, 21, c.mat("drive")), 0, 0, -19.5, L);                               // shaft z -30..-9, plate face to hub
      P.at(P.cylZ(6, 18, c.mat("drive")), 0, 0, 21, L);                                  // shaft z 12..30, hub to crank arm
      P.at(P.box(52, 12, 6, c.mat("crank")), -22, 0, 33, L);                             // arm x -48..4, z 30..36, on the shaft end
      P.at(P.cylZ(5, 24, c.mat("crank")), -44, 0, 48, L);                                // handle z 36..60, on the arm face
      P.at(P.cylZ(11, 21, c.mat("driven")), 0, 0, 1.5, R);                               // hub z -9..12
      P.at(P.cylZ(6, 21, c.mat("driven")), 0, 0, -19.5, R);                              // shaft z -30..-9, plate face to hub
      P.at(P.box(48.5, 5, 1, c.mat("driven", "mark")), 37.25, 0, 9, R);                  // red stripe x 13..61.5, z 8.5..9.5, lifted off the face z 8
      o.sets[s[0]] = { L: L, R: R, k: nb / ns, gS: gS, gB: gB, main: nm * pm };
    });
    // supports
    P.at(P.box(400, 300, 10, c.fixed), 0, 0, -35, scene);                                // plate x -200..200, y -150..150, z -40..-30; shafts end at z -30
    P.at(P.box(440, 12, 100, c.fixed), 0, -156, -30, scene);                             // base x -220..220, y -162..-150, z -80..20; plate stands on y -150
  },

  step: function (c, dt, S) {
    var o = this.o, key, cur = o.sets[S.controls.arms] || o.sets.drawn, RAD = Math.PI / 180;
    o.a += S.w * dt;
    for (key in o.sets) o.sets[key].L.visible = o.sets[key].R.visible = o.sets[key] === cur;
    // driver angle within one turn, in degrees; the opening position is Brown's drawing, where the fast pair is about to take over
    var th = o.a / RAD, x = th - 360 * Math.floor(th / 360), f, ratio, name;
    if (x < cur.gB) { f = x * cur.k; ratio = cur.k; name = "Fast pair"; }                                        // long arm drives short arm
    else if (x < cur.gB + cur.main) { f = cur.gS + (x - cur.gB); ratio = 1; name = "Gear teeth"; }                // equal gears
    else { f = cur.gS + cur.main + (x - cur.gB - cur.main) / cur.k; ratio = 1 / cur.k; name = "Slow pair"; }      // short arm drives long arm
    cur.L.rotation.z = x * RAD;
    cur.R.rotation.z = -f * RAD;                           // opposite way; f runs 0..360 with no jump, only its speed changes
    function fmt(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", fmt(rpm));
    S.set("out", fmt(rpm === 0 ? 0 : -rpm * ratio));
    S.set("mesh", name);
  }
});
