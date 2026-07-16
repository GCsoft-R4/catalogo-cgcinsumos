import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

function NotFound() {
  return (
    <>
    <SEOHead title="Página no encontrada" />
    <div className="container py-5 text-center" style={{ marginTop: '2rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent)' }}>404</h1>
      <h4 className="mb-3">Página no encontrada</h4>
      <p className="text-muted mb-4">La página que buscás no existe.</p>
      <Link to="/" className="btn btn-accent">Volver al inicio</Link>
    </div>
    </>
  );
}

export default NotFound;
