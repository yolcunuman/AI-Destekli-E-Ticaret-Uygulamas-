import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Token üretme yardımcı fonksiyonu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gizli_anahtar_123', {
    expiresIn: '30d',
  });
};

// @desc    Yeni kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { adSoyad, email, sifre } = req.body;

    // Email kullanılıyor mu kontrolü
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
    }

    // Kullanıcı oluştur
    const user = await User.create({
      adSoyad,
      email,
      sifre
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        adSoyad: user.adSoyad,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Geçersiz kullanıcı verisi' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcı girişi & Token alma
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, sifre } = req.body;

    // Kullanıcıyı email'e göre bul ve şifreyi getirmesini iste (+sifre)
    const user = await User.findOne({ email }).select('+sifre');

    if (user && (await user.matchPassword(sifre))) {
      res.json({
        _id: user._id,
        adSoyad: user.adSoyad,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Şifre Sıfırlama Talebi (Forgot Password)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Bu e-posta adresine ait kullanıcı bulunamadı.' });
    }

    // 15 dakikalık özel sıfırlama tokeni üret
    const resetToken = jwt.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET || 'gizli_anahtar_123', {
      expiresIn: '15m',
    });

    // Simülasyon e-posta linki (Gerçekte Nodemailer vb. ile gönderilir)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    console.log(`[E-POSTA SIMÜLASYONU] Şifre sıfırlama linki: ${resetUrl}`);

    res.json({ 
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (Konsolu kontrol edin).',
      resetToken, // Geliştirme/test kolaylığı için
      resetUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Token ile Şifre Sıfırlama (Reset Password)
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { yeniSifre } = req.body;

    if (!yeniSifre || yeniSifre.length < 6) {
      return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }

    // Tokeni doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar_123');

    if (!decoded || decoded.type !== 'reset') {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş sıfırlama tokeni.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Şifreyi güncelle (User modelindeki pre-save middleware otomatik olarak bcrypt ile hash'leyecektir)
    user.sifre = yeniSifre;
    await user.save();

    res.json({ message: 'Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.' });
  } catch (error) {
    res.status(400).json({ message: 'Geçersiz veya süresi dolmuş bağlantı.' });
  }
};
