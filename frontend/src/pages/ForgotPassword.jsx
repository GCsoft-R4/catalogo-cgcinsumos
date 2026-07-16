import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SEOHead from '../components/SEOHead';

function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post('/forgot-password', { username });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Recuperar contraseña" />
      <div className="login-container">
        <div className="login-card">
          <div className="text-center mb-4">
            <h2>Recuperar contraseña</h2>
            <p className="text-muted">Ingresá tu nombre de usuario</p>
          </div>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {result ? (
            <div>
              <div className="alert alert-success py-2 small">{result.mensaje}</div>
              <div className="text-center mt-3">
                <Link to="/admin/login" className="text-muted small">Volver al inicio de sesión</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Usuario</label>
                <input type="text" id="username" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-accent w-100" disabled={loading}>
                {loading ? 'Generando...' : 'Generar enlace de recuperación'}
              </button>
              <div className="text-center mt-3">
                <Link to="/admin/login" className="text-muted small">Volver al inicio de sesión</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
