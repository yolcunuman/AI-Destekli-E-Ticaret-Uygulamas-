import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'YAPAYZEKA50') {
      setAppliedCoupon({ code: 'YAPAYZEKA50', discountRate: 50 });
      setCouponCode('');
      toast.success('🎉 YAPAYZEKA50 Kuponu Başarıyla Uygulandı! Anında %50 İndirim Kazandınız!');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#ec4899', '#f59e0b', '#10b981']
      });
    } else if (code === 'ARTISANA20') {
      setAppliedCoupon({ code: 'ARTISANA20', discountRate: 20 });
      setCouponCode('');
      toast.success('🎉 ARTISANA20 Kuponu Başarıyla Uygulandı! Anında %20 İndirim Kazandınız!');
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      toast.error('Geçersiz kupon kodu! (İpucu: YAPAYZEKA50 deneyin)');
    }
  };

  const subtotal = getCartTotal();
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountRate) / 100 : 0;
  const finalTotal = subtotal - discountAmount;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Sepetiniz</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center py-24">
          <svg className="mx-auto h-24 w-24 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-2xl text-gray-500 font-medium mb-2">Sepetiniz şu an boş</p>
          <p className="text-gray-400 mb-8">Alışverişe başlamak için ürünler sayfamıza göz atabilirsiniz.</p>
          <Link to="/products" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md">
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Sepetiniz</h2>
        <button 
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 text-sm font-medium underline"
        >
          Sepeti Temizle
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow">
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                <img src={item.resimUrl} alt={item.isim} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow flex flex-col justify-between h-full py-1">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.isim}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">{item.kategori}</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-3.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 font-bold text-gray-900 border-x border-gray-200 min-w-[2.5rem] text-center bg-white">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-3.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-extrabold text-xl text-gray-900">
                      {(item.fiyat * item.quantity).toLocaleString('tr-TR')} ₺
                    </span>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Kaldır
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6">Sipariş Özeti</h3>
            
            {/* Kupon Kodu Paneli */}
            <div className="mb-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 rounded-2xl border border-indigo-100 shadow-inner">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Kupon Kodu (YAPAYZEKA50)
              </h4>

              {appliedCoupon ? (
                <div className="bg-white p-3.5 rounded-xl border border-green-200 flex items-center justify-between shadow-sm animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-extrabold text-gray-900 text-sm">{appliedCoupon.code} (%{appliedCoupon.discountRate} İndirim)</span>
                  </div>
                  <button 
                    onClick={() => { setAppliedCoupon(null); toast.error('Kupon kaldırıldı.'); }} 
                    className="text-red-500 hover:text-red-700 text-xs font-bold underline cursor-pointer"
                  >
                    Kaldır
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value)} 
                    placeholder="YAPAYZEKA50" 
                    className="flex-grow px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold text-gray-900 placeholder-gray-400 uppercase tracking-wider bg-white shadow-sm"
                  />
                  <button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-100 flex items-center gap-1 flex-shrink-0 active:scale-95"
                  >
                    Uygula
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Ara Toplam</span>
                <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-700 font-extrabold bg-green-50 p-3 rounded-xl border border-green-100 animate-bounce">
                  <span>Kupon İndirimi (%{appliedCoupon.discountRate})</span>
                  <span>-{discountAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Kargo</span>
                <span className="text-green-600 font-bold">Ücretsiz</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold text-gray-900">Genel Toplam</span>
                <span className="text-3xl font-black text-indigo-600">
                  {finalTotal.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 active:scale-95"
            >
              Alışverişi Tamamla
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
