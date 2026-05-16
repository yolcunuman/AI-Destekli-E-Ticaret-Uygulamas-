import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, users: 0 });
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch('http://localhost:5001/api/products?limit=1000'),
          fetch('http://localhost:5001/api/orders', {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          fetch('http://localhost:5001/api/users', {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);

        const productsData = await productsRes.json();
        const products = productsData.products || [];
        const orders = await ordersRes.json();
        const users = await usersRes.json();

        const totalRevenue = orders.reduce((acc, order) => acc + order.toplamTutar, 0);

        setAllProducts(products);
        setAllOrders(orders);
        setStats({
          products: productsData.totalCount || products.length,
          orders: orders.length,
          revenue: totalRevenue,
          users: users.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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

  // Ciro Grafiği Verisi (Son 7 Gün)
  const revenueData = useMemo(() => {
    if (!allOrders.length) return [];
    
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        display: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        ciro: 0
      });
    }

    allOrders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const day = days.find(d => d.dateStr === orderDate);
      if (day) {
        day.ciro += order.toplamTutar;
      }
    });

    return days;
  }, [allOrders]);

  // Kategori Bazlı Satış Dağılımı
  const categoryData = useMemo(() => {
    if (!allOrders.length || !allProducts.length) return [];
    
    const categoryCount = {};
    
    allOrders.forEach(order => {
      order.siparisKalemleri.forEach(item => {
        const product = allProducts.find(p => p._id === item.urun);
        if (product) {
          categoryCount[product.kategori] = (categoryCount[product.kategori] || 0) + item.miktar;
        }
      });
    });

    return Object.keys(categoryCount).map(key => ({
      name: key,
      value: categoryCount[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [allOrders, allProducts]);

  const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  // En Çok Satan 5 Ürün
  const topProducts = useMemo(() => {
    const productSales = {};
    allOrders.forEach(order => {
      order.siparisKalemleri.forEach(item => {
        if (!productSales[item.urun]) {
          productSales[item.urun] = {
            isim: item.isim,
            satisAdedi: 0,
            ciro: 0
          };
        }
        productSales[item.urun].satisAdedi += item.miktar;
        productSales[item.urun].ciro += (item.miktar * item.fiyat);
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.satisAdedi - a.satisAdedi)
      .slice(0, 5);
  }, [allOrders]);

  // Son 5 Sipariş
  const recentOrders = allOrders.slice(0, 5);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Gösterge Paneli (Dashboard)</h1>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => exportToCSV(
              allOrders.map(o => ({
                Siparis_ID: o._id,
                Musteri: o.kullanici?.adSoyad || 'Bilinmiyor',
                Tutar: `${o.toplamTutar} TL`,
                Durum: o.siparisDurumu,
                Tarih: new Date(o.createdAt).toLocaleDateString('tr-TR')
              })), 'Artisana_Siparis_Raporu'
            )}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Sipariş Raporu (CSV)
          </button>
          <button 
            onClick={() => exportToCSV(
              topProducts.map(p => ({
                Urun_Ismi: p.isim,
                Satis_Adedi: p.satisAdedi,
                Ciro: `${p.ciro} TL`
              })), 'Artisana_En_Cok_Satanlar'
            )}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            En Çok Satanlar (CSV)
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Toplam Ürün</p>
            <p className="text-2xl font-black text-gray-900">{stats.products}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Toplam Sipariş</p>
            <p className="text-2xl font-black text-gray-900">{stats.orders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Toplam Ciro</p>
            <p className="text-2xl font-black text-gray-900">{stats.revenue.toLocaleString('tr-TR')} ₺</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Toplam Kullanıcı</p>
            <p className="text-2xl font-black text-gray-900">{stats.users}</p>
          </div>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Son 7 Günlük Ciro</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="display" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(val) => `${val}₺`} />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString('tr-TR')} ₺`, 'Ciro']}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="ciro" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Kategori Satışları</h2>
          <div className="h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} adet`, 'Satış']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Veri bulunamadı</div>
            )}
          </div>
        </div>
      </div>

      {/* Tablolar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Çok Satanlar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">En Çok Satan Ürünler</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adet</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ciro</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.isim}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.satisAdedi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-indigo-600">{p.ciro.toLocaleString('tr-TR')} ₺</td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Henüz satış yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Son Siparişler */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Son 5 Sipariş</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {o.kullanici?.adSoyad || 'Bilinmiyor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        o.siparisDurumu === 'Teslim Edildi' ? 'bg-green-100 text-green-800' : 
                        o.siparisDurumu === 'İptal Edildi' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {o.siparisDurumu}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{o.toplamTutar.toLocaleString('tr-TR')} ₺</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Henüz sipariş yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
