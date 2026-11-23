/* No. 263 is the side view of No. 262's machine. The whole machine is built by window.M507EccCone in
   movements/262/movement.js; this file loads it if needed and gives this page its own wording, views and opening moment. */
(function () {
  function go() {
    M507.define(window.M507EccCone({
      number: 263,
      title: "Eccentric cone and roller, side view",
      th0: Math.PI / 2,                                   // cone's offset turned towards the viewer, so it looks centred from the side, as drawn
      lede: "A screw carries a cone, fixed off centre, and winds itself slowly through a nut. A small roller pressed on the cone is turned by it. Its speed rises and falls every turn, and slowly drops as the cone moves along under it.",
      alt: "Seen from the side: a cone lying on its side with its big end to the left, on a long screw. The screw runs to the right through a nut on a pedestal. A small roller on a sprung fork rests on top of the cone near its big end.",
      how: [
        "From the side you see the screw, the cone and the nut in a row. The screw turns at a steady speed. Its thread runs through the nut, which stays still, so the screw and cone move a little to the left each turn.",
        "The roller stays in one place over the cone. So as the cone moves left, the roller touches a thinner part of it each turn. A thinner part moves slower, so the roller turns slower. Its path on the cone is a spiral, shown by the dark line, with the same spacing as the screw's thread.",
        "The cone is also fixed off centre, so it wobbles. Each turn the roller rises and falls, and its speed goes up and down. Watch the Roller reading change through each turn while it slowly drops. Try Centred to stop the wobble, then More to make it bigger."
      ],
      note: "This model is rebuilt from Brown's drawing. The fork, the rod, the spring and the post and arm that hold them were made up; Brown only says a spring or weight presses the roller down. Brown says the roller also changes direction. With the cone only a little off centre, as he draws it, the roller never turns backwards; what goes back and forth is the roller itself, rising and falling, with each fall longer than each rise. When the roller nears the small end, the model starts the run again.",
      views: { "3d": [-20, 45, 700], front: [-640, 55, 0], side: [-480, 230, 520] },
      viewLabels: { "3d": "Side", front: "End", side: "3D" },
      target: [-20, 45, 0], distance: [250, 1800]
    }));
  }
  if (window.M507EccCone) go();
  else { var s = document.createElement("script"); s.src = "movements/262/movement.js"; s.onload = go; document.body.appendChild(s); }
})();
