/* No. 295 is the plan of No. 294's machine, the cylinder escapement. The whole machine is built by window.M507Cylinder
   in movements/294/movement.js; this file loads it if needed and gives this page its own wording, views and way of standing. */
(function () {
  function go() {
    M507.define(window.M507Cylinder({
      number: 295,
      title: "Cylinder escapement, wheel close up",
      lede: "This is a cylinder escapement seen from above. Wedge-shaped teeth slip one at a time through a tube with half its wall cut away. Each tooth gives the tube a small push as it goes in and again as it comes out.",
      alt: "Seen from above, a thick half ring, the cut wall of a tube, sits in the path of a row of wedge-shaped teeth on the rim of a big wheel. One tooth is inside the half ring and the next waits outside it. A faint balance wheel and coiled spring lie over the top.",
      how: [
        "You are looking straight down the tube, which is called the cylinder. The thick half ring is its wall. The other half is cut away. A spring, not shown, tries to turn the escape wheel, so its teeth come towards the cylinder from the right. A tooth is stopped when its point meets the outside of the wall.",
        "The balance wheel turns the cylinder until the end of the wall clears the point. The tooth slides in, and its sloping back pushes the end of the wall up and round. That is the shove that keeps the balance swinging. Then the point rests against the inside of the wall. On the swing back, the other end of the wall clears the point. The tooth slides out and gives a shove the other way.",
        "The balance spring pulls the balance back to the middle, and that sets the pace. A stiff spring makes the swings quicker, so the teeth pass faster. Try Soft, then Stiff, and watch the red tooth."
      ],
      note: "This model is rebuilt from Brown's drawing and description. Brown draws the cylinder in several positions at once, with dotted lines. Here it is shown once and it moves. The balance wheel, the balance spring and the top of the cylinder are drawn faint so you can see the teeth below them. Pick one to see it solid. The arrow in Brown's drawing points the other way from the wheel here, because teeth of this shape only work when their low points lead. The rim, arms and posts of the wheel, the balance, the balance spring, the plate and the sizes were made up. The rubbing that keeps the swing steady is a simple guess.",
      ghostTop: true,
      views: { "3d": [-71, -50, 186], front: [-5, -8, 200], side: [420, -60, 60] },
      target: [-5, -8, 43], distance: [100, 1800],
      opacity: function (key, S) { return ((key !== "balance" && key !== "spring") || S.iso === key) ? 1 : .12; }
    }));
  }
  if (window.M507Cylinder) go();
  else { var s = document.createElement("script"); s.src = "/movements/294/movement.js"; s.onload = go; document.body.appendChild(s); }
})();
