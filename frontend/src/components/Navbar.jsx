import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import CartPanel from './CartPanel';

function Navbar() {
  const [direccion, setDireccion] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    api.get('/config').then(res => {
      setDireccion(res.data?.data?.direccion || '');
    }).catch(() => {});
  }, []);

  return (
    <>
    <nav className="navbar-custom">
      <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
        
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin/login" className="text-decoration-none d-flex" title="Administrador">
            <img src="/gclogo.png" alt="Admin" style={{ height: 65, width: 'auto' }} />
          </Link>

          <Link to="/" className="text-decoration-none text-nowrap" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
            GCinsumos
          </Link>
        </div>

        <span className="d-none d-md-inline fw-bold" style={{ fontSize: '3rem', color: 'var(--text)' }}>
          Catálogo
        </span>

        <div className="d-flex flex-column align-items-end gap-1">
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted fw-semibold d-none d-md-inline">
              Nuestras redes:
            </span>

            <a 
              href="https://www.facebook.com/share/1BPSR6MTCm/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-muted fs-5" 
              title="Facebook"
            >
              <i className="bi bi-facebook"></i>
            </a>

            <a 
              href="https://www.instagram.com/gcinsumos?igsh=MXRscmd3OXN1aXFlOQ==" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-muted fs-5" 
              title="Instagram"
            >
              <i className="bi bi-instagram"></i>
            </a>

            <a 
              href="https://wa.me/5493586546525" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-muted fs-5" 
              title="WhatsApp"
            >
              <i className="bi bi-whatsapp"></i>
            </a>

            <button
              className="btn p-0 border-0 position-relative"
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

          {direccion && (
            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-geo-alt"></i>
              <span>{direccion}</span>
            </div>
          )}
        </div>

      </div>
    </nav>
    <CartPanel show={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;
