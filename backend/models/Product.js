import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  isim: {
    type: String,
    required: [true, 'Lütfen ürün ismi girin'],
    trim: true
  },
  aciklama: {
    type: String,
    required: [true, 'Lütfen ürün açıklaması girin']
  },
  fiyat: {
    type: Number,
    required: [true, 'Lütfen ürün fiyatı girin'],
    default: 0
  },
  kategori: {
    type: String,
    required: [true, 'Lütfen ürün kategorisi seçin']
  },
  resimUrl: {
    type: String,
    required: [true, 'Lütfen ürün resmi ekleyin'],
    default: 'https://via.placeholder.com/400'
  },
  stokSayisi: {
    type: Number,
    required: true,
    default: 0
  },
  acikArtirmadaMi: {
    type: Boolean,
    default: false
  },
  ortalamaPuan: {
    type: Number,
    default: 0
  },
  yorumSayisi: {
    type: Number,
    default: 0
  },
  bitisTarihi: {
    type: Date
  },
  baslangicFiyati: {
    type: Number,
    default: 0
  },
  enYuksekTeklif: {
    type: Number,
    default: 0
  },
  teklifGecmisi: [
    {
      kullanici: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      adSoyad: String,
      teklifTutari: Number,
      tarih: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

// Full-text arama için index
productSchema.index({ isim: 'text', aciklama: 'text', kategori: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
