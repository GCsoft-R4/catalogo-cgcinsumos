import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar-custom">
      <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
        
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin/login" className="text-decoration-none d-flex" title="Administrador">
            <img src="/gclogo.png" alt="Admin" style={{ height: 50, width: 'auto' }} />
          </Link>

          <Link to="/" className="text-decoration-none text-nowrap" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
            GCinsumos
          </Link>
        </div>

        <span className="d-none d-md-inline fw-bold"           style={{ fontSize: '5rem', color: 'var(--text)' }}>
          Catálogo
        </span>

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

        </div>

      </div>
    </nav>
  );
}

export default Navbar;