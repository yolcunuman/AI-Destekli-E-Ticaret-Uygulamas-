import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Adres, 2: Ödeme, 3: Onay
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
    if (cartItems.length === 0) navigate('/cart');
  }, [user, cartItems, navigate]);

  if (!user || cartItems.length === 0) return null;

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!address.trim()) return setError('Lütfen kargo adresi giriniz.');
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        return setError('Lütfen tüm kart bilgilerini doldurunuz.');
      }
      setError('');
      setStep(3);
    }
  };

  const handleOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Ödeme Oturumu Başlat (Simülasyon)
      const paySessionRes = await fetch('http://localhost:5001/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          toplamTutar: getCartTotal(),
          kargoAdresi: address
        })
      });
      const paySessionData = await paySessionRes.json();
      
      if (!paySessionRes.ok || !paySessionData.success) {
        throw new Error('Ödeme oturumu başlatılamadı.');
      }

      // 2. Ödemeyi Doğrula (Simülasyon)
      const verifyRes = await fetch('http://localhost:5001/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ token: paySessionData.token })
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error('Ödeme reddedildi.');
      }

      // 3. Siparişi Oluştur
      const orderData = {
        // Backend'de "miktar" kullanılıyordu (item.quantity), orderController'da item.miktar aranıyor:
        siparisKalemleri: cartItems.map(item => ({
          isim: item.isim,
          miktar: item.quantity,
          resimUrl: item.resimUrl,
          fiyat: item.fiyat,
          urun: item._id
        })),
        kargoAdresi: address,
        toplamTutar: getCartTotal()
      };

      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(orderData)
      });

      const respData = await response.json();
      if (!response.ok) {
        throw new Error(respData.message || 'Sipariş oluşturulurken bir hata oluştu.');
      }

      clearCart();
      navigate('/my-orders');
    } catch (err) {
      setError(err.message);
      setStep(2); // Hata varsa ödeme adımına dön
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Güvenli Ödeme</h1>
      
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between max-w-2xl mx-auto">
        {['Adres Bilgileri', 'Ödeme', 'Onay'].map((label, index) => {
          const stepNum = index + 1;
          const isActive = step >= stepNum;
          return (
            <div key={stepNum} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {stepNum}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm border border-red-200">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextStep} className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6">Teslimat Bilgileri</h2>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Kargo Adresi</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Açık adresinizi, ilçe ve il bilgisini giriniz..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Ödeme Adımına Geç
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep} className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6">Kredi/Banka Kartı Bilgileri</h2>
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm border border-blue-100">
                <p className="font-bold mb-1">Simülasyon Modu</p>
                <p>Gerçek kart bilgisi girmeyiniz. Geliştirme aşaması için ödeme simüle edilecektir.</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Kart Üzerindeki İsim</label>
                  <input type="text" required value={cardName} onChange={e => setCardName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Ad Soyad" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Kart Numarası</label>
                  <input type="text" required maxLength="16" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="1234 5678 1234 5678" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">Son Kullanma (AA/YY)</label>
                    <input type="text" required maxLength="5" value={expiry} onChange={e => setExpiry(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="12/25" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">CVV</label>
                    <input type="text" required maxLength="3" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="123" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  Geri
                </button>
                <button type="submit"
                  className="w-2/3 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  Devam Et
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="animate-fade-in text-center">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Siparişiniz Hazır!</h2>
              <p className="text-gray-500 mb-8">Kart bilgileriniz doğrulandı. Siparişinizi onaylamak için aşağıdaki butona tıklayın.</p>
              
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} disabled={loading}
                  className="w-1/3 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Geri
                </button>
                <button onClick={handleOrder} disabled={loading}
                  className="w-2/3 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2">
                  {loading ? (
                    <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> İşleniyor...</>
                  ) : (
                    `Onayla ve Öde (${getCartTotal().toLocaleString('tr-TR')} ₺)`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item._id} className="flex gap-4">
                  <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    <img src={item.resimUrl} alt={item.isim} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.isim}</h4>
                    <p className="text-sm text-gray-500">{item.quantity} adet x {item.fiyat.toLocaleString('tr-TR')} ₺</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>{getCartTotal().toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span className="text-green-600 font-medium">Ücretsiz</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Ödenecek Tutar</span>
                <span className="text-2xl font-black text-indigo-600">{getCartTotal().toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
