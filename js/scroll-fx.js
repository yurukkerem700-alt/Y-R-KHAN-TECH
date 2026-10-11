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
  var body = $(".hero-body"), coverEl = $(".scene");
  var glow = $(".bg-glow");

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
    /* ilk %12: kapak görseli katmanlı yakınlaşır, sonra okyanus sahnesine geçer */
    var q = clamp(p / 0.12, 0, 1), e = smooth(0, 1, q);
    var cover = 1 - smooth(.07, .125, p);
    coverEl.style.display = cover > .002 ? "block" : "none";
    if (cover > .002) {
      coverEl.style.opacity = cover.toFixed(3);
      var mxs = sx * 18, mys = sy * 12;
      sky.style.transform   = "translate3d(" + (mxs * .3) + "px," + (mys * .3 - e * 40) + "px,0) scale(" + (1 + e * .22) + ")";
      land.style.transform  = "translate3d(" + (mxs * .8) + "px," + (mys * .8 - e * 10) + "px,0) scale(" + (1 + e * .6) + ")";
      rocks.style.transform = "translate3d(" + (mxs * 1.6) + "px," + (mys * 1.6 + e * 60) + "px,0) scale(" + (1 + e * 1.7) + ")";
      rocks.style.opacity = (1 - smooth(.04, .09, p)).toFixed(3);
      var rise = smooth(0, .09, p);
      sun.style.opacity = (rise * .9).toFixed(3);
      sun.style.transform = "translate3d(0," + (-rise * 10 + "vh") + ",0) scale(" + (.5 + rise * 1.1) + ")";
      dark.style.opacity = "0";
      var dr = smooth(0, .09, p);
      orbit.forEach(function (o, i) { o.style.strokeDashoffset = (1400 * (1 - clamp(dr * (1.4 - i * .1), 0, 1))).toFixed(1); });
    }
    var out = 1 - smooth(0.01, .05, p);
    body.style.opacity = out.toFixed(3);
    body.style.transform = "translate3d(0," + ((1 - out) * 60) + "px,0)";
    if (window.HeroScenes) window.HeroScenes.update(p, performance.now() / 1000);
  }

  var lastTs = performance.now();
  function frame(ts) {
    var dt = Math.min(.1, ((ts || performance.now()) - lastTs) / 1000); lastTs = ts || performance.now();
    cur += (target - cur) * (1 - Math.exp(-dt * 6));
    if (Math.abs(target - cur) < .05) cur = target;
    smx += (mx - smx) * (1 - Math.exp(-dt * 4)); smy += (my - smy) * (1 - Math.exp(-dt * 4));
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
