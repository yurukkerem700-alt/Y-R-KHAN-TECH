/* Yörükhan Tech — ortak davranışlar: menü, alt bilgi, yıldızlar, animasyonlar */
(function () {
  "use strict";
  var S = window.SITE;
  var page = document.body.dataset.page || "home";

  /* ---------- Menü + Alt bilgi ---------- */
  var links = [
    ["home", "index.html", "Ana Sayfa"],
    ["services", "hizmetler.html", "Hizmetler"],
    ["projects", "projeler.html", "Projeler"],
    ["about", "hakkimda.html", "Hakkımda"],
  ];
  var navItems = links.map(function (l) {
    return '<li><a href="' + l[1] + '"' + (l[0] === page ? ' class="active" aria-current="page"' : "") + ">" + l[2] + "</a></li>";
  }).join("");
  navItems += '<li><a class="cta' + (page === "contact" ? " active" : "") + '" href="iletisim.html">İletişim</a></li>';

  var nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML =
    '<div class="container">' +
    '<a class="brand" href="index.html" aria-label="Yörükhan Tech ana sayfa"><img src="assets/y-mark.webp" alt="" width="60" height="40">' +
    "<span><b>YÖRÜKHAN</b><small>TECH</small></span></a>" +
    '<button class="nav-toggle" aria-label="Menüyü aç" aria-expanded="false" aria-controls="menu"><span></span></button>' +
    '<ul class="nav-links" id="menu">' + navItems + "</ul></div>";
  document.body.prepend(nav);

  var footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML =
    '<div class="container"><div class="footer-grid">' +
    '<div><a class="brand" href="index.html"><img src="assets/y-mark.webp" alt="" width="60" height="40"><span><b>YÖRÜKHAN</b><small>TECH</small></span></a>' +
    '<p style="margin-top:18px;max-width:340px">Yapay zekâ destekli dijital deneyimler. Oyun, web ve uygulama geliştiriyor; talep üzerine özel projeler üretiyoruz.</p>' +
    '<span class="motto">HAYAL ET · İNŞA ET · OYNA · BİRLİKTE</span></div>' +
    '<div><h4>SAYFALAR</h4><ul>' +
    '<li><a href="index.html">Ana Sayfa</a></li><li><a href="hizmetler.html">Hizmetler</a></li><li><a href="projeler.html">Projeler</a></li>' +
    '<li><a href="hakkimda.html">Hakkımda</a></li><li><a href="iletisim.html">İletişim</a></li></ul></div>' +
    '<div><h4>İLETİŞİM</h4><ul>' +
    '<li><a href="mailto:' + S.email + '">' + S.email + "</a></li>" +
    '<li><a href="' + S.instagramUrl + '" target="_blank" rel="noopener">Instagram · @' + S.instagram + "</a></li>" +
    "<li><span>" + S.city + "</span></li></ul></div></div>" +
    '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + " Yörükhan Tech. Tüm hakları saklıdır.</span>" +
    "<span>Kuruluş aşamasında · Dijital çağın yeni yıldızı</span></div></div>";
  document.body.appendChild(footer);

  var toggle = nav.querySelector(".nav-toggle");
  var menu = nav.querySelector(".nav-links");
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Katman: yıldız alanı ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cv = document.createElement("canvas"); cv.id = "stars";
  var glow = document.createElement("div"); glow.className = "bg-glow";
  document.body.prepend(glow); document.body.prepend(cv);
  var ctx = cv.getContext("2d"), stars = [], W, H;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    var n = Math.round((innerWidth * innerHeight) / 9000);
    stars = Array.from({ length: n }, function () {
      return { x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.3 + .3) * dpr, s: Math.random() * .25 + .03, p: Math.random() * 6.28, c: Math.random() < .3 ? "139,92,246" : "120,200,255" };
    });
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(function (s) {
      var a = .35 + .4 * Math.sin(t / 900 + s.p);
      ctx.fillStyle = "rgba(" + s.c + "," + a + ")";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
      if (!reduce) { s.y -= s.s; if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; } }
    });
    if (!reduce) requestAnimationFrame(draw);
  }
  resize(); addEventListener("resize", resize); requestAnimationFrame(draw);

  /* ---------- Kapak parallax (fare + kaydırma) ---------- */
  var layer = document.querySelector(".hero-layer");
  if (layer && !reduce && innerWidth > 760) {
    var mx = 0, my = 0;
    document.addEventListener("mousemove", function (e) { mx = (e.clientX / innerWidth - .5) * 2; my = (e.clientY / innerHeight - .5) * 2; upd(); });
    addEventListener("scroll", upd, { passive: true });
    function upd() { layer.style.transform = "translate3d(" + (mx * -14) + "px," + (my * -10 + scrollY * .18) + "px,0) scale(1.04)"; }
  }

  /* ---------- Kartlarda ışık takibi ---------- */
  document.addEventListener("pointermove", function (e) {
    var c = e.target.closest && e.target.closest(".card");
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
  });

  /* ---------- Kaydırınca beliren öğeler + beceri çubukları ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-w]").forEach(function (b) { b.style.width = b.dataset.w + "%"; });
      io.unobserve(e.target);
    });
  }, { threshold: .15 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- Proje kartları ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function projectCard(p, i) {
    var cover = p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + ' kapak görseli" loading="lazy">' : "<span>" + esc(p.name.charAt(0)) + "</span>";
    var btn = p.url
      ? '<a class="btn btn-ghost" href="' + esc(p.url) + '" target="_blank" rel="noopener">Projeyi Gör →</a>'
      : '<span class="btn btn-ghost disabled">Bağlantı yakında</span>';
    return '<article class="card project reveal d' + (i % 3 + 1) + '" data-name="' + esc((p.name + " " + p.tags.join(" ")).toLowerCase()) + '">' +
      '<div class="project-cover" style="--h:' + p.hue + '">' + cover + "</div>" +
      '<div class="project-body"><div style="margin-bottom:10px">' + p.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>" +
      "<h3>" + esc(p.name) + "</h3><p>" + esc(p.desc) + "</p>" + btn + "</div></article>";
  }
  var all = document.getElementById("project-grid");
  var feat = document.getElementById("featured-grid");
  if (all) {
    all.innerHTML = window.PROJECTS.map(projectCard).join("");
    var q = document.getElementById("project-search"), empty = document.getElementById("project-empty");
    q && q.addEventListener("input", function () {
      var v = q.value.trim().toLowerCase(), shown = 0;
      all.querySelectorAll(".project").forEach(function (c) {
        var ok = c.dataset.name.indexOf(v) > -1; c.style.display = ok ? "" : "none"; if (ok) shown++;
      });
      empty.style.display = shown ? "none" : "block";
    });
  }
  if (feat) feat.innerHTML = window.PROJECTS.filter(function (p) { return p.featured; }).map(projectCard).join("");
  document.querySelectorAll(".project.reveal").forEach(function (el) { io.observe(el); });
  var cnt = document.getElementById("project-count");
  if (cnt) cnt.textContent = window.PROJECTS.length;

  /* ---------- İletişim formu (e-posta uygulamasını açar) ---------- */
  var form = document.getElementById("contact-form");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var body = "Ad Soyad: " + f.get("name") + "\nE-posta: " + f.get("email") + "\nProje türü: " + f.get("type") + "\n\n" + f.get("message");
    location.href = "mailto:" + S.email + "?subject=" + encodeURIComponent("[Yörükhan Tech] " + f.get("type") + " talebi") + "&body=" + encodeURIComponent(body);
  });
})();
