M507.define({
  number: 227,
  title: "Chain and chain pulley",
  lede: "A chain runs over a wheel shaped like a star. The points of the star poke into the chain, so the chain cannot slip. Turning the wheel moves the chain down on one side and up on the other.",
  alt: "A six-pointed star wheel on a shaft. A chain of flat plates and upright rings lies over its top and hangs down both sides in a loop. A point of the star pokes through each ring.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Star wheel", note: "A wheel with six points. Each point pokes through an upright link and pushes the chain along." },
    { key: "plates", color: "#C8873A", name: "Flat links", note: "Flat plates that lie in the same plane as the wheel. On the wheel they rest in the hollows between the points. Watch the red one go round." },
    { key: "rings", color: "#D9B13B", name: "Upright links", note: "Rings turned at right angles to the flat links. Their open middle is the space a point of the wheel fits into." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "v", label: "Chain" }],
  views: { "3d": [170, 26, 510], front: [0, -55, 640], side: [640, -55, 0] },
  target: [0, -55, 0],
  how: [
    "The chain has two kinds of link. Flat plates lie in the same plane as the wheel. Between them are rings turned on their side, at right angles to the plates.",
    "Each ring leaves an open space in the chain. On top of the wheel, one point of the star sits in each ring, and the plates rest in the hollows between the points. So the chain cannot slip. When the wheel turns, the points push the rings and the whole chain moves.",
    "The links lie round the wheel as straight pieces, not as a smooth curve. So the chain speeds up and slows down a little as each link comes off. Turn the speed down, follow the red link, and watch the Chain readout rise and fall."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel and the two hanging ends of the chain. Here the chain is joined into a loop that hangs below the wheel, so it can go round and round. The stand, the shaft and the sizes were made up. The points were given straight sides so they clear the plates as the chain comes off.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, A = 35, B = 42, H = 12, W = 8, RW = 1.6, CNT = 18, i;
    var o = this.o = { psi: 0 };
    o.ch = P.chainLoop({ seats: 12, lengths: [A, B], count: CNT });
    var R = o.ch.radius, ch = o.ch;                                     // joint circle, about 74.4
    // star: a point in the middle of every ring (odd link), a deep V under every plate (even link); straight sides,
    // checked to stay at least 2 clear of the plates all the way round, also as the chain comes off
    var sh = new T.Shape();
    for (i = 0; i < 12; i++) {
      var r = i % 2 ? 92 : 52, an = (ch.seatAngle(i) + ch.seatAngle(i + 1)) / 2;
      if (i) sh.lineTo(r * Math.cos(an), r * Math.sin(an)); else sh.moveTo(r * Math.cos(an), r * Math.sin(an));
    }
    var sg = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false }); sg.translate(0, 0, -5);   // star z -5..5
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(new T.Mesh(sg, c.mat("wheel")));
    P.at(P.cylZ(18, 4, c.mat("wheel")), 0, 0, 7, o.wheel);                    // hub z 5..9, on the star face
    P.at(P.hoop(13, 1.2, c.mat("wheel", "dark")), 0, 0, 9.5, o.wheel);       // ring line on the hub face, lifted to z 8.3..10.7
    P.at(P.cylZ(6, 26, c.mat("wheel", "dark")), 0, 0, -1, o.wheel);         // shaft z -14..12, from the post face
    // flat link: a plate with a hole at each joint; upright link: a wire ring whose ends pass through those holes
    var ps = new T.Shape(), hr = H / 2;
    ps.absarc(-A / 2, 0, hr, Math.PI / 2, 3 * Math.PI / 2, false); ps.absarc(A / 2, 0, hr, -Math.PI / 2, Math.PI / 2, false);
    [-A / 2, A / 2].forEach(function (x) { var h = new T.Path(); h.absarc(x, 0, RW + .5, 0, 2 * Math.PI, true); ps.holes.push(h); });
    var pg = new T.ExtrudeGeometry(ps, { depth: 3, bevelEnabled: false, curveSegments: 16 }); pg.translate(0, 0, -1.5);   // plate z -1.5..1.5
    var rp = [], k = 24;
    for (i = 0; i <= k; i++) { var a1 = -Math.PI / 2 + Math.PI * i / k; rp.push([B / 2 - W + W * Math.cos(a1), W * Math.sin(a1)]); }
    for (i = 0; i <= k; i++) { var a2 = Math.PI / 2 + Math.PI * i / k; rp.push([-B / 2 + W + W * Math.cos(a2), W * Math.sin(a2)]); }
    var rg = P.strapLoop(rp, { thick: 2 * RW, width: 2 * RW, round: 1, segs: 12 }).geometry;   // ring ends at +-B/2, sides 8 off the middle
    o.chain = P.linkChain({ count: CNT, geo: pg, altGeo: rg, material: c.mat("plates"), alt: c.mat("rings"), mark: c.mat("plates", "mark"), markAt: 0 });
    scene.add(o.chain);
    // stand: post behind the wheel, base under the loop
    P.at(P.box(30, 225, 12, c.fixed), 0, -92.5, -20, scene);                 // post x -15..15, y -205..20, z -26..-14; shaft ends at z -14
    P.at(P.box(260, 10, 90, c.fixed), 0, -210, -10, scene);                  // base y -215..-205, z -55..35; post stands on y -205; chain's lowest point about -195
  },

  step: function (c, dt, S) {
    var o = this.o, ch = o.ch, i, n = ch.count;
    o.psi -= S.w * dt;                                                       // clockwise: the right-hand run goes down
    o.wheel.rotation.z = o.psi;
    ch.set(o.psi);
    for (i = 0; i < n; i++) {
      var j = (i + 1) % n, x = ch.jx[i], y = ch.jy[i], tx = ch.jx[j] - x, ty = ch.jy[j] - y;
      if (i % 2) o.chain.put(i, x + tx / 2, y + ty / 2, 0, tx, ty, 0, -ty, tx, 0);   // ring: its plane holds the chain line and the shaft direction
      else o.chain.put(i, x + tx / 2, y + ty / 2, 0, tx, ty, 0, 0, 0, 1);          // plate: in the plane of the wheel
    }
    S.set("w", (S.playing ? Math.round(S.rpm * 10) / 10 : 0) + " rpm");
    S.set("v", (Math.abs(S.w) * ch.lift / 10).toFixed(1) + " cm/s");
  }
});
