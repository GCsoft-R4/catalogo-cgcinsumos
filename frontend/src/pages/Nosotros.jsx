import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { WHATSAPP_NUMBER } from '../utils/constants';

const STATS = [
  { icon: 'bi-calendar-check', value: '10+', label: 'Años de experiencia' },
  { icon: 'bi-box-seam', value: '500+', label: 'Productos disponibles' },
  { icon: 'bi-people', value: '1000+', label: 'Clientes satisfechos' },
  { icon: 'bi-truck', value: '100%', label: 'Envíos a todo el país' },
];

const VALUES = [
  { icon: 'bi-shield-check', title: 'Confianza', text: 'Cada producto que vendemos está respaldado por nuestra garantía y experiencia en el rubro.' },
  { icon: 'bi-lightning-charge', title: 'Rapidez', text: 'Despachos ágiles para que recibas tu compra lo antes posible, donde estés.' },
  { icon: 'bi-headset', title: 'Atención personalizada', text: 'Respondemos tus consultas por WhatsApp con la dedicación que merecés.' },
];

function StatCard({ icon, value, label }) {
  return (
    <div style={{ textAlign: 'center', flex: '1 1 140px' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: 24, color: 'var(--accent)' }}></i>
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ValueCard({ icon, title, text }) {
  return (
    <div
      style={{
        background: 'rgba(128,128,128,0.03)',
        borderRadius: 16,
        padding: '2rem 1.5rem',
        border: '1px solid var(--border)',
        textAlign: 'center',
        flex: '1 1 200px',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'rgba(var(--accent-rgb), 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
        }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: 24, color: 'var(--accent)' }}></i>
      </div>
      <h5 style={{ fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>{title}</h5>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

function ContactCard({ icon, label, value }) {
  return (
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
        <i className={`bi ${icon}`} style={{ fontSize: 22, color: 'var(--accent)' }}></i>
      </div>
      <small style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</small>
      <p style={{ margin: '6px 0 0', fontWeight: 600, color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

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
          background: 'linear-gradient(135deg, var(--accent) 0%, rgba(var(--accent-rgb), 0.65) 100%)',
          padding: '4.5rem 1.5rem 3.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <img
          src="/gclogo.png"
          alt="Logo"
          style={{
            height: 110,
            marginBottom: 20,
            filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.3))',
            position: 'relative',
          }}
        />
        <h1 style={{ fontWeight: 800, fontSize: '2.4rem', color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'relative' }}>
          Sobre nosotros
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginTop: 10, maxWidth: 500, margin: '10px auto 0', position: 'relative' }}>
          Conocé un poco más de GCinsumos
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          maxWidth: 750,
          margin: '-28px auto 0',
          padding: '0 1.5rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
            background: '#fff',
            borderRadius: 16,
            padding: '1.8rem 1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid var(--border)',
          }}
        >
          {STATS.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
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
          <div style={{ padding: '3rem 0 2rem' }}>
            {config.nosotros.split('\n').map((paragraph, i) => (
              <p key={i} style={{ fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Valores */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontWeight: 700, textAlign: 'center', marginBottom: 20, color: 'var(--text)' }}>¿Por qué elegirnos?</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {VALUES.map((v, i) => <ValueCard key={i} {...v} />)}
          </div>
        </div>

        {/* Contacto */}
        {(config.telefono || config.horarios) && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontWeight: 700, textAlign: 'center', marginBottom: 20, color: 'var(--text)' }}>Contacto</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              {config.horarios && <ContactCard icon="bi-clock" label="Horarios" value={config.horarios} />}
              {config.telefono && <ContactCard icon="bi-telephone" label="Teléfono" value={config.telefono} />}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="d-flex flex-column align-items-center gap-3 pb-5 pt-2">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent"
            style={{ gap: 8, padding: '14px 32px', fontWeight: 600, fontSize: '1rem' }}
          >
            <i className="bi bi-whatsapp" style={{ fontSize: 20 }}></i>
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
