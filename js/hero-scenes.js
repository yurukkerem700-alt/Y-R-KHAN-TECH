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
  function svg(parent, visible) {
    var s = S("svg", { viewBox: "0 0 1600 900", preserveAspectRatio: "xMidYMid slice", class: "hs-svg" }, parent);
    if (visible) s.style.overflow = "visible";
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
  var K = 1, VW = innerWidth, VH = innerHeight;
  function measure() { VW = pin.clientWidth || innerWidth; VH = pin.clientHeight || innerHeight; K = Math.max(VW / 1600, VH / 900); }
  measure(); addEventListener("resize", measure);
  function px(x) { return VW / 2 + (x - 800) * K; }
  function py(y) { return VH / 2 + (y - 450) * K; }
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
     1) OKYANUS  (kapaktaki dağlar arasındaki deniz + yunuslar)
     ========================================================= */
  var DOLPHIN = {
    body: "M110 8 C104 4 94 0 84 -6 C80 -16 70 -26 56 -30 C34 -40 4 -44 -26 -36 C-58 -28 -90 -10 -116 10 C-126 -4 -140 -18 -156 -22 C-150 -12 -142 0 -134 10 C-142 16 -150 30 -156 40 C-138 36 -126 28 -116 18 C-84 36 -40 46 6 42 C40 38 70 28 88 14 C96 12 104 12 110 8 Z",
    fin: "M-14 -38 C-6 -62 10 -76 26 -78 C20 -64 22 -50 30 -38 Z",
    flip: "M44 28 C58 48 52 64 34 74 C36 58 30 44 22 36 Z"
  };
  function ridge(seed, w, base, amp, rough, prof) {
    var r = rng(seed), n = 256, p = new Array(n + 1);
    p[0] = r() * .5; p[n] = r() * .5;
    (function split(a, b, off) {
      if (b - a < 2) return;
      var m = (a + b) >> 1; p[m] = (p[a] + p[b]) / 2 + (r() - .5) * off;
      split(a, m, off * rough); split(m, b, off * rough);
    })(0, n, 1);
    var mn = Math.min.apply(null, p), mx = Math.max.apply(null, p), d = "M0 1200 L0 " + base;
    for (var i = 0; i < p.length; i++) {
      var k = i / n, f = prof ? prof(k) : 1;
      d += " L" + (k * w).toFixed(1) + " " + (base - ((p[i] - mn) / (mx - mn)) * amp * f).toFixed(1);
    }
    return d + " L" + w + " 1200 Z";
  }
  var OCEAN = addScene("ocean", "UFUK", 0.09, 0.255, function (sc, el) {
    var sA = svg(el), dA = S("defs", {}, sA);
    grad(dA, "oSky", [[0, "#050929"], [.55, "#2b1b6c"], [.86, "#b84c8c"], [1, "#ffa066"]]);
    rgrad(dA, "oGlow", [[0, "#ffb070", .85], [.35, "#ff6f6f", .35], [1, "#8b5cf6", 0]]);
    S("rect", { width: 1600, height: 570, fill: "url(#oSky)" }, sA);
    var r = rng(7), stars = S("g", {}, sA);
    for (var i = 0; i < 70; i++) S("circle", { cx: r() * 1600, cy: r() * 330, r: r() * 1.5 + .4, fill: "#fff", opacity: r() * .8 + .2 }, stars);
    S("circle", { cx: 800, cy: 560, r: 480, fill: "url(#oGlow)" }, sA);
    S("circle", { cx: 800, cy: 560, r: 74, fill: "#ffe8b8" }, sA);
    /* bulutlar */
    var sCloud = svg(el, true), dC = S("defs", {}, sCloud); sc.cloudSvg = sCloud;
    var blur = S("filter", { id: "oBlur", x: "-30%", y: "-30%", width: "160%", height: "160%" }, dC); S("feGaussianBlur", { stdDeviation: 22 }, blur);
    sc.clouds = S("g", { filter: "url(#oBlur)" }, sCloud);
    [[260, 300, 260, 34, .22], [1250, 250, 300, 38, .2], [800, 380, 360, 30, .16], [1450, 420, 220, 26, .22]].forEach(function (c) {
      S("ellipse", { cx: c[0], cy: c[1], rx: c[2], ry: c[3], fill: "#ff9fd0", opacity: c[4] }, sc.clouds);
    });
    /* ufuktaki karlı dağlar (ortada vadi, güneş vadiden doğuyor) */
    var sM = svg(el, true), dM = S("defs", {}, sM); sc.mSvg = sM; sM.style.willChange = "transform";
    var layers = [{ seed: 5, amp: 230, base: 574, rough: .55, prof: function (k) { return .1 + .9 * Math.pow(Math.abs(k - .5) * 2, .85); }, snow: "#ffffff", c: ["#a08ae0", "#6a56b8"] },
                  { seed: 17, amp: 190, base: 580, rough: .56, prof: function (k) { return .06 + .94 * Math.pow(Math.abs(k - .5) * 2, 1.1); }, snow: "#dcd4ff", c: ["#6a58b8", "#3b2f86"] },
                  { seed: 29, amp: 140, base: 588, rough: .58, prof: function (k) { return .02 + .98 * Math.pow(Math.abs(k - .5) * 2, 1.4); }, snow: "#8d92ee", c: ["#31297a", "#161344"] }];
    layers.forEach(function (L, i) {
      var g = S("linearGradient", { id: "oM" + i, gradientUnits: "userSpaceOnUse", x1: 0, x2: 0, y1: L.base - L.amp, y2: L.base + 20 }, dM);
      [[0, L.snow], [.14, L.snow], [.4, L.c[0]], [1, L.c[1]]].forEach(function (st) { S("stop", { offset: st[0], "stop-color": st[1] }, g); });
      S("path", { d: ridge(L.seed, 1700, L.base, L.amp, L.rough, L.prof), fill: "url(#oM" + i + ")", transform: "translate(-50,0)" }, sM);
    });
    /* deniz + güneş yolu */
    var sB = svg(el), dB = S("defs", {}, sB);
    grad(dB, "oSea", [[0, "#34307f"], [.25, "#171a5a"], [1, "#050720"]]);
    grad(dB, "oRefl", [[0, "#ffd9a0", .95], [.5, "#ff9a5e", .45], [1, "#ff7a4d", 0]]);
    S("rect", { y: 586, width: 1600, height: 314, fill: "url(#oSea)" }, sB);
    S("polygon", { points: "770,586 830,586 1080,900 520,900", fill: "url(#oRefl)", opacity: .75 }, sB);
    /* dalgalar */
    var sWave = svg(el), wd = S("defs", {}, sWave);
    grad(wd, "oWave", [[0, "#5a6fe0", .35], [.5, "#ffd7a0", 1], [1, "#5a6fe0", .35]], 1, 0, { gradientUnits: "userSpaceOnUse", x1: 0, x2: 1600, y1: 0, y2: 0 });
    sc.waves = [];
    for (var w = 0; w < 18; w++) sc.waves.push(S("path", { fill: "none", stroke: "url(#oWave)", "stroke-linecap": "round" }, sWave));
    /* ön plan kayalıklar */
    var sR = svg(el, true); sc.rSvg = sR; sR.style.willChange = "transform";
    S("path", { d: "M-40 900 L-40 700 L30 690 L70 724 L130 740 L176 790 L250 806 L300 860 L360 900 Z", fill: "#060820", stroke: "#ffa87a", "stroke-opacity": .55, "stroke-width": 2 }, sR);
    S("path", { d: "M1640 900 L1640 680 L1580 690 L1540 730 L1480 742 L1420 800 L1350 812 L1300 870 L1260 900 Z", fill: "#060820", stroke: "#ffa87a", "stroke-opacity": .55, "stroke-width": 2 }, sR);
    /* yunuslar */
    var sDol = svg(el);
    sc.dol = [];
    [{ x0: 250, x1: 640, y: 660, h: 250, sc: .95, a: .16, b: .42 },
     { x0: 760, x1: 1210, y: 700, h: 330, sc: 1.3, a: .36, b: .68 },
     { x0: 1130, x1: 1500, y: 640, h: 220, sc: .8, a: .62, b: .9 }].forEach(function (c) {
      var g = S("g", {}, sDol), splash = S("g", {}, sDol);
      var ringA = S("ellipse", { fill: "none", stroke: "#ffe0b8", "stroke-width": 3 }, splash);
      var ringB = S("ellipse", { fill: "none", stroke: "#ffe0b8", "stroke-width": 3 }, splash);
      var drops = []; for (var d = 0; d < 9; d++) drops.push(S("circle", { r: 4, fill: "#ffe8c8" }, splash));
      var dg = S("g", {}, g);
      ["body", "fin", "flip"].forEach(function (k) { S("path", { d: DOLPHIN[k], fill: "#0a0e35", stroke: "#ffb07a", "stroke-width": 2.2, "stroke-linejoin": "round" }, dg); });
      S("circle", { cx: 82, cy: -3, r: 2.6, fill: "#ffd9a8" }, dg);
      S("path", { d: "M110 8 C98 14 90 14 82 12", fill: "none", stroke: "#ffb07a", "stroke-width": 1.4, opacity: .8 }, dg);
      sc.dol.push({ c: c, g: g, ringA: ringA, ringB: ringB, drops: drops });
    });
    sc.cap = caption(el, "UFUK", "Ufkun ötesine", "Her büyük fikir, ufuk çizgisinin ötesine bakmakla başlar.", "cap-bottom");
  });
  OCEAN.update = function (t, time) {
    var sc = OCEAN;
    sc.cloudSvg.style.transform = "translate3d(" + (-t * 180 * K) + "px," + (-smooth(.7, 1, t) * 120 * K) + "px,0)";
    sc.mSvg.style.transformOrigin = px(800) + "px " + py(580) + "px";
    sc.mSvg.style.transform = "scale(" + (1 + t * .22).toFixed(3) + ")";
    sc.rSvg.style.transformOrigin = px(800) + "px " + py(900) + "px";
    sc.rSvg.style.transform = "scale(" + (1 + t * .35).toFixed(3) + ")";
    var cam = t * 3.2 + time * .05;
    for (var i = 0; i < sc.waves.length; i++) {
      var u = ((i / sc.waves.length) + cam) % 1; if (u < 0) u += 1;
      var y = 586 + 330 * Math.pow(u, 2.1);
      var amp = 2 + 30 * u * u, wl = 80 + 300 * u, ph = i * 1.9 + time * (.4 + u);
      var d = "M-60 " + y.toFixed(1);
      for (var x = -60; x <= 1700; x += 40) d += " L" + x + " " + (y + amp * Math.sin(x / wl * 6.283 + ph)).toFixed(1);
      sc.waves[i].setAttribute("d", d);
      sc.waves[i].setAttribute("stroke-width", (.7 + 3.4 * u).toFixed(2));
      sc.waves[i].setAttribute("opacity", Math.min(1, u * 4).toFixed(2));
    }
    sc.dol.forEach(function (D) {
      var c = D.c, u = (t - c.a) / (c.b - c.a), vis = u > -.05 && u < 1.12;
      D.g.style.display = vis ? "" : "none";
      if (u >= 0 && u <= 1) {
        var x = lerp(c.x0, c.x1, u), arc = 4 * u * (1 - u), y = c.y - c.h * arc;
        var dx = c.x1 - c.x0, dy = -c.h * 4 * (1 - 2 * u);
        D.g.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1) + ") scale(" + c.sc + ")");
        D.g.style.opacity = 1;
      } else D.g.style.opacity = 0;
      [[D.ringA, c.x0, -.02, .28], [D.ringB, c.x1, .96, 1.16]].forEach(function (R) {
        var k = clamp((u - R[2]) / (R[3] - R[2]), 0, 1), on = u > R[2] && u < R[3] + .05;
        R[0].setAttribute("cx", R[1]); R[0].setAttribute("cy", c.y + 6);
        R[0].setAttribute("rx", (20 + 150 * k) * c.sc); R[0].setAttribute("ry", (5 + 26 * k) * c.sc);
        R[0].setAttribute("opacity", on ? (1 - k).toFixed(2) : 0);
      });
      D.drops.forEach(function (dp, i) {
        var exit = i % 2 === 0, base = exit ? -.02 : .94, k = (u - base) / .24;
        if (k < 0 || k > 1) { dp.setAttribute("opacity", 0); return; }
        var ang = (i / 9) * 3.14 + .2, sp = 70 + (i * 23) % 70;
        dp.setAttribute("cx", ((exit ? c.x0 : c.x1) + Math.cos(ang) * sp * k * (exit ? 1 : -1) * c.sc).toFixed(1));
        dp.setAttribute("cy", (c.y - Math.sin(ang) * sp * 1.3 * k * c.sc + 260 * k * k * c.sc).toFixed(1));
        dp.setAttribute("opacity", (1 - k).toFixed(2)); dp.setAttribute("r", (4 * (1 - k * .5) * c.sc).toFixed(1));
      });
    });
    sc.cap.style.opacity = (smooth(0, .1, t) * (1 - smooth(.7, .92, t))).toFixed(3);
  };

  /* =========================================================
     2) UZAY: bulutların ötesi, güneş sistemi, yıldızlar
     ========================================================= */
  function mixHex(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), o = "#";
    [16, 8, 0].forEach(function (s) { var v = Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t)); o += ("0" + v.toString(16)).slice(-2); });
    return o;
  }
  var PLANETS = [
    { n: "Merkür", R: 74, r: 4.6, c: "#b9b2a8", a: 1.2, om: 4.2 }, { n: "Venüs", R: 112, r: 7.4, c: "#efcf86", a: 4.1, om: 3.1 },
    { n: "Dünya", R: 158, r: 8.2, c: "#3f8cff", a: 2.4, om: 2.5, moon: true }, { n: "Mars", R: 206, r: 5.8, c: "#ff6a4a", a: 5.5, om: 2.0 },
    { n: "Jüpiter", R: 300, r: 19, c: "#dba36a", a: .5, om: 1.2 }, { n: "Satürn", R: 392, r: 15, c: "#f1d9a2", a: 3.3, om: .95, ring: true },
    { n: "Uranüs", R: 478, r: 10.5, c: "#8eeeff", a: 5.9, om: .7 }, { n: "Neptün", R: 556, r: 10, c: "#5f72ff", a: 1.9, om: .55 }
  ];
  var SPACE = addScene("space", "EVREN", 0.24, 0.40, function (sc, el) {
    sc.cv = document.createElement("canvas"); sc.cv.className = "hs-canvas"; el.appendChild(sc.cv); sc.ctx = sc.cv.getContext("2d");
    var r = rng(99); sc.stars = [];
    for (var i = 0; i < 280; i++) sc.stars.push({ x: r(), y: r(), z: .25 + r() * .75, p: r() * 6.28 });
    sc.W = 0; sc.H = 0;
    var cs = svg(el, true), cd = S("defs", {}, cs); sc.cloudSvg = cs;
    var bf = S("filter", { id: "sBlur", x: "-30%", y: "-30%", width: "160%", height: "160%" }, cd); S("feGaussianBlur", { stdDeviation: 34 }, bf);
    var cg = S("g", { filter: "url(#sBlur)" }, cs);
    [[200, 780, 420, 90], [700, 840, 520, 100], [1250, 790, 440, 90], [-20, 900, 380, 120], [1620, 900, 380, 120], [820, 700, 360, 70]].forEach(function (c, i) {
      S("ellipse", { cx: c[0], cy: c[1], rx: c[2], ry: c[3], fill: i % 2 ? "#ffb7d9" : "#d9c9ff", opacity: .85 }, cg);
    });
    sc.cap = caption(el, "EVREN", "Bulutların ötesinde", "Güneş sistemi, yıldızlar, evren: vizyonumuz gökyüzüyle sınırlı değil.", "cap-bottom");
  });
  SPACE.update = function (t, time) {
    var sc = SPACE, cv = sc.cv, ctx = sc.ctx, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (sc.W !== VW || sc.H !== VH) { sc.W = VW; sc.H = VH; cv.width = Math.round(VW * dpr); cv.height = Math.round(VH * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var d = smooth(0, .3, t);
    var g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, mixHex("#2a1b6c", "#01020a", d)); g.addColorStop(1, mixHex("#b84c8c", "#070a24", d));
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    /* nebula + samanyolu */
    ctx.globalAlpha = d;
    var n1 = ctx.createRadialGradient(VW * .2, VH * .3, 0, VW * .2, VH * .3, VW * .45); n1.addColorStop(0, "rgba(139,92,246,.30)"); n1.addColorStop(1, "rgba(139,92,246,0)");
    ctx.fillStyle = n1; ctx.fillRect(0, 0, VW, VH);
    var n2 = ctx.createRadialGradient(VW * .82, VH * .62, 0, VW * .82, VH * .62, VW * .4); n2.addColorStop(0, "rgba(45,212,191,.22)"); n2.addColorStop(1, "rgba(45,212,191,0)");
    ctx.fillStyle = n2; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.translate(VW / 2, VH / 2); ctx.rotate(-.38);
    var mw = ctx.createLinearGradient(0, -130, 0, 130); mw.addColorStop(0, "rgba(160,170,255,0)"); mw.addColorStop(.5, "rgba(170,180,255,.13)"); mw.addColorStop(1, "rgba(160,170,255,0)");
    ctx.fillStyle = mw; ctx.fillRect(-VW, -130, VW * 2, 260); ctx.restore();
    ctx.globalAlpha = 1;
    /* yıldızlar (yükselirken çizgi gibi uzar) */
    var streak = (1 - smooth(0, .3, t)) * 90;
    ctx.lineCap = "round";
    sc.stars.forEach(function (s) {
      var x = s.x * VW, y = (s.y * VH + t * VH * .5 * s.z) % VH;
      var a = (.3 + .7 * (.5 + .5 * Math.sin(time * 2 + s.p))) * (.25 + .75 * d);
      if (streak > 4 * s.z) {
        ctx.strokeStyle = "rgba(255,255,255," + (a * .8).toFixed(2) + ")"; ctx.lineWidth = s.z * 1.6;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - streak * s.z); ctx.stroke();
      } else { ctx.fillStyle = "rgba(255,255,255," + a.toFixed(2) + ")"; ctx.beginPath(); ctx.arc(x, y, s.z * 1.5, 0, 6.283); ctx.fill(); }
    });
    /* Dünya'nın kıvrımı: yukarı çıkarken aşağıda kalır */
    var eT = smooth(0, .5, t);
    if (eT < .995) {
      var R = VW * 1.15, cx = VW / 2, cy = VH + R * .62 + eT * R * .9;
      var atm = ctx.createRadialGradient(cx, cy, R * .97, cx, cy, R * 1.07);
      atm.addColorStop(0, "rgba(45,212,191,.75)"); atm.addColorStop(.35, "rgba(59,130,246,.35)"); atm.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, R * 1.07, 0, 6.283); ctx.fill();
      var ps = ctx.createRadialGradient(cx + R * .25, cy - R * .5, R * .1, cx, cy, R);
      ps.addColorStop(0, "#1f6fd0"); ps.addColorStop(.6, "#0b2f78"); ps.addColorStop(1, "#050d2e");
      ctx.fillStyle = ps; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill();
      ctx.strokeStyle = "rgba(190,250,240,.9)"; ctx.lineWidth = 3; ctx.shadowColor = "#2dd4bf"; ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.arc(cx, cy, R, -2.35, -.8); ctx.stroke(); ctx.shadowBlur = 0;
    }
    /* güneş sistemi */
    var sy = smooth(.26, .52, t);
    if (sy > .01) {
      var zoom = lerp(3, 1, sy), sk = VW / 1600 * zoom, sxp = VW / 2, syp = VH * .44, tilt = -.1;
      ctx.save(); ctx.globalAlpha = sy; ctx.translate(sxp, syp); ctx.rotate(tilt);
      ctx.strokeStyle = "rgba(150,170,255,.16)"; ctx.lineWidth = 1;
      PLANETS.forEach(function (p) { ctx.beginPath(); ctx.ellipse(0, 0, p.R * sk, p.R * sk * .3, 0, 0, 6.283); ctx.stroke(); });
      var pos = PLANETS.map(function (p) {
        var ang = p.a + (t * 16 + time * .1) * p.om * .2;
        return { p: p, x: Math.cos(ang) * p.R * sk, y: Math.sin(ang) * p.R * sk * .3, back: Math.sin(ang) < 0 };
      });
      function planet(o) {
        var p = o.p, r = p.r * sk * 1.25, dl = Math.hypot(o.x, o.y) || 1, ux = -o.x / dl, uy = -o.y / dl;
        var pg = ctx.createRadialGradient(o.x + ux * r * .4, o.y + uy * r * .4, r * .1, o.x, o.y, r);
        pg.addColorStop(0, mixHex(p.c, "#ffffff", .45)); pg.addColorStop(.55, p.c); pg.addColorStop(1, mixHex(p.c, "#02030c", .78));
        if (p.ring) { ctx.strokeStyle = "rgba(240,215,160,.75)"; ctx.lineWidth = 3.2 * sk; ctx.beginPath(); ctx.ellipse(o.x, o.y, r * 2.1, r * .62, -.3, Math.PI, 6.283); ctx.stroke(); }
        ctx.fillStyle = pg; ctx.shadowColor = p.c; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
        if (p.ring) { ctx.strokeStyle = "rgba(240,215,160,.9)"; ctx.lineWidth = 3.2 * sk; ctx.beginPath(); ctx.ellipse(o.x, o.y, r * 2.1, r * .62, -.3, 0, Math.PI); ctx.stroke(); }
        if (p.moon) { var ma = time * 1.4 + t * 40; ctx.fillStyle = "#e8ecff"; ctx.beginPath(); ctx.arc(o.x + Math.cos(ma) * r * 2.2, o.y + Math.sin(ma) * r * .8, r * .28, 0, 6.283); ctx.fill(); }
        if (sy > .92) { ctx.fillStyle = "rgba(190,205,255," + ((sy - .92) / .08 * .85).toFixed(2) + ")"; ctx.font = "600 " + Math.max(11, 12 * sk) + "px Manrope, sans-serif"; ctx.textAlign = "center"; ctx.fillText(p.n, o.x, o.y + r + 16 * Math.max(1, sk)); }
      }
      pos.filter(function (o) { return o.back; }).forEach(planet);
      var gl = ctx.createRadialGradient(0, 0, 0, 0, 0, 150 * sk);
      gl.addColorStop(0, "rgba(255,244,200,1)"); gl.addColorStop(.12, "rgba(255,200,110,.85)"); gl.addColorStop(.4, "rgba(255,140,60,.25)"); gl.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 150 * sk, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#fff4cf"; ctx.beginPath(); ctx.arc(0, 0, 26 * sk, 0, 6.283); ctx.fill();
      pos.filter(function (o) { return !o.back; }).forEach(planet);
      ctx.restore();
    }
    sc.cloudSvg.style.transform = "translate3d(0," + (-smooth(0, .3, t) * VH * 1.35) + "px,0)";
    sc.cloudSvg.style.opacity = (1 - smooth(.04, .28, t)).toFixed(3);
    sc.cap.style.opacity = (smooth(.42, .58, t) * (1 - smooth(.86, 1, t))).toFixed(3);
  };

  /* =========================================================
     3) DAĞLAR  (bulutların arasından iniş)
     ========================================================= */
  var MOUNT = addScene("mountains", "ZİRVE", 0.385, 0.52, function (sc, el) {
    var s = svg(el), defs = S("defs", {}, s);
    grad(defs, "mSky", [[0, "#060a2b"], [.5, "#2c1d70"], [.82, "#a4468f"], [1, "#ff9468"]]);
    rgrad(defs, "mGlow", [[0, "#ffc58a", .9], [.4, "#ff7a8a", .35], [1, "#7c4dff", 0]]);
    S("rect", { width: 1600, height: 900, fill: "url(#mSky)" }, s);
    var r = rng(11), stars = S("g", {}, s);
    for (var i = 0; i < 80; i++) S("circle", { cx: r() * 1600, cy: r() * 360, r: r() * 1.4 + .3, fill: "#fff", opacity: r() * .7 + .2 }, stars);
    sc.glowSvg = svg(el);
    var gd = S("defs", {}, sc.glowSvg); rgrad(gd, "mGlow2", [[0, "#ffc58a", .9], [.4, "#ff7a8a", .35], [1, "#7c4dff", 0]]);
    S("circle", { cx: 800, cy: 640, r: 560, fill: "url(#mGlow2)" }, sc.glowSvg);
    var cfg = [{ base: 640, amp: 190, rough: .52, seed: 3, shift: 160, grow: .06, snow: "#ffffff", c: ["#9a8cf0", "#6a5cc4"] },
               { base: 700, amp: 250, rough: .54, seed: 8, shift: 330, grow: .14, snow: "#ece8ff", c: ["#7c6cd6", "#4c3fa0"] },
               { base: 780, amp: 320, rough: .55, seed: 21, shift: 560, grow: .26, snow: "#b9bfff", c: ["#51459f", "#2b2370"] },
               { base: 860, amp: 380, rough: .56, seed: 34, shift: 880, grow: .42, snow: "#7d88e8", c: ["#2c2676", "#141242"] },
               { base: 940, amp: 420, rough: .58, seed: 55, shift: 1300, grow: .7, snow: "#4a52b8", c: ["#14123e", "#070920"] }];
    sc.layers = [];
    cfg.forEach(function (c, i) {
      var ls = svg(el, true), ld = S("defs", {}, ls);
      var g = S("linearGradient", { id: "mC" + i, gradientUnits: "userSpaceOnUse", x1: 0, x2: 0, y1: c.base - c.amp, y2: c.base + 80 }, ld);
      [[0, c.snow], [.1, c.snow], [.3, c.c[0]], [1, c.c[1]]].forEach(function (st) { S("stop", { offset: st[0], "stop-color": st[1] }, g); });
      S("path", { d: ridge(c.seed, 3000, c.base, c.amp, c.rough), fill: "url(#mC" + i + ")", transform: "translate(-700,0)" }, ls);
      ls.style.willChange = "transform";
      sc.layers.push({ g: ls, c: c });
    });
    var ms = svg(el, true), md = S("defs", {}, ms);
    var bf = S("filter", { id: "oBlurM", x: "-10%", y: "-100%", width: "120%", height: "300%" }, md); S("feGaussianBlur", { stdDeviation: 28 }, bf);
    sc.mist = [];
    for (var m = 0; m < 3; m++) sc.mist.push(S("rect", { x: -200, y: 520 + m * 90, width: 2000, height: 120, fill: "#ffd0e8", opacity: .08 + m * .02, filter: "url(#oBlurM)" }, ms));
    sc.mistSvg = ms; ms.style.willChange = "transform";
    /* iniş: bulutlar yukarı çekilir */
    var cs = svg(el, true), cd = S("defs", {}, cs); sc.cloudSvg = cs;
    var cf = S("filter", { id: "mBlurC", x: "-30%", y: "-30%", width: "160%", height: "160%" }, cd); S("feGaussianBlur", { stdDeviation: 36 }, cf);
    var cg = S("g", { filter: "url(#mBlurC)" }, cs);
    [[200, 300, 460, 120], [800, 420, 560, 130], [1400, 320, 460, 120], [500, 640, 520, 120], [1150, 700, 520, 120], [820, 120, 520, 100]].forEach(function (c, i) {
      S("ellipse", { cx: c[0], cy: c[1], rx: c[2], ry: c[3], fill: i % 2 ? "#ffc0dc" : "#e4d6ff", opacity: .92 }, cg);
    });
    sc.cap = caption(el, "ZİRVE", "Zirvelerden geç", "Her zirve, bir öncekinin üzerine inşa edilir.", "cap-bottom");
  });
  MOUNT.update = function (t, time) {
    var sc = MOUNT, rise = 1 - smooth(0, .16, t);
    sc.glowSvg.style.transform = "translate3d(0," + (t * 120 * K) + "px,0)";
    sc.glowSvg.style.opacity = (1 - t * .7).toFixed(2);
    sc.layers.forEach(function (L, i) {
      var c = L.c, sx = -t * c.shift * (i % 2 ? 1 : -1), sy = rise * (260 + i * 90), scl = 1 + t * c.grow;
      L.g.style.transformOrigin = px(800) + "px " + py(860) + "px";
      L.g.style.transform = "translate3d(" + (sx * K).toFixed(1) + "px," + (sy * K).toFixed(1) + "px,0) scale(" + scl.toFixed(3) + ")";
    });
    sc.mistSvg.style.transform = "translate3d(" + (-t * 300 * K) + "px,0,0)";
    var ce = smooth(0, .3, t);
    sc.cloudSvg.style.transform = "translate3d(0," + (-ce * VH * 1.3) + "px,0)";
    sc.cloudSvg.style.opacity = (1 - smooth(.15, .3, t)).toFixed(3);
    sc.cap.style.opacity = (smooth(.18, .3, t) * (1 - smooth(.62, .8, t))).toFixed(3);
  };

  /* =========================================================
     4) ÇİFT BAŞLI ANADOLU KARTALI  (Selçuklu ruhu: asil, süzülen, kanat çırpan)
     ========================================================= */
  var PIV = [-40, 128];
  function leaf(bx, by, ang, len, w, bend) {
    var dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, bd = (bend === undefined ? .05 : bend) * len;
    var x1 = bx + dx * len * .35, y1 = by + dy * len * .35, x2 = bx + dx * len * .8, y2 = by + dy * len * .8, tx = bx + dx * len, ty = by + dy * len;
    function f(v) { return v.toFixed(1); }
    return "M" + f(bx + nx * w * .5) + " " + f(by + ny * w * .5) +
      " C" + f(x1 + nx * w + nx * bd) + " " + f(y1 + ny * w + ny * bd) + " " + f(x2 + nx * w * .9 + nx * bd) + " " + f(y2 + ny * w * .9 + ny * bd) + " " + f(tx + nx * bd) + " " + f(ty + ny * bd) +
      " C" + f(x2 - nx * w * .55 + nx * bd) + " " + f(y2 - ny * w * .55 + ny * bd) + " " + f(x1 - nx * w * .85 + nx * bd) + " " + f(y1 - ny * w * .85 + ny * bd) + " " + f(bx - nx * w * .5) + " " + f(by - ny * w * .5) + " Z";
  }
  function buildWing(g) {
    var wing = { prim: [], base: [] }, n = 10, L = [200, 226, 248, 264, 276, 280, 272, 254, 230, 200];
    var grp = S("g", {}, g);
    for (var i = 0; i < n; i++) {
      var a = (-116 - i * (74 / (n - 1))) * Math.PI / 180, bx = PIV[0] + Math.cos(a) * 14, by = PIV[1] + Math.sin(a) * 14;
      var fg = S("g", {}, grp);
      S("path", { d: leaf(bx, by, a, L[i], 25 - i * .7), fill: "url(#eF)", stroke: "url(#eS)", "stroke-width": 2.6, "stroke-linejoin": "round" }, fg);
      S("path", { d: "M" + bx.toFixed(1) + " " + by.toFixed(1) + " L" + (bx + Math.cos(a) * L[i] * .93).toFixed(1) + " " + (by + Math.sin(a) * L[i] * .93).toFixed(1), fill: "none", stroke: "#c9fff5", "stroke-opacity": .55, "stroke-width": 1.4 }, fg);
      wing.prim.push(fg);
    }
    [{ m: 8, L: 118, w: 38, off: 30, a0: -120, a1: -178, fill: "eC" }, { m: 7, L: 78, w: 32, off: 16, a0: -126, a1: -172, fill: "eD" }].forEach(function (row) {
      var rg = S("g", {}, grp);
      for (var k = 0; k < row.m; k++) {
        var a = (row.a0 + (row.a1 - row.a0) * k / (row.m - 1)) * Math.PI / 180, bx = PIV[0] + Math.cos(a) * row.off, by = PIV[1] + Math.sin(a) * row.off;
        S("path", { d: leaf(bx, by, a, row.L * (1 - Math.abs(k - row.m / 2) * .02), row.w, .03), fill: "url(#" + row.fill + ")", stroke: "url(#eS)", "stroke-width": 2.2, "stroke-linejoin": "round" }, rg);
      }
      wing.base.push(rg);
    });
    S("path", { d: "M-30 160 C-18 112 -50 82 -100 80 C-72 104 -66 142 -46 182 Z", fill: "url(#eD)", stroke: "url(#eS)", "stroke-width": 2.4, "stroke-linejoin": "round" }, grp);
    return wing;
  }
  function buildHead(g) {
    var head = S("g", {}, g), hi = S("g", { transform: "translate(-6,-34)" }, head);
    S("path", { d: "M-10 96 L-32 106 C-30 126 -26 144 -18 160 L2 160 L2 120 Z", fill: "url(#eC)", stroke: "url(#eS)", "stroke-width": 3, "stroke-linejoin": "round" }, hi);
    head = hi;
    S("path", { d: "M-46 28 L-40 6 L-34 26 M-38 30 L-30 10 L-26 32", fill: "url(#eC)", stroke: "url(#eS)", "stroke-width": 2, "stroke-linejoin": "round" }, head);
    S("path", { d: "M-8 96 C-18 82 -26 66 -30 54 C-32 44 -34 34 -42 28 C-50 22 -62 20 -72 24 C-76 26 -80 30 -84 34 C-96 36 -108 44 -110 58 C-110 66 -106 72 -100 72 C-100 64 -96 58 -88 56 L-76 54 C-70 58 -62 62 -58 68 C-50 78 -40 90 -30 104 Z", fill: "url(#eC)", stroke: "url(#eS)", "stroke-width": 3, "stroke-linejoin": "round" }, head);
    S("path", { d: "M-84 34 C-96 36 -108 44 -110 58 C-110 66 -106 72 -100 72 C-100 64 -96 58 -88 56 L-76 54 Z", fill: "url(#eG)", stroke: "#fff3c4", "stroke-width": 1.5, "stroke-linejoin": "round" }, head);
    S("path", { d: "M-78 28 L-54 38", stroke: "#02103a", "stroke-width": 4.2, "stroke-linecap": "round" }, head);
    S("circle", { cx: -64, cy: 40, r: 4.2, fill: "#fff3c4" }, head);
    S("circle", { cx: -65, cy: 40, r: 1.9, fill: "#02103a" }, head);
    S("path", { d: "M-34 50 C-40 62 -42 76 -38 90 M-46 56 C-50 66 -50 78 -46 88 M-22 62 C-26 74 -26 86 -22 96", fill: "none", stroke: "#c9fff5", "stroke-opacity": .5, "stroke-width": 1.6 }, head);
    return head;
  }
  function buildLeg(g) {
    var leg = S("g", { fill: "none", stroke: "url(#eG)", "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    S("path", { d: "M-16 172 C-34 190 -46 208 -52 230" }, leg);
    S("path", { d: "M-52 230 C-70 236 -84 246 -90 262 M-52 230 C-68 246 -76 262 -70 280 M-52 230 C-56 250 -52 268 -40 282 M-52 230 C-40 246 -26 258 -14 262" }, leg);
    S("path", { d: "M-90 262 L-98 268 M-70 280 L-72 290 M-40 282 L-34 290 M-14 262 L-6 262", "stroke-width": 4 }, leg);
    return leg;
  }
  var EAGLE = addScene("eagle", "ANADOLU", 0.505, 0.665, function (sc, el) {
    sc.rays = H("rays", "", el);
    var gs = svg(el), gd = S("defs", {}, gs);
    rgrad(gd, "eGlow", [[0, "#5eead4", .7], [.45, "#3b82f6", .28], [1, "#8b5cf6", 0]]);
    S("circle", { cx: 800, cy: 450, r: 520, fill: "url(#eGlow)" }, gs); sc.glowSvg = gs; gs.style.willChange = "transform";
    var rs = svg(el); sc.ringSvg = rs; rs.style.willChange = "transform, opacity";
    var rg = S("g", { fill: "none", stroke: "#5eead4", "stroke-opacity": .38, "stroke-width": 2 }, rs);
    for (var i = 0; i < 3; i++) S("circle", { cx: 800, cy: 450, r: 300 + i * 120 }, rg);
    var s = svg(el, true), defs = S("defs", {}, s); sc.eagleSvg = s; s.style.willChange = "transform, opacity";
    grad(defs, "eF", [[0, "#0a1a52"], [.55, "#14449e"], [1, "#2dd4bf"]], 1, 1);
    grad(defs, "eC", [[0, "#0b1f66"], [1, "#1a5ec8"]], 1, 1);
    grad(defs, "eD", [[0, "#0a1750"], [1, "#0f3a96"]], 1, 1);
    grad(defs, "eS", [[0, "#d9fff8"], [.5, "#7fe9ff"], [1, "#a5b4ff"]], 1, 1);
    grad(defs, "eG", [[0, "#fff1b8"], [1, "#e0a93a"]], 1, 1);
    grad(defs, "eB", [[0, "#0c2470"], [1, "#1c63d6"]], 0, 1);
    sc.eagle = S("g", { transform: "translate(800,540) translate(0,-110)" }, s);
    var L = S("g", {}, sc.eagle), R = S("g", { transform: "scale(-1,1)" }, sc.eagle);
    sc.wingL = buildWing(L); sc.wingR = buildWing(R);
    buildLeg(L); buildLeg(R);
    /* kuyruk */
    for (var k = -3; k <= 3; k++) {
      var a = Math.PI / 2 + k * .17, len = 96 + (3 - Math.abs(k)) * 9;
      S("path", { d: leaf(0, 200, a, len, 24, 0), fill: "url(#eD)", stroke: "url(#eS)", "stroke-width": 2.4, "stroke-linejoin": "round" }, sc.eagle);
    }
    var body = S("g", {}, sc.eagle);
    S("path", { d: "M-32 94 C-40 132 -28 172 -10 202 L0 222 L10 202 C28 172 40 132 32 94 C16 106 -16 106 -32 94 Z", fill: "url(#eB)", stroke: "url(#eS)", "stroke-width": 3, "stroke-linejoin": "round" }, body);
    for (var q = 0; q < 4; q++) S("path", { d: "M" + (-20 + q * 2) + " " + (114 + q * 20) + " L0 " + (128 + q * 20) + " L" + (20 - q * 2) + " " + (114 + q * 20), fill: "none", stroke: "#9ff5e6", "stroke-opacity": .75, "stroke-width": 2.2, "stroke-linecap": "round", "stroke-linejoin": "round" }, body);
    sc.headL = buildHead(L); sc.headR = buildHead(R);
    /* ay yıldız */
    var em = S("g", {}, sc.eagle);
    S("path", { d: "M-19.96 -47.33 A24 24 0 1 0 19.96 -47.33 A20 20 0 1 1 -19.96 -47.33 Z", fill: "#5eead4", stroke: "#e6fffa", "stroke-width": 1.4 }, em);
    var star = ""; for (var v = 0; v < 10; v++) { var rr = v % 2 ? 5.4 : 13, an = -Math.PI / 2 + v * Math.PI / 5; star += (v ? "L" : "M") + (Math.cos(an) * rr).toFixed(1) + " " + (-80 + Math.sin(an) * rr).toFixed(1); }
    S("path", { d: star + "Z", fill: "#ffffff", stroke: "#bff7ee", "stroke-width": 1 }, em);
    sc.cap = caption(el, "KÖKLERİMİZ ANADOLU'DA", "Asil bakış, yüksek hedef", "Türk tarihinin kadim sembolü kartal gibi: yüksekten bakar, hedefe kilitlenir.", "cap-bottom");
  });
  EAGLE.update = function (t, time) {
    var sc = EAGLE, e = smooth(0, 1, t);
    var scale = .12 + 2.35 * Math.pow(t, 2.25);
    /* süzülüş: S çizen yol; yaklaştıkça merkeze oturur */
    var env = Math.pow(1 - t, 1.15);
    var xx = Math.sin(t * 5.4) * 300 * env;
    var yy = 430 + (1 - e) * 130 - t * 36 + Math.sin(t * 8.5) * 16 * env;
    var bank = Math.cos(t * 5.4) * 9 * env;
    /* kanat çırpışı: süzülme ve çırpma dönüşümlü */
    var g = .5 + .5 * Math.sin(t * 6.4 + .6), amp = .16 + .84 * smooth(.28, .72, g), ph = t * 46;
    var bob = Math.cos(ph) * 7 * amp;
    sc.eagleSvg.style.transformOrigin = px(800) + "px " + py(540) + "px";
    sc.eagleSvg.style.transform = "translate3d(" + (xx * K).toFixed(1) + "px," + ((yy - 540 + bob * scale) * K).toFixed(1) + "px,0) rotate(" + bank.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
    [sc.wingL, sc.wingR].forEach(function (w) {
      w.prim.forEach(function (fg, i) {
        var lag = i * .24, rot = 21 * amp * Math.sin(ph - lag) * (.3 + .7 * i / 9) + (1 - amp) * 3;
        fg.setAttribute("transform", "rotate(" + rot.toFixed(2) + " " + PIV[0] + " " + PIV[1] + ")");
      });
      w.base.forEach(function (rg, j) { rg.setAttribute("transform", "rotate(" + (9 * amp * Math.sin(ph - .5 - j * .2)).toFixed(2) + " " + PIV[0] + " " + PIV[1] + ")"); });
    });
    var headTurn = Math.sin(t * 4.1) * 2.2;
    sc.headL.setAttribute("transform", "translate(-6,-34) rotate(" + headTurn.toFixed(2) + " -14 100)"); sc.headR.setAttribute("transform", "translate(-6,-34) rotate(" + headTurn.toFixed(2) + " -14 100)");
    sc.glowSvg.style.transformOrigin = px(800) + "px " + py(450) + "px";
    sc.glowSvg.style.transform = "translate3d(" + (xx * K * .6) + "px,0,0) scale(" + (.75 + t * 1.0).toFixed(3) + ")";
    sc.ringSvg.style.transformOrigin = px(800) + "px " + py(450) + "px";
    sc.ringSvg.style.transform = "scale(" + (.5 + t * 2.2).toFixed(2) + ")";
    sc.ringSvg.style.opacity = (1 - t).toFixed(2);
    sc.rays.style.transform = "translate(-50%,-50%) rotate(" + (t * 70) + "deg) scale(" + (.6 + t * 1.2).toFixed(2) + ")";
    sc.rays.style.opacity = (smooth(.05, .3, t) * (1 - smooth(.8, 1, t))).toFixed(3);
    sc.eagleSvg.style.opacity = (smooth(0, .1, t) * (1 - smooth(.9, 1, t))).toFixed(3);
    sc.cap.style.opacity = (smooth(.14, .3, t) * (1 - smooth(.6, .78, t))).toFixed(3);
  };

  /* 4a — OYUN: retro ızgara */
  var GAME = addScene("game", "OYUN", 0.65, 0.725, function (sc, el) {
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
    sc.cap = caption(el, "HİZMET · 01", "Oyun Geliştirme", "Eğlenceli, akıcı ve tarayıcıdan anında oynanan oyunlar.", "cap-bottom", ICON.game);
  });
  
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
  var WEB = addScene("web", "WEB", 0.71, 0.785, function (sc, el) {
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
    sc.cap = caption(el, "HİZMET · 02", "Web Geliştirme", "Hızlı, modern ve her ekrana uyumlu siteler ve platformlar.", "cap-bottom", ICON.web);
  });
  
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
  var APP = addScene("app", "UYGULAMA", 0.77, 0.845, function (sc, el) {
    H("hs-bg grid-bg", "", el);
    var stage = H("app-stage", "", el);
    sc.orbit = H("orbit", "", stage);
    [ICON.game, ICON.web, ICON.ai, ICON.app].forEach(function (ic, i) { H("o-ico o" + i, ic, sc.orbit); });
    sc.phone = H("phone", '<div class="p-notch"></div><div class="p-screen"><div class="p-head"><b></b><span></span></div>' +
      '<div class="p-row"><i></i><div><s></s><s></s></div></div><div class="p-row"><i></i><div><s></s><s></s></div></div><div class="p-row"><i></i><div><s></s><s></s></div></div><div class="p-row"><i></i><div><s></s><s></s></div></div>' +
      '<div class="p-fab">+</div></div>', stage);
    sc.rows = Array.prototype.slice.call(sc.phone.querySelectorAll(".p-row"));
    sc.toast = H("toast", "<b>Yörükhan Tech</b><span>Yeni bir uygulama yayında 🚀</span>", stage);
    sc.cap = caption(el, "HİZMET · 03", "Uygulama Geliştirme", "Kullanımı kolay, amaca odaklı uygulamalar; fikirden yayına.", "cap-bottom", ICON.app);
  });
  
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


  /* 4d — YAPAY ZEKÂ: sohbet + dönen sinir küresi + yetenekler */
  var AI = addScene("ai", "YAPAY ZEKÂ", 0.83, 0.94, function (sc, el) {
    H("hs-bg grid-bg", "", el);
    var stage = H("ai-stage", "", el);
    sc.chat = H("ai-chat", '<div class="chat-head"><i></i><b>Yörükhan AI</b><span>çevrimiçi</span></div>' +
      '<div class="msg user"></div><div class="msg bot"></div>' +
      '<ul class="ai-steps"><li>Tasarım hazırlandı</li><li>Veritabanı kuruldu</li><li>Canlı yayın akışı bağlandı</li><li>Yayına alındı 🚀</li></ul>', stage);
    sc.user = sc.chat.querySelector(".user"); sc.bot = sc.chat.querySelector(".bot");
    sc.steps = Array.prototype.slice.call(sc.chat.querySelectorAll(".ai-steps li"));
    sc.cv = document.createElement("canvas"); sc.cv.className = "ai-sphere"; stage.appendChild(sc.cv); sc.ctx = sc.cv.getContext("2d");
    sc.size = 0;
    var N = 120; sc.pts = [];
    for (var i = 0; i < N; i++) { var y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963; sc.pts.push({ x: Math.cos(th) * rr, y: y, z: Math.sin(th) * rr, p: Math.random() * 6.28 }); }
    sc.edges = [];
    for (var a = 0; a < N; a++) for (var b = a + 1; b < N; b++) {
      var dx = sc.pts[a].x - sc.pts[b].x, dy = sc.pts[a].y - sc.pts[b].y, dz = sc.pts[a].z - sc.pts[b].z;
      if (dx * dx + dy * dy + dz * dz < .3) sc.edges.push([a, b]);
    }
    sc.chips = H("ai-chips", '<span>Kod yazar</span><span>Tasarlar</span><span>Analiz eder</span><span>Otomatikleştirir</span><span>Öğrenir</span>', stage);
    sc.chipEls = Array.prototype.slice.call(sc.chips.children);
    sc.cap = caption(el, "HİZMET · 04", "Yapay Zekâ", "Fikri dakikalar içinde ürüne çeviren, üretimin merkezindeki güç.", "cap-bottom", ICON.ai);
  });
  var AI_USER = "Niksar için canlı turnuva sitesi yap.", AI_BOT = "Anlaşıldı. Planlıyorum, tasarlıyorum, kodluyorum…";
  AI.update = function (t, time) {
    var sc = AI, cv = sc.cv, ctx = sc.ctx, dpr = Math.min(2, window.devicePixelRatio || 1);
    var S0 = Math.round(Math.min(520, VH * .5, VW * .4));
    if (sc.size !== S0) { sc.size = S0; cv.style.width = cv.style.height = S0 + "px"; cv.width = cv.height = Math.round(S0 * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, S0, S0);
    var c = S0 / 2, R = S0 * .34, ay = time * .35 + t * 7, ax = .45, ca = Math.cos(ay), sa = Math.sin(ay), cx_ = Math.cos(ax), sx_ = Math.sin(ax);
    var core = ctx.createRadialGradient(c, c, 0, c, c, R * 1.5);
    core.addColorStop(0, "rgba(94,234,212,.35)"); core.addColorStop(.5, "rgba(99,102,241,.2)"); core.addColorStop(1, "rgba(5,8,22,0)");
    ctx.fillStyle = core; ctx.fillRect(0, 0, S0, S0);
    var pr = sc.pts.map(function (p) {
      var x = p.x * ca + p.z * sa, z = -p.x * sa + p.z * ca, y = p.y * cx_ - z * sx_; z = p.y * sx_ + z * cx_;
      var f = 2.2 / (2.2 - z); return { x: c + x * R * f, y: c + y * R * f, z: z, f: f, p: p.p };
    });
    var on = smooth(.02, .2, t);
    ctx.lineWidth = 1;
    sc.edges.forEach(function (e, i) {
      var A = pr[e[0]], B = pr[e[1]], d = (A.z + B.z) / 2, al = (.08 + .3 * (d + 1) / 2) * on;
      ctx.strokeStyle = "rgba(127,233,255," + al.toFixed(3) + ")"; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      if (i % 9 === 0) {
        var k = (time * .5 + i * .137) % 1; ctx.fillStyle = "rgba(255,255,255," + (.9 * on).toFixed(2) + ")";
        ctx.beginPath(); ctx.arc(lerp(A.x, B.x, k), lerp(A.y, B.y, k), 2.1, 0, 6.283); ctx.fill();
      }
    });
    pr.forEach(function (p, i) {
      var pulse = .5 + .5 * Math.sin(time * 2.4 + p.p), rr = (1.4 + 2.6 * (p.z + 1) / 2) * p.f;
      ctx.fillStyle = "rgba(" + (i % 5 ? "94,234,212" : "165,180,255") + "," + ((.45 + .55 * pulse) * on).toFixed(2) + ")";
      ctx.shadowColor = "#5eead4"; ctx.shadowBlur = 6 * pulse;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.283); ctx.fill();
    });
    ctx.shadowBlur = 0;
    /* yörüngedeki jetonlar */
    ctx.strokeStyle = "rgba(127,233,255,.25)"; ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.ellipse(c, c, R * 1.3, R * .4, -.35, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
    ["</>", "AI", "{ }", "01", "⚡"].forEach(function (tk, i) {
      var an = time * .7 + i * 1.256, x = Math.cos(an) * R * 1.3, y = Math.sin(an) * R * .4, rot = -.35;
      var px_ = c + x * Math.cos(rot) - y * Math.sin(rot), py_ = c + x * Math.sin(rot) + y * Math.cos(rot);
      ctx.fillStyle = "rgba(8,14,44,.9)"; ctx.strokeStyle = "#5eead4"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(px_ - 20, py_ - 13, 40, 26, 8) : ctx.rect(px_ - 20, py_ - 13, 40, 26); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#c9fff5"; ctx.font = "600 13px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(tk, px_, py_ + 1);
    });
    cv.style.opacity = on.toFixed(2);
    /* sohbet */
    var u = clamp((t - .04) / .2, 0, 1), b = clamp((t - .28) / .16, 0, 1);
    sc.user.textContent = AI_USER.slice(0, Math.round(AI_USER.length * u)) + (u > 0 && u < 1 ? "▍" : "");
    sc.user.style.opacity = u > 0 ? 1 : 0;
    sc.bot.textContent = AI_BOT.slice(0, Math.round(AI_BOT.length * b)) + (b > 0 && b < 1 ? "▍" : "");
    sc.bot.style.opacity = b > 0 ? 1 : 0;
    sc.steps.forEach(function (li, i) { var k = smooth(.46 + i * .11, .55 + i * .11, t); li.style.opacity = k; li.style.transform = "translateX(" + ((1 - k) * 24) + "px)"; li.classList.toggle("ok", k > .95); });
    sc.chipEls.forEach(function (ch, i) { var k = smooth(.2 + i * .13, .3 + i * .13, t); ch.style.opacity = .3 + .7 * k; ch.classList.toggle("lit", k > .8); });
    sc.chat.style.transform = "translateY(" + ((1 - smooth(0, .12, t)) * 40) + "px)";
  };

  /* =========================================================
     5) FİNAL
     ========================================================= */
  var FINAL = addScene("final", "ANADOLU'DAN EVRENE", 0.925, 1.001, function (sc, el) {
    H("hs-bg grid-bg", "", el);
    sc.box = H("final-box", '<small>YÖRÜKHAN TECH</small><h2><span>Anadolu\'dan</span> <span class="grad-text">Evrene.</span></h2><p>Yapay zekâ destekli dijital deneyimler.</p><em>Aşağı kaydır ve çalışmalarımızı keşfet</em>', el);
    sc.words = Array.prototype.slice.call(sc.box.querySelectorAll("h2 span"));
  });
  FINAL.update = function (t) {
    FINAL.words.forEach(function (w, i) {
      var k = smooth(.1 + i * .2, .4 + i * .2, t);
      w.style.opacity = k; w.style.transform = "translateY(" + ((1 - k) * 50) + "px) scale(" + (.9 + .1 * k) + ")";
    });
    FINAL.box.style.opacity = smooth(0, .1, t);
    FINAL.box.querySelector("p").style.opacity = smooth(.5, .75, t);
    FINAL.box.querySelector("em").style.opacity = smooth(.7, .95, t);
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
    var f = smooth(.64, .66, p) * (1 - smooth(.66, .69, p));
    flash.style.opacity = f.toFixed(3);
    dots.forEach(function (d, i) { d.classList.toggle("on", i === active); });
    rail.style.opacity = p > .08 ? 1 : 0;
    if (active >= 0) {
      hudB.textContent = ("0" + (active + 1)).slice(-2) + " / " + ("0" + scenes.length).slice(-2);
      hudS.textContent = scenes[active].label;
    }
    hud.style.opacity = p > .08 ? 1 : 0;
  }
  window.HeroScenes = { update: update };
})();
