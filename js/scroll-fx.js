/* Yörükhan Tech — masaüstü kaydırma animasyonları
   Sadece geniş ekran + fare varken çalışır (html.fx). Mobilde hiçbir şey yapmaz. */
(function () {
  "use strict";
  var root = document.documentElement;
  if (!root.classList.contains("fx")) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var vh = innerHeight;
  addEventListener("resize", function () { vh = innerHeight; });

  /* üst ilerleme çubuğu */
  var bar = document.createElement("div"); bar.className = "fx-bar"; document.body.appendChild(bar);

  /* kapak elemanları */
  var hero = $("#hero");
  var pin = hero && $(".hero-pin", hero);
  var sky = $(".sl-sky"), land = $(".sl-land"), rocks = $(".sl-rocks");
  var sun = $(".sun-glow"), dark = $(".darken"), orbit = $$(".orbits path");
  var body = $(".hero-body"), panels = $$(".panel"), rail = $$(".rail i");
  var glow = $(".bg-glow");
  var PANEL_AT = [0.40, 0.52, 0.64, 0.76, 0.93];

  /* sayaçlar: 1. görünüşte sayıdan yukarı doğru say */
  $$(".stat b").forEach(function (b) {
    var n = parseInt(b.textContent, 10);
    if (isNaN(n)) return;
    b.dataset.n = n; b.textContent = "0";
    var done = false;
    new IntersectionObserver(function (es, io) {
      if (!es[0].isIntersecting || done) return; done = true; io.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = clamp((t - t0) / 1100, 0, 1); b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .6 }).observe(b);
  });

  /* durum */
  var target = scrollY, cur = scrollY, mx = 0, my = 0, smx = 0, smy = 0, last = scrollY;
  addEventListener("scroll", function () { target = scrollY; }, { passive: true });
  addEventListener("mousemove", function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  var marquee = $(".marquee-track"), timeline = $(".timeline");
  var reveals = $$(".reveal").filter(function (el) { return !el.closest(".hero"); });
  var pageHero = $(".page-hero .container");
  var pageHeroEl = $(".page-hero");

  function tickHero(p, sx, sy) {
    var e = smooth(0, 0.8, p);
    var mxs = sx * 18, mys = sy * 12;
    sky.style.transform   = "translate3d(" + (mxs * .3) + "px," + (mys * .3 - e * 40) + "px,0) scale(" + (1 + e * .22) + ")";
    land.style.transform  = "translate3d(" + (mxs * .8) + "px," + (mys * .8 - e * 10) + "px,0) scale(" + (1 + e * .6) + ")";
    rocks.style.transform = "translate3d(" + (mxs * 1.6) + "px," + (mys * 1.6 + e * 60) + "px,0) scale(" + (1 + e * 1.7) + ")";
    var b = smooth(.28, .6, p);
    sky.style.filter  = "blur(" + (b * 9).toFixed(2) + "px) brightness(" + (1 - b * .3).toFixed(2) + ")";
    land.style.filter = "blur(" + (b * 5).toFixed(2) + "px)";
    rocks.style.opacity = (1 - smooth(.35, .62, p)).toFixed(3);
    /* gün doğumu: ışık yükselir, sonra panellerin arkasında söner */
    var rise = smooth(0, .3, p), fall = 1 - smooth(.34, .62, p);
    sun.style.opacity = (rise * fall * .9).toFixed(3);
    sun.style.transform = "translate3d(0," + (-rise * 16 + "vh") + ",0) scale(" + (.5 + rise * 1.3) + ")";
    dark.style.opacity = smooth(.26, .56, p).toFixed(3);
    var dr = smooth(0, .55, p);
    orbit.forEach(function (o, i) { o.style.strokeDashoffset = (1400 * (1 - clamp(dr * (1.4 - i * .1), 0, 1))).toFixed(1); });
    var out = 1 - smooth(0.02, .13, p);
    body.style.opacity = out.toFixed(3);
    body.style.transform = "translate3d(0," + ((1 - out) * 60) + "px,0)";
    /* paneller */
    var active = 0, best = 9;
    panels.forEach(function (pn, i) {
      var c = PANEL_AT[i], d = p - c, op;
      if (i === panels.length - 1) op = smooth(c - .08, c - .02, p);
      else op = clamp(1 - Math.abs(d) / .065, 0, 1);
      op = op * op * (3 - 2 * op);
      var y = i === panels.length - 1 ? clamp(-d * 900, -40, 400) : -d * 760;
      pn.style.opacity = op.toFixed(3);
      pn.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) scale(" + (.86 + .14 * op).toFixed(3) + ")";
      pn.style.filter = op < .98 ? "blur(" + ((1 - op) * 10).toFixed(1) + "px)" : "none";
      if (Math.abs(d) < best) { best = Math.abs(d); active = i; }
    });
    var show = p > .33;
    rail.forEach(function (r, i) { r.classList.toggle("on", show && i === active); r.style.opacity = show ? 1 : 0; });
    $$(".panel.final h2 span").forEach(function (s, i) {
      var k = smooth(PANEL_AT[4] - .06 + i * .012, PANEL_AT[4] - .02 + i * .012, p);
      s.style.opacity = k.toFixed(3); s.style.transform = "translate3d(0," + ((1 - k) * 40) + "px,0)";
    });
  }

  function frame() {
    cur += (target - cur) * .09;
    if (Math.abs(target - cur) < .05) cur = target;
    smx += (mx - smx) * .06; smy += (my - smy) * .06;
    var vel = cur - last; last = cur;
    window.__boost = Math.min(9, Math.abs(vel) * .08);

    var max = document.documentElement.scrollHeight - vh;
    bar.style.transform = "scaleX(" + (max > 0 ? clamp(cur / max, 0, 1) : 0).toFixed(4) + ")";
    if (glow) glow.style.transform = "translate3d(0," + (-cur * .06) + "px,0)";

    if (hero && cur < hero.offsetHeight + vh) {
      var total = hero.offsetHeight - vh;
      tickHero(clamp(cur / total, 0, 1), smx, smy);
    }

    /* kaydırdıkça ilerleyen kartlar / başlıklar */
    reveals.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var lag = (i % 4) * 26;
      var t = clamp((vh * .96 - r.top - lag) / (vh * .34), 0, 1);
      t = t * t * (3 - 2 * t);
      el.style.opacity = t.toFixed(3);
      el.style.translate = "0 " + ((1 - t) * 70).toFixed(1) + "px";
      el.style.scale = (.94 + .06 * t).toFixed(3);
    });

    /* proje kartı harfi: hafif derinlik */
    $$(".project-cover span").forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      s.style.transform = "translate3d(0," + (((r.top + r.height / 2) - vh / 2) * -.12).toFixed(1) + "px,0)";
    });

    /* teknoloji bandı: kaydırdıkça akar */
    if (marquee) {
      var half = marquee.scrollWidth / 2;
      marquee.style.transform = "translate3d(" + (-((cur * .7) % half)).toFixed(1) + "px,0,0)";
    }

    /* iç sayfa başlığı */
    if (pageHero && cur < vh) {
      pageHero.style.transform = "translate3d(0," + (cur * .28) + "px,0)";
      pageHero.style.opacity = clamp(1 - cur / (vh * .7), 0, 1).toFixed(3);
      pageHeroEl.style.setProperty("--py", (cur * .4) + "px");
    }

    /* hakkımda zaman çizelgesi: çizgi büyür, noktalar yanar */
    if (timeline) {
      var tr = timeline.getBoundingClientRect();
      timeline.style.setProperty("--tl", clamp((vh * .62 - tr.top) / tr.height, 0, 1).toFixed(3));
      $$(".tl-item", timeline).forEach(function (it) { it.classList.toggle("on", it.getBoundingClientRect().top < vh * .62); });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
