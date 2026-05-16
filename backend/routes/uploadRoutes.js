import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Sadece .env'de anahtarlar varsa Cloudinary'yi yapılandır
let upload;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'aistore_products',
      allowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
    },
  });
  upload = multer({ storage });
} else {
  // Cloudinary yoksa geçici bellek (mock) kullan
  upload = multer({ storage: multer.memoryStorage() });
}

// Resim yükleme rotası (Sadece Admin)
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && req.file) {
      // Cloudinary'ye başarıyla yüklendi
      res.json({ url: req.file.path });
    } else {
      // Cloudinary kurulu değilse test için mock URL dön (Geliştirme kolaylığı)
      res.json({ url: `https://picsum.photos/seed/${Date.now()}/600/400` });
    }
  } catch (error) {
    res.status(500).json({ message: 'Resim yüklenirken hata oluştu', error: error.message });
  }
});

export default router;
