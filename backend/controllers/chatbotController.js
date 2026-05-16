import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API başlatma
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_API_KEY');

// @desc    Chatbot ile mesajlaşma (Gemini AI Destekli)
// @route   POST /api/chatbot
// @access  Public (opsiyonel auth ile kişisel sorgu)
export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.json({ reply: 'Lütfen bir mesaj yazınız.', type: 'text' });
    }

    // 1. Önce ürün ve sipariş verilerini veritabanından çekelim (AI'a dinamik context sağlamak için)
    const products = await Product.find({}).limit(30); // Katalogdan örnek 30 ürün
    const productContext = products.map(p => `- ${p.isim} (${p.kategori}): ${p.fiyat} ₺ (Stok: ${p.stokSayisi})`).join('\n');

    let orderContext = 'Kullanıcı giriş yapmamış veya geçmiş siparişi bulunmuyor.';
    if (req.user) {
      const lastOrder = await Order.findOne({ kullanici: req.user._id }).sort({ createdAt: -1 });
      if (lastOrder) {
        orderContext = `Kullanıcının son siparişi durumu: "${lastOrder.siparisDurumu}", Toplam Tutar: ${lastOrder.toplamTutar} ₺, Sipariş Tarihi: ${new Date(lastOrder.createdAt).toLocaleDateString('tr-TR')}`;
      }
    }

    // Eğer .env dosyasında GEMINI_API_KEY yoksa, uygulamanın çökmemesi için basit fallback
    if (!process.env.GEMINI_API_KEY) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('sipariş') || lowerMsg.includes('kargo')) {
        return res.json({ reply: `(AI Devre Dışı) ${orderContext}`, type: 'text' });
      }
      return res.json({ reply: '(AI Modülü) Lütfen .env dosyasına GEMINI_API_KEY ekleyin. Şu an sistem kısıtlı çalışmaktadır.', type: 'text' });
    }

    // 2. Gemini AI'a göndereceğimiz Mükemmel Sistem Context'ini (Prompt) hazırlayalım
    const systemPrompt = `
      Sen 'AI Store' adlı premium bir e-ticaret sitesinin zeki ve yardımsever yapay zeka asistanısın. 
      Müşterilere her zaman çok kibar, profesyonel ve kısa/öz cevaplar verirsin. Müşteri sana e-ticaret dışı bir şey sorarsa kibarca reddet.
      
      Şu anki mağaza ürünlerimiz (Canlı Katalog Bilgisi):
      ${productContext}

      Soru soran müşterinin sipariş durumu bilgisi:
      ${orderContext}

      Müşterinin sorusu: "${message}"

      Lütfen kısa, anlaşılır ve doğrudan yardımcı olacak bir Türkçe cevap ver. Ürün öneriyorsan fiyatıyla birlikte tam ismini yaz.
    `;

    // 3. Gemini Modelini Çağır
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // 4. UI tarafı için eşleşen ürünleri çek (Kullanıcı ürün önerisi istediyse kart olarak göstermek için)
    let matchedProducts = [];
    const aramaAnahtar = ['arıyorum', 'istiyorum', 'öner', 'bak', 'ara', 'var mı', 'göster', 'laptop', 'telefon', 'kulaklık', 'ürün'];
    const isProductSearch = aramaAnahtar.some(k => message.toLowerCase().includes(k));

    if (isProductSearch) {
       matchedProducts = await Product.find({
        $or: [
          { isim: { $regex: message.split(' ').filter(w => w.length > 3).join('|'), $options: 'i' } },
          { kategori: { $regex: message.split(' ').filter(w => w.length > 3).join('|'), $options: 'i' } }
        ]
      }).limit(4);
    }

    if (matchedProducts.length > 0) {
      return res.json({
        reply: responseText, // Gemini'nin akıllı metni
        type: 'products',    // UI kartları göstersin diye tip
        products: matchedProducts.map(p => ({
          _id: p._id,
          isim: p.isim,
          fiyat: p.fiyat,
          resimUrl: p.resimUrl,
          kategori: p.kategori
        }))
      });
    }

    // Ürün eşleşmesi yoksa sadece metin dön
    return res.json({
      reply: responseText,
      type: 'text'
    });

  } catch (error) {
    console.error('Gemini API Hatası:', error);
    res.status(500).json({ message: 'Chatbot şu an yoğun veya API bağlantı hatası yaşandı.', type: 'text' });
  }
};
