import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { useTheme } from '../context/ThemeContext';
import { imageUrl } from '../services/api';
import CartPanel from './CartPanel';

function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { nombre_negocio, logo, logo_size, facebook_url, instagram_url, whatsapp_number } = useConfig();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const esNosotros = pathname === '/nosotros';
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fecha = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
    <nav className="navbar-custom">
      <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
        
        <div className="d-flex align-items-center gap-3">
          {!esNosotros && (
            <Link to="/admin/login" className="text-decoration-none d-flex" title="Administrador">
              <img src={logo ? imageUrl(logo) : '/gclogo.png'} alt="Admin" style={{ height: logo_size || 50, width: 'auto' }} />
            </Link>
          )}

          <Link to="/" className="text-decoration-none text-nowrap" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
            {nombre_negocio || 'Mi Negocio'}
          </Link>
        </div>

        {!esNosotros && (
          <span className="d-none d-md-inline fw-bold" style={{ fontSize: '3rem', color: 'var(--text)' }}>
            Catálogo
          </span>
        )}

        <div className="d-flex flex-column align-items-end gap-1">
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted fw-semibold d-none d-md-inline">
              Nuestras redes:
            </span>

            {facebook_url && (
            <a 
              href={facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-muted fs-5" 
              title="Facebook"
            >
              <i className="bi bi-facebook"></i>
            </a>
            )}

            {instagram_url && (
            <a 
              href={instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-muted fs-5" 
              title="Instagram"
            >
              <i className="bi bi-instagram"></i>
            </a>
            )}

            {whatsapp_number && (
            <a
              href={`https://wa.me/${whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-muted fs-5"
              title="WhatsApp"
            >
              <i className="bi bi-whatsapp"></i>
            </a>
            )}

            {!esNosotros && (
            <Link to="/nosotros" className="text-decoration-none text-muted fs-5" title="Nosotros">
              <i className="bi bi-info-circle"></i>
            </Link>
            )}

            <button
              className="btn p-0 border-0 text-muted fs-5"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'}`}></i>
            </button>

            <button
              className="btn p-0 border-0 position-relative text-muted fs-5"
              style={{ color: 'var(--text)', fontSize: '1.25rem' }}
              onClick={() => setCartOpen(true)}
              title="Carrito"
            >
              <i className="bi bi-cart3"></i>
              {totalItems > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          <div className="d-none d-md-flex align-items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <i className="bi bi-clock" style={{ fontSize: '0.7rem' }}></i>
            <span style={{ textTransform: 'capitalize' }}>{fecha}</span>
            <span>&middot;</span>
            <span className="fw-semibold">{hora}</span>
          </div>
        </div>

      </div>
    </nav>
    <CartPanel show={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;
