import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/wishlist', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setWishlist(data);
        }
      } catch (error) {
        console.error('Favori listesi yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (product) => {
    if (!user) return toast.error("Favorilere eklemek için giriş yapmalısınız.");
    
    try {
      const response = await fetch(`http://localhost:5001/api/wishlist/${product._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        setWishlist(prev => [...prev, product]);
        toast.success(`${product.isim} favorilere eklendi! ❤️`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Hata oluştu');
      }
    } catch (error) {
      console.error('Favorilere eklenemedi:', error);
      toast.error('Favorilere eklenemedi.');
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5001/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        setWishlist(prev => prev.filter(p => p._id !== productId));
        toast.error('Favorilerden çıkarıldı. 💔');
      }
    } catch (error) {
      console.error('Favoriden çıkarılamadı:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p._id === productId);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
