/* ==========================================================
   SİTE VERİLERİ — buradan düzenleyin, sayfalar otomatik güncellenir.
   ========================================================== */
window.SITE = {
  email: "yurukkerem700@gmail.com",
  instagram: "kereemyuruk",
  instagramUrl: "https://www.instagram.com/kereemyuruk/",
  founder: "Kerem Yörük",
  city: "Niksar, Tokat",
};

/* Projeler
   url      : projenin canlı bağlantısı (boşsa kartta "Bağlantı yakında" görünür)
   desc     : kısa açıklama
   tags     : etiketler (Oyun, Web, Uygulama, Yapay Zeka ...)
   image    : (isteğe bağlı) "assets/projeler/ad.webp" gibi kapak görseli
   featured : true ise ana sayfada gösterilir
*/
window.PROJECTS = [
  { name: "USTABAŞI",        hue: 25,  tags: ["Web", "Platform"],  featured: true,  url: "https://ustabasii.com.tr",          image: "", desc: "Esnaf ile müşteriyi buluşturan geniş çaplı platform. C#, ASP.NET Core ve PostgreSQL ile sıfırdan geliştirildi." },
  { name: "Akvaryumi",       hue: 195, tags: ["3D Oyun", "Web"],   featured: true,  url: "https://akvaryumi.vercel.app",      image: "", desc: "YÖRÜKHAN markası altında geliştirilen, tarayıcıda oynanan etkileşimli üç boyutlu akvaryum oyunu." },
  { name: "Niksar Turnuva",  hue: 150, tags: ["Web Uygulaması"],   featured: true,  url: "https://niksarturnuva.com",         image: "", desc: "Niksar'daki yerel amatör futbol turnuvasını yayınlayan, maçları ve istatistikleri dijitalde takip ettiren platform." },
  { name: "Yörükhan Gamess", hue: 215, tags: ["Oyun Portalı"],     featured: false, url: "https://yorukhangameess.vercel.app", image: "", desc: "YÖRÜKHAN markasının oyun portalı. Oyunlarımız bu çatı altında yayınlanıyor." },
  { name: "Toksikmetre",     hue: 285, tags: ["Web"],              featured: false, url: "https://toksikmetre.vercel.app",    image: "", desc: "Yayında olan, kullanıma hazır çalışmalarımızdan biri." },
  { name: "Kejder",          hue: 185, tags: ["Web"],              featured: false, url: "https://kejder.vercel.app",         image: "", desc: "Yayında olan, kullanıma hazır çalışmalarımızdan biri." },
  { name: "Sabri",           hue: 320, tags: ["Web"],              featured: false, url: "https://sabri-zeta.vercel.app",     image: "", desc: "Yayında olan, kullanıma hazır çalışmalarımızdan biri." },
];
