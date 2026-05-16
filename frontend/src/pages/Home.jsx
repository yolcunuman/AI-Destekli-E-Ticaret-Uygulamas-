import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import PersonalRecommendations from '../components/PersonalRecommendations';

export default function Home() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flash Sale Countdown State
  const [flashTimeLeft, setFlashTimeLeft] = useState(3600 * 3 + 45 * 60 + 12); // 3 hours, 45 mins, 12 secs

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/products?limit=4&sort=');
        const data = await response.json();
        setFeaturedProducts(data.products ? data.products.slice(0, 4) : []);
        setLoading(false);
      } catch (error) {
        console.error("Hata:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatFlashTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h: h.toString().padStart(2, '0'), m: m.toString().padStart(2, '0'), s: s.toString().padStart(2, '0') };
  };

  const flashTime = formatFlashTime(flashTimeLeft);

  if (loading) return <div className="text-center py-20">Yükleniyor...</div>;

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
            <span className="block mb-2 text-indigo-200">Yapay Zeka Destekli</span>
            <span className="block text-white">Alışveriş Deneyimi</span>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-6 md:text-xl md:max-w-3xl">
            Sizin için en uygun ürünleri analiz eden yapay zeka algoritmamızla geleceğin alışverişini bugünden deneyimleyin.
          </p>
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10 gap-4">
            <Link to="/products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg">
              Hemen Alışverişe Başla
            </Link>
            <Link to="/register" className="mt-3 sm:mt-0 w-full flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-indigo-600 md:py-4 md:text-lg md:px-10 transition-colors">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>

      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
        {/* Dekoratif Arka Plan Işıkları */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-yellow-300 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <span className="text-5xl animate-bounce">⚡</span>
            <div>
              <span className="bg-yellow-300 text-gray-900 text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm">Sınırlı Süre</span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 tracking-wide">Yapay Zeka Flaş İndirim Şovu</h2>
              <p className="text-pink-100 font-medium text-base mt-0.5">Seçili akıllı ev ve teknoloji ürünlerinde anında %50 net indirim!</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-inner">
              <div className="flex flex-col items-center bg-white text-gray-900 px-4 py-2 rounded-xl shadow-md min-w-[64px]">
                <span className="text-2xl font-black font-mono leading-none">{flashTime.h}</span>
                <span className="text-[10px] font-extrabold uppercase text-gray-500 mt-1">Saat</span>
              </div>
              <span className="text-2xl font-black text-pink-200 animate-pulse">:</span>
              <div className="flex flex-col items-center bg-white text-gray-900 px-4 py-2 rounded-xl shadow-md min-w-[64px]">
                <span className="text-2xl font-black font-mono leading-none">{flashTime.m}</span>
                <span className="text-[10px] font-extrabold uppercase text-gray-500 mt-1">Dakika</span>
              </div>
              <span className="text-2xl font-black text-pink-200 animate-pulse">:</span>
              <div className="flex flex-col items-center bg-white text-gray-900 px-4 py-2 rounded-xl shadow-md min-w-[64px]">
                <span className="text-2xl font-black font-mono leading-none">{flashTime.s}</span>
                <span className="text-[10px] font-extrabold uppercase text-gray-500 mt-1">Saniye</span>
              </div>
            </div>

            <Link 
              to="/products" 
              className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 flex-shrink-0"
            >
              İndirimleri Yakala
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Öne Çıkan Ürünler</h2>
            <p className="text-gray-500 mt-2">Yapay zekanın sizin için seçtiği en iyi ürünler</p>
          </div>
          <Link to="/products" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors hidden sm:block">
            Tümünü Gör &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col h-full group">
              <Link to={`/products/${product._id}`} className="relative h-48 overflow-hidden bg-gray-100 block">
                <img 
                  src={product.resimUrl} 
                  alt={product.isim} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-5 flex flex-col flex-grow">
                <Link to={`/products/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors line-clamp-2">
                    {product.isim}
                  </h3>
                </Link>
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
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
                      <svg className="w-5 h-5" fill={isInWishlist(product._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                      title="Sepete Ekle"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/products" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            Tümünü Gör &rarr;
          </Link>
        </div>
      </div>

      {/* AI Personal Recommendations */}
      <PersonalRecommendations />
    </div>
  );
}
