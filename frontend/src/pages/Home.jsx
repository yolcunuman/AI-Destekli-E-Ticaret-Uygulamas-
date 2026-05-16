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
