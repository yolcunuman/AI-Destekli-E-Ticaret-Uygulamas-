import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import ChatBot from './components/ChatBot';

// Lazy loading ile sayfaları asenkron (ihtiyaç anında) yükle
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));

function Navbar() {
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const cartCount = getCartCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-black text-indigo-600 tracking-tight">AI Store</Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Anasayfa
                </Link>
                <Link to="/products" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Ürünler
                </Link>
              </div>
            </div>

            {/* Sağ alan */}
            <div className="flex items-center gap-3">
              {/* Sepet */}
              <Link to="/cart" className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex justify-center items-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Desktop kullanıcı menüsü */}
              <div className="hidden sm:flex items-center gap-3">
                {user ? (
                  <>
                    <Link to="/my-orders" className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors">Siparişlerim</Link>
                    <Link to="/wishlist" className="text-gray-500 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Favorilerim">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </Link>
                    {user.rol === 'admin' && (
                      <Link to="/admin" className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">Admin Paneli</Link>
                    )}
                    <span className="text-sm font-medium text-gray-400">|</span>
                    <Link to="/profile" className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-200">
                        {user.adSoyad.split(' ').map(n => n[0]).join('')}
                      </div>
                      {user.adSoyad.split(' ')[0]}
                    </Link>
                    <button onClick={logout} className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Giriş Yap
                  </Link>
                )}
              </div>

              {/* Hamburger (mobil) */}
              <button
                id="hamburger-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Menüyü aç/kapat"
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil Drawer Menü */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="px-4 pt-3 pb-4 space-y-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors">Anasayfa</Link>
              <Link to="/products" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors">Ürünler</Link>
              {user ? (
                <>
                  <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors">Siparişlerim</Link>
                  {user.rol === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-indigo-600 bg-indigo-50 font-medium transition-colors">Admin Paneli</Link>
                  )}
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-600 bg-indigo-50 font-medium transition-colors">
                    <div className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {user.adSoyad.split(' ').map(n => n[0]).join('')}
                    </div>
                    Profilim ({user.adSoyad.split(' ')[0]})
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-indigo-600 bg-indigo-50 font-medium transition-colors">Giriş Yap</Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; 2026 AI E-Ticaret. Tüm Hakları Saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
          <Routes>
            {/* Admin Routes - kendi layout'unu kullanır */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
            </Route>

            {/* Public / User Routes */}
            <Route path="/*" element={
              <Layout>
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </Suspense>
              </Layout>
            } />
          </Routes>
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              duration: 3000, 
              style: { background: '#363636', color: '#fff', fontWeight: 'bold', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)' } 
            }} 
          />
          <ChatBot />
        </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
