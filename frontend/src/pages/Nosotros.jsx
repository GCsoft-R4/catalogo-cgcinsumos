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
    <>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, rgba(var(--accent-rgb), 0.7) 100%)',
          padding: '4rem 1.5rem 3rem',
          textAlign: 'center',
        }}
      >
        <img
          src="/gclogo.png"
          alt="Logo"
          style={{
            height: 100,
            marginBottom: 20,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
          }}
        />
        <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          Sobre nosotros
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginTop: 8, maxWidth: 500, margin: '8px auto 0' }}>
          Conocé un poco más de GCinsumos
        </p>
      </div>

      <div style={{ maxWidth: 750, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Sin contenido */}
        {!hasContent && (
          <div className="text-center py-5 my-4" style={{ background: 'rgba(128,128,128,0.03)', borderRadius: 16 }}>
            <i className="bi bi-info-circle" style={{ fontSize: 48, color: 'var(--text-secondary)', opacity: 0.4 }}></i>
            <p className="text-muted mt-3">Esta sección aún no tiene contenido.</p>
            <Link to="/" className="btn btn-accent mt-2">Volver al catálogo</Link>
          </div>
        )}

        {/* Texto principal */}
        {config.nosotros && (
          <div style={{ padding: '2.5rem 0' }}>
            {config.nosotros.split('\n').map((paragraph, i) => (
              <p key={i} style={{ fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Tarjetas de contacto */}
        {(config.telefono || config.horarios) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              margin: '0 0 2.5rem',
            }}
          >
            {config.horarios && (
              <div
                style={{
                  background: 'rgba(128,128,128,0.04)',
                  borderRadius: 14,
                  padding: '1.5rem',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(var(--accent-rgb), 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <i className="bi bi-clock" style={{ fontSize: 22, color: 'var(--accent)' }}></i>
                </div>
                <small style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: 600 }}>Horarios</small>
                <p style={{ margin: '6px 0 0', fontWeight: 600, color: 'var(--text)' }}>{config.horarios}</p>
              </div>
            )}
            {config.telefono && (
              <div
                style={{
                  background: 'rgba(128,128,128,0.04)',
                  borderRadius: 14,
                  padding: '1.5rem',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(var(--accent-rgb), 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <i className="bi bi-telephone" style={{ fontSize: 22, color: 'var(--accent)' }}></i>
                </div>
                <small style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: 600 }}>Teléfono</small>
                <p style={{ margin: '6px 0 0', fontWeight: 600, color: 'var(--text)' }}>{config.telefono}</p>
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="d-flex flex-column align-items-center gap-3 pb-5">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent"
            style={{ gap: 8, padding: '12px 28px', fontWeight: 600 }}
          >
            <i className="bi bi-whatsapp" style={{ fontSize: 18 }}></i>
            Consultanos por WhatsApp
          </a>
          <Link to="/" className="btn btn-outline" style={{ padding: '10px 24px' }}>
            <i className="bi bi-arrow-left me-1"></i>
            Volver al catálogo
          </Link>
        </div>
      </div>
    </>
  );
}

export default Nosotros;
