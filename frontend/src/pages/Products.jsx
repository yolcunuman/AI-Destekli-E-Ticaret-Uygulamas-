import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import SkeletonCard from '../components/SkeletonCard';

// Yıldız bileşeni
function StarRating({ puan, size = 'sm' }) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${starSize} ${star <= Math.round(puan) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Filtre state'leri
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  // Statik kategori listesi (her filtrelemede kaybolmasın)
  const categories = ['Tümü', 'Elektronik', 'Bilgisayar', 'Bilgisayar Bileşenleri', 'Kamera', 'Mobilya', 'Giyilebilir Teknoloji', 'Akıllı Ev'];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory !== 'Tümü') params.set('category', selectedCategory);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (minRating) params.set('minRating', minRating);
      if (sort) params.set('sort', sort);
      params.set('page', page);
      params.set('limit', 12);

      const response = await fetch(`http://localhost:5001/api/products?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, minPrice, maxPrice, minRating, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Kategori değişince sayfayı sıfırla
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  // Arama submit
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setSelectedCategory('Tümü');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('');
    setPage(1);
  };

  const hasActiveFilters = search || selectedCategory !== 'Tümü' || minPrice || maxPrice || minRating || sort;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ürünlerimiz</h1>
        {!loading && (
          <p className="text-gray-500 mt-1">{totalCount} ürün bulundu</p>
        )}
      </div>

      {/* Arama Çubuğu */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              id="product-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ürün, kategori veya özellik ara..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Ara
          </button>
        </div>
      </form>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sol Sidebar — Filtreler */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Filtreler</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Kategori */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Kategori</h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Fiyat Aralığı */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Fiyat Aralığı (₺)</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="min-price"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <span className="text-gray-400 self-center">—</span>
                <input
                  type="number"
                  id="max-price"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* Puan Filtresi */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Müşteri Puanı</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === String(rating)}
                      onChange={() => { setMinRating(String(rating)); setPage(1); }}
                      className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div className="flex items-center">
                      <StarRating puan={rating} size="sm" />
                      <span className="text-sm text-gray-600 ml-1">& Üzeri</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Sıralama */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Sıralama</h3>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">En Yeni</option>
                <option value="fiyat_asc">Fiyat: Düşükten Yükseğe</option>
                <option value="fiyat_desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="puan_desc">En Yüksek Puan</option>
                <option value="yorum_desc">En Çok Değerlendirilen</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Sağ — Ürün Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">Ürün bulunamadı</p>
              <p className="text-gray-400 text-sm mt-1">Farklı filtreler veya arama terimleri deneyin.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product, index) => (
                  <motion.div 
                    key={product._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col h-full group"
                  >
                    <Link to={`/products/${product._id}`} className="relative h-48 overflow-hidden bg-gray-100 block">
                      <img
                        src={product.resimUrl}
                        alt={product.isim}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {product.acikArtirmadaMi && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                          Açık Artırmada
                        </div>
                      )}
                      {product.stokSayisi === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-gray-800 text-sm font-bold px-3 py-1 rounded-full">Stokta Yok</span>
                        </div>
                      )}
                      {product.stokSayisi > 0 && product.stokSayisi <= 5 && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                          Son {product.stokSayisi} adet!
                        </div>
                      )}
                    </Link>
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">
                        {product.kategori}
                      </div>
                      <Link to={`/products/${product._id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors line-clamp-2">
                          {product.isim}
                        </h3>
                      </Link>

                      {/* Puan */}
                      {product.yorumSayisi > 0 && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <StarRating puan={product.ortalamaPuan} />
                          <span className="text-xs text-gray-500">
                            {product.ortalamaPuan} ({product.yorumSayisi})
                          </span>
                        </div>
                      )}

                      <div className="mt-auto pt-3 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          {product.fiyat.toLocaleString('tr-TR')} ₺
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                            className={`p-2 rounded-lg transition-colors ${
                              isInWishlist(product._id)
                                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                            title="Favorilere Ekle/Çıkar"
                          >
                            <svg className="w-4 h-4" fill={isInWishlist(product._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stokSayisi === 0}
                            className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex items-center gap-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Önceki
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="text-gray-400">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Sonraki →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
