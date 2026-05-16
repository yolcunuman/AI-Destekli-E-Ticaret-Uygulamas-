import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/orders', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Siparişler alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const exportToCSV = (data, filename) => {
    const bom = '\uFEFF';
    if (!data || !data.length) {
      toast.error('Dışa aktarılacak veri bulunamadı!');
      return;
    }
    
    const headers = Object.keys(data[0]).join(';');
    const rows = data.map(row => {
      return Object.values(row).map(val => {
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(';');
    }).join('\n');
    
    const csvContent = bom + headers + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`📊 ${filename}.csv başarıyla dışa aktarıldı!`);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ siparisDurumu: newStatus })
      });
      const updatedOrder = await res.json();
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      toast.success('Sipariş durumu güncellendi!');
    } catch (error) {
      toast.error('Durum güncellenemedi: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hazırlanıyor': return 'bg-yellow-100 text-yellow-800';
      case 'Kargoda': return 'bg-blue-100 text-blue-800';
      case 'Teslim Edildi': return 'bg-green-100 text-green-800';
      case 'İptal Edildi': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-10">Yükleniyor...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
        <button 
          onClick={() => exportToCSV(
            orders.map(o => ({
              Siparis_ID: o._id,
              Musteri: o.kullanici?.adSoyad || 'Bilinmiyor',
              Tutar: `${o.toplamTutar} TL`,
              Durum: o.siparisDurumu,
              Tarih: new Date(o.createdAt).toLocaleDateString('tr-TR'),
              Adres: o.kargoAdresi
            })), 'Nexia_AI_Tum_Siparisler_Raporu'
          )}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel / CSV İndir
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500">Henüz hiç sipariş bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Sipariş ID</p>
                    <p className="font-mono text-sm font-semibold text-gray-700">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tarih</p>
                    <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Müşteri</p>
                    <p className="font-semibold text-gray-900">{order.kullanici?.adSoyad || 'Bilinmiyor'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Toplam</p>
                    <p className="font-bold text-indigo-600">{order.toplamTutar.toLocaleString('tr-TR')} ₺</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.siparisDurumu)}`}>
                    {order.siparisDurumu}
                  </span>
                  <select
                    value={order.siparisDurumu}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="Hazırlanıyor">Hazırlanıyor</option>
                    <option value="Kargoda">Kargoda</option>
                    <option value="Teslim Edildi">Teslim Edildi</option>
                    <option value="İptal Edildi">İptal Edildi</option>
                  </select>
                </div>
              </div>

              {/* Items */}
              <div className="p-6">
                <div className="space-y-3">
                  {order.siparisKalemleri.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.resimUrl} alt={item.isim} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.isim}</p>
                        <p className="text-sm text-gray-500">{item.adet} adet × {item.fiyat.toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">Kargo Adresi:</span> {order.kargoAdresi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
