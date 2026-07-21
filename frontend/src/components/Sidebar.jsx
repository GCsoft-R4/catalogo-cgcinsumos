import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Sidebar({ collapsed }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const cls = collapsed ? 'text-center px-0' : 'px-4';
  const linkCls = 'nav-link d-flex align-items-center gap-2 px-3 py-2';

  return (
    <>
      <div className={`mb-3 ${cls}`}>
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 mb-1 justify-content-center">
          <img src="/gclogo.png" alt="GC" style={{ height: 32, width: 'auto' }} />
          {!collapsed && <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>GCinsumos</span>}
        </Link>
        {!collapsed && (
          <div className="d-flex align-items-center justify-content-between">
            <span className="small" style={{ color: 'var(--text-secondary)' }}>Administrador</span>
            <Link to="/" className="text-decoration-none small" style={{ color: 'var(--accent)' }}>
              <i className="bi bi-box-arrow-up-right me-1"></i>Catálogo
            </Link>
          </div>
        )}
      </div>
      <nav className="nav flex-column mb-auto">
        <NavLink to="/admin/productos" end className={linkCls} title={collapsed ? 'Productos' : ''}>
          <i className="bi bi-box-seam fs-5"></i>
          {!collapsed && <span>Productos</span>}
        </NavLink>
        <NavLink to="/admin/productos/nuevo" className={linkCls} title={collapsed ? 'Agregar producto' : ''}>
          <i className="bi bi-plus-circle fs-5"></i>
          {!collapsed && <span>Agregar producto</span>}
        </NavLink>
        <NavLink to="/admin/categorias" className={linkCls} title={collapsed ? 'Categorías' : ''}>
          <i className="bi bi-tags fs-5"></i>
          {!collapsed && <span>Categorías</span>}
        </NavLink>
        <NavLink to="/admin/imagenes" className={linkCls} title={collapsed ? 'Imágenes' : ''}>
          <i className="bi bi-images fs-5"></i>
          {!collapsed && <span>Imágenes</span>}
        </NavLink>
        <NavLink to="/admin/usuarios" className={linkCls} title={collapsed ? 'Usuarios' : ''}>
          <i className="bi bi-people fs-5"></i>
          {!collapsed && <span>Usuarios</span>}
        </NavLink>
        <NavLink to="/admin/visitas" className={linkCls} title={collapsed ? 'Visitas' : ''}>
          <i className="bi bi-bar-chart fs-5"></i>
          {!collapsed && <span>Visitas</span>}
        </NavLink>
        <NavLink to="/admin/configuracion" className={linkCls} title={collapsed ? 'Configuración' : ''}>
          <i className="bi bi-gear fs-5"></i>
          {!collapsed && <span>Configuración</span>}
        </NavLink>
      </nav>
      <div className={`mt-auto ${collapsed ? 'text-center px-1' : 'px-4'}`}>
        <button onClick={handleLogout} className={`btn btn-outline ${collapsed ? 'px-2' : 'w-100'}`} title={collapsed ? 'Cerrar sesión' : ''}>
          <i className={`bi bi-box-arrow-left ${collapsed ? 'fs-5' : 'me-2'}`}></i>
          {!collapsed && 'Cerrar sesión'}
        </button>
      </div>
    </>
  );
}

export default Sidebar;
