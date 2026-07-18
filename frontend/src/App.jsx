import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
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
import NotFound from './pages/NotFound';

function App() {
  return (
    <HelmetProvider>
    <CartProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Catalogo />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
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
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
    </HelmetProvider>
  );
}

export default App;
