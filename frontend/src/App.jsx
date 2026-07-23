import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { FavoritosProvider } from './context/FavoritosContext';
import { setNavigate } from './services/navigation';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Catalogo from './pages/Catalogo';
import ProductoDetalle from './pages/ProductoDetalle';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/ProductForm';
import Categorias from './pages/Categorias';
import Imagenes from './pages/Imagenes';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import Visitas from './pages/Visitas';
import Nosotros from './pages/Nosotros';
import NotFound from './pages/NotFound';

function AppInner() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/nosotros" element={<Nosotros />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<Dashboard />} />
        <Route path="productos/nuevo" element={<ProductForm />} />
        <Route path="productos/editar/:id" element={<ProductForm />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="imagenes" element={<Imagenes />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="visitas" element={<Visitas />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 2500,
        style: {
          borderRadius: '12px',
          background: '#1a1a2e',
          color: '#fff',
          fontSize: '0.9rem',
          padding: '12px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        },
      }}
    />
    <CartProvider>
    <FavoritosProvider>
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
    </FavoritosProvider>
    </CartProvider>
    </HelmetProvider>
  );
}

export default App;
