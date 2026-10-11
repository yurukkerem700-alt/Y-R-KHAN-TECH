/* Yörükhan Tech — kapak sahneleri (sadece masaüstü, html.fx)
   Kaydırma ilerledikçe: okyanus + yunuslar -> dağlar -> çift başlı Anadolu kartalı
   -> teknoloji sahneleri (oyun, web, uygulama, yapay zekâ) -> final. */
(function () {
  "use strict";
  var root = document.documentElement;
  var pin = document.querySelector(".hero-pin");
  if (!root.classList.contains("fx") || !pin) return;

  var NS = "http://www.w3.org/2000/svg";
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  function S(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function H(cls, html, parent) {
    var d = document.createElement("div"); d.className = cls; if (html) d.innerHTML = html;
    if (parent) parent.appendChild(d); return d;
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function svg(parent, extra) {
    var s = S("svg", { viewBox: "0 0 1600 900", preserveAspectRatio: "xMidYMid slice", class: "hs-svg" }, parent);
    return s;
  }
  function grad(defs, id, stops, x2, y2, extra) {
    var g = S("linearGradient", Object.assign({ id: id, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, extra || {}), defs);
    stops.forEach(function (s) { S("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, g); });
    return g;
  }
  function rgrad(defs, id, stops) {
    var g = S("radialGradient", { id: id }, defs);
    stops.forEach(function (s) { S("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, g); });
    return g;
  }

  var ICON = {
    game: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4M16 11.5h.01M18.5 13.5h.01"/></svg>',
    web: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3 3 3 16.5 0 19M12 2.5c-3 3-3 16.5 0 19"/></svg>',
    app: '<svg viewBox="0 0 24 24"><rect x="6.5" y="2" width="11" height="20" rx="2.5"/><path d="M11 18.5h2"/></svg>',
    ai: '<svg viewBox="0 0 24 24"><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V4a3 3 0 0 0-3 0zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/></svg>'
  };

  /* ---------- sahne iskeleti ---------- */
  var hs = H("hs", "", pin);
  var scenes = [];
  function addScene(id, label, a, b, build) {
    var el = H("hs-scene hs-" + id, "", hs);
    var sc = { id: id, label: label, a: a, b: b, el: el, on: false };
    build(sc, el);
    scenes.push(sc);
    return sc;
  }
  function caption(parent, kicker, title, text, cls, icon) {
    return H("cap " + (cls || ""), "<small>" + kicker + "</small><h2>" + (icon ? '<i class="h-ic">' + icon + "</i>" : "") + title + "</h2>" + (text ? "<p>" + text + "</p>" : ""), parent);
  }
  var flash = H("hs-flash", "", hs);
  var hud = H("hs-hud", "<b></b><span></span>", pin);
  var rail = H("rail2", "", pin);

  /* =========================================================
     1) OKYANUS + YUNUSLAR
     ========================================================= */
  var DOLPHIN = {
    body: "M110 8 C104 4 94 0 84 -6 C80 -16 70 -26 56 -30 C34 -40 4 -44 -26 -36 C-58 -28 -90 -10 -116 10 C-126 -4 -140 -18 -156 -22 C-150 -12 -142 0 -134 10 C-142 16 -150 30 -156 40 C-138 36 -126 28 -116 18 C-84 36 -40 46 6 42 C40 38 70 28 88 14 C96 12 104 12 110 8 Z",
    fin: "M-14 -38 C-6 -62 10 -76 26 -78 C20 -64 22 -50 30 -38 Z",
    flip: "M44 28 C58 48 52 64 34 74 C36 58 30 44 22 36 Z"
  };
  addScene("ocean", "OKYANUS", 0.09, 0.30, function (sc, el) {
    var s = svg(el), defs = S("defs", {}, s);
    grad(defs, "oSky", [[0, "#050929"], [.55, "#2b1b6c"], [.86, "#b84c8c"], [1, "#ffa066"]]);
    grad(defs, "oSea", [[0, "#34307f"], [.25, "#171a5a"], [1, "#050720"]]);
    grad(defs, "oRefl", [[0, "#ffd9a0", .95], [.5, "#ff9a5e", .45], [1, "#ff7a4d", 0]]);
    grad(defs, "oWave", [[0, "#5a6fe0", .35], [.5, "#ffd7a0", 1], [1, "#5a6fe0", .35]], 1, 0, { gradientUnits: "userSpaceOnUse", x1: 0, x2: 1600, y1: 0, y2: 0 });
    rgrad(defs, "oGlow", [[0, "#ffb070", .85], [.35, "#ff6f6f", .35], [1, "#8b5cf6", 0]]);
    var blur = S("filter", { id: "oBlur", x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs); S("feGaussianBlur", { stdDeviation: 22 }, blur);
    S("rect", { width: 1600, height: 560, fill: "url(#oSky)" }, s);
    var r = rng(7), stars = S("g", {}, s);
    for (var i = 0; i < 70; i++) S("circle", { cx: r() * 1600, cy: r() * 330, r: r() * 1.5 + .4, fill: "#fff", opacity: r() * .8 + .2 }, stars);
    sc.glow = S("circle", { cx: 800, cy: 560, r: 480, fill: "url(#oGlow)" }, s);
    sc.sun = S("circle", { cx: 800, cy: 560, r: 74, fill: "#ffe8b8" }, s);
    sc.clouds = S("g", { filter: "url(#oBlur)" }, s);
    [[260, 300, 260, 34, .22], [1250, 250, 300, 38, .2], [800, 380, 360, 30, .16], [1450, 420, 220, 26, .22]].forEach(function (c) {
      S("ellipse", { cx: c[0], cy: c[1], rx: c[2], ry: c[3], fill: "#ff9fd0", opacity: c[4] }, sc.clouds);
    });
    S("rect", { y: 559, width: 1600, height: 341, fill: "url(#oSea)" }, s);
    S("polygon", { points: "770,560 830,560 1080,900 520,900", fill: "url(#oRefl)", opacity: .75 }, s);
    sc.waves = [];
    for (var w = 0; w < 18; w++) sc.waves.push(S("path", { fill: "none", stroke: "url(#oWave)", "stroke-linecap": "round" }, s));
    sc.dol = [];
    [{ x0: 250, x1: 640, y: 660, h: 250, sc: .95, a: .16, b: .42 },
     { x0: 760, x1: 1210, y: 700, h: 330, sc: 1.3, a: .36, b: .68 },
     { x0: 1130, x1: 1500, y: 640, h: 220, sc: .8, a: .62, b: .9 }].forEach(function (c) {
      var g = S("g", {}, s);
      var splash = S("g", {}, s);
      var ringA = S("ellipse", { fill: "none", stroke: "#ffe0b8", "stroke-width": 3 }, splash);
      var ringB = S("ellipse", { fill: "none", stroke: "#ffe0b8", "stroke-width": 3 }, splash);
      var drops = []; for (var d = 0; d < 9; d++) drops.push(S("circle", { r: 4, fill: "#ffe8c8" }, splash));
      var dg = S("g", {}, g);
      S("path", { d: DOLPHIN.body, fill: "#0a0e35", stroke: "#ffb07a", "stroke-width": 2.2, "stroke-linejoin": "round" }, dg);
      S("path", { d: DOLPHIN.fin, fill: "#0a0e35", stroke: "#ffb07a", "stroke-width": 2, "stroke-linejoin": "round" }, dg);
      S("path", { d: DOLPHIN.flip, fill: "#0a0e35", stroke: "#ffb07a", "stroke-width": 2, "stroke-linejoin": "round" }, dg);
      S("circle", { cx: 82, cy: -3, r: 2.6, fill: "#ffd9a8" }, dg);S("path", { d: "M110 8 C98 14 90 14 82 12", fill: "none", stroke: "#ffb07a", "stroke-width": 1.4, opacity: .8 }, dg);
      sc.dol.push({ c: c, g: g, ringA: ringA, ringB: ringB, drops: drops, seed: rng(c.x0) });
    });
    sc.cap = caption(el, "HAYAL ET", "Ufkun ötesine", "Fikirler önce hayal edilir. Yolculuk buradan başlar.", "cap-bottom");
  });
  var OCEAN = scenes[0];
  OCEAN.update = function (t, time) {
    var sc = OCEAN;
    var set = lerp(0, 18, smooth(.0, 1, t));
    sc.sun.setAttribute("cy", 560 + set);
    sc.glow.setAttribute("cy", 560 + set);
    sc.clouds.setAttribute("transform", "translate(" + (-t * 180) + ",0)");
    var cam = t * 3.2 + time * .05;
    for (var i = 0; i < sc.waves.length; i++) {
      var u = ((i / sc.waves.length) + cam) % 1; if (u < 0) u += 1;
      var y = 560 + 345 * Math.pow(u, 2.1);
      var amp = 2 + 30 * u * u, wl = 80 + 300 * u, ph = i * 1.9 + time * (.4 + u);
      var d = "M-60 " + y.toFixed(1);
      for (var x = -60; x <= 1700; x += 28) d += " L" + x + " " + (y + amp * Math.sin(x / wl * 6.283 + ph)).toFixed(1);
      sc.waves[i].setAttribute("d", d);
      sc.waves[i].setAttribute("stroke-width", (.7 + 3.4 * u).toFixed(2));
      sc.waves[i].setAttribute("opacity", Math.min(1, u * 4).toFixed(2));
    }
    sc.dol.forEach(function (D) {
      var c = D.c, u = (t - c.a) / (c.b - c.a), vis = u > -.05 && u < 1.12;
      D.g.style.display = vis ? "" : "none";
      var inJump = u >= 0 && u <= 1;
      if (inJump) {
        var x = lerp(c.x0, c.x1, u), arc = 4 * u * (1 - u), y = c.y - c.h * arc;
        var dx = c.x1 - c.x0, dy = -c.h * 4 * (1 - 2 * u);
        var ang = Math.atan2(dy, dx) * 180 / Math.PI;
        D.g.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ") scale(" + c.sc + ")");
        D.g.style.opacity = 1;
      } else D.g.style.opacity = 0;
      /* sıçrama halkaları ve damlalar */
      [[D.ringA, c.x0, -.02, .28], [D.ringB, c.x1, .96, 1.16]].forEach(function (R) {
        var k = clamp((u - R[2]) / (R[3] - R[2]), 0, 1);
        var on = u > R[2] && u < R[3] + .05;
        R[0].setAttribute("cx", R[1]); R[0].setAttribute("cy", c.y + 6);
        R[0].setAttribute("rx", (20 + 150 * k) * c.sc); R[0].setAttribute("ry", (5 + 26 * k) * c.sc);
        R[0].setAttribute("opacity", on ? (1 - k).toFixed(2) : 0);
      });
      D.drops.forEach(function (dp, i) {
        var exit = i % 2 === 0, base = exit ? -.02 : .94, k = (u - base) / .24;
        if (k < 0 || k > 1) { dp.setAttribute("opacity", 0); return; }
        var ang = (i / 9) * 3.14 + .2, sp = 70 + (i * 23) % 70;
        var px = (exit ? c.x0 : c.x1) + Math.cos(ang) * sp * k * (exit ? 1 : -1) * c.sc;
        var py = c.y - Math.sin(ang) * sp * 1.3 * k * c.sc + 260 * k * k * c.sc;
        dp.setAttribute("cx", px.toFixed(1)); dp.setAttribute("cy", py.toFixed(1));
        dp.setAttribute("opacity", (1 - k).toFixed(2)); dp.setAttribute("r", (4 * (1 - k * .5) * c.sc).toFixed(1));
      });
    });
  };

  /* =========================================================
     2) DAĞLAR
     ========================================================= */
  function ridge(seed, w, base, amp, rough) {
    var r = rng(seed), n = 256, p = new Array(n + 1);
    p[0] = r() * .5; p[n] = r() * .5;
    (function split(a, b, off) {
      if (b - a < 2) return;
      var m = (a + b) >> 1; p[m] = (p[a] + p[b]) / 2 + (r() - .5) * off;
      split(a, m, off * rough); split(m, b, off * rough);
    })(0, n, 1);
    var mn = Math.min.apply(null, p), mx = Math.max.apply(null, p), d = "M0 1200 L0 " + base;
    for (var i = 0; i <= n; i++) d += " L" + (i / n * w).toFixed(1) + " " + (base - ((p[i] - mn) / (mx - mn)) * amp).toFixed(1);
    return d + " L" + w + " 1200 Z";
  }
  addScene("mountains", "DAĞLAR", 0.28, 0.6, function (sc, el) {
    var s = svg(el), defs = S("defs", {}, s);
    grad(defs, "mSky", [[0, "#060a2b"], [.5, "#2c1d70"], [.82, "#a4468f"], [1, "#ff9468"]]);
    rgrad(defs, "mGlow", [[0, "#ffc58a", .9], [.4, "#ff7a8a", .35], [1, "#7c4dff", 0]]);
    var cfg = [{ base: 640, amp: 190, rough: .52, seed: 3, shift: 160, grow: .06, snow: "#ffffff", c: ["#9a8cf0", "#6a5cc4"] },
               { base: 700, amp: 250, rough: .54, seed: 8, shift: 330, grow: .14, snow: "#ece8ff", c: ["#7c6cd6", "#4c3fa0"] },
               { base: 780, amp: 320, rough: .55, seed: 21, shift: 560, grow: .26, snow: "#b9bfff", c: ["#51459f", "#2b2370"] },
               { base: 860, amp: 380, rough: .56, seed: 34, shift: 880, grow: .42, snow: "#7d88e8", c: ["#2c2676", "#141242"] },
               { base: 940, amp: 420, rough: .58, seed: 55, shift: 1300, grow: .7, snow: "#4a52b8", c: ["#14123e", "#070920"] }];
    cfg.forEach(function (c, i) {
      var g = S("linearGradient", { id: "mC" + i, gradientUnits: "userSpaceOnUse", x1: 0, x2: 0, y1: c.base - c.amp, y2: c.base + 80 }, defs);
      [[0, c.snow], [.1, c.snow], [.3, c.c[0]], [1, c.c[1]]].forEach(function (st) { S("stop", { offset: st[0], "stop-color": st[1] }, g); });
    });
    S("rect", { width: 1600, height: 900, fill: "url(#mSky)" }, s);
    var r = rng(11), stars = S("g", {}, s);
    for (var i = 0; i < 80; i++) S("circle", { cx: r() * 1600, cy: r() * 360, r: r() * 1.4 + .3, fill: "#fff", opacity: r() * .7 + .2 }, stars);
    sc.glow = S("circle", { cx: 800, cy: 640, r: 560, fill: "url(#mGlow)" }, s);
    sc.layers = [];
    cfg.forEach(function (c, i) {
      var g = S("g", {}, s);
      var inner = S("path", { d: ridge(c.seed, 3000, c.base, c.amp, c.rough), fill: "url(#mC" + i + ")", transform: "translate(-700,0)" }, g);
      sc.layers.push({ g: g, c: c });
    });
    sc.mist = [];
    for (var m = 0; m < 3; m++) sc.mist.push(S("rect", { x: -200, y: 520 + m * 90, width: 2000, height: 120, fill: "#ffd0e8", opacity: .08 + m * .02, filter: "url(#oBlurM)" }, s));
    var bf = S("filter", { id: "oBlurM", x: "-10%", y: "-100%", width: "120%", height: "300%" }, defs); S("feGaussianBlur", { stdDeviation: 28 }, bf);
    sc.cap = caption(el, "İNŞA ET", "Zirvelerden geç", "Her zirve, bir öncekinin üzerine inşa edilir.", "cap-bottom");
  });
  var MOUNT = scenes[1];
  MOUNT.update = function (t, time) {
    var sc = MOUNT, rise = 1 - smooth(0, .22, t);
    sc.glow.setAttribute("cy", 640 + t * 120);
    sc.glow.setAttribute("opacity", (1 - t * .7).toFixed(2));
    sc.layers.forEach(function (L, i) {
      var c = L.c, sx = -t * c.shift * (i % 2 ? 1 : -1);
      var sy = rise * (260 + i * 90);
      var scl = 1 + t * c.grow;
      L.g.setAttribute("transform", "translate(" + (sx).toFixed(1) + "," + (sy).toFixed(1) + ") translate(800,860) scale(" + scl.toFixed(3) + ") translate(-800,-860)");
    });
    sc.cap.style.opacity = (smooth(0.0, .1, t) * (1 - smooth(.36, .5, t))).toFixed(3);
    sc.mist.forEach(function (m, i) { m.setAttribute("x", -200 + Math.sin(time * .2 + i) * 80 - t * 200 * (i + 1)); });
  };

  /* =========================================================
     3) ÇİFT BAŞLI ANADOLU KARTALI
     ========================================================= */
  function eagleHalf(g, idPrefix) {
    /* sol yarı; sağ yarı ayna */
    var wing = S("g", { class: "wing" }, g);
    var tips = [[-214, -6], [-212, 30], [-198, 64], [-178, 94], [-152, 120], [-122, 142], [-90, 158], [-56, 164]];
    var d = "M-24 98 C-56 58 -120 16 -214 -6";
    for (var i = 0; i < tips.length - 1; i++) {
      var a = tips[i], b = tips[i + 1];
      var nx = (a[0] + b[0]) / 2 + 20, ny = (a[1] + b[1]) / 2 - 14;
      d += " Q" + (a[0] + 10) + " " + (a[1] + 20) + " " + nx.toFixed(1) + " " + ny.toFixed(1) + " Q" + (b[0] - 6) + " " + (b[1] - 8) + " " + b[0] + " " + b[1];
    }
    d += " L-30 150 Z";
    S("path", { d: d, fill: "url(#" + idPrefix + "W)", stroke: "url(#" + idPrefix + "S)", "stroke-width": 3, "stroke-linejoin": "round" }, wing);
    tips.forEach(function (t) { S("path", { d: "M-26 104 Q" + ((t[0] - 26) / 2 - 10) + " " + ((t[1] + 104) / 2 - 18) + " " + (t[0] + 18) + " " + (t[1] + 4), fill: "none", stroke: "#bfe9ff", "stroke-opacity": .35, "stroke-width": 1.6 }, wing); });
    wing.style.transformOrigin = "-26px 100px";
    var head = S("g", {}, g);
    S("path", { d: "M-8 96 C-18 82 -26 66 -30 54 C-32 44 -34 34 -42 28 C-50 22 -62 20 -72 24 C-76 26 -80 30 -84 34 C-96 36 -108 44 -110 58 C-110 66 -106 72 -100 72 C-100 64 -96 58 -88 56 L-76 54 C-70 58 -62 62 -58 68 C-50 78 -40 90 -30 104 Z", fill: "url(#" + idPrefix + "W)", stroke: "url(#" + idPrefix + "S)", "stroke-width": 3, "stroke-linejoin": "round" }, head);
    S("path", { d: "M-84 34 C-96 36 -108 44 -110 58 C-110 66 -106 72 -100 72 C-100 64 -96 58 -88 56 L-76 54 Z", fill: "#ffd37a", stroke: "#fff3c4", "stroke-width": 1.5, "stroke-linejoin": "round" }, head);
    S("path", { d: "M-78 28 L-54 38", stroke: "#0a1240", "stroke-width": 4, "stroke-linecap": "round" }, head);
    S("circle", { cx: -64, cy: 40, r: 4, fill: "#ffffff" }, head);
    S("circle", { cx: -65, cy: 40, r: 1.8, fill: "#0a1240" }, head);
    S("path", { d: "M-34 50 C-40 62 -42 76 -38 90 M-46 56 C-50 66 -50 78 -46 88 M-22 62 C-26 74 -26 86 -22 96", fill: "none", stroke: "#bfe9ff", "stroke-opacity": .45, "stroke-width": 1.6 }, head);
    var leg = S("g", { fill: "none", stroke: "url(#" + idPrefix + "S)", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    S("path", { d: "M-16 176 C-34 196 -46 214 -50 232 M-50 232 L-72 252 M-50 232 L-54 262 M-50 232 L-34 256" }, leg);
    return wing;
  }
  addScene("eagle", "ANADOLU", 0.455, 0.615, function (sc, el) {
    var s = svg(el), defs = S("defs", {}, s);
    grad(defs, "eW", [[0, "#7fe9ff", .95], [.5, "#3b82f6", .9], [1, "#8b5cf6", .95]], 1, 1);
    grad(defs, "eS", [[0, "#e6fbff"], [1, "#a5b4ff"]], 1, 1);
    rgrad(defs, "eGlow", [[0, "#7fe9ff", .75], [.45, "#3b82f6", .3], [1, "#8b5cf6", 0]]);
    sc.glow = S("circle", { cx: 800, cy: 450, r: 520, fill: "url(#eGlow)" }, s);
    sc.rings = S("g", { fill: "none", stroke: "#7fe9ff", "stroke-opacity": .35, "stroke-width": 2 }, s);
    for (var i = 0; i < 3; i++) S("circle", { cx: 800, cy: 450, r: 300 + i * 120 }, sc.rings);
    sc.eagle = S("g", {}, s);
    var half = S("g", {}, sc.eagle), mir = S("g", { transform: "scale(-1,1)" }, sc.eagle);
    sc.wL = eagleHalf(half, "e"); sc.wR = eagleHalf(mir, "e");
    var body = S("g", {}, sc.eagle);
    S("path", { d: "M-30 96 C-36 132 -26 170 -10 198 L0 216 L10 198 C26 170 36 132 30 96 C16 106 -16 106 -30 96 Z", fill: "url(#eW)", stroke: "url(#eS)", "stroke-width": 3, "stroke-linejoin": "round" }, body);
    for (var k = 0; k < 5; k++) {
      var a = (k - 2) * 15 * Math.PI / 180, L = 96 + (2 - Math.abs(k - 2)) * 14;
      var tx = Math.sin(a) * L, ty = 198 + Math.cos(a) * L;
      S("path", { d: "M0 196 L" + (tx - 9 * Math.cos(a)).toFixed(1) + " " + (ty - 9 * Math.sin(a)).toFixed(1) + " Q" + (tx + Math.sin(a) * 10).toFixed(1) + " " + (ty + 12).toFixed(1) + " " + (tx + 9 * Math.cos(a)).toFixed(1) + " " + (ty + 9 * Math.sin(a)).toFixed(1) + " Z", fill: "url(#eW)", stroke: "url(#eS)", "stroke-width": 2.5, "stroke-linejoin": "round" }, body);
    }
    S("path", { d: "M0 112 L-10 128 L0 144 L10 128 Z M0 150 L-8 164 L0 178 L8 164 Z", fill: "#e6fbff", opacity: .7 }, body);
    S("circle", { cx: 0, cy: 124, r: 5, fill: "#fff" }, body);
    sc.cap = caption(el, "KÖKLERİMİZ ANADOLU'DA", "Hedefimiz dünya", "Lokalden globale: Niksar'dan, Kandıra'dan çıkan fikir dünyada yankı bulur.", "cap-bottom");
  });
  var EAGLE = scenes[2];
  EAGLE.update = function (t, time) {
    var sc = EAGLE, e = smooth(0, 1, t);
    var scale = .1 + 3.1 * Math.pow(t, 2.3);
    var y = 430 + (1 - e) * 80 - t * 40;
    var tilt = Math.sin(time * .8) * 2;
    sc.eagle.setAttribute("transform", "translate(800," + y.toFixed(1) + ") rotate(" + tilt.toFixed(2) + ") scale(" + scale.toFixed(3) + ") translate(0,-110)");
    var flap = Math.sin(t * 34) * 7;
    sc.wL.style.transform = "rotate(" + (-flap) + "deg) scaleY(" + (1 - Math.abs(flap) * .012) + ")";
    sc.wR.style.transform = "rotate(" + (-flap) + "deg) scaleY(" + (1 - Math.abs(flap) * .012) + ")";
    sc.glow.setAttribute("r", 380 + t * 520);
    sc.rings.setAttribute("transform", "translate(800,450) scale(" + (.5 + t * 2.2).toFixed(2) + ") translate(-800,-450)");
    sc.rings.setAttribute("opacity", (1 - t).toFixed(2));
    sc.eagle.style.opacity = (smooth(0, .12, t) * (1 - smooth(.88, 1, t))).toFixed(3);
    sc.cap.style.opacity = (smooth(.12, .3, t) * (1 - smooth(.62, .8, t))).toFixed(3);
  };

  /* =========================================================
     4) TEKNOLOJİ SAHNELERİ
     ========================================================= */
  /* 4a — OYUN: retro ızgara */
  addScene("game", "OYUN", 0.60, 0.695, function (sc, el) {
    var s = svg(el), defs = S("defs", {}, s);
    grad(defs, "gBg", [[0, "#1b0647"], [.58, "#07041f"], [1, "#050816"]]);
    grad(defs, "gSun", [[0, "#ffe27a"], [.5, "#ff5ec0"], [1, "#8b3cff"]]);
    S("rect", { width: 1600, height: 900, fill: "url(#gBg)" }, s);
    var r = rng(5), stars = S("g", {}, s);
    for (var i = 0; i < 60; i++) S("circle", { cx: r() * 1600, cy: r() * 440, r: r() * 1.4 + .3, fill: "#fff", opacity: r() * .7 + .2 }, stars);
    sc.sunG = S("g", {}, s);
    S("circle", { cx: 800, cy: 430, r: 190, fill: "url(#gSun)" }, sc.sunG);
    sc.bars = [];
    for (var b = 0; b < 7; b++) sc.bars.push(S("rect", { x: 580, width: 440, fill: "#09051f" }, sc.sunG));
    S("rect", { y: 520, width: 1600, height: 380, fill: "#07041f" }, s);
    sc.h = []; for (var h = 0; h < 14; h++) sc.h.push(S("line", { x1: 0, x2: 1600, stroke: "#ff4fd8", "stroke-linecap": "round" }, s));
    sc.v = []; for (var v = -16; v <= 16; v++) sc.v.push(S("line", { x1: 800, y1: 520, x2: 800 + v * 190, y2: 900, stroke: "#22d3ee", "stroke-opacity": .55, "stroke-width": 1.4 }, s));
    sc.items = [];
    var cols = ["#ffe27a", "#22d3ee", "#ff4fd8", "#8b5cf6", "#7fe9ff"];
    for (var q = 0; q < 14; q++) {
      var size = 14 + r() * 22;
      sc.items.push({ e: S("rect", { width: size, height: size, rx: 3, fill: cols[q % 5], opacity: .9 }, s), x: 100 + r() * 1400, y: r() * 500, sp: .5 + r() * 1.2, size: size, rot: r() * 360 });
    }
    sc.score = S("text", { x: 190, y: 150, fill: "#ffe27a", "font-family": "Orbitron, monospace", "font-size": 30, "letter-spacing": 4 }, s);
    sc.lives = S("text", { x: 1410, y: 150, fill: "#ff4fd8", "font-family": "Orbitron, monospace", "font-size": 30, "text-anchor": "end" }, s);
    sc.cap = caption(el, "OYNA", "Oyun Geliştirme", "Eğlenceli, akıcı ve tarayıcıdan anında oynanan oyunlar.", "cap-bottom", ICON.game);
  });
  var GAME = scenes[3];
  GAME.update = function (t, time) {
    var sc = GAME, cam = t * 4 + time * .25;
    sc.h.forEach(function (l, i) {
      var u = ((i / sc.h.length) + cam) % 1, y = 520 + 380 * Math.pow(u, 2.3);
      l.setAttribute("y1", y); l.setAttribute("y2", y); l.setAttribute("stroke-width", (.6 + 2.8 * u).toFixed(2)); l.setAttribute("stroke-opacity", Math.min(1, u * 3).toFixed(2));
    });
    sc.bars.forEach(function (b, i) { var y = 470 + i * 24 + ((t * 80) % 24); b.setAttribute("y", y); b.setAttribute("height", 3 + i * 2.6); });
    sc.sunG.setAttribute("transform", "translate(0," + (-t * 24) + ")");
    sc.items.forEach(function (it) {
      var y = (it.y + 560 - t * 900 * it.sp + 1000) % 560;
      it.e.setAttribute("x", it.x); it.e.setAttribute("y", y);
      it.e.setAttribute("transform", "rotate(" + (it.rot + t * 260) + " " + (it.x + it.size / 2) + " " + (y + it.size / 2) + ")");
    });
    var sco = Math.floor(t * 98765); sc.score.textContent = "SCORE " + ("000000" + sco).slice(-6);
    sc.lives.textContent = t > .75 ? "♥ ♥ ♥" : "♥ ♥ ♥";
  };

  /* 4b — WEB: tarayıcı penceresi kuruluyor */
  addScene("web", "WEB", 0.685, 0.78, function (sc, el) {
    H("hs-bg grid-bg", "", el);
    var stage = H("web-stage", "", el);
    sc.code = [];
    ["<section class=\"hero\">", "fetch('/api/projeler')", "npm run build ✓", "git push origin main", "<Button>Başla</Button>", "deploy → yorukhan.tech"].forEach(function (txt, i) {
      sc.code.push({ e: H("code-float c" + i, "", stage), txt: txt });
    });
    sc.browser = H("browser", '<div class="b-bar"><i></i><i></i><i></i><span>yorukhan.tech</span></div><div class="b-body">' +
      '<div class="b-nav"><b></b><u></u><u></u><u></u></div>' +
      '<div class="b-hero"><div class="b-h1"></div><div class="b-h2"></div><div class="b-btn"></div></div>' +
      '<div class="b-cards"><div></div><div></div><div></div></div>' +
      '<div class="b-lines"><s></s><s></s><s></s></div></div>', stage);
    sc.steps = Array.prototype.slice.call(sc.browser.querySelectorAll(".b-nav, .b-h1, .b-h2, .b-btn, .b-cards div, .b-lines s"));
    sc.cursor = H("cursor", '<svg viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#22d3ee" stroke-width="1.4"/></svg>', stage);
    sc.cap = caption(el, "İNŞA ET", "Web Geliştirme", "Hızlı, modern ve her ekrana uyumlu siteler ve platformlar.", "cap-bottom", ICON.web);
  });
  var WEB = scenes[4];
  WEB.update = function (t, time) {
    var sc = WEB, n = sc.steps.length;
    sc.browser.style.transform = "perspective(1400px) rotateX(" + lerp(18, 0, smooth(0, .35, t)) + "deg) rotateY(" + lerp(-22, 4, smooth(0, .5, t)) + "deg) translateY(" + lerp(120, 0, smooth(0, .3, t)) + "px) scale(" + lerp(.8, 1, smooth(0, .4, t)) + ")";
    sc.steps.forEach(function (e, i) {
      var k = smooth(.18 + i * .045, .26 + i * .045, t);
      e.style.opacity = k; e.style.transform = "translateY(" + ((1 - k) * 24) + "px) scale(" + (.9 + .1 * k) + ")";
    });
    sc.code.forEach(function (c, i) {
      var k = smooth(.1 + i * .08, .3 + i * .08, t), len = Math.round(c.txt.length * k);
      c.e.textContent = c.txt.slice(0, len) + (k < 1 && k > 0 ? "▍" : "");
      c.e.style.opacity = (k * (1 - smooth(.88, 1, t) * .8)).toFixed(2);
    });
    var cx = lerp(30, 70, smooth(.2, .9, t)), cy = lerp(80, 62, smooth(.2, .9, t));
    sc.cursor.style.left = (cx + Math.sin(t * 9) * 3) + "%"; sc.cursor.style.top = (cy + Math.cos(t * 7) * 3) + "%";
  };

  /* 4c — UYGULAMA: telefon yükseliyor */
  addScene("app", "UYGULAMA", 0.77, 0.865, function (sc, el) {
    H("hs-bg grid-bg", "", el);
    var stage = H("app-stage", "", el);
    sc.orbit = H("orbit", "", stage);
    [ICON.game, ICON.web, ICON.ai, ICON.app].forEach(function (ic, i) { H("o-ico o" + i, ic, sc.orbit); });
    sc.phone = H("phone", '<div class="p-notch"></div><div class="p-screen"><div class="p-head"><b></b><span></span></div>' +
      '<div class="p-row"><i></i><div><s></s><s></s></div></div><div class="p-row"><i></i><div><s></s><s></s></div></div><div class="p-row"><i></i><div><s></s><s></s></div></div><div class="p-row"><i></i><div><s></s><s></s></div></div>' +
      '<div class="p-fab">+</div></div>', stage);
    sc.rows = Array.prototype.slice.call(sc.phone.querySelectorAll(".p-row"));
    sc.toast = H("toast", "<b>Yörükhan Tech</b><span>Yeni bir uygulama yayında 🚀</span>", stage);
    sc.cap = caption(el, "UYGULAMA", "Uygulama Geliştirme", "Kullanımı kolay, amaca odaklı uygulamalar; fikirden yayına.", "cap-bottom", ICON.app);
  });
  var APP = scenes[5];
  APP.update = function (t, time) {
    var sc = APP;
    sc.phone.style.transform = "perspective(1400px) translateY(" + lerp(260, 0, smooth(0, .35, t)) + "px) rotateY(" + lerp(-38, 12, smooth(0, .8, t)) + "deg) rotateZ(" + lerp(-8, 0, smooth(0, .4, t)) + "deg)";
    sc.rows.forEach(function (r, i) { var k = smooth(.25 + i * .09, .38 + i * .09, t); r.style.opacity = k; r.style.transform = "translateX(" + ((1 - k) * 60) + "px)"; });
    sc.orbit.style.transform = "rotate(" + (t * 220) + "deg)";
    sc.orbit.style.opacity = smooth(.1, .4, t);
    Array.prototype.forEach.call(sc.orbit.children, function (c) { c.style.transform = "rotate(" + (-t * 220) + "deg)"; });
    var k = smooth(.55, .66, t) * (1 - smooth(.9, 1, t));
    sc.toast.style.opacity = k; sc.toast.style.transform = "translateY(" + ((1 - k) * -30) + "px) scale(" + (.9 + .1 * k) + ")";
  };

  /* 4d — YAPAY ZEKÂ: sinir ağı */
  addScene("ai", "YAPAY ZEKÂ", 0.855, 0.95, function (sc, el) {
    var s = svg(el), defs = S("defs", {}, s);
    rgrad(defs, "aGlow", [[0, "#8b5cf6", .55], [.5, "#3b82f6", .18], [1, "#050816", 0]]);
    S("rect", { width: 1600, height: 900, fill: "#050816" }, s);
    S("circle", { cx: 800, cy: 400, r: 560, fill: "url(#aGlow)" }, s);
    var layers = [4, 7, 7, 4, 2], xs = [260, 520, 800, 1080, 1340], nodes = [], lines = S("g", {}, s), pulses = S("g", {}, s), dots = S("g", {}, s);
    layers.forEach(function (n, li) {
      nodes[li] = [];
      for (var i = 0; i < n; i++) nodes[li].push({ x: xs[li], y: 400 + (i - (n - 1) / 2) * 70, li: li });
    });
    sc.edges = [];
    for (var l = 0; l < layers.length - 1; l++) nodes[l].forEach(function (a, ai) {
      nodes[l + 1].forEach(function (b, bi) {
        var base = S("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#6d7cff", "stroke-opacity": .22, "stroke-width": 1.2 }, lines);
        var pulse = S("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#7fe9ff", "stroke-width": 3, "stroke-linecap": "round", "stroke-dasharray": "14 400", opacity: 0 }, pulses);
        sc.edges.push({ pulse: pulse, len: Math.hypot(b.x - a.x, b.y - a.y), off: ((ai * 7 + bi * 3 + l * 5) % 11) / 11, l: l });
      });
    });
    sc.nodes = [];
    nodes.forEach(function (layer) { layer.forEach(function (n, i) { sc.nodes.push({ e: S("circle", { cx: n.x, cy: n.y, r: 13, fill: "#0b1233", stroke: "#7fe9ff", "stroke-width": 2.4 }, dots), li: n.li, i: i }); }); });
    sc.out = S("text", { x: 1340, y: 560, "text-anchor": "middle", fill: "#7fe9ff", "font-family": "Orbitron, monospace", "font-size": 24, "letter-spacing": 3, opacity: 0 }, s);
    sc.out.textContent = "FİKİR → ÜRÜN";
    sc.cap = caption(el, "YAPAY ZEKÂ", "Yapay Zekâ", "Üretimin ve ürünlerin merkezinde; hızı ve fikri büyüten güç.", "cap-bottom", ICON.ai);
  });
  var AI = scenes[6];
  AI.update = function (t, time) {
    var sc = AI;
    sc.edges.forEach(function (e) {
      var k = ((t * 3.5 + e.off + time * .08) % 1);
      var on = smooth(.05, .25, t);
      e.pulse.setAttribute("stroke-dashoffset", (-(k * (e.len + 14)) + 14).toFixed(1));
      e.pulse.setAttribute("opacity", (on * .95).toFixed(2));
    });
    sc.nodes.forEach(function (n) {
      var wave = .5 + .5 * Math.sin(t * 14 - n.li * 1.6 + n.i * .6);
      var on = smooth(.05 + n.li * .05, .2 + n.li * .05, t);
      n.e.setAttribute("fill", "rgba(127,233,255," + (wave * .75 * on).toFixed(2) + ")");
      n.e.setAttribute("r", (11 + wave * 6 * on).toFixed(1));
    });
    sc.out.setAttribute("opacity", smooth(.7, .85, t).toFixed(2));
  };

  /* =========================================================
     5) FİNAL
     ========================================================= */
  addScene("final", "BİRLİKTE", 0.935, 1.001, function (sc, el) {
    H("hs-bg grid-bg", "", el);
    sc.box = H("final-box", '<small>BİRLİKTE</small><h2><span>Hayal et.</span> <span>İnşa et.</span> <span>Oyna.</span> <span class="grad-text">Birlikte.</span></h2><p>Aşağı kaydır ve çalışmalarımızı keşfet.</p>', el);
    sc.words = Array.prototype.slice.call(sc.box.querySelectorAll("h2 span"));
  });
  var FINAL = scenes[7];
  FINAL.update = function (t) {
    FINAL.words.forEach(function (w, i) {
      var k = smooth(.12 + i * .13, .35 + i * .13, t);
      w.style.opacity = k; w.style.transform = "translateY(" + ((1 - k) * 46) + "px) scale(" + (.9 + .1 * k) + ")";
    });
    FINAL.box.style.opacity = smooth(0, .12, t);
  };

  /* ---------- rail ve HUD ---------- */
  var dots = scenes.map(function () { var i = document.createElement("i"); rail.appendChild(i); return i; });
  var hudB = hud.querySelector("b"), hudS = hud.querySelector("span");

  /* ---------- ana güncelleme ---------- */
  var FADE = .018;
  function update(p, time) {
    var active = -1, bestOp = 0;
    scenes.forEach(function (sc, i) {
      var op = smooth(sc.a, sc.a + FADE, p) * (1 - smooth(sc.b - FADE, sc.b, p));
      if (sc.id === "final") op = smooth(sc.a, sc.a + FADE, p);
      var show = op > .002;
      if (show !== sc.on) { sc.on = show; sc.el.style.display = show ? "block" : "none"; }
      if (!show) return;
      sc.el.style.opacity = op.toFixed(3);
      var t = clamp((p - sc.a) / (sc.b - sc.a), 0, 1);
      if (sc.update) sc.update(t, time);
      if (op >= bestOp) { bestOp = op; active = i; }
    });
    /* kartal geçişinde parlama */
    var f = smooth(.585, .612, p) * (1 - smooth(.612, .648, p));
    flash.style.opacity = f.toFixed(3);
    dots.forEach(function (d, i) { d.classList.toggle("on", i === active); });
    rail.style.opacity = p > .08 ? 1 : 0;
    if (active >= 0) {
      hudB.textContent = ("0" + (active + 1)).slice(-2) + " / 0" + scenes.length;
      hudS.textContent = scenes[active].label;
    }
    hud.style.opacity = p > .08 ? 1 : 0;
  }
  window.HeroScenes = { update: update };
})();
