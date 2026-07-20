import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      <div className="px-4 mb-3">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 mb-1">
          <img src="/gclogo.png" alt="GC" style={{ height: 32, width: 'auto' }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>GCinsumos</span>
        </Link>
        <div className="d-flex align-items-center justify-content-between">
          <span className="small" style={{ color: 'var(--text-secondary)' }}>Administrador</span>
          <Link to="/" className="text-decoration-none small" style={{ color: 'var(--accent)' }}>
            <i className="bi bi-box-arrow-up-right me-1"></i>Catálogo
          </Link>
        </div>
      </div>
      <nav className="nav flex-column mb-auto">
        <NavLink to="/admin/productos" end className="nav-link">
          <i className="bi bi-box-seam me-2"></i>Productos
        </NavLink>
        <NavLink to="/admin/productos/nuevo" className="nav-link">
          <i className="bi bi-plus-circle me-2"></i>Agregar producto
        </NavLink>
        <NavLink to="/admin/categorias" className="nav-link">
          <i className="bi bi-tags me-2"></i>Categorías
        </NavLink>
        <NavLink to="/admin/imagenes" className="nav-link">
          <i className="bi bi-images me-2"></i>Imágenes
        </NavLink>
        <NavLink to="/admin/usuarios" className="nav-link">
          <i className="bi bi-people me-2"></i>Usuarios
        </NavLink>
        <NavLink to="/admin/visitas" className="nav-link">
          <i className="bi bi-bar-chart me-2"></i>Visitas
        </NavLink>
        <NavLink to="/admin/configuracion" className="nav-link">
          <i className="bi bi-gear me-2"></i>Configuración
        </NavLink>
      </nav>
      <div className="px-4 mt-auto">
        <button onClick={handleLogout} className="btn btn-outline w-100">
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

export default Sidebar;
