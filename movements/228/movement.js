M507.define({
  number: 228,
  title: "Chain and pulley, second kind",
  lede: "A chain runs round a wide wheel. Wedges on the rim poke through the chain's wide links, so the chain cannot slip. The small links between them stand on edge in a groove round the rim.",
  alt: "A wide disc wheel on a shaft, seen from one side. A ladder-like chain of wide flat links and small upright links lies over its rim, with a wedge on the rim inside each wide link. The chain hangs down both sides in a loop.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Chain wheel", note: "A wide disc. Its rim has a flat seat for each wide link, a wedge in the middle of each seat, and a groove all the way round." },
    { key: "plates", color: "#C8873A", name: "Flat links", note: "Wide wire links that lie flat on the rim. A wedge pokes up through the open middle of each one. Watch the red one go round." },
    { key: "rings", color: "#D9B13B", name: "Upright links", note: "Small links that join the wide ones. They stand on edge, at right angles to the wide links, and drop into the groove." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "v", label: "Chain" }],
  views: { "3d": [-290, 144, 414], front: [0, -45, 620], side: [620, -45, 0] },
  target: [0, -45, 0],
  how: [
    "The chain has two kinds of link. Wide flat links lie on the rim of the wheel. Between them, small links stand on edge, at right angles to the wide ones.",
    "The rim has a flat seat for each wide link, with a wedge in the middle. The wedge pokes up through the open middle of the link. A groove round the middle of the rim makes room for the small links. So every link has its own place, and the wheel grips the chain.",
    "Turn the view round to see the wedges and the groove from the side. Then slow the wheel down and follow the red link as it climbs onto the wheel, rides over the top and drops off the other side."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not say how the links are joined, so the shape of the links, the seats, the wedges and the groove were worked out to fit his picture. Here the chain is joined into a loop that hangs below the wheel, so it can go round and round. The stand and the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, A = 26, B = 10, U = 15, RW = 1.5, RR = 1.2, E = RW + RR + .3, CNT = 36, i;
    var o = this.o = { psi: 0 };
    var ch = o.ch = P.chainLoop({ seats: 28, lengths: [A, B], count: CNT });
    var R = ch.radius, da = ch.seatAngle(0) - ch.seatAngle(1);               // joint circle about 80.5
    var RV = R - (RW + .3) / Math.cos(da / 2), AF = RV * Math.cos(da / 2);    // rim corners; seat faces 0.3 under the wide links' wires
    o.wheel = new T.Group(); scene.add(o.wheel);
    // rim: two bands with a flat seat under each wide link, and a groove between them for the upright links
    var sh = new T.Shape();
    for (i = 0; i < 28; i++) { var an = ch.seatAngle(i); if (i) sh.lineTo(RV * Math.cos(an), RV * Math.sin(an)); else sh.moveTo(RV * Math.cos(an), RV * Math.sin(an)); }
    var bg = new T.ExtrudeGeometry(sh, { depth: 15.5, bevelEnabled: false });
    var front = new T.Mesh(bg, c.mat("wheel")); front.position.z = 2.5; o.wheel.add(front);        // front band z 2.5..18
    var back = new T.Mesh(bg, c.mat("wheel")); back.position.z = -18; o.wheel.add(back);           // back band z -18..-2.5
    P.at(P.cylZ(74, 5, c.mat("wheel", "dark")), 0, 0, 0, o.wheel);          // groove floor z -2.5..2.5, under the upright links (their inner edge is at 76.2)
    // wedges: one in the middle of each seat, from the groove floor to 12 above the seat face, z -10..10
    var ws = new T.Shape(); ws.moveTo(73.5, -7); ws.lineTo(AF, -7); ws.lineTo(AF + 12, 0); ws.lineTo(AF, 7); ws.lineTo(73.5, 7); ws.closePath();
    var wg = new T.ExtrudeGeometry(ws, { depth: 20, bevelEnabled: false }); wg.translate(0, 0, -10);
    for (i = 0; i < 28; i += 2) { var w = new T.Mesh(wg, c.mat("wheel")); w.rotation.z = (ch.seatAngle(i) + ch.seatAngle(i + 1)) / 2; o.wheel.add(w); }
    P.at(P.cylZ(6, 56, c.mat("wheel", "dark")), 0, 0, 4, o.wheel);          // shaft z -24..32, from the post face
    P.at(P.cylZ(11, 4, c.mat("wheel")), 0, 0, 20, o.wheel);                 // collar z 18..22, on the disc face
    // wide link: a rounded oblong of wire, end bars at +-A/2; small link: a wire loop round the end bars at +-B/2
    var fp = [], rp = [], q, k = 6;
    [[A / 2 - 4, U - 4, 0], [-A / 2 + 4, U - 4, 1], [-A / 2 + 4, -U + 4, 2], [A / 2 - 4, -U + 4, 3]].forEach(function (cn) {
      for (q = 0; q <= k; q++) { var a1 = (cn[2] + q / k) * Math.PI / 2; fp.push([cn[0] + 4 * Math.cos(a1), cn[1] + 4 * Math.sin(a1)]); }
    });
    for (q = 0; q <= 16; q++) { var a2 = -Math.PI / 2 + Math.PI * q / 16; rp.push([B / 2 + E * Math.cos(a2), E * Math.sin(a2)]); }
    for (q = 0; q <= 16; q++) { var a3 = Math.PI / 2 + Math.PI * q / 16; rp.push([-B / 2 + E * Math.cos(a3), E * Math.sin(a3)]); }
    var fg = P.strapLoop(fp, { thick: 2 * RW, width: 2 * RW, round: 1, segs: 12 }).geometry;
    var rg = P.strapLoop(rp, { thick: 2 * RR, width: 2 * RR, round: 1, segs: 10 }).geometry;
    o.chain = P.linkChain({ count: CNT, geo: fg, altGeo: rg, material: c.mat("plates"), alt: c.mat("rings"), mark: c.mat("plates", "mark"), markAt: 0 });
    scene.add(o.chain);
    // stand
    P.at(P.box(30, 190, 12, c.fixed), 0, -75, -30, scene);                   // post x -15..15, y -170..20, z -36..-24; shaft ends at z -24, wheel back at -18
    P.at(P.box(260, 10, 90, c.fixed), 0, -175, -15, scene);                  // base y -180..-170, z -60..30; post stands on y -170; chain's lowest point about -157
  },

  step: function (c, dt, S) {
    var o = this.o, ch = o.ch, i, n = ch.count;
    o.psi -= S.w * dt;                                                       // clockwise: the right-hand run goes down
    o.wheel.rotation.z = o.psi;
    ch.set(o.psi);
    for (i = 0; i < n; i++) {
      var j = (i + 1) % n, x = ch.jx[i], y = ch.jy[i], tx = ch.jx[j] - x, ty = ch.jy[j] - y;
      if (i % 2) o.chain.put(i, x + tx / 2, y + ty / 2, 0, tx, ty, 0, 0, 0, 1);       // small link: in the plane of the wheel, in the groove
      else o.chain.put(i, x + tx / 2, y + ty / 2, 0, tx, ty, 0, -ty, tx, 0);         // wide link: flat on the rim, across it
    }
    S.set("w", (S.playing ? Math.round(S.rpm * 10) / 10 : 0) + " rpm");
    S.set("v", (Math.abs(S.w) * ch.lift / 10).toFixed(1) + " cm/s");
  }
});
