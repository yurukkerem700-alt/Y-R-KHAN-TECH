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
  var hud = H("hs-hud", "<b></b><span></span>", pin);
  var rail = H("rail2", "", pin);

  /* =========================================================
     KAPAK DÜNYASINDA GEZİNTİ
     Kapak görselinin kendisi katmanlara ayrılır (bulut/yan dağlar, dağlar, göl, kayalar),
     kamera güneşe doğru ilerlerken her katman farklı hızda yaklaşır.
     ========================================================= */
  var SUN = [864, 745], IMGW = 1672, IMGH = 941;
  function setMask(el, layers, intersect) {
    var v = layers.join(",");
    el.style.webkitMaskImage = v; el.style.maskImage = v;
    el.style.webkitMaskRepeat = el.style.maskRepeat = "no-repeat";
    el.style.webkitMaskSize = el.style.maskSize = "100% 100%";
    if (intersect) { el.style.webkitMaskComposite = "source-in"; el.style.maskComposite = "intersect"; }
  }
  var MASKS = {
    sides: [["linear-gradient(90deg,#000 0,#000 21%,transparent 29%,transparent 71%,#000 79%,#000 100%)", "linear-gradient(180deg,transparent 50%,#000 62%,#000 80%,transparent 85%)"], true],
    mount: [["linear-gradient(180deg,transparent 70%,#000 71.8%,#000 80%,transparent 85.5%)"], false],
    lake: [["linear-gradient(180deg,transparent 79%,#000 85%)"], false],
    rocks: [["linear-gradient(90deg,#000 0,#000 14%,transparent 22%,transparent 80%,#000 89%,#000 100%)", "linear-gradient(180deg,transparent 86%,#000 91%)"], true]
  };
  function buildTour(el) {
    var T = { key: "" };
    T.sky = H("tour-sky", "", el);
    var ss = svg(T.sky), r = rng(21);
    for (var i = 0; i < 90; i++) S("circle", { cx: r() * 1600, cy: r() * 420, r: r() * 1.4 + .3, fill: "#fff", opacity: r() * .7 + .2 }, ss);
    var cd = S("defs", {}, ss), cf = S("filter", { id: "tBlur" + Math.round(Math.random() * 1e6), x: "-30%", y: "-30%", width: "160%", height: "160%" }, cd);
    S("feGaussianBlur", { stdDeviation: 30 }, cf);
    var cg = S("g", { filter: "url(#" + cf.getAttribute("id") + ")" }, ss);
    [[420, 330, 300, 46, "#ff9fd0", .16], [1180, 280, 340, 50, "#b9a2ff", .18], [820, 400, 380, 40, "#ffb7a0", .14]].forEach(function (c) { S("ellipse", { cx: c[0], cy: c[1], rx: c[2], ry: c[3], fill: c[4], opacity: c[5] }, cg); });
    T.warm = H("tour-warm", "", el);
    T.glow = H("tour-glow", "", el);
    T.water = H("tour-water", "", el);
    T.L = {};
    ["sides", "mount", "lake"].forEach(function (n) {
      var d = H("tour-layer", "", el); setMask(d, MASKS[n][0], MASKS[n][1]); T.L[n] = d;
    });
    T.waveSvg = svg(el);
    return T;
  }
  function placeTour(T) {
    var key = VW + "x" + VH; if (T.key === key) return; T.key = key;
    var s = Math.max(VW * 1.8 / IMGW, VH * .42 / 286); T.s = s;
    T.left = VW / 2 - SUN[0] * s; T.top = VH * .6 - SUN[1] * s;
    for (var n in T.L) {
      var d = T.L[n];
      d.style.width = IMGW * s + "px"; d.style.height = IMGH * s + "px"; d.style.left = T.left + "px"; d.style.top = T.top + "px";
      d.style.transformOrigin = SUN[0] * s + "px " + SUN[1] * s + "px";
    }
    var r = VW * .55;
    T.glow.style.cssText += ";width:" + 2 * r + "px;height:" + 2 * r + "px;left:" + (VW / 2 - r) + "px;top:" + (VH * .6 - r) + "px";
  }
  function camTour(T, z, dy) {
    for (var n in T.L) T.L[n].style.transform = "translate3d(0," + ((dy && dy[n]) || 0) + "px,0) scale(" + z[n].toFixed(3) + ")";
  }

  /* ---------- doğal yunuslar ---------- */
  var DOLPHIN = {
    body: "M110 8 C104 4 94 0 84 -6 C80 -16 70 -26 56 -30 C34 -40 4 -44 -26 -36 C-58 -28 -90 -10 -116 10 C-126 -4 -140 -18 -156 -22 C-150 -12 -142 0 -134 10 C-142 16 -150 30 -156 40 C-138 36 -126 28 -116 18 C-84 36 -40 46 6 42 C40 38 70 28 88 14 C96 12 104 12 110 8 Z",
    fin: "M-14 -38 C-6 -62 10 -76 26 -78 C20 -64 22 -50 30 -38 Z",
    flip: "M44 28 C58 48 52 64 34 74 C36 58 30 44 22 36 Z"
  };
  function deform(d, A, ph) {
    return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (m, xs, ys) {
      var x = +xs, y = +ys, w = Math.max(0, (50 - x) / 200);
      return x.toFixed(1) + " " + (y + A * Math.pow(w, 1.4) * Math.sin(ph)).toFixed(1);
    });
  }
  function makeDolphins(parent, n) {
    var list = [], dd = S("defs", {}, parent);
    grad(dd, "dolG", [[0, "#9ff7ff"], [.45, "#3b9cf6"], [1, "#7c5cf0"]]);
    parent.style.filter = "drop-shadow(0 0 9px rgba(45,212,191,.55))";
    for (var i = 0; i < n; i++) {
      var g = S("g", {}, parent), wake = S("path", { fill: "none", stroke: "#c9fff5", "stroke-width": 2.4, "stroke-linecap": "round" }, g);
      var rA = S("ellipse", { fill: "none", stroke: "#bff7ee", "stroke-width": 3 }, g), rB = S("ellipse", { fill: "none", stroke: "#bff7ee", "stroke-width": 3 }, g);
      var drops = []; for (var d = 0; d < 10; d++) drops.push(S("circle", { r: 3.6, fill: "#d9fff8" }, g));
      var dg = S("g", {}, g), bd = S("path", { fill: "url(#dolG)", stroke: "#dffff9", "stroke-width": 2, "stroke-linejoin": "round" }, dg);
      var fn = S("path", { fill: "url(#dolG)", stroke: "#dffff9", "stroke-width": 1.8, "stroke-linejoin": "round" }, dg);
      var fl = S("path", { fill: "url(#dolG)", stroke: "#dffff9", "stroke-width": 1.8, "stroke-linejoin": "round" }, dg);
      var eye = S("circle", { cx: 82, cy: -3, r: 2.8, fill: "#04163a" }, dg);
      list.push({ i: i, P: 3.6 + i * .9, off: i * 1.7, g: g, dg: dg, bd: bd, fn: fn, fl: fl, wake: wake, rA: rA, rB: rB, drops: drops, fin: S("path", { d: DOLPHIN.fin, fill: "url(#dolG)", stroke: "#dffff9", "stroke-width": 1.8, transform: "scale(.5)", opacity: 0 }, g) });
    }
    return list;
  }
  function stepDolphins(list, time, hy, W) {
    list.forEach(function (D) {
      var x = time + D.off, c = Math.floor(x / D.P), u = (x - c * D.P) / D.P, r = rng(c * 977 + D.i * 131 + 7);
      var hw = VW / K / 2, dir = r() < .5 ? -1 : 1, x0 = 800 + (r() * 2 - 1) * hw * .72, dx = dir * (320 + r() * 260) * Math.min(1, hw / 640), hgt = 110 + r() * 100, ys = hy + 85 + r() * 110;
      var sz = .36 + (ys - hy - 60) / 420;
      var jump = u < .46, j = u / .46, tail = Math.sin(time * 7 + D.i);
      D.rA.setAttribute("opacity", 0); D.rB.setAttribute("opacity", 0);
      D.drops.forEach(function (dp) { dp.setAttribute("opacity", 0); });
      if (jump) {
        var px_ = x0 + dx * j, arc = 4 * j * (1 - j), py_ = ys - hgt * arc, vx = dx, vy = -hgt * 4 * (1 - 2 * j);
        var ang = Math.atan2(vy, Math.abs(vx)) * 180 / Math.PI, bend = 22 * (1 - arc) + 10 * tail;
        D.bd.setAttribute("d", deform(DOLPHIN.body, bend, 1.57)); D.fn.setAttribute("d", deform(DOLPHIN.fin, bend, 1.57)); D.fl.setAttribute("d", deform(DOLPHIN.flip, bend, 1.57));
        D.dg.setAttribute("transform", "translate(" + px_.toFixed(1) + "," + py_.toFixed(1) + ") scale(" + dir + ",1) rotate(" + ang.toFixed(1) + ") scale(" + sz.toFixed(2) + ")");
        D.dg.style.opacity = 1; D.fin.setAttribute("opacity", 0); D.wake.setAttribute("opacity", 0);
        /* giriş / çıkış sıçraması */
        [[x0, 0, .18, 1], [x0 + dx, .88, 1, -1]].forEach(function (R, k) {
          var kk = clamp((j - R[1]) / (R[2] - R[1]), 0, 1), on = j >= R[1] - .02 && j <= R[2] + .12, ring = k ? D.rB : D.rA;
          ring.setAttribute("cx", R[0]); ring.setAttribute("cy", ys + 6); ring.setAttribute("rx", (24 + 160 * kk) * sz); ring.setAttribute("ry", (6 + 28 * kk) * sz); ring.setAttribute("opacity", on ? (1 - kk).toFixed(2) : 0);
        });
        D.drops.forEach(function (dp, q) {
          var ex = q % 2 === 0, b0 = ex ? 0 : .86, kk = (j - b0) / .24; if (kk < 0 || kk > 1) return;
          var an = (q / 10) * 3.14 + .2, sp = 60 + (q * 23) % 70, bx = ex ? x0 : x0 + dx;
          dp.setAttribute("cx", (bx + Math.cos(an) * sp * kk * (ex ? 1 : -1) * sz).toFixed(1)); dp.setAttribute("cy", (ys - Math.sin(an) * sp * 1.3 * kk * sz + 240 * kk * kk * sz).toFixed(1));
          dp.setAttribute("opacity", (1 - kk).toFixed(2));
        });
      } else {
        /* su altında yüzüş: sırt yüzgeci yüzeyi keser, arkasında iz bırakır */
        var k2 = (u - .46) / .54, fx = x0 + dx + dir * 150 * k2, fy = ys + 4 + Math.sin(k2 * 12) * 2, a = Math.sin(k2 * Math.PI);
        D.dg.style.opacity = 0;
        D.fin.setAttribute("transform", "translate(" + fx.toFixed(1) + "," + (fy + 10).toFixed(1) + ") scale(" + (dir * sz * .55).toFixed(2) + "," + (sz * .55).toFixed(2) + ")");
        D.fin.setAttribute("opacity", a.toFixed(2));
        var wl = 90 * sz;
        D.wake.setAttribute("d", "M" + fx.toFixed(1) + " " + (fy + 12).toFixed(1) + " l" + (-dir * wl) + " " + (-8 * sz) + " M" + fx.toFixed(1) + " " + (fy + 12).toFixed(1) + " l" + (-dir * wl) + " " + (10 * sz));
        D.wake.setAttribute("opacity", (a * .7).toFixed(2));
      }
    });
  }

  /* =========================================================
     1) GÖL / OKYANUS (kapaktaki sahne) + yunuslar
     ========================================================= */
  var OCEAN = addScene("ocean", "UFUK", 0.108, 0.307, function (sc, el) {
    sc.T = buildTour(el);
    sc.waves = [];
    for (var w = 0; w < (VW < 700 ? 9 : 14); w++) sc.waves.push(S("path", { fill: "none", stroke: "#bff0ff", "stroke-linecap": "round" }, sc.T.waveSvg));
    var sD = svg(el); sc.dol = makeDolphins(sD, 4);
    sc.rocks = H("tour-layer tl-rocks", "", el); setMask(sc.rocks, MASKS.rocks[0], true);
    sc.cap = caption(el, "UFUK", "Ufkun ötesine", "Her büyük fikir, ufuk çizgisinin ötesine bakmakla başlar.", "cap-bottom");
  });
  OCEAN.update = function (t, time) {
    var sc = OCEAN, T = sc.T;
    placeTour(T);
    if (sc.rocks.style.width !== T.L.lake.style.width) { ["width", "height", "left", "top", "transformOrigin"].forEach(function (k) { sc.rocks.style[k] = T.L.lake.style[k]; }); }
    var z = { sides: lerp(1, 1.15, t), mount: lerp(1, 1.35, t), lake: lerp(1, 1.7, t) };
    camTour(T, z); T.warm.style.opacity = "0";
    sc.rocks.style.transform = "translate3d(0," + (t * 160) + "px,0) scale(" + lerp(1, 2.3, t).toFixed(3) + ")";
    T.glow.style.opacity = (.7 + .15 * Math.sin(time * 1.3)).toFixed(2);
    var hy = 450 + (VH * .6 - VH / 2) / K;
    var cam = t * 3.2 + time * .06;
    for (var i = 0; i < sc.waves.length; i++) {
      var u = ((i / sc.waves.length) + cam) % 1; if (u < 0) u += 1;
      var y = hy + 44 + 300 * Math.pow(u, 2.1), amp = 2 + 22 * u * u, wl = 80 + 300 * u, ph = i * 1.9 + time * (.4 + u);
      var d = "M-60 " + y.toFixed(1);
      for (var x = -60; x <= 1700; x += (VW < 700 ? 70 : 40)) d += " L" + x + " " + (y + amp * Math.sin(x / wl * 6.283 + ph)).toFixed(1);
      sc.waves[i].setAttribute("d", d); sc.waves[i].setAttribute("stroke-width", (.5 + 2.2 * u).toFixed(2)); sc.waves[i].setAttribute("opacity", (Math.min(1, u * 4) * .22).toFixed(2));
    }
    stepDolphins(sc.dol, time, hy, 1600);
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
    { n: "Umut", R: 74, r: 4.6, c: "#b9b2a8", a: 1.2, om: 4.2 }, { n: "Azim", R: 112, r: 7.4, c: "#efcf86", a: 4.1, om: 3.1 },
    { n: "Hayal", R: 158, r: 8.2, c: "#3f8cff", a: 2.4, om: 2.5, moon: true }, { n: "Cesaret", R: 206, r: 5.8, c: "#ff6a4a", a: 5.5, om: 2.0 },
    { n: "Vizyon", R: 300, r: 19, c: "#dba36a", a: .5, om: 1.2 }, { n: "Sabır", R: 392, r: 15, c: "#f1d9a2", a: 3.3, om: .95, ring: true },
    { n: "İnanç", R: 478, r: 10.5, c: "#8eeeff", a: 5.9, om: .7 }, { n: "Başarı", R: 556, r: 10, c: "#5f72ff", a: 1.9, om: .55 }
  ];
  var SPACE = addScene("space", "EVREN", 0.289, 0.481, function (sc, el) {
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
    sc.cap = caption(el, "EVREN", "Bulutların ötesinde", "Umut, azim, cesaret… Vizyonumuz gökyüzüyle sınırlı değil.", "cap-bottom");
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
      var zoom = lerp(3, 1, sy), sk = (VW < VH ? VW * .8 / 556 : Math.min(VW * .47 / 556, 1.25)) * zoom, sq = VW < VH ? .62 : .3, sxp = VW / 2, syp = VH * .44, tilt = -.1;
      ctx.save(); ctx.globalAlpha = sy; ctx.translate(sxp, syp); ctx.rotate(tilt);
      ctx.strokeStyle = "rgba(150,170,255,.16)"; ctx.lineWidth = 1;
      PLANETS.forEach(function (p) { ctx.beginPath(); ctx.ellipse(0, 0, p.R * sk, p.R * sk * sq, 0, 0, 6.283); ctx.stroke(); });
      var pos = PLANETS.map(function (p) {
        var ang = p.a + (t * 16 + time * .1) * p.om * .2;
        return { p: p, x: Math.cos(ang) * p.R * sk, y: Math.sin(ang) * p.R * sk * sq, back: Math.sin(ang) < 0 };
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
      if (sy > .92) { ctx.fillStyle = "rgba(255,235,190," + ((sy - .92) / .08 * .9).toFixed(2) + ")"; ctx.font = "700 " + Math.max(12, 13 * sk) + "px Manrope, sans-serif"; ctx.textAlign = "center"; ctx.fillText("Tutku", 0, 40 * sk + 12); }
      ctx.restore();
    }
    sc.cloudSvg.style.transform = "translate3d(0," + (-smooth(0, .3, t) * VH * 1.35) + "px,0)";
    sc.cloudSvg.style.opacity = (1 - smooth(.04, .28, t)).toFixed(3);
    sc.cap.style.opacity = (smooth(.42, .58, t) * (1 - smooth(.86, 1, t))).toFixed(3);
  };


  /* =========================================================
     3) DAĞLAR: kapaktaki zirvelerin arasından geçiş (bulutlardan iniş)
     ========================================================= */
  var MOUNT = addScene("mountains", "ZİRVE", 0.463, 0.626, function (sc, el) {
    sc.T = buildTour(el);
    sc.rocks = H("tour-layer tl-rocks", "", el); setMask(sc.rocks, MASKS.rocks[0], true);
    var cs = svg(el, true), cd = S("defs", {}, cs); sc.cloudSvg = cs;
    var cf = S("filter", { id: "mBlurC", x: "-30%", y: "-30%", width: "160%", height: "160%" }, cd); S("feGaussianBlur", { stdDeviation: 36 }, cf);
    var cg = S("g", { filter: "url(#mBlurC)" }, cs);
    [[200, 300, 460, 120], [800, 420, 560, 130], [1400, 320, 460, 120], [500, 640, 520, 120], [1150, 700, 520, 120], [820, 120, 520, 100]].forEach(function (c, i) {
      S("ellipse", { cx: c[0], cy: c[1], rx: c[2], ry: c[3], fill: i % 2 ? "#ffc0dc" : "#e4d6ff", opacity: .92 }, cg);
    });
    sc.cap = caption(el, "ZİRVE", "Zirvelerden geç", "Her zirve, bir öncekinin üzerine inşa edilir.", "cap-bottom");
  });
  MOUNT.update = function (t, time) {
    var sc = MOUNT, T = sc.T;
    placeTour(T);
    if (sc.rocks.style.width !== T.L.lake.style.width) { ["width", "height", "left", "top", "transformOrigin"].forEach(function (k) { sc.rocks.style[k] = T.L.lake.style[k]; }); }
    var e = smooth(0, 1, t);
    camTour(T, { sides: lerp(1.15, 2.1, e), mount: lerp(1.35, 3.4, e), lake: lerp(1.7, 5, e) });
    sc.rocks.style.transform = "translate3d(0," + lerp(160, 700, e) + "px,0) scale(" + lerp(2.3, 5.5, e).toFixed(3) + ")";
    T.warm.style.opacity = smooth(0, .8, t).toFixed(2);
    T.glow.style.opacity = (.7 + .3 * smooth(.3, 1, t)).toFixed(2);
    T.glow.style.transform = "scale(" + (1 + t * .9).toFixed(2) + ")";
    T.waveSvg.style.opacity = "0";
    var ce = smooth(0, .3, t);
    sc.cloudSvg.style.transform = "translate3d(0," + (-ce * VH * 1.3) + "px,0)";
    sc.cloudSvg.style.opacity = (1 - smooth(.15, .3, t)).toFixed(3);
    sc.cap.style.opacity = (smooth(.18, .3, t) * (1 - smooth(.62, .8, t))).toFixed(3);
  };

  /* 4a — OYUN: retro ızgara */
  var GAME = addScene("game", "OYUN", 0.604, 0.694, function (sc, el) {
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
    var vwU = VW / K / 2, fz = VW < 700 ? 20 : 30; sc.score.setAttribute("font-size", fz); sc.lives.setAttribute("font-size", fz); sc.score.setAttribute("y", VW < 700 ? 150 : 150); sc.score.setAttribute("x", 800 - vwU + 24); sc.lives.setAttribute("x", 800 + vwU - 24);
    var sco = Math.floor(t * 98765); sc.score.textContent = "SCORE " + ("000000" + sco).slice(-6);
    sc.lives.textContent = t > .75 ? "♥ ♥ ♥" : "♥ ♥ ♥";
  };

  /* 4b — WEB: tarayıcı penceresi kuruluyor */
  var WEB = addScene("web", "WEB", 0.676, 0.766, function (sc, el) {
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
  var APP = addScene("app", "UYGULAMA", 0.748, 0.838, function (sc, el) {
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
  var AI = addScene("ai", "YAPAY ZEKÂ", 0.81, 1.0, function (sc, el) {
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
    var S0 = Math.round(Math.min(560, VH * .6, VW * .4));
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

  /* ---------- rail ve HUD ---------- */
  var dots = scenes.map(function () { var i = document.createElement("i"); rail.appendChild(i); return i; });
  var hudB = hud.querySelector("b"), hudS = hud.querySelector("span");

  /* ---------- ana güncelleme ---------- */
  var FADE = .018;
  function update(p, time) {
    var active = -1, bestOp = 0;
    scenes.forEach(function (sc, i) {
      var op = smooth(sc.a, sc.a + FADE, p) * (1 - smooth(sc.b - FADE, sc.b, p));
      if (sc.id === "ai") op = smooth(sc.a, sc.a + FADE, p);
      var show = op > .002;
      if (show !== sc.on) { sc.on = show; sc.el.style.display = show ? "block" : "none"; }
      if (!show) return;
      sc.el.style.opacity = op.toFixed(3);
      var t = clamp((p - sc.a) / (sc.b - sc.a), 0, 1);
      if (sc.update) sc.update(t, time);
      if (op >= bestOp) { bestOp = op; active = i; }
    });
    dots.forEach(function (d, i) { d.classList.toggle("on", i === active); });
    rail.style.opacity = p > .096 ? 1 : 0;
    if (active >= 0) {
      hudB.textContent = ("0" + (active + 1)).slice(-2) + " / " + ("0" + scenes.length).slice(-2);
      hudS.textContent = scenes[active].label;
    }
    hud.style.opacity = p > .096 ? 1 : 0;
  }
  window.HeroScenes = { update: update };
})();
