import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('kisisel'); // kisisel, adres, guvenlik
  
  // Kişisel Bilgiler State
  const [formData, setFormData] = useState({
    adSoyad: user?.adSoyad || '',
    email: user?.email || '',
    telefon: user?.telefon || '+90 555 123 4567'
  });

  // Adres Defteri State
  const [addresses, setAddresses] = useState([
    { id: 1, baslik: 'Ev Adresi', adres: 'Teknopark İstanbul, No: 61, Pendik / İstanbul', secili: true },
    { id: 2, baslik: 'İş Adresi', adres: 'Levent Mah. Büyükdere Cad. No: 123, Şişli / İstanbul', secili: false }
  ]);
  const [newAddress, setNewAddress] = useState({ baslik: '', adres: '' });
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Şifre Değiştirme State
  const [passwordData, setPasswordData] = useState({
    mevcutSifre: '',
    yeniSifre: '',
    yeniSifreTekrar: ''
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success('👤 Kişisel bilgileriniz başarıyla güncellendi!');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.baslik || !newAddress.adres) {
      toast.error('Lütfen tüm adres alanlarını doldurun.');
      return;
    }
    setAddresses([...addresses, { id: Date.now(), baslik: newAddress.baslik, adres: newAddress.adres, secili: false }]);
    setNewAddress({ baslik: '', adres: '' });
    setShowAddAddress(false);
    toast.success('📍 Yeni adres defterinize eklendi!');
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success('Adres silindi.');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordData.yeniSifre !== passwordData.yeniSifreTekrar) {
      toast.error('Yeni şifreler eşleşmiyor!');
      return;
    }
    if (passwordData.yeniSifre.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    toast.success('🔒 Şifreniz başarıyla güncellendi!');
    setPasswordData({ mevcutSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner ve Kullanıcı Başlığı */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-40 sm:h-48 relative">
          <div className="absolute -bottom-16 left-8 sm:left-12 flex items-end gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-black text-4xl">
              {user?.adSoyad ? user.adSoyad.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div className="mb-2 hidden sm:block text-white drop-shadow-md">
              <h1 className="text-3xl font-black">{user?.adSoyad}</h1>
              <p className="text-indigo-100 font-medium text-sm">{user?.email} • {user?.rol === 'admin' ? 'Yönetici' : 'Müşteri'}</p>
            </div>
          </div>
        </div>

        {/* Mobil Kullanıcı Başlığı (Banner Altı) */}
        <div className="sm:hidden px-8 pt-20 pb-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-gray-900">{user?.adSoyad}</h1>
          <p className="text-gray-500 font-medium text-sm">{user?.email} • {user?.rol === 'admin' ? 'Yönetici' : 'Müşteri'}</p>
        </div>

        {/* Sekme Menüsü */}
        <div className="sm:pl-52 px-8 pt-20 sm:pt-4 border-b border-gray-100 flex gap-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('kisisel')}
            className={`pb-4 font-bold text-base transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'kisisel' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            👤 Kişisel Bilgiler
          </button>
          <button 
            onClick={() => setActiveTab('adres')}
            className={`pb-4 font-bold text-base transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'adres' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            📍 Adres Defterim
          </button>
          <button 
            onClick={() => setActiveTab('guvenlik')}
            className={`pb-4 font-bold text-base transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'guvenlik' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            🔒 Hesap Güvenliği
          </button>
        </div>

        {/* Sekme İçerikleri */}
        <div className="p-8 sm:p-12 max-w-4xl">
          {/* 1. Kişisel Bilgiler Sekmesi */}
          {activeTab === 'kisisel' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Profil Bilgilerini Düzenle</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={formData.adSoyad} 
                    onChange={(e) => setFormData({...formData, adSoyad: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-posta Adresi</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefon Numarası</label>
                  <input 
                    type="text" 
                    value={formData.telefon} 
                    onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
              </div>
              <div className="pt-6">
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          )}

          {/* 2. Adres Defteri Sekmesi */}
          {activeTab === 'adres' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-gray-900">Kayıtlı Adreslerim</h2>
                <button 
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Adres Ekle
                </button>
              </div>

              {/* Yeni Adres Formu */}
              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/80 space-y-4 animate-fadeIn">
                  <h3 className="font-extrabold text-gray-900 text-base mb-2">Yeni Adres Tanımla</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Adres Başlığı (Örn: Evim, İş Yerim)</label>
                      <input 
                        type="text" 
                        value={newAddress.baslik} 
                        onChange={(e) => setNewAddress({...newAddress, baslik: e.target.value})}
                        placeholder="Ev Adresim"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none bg-white shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Açık Adres</label>
                      <textarea 
                        rows="3" 
                        value={newAddress.adres} 
                        onChange={(e) => setNewAddress({...newAddress, adres: e.target.value})}
                        placeholder="Mahalle, sokak, no, ilçe, il..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none bg-white shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                    >
                      Adresi Kaydet
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowAddAddress(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}

              {/* Adres Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {addresses.map((a) => (
                  <div key={a.id} className="bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 transition-all flex flex-col justify-between shadow-sm group">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="bg-indigo-50 text-indigo-600 font-extrabold text-xs px-3 py-1 rounded-full">{a.baslik}</span>
                        {a.secili && (
                          <span className="text-xs font-extrabold text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 font-medium text-sm leading-relaxed mb-6">{a.adres}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                      <button 
                        onClick={() => {
                          setAddresses(addresses.map(addr => ({...addr, secili: addr.id === a.id})));
                          toast.success(`📍 "${a.baslik}" varsayılan adres seçildi!`);
                        }}
                        className={`text-xs font-bold transition-colors ${a.secili ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
                      >
                        {a.secili ? '★ Varsayılan Adres' : 'Varsayılan Yap'}
                      </button>
                      <button 
                        onClick={() => handleDeleteAddress(a.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors opacity-80 group-hover:opacity-100"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Hesap Güvenliği Sekmesi */}
          {activeTab === 'guvenlik' && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Şifre Değiştir</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mevcut Şifre</label>
                  <input 
                    type="password" 
                    value={passwordData.mevcutSifre} 
                    onChange={(e) => setPasswordData({...passwordData, mevcutSifre: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yeni Şifre</label>
                  <input 
                    type="password" 
                    value={passwordData.yeniSifre} 
                    onChange={(e) => setPasswordData({...passwordData, yeniSifre: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yeni Şifre (Tekrar)</label>
                  <input 
                    type="password" 
                    value={passwordData.yeniSifreTekrar} 
                    onChange={(e) => setPasswordData({...passwordData, yeniSifreTekrar: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
              </div>
              <div className="pt-6">
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  Şifreyi Güncelle
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
