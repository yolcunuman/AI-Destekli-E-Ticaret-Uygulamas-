import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const orderSteps = [
  { label: 'Sipariş Alındı', status: ['Hazırlanıyor', 'Kargolandı', 'Kargoda', 'Teslim Edildi'] },
  { label: 'Hazırlanıyor', status: ['Hazırlanıyor', 'Kargolandı', 'Kargoda', 'Teslim Edildi'] },
  { label: 'Kargoda', status: ['Kargolandı', 'Kargoda', 'Teslim Edildi'] },
  { label: 'Teslim Edildi', status: ['Teslim Edildi'] }
];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Siparişler getirilemedi.');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const generateInvoice = (order) => {
    try {
      const doc = new jsPDF();
      
      const cleanText = (text) => {
        return text.replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
                   .replace(/Ü/g, 'U').replace(/ü/g, 'u')
                   .replace(/Ş/g, 'S').replace(/ş/g, 's')
                   .replace(/İ/g, 'I').replace(/ı/g, 'i')
                   .replace(/Ö/g, 'O').replace(/ö/g, 'o')
                   .replace(/Ç/g, 'C').replace(/ç/g, 'c');
      };

      // Başlık
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text("ARTISANA AI E-COMMERCE", 14, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Yapay Zeka Destekli E-Ticaret Otomasyonu", 14, 32);

      // Fatura Başlığı
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text("E-FATURA / SATIS BELGESI", 120, 25);

      // Firma Bilgileri
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Artisana Teknoloji A.S.", 120, 32);
      doc.text("Teknopark Istanbul No: 61", 120, 37);
      doc.text("Vergi No: 6161616161", 120, 42);

      // Çizgi
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 48, 196, 48);

      // Sipariş ve Müşteri Bilgileri
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Siparis Numarasi: ${order._id}`, 14, 58);
      doc.text(`Tarih: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}`, 14, 64);
      doc.text(`Musteri: ${cleanText(user?.adSoyad || 'Musteri')}`, 14, 70);
      doc.text(`Teslimat Adresi: ${cleanText(order.kargoAdresi || '')}`, 14, 76);

      // Kalemler Tablosu
      const tableData = order.siparisKalemleri.map((item, idx) => [
        idx + 1,
        cleanText(item.isim),
        item.adet,
        `${item.fiyat.toLocaleString('tr-TR')} TL`,
        `${(item.fiyat * item.adet).toLocaleString('tr-TR')} TL`
      ]);

      doc.autoTable({
        startY: 85,
        head: [['#', 'Urun Ismi', 'Adet', 'Birim Fiyat', 'Toplam']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 80 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 40, halign: 'right' },
          4: { cellWidth: 40, halign: 'right' }
        }
      });

      // Toplam Tutar Hesaplama ve Gösterme
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text(`Ara Toplam: ${order.toplamTutar.toLocaleString('tr-TR')} TL`, 130, finalY, { align: 'left' });
      doc.text("Kargo Ucreti: 0 TL (Ucretsiz)", 130, finalY + 7, { align: 'left' });
      doc.setFontSize(14); doc.setTextColor(79, 70, 229);
      doc.text(`GENEL TOPLAM: ${order.toplamTutar.toLocaleString('tr-TR')} TL`, 130, finalY + 16, { align: 'left' });

      // Dipnot
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150); 
      doc.text("Bizi tercih ettiginiz icin tesekkur ederiz. Bu belge yapay zeka destekli e-ticaret otomasyonu tarafindan uretilmistir.", 14, 280);

      // İndirme
      doc.save(`Artisana-Fatura-${order._id}.pdf`);
      toast.success('📄 Fatura PDF olarak başarıyla indirildi!');
    } catch (error) {
      console.error("PDF Fatura oluşturulamadı:", error);
      toast.error('Fatura oluşturulurken hata oluştu.');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xl font-medium text-gray-500">Siparişleriniz yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Henüz siparişiniz bulunmuyor</h2>
          <p className="text-gray-500 mb-6">Alışverişe başlamak için ürünlerimize göz atabilirsiniz.</p>
          <Link to="/products" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50/30 px-8 py-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-6">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Sipariş Tarihi</p>
                    <p className="font-extrabold text-gray-900 text-base">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Toplam Tutar</p>
                    <p className="font-extrabold text-indigo-600 text-base">{order.toplamTutar.toLocaleString('tr-TR')} ₺</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Sipariş Durumu</p>
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 shadow-sm">
                      {order.siparisDurumu}
                    </span>
                  </div>
                </div>

                {/* PDF Fatura İndirme Butonu */}
                <button 
                  onClick={() => generateInvoice(order)}
                  className="bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border-2 border-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm active:scale-95 group"
                >
                  <svg className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Faturayı İndir (PDF)
                </button>
              </div>

              <div className="p-8">
                {/* Görsel Kargo Takip Stepper'ı */}
                <div className="mb-8 pb-8 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    Kargo & Teslimat Aşamaları
                  </h4>
                  <div className="flex items-center justify-between max-w-3xl mx-auto relative px-4 sm:px-8">
                    <div className="absolute top-5 left-12 right-12 h-1 bg-gray-200 z-0"></div>
                    
                    {orderSteps.map((step, idx) => {
                      const isCompleted = step.status.includes(order.siparisDurumu);
                      return (
                        <div key={idx} className="flex flex-col items-center relative z-10 w-24">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            isCompleted 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50' 
                              : 'bg-white text-gray-400 border-2 border-gray-200'
                          }`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-xs font-extrabold mt-3 text-center ${isCompleted ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sipariş Kalemleri */}
                <div className="space-y-4 mb-8">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Sipariş İçeriği</h4>
                  {order.siparisKalemleri.map((item, index) => (
                    <div key={index} className="flex items-center gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/80">
                      <img src={item.resimUrl} alt={item.isim} className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm" />
                      <div className="flex-1">
                        <Link to={`/products/${item.urun}`} className="font-bold text-gray-900 hover:text-indigo-600 text-base transition-colors">
                          {item.isim}
                        </Link>
                        <p className="text-gray-500 font-medium text-sm mt-0.5">{item.adet} adet x {item.fiyat.toLocaleString('tr-TR')} ₺</p>
                      </div>
                      <div className="font-extrabold text-gray-900 text-lg">
                        {(item.fiyat * item.adet).toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  ))}
                </div>

                {/* Teslimat Adresi */}
                <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Teslimat Adresi
                    </h4>
                    <p className="text-indigo-950 font-medium text-sm whitespace-pre-wrap mt-1">{order.kargoAdresi}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm text-xs font-bold text-indigo-600 flex items-center gap-1.5 flex-shrink-0">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kargo Bedava
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
