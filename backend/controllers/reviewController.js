import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { analyzeSentiment } from '../utils/sentimentAnalyzer.js';

// @desc    Ürüne ait yorumları getir
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ urun: req.params.productId })
      .populate('kullanici', 'adSoyad')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Yorum yaz ve duygu skoru hesapla
// @route   POST /api/reviews/:productId
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { puan, yorumMetni } = req.body;

    // Aynı kullanıcı aynı ürüne tekrar yorum yapmış mı?
    const alreadyReviewed = await Review.findOne({
      kullanici: req.user._id,
      urun: req.params.productId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Bu ürüne zaten yorum yaptınız' });
    }

    // Duygu analizi yap
    const { score } = analyzeSentiment(yorumMetni);

    const review = await Review.create({
      kullanici: req.user._id,
      urun: req.params.productId,
      puan,
      yorumMetni,
      duyguSkoru: score
    });

    // Ürünün ortalamaPuan ve yorumSayisi alanlarını güncelle
    const allReviews = await Review.find({ urun: req.params.productId });
    const yorumSayisi = allReviews.length;
    const ortalamaPuan = allReviews.reduce((acc, r) => acc + r.puan, 0) / yorumSayisi;

    await Product.findByIdAndUpdate(req.params.productId, {
      ortalamaPuan: Math.round(ortalamaPuan * 10) / 10,
      yorumSayisi
    });

    const populatedReview = await Review.findById(review._id).populate('kullanici', 'adSoyad');
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
