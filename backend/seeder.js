import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

const mockProducts = [
  // --- ELEKTRONİK ---
  {
    isim: "Akıllı Telefon Pro Max 1TB",
    fiyat: 65999,
    kategori: "Elektronik",
    resimUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Titanyum gövde, profesyonel 48MP kamera sistemi ve yapay zeka destekli işlemcisiyle sınırları zorlayın.",
    stokSayisi: 15,
    ortalamaPuan: 4.8,
    yorumSayisi: 124
  },
  {
    isim: "Gürültü Önleyici Kablosuz Kulaklık ANC Pro",
    fiyat: 5499,
    kategori: "Elektronik",
    resimUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Aktif gürültü engelleme (ANC) teknolojisi, 40 saat pil ömrü ve stüdyo kalitesinde yüksek çözünürlüklü ses.",
    stokSayisi: 45,
    ortalamaPuan: 4.6,
    yorumSayisi: 88
  },
  {
    isim: "Taşınabilir Bluetooth Hoparlör Bass Boom",
    fiyat: 2199,
    kategori: "Elektronik",
    resimUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "IP67 su ve toz geçirmezlik sertifikası, derin bas teknolojisi ve 20 saat kesintisiz müzik deneyimi.",
    stokSayisi: 60,
    ortalamaPuan: 4.5,
    yorumSayisi: 52
  },
  {
    isim: "4K Ultra HD Android Smart OLED TV 65 inç",
    fiyat: 42500,
    kategori: "Elektronik",
    resimUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: true,
    aciklama: "Kendinden aydınlatmalı pikseller, Dolby Vision IQ ve Dolby Atmos ile evinizde sinema salonu atmosferi.",
    stokSayisi: 8,
    ortalamaPuan: 4.9,
    yorumSayisi: 36
  },

  // --- BİLGİSAYAR ---
  {
    isim: "Yüksek Performanslı Oyuncu Laptopu RTX 4080",
    fiyat: 74999,
    kategori: "Bilgisayar",
    resimUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: true,
    aciklama: "16.1 inç 240Hz QHD ekran, Intel Core i9 işlemci, 32GB DDR5 RAM ve 2TB NVMe SSD ile en ağır oyunlarda tam akıcılık.",
    stokSayisi: 4,
    ortalamaPuan: 4.9,
    yorumSayisi: 42
  },
  {
    isim: "Ultrabook Creator Edition M3",
    fiyat: 48500,
    kategori: "Bilgisayar",
    resimUrl: "https://images.unsplash.com/photo-1496181130300-2f6eb2492b7d?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Sadece 1.2 kg ağırlığında, 18 saat pil ömrü sunan, tasarımcılar ve yazılımcılar için özel üretilmiş şaheser.",
    stokSayisi: 12,
    ortalamaPuan: 4.7,
    yorumSayisi: 65
  },
  {
    isim: "Kavisli Ultrawide Oyuncu Monitörü 34 inç",
    fiyat: 16500,
    kategori: "Bilgisayar",
    resimUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "165Hz yenileme hızı, 1ms tepki süresi ve HDR400 desteği ile oyunların ve filmlerin içine girin.",
    stokSayisi: 18,
    ortalamaPuan: 4.6,
    yorumSayisi: 31
  },
  {
    isim: "Mini PC Workstation Octa-Core",
    fiyat: 14200,
    kategori: "Bilgisayar",
    resimUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Avuç içi kadar boyutuyla devasa masaüstü gücü. 16GB RAM ve 1TB SSD ile ofis ve ev için mükemmel çözüm.",
    stokSayisi: 25,
    ortalamaPuan: 4.4,
    yorumSayisi: 19
  },

  // --- BİLGİSAYAR BİLEŞENLERİ ---
  {
    isim: "Mekanik Oyuncu Klavyesi RGB Red Switch",
    fiyat: 2850,
    kategori: "Bilgisayar Bileşenleri",
    resimUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: true,
    aciklama: "Sessiz ve hızlı tepkime veren kırmızı anahtarlar, alüminyum kasa ve tamamen özelleştirilebilir per-key RGB.",
    stokSayisi: 35,
    ortalamaPuan: 4.7,
    yorumSayisi: 95
  },
  {
    isim: "Ultra Hafif Kablosuz Oyuncu Mouse",
    fiyat: 1950,
    kategori: "Bilgisayar Bileşenleri",
    resimUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Sadece 59 gram ağırlık, 26.000 DPI optik sensör ve sıfır gecikmeli 2.4GHz kablosuz bağlantı.",
    stokSayisi: 50,
    ortalamaPuan: 4.8,
    yorumSayisi: 110
  },
  {
    isim: "1TB NVMe M.2 SSD 7000MB/s",
    fiyat: 3200,
    kategori: "Bilgisayar Bileşenleri",
    resimUrl: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "PCIe Gen4 teknolojisi ile saniyeler içinde açılan bilgisayar ve anında yüklenen devasa oyunlar.",
    stokSayisi: 40,
    ortalamaPuan: 4.9,
    yorumSayisi: 78
  },
  {
    isim: "32GB (2x16GB) DDR5 6000MHz RAM Kit",
    fiyat: 4600,
    kategori: "Bilgisayar Bileşenleri",
    resimUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Yüksek frekans ve düşük gecikme değerleriyle sisteminizin potansiyelini tamamen açığa çıkarın.",
    stokSayisi: 22,
    ortalamaPuan: 4.6,
    yorumSayisi: 24
  },

  // --- KAMERA ---
  {
    isim: "Aynasız Dijital Fotoğraf Makinesi 4K",
    fiyat: 38500,
    kategori: "Kamera",
    resimUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "24.2 MP APS-C sensör, hızlı hibrit AF ve vlog çekimleri için dönebilir dokunmatik ekran.",
    stokSayisi: 6,
    ortalamaPuan: 4.8,
    yorumSayisi: 41
  },
  {
    isim: "4K Aksiyon Kamerası Dual Screen",
    fiyat: 11200,
    kategori: "Kamera",
    resimUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: true,
    aciklama: "Gelişmiş titreşim engelleme (HyperSmooth 5.0), 10 metreye kadar su geçirmezlik ve çift ekran kolaylığı.",
    stokSayisi: 14,
    ortalamaPuan: 4.7,
    yorumSayisi: 83
  },
  {
    isim: "Profesyonel Gimbal Sabitleyici 3 Eksenli",
    fiyat: 8400,
    kategori: "Kamera",
    resimUrl: "https://images.unsplash.com/photo-1586191552066-b52fe4efab48?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "DSLR ve aynasız makineler için titreşimsiz, sinematik akıcılıkta video çekim imkanı.",
    stokSayisi: 10,
    ortalamaPuan: 4.5,
    yorumSayisi: 18
  },
  {
    isim: "Kompakt Vlog Kamerası ZV",
    fiyat: 22500,
    kategori: "Kamera",
    resimUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Arka plan bulanıklaştırma butonu, ürün tanıtım modu ve üstün yönlü mikrofonuyla içerik üreticilerinin favorisi.",
    stokSayisi: 9,
    ortalamaPuan: 4.6,
    yorumSayisi: 50
  },

  // --- MOBİLYA ---
  {
    isim: "Ergonomik Fileli Çalışma Koltuğu",
    fiyat: 8500,
    kategori: "Mobilya",
    resimUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "3D hareketli kolçaklar, nefes alabilen terletmez file sırt ve ayarlanabilir dinamik bel desteği.",
    stokSayisi: 16,
    ortalamaPuan: 4.7,
    yorumSayisi: 72
  },
  {
    isim: "Minimalist Ahşap Çalışma Masası 140cm",
    fiyat: 5200,
    kategori: "Mobilya",
    resimUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Doğal masif meşe kaplama tabla ve elektrostatik boyalı çelik ayaklarla zamansız bir ofis şıklığı.",
    stokSayisi: 12,
    ortalamaPuan: 4.6,
    yorumSayisi: 38
  },
  {
    isim: "Elektrikli Yükseklik Ayarlı Akıllı Masa",
    fiyat: 15800,
    kategori: "Mobilya",
    resimUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: true,
    aciklama: "Çift motorlu sessiz mekanizma, 4 farklı hafıza ayarı ve gün boyu hem oturarak hem ayakta çalışma özgürlüğü.",
    stokSayisi: 5,
    ortalamaPuan: 4.9,
    yorumSayisi: 29
  },
  {
    isim: "Modern Kitaplık Ahşap & Metal 5 Raflı",
    fiyat: 3600,
    kategori: "Mobilya",
    resimUrl: "https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Geniş depolama alanı ve endüstriyel tasarımıyla odanızın atmosferini tamamen değiştirecek şık kitaplık.",
    stokSayisi: 20,
    ortalamaPuan: 4.5,
    yorumSayisi: 44
  },

  // --- GİYİLEBİLİR TEKNOLOJİ ---
  {
    isim: "Akıllı Saat Ultra Titanium 49mm",
    fiyat: 14500,
    kategori: "Giyilebilir Teknoloji",
    resimUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Çift frekanslı hassas GPS, 100 metre su geçirmezlik ve zorlu doğa koşullarına dayanıklı titanyum kasa.",
    stokSayisi: 24,
    ortalamaPuan: 4.8,
    yorumSayisi: 156
  },
  {
    isim: "Akıllı Bileklik Fit 8 Amoled Ekran",
    fiyat: 1650,
    kategori: "Giyilebilir Teknoloji",
    resimUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "1.62 inç çerçevesiz AMOLED ekran, 150+ spor modu ve 16 güne varan efsanevi pil ömrü.",
    stokSayisi: 80,
    ortalamaPuan: 4.6,
    yorumSayisi: 210
  },
  {
    isim: "Akıllı Yüzük Health Tracker Gen3",
    fiyat: 8900,
    kategori: "Giyilebilir Teknoloji",
    resimUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: true,
    aciklama: "Parmağınızdan 7/24 vücut ısısı, uyku analizi ve kalp ritmi ölçen ultra hafif titanyum akıllı yüzük.",
    stokSayisi: 15,
    ortalamaPuan: 4.7,
    yorumSayisi: 48
  },
  {
    isim: "Kablosuz Sporcu Kulaklığı Earhook",
    fiyat: 3200,
    kategori: "Giyilebilir Teknoloji",
    resimUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Kulak arkası kanca tasarımı ile en sert antrenmanlarda bile asla düşmeyen, suya dayanıklı ses canavarı.",
    stokSayisi: 32,
    ortalamaPuan: 4.5,
    yorumSayisi: 67
  },

  // --- AKILLI EV ---
  {
    isim: "Akıllı Ev Asistanı & Hoparlör Gen4",
    fiyat: 2400,
    kategori: "Akıllı Ev",
    resimUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Evinizin ışıklarını, robot süpürgesini ve müzik sistemini sadece sesinizle Türkçe olarak yönetin.",
    stokSayisi: 45,
    ortalamaPuan: 4.7,
    yorumSayisi: 135
  },
  {
    isim: "Robot Süpürge & Paspas Mop Pro",
    fiyat: 16500,
    kategori: "Akıllı Ev",
    resimUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: true,
    aciklama: "LDS lazer navigasyon, 4000Pa ultra emiş gücü ve titreşimli mop teknolojisiyle kusursuz temizlik.",
    stokSayisi: 11,
    ortalamaPuan: 4.8,
    yorumSayisi: 92
  },
  {
    isim: "Akıllı LED Ampul RGBW 16 Milyon Renk",
    fiyat: 450,
    kategori: "Akıllı Ev",
    resimUrl: "https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Telefondan kontrol edilebilir, müziğe duyarlı ve sesli asistanlarla tam uyumlu akıllı aydınlatma.",
    stokSayisi: 120,
    ortalamaPuan: 4.6,
    yorumSayisi: 340
  },
  {
    isim: "Akıllı Güvenlik Kamerası 360° 2K",
    fiyat: 1850,
    kategori: "Akıllı Ev",
    resimUrl: "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Yapay zeka insan algılama, gece görüşü ve çift yönlü ses iletimiyle eviniz her an güvende.",
    stokSayisi: 38,
    ortalamaPuan: 4.7,
    yorumSayisi: 81
  },

  // --- KİTAP ---
  {
    isim: "Atomik Alışkanlıklar - James Clear",
    fiyat: 240,
    kategori: "Kitap",
    resimUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Küçük değişikliklerin büyük sonuçlar doğurmasını sağlayan, dünya çapında milyonlar satan kişisel gelişim rehberi.",
    stokSayisi: 70,
    ortalamaPuan: 4.9,
    yorumSayisi: 450
  },
  {
    isim: "Dune Mesihi (Ciltli) - Frank Herbert",
    fiyat: 380,
    kategori: "Kitap",
    resimUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Bilimkurgu edebiyatının en büyük şaheserlerinden Dune serisinin nefes kesici ikinci kitabı özel ciltli baskısıyla.",
    stokSayisi: 28,
    ortalamaPuan: 4.8,
    yorumSayisi: 180
  },
  {
    isim: "Geleceğin Fiziği - Michio Kaku",
    fiyat: 290,
    kategori: "Kitap",
    resimUrl: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Ünlü teorik fizikçi Michio Kaku'dan 2100 yılına kadar teknolojinin ve bilimin hayatımızı nasıl dönüştüreceğine dair çarpıcı öngörüler.",
    stokSayisi: 35,
    ortalamaPuan: 4.7,
    yorumSayisi: 95
  },

  // --- KOZMETİK & KİŞİSEL BAKIM ---
  {
    isim: "C Vitamini Parlatıcı Yüz Serumu 30ml",
    fiyat: 850,
    kategori: "Kozmetik & Kişisel Bakım",
    resimUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Saf C vitamini ve hyalüronik asit içeren formülüyle ciltteki ton eşitsizliklerini giderir, doğal bir ışıltı kazandırır.",
    stokSayisi: 65,
    ortalamaPuan: 4.6,
    yorumSayisi: 230
  },
  {
    isim: "Profesyonel İyonik Saç Kurutma Makinesi",
    fiyat: 3400,
    kategori: "Kozmetik & Kişisel Bakım",
    resimUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Gelişmiş iyon teknolojisi sayesinde elektriklenmeyi önler, saçı yıpratmadan dakikalar içinde kurutur.",
    stokSayisi: 22,
    ortalamaPuan: 4.8,
    yorumSayisi: 112
  },
  {
    isim: "Organik Nemlendirici Gece Kremi 50ml",
    fiyat: 1100,
    kategori: "Kozmetik & Kişisel Bakım",
    resimUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: true,
    aciklama: "Doğal bitkisel özler ve argan yağı ile gece boyunca cildinizi derinlemesine onarır ve hücre yenilenmesini destekler.",
    stokSayisi: 40,
    ortalamaPuan: 4.7,
    yorumSayisi: 145
  },

  // --- SPOR & OUTDOOR ---
  {
    isim: "Profesyonel Kamp Çadırı 4 Kişilik IPX8",
    fiyat: 6800,
    kategori: "Spor & Outdoor",
    resimUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Alüminyum poller, 5000mm su sütunu dayanıklılığı ve rüzgar geçirmez çift katmanlı yapısıyla 4 mevsim tam koruma.",
    stokSayisi: 15,
    ortalamaPuan: 4.9,
    yorumSayisi: 88
  },
  {
    isim: "Doğa Yürüyüşü & Trekking Sırt Çantası 50L",
    fiyat: 2650,
    kategori: "Spor & Outdoor",
    resimUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Ergonomik sırt havalandırma sistemi, yağmurluk hediyeli ve çoklu bölmeleriyle uzun soluklu maceralar için tasarlandı.",
    stokSayisi: 30,
    ortalamaPuan: 4.7,
    yorumSayisi: 74
  },
  {
    isim: "Paslanmaz Çelik Termos 1.2 Litre",
    fiyat: 1450,
    kategori: "Spor & Outdoor",
    resimUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop",
    acikArtirmadaMi: false,
    aciklama: "Çift duvarlı vakum yalıtımı ile içeceklerinizi 24 saat sıcak veya 36 saat soğuk tutma garantisi.",
    stokSayisi: 55,
    ortalamaPuan: 4.8,
    yorumSayisi: 310
  }
];

const importData = async () => {
  try {
    await connectDB();
    
    // Mevcut ürünleri temizle
    await Product.deleteMany(); 
    
    // Yeni zengin veri setini ekle
    await Product.insertMany(mockProducts);
    
    console.log(`📦 Toplam ${mockProducts.length} adet zengin mock ürün başarıyla veritabanına eklendi!`);
    process.exit();
  } catch (error) {
    console.error(`❌ Hata: ${error.message}`);
    process.exit(1);
  }
};

importData();
