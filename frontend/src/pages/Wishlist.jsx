import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, loading, removeFromWishlist } = useWishlist();

  const addAllToCart = () => {
    wishlist.forEach(product => addToCart(product));
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Favori Listesi</h2>
        <p className="text-gray-500 mb-6">Favori listeni görmek için giriş yapman gerekiyor.</p>
        <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-500 mt-4">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Favorilerim</h1>
          <p className="text-gray-500 mt-1">{wishlist.length} ürün</p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={addAllToCart}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Tümünü Sepete Ekle
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Favori listeniz boş</h2>
          <p className="text-gray-500 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek buradan takip edin.</p>
          <Link to="/products" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Ürünlere Göz At
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wishlist.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col group">
              <Link to={`/products/${product._id}`} className="relative h-48 overflow-hidden bg-gray-100 block">
                <img
                  src={product.resimUrl}
                  alt={product.isim}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4 flex flex-col flex-grow">
                <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">{product.kategori}</div>
                <Link to={`/products/${product._id}`}>
                  <h3 className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-3">{product.isim}</h3>
                </Link>
                <div className="mt-auto flex justify-between items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{product.fiyat.toLocaleString('tr-TR')} ₺</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                      title="Sepete Ekle"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      title="Favorilerden Çıkar"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
