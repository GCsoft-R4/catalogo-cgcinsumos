import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';

function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/productos" replace />;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin/productos');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEOHead title="Iniciar sesión" />
    <div className="login-container">
      <div className="login-card">
        <div className="text-center mb-4">
          <img src="/gclogo.png" alt="GCinsumos" style={{ height: 56, marginBottom: 8 }} />
          <h2>Iniciar sesión</h2>
          <p className="text-muted">Administrador de catálogo</p>
        </div>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input type="text" id="username" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input type="password" id="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-accent w-100" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="/" className="text-muted small">Volver al catálogo</a>
        </div>
      </div>
    </div>
    </>
  );
}

export default Login;
