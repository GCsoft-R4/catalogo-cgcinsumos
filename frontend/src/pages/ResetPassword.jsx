import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SEOHead from '../components/SEOHead';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) return setError('Las contraseñas no coinciden');
    if (newPassword.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');

    setLoading(true);
    try {
      await api.post('/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Restablecer contraseña" />
      <div className="login-container">
        <div className="login-card">
          <div className="text-center mb-4">
            <h2>Restablecer contraseña</h2>
            <p className="text-muted">Ingresá tu nueva contraseña</p>
          </div>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {success ? (
            <div>
              <div className="alert alert-success py-2 small">Contraseña actualizada. Redirigiendo al inicio de sesión...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">Nueva contraseña</label>
                <input type="password" id="newPassword" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" className="btn btn-accent w-100" disabled={loading}>
                {loading ? 'Actualizando...' : 'Restablecer contraseña'}
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

export default ResetPassword;
