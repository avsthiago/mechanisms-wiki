/* mechanisms.wiki: page shell and 3D runtime shared by every movement.
   One page, routed by path: / lists the movements, /brown/53 shows No. 53, /brown/index Brown's index, /about the About page.
   The host serves index.html for every path that is not a file (Cloudflare Pages does; locally use scripts/serve.py).
   A movement file calls M507.define({...}); see CLAUDE.md for the contract. */
(function () {
  "use strict";
  var M = window.M507 = {}, defs = {}, pending = 0, current = null;
  var THUMB = /[?&]thumb\b/.test(location.search);      // scripts/thumbs.py: draw the model on a see-through background
  var popped = false, homeKey = "", homeY = { key: null, y: 0 };   // so Back returns to the same place in the contents
  window.addEventListener("popstate", function () { popped = true; route(); });
  function pad(n) { return ("00" + n).slice(-3); }
  /** Addresses. Brown's movements live under /brown/; another book would get its own prefix. */
  function mPath(n) { return "/brown/" + n; }
  var INDEX_PATH = "/brown/index", ABOUT_PATH = "/about";
  /** The 3D library, the camera controls and the parts library are only needed to show a movement, so the
      contents page does not wait for them. They download together and run in order; cb runs once they have. */
  var libsWaiting = null, routeTok = 0;
  function need3d(cb) {
    if (window.THREE && window.THREE.OrbitControls && window.M507Parts) return cb();
    if (libsWaiting) return void libsWaiting.push(cb);
    libsWaiting = [cb];
    var files = ["/vendor/three.min.js", "/vendor/OrbitControls.js", "/engine/parts.js"], left = files.length;
    function done() { if (--left) return; var q = libsWaiting; libsWaiting = null; q.forEach(function (f) { f(); }); }
    files.forEach(function (f) { var s = document.createElement("script"); s.src = f; s.async = false; s.onload = s.onerror = done; document.head.appendChild(s); });
  }
  /** Go to a path inside the site without reloading the page. */
  function go(path, replace) {
    if (path !== location.pathname + location.search) { try { history[replace ? "replaceState" : "pushState"](null, "", path); } catch (e) { location.href = path; return; } }
    route();
  }
  // links inside the site are handled here, so the page and its 3D library load once
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a[href^='/']");
    if (!a || a.target || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault(); go(a.getAttribute("href"));
  });
  function list() { return (window.MOVEMENTS || []).slice().sort(function (a, b) { return a.n - b.n; }); }
  function entry(n) { return list().filter(function (m) { return m.n === n; })[0]; }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag), k;
    for (k in attrs || {}) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function app() { return document.getElementById("app"); }
  function icon(path, size) { var sp = document.createElement("span"); sp.setAttribute("aria-hidden", "true"); sp.innerHTML = '<svg width="' + (size || 22) + '" height="' + (size || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>"; return sp; }
  var IC = { search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.500 4.500"/>', home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>', left: '<path d="m15 5-7 7 7 7"/>', right: '<path d="m9 5 7 7-7 7"/>', up: '<path d="m5 15 7-7 7 7"/>', pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>', play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300 7 7M17 17l1.700 1.700M5.300 18.700 7 17M17 7l1.700-1.700"/>', moon: '<path d="M20 14.500A8 8 0 0 1 9.500 4a7 7 0 1 0 10.500 10.500z"/>', shuffle: '<path d="M3 7h3.200c1.700 0 3 .8 3.900 2.200l3.800 5.600c.9 1.400 2.200 2.200 3.900 2.200H21"/><path d="M3 17h3.200c1.300 0 2.400-.5 3.200-1.400"/><path d="M14.400 8.400c.8-.9 1.900-1.400 3.200-1.400H21"/><path d="m18 4 3 3-3 3"/><path d="m18 14 3 3-3 3"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4.5 4.5v4.6h4.6"/>', layers: '<path d="M12 4 3 8.5l9 4.5 9-4.5z"/><path d="m3 13.5 9 4.5 9-4.5"/>', sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>' };
  // Light or dark, chosen in the menu and remembered on this device. Light is the default.
  function look() { return document.documentElement.getAttribute("data-look") === "dark" ? "dark" : "light"; }
  function setLook(v) {
    if (v === "dark") document.documentElement.setAttribute("data-look", "dark"); else document.documentElement.removeAttribute("data-look");
    try { localStorage.setItem("mw-look", v); } catch (e) { /* not remembered, still applied */ }
  }
  try { if (localStorage.getItem("mw-look") === "dark") setLook("dark"); } catch (e) { /* storage unavailable */ }
  function topStrip(n, title, isHome) {
    var site = window.SITE || { menu: [] };
    var btn = h("button", { "class": "menu-btn", type: "button", "aria-label": "Menu", "aria-expanded": "false", "aria-controls": "site-menu" }, [icon(IC.menu, 24)]);
    var links = site.menu.map(function (m) {
      if (!m.href) return h("span", { "class": "off", title: "Link not set yet", text: m.label });
      var ext = /^https?:/.test(m.href);
      return h("a", { href: m.href, target: ext ? "_blank" : null, rel: ext ? "noopener" : null, text: m.label });
    });
    // the light/dark switch is an icon only, always in view beside the menu
    var themeBtn = h("button", { "class": "theme-btn", type: "button", id: "theme" });
    function paintTheme() { var d = look() === "dark", t = d ? "Light theme" : "Dark theme"; themeBtn.textContent = ""; themeBtn.appendChild(icon(d ? IC.sun : IC.moon, 20)); themeBtn.setAttribute("aria-label", t); themeBtn.title = t; }
    themeBtn.addEventListener("click", function () { setLook(look() === "dark" ? "light" : "dark"); paintTheme(); });
    paintTheme();
    var header = h("header", { "class": "top" }, [
      isHome ? h("span") : h("a", { "class": "tophome", href: "/", "aria-label": "Home: all mechanisms" }, [icon(IC.home, 24)]),
      h("a", { "class": "brand", href: "/", "aria-label": "mechanisms.wiki, home" }, [h("b", { text: "mechanisms" }), h("span", { text: ".wiki" })]),
      h("div", { "class": "right" }, [h("nav", { "class": "site-menu", id: "site-menu", "aria-label": "Site" }, links), themeBtn, btn])]);
    btn.addEventListener("click", function (ev) { ev.stopPropagation(); var o = header.classList.toggle("open"); btn.setAttribute("aria-expanded", String(o)); });
    return header;
  }
  document.addEventListener("click", function (ev) {
    var t = document.querySelector(".top.open");
    if (t && !(ev.target.closest && ev.target.closest(".site-menu .off"))) { t.classList.remove("open"); var b = t.querySelector(".menu-btn"); if (b) b.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { var t = document.querySelector(".top.open"); if (t) t.classList.remove("open"); } });
  /** Nearest built movement before or after n. */
  function neighbour(n, dir) {
    var b = list().filter(function (m) { return m.built && (dir < 0 ? m.n < n : m.n > n); });
    return dir < 0 ? b[b.length - 1] : b[0];
  }
  function goLink(n, dir) {
    var m = neighbour(n, dir);
    var t = h("span", { "class": "t" }, [h("small", { text: dir < 0 ? "Previous" : "Next" }), h("b", {}, [m ? "No. " + m.n : "None yet", m ? h("span", { "class": "nm", text: m.title }) : null])]);
    return h("a", { "class": "go " + (dir < 0 ? "prev" : "next"), href: m ? mPath(m.n) : null, "aria-disabled": m ? null : "true", title: m ? m.title : null, "aria-label": m ? (dir < 0 ? "Previous: " : "Next: ") + "No. " + m.n + " " + m.title : null },
      dir < 0 ? [icon(IC.left, 26), t] : [t, icon(IC.right, 26)]);
  }

  /** Centre button of the bottom bar: jump to a random built mechanism other than the current one. */
  function randBtn(n) {
    var b = h("button", { "class": "homebtn", id: "random", type: "button", "aria-label": "Show a random mechanism", title: "Random mechanism" }, [icon(IC.shuffle, 30)]);
    b.addEventListener("click", function () {
      var pool = list().filter(function (m) { return m.built && m.n !== n; });
      if (pool.length) go(mPath(pool[Math.floor(Math.random() * pool.length)].n));
    });
    return b;
  }
  function teardown() { if (document.querySelector(".home-wrap")) homeY = { key: homeKey, y: window.scrollY }; if (current) { current(); current = null; } app().textContent = ""; window.scrollTo(0, 0); }

  function route() {
    // old addresses (#m53, #index, #about, #q=...) still work: move them to the new path first
    var old = location.hash, om = /^#m(\d+)$/.exec(old);
    if (om || old === "#index" || old === "#about" || /^#(q|f)=/.test(old)) {
      try { history.replaceState(null, "", om ? mPath(+om[1]) : old === "#index" ? INDEX_PATH : old === "#about" ? ABOUT_PATH : "/?" + old.slice(1)); } catch (e) { /* keep the old address */ }
    }
    var path = location.pathname.replace(/\/index\.html$/, "/").replace(/(.)\/$/, "$1");
    var m = /^\/brown\/(\d+)$/.exec(path), n = m ? +m[1] : 0, back = popped;
    popped = false;
    teardown();
    var tok = ++routeTok;
    if (path === ABOUT_PATH) return about();
    if (path === INDEX_PATH) return indexPage();
    if (!n) return home(back);
    var e0 = entry(n);
    if (e0 && !e0.built) return notBuilt();
    need3d(function () { if (tok === routeTok) movement(); });   // skip if the reader has gone elsewhere meanwhile
    function movement() {
    if (defs[n]) return start(defs[n]);
    pending = n;
    var s = document.createElement("script");
    s.src = "/movements/" + pad(n) + "/movement.js";
    // the host answers a missing file with the contents page, which loads but defines nothing
    s.onload = function () { if (pending === n) { pending = 0; notBuilt(); } };
    s.onerror = function () { pending = 0; notBuilt(); };
    function notBuilt() {
      var e = entry(n) || {};
      app().appendChild(topStrip(n, e.title));
      app().appendChild(h("section", { "class": "sheet" }, [h("h1", {}, [h("span", { "class": "n", text: "No. " + n }), e.title || "Not built yet"]), h("p", { "class": "lede", text: "This movement has no model yet." }), e.text ? h("blockquote", { text: e.text }) : null]));
      app().appendChild(h("nav", { "class": "bar" }, [goLink(n, -1), randBtn(n), goLink(n, 1)]));
    }
    document.body.appendChild(s);
    }
  }
  M.boot = function (first) { window.addEventListener("hashchange", function () { if (location.hash) route(); });   /* an old #m53 address typed in */ if (first && location.pathname === "/") go(mPath(first), true); else route(); };
  M.define = function (def) { if (!def.number) def.number = pending; defs[def.number] = def; if (pending === def.number) { pending = 0; start(def); } };

  function about() {
    document.title = "About | mechanisms.wiki";
    app().appendChild(topStrip(0));
    app().appendChild(h("section", { "class": "sheet" }, [
      h("h1", { text: "About" })].concat(((window.SITE || {}).about || []).map(function (t) { return h("p", { text: t }); }))));
    app().appendChild(h("nav", { "class": "bar", "aria-label": "Movements" }, [h("span"), randBtn(0), h("span")]));
  }

  /* Contents: a search box, one button per family and a card for every movement.
     The search and the family live in the address (/?q=clutch&f=gears) so Back from a movement returns to them. */
  function home(back) {
    document.title = "mechanisms.wiki";
    var all = list(), site = window.SITE || {}, built = all.filter(function (m) { return m.built; }).length, st = { q: "", f: "" };
    location.search.replace(/^\?/, "").split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p[0] === "q" || p[0] === "f") { try { st[p[0]] = decodeURIComponent(p[1] || ""); } catch (e) { /* bad address, ignore */ } }
    });
    // what the search looks through: number, name, both descriptions, the family and Brown's index terms
    var tags = {}, famName = {};
    (window.INDEX || []).forEach(function (e) { e.n.forEach(function (n) { tags[n] = (tags[n] || "") + " " + (e.of ? e.of + " " : "") + e.t; }); });
    (site.families || []).forEach(function (f) { famName[f[0]] = f[1]; });
    var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
    var cards = all.map(function (m, k) {
      var pic = h("span", { "class": "pic", "data-n": String(m.n) }, [h("span", { "class": "no", text: String(m.n) })]);   // the number sits in the picture's top-right corner, clear of the number Brown printed top-left
      function img(cls, src) {
        var i = h("img", { "class": cls, src: src, alt: "", loading: k < 6 ? "eager" : "lazy", decoding: "async" });
        i.addEventListener("error", function () {   // with one picture missing there is nothing to swap on hover; with none, the big number fills the box
          i.remove(); pic.classList.remove("has-model");
          if (!pic.querySelector("img")) pic.classList.add("bare");
        });
        return i;
      }
      if (!m.built) pic.appendChild(img("eng", "/ref/" + pad(m.n) + ".png"));
      else {
        // the engraving only shows on hover, so it is fetched on the first hover; until it arrives the model stays
        pic.classList.add("has-model"); pic.appendChild(img("model", "/thumbs/" + pad(m.n) + ".webp"));
        if (hover) pic.addEventListener("mouseenter", function () {
          if (pic.querySelector(".eng")) return;
          var e = h("img", { "class": "eng", alt: "", decoding: "async" });
          e.addEventListener("load", function () { pic.classList.add("eng-ok"); });
          e.src = "/ref/" + pad(m.n) + ".png"; pic.insertBefore(e, pic.firstChild);
        });
      }
      var li = h("li", {}, [h("a", { "class": "card" + (m.built ? "" : " todo"), href: mPath(m.n), "aria-label": "No. " + m.n + ", " + m.title + (m.built ? "" : ", not built yet"), title: m.built ? null : "Not built yet" }, [pic,
        h("span", { "class": "cap" }, [h("b", { text: m.title })])])]);
      return { m: m, li: li, hay: (m.n + " " + m.title + " " + (m.text || "") + " " + (m.summary || "") + " " + (famName[m.family] || "") + (tags[m.n] || "")).toLowerCase() };
    });
    var input = h("input", { id: "q", type: "search", placeholder: "Search: gear, pump, 53...", "aria-label": "Search the movements", autocomplete: "off" });
    input.value = st.q;
    var form = h("form", { "class": "find", role: "search" }, [icon(IC.search, 20), input]);
    var surprise = h("button", { "class": "surprise", type: "button", id: "surprise", title: "Open a random movement" }, [icon(IC.shuffle, 22), h("span", { "class": "lbl", text: "Surprise me" })]);
    surprise.addEventListener("click", function () {   // a random built movement, from the ones the search and family show
      var pool = cards.filter(function (c) { return !c.li.hidden && c.m.built; });
      if (!pool.length) pool = cards.filter(function (c) { return c.m.built; });
      if (pool.length) go(mPath(pool[Math.floor(Math.random() * pool.length)].m.n));
    });
    var used = (site.families || []).filter(function (f) { return all.some(function (m) { return m.family === f[0]; }); });
    var chips = [["", "All"]].concat(used).map(function (f) {
      var b = h("button", { type: "button", id: "fam-" + (f[0] || "all"), text: f[2] || f[1], title: f[2] && f[2] !== f[1] ? f[1] : null });
      b.addEventListener("click", function () { st.f = f[0]; apply(); });
      return { id: f[0], b: b };
    });
    var count = h("p", { "class": "count", "aria-live": "polite" });
    function apply() {
      var q = st.q.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean), num = /^\d+$/.test(q) ? q : null, shown = 0;
      cards.forEach(function (c) {
        var ok = (!st.f || c.m.family === st.f) && (num ? String(c.m.n).indexOf(num) === 0 : words.every(function (w) { return c.hay.indexOf(w) >= 0; }));
        c.li.hidden = !ok; if (ok) shown++;
      });
      chips.forEach(function (c) { c.b.setAttribute("aria-pressed", String(c.id === st.f)); });
      count.textContent = shown ? shown + (shown === 1 ? " movement" : " movements") : "Nothing matches. Try another word, or look in the index.";
      homeKey = [st.q ? "q=" + encodeURIComponent(st.q) : "", st.f ? "f=" + st.f : ""].filter(Boolean).join("&");
      if (location.search.replace(/^\?/, "") !== homeKey) { try { history.replaceState(null, "", "/" + (homeKey ? "?" + homeKey : "")); } catch (e) { /* address not updated, filter still works */ } }
    }
    input.addEventListener("input", function () { st.q = input.value; apply(); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var q = st.q.trim(), vis = cards.filter(function (c) { return !c.li.hidden; });
      if (/^\d+$/.test(q) && entry(+q)) go(mPath(+q)); else if (vis.length === 1) go(mPath(vis[0].m.n));
    });
    app().appendChild(topStrip(0, null, true));
    app().appendChild(h("div", { "class": "home-wrap" }, [
      h("h1", { text: "See how machines move" }),
      h("p", { "class": "lede" }, [all.length + " mechanisms from Henry T. Brown's 1868 book, each one a working model you can spin round, run and change. " + (built < all.length ? built + " are ready so far. " : ""), h("a", { href: INDEX_PATH, text: "Browse Brown's index" }), "."]),
      h("div", { "class": "findrow" }, [form, surprise]),
      h("div", { "class": "chips fam", role: "group", "aria-label": "Kinds of movement" }, chips.map(function (c) { return c.b; })),
      count,
      h("ul", { "class": "grid" }, cards.map(function (c) { return c.li; }))]));
    apply();
    if (back && homeY.key === homeKey) window.scrollTo(0, homeY.y);
    // fetch the 3D library as soon as the reader shows interest in a card, so the movement opens quickly
    ["mouseover", "touchstart", "focusin"].forEach(function (t) { app().addEventListener(t, function warm(ev) {
      if (!ev.target.closest || !ev.target.closest(".card")) return;
      app().removeEventListener(t, warm); need3d(function () {});
    }, { passive: true }); });
  }

  /* Brown's own index, A to Z. Each number is a link; numbers with no model yet are grey. */
  function indexPage() {
    document.title = "Index | mechanisms.wiki";
    var have = {}, letters = [], by = {};
    list().forEach(function (m) { have[m.n] = m; });
    (window.INDEX || []).forEach(function (e) {
      var L = (e.of || e.t).charAt(0).replace("Æ", "A");
      if (!by[L]) { by[L] = []; letters.push(L); }
      by[L].push(e);
    });
    var secs = letters.map(function (L) {
      return h("section", {}, [h("h2", { text: L }), h("ul", { "class": "ix" }, by[L].map(function (e) {
        return h("li", { "class": e.of ? "sub" : null }, [h("span", { "class": "term", text: e.t })].concat(e.n.map(function (n) {
          var m = have[n];
          return h("a", { href: mPath(n), "class": m && m.built ? null : "todo", title: m ? m.title : "Not built yet", text: String(n) });
        })));
      }))]);
    });
    var jump = h("div", { "class": "chips jump", role: "group", "aria-label": "Jump to a letter" }, letters.map(function (L, i) {
      var b = h("button", { type: "button", text: L, "aria-label": "Go to " + L });
      b.addEventListener("click", function () { secs[i].scrollIntoView({ behavior: "smooth", block: "start" }); });
      return b;
    }));
    app().appendChild(topStrip(0));
    app().appendChild(h("section", { "class": "sheet index" }, [
      h("h1", { text: "Index" }),
      h("p", { text: "This is the index from the back of Brown's book. The numbers are movements, not pages. Grey numbers have no model yet." }),
      jump].concat(secs)));
    app().appendChild(h("nav", { "class": "bar", "aria-label": "Movements" }, [h("span"), randBtn(0), h("span")]));
  }

  function start(def) {
    var S = {
      playing: true, rpm: (def.speed && def.speed.value) || 8, w: 0, controls: {}, iso: null,
      set: function (id, t) { var e = document.getElementById("r-" + id); if (e && e.textContent !== t) e.textContent = t; },
      setControl: function (id, v) { S.controls[id] = v; var e = document.getElementById(id); if (e && +e.value !== v) { e.value = v; e.dispatchEvent(new Event("sync")); } }
    };
    document.title = def.title + " | mechanisms.wiki";
    var e0 = entry(def.number) || {};

    // ---------- page ----------
    var view = h("div", { id: "view", role: "img", "aria-label": def.alt || def.title });
    var play = h("button", { id: "play", type: "button" });
    function setPlay(v) { S.playing = v; play.textContent = ""; play.appendChild(icon(v ? IC.pause : IC.play, 22)); play.setAttribute("aria-label", v ? "Pause the motion" : "Play the motion"); }
    setPlay(true);
    var resetBtn = h("button", { id: "reset", type: "button", "aria-label": "Reset the view, the picked part and the controls", title: "Reset", disabled: "" }, [icon(IC.reset, 22)]);
    var rpm0 = S.rpm, camMoved = false;
    play.addEventListener("click", function () { setPlay(!S.playing); });

    function slider(c, onInput) {
      var out = h("output", { "for": c.id }), inp = h("input", { id: c.id, type: "range", min: c.min, max: c.max, step: c.step || 1, value: c.value });
      var chips = (c.presets || []).map(function (p) {
        var b = h("button", { type: "button", "aria-pressed": "false", text: p[1] });
        b.addEventListener("click", function () { inp.value = p[0]; inp.dispatchEvent(new Event("input")); });
        b._v = p[0]; return b;
      });
      function sync() { out.textContent = (c.format ? c.format(+inp.value) : inp.value) + (c.unit || ""); chips.forEach(function (b) { b.setAttribute("aria-pressed", String(+inp.value === b._v)); }); }
      inp.addEventListener("input", function () { onInput(+inp.value); sync(); });
      inp.addEventListener("sync", sync); sync();
      return h("div", { "class": "row" }, [h("label", { "for": c.id }, [c.label, out]), inp, chips.length ? h("div", { "class": "opts" }, chips) : null]);
    }
    var rows = [];
    // A movement whose real machine is closed up (a cylinder, a pump barrel, a clock case) sets `closed`. The page then
    // adds one more choice: Open shows the inside, as now; Closed draws the casing solid, as you would see the machine.
    if (def.closed && !(def.controls || []).some(function (c) { return c.id === "case"; }))
      def.controls = (def.controls || []).concat([{ id: "case", label: (def.closed.label || "Casing"), value: "open", options: [["open", "Open"], ["closed", "Closed"]] }]);
    (def.controls || []).forEach(function (c) {
      S.controls[c.id] = c.value;
      if (c.type === "range") { rows.push(slider(c, function (v) { S.controls[c.id] = v; if (c.pauseOnInput) setPlay(false); })); return; }
      var btns = c.options.map(function (o) {
        var b = h("button", { id: c.id + "-" + o[0], type: "button", "aria-pressed": String(o[0] === c.value), text: o[1] });
        b.addEventListener("click", function () { S.controls[c.id] = o[0]; btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); });
        return b;
      });
      rows.push(h("div", { "class": "row" }, [h("span", { "class": "lab", text: c.label }), h("div", { "class": "opts", role: "group", "aria-label": c.label }, btns)]));
    });
    if (def.speed !== false) {
      var sp = def.speed || {};
      rows.push(slider({ id: "speed", label: sp.label || "Speed", min: sp.min || 1, max: sp.max || 30, value: S.rpm, unit: sp.unit === undefined ? " rpm" : sp.unit }, function (v) { S.rpm = v; }));
    }

    // Every page has the same four views, opening on 3D. Views a movement leaves out are made by looking at the target
    // from straight in front, above or to the right, as far away as its 3D view.
    var VN = ["3d", "front", "top", "side"], VL = { "3d": "3D view", front: "Front view", top: "Top view", side: "Side view" };
    (function () {
      var T = def.target || [0, 0, 0], v = def.views, any = v["3d"] || v.front || v.side || v.top;
      var d = Math.hypot(any[0] - T[0], any[1] - T[1], any[2] - T[2]) || 600;
      if (!v["3d"]) v["3d"] = [T[0] + d * .5, T[1] + d * .35, T[2] + d * .8];
      if (!v.front) v.front = [T[0], T[1], T[2] + d];
      if (!v.top) v.top = [T[0], T[1] + d, T[2] + .001];
      if (!v.side) v.side = [T[0] + d, T[1], T[2]];
    })();
    // Cube icons: the face that view looks at is filled; the 3D icon fills all three.
    var FACES = { top: "M12 3 20 7.5 12 12 4 7.5Z", front: "M4 7.5 12 12 12 21 4 16.5Z", side: "M12 12 20 7.5 20 16.5 12 21Z" };
    function cubeIcon(n) {
      var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("width", "22"); svg.setAttribute("height", "22"); svg.setAttribute("aria-hidden", "true");
      ["top", "front", "side"].forEach(function (f) {
        var pth = document.createElementNS(NS, "path"); pth.setAttribute("d", FACES[f]);
        pth.setAttribute("fill", "currentColor"); pth.setAttribute("fill-opacity", n === "3d" ? ({ top: ".75", front: ".45", side: ".25" })[f] : (f === n ? ".85" : "0"));
        pth.setAttribute("stroke", "currentColor"); pth.setAttribute("stroke-width", "1.4"); pth.setAttribute("stroke-linejoin", "round");
        svg.appendChild(pth);
      });
      return svg;
    }
    var vbtns = VN.map(function (n, i) {
      var lab = (def.viewLabels && def.viewLabels[n]) || VL[n];
      return h("button", { id: "v-" + n, type: "button", "aria-pressed": String(i === 0), "aria-label": lab, title: lab }, [cubeIcon(n)]);
    });
    var HINT = "Tap a part to pick it out in the model.";
    var cap = h("p", { "class": "cap", id: "cap", "aria-live": "polite", text: HINT });
    var pbtns = def.parts.map(function (p) {
      return h("button", { type: "button", id: "part-" + p.key, "data-k": p.key, "aria-pressed": "false" }, [h("span", { "class": "dot", style: "background:" + (/^#e8e2d0$/i.test(p.color || "") ? "#B8975A" : (p.color || "#8A94A0")) }), p.name]);
    });
    pbtns.forEach(function (b, i) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") !== "true", p = def.parts[i];
        pbtns.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        if (on) { b.setAttribute("aria-pressed", "true"); S.iso = p.key; cap.textContent = ""; cap.appendChild(h("b", { text: p.name + ". " })); cap.appendChild(document.createTextNode(p.note || "")); }
        else { S.iso = null; cap.textContent = HINT; }
      });
    });

    // Parts and Controls. On a phone they are two drawers in one row above the navigation; each opens upward over the
    // text, never over the model, and only one is open at a time. On wide screens they are two sections docked under
    // the text in the side column; each opens and closes on its own and the choice is remembered on this device.
    function tab(id, ic, title) {
      var sum = h("span", { "class": "sum" }), chev = icon(IC.up, 18); chev.className = "chev";
      var b = h("button", { "class": "tab", id: "tab-" + id, type: "button", "aria-expanded": "false", "aria-controls": "panel-" + id }, [icon(ic, 22), h("span", { "class": "tx" }, [h("span", { "class": "ttl", text: title }), sum]), chev]);
      b._sum = sum; return b;
    }
    var tabParts = tab("parts", IC.layers, "Parts"), tabCtl = tab("ctl", IC.sliders, "Controls");
    var panelParts = h("div", { "class": "panel", id: "panel-parts", role: "region", "aria-labelledby": "tab-parts" }, [h("div", { "class": "chips", id: "parts", role: "group", "aria-label": "Parts" }, pbtns), cap]);
    var panelCtl = h("div", { "class": "panel", id: "panel-ctl", role: "region", "aria-labelledby": "tab-ctl" }, rows);
    var drawer = h("div", { "class": "ctl" }, [tabParts, panelParts, rows.length ? tabCtl : null, rows.length ? panelCtl : null]);
    var read = h("div", { "class": "read" });   // the text; on wide screens it scrolls on its own above the docked sections
    var wide = window.matchMedia ? window.matchMedia("(min-width:940px)") : null;
    var openWide = { parts: false, ctl: true }, openPhone = null;   // wide: the control teaches, so it starts open; parts start closed to leave the text room
    try { var sv = JSON.parse(localStorage.getItem("mw-open") || "null"); if (sv) { openWide.parts = !!sv.parts; openWide.ctl = !!sv.ctl; } } catch (e) { /* storage unavailable: use the defaults */ }
    function syncDrawer() {
      var w = !!(wide && wide.matches), op = w ? openWide.parts : openPhone === "parts", oc = w ? openWide.ctl : openPhone === "ctl";
      tabParts.setAttribute("aria-expanded", String(op)); tabCtl.setAttribute("aria-expanded", String(oc));
      panelParts.classList.toggle("open", op); panelCtl.classList.toggle("open", oc);
      if (w) read.setAttribute("tabindex", "0"); else read.removeAttribute("tabindex");   // a scrolling box must be reachable by keyboard
    }
    function openDrawer(which) {
      if (wide && wide.matches) { openWide[which] = !openWide[which]; try { localStorage.setItem("mw-open", JSON.stringify(openWide)); } catch (e) { /* not remembered, still applied */ } }
      else openPhone = openPhone === which ? null : which;
      syncDrawer();
    }
    syncDrawer();
    if (wide && wide.addEventListener) wide.addEventListener("change", syncDrawer);
    tabParts.addEventListener("click", function () { openDrawer("parts"); });
    tabCtl.addEventListener("click", function () { openDrawer("ctl"); });
    function summary() {
      var parts = [];
      (def.controls || []).forEach(function (c) {
        if (c.type === "range") parts.push(S.controls[c.id] + (c.unit || ""));
        else c.options.forEach(function (o) { if (o[0] === S.controls[c.id]) parts.push(o[1]); });
      });
      if (def.speed !== false) parts.push(S.rpm + ((def.speed && def.speed.unit !== undefined) ? def.speed.unit : " rpm"));
      var t = parts.join(", "); if (tabCtl._sum.textContent !== t) tabCtl._sum.textContent = t;
      var pt = def.parts.length + " to pick out";
      def.parts.forEach(function (p) { if (p.key === S.iso) pt = p.name; });
      if (tabParts._sum.textContent !== pt) tabParts._sum.textContent = pt;
    }
    summary();
    app().appendChild(topStrip(def.number, def.title));
    app().appendChild(h("main", { "class": "mv" }, [
      h("section", { "class": "stage", "aria-label": "3D model" }, [h("div", { "class": "canvas" }, [view,
        def.readouts ? h("dl", { "class": "hud" }, def.readouts.map(function (r) { return h("div", {}, [h("dt", { text: r.label }), h("dd", { id: "r-" + r.id, text: "–" })]); })) : null,
        h("div", { "class": "views", role: "group", "aria-label": "Camera view" }, vbtns), resetBtn, play])]),
      h("section", { "class": "sheet" }, [read, drawer])]));
    [h("h1", {}, [h("span", { "class": "n" }, [h("small", { text: "No. " }), String(def.number)]), def.title]),
      h("p", { "class": "lede", text: def.lede || "" }),
      h("h2", { text: "How it works" })].concat((def.how || []).map(function (t) { return h("p", { text: t }); }), [
      e0.text ? h("h2", { text: "In Brown's words" }) : null, figure(), e0.text ? h("blockquote", { text: e0.text }) : null,
      def.note ? h("p", { "class": "note", text: def.note }) : null]).forEach(function (k) { if (k) read.appendChild(k); });
    app().appendChild(h("nav", { "class": "bar", "aria-label": "Movements" }, [goLink(def.number, -1), randBtn(def.number), goLink(def.number, 1)]));

    // Brown's engraving, shown with his words; a tap opens it full size in a dialog (Escape or a tap closes it).
    function figure() {
      var src = "/ref/" + ("00" + def.number).slice(-3) + ".png", lab = "Brown's figure " + def.number;
      var img = h("img", { src: src, alt: "Brown's engraving for No. " + def.number + ", " + def.title, loading: "lazy" });
      var btn = h("button", { type: "button", "class": "fig-open", "aria-label": "Show " + lab + " full size" }, [img]);
      var fig = h("figure", { "class": "fig" }, [btn, h("figcaption", { text: lab })]);
      img.addEventListener("error", function () { if (fig.parentNode) fig.parentNode.removeChild(fig); });
      btn.addEventListener("click", function () {
        var big = h("img", { src: src, alt: img.alt });
        var dlg = h("dialog", { "class": "fig-dlg", "aria-label": lab }, [big, h("p", { text: lab + ". Tap anywhere or press Escape to close." })]);
        document.body.appendChild(dlg);
        dlg.addEventListener("click", function () { dlg.close(); });
        dlg.addEventListener("close", function () { if (dlg.parentNode) dlg.parentNode.removeChild(dlg); btn.focus(); });
        if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
      });
      return fig;
    }

    function keys(ev) {
      if (/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName) || ev.altKey || ev.ctrlKey || ev.metaKey || document.querySelector("dialog[open]")) return;
      var m = ev.key === "ArrowLeft" ? neighbour(def.number, -1) : ev.key === "ArrowRight" ? neighbour(def.number, 1) : null;
      if (m) go(mPath(m.n));
    }
    window.addEventListener("keydown", keys);

    // ---------- scene ----------
    var THREE = window.THREE;
    if (!THREE) { view.textContent = "The 3D library could not load. Reload the page to try again."; current = function () { window.removeEventListener("keydown", keys); if (wide && wide.removeEventListener) wide.removeEventListener("change", syncDrawer); }; return; }
    var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1, 10, 8000);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: THUMB });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    view.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, .72));
    var sun = new THREE.DirectionalLight(0xffffff, .62); sun.position.set(350, 520, 600); scene.add(sun);
    var fill = new THREE.DirectionalLight(0xffffff, .28); fill.position.set(-400, -100, -300); scene.add(fill);

    // Coloured parts with soft shading. Each part keeps its own colour; picking one fades the rest.
    var mats = [], colors = {}, VAR = { mark: "#C0392B", dark: "#2A3540", light: "#EFE7D2" };
    def.parts.forEach(function (p) { colors[p.key] = p.color || "#8A94A0"; if (/^#e8e2d0$/i.test(colors[p.key])) colors[p.key] = "#B8975A"; });   // cream parts read as white on the page; draw them a deeper sand
    var fixed = new THREE.MeshLambertMaterial({ color: 0xA9B1B8, transparent: true, opacity: .45, depthWrite: false });   // see-through supports never hide what is inside them
    // Casing drawn solid in the closed view. It sits a hair behind in depth so a part touching its face always wins.
    var solid = new THREE.MeshLambertMaterial({ color: 0x9BA4AC, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    var shells = [];
    function theme() { scene.background = THUMB ? null : new THREE.Color(css("--paper") || "#fff"); }
    var ctx = {
      THREE: THREE, scene: scene, P: window.M507Parts(THREE), fixed: fixed, ink: "#2A3540", spot: "#3F8FAE",
      // shell(obj, mode): a casing piece for the Open / Closed choice (needs `closed` in the definition). mode "both"
      // (default): drawn in c.fixed when open and solid when closed. "closed": shown only when closed (the half a cut-away
      // leaves out, a lid). "open": shown only when open (a cut-away half, water seen through a cut). Meshes in c.fixed
      // turn solid when closed; meshes in a part material keep it. Picking a part opens the casing so the part shows.
      shell: function (obj, mode) { shells.push({ o: obj, mode: mode || "both" }); return obj; },
      // fluid(obj): marks water, steam or air the movement draws itself. It is drawn as usual: hidden inside a closed
      // casing, seen where it leaves an opening. (Kept as a tag; it changes nothing on its own.)
      fluid: function (obj) { obj.userData.fluid = true; return obj; },
      mat: function (key, variant) {
        for (var i = 0; i < mats.length; i++) if (mats[i].key === key && mats[i].variant === (variant || null)) return mats[i].m;
        var m = new THREE.MeshLambertMaterial({ color: new THREE.Color(variant ? VAR[variant] : colors[key]), transparent: true, side: THREE.DoubleSide });
        mats.push({ key: key, m: m, o: 1, variant: variant || null }); return m;
      }
    };
    theme();
    var oneSided = function () {};
    def.build(ctx);
    // Part materials are two-sided so open shells (half sections, strips) show both faces. On a closed solid that
    // only lets its hidden back faces fight a neighbour's front face where two solids touch (flicker), so closed
    // solids get a one-sided twin of their material. Geometry rebuilt every frame (userData.live) stays two-sided.
    (function () {
      var seen = {};
      function closed(g) {
        if (seen[g.uuid] !== undefined) return seen[g.uuid];
        var p = g.attributes && g.attributes.position, ix = g.index, n = ix ? ix.count : (p ? p.count : 0), edges = new Map(), ok = !!p && n >= 12;
        function key(i) { var j = ix ? ix.getX(i) : i; return Math.round(p.getX(j) * 50) + "," + Math.round(p.getY(j) * 50) + "," + Math.round(p.getZ(j) * 50); }
        for (var t = 0; ok && t + 2 < n; t += 3) {
          var a = key(t), b = key(t + 1), c = key(t + 2);
          [[a, b], [b, c], [c, a]].forEach(function (e) { if (e[0] === e[1]) return; var k = e[0] < e[1] ? e[0] + "|" + e[1] : e[1] + "|" + e[0]; edges.set(k, (edges.get(k) || 0) + 1); });
        }
        if (ok) edges.forEach(function (v) { if (v % 2) ok = false; });
        return (seen[g.uuid] = ok);
      }
      // Run after build and again every frame, because some movements swap a mesh's material in step (to turn a
      // part red, say); a swap would otherwise bring back the two-sided original.
      oneSided = function () {
        scene.traverse(function (o) {
          if (!o.isMesh || o.userData.live || !o.geometry || o.material.side !== THREE.DoubleSide) return;
          for (var i = 0; i < mats.length; i++) if (mats[i].m === o.material) {
            if (!closed(o.geometry)) return;
            var e = mats[i]; if (!e.fm) { e.fm = e.m.clone(); e.fm.side = THREE.FrontSide; }
            o.material = e.fm; return;
          }
        });
      };
      oneSided();
    })();

    var ctl = new THREE.OrbitControls(cam, renderer.domElement);
    ctl.enablePan = false; ctl.enableDamping = true; ctl.dampingFactor = .12;
    ctl.minDistance = (def.distance && def.distance[0]) || 320; ctl.maxDistance = (def.distance && def.distance[1]) || 2400;
    ctl.target.fromArray(def.target || [0, 0, 0]);
    cam.position.fromArray(def.views[VN[0]]); ctl.update();
    var fly = null;
    function pressView(name) { VN.forEach(function (n, i) { vbtns[i].setAttribute("aria-pressed", String(n === name)); }); }
    VN.forEach(function (n, i) { vbtns[i].addEventListener("click", function () { fly = (function () {   // swing round the target on a sphere instead of cutting straight through the model
      var T = ctl.target, a = new THREE.Spherical().setFromVector3(cam.position.clone().sub(T)), b = new THREE.Spherical().setFromVector3(new THREE.Vector3().fromArray(def.views[n]).sub(T));
      var dth = b.theta - a.theta; while (dth > Math.PI) dth -= 2 * Math.PI; while (dth < -Math.PI) dth += 2 * Math.PI;
      return { a: a, b: b, dth: dth, t: 0 };
    })(); pressView(n); }); });
    ctl.addEventListener("start", function () { fly = null; pressView(null); camMoved = true; });
    VN.forEach(function (n, i) { if (i) vbtns[i].addEventListener("click", function () { camMoved = true; }); });
    function isDirty() {
      if (S.iso || camMoved || !S.playing || (def.speed !== false && S.rpm !== rpm0)) return true;
      return (def.controls || []).some(function (c) { return !(c.pauseOnInput && S.playing) && S.controls[c.id] !== c.value; });   // a slider the motion itself sweeps is not a change
    }
    resetBtn.addEventListener("click", function () {
      pbtns.forEach(function (b) { if (b.getAttribute("aria-pressed") === "true") b.click(); });
      (def.controls || []).forEach(function (c) {
        if (c.type === "range") { var e = document.getElementById(c.id); e.value = c.value; e.dispatchEvent(new Event("input")); }
        else document.getElementById(c.id + "-" + c.value).click();
      });
      var sp = document.getElementById("speed"); if (sp) { sp.value = rpm0; sp.dispatchEvent(new Event("input")); }
      setPlay(true); vbtns[0].click(); camMoved = false;
    });

    function resize() {
      var w = view.clientWidth, hh = view.clientHeight || w; renderer.setSize(w, hh, false); cam.aspect = w / hh;
      cam.fov = 34 * Math.min(1.7, Math.max(.95, 1.3 / cam.aspect));      // keep the model in frame on tall phone stages
      cam.updateProjectionMatrix();
    }
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(view); else window.addEventListener("resize", resize);
    resize();
    var mo = new MutationObserver(theme); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-look"] });
    var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    if (mq && mq.addEventListener) mq.addEventListener("change", theme);
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlay(false);

    var last = null, raf = 0, alive = true;
    function tick(ts) {
      if (!alive) return;
      if (last === null) last = ts;
      var dt = Math.min(.05, (ts - last) / 1000); last = ts;
      S.w = S.playing ? S.rpm * 2 * Math.PI / 60 : 0;
      def.step(ctx, dt, S); summary();
      if (shells.length) {
        var shut = S.controls["case"] === "closed" && !S.iso;
        shells.forEach(function (sh) {
          sh.o.traverse(function (m) {
            if (sh.mode === "closed") m.visible = shut; else if (sh.mode === "open") m.visible = !shut;
            if (m.isMesh && (m.material === fixed || m.material === solid)) m.material = shut ? solid : fixed;
          });
        });
      }
      var dirty = isDirty(); if (resetBtn.disabled === dirty) resetBtn.disabled = !dirty;
      mats.forEach(function (e) {
        var picked = S.iso === e.key, t = (S.iso && !picked) ? .1 : 1, extra = def.opacity ? def.opacity(e.key, S) : 1;
        t *= (extra === undefined ? 1 : extra);
        var k = Math.min(1, dt * 9);
        e.o += (t - e.o) * k; e.m.opacity = e.o; e.m.depthWrite = e.o > .6;
        e.m.transparent = e.o < .999;   // solid parts draw in the solid pass, so sorting against see-through parts cannot make them blink
        if (e.fm) { e.fm.opacity = e.m.opacity; e.fm.depthWrite = e.m.depthWrite; e.fm.transparent = e.m.transparent; }
      });
      if (fly) {
        fly.t = Math.min(1, fly.t + dt / .9);
        var q = fly.t < .5 ? 4 * fly.t * fly.t * fly.t : 1 - Math.pow(-2 * fly.t + 2, 3) / 2;   // ease in and out
        var sp = new THREE.Spherical(fly.a.radius + (fly.b.radius - fly.a.radius) * q, fly.a.phi + (fly.b.phi - fly.a.phi) * q, fly.a.theta + fly.dth * q);
        sp.makeSafe(); cam.position.setFromSpherical(sp).add(ctl.target);
        if (fly.t >= 1) fly = null;
      }
      oneSided(); ctl.update(); renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    current = function () {
      alive = false; cancelAnimationFrame(raf); window.removeEventListener("keydown", keys);
      if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
      mo.disconnect(); if (mq && mq.removeEventListener) mq.removeEventListener("change", theme);
      if (wide && wide.removeEventListener) wide.removeEventListener("change", syncDrawer);
      ctl.dispose(); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss();
    };
  }
})();
