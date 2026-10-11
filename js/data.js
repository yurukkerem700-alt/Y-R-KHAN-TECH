/* ==========================================================
   SİTE VERİLERİ — buradan düzenleyin, sayfalar otomatik güncellenir.
   ========================================================== */
window.SITE = {
  email: "yurukkerem700@gmail.com",
  instagram: "kereemyuruk",
  instagramUrl: "https://www.instagram.com/kereemyuruk/",
  founder: "Kerem Yürük",
  city: "Niksar, Tokat",
};

/* Projeler
   url      : projenin canlı bağlantısı (boşsa kartta "Bağlantı yakında" görünür)
   desc     : kısa açıklama
   tags     : etiketler (Oyun, Web, Uygulama, Yapay Zeka ...)
   image    : projenin kendi kapak görseli (adres ya da "assets/projeler/ad.webp")
   logo     : kapak yoksa uygulama simgesi   |   mark: emoji   |   word: yazı logosu
   featured : true ise ana sayfada gösterilir
*/
window.PROJECTS = [
  { name: "Kejder",          hue: 20,  tags: ["Oyun", "HTML5 Canvas"], featured: true,  url: "https://kejder.vercel.app",          image: "https://kejder.vercel.app/og-cover.png", desc: "Börü: Son Kral. Tarayıcıda ücretsiz oynanan ejderha oyunu. İlk adı BÖRÜ: Kovan Savaşları'ydı." },
  { name: "Akvaryum Seferi", hue: 195, tags: ["3D Oyun", "Web"],       featured: true,  url: "https://akvaryumi.vercel.app",       logo: "https://akvaryumi.vercel.app/apple-touch-icon.png", desc: "Online 3D denizaltı oyunu. Tarayıcıdan, indirmeden oynanan etkileşimli bir dünya." },
  { name: "Niksar Turnuva",  hue: 150, tags: ["Web Uygulaması"],       featured: true,  url: "https://niksarturnuva.com",          image: "https://niksarturnuva.com/marka/kapak-1200x630.jpg", desc: "Niksar'daki yerel halı saha turnuvasının canlı yayın, maç ve istatistik takip platformu." },
  { name: "Yörükhan Games",  hue: 215, tags: ["Oyun Portalı"],         featured: false, url: "https://yorukhangameess.vercel.app", image: "https://yorukhangameess.vercel.app/og.png", desc: "Ücretsiz tarayıcı oyunları portalı. İndirme ve üyelik yok; kendi oyununu yükle, herkes oynasın." },
  { name: "Toksikmetre",     hue: 285, tags: ["Web", "Yapay Zekâ"],    featured: false, url: "https://toksikmetre.vercel.app",     mark: "🧪", desc: "İlişkini, arkadaşlığını ve karakterini test et. Yapay zekâ destekli, eğlenceli analizler." },
  { name: "Sabri",           hue: 320, tags: ["Eğlence", "Uygulama"],  featured: false, url: "https://sabri-zeta.vercel.app",      word: "SABRİ", desc: "Ortamların dijital yargıcı. Arkadaş, aile ve çift gruplarına sesli sorular soran sosyal eğlence uygulaması." },
];
