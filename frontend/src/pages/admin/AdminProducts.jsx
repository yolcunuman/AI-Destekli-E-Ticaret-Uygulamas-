import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    isim: '', fiyat: '', aciklama: '', kategori: '', resimUrl: '', stokSayisi: '', acikArtirmadaMi: false
  });
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append('image', file);
    setUploading(true);

    try {
      const res = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: imgData
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ ...formData, resimUrl: data.url });
      } else {
        alert(data.message || 'Resim yüklenemedi');
      }
    } catch (error) {
      alert('Resim yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Ürünler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      alert('Silme işlemi başarısız: ' + error.message);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });
      const newProduct = await res.json();
      setEditingProduct(newProduct._id);
      setFormData({
        isim: newProduct.isim,
        fiyat: newProduct.fiyat,
        aciklama: newProduct.aciklama,
        kategori: newProduct.kategori,
        resimUrl: newProduct.resimUrl,
        stokSayisi: newProduct.stokSayisi,
        acikArtirmadaMi: newProduct.acikArtirmadaMi
      });
      setProducts(prev => [newProduct, ...prev]);
    } catch (error) {
      alert('Ürün oluşturulamadı: ' + error.message);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setFormData({
      isim: product.isim,
      fiyat: product.fiyat,
      aciklama: product.aciklama || '',
      kategori: product.kategori,
      resimUrl: product.resimUrl,
      stokSayisi: product.stokSayisi,
      acikArtirmadaMi: product.acikArtirmadaMi
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/products/${editingProduct}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...formData,
          fiyat: Number(formData.fiyat),
          stokSayisi: Number(formData.stokSayisi)
        })
      });
      const updatedProduct = await res.json();
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      setEditingProduct(null);
    } catch (error) {
      alert('Güncelleme başarısız: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-10">Yükleniyor...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => exportToCSV(
              products.map(p => ({
                Urun_ID: p._id,
                Isim: p.isim,
                Kategori: p.kategori,
                Fiyat: `${p.fiyat} TL`,
                Stok: p.stokSayisi,
                Acik_Artirmada: p.acikArtirmadaMi ? 'Evet' : 'Hayir'
              })), 'Artisana_Urunler_Raporu'
            )}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel / CSV İndir
          </button>
          <button
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Ürünü Düzenle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün İsmi</label>
                <input type="text" value={formData.isim} onChange={(e) => setFormData({...formData, isim: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                  <input type="number" value={formData.fiyat} onChange={(e) => setFormData({...formData, fiyat: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                  <input type="number" value={formData.stokSayisi} onChange={(e) => setFormData({...formData, stokSayisi: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input type="text" value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Resmi</label>
                <div className="flex items-center gap-4">
                  {formData.resimUrl && (
                    <img src={formData.resimUrl} alt="Önizleme" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  )}
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                      <span className="text-sm font-medium text-gray-600">
                        {uploading ? 'Yükleniyor...' : 'Bilgisayardan Resim Seç'}
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea rows="3" value={formData.aciklama} onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="acikArtirma" checked={formData.acikArtirmadaMi} onChange={(e) => setFormData({...formData, acikArtirmadaMi: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 rounded" />
                <label htmlFor="acikArtirma" className="text-sm font-medium text-gray-700">Açık Artırmada</label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleUpdate} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                Kaydet
              </button>
              <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={product.resimUrl} alt={product.isim} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.isim}</p>
                        {product.acikArtirmadaMi && (
                          <span className="text-xs text-orange-600 font-bold">🔥 Açık Artırmada</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">{product.kategori}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{product.fiyat.toLocaleString('tr-TR')} ₺</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${product.stokSayisi > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stokSayisi}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditClick(product)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        Düzenle
                      </button>
                      <button onClick={() => handleDelete(product._id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
