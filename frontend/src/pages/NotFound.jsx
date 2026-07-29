import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

function NotFound() {
  return (
    <>
    <SEOHead title="Página no encontrada" />
    <section style={{ padding: '40px 0', background: '#fff', fontFamily: '"Arvo", serif', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div style={{ backgroundImage: 'url(/bg.gif)', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
              <h1 style={{ fontSize: '6rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.3)', margin: 0 }}>404</h1>
            </div>
            <div style={{ marginTop: -30 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Parece que te perdiste</h3>
              <p className="text-muted mb-3">La página que buscás no está disponible.</p>
              <Link to="/" className="btn" style={{ color: '#fff', background: '#39ac31', padding: '10px 24px', fontWeight: 600, borderRadius: 6, textDecoration: 'none' }}>
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

export default NotFound;
