import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/users', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Kullanıcılar getirilemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
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

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm('Kullanıcı rolünü değiştirmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ rol: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, rol: newRole } : u));
        toast.success('Kullanıcı rolü güncellendi!');
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Rol değiştirilemedi');
      }
    } catch (error) {
      toast.error('Rol değiştirilirken hata oluştu');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
        toast.success('Kullanıcı silindi.');
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Kullanıcı silinemedi');
      }
    } catch (error) {
      toast.error('Kullanıcı silinirken hata oluştu');
    }
  };

  if (loading) return <div className="text-center py-20">Yükleniyor...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <button 
          onClick={() => exportToCSV(
            users.map(u => ({
              Kullanici_ID: u._id,
              Ad_Soyad: u.adSoyad,
              Email: u.email,
              Rol: u.rol,
              Kayit_Tarihi: new Date(u.createdAt).toLocaleDateString('tr-TR')
            })), 'Nexia_AI_Kullanicilar_Raporu'
          )}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel / CSV İndir
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.adSoyad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {u._id !== user._id && (
                      <>
                        <button
                          onClick={() => handleRoleChange(u._id, u.rol === 'admin' ? 'user' : 'admin')}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {u.rol === 'admin' ? 'Yetkiyi Al' : 'Admin Yap'}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </>
                    )}
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
