import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { WHATSAPP_NUMBER } from '../utils/constants';

function Nosotros() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    api.get('/config').then(res => setConfig(res.data?.data)).catch(() => {});
  }, []);

  if (!config) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    );
  }

  const hasContent = config.nosotros || config.telefono || config.direccion || config.horarios;

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="text-center mb-5">
        <img src="/gclogo.png" alt="Logo" style={{ height: 70, marginBottom: 16 }} />
        <h1 style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--text)' }}>Nosotros</h1>
        <div style={{ width: 60, height: 3, background: 'var(--accent)', borderRadius: 2, margin: '12px auto 0' }} />
      </div>

      {!hasContent && (
        <div className="text-center py-5">
          <i className="bi bi-info-circle" style={{ fontSize: 48, color: 'var(--text-secondary)', opacity: 0.4 }}></i>
          <p className="text-muted mt-3">Esta sección aún no tiene contenido. El administrador puede cargarlo desde la configuración.</p>
          <Link to="/" className="btn btn-accent mt-2">Volver al catálogo</Link>
        </div>
      )}

      {config.nosotros && (
        <div className="mb-5">
          {config.nosotros.split('\n').map((paragraph, i) => (
            <p key={i} style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {(config.telefono || config.direccion || config.horarios) && (
        <div
          className="p-4"
          style={{
            background: 'rgba(128,128,128,0.04)',
            borderRadius: 12,
            border: '1px solid var(--border)',
          }}
        >
          <h5 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Información de contacto</h5>
          <div className="d-flex flex-column gap-3">
            {config.direccion && (
              <div className="d-flex align-items-start gap-3">
                <i className="bi bi-geo-alt" style={{ fontSize: 20, color: 'var(--accent)', marginTop: 2, minWidth: 24 }}></i>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dirección</small>
                  <span style={{ color: 'var(--text)' }}>{config.direccion}</span>
                </div>
              </div>
            )}
            {config.horarios && (
              <div className="d-flex align-items-start gap-3">
                <i className="bi bi-clock" style={{ fontSize: 20, color: 'var(--accent)', marginTop: 2, minWidth: 24 }}></i>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horarios</small>
                  <span style={{ color: 'var(--text)' }}>{config.horarios}</span>
                </div>
              </div>
            )}
            {config.telefono && (
              <div className="d-flex align-items-start gap-3">
                <i className="bi bi-telephone" style={{ fontSize: 20, color: 'var(--accent)', marginTop: 2, minWidth: 24 }}></i>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono</small>
                  <span style={{ color: 'var(--text)' }}>{config.telefono}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center mt-5">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-accent"
          style={{ gap: 8 }}
        >
          <i className="bi bi-whatsapp"></i>
          Consultanos por WhatsApp
        </a>
      </div>
    </div>
  );
}

export default Nosotros;
