import Product from '../models/Product.js';

// @desc    Tüm ürünleri getir (arama, filtre, sayfalama destekli)
// @route   GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=1&limit=12
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 50 } = req.query;

    // Filtre nesnesi oluştur
    const filter = {};

    // Full-text arama
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Kategori filtresi
    if (category && category !== 'Tümü') {
      filter.kategori = category;
    }

    // Fiyat aralığı
    if (minPrice || maxPrice) {
      filter.fiyat = {};
      if (minPrice) filter.fiyat.$gte = Number(minPrice);
      if (maxPrice) filter.fiyat.$lte = Number(maxPrice);
    }

    // Puan filtresi
    if (req.query.minRating) {
      filter.ortalamaPuan = { $gte: Number(req.query.minRating) };
    }

    // Sıralama
    let sortOption = { createdAt: -1 }; // Varsayılan: en yeni
    if (sort === 'fiyat_asc') sortOption = { fiyat: 1 };
    else if (sort === 'fiyat_desc') sortOption = { fiyat: -1 };
    else if (sort === 'puan_desc') sortOption = { ortalamaPuan: -1 };
    else if (sort === 'yorum_desc') sortOption = { yorumSayisi: -1 };

    // Sayfalama
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tek bir ürün getir
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Ürün bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ürün sil (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Ürün silindi' });
    } else {
      res.status(404).json({ message: 'Ürün bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ürün oluştur (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const product = new Product({
      isim: 'Örnek İsim',
      fiyat: 0,
      aciklama: 'Örnek açıklama',
      kategori: 'Örnek Kategori',
      resimUrl: 'https://via.placeholder.com/400',
      stokSayisi: 0,
      acikArtirmadaMi: false
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ürün güncelle (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { isim, fiyat, aciklama, kategori, resimUrl, stokSayisi, acikArtirmadaMi } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.isim = isim || product.isim;
      product.fiyat = fiyat !== undefined ? fiyat : product.fiyat;
      product.aciklama = aciklama || product.aciklama;
      product.kategori = kategori || product.kategori;
      product.resimUrl = resimUrl || product.resimUrl;
      product.stokSayisi = stokSayisi !== undefined ? stokSayisi : product.stokSayisi;
      product.acikArtirmadaMi = acikArtirmadaMi !== undefined ? acikArtirmadaMi : product.acikArtirmadaMi;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Ürün bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
